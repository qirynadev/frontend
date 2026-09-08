import type { H3Event } from 'h3'

/**
 * Racine des fichiers publics du back-office (`Storage::disk('public')`),
 * dérivée de `apiBaseUrl` (`.../api` → `.../storage/`) — le même hôte sert
 * l'API et les fichiers, seul le chemin change.
 */
export function storageBaseUrl(event: H3Event): string {
  const config = useRuntimeConfig(event)
  return `${config.apiBaseUrl.replace(/\/api\/?$/, '')}/storage/`
}
