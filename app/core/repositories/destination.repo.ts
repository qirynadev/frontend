import type { AreaOfStudySummary, Destination, DestinationSummary } from '../contracts'
import { ApiError } from '../http/errors'
import { bffFetch } from '../http/client'

/**
 * L'API des destinations **telle que l'application la voudrait**.
 *
 * AUJOURD'HUI — le BFF charge `/all-data`, le met en cache et n'expose que la
 * destination demandée, écoles en version résumé.
 *
 * DEMAIN — quand `/destinations/{slug}` existera, la bascule tient dans
 * `server/utils/catalog.ts` ; la signature ci-dessous ne change pas et **aucune
 * page ne bouge**.
 */
export const destinationRepo = {
  /** Toutes les destinations, sans leurs écoles. */
  list(locale?: string): Promise<DestinationSummary[]> {
    return bffFetch<DestinationSummary[]>('/destinations', { locale })
  },

  /**
   * Une destination par slug.
   *
   * Renvoie `null` plutôt que de lever quand la destination n'existe pas : une
   * page peut alors décider d'afficher un 404 métier sans `try/catch`.
   */
  async bySlug(slug: string, locale?: string): Promise<Destination | null> {
    try {
      return await bffFetch<Destination>(`/destinations/${encodeURIComponent(slug)}`, { locale })
    }
    catch (error) {
      if (error instanceof ApiError && error.kind === 'notFound') return null
      throw error
    }
  },

  /** Domaines d'étude propres à cette destination — pas le catalogue générique d'offres. */
  areas(slug: string, locale?: string): Promise<AreaOfStudySummary[]> {
    return bffFetch<AreaOfStudySummary[]>(`/destinations/${encodeURIComponent(slug)}/areas`, { locale })
  },
}
