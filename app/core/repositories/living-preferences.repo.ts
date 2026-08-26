import type { LivingPreferences, LivingPreferencesInput } from '../contracts'
import { bffFetch } from '../http/client'

/**
 * Préférences de logement post-achat (`logement/paiement-reussi.vue`) —
 * `ClientPostPurchaseData` côté back-office, `service_type: 'living'`.
 */
export const livingPreferencesRepo = {
  /** Déjà soumis pour cette commande, ou `null` — sert à préremplir le formulaire. */
  show(orderId: string, locale?: string): Promise<LivingPreferences | null> {
    return bffFetch<LivingPreferences | null>('/client-data/show', { query: { orderId }, locale })
  },

  store(input: LivingPreferencesInput, locale?: string): Promise<{ ok: boolean }> {
    return bffFetch<{ ok: boolean }>('/client-data/store', { method: 'POST', body: input, locale })
  },
}
