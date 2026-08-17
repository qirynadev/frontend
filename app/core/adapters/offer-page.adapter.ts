import type { OfferPage, OfferTier } from '../contracts'
import { toPrice, toSeo } from './common.adapter'
import { toLivingDestination, toLivingStats } from './living.adapter'
import { asArray, asRecord, html, num, optionalNum, optionalStr, str, toUrl } from './primitives'

/**
 * Unification des deux formes tarifaires de l'API.
 *
 * - `offers[]` (domaines d'étude) : **un** prix unique par domaine ;
 * - `courses[].formulas` (langues) : **trois** paliers mensuels
 *   « Kilimandjaro / Aconcagua / Everest ».
 *
 * Commercialement c'est la même page — celle de `formule.html`. Le domaine n'en
 * connaît donc qu'une : une offre, un ou plusieurs paliers.
 */

/** Puces « ce qui est inclus ». Les deux formes n'ont pas la même structure. */
function toFeatures(raw: unknown): string[] {
  return asArray(raw)
    .map((entry) => {
      const item = asRecord(entry)
      return str(item, 'title') || str(item, 'label')
    })
    .filter((label) => label !== '')
}

/** Palier issu d'une formule de langue (`courses[].formulas[]`). */
export function toCourseTier(raw: unknown): OfferTier {
  const source = asRecord(raw)
  const hours = optionalNum(source, 'nbr_hours')

  return {
    id: str(source, 'id'),
    name: str(source, 'title'),
    tagline: str(source, 'description'),
    icon: toUrl(source.icon),
    features: toFeatures(source.items),
    price: { amount: num(source, 'amount', 0), currency: 'EUR', mode: 'subscription' },
    periodLabel: 'month',
    hours,
    stripeProductId: optionalStr(source, 'stripe_product_id'),
    highlighted: false,
  }
}

/**
 * Palier issu d'une formule de logement (`livings[].formulas[]`).
 *
 * Même forme JSON qu'une formule de langue (`toCourseTier`) — mais un
 * logement se paie **une fois**, pas par mois : aucune des quinze formules
 * réelles (5 destinations × 3) ne porte `nbr_hours`, et l'ancien écran de
 * post-paiement l'annonçait déjà comme « Paiement unique ». Réutiliser
 * `toCourseTier` tel quel aurait affiché « /mois » sur un montant payé une
 * fois — une étiquette fausse, pas un simple détail de présentation.
 */
export function toLivingTier(raw: unknown): OfferTier {
  const source = asRecord(raw)

  return {
    id: str(source, 'id'),
    name: str(source, 'title'),
    tagline: str(source, 'description'),
    icon: toUrl(source.icon),
    features: toFeatures(source.items),
    price: { amount: num(source, 'amount', 0), currency: 'EUR', mode: 'once' },
    periodLabel: 'once',
    hours: optionalNum(source, 'nbr_hours'),
    stripeProductId: optionalStr(source, 'stripe_product_id'),
    highlighted: false,
  }
}

/** Palier unique issu d'une formule d'accompagnement (`offers[]`). */
export function toDomainTier(raw: unknown): OfferTier {
  const source = asRecord(raw)
  const price = toPrice(source)

  return {
    id: str(source, 'id'),
    name: str(source, 'title'),
    tagline: str(source, 'cta_text'),
    icon: toUrl(source.icon),
    features: toFeatures(source.items),
    price,
    periodLabel: price.mode === 'subscription' ? 'month' : 'once',
    hours: optionalNum(source, 'nbr_hours'),
    stripeProductId: optionalStr(source, 'stripe_product_id'),
    highlighted: true,
  }
}

/**
 * Ordonne les paliers du moins cher au plus cher et met le dernier en avant.
 *
 * L'API renvoie `courses[].formulas` dans un ordre arbitraire — relevé sur la
 * recette : Kilimandjaro (200), **Everest (400)**, Aconcagua (300). Sans tri,
 * la page afficherait le palier le plus cher au milieu.
 */
export function orderTiers(tiers: OfferTier[]): OfferTier[] {
  const sorted = [...tiers].sort((a, b) => a.price.amount - b.price.amount)
  return sorted.map((tier, index) => ({ ...tier, highlighted: index === sorted.length - 1 && sorted.length > 1 }))
}

/** Page d'offre construite depuis une langue. */
export function toLanguageOfferPage(raw: unknown): OfferPage {
  const source = asRecord(raw)
  const title = str(source, 'language') || str(source, 'title')
  const description = html(source, 'description')

  return {
    slug: str(source, 'slug'),
    kind: 'language',
    title,
    description,
    icon: toUrl(source.country_flag),
    tiers: orderTiers(asArray(source.formulas).map(toCourseTier).filter((tier) => tier.id !== '')),
    serviceId: str(source, 'id'),
    serviceType: 'course',
    seo: toSeo(source, title, description),
    living: null,
  }
}

/** Page d'offre construite depuis un domaine d'étude. */
export function toDomainOfferPage(raw: unknown): OfferPage {
  const source = asRecord(raw)
  const title = str(source, 'title')
  const description = html(source, 'description')
  const tier = toDomainTier(source)

  return {
    slug: str(source, 'slug'),
    kind: 'domain',
    title,
    description,
    icon: toUrl(source.icon),
    tiers: tier.id === '' ? [] : [tier],
    // Le domaine d'étude porte la formule ; `area.id` est ce que la commande
    // attend en `service_id` (relevé sur l'ancien front, `AreaFormula.vue`).
    // Repli sur l'identifiant de l'offre quand `area` est absent — c'est le cas
    // des huit formules du catalogue de recette (`area: null`).
    serviceId: str(source, 'area.id') || str(source, 'id'),
    serviceType: 'area',
    seo: toSeo(source, title, description),
    living: null,
  }
}

/**
 * Page d'offre construite depuis une destination logement (`GET /livings`).
 *
 * Même unification que les deux ci-dessus : trois paliers réels (Colorado /
 * Amazone / Zambeze pour la France), plus le pays et le bandeau statistique
 * de la destination, absents des deux autres formes et donc propres à
 * `kind: 'living'` (voir `OfferPage.living`).
 */
export function toLivingOfferPage(raw: unknown): OfferPage {
  const source = asRecord(raw)
  const title = str(source, 'title')
  const description = html(source, 'description')

  return {
    slug: str(source, 'slug'),
    kind: 'living',
    title,
    description,
    icon: toUrl(source.country_flag),
    tiers: orderTiers(asArray(source.formulas).map(toLivingTier).filter((tier) => tier.id !== '')),
    serviceId: str(source, 'id'),
    serviceType: 'living',
    seo: toSeo(source, title, description),
    living: { ...toLivingDestination(raw), ...toLivingStats(raw) },
  }
}
