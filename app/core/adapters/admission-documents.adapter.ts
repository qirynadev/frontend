import type { AdmissionDocumentsState } from '../contracts/admission'
import { asRecord, bool, str, toIsoDate } from './primitives'

/**
 * Adresse d'ouverture d'une pièce envoyée, `null` si elle ne l'est pas. Passe par
 * le BFF, qui obtient un lien signé à chaque clic : les pièces sont sur un disque
 * privé, sans URL publique (2026-11-01).
 */
function toDocumentUrl(path: unknown, orderId: string, type: string): string | null {
  if (typeof path !== 'string' || path.trim() === '' || orderId === '') return null
  return `/api/bff/admission/documents/file?orderId=${encodeURIComponent(orderId)}&type=${type}`
}

/**
 * `GET/POST /client-data/{show,store}` → `data` (déjà déballé de son enveloppe
 * par `unwrapEnvelope`), `null` si le client n'a encore rien envoyé pour cette
 * commande.
 */
export function toAdmissionDocumentsState(raw: unknown): AdmissionDocumentsState {
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
  const orderId = str(source, 'order_id')
  return {
    locked: bool(source, 'is_complete', false),
    finalizedAt: toIsoDate(source.completed_at),
    idDocumentUrl: toDocumentUrl(source.id_document_path, orderId, 'id_document'),
    transcriptsUrl: toDocumentUrl(source.transcripts_path, orderId, 'transcripts'),
    languageCertificateUrl: toDocumentUrl(source.language_certificate_path, orderId, 'language_certificate'),
    coverLetterUrl: toDocumentUrl(source.cover_letter_path, orderId, 'cover_letter'),
    diplomaUrl: toDocumentUrl(source.diploma_path, orderId, 'diploma'),
    recommendationUrl: toDocumentUrl(source.recommendation_path, orderId, 'recommendation'),
  }
}
