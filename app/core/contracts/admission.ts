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
 * Les six pièces ont chacune leur colonne dédiée côté API (`id_document_path`,
 * `transcripts_path`, `language_certificate_path`, `cover_letter_path`,
 * `diploma_path`, `recommendation_path` — les deux derniers depuis le
 * 2026-08-28, `qiryna-backoffice` commit `1b38ef2` ; avant ça, `diploma`/
 * `recommendation` transitaient par `additional_documents` avec un préfixe de
 * nom de fichier fragile, voir l'historique de `docs/directives-backend.md`
 * §13.2 pour ce que ça a remplacé).
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
   * `is_complete` — devenu un verrouillage **explicite** depuis
   * `qiryna-backoffice` `1b38ef2` (2026-08-28, `docs/directives-backend.md`
   * §13.1) : un envoi sans `finalize=true` enregistre les pièces fournies
   * sans clôturer le dossier (le client peut revenir compléter/remplacer).
   * Seul `finalize=true` (bouton « Finaliser mon dossier ») pose `locked`, et
   * l'API refuse alors tout envoi suivant (`already-submitted`, 400).
   */
  locked: boolean
  /** `completed_at`, une fois le dossier finalisé — `null` sinon. */
  finalizedAt: string | null
  idDocumentUrl: string | null
  transcriptsUrl: string | null
  languageCertificateUrl: string | null
  coverLetterUrl: string | null
  diplomaUrl: string | null
  recommendationUrl: string | null
}
