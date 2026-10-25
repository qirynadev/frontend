import { toSchool } from '~~/app/core/adapters'
import type { School } from '~~/app/core/contracts'

/**
 * Fiche école complète — `GET /schools/by-slug/{slug}` (directives-backend
 * §21, livré côté back-office le 2026-09-05), plus `/all-data`.
 *
 * La réponse a exactement la forme d'une entrée de
 * `schoolSheets[*].schools[*]` du dump complet (vérifié champ par champ le
 * 2026-09-11) : le même `toSchool` s'applique sans adaptation.
 *
 * **Doublons de slug** : une école enseignée dans deux domaines a deux fiches
 * de même titre (une fiche par domaine, décision du 2026-10-14), et deux
 * écoles homonymes peuvent exister dans deux pays. `?destination=` (slug du
 * pays) et `?domaine=` (slug du titre du domaine) sont transmis à l'API, qui
 * renvoie la fiche correspondante (plan IA, lot 7). Sans eux, ou s'ils ne
 * correspondent à rien, le back-office retient l'école active de plus petit
 * `id`, exactement comme `dedupeBySlug` pour une liste sans domaine : la fiche
 * ouverte depuis la liste est bien celle de la liste.
 *
 * `destinationSlug` n'existe pas dans la réponse (l'école ne connaît que son
 * `lc_country_id`) : la page le transmet en `?destination=`, elle le tient de
 * son URL.
 *
 * **Pas de repli sur le dump** (retiré le 2026-10-04) : le catalogue charge
 * désormais `/all-data?lite=1`, qui ne porte plus ni présentation, ni points
 * forts, ni formations. Une fiche reconstruite depuis là s'afficherait vide
 * (« pas encore de contenu publié ») pendant une panne, ce qui est faux : la
 * panne remonte, et la page affiche son état d'erreur avec « Réessayer ».
 */
export default defineEventHandler(async (event): Promise<School> => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const query = getQuery(event)
  const destinationSlug = typeof query.destination === 'string' && isPlausibleSlug(query.destination) ? query.destination : ''
  // Slug du titre du domaine (`?domaine=mba`). Une valeur fantaisiste est ignorée
  // plutôt que transmise : elle multiplierait les entrées de cache pour rien.
  const domaine = typeof query.domaine === 'string' && isPlausibleSlug(query.domaine) ? query.domaine : ''

  if (!isPlausibleSlug(slug)) notFound(slug)

  let raw: Record<string, unknown> | null
  try {
    raw = await cachedSchoolBySlug(event, readLocale(event), slug, destinationSlug, domaine)
  }
  catch (error) {
    rethrowApiError(error)
  }

  const school = raw === null ? null : toSchool(raw, destinationSlug, mediaBase(event))
  if (school === null || school.id === '') notFound(slug)

  setResponseHeader(event, 'cache-control', PUBLIC_CONTENT_CACHE)
  return school
})

function notFound(slug: string): never {
  throw createError({ statusCode: 404, statusMessage: `École « ${slug} » introuvable` })
}
