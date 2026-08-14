/**
 * Constantes de session, sans aucune dépendance Nuxt.
 *
 * Ce fichier est importé aussi bien par le code applicatif que par les routes
 * Nitro : il ne doit donc contenir ni composable, ni import de `#app`.
 */

export const SESSION_COOKIE = 'qiryna_session'

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
} as const
