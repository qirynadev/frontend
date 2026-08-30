/**
 * Messagerie (`/messages`, onglet « Messages ») ← `GET /user/messages`.
 *
 * L'API ne connaît pas la notion de conversation : elle renvoie deux tas,
 * `sent`/`received`, sans regroupement. `toMessageThreads`
 * (`core/adapters/message.adapter.ts`) reconstitue un fil par interlocuteur —
 * aujourd'hui un seul en pratique, toute la messagerie routant vers un unique
 * compte admin (constat identique côté Legacy, `messageCounterpart.ts`).
 */

export interface MessageAuthor {
  id: string
  name: string
  role: string
  /** L'API renvoie toujours une URL (avatar généré à défaut de photo). */
  avatar: string
  online: boolean
}

export interface MessageThread {
  /** Identifiant de l'interlocuteur — pas de fil réel côté API. */
  id: string
  counterpart: MessageAuthor
  previewText: string
  /** ISO, reconstruit depuis `created_date`/`created_time` (l'API ne renvoie pas de vrai timestamp ici). */
  lastMessageAt: string
  unreadCount: number
}
