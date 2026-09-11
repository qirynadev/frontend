import type { Branding } from '~/core/contracts'
import { catalogRepo } from '~/core/repositories'

const EMPTY: Branding = { logoLight: null, favicon: null }

/**
 * Logo clair et favicon administrés (directives-backend §25).
 *
 * Résolu une fois par `app.vue`, avant le rendu : la clé `branding` est
 * ensuite relue par `AppLogo` (`useNuxtData`) sans nouvel appel. Une panne
 * n'est jamais bloquante — l'app garde ses fichiers statiques.
 */
export function useBranding() {
  return useAsyncData<Branding>('branding', () => catalogRepo.branding().catch(() => EMPTY), {
    default: () => EMPTY,
  })
}

/** Type MIME d'une icône d'après son extension — sans lui, certains navigateurs ignorent un favicon WebP. */
export function iconMimeType(url: string): string | undefined {
  const extension = url.split(/[?#]/)[0]?.split('.').pop()?.toLowerCase()
  return {
    ico: 'image/x-icon',
    png: 'image/png',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
  }[extension ?? '']
}
