import type { LivingPreferences } from '~~/app/core/contracts'
import { toLivingPreferencesWithPrefill } from '~~/app/core/adapters'

/**
 * Préférences logement déjà soumises pour une commande, ou `null`.
 *
 * `GET /client-data/show` répond `{status, data, prefill, requires_data}`. Lu
 * sans déballage (`unwrap: false`) : `prefill` porte le type de logement choisi
 * à l'achat (2026-10-03), qui préremplit le formulaire tant que le client n'a
 * rien enregistré (`toLivingPreferencesWithPrefill`). Avant, `unwrapEnvelope`
 * ne gardait que `data` et `prefill` était perdu.
 */
export default defineEventHandler(async (event): Promise<LivingPreferences | null> => {
  const client = authClient(event)
  const orderId = getQuery(event).orderId

  if (typeof orderId !== 'string' || orderId === '') {
    throw createError({ statusCode: 422, statusMessage: 'orderId requis' })
  }

  try {
    const raw = await client.request('/client-data/show', { query: { order_id: orderId }, unwrap: false })
    return toLivingPreferencesWithPrefill(raw)
  }
  catch (error) {
    rethrowApiError(error)
  }
})
