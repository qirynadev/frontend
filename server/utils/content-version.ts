/**
 * Version du contenu publié, pour que les modifications du back-office
 * s'affichent tout de suite (2026-10-25).
 *
 * Le site garde en mémoire le catalogue (5 min), les fiches et les pages
 * déjà calculées (60 s). Le back-office, à chaque enregistrement, appelle
 * `POST /api/cache/revalidate` ; on y change la version, rangée dans le
 * stockage `data` (fichier sur disque, partagé par tous les processus du
 * site), et on vide le cache du processus qui a reçu l'appel.
 *
 * Les autres processus, eux, comparent la version à chaque requête (relue sur
 * le disque au plus toutes les `CHECK_EVERY_MS`) et vident leur propre cache
 * quand elle a changé. Sans signal, rien ne change : les caches expirent comme
 * avant.
 */

const VERSION_KEY = 'content-version'
const CHECK_EVERY_MS = 2000

/** Version déjà appliquée par ce processus ; `null` tant qu'il n'a rien lu. */
let seenVersion: string | null = null
let checkedAt = 0

async function readVersion(): Promise<string> {
  const value = await useStorage('data').getItem<string | number>(VERSION_KEY).catch(() => null)
  return value == null ? '0' : String(value)
}

/** Vide le cache Nitro de ce processus : catalogue, fiches, offres, pages calculées. */
export async function purgeLocalCache(): Promise<number> {
  const storage = useStorage('cache')
  const keys = await storage.getKeys()
  await Promise.all(keys.map(key => storage.removeItem(key)))
  return keys.length
}

/** Nouveau contenu publié : nouvelle version pour tous les processus, cache vidé ici. */
export async function bumpContentVersion(): Promise<string> {
  const version = String(Date.now())
  await useStorage('data').setItem(VERSION_KEY, version)
  await purgeLocalCache()
  seenVersion = version
  checkedAt = Date.now()
  return version
}

/**
 * À appeler en tête de chaque requête : vide le cache de ce processus si un
 * autre a reçu un signal depuis. Ne relit le disque qu'une fois toutes les
 * deux secondes.
 */
export async function syncContentVersion(): Promise<void> {
  const now = Date.now()
  if (now - checkedAt < CHECK_EVERY_MS) return
  checkedAt = now

  const current = await readVersion()
  if (seenVersion === null) {
    // Premier passage du processus : son cache vient de naître, rien à vider.
    seenVersion = current
    return
  }
  if (current !== seenVersion) {
    seenVersion = current
    await purgeLocalCache()
  }
}

/** Comparaison à durée constante de deux secrets (sans `node:crypto`). */
export function sameSecret(given: string, expected: string): boolean {
  if (given.length !== expected.length) return false
  let diff = 0
  for (let index = 0; index < expected.length; index++) {
    diff |= given.charCodeAt(index) ^ expected.charCodeAt(index)
  }
  return diff === 0
}
