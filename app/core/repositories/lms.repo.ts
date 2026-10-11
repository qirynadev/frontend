import { bffFetch } from '../http/client'

/** `placement` : test de niveau d'une commande. `courses` : tableau de bord de l'apprenant. */
export type LmsTarget = 'placement' | 'courses'

/**
 * Entrée dans le LMS (plateforme d'apprentissage, application à part).
 *
 * L'adresse rendue ne vaut que 60 secondes et une seule fois : l'appeler au
 * clic, puis y envoyer le navigateur aussitôt. Voir `useLmsEntry`.
 */
export const lmsRepo = {
  entryUrl(input: { orderId?: string; target?: LmsTarget }, locale?: string): Promise<{ url: string }> {
    return bffFetch<{ url: string }>('/lms/sso', { method: 'POST', body: input, locale, timeoutMs: 30_000 })
  },
}
