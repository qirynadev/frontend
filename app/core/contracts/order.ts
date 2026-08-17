import type { Price } from './common'

/**
 * Commande et paiement.
 *
 * Le back-office expose quatre endpoints : `/payment/init`, `/payment/validate`,
 * `/payment/retry`, `/payment/list`. Le domaine n'en retient que ce qu'un écran
 * affiche — un état, un montant, une date, un intitulé d'offre.
 */

/** Ce qui a été acheté, tel qu'un récapitulatif l'affiche. */
export interface OrderOffer {
  id: string
  title: string
  /** Accroche courte. Vide sur la plupart des formules du catalogue. */
  description: string
  icon: string | null
  /** Volume horaire mensuel, quand la formule en porte un. */
  hours: number | null
  /** Puces « ce qui est inclus ». */
  features: string[]
}

/**
 * État d'une commande.
 *
 * L'API mélange plusieurs vocabulaires (`status`, `confirmed`, `failed`,
 * `payment_status`). On n'en garde que trois valeurs, qui suffisent à décider
 * quel écran afficher.
 */
export type OrderStatus = 'pending' | 'confirmed' | 'failed'

export interface Order {
  id: string
  /**
   * Référence lisible.
   *
   * **Dérivée**, pas fournie : la base ne stocke aucun numéro de commande. On
   * reprend la convention de l'ancien front (`QRY-` + 8 premiers caractères de
   * l'identifiant, en capitales) pour que le support parle le même langage.
   */
  reference: string
  status: OrderStatus
  price: Price
  /** ISO `AAAA-MM-JJ` — l'API renvoie du `JJ/MM/AAAA`. */
  createdAt: string | null
  /** ISO `AAAA-MM-JJ` — dernière modification connue de la commande. */
  updatedAt: string | null
  /**
   * `course`, `areaofstudy`, `costofliving`, `profilage`… le nom de classe PHP
   * en minuscules (`normalizeServiceType`), **pas** le vocabulaire court
   * (`area`/`living`) que `/payment/init` accepte en entrée — `tests/order.
   * adapter.spec.ts` fixe ce comportement, vérifié empiriquement.
   */
  serviceType: string
  offer: OrderOffer | null
  /** E-mail de confirmation, quand la commande le porte. */
  customerEmail: string | null
  /** Slug du service associé — sert à revenir au bon écran après paiement. */
  serviceSlug: string | null
  /** Options choisies au moment de la commande (langue, niveau, objectif…). */
  options: Record<string, string>
  /**
   * Professeur (langue) ou conseiller (école/logement/orientation) déjà
   * assigné à cette commande. `null` la plupart du temps aujourd'hui — non
   * assigné, ou pas encore modélisé côté API pour ce type de service.
   */
  advisorName: string | null
}

/**
 * Réponse de `POST /payment/init`.
 *
 * `redirectUrl` est une **URL absolue vers Stripe** : le parcours quitte le
 * site. Voir LOT-5.md § Paiement pour la vérification faite sur ce point.
 */
export interface PaymentInit {
  order: Order | null
  redirectUrl: string | null
}

/** Réponse de `POST /payment/validate`, au retour de Stripe. */
export interface PaymentValidation {
  confirmed: boolean
  failed: boolean
  order: Order | null
}

/**
 * Ce qu'un visiteur non connecté voulait acheter.
 *
 * Mémorisée **côté serveur** dans un cookie `httpOnly` court, jamais dans
 * `localStorage` : c'est la même règle que pour la session. Usage unique,
 * consommée dès que le paiement démarre.
 */
export interface PaymentIntent {
  /** Identifiant de la formule / du palier acheté (`offer_id` côté API). */
  offerId: string
  /** Identifiant du service auquel la formule se rattache (`service_id`). */
  serviceId: string
  /** `course`, `area`, `profilage`… (`service_type`). */
  serviceType: string
  /** Reporté tel quel : le back-office en a besoin pour créer la session Stripe. */
  stripeProductId: string | null
  /** Langue, niveau, objectif choisi… transmis à l'API sous `options`. */
  options: Record<string, string>
  /** Intitulé affiché pendant la reprise (« Everest — Anglais »). */
  label: string
  /** Chemin où renvoyer l'utilisateur après le paiement. */
  returnPath: string
  /** ISO complet. Passé cette date, l'intention est ignorée et effacée. */
  expiresAt: string
}
