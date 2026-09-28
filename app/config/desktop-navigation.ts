/**
 * Liens de la topbar desktop (Figma Home page · Navigation 1004:3494).
 */
export interface DesktopNavCountry {
  id: string
  labelKey: string
  slug: string
  /** Nom d'icône `QIcon` (`flag-fr`…), pas un chemin. */
  flag: string
}

export interface DesktopNavLink {
  id: string
  labelKey: string
  to: string
  countries?: DesktopNavCountry[]
}

/** Pays listés sous « Fiche école » (Figma · menu destinations). */
export const desktopSchoolCountries: DesktopNavCountry[] = [
  { id: 'fr', labelKey: 'desktop.nav.countries.fr', slug: 'france', flag: 'flag-fr' },
  { id: 'cn', labelKey: 'desktop.nav.countries.cn', slug: 'chine', flag: 'flag-cn' },
  { id: 'uk', labelKey: 'desktop.nav.countries.uk', slug: 'royaume-uni', flag: 'flag-uk' },
  { id: 'ca', labelKey: 'desktop.nav.countries.ca', slug: 'canada', flag: 'flag-ca' },
  { id: 'us', labelKey: 'desktop.nav.countries.us', slug: 'etats-unis', flag: 'flag-us' },
]

export const desktopNavLinks: DesktopNavLink[] = [
  { id: 'school', labelKey: 'desktop.nav.school', to: '/destinations', countries: desktopSchoolCountries },
  { id: 'languages', labelKey: 'desktop.nav.languages', to: '/langues' },
  { id: 'housing', labelKey: 'desktop.nav.housing', to: '/logement' },
  { id: 'mba', labelKey: 'desktop.nav.mba', to: '/destinations' },
]

/** Sections topbar legacy (`legacy/src/components/molecules/Menu.vue`). */
export type DesktopNavSectionId = 'destinations' | 'courses' | 'living' | 'mba'

/**
 * Pas de `to` : sur desktop, l'intitulé d'une section n'est pas un lien, seul
 * son sous-menu l'est (2026-09-28). Les pages d'accueil de section
 * (`/destinations`, `/langues`, `/logement`, MBA) n'ont pas encore d'écran
 * desktop : `/destinations` affichait l'écran mobile étiré, `/langues` et
 * `/logement` la fiche d'une langue ou d'un pays par défaut. À rétablir quand
 * Kader livrera ces écrans.
 */
export const desktopNavSections: { id: DesktopNavSectionId, fallbackLabelKey: string }[] = [
  { id: 'destinations', fallbackLabelKey: 'desktop.nav.school' },
  { id: 'courses', fallbackLabelKey: 'desktop.nav.languages' },
  { id: 'living', fallbackLabelKey: 'desktop.nav.housing' },
  { id: 'mba', fallbackLabelKey: 'desktop.nav.mba' },
]

export function desktopNavEntryHref(sectionId: DesktopNavSectionId, slug: string): string {
  switch (sectionId) {
    case 'destinations':
      return `/destinations/${slug}`
    case 'courses':
      return `/langues?langue=${slug}`
    case 'living':
      return `/logement/${slug}/decouverte`
    case 'mba':
      return '/destinations'
  }
}
