import type { SeoMeta } from './common'

/** Niveau proposé pour une langue (Beginner / Intermediate / Advanced). */
export interface CourseLevel {
  name: string
  /** HTML. */
  description: string
}

/**
 * Objectif d'apprentissage proposé pour une langue — administré depuis le
 * back-office (`course_translations.objectives`, exposé par `CourseResource`).
 *
 * **Propre à chaque langue, pas global** : le catalogue de recette en compte 6
 * pour l'anglais, 3 pour le français, 2 pour l'allemand et l'espagnol, avec des
 * descriptions citant les certifications réelles de la langue (DELF/DALF,
 * Goethe-Zertifikat, DELE…). C'est la réponse à la question produit laissée
 * ouverte par `docs/directives-backend.md` §15.
 *
 * L'icône et la teinte de pastille restent des assets front, résolus depuis
 * `key` (voir `config/language-goals.ts`) — volontairement hors périmètre de
 * l'API, comme convenu dans cette même directive.
 */
export interface CourseObjective {
  /**
   * Identifiant stable, transmis dans l'URL du tunnel (`/offres/{slug}?objectif={key}`)
   * puis dans la commande. Le même dans toutes les langues d'un objectif relié
   * à sa version française (back-office `8cd05a0`, 2026-09-11) ; un objectif
   * pas encore relié garde le slug de son propre titre.
   */
  key: string
  title: string
  /** Texte brut : l'API renvoie du HTML (`<p>`), la maquette n'a qu'une ligne. */
  description: string
  /** Étiquette « Populaire ». Aucun, un seul ou plusieurs selon la langue. */
  popular: boolean
}

/**
 * Niveaux de langue du parcours d'achat — vocabulaire fixe du back-office
 * (`LanguageLevelEnum`), commun à toutes les langues. Libellés côté front
 * (`config/language-levels.ts`).
 */
export const LANGUAGE_LEVEL_KEYS = ['beginner', 'intermediate', 'advanced'] as const

export type LanguageLevelKey = typeof LANGUAGE_LEVEL_KEYS[number]

/** Langue étrangère enseignée, en version liste. */
export interface CourseSummary {
  id: string
  slug: string
  /** Nom de la langue : « Anglais ». À ne pas confondre avec `title`, éditorial. */
  name: string
  /** Titre éditorial : « Apprendre l'anglais ». */
  title: string
  image: string | null
  flag: string | null
  /** Étiquette administrée (« La plus demandée »). `null` dans le catalogue actuel. */
  badge: string | null
  levelCount: number
  /**
   * Niveaux réellement proposés pour cette langue — ceux qu'au moins une
   * formule active couvre (`available_levels`). Vide : la langue n'est pas
   * encore déclinée par niveau, le parcours saute ce choix.
   */
  availableLevels: LanguageLevelKey[]
}

export interface Course extends CourseSummary {
  /** HTML. */
  description: string
  levels: CourseLevel[]
  /** Vide tant que l'admin n'a rien saisi pour cette langue **dans cette locale**. */
  objectives: CourseObjective[]
  seo: SeoMeta
}
