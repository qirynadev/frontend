import type { Article } from '~~/app/core/contracts'

/**
 * Actualités de l'accueil.
 *
 * L'endpoint amont répond bien mais renvoie un tableau vide en recette :
 * l'accueil doit donc gérer l'état vide, pas supposer du contenu.
 */
export default defineEventHandler(async (event): Promise<Article[]> => {
  const { articles } = await getSnapshot(event)
  setResponseHeader(event, 'cache-control', 'public, max-age=120, stale-while-revalidate=600')
  return articles
})
