import type { School, SchoolFormation, SchoolSummary } from '../contracts'
import { ApiError } from '../http/errors'
import { bffFetch } from '../http/client'

export interface SchoolQuery {
  /** Slug de destination. */
  destination?: string
  /**
   * Identifiant du domaine d'étude (`AreaOfStudySummary.id`).
   *
   * Exige `destination` : filtrer par domaine seul n'a pas de sens côté API
   * (`GET /schools/{countryId}/{areaId}` prend les deux).
   */
  area?: string
  /** Recherche sur le nom ou la ville. Incompatible avec `area` — l'API ne les combine pas. */
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
        area: query.area,
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

  /**
   * Formations d'une école, à l'unité (`GET /schools/{id}/formations`,
   * directives-backend §12) — pas `/all-data` : `id` est l'UUID de l'école
   * (`School.id`), pas son slug.
   */
  async formations(schoolId: string, locale?: string): Promise<SchoolFormation[]> {
    try {
      return await bffFetch<SchoolFormation[]>(`/schools/${encodeURIComponent(schoolId)}/formations`, { locale })
    }
    catch (error) {
      if (error instanceof ApiError && error.kind === 'notFound') return []
      throw error
    }
  },
}
