import type { AreaOfStudySummary } from '~~/app/core/contracts'
import { toAreaOfStudySummaryList } from '~~/app/core/adapters'

/**
 * Domaines d'étude d'une destination.
 *
 * Absent de `/all-data` (`SchoolFileResource.areas_of_studies` n'y porte que
 * `{id, title}`, sans `slug` ni icône) : un appel dédié à `/areas-of-studies/
 * by-country/{schoolFileId}` — le `slug` de la destination suffit à
 * retrouver son identifiant dans l'instantané déjà en cache.
 */
export default defineEventHandler(async (event): Promise<AreaOfStudySummary[]> => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const { destinations } = await getSnapshot(event)
  const destination = destinations.find((item) => item.slug === slug)
  if (!destination) return []

  const client = publicClient(event)

  try {
    return toAreaOfStudySummaryList(await client.request(`/areas-of-studies/by-country/${encodeURIComponent(destination.id)}`))
  }
  catch (error) {
    rethrowApiError(error)
  }
})
