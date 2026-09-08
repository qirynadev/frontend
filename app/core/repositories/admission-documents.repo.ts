import type { AdmissionDocumentField, AdmissionDocumentsState } from '../contracts/admission'
import { bffFetch } from '../http/client'

/**
 * Pièces jointes de l'onglet Document (`mon-projet/admission`) —
 * `ClientPostPurchaseData` côté back-office, `service_type: 'area'`.
 *
 * Depuis `qiryna-backoffice` `1b38ef2` (2026-08-28), l'envoi d'une pièce et le
 * verrouillage du dossier sont deux actions **découplées** : `uploadDocument`
 * enregistre une pièce sans rien clôturer (le client peut revenir en
 * envoyer/remplacer d'autres), `finalize` clôture explicitement le dossier
 * (`is_complete`) — après quoi l'API refuse tout nouvel envoi
 * (`already-submitted`, 400). Voir `docs/directives-backend.md` §13.
 */
export const admissionDocumentsRepo = {
  show(orderId: string, locale?: string): Promise<AdmissionDocumentsState> {
    return bffFetch<AdmissionDocumentsState>('/admission/documents', { query: { orderId }, locale })
  },

  /** Envoie une seule pièce. N'a aucun effet sur le verrouillage du dossier. */
  uploadDocument(orderId: string, field: AdmissionDocumentField, file: File, locale?: string): Promise<AdmissionDocumentsState> {
    const form = new FormData()
    form.append('order_id', orderId)
    form.append(field, file)
    return bffFetch<AdmissionDocumentsState>('/admission/documents', { method: 'POST', body: form, locale })
  },

  /** Clôture définitivement le dossier — plus aucun envoi possible ensuite. */
  finalize(orderId: string, locale?: string): Promise<AdmissionDocumentsState> {
    const form = new FormData()
    form.append('order_id', orderId)
    // La règle de validation Laravel `boolean` n'accepte que `0`/`1`/`true`/
    // `false` au sens strict — la chaîne `'true'` d'un champ multipart est
    // rejetée (422 « doit être vrai ou faux »), vérifié en direct.
    form.append('finalize', '1')
    return bffFetch<AdmissionDocumentsState>('/admission/documents', { method: 'POST', body: form, locale })
  },
}
