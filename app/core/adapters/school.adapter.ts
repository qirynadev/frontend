import type { School, SchoolDetail, SchoolFormation, SchoolSummary } from '../contracts'
import { parseFormationDescription } from '~/utils/formation-content'
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
      const parsed = parseFormationDescription(description)
      return {
        title,
        description,
        summary: parsed.summary,
        sections: parsed.sections,
        bodyHtml: parsed.bodyHtml,
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
    seo: toSeo(source, summary.title, presentation),
  }
}
