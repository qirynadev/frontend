import type { Article, Orientation } from '../contracts'
import { ApiError } from '../http/errors'
import { bffFetch } from '../http/client'

/** Offre d'orientation — `/profilage` côté API. */
export const orientationRepo = {
  async load(locale?: string): Promise<Orientation | null> {
    try {
      return await bffFetch<Orientation>('/orientation', { locale })
    }
    catch (error) {
      if (error instanceof ApiError && error.kind === 'notFound') return null
      throw error
    }
  },
}

/** Actualités de l'accueil. Renvoie `[]` en recette : l'endpoint est vide. */
export const articleRepo = {
  list(locale?: string): Promise<Article[]> {
    return bffFetch<Article[]>('/articles', { locale })
  },
}
