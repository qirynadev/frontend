import type { NotificationList } from '../contracts/notification'
import { bffFetch } from '../http/client'

/** Notifications (`/messages`, onglet « Notification ») et pastille de la cloche. */
export const notificationRepo = {
  list(page: number, locale?: string): Promise<NotificationList> {
    return bffFetch<NotificationList>('/notifications', { query: { page }, locale })
  },

  unreadCount(locale?: string): Promise<{ count: number }> {
    return bffFetch<{ count: number }>('/notifications/unread-count', { locale })
  },

  markRead(id: string, locale?: string): Promise<{ count: number }> {
    return bffFetch<{ count: number }>(`/notifications/${id}/read`, { method: 'POST', locale })
  },
}
