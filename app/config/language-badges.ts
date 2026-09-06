/**
 * Présentation éditoriale des langues — `langue-apprentissage.html`.
 *
 * ### Drapeau
 *
 * La maquette dessine, pour chaque langue, **un drapeau rond**
 * (`assets/icons/flags/flag-uk.svg`) ; l'API sert des drapeaux `blade-flags`
 * **rectangulaires** (`country_flag` → `country-gb.svg`). C'est le même pays,
 * dessiné autrement — un choix de présentation, qui revient au front. On
 * reprend donc le dessin de la maquette pour les langues qu'elle couvre, sans
 * rien inventer côté contenu.
 *
 * ### Étiquette (`badge`)
 *
 * Longtemps `null` pour tout le catalogue (la maquette montrait des
 * affirmations commerciales — « La plus demandée » — jamais administrées),
 * l'API renseigne désormais un code fixe par langue :
 * `most_demanded | very_popular | popular | growing | trending`
 * (`StoreCourseRequest::rules()` côté back-office, seules valeurs acceptées),
 * identique quelle que soit la locale de la requête — c'est au front de le
 * traduire. `coursePresentationFor()` fait cette traduction ; une langue sans
 * `badge` ou avec un code inconnu n'affiche **rien** (voir `LanguageCard.vue`,
 * demande explicite du 2026-09-06 : ne jamais inventer d'étiquette).
 */

/** Tonalités relevées dans `app.css` (`.langue-tag--*`). */
export type LanguageBadgeTone
  = | 'demandee'
    | 'populaire'
    | 'croissance'
    | 'tres'
    | 'tendance'

/** Les cinq seules valeurs que `StoreCourseRequest` accepte pour `badge`. */
const BADGE_PRESENTATION: Record<string, { labelKey: string, tone: LanguageBadgeTone }> = {
  most_demanded: { labelKey: 'course.badge.mostRequested', tone: 'demandee' },
  very_popular: { labelKey: 'course.badge.veryPopular', tone: 'tres' },
  popular: { labelKey: 'course.badge.popular', tone: 'populaire' },
  growing: { labelKey: 'course.badge.growing', tone: 'croissance' },
  trending: { labelKey: 'course.badge.trending', tone: 'tendance' },
}

/**
 * Traduit le code brut de `CourseSummary.badge` en clé i18n + tonalité.
 * `null` (absent côté admin, ou code non reconnu) : rien à afficher.
 */
export function coursePresentationFor(badge: string | null): { labelKey: string, tone: LanguageBadgeTone } | null {
  if (!badge) return null
  return BADGE_PRESENTATION[badge] ?? null
}

export interface LanguageFlag {
  /** Slug de la langue côté API. */
  slug: string
  /** Code pays du drapeau de la maquette (`public/img/icons/flags/flag-<code>.svg`). */
  flag: string
}

/**
 * Les huit langues dessinées par la maquette, **dans son ordre exact**.
 *
 * L'ordre compte : la maquette remplit deux colonnes de haut en bas
 * (Anglais / Allemand / Français / Arabe, puis Espagnol / Mandarin / Japonais /
 * Coréen). L'API, elle, renvoie Français en premier. Trier ici plutôt que de
 * suivre l'API garde la grille identique — et les langues absentes de cette
 * liste sont simplement ajoutées à la fin.
 */
export const languageFlags: LanguageFlag[] = [
  { slug: 'anglais', flag: 'uk' },
  { slug: 'allemand', flag: 'de' },
  { slug: 'francais', flag: 'fr' },
  { slug: 'arabe', flag: 'ae' },
  { slug: 'espagnol', flag: 'es' },
  { slug: 'mandarin', flag: 'cn' },
  { slug: 'japonais', flag: 'jp' },
  { slug: 'coreen', flag: 'kr' },
]

const FLAG_BY_SLUG = new Map(languageFlags.map((entry) => [entry.slug, entry.flag]))

/**
 * Repli par code pays, quand le slug de l'API ne figure pas dans la liste.
 *
 * L'API expose le pays dans l'URL du drapeau (`…/country-gb.svg`). Le nom du
 * fichier de la maquette ne suit pas toujours le code ISO — `gb` s'y appelle
 * `uk` — d'où cette table plutôt qu'une simple concaténation.
 */
const FLAG_BY_COUNTRY: Record<string, string> = {
  gb: 'uk', uk: 'uk', fr: 'fr', de: 'de', es: 'es',
  ae: 'ae', cn: 'cn', jp: 'jp', kr: 'kr',
}

/**
 * Nom du drapeau de la maquette pour une langue, ou `null`.
 *
 * `null` signifie « la maquette ne dessine pas ce drapeau » : l'appelant
 * retombe alors sur celui de l'API, rectangulaire mais exact.
 */
export function flagNameFor(slug: string, apiFlagUrl: string | null): string | null {
  const known = FLAG_BY_SLUG.get(slug)
  if (known) return `flag-${known}`

  const code = /country-([a-z]{2})\.svg/i.exec(apiFlagUrl ?? '')?.[1]?.toLowerCase()
  const mapped = code ? FLAG_BY_COUNTRY[code] : undefined
  return mapped ? `flag-${mapped}` : null
}

/** Trie les langues dans l'ordre de la maquette ; les inconnues finissent à la fin. */
export function orderByMaquette<T extends { slug: string }>(items: T[]): T[] {
  const rank = new Map(languageFlags.map((entry, index) => [entry.slug, index]))
  return [...items].sort((a, b) => (rank.get(a.slug) ?? 999) - (rank.get(b.slug) ?? 999))
}
