import type { ProjetAccompagnement } from '~/core/contracts/projet'

/**
 * Accompagnements suivis sur `mon-projet`.
 *
 * Implémentation initiale avec les données d'essai de la maquette
 * `mon-projet.html` : l'API n'expose pas encore ce regroupement (les commandes
 * de `paymentRepo` ne portent ni conseiller, ni progression, ni fraîcheur).
 */
export function useProjetData(): { data: Ref<ProjetAccompagnement[]> } {
  const data = ref<ProjetAccompagnement[]>([
    {
      id: 'admission',
      titleKey: 'myProject.accompaniementAdmissionTitle',
      subKey: 'myProject.accompaniementAdmissionSub',
      statusKey: 'myProject.statusInProgress',
      badgeTone: 'purple',
      progressPercent: 80,
      progressColor: '#4615fd',
      advisorRoleKey: 'myProject.advisorFemale',
      advisorName: 'Sarah Kouamé',
      updatedKey: 'myProject.updatedYesterday',
      icon: '/img/icons/ic-mp-admission.png',
      to: '/mon-projet/admission',
    },
    {
      id: 'logement',
      titleKey: 'myProject.accompaniementLogementTitle',
      subKey: 'myProject.accompaniementLogementSub',
      statusKey: 'myProject.statusInProgress',
      badgeTone: 'green',
      progressPercent: 30,
      progressColor: '#19b64c',
      advisorRoleKey: 'myProject.advisorMale',
      advisorName: 'Idriss Traoré',
      updatedKey: 'myProject.updated2Days',
      icon: '/img/icons/ic-mp-logement.png',
      // `mon-projet/logement` n'est pas encore construit : laisser le lien
      // actif mènerait à un 404. Rebrancher en même temps que l'écran.
      to: null,
    },
    {
      id: 'langues',
      titleKey: 'myProject.accompaniementLanguesTitle',
      subKey: 'myProject.accompaniementLanguesSub',
      statusKey: 'myProject.statusInProgress',
      badgeTone: 'pink',
      progressPercent: 50,
      progressColor: '#fc1f99',
      advisorRoleKey: 'myProject.advisorFemale',
      advisorName: 'Amina Diallo',
      updatedKey: 'myProject.updated1Day',
      icon: '/img/icons/ic-mp-langues.svg',
      // La maquette pointe `#` : l'écran de détail n'existe pas encore.
      to: null,
    },
    {
      id: 'orientation',
      titleKey: 'myProject.accompaniementOrientationTitle',
      subKey: 'myProject.accompaniementOrientationSub',
      statusKey: 'myProject.statusDone',
      badgeTone: 'orange',
      progressPercent: 100,
      progressColor: '#f97316',
      advisorRoleKey: 'myProject.advisorFemale',
      advisorName: 'Marie Konan',
      updatedKey: 'myProject.updated5Days',
      icon: '/img/icons/ic-mp-orientation.png',
      to: '/mon-projet/orientation',
    },
  ])

  return { data }
}
