import type { Course, CourseLevel, CourseSummary } from '../contracts'
import { toSeo } from './common.adapter'
import { asRecord, dedupeBySlug, html, list, optionalStr, str, toUrl } from './primitives'

/**
 * Langues étrangères — source `GET /courses`, pas `/all-data`.
 *
 * L'API distingue mal deux champs : `language` porte le nom de la langue
 * (« Anglais ») et `title` une accroche éditoriale (« Apprendre l'anglais »).
 * La grille de sélection veut le premier, la fiche le second : le domaine
 * expose donc les deux, nommés pour ce qu'ils sont.
 */

function toLevels(raw: unknown): CourseLevel[] {
  return list({ levels: raw }, 'levels')
    .map((entry) => {
      const source = asRecord(entry)
      return { name: str(source, 'name'), description: str(source, 'description') }
    })
    .filter((level) => level.name !== '')
}

export function toCourseSummary(raw: unknown): CourseSummary {
  const source = asRecord(raw)
  const name = str(source, 'language')
  const title = str(source, 'title')

  return {
    id: str(source, 'id'),
    slug: str(source, 'slug'),
    // Sans `language`, on retombe sur le titre éditorial plutôt que sur du vide.
    name: name || title,
    title: title || name,
    image: toUrl(source.picture) ?? toUrl(source.image),
    flag: toUrl(source.country_flag),
    // `badge` est `null` pour les quatre langues du catalogue : la maquette
    // montre des étiquettes (« La plus demandée ») qui ne sont pas administrées.
    badge: optionalStr(source, 'badge'),
    levelCount: toLevels(source.levels).length,
  }
}

export function toCourse(raw: unknown): Course {
  const source = asRecord(raw)
  const summary = toCourseSummary(source)
  const description = html(source, 'description')

  return {
    ...summary,
    description,
    levels: toLevels(source.levels),
    seo: toSeo(source, summary.title, description),
  }
}

export function toCourseList(raw: unknown): Course[] {
  const courses = (Array.isArray(raw) ? raw : [])
    .map(toCourse)
    .filter((course) => course.id !== '' && course.slug !== '')

  return dedupeBySlug(courses, 'langues')
}
