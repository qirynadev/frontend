import { asRecord, str } from '~~/app/core/adapters'

/**
 * Abonne ce navigateur aux notifications push web du compte connecté.
 *
 * Seule une adresse d'abonnement `https://` est relayée : c'est celle d'un
 * service push de navigateur (Google, Mozilla, Apple). Le back-office refait
 * le même contrôle.
 */
export default defineEventHandler(async (event): Promise<{ ok: boolean }> => {
  const client = authClient(event)
  const body = asRecord(await readBody(event).catch(() => ({})))
  const keys = asRecord(body.keys)

  const endpoint = str(body, 'endpoint')
  const p256dh = str(keys, 'p256dh')
  const auth = str(keys, 'auth')
  const encoding = str(body, 'contentEncoding') === 'aesgcm' ? 'aesgcm' : 'aes128gcm'

  if (!endpoint.startsWith('https://') || p256dh === '' || auth === '') {
    throw createError({ statusCode: 422, statusMessage: 'Abonnement incomplet' })
  }

  try {
    await client.request('/user/push/subscriptions', {
      method: 'POST',
      body: { endpoint, keys: { p256dh, auth }, content_encoding: encoding },
    })
    return { ok: true }
  }
  catch (error) {
    rethrowApiError(error)
  }
})
