import type { MbaRegionSchools, School, SchoolDetail, SchoolFormation, SchoolSummary } from '../contracts'
import { summaryFromHtml } from '~/utils/formation-content'
import { toAreaOfStudySummary } from './area.adapter'
import { toCountry, toSeo } from './common.adapter'
import { asArray, asRecord, html, list, optionalNum, optionalStr, plainText, str, toUrl } from './primitives'

/**
 * Formations d'une école — consommée par `GET /schools/{id}/formations`
 * (directives-backend §12), un appel dédié, **pas** `toSchool()`/`/all-data`
 * : la fiche complète n'a plus besoin de porter les formations pour que
 * l'onglet « Formations » les affiche (voir `schoolRepo.formations()`).
 *
 * Les tableaux `formations` / `details` de l'API contiennent presque toujours
 * une entrée fantôme `{ title: null, description: null }` — 428 des 570 écoles
 * du catalogue de recette n'ont que ça. On les écarte ici, une fois.
 *
 * **Grade / durée** : réels depuis le 2026-08-31 (`SchoolController::
 * getFormations`, `grade`/`duration` par formation côté back-office) — un
 * mock précédent (`config/formation-meta-mock.ts`) devinait ces valeurs
 * depuis le titre ou repliait sur « Grade Master »/« 3 ans », retiré le même
 * jour. `-` seulement si le back-office ne les a pas renseignés pour cette
 * formation précise.
 */
export function toFormations(raw: unknown): SchoolFormation[] {
  return asArray(raw)
    .map((entry) => {
      const source = asRecord(entry)
      const title = str(source, 'title')
      const description = html(source, 'description')
      return {
        title,
        description,
        summary: summaryFromHtml(description),
        grade: optionalStr(source, 'grade') ?? '-',
        duration: optionalStr(source, 'duration') ?? optionalStr(source, 'duration_label') ?? '-',
      }
    })
    .filter((block) => block.title !== '')
}

function toDetails(raw: unknown): SchoolDetail[] {
  return asArray(raw)
    .map((entry) => {
      const source = asRecord(entry)
      return {
        title: str(source, 'title'),
        description: html(source, 'description'),
      }
    })
    .filter((block) => block.title !== '')
}

/** Version liste : ni présentation HTML, ni formations détaillées. */
export function toSchoolSummary(raw: unknown, destinationSlug = '', flagBase?: string): SchoolSummary {
  const source = asRecord(raw)
  return {
    id: str(source, 'id'),
    slug: str(source, 'slug'),
    title: str(source, 'title'),
    city: str(source, 'city'),
    logo: toUrl(source.logo),
    image: toUrl(source.image),
    country: toCountry(source.country, flagBase),
    destinationSlug,
    formationCount: list(source, 'formations').filter((entry) => str(asRecord(entry), 'title') !== '').length,
    excerpt: plainText(source.presentation, 180),
    foundedYear: optionalNum(source, 'founded_year'),
    studentCount: optionalNum(source, 'student_count'),
  }
}

/** Fiche complète. */
export function toSchool(raw: unknown, destinationSlug = '', flagBase?: string): School {
  const source = asRecord(raw)
  const summary = toSchoolSummary(source, destinationSlug, flagBase)
  const presentation = html(source, 'presentation')

  return {
    ...summary,
    presentation,
    details: toDetails(source.details),
    pointsForts: html(source, 'points_forts'),
    seo: toSeo(source, summary.title, presentation),
  }
}

/** Slug d'URL tiré d'un nom de pays (`Pays-Bas` → `pays-bas`). */
function slugifyCountry(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Page de `GET /mba/schools?region=` + `GET /mba/area` → `MbaRegionSchools`.
 *
 * `SchoolResource.country` ne porte que le nom : l'identifiant du pays est à
 * la racine (`lc_country_id`), comparable au `country.id` des destinations.
 * Une école d'un pays qui est une destination du catalogue s'ouvre sous ce
 * pays ; sinon sous un slug tiré du nom du pays (la fiche se charge par le
 * slug de l'école, le pays ne sert qu'aux liens de retour).
 *
 * `/mba/area` a longtemps renvoyé le premier domaine venu (corrigé côté
 * back-office le 2026-09-28) : tout autre domaine que `mba` est écarté.
 */
export function toMbaRegionSchools(
  raw: unknown,
  rawArea: unknown,
  region: { slug: string, title: string },
  destinations: { slug: string, country: { id: string | null } }[],
  requestedPage: number,
  flagBase?: string,
): MbaRegionSchools {
  const source = asRecord(raw)
  const items = asArray(source.data).map((school) => {
    const summary = toSchoolSummary(school, '', flagBase)
    const countryId = str(school, 'lc_country_id') || summary.country.id
    const destination = destinations.find(item => item.country.id !== null && item.country.id === countryId)
    return { ...summary, destinationSlug: destination?.slug ?? slugifyCountry(summary.country.name) }
  })
  const area = rawArea === null || rawArea === undefined ? null : toAreaOfStudySummary(rawArea)

  return {
    region,
    area: area && area.slug === 'mba' ? area : null,
    items,
    page: optionalNum(source, 'current_page') ?? requestedPage,
    perPage: optionalNum(source, 'per_page') ?? 4,
    total: optionalNum(source, 'total') ?? items.length,
    totalPages: optionalNum(source, 'last_page') ?? 1,
  }
}
