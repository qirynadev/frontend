import type { AuthOutcome, SocialAuthOutcome, SocialProvider } from '../contracts'
import { bffFetch } from '../http/client'

/**
 * Authentification.
 *
 * **Aucune de ces méthodes ne voit le jeton.** Elles parlent au BFF, qui le
 * range dans un cookie `httpOnly` et ne renvoie que l'utilisateur. C'est la
 * conséquence directe du choix du Lot 2 : si le JavaScript pouvait lire le
 * jeton, `httpOnly` ne servirait à rien.
 *
 * Les erreurs remontent en `ApiError`. Deux `kind` intéressent les écrans :
 * `validation` (avec `fieldErrors` indexées par champ) et `network`.
 */
export const authRepo = {
  /** Session courante, ou `null`. Ne lève pas quand personne n'est connecté. */
  current(locale?: string): Promise<AuthOutcome | null> {
    return bffFetch<AuthOutcome | null>('/session', { locale })
  },

  login(credentials: { email: string; password: string }, locale?: string): Promise<AuthOutcome> {
    return bffFetch<AuthOutcome>('/session', { method: 'POST', body: credentials, locale })
  },

  logout(): Promise<{ ok: boolean }> {
    return bffFetch<{ ok: boolean }>('/session', { method: 'DELETE' })
  },

  /**
   * Authentification tierce.
   *
   * `mode` décide de l'endpoint visé côté back-office :
   * - `login` — essaie la connexion, bascule sur l'inscription si le compte
   *   n'existe pas encore (première connexion tierce) ;
   * - `register` — inscription directe, depuis l'écran d'inscription ;
   * - `link` — l'utilisateur vient de confirmer le rattachement du fournisseur
   *   à un compte existant.
   *
   * LinkedIn transmet un `code` d'autorisation là où Google et Facebook
   * transmettent un jeton d'accès.
   */
  social(
    input: {
      provider: SocialProvider
      token?: string
      code?: string
      redirectUri?: string
      mode?: 'login' | 'register' | 'link'
    },
    locale?: string,
  ): Promise<SocialAuthOutcome> {
    return bffFetch<SocialAuthOutcome>('/session/social', { method: 'POST', body: input, locale })
  },

  register(
    input: {
      email: string
      password: string
      passwordConfirmation?: string
      firstName: string
      lastName: string
      phone?: string
    },
    locale?: string,
  ): Promise<{ ok: boolean; email: string }> {
    return bffFetch('/account', { method: 'POST', body: input, locale })
  },

  /** Saisie du code reçu par e-mail. C'est cet appel qui ouvre la session. */
  confirm(input: { email: string; code: string }, locale?: string): Promise<AuthOutcome> {
    return bffFetch<AuthOutcome>('/account/confirm', { method: 'POST', body: input, locale })
  },

  resendCode(email: string, locale?: string): Promise<{ ok: boolean }> {
    return bffFetch('/account/resend-code', { method: 'POST', body: { email }, locale })
  },

  forgotPassword(email: string, locale?: string): Promise<{ ok: boolean }> {
    return bffFetch('/account/forgot-password', { method: 'POST', body: { email }, locale })
  },

  /** `null` quand le back-office ne connecte pas automatiquement. */
  resetPassword(
    input: { email: string; code: string; password: string; passwordConfirmation?: string },
    locale?: string,
  ): Promise<AuthOutcome | null> {
    return bffFetch<AuthOutcome | null>('/account/reset-password', { method: 'POST', body: input, locale })
  },
}
