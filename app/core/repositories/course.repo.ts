import type { Course, CourseSummary } from '../contracts'
import { ApiError } from '../http/errors'
import { bffFetch } from '../http/client'

/**
 * Langues étrangères.
 *
 * AUJOURD'HUI — `GET /courses` côté API, adapté et mis en cache par le BFF.
 * DEMAIN — `/courses/{slug}` ; cette signature ne change pas.
 */
export const courseRepo = {
  list(locale?: string): Promise<CourseSummary[]> {
    return bffFetch<CourseSummary[]>('/courses', { locale })
  },

  async bySlug(slug: string, locale?: string): Promise<Course | null> {
    try {
      return await bffFetch<Course>(`/courses/${encodeURIComponent(slug)}`, { locale })
    }
    catch (error) {
      if (error instanceof ApiError && error.kind === 'notFound') return null
      throw error
    }
  },
}
