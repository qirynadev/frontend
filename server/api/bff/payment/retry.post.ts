import type { PaymentInit } from '~~/app/core/contracts'
import { asRecord, str, toPaymentInit } from '~~/app/core/adapters'

/** Relance le paiement d'une commande restée en attente. */
export default defineEventHandler(async (event): Promise<PaymentInit> => {
  const client = authClient(event)
  const orderId = str(asRecord(await readBody(event)), 'orderId')

  if (orderId === '') {
    throw createError({ statusCode: 422, statusMessage: 'Commande absente', data: { message: 'Commande absente', errors: {} } })
  }

  let raw: unknown
  try {
    raw = await client.request('/payment/retry', { method: 'POST', body: { order_id: orderId } })
  }
  catch (error) {
    rethrowApiError(error)
  }

  return toPaymentInit(raw)
})
