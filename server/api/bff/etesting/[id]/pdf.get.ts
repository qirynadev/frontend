import type { OrientationEvaluationPdf } from '~~/app/core/contracts'
import { toOrientationEvaluationPdf } from '~~/app/core/adapters'

/** URL des PDF d'une évaluation terminée — pas portées par la liste (`has_pdf` seul). */
export default defineEventHandler(async (event): Promise<OrientationEvaluationPdf> => {
  const client = authClient(event)
  const id = getRouterParam(event, 'id') ?? ''

  try {
    return toOrientationEvaluationPdf(await client.request(`/etesting/evaluations/${encodeURIComponent(id)}/pdf`))
  }
  catch (error) {
    rethrowApiError(error)
  }
})
