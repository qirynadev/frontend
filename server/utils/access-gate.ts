import { createHmac } from 'node:crypto'
import type { H3Event } from 'h3'
import { setResponseHeaders, setResponseStatus } from 'h3'
import { sameSecret } from './content-version'

/**
 * Accès au site réservé par un code (avant l'ouverture au public de qiryna.com).
 *
 * Tout dépend de `NUXT_ACCESS_CODE`, propre à chaque serveur : renseignée, le
 * site répond 403 tant que le code n'a pas été saisi ; absente ou vide, le site
 * est ouvert à tous. danube et my ne la définissent pas.
 *
 * Lue dans `process.env` à chaque requête et volontairement absente de
 * `runtimeConfig` : une valeur présente au moment du build y resterait figée et
 * retirer la variable ne rouvrirait plus le site. Elle échappe aussi à la
 * conversion automatique de Nitro, qui changerait un code comme `00123`.
 */
export const ACCESS_COOKIE = 'qiryna_site_access'
export const ACCESS_PATH = '/site-access'
/** Durée de l'accès accordé, en secondes (30 jours). */
export const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

export type AccessLocale = 'fr' | 'en'
export type AccessError = 'invalid' | 'rate-limited'

export function siteAccessCode(): string {
  return (process.env.NUXT_ACCESS_CODE ?? '').trim()
}

/**
 * Valeur du cookie d'accès : dérivée du code sans le contenir. Changer le code
 * invalide donc tous les accès déjà accordés.
 */
export function accessToken(code: string): string {
  return createHmac('sha256', code).update('qiryna-site-access').digest('hex')
}

export function hasAccess(cookieValue: string | undefined, code: string): boolean {
  return cookieValue !== undefined && sameSecret(cookieValue, accessToken(code))
}

/**
 * Appel interne du rendu serveur (`$fetch('/api/bff/...')`) : il ne passe pas par
 * le réseau et n'a pas toujours le cookie du visiteur, car une page en cache `swr`
 * se calcule sans ses en-têtes. Le visiteur a déjà été contrôlé sur la requête
 * d'origine. Reconnu à une propriété de l'objet requête simulé par Nitro,
 * impossible à imiter depuis l'extérieur ; si elle disparaissait, ces appels
 * seraient refusés, jamais laissés passer à tort.
 */
export function isInternalRequest(request: object): boolean {
  return '__unenv__' in request
}

/** Le signal signé du back-office et l'envoi du code ne demandent pas de cookie. */
export function isOpenRoute(method: string, path: string): boolean {
  return method === 'POST' && (path === ACCESS_PATH || path === '/api/cache/revalidate')
}

/** Page à rouvrir après le code : une adresse de ce site uniquement. */
export function safeNextPath(next: unknown): string {
  if (typeof next !== 'string' || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) return '/'
  return next
}

export function accessLocale(path: string, acceptLanguage: string | undefined): AccessLocale {
  return /^\/en(?:[/?]|$)/.test(path) || /^en\b/i.test(acceptLanguage ?? '') ? 'en' : 'fr'
}

const TEXTS = {
  fr: {
    title: 'Accès restreint',
    intro: 'Ce site n\'est pas encore ouvert au public. Si vous avez reçu un code d\'accès, saisissez-le ci-dessous.',
    label: 'Code d\'accès',
    submit: 'Accéder au site',
    invalid: 'Ce code est incorrect.',
    'rate-limited': 'Trop de tentatives. Patientez une minute avant de réessayer.',
  },
  en: {
    title: 'Restricted access',
    intro: 'This site is not open to the public yet. If you received an access code, enter it below.',
    label: 'Access code',
    submit: 'Enter the site',
    invalid: 'This code is incorrect.',
    'rate-limited': 'Too many attempts. Please wait a minute before trying again.',
  },
} as const

export function accessDeniedMessage(locale: AccessLocale): string {
  return TEXTS[locale].title
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Page autonome, sans Vue ni appel à l'API : elle s'affiche même si le
 * back-office est indisponible et n'expose rien du site. Le logo et la police
 * sont des fichiers statiques, servis avant ce contrôle.
 */
export function renderAccessPage(locale: AccessLocale, next: string, error: AccessError | null = null): string {
  const text = TEXTS[locale]
  const message = error === null ? '' : `<p class="error" role="alert">${escapeHtml(text[error])}</p>`

  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#582cfd">
<title>403 - ${escapeHtml(text.title)} - Qiryna</title>
<link rel="icon" href="/favicon.ico">
<style>
@font-face { font-family: 'Jost'; font-weight: 400 700; font-display: swap; src: url('/fonts/jost-latin.woff2') format('woff2'); }
:root { color-scheme: light dark; --bg: #f6f5fb; --card: #ffffff; --text: #1c1a2e; --muted: #5f5c75; --line: #d9d6e6; --primary: #582cfd; --error: #c0262d; }
@media (prefers-color-scheme: dark) { :root { --bg: #13111f; --card: #1e1b2e; --text: #f3f2f9; --muted: #aeabc2; --line: #3a3650; --primary: #8f73ff; --error: #ff8a8f; } }
* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px 16px; background: var(--bg); color: var(--text); font-family: 'Jost', system-ui, -apple-system, 'Segoe UI', sans-serif; }
main { width: 100%; max-width: 420px; padding: 32px 24px; background: var(--card); border: 1px solid var(--line); border-radius: 16px; text-align: center; }
.logo { display: block; height: 40px; width: auto; margin: 0 auto 24px; }
.code { margin: 0; font-size: 56px; line-height: 1; font-weight: 700; color: var(--primary); }
h1 { margin: 12px 0 8px; font-size: 24px; font-weight: 600; }
.intro { margin: 0 0 24px; color: var(--muted); font-size: 16px; line-height: 1.5; }
form { text-align: left; }
label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; }
input { width: 100%; padding: 12px 14px; font: inherit; font-size: 16px; color: inherit; background: transparent; border: 1px solid var(--line); border-radius: 10px; }
input:focus-visible, button:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.error { margin: 8px 0 0; color: var(--error); font-size: 14px; }
button { width: 100%; margin-top: 16px; padding: 12px 16px; font: inherit; font-size: 16px; font-weight: 600; color: #fff; background: #582cfd; border: 0; border-radius: 10px; cursor: pointer; }
</style>
</head>
<body>
<main>
<picture>
<source srcset="/img/logo-dark.png" media="(prefers-color-scheme: dark)">
<img class="logo" src="/img/logo.webp" alt="Qiryna">
</picture>
<p class="code">403</p>
<h1>${escapeHtml(text.title)}</h1>
<p class="intro">${escapeHtml(text.intro)}</p>
<form method="post" action="${ACCESS_PATH}">
<input type="hidden" name="next" value="${escapeHtml(next)}">
<label for="code">${escapeHtml(text.label)}</label>
<input id="code" name="code" type="password" autocomplete="off" required autofocus maxlength="200">
${message}
<button type="submit">${escapeHtml(text.submit)}</button>
</form>
</main>
</body>
</html>
`
}

/** Prépare la réponse de la page d'accès : jamais gardée en cache, jamais indexée. */
export function prepareAccessResponse(event: H3Event, status: number): void {
  setResponseStatus(event, status)
  setResponseHeaders(event, {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store',
    'x-robots-tag': 'noindex, nofollow',
  })
}
