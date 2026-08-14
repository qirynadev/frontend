import type { Order, PaymentInit, PaymentIntent, PaymentValidation } from '../contracts'
import { bffFetch } from '../http/client'

/** Ce qu'un écran fournit pour mémoriser ou démarrer un achat. */
export type PaymentIntentInput = Omit<PaymentIntent, 'expiresAt'>

/**
 * Paiement.
 *
 * Le parcours complet, et où chaque étape est gardée :
 *
 * ```
 *  visiteur non connecté          visiteur connecté
 *          │                             │
 *   rememberIntent()                     │
 *   (cookie httpOnly, 30 min)            │
 *          │                             │
 *   /connexion?redirect=…                │
 *          │                             │
 *      session ouverte ─────────────────►│
 *                                        │
 *                                     init()   ← 401 sans session, côté serveur
 *                                        │
 *                              redirectUrl (Stripe)
 *                                        │
 *                              /paiement-reussi?order_id=…
 *                                        │
 *                                   validate()
 * ```
 *
 * `init()` est la seule opération qui engage : elle crée une commande. Elle
 * n'est **jamais rejouée** automatiquement — `bffFetch` ne rejoue pas les POST,
 * un doublon de commande coûtant plus cher qu'une erreur affichée.
 */
export const paymentRepo = {
  /**
   * Mémorise l'achat souhaité avant de demander une authentification.
   *
   * N'engage rien : aucune commande n'est créée. Le cookie expire en 30 minutes.
   */
  rememberIntent(intent: PaymentIntentInput): Promise<PaymentIntent> {
    return bffFetch<PaymentIntent>('/payment/intent', { method: 'PUT', body: intent })
  },

  /** Intention en attente, ou `null`. Une intention périmée est effacée à la lecture. */
  pendingIntent(): Promise<PaymentIntent | null> {
    return bffFetch<PaymentIntent | null>('/payment/intent')
  },

  forgetIntent(): Promise<{ ok: boolean }> {
    return bffFetch('/payment/intent', { method: 'DELETE' })
  },

  /**
   * Crée la commande et renvoie l'URL de paiement.
   *
   * Sans argument, reprend l'intention mémorisée ; avec, achète directement.
   * Exige une session — la garde est côté serveur.
   */
  init(intent?: PaymentIntentInput, locale?: string): Promise<PaymentInit> {
    return bffFetch<PaymentInit>('/payment/init', { method: 'POST', body: intent ?? {}, locale })
  },

  /** Vérifie l'issue du paiement au retour de Stripe. */
  validate(orderId: string, locale?: string): Promise<PaymentValidation> {
    return bffFetch<PaymentValidation>('/payment/validate', { method: 'POST', body: { orderId }, locale })
  },

  retry(orderId: string, locale?: string): Promise<PaymentInit> {
    return bffFetch<PaymentInit>('/payment/retry', { method: 'POST', body: { orderId }, locale })
  },

  orders(locale?: string): Promise<Order[]> {
    return bffFetch<Order[]>('/orders', { locale })
  },
}
