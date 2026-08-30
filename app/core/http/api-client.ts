import { ApiError, toApiError } from './errors'

/**
 * Client bas niveau de l'API Qiryna.
 *
 * **Fonction pure de toute dépendance à Nuxt** : elle reçoit son `baseUrl`, son
 * jeton et sa langue en paramètres. C'est ce qui lui permet de tourner
 * indifféremment dans une route Nitro (où `useCookie` n'existe pas) et dans un
 * test unitaire (où rien n'existe).
 *
 * C'est le **seul** endroit du projet qui connaît l'URL de l'API.
 */

export interface ApiClientOptions {
  baseUrl: string
  /** Délai maximal d'un appel, en millisecondes. */
  timeoutMs?: number
  /** Langue de contenu attendue du back-office. */
  locale?: string
  /** Jeton de session, lu par l'appelant là où il est disponible. */
  token?: string | null
  /** Injectable pour les tests ; `$fetch` par défaut. */
  fetcher?: typeof globalThis.$fetch
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
  headers?: Record<string, string>
  /** Tentatives supplémentaires. Par défaut : 2 sur les verbes idempotents, 0 sinon. */
  retry?: number
  timeoutMs?: number
  signal?: AbortSignal
  /**
   * `false` pour recevoir la réponse telle quelle, sans passer par
   * `unwrapEnvelope`. Nécessaire quand une clé sœur de `data` porte un signal
   * métier que l'enveloppe déballerait sinon en silence — ex. `POST
   * /auth/social/register`, qui répond `{ success, requires_confirmation,
   * message, data }` : `requires_confirmation` doit rester lisible par
   * l'appelant. Par défaut `true` (comportement historique, inchangé pour
   * tous les autres appelants).
   */
  unwrap?: boolean
}

export interface ApiClient {
  request: <T>(path: string, options?: ApiRequestOptions) => Promise<T>
}

/**
 * Déballe les enveloppes Laravel `{ data, success, message }`.
 *
 * `/all-data` répond sans enveloppe, les autres endpoints avec : on détecte le
 * cas plutôt que de l'imposer, faute de quoi un objet métier possédant un champ
 * `data` serait tronqué.
 */
export function unwrapEnvelope<T>(payload: unknown): T {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) return payload as T
  const record = payload as Record<string, unknown>
  if (!('data' in record)) return payload as T

  const looksLikeEnvelope
    = 'success' in record || 'message' in record || 'status' in record || Object.keys(record).length === 1
  return (looksLikeEnvelope ? record.data : payload) as T
}

const IDEMPOTENT = new Set(['GET', 'PUT', 'DELETE'])

export function createApiClient(options: ApiClientOptions): ApiClient {
  const fetcher = options.fetcher ?? globalThis.$fetch
  const defaultTimeout = options.timeoutMs ?? 15_000

  async function request<T>(path: string, requestOptions: ApiRequestOptions = {}): Promise<T> {
    const method = requestOptions.method ?? 'GET'
    // On ne rejoue jamais un POST : il n'est pas idempotent, et un doublon de
    // commande coûte plus cher qu'une erreur affichée.
    const attempts = 1 + (requestOptions.retry ?? (IDEMPOTENT.has(method) ? 2 : 0))

    const headers: Record<string, string> = {
      Accept: 'application/json',
      lang: options.locale ?? 'fr',
      ...requestOptions.headers,
    }
    if (options.token) headers.Authorization = `Bearer ${options.token}`

    let lastError: ApiError | null = null

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const payload = await fetcher<unknown>(path, {
          baseURL: options.baseUrl,
          method,
          query: requestOptions.query,
          body: requestOptions.body as Record<string, unknown> | undefined,
          headers,
          timeout: requestOptions.timeoutMs ?? defaultTimeout,
          signal: requestOptions.signal,
          // Les tentatives sont gérées ici pour ne rejouer que ce qui doit l'être.
          retry: false,
        })
        return requestOptions.unwrap === false ? (payload as T) : unwrapEnvelope<T>(payload)
      }
      catch (error) {
        lastError = toApiError(error, path)
        if (!lastError.retryable || attempt === attempts) throw lastError
        // Attente progressive : 150 ms puis 300 ms.
        await new Promise((resolve) => setTimeout(resolve, 150 * attempt))
      }
    }

    throw lastError ?? new ApiError({ kind: 'unknown', status: 0, path, message: 'Échec inattendu' })
  }

  return { request }
}
