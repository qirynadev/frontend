import type { AdmissionDocument, AdmissionDocumentField } from '~/core/contracts/admission'
import { admissionDocumentsRepo } from '~/core/repositories'

/**
 * Envoi pièce par pièce et finalisation du dossier d'admission — partagé par
 * l'onglet Document mobile (`MpaDocsCard`) et desktop (`mon-projet-admission`).
 * `onChanged` est appelé après un envoi ou une finalisation réussis : le
 * parent recharge alors `admissionDocumentsRepo.show`.
 */
export function useAdmissionDocumentActions(options: {
  orderId: () => string
  documents: () => AdmissionDocument[]
  onChanged: () => void
}) {
  const { locale } = useI18n()

  const uploading = ref<Partial<Record<AdmissionDocumentField, boolean>>>({})
  const uploadError = ref<Partial<Record<AdmissionDocumentField, boolean>>>({})

  async function onPick(field: AdmissionDocumentField, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    uploading.value = { ...uploading.value, [field]: true }
    uploadError.value = { ...uploadError.value, [field]: false }
    try {
      await admissionDocumentsRepo.uploadDocument(options.orderId(), field, file, locale.value)
      options.onChanged()
    }
    catch {
      uploadError.value = { ...uploadError.value, [field]: true }
    }
    finally {
      uploading.value = { ...uploading.value, [field]: false }
      // Permet de resélectionner le même fichier (ex. après un échec) — sans ça,
      // le navigateur ne redéclenche pas `change` pour une valeur inchangée.
      input.value = ''
    }
  }

  /** Les pièces requises doivent toutes être envoyées avant de pouvoir finaliser. */
  const missingRequired = computed(() => options.documents().some(doc => doc.required && doc.status === 'upload'))

  const finalizing = ref(false)
  const finalizeError = ref(false)

  async function onFinalize(): Promise<void> {
    if (finalizing.value || missingRequired.value) return

    finalizing.value = true
    finalizeError.value = false
    try {
      await admissionDocumentsRepo.finalize(options.orderId(), locale.value)
      options.onChanged()
    }
    catch {
      finalizeError.value = true
    }
    finally {
      finalizing.value = false
    }
  }

  return { uploading, uploadError, onPick, missingRequired, finalizing, finalizeError, onFinalize }
}
