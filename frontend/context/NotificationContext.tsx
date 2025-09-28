// src/context/NotificationContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
  useRef,
  useTransition,
} from 'react';
import { Notification } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { io, Socket } from 'socket.io-client';
import { API_BASE } from '../services/http';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markOneAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Fetch notifications (fallback for initial load or if websocket fails)
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await api.notification.getNotifications(user.id);
      startTransition(() => {
        setNotifications(Array.isArray(data) ? data : []);
      });
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, startTransition]);

  // Socket.io connection for live notifications
  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    // Connect to Socket.io server
    const socket = io(`${API_BASE}/notifications`, {
      query: { userId: user.id },
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsLoading(false);
    });

    socket.on('notification', (data: Notification) => {
      // Only update notification state, do not trigger inventory reloads
      setNotifications((prev) => [data, ...prev]);
    });
    socket.on('notifications', (data: Notification[]) => {
      setNotifications(Array.isArray(data) ? data : []);
    });
    socket.on('connect_error', (err) => {
      console.error('Socket.io connect error', err);
      // fallback to polling for notifications only
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(fetchNotifications, 30000);
    });
    socket.on('disconnect', () => {
      // fallback to polling for notifications only
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(fetchNotifications, 30000);
    });

    // Initial fetch for notifications only
    fetchNotifications();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [user, fetchNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );


  const markOneAsRead = async (notificationId: string) => {
    const target = notifications.find((n) => n.id === notificationId);
    if (!target || target.isRead) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
    try {
      await api.notification.markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read', error);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: false } : n))
      );
    }
  };


  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;
    const original = [...notifications];
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await api.notification.markAllNotificationsAsRead(user.id);
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
      setNotifications(original);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading: isLoading || isPending,
        fetchNotifications,
        markOneAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
};