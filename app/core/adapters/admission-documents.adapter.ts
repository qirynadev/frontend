import type { AdmissionDocumentsState } from '../contracts/admission'
import { asRecord, bool } from './primitives'

/** Chemin relatif (`client-documents/...`) → URL absolue de téléchargement. */
function toDownloadUrl(path: unknown, storageBaseUrl: string): string | null {
  if (typeof path !== 'string' || path.trim() === '') return null
  return `${storageBaseUrl}${path.replace(/^\/+/, '')}`
}

/**
 * Retrouve, dans `additional_documents` (tableau de chemins sans métadonnée),
 * celui qu'on a envoyé pour `tag` — reconnu par le préfixe qu'on ajoute
 * nous-mêmes au nom de fichier avant l'envoi (`admissionDocumentsRepo.store`).
 * Le back-office ne fait que « sluggifier » ce nom (`Helper::getFileName`) :
 * le préfixe survit tel quel dans le chemin stocké.
 */
function findAdditionalUrl(paths: unknown, tag: 'diploma' | 'recommendation', storageBaseUrl: string): string | null {
  if (!Array.isArray(paths)) return null
  const pattern = new RegExp(`/additional_\\d+_\\d+_${tag}`)
  const match = paths.find((path): path is string => typeof path === 'string' && pattern.test(path))
  return match ? toDownloadUrl(match, storageBaseUrl) : null
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
    idDocumentUrl: toDownloadUrl(source.id_document_path, storageBaseUrl),
    transcriptsUrl: toDownloadUrl(source.transcripts_path, storageBaseUrl),
    languageCertificateUrl: toDownloadUrl(source.language_certificate_path, storageBaseUrl),
    coverLetterUrl: toDownloadUrl(source.cover_letter_path, storageBaseUrl),
    diplomaUrl: findAdditionalUrl(source.additional_documents, 'diploma', storageBaseUrl),
    recommendationUrl: findAdditionalUrl(source.additional_documents, 'recommendation', storageBaseUrl),
  }
}
