import type { LivingDestination } from '~~/app/core/contracts'

/** Destinations logement disponibles — uniquement celles dotées de formules réelles côté back-office. */
export default defineEventHandler(async (event): Promise<LivingDestination[]> => {
  const { livings } = await getSnapshot(event)
  setResponseHeader(event, 'cache-control', PUBLIC_CONTENT_CACHE)
  return livings
})
