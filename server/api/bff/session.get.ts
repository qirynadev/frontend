import type { AuthOutcome } from '~~/app/core/contracts'
import { toUser } from '~~/app/core/adapters'

/**
 * Session courante.
 *
 * Appelée au rendu serveur pour amorcer le store : c'est ce qui permet à une
 * page protégée de s'afficher dès le premier octet, sans écran de chargement
 * après hydratation.
 *
 * Répond `null` — et non 401 — quand il n'y a pas de session : l'absence de
 * session est un état normal du site, pas une erreur. Un 401 ici déclencherait
 * la purge et la redirection de `bffFetch` sur **chaque page publique**.
 */
export default defineEventHandler(async (event): Promise<AuthOutcome | null> => {
  const token = readSessionToken(event)
  if (token === null) return null

  let raw: unknown
  try {
    raw = await authClient(event).request('/user/me')
  }
  catch (error) {
    const status = (error as { status?: number }).status
    if (status === 401 || status === 403) {
      // Jeton révoqué ou expiré côté back-office : on efface le cookie plutôt
      // que de laisser l'utilisateur dans un état « connecté » stérile.
      clearSessionCookie(event)
      return null
    }
    rethrowApiError(error)
  }

  // Une panne du back-office ne doit pas déconnecter : au-delà du 401, on
  // remonte l'erreur (`rethrowApiError` ci-dessus) sans toucher au cookie.
  return { user: toUser(raw), pendingPayment: readPaymentIntent(event) !== null }
})
