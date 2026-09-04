/**
 * Liens de la topbar desktop (Figma Home page · Navigation 1004:3494).
 */
export interface DesktopNavCountry {
  id: string
  labelKey: string
  slug: string
  flagSrc: string
}

export interface DesktopNavLink {
  id: string
  labelKey: string
  to: string
  countries?: DesktopNavCountry[]
}

/** Pays listés sous « Fiche école » (Figma · menu destinations). */
export const desktopSchoolCountries: DesktopNavCountry[] = [
  { id: 'fr', labelKey: 'desktop.nav.countries.fr', slug: 'france', flagSrc: '/img/icons/flags/flag-fr.svg' },
  { id: 'cn', labelKey: 'desktop.nav.countries.cn', slug: 'chine', flagSrc: '/img/icons/flags/flag-cn.svg' },
  { id: 'uk', labelKey: 'desktop.nav.countries.uk', slug: 'royaume-uni', flagSrc: '/img/icons/flags/flag-uk.svg' },
  { id: 'ca', labelKey: 'desktop.nav.countries.ca', slug: 'canada', flagSrc: '/img/icons/flags/flag-ca.svg' },
  { id: 'us', labelKey: 'desktop.nav.countries.us', slug: 'etats-unis', flagSrc: '/img/icons/flags/flag-us.svg' },
]

export const desktopNavLinks: DesktopNavLink[] = [
  { id: 'school', labelKey: 'desktop.nav.school', to: '/destinations', countries: desktopSchoolCountries },
  { id: 'languages', labelKey: 'desktop.nav.languages', to: '/langues' },
  { id: 'housing', labelKey: 'desktop.nav.housing', to: '/logement' },
  { id: 'mba', labelKey: 'desktop.nav.mba', to: '/destinations' },
]

/** Sections topbar legacy (`legacy/src/components/molecules/Menu.vue`). */
export type DesktopNavSectionId = 'destinations' | 'courses' | 'living' | 'mba'

export const desktopNavSections: { id: DesktopNavSectionId, fallbackLabelKey: string, to: string }[] = [
  { id: 'destinations', fallbackLabelKey: 'desktop.nav.school', to: '/destinations' },
  { id: 'courses', fallbackLabelKey: 'desktop.nav.languages', to: '/langues' },
  { id: 'living', fallbackLabelKey: 'desktop.nav.housing', to: '/logement' },
  { id: 'mba', fallbackLabelKey: 'desktop.nav.mba', to: '/destinations' },
]

const FLAG_BY_SLUG: Record<string, string> = {
  france: '/img/icons/flags/flag-fr.svg',
  chine: '/img/icons/flags/flag-cn.svg',
  'royaume-uni': '/img/icons/flags/flag-uk.svg',
  angleterre: '/img/icons/flags/flag-uk.svg',
  canada: '/img/icons/flags/flag-ca.svg',
  'etats-unis': '/img/icons/flags/flag-us.svg',
  usa: '/img/icons/flags/flag-us.svg',
  allemagne: '/img/icons/flags/flag-de.svg',
  francais: '/img/icons/flags/flag-fr.svg',
  french: '/img/icons/flags/flag-fr.svg',
  anglais: '/img/icons/flags/flag-uk.svg',
  english: '/img/icons/flags/flag-uk.svg',
  allemand: '/img/icons/flags/flag-de.svg',
  german: '/img/icons/flags/flag-de.svg',
  chinois: '/img/icons/flags/flag-cn.svg',
  chinese: '/img/icons/flags/flag-cn.svg',
}

export function desktopNavFlag(slug: string): string | null {
  return FLAG_BY_SLUG[slug.toLowerCase()] ?? null
}

export function desktopNavEntryHref(sectionId: DesktopNavSectionId, slug: string): string {
  switch (sectionId) {
    case 'destinations':
      return `/destinations/${slug}`
    case 'courses':
      return `/langues/${slug}/objectifs`
    case 'living':
      return `/logement/${slug}/decouverte`
    case 'mba':
      return '/destinations'
  }
}
