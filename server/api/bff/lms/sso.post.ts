import { asRecord, str } from '~~/app/core/adapters'

/**
 * Adresse d'entrée dans le LMS (test de niveau, « Mes cours »).
 *
 * Le site ne parle jamais au LMS : il demande au back-office une adresse de
 * connexion unique, fabriquée **au clic**, valable 60 secondes et une seule
 * fois, puis y envoie le navigateur. Elle ne doit donc jamais être demandée au
 * chargement d'une page, ni mise en cache, ni placée dans un `href`.
 *
 * Le back-office décide seul de qui a droit à l'entrée (commande de langue
 * payée, mode pilote) : cette route relaie son refus, message et code compris
 * (`no_language_order`, `order_not_found`, `lms_disabled`...).
 */
export default defineEventHandler(async (event): Promise<{ url: string }> => {
  const client = authClient(event)
  const body = asRecord(await readBody(event).catch(() => ({})))

  const orderId = str(body, 'orderId')
  const target = str(body, 'target')

  try {
    // Sans enveloppe `data` : `{ status, url, expires_in }`. L'appel peut durer
    // quelques secondes de plus qu'un autre quand le back-office doit d'abord
    // envoyer au LMS l'inscription d'un client qui clique juste après son paiement.
    const response = asRecord(await client.request('/user/lms/sso', {
      method: 'POST',
      body: {
        ...(orderId ? { order_id: orderId } : {}),
        ...(target === 'placement' || target === 'courses' ? { target } : {}),
      },
      timeoutMs: 25_000,
      unwrap: false,
    }))

    const url = str(response, 'url')
    if (!/^https?:\/\//i.test(url)) {
      throw createError({ statusCode: 502, statusMessage: 'Adresse du LMS absente de la réponse' })
    }
    return { url }
  }
  catch (error) {
    rethrowApiError(error)
  }
})
