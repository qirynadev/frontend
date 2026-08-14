import type { SocialAuthOutcome, SocialProvider } from '~/core/contracts'
import { authRepo } from '~/core/repositories'
import { useSessionStore } from '~/core/stores'

/**
 * Authentification par un fournisseur tiers.
 *
 * ### Pourquoi la logique est portée plutôt que la dépendance
 *
 * L'ancien front s'appuyait sur `vue3-google-login`,
 * `@healerlab/vue3-facebook-login` et `vue3-linkedin-login` : trois greffons
 * Vue 3 **sans rendu serveur**, qui touchent `window` à l'initialisation. Sous
 * Nuxt 4 en SSR, ils ne s'installent pas sans être enveloppés dans un plugin
 * client, et deux d'entre eux ne font qu'appeler trois fonctions du SDK du
 * fournisseur. La logique — pas le paquet — est donc reprise ici, à
 * l'identique : trois dépendances de moins, et rien à envelopper.
 *
 * Ce qui est conservé mot pour mot de `legacy/src/pages/Login/_Partials/` :
 *
 * - le `state` CSRF de LinkedIn, tiré de `crypto.getRandomValues`, comparé au
 *   retour puis effacé ;
 * - le nettoyage de l'URL après le retour de LinkedIn (`replaceState`), pour
 *   qu'un rechargement ne rejoue pas un code déjà consommé ;
 * - l'enchaînement `login` → `register` de Google et Facebook, sans lequel une
 *   première connexion tierce échoue sur « User not found ».
 *
 * ### Ce que le navigateur obtient, et ce qu'il n'obtient pas
 *
 * Le SDK du fournisseur rend un jeton **OAuth**, à durée de vie courte, qui ne
 * vaut que devant le fournisseur. Il est envoyé au BFF, qui l'échange contre
 * une session Qiryna. Le jeton de session, lui, ne redescend jamais : il part
 * dans le cookie `httpOnly`.
 */

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: { access_token?: string; error?: string }) => void
            error_callback?: (error: { type?: string }) => void
          }) => { requestAccessToken: () => void }
        }
      }
    }
    FB?: {
      init: (config: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void
      login: (
        callback: (response: { status?: string; authResponse?: { accessToken?: string } }) => void,
        options: { scope: string },
      ) => void
    }
    fbAsyncInit?: () => void
  }
}

const GOOGLE_SDK = 'https://accounts.google.com/gsi/client'
const FACEBOOK_SDK = 'https://connect.facebook.net/en_US/sdk.js'
const LINKEDIN_STATE_KEY = 'qiryna_linkedin_oauth_state'

/** Charge un script une seule fois, quelle que soit le nombre d'appelants. */
const loading = new Map<string, Promise<void>>()

function loadScript(src: string): Promise<void> {
  if (!import.meta.client) return Promise.reject(new Error('client only'))

  const existing = loading.get(src)
  if (existing) return existing

  const promise = new Promise<void>((resolve, reject) => {
    const element = document.createElement('script')
    element.src = src
    element.async = true
    element.defer = true
    element.addEventListener('load', () => resolve())
    element.addEventListener('error', () => {
      // Un bloqueur de traceurs suffit à faire échouer ce chargement : le cas
      // est fréquent et doit produire un message, pas une page figée.
      loading.delete(src)
      reject(new Error(`Chargement impossible : ${src}`))
    })
    document.head.appendChild(element)
  })

  loading.set(src, promise)
  return promise
}

export type SocialAuthMode = 'login' | 'register'

