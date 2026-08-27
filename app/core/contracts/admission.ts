export type AdmissionStepStatus = 'done' | 'current' | 'upcoming'
export type DocumentStatus = 'validated' | 'pending' | 'upload'

export interface AdmissionStep {
  id: string
  stepNumber: number
  titleKey: string
  descKey: string
  status: AdmissionStepStatus
  completedAt?: string
}

/**
 * Champ où envoyer une pièce lors du `POST /client-data/store`.
 *
 * Quatre pièces ont une colonne dédiée côté API (`id_document`, `transcripts`,
 * `language_certificate`, `cover_letter`) — le nom du champ suffit. Les deux
 * autres (`diploma`, `recommendation`) n'ont **aucune** colonne : elles vivent
 * dans `additional_documents` (tableau de chemins sans métadonnée) et ne sont
 * distinguées que par un préfixe qu'on ajoute nous-mêmes au nom du fichier
 * avant l'envoi — voir `admissionDocumentsRepo.store` et
 * `docs/directives-backend.md` pour la limite que ça implique.
 */
export type AdmissionDocumentField = 'id_document' | 'transcripts' | 'language_certificate' | 'cover_letter' | 'diploma' | 'recommendation'

export interface AdmissionDocument {
  id: string
  titleKey: string
  required: boolean
  fileType: string
  fileCount?: number
  status: DocumentStatus
  icon: string
  /** Champ du formulaire multipart à renseigner pour envoyer cette pièce. */
  formField: AdmissionDocumentField
  /** URL de téléchargement une fois la pièce envoyée, `null` sinon. */
  downloadUrl: string | null
}

/**
 * `ClientPostPurchaseData` d'une commande, réduit à ce que l'onglet Document
 * affiche — traduit depuis `GET/POST /client-data/{show,store}` par
 * `toAdmissionDocumentsState`.
 */
export interface AdmissionDocumentsState {
  /**
   * `is_complete` — une fois vrai, l'API refuse tout nouvel envoi pour cette
   * commande (`already-submitted`, 400), même partiel. Contrainte du back-office,
   * pas du front : voir `docs/directives-backend.md`.
   */
  locked: boolean
  idDocumentUrl: string | null
  transcriptsUrl: string | null
  languageCertificateUrl: string | null
  coverLetterUrl: string | null
  diplomaUrl: string | null
  recommendationUrl: string | null
}
