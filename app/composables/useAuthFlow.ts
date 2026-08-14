import type { AuthOutcome } from '~/core/contracts'
import { paymentRepo } from '~/core/repositories'
import { useSessionStore } from '~/core/stores'

/**
 * Ce qui se passe **après** une authentification réussie.
 *
 * Trois écrans en dépendent — connexion, inscription, nouveau mot de passe — et
 * doivent se comporter à l'identique : c'est précisément le genre de logique
 * qu'on retrouve recopiée trois fois avec deux variantes involontaires.
 *
 * L'ordre de priorité :
 *
 * 1. **un paiement en attente** — l'utilisateur avait cliqué « Choisir cette
 *    formule » avant de se connecter : on reprend là où il en était ;
 * 2. **le paramètre `redirect`** — il allait sur un écran protégé ;
 * 3. **l'accueil**.
 *
 * Le `redirect` est filtré : seul un chemin interne est accepté. Sans ce
 * contrôle, `?redirect=https://exemple.test` transformerait l'écran de
 * connexion en tremplin de redirection ouverte — le lien serait légitime
 * (notre domaine, notre certificat) et mènerait ailleurs.
 */
export function useAuthFlow() {
  const route = useRoute()
  const localePath = useLocalePath()
  const { locale } = useI18n()
  const session = useSessionStore()

  const redirectTarget = computed<string | null>(() => {
    const raw = route.query.redirect
    const value = typeof raw === 'string' ? raw : ''
    // `//` est une URL protocole-relative : elle sort du site.
    return value.startsWith('/') && !value.startsWith('//') ? value : null
  })

  /** Destination par défaut, hors reprise de paiement. */
  function fallbackTarget(): string {
    return redirectTarget.value ?? localePath('/')
  }

  /**
   * Reprend le parcours.
   *
   * Peut **quitter le site** : la reprise d'un paiement mène à Stripe. On passe
   * donc par `location.assign` et non par le routeur, et on ne rend jamais la
   * main dans ce cas.
   *
   * Laisse remonter l'erreur du paiement : la session est ouverte, mais
   * l'écran doit le dire plutôt que de rediriger en silence vers l'accueil, ce
   * qui laisserait l'utilisateur croire que sa commande est passée.
   */
  async function resume(outcome: AuthOutcome | null): Promise<void> {
    if (outcome?.pendingPayment) {
      const { redirectUrl } = await paymentRepo.init(undefined, locale.value)
      session.pendingPayment = false

      if (redirectUrl !== null && import.meta.client) {
        window.location.assign(redirectUrl)
        return
      }
    }

    await navigateTo(fallbackTarget())
  }

  /**
   * Renvoie ailleurs un utilisateur déjà connecté qui atterrit sur un écran
   * d'authentification — sauf s'il a un paiement à reprendre, auquel cas
   * l'écran affiche le rappel de commande et le bouton de reprise.
   */
  async function redirectIfAuthenticated(): Promise<void> {
    if (!session.isAuthenticated || session.pendingPayment) return
    await navigateTo(fallbackTarget())
  }

  return { redirectTarget, fallbackTarget, resume, redirectIfAuthenticated }
}
