import type { H3Event } from 'h3'
import type { Article, Catalog, Course, Destination, LivingDestination, Offer, OfferPage, Orientation, Page, School } from '~~/app/core/contracts'
import { createApiClient } from '~~/app/core/http/api-client'
import {
  toArticleList,
  toBannerList,
  toCourseList,
  toDestinationList,
  toDomainOfferPage,
  toHomeContent,
  toLanguageOfferPage,
  toLivingDestination,
  toLivingOfferPage,
  toMenu,
  toOfferList,
  toOrientation,
  toPageList,
  toPartnerList,
  toSchool,
  toSiteSettings,
} from '~~/app/core/adapters'

/**
 * Source de données du BFF.
 *
 * **C'est le seul fichier à modifier quand l'API sera découpée.** Aujourd'hui il
 * télécharge `/all-data` (4,4 Mo) plus quatre endpoints annexes, adapte le tout
 * une fois, et garde le résultat en cache Nitro. Demain, `loadSnapshot`
 * appellera `/bootstrap`, `/destinations/{slug}` et `/pages/{slug}` — ni les
 * repositories, ni les pages ne bougeront.
 *
 * Endpoints réellement consommés aujourd'hui :
 *
 * | Endpoint      | Sert à                                    | Constat |
 * |---------------|-------------------------------------------|---------|
 * | `/all-data`   | menu, accueil, destinations, écoles, pages | 4,4 Mo  |
 * | `/courses`    | langues étrangères + paliers tarifaires    | 27 Ko   |
 * | `/livings`    | destinations logement + paliers tarifaires | -       |
 * | `/profilage`  | offre d'orientation                        | 5 Ko    |
 * | `/articles`   | actualités de l'accueil                    | vide    |
 *
 * `/areas-of-studies/{id}` répond **500** : le rattachement école ↔ domaine
 * d'étude est donc indisponible (cf. LOT-4.md § Limites).
 */

export interface CatalogSnapshot {
  catalog: Catalog
  destinations: Destination[]
  /** Fiches complètes, présentation HTML incluse — jamais envoyées telles quelles au client. */
  schools: School[]
  offers: Offer[]
  pages: Page[]
  courses: Course[]
  /** Destinations logement disponibles — voir `server/api/bff/livings/index.get.ts`. */
  livings: LivingDestination[]
  offerPages: OfferPage[]
  orientation: Orientation | null
  articles: Article[]
}

function apiClient(event: H3Event, locale: string) {
  const config = useRuntimeConfig(event)
  return createApiClient({
    baseUrl: config.apiBaseUrl,
    timeoutMs: config.apiTimeout,
    locale,
  })
}

async function loadSnapshot(event: H3Event, locale: string): Promise<CatalogSnapshot> {
  const client = apiClient(event, locale)
  const flagBase = useRuntimeConfig(event).apiBaseUrl

  // AUJOURD'HUI : un dump monolithique plus quatre appels annexes.
  // DEMAIN : `client.request('/bootstrap')` seul.
  const [raw, rawCourses, rawLivings, rawOrientation, rawArticles] = await Promise.all([
    client.request<Record<string, unknown>>('/all-data'),
    // Ceux-là ne doivent pas faire tomber la page d'accueil s'ils échouent :
    // le catalogue principal suffit à rendre l'essentiel du site.
    client.request<unknown>('/courses').catch(() => []),
    client.request<unknown>('/livings').catch(() => []),
    client.request<unknown>('/profilage').catch(() => null),
    client.request<unknown>('/articles').catch(() => []),
  ])

  const destinations = toDestinationList(raw.schoolSheets, flagBase)
  const offers = toOfferList(raw.offers)
  const pages = toPageList(raw.pages)
  const courses = toCourseList(rawCourses)
  const livings: LivingDestination[] = (Array.isArray(rawLivings) ? rawLivings.map(toLivingDestination) : [])
    .filter((destination) => destination.slug !== '')

  // Les trois formes tarifaires de l'API convergent vers un seul contrat.
  const offerPages: OfferPage[] = [
    ...(Array.isArray(rawCourses) ? rawCourses.map(toLanguageOfferPage) : []),
    ...(Array.isArray(raw.offers) ? raw.offers.map(toDomainOfferPage) : []),
    ...(Array.isArray(rawLivings) ? rawLivings.map(toLivingOfferPage) : []),
  ].filter((page) => page.slug !== '' && page.tiers.length > 0)

  // Les fiches complètes sont reconstruites depuis le même dump : c'est le seul
  // endroit où la présentation HTML des 570 écoles est manipulée.
  const schools: School[] = []
  for (const sheet of Array.isArray(raw.schoolSheets) ? raw.schoolSheets : []) {
    const sheetRecord = (sheet ?? {}) as Record<string, unknown>
    const destinationSlug = typeof sheetRecord.slug === 'string' ? sheetRecord.slug : ''
    for (const school of Array.isArray(sheetRecord.schools) ? sheetRecord.schools : []) {
      const adapted = toSchool(school, destinationSlug, flagBase)
      if (adapted.id !== '' && adapted.slug !== '') schools.push(adapted)
    }
  }

  const catalog: Catalog = {
    menu: toMenu(raw.menu),
    settings: toSiteSettings(raw.settings),
    home: toHomeContent(raw.homeData),
    banners: toBannerList(raw.banners),
    partners: toPartnerList(raw.partners),
    // Le catalogue d'amorçage ne transporte que les résumés : pas d'écoles.
    destinations: destinations.map(({ schools: _s, description: _d, seo: _seo, ...summary }) => summary),
    offers: offers.map(({ id, slug, title, heroTitle, badgeLabel, icon, price }) => ({
      id,
      slug,
      title,
      heroTitle,
      badgeLabel,
      icon,
      price,
    })),
    pages: pages.map(({ id, slug, title }) => ({ id, slug, title })),
    courses: courses.map(({ description: _d, levels: _l, seo: _seo, ...summary }) => summary),
  }

  return { catalog, destinations, schools, offers, pages, courses, livings, offerPages, orientation: toOrientation(rawOrientation), articles: toArticleList(rawArticles) }
}

/**
 * Version mise en cache.
 *
 * Sans elle, chaque rendu de page retéléchargerait les 4,4 Mo. La clé inclut la
 * langue : le back-office sert un contenu différent selon l'en-tête `lang`.
 */
export const cachedSnapshot = defineCachedFunction(loadSnapshot, {
  name: 'qiryna',
  group: 'catalog',
  getKey: (_event: H3Event, locale: string) => locale,
  // Sert la version périmée pendant qu'on la rafraîchit : une lenteur de l'API
  // ne se transforme pas en page blanche.
  swr: true,
  maxAge: 300,
  staleMaxAge: 3600,
})

export function getSnapshot(event: H3Event): Promise<CatalogSnapshot> {
  return cachedSnapshot(event, readLocale(event))
}

/** Langue demandée : `?lang=`, puis l'en-tête `lang`, puis le français. */
export function readLocale(event: H3Event): string {
  const query = getQuery(event).lang
  if (typeof query === 'string' && /^[a-z]{2}$/i.test(query)) return query.toLowerCase()
  const header = getHeader(event, 'lang')
  if (typeof header === 'string' && /^[a-z]{2}$/i.test(header)) return header.toLowerCase()
  return 'fr'
}
