import type { AnyIconName } from '~/design-system/types'

/** Variante d'icône carte domaine — miroir `.dom-card-icon--*` (`domaines-etude.html`). */
export type DomainCardIconVariant = 'arch' | 'mgmt' | 'full'

export interface DomainAreaVisual {
  cardVariant: DomainCardIconVariant
  cardIcon: AnyIconName
  cardIconSize: number
  chipIcon: AnyIconName
  chipIconSize: number
  chipIconHeight: number
  metaBold: boolean
}

const DEFAULT: DomainAreaVisual = {
  cardVariant: 'full',
  cardIcon: 'ic-dom-sci',
  cardIconSize: 32,
  chipIcon: 'ic-dom-sci',
  chipIconSize: 18,
  chipIconHeight: 18,
  metaBold: true,
}

/** Slugs maquette (`data-domaine`) → habillage pixel mesuré sur `domaines-etude.html` / `liste-ecole.html`. */
const BY_SLUG: Record<string, Partial<DomainAreaVisual>> = {
  architecture: {
    cardVariant: 'arch',
    cardIcon: 'ic-dom-arch',
    cardIconSize: 44,
    chipIcon: 'ic-le-chip-arch',
    chipIconSize: 11,
    chipIconHeight: 14,
    metaBold: false,
  },
  management: {
    cardVariant: 'mgmt',
    cardIcon: 'ic-dom-mgmt',
    cardIconSize: 44,
    chipIcon: 'ic-le-chip-mgmt',
    chipIconSize: 16,
    chipIconHeight: 14,
    metaBold: false,
  },
  ingenierie: {
    cardIcon: 'ic-dom-ing',
    chipIcon: 'ic-le-chip-ing',
    chipIconSize: 21,
    chipIconHeight: 21,
  },
  medecine: {
    cardIcon: 'ic-dom-med',
    chipIcon: 'ic-dom-med',
  },
  'sciences-politiques': {
    cardIcon: 'ic-dom-pol',
    chipIcon: 'ic-dom-pol',
  },
  sciences: {
    cardIcon: 'ic-dom-sci',
    chipIcon: 'ic-dom-sci',
  },
  droit: {
    cardIcon: 'ic-dom-mgmt',
    chipIcon: 'ic-le-chip-mgmt',
    chipIconSize: 16,
    chipIconHeight: 14,
  },
  mba: {
    cardIcon: 'ic-dom-mgmt',
    chipIcon: 'ic-le-chip-mgmt',
    chipIconSize: 16,
    chipIconHeight: 14,
  },
}

export function domainAreaVisual(slug: string): DomainAreaVisual {
  return { ...DEFAULT, ...BY_SLUG[slug] }
}

export function domainCardIconWrapClass(variant: DomainCardIconVariant): string {
  if (variant === 'arch') return 'bg-surface-2 overflow-hidden'
  if (variant === 'mgmt') return 'bg-dom-card-mgmt-bg overflow-hidden'
  return 'overflow-visible bg-transparent'
}
