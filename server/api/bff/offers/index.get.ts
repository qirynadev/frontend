import type { OfferSummary } from '~~/app/core/contracts'

export default defineEventHandler(async (event): Promise<OfferSummary[]> => {
  const { catalog } = await getSnapshot(event)
  setResponseHeader(event, 'cache-control', 'public, max-age=60, stale-while-revalidate=300')
  return catalog.offers
})
