import type { OfferSummary } from '~~/app/core/contracts'

export default defineEventHandler(async (event): Promise<OfferSummary[]> => {
  const { catalog } = await getSnapshot(event)
  setResponseHeader(event, 'cache-control', PUBLIC_CONTENT_CACHE)
  return catalog.offers
})
