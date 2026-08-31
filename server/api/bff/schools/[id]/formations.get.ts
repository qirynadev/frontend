import { toFormations } from '~~/app/core/adapters'
import type { SchoolFormation } from '~~/app/core/contracts'

/**
 * Formations d'une école, à l'unité — `GET /schools/{id}/formations`
 * (directives-backend §12, ajouté côté back-office le 2026-08-31) : plus
 * besoin de charger `/all-data` (4,4 Mo) pour l'onglet « Formations » de la
 * fiche école. `id` est l'UUID de l'école (`School.id`), pas son slug — la
 * page appelle `schoolRepo.bySlug()` d'abord pour l'obtenir.
 */
export default defineEventHandler(async (event): Promise<SchoolFormation[]> => {
  const id = getRouterParam(event, 'id') ?? ''
  const client = publicClient(event)

  try {
    const raw = await client.request(`/schools/${encodeURIComponent(id)}/formations`)
    return toFormations(raw)
  }
  catch (error) {
    rethrowApiError(error)
  }
})
