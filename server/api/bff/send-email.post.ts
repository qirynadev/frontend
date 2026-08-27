import { asRecord, optionalStr, str } from '~~/app/core/adapters'

/**
 * Formulaire de contact (`/reglages/contact`) → `POST /send-email`.
 *
 * Public côté API (pas de session requise) — envoie un e-mail au support,
 * **n'enregistre rien en base** côté back-office (`MessageAction::sendEmail`,
 * `TODO #56` dans le code source). Voir `docs/directives-backend.md`.
 */
export default defineEventHandler(async (event): Promise<{ ok: boolean }> => {
  const body = asRecord(await readBody(event).catch(() => ({})))

  const firstName = str(body, 'firstName')
  const lastName = str(body, 'lastName')
  const email = str(body, 'email')
  const subject = str(body, 'subject')
  const message = str(body, 'message')

  if (firstName === '' || lastName === '' || email === '' || subject === '' || message === '') {
    throw createError({ statusCode: 422, statusMessage: 'Champs requis manquants' })
  }

  try {
    await publicClient(event).request('/send-email', {
      method: 'POST',
      body: {
        first_name: firstName,
        last_name: lastName,
        phone: optionalStr(body, 'phone'),
        email,
        subject,
        message,
      },
    })
    return { ok: true }
  }
  catch (error) {
    rethrowApiError(error)
  }
})
