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

  const isAuthenticated = computed(() => user.value !== null)
  /** Un compte non confirmé existe, mais ne peut pas payer. */
  const isActivated = computed(() => user.value?.isActivated === true)

  function apply(outcome: AuthOutcome | null): void {
    user.value = outcome?.user ?? null
    pendingPayment.value = outcome?.pendingPayment ?? false
    isResolved.value = true
  }

  /** Amorçage. Sans effet si la session est déjà résolue, sauf `force`. */
  async function hydrate(locale?: string, force = false): Promise<void> {
    if (isResolved.value && !force) return
    try {
      apply(await authRepo.current(locale))
    }
    catch {
      // Une panne du BFF ne doit pas bloquer le rendu d'une page publique :
      // on considère l'utilisateur déconnecté et on laisse la page s'afficher.
      apply(null)
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

  return { user, pendingPayment, isResolved, isAuthenticated, isActivated, apply, hydrate, login, logout }
})
