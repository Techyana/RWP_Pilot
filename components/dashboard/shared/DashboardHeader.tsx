import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import { Button } from '../../shared/Button';
import { Logo } from '../../shared/Logo';
import { ThemeToggle } from '../../shared/ThemeToggle';
import { Icon } from '../../shared/Icon';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);


interface DashboardHeaderProps {
    theme: string;
    toggleTheme: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ theme, toggleTheme }) => {
    const { user, logout } = useAuth();
    const { notifications, unreadCount, markAllAsRead, markOneAsRead } = useNotifications();
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsPanelOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkOne = (id: string) => {
        markOneAsRead(id);
        // Do not close panel on single click, user might want to read others.
    }

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center sticky top-0 z-20">
            <div className="flex items-center space-x-3">
                <Logo className="h-8 w-auto text-brand-primary dark:text-brand-tertiary" />
                <h1 className="hidden sm:block text-xl font-bold text-gray-800 dark:text-white">Ricoh Workshop Portal</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="relative" ref={panelRef}>
                    <button onClick={() => setIsPanelOpen(!isPanelOpen)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 relative" aria-label="Toggle notifications">
                        <Icon name="bell" className="h-6 w-6" />
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-brand-primary ring-2 ring-white dark:ring-gray-800"></span>
                        )}
                    </button>
                    {isPanelOpen && (
                        <div className="absolute right-0 mt-2 w-80 max-w-[95vw] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-3 flex justify-between items-center border-b dark:border-gray-700">
                                <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                                <button onClick={() => markAllAsRead()} className="text-xs text-brand-primary hover:underline disabled:text-gray-400" disabled={unreadCount === 0}>Mark all as read</button>
                            </div>
                            <ul className="max-h-96 overflow-y-auto divide-y dark:divide-gray-700">
                                {notifications.length > 0 ? notifications.map(n => (
                                    <li key={n.id} onClick={() => handleMarkOne(n.id)} className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${!n.isRead ? 'bg-brand-light/50 dark:bg-brand-light/10' : ''}`}>
                                        <div className="flex items-start space-x-3">
                                            {!n.isRead && <div className="h-2 w-2 rounded-full bg-brand-primary mt-1.5 flex-shrink-0"></div>}
                                            <div className={`flex-1 ${n.isRead ? 'pl-5' : ''}`}>
                                                <p className="text-sm text-gray-800 dark:text-gray-200">{n.message}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{dayjs(n.timestamp).fromNow()}</p>
                                            </div>
                                        </div>
                                    </li>
                                )) : (
                                    <li className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">No new notifications.</li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="hidden sm:block border-l border-gray-200 dark:border-gray-700 h-8"></div>
                
                <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white truncate max-w-28 sm:max-w-none">{user?.name} {user?.surname}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize hidden sm:block">{user?.role.toLowerCase()}</p>
                </div>
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                <Button onClick={logout} variant="secondary" icon="logout" className="hidden sm:inline-flex">
                    Logout
                </Button>
                 <Button onClick={logout} variant="secondary" size="base" className="sm:hidden !p-2" aria-label="Logout">
                    <Icon name="logout" className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
};