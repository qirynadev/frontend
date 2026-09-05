import { defineStore } from 'pinia'
import type { AuthOutcome, User } from '../contracts'
import { authRepo } from '../repositories'

/**
 * Session de l'utilisateur.
 *
 * **Le store ne contient pas le jeton, et ne peut pas le contenir** : il vit
 * dans un cookie `httpOnly` que le JavaScript ne lit pas. Ce qu'il contient,
 * c'est l'utilisateur — de quoi afficher un nom, une pastille, décider d'un
 * rendu. Tout appel authentifié part du BFF, qui rattache `Authorization`
 * côté serveur.
 *
 * Amorcé au **rendu serveur** par `plugins/session.ts`, puis transporté dans la
 * charge utile Nuxt : une page protégée se rend dès le premier octet, sans
 * clignotement après hydratation.
 */
export const useSessionStore = defineStore('session', () => {
  const user = ref<User | null>(null)
  /**
   * Une intention de paiement attend d'être reprise.
   *
   * Renseigné par les réponses d'authentification, qui lisent le cookie côté
   * serveur : l'écran n'a pas besoin d'un appel supplémentaire pour le savoir.
   */
  const pendingPayment = ref(false)
  /** `false` tant que l'amorçage n'a pas eu lieu — distingue « déconnecté » de « pas encore su ». */
  const isResolved = ref(false)
  /**
   * `true` si le dernier `hydrate()` a échoué **techniquement** (réseau,
   * back-office indisponible) plutôt que de résoudre proprement.
   *
   * La distinction compte : `GET /session` (`session.get.ts`, back-office)
   * répond `null` — jamais une erreur — quand personne n'est simplement
   * connecté. Donc toute exception ici n'est **jamais** une déconnexion
   * confirmée, seulement un aléa. Avant ce correctif, `hydrate()` traitait les
   * deux cas pareil (`apply(null)`) : un simple timeout réseau au retour de
   * Stripe pouvait afficher un utilisateur pourtant bien connecté comme
   * déconnecté, et `middleware/auth.ts` le renvoyait vers `/connexion` pour
   * rien — repéré le 2026-09-05 sur des retours de paiement mobile.
   */
  const hydrateFailed = ref(false)

  const isAuthenticated = computed(() => user.value !== null)
  /** Un compte non confirmé existe, mais ne peut pas payer. */
  const isActivated = computed(() => user.value?.isActivated === true)

  function apply(outcome: AuthOutcome | null): void {
    user.value = outcome?.user ?? null
    pendingPayment.value = outcome?.pendingPayment ?? false
    isResolved.value = true
    hydrateFailed.value = false
  }

  /** Amorçage. Sans effet si la session est déjà résolue, sauf `force`. */
  async function hydrate(locale?: string, force = false): Promise<void> {
    if (isResolved.value && !force) return
    try {
      apply(await authRepo.current(locale))
    }
    catch {
      // Échec technique, pas une déconnexion confirmée (voir `hydrateFailed`
      // ci-dessus) : on ne touche pas à `user`, pour ne pas écraser une
      // session par ailleurs valide (cas `force`, ré-amorçage après un aléa).
      // Au tout premier amorçage, `user` reste à `null` — son état initial —
      // donc une page publique s'affiche quand même, comme avant.
      isResolved.value = true
      hydrateFailed.value = true
    }
  }

  async function login(credentials: { email: string; password: string }, locale?: string): Promise<AuthOutcome> {
    const outcome = await authRepo.login(credentials, locale)
    apply(outcome)
    return outcome
  }

  async function logout(): Promise<void> {
    // Le cookie ne peut être effacé que par le serveur ; l'état local suit,
    // même si l'appel échoue — sinon une API indisponible interdirait de se
    // déconnecter.
    await authRepo.logout().catch(() => {})
    apply(null)
  }

  return { user, pendingPayment, isResolved, hydrateFailed, isAuthenticated, isActivated, apply, hydrate, login, logout }
})
