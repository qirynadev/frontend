import { toFormations } from '~~/app/core/adapters'
import type { SchoolFormation } from '~~/app/core/contracts'

/**
 * Formations d'une école, à l'unité — `GET /schools/{id}/formations`
 * (directives-backend §12, ajouté côté back-office le 2026-08-31) : plus
 * besoin de charger `/all-data` (4,4 Mo) pour l'onglet « Formations » de la
 * fiche école. `id` est l'UUID de l'école (`School.id`), pas son slug — la
 * page appelle `schoolRepo.bySlug()` d'abord pour l'obtenir.
 *
 * **Mis en cache depuis le 2026-09-11** (`cachedSchoolFormations`, même
 * politique que le dump) : sans cache, chaque ouverture de fiche attendait
 * l'API — environ 0,5 s mesurées depuis la recette — avant de pouvoir
 * rendre la page. C'était le seul appel non mis en cache du rendu d'une fiche.
 *
 * Une école inconnue renvoie une liste vide, comme avant : l'onglet se vide,
 * la fiche reste affichée.
 */
export default defineEventHandler(async (event): Promise<SchoolFormation[]> => {
  const id = getRouterParam(event, 'id') ?? ''
  if (!/^[0-9a-f-]{36}$/i.test(id)) return []

  try {
    const raw = await cachedSchoolFormations(event, readLocale(event), id)
    return raw === null ? [] : toFormations(raw)
  }
  catch (error) {
    rethrowApiError(error)
  }
})
