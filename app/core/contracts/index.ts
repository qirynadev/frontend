export type * from './common'
export type * from './course'
export type * from './destination'
export type * from './editorial'
export type * from './home'
export type * from './offer'
export type * from './offer-page'
export type * from './order'
export type * from './page'
export type * from './planning'
export type * from './school'
export type * from './session'

import type { Menu, SiteSettings } from './common'
import type { CourseSummary } from './course'
import type { DestinationSummary } from './destination'
import type { Banner, HomeContent, Partner } from './home'
import type { OfferSummary } from './offer'
import type { PageSummary } from './page'

/**
 * Ce que l'application charge une fois pour toutes au démarrage.
 *
 * C'est la forme que prendra `/bootstrap` quand l'API sera découpée. Aujourd'hui
 * elle est reconstituée côté serveur à partir de `/all-data` — sans jamais
 * transmettre au navigateur les 3,4 Mo de présentations d'écoles.
 */
export interface Catalog {
  menu: Menu
  settings: SiteSettings
  home: HomeContent | null
  banners: Banner[]
  partners: Partner[]
  destinations: DestinationSummary[]
  offers: OfferSummary[]
  pages: PageSummary[]
  /** Langues enseignées. Vient de `/courses`, pas de `/all-data`. */
  courses: CourseSummary[]
}
