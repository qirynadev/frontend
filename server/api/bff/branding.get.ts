import type { Branding } from '~~/app/core/contracts'

/**
 * Logo clair et favicon administrés (directives-backend §25).
 *
 * Route à part plutôt que `/catalog` : toutes les pages affichent le logo,
 * mais toutes ne chargent pas le catalogue (menu, accueil, résumés, ~30 Ko).
 * Deux URL suffisent, et `app.vue` les résout avant le rendu serveur — le
 * logo et le favicon sont donc les mêmes au rendu et à l'hydratation.
 */
export default defineEventHandler(async (event): Promise<Branding> => {
  const { catalog } = await getSnapshot(event)
  setResponseHeader(event, 'cache-control', 'public, max-age=60, stale-while-revalidate=300')
  return { logoLight: catalog.settings.logoLight, favicon: catalog.settings.favicon }
})
