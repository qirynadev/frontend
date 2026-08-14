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
      },
    })
  }
  catch (error) {
    rethrowAuthError(error)
  }

  // Rien à renvoyer : l'écran suivant demande le code reçu par e-mail.
  return { ok: true, email }
})
