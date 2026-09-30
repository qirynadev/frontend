import { asRecord, str } from '~~/app/core/adapters'
import { enforceRateLimit, RATE_LIMITS } from '~~/server/utils/rate-limit'
import { passBotGuard } from '~~/server/utils/bot-guard'

/**
 * Demande de réinitialisation du mot de passe.
 *
 * La réponse est volontairement **la même que l'adresse existe ou non** : le
 * back-office répond 200 dans les deux cas, et on se garde de le contredire.
 * Distinguer les deux transformerait ce formulaire en outil d'énumération de
 * comptes.
 */
export default defineEventHandler(async (event) => {
  enforceRateLimit(event, RATE_LIMITS.forgotPassword)
  const body = asRecord(await readBody(event))
  // Robot pris au piège : même réponse qu'un envoi réel (voir ci-dessus).
  if (!passBotGuard(body)) return { ok: true }
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
