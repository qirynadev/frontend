import type { AdmissionDocumentsState } from '../contracts/admission'
import { asRecord, bool, toIsoDate } from './primitives'

/** Chemin relatif (`client-documents/...`) → URL absolue de téléchargement. */
function toDownloadUrl(path: unknown, storageBaseUrl: string): string | null {
  if (typeof path !== 'string' || path.trim() === '') return null
  return `${storageBaseUrl}${path.replace(/^\/+/, '')}`
}

/**
 * `GET/POST /client-data/{show,store}` → `data` (déjà déballé de son enveloppe
 * par `unwrapEnvelope`), `null` si le client n'a encore rien envoyé pour cette
 * commande.
 */
export function toAdmissionDocumentsState(raw: unknown, storageBaseUrl: string): AdmissionDocumentsState {
  if (raw === null || raw === undefined) {
    return {
      locked: false,
      finalizedAt: null,
      idDocumentUrl: null,
      transcriptsUrl: null,
      languageCertificateUrl: null,
      coverLetterUrl: null,
      diplomaUrl: null,
      recommendationUrl: null,
    }
  }

  const source = asRecord(raw)
  return {
    locked: bool(source, 'is_complete', false),
    finalizedAt: toIsoDate(source.completed_at),
    idDocumentUrl: toDownloadUrl(source.id_document_path, storageBaseUrl),
    transcriptsUrl: toDownloadUrl(source.transcripts_path, storageBaseUrl),
    languageCertificateUrl: toDownloadUrl(source.language_certificate_path, storageBaseUrl),
    coverLetterUrl: toDownloadUrl(source.cover_letter_path, storageBaseUrl),
    diplomaUrl: toDownloadUrl(source.diploma_path, storageBaseUrl),
    recommendationUrl: toDownloadUrl(source.recommendation_path, storageBaseUrl),
  }
}
