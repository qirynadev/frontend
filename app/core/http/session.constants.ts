/**
 * Constantes de session, sans aucune dépendance Nuxt.
 *
 * Ce fichier est importé aussi bien par le code applicatif que par les routes
 * Nitro : il ne doit donc contenir ni composable, ni import de `#app`.
 */

/**
 * Nom du cookie de session du site.
 *
 * Il s'appelait `qiryna_session` jusqu'au 2026-09-28 : exactement le nom du
 * cookie de session Laravel du back-office (`APP_NAME="Qiryna"` →
 * `qiryna_session`), que le back-office de production pose sur tout
 * `.qiryna.com`. Un navigateur passé par le back-office envoyait donc deux
 * cookies du même nom au site ; le serveur retenait le premier (le plus
 * ancien, celui du back-office), le prenait pour le jeton, recevait un 401 et
 * déconnectait : boucle connexion → redirection → connexion.
 */
export const SESSION_COOKIE = 'qiryna_front_session'

/** Ancien nom, encore lu pour ne déconnecter personne au changement de nom. */
export const LEGACY_SESSION_COOKIE = 'qiryna_session'

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
} as const

/**
 * Forme d'un jeton Sanctum : `{id}|{secret}`. Le cookie de session Laravel,
 * lui, est une charge chiffrée en base64 (jamais de `|`) : c'est ce qui permet
 * de les distinguer quand ils portent le même nom.
 */
const SANCTUM_TOKEN = /^\d+\|\S+$/

/**
 * Jeton de session lu dans l'en-tête `Cookie` brut.
 *
 * Priorité au cookie du site ; à défaut, un `qiryna_session` **qui a la forme
 * d'un jeton Sanctum** (session ouverte avant le changement de nom). Tout
 * autre `qiryna_session`, celui du back-office en particulier, est ignoré,
 * quel que soit son ordre dans l'en-tête.
 */
export function pickSessionToken(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null
  let legacy: string | null = null
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=')
    if (separator === -1) continue
    const name = part.slice(0, separator).trim()
    let value = part.slice(separator + 1).trim()
    try {
      value = decodeURIComponent(value)
    }
    catch {
      // Valeur mal encodée : gardée telle quelle, le test de forme tranchera.
    }
    if (!SANCTUM_TOKEN.test(value)) continue
    if (name === SESSION_COOKIE) return value
    if (name === LEGACY_SESSION_COOKIE && legacy === null) legacy = value
  }
  return legacy
}
