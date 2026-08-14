import type { FeatureItem, Price, SeoMeta } from './common'

/** Mentor présenté sur une formule, en version liste. */
export interface MentorSummary {
  id: string
  slug: string
  fullName: string
  role: string
  city: string
  photo: string | null
  countryFlag: string | null
}

export interface OfferSummary {
  id: string
  slug: string
  title: string
  /** Accroche de page. `title` sert de repli quand l'API renvoie `null`. */
  heroTitle: string
  badgeLabel: string | null
  icon: string | null
  price: Price
}

/** Formule d'accompagnement (domaine d'étude, MBA…). */
export interface Offer extends OfferSummary {
  /** HTML. */
  description: string
  ctaText: string | null
  heroImage: string | null
  items: FeatureItem[]
  trustBadges: Array<{ label: string; icon: string | null }>
  mentors: MentorSummary[]
  stripeProductId: string | null
  seo: SeoMeta
}
