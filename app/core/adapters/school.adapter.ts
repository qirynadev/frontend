import type { School, SchoolDetail, SchoolFormation, SchoolSummary } from '../contracts'
import { toCountry, toSeo } from './common.adapter'
import { asArray, asRecord, html, list, optionalNum, str, toUrl } from './primitives'

/**
 * Les tableaux `formations` et `details` de l'API contiennent presque toujours
 * une entrée fantôme `{ title: null, description: null }` — 428 des 570 écoles
 * du catalogue de recette n'ont que ça. On les écarte ici, une fois, plutôt
 * que dans chaque `v-if` de chaque page.
 */
function toNamedBlocks(raw: unknown): SchoolFormation[] {
  return asArray(raw)
    .map((entry) => {
      const source = asRecord(entry)
      return { title: str(source, 'title'), description: html(source, 'description') }
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
    formations: toNamedBlocks(source.formations),
    // `details` partage la forme de `formations` ; le domaine les distingue par
    // leur usage (programmes vs chiffres clés), pas par leur structure.
    details: toNamedBlocks(source.details) as SchoolDetail[],
    // Alimentés nulle part dans le catalogue actuel : le contrat les expose
    // quand même pour que la fiche n'ait pas à changer le jour où ils le seront.
    foundedYear: optionalNum(source, 'founded_year'),
    studentCount: optionalNum(source, 'student_count'),
    seo: toSeo(source, summary.title, presentation),
  }
}
