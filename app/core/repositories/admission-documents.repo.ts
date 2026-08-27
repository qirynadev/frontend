import type { AdmissionDocumentField, AdmissionDocumentsState } from '../contracts/admission'
import { bffFetch } from '../http/client'

/** Les quatre pièces qui ont une colonne dédiée côté `ClientPostPurchaseData`. */
const DEDICATED_FIELDS = new Set<AdmissionDocumentField>(['id_document', 'transcripts', 'language_certificate', 'cover_letter'])

/**
 * Construit le `multipart/form-data` de `POST /client-data/store`.
 *
 * `diploma`/`recommendation` n'ont pas de colonne dédiée : envoyés dans
 * `additional_documents[]`, le nom de fichier préfixé par le tag pour rester
 * identifiables au retour (voir `toAdmissionDocumentsState`).
 */
function buildFormData(orderId: string, files: Partial<Record<AdmissionDocumentField, File>>): FormData {
  const form = new FormData()
  form.append('order_id', orderId)

  for (const [field, file] of Object.entries(files) as [AdmissionDocumentField, File | undefined][]) {
    if (!file) continue

    if (DEDICATED_FIELDS.has(field)) {
      form.append(field, file)
    }
    else {
      const tagged = new File([file], `${field}__${file.name}`, { type: file.type })
      form.append('additional_documents[]', tagged)
    }
  }

  return form
}

/**
 * Pièces jointes de l'onglet Document (`mon-projet/admission`) —
 * `ClientPostPurchaseData` côté back-office, `service_type: 'area'`.
 *
 * **Envoi unique** : `POST /client-data/store` marque la commande
 * `is_complete: true` dès le premier appel réussi, quel que soit le nombre de
 * fichiers fournis — l'API refuse tout envoi suivant (`already-submitted`).
 * `store` ne doit donc être appelé qu'une fois, avec tous les fichiers que le
 * client a au moment de l'envoi. Voir `docs/directives-backend.md`.
 */
export const admissionDocumentsRepo = {
  show(orderId: string, locale?: string): Promise<AdmissionDocumentsState> {
    return bffFetch<AdmissionDocumentsState>('/admission/documents', { query: { orderId }, locale })
  },

  store(orderId: string, files: Partial<Record<AdmissionDocumentField, File>>, locale?: string): Promise<AdmissionDocumentsState> {
    return bffFetch<AdmissionDocumentsState>('/admission/documents', {
      method: 'POST',
      body: buildFormData(orderId, files),
      locale,
    })
  },
}
