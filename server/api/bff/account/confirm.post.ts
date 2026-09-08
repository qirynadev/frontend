import type { AuthOutcome } from '~~/app/core/contracts'
import { asRecord, str, toSession } from '~~/app/core/adapters'

/**
 * Confirmation du compte par le code reçu par e-mail.
 *
 * Contrairement à `/auth/register`, cette route **ouvre une session** : le
 * back-office renvoie `access_token` avec l'utilisateur. C'est donc ici que le
 * cookie est posé, et ici que la reprise d'un paiement en attente devient
 * possible.
 */
export default defineEventHandler(async (event): Promise<AuthOutcome> => {
  const body = asRecord(await readBody(event))
  const email = str(body, 'email').toLowerCase()
  const code = str(body, 'code')

  if (email === '' || code === '') {
    throw createError({
      statusCode: 422,
      statusMessage: 'Code incomplet',
      data: { message: 'Code incomplet', errors: code === '' ? { code: ['required'] } : { email: ['required'] } },
    })
  }

  let raw: unknown
  try {
    raw = await publicClient(event).request('/auth/confirm', { method: 'POST', body: { email, code } })
  }
  catch (error) {
    rethrowAuthError(error)
  }

  const session = toSession(raw)
  if (session === null) {
    // `AuthController::confirmAccount` répond toujours en 200, même en échec
    // (« Le code a échoué », « Ce compte n'existe pas ») — seule l'absence
    // d'`access_token` distingue l'échec. Son `message` est réel et utile ;
    // le perdre pour un générique masquerait pourquoi le code est refusé.
    const message = str(asRecord(raw), 'message') || 'Code invalide'
    throw createError({ statusCode: 422, statusMessage: message, data: { message, errors: { code: [message] } } })
  }

  setSessionCookie(event, session.token)

  return { user: session.user, pendingPayment: readPaymentIntent(event) !== null }
})
