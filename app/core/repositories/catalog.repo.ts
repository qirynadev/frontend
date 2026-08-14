import type { Catalog } from '../contracts'
import { bffFetch } from '../http/client'

/**
 * Amorçage : menu, réglages du site, contenu d'accueil, bandeaux, partenaires,
 * et les résumés de destinations / formules / pages.
 *
 * AUJOURD'HUI — reconstitué côté serveur à partir de `/all-data`.
 * DEMAIN — relais direct de `/bootstrap`.
 */
export const catalogRepo = {
  load(locale?: string): Promise<Catalog> {
    return bffFetch<Catalog>('/catalog', { locale })
  },
}
