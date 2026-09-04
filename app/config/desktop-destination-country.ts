/**
 * Config Figma des destinations desktop Canada / Angleterre / USA.
 * Layout partagé : `desktop-pages/destination-country.vue`.
 */
export type DesktopCountrySlug = 'canada' | 'angleterre' | 'usa'

export interface DesktopCountryDomain {
  id: string
  slugs: string[]
  labelKey: string
  icon: string
  iconBg: string
  twoLine?: boolean
}

export interface DesktopCountryScreen {
  assetBase: string
  i18n: string
  hero: string
  flag: { src: string, w: number, h: number, class: string }
  domains: DesktopCountryDomain[]
  stats: { valueKey: string, labelKey: string, bold: boolean }[]
  schools: { w: number, h: number }[]
  trust: [string[], string[], string[], string[]]
}

const sixDomains: DesktopCountryDomain[] = [
  { id: 'management', slugs: ['management'], labelKey: 'domainManagement', icon: 'management.svg', iconBg: 'bg-[#eaf6e8]' },
  { id: 'droit', slugs: ['droit'], labelKey: 'domainDroit', icon: 'droit.svg', iconBg: 'bg-[#f7ebff]' },
  { id: 'sciences-politiques', slugs: ['sciences-politiques'], labelKey: 'domainSciencesPo', icon: 'sciences-politiques.svg', iconBg: 'bg-[#ecf3fe]', twoLine: true },
  { id: 'architecture', slugs: ['architecture'], labelKey: 'domainArchitecture', icon: 'architecture.svg', iconBg: 'bg-[#fff4e7]' },
  { id: 'ingenierie', slugs: ['ingenierie'], labelKey: 'domainIngenierie', icon: 'ingenierie.svg', iconBg: 'bg-[#fef2e8]' },
  { id: 'medecine', slugs: ['medecine'], labelKey: 'domainMedecine', icon: 'medecine.svg', iconBg: 'bg-[#fcf0f0]' },
]

export const desktopCountryScreens: Record<DesktopCountrySlug, DesktopCountryScreen> = {
  canada: {
    assetBase: '/img/desktop/destination/canada',
    i18n: 'desktop.destination.canada',
    hero: 'hero-canada.jpg',
    flag: { src: 'flag.svg', w: 47, h: 31, class: 'top-[69px] left-[176px] h-31 w-47' },
    domains: sixDomains,
    stats: [
      { valueKey: 'stat1Value', labelKey: 'stat1Label', bold: false },
      { valueKey: 'stat2Value', labelKey: 'stat2Label', bold: true },
      { valueKey: 'stat3Value', labelKey: 'stat3Label', bold: false },
      { valueKey: 'stat4Value', labelKey: 'stat4Label', bold: false },
    ],
    schools: [
      { w: 90, h: 60 },
      { w: 63, h: 63 },
      { w: 63, h: 23 },
      { w: 53, h: 23 },
      { w: 62, h: 15 },
      { w: 42, h: 49 },
      { w: 59, h: 20 },
      { w: 60, h: 23 },
    ],
    trust: [
      ['trust1Line1', 'trust1Line2'],
      ['trust2Line1', 'trust2Line2'],
      ['trust3Line1', 'trust3Line2'],
      ['trust4Line1', 'trust4Line2'],
    ],
  },
  angleterre: {
    assetBase: '/img/desktop/destination/angleterre',
    i18n: 'desktop.destination.angleterre',
    hero: 'hero-angleterre.jpg',
    flag: { src: 'flag.svg', w: 36, h: 36, class: 'top-[69px] left-[233px] size-36' },
    domains: sixDomains,
    stats: [
      { valueKey: 'stat1Value', labelKey: 'stat1Label', bold: false },
      { valueKey: 'stat2Value', labelKey: 'stat2Label', bold: true },
      { valueKey: 'stat3Value', labelKey: 'stat3Label', bold: false },
      { valueKey: 'stat4Value', labelKey: 'stat4Label', bold: false },
    ],
    schools: [
      { w: 57, h: 57 },
      { w: 63, h: 63 },
      { w: 47, h: 45 },
      { w: 62, h: 16 },
      { w: 61, h: 18 },
      { w: 50, h: 50 },
      { w: 49, h: 36 },
      { w: 64, h: 27 },
    ],
    trust: [
      ['trust1'],
      ['trust2'],
      ['trust3Line1', 'trust3Line2'],
      ['trust4Line1', 'trust4Line2'],
    ],
  },
  usa: {
    assetBase: '/img/desktop/destination/usa',
    i18n: 'desktop.destination.usa',
    hero: 'hero-usa.jpg',
    flag: { src: 'flag.svg', w: 39, h: 39, class: 'top-[63px] left-[106px] size-[39px]' },
    domains: sixDomains,
    stats: [
      { valueKey: 'stat1Value', labelKey: 'stat1Label', bold: false },
      { valueKey: 'stat2Value', labelKey: 'stat2Label', bold: true },
      { valueKey: 'stat3Value', labelKey: 'stat3Label', bold: false },
      { valueKey: 'stat4Value', labelKey: 'stat4Label', bold: false },
    ],
    schools: [
      { w: 54, h: 45 },
      { w: 62, h: 31 },
      { w: 41, h: 45 },
      { w: 64, h: 19 },
      { w: 36, h: 48 },
      { w: 40, h: 40 },
      { w: 49, h: 50 },
      { w: 62, h: 62 },
    ],
    trust: [
      ['trust1'],
      ['trust2'],
      ['trust3Line1', 'trust3Line2'],
      ['trust4Line1', 'trust4Line2'],
    ],
  },
}

export const desktopCountrySlugs: DesktopCountrySlug[] = ['canada', 'angleterre', 'usa']

/**
 * Le catalogue API n'utilise pas les slugs Figma (`angleterre`, `usa`) :
 * Royaume-Uni → `royaume-uni`, États-Unis → `etats-unis`.
 */
const desktopRouteToApiSlug: Record<string, string> = {
  canada: 'canada',
  angleterre: 'royaume-uni',
  'royaume-uni': 'royaume-uni',
  usa: 'etats-unis',
  'etats-unis': 'etats-unis',
}

const desktopRouteToScreen: Record<string, DesktopCountrySlug> = {
  canada: 'canada',
  angleterre: 'angleterre',
  'royaume-uni': 'angleterre',
  usa: 'usa',
  'etats-unis': 'usa',
}

/** Slug catalogue pour charger la destination (alias Figma inclus). */
export function resolveDestinationApiSlug(routeSlug: string): string {
  return desktopRouteToApiSlug[routeSlug] ?? routeSlug
}

/** Écran Figma desktop, ou `null` si la route n'en a pas. */
export function desktopCountryFromRoute(routeSlug: string): DesktopCountrySlug | null {
  return desktopRouteToScreen[routeSlug] ?? null
}
