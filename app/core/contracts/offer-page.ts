import type { Price, SeoMeta } from './common'
import type { LivingDestination, LivingStats } from './living'

/**
 * Palier tarifaire.
 *
 * L'API expose deux formes très différentes pour la même intention
 * commerciale : une formule d'accompagnement par domaine d'étude
 * (`offers[]`, un seul prix) et un jeu de trois paliers par langue
 * (`courses[].formulas`, « Kilimandjaro / Aconcagua / Everest »).
 *
 * Le domaine n'en connaît qu'une : une page d'offre, un ou plusieurs paliers.
 * C'est exactement ce que montre `formule.html`.
 */
export interface OfferTier {
  id: string
  name: string
  /** Accroche sous le nom. Peut être vide. */
  tagline: string
  icon: string | null
  /** Puces « ce qui est inclus », déjà débarrassées des entrées vides. */
  features: string[]
  price: Price
  /** « par mois », « paiement unique »… déjà résolu par l'adapter. */
  periodLabel: 'month' | 'once'
  /** Volume horaire mensuel, quand l'API le renseigne. */
  hours: number | null
  stripeProductId: string | null
  /** Palier mis en avant (le plus complet). */
  highlighted: boolean
}

export interface OfferPage {
  slug: string
  /** D'où viennent les paliers — utile pour le fil d'Ariane et le SEO. */
  kind: 'domain' | 'language' | 'living'
  title: string
  /** HTML. */
  description: string
  icon: string | null
  tiers: OfferTier[]
  /**
   * Identifiant du **service** auquel les paliers se rattachent (`service_id`
   * dans la commande) : l'identifiant de la langue pour `kind: 'language'`,
   * celui du domaine d'étude pour `kind: 'domain'`, celui de la destination
   * logement (`CostOfLiving.id`) pour `kind: 'living'`.
   *
   * Sans lui, une commande ne peut pas être créée : `POST /payment/init` exige
   * le couple `offer_id` (le palier) **et** `service_id` (ce à quoi il
   * s'applique).
   */
  serviceId: string
  /** Vocabulaire du back-office : `course` pour une langue, `area` pour un domaine, `living` pour un logement. */
  serviceType: 'course' | 'area' | 'living'
  seo: SeoMeta
  /** Pays, photo et bandeau statistique — renseigné uniquement pour `kind: 'living'`. */
  living: (LivingDestination & LivingStats) | null
}
