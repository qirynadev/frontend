import type { PaymentInit } from '~~/app/core/contracts'
import { asRecord, str, toPaymentInit } from '~~/app/core/adapters'

/**
 * Démarre un paiement.
 *
 * ### La garde
 *
 * `authClient(event)` lève un **401 avant tout appel réseau** si le cookie de
 * session est absent. C'est la seule garde qui compte : un contrôle dans le
 * composant (« si non connecté, rediriger ») se contourne en appelant cette
 * route directement. Celui-ci non — le navigateur ne peut pas fabriquer le
 * cookie, qui est `httpOnly` et posé par le serveur.
 *
 * ### L'usage unique
 *
 * L'intention est effacée **avant** l'appel au back-office, pas après. Si
 * l'appel échoue, l'utilisateur revient sur la page de l'offre et clique à
 * nouveau — un parcours explicite. L'effacer après aurait laissé une fenêtre où
 * un rechargement relance un second paiement.
 *
 * ### La charge utile
 *
 * Le corps de la requête sert quand l'utilisateur est **déjà connecté** (achat
 * direct) ; l'intention sert à la **reprise après authentification**. Dans les
 * deux cas, seuls des identifiants sont transmis : le montant est calculé par
 * le back-office, jamais envoyé d'ici.
 */
export default defineEventHandler(async (event): Promise<PaymentInit> => {
  const client = authClient(event)

  const body = asRecord(await readBody(event).catch(() => ({})))
  const direct = parsePaymentIntent(body)
  const stored = readPaymentIntent(event)
  const intent = direct ?? stored

  if (intent === null) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Aucune commande à payer',
      data: { message: 'Aucune commande à payer', errors: {} },
    })
  }

  // Usage unique — consommée dès que le paiement démarre.
  clearPaymentIntent(event)

  let raw: unknown
  try {
    raw = await client.request('/payment/init', {
      method: 'POST',
      body: {
        offer_id: intent.offerId,
        service_id: intent.serviceId,
        service_type: intent.serviceType,
        ...(intent.stripeProductId ? { stripe_product_id: intent.stripeProductId } : {}),
        ...(Object.keys(intent.options).length > 0 ? { options: intent.options } : {}),
        ...(str(body, 'profileId') !== '' ? { profile_id: str(body, 'profileId') } : {}),
      },
    })
  }
  catch (error) {
    rethrowApiError(error)
  }

  return toPaymentInit(raw)
})
