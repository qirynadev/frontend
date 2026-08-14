import type { SeoMeta } from './common'

/**
 * Offre d'orientation (« profilage » côté back-office).
 *
 * ⚠️ L'API n'expose **aucun prix** pour cette offre — la maquette en affiche un
 * (899 €). Le contrat prévoit le champ pour le jour où il sera alimenté ; la
 * page n'affiche le bloc tarifaire que s'il est renseigné, elle n'invente rien.
 */
export interface Orientation {
  id: string
  title: string
  /** HTML. */
  description: string
  image: string | null
  /** Ce qui est inclus : les « catégories » du back-office. */
  features: Array<{
    slug: string
    title: string
    /** HTML. */
    description: string
    icon: string | null
  }>
  price: { amount: number; currency: 'EUR'; mode: 'once' | 'subscription' } | null
  seo: SeoMeta
}

/** Article éditorial de la page d'accueil. */
export interface Article {
  id: string
  slug: string
  title: string
  excerpt: string
  image: string | null
  /** Durée de lecture estimée, en minutes. `null` si non calculable. */
  readingMinutes: number | null
  /** Date ISO `AAAA-MM-JJ`, ou `null`. */
  publishedAt: string | null
}
