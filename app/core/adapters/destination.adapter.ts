import type {
  Destination,
  DestinationHighlight,
  DestinationPageTexts,
  DestinationStat,
  DestinationSummary,
  DestinationTrustItem,
} from '../contracts'
import { toCountry, toSeo } from './common.adapter'
import { toSchoolSummary } from './school.adapter'
import { asArray, asRecord, dedupeBySlug, html, list, num, optionalStr, str, toUrl, warnDataIssue } from './primitives'

/**
 * Statistiques éditoriales du bandeau d'excellence — libellé et valeur libres
 * par pays (`SchoolFile.stats`), jamais complétées à 4 côté front : une entrée
 * manquante ou vide affiche un « - », elle n'est pas remplacée par une donnée
 * inventée.
 */
function toDestinationStats(raw: unknown, icons: unknown): DestinationStat[] {
  return asArray(raw).map((entry, index) => ({
    value: str(entry, 'value'),
    label: str(entry, 'label'),
    icon: iconAt(icons, 'stats', index),
  }))
}

/**
 * URL de l'icône choisie dans le back-office pour un emplacement
 * (`icons.{zone}[index].url`), `null` sinon : le site garde alors l'icône de
 * sa maquette. Indexée sur la position saisie, avant tout filtrage.
 */
function iconAt(icons: unknown, zone: 'stats' | 'highlights' | 'trust', index: number): string | null {
  return toUrl(asRecord(asArray(asRecord(icons)[zone])[index]).url)
}

/** Textes de page administrés (`page_texts`) ; une clé absente ou vide garde le texte du site. */
function toDestinationPageTexts(raw: unknown): DestinationPageTexts {
  return {
    heading: optionalStr(raw, 'heading'),
    ctaLabel: optionalStr(raw, 'cta_label'),
    domainsTitle: optionalStr(raw, 'domains_title'),
    domainsText: optionalStr(raw, 'domains_text'),
    whyTitle: optionalStr(raw, 'why_title'),
    schoolsTitle: optionalStr(raw, 'schools_title'),
    bannerTitle: optionalStr(raw, 'banner_title'),
    bannerText: optionalStr(raw, 'banner_text'),
    bannerButton: optionalStr(raw, 'banner_button'),
  }
}

/** Les trois engagements du bandeau de réassurance, toujours trois. */
function toDestinationTrust(texts: unknown, icons: unknown): DestinationTrustItem[] {
  const labels = asArray(asRecord(texts).trust)
  return [0, 1, 2].map((index) => {
    const label = labels[index]
    return {
      label: typeof label === 'string' && label.trim() !== '' ? label.trim() : null,
      icon: iconAt(icons, 'trust', index),
    }
  })
}

/**
 * Arguments éditoriaux (`SchoolFile.highlights`). Une entrée sans titre ni
 * texte ne sert à rien à l'écran : elle est écartée plutôt qu'affichée vide.
 */
function toDestinationHighlights(raw: unknown, icons: unknown): DestinationHighlight[] {
  return asArray(raw)
    .map((entry, index) => ({
      title: str(entry, 'title'),
      text: str(entry, 'text'),
      icon: iconAt(icons, 'highlights', index),
    }))
    .filter((highlight) => highlight.title !== '' || highlight.text !== '')
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

  // Écoles mises en avant : choisies par identifiant, retrouvées par slug. Une
  // école de deux domaines a deux fiches de même slug et la déduplication n'en
  // garde qu'une : l'autre, si c'est elle qui est choisie, doit rester visible.
  const slugById = new Map(schools.map((school) => [school.id, school.slug]))
  const featuredSchoolSlugs = [...new Set(
    asArray(source.featured_school_ids)
      .map((id) => slugById.get(String(id)))
      .filter((slug): slug is string => slug !== undefined),
  )]

  return {
    ...summary,
    description,
    schools: uniqueSchools,
    schoolCount: uniqueSchools.length,
    stats: toDestinationStats(source.stats, source.icons),
    highlights: toDestinationHighlights(source.highlights, source.icons),
    texts: toDestinationPageTexts(source.page_texts),
    trust: toDestinationTrust(source.page_texts, source.icons),
    featuredSchoolSlugs,
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
