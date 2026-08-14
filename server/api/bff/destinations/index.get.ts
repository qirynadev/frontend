import type { DestinationSummary } from '~~/app/core/contracts'

/** Liste des destinations, sans leurs écoles. */
export default defineEventHandler(async (event): Promise<DestinationSummary[]> => {
  const { catalog } = await getSnapshot(event)
  setResponseHeader(event, 'cache-control', 'public, max-age=60, stale-while-revalidate=300')
  return catalog.destinations
})
