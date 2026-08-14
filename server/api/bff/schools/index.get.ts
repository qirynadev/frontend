import type { SchoolSummary } from '~~/app/core/contracts'

/**
 * Écoles en version résumé, filtrables et paginées côté serveur.
 *
 * La pagination est faite ici pour que le navigateur ne reçoive jamais les
 * 570 fiches d'un coup — et surtout jamais leur présentation HTML.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const destination = typeof query.destination === 'string' ? query.destination : ''
  const search = typeof query.search === 'string' ? query.search.trim().toLowerCase() : ''
  const page = Math.max(1, Number(query.page ?? 1) || 1)
  const perPage = Math.min(60, Math.max(1, Number(query.perPage ?? 20) || 20))

  const { schools } = await getSnapshot(event)

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
