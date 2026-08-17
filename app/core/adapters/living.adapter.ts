import type { Country, LivingDestination, LivingStats } from '../contracts'
import { toCountry } from './common.adapter'
import { asRecord, optionalStr, str, toUrl } from './primitives'

/**
 * Pays d'un `living`.
 *
 * Le drapeau vit hors de `country` (`country_flag`, absolu, à la racine de
 * l'objet) — passer `source.country` seul à `toCountry` retomberait sur un
 * calcul par code ISO, superflu puisque l'API le fournit déjà tout fait.
 */
function toLivingCountry(source: Record<string, unknown>): Country {
  const country = toCountry(source.country)
  const flag = toUrl(source.country_flag)
  return flag ? { ...country, flag } : country
}

export function toLivingDestination(raw: unknown): LivingDestination {
  const source = asRecord(raw)
  return {
    slug: str(source, 'slug'),
    country: toLivingCountry(source),
    tagline: str(source, 'title'),
    photo: toUrl(source.picture),
  }
}

export function toLivingStats(raw: unknown): LivingStats {
  const source = asRecord(raw)
  return {
    heroTagline: optionalStr(source, 'hero_tagline'),
    depositLabel: optionalStr(source, 'deposit_label'),
    leaseDurationLabel: optionalStr(source, 'lease_duration_label'),
    chargesLabel: optionalStr(source, 'charges_label'),
    averageRentLabel: optionalStr(source, 'average_rent_label'),
  }
}
