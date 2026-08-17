import type { OrientationEvaluation, OrientationEvaluationPdf } from '../contracts'
import { bffFetch } from '../http/client'

export const orientationEvaluationRepo = {
  list(locale?: string): Promise<OrientationEvaluation[]> {
    return bffFetch<OrientationEvaluation[]>('/etesting/evaluations', { locale })
  },

  /** URL des PDF d'une évaluation terminée — appel séparé, `has_pdf` seul ne les porte pas. */
  pdf(evaluationId: string, locale?: string): Promise<OrientationEvaluationPdf> {
    return bffFetch<OrientationEvaluationPdf>(`/etesting/${encodeURIComponent(evaluationId)}/pdf`, { locale })
  },
}
