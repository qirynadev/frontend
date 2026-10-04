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
 * **Doublons de slug** : 21 écoles sont saisies deux fois. Le back-office
 * retient l'école active de plus petit `id` (`SchoolAction::getBySlug`,
 * corrigé le 2026-09-11), exactement comme `dedupeBySlug` pour la liste : la
 * fiche ouverte depuis la liste est bien celle de la liste.
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
  const destination = getQuery(event).destination
  const destinationSlug = typeof destination === 'string' ? destination : ''

  if (!isPlausibleSlug(slug)) notFound(slug)

  let raw: Record<string, unknown> | null
  try {
    raw = await cachedSchoolBySlug(event, readLocale(event), slug)
  }
  catch (error) {
    rethrowApiError(error)
  }

  const school = raw === null ? null : toSchool(raw, destinationSlug, mediaBase(event))
  if (school === null || school.id === '') notFound(slug)

  setResponseHeader(event, 'cache-control', 'public, max-age=60, stale-while-revalidate=300')
  return school
})

function notFound(slug: string): never {
  throw createError({ statusCode: 404, statusMessage: `École « ${slug} » introuvable` })
}
