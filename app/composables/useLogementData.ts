import type { LogementStep } from '~/core/contracts/logement'

/**
 * Étapes de l'accompagnement logement.
 *
 * Données d'essai reprises de `mon-projet-logement.html` : l'API n'expose pas
 * encore cette chronologie.
 */
export function useLogementData(): { steps: Ref<LogementStep[]>, progressPercent: Ref<number> } {
  const steps = ref<LogementStep[]>([
    { id: 'paiement', stepNumber: 1, titleKey: 'projectHousing.stepPayment', status: 'done', completedAt: '18 mai 2024', icon: '/img/icons/step1-payment-full.svg' },
    { id: 'logement', stepNumber: 2, titleKey: 'projectHousing.stepHousing', status: 'done', completedAt: '22 mai 2024', icon: '/img/icons/step2-house-full.svg' },
    { id: 'fiche-logement', stepNumber: 3, titleKey: 'projectHousing.stepHousingSheet', status: 'done', completedAt: '27 mai 2024', icon: '/img/icons/step3-doc-full.svg' },
    { id: 'fiche-quartier', stepNumber: 4, titleKey: 'projectHousing.stepAreaSheet', status: 'done', completedAt: '29 mai 2024', icon: '/img/icons/step4-map-full.svg' },
    { id: 'caution', stepNumber: 5, titleKey: 'projectHousing.stepDeposit', status: 'current', icon: '/img/icons/step5-shield-full.svg' },
    { id: 'contrat', stepNumber: 6, titleKey: 'projectHousing.stepContract', status: 'current', icon: '/img/icons/step6-contract-full.svg' },
    { id: 'taxi', stepNumber: 7, titleKey: 'projectHousing.stepTaxi', status: 'upcoming', icon: '/img/icons/step7-taxi-full.svg' },
    { id: 'sim', stepNumber: 8, titleKey: 'projectHousing.stepSim', status: 'upcoming', icon: '/img/icons/step8-sim-full.svg' },
    { id: 'admin', stepNumber: 9, titleKey: 'projectHousing.stepAdmin', status: 'upcoming', icon: '/img/icons/step9-admin-full.svg' },
  ])

  return { steps, progressPercent: ref(75) }
}
