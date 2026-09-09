import type { SocialAuthOutcome, SocialProvider } from '~~/app/core/contracts'
import { asRecord, str, toSocialAuthResult } from '~~/app/core/adapters'

const PROVIDERS: SocialProvider[] = ['google', 'facebook', 'linkedin']

/**
 * Authentification par un fournisseur tiers.
 *
 * Le jeton OAuth obtenu dans le navigateur est **échangé côté serveur** contre
 * un jeton de session, qui ne quitte jamais Nitro. Trois routes du back-office
 * sont couvertes, avec un aiguillage repris de l'ancien front :
 *
 * | `mode` | Endpoint | Quand |
 * |---|---|---|
 * | `login` | `/auth/social/login` puis `/auth/social/register` si « not found » | écran de connexion |
 * | `register` | `/auth/social/register` | écran d'inscription |
 * | `link` | `/auth/social/register` avec `confirm_link: true` | l'utilisateur a confirmé la liaison |
 *
 * L'essai `login` → `register` n'est pas une élégance : `/auth/social/login`
 * répond « User not found » à la **première** connexion tierce d'un compte, et
 * s'arrêter là interdirait de créer un compte depuis l'écran de connexion.
 *
 * LinkedIn fait exception : le navigateur n'obtient qu'un `code` d'autorisation
 * (pas de jeton), échangé par `/auth/social/linkedin`. Ce `code` est à usage
 * unique (OAuth) : si la liaison demande une confirmation, le back-office l'a
 * déjà consommé et renvoie un `confirm_token` (voir `SocialLinkRequest`) à la
 * place — c'est lui qu'on renvoie pour finaliser, jamais le `code` d'origine.
 *
 * `unwrap: false` sur les appels à `/auth/social/register` (trouvé en
 * l'auditant, 2026-08-30, avant même d'avoir des identifiants OAuth réels à
 * tester) : sa réponse « e-mail déjà utilisé, confirmer le rattachement »
 * est `{ success, requires_confirmation, message, data }` — `unwrapEnvelope`
 * (voir `api-client.ts`) la confondrait sinon avec l'enveloppe Laravel
 * habituelle et ne garderait que `data`, perdant `requires_confirmation` en
 * route. `toSocialAuthResult` attend justement la forme complète.
 *
 * ⚠️ Quotas du back-office : 10 requêtes/minute sur `login`, 5 sur `register`.
 */
export default defineEventHandler(async (event): Promise<SocialAuthOutcome> => {
  const body = asRecord(await readBody(event))
  const provider = str(body, 'provider') as SocialProvider
  const token = str(body, 'token')
  const code = str(body, 'code')
  const redirectUri = str(body, 'redirectUri')
  const confirmToken = str(body, 'confirmToken')
  const mode = str(body, 'mode', 'login')

  if (!PROVIDERS.includes(provider)) {
    throw createError({ statusCode: 422, statusMessage: 'Fournisseur inconnu', data: { message: 'Fournisseur inconnu', errors: {} } })
  }
  if (token === '' && code === '' && confirmToken === '') {
    throw createError({ statusCode: 422, statusMessage: 'Jeton absent', data: { message: 'Jeton absent', errors: {} } })
  }

  const client = publicClient(event)

  async function exchange(): Promise<{ raw: unknown }> {
    // LinkedIn, confirmation d'une liaison : le `code` d'origine est déjà
    // consommé, on renvoie le `confirm_token` obtenu au premier appel.
    //
    // `unwrap: false` : comme /login et /register (voir en-tête), la route
    // LinkedIn peut répondre `{ success, requires_confirmation, message, data }`
    // (compte existant par e-mail, jamais lié à LinkedIn) — `unwrapEnvelope`
    // la confondrait avec l'enveloppe Laravel, ne garderait que `data` et
    // perdrait `requires_confirmation` → ni session ni demande de liaison →
    // « Session non ouverte » à tort (constaté sur un compte existant lié via
    // LinkedIn, 2026-09-10 ; ces deux appels étaient les seuls du fichier à ne
    // pas avoir `unwrap: false`).
    if (confirmToken !== '') {
      return { raw: await client.request('/auth/social/linkedin', { method: 'POST', body: { confirm_token: confirmToken }, unwrap: false }) }
    }

    // LinkedIn, premier appel : le navigateur ne reçoit qu'un code d'autorisation.
    if (code !== '') {
      return { raw: await client.request('/auth/social/linkedin', { method: 'POST', body: { code, redirect_uri: redirectUri }, unwrap: false }) }
    }

    if (mode === 'link') {
      return { raw: await client.request('/auth/social/register', { method: 'POST', body: { provider, token, confirm_link: true }, unwrap: false }) }
    }

    if (mode === 'register') {
      return { raw: await client.request('/auth/social/register', { method: 'POST', body: { provider, token, confirm_link: false }, unwrap: false }) }
    }

    try {
      // `unwrap: false` : depuis que `/auth/social/login` (back-office) ne
      // force plus `confirm_link: true` en interne (2026-09-09), il peut lui
      // aussi répondre `{ success, requires_confirmation, message, data }`
      // (compte existant par e-mail, jamais lié à ce fournisseur) — sans
      // `unwrap: false`, `unwrapEnvelope` la confond avec l'enveloppe Laravel
      // habituelle, ne garde que `data` et perd `requires_confirmation` en
      // route ; `toSocialAuthResult` ne trouve alors ni session ni demande de
      // confirmation → « Session non ouverte » à tort (constaté en direct,
      // 2026-09-09, compte créé manuellement puis lié via Google).
      return { raw: await client.request('/auth/social/login', { method: 'POST', body: { provider, token }, unwrap: false }) }
    }
    catch (error) {
      const message = (error as { message?: string }).message ?? ''
      // Première connexion tierce : le compte n'existe pas encore côté
      // back-office, `register` le crée ou rattache le fournisseur.
      if (!/not found/i.test(message)) throw error
      return { raw: await client.request('/auth/social/register', { method: 'POST', body: { provider, token, confirm_link: false }, unwrap: false }) }
    }
  }

  let raw: unknown
  try {
    ({ raw } = await exchange())
  }
  catch (error) {
    rethrowAuthError(error)
  }

  const result = toSocialAuthResult(raw, provider)

  // L'e-mail existe déjà : le back-office demande une confirmation explicite
  // avant de rattacher le fournisseur. Aucune session n'est ouverte.
  if (result.linkRequest !== null) {
    return { outcome: null, linkRequest: result.linkRequest }
  }

  if (result.session === null) {
    throw createError({ statusCode: 422, statusMessage: 'Session non ouverte', data: { message: 'Session non ouverte', errors: {} } })
  }

  setSessionCookie(event, result.session.token)

  return {
    outcome: { user: result.session.user, pendingPayment: readPaymentIntent(event) !== null },
    linkRequest: null,
  }
})
