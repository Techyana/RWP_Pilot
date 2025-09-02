// services/api/userApi.ts

import { request } from '../http';
import { users, simulateDelay } from '../mockDb';
import { PREAPPROVED_USERS } from '../../constants';
import type { User, Role, PreapprovedUser } from '../../types';

// Minimal user shape returned by /auth/login
export type MinimalUser =
  Pick<User, 'id' | 'role' | 'name'> & { mustChangePassword?: boolean };

const live = import.meta.env.VITE_API_MODE === 'live';

export const userApi = {
  /**
   * Log in a user by email/password.
   * Backend sets a secure HttpOnly cookie and returns { message, user }.
   */
  login: async (
    email: string,
    password: string
  ): Promise<{ message: string; user: MinimalUser }> => {
    if (!live) {
      throw new Error(
        'Login is only available in live mode. Set VITE_API_MODE=live.'
      );
    }
    return request<{ message: string; user: MinimalUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Update the authenticated user’s password.
   * Always returns { message, user } and resets the session cookie server-side.
   */
  updatePassword: async (
    password: string,
    passwordConfirm: string,
    currentPassword?: string
  ): Promise<{ message: string; user: User }> => {
    if (!live) {
      // Mock version: just update the first (or only) user in your array
      const u = users[0];
      u.password = password;
      u.mustChangePassword = false;
      return simulateDelay({
        message: 'Password updated (mock)',
        user: u,
      });
    }

    return request<{ message: string; user: User }>(
      '/auth/update-password',
      {
        method: 'POST',
        body: JSON.stringify({
          password,
          passwordConfirm,
          ...(currentPassword ? { currentPassword } : {}),
        }),
      }
    );
  },

  register: async (
    details: Omit<User, 'id' | 'role'> & { role?: Role }
  ): Promise<User> => {
    if (!live) {
      const isPreapproved = PREAPPROVED_USERS.find(
        (p) =>
          p.email.toLowerCase() === details.email.toLowerCase() &&
          p.name.toLowerCase() === details.name.toLowerCase() &&
          p.surname.toLowerCase() === details.surname.toLowerCase() &&
          p.rzaNumber.toLowerCase() === details.rzaNumber.toLowerCase()
      );
      if (!isPreapproved) {
        throw new Error('Details do not match any pre-approved user.');
      }
      const existingUser = users.find(
        (u) => u.email.toLowerCase() === details.email.toLowerCase()
      );
      if (existingUser) {
        throw new Error('User with this email already exists.');
      }
      const newUser: User = {
        ...details,
        id: `user-${Date.now()}`,
        role: isPreapproved.role,
      };
      users.push(newUser);
      return simulateDelay(newUser);
    }
    return request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(details),
    });
  },

  getPreapprovedUsers: async (): Promise<PreapprovedUser[]> => {
    if (!live) {
      return simulateDelay(PREAPPROVED_USERS);
    }
    return request<PreapprovedUser[]>('/users/preapproved');
  },

  getUsers: async (): Promise<User[]> => {
    if (!live) {
      return simulateDelay(users);
    }
    return request<User[]>('/users');
  },
};