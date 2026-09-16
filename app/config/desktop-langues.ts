/**
 * Landing desktop « Langues » ← Figma `1003:1436`.
 * Formules et titre dynamiques ← Figma `601:1634` (Choix de la formule).
 */
export const DESKTOP_LANGUES_ASSET = '/img/desktop/langues'
export const DESKTOP_LANGUES_FORMULES_ASSET = `${DESKTOP_LANGUES_ASSET}/formules`

export const desktopLangueFeatures = [
  { icon: 'feat-1.svg', titleKey: 'desktop.langues.feat1Title', descKey: 'desktop.langues.feat1Desc' },
  { icon: 'feat-2.svg', titleKey: 'desktop.langues.feat2Title', descKey: 'desktop.langues.feat2Desc' },
  { icon: 'feat-3.svg', titleKey: 'desktop.langues.feat3Title', descKey: 'desktop.langues.feat3Desc' },
  { icon: 'feat-4.svg', titleKey: 'desktop.langues.feat4Title', descKey: 'desktop.langues.feat4Desc' },
] as const

export const desktopLanguePath = [
  { icon: 'path-1.svg', bg: 'bg-[#faf5ff]', titleKey: 'desktop.langues.path1Title', descKey: 'desktop.langues.path1Desc' },
  { icon: 'path-2.svg', bg: 'bg-[#f0fdf4]', titleKey: 'desktop.langues.path2Title', descKey: 'desktop.langues.path2Desc' },
  { icon: 'path-3.svg', bg: 'bg-[#fef2f2]', titleKey: 'desktop.langues.path3Title', descKey: 'desktop.langues.path3Desc' },
  { icon: 'path-4.svg', bg: 'bg-[#eff6ff]', titleKey: 'desktop.langues.path4Title', descKey: 'desktop.langues.path4Desc' },
] as const

export const desktopLangueDefaultLevels = [
  { id: 'beginner', visual: 'beginner' as const, nameKey: 'desktop.langues.levelBeginner', descKey: 'desktop.langues.levelBeginnerDesc' },
  { id: 'intermediate', visual: 'intermediate' as const, nameKey: 'desktop.langues.levelIntermediate', descKey: 'desktop.langues.levelIntermediateDesc' },
  { id: 'advanced', visual: 'advanced' as const, nameKey: 'desktop.langues.levelAdvanced', descKey: 'desktop.langues.levelAdvancedDesc' },
] as const

export type DesktopLangueLevelVisual = (typeof desktopLangueDefaultLevels)[number]['visual']

export const desktopLangueLevelBadges: Record<DesktopLangueLevelVisual, { labelKey: string, class: string }> = {
  beginner: { labelKey: 'desktop.langues.badgeBeginner', class: 'bg-[#eaf6eb] text-[#36972e]' },
  intermediate: { labelKey: 'desktop.langues.badgeIntermediate', class: 'bg-[#fff7ed] text-[#c2410c]' },
  advanced: { labelKey: 'desktop.langues.badgeAdvanced', class: 'bg-[#fef2f2] text-[#e5002b]' },
}

export const desktopLangueFormulaVisuals = [
  {
    key: 'everest',
    icon: 'icon-everest.svg',
    check: 'check-red.svg',
    border: 'border-[#fbc5ce]',
    button: 'bg-[#fa0e26] py-14 font-medium text-white',
    popular: true,
    listBorder: false,
  },
  {
    key: 'aconcagua',
    icon: 'icon-aconcagua.svg',
    check: 'check-purple.svg',
    border: 'border-[#f1f5f9]',
    button: 'border border-[#4318ff] bg-white py-15 font-semibold text-[#4318ff]',
    popular: false,
    listBorder: true,
  },
  {
    key: 'kilimandjaro',
    icon: 'icon-kilimandjaro.svg',
    check: 'check-green.svg',
    border: 'border-[#f1f5f9]',
    button: 'border border-[#10b981] bg-white py-15 font-semibold text-[#10b981]',
    popular: false,
    listBorder: true,
  },
] as const

export type DesktopLangueFormulaKey = (typeof desktopLangueFormulaVisuals)[number]['key']

const VOWEL_OR_H = /^[aeiouàâäéèêëïîôùûüyh]/i

/** « du français » / « de l'anglais » — pour le titre Figma `601:1673`. */
export function ofLanguage(name: string, locale: string): string {
  const trimmed = name.trim()
  if (!trimmed) return ''
  const lower = trimmed.toLowerCase()
  if (locale.startsWith('en')) return lower
  return VOWEL_OR_H.test(lower) ? `de l'${lower}` : `du ${lower}`
}

export function desktopLangueFormulaVisual(name: string, fallbackIndex: number) {
  const key = name.toLowerCase()
  if (key.includes('everest')) return desktopLangueFormulaVisuals[0]
  if (key.includes('aconcagua')) return desktopLangueFormulaVisuals[1]
  if (key.includes('kilimandjaro') || key.includes('kilimanjaro')) return desktopLangueFormulaVisuals[2]
  return desktopLangueFormulaVisuals[Math.min(Math.max(fallbackIndex, 0), desktopLangueFormulaVisuals.length - 1)]!
}
