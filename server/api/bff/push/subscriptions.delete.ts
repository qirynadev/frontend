import { asRecord, str } from '~~/app/core/adapters'

/** Désabonne ce navigateur (le client coupe les notifications, ou se déconnecte). */
export default defineEventHandler(async (event): Promise<{ ok: boolean }> => {
  const client = authClient(event)
  const endpoint = str(asRecord(await readBody(event).catch(() => ({}))), 'endpoint')

  if (endpoint === '') {
    throw createError({ statusCode: 422, statusMessage: 'endpoint requis' })
  }

  try {
    await client.request('/user/push/subscriptions', { method: 'DELETE', body: { endpoint } })
    return { ok: true }
  }
  catch (error) {
    rethrowApiError(error)
  }
})
