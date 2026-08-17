import type { LivingDestination } from '~~/app/core/contracts'

/** Destinations logement disponibles — uniquement celles dotées de formules réelles côté back-office. */
export default defineEventHandler(async (event): Promise<LivingDestination[]> => {
  const { livings } = await getSnapshot(event)
  setResponseHeader(event, 'cache-control', 'public, max-age=60, stale-while-revalidate=300')
  return livings
})
