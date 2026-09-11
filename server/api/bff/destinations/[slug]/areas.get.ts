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
 * `include_mba=1` : cette route exclut MBA par défaut côté back-office (pensé
 * pour le parcours desktop, qui l'affiche ailleurs) — sur demande explicite
 * (2026-09-04), notre parcours mobile l'affiche au même titre que les autres
 * domaines, s'il est présent pour la destination.
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
 *
 * **Un domaine sans école n'est pas renvoyé** (demande du responsable,
 * 2026-09-12) : le Royaume-Uni proposait « MBA — Aucune école », une carte
 * qui ouvre une liste vide. Le filtre est ici, pas dans les écrans, pour
 * valoir aussi bien pour la grille de la fiche pays que pour les puces de
 * filtre de la liste des écoles. Un lien existant vers un domaine ainsi
 * masqué (`?domaine=mba`) n'est pas une impasse : la liste s'affiche sans
 * filtre, comme pour un domaine inconnu.
 *
 * Le repli en cas d'erreur garde le total (faux) du back-office : une
 * panne ponctuelle ne fait pas disparaître un domaine qui a des écoles.
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
    areas = toAreaOfStudySummaryList(await client.request(`/areas-of-studies/by-country/${encodeURIComponent(destination.id)}`, { query: { include_mba: 1 } }))
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

  setResponseHeader(event, 'cache-control', 'public, max-age=60, stale-while-revalidate=300')
  return areas
    .map((area, index) => ({ ...area, schoolCount: counts[index]! }))
    .filter((area) => area.schoolCount > 0)
})
