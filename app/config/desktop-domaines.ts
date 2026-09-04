/**
 * Icônes d'onglets Figma `Domaines d'etudes` (54:488).
 * Fallback : icône back-office du domaine (`AreaOfStudySummary.icon`).
 */
const ASSET = '/img/desktop/domaines'

export const desktopDomainTabIcons: Record<string, string> = {
  architecture: `${ASSET}/domain-architecture.svg`,
  ingenierie: `${ASSET}/domain-ingenierie.svg`,
  droit: `${ASSET}/domain-droit.svg`,
  management: `${ASSET}/domain-management.svg`,
  medecine: `${ASSET}/domain-medecine.svg`,
  'sciences-politiques': `${ASSET}/domain-sciences-politiques.svg`,
  'classes-prepa': `${ASSET}/domain-prepa.svg`,
  prepa: `${ASSET}/domain-prepa.svg`,
  'classe-prepa': `${ASSET}/domain-prepa.svg`,
}

export const desktopDomainManagementActiveIcon = `${ASSET}/domain-management-active.svg`

export function desktopDomainTabIcon(slug: string, selected: boolean, apiIcon: string | null): string {
  if (selected && slug === 'management') return desktopDomainManagementActiveIcon
  return desktopDomainTabIcons[slug] ?? apiIcon ?? desktopDomainTabIcons.management
}
