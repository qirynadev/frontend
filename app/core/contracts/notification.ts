/**
 * Notifications (`/messages`, onglet « Notification ») ← `GET /user/notifications`.
 *
 * Flux distinct de la messagerie (table `notifications` Laravel, pas
 * `Messaging`) : achats, statuts de commande, rappels… Aujourd'hui le
 * back-office n'y écrit que sur un nouveau message (`MessageController`) — les
 * autres événements listés dans `docs/directives-backend.md` (paiement,
 * inscription, rappel) ne partent que par e-mail, voir la directive ajoutée en
 * même temps que ce contrat.
 */

export interface NotificationItem {
  id: string
  type: string | null
  title: string
  body: string
  /** Chemin vers lequel naviguer au clic — `null` si l'API n'en fournit pas. */
  url: string | null
  read: boolean
  /** ISO — l'API la renvoie déjà dans ce format ici, contrairement à la messagerie. */
  createdAt: string
}

export interface NotificationList {
  items: NotificationItem[]
  page: number
  totalPages: number
}