export function useSocialAuth(mode: MaybeRefOrGetter<SocialAuthMode> = 'login') {
  const config = useRuntimeConfig()
  const { locale } = useI18n()
  const route = useRoute()
  const session = useSessionStore()

  const oauth = config.public.oauth as { googleClientId: string; facebookAppId: string; linkedinClientId: string }

  /** Un fournisseur sans identifiant client configuré n'est pas proposé. */
  const configured = computed<Record<SocialProvider, boolean>>(() => ({
    google: oauth.googleClientId !== '',
    facebook: oauth.facebookAppId !== '',
    linkedin: oauth.linkedinClientId !== '',
  }))

  const pending = ref<SocialProvider | null>(null)
  /** Demande de rattachement à un compte existant, à confirmer par l'utilisateur. */
  const linkRequest = ref<SocialAuthOutcome['linkRequest']>(null)
  /** Clé i18n de la dernière erreur, jamais un message brut du fournisseur. */
  const errorKey = ref<string | null>(null)

  /** Jeton conservé le temps que l'utilisateur réponde à la demande de liaison. */
  let pendingToken: { provider: SocialProvider; token: string } | null = null

  function fail(key: string): void {
    errorKey.value = key
    pending.value = null
  }

  async function exchange(provider: SocialProvider, token: string): Promise<SocialAuthOutcome | null> {
    const result = await authRepo.social(
      { provider, token, mode: toValue(mode) },
      locale.value,
    )

    if (result.linkRequest !== null) {
      pendingToken = { provider, token }
      linkRequest.value = result.linkRequest
      pending.value = null
      return null
    }

    session.apply(result.outcome)
    return result
  }

  /** L'utilisateur accepte de rattacher le fournisseur à son compte existant. */
  async function confirmLink(): Promise<SocialAuthOutcome | null> {
    if (pendingToken === null) return null

    pending.value = pendingToken.provider
    try {
      const result = await authRepo.social(
        { provider: pendingToken.provider, token: pendingToken.token, mode: 'link' },
        locale.value,
      )
      session.apply(result.outcome)
      linkRequest.value = null
      pendingToken = null
      return result
    }
    catch {
      fail('auth.social.error.generic')
      return null
    }
    finally {
      pending.value = null
    }
  }

  function cancelLink(): void {
    linkRequest.value = null
    pendingToken = null
  }

  /** Google Identity Services — flux jeton d'accès, dans une fenêtre surgissante. */
  function googleToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      const client = window.google?.accounts?.oauth2
      if (!client) {
        reject(new Error('sdk'))
        return
      }

      client
        .initTokenClient({
          client_id: oauth.googleClientId,
          scope: 'openid profile email',
          callback: (response) => {
            if (response.access_token) resolve(response.access_token)
            else reject(new Error(response.error === 'access_denied' ? 'denied' : 'token'))
          },
          error_callback: (error) => {
            reject(new Error(error.type === 'popup_closed' ? 'cancelled' : 'token'))
          },
        })
        .requestAccessToken()
    })
  }

  /** SDK Facebook — `FB.login`, fenêtre surgissante également. */
  function facebookToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      const fb = window.FB
      if (!fb) {
        reject(new Error('sdk'))
        return
      }

      fb.init({ appId: oauth.facebookAppId, cookie: true, xfbml: false, version: 'v21.0' })
      fb.login(
        (response) => {
          const token = response.authResponse?.accessToken
          if (token) resolve(token)
          else reject(new Error(response.status === 'unknown' ? 'cancelled' : 'denied'))
        },
        { scope: 'public_profile,email' },
      )
    })
  }

  /**
   * LinkedIn — flux par redirection, sans SDK.
   *
   * Le `state` est tiré au sort, mémorisé, puis comparé au retour : c'est la
   * protection CSRF du flux. Un `state` qui ne correspond pas signifie que la
   * réponse ne provient pas de la demande qu'on a émise, et elle est rejetée.
   */
  function startLinkedin(): void {
    if (!import.meta.client) return

    const bytes = new Uint32Array(4)
    crypto.getRandomValues(bytes)
    const state = Array.from(bytes, (value) => value.toString(36)).join('')
    sessionStorage.setItem(LINKEDIN_STATE_KEY, state)

    const redirectUri = `${window.location.origin}${route.path}`
    const url = new URL('https://www.linkedin.com/oauth/v2/authorization')
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('client_id', oauth.linkedinClientId)
    url.searchParams.set('redirect_uri', redirectUri)
    url.searchParams.set('scope', 'openid profile email')
    url.searchParams.set('state', state)

    window.location.assign(url.toString())
  }

  /**
   * Retour de LinkedIn.
   *
   * Appelée au montage de l'écran : la redirection revient sur la même URL, avec
   * `code` et `state` en paramètres.
   */
  async function handleLinkedinReturn(): Promise<SocialAuthOutcome | null> {
    if (!import.meta.client) return null

    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')
    const code = params.get('code')
    const state = params.get('state')

    /** Retire `code`/`state`/`error` sans recharger : un F5 ne rejoue pas le code. */
    function cleanUrl(): void {
      const url = new URL(window.location.href)
      for (const key of ['code', 'state', 'error', 'error_description']) url.searchParams.delete(key)
      window.history.replaceState({}, document.title, url.pathname + url.search)
    }

    if (error) {
      cleanUrl()
      fail(
        error === 'user_cancelled_login' || error === 'user_cancelled_authorize'
          ? 'auth.social.error.cancelled'
          : error === 'access_denied'
            ? 'auth.social.error.denied'
            : 'auth.social.error.generic',
      )
      return null
    }

    if (!code || !state) return null

    const expected = sessionStorage.getItem(LINKEDIN_STATE_KEY)
    sessionStorage.removeItem(LINKEDIN_STATE_KEY)
    cleanUrl()

    if (state !== expected) {
      fail('auth.social.error.csrf')
      return null
    }

    pending.value = 'linkedin'
    try {
      const result = await authRepo.social(
        { provider: 'linkedin', code, redirectUri: `${window.location.origin}${route.path}`, mode: toValue(mode) },
        locale.value,
      )
      if (result.linkRequest !== null) {
        linkRequest.value = result.linkRequest
        return null
      }
      session.apply(result.outcome)
      return result
    }
    catch {
      fail('auth.social.error.generic')
      return null
    }
    finally {
      pending.value = null
    }
  }

  /** Point d'entrée des trois fournisseurs. */
  async function start(provider: SocialProvider): Promise<SocialAuthOutcome | null> {
    errorKey.value = null

    if (!configured.value[provider]) {
      fail('auth.social.error.notConfigured')
      return null
    }

    if (provider === 'linkedin') {
      startLinkedin()
      return null
    }

    pending.value = provider

    try {
      await loadScript(provider === 'google' ? GOOGLE_SDK : FACEBOOK_SDK)
      const token = provider === 'google' ? await googleToken() : await facebookToken()
      return await exchange(provider, token)
    }
    catch (cause) {
      const reason = cause instanceof Error ? cause.message : ''
      fail(
        reason === 'cancelled'
          ? 'auth.social.error.cancelled'
          : reason === 'denied'
            ? 'auth.social.error.denied'
            : reason === 'sdk'
              ? 'auth.social.error.sdk'
              : 'auth.social.error.generic',
      )
      return null
    }
    finally {
      if (pending.value === provider) pending.value = null
    }
  }

  return { configured, pending, errorKey, linkRequest, start, confirmLink, cancelLink, handleLinkedinReturn }
}
