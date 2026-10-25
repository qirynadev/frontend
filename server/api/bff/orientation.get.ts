import type { Orientation } from '~~/app/core/contracts'

/** Offre d'orientation — `/profilage` côté back-office. */
export default defineEventHandler(async (event): Promise<Orientation> => {
  const { orientation } = await getSnapshot(event)
  if (!orientation) {
    throw createError({ statusCode: 404, statusMessage: 'Offre d’orientation indisponible' })
  }

  setResponseHeader(event, 'cache-control', PUBLIC_CONTENT_CACHE)
  return orientation
})
