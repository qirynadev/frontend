import type { AdmissionDocument, AdmissionDocumentsState, AdmissionStep, AdmissionStepStatus } from '~/core/contracts/admission'
import type { OrderChecklistItem, OrderStatus } from '~/core/contracts'
import { admissionDocumentsRepo, paymentRepo } from '~/core/repositories'

/**
 * Statut affiché pour une pièce déjà envoyée.
 *
 * Il n'existe aucun suivi de vérification **par pièce** côté back-office (ni
 * API, ni back-office lui-même : `Order/Edit.vue` ne propose qu'un statut de
 * *commande* — « Vérifié »/« En attente de vérification »/« Annulé », voir
 * `docs/directives-backend.md`). On réutilise donc ce statut de commande,
 * déjà lu par `paymentRepo.orders()` (`Order.status`) : une pièce envoyée sur
 * une commande encore « en attente de vérification » s'affiche `pending`,
 * sur une commande « Vérifié » s'affiche `validated` — une approximation
 * honnête (dérivée d'un champ réel), pas une vérité par document.
 */
function toDocumentStatus(uploaded: boolean, orderStatus: OrderStatus): AdmissionDocument['status'] {
  if (!uploaded) return 'upload'
  return orderStatus === 'confirmed' ? 'validated' : 'pending'
}

function toAdmissionDocuments(state: AdmissionDocumentsState, orderStatus: OrderStatus): AdmissionDocument[] {
  return [
    { id: 'passport', titleKey: 'admission.docPassport', required: true, fileType: 'pdf', icon: '/img/icons/ic-mpa-doc-passport.png', formField: 'id_document', status: toDocumentStatus(state.idDocumentUrl !== null, orderStatus), downloadUrl: state.idDocumentUrl },
    { id: 'diploma', titleKey: 'admission.docDiploma', required: true, fileType: 'pdf', icon: '/img/icons/ic-mpa-doc-diploma.png', formField: 'diploma', status: toDocumentStatus(state.diplomaUrl !== null, orderStatus), downloadUrl: state.diplomaUrl },
    { id: 'grades', titleKey: 'admission.docGrades', required: true, fileType: 'pdf', icon: '/img/icons/ic-mpa-doc-grades.png', formField: 'transcripts', status: toDocumentStatus(state.transcriptsUrl !== null, orderStatus), downloadUrl: state.transcriptsUrl },
    { id: 'language', titleKey: 'admission.docLanguage', required: false, fileType: 'pdf', icon: '/img/icons/ic-mpa-doc-language.png', formField: 'language_certificate', status: toDocumentStatus(state.languageCertificateUrl !== null, orderStatus), downloadUrl: state.languageCertificateUrl },
    { id: 'letter', titleKey: 'admission.docLetter', required: false, fileType: 'pdf', icon: '/img/icons/ic-mpa-doc-letter.png', formField: 'cover_letter', status: toDocumentStatus(state.coverLetterUrl !== null, orderStatus), downloadUrl: state.coverLetterUrl },
    { id: 'recommendation', titleKey: 'admission.docRecommendation', required: false, fileType: 'pdf', icon: '/img/icons/ic-mpa-doc-recommendation.png', formField: 'recommendation', status: toDocumentStatus(state.recommendationUrl !== null, orderStatus), downloadUrl: state.recommendationUrl },
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
 * `admissionDocumentsRepo` — corrige une conclusion erronée d'une session
 * précédente (« aucun endpoint n'expose ce suivi ») : quatre pièces ont bien
 * une colonne de fichier dédiée (`id_document`, `transcripts`,
 * `language_certificate`, `cover_letter`), vérifié en direct sur
 * `stage.qiryna.com` (upload réel, fichier persisté et téléchargeable). Les
 * deux pièces restantes (`diploma`, `recommendation`) n'ont pas de colonne
 * dédiée et passent par `additional_documents` — voir `toAdmissionDocuments`
 * et `docs/directives-backend.md` pour la limite que ça implique (envoi
 * unique, verrouillé dès le premier envoi).
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
        : { locked: false, idDocumentUrl: null, transcriptsUrl: null, languageCertificateUrl: null, coverLetterUrl: null, diplomaUrl: null, recommendationUrl: null }

      return {
        order,
        steps: order ? toAdmissionSteps(order.checklist) : [],
        documents: order ? toAdmissionDocuments(documentsState, order.status) : [],
        documentsLocked: documentsState.locked,
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
