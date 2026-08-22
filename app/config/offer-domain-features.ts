/**
 * Prestations de l’offre parcours école (`/offres/[domaine]`).
 * Libellés en i18n (`offer.domainFeature.*`).
 */
export const DOMAIN_OFFER_FEATURE_IDS = [
  'cadrage',
  'projetEtude',
  'projetPro',
  'essais',
  'entretien',
] as const

export type DomainOfferFeatureId = (typeof DOMAIN_OFFER_FEATURE_IDS)[number]
