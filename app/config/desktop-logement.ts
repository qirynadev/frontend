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

/**
 * Types de logement de la page Logement desktop. `accommodationType` : valeur
 * transmise avec la commande (`options.accommodation_type`), celle du
 * formulaire de collecte d'après achat, qu'elle préremplit (2026-10-03).
 */
export const desktopLogementTypes = [
  { id: 'appart', accommodationType: 'apartment', icon: 'type-appart.svg', iconBg: 'bg-[#fff7ed]', titleKey: 'desktop.logement.typeAppart', descKey: 'desktop.logement.typeAppartDesc' },
  { id: 'coloc', accommodationType: 'shared', icon: 'type-colo.svg', iconBg: 'bg-[#faf5ff]', titleKey: 'desktop.logement.typeColoc', descKey: 'desktop.logement.typeColocDesc' },
  { id: 'residence', accommodationType: 'dormitory', icon: 'type-residence.svg', iconBg: 'bg-[#f0fdf4]', titleKey: 'desktop.logement.typeResidence', descKey: 'desktop.logement.typeResidenceDesc' },
] as const

export const desktopLogementMethod = [
  { id: 'besoin', icon: 'step-besoin.svg', bg: 'bg-[#faf5ff]', iconColor: 'bg-[#9333ea]', titleKey: 'housing.intro.step1', descKey: 'desktop.paySuccess.housing.step1Desc' },
  { id: 'sourcing', icon: 'step-sourcing.svg', bg: 'bg-[#f0fdf4]', iconColor: 'bg-[#16a34a]', titleKey: 'housing.intro.step2', descKey: 'desktop.paySuccess.housing.step2Desc' },
  { id: 'propositions', icon: 'step-propositions.svg', bg: 'bg-[#fef2f2]', iconColor: 'bg-[#ed1c24]', titleKey: 'housing.intro.step3', descKey: 'desktop.paySuccess.housing.step3Desc' },
  { id: 'bail', icon: 'step-bail.svg', bg: 'bg-[#eff6ff]', iconColor: 'bg-[#2563eb]', titleKey: 'housing.intro.step4', descKey: 'desktop.paySuccess.housing.step4Desc' },
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
