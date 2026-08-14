import type { PaymentIntent } from '~~/app/core/contracts'
import { asRecord } from '~~/app/core/adapters'

/**
 * Mémorise ce qu'un visiteur voulait acheter.
 *
 * Appelée quand « Choisir cette formule » est cliqué sans session ouverte. Elle
 * n'engage rien : aucune commande n'est créée, aucun appel n'est fait au
 * back-office. Elle dépose un cookie `httpOnly` de 30 minutes, que
 * `payment/init` consommera après authentification.
 *
 * `PUT` et non `POST` : l'opération est idempotente — reposer la même intention
 * ne produit pas deux intentions.
 */
export default defineEventHandler(async (event): Promise<PaymentIntent> => {
  const parsed = parsePaymentIntent(asRecord(await readBody(event)))

  if (parsed === null) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Intention incomplète',
      data: { message: 'Intention incomplète', errors: {} },
    })
  }

  return writePaymentIntent(event, parsed)
})
