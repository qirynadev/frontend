import type { AreaOfStudySummary } from '~~/app/core/contracts'
import { toAreaOfStudySummaryList } from '~~/app/core/adapters'

/**
 * Domaines d'étude d'une destination.
 *
 * Absent de `/all-data` (`SchoolFileResource.areas_of_studies` n'y porte que
 * `{id, title}`, sans `slug` ni icône) : un appel dédié à `/areas-of-studies/
 * by-country/{schoolFileId}` — le `slug` de la destination suffit à
 * retrouver son identifiant dans l'instantané déjà en cache.
 *
 * `nbr_schools` de cette réponse est **faux** pour notre usage : back-office,
 * `AreaResource::toArray` le calcule avec `$this->schools->count()` — toutes
 * destinations et tous statuts confondus, malgré le nom de la route
 * (« by-country »). Le total du paginateur de `GET /schools/{countryId}/
 * {areaId}` est, lui, correctement filtré par destination **et** par école
 * active (`SchoolAction::getByCountryArea` : `where('status', true)->where
 * ('lc_country_id', $countryId)`) — un appel par domaine pour le récupérer,
 * en parallèle. Confirmé par le responsable (2026-08-17) : c'est ce nombre-là
 * qu'il faut afficher.
 */
export default defineEventHandler(async (event): Promise<AreaOfStudySummary[]> => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const { destinations } = await getSnapshot(event)
  const destination = destinations.find((item) => item.slug === slug)
  if (!destination || destination.country.id === null) return []

  const countryId = destination.country.id
  const client = publicClient(event)

  let areas: AreaOfStudySummary[]
  try {
    areas = toAreaOfStudySummaryList(await client.request(`/areas-of-studies/by-country/${encodeURIComponent(destination.id)}`))
  }
  catch (error) {
    rethrowApiError(error)
  }

  const counts = await Promise.all(
    areas.map((area) =>
      client
        .request<Record<string, unknown>>(`/schools/${encodeURIComponent(countryId)}/${encodeURIComponent(area.id)}`)
        // Une erreur ponctuelle ne doit pas casser toute la section domaines :
        // repli sur le total (faux, mais pas rien) déjà en main.
        .then((raw) => Number(raw.total ?? area.schoolCount))
        .catch(() => area.schoolCount),
    ),
  )

  return areas.map((area, index) => ({ ...area, schoolCount: counts[index]! }))
})
