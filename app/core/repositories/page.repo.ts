import type { Page } from '../contracts'
import { ApiError } from '../http/errors'
import { bffFetch } from '../http/client'

/**
 * Pages éditoriales (CGU, cookies, FAQ, confidentialité).
 *
 * AUJOURD'HUI — le texte intégral des quatre pages voyage dans `/all-data` ;
 * le BFF n'en ressort qu'une.
 * DEMAIN — `/pages/{slug}`.
 */
export const pageRepo = {
  async bySlug(slug: string, locale?: string): Promise<Page | null> {
    try {
      return await bffFetch<Page>(`/pages/${encodeURIComponent(slug)}`, { locale })
    }
    catch (error) {
      if (error instanceof ApiError && error.kind === 'notFound') return null
      throw error
    }
  },
}
