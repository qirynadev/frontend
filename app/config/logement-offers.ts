/**
 * Les trois formules de logement ← `offres-logement.html` / `logement-post-paiement.html`.
 *
 * Données d'essai : aucun endpoint n'expose ces offres (voir Chantier C,
 * PROMPTS-AGENTS.md). Reprises telles quelles de `js/logement-offres.js` et
 * du script de `logement-post-paiement.html`.
 */
export type LogementFeatureId = 'logements' | 'garant' | 'admin' | 'taxi' | 'sim'

export interface LogementOffer {
  id: 'comoe' | 'volga' | 'yukon'
  icon: string
  /** Couleur d'accent — dicte aussi le fond de la pastille quand `thumb` est vide. */
  accent: string
  accentBg: string
  price: string
  badge: boolean
  thumb: string | null
  features: LogementFeatureId[]
  logementsCount: number
}

export const logementOffers: Record<string, LogementOffer> = {
  comoe: {
    id: 'comoe',
    icon: 'ic-ol-comoe',
    accent: '#00a31c',
    accentBg: '#edf8eb',
    price: '249 €',
    badge: false,
    thumb: null,
    features: ['logements'],
    logementsCount: 2,
  },
  volga: {
    id: 'volga',
    icon: 'ic-ol-volga',
    accent: '#570bfd',
    accentBg: '#f3f1fe',
    price: '459 €',
    badge: true,
    thumb: '/img/logement-volga-thumb.webp',
    features: ['logements', 'garant'],
    logementsCount: 3,
  },
  yukon: {
    id: 'yukon',
    icon: 'ic-ol-yukon',
    accent: '#ff6300',
    accentBg: '#fff7ed',
    price: '699 €',
    badge: false,
    thumb: null,
    features: ['logements', 'garant', 'admin', 'taxi', 'sim'],
    logementsCount: 3,
  },
}

export const logementFeatureIcons: Record<LogementFeatureId, string> = {
  logements: 'ic-lp-feat-house',
  garant: 'ic-lp-feat-shield-halved',
  admin: 'ic-lp-feat-headset',
  taxi: 'ic-lp-feat-plane',
  sim: 'ic-lp-feat-sim-card',
}
