import type { MbaRegionSchools } from '~~/app/core/contracts'
import { toMbaRegionSchools } from '~~/app/core/adapters'

/**
 * Écoles MBA d'une zone (sous-menu « MBA » du desktop : Afrique, Amériques,
 * Asie, Europe).
 *
 * MBA se comporte comme un domaine d'études dont les écoles sont regroupées
 * par zone plutôt que par pays (demande du responsable, 2026-09-28) : la liste
 * des écoles existante l'affiche, domaine MBA sélectionné
 * (`pages/destinations/[slug]/ecoles/index.vue`, mode « zone »).
 *
 * - `GET /mba/schools?region=` : écoles actives ayant le domaine MBA, dont le
 *   pays appartient à la zone ; 4 par page, ordre MD5 fixe comme
 *   `GET /schools/{countryId}/{areaId}`.
 * - `GET /mba/area` : le domaine MBA, pour la puce sélectionnée. Son échec ne
 *   bloque pas la liste, qui s'affiche alors sans puce.
 *
 * Une zone absente du menu MBA administré répond 404.
 */
export default defineEventHandler(async (event): Promise<MbaRegionSchools> => {
  const region = getRouterParam(event, 'region') ?? ''
  const page = Math.max(1, Number(getQuery(event).page ?? 1) || 1)

  const { catalog, destinations } = await getSnapshot(event)
  const entry = catalog.menu.mba.entries.find((item) => item.slug === region)
  if (!entry) {
    throw createError({ statusCode: 404, statusMessage: 'Zone MBA inconnue' })
  }

  const client = publicClient(event)

  try {
    const [raw, rawArea] = await Promise.all([
      client.request('/mba/schools', { query: { region, page } }),
      client.request('/mba/area').catch(() => null),
    ])

    setResponseHeader(event, 'cache-control', 'public, max-age=60, stale-while-revalidate=300')
    return toMbaRegionSchools(
      raw,
      rawArea,
      { slug: entry.slug, title: entry.title },
      destinations,
      page,
      useRuntimeConfig(event).apiBaseUrl,
    )
  }
  catch (error) {
    rethrowApiError(error)
  }
})
