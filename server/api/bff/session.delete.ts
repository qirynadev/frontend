/**
 * Purge la session.
 *
 * Le cookie étant `httpOnly`, seul le serveur peut l'effacer — c'est pourquoi
 * la gestion du 401 côté client passe par cette route.
 *
 * L'intention de paiement part avec : elle est rattachée à une intention
 * d'achat en cours, pas au navigateur. La conserver ferait repartir vers un
 * paiement le prochain utilisateur à se connecter sur le même appareil.
 *
 * `/user/logout` est appelé au passage pour révoquer le jeton Sanctum côté
 * back-office, mais son échec n'empêche rien : le cookie local est effacé quoi
 * qu'il arrive, sinon une API indisponible rendrait la déconnexion impossible.
 */
export default defineEventHandler(async (event) => {
  if (readSessionToken(event) !== null) {
    await authClient(event).request('/user/logout').catch(() => {})
  }

  clearSessionCookie(event)
  clearPaymentIntent(event)

  return { ok: true }
})
