import type { OrientationEvaluation } from '~~/app/core/contracts'
import { toOrientationEvaluationList } from '~~/app/core/adapters'

/** Évaluations d'orientation de l'utilisateur connecté. */
export default defineEventHandler(async (event): Promise<OrientationEvaluation[]> => {
  const client = authClient(event)

  try {
    return toOrientationEvaluationList(await client.request('/etesting/evaluations'))
  }
  catch (error) {
    rethrowApiError(error)
  }
})
