import type { MentorSummary, Offer, OfferSummary } from '../contracts'
import { toFeatureItems, toPrice, toSeo } from './common.adapter'
import { asArray, asRecord, dedupeBySlug, html, list, optionalStr, str, toUrl } from './primitives'

function toMentorSummary(raw: unknown): MentorSummary {
  const source = asRecord(raw)
  const first = str(source, 'first_name')
  const last = str(source, 'last_name')
  return {
    id: str(source, 'id'),
    slug: str(source, 'slug'),
    // `full_name` existe mais n'est pas garanti : on le recompose au besoin.
    fullName: str(source, 'full_name') || `${first} ${last}`.trim(),
    role: str(source, 'role'),
    city: str(source, 'city'),
    photo: toUrl(source.photo),
    countryFlag: toUrl(source.country_flag),
  }
}

export function toOfferSummary(raw: unknown): OfferSummary {
  const source = asRecord(raw)
  const title = str(source, 'title')
  return {
    id: str(source, 'id'),
    slug: str(source, 'slug'),
    title,
    // `hero_title` est `null` pour les huit formules de recette : on retombe
    // sur le titre plutôt que d'afficher un vide.
    heroTitle: str(source, 'hero_title') || title,
    badgeLabel: optionalStr(source, 'badge_label'),
    icon: toUrl(source.icon),
    price: toPrice(source),
  }
}

export function toOffer(raw: unknown): Offer {
  const source = asRecord(raw)
  const summary = toOfferSummary(source)
  const description = html(source, 'description')

  return {
    ...summary,
    description,
    ctaText: optionalStr(source, 'cta_text'),
    heroImage: toUrl(source.hero_image),
    items: toFeatureItems(source.items),
    trustBadges: asArray(source.trust_badges)
      .map((entry) => {
        const badge = asRecord(entry)
        return { label: str(badge, 'label'), icon: toUrl(badge.icon) }
      })
      .filter((badge) => badge.label !== ''),
    mentors: list(source, 'mentors')
      .map(toMentorSummary)
      .filter((mentor) => mentor.id !== ''),
    stripeProductId: optionalStr(source, 'stripe_product_id'),
    seo: toSeo(source, summary.title, description),
  }
}

export function toOfferList(raw: unknown): Offer[] {
  const offers = (Array.isArray(raw) ? raw : [])
    .map(toOffer)
    .filter((offer) => offer.id !== '' && offer.slug !== '')

  return dedupeBySlug(offers, 'formules')
}
