import type { Order, OrientationEvaluation } from '~/core/contracts'
import { orientationEvaluationProgress } from './orientation-progress'

/**
 * Avancement d'**une** commande (0-100).
 *
 * École, logement, langues : `done/total` de sa checklist. 0 si la commande a
 * échoué, ou n'a pas de checklist (antérieure au mécanisme, ou type qui n'en a
 * jamais) — un vrai zéro plutôt qu'une valeur inconnue.
 *
 * Ne filtre pas sur `status === 'confirmed'` : la checklist est seedée dès le
 * paiement réussi, avant qu'un statut « vérifié » n'arrive — une commande « en
 * attente de vérification » a une checklist bien réelle (repéré 2026-08-27 : une
 * commande école du compte de test, checklist 1/7, contribuait 0 % au lieu de
 * 14 %). Seul un `échoué` reste exclu.
 */
export function orderChecklistProgress(order: Order): number {
  if (order.status === 'failed' || order.checklist.length === 0) return 0
  const done = order.checklist.filter((item) => item.status === 'done').length
  return Math.round((done / order.checklist.length) * 100)
}

/**
 * Avancement d'une commande, quel que soit son type.
 *
 * Orientation : pas de checklist, mais les jalons du bilan E-Testing
 * correspondant (`orientationEvaluationProgress`) — 0 tant qu'aucun bilan
 * n'est rattaché à la commande.
 */
export function orderProgress(order: Order, evaluations: OrientationEvaluation[]): number {
  if (order.serviceType !== 'profilage') return orderChecklistProgress(order)
  if (order.status === 'failed') return 0
  const evaluation = evaluations.find((item) => item.orderId === order.id)
  return evaluation ? orientationEvaluationProgress(evaluation) : 0
}

/**
 * Progression globale du client — anneau de l'accueil et de l'aperçu.
 *
 * **Somme des progressions de chaque commande, divisée par le nombre de
 * commandes** (règle du responsable, 2026-09-13). Par commande, pas par
 * rubrique : deux accompagnements école comptent pour deux.
 *
 * Avant, l'anneau faisait la moyenne des **quatre cartes** de `mon-projet`, y
 * compris les rubriques jamais achetées, affichées à 0 % : un seul achat à
 * 14 % donnait (14 + 0 + 0 + 0) / 4 = 4 %.
 *
 * Une commande échouée n'est pas un achat : ni au numérateur, ni au
 * dénominateur. Sans commande, 0.
 */
export function globalJourneyProgress(orders: Order[], evaluations: OrientationEvaluation[]): number {
  const purchased = orders.filter((order) => order.status !== 'failed')
  if (purchased.length === 0) return 0

  const total = purchased.reduce((sum, order) => sum + orderProgress(order, evaluations), 0)
  return Math.round(total / purchased.length)
}
