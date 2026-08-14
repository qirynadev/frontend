import type { PaymentValidation } from '~~/app/core/contracts'
import { asRecord, str, toPaymentValidation } from '~~/app/core/adapters'

/**
 * Vérifie l'issue d'un paiement, au retour de Stripe.
 *
 * Appelée par l'écran de confirmation avec l'identifiant de commande présent
 * dans l'URL. Authentifiée : c'est le back-office qui vérifie que la commande
 * appartient bien au porteur du jeton — sans quoi n'importe quel identifiant
 * de commande deviendrait consultable.
 */
export default defineEventHandler(async (event): Promise<PaymentValidation> => {
  const client = authClient(event)
  const orderId = str(asRecord(await readBody(event)), 'orderId')

  if (orderId === '') {
    throw createError({ statusCode: 422, statusMessage: 'Commande absente', data: { message: 'Commande absente', errors: {} } })
  }

  let raw: unknown
  try {
    raw = await client.request('/payment/validate', { method: 'POST', body: { order_id: orderId } })
  }
  catch (error) {
    rethrowApiError(error)
  }

  return toPaymentValidation(raw)
})
