/**
 * Boîte à outils de la couche anti-corruption.
 *
 * **Tout le code défensif du projet vit ici et dans les `*.adapter.ts` voisins.**
 * Aucune de ces fonctions ne lève : une réponse tronquée, un champ absent ou un
 * type inattendu produisent une valeur par défaut sûre.
 */

import { sanitizeHtml } from './sanitize'

/** Vrai si la valeur est un objet exploitable (ni `null`, ni tableau). */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Ramène n'importe quoi à un objet navigable. */
export function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {}
}

/** Descend un chemin (`'country.iso_alpha_2'`) sans jamais lever. */
export function dig(source: unknown, path: string): unknown {
  let current: unknown = source
  for (const segment of path.split('.')) {
    if (!isRecord(current)) return undefined
    current = current[segment]
  }
  return current
}

/** Chaîne, avec repli. Les nombres sont convertis, tout le reste tombe sur `fallback`. */
export function str(source: unknown, path: string, fallback = ''): string {
  const value = dig(source, path)
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return fallback
}

/**
 * Champ **HTML** éditorial, assaini.
 *
 * À employer partout où la valeur finira dans un `v-html`. Le passage par la
 * liste blanche est fait ici, une fois, pour qu'aucune page n'ait à y penser.
 */
export function html(source: unknown, path: string): string {
  return sanitizeHtml(str(source, path))
}

/** Chaîne ou `null` — pour les champs réellement optionnels (image, badge…). */
export function optionalStr(source: unknown, path: string): string | null {
  const value = str(source, path, '')
  return value === '' ? null : value
}

/** Nombre fini, avec repli. Accepte les nombres transmis en chaîne (`"108"`). */
export function num(source: unknown, path: string, fallback = 0): number {
  const value = dig(source, path)
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

export function optionalNum(source: unknown, path: string): number | null {
  const value = dig(source, path)
  if (value === null || value === undefined || value === '') return null
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

/** Booléen tolérant : `true`, `1`, `"1"`, `"true"` valent vrai. */
export function bool(source: unknown, path: string, fallback = false): boolean {
  const value = dig(source, path)
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['1', 'true', 'yes', 'oui'].includes(normalized)) return true
    if (['0', 'false', 'no', 'non', ''].includes(normalized)) return false
  }
  return fallback
}

/** Tableau, toujours. Un champ absent ou scalaire donne `[]`. */
export function list(source: unknown, path: string): unknown[] {
  const value = dig(source, path)
  return Array.isArray(value) ? value : []
}

/** Idem, mais sur une valeur déjà extraite. */
export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

/**
 * Normalise une date de l'API.
 *
 * Le back-office renvoie du `JJ/MM/AAAA` (« 13/01/2026 »), pas de l'ISO. On
 * produit une date ISO `AAAA-MM-JJ` exploitable par `Intl` et triable.
 * Toute valeur non reconnue donne `null` plutôt qu'une `Invalid Date`.
 */
export function toIsoDate(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed === '') return null

  // `/payment/list` ajoute une heure (`16/08/2026 16:39`) que les autres
  // endpoints n'ont pas (`17/08/2024`) : sans le suffixe optionnel, ces
  // dates tombaient dans `new Date(trimmed)` ci-dessous, qui lit `JJ/MM` en
  // `MM/JJ` — `12/08` devenait le 8 décembre, silencieusement faux plutôt
  // que `null`.
  const french = /^(\d{2})\/(\d{2})\/(\d{4})(?:[ T]\d{2}:\d{2}(?::\d{2})?)?$/.exec(trimmed)
  if (french) {
    const [, day, month, year] = french
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
    // Rejette les dates impossibles (31/02) que `Date` reporterait silencieusement.
    if (date.getUTCDate() !== Number(day) || date.getUTCMonth() !== Number(month) - 1) return null
    return `${year}-${month}-${day}`
  }

  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10)
}

const ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&rsquo;': '’',
  '&laquo;': '«',
  '&raquo;': '»',
  '&eacute;': 'é',
  '&egrave;': 'è',
  '&agrave;': 'à',
  '&ccedil;': 'ç',
  '&hellip;': '…',
}

/** Décode les entités HTML les plus courantes, plus les entités numériques. */
export function decodeEntities(value: string): string {
  return value
    .replace(/&(?:nbsp|amp|lt|gt|quot|#39|apos|rsquo|laquo|raquo|eacute|egrave|agrave|ccedil|hellip);/g, (match) => ENTITIES[match] ?? match)
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
}

/**
 * Texte brut à partir du HTML du back-office.
 *
 * Sert aux descriptions SEO et aux extraits de carte : on ne veut ni balise,
 * ni entité, ni espace surnuméraire. `maxLength` coupe sur un mot entier.
 */
export function plainText(html: unknown, maxLength = 0): string {
  if (typeof html !== 'string') return ''
  const text = decodeEntities(html.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()

  if (maxLength <= 0 || text.length <= maxLength) return text
  const cut = text.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

/**
 * Ne retient qu'une URL absolue exploitable.
 *
 * Le back-office renvoie des URL absolues, mais le champ est parfois vide ou
 * rempli d'un chemin relatif : on préfère `null` à une image cassée.
 */
export function toUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed === '') return null
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('//') || trimmed.startsWith('/')) return trimmed
  return null
}

/**
 * Journalise une anomalie de données — en développement uniquement.
 *
 * La détection d'environnement passe par `globalThis` : ce module doit rester
 * exécutable dans le navigateur, dans Nitro et dans Vitest, sans dépendre des
 * types Node ni des variables `import.meta` de Nuxt.
 */
export function warnDataIssue(message: string, context?: unknown): void {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
  if (env?.NODE_ENV === 'production') return
  // eslint-disable-next-line no-console -- signal destiné aux développeurs
  console.warn(`[qiryna:adapter] ${message}`, context ?? '')
}

/**
 * Écarte les doublons de slug de façon **déterministe**.
 *
 * La base de production contient de vraies collisions (21 relevées sur les 570
 * écoles du catalogue de recette : `universite-lille`, `hec-paris`, `insead`…).
 * Sans tri explicite, l'entrée retenue dépendrait de l'ordre de la réponse HTTP
 * et pourrait changer d'un rendu à l'autre — donc entre le HTML du serveur et
 * l'hydratation du client. On trie par `id` croissant et on garde le premier.
 */
export function dedupeBySlug<T extends { id: string; slug: string }>(items: T[], label: string): T[] {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const group = groups.get(item.slug)
    if (group) group.push(item)
    else groups.set(item.slug, [item])
  }

  const kept: T[] = []
  const collisions: string[] = []

  for (const [slug, group] of groups) {
    if (group.length === 1) {
      kept.push(group[0]!)
      continue
    }
    const sorted = [...group].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    kept.push(sorted[0]!)
    collisions.push(`${slug} (${group.length} entrées, retenue : ${sorted[0]!.id})`)
  }

  if (collisions.length > 0) {
    warnDataIssue(`${label} : ${collisions.length} collision(s) de slug, première entrée par id retenue`, collisions)
  }

  // On restitue l'ordre d'origine : la déduplication ne doit pas réordonner la liste.
  const keptIds = new Set(kept.map((item) => item.id))
  return items.filter((item) => keptIds.has(item.id))
}
