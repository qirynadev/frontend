import type { AdmissionDocumentsState } from '~~/app/core/contracts/admission'
import { toAdmissionDocumentsState } from '~~/app/core/adapters'

/**
 * Reçoit le `multipart/form-data` du navigateur (`admissionDocumentsRepo.
 * uploadDocument`/`finalize` — une pièce ou `finalize=true` sans fichier, les
 * deux passent par cette même route générique) et le relaie vers `POST
 * /client-data/store` — un second multipart, pas un simple passthrough :
 * Nitro a déjà consommé le corps de la requête entrante en le parsant
 * (`readMultipartFormData`), impossible de le retransmettre tel quel.
 */
export default defineEventHandler(async (event): Promise<AdmissionDocumentsState> => {
  const client = authClient(event)
  const parts = await readMultipartFormData(event)

  if (!parts || parts.length === 0) {
    throw createError({ statusCode: 422, statusMessage: 'Fichier requis' })
  }

  const form = new FormData()
  for (const part of parts) {
    if (!part.name) continue

    if (part.filename) {
      form.append(part.name, new Blob([part.data], { type: part.type ?? 'application/octet-stream' }), part.filename)
    }
    else {
      form.append(part.name, part.data.toString('utf-8'))
    }
  }

  try {
    const raw = await client.request('/client-data/store', { method: 'POST', body: form })
    return toAdmissionDocumentsState(raw, storageBaseUrl(event))
  }
  catch (error) {
    rethrowApiError(error)
  }
})
