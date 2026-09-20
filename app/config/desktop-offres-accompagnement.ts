/**
 * Écran desktop « Offres d'accompagnement » ← Figma `341:3720`.
 * Copy MBA de la maquette ; les autres domaines interpolent le titre d’offre.
 * Les 7 puces « inclus » restent celles de la maquette (pas les features API).
 */
export const DESKTOP_OFFER_ASSET = '/img/desktop/offres'

export const desktopOfferAdvantages = [
  { icon: 'advantage-1.svg', titleKey: 'desktop.offer.adv1Title', descKey: 'desktop.offer.adv1Desc' },
  { icon: 'advantage-2.svg', titleKey: 'desktop.offer.adv2Title', descKey: 'desktop.offer.adv2Desc' },
  { icon: 'advantage-3.svg', titleKey: 'desktop.offer.adv3Title', descKey: 'desktop.offer.adv3Desc' },
  { icon: 'advantage-4.svg', titleKey: 'desktop.offer.adv4Title', descKey: 'desktop.offer.adv4Desc' },
] as const

export const desktopOfferMbaIncludes = [
  { icon: 'include-1.svg', labelKey: 'desktop.offer.mbaInc1' },
  { icon: 'include-2.svg', labelKey: 'desktop.offer.mbaInc2' },
  { icon: 'include-3.svg', labelKey: 'desktop.offer.mbaInc3' },
  { icon: 'include-4.svg', labelKey: 'desktop.offer.mbaInc4' },
  { icon: 'include-5.svg', labelKey: 'desktop.offer.mbaInc5' },
  { icon: 'include-6.svg', labelKey: 'desktop.offer.mbaInc6' },
  { icon: 'include-7.svg', labelKey: 'desktop.offer.mbaInc7' },
] as const

export const desktopOfferSteps = [
  { icon: 'step-1.svg', titleKey: 'desktop.offer.step1Title', descKey: 'desktop.offer.step1Desc' },
  { icon: 'step-2.svg', titleKey: 'desktop.offer.step2Title', descKey: 'desktop.offer.step2Desc' },
  { icon: 'step-3.svg', titleKey: 'desktop.offer.step3Title', descKey: 'desktop.offer.step3Desc' },
  { icon: 'step-4.svg', titleKey: 'desktop.offer.step4Title', descKey: 'desktop.offer.step4Desc' },
  { icon: 'step-5.svg', titleKey: 'desktop.offer.step5Title', descKey: 'desktop.offer.step5Desc' },
  { icon: 'step-6.svg', titleKey: 'desktop.offer.step6Title', descKey: 'desktop.offer.step6Desc' },
] as const

export function desktopOfferAccentKey(slug: string): string {
  const known = [
    'mba',
    'management',
    'architecture',
    'ingenierie',
    'medecine',
    'droit',
    'sciences-politiques',
    'classes-prepa',
    'prepa',
    'classe-prepa',
  ]
  if (slug === 'management') return 'desktop.offer.accent.mba'
  if (slug === 'prepa' || slug === 'classe-prepa') return 'desktop.offer.accent.classes-prepa'
  if (known.includes(slug)) return `desktop.offer.accent.${slug}`
  return 'desktop.offer.accent.default'
}
