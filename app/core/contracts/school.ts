import type { Country, SeoMeta } from './common'

/**
 * Version **légère** d'une école : ce dont une liste a besoin, et rien de plus.
 *
 * L'API actuelle ne fait pas cette distinction — `/all-data` renvoie systématiquement
 * la présentation HTML complète de chacune des 570 écoles (3,4 Mo). En séparant
 * `SchoolSummary` de `School`, les pages de liste pourront consommer demain un
 * endpoint allégé sans qu'aucune d'elles ne change.
 */
export interface SchoolSummary {
  id: string
  slug: string
  title: string
  city: string
  logo: string | null
  image: string | null
  country: Country
  /** Slug de la destination à laquelle l'école est rattachée. */
  destinationSlug: string
  /** Nombre de formations réellement renseignées (les entrées vides sont écartées). */
  formationCount: number
  /** Slugs traduits par locale quand fournis par l'API. Ex: { fr: "hec-paris", en: "hec-paris" } */
  slugs?: Record<string, string>
}

export interface FormationSection {
  label: string
  /** HTML du corps de la rubrique (sans le libellé). */
  content: string
}

export interface SchoolFormation {
  title: string
  /** HTML brut renvoyé par l'API. */
  description: string
  /** Accroche carte — description courte, jamais la rubrique « Cible ». */
  summary: string
  /** Rubriques modale (Cible, Programmes, Frais…). */
  sections: FormationSection[]
  /** Paragraphes libres hors rubriques — corps détaillé de la modale. */
  bodyHtml: string
  /**
   * Grade affiché sur la carte (`.ed-form-meta`).
   * Absent de l’API stage → mock via `resolveFormationMeta` (documenté).
   */
  grade: string
  /**
   * Durée / année(s) affichée sur la carte.
   * Absent de l’API stage → mock via `resolveFormationMeta` (documenté).
   */
  duration: string
}

export interface SchoolDetail {
  title: string
  /** HTML. */
  description: string
}

/** Fiche école complète. */
export interface School extends SchoolSummary {
  /** HTML de présentation. Chaîne vide si l'API n'a rien renvoyé. */
  presentation: string
  formations: SchoolFormation[]
  details: SchoolDetail[]
  /** `null` pour l'intégralité du catalogue actuel — le champ existe mais n'est pas alimenté. */
  foundedYear: number | null
  studentCount: number | null
  seo: SeoMeta
}
