/**
 * Écran desktop post-paiement ← Figma `330:2555` (Collecte — succes pay).
 * Standard pour tous les tunnels ; `variant` n’override que si des clés i18n existent.
 */
export const DESKTOP_PAY_ASSET = '/img/desktop/paiement-reussi'

export type DesktopPayVariant = 'default' | 'language' | 'orientation' | 'housing'

export const desktopPaySteps = [
  { icon: 'step-1.svg', iconBg: 'bg-[#fef2f2]', titleKey: 'step1Title', descKey: 'step1Desc' },
  { icon: 'step-2.svg', iconBg: 'bg-[#faf5ff]', titleKey: 'step2Title', descKey: 'step2Desc' },
  { icon: 'step-3.svg', iconBg: 'bg-[#f0fdf4]', titleKey: 'step3Title', descKey: 'step3Desc' },
  { icon: 'step-4.svg', iconBg: 'bg-[#eff6ff]', titleKey: 'step4Title', descKey: 'step4Desc' },
] as const
