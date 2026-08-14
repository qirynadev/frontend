import type { SeoMeta } from './common'

/** Page éditoriale (CGU, cookies, FAQ, politique de confidentialité). */
export interface PageSummary {
  id: string
  slug: string
  title: string
}

export interface Page extends PageSummary {
  /** HTML administré côté back-office. */
  content: string
  seo: SeoMeta
}
