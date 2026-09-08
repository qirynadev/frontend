import type { LivingPreferences } from '~~/app/core/contracts'
import { toLivingPreferences } from '~~/app/core/adapters'

/**
 * Préférences logement déjà soumises pour une commande, ou `null`.
 *
 * `GET /client-data/show` répond `{status, data, prefill, requires_data}` —
 * `unwrapEnvelope` (voir `api-client.ts`) déballe déjà `data` ici, `prefill`/
 * `requires_data` ne sont pas exploités pour l'instant.
 */
export default defineEventHandler(async (event): Promise<LivingPreferences | null> => {
  const client = authClient(event)
  const orderId = getQuery(event).orderId

  if (typeof orderId !== 'string' || orderId === '') {
    throw createError({ statusCode: 422, statusMessage: 'orderId requis' })
  }

  try {
    const raw = await client.request('/client-data/show', { query: { order_id: orderId } })
    return toLivingPreferences(raw)
  }
  catch (error) {
    rethrowApiError(error)
  }
})
