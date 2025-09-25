// src/services/api/notificationApi.ts

import { get, post } from '../http'
import { notifications, simulateDelay } from '../mockDb'
import type { Notification } from '../../types'

const live = import.meta.env.VITE_API_MODE === 'live'

export const notificationApi = {
  /**
   * Fetch notifications for a specific user
   */
  getNotifications: async (userId: string): Promise<Notification[]> => {
    if (!live) {
      const userNotifications = notifications
        .filter(n => n.userId === userId)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      return simulateDelay(userNotifications)
    }
    return get<Notification[]>(`/notifications?userId=${userId}`)
  },

  /**
   * Mark a single notification as read
   */
  markNotificationAsRead: async (
    notificationId: string
  ): Promise<Notification> => {
    if (!live) {
      const notification = notifications.find(n => n.id === notificationId)
      if (!notification) throw new Error('Notification not found')
      notification.isRead = true
      return simulateDelay(notification)
    }
    return post<Notification>(`/notifications/${notificationId}/read`)
  },

  /**
   * Mark all notifications for a user as read
   */
  markAllNotificationsAsRead: async (
    userId: string
  ): Promise<Notification[]> => {
    if (!live) {
      const userNotifications = notifications.filter(n => n.userId === userId)
      userNotifications.forEach(n => (n.isRead = true))
      return simulateDelay(userNotifications)
    }
    return post<Notification[]>(`/notifications/read-all`, { userId })
  },
}