import type { School, SchoolSummary } from '../contracts'
import { ApiError } from '../http/errors'
import { bffFetch } from '../http/client'

export interface SchoolQuery {
  /** Slug de destination. */
  destination?: string
  /** Recherche sur le nom ou la ville. */
  search?: string
  page?: number
  perPage?: number
}

export interface SchoolPage {
  items: SchoolSummary[]
  page: number
  perPage: number
  total: number
  totalPages: number
}

/**
 * AUJOURD'HUI — filtrage et pagination en mémoire côté serveur, à partir du
 * dump. Le navigateur ne reçoit qu'une page de résumés.
 *
 * DEMAIN — `/schools?destination=…&page=…` côté API ; cette signature ne change
 * pas.
 */
export const schoolRepo = {
  list(query: SchoolQuery = {}, locale?: string): Promise<SchoolPage> {
    return bffFetch<SchoolPage>('/schools', {
      locale,
      query: {
        destination: query.destination,
        search: query.search,
        page: query.page,
        perPage: query.perPage,
      },
    })
  },

  /**
   * Fiche complète par slug.
   *
   * ⚠️ 21 slugs sont dupliqués en base (`universite-lille`, `hec-paris`,
   * `insead`…). L'arbitrage — première entrée par `id` croissant — est fait par
   * l'adapter et reproduit à l'identique par le BFF : la fiche ouverte depuis la
   * liste est bien celle de la liste.
   */
  async bySlug(slug: string, locale?: string): Promise<School | null> {
    try {
      return await bffFetch<School>(`/schools/${encodeURIComponent(slug)}`, { locale })
    }
    catch (error) {
      if (error instanceof ApiError && error.kind === 'notFound') return null
      throw error
    }
  },
}
