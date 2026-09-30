import { asRecord, str } from '~~/app/core/adapters'
import { enforceRateLimit, RATE_LIMITS } from '~~/server/utils/rate-limit'
import { passBotGuard } from '~~/server/utils/bot-guard'

/**
 * Envoie un message de support (`/reglages/contact`) — visiteur **non
 * connecté**. `POST /send-email` (API, public) : contrairement à `POST
 * /user/messages` (voir `index.post.ts`), il n'enregistre rien en base
 * (`docs/directives-backend.md`) — e-mail de notification seulement. Accepté
 * ici parce qu'aucun compte connecté ne peut fournir nom/e-mail à sa place.
 *
 * Pas de téléphone dans ce formulaire : l'API l'accepte absent depuis la
 * correction de `MessageAction::sendEmail()` (repli `?? null`,
 * directives-backend §18) — le contournement qui envoyait `phone: ''` a été
 * retiré le 2026-09-14.
 */
export default defineEventHandler(async (event): Promise<{ ok: boolean }> => {
  enforceRateLimit(event, RATE_LIMITS.contact)
  const body = asRecord(await readBody(event).catch(() => ({})))
  // Robot pris au piège : faux succès, rien n'est envoyé (`server/utils/bot-guard.ts`).
  if (!passBotGuard(body)) return { ok: true }

  const firstName = str(body, 'firstName')
  const lastName = str(body, 'lastName')
  const email = str(body, 'email')
  const subject = str(body, 'subject')
  const message = str(body, 'message')

  if ([firstName, lastName, email, subject, message].some((value) => value === '')) {
    throw createError({ statusCode: 422, statusMessage: 'Formulaire incomplet' })
  }

  try {
    await publicClient(event).request('/send-email', {
      method: 'POST',
      body: { first_name: firstName, last_name: lastName, email, subject, message },
    })
    return { ok: true }
  }
  catch (error) {
    rethrowApiError(error)
  }
})
