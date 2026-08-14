/**
 * Erreur normalisée de la couche réseau.
 *
 * Aucun composant ne voit jamais une `FetchError` d'ofetch ni une réponse
 * Laravel brute : ils reçoivent toujours une `ApiError`, dont le `kind` suffit
 * à décider quoi afficher.
 */
export type ApiErrorKind =
  /** Impossible de joindre le serveur (DNS, coupure, CORS). */
  | 'network'
  /** Le serveur n'a pas répondu dans le délai imparti. */
  | 'timeout'
  /** 401 — session absente ou expirée. */
  | 'unauthorized'
  /** 403 — accès refusé (le back-office restreint l'accès par IP en recette). */
  | 'forbidden'
  /** 404 — ressource inexistante. */
  | 'notFound'
  /** 422 — validation refusée par Laravel. */
  | 'validation'
  /** 5xx. */
  | 'server'
  /** Tout le reste. */
  | 'unknown'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number
  /** Erreurs de validation Laravel, indexées par champ. */
  readonly fieldErrors: Record<string, string[]>
  readonly path: string

  constructor(options: {
    kind: ApiErrorKind
    status: number
    message: string
    path: string
    fieldErrors?: Record<string, string[]>
  }) {
    super(options.message)
    this.name = 'ApiError'
    this.kind = options.kind
    this.status = options.status
    this.path = options.path
    this.fieldErrors = options.fieldErrors ?? {}
  }

  /** Vrai si réessayer a une chance d'aboutir. */
  get retryable(): boolean {
    return this.kind === 'network' || this.kind === 'timeout' || this.kind === 'server'
  }
}

function kindFromStatus(status: number): ApiErrorKind {
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'notFound'
  if (status === 422) return 'validation'
  if (status >= 500) return 'server'
  if (status === 0) return 'network'
  return 'unknown'
}

/** Extrait le message le plus utile d'une réponse d'erreur Laravel. */
function extractMessage(payload: unknown, fallback: string): string {
  if (typeof payload !== 'object' || payload === null) return fallback
  const body = payload as Record<string, unknown>

  const errors = body.errors
  if (typeof errors === 'object' && errors !== null) {
    const first = Object.values(errors as Record<string, unknown>)[0]
    if (Array.isArray(first) && typeof first[0] === 'string') return first[0]
  }

  if (typeof body.message === 'string' && body.message !== '') return body.message
  if (typeof body.error === 'string' && body.error !== '') return body.error
  return fallback
}

function extractFieldErrors(payload: unknown): Record<string, string[]> {
  if (typeof payload !== 'object' || payload === null) return {}
  const errors = (payload as Record<string, unknown>).errors
  if (typeof errors !== 'object' || errors === null) return {}

  const result: Record<string, string[]> = {}
  for (const [field, messages] of Object.entries(errors as Record<string, unknown>)) {
    if (Array.isArray(messages)) result[field] = messages.filter((m): m is string => typeof m === 'string')
  }
  return result
}

/** Convertit n'importe quelle exception réseau en `ApiError`. */
export function toApiError(error: unknown, path: string): ApiError {
  if (error instanceof ApiError) return error

  const candidate = error as { status?: number; statusCode?: number; data?: unknown; message?: string; name?: string; cause?: unknown }
  const status = candidate?.status ?? candidate?.statusCode ?? 0

  // `AbortError` est ce que remonte ofetch quand le `timeout` se déclenche.
  const aborted = candidate?.name === 'AbortError' || (candidate?.cause as { name?: string } | undefined)?.name === 'TimeoutError'
  const kind: ApiErrorKind = aborted ? 'timeout' : kindFromStatus(status)

  return new ApiError({
    kind,
    status,
    path,
    message: extractMessage(candidate?.data, candidate?.message ?? 'Erreur réseau'),
    fieldErrors: extractFieldErrors(candidate?.data),
  })
}
