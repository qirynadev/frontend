import type { School, SchoolDetail, SchoolFormation, SchoolSummary } from '../contracts'
import { parseFormationDescription } from '~/utils/formation-content'
import { toCountry, toSeo } from './common.adapter'
import { asArray, asRecord, html, list, optionalNum, optionalStr, str, toUrl } from './primitives'

/**
 * Formations de la fiche école.
 *
 * Les tableaux `formations` / `details` de l'API contiennent presque toujours
 * une entrée fantôme `{ title: null, description: null }` — 428 des 570 écoles
 * du catalogue de recette n'ont que ça. On les écarte ici, une fois.
 *
 * **Grade / durée** : l'API ne les expose pas (clés absentes, vérifié à
 * nouveau le 2026-08-31 sur le catalogue et le formulaire admin — la fiche
 * école n'a que `title`/`description` par formation). Un mock précédent
 * (`config/formation-meta-mock.ts`) devinait un grade/une durée depuis le
 * titre ou repliait sur « Grade Master »/« 3 ans » : retiré, une valeur
 * inventée n'est pas préférable à une absence honnête. `-` tant que le
 * back-office n'alimente pas ces champs (voir `docs/directives-backend.md`).
 */
function toFormations(raw: unknown): SchoolFormation[] {
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
    formations: toFormations(source.formations),
    details: toDetails(source.details),
    seo: toSeo(source, summary.title, presentation),
  }
}
