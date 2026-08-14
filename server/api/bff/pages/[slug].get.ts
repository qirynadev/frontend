import type { Page } from '~~/app/core/contracts'

/**
 * Page éditoriale (CGU, cookies, FAQ, confidentialité).
 *
 * `/all-data` transporte le texte intégral des quatre pages (24,8 Ko) à chaque
 * appel ; ici le client ne reçoit que celle qu'il affiche.
 *
 * DEMAIN : relais de `/pages/{slug}`.
 */
export default defineEventHandler(async (event): Promise<Page> => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const { pages } = await getSnapshot(event)

  const page = pages.find((item) => item.slug === slug)
  if (!page) {
    throw createError({ statusCode: 404, statusMessage: `Page « ${slug} » introuvable` })
  }

  setResponseHeader(event, 'cache-control', 'public, max-age=300, stale-while-revalidate=3600')
  return page
})
