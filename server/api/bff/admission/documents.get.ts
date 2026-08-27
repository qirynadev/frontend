import type { AdmissionDocumentsState } from '~~/app/core/contracts/admission'
import { toAdmissionDocumentsState } from '~~/app/core/adapters'

/**
 * État des pièces déjà envoyées pour une commande admission, ou l'état vide
 * si le client n'a encore rien envoyé — voir `admissionDocumentsRepo`.
 */
export default defineEventHandler(async (event): Promise<AdmissionDocumentsState> => {
  const client = authClient(event)
  const orderId = getQuery(event).orderId

  if (typeof orderId !== 'string' || orderId === '') {
    throw createError({ statusCode: 422, statusMessage: 'orderId requis' })
  }

  try {
    const raw = await client.request('/client-data/show', { query: { order_id: orderId } })
    return toAdmissionDocumentsState(raw, storageBaseUrl(event))
  }
  catch (error) {
    rethrowApiError(error)
  }
})
