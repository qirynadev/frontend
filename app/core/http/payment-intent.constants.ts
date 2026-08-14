/**
 * Constantes de l'intention de paiement, sans dépendance Nuxt.
 *
 * Importé aussi bien par les routes Nitro que par le code applicatif : ni
 * composable, ni import de `#app` ici.
 */

export const PAYMENT_INTENT_COOKIE = 'qiryna_payment_intent'

/**
 * Durée de vie : 30 minutes.
 *
 * Assez pour créer un compte, saisir le code reçu par e-mail et revenir. Trop
 * court pour qu'un utilisateur qui se reconnecte trois jours plus tard soit
 * propulsé vers un paiement qu'il avait abandonné — ce que ferait un cookie
 * de session classique.
 */
export const PAYMENT_INTENT_MAX_AGE = 30 * 60

export const PAYMENT_INTENT_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  maxAge: PAYMENT_INTENT_MAX_AGE,
} as const
