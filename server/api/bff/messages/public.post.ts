import { asRecord, str } from '~~/app/core/adapters'

/**
 * Envoie un message de support (`/reglages/contact`) — visiteur **non
 * connecté**. `POST /send-email` (API, public) : contrairement à `POST
 * /user/messages` (voir `index.post.ts`), il n'enregistre rien en base
 * (`docs/directives-backend.md`) — e-mail de notification seulement. Accepté
 * ici parce qu'aucun compte connecté ne peut fournir nom/e-mail à sa place.
 *
 * `phone: ''` envoyé explicitement — bug confirmé en direct (2026-08-30,
 * même motif que `lc_country_id` au point 10 de `docs/directives-backend.md`) :
 * `MessageAction::sendEmail()` accède `$inputs['phone']` sans repli `?? null`
 * alors que la validation le déclare `nullable` ; une requête qui ne
 * l'envoie pas du tout plante en 500 (« Undefined array key "phone" »).
 */
export default defineEventHandler(async (event): Promise<{ ok: boolean }> => {
  const body = asRecord(await readBody(event).catch(() => ({})))

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
      body: { first_name: firstName, last_name: lastName, phone: '', email, subject, message },
    })
    return { ok: true }
  }
  catch (error) {
    rethrowApiError(error)
  }
})
