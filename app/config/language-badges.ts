/**
 * Présentation éditoriale des langues — `langue-apprentissage.html`.
 *
 * ### Pourquoi ce fichier existe
 *
 * La maquette montre, pour chaque langue, **un drapeau rond dessiné à la main**
 * et **une étiquette commerciale colorée** (« La plus demandée », « Tendance »…).
 * L'API ne fournit ni l'un ni l'autre :
 *
 * | Ce que montre la maquette | Ce que renvoie l'API |
 * |---|---|
 * | drapeau rond 32×32 (`assets/icons/flags/flag-uk.svg`) | `country_flag` → `blade-flags/country-gb.svg`, **rectangulaire** |
 * | « La plus demandée », en violet | `badge: null` sur les quatre langues |
 *
 * Le drapeau est un **choix de présentation** : la même langue, dessinée
 * autrement. On reprend donc le dessin de la maquette, sans rien inventer.
 *
 * L'étiquette, elle, est une **affirmation commerciale**. La reprendre revient
 * à écrire dans le code que l'anglais est « la plus demandée ». C'est assumé,
 * pour la même raison que `config/language-goals.ts` : la maquette la spécifie,
 * l'API ne la porte pas, et un emplacement vide serait un écart plus visible
 * qu'une étiquette exacte.
 *
 * ⚠️ **Ces libellés sont à faire valider par le client, puis à administrer.**
 * Dès que `badge` est renseigné côté back-office, il l'emporte sur ce fichier —
 * voir `LanguageCard.vue`. Ce fichier deviendra alors du repli mort, et pourra
 * être supprimé sans toucher au reste.
 */

/** Tonalités relevées dans `app.css` (`.langue-tag--*`). */
export type LanguageBadgeTone
  = | 'demandee'
    | 'populaire'
    | 'populaire-soft'
    | 'croissance'
    | 'croissance-soft'
    | 'tres'
    | 'tendance'

export interface LanguagePresentation {
  /** Slug de la langue côté API. */
  slug: string
  /** Code pays du drapeau de la maquette (`public/img/icons/flags/flag-<code>.svg`). */
  flag: string
  labelKey: string
  tone: LanguageBadgeTone
}

/**
 * Les huit langues de la maquette, **dans son ordre exact**.
 *
 * L'ordre compte : la maquette remplit deux colonnes de haut en bas
 * (Anglais / Allemand / Français / Arabe, puis Espagnol / Mandarin / Japonais /
 * Coréen). L'API, elle, renvoie Français en premier. Trier ici plutôt que de
 * suivre l'API garde la grille identique — et les langues absentes de cette
 * liste sont simplement ajoutées à la fin.
 */
export const languagePresentations: LanguagePresentation[] = [
  { slug: 'anglais', flag: 'uk', labelKey: 'course.badge.mostRequested', tone: 'demandee' },
  { slug: 'allemand', flag: 'de', labelKey: 'course.badge.popular', tone: 'populaire' },
  { slug: 'francais', flag: 'fr', labelKey: 'course.badge.popular', tone: 'populaire-soft' },
  { slug: 'arabe', flag: 'ae', labelKey: 'course.badge.growing', tone: 'croissance' },
  { slug: 'espagnol', flag: 'es', labelKey: 'course.badge.veryPopular', tone: 'tres' },
  { slug: 'mandarin', flag: 'cn', labelKey: 'course.badge.growing', tone: 'croissance-soft' },
  { slug: 'japonais', flag: 'jp', labelKey: 'course.badge.trending', tone: 'tendance' },
  { slug: 'coreen', flag: 'kr', labelKey: 'course.badge.trending', tone: 'tendance' },
]

const BY_SLUG = new Map(languagePresentations.map((entry) => [entry.slug, entry]))

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

export function presentationFor(slug: string): LanguagePresentation | undefined {
  return BY_SLUG.get(slug)
}

/**
 * Nom du drapeau de la maquette pour une langue, ou `null`.
 *
 * `null` signifie « la maquette ne dessine pas ce drapeau » : l'appelant
 * retombe alors sur celui de l'API, rectangulaire mais exact.
 */
export function flagNameFor(slug: string, apiFlagUrl: string | null): string | null {
  const known = BY_SLUG.get(slug)
  if (known) return `flag-${known.flag}`

  const code = /country-([a-z]{2})\.svg/i.exec(apiFlagUrl ?? '')?.[1]?.toLowerCase()
  const mapped = code ? FLAG_BY_COUNTRY[code] : undefined
  return mapped ? `flag-${mapped}` : null
}

/** Trie les langues dans l'ordre de la maquette ; les inconnues finissent à la fin. */
export function orderByMaquette<T extends { slug: string }>(items: T[]): T[] {
  const rank = new Map(languagePresentations.map((entry, index) => [entry.slug, index]))
  return [...items].sort((a, b) => (rank.get(a.slug) ?? 999) - (rank.get(b.slug) ?? 999))
}
