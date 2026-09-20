/**
 * Parcours logement desktop — pas d’artboard 1728.
 * Chrome calqué sur langues / orientation ; données = mobile (`livings` + offres).
 */
export const DESKTOP_LOGEMENT_ASSET = '/img/desktop/home'
export const DESKTOP_LOGEMENT_ICON = '/img/icons/log-sur'

export const desktopLogementPains = [
  { id: 'garant', icon: 'pain-garant.svg', labelKey: 'housing.intro.painGarant' },
  { id: 'visite', icon: 'pain-visite.svg', labelKey: 'housing.intro.painVisite' },
  { id: 'arnaque', icon: 'pain-arnaque.svg', labelKey: 'housing.intro.painArnaque' },
  { id: 'delai', icon: 'pain-delai.svg', labelKey: 'housing.intro.painDelai' },
] as const

export const desktopLogementMethod = [
  { id: 'besoin', icon: 'step-besoin.svg', bg: 'bg-ls-step-1', num: '01', numClass: 'text-ls-step-1', labelKey: 'housing.intro.step1' },
  { id: 'sourcing', icon: 'step-sourcing.svg', bg: 'bg-ls-step-2', num: '02', numClass: 'text-ls-step-2', labelKey: 'housing.intro.step2' },
  { id: 'propositions', icon: 'step-propositions.svg', bg: 'bg-ls-step-3', num: '03', numClass: 'text-ls-step-3', labelKey: 'housing.intro.step3' },
  { id: 'bail', icon: 'step-bail.svg', bg: 'bg-ls-step-4', num: '04', numClass: 'text-ls-step-4', labelKey: 'housing.intro.step4' },
] as const

export const desktopLogementTrusts = [
  { icon: 'house-choice.svg', bg: 'bg-[#fff7ed]', titleKey: 'desktop.home.housing.c1', descKey: 'desktop.home.housing.c1desc' },
  { icon: 'house-secure.svg', bg: 'bg-[#ecf8ef]', titleKey: 'desktop.home.housing.c2', descKey: 'desktop.home.housing.c2desc' },
  { icon: 'house-support.svg', bg: 'bg-[#fef0e5]', titleKey: 'desktop.home.housing.c3', descKey: 'desktop.home.housing.c3desc' },
] as const

/** Habillage formules par rang — même logique que le mobile Yukon / Comoé / Volga. */
export function desktopLogementFormulaVisual(index: number, total: number) {
  if (total > 1 && index === total - 1) {
    return {
      card: 'border-[#fed7aa]',
      name: 'text-[#ea580c]',
      price: 'text-[#ea580c]',
      button: 'border-0 bg-[#ea580c] text-white',
      iconBg: 'bg-[#fff7ed]',
      icon: 'type-colo.svg',
      check: '/img/desktop/langues/formules/check-red.svg',
      popular: true,
    }
  }
  if (index === 0) {
    return {
      card: 'border-[#bbf7d0]',
      name: 'text-[#149841]',
      price: 'text-[#149841]',
      button: 'border border-[#bbf7d0] bg-white text-[#16a34a]',
      iconBg: 'bg-[#f0fdf4]',
      icon: 'type-appart.svg',
      check: '/img/desktop/langues/formules/check-green.svg',
      popular: false,
    }
  }
  return {
    card: 'border-[#e9d5ff]',
    name: 'text-[#7c3aed]',
    price: 'text-[#7c3aed]',
    button: 'border border-[#e9d5ff] bg-white text-[#7c3aed]',
    iconBg: 'bg-[#faf5ff]',
    icon: 'type-residence.svg',
    check: '/img/desktop/langues/formules/check-purple.svg',
    popular: false,
  }
}
