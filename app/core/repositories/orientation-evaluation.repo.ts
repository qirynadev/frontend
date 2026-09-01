import type { OrientationEvaluation } from '../contracts'
import { bffFetch } from '../http/client'

export const orientationEvaluationRepo = {
  list(locale?: string): Promise<OrientationEvaluation[]> {
    return bffFetch<OrientationEvaluation[]>('/etesting/evaluations', { locale })
  },

  // Pas de méthode pour le PDF : `/api/bff/etesting/{id}/pdf` sert directement
  // les octets (`Content-Type: application/pdf`), ouvert par `window.open()`
  // — voir `mon-projet/orientation.vue`. Rien à récupérer en JS avant.

  /**
   * Force la resynchronisation d'une évaluation depuis PT-TESTS — filet de
   * sécurité si le webhook ne nous est jamais arrivé. Pas encore relié à un
   * élément d'interface (demande du responsable, 2026-09-01) : le job
   * planifié `app:refresh-etesting-results` côté back-office couvre déjà le
   * cas automatiquement, cette méthode reste disponible pour un test manuel.
   */
  refresh(evaluationId: string, locale?: string): Promise<OrientationEvaluation | null> {
    return bffFetch<OrientationEvaluation | null>(`/etesting/${encodeURIComponent(evaluationId)}/refresh`, { method: 'POST', locale })
  },
}
