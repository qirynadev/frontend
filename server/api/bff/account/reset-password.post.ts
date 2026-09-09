import type { AuthOutcome } from '~~/app/core/contracts'
import { asRecord, str, toSession } from '~~/app/core/adapters'

/**
 * Nouveau mot de passe.
 *
 * `POST /auth/new-password` peut renvoyer un `access_token` : le back-office
 * connecte l'utilisateur dans la foulée. On pose alors le cookie — sinon on
 * renvoie `null` et l'écran redirige vers la connexion. Les deux cas existent
 * selon la version du back-office ; les deux sont traités.
 */
export default defineEventHandler(async (event): Promise<AuthOutcome | null> => {
  const body = asRecord(await readBody(event))
  const email = str(body, 'email').toLowerCase()
  const code = str(body, 'code')
  const password = str(body, 'password')

  const errors: Record<string, string[]> = {}
  if (email === '') errors.email = ['required']
  if (code === '') errors.code = ['required']
  if (password === '') errors.password = ['required']

  if (Object.keys(errors).length > 0) {
    throw createError({ statusCode: 422, statusMessage: 'Formulaire incomplet', data: { message: 'Formulaire incomplet', errors } })
  }

  let raw: unknown
  try {
    // Le back-office (`AuthController::newPassword`) attend `token` /
    // `newPassword` / `confPassword` — pas `code` / `password` /
    // `password_confirmation`. Le décalage rejetait toute réinitialisation en
    // 400 « The new password field is required » (corrigé 2026-09-09, confirmé
    // par appel direct du contrôleur). Le `token` est le code à 16 caractères
    // reçu par e-mail.
    raw = await publicClient(event).request('/auth/new-password', {
      method: 'POST',
      body: {
        email,
        token: code,
        newPassword: password,
        confPassword: str(body, 'passwordConfirmation') || password,
      },
    })
  }
  catch (error) {
    rethrowAuthError(error)
  }

  const session = toSession(raw)
  if (session === null) return null

  setSessionCookie(event, session.token)

  return { user: session.user, pendingPayment: readPaymentIntent(event) !== null }
})
