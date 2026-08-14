import type { School } from '~~/app/core/contracts'

/**
 * Fiche école complète.
 *
 * Les collisions de slug ont déjà été arbitrées par l'adapter (première entrée
 * par `id` croissant) : la sélection est donc stable d'un appel à l'autre.
 *
 * DEMAIN : relais de `/schools/{slug}`.
 */
export default defineEventHandler(async (event): Promise<School> => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const { schools } = await getSnapshot(event)

  const matches = schools.filter((school) => school.slug === slug)
  if (matches.length === 0) {
    throw createError({ statusCode: 404, statusMessage: `École « ${slug} » introuvable` })
  }

  // Tri par `id` : même arbitrage que `dedupeBySlug`, donc même résultat que
  // dans la liste de la destination.
  const school = [...matches].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))[0]!

  setResponseHeader(event, 'cache-control', 'public, max-age=60, stale-while-revalidate=300')
  return school
})
