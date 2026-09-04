/**
 * Chrome Figma `Mon projet` (955:1230) — couleurs / icônes par type de service.
 *
 * Les pourcentages, sous-titres et conseillers viennent de `useProjetData`
 * (ou du mock maquette si l’API est vide). MBA n’a pas de carte API : omis
 * de la légende, contrairement au donut Figma (MBA 0 % illustratif).
 */
import type { ProjetAccompagnement } from '~/core/contracts/projet'

const ASSET = '/img/desktop/mon-projet'

export interface DesktopMonProjetChrome {
  titleKey: string
  legendKey: string
  icon: string
  /** `badge` = pastille déjà dans l’asset (logement) ; `glyph` = icône 32 px. */
  iconKind: 'glyph' | 'badge'
  iconBg: string
  progress: string
  legendDot: string
  actionIcon: string
  actionIconBg: string
  inProgressBadge: { bg: string; text: string }
}

export const DESKTOP_MON_PROJET_ORDER = [
  'myProject.accompaniementOrientationTitle',
  'myProject.accompaniementAdmissionTitle',
  'myProject.accompaniementLanguesTitle',
  'myProject.accompaniementLogementTitle',
] as const

export const desktopMonProjetChrome: Record<string, DesktopMonProjetChrome> = {
  'myProject.accompaniementOrientationTitle': {
    titleKey: 'desktop.monProjet.cardOrientation',
    legendKey: 'desktop.monProjet.legendOrientation',
    icon: `${ASSET}/icon-orientation.svg`,
    iconKind: 'glyph',
    iconBg: '#fef2f2',
    progress: '#ef4444',
    legendDot: '#fd0826',
    actionIcon: `${ASSET}/action-orientation.svg`,
    actionIconBg: '#eff6ff',
    inProgressBadge: { bg: '#fef2f2', text: '#ef4444' },
  },
  'myProject.accompaniementAdmissionTitle': {
    titleKey: 'desktop.monProjet.cardSchool',
    legendKey: 'desktop.monProjet.legendSchool',
    icon: `${ASSET}/icon-school.svg`,
    iconKind: 'glyph',
    iconBg: '#eff6ff',
    progress: '#2563eb',
    legendDot: '#0864f9',
    actionIcon: `${ASSET}/action-school.svg`,
    actionIconBg: '#eff6ff',
    inProgressBadge: { bg: '#eff6ff', text: '#2563eb' },
  },
  'myProject.accompaniementLanguesTitle': {
    titleKey: 'desktop.monProjet.cardLang',
    legendKey: 'desktop.monProjet.legendLang',
    icon: `${ASSET}/icon-lang.svg`,
    iconKind: 'glyph',
    iconBg: '#faf5ff',
    progress: '#852af1',
    legendDot: '#7f15f2',
    actionIcon: `${ASSET}/action-lang.svg`,
    actionIconBg: '#faf5ff',
    inProgressBadge: { bg: '#faf5ff', text: '#620ddc' },
  },
  'myProject.accompaniementLogementTitle': {
    titleKey: 'desktop.monProjet.cardHousing',
    legendKey: 'desktop.monProjet.legendHousing',
    icon: `${ASSET}/icon-housing.svg`,
    iconKind: 'badge',
    iconBg: '#f0fdf4',
    progress: '#008f4a',
    legendDot: '#0b9b51',
    actionIcon: `${ASSET}/action-housing.svg`,
    actionIconBg: '#f0fdf4',
    inProgressBadge: { bg: '#f0fdf4', text: '#008f4a' },
  },
}

const FALLBACK_CHROME: DesktopMonProjetChrome = desktopMonProjetChrome['myProject.accompaniementOrientationTitle']!

export function desktopMonProjetStyle(titleKey: string): DesktopMonProjetChrome {
  return desktopMonProjetChrome[titleKey] ?? FALLBACK_CHROME
}

export function sortDesktopMonProjet(items: ProjetAccompagnement[]): ProjetAccompagnement[] {
  return [...items].sort((a, b) => {
    const ai = DESKTOP_MON_PROJET_ORDER.indexOf(a.titleKey as (typeof DESKTOP_MON_PROJET_ORDER)[number])
    const bi = DESKTOP_MON_PROJET_ORDER.indexOf(b.titleKey as (typeof DESKTOP_MON_PROJET_ORDER)[number])
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
}
