/**
 * Données illustratives de `/mon-projet` (aperçu) absentes des API.
 *
 * Voir `docs/mon-projet-apercu-mocks.md`.
 */

export type ProjetServiceStatus = 'done' | 'progress' | 'soon' | 'start'

export interface ProjetOverviewServiceCard {
  id: string
  titleKey: string
  descKey: string
  packKey: string
  packTone: 'essentiel' | 'premium' | 'langues' | 'logement'
  icon: string
  /** Icône premium (cercle + glyph) vs assets « bg » complets. */
  iconKind: 'bg' | 'premium'
  status: ProjetServiceStatus
  /** Progression mini-barre (0–100), uniquement pour `progress`. */
  progressPct?: number
  /** Date affichée pour `soon` (déjà formatée, maquette). */
  startDateLabel?: string
  /** Lien réel quand disponible ; `null` = non cliquable / mock. */
  to: string | null
}

export interface ProjetOverviewMock {
  /** Date « Prochain RDV » (maquette) — pas d’endpoint RDV conseiller. */
  nextAppointmentLabel: string
  /** Compteur « À venir » quand l’API ne le fournit pas. */
  upcomingFallback: number
  /** Progression de secours (maquette 65 %) si aucune commande. */
  progressFallbackPct: number
  services: ProjetOverviewServiceCard[]
}

export const projetOverviewMock: ProjetOverviewMock = {
  nextAppointmentLabel: '12 mai 2026',
  upcomingFallback: 1,
  progressFallbackPct: 65,
  services: [
    {
      id: 'orientation-essentiel',
      titleKey: 'projectOverview.cardOrientationTitle',
      descKey: 'projectOverview.cardOrientationDesc',
      packKey: 'projectOverview.packEssentiel',
      packTone: 'essentiel',
      icon: '/img/icons/ic-service-orientation-bg.svg',
      iconKind: 'bg',
      status: 'done',
      to: '/mon-projet/orientation',
    },
    {
      id: 'orientation-premium',
      titleKey: 'projectOverview.cardOrientationTitle',
      descKey: 'projectOverview.cardPremiumDesc',
      packKey: 'projectOverview.packPremium',
      packTone: 'premium',
      icon: '/img/icons/ic-service-orientation-premium.svg',
      iconKind: 'premium',
      status: 'progress',
      progressPct: 70,
      to: '/mon-projet/orientation',
    },
    {
      id: 'langues',
      titleKey: 'projectOverview.cardLangueTitle',
      descKey: 'projectOverview.cardLangueDesc',
      packKey: 'projectOverview.packLangues',
      packTone: 'langues',
      icon: '/img/icons/ic-service-langue-bg.svg',
      iconKind: 'bg',
      status: 'soon',
      startDateLabel: '15/05/2026',
      to: '/mon-projet/langues',
    },
    {
      id: 'logement',
      titleKey: 'projectOverview.cardLogementTitle',
      descKey: 'projectOverview.cardLogementDesc',
      packKey: 'projectOverview.packLogement',
      packTone: 'logement',
      icon: '/img/icons/ic-service-logement-bg.svg',
      iconKind: 'bg',
      status: 'start',
      to: '/logement',
    },
  ],
}
