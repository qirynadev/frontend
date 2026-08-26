import type { Country, LivingAccommodationType, LivingDestination, LivingPreferences, LivingStats } from '../contracts'
import { toCountry } from './common.adapter'
import { asRecord, optionalNum, optionalStr, str, toIsoDate, toUrl } from './primitives'

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

const ACCOMMODATION_TYPES: readonly LivingAccommodationType[] = ['apartment', 'shared', 'dormitory', 'host_family', 'other']

function toAccommodationType(value: unknown): LivingAccommodationType | null {
  return typeof value === 'string' && (ACCOMMODATION_TYPES as readonly string[]).includes(value)
    ? (value as LivingAccommodationType)
    : null
}

/**
 * Préférences logement déjà soumises (`GET /client-data/show` → `data`,
 * déjà déballé de son enveloppe par `unwrapEnvelope`) — `null` si le client
 * n'a encore rien renseigné pour cette commande.
 */
export function toLivingPreferences(raw: unknown): LivingPreferences | null {
  if (raw === null || raw === undefined) return null
  const source = asRecord(raw)

  return {
    arrivalDate: toIsoDate(source.planned_arrival_date),
    monthlyBudget: optionalNum(source, 'monthly_budget_estimate'),
    stayDurationMonths: optionalNum(source, 'stay_duration_months'),
    accommodationType: toAccommodationType(source.accommodation_type),
  }
}
