import { asRecord, str } from '~~/app/core/adapters'

/**
 * Demande de réinitialisation du mot de passe.
 *
 * La réponse est volontairement **la même que l'adresse existe ou non** : le
 * back-office répond 200 dans les deux cas, et on se garde de le contredire.
 * Distinguer les deux transformerait ce formulaire en outil d'énumération de
 * comptes.
 */
export default defineEventHandler(async (event) => {
  const body = asRecord(await readBody(event))
  const email = str(body, 'email').toLowerCase()

  if (email === '') {
    throw createError({ statusCode: 422, statusMessage: 'Adresse absente', data: { message: 'Adresse absente', errors: { email: ['required'] } } })
  }

  try {
    await publicClient(event).request('/auth/forgot-password', { method: 'POST', body: { email } })
  }
  catch (error) {
    rethrowAuthError(error)
  }

  return { ok: true }
})
