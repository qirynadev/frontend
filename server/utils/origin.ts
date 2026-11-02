/** Application mobile : Capacitor sert ses pages sous ces origines fixes (iOS, Android). */
const NATIVE_APP_ORIGINS = ['capacitor://localhost', 'https://localhost', 'http://localhost', 'ionic://localhost']

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export interface WriteRequest {
  method: string
  path: string
  origin?: string | null
  referer?: string | null
  /** Hôtes légitimes : en-tête `Host`, `X-Forwarded-Host`, adresse publique du site. */
  hosts: Array<string | null | undefined>
  /** `NUXT_ALLOWED_ORIGINS` : origines supplémentaires, séparées par des virgules. */
  extraOrigins?: string
}

function hostOf(value: string): string | null {
  try {
    return new URL(value.includes('://') ? value : `https://${value}`).host.toLowerCase()
  }
  catch {
    return null
  }
}

/**
 * Sans `Origin` ni `Referer`, l'appel ne vient pas d'une page de navigateur : un autre
 * site ne peut donc pas s'en servir à l'insu d'un visiteur connecté, et le signal signé
 * du back-office en fait partie. On ne contrôle que les écritures sur le BFF et le code
 * d'accès au site.
 */
export function isAllowedWrite(request: WriteRequest): boolean {
  if (SAFE_METHODS.has(request.method.toUpperCase())) return true
  if (!request.path.startsWith('/api/') && request.path !== '/site-access') return true

  const source = request.origin && request.origin !== 'null' ? request.origin : request.referer
  // `Origin: null` (page en bac à sable, redirection) sans `Referer` : refusé.
  if (!source) return request.origin !== 'null'

  const extras = (request.extraOrigins ?? '').split(',').map((entry) => entry.trim().toLowerCase()).filter(Boolean)
  if ([...NATIVE_APP_ORIGINS, ...extras].includes(source.replace(/\/$/, '').toLowerCase())) return true

  const sourceHost = hostOf(source)
  if (sourceHost === null) return false

  return request.hosts.some((host) => host && hostOf(host) === sourceHost)
}
