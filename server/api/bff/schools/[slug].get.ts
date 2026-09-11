import { toSchool } from '~~/app/core/adapters'
import type { School } from '~~/app/core/contracts'

/**
 * Fiche école complète — `GET /schools/by-slug/{slug}` (directives-backend
 * §21, livré côté back-office le 2026-09-05), plus `/all-data`.
 *
 * La réponse a exactement la forme d'une entrée de
 * `schoolSheets[*].schools[*]` du dump (vérifié champ par champ le
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
 * **Repli** : si l'API est injoignable, la fiche est reconstruite depuis le
 * dump en cache, comme avant — une panne de cette route ne fait pas tomber
 * une page que le dump sait encore servir. Un 404, lui, est une réponse :
 * pas de repli.
 */
export default defineEventHandler(async (event): Promise<School> => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const destination = getQuery(event).destination
  const destinationSlug = typeof destination === 'string' ? destination : ''

  if (!isPlausibleSlug(slug)) notFound(slug)

  let school: School | null
  try {
    const raw = await cachedSchoolBySlug(event, readLocale(event), slug)
    school = raw === null ? null : toSchool(raw, destinationSlug, mediaBase(event))
  }
  catch (error) {
    console.warn(`[bff] /schools/by-slug/${slug} indisponible, repli sur le dump`, error)
    school = await fromSnapshot(event, slug)
  }

  if (school === null || school.id === '') notFound(slug)

  setResponseHeader(event, 'cache-control', 'public, max-age=60, stale-while-revalidate=300')
  return school
})

function notFound(slug: string): never {
  throw createError({ statusCode: 404, statusMessage: `École « ${slug} » introuvable` })
}

/** Ancienne source : même arbitrage des doublons que `dedupeBySlug` (plus petit `id`). */
async function fromSnapshot(event: Parameters<typeof getSnapshot>[0], slug: string): Promise<School | null> {
  const { schools } = await getSnapshot(event)
  const matches = schools.filter((entry) => entry.slug === slug)
  return [...matches].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))[0] ?? null
}
