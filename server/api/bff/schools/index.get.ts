import type { SchoolSummary } from '~~/app/core/contracts'
import { toSchoolSummary } from '~~/app/core/adapters'

/**
 * Écoles en version résumé, filtrables et paginées côté serveur.
 *
 * La pagination est faite ici pour que le navigateur ne reçoive jamais les
 * 570 fiches d'un coup — et surtout jamais leur présentation HTML.
 *
 * `area` bascule sur un appel **en direct** (`GET /schools/{countryId}/
 * {areaId}`) plutôt que le filtrage en mémoire sur `/all-data` ci-dessous :
 * `SchoolResource` (celle qui peuple `/all-data`) ne porte aucun champ
 * domaine, malgré la relation `School::areaOfStudy` chargée côté modèle —
 * seul cet endpoint dédié filtre réellement par domaine.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const destination = typeof query.destination === 'string' ? query.destination : ''
  const area = typeof query.area === 'string' ? query.area : ''
  const search = typeof query.search === 'string' ? query.search.trim().toLowerCase() : ''
  const page = Math.max(1, Number(query.page ?? 1) || 1)
  const perPage = Math.min(60, Math.max(1, Number(query.perPage ?? 20) || 20))

  const { schools, destinations } = await getSnapshot(event)

  if (destination !== '' && area !== '') {
    const target = destinations.find((item) => item.slug === destination)
    if (!target || target.country.id === null) {
      return { items: [], page, perPage: 5, total: 0, totalPages: 1 }
    }

    const client = publicClient(event)
    const flagBase = useRuntimeConfig(event).apiBaseUrl

    try {
      const raw = await client.request<Record<string, unknown>>(
        `/schools/${encodeURIComponent(target.country.id)}/${encodeURIComponent(area)}`,
        { query: { page } },
      )
      const items = (Array.isArray(raw.data) ? raw.data : []).map((school) => toSchoolSummary(school, destination, flagBase))

      setResponseHeader(event, 'cache-control', 'public, max-age=60, stale-while-revalidate=300')
      return {
        items,
        page: Number(raw.current_page ?? page),
        perPage: Number(raw.per_page ?? 5),
        total: Number(raw.total ?? items.length),
        totalPages: Number(raw.last_page ?? 1),
      }
    }
    catch (error) {
      rethrowApiError(error)
    }
  }

  const filtered = schools.filter((school) => {
    if (destination !== '' && school.destinationSlug !== destination) return false
    if (search === '') return true
    return school.title.toLowerCase().includes(search) || school.city.toLowerCase().includes(search)
  })

  const start = (page - 1) * perPage
  const items: SchoolSummary[] = filtered.slice(start, start + perPage).map((school) => ({
    id: school.id,
    slug: school.slug,
    title: school.title,
    city: school.city,
    logo: school.logo,
    image: school.image,
    country: school.country,
    destinationSlug: school.destinationSlug,
    formationCount: school.formationCount,
  }))

  setResponseHeader(event, 'cache-control', 'public, max-age=60, stale-while-revalidate=300')
  return {
    items,
    page,
    perPage,
    total: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / perPage)),
  }
})
