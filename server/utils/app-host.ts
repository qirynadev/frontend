/**
 * Domaine de l'application mobile (2026-11-04) : un alias de qiryna.com, même serveur
 * et même déploiement. L'application n'y appelle que le BFF, sans Turnstile, qu'elle
 * ne peut pas passer de façon fiable, ni page 403. Les limites de fréquence restent
 * actives, et les pages du site n'y sont pas servies (`server/middleware/app-host.ts`).
 *
 * Écrire ce domaine dans une requête revient à l'appeler directement : l'exception ne
 * protège donc pas contre un robot. Les autres domaines gardent leur contrôle.
 */
const APP_API_HOSTS = new Set(['mobile.qiryna.com'])

export const SITE_ORIGIN = 'https://qiryna.com'

export function isAppApiHost(host: string): boolean {
  return APP_API_HOSTS.has(host.toLowerCase().replace(/:\d+$/, ''))
}

/** Le BFF seulement : `..` pourrait mener hors de `/api/bff/` selon le relais. */
export function isAppApiPath(path: string): boolean {
  return path.startsWith('/api/bff/') && !path.includes('..')
}
