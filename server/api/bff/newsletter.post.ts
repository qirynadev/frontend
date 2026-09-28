import { asRecord, str } from '~~/app/core/adapters'

/**
 * Inscription à la newsletter (champ du pied de page desktop). `POST
 * /newsletter` (API, public) : enregistre l'adresse **non confirmée** et envoie
 * un e-mail de double opt-in, dont le lien revient sur
 * `/newsletter-confirmation` (`server/routes/newsletter-confirmation.get.ts`).
 *
 * Le back-office refuse par un 422 dont le `message` est déjà traduit
 * (adresse invalide, déjà inscrite) : `rethrowApiError` le conserve, le pied
 * de page l'affiche tel quel.
 */
export default defineEventHandler(async (event): Promise<{ ok: boolean }> => {
  const email = str(asRecord(await readBody(event).catch(() => ({}))), 'email').trim()

  if (email === '') {
    throw createError({ statusCode: 422, statusMessage: 'Adresse e-mail requise' })
  }

  try {
    await publicClient(event).request('/newsletter', { method: 'POST', body: { email } })
    return { ok: true }
  }
  catch (error) {
    rethrowApiError(error)
  }
})
