import { toDomainOfferPage } from '~~/app/core/adapters'
import type { OfferPage } from '~~/app/core/contracts'

/**
 * Page d'offre unifiée : un domaine d'étude (un palier) ou une langue (trois).
 *
 * Les langues sont interrogées en premier : elles portent les vrais paliers de
 * `formule.html`, et aucun slug n'est partagé entre les deux familles.
 *
 * **Sources** : langues, logements et orientation viennent d'endpoints dédiés
 * (`/courses`, `/livings`, `/profilage`), déjà chargés dans l'instantané. Les
 * offres de domaine, elles, ne sortent plus du dump : `GET
 * /areas-of-studies/offer/by-slug/{slug}` (directives-backend §21), dont la
 * réponse a exactement la forme d'une entrée de `offers[*]` (vérifié champ par
 * champ le 2026-09-11) — le même `toDomainOfferPage` s'applique.
 *
 * **Repli** : si cette route est injoignable, l'offre de domaine est relue
 * dans le dump en cache, comme avant. Un 404 est une réponse : pas de repli.
 */
export default defineEventHandler(async (event): Promise<OfferPage> => {
  const slug = getRouterParam(event, 'slug') ?? ''
  if (!isPlausibleSlug(slug)) notFound(slug)

  const { offerPages } = await getSnapshot(event)

  const nonDomain = offerPages.find((item) => item.slug === slug && item.kind !== 'domain')
  const offer = nonDomain ?? await domainOffer(event, slug, offerPages)

  if (!offer) notFound(slug)

  setResponseHeader(event, 'cache-control', 'public, max-age=60, stale-while-revalidate=300')
  return offer
})

async function domainOffer(
  event: Parameters<typeof getSnapshot>[0],
  slug: string,
  snapshotPages: OfferPage[],
): Promise<OfferPage | null> {
  try {
    const raw = await cachedDomainOfferBySlug(event, readLocale(event), slug)
    if (raw === null) return null
    const page = toDomainOfferPage(raw)
    // Même filtre que l'instantané : une offre sans palier n'est pas achetable.
    return page.slug !== '' && page.tiers.length > 0 ? page : null
  }
  catch (error) {
    console.warn(`[bff] /areas-of-studies/offer/by-slug/${slug} indisponible, repli sur le dump`, error)
    return snapshotPages.find((item) => item.slug === slug && item.kind === 'domain') ?? null
  }
}

function notFound(slug: string): never {
  throw createError({ statusCode: 404, statusMessage: `Offre « ${slug} » introuvable` })
}
