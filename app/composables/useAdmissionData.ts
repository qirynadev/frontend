import type { AdmissionDocument, AdmissionStep, AdmissionStepStatus } from '~/core/contracts/admission'
import type { OrderChecklistItem } from '~/core/contracts'
import { paymentRepo } from '~/core/repositories'

/**
 * Donnée d'essai tirée de `mon-projet-admission.html`, conservée telle quelle
 * (voir le commentaire de `useAdmissionData` ci-dessous — aucun endpoint réel
 * ne couvre le suivi par pièce).
 */
const DEMO_DOCUMENTS: AdmissionDocument[] = [
  { id: 'passport', titleKey: 'admission.docPassport', required: true, fileType: 'pdf', fileCount: 1, status: 'validated', icon: '/img/icons/ic-mpa-doc-passport.png' },
  { id: 'diploma', titleKey: 'admission.docDiploma', required: true, fileType: 'pdf', fileCount: 1, status: 'validated', icon: '/img/icons/ic-mpa-doc-diploma.png' },
  { id: 'grades', titleKey: 'admission.docGrades', required: true, fileType: 'pdf', fileCount: 2, status: 'validated', icon: '/img/icons/ic-mpa-doc-grades.png' },
  { id: 'language', titleKey: 'admission.docLanguage', required: false, fileType: 'pdf', fileCount: 1, status: 'pending', icon: '/img/icons/ic-mpa-doc-language.png' },
  { id: 'letter', titleKey: 'admission.docLetter', required: false, fileType: 'pdf', fileCount: 1, status: 'upload', icon: '/img/icons/ic-mpa-doc-letter.png' },
  { id: 'recommendation', titleKey: 'admission.docRecommendation', required: false, fileType: 'pdf', fileCount: 1, status: 'upload', icon: '/img/icons/ic-mpa-doc-recommendation.png' },
]

/**
 * Données de suivi d'admission école, pour `mon-projet/admission`.
 *
 * Branché sur `paymentRepo.orders()` (déjà utilisé par `mon-projet/index`) —
 * une commande de type `areaofstudy`, la plus récente si le client en a
 * plusieurs (l'écran n'a qu'une route fixe, sans identifiant de commande ;
 * même limitation déjà documentée dans `useProjetData.ts`).
 *
 * Les 7 étapes de `AreaOfStudy` (`OrderChecklistStepEnum::schoolSteps()`,
 * back-office) sont générées à la **création** de la commande : une commande
 * antérieure à ce mécanisme (15/08/2026) a une `checklist` vide — affichée
 * comme telle, pas comme sept étapes fictives. Les clés `admission.step{1..7}
 * {Title,Desc}` existent déjà et correspondent, dans l'ordre, aux sept étapes
 * réelles (vérifié : « Paiement confirmé » ↔ `payment_confirmed`, etc.) —
 * réutilisées par position plutôt que dupliquées par `stepKey`.
 *
 * Le back-office n'a pas de statut « en cours » distinct de `en attente` : à
 * la création, une seule ligne reçoit ce statut (celle qui suit la dernière
 * `terminé`) — c'est elle que cet écran affiche en tant qu'étape active
 * (`current`), une lecture du statut `pending` plutôt qu'un champ à part.
 *
 * L'onglet Document (types de pièces, statut par pièce validé/en attente/à
 * téléverser) reste sur sa donnée d'essai : aucun endpoint ne l'expose.
 * `ClientPostPurchaseData` existe (`GET /client-data/show`) mais c'est un
 * formulaire à remplir une fois (`diplomas`: noms en texte libre, `additional_
 * documents`: chemins de fichiers bruts, `is_complete`: un seul booléen) — pas
 * un suivi par pièce avec un statut individuel. Rien à brancher sans inventer
 * la donnée manquante.
 */
export async function useAdmissionData(locale: Ref<string>) {
  return usePageData(
    'mon-projet-admission',
    async () => {
      const orders = await paymentRepo.orders(locale.value)
      const order = orders
        .filter((candidate) => candidate.serviceType === 'areaofstudy')
        .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))[0] ?? null

      return {
        order,
        steps: order ? toAdmissionSteps(order.checklist) : [],
        documents: DEMO_DOCUMENTS,
      }
    },
    { watch: [locale] },
  )
}

function toChecklistStatus(status: OrderChecklistItem['status']): AdmissionStepStatus {
  if (status === 'done') return 'done'
  if (status === 'pending') return 'current'
  return 'upcoming'
}

/** `AAAA-MM-JJ` → `JJ/MM/AAAA`, le format que la maquette affiche. */
function toFrenchDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

function toAdmissionSteps(checklist: OrderChecklistItem[]): AdmissionStep[] {
  return checklist.map((item) => ({
    id: item.id,
    stepNumber: item.position,
    titleKey: `admission.step${item.position}Title`,
    descKey: `admission.step${item.position}Desc`,
    status: toChecklistStatus(item.status),
    completedAt: item.completedAt ? toFrenchDate(item.completedAt) : undefined,
  }))
}
