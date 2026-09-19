/**
 * Navigation desktop Réglages — pas d’artboard Figma 1728.
 * Même inventaire que le hub mobile (`pages/reglages/index.vue`).
 */
export interface DesktopReglagesNavItem {
  id: string
  icon: string
  titleKey: string
  to?: string
  danger?: boolean
}

export interface DesktopReglagesNavSection {
  titleKey: string
  items: DesktopReglagesNavItem[]
}

export const desktopReglagesNav: DesktopReglagesNavSection[] = [
  {
    titleKey: 'settings.sectionAccount',
    items: [
      { id: 'personal', icon: 'ic-rg-person', titleKey: 'settings.personalTitle', to: '/reglages' },
      { id: 'password', icon: 'ic-rg-lock', titleKey: 'settings.passwordTitle', to: '/reglages/mot-de-passe' },
    ],
  },
  {
    titleKey: 'settings.sectionPreferences',
    items: [
      { id: 'language', icon: 'ic-rg-globe', titleKey: 'settings.languageTitle', to: '/reglages/langues' },
      { id: 'theme', icon: 'ic-rg-theme', titleKey: 'settings.themeTitle', to: '/reglages/theme' },
    ],
  },
  {
    titleKey: 'settings.sectionOther',
    items: [
      { id: 'help', icon: 'ic-rg-help', titleKey: 'settings.helpTitle', to: '/reglages/centre-aide' },
      { id: 'legal', icon: 'ic-rg-legal', titleKey: 'settings.legalTitle', to: '/reglages/mentions' },
      { id: 'logout', icon: 'ic-rg-logout', titleKey: 'settings.logoutTitle', danger: true },
    ],
  },
]

/** Chemin sans préfixe de locale (`/en/...` → `/...`). */
export function desktopReglagesPath(path: string): string {
  return path.replace(/^\/en(?=\/|$)/, '') || '/'
}

export function desktopReglagesItemActive(path: string, item: DesktopReglagesNavItem): boolean {
  const p = desktopReglagesPath(path)
  if (item.id === 'personal') {
    return p === '/reglages' || p === '/reglages/' || p.startsWith('/reglages/informations-personnelles')
  }
  if (item.id === 'legal') {
    return p.startsWith('/reglages/mentions') || p.startsWith('/reglages/exercer-mes-droits')
  }
  if (item.id === 'help') {
    return p.startsWith('/reglages/centre-aide') || p.startsWith('/reglages/contact')
  }
  if (!item.to) return false
  return p === item.to || p.startsWith(`${item.to}/`)
}
