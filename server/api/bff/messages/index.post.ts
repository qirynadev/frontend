import { asRecord, str } from '~~/app/core/adapters'

/**
 * Envoie un message de support (`/reglages/contact`) → `POST /user/messages`.
 *
 * Authentifié — persiste dans `Messaging` (visible dans la rubrique
 * « Messagerie » du back-office) et envoie l'e-mail de notification associé
 * (`MessageController::sendMessage` côté back-office, qui appelle lui-même
 * `MessageAction::sendEmail`). Préféré à `POST /send-email` seul, qui
 * n'enregistre rien en base — voir `docs/directives-backend.md`.
 */
export default defineEventHandler(async (event): Promise<{ ok: boolean }> => {
  const client = authClient(event)
  const body = asRecord(await readBody(event).catch(() => ({})))
  const text = str(body, 'text')

  if (text === '') {
    throw createError({ statusCode: 422, statusMessage: 'Message requis' })
  }

  try {
    await client.request('/user/messages', { method: 'POST', body: { text } })
    return { ok: true }
  }
  catch (error) {
    rethrowApiError(error)
  }
})
