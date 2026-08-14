import type { ApiRequestOptions } from './api-client'
import { ApiError, toApiError } from './errors'

/**
 * Client de l'application : le navigateur ne parle qu'au BFF Nitro.
 *
 * Trois conséquences voulues :
 * - l'URL de l'API n'est jamais exposée au client ;
 * - le jeton de session reste dans un cookie `httpOnly`, rattaché côté serveur ;
 * - `/all-data` (4,4 Mo) est chargé, mis en cache et **réduit** par Nitro : le
 *   navigateur ne reçoit que la forme du domaine.
 *
 * Aucun composant, aucune page n'appelle `$fetch` — la règle se vérifie d'un
 * `grep` sur `$fetch` hors de `core/http/`.
 *
 * ⚠️ Volontairement **sans composable Nuxt**. Un repository est appelé depuis un
 * `useAsyncData`, donc après un `await` : le contexte Nuxt n'y est plus garanti
 * et `useRuntimeConfig()` y lèverait `NUXT_E1001`. Le préfixe du BFF étant une
 * constante de compilation, il n'y a rien à lire dans la configuration.
 */

/** Préfixe des routes BFF. Doit rester aligné sur `server/api/bff/`. */
export const BFF_BASE = '/api/bff'

export interface BffRequestOptions extends ApiRequestOptions {
  /**
   * Langue du contenu demandé.
   *
   * **Transmise explicitement, jamais déduite d'une variable de module** : au
   * rendu serveur, un état partagé fuirait d'une requête à l'autre et un
   * visiteur anglophone pourrait recevoir la page d'un francophone.
   *
   * Le back-office sert de vraies traductions (`Apprendre l'anglais` /
   * `Learn English`) : l'oublier ne casse rien visiblement, mais affiche du
   * français sur tout le site anglais.
   */
  locale?: string
}

export async function bffFetch<T>(path: string, options: BffRequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET'
  const idempotent = method === 'GET' || method === 'PUT' || method === 'DELETE'
  const attempts = 1 + (options.retry ?? (idempotent ? 1 : 0))

  let lastError: ApiError | null = null

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      // Le typage de `$fetch` déduit une réponse Nitro ; ici le contrat est
      // porté par `T`, qui vient du repository appelant.
      return (await $fetch(path, {
        baseURL: BFF_BASE,
        method,
        query: options.query,
        body: options.body as Record<string, unknown> | undefined,
        headers: {
          Accept: 'application/json',
          ...(options.locale ? { lang: options.locale } : {}),
          ...options.headers,
        },
        timeout: options.timeoutMs ?? 20_000,
        signal: options.signal,
        retry: false,
      })) as T
    }
    catch (error) {
      lastError = toApiError(error, path)

      if (lastError.kind === 'unauthorized') {
        await onUnauthorized()
        throw lastError
      }

      if (!lastError.retryable || attempt === attempts) throw lastError
      await new Promise((resolve) => setTimeout(resolve, 200 * attempt))
    }
  }

  throw lastError ?? new ApiError({ kind: 'unknown', status: 0, path, message: 'Échec inattendu' })
}

/**
 * Réaction unique au 401 : purge de la session, retour à l'écran de connexion,
 * page demandée conservée pour y revenir ensuite.
 *
 * Sans effet au rendu serveur : c'est au middleware de route de décider d'une
 * redirection SSR, pas à la couche réseau.
 *
 * La navigation passe par `location.assign` plutôt que par le routeur : on est
 * hors contexte Nuxt, et un rechargement complet a l'avantage de repartir d'un
 * état vierge après expiration de session.
 */
async function onUnauthorized(): Promise<void> {
  if (import.meta.server || typeof window === 'undefined') return

  const current = window.location.pathname + window.location.search

  // Déjà sur l'écran de connexion : ne pas boucler.
  if (/\/(connexion|login)(\/|$)/.test(window.location.pathname)) return

  await $fetch(`${BFF_BASE}/session`, { method: 'DELETE' }).catch(() => {})
  window.location.assign(`/connexion?redirect=${encodeURIComponent(current)}`)
}
