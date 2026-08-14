import type { PaymentIntent } from '~~/app/core/contracts'

/**
 * Intention en attente, ou `null`.
 *
 * Le cookie étant `httpOnly`, c'est le seul moyen pour l'écran de savoir ce
 * qu'il s'apprête à reprendre — et donc de l'annoncer (« Reprise de votre
 * commande : Everest — Anglais ») plutôt que de propulser l'utilisateur vers
 * Stripe sans explication.
 *
 * La lecture efface au passage une intention périmée : voir
 * `server/utils/payment-intent.ts`.
 */
export default defineEventHandler((event): PaymentIntent | null => readPaymentIntent(event))
