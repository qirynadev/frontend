import type { User } from '~~/app/core/contracts'
import { toUser } from '~~/app/core/adapters'

/**
 * `reglages/informations-personnelles.vue` → `POST /user/update-profile`
 * (authentifié). Reçoit le `multipart/form-data` du navigateur (photo
 * éventuelle) et le relaie — même mécanique que `admission/documents.post.ts`
 * : Nitro a déjà consommé/parsé le corps entrant (`readMultipartFormData`),
 * impossible de le retransmettre tel quel, il faut reconstruire un second
 * `FormData`.
 *
 * Champs attendus par le back-office (`AuthController::updateUserData`) :
 * `first_name`, `last_name`, `lc_country_id`, `phone` (requis),
 * `birthday` (`d/m/Y`, optionnel), `city`/`sex`/`address`/`photo` (optionnels).
 */
export default defineEventHandler(async (event): Promise<User> => {
  const client = authClient(event)
  const parts = await readMultipartFormData(event)

  if (!parts || parts.length === 0) {
    throw createError({ statusCode: 422, statusMessage: 'Formulaire incomplet' })
  }

  const form = new FormData()
  for (const part of parts) {
    if (!part.name) continue

    if (part.filename) {
      // Un champ fichier vide (aucune photo choisie) arrive tout de même comme
      // une partie nommée `photo`, filename compris, mais 0 octet — l'envoyer
      // écraserait la photo existante côté back-office par un fichier vide.
      if (part.data.length === 0) continue
      form.append(part.name, new Blob([part.data], { type: part.type ?? 'application/octet-stream' }), part.filename)
    }
    else {
      form.append(part.name, part.data.toString('utf-8'))
    }
  }

  let raw: unknown
  try {
    raw = await client.request('/user/update-profile', { method: 'POST', body: form })
  }
  catch (error) {
    rethrowApiError(error)
  }

  return toUser((raw as Record<string, unknown> | null)?.user ?? raw)
})
