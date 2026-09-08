import type { OrientationEvaluation } from '~~/app/core/contracts'
import { toOrientationEvaluation } from '~~/app/core/adapters'

/**
 * Force la resynchronisation d'une évaluation depuis PT-TESTS — filet de
 * sécurité si le webhook (`POST /etesting/callback`) n'est jamais arrivé.
 * Pas encore relié à un élément d'interface (demande du responsable,
 * 2026-09-01) : un job planifié côté back-office (`app:refresh-etesting-
 * results`) couvre déjà le cas automatiquement, ce endpoint reste disponible
 * pour un test manuel en attendant une validation produit.
 */
export default defineEventHandler(async (event): Promise<OrientationEvaluation | null> => {
  const client = authClient(event)
  const id = getRouterParam(event, 'id') ?? ''

  try {
    const raw = await client.request(`/etesting/evaluations/${encodeURIComponent(id)}/refresh`, { method: 'POST' })
    return toOrientationEvaluation(raw)
  }
  catch (error) {
    rethrowApiError(error)
  }
})
