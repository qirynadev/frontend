import { asRecord, num } from '~~/app/core/adapters'

/** Pastille de la cloche (`AppTopBar`) → `GET /user/notifications/unread-count`. */
export default defineEventHandler(async (event): Promise<{ count: number }> => {
  const client = authClient(event)

  try {
    const raw = await client.request('/user/notifications/unread-count')
    return { count: num(asRecord(raw), 'count', 0) }
  }
  catch (error) {
    rethrowApiError(error)
  }
})
