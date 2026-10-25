import type { DestinationSummary } from '~~/app/core/contracts'

/** Liste des destinations, sans leurs écoles. */
export default defineEventHandler(async (event): Promise<DestinationSummary[]> => {
  const { catalog } = await getSnapshot(event)
  setResponseHeader(event, 'cache-control', PUBLIC_CONTENT_CACHE)
  return catalog.destinations
})
