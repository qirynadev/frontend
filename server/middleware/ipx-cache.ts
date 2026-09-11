import { createHash } from 'node:crypto'

/**
 * Cache serveur des images optimisées (`/_ipx/...`).
 *
 * `ipx` ne garde rien entre deux requêtes : chaque visiteur dont le
 * navigateur n'a pas encore l'image relançait le téléchargement de
 * l'original et son réencodage. Mesuré sur danube le 2026-09-11 : ~0,5 s par
 * image et par visiteur (1,5 s pour une photo d'école de 778 Ko), sur un
 * seul processus Passenger partagé avec le rendu des pages. Depuis le cache :
 * ~3 ms.
 *
 * Ce middleware passe devant le gestionnaire d'`@nuxt/image` :
 *
 * - **première demande** : il appelle `ipx` en interne (sans réseau, via le
 *   `$fetch` local de Nitro), garde le résultat, puis le sert ;
 * - **demandes suivantes**, tous visiteurs confondus : servies depuis la
 *   mémoire, jusqu'à la fin du `max-age` qu'`ipx` a lui-même fixé (7 jours
 *   pour `public/`, 1 jour ou la durée du back-office pour ses médias) ;
 * - **demandes simultanées** de la même image : une seule génération, que
 *   toutes attendent ;
 * - **mémoire plafonnée** (`MAX_BYTES`) : les images les moins récemment
 *   demandées sortent en premier. Une vignette pèse 1 à 50 Ko : le plafond
 *   couvre plusieurs milliers d'images.
 *
 * Rien n'est mis en cache en cas d'erreur (403 hôte refusé, 404 source
 * absente) : la réponse d'`ipx` est relayée telle quelle. Chaque processus a
 * son propre cache ; il repart vide à chaque redémarrage, ce qui ne coûte
 * qu'une génération par image.
 */

const BYPASS_HEADER = 'x-qiryna-ipx-internal'
const MAX_BYTES = 64 * 1024 * 1024
const FALLBACK_MAX_AGE = 60

interface CachedImage {
  data: Buffer
  contentType: string
  cacheControl: string
  etag: string
  expiresAt: number
}

const entries = new Map<string, CachedImage>()
const inflight = new Map<string, Promise<CachedImage | { status: number; body: Buffer; contentType: string }>>()
let totalBytes = 0

function remember(key: string, image: CachedImage): void {
  const previous = entries.get(key)
  if (previous) {
    totalBytes -= previous.data.length
    entries.delete(key)
  }
  entries.set(key, image)
  totalBytes += image.data.length

  // `Map` garde l'ordre d'insertion : la première clé est la moins récente.
  for (const [oldest, value] of entries) {
    if (totalBytes <= MAX_BYTES) break
    entries.delete(oldest)
    totalBytes -= value.data.length
  }
}

function recall(key: string): CachedImage | undefined {
  const image = entries.get(key)
  if (!image) return undefined
  if (image.expiresAt <= Date.now()) {
    entries.delete(key)
    totalBytes -= image.data.length
    return undefined
  }
  // Remonte l'entrée en tête : c'est l'ordre d'éviction.
  entries.delete(key)
  entries.set(key, image)
  return image
}

/**
 * Type d'une image d'après ses premiers octets. L'appel interne à `ipx` ne
 * remonte pas ses en-têtes (constaté au test : `content-type` absent) ; les
 * formats qu'il produit se reconnaissent sans ambiguïté à leur signature.
 */
function sniffContentType(data: Buffer): string {
  const ascii = (from: number, to: number) => data.subarray(from, to).toString('latin1')
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp'
  if (data[0] === 0x89 && ascii(1, 4) === 'PNG') return 'image/png'
  if (data[0] === 0xFF && data[1] === 0xD8) return 'image/jpeg'
  if (ascii(4, 12) === 'ftypavif') return 'image/avif'
  if (ascii(0, 3) === 'GIF') return 'image/gif'
  if (/<svg[\s>]/i.test(data.subarray(0, 1024).toString('utf8'))) return 'image/svg+xml'
  return 'application/octet-stream'
}

/**
 * Durée de cache, en secondes — celle qu'`ipx` applique (`image.ipx` dans
 * `nuxt.config.ts`), relue depuis la configuration pour la même raison :
 * image distante (`/_ipx/<modificateurs>/https://…`) ou fichier de `public/`.
 */
function maxAgeFor(path: string): number {
  const ipx = useRuntimeConfig().ipx as { maxAge?: number, fs?: { maxAge?: number }, http?: { maxAge?: number } } | undefined
  const remote = /^\/_ipx\/[^/]+\/https?:\//.test(path)
  const value = remote ? ipx?.http?.maxAge : (ipx?.fs?.maxAge ?? ipx?.maxAge)
  return typeof value === 'number' && value > 0 ? value : FALLBACK_MAX_AGE
}

async function generate(path: string) {
  const response = await $fetch.raw<ArrayBuffer>(path, {
    responseType: 'arrayBuffer',
    headers: { [BYPASS_HEADER]: '1' },
    ignoreResponseError: true,
  })
  const body = Buffer.from(response._data ?? new ArrayBuffer(0))
  const contentType = response.headers.get('content-type') ?? sniffContentType(body)

  if (response.status !== 200 || body.length === 0) {
    return { status: response.status || 502, body, contentType }
  }

  const headerMaxAge = /max-age=(\d+)/.exec(response.headers.get('cache-control') ?? '')?.[1]
  const maxAge = headerMaxAge ? Number(headerMaxAge) : maxAgeFor(path)
  const cacheControl = `max-age=${maxAge}, public, s-maxage=${maxAge}`
  const image: CachedImage = {
    data: body,
    contentType,
    cacheControl,
    etag: `"${createHash('sha1').update(body).digest('base64url')}"`,
    expiresAt: Date.now() + maxAge * 1000,
  }
  remember(path, image)
  return image
}

export default defineEventHandler(async (event) => {
  const path = event.path
  if (!path.startsWith('/_ipx/')) return
  if (event.method !== 'GET' && event.method !== 'HEAD') return
  if (getRequestHeader(event, BYPASS_HEADER)) return
  // Format négocié selon l'en-tête `Accept` : la même URL peut donner des
  // formats différents, on la laisse à `ipx`. Le site impose `webp` partout.
  if (/(^|[/&_])f(ormat)?_auto\b/.test(path)) return

  let image: CachedImage | undefined = recall(path)
  // `hit` : servie depuis la mémoire ; `miss` : générée pour cette requête
  // (ou attendue derrière une génération en cours). Sert à vérifier en ligne.
  setResponseHeader(event, 'x-ipx-cache', image ? 'hit' : 'miss')
  if (!image) {
    let pending = inflight.get(path)
    if (!pending) {
      pending = generate(path).finally(() => inflight.delete(path))
      inflight.set(path, pending)
    }
    const result = await pending
    if (!('etag' in result)) {
      setResponseStatus(event, result.status)
      setResponseHeader(event, 'content-type', result.contentType)
      return result.body
    }
    image = result
  }

  setResponseHeaders(event, {
    'content-type': image.contentType,
    'cache-control': image.cacheControl,
    'etag': image.etag,
    'x-content-type-options': 'nosniff',
    // Même garde-fou qu'`ipx` : une image n'exécute jamais rien.
    'content-security-policy': "default-src 'none'",
  })

  if (getRequestHeader(event, 'if-none-match') === image.etag) {
    setResponseStatus(event, 304)
    return ''
  }
  // Pour une requête HEAD, Node n'envoie pas le corps mais garde sa longueur.
  return image.data
})
