// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { setShowPasswordModal } from '../components/auth/SetPasswordModal';
import { get, post } from '../services/http';
import type { User } from '../types';

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (u: Partial<User>) => void;
  logout: () => Promise<void>;
  updatePassword: (
    newPassword: string,
    newPasswordConfirm: string,
    currentPassword?: string
  ) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const maybeShowMustChangeModal = (u?: Partial<User> | null) => {
    if (u && u.mustChangePassword) {
      setShowPasswordModal(true);
    }
  };

  // Hydrate session on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await get<User>('/auth/me');
        if (!mounted) return;
        setUser(me);
        maybeShowMustChangeModal(me);
      } catch {
        if (!mounted) return;
        setUser(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const login = (u: Partial<User>) => {
    setUser({
      ...((u as User) || null),
      mustChangePassword: u.mustChangePassword ?? false,
    });
    maybeShowMustChangeModal(u);
  };

  const logout = async () => {
    try {
      await post('/auth/logout', {});
    } finally {
      setUser(null);
    }
  };

  /**
   * POSTs to /auth/update-password
   * backend responds { message, user }
   * JWT is reset via cookie, so we don’t need access_token in body
   */
  const updatePassword = async (
    newPassword: string,
    newPasswordConfirm: string,
    currentPassword?: string
  ) => {
    if (!user) throw new Error('No authenticated user');

    try {
      const { user: updatedUser } = await post<{
        message: string;
        user: User;
      }>('/auth/update-password', {
        currentPassword,
        password: newPassword,
        passwordConfirm: newPasswordConfirm,
      });

      setUser({ ...updatedUser, mustChangePassword: false });
    } catch {
      // fallback: refresh from /auth/me
      try {
        const me = await get<User>('/auth/me');
        setUser({ ...me, mustChangePassword: false });
      } catch {
        // best‐effort clear the flag locally
        setUser(prev => (prev ? { ...prev, mustChangePassword: false } : prev));
      }
    } finally {
      setShowPasswordModal(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};