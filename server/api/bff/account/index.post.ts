import { asRecord, str } from '~~/app/core/adapters'

/**
 * Création de compte.
 *
 * `POST /auth/register` **n'ouvre pas de session** : le back-office envoie un
 * code par e-mail et attend `POST /auth/confirm`. Aucun cookie n'est donc posé
 * ici — c'est `account/confirm` qui le fera.
 *
 * Les erreurs 422 de Laravel remontent avec leurs `errors` indexées par champ :
 * l'écran d'inscription surligne le champ fautif au lieu d'afficher un message
 * générique en bas de formulaire.
 *
 * `lc_country_id: null` **obligatoire** — bug confirmé côté API (2026-08-27) :
 * `AuthController::register` déclare ce champ `nullable` mais y accède ensuite
 * par `$data['lc_country_id']` sans repli, donc une requête qui ne l'envoie
 * pas du tout (notre formulaire ne demande pas le pays) plante en 500
 * (« Undefined array key "lc_country_id" »). Contournement confirmé en
 * direct : l'envoyer explicitement à `null` suffit. Voir
 * `docs/directives-backend.md` pour la correction attendue côté API.
 */
export default defineEventHandler(async (event) => {
  const body = asRecord(await readBody(event))
  const email = str(body, 'email').toLowerCase()
  const password = str(body, 'password')
  const firstName = str(body, 'firstName')
  const lastName = str(body, 'lastName')

  const errors: Record<string, string[]> = {}
  if (email === '') errors.email = ['required']
  if (password === '') errors.password = ['required']
  if (firstName === '') errors.first_name = ['required']
  if (lastName === '') errors.last_name = ['required']

  if (Object.keys(errors).length > 0) {
    throw createError({ statusCode: 422, statusMessage: 'Formulaire incomplet', data: { message: 'Formulaire incomplet', errors } })
  }

  try {
    await publicClient(event).request('/auth/register', {
      method: 'POST',
      body: {
        email,
        password,
        password_confirmation: str(body, 'passwordConfirmation') || password,
        first_name: firstName,
        last_name: lastName,
        phone: str(body, 'phone') || undefined,
        lc_country_id: null,
      },
    })
  }
  catch (error) {
    rethrowAuthError(error)
  }

  // Rien à renvoyer : l'écran suivant demande le code reçu par e-mail.
  return { ok: true, email }
})
