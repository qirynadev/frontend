/**
 * Amorçage de l'application : menu, réglages, accueil, résumés.
 *
 * ~30 Ko contre les 4,4 Mo de `/all-data`. C'est la raison d'être du BFF.
 */
export default defineEventHandler(async (event) => {
  const { catalog } = await getSnapshot(event)
  setResponseHeader(event, 'cache-control', 'public, max-age=60, stale-while-revalidate=300')
  return catalog
})
