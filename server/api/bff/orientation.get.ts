import type { Orientation } from '~~/app/core/contracts'

/** Offre d'orientation — `/profilage` côté back-office. */
export default defineEventHandler(async (event): Promise<Orientation> => {
  const { orientation } = await getSnapshot(event)
  if (!orientation) {
    throw createError({ statusCode: 404, statusMessage: 'Offre d’orientation indisponible' })
  }

  setResponseHeader(event, 'cache-control', 'public, max-age=300, stale-while-revalidate=3600')
  return orientation
})
