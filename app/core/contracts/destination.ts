import type { Country, SeoMeta } from './common'
import type { SchoolSummary } from './school'

/** Destination sans ses écoles — ce qu'affiche la grille de choix de pays. */
export interface DestinationSummary {
  id: string
  slug: string
  /**
   * Nom affichable de la destination : « France », « Chine »…
   *
   * ⚠️ Ce n'est **pas** `title` côté API : celui-ci contient une accroche
   * marketing (« L'excellence universitaire reconnue, accessible et durable »).
   * Le vrai nom vient de `country.name`. L'adapter fait la correction.
   */
  title: string
  /** L'accroche marketing, c'est-à-dire le `title` de l'API. */
  tagline: string
  image: string | null
  country: Country
  schoolCount: number
  /** Slugs traduits par locale quand fournis par l'API. Ex: { fr: "france", en: "france" } */
  slugs?: Record<string, string>
}

/**
 * Statistique éditoriale du bandeau d'excellence (« 295 » / « Universités et
 * grandes écoles »…) — saisie librement par pays dans le back-office
 * (`SchoolFile.stats`, jusqu'à 4 entrées), pas une catégorie fixe : deux pays
 * n'alignent pas forcément les mêmes libellés sur la même position.
 */
export interface DestinationStat {
  value: string
  label: string
}

export interface Destination extends DestinationSummary {
  /** HTML. */
  description: string
  /** Version légère : jamais la présentation HTML complète des écoles. */
  schools: SchoolSummary[]
  /** Jusqu'à 4 entrées, parfois moins (voire aucune) — jamais complété artificiellement. */
  stats: DestinationStat[]
  seo: SeoMeta
}
