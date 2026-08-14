import type { Offer, OfferSummary } from '../contracts'
import { ApiError } from '../http/errors'
import { bffFetch } from '../http/client'

/**
 * AUJOURD'HUI — extrait de `/all-data` (474 Ko de formules).
 * DEMAIN — `/offers` et `/offers/{slug}`.
 */
export const offerRepo = {
  list(locale?: string): Promise<OfferSummary[]> {
    return bffFetch<OfferSummary[]>('/offers', { locale })
  },

  async bySlug(slug: string, locale?: string): Promise<Offer | null> {
    try {
      return await bffFetch<Offer>(`/offers/${encodeURIComponent(slug)}`, { locale })
    }
    catch (error) {
      if (error instanceof ApiError && error.kind === 'notFound') return null
      throw error
    }
  },
}
