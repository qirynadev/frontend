import type { Ref } from 'vue'
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from './session.constants'

/**
 * Le jeton de session vit dans un cookie **`httpOnly`**.
 *
 * Conséquences assumées :
 * - le rendu serveur lit la session, donc une page protégée se rend
 *   correctement dès le premier octet ;
 * - le JavaScript du navigateur **ne peut pas** le lire — c'est le but. Les
 *   appels authentifiés partent donc du BFF Nitro, qui rattache l'en-tête
 *   `Authorization` côté serveur.
 *
 * Il n'y a aucun `localStorage` dans ce projet, et il ne doit pas y en avoir.
 */
export { SESSION_COOKIE, SESSION_COOKIE_OPTIONS }

export function useSessionCookie(): Ref<string | null> {
  return useCookie<string | null>(SESSION_COOKIE, {
    ...SESSION_COOKIE_OPTIONS,
    secure: !import.meta.dev,
  })
}

/**
 * Jeton lisible depuis le contexte courant.
 *
 * Côté serveur : la valeur réelle. Côté navigateur : toujours `null`, puisque le
 * cookie est `httpOnly`.
 */
export function readSessionToken(): string | null {
  if (!import.meta.server) return null
  return useSessionCookie().value ?? null
}
