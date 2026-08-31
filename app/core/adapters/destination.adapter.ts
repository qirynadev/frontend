import type { Destination, DestinationStat, DestinationSummary } from '../contracts'
import { toCountry, toSeo } from './common.adapter'
import { toSchoolSummary } from './school.adapter'
import { asArray, asRecord, dedupeBySlug, html, list, num, str, toUrl, warnDataIssue } from './primitives'

/**
 * Statistiques éditoriales du bandeau d'excellence — libellé et valeur libres
 * par pays (`SchoolFile.stats`), jamais complétées à 4 côté front : une entrée
 * manquante ou vide affiche un « - », elle n'est pas remplacée par une donnée
 * inventée.
 */
function toDestinationStats(raw: unknown): DestinationStat[] {
  return asArray(raw).map((entry) => ({
    value: str(entry, 'value'),
    label: str(entry, 'label'),
  }))
}

/**
 * Le champ `title` de l'API ne contient **pas** le nom de la destination mais
 * une accroche marketing (« L'excellence universitaire reconnue, accessible et
 * durable »). Le nom affichable est dans `country.name` — c'est d'ailleurs lui
 * que le menu du back-office expose.
 *
 * On remet chaque chose à sa place ici, une fois. Le jour où l'API corrigera le
 * nommage, seule cette fonction bougera.
 */
function resolveTitle(source: Record<string, unknown>): { title: string; tagline: string } {
  const apiTitle = str(source, 'title')
  const countryName = str(source, 'country.name')

  if (countryName !== '') return { title: countryName, tagline: apiTitle }

  warnDataIssue('destination sans country.name : repli sur title', { slug: str(source, 'slug') })
  return { title: apiTitle, tagline: '' }
}

export function toDestinationSummary(raw: unknown, flagBase?: string): DestinationSummary {
  const source = asRecord(raw)
  const { title, tagline } = resolveTitle(source)

  return {
    id: str(source, 'id'),
    slug: str(source, 'slug'),
    title,
    tagline,
    image: toUrl(source.picture) ?? toUrl(source.image),
    country: toCountry(source.country, flagBase),
    // `nbr_schools` est fourni, mais on préfère la longueur réelle du tableau
    // quand il est présent : les deux divergent quand une école est dépubliée.
    schoolCount: Array.isArray(source.schools) ? source.schools.length : num(source, 'nbr_schools', 0),
  }
}

export function toDestination(raw: unknown, flagBase?: string): Destination {
  const source = asRecord(raw)
  const summary = toDestinationSummary(source, flagBase)
  const description = html(source, 'description')

  const schools = list(source, 'schools')
    .map((school) => toSchoolSummary(school, summary.slug, flagBase))
    // Une école du catalogue de recette a un slug vide : elle serait inatteignable
    // et ferait doublon avec toute autre école mal renseignée.
    .filter((school) => school.id !== '' && school.slug !== '')

  const uniqueSchools = dedupeBySlug(schools, `écoles de « ${summary.slug} »`)

  return {
    ...summary,
    description,
    schools: uniqueSchools,
    schoolCount: uniqueSchools.length,
    stats: toDestinationStats(source.stats),
    seo: toSeo(source, summary.title, description),
  }
}

/** Liste de destinations, dédupliquée et débarrassée des entrées inexploitables. */
export function toDestinationList(raw: unknown, flagBase?: string): Destination[] {
  const destinations = (Array.isArray(raw) ? raw : [])
    // `.map(toDestination)` passerait l'index en second argument, donc à la
    // place de `flagBase` : la lambda explicite est nécessaire.
    .map((entry) => toDestination(entry, flagBase))
    .filter((destination) => destination.id !== '' && destination.slug !== '')

  return dedupeBySlug(destinations, 'destinations')
}
