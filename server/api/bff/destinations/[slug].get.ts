import type { Destination } from '~~/app/core/contracts'

/**
 * Destination complète, écoles en version **résumé**.
 *
 * DEMAIN : cette route deviendra un simple relais de `/destinations/{slug}`.
 */
export default defineEventHandler(async (event): Promise<Destination> => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const { destinations } = await getSnapshot(event)

  const destination = destinations.find((item) => item.slug === slug)
  if (!destination) {
    throw createError({ statusCode: 404, statusMessage: `Destination « ${slug} » introuvable` })
  }

  setResponseHeader(event, 'cache-control', PUBLIC_CONTENT_CACHE)
  return destination
})
