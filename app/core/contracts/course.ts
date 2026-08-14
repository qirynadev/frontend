import type { SeoMeta } from './common'

/** Niveau proposé pour une langue (Beginner / Intermediate / Advanced). */
export interface CourseLevel {
  name: string
  /** HTML. */
  description: string
}

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
}

export interface Course extends CourseSummary {
  /** HTML. */
  description: string
  levels: CourseLevel[]
  seo: SeoMeta
}
