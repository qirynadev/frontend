import type { AuthOutcome } from '~~/app/core/contracts'
import { asRecord, str, toSession } from '~~/app/core/adapters'

/**
 * Connexion par e-mail et mot de passe.
 *
 * C'est ici que le jeton entre dans le système — et ici seulement. Le back-office
 * répond `{ access_token, user }` ; le jeton part dans le cookie `httpOnly`, le
 * navigateur ne reçoit que l'utilisateur.
 *
 * `pendingPayment` est renvoyé dans la foulée : la page de connexion sait ainsi
 * s'il faut reprendre un paiement ou suivre le `redirect`, sans second appel.
 */
export default defineEventHandler(async (event): Promise<AuthOutcome> => {
  const body = asRecord(await readBody(event))
  const email = str(body, 'email').toLowerCase()
  const password = str(body, 'password')

  if (email === '' || password === '') {
    throw createError({
      statusCode: 422,
      statusMessage: 'Identifiants incomplets',
      data: { message: 'Identifiants incomplets', errors: {
        ...(email === '' ? { email: ['required'] } : {}),
        ...(password === '' ? { password: ['required'] } : {}),
      } },
    })
  }

  let raw: unknown
  try {
    raw = await publicClient(event).request('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
  }
  catch (error) {
    rethrowAuthError(error)
  }

  const session = toSession(raw)
  if (session === null) {
    // Réponse 200 sans jeton : le compte existe mais l'API n'ouvre pas de
    // session (compte désactivé, e-mail non confirmé). Laisser passer
    // afficherait un utilisateur « connecté » incapable du moindre appel.
    throw createError({
      statusCode: 422,
      statusMessage: 'Session non ouverte',
      data: { message: 'Session non ouverte', errors: {} },
    })
  }

  setSessionCookie(event, session.token)

  return { user: session.user, pendingPayment: readPaymentIntent(event) !== null }
})
