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
  /** Extrait de présentation, sans HTML — vide si l'API n'en a pas. */
  excerpt: string
  /** Slugs traduits par locale quand fournis par l'API. Ex: { fr: "hec-paris", en: "hec-paris" } */
  slugs?: Record<string, string>
  /** `null` pour la quasi-totalité du catalogue actuel — le champ existe mais n'est pas alimenté. Masqué plutôt qu'un chiffre inventé (voir `ecoles/index.vue`). */
  foundedYear: number | null
  studentCount: number | null
}

export interface SchoolFormation {
  title: string
  /**
   * HTML brut renvoyé par l'API — affiché tel quel dans la modale (`RichText`,
   * voir `[school].vue`) : aucun découpage en rubriques ni restyle, sur
   * demande explicite du 2026-09-08 (la mise en forme reste celle du
   * back-office).
   */
  description: string
  /** Accroche carte — aperçu texte brut de `description`, sans HTML. */
  summary: string
  /** Grade affiché sur la carte (`.ed-form-meta`). `-` si le back-office ne l'a pas renseigné. */
  grade: string
  /** Durée / année(s) affichée sur la carte. `-` si le back-office ne l'a pas renseigné. */
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
  /**
   * Pas ici : `GET /schools/{id}/formations` (directives-backend §12), un
   * appel dédié — plus besoin de faire porter les formations par la fiche
   * complète (`/all-data`) pour n'afficher qu'un onglet. Voir
   * `schoolRepo.formations()`.
   */
  details: SchoolDetail[]
  /**
   * Champ dédié (back-office, directives-backend §19, livré le 2026-09-05) —
   * chaîne vide si l'admin ne l'a pas renseigné pour cette école. À préférer
   * à la convention `details[]`/« Points Forts » : voir `strengthsHtml` dans
   * `[school].vue`, qui bascule sur l'ancienne convention seulement si ce
   * champ est vide (la quasi-totalité du catalogue n'est pas encore migrée).
   */
  pointsForts: string
  seo: SeoMeta
}
