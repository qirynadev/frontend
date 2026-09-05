import { asRecord, str } from '~~/app/core/adapters'

/**
 * `reglages/mot-de-passe.vue` → `POST /user/update-password` (authentifié).
 *
 * `AuthController::updateUserPassword` attend `oldPassword`/`newPassword`
 * tels quels (mêmes noms, pas de conversion snake_case ici) et renvoie
 * `{ success: "..." }` — ou une erreur 400 `{ error: "Mot de passe incorrect" }`
 * si l'ancien mot de passe ne correspond pas, relayée telle quelle par
 * `rethrowApiError` (déjà lisible par `ApiError.message` côté client).
 */
export default defineEventHandler(async (event): Promise<{ ok: true }> => {
  const client = authClient(event)
  const body = asRecord(await readBody(event).catch(() => ({})))

  const oldPassword = str(body, 'oldPassword')
  const newPassword = str(body, 'newPassword')

  if (oldPassword === '' || newPassword === '') {
    throw createError({ statusCode: 422, statusMessage: 'Formulaire incomplet' })
  }

  try {
    await client.request('/user/update-password', { method: 'POST', body: { oldPassword, newPassword } })
  }
  catch (error) {
    rethrowApiError(error)
  }

  return { ok: true }
})
