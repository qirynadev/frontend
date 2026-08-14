import type { OfferPage } from '~~/app/core/contracts'

/**
 * Page d'offre unifiée : un domaine d'étude (un palier) ou une langue (trois).
 *
 * Les langues sont interrogées en premier : elles portent les vrais paliers de
 * `formule.html`, et aucun slug n'est partagé entre les deux familles.
 */
export default defineEventHandler(async (event): Promise<OfferPage> => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const { offerPages } = await getSnapshot(event)

  const offer = offerPages.find((item) => item.slug === slug)
  if (!offer) {
    throw createError({ statusCode: 404, statusMessage: `Offre « ${slug} » introuvable` })
  }

  setResponseHeader(event, 'cache-control', 'public, max-age=60, stale-while-revalidate=300')
  return offer
})
