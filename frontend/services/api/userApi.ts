// src/services/api/userApi.ts

import { get, post } from '../http'
import { users, simulateDelay } from '../mockDb'
import { PREAPPROVED_USERS } from '../../constants'
import type { User, Role, PreapprovedUser } from '../../types'

/**
 * Minimal user shape returned by /auth/login
 */
export type MinimalUser = Pick<User, 'id' | 'role' | 'name'> & {
  mustChangePassword?: boolean
}

const live = import.meta.env.VITE_API_MODE === 'live'

export const userApi = {
  /**
   * Log in a user by email/password.
   * Backend sets a secure HttpOnly cookie and returns { message, user }.
   */
  login: (email: string, password: string): Promise<{
    message: string
    user: MinimalUser
  }> => {
    if (!live) {
      throw new Error(
        'Login is only available in live mode. Set VITE_API_MODE=live.'
      )
    }
    return post<{ message: string; user: MinimalUser }>('/auth/login', {
      email,
      password,
    })
  },

  /**
   * Update the authenticated user’s password.
   * Always returns { message, user } and resets the session cookie server-side.
   */
  updatePassword: (
    password: string,
    passwordConfirm: string,
    currentPassword?: string
  ): Promise<{ message: string; user: User }> => {
    if (!live) {
      // Mock version: just update the first (or only) user in your array
      const u = users[0]
      u.password = password
      u.mustChangePassword = false
      return simulateDelay({
        message: 'Password updated (mock)',
        user: u,
      })
    }

    return post<{ message: string; user: User }>(
      '/auth/update-password',
      {
        passwordCurrent: currentPassword,
        password,
        passwordConfirm,
      }
    )
  },

  /**
   * Register a new user (admin-only).
   * In live mode, calls the backend; in mock mode, verifies against a pre-approved list.
   */
  register: (
    details: Omit<User, 'id' | 'role'> & { role?: Role }
  ): Promise<User> => {
    if (!live) {
      const isPreapproved = PREAPPROVED_USERS.find(
        (p) =>
          p.email.toLowerCase() === details.email.toLowerCase() &&
          p.name.toLowerCase() === details.name.toLowerCase() &&
          p.surname.toLowerCase() === details.surname.toLowerCase() &&
          p.rzaNumber.toLowerCase() === details.rzaNumber.toLowerCase()
      )
      if (!isPreapproved) {
        throw new Error('Details do not match any pre-approved user.')
      }
      const existing = users.find(
        (u) => u.email.toLowerCase() === details.email.toLowerCase()
      )
      if (existing) {
        throw new Error('User with this email already exists.')
      }
      const newUser: User = {
        ...details,
        id: `user-${Date.now()}`,
        role: isPreapproved.role,
      }
      users.push(newUser)
      return simulateDelay(newUser)
    }

    return post<User>('/auth/register', details)
  },

  /**
   * Fetch the list of preapproved users (for registration).
   */
  getPreapprovedUsers: (): Promise<PreapprovedUser[]> => {
    if (!live) {
      return simulateDelay(PREAPPROVED_USERS)
    }
    return get<PreapprovedUser[]>('/users/preapproved')
  },

  /**
   * Fetch all registered users (admin-only).
   */
  getUsers: (): Promise<User[]> => {
    if (!live) {
      return simulateDelay(users)
    }
    return get<User[]>('/users')
  },
}