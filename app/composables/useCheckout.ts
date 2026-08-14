import type { OfferPage, OfferTier } from '~/core/contracts'
import { ApiError } from '~/core/http/errors'
import { paymentRepo } from '~/core/repositories'
import { useSessionStore } from '~/core/stores'

/**
 * Départ d'un achat, depuis n'importe quelle page d'offre.
 *
 * ### La règle métier
 *
 * > Le paiement n'est déclenché que si l'utilisateur est inscrit et connecté.
 *
 * Elle est appliquée **deux fois, pour deux raisons différentes** :
 *
 * - ici, pour envoyer l'utilisateur vers la connexion plutôt que vers un
 *   message d'erreur — c'est du confort ;
 * - dans `server/api/bff/payment/init.post.ts`, où l'absence de cookie de
 *   session interdit l'appel — c'est la garde. Un contrôle qui n'existerait
 *   qu'ici se contournerait en appelant la route directement.
 *
 * ### Le parcours
 *
 * ```
 * connecté      → init() → Stripe
 * non connecté  → rememberIntent() → /connexion?redirect=… → (reprise) → Stripe
 * ```
 *
 * L'intention mémorisée n'engage rien : aucune commande n'est créée avant
 * `init()`.
 */
export function useCheckout() {
  const { locale } = useI18n()
  const localePath = useLocalePath()
  const route = useRoute()
  const session = useSessionStore()

  const pending = ref<string | null>(null)
  /** Clé i18n de l'erreur, jamais le message brut de l'API. */
  const errorKey = ref<string | null>(null)

  /**
   * Construit l'intention à partir de ce que la page d'offre connaît déjà.
   *
   * `objectif` vient de l'URL (`/offres/anglais?objectif=exams`) : le tunnel
   * langue le transporte depuis l'écran des objectifs, et il doit arriver
   * jusqu'à la commande.
   */
  function toIntent(offer: OfferPage, tier: OfferTier) {
    const options: Record<string, string> = {}
    if (offer.kind === 'language') options.language = offer.title
    const goal = route.query.objectif
    if (typeof goal === 'string' && goal !== '') options.goal = goal

    return {
      offerId: tier.id,
      serviceId: offer.serviceId,
      serviceType: offer.serviceType,
      stripeProductId: tier.stripeProductId,
      options,
      label: `${tier.name} — ${offer.title}`,
      /**
       * Où revenir après paiement.
       *
       * **Un écran de succès par tunnel.** `langues-post-payment.html` et
       * `paiement-reussi.html` sont deux maquettes distinctes : la première
       * détaille cinq étapes propres à un parcours linguistique (test de
       * niveau, choix du professeur, planning, visio), la seconde en montre
       * quatre, génériques. Logement et orientation auront les leurs.
       *
       * D'où le nommage `<tunnel>/paiement-reussi` plutôt qu'un écran unique
       * paramétré : les écrans divergent par leur contenu, pas par une option.
       */
      returnPath: offer.kind === 'language'
        ? localePath(`/langues/${offer.slug}/paiement-reussi`)
        : localePath('/paiement-reussi'),
    }
  }

  async function start(offer: OfferPage, tier: OfferTier): Promise<void> {
    if (pending.value !== null) return

    errorKey.value = null
    pending.value = tier.id
    const intent = toIntent(offer, tier)

    try {
      if (!session.isAuthenticated) {
        await paymentRepo.rememberIntent(intent)
        session.pendingPayment = true
        await navigateTo({
          path: localePath('/connexion'),
          query: { redirect: route.fullPath },
        })
        return
      }

      const { redirectUrl } = await paymentRepo.init(intent, locale.value)

      if (redirectUrl === null) {
        errorKey.value = 'checkout.error.noRedirect'
        return
      }

      // Le paiement quitte le site : navigation complète, pas le routeur.
      if (import.meta.client) window.location.assign(redirectUrl)
    }
    catch (error) {
      errorKey.value = error instanceof ApiError && (error.kind === 'network' || error.kind === 'timeout')
        ? 'checkout.error.network'
        : 'checkout.error.generic'
    }
    finally {
      if (pending.value === tier.id) pending.value = null
    }
  }

  return { pending, errorKey, start }
}
