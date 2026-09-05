import { useSessionStore } from '~/core/stores'

/**
 * Garde des écrans qui exigent un compte.
 *
 * ```ts
 * definePageMeta({ middleware: 'auth' })
 * ```
 *
 * Elle tourne au rendu serveur comme côté navigateur : une arrivée directe sur
 * `/mon-projet` sans session ne rend jamais la page, même partiellement.
 *
 * **Ce n'est pas la garde de sécurité.** Celle-ci est côté serveur, dans
 * `authClient(event)` : sans cookie, aucune route BFF authentifiée ne répond.
 * Le middleware évite d'afficher une page vide et conserve la destination —
 * c'est du confort, pas du contrôle d'accès. Les deux sont nécessaires : la
 * première protège, la seconde explique.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const session = useSessionStore()
  await session.hydrate()

  // `hydrateFailed` : le premier essai a échoué techniquement (réseau, back-
  // office indisponible), pas de déconnexion confirmée (voir `session.store.ts`).
  // Un nouvel essai avant de conclure — sans ça, un aléa réseau ponctuel (retour
  // de paiement mobile, par exemple) renvoyait vers `/connexion` un utilisateur
  // par ailleurs bien connecté. `force: true` : le premier essai a déjà marqué
  // `isResolved`, sans quoi celui-ci n'aurait aucun effet.
  if (!session.isAuthenticated && session.hydrateFailed) {
    await session.hydrate(undefined, true)
  }

  if (session.isAuthenticated) return

  const localePath = useLocalePath()

  return navigateTo({
    path: localePath('/connexion'),
    // La destination survit à l'authentification : l'utilisateur revient où il
    // allait, pas à l'accueil.
    query: { redirect: to.fullPath },
  })
})
