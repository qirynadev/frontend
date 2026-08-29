import type { AdmissionDocument, AdmissionDocumentsState, AdmissionStep, AdmissionStepStatus } from '~/core/contracts/admission'
import type { OrderChecklistItem, OrderStatus } from '~/core/contracts'
import { admissionDocumentsRepo, paymentRepo } from '~/core/repositories'

/**
 * Statut affiché pour une pièce.
 *
 * Tant que le dossier n'est **pas** finalisé (`!locked`), une pièce envoyée
 * reste modifiable (le client peut la remplacer) : `pending` ne veut alors
 * dire que « déjà envoyée », pas « en cours de vérification ».
 *
 * Une fois finalisé, il n'existe aucun suivi de vérification **par pièce**
 * côté back-office (ni API, ni back-office lui-même : `Order/Edit.vue` ne
 * propose qu'un statut de *commande* — « Vérifié »/« En attente de
 * vérification »/« Annulé », voir `docs/directives-backend.md`). On réutilise
 * donc ce statut de commande, déjà lu par `paymentRepo.orders()`
 * (`Order.status`) — une approximation honnête (dérivée d'un champ réel),
 * pas une vérité par document.
 */
function toDocumentStatus(uploaded: boolean, locked: boolean, orderStatus: OrderStatus): AdmissionDocument['status'] {
  if (!uploaded) return 'upload'
  if (!locked) return 'pending'
  return orderStatus === 'confirmed' ? 'validated' : 'pending'
}

function toAdmissionDocuments(state: AdmissionDocumentsState, orderStatus: OrderStatus): AdmissionDocument[] {
  const { locked } = state
  return [
    { id: 'passport', titleKey: 'admission.docPassport', required: true, fileType: 'pdf', icon: '/img/icons/ic-mpa-doc-passport.png', formField: 'id_document', status: toDocumentStatus(state.idDocumentUrl !== null, locked, orderStatus), downloadUrl: state.idDocumentUrl },
    { id: 'diploma', titleKey: 'admission.docDiploma', required: true, fileType: 'pdf', icon: '/img/icons/ic-mpa-doc-diploma.png', formField: 'diploma', status: toDocumentStatus(state.diplomaUrl !== null, locked, orderStatus), downloadUrl: state.diplomaUrl },
    { id: 'grades', titleKey: 'admission.docGrades', required: true, fileType: 'pdf', icon: '/img/icons/ic-mpa-doc-grades.png', formField: 'transcripts', status: toDocumentStatus(state.transcriptsUrl !== null, locked, orderStatus), downloadUrl: state.transcriptsUrl },
    { id: 'language', titleKey: 'admission.docLanguage', required: false, fileType: 'pdf', icon: '/img/icons/ic-mpa-doc-language.png', formField: 'language_certificate', status: toDocumentStatus(state.languageCertificateUrl !== null, locked, orderStatus), downloadUrl: state.languageCertificateUrl },
    { id: 'letter', titleKey: 'admission.docLetter', required: false, fileType: 'pdf', icon: '/img/icons/ic-mpa-doc-letter.png', formField: 'cover_letter', status: toDocumentStatus(state.coverLetterUrl !== null, locked, orderStatus), downloadUrl: state.coverLetterUrl },
    { id: 'recommendation', titleKey: 'admission.docRecommendation', required: false, fileType: 'pdf', icon: '/img/icons/ic-mpa-doc-recommendation.png', formField: 'recommendation', status: toDocumentStatus(state.recommendationUrl !== null, locked, orderStatus), downloadUrl: state.recommendationUrl },
  ]
}

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
 * L'onglet Document (dépôt de pièces) est câblé sur `ClientPostPurchaseData`
 * (`GET/POST /client-data/{show,store}`, `service_type: 'area'`) via
 * `admissionDocumentsRepo`. Les six pièces ont chacune leur colonne dédiée
 * (`diploma`/`recommendation` depuis `qiryna-backoffice` `1b38ef2`,
 * 2026-08-28) et l'envoi ne verrouille plus le dossier automatiquement — le
 * client peut envoyer/remplacer ses pièces une à une, puis finaliser
 * explicitement (`admissionDocumentsRepo.finalize`) quand il a terminé.
 */
export async function useAdmissionData(locale: Ref<string>) {
  return usePageData(
    'mon-projet-admission',
    async () => {
      const orders = await paymentRepo.orders(locale.value)
      const order = orders
        .filter((candidate) => candidate.serviceType === 'areaofstudy')
        .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))[0] ?? null

      const documentsState = order
        ? await admissionDocumentsRepo.show(order.id, locale.value)
        : { locked: false, finalizedAt: null, idDocumentUrl: null, transcriptsUrl: null, languageCertificateUrl: null, coverLetterUrl: null, diplomaUrl: null, recommendationUrl: null }

      return {
        order,
        steps: order ? toAdmissionSteps(order.checklist) : [],
        documents: order ? toAdmissionDocuments(documentsState, order.status) : [],
        documentsLocked: documentsState.locked,
        documentsFinalizedAt: documentsState.finalizedAt ? toFrenchDate(documentsState.finalizedAt) : null,
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
