import { toNotificationList } from '~~/app/core/adapters'
import type { NotificationList } from '~~/app/core/contracts/notification'

/** Notifications (`/messages`, onglet « Notification ») → `GET /user/notifications`, paginé. */
export default defineEventHandler(async (event): Promise<NotificationList> => {
  const client = authClient(event)
  const query = getQuery(event)
  const page = typeof query.page === 'string' && query.page !== '' ? query.page : '1'

  try {
    const raw = await client.request('/user/notifications', { query: { page } })
    return toNotificationList(raw)
  }
  catch (error) {
    rethrowApiError(error)
  }
})
