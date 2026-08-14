import type { OfferPage } from '../contracts'
import { ApiError } from '../http/errors'
import { bffFetch } from '../http/client'

/**
 * Page tarifaire unifiée.
 *
 * Le slug peut désigner une langue (`anglais` → trois paliers mensuels) ou un
 * domaine d'étude (`ingenierie` → un paiement unique). La page appelante n'a
 * pas à savoir lequel : le contrat est le même.
 */
export const offerPageRepo = {
  async bySlug(slug: string, locale?: string): Promise<OfferPage | null> {
    try {
      return await bffFetch<OfferPage>(`/offers/${encodeURIComponent(slug)}`, { locale })
    }
    catch (error) {
      if (error instanceof ApiError && error.kind === 'notFound') return null
      throw error
    }
  },
}
