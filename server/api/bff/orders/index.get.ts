import type { Order } from '~~/app/core/contracts'
import { toOrderList } from '~~/app/core/adapters'

/**
 * Commandes de l'utilisateur connecté.
 *
 * Alimente « Mon projet » : services souscrits, avancement, montants. Aucune
 * pagination côté API (`/payment/list` renvoie `{ orders: [] }` d'un bloc) —
 * l'écran s'en accommode, le volume par compte étant faible.
 */
export default defineEventHandler(async (event): Promise<Order[]> => {
  const client = authClient(event)

  try {
    return toOrderList(await client.request('/payment/list'))
  }
  catch (error) {
    rethrowApiError(error)
  }
})
