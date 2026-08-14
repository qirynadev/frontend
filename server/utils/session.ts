import type { H3Event } from 'h3'
import type { ApiClient } from '~~/app/core/http/api-client'
import { createApiClient } from '~~/app/core/http/api-client'
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from '~~/app/core/http/session.constants'

/**
 * Session côté serveur.
 *
 * **C'est le seul endroit du projet qui lit le jeton.** Le navigateur ne peut
 * pas : le cookie est `httpOnly`. C'est précisément ce qui rend l'attaque par
 * script (XSS) incapable d'exfiltrer une session — et ce qui oblige tout appel
 * authentifié à passer par une route Nitro, qui rattache `Authorization` ici.
 *
 * Le corollaire à ne pas perdre de vue : une route BFF qui appelle
 * `authClient(event)` **agit au nom de l'utilisateur**. Elle doit donc valider
 * ce qu'elle reçoit, et ne jamais relayer un identifiant que le client aurait
 * pu choisir sans contrôle.
 */

/** Jeton de la requête courante, ou `null`. */
export function readSessionToken(event: H3Event): string | null {
  const token = getCookie(event, SESSION_COOKIE)
  return token && token !== '' ? token : null
}

export function setSessionCookie(event: H3Event, token: string): void {
  setCookie(event, SESSION_COOKIE, token, {
    ...SESSION_COOKIE_OPTIONS,
    secure: !import.meta.dev,
  })
}

export function clearSessionCookie(event: H3Event): void {
  deleteCookie(event, SESSION_COOKIE, { path: '/', sameSite: 'lax', secure: !import.meta.dev })
}

/**
 * Client API **anonyme** — connexion, inscription, mot de passe oublié.
 *
 * Ces appels précèdent la session : leur rattacher un jeton n'aurait pas de
 * sens, et en rattacherait un périmé après expiration.
 */
export function publicClient(event: H3Event): ApiClient {
  const config = useRuntimeConfig(event)
  return createApiClient({
    baseUrl: config.apiBaseUrl,
    timeoutMs: config.apiTimeout,
    locale: readLocale(event),
  })
}

/**
 * Client API **authentifié**.
 *
 * Lève un 401 quand aucune session n'existe, avant tout appel réseau : c'est la
 * garde serveur. Un contrôle équivalent dans un composant se contourne en
 * appelant la route directement ; celui-ci non.
 */
export function authClient(event: H3Event): ApiClient {
  const token = readSessionToken(event)
  if (token === null) {
    throw createError({ statusCode: 401, statusMessage: 'Session requise' })
  }

  const config = useRuntimeConfig(event)
  return createApiClient({
    baseUrl: config.apiBaseUrl,
    timeoutMs: config.apiTimeout,
    locale: readLocale(event),
    token,
  })
}

/**
 * Convertit une `ApiError` de la couche basse en erreur H3.
 *
 * Sans cette traduction, une erreur levée dans une route Nitro repart en 500 et
 * le navigateur perd le `kind` — donc la distinction entre « identifiants
 * refusés » et « serveur indisponible », qui n'appellent pas le même message.
 *
 * Les erreurs de validation (422) conservent `errors` : `ApiError.fieldErrors`
 * est reconstruit à l'identique côté client, et les écrans d'authentification
 * en dépendent pour surligner le bon champ.
 */
export function rethrowApiError(error: unknown): never {
  const candidate = error as { status?: number; message?: string; fieldErrors?: Record<string, string[]> }
  const status = typeof candidate?.status === 'number' && candidate.status >= 400 ? candidate.status : 502

  throw createError({
    statusCode: status,
    statusMessage: candidate?.message ?? 'Erreur du service distant',
    data: {
      message: candidate?.message ?? 'Erreur du service distant',
      errors: candidate?.fieldErrors ?? {},
    },
  })
}

/**
 * Même chose, pour les routes d'**authentification** — avec une différence qui
 * n'est pas cosmétique.
 *
 * Le back-office refuse des identifiants par un **400** (« Login failed »), une
 * inscription invalide par un **422**. Relayer tel quel un 400/401 ferait
 * réagir `bffFetch` : il purgerait la session et renverrait vers `/connexion`.
 * Depuis l'écran d'inscription, un simple mot de passe trop court expulserait
 * donc l'utilisateur vers un autre écran, formulaire vidé.
 *
 * Un refus d'identifiants est une **erreur de saisie**, pas une session
 * expirée : il repart en 422, avec ses `fieldErrors`, et la page l'affiche
 * sous le champ concerné.
 */
export function rethrowAuthError(error: unknown): never {
  const candidate = error as { status?: number; message?: string; fieldErrors?: Record<string, string[]> }
  const status = typeof candidate?.status === 'number' ? candidate.status : 0
  const rejected = status === 400 || status === 401 || status === 403 || status === 422

  throw createError({
    statusCode: rejected ? 422 : status >= 400 ? status : 502,
    statusMessage: candidate?.message ?? 'Authentification refusée',
    data: {
      message: candidate?.message ?? 'Authentification refusée',
      errors: candidate?.fieldErrors ?? {},
    },
  })
}
