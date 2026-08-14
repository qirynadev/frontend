import type { AdmissionData } from '~/core/contracts/admission'

/**
 * Données d'admission d'école.
 *
 * Implémentation initiale avec données d'essai tirées de la maquette
 * mon-projet-admission.html.
 */
export function useAdmissionData(): { data: Ref<AdmissionData> } {
  const data = ref<AdmissionData>({
    school: {
      name: 'ESA Paris',
      program: 'MBA Management International',
      statusKey: 'admission.statusCurrent',
      entryDate: 'Septembre 2026',
      progressPercent: 80,
      advisorName: 'Sarah Kouamé',
      lastUpdateKey: 'admission.updatedYesterday',
    },
    steps: [
      {
        id: '1',
        stepNumber: 1,
        titleKey: 'admission.step1Title',
        descKey: 'admission.step1Desc',
        status: 'done',
        completedAt: '10/05/2024',
      },
      {
        id: '2',
        stepNumber: 2,
        titleKey: 'admission.step2Title',
        descKey: 'admission.step2Desc',
        status: 'done',
        completedAt: '12/05/2024',
      },
      {
        id: '3',
        stepNumber: 3,
        titleKey: 'admission.step3Title',
        descKey: 'admission.step3Desc',
        status: 'done',
        completedAt: '15/05/2024',
      },
      {
        id: '4',
        stepNumber: 4,
        titleKey: 'admission.step4Title',
        descKey: 'admission.step4Desc',
        status: 'current',
      },
      {
        id: '5',
        stepNumber: 5,
        titleKey: 'admission.step5Title',
        descKey: 'admission.step5Desc',
        status: 'upcoming',
      },
      {
        id: '6',
        stepNumber: 6,
        titleKey: 'admission.step6Title',
        descKey: 'admission.step6Desc',
        status: 'upcoming',
      },
      {
        id: '7',
        stepNumber: 7,
        titleKey: 'admission.step7Title',
        descKey: 'admission.step7Desc',
        status: 'upcoming',
      },
    ],
    documents: [
      {
        id: 'passport',
        titleKey: 'admission.docPassport',
        required: true,
        fileType: 'pdf',
        fileCount: 1,
        status: 'validated',
        icon: '/img/icons/ic-mpa-doc-passport.png',
      },
      {
        id: 'diploma',
        titleKey: 'admission.docDiploma',
        required: true,
        fileType: 'pdf',
        fileCount: 1,
        status: 'validated',
        icon: '/img/icons/ic-mpa-doc-diploma.png',
      },
      {
        id: 'grades',
        titleKey: 'admission.docGrades',
        required: true,
        fileType: 'pdf',
        fileCount: 2,
        status: 'validated',
        icon: '/img/icons/ic-mpa-doc-grades.png',
      },
      {
        id: 'language',
        titleKey: 'admission.docLanguage',
        required: false,
        fileType: 'pdf',
        fileCount: 1,
        status: 'pending',
        icon: '/img/icons/ic-mpa-doc-language.png',
      },
      {
        id: 'letter',
        titleKey: 'admission.docLetter',
        required: false,
        fileType: 'pdf',
        fileCount: 1,
        status: 'upload',
        icon: '/img/icons/ic-mpa-doc-letter.png',
      },
      {
        id: 'recommendation',
        titleKey: 'admission.docRecommendation',
        required: false,
        fileType: 'pdf',
        fileCount: 1,
        status: 'upload',
        icon: '/img/icons/ic-mpa-doc-recommendation.png',
      },
    ],
  })

  return { data }
}
