import { asRecord, num } from '~~/app/core/adapters'

/** Marque une notification comme lue → `POST /user/notifications/{id}/read`. */
export default defineEventHandler(async (event): Promise<{ count: number }> => {
  const client = authClient(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 422, statusMessage: 'id requis' })
  }

  try {
    const raw = await client.request(`/user/notifications/${id}/read`, { method: 'POST' })
    return { count: num(asRecord(raw), 'count', 0) }
  }
  catch (error) {
    rethrowApiError(error)
  }
})
