import type { MessageThread } from '../contracts/message'
import { bffFetch } from '../http/client'

/**
 * Liste de messagerie (`/messages`, onglet « Messages »).
 *
 * Distinct de `contactRepo.send` (même route `/messages`, verbe `POST`) : le
 * formulaire d'aide envoie, cette liste lit — voir `message.adapter.ts` pour
 * la reconstitution des fils à partir de `sent`/`received`.
 */
export const messageRepo = {
  list(locale?: string): Promise<MessageThread[]> {
    return bffFetch<MessageThread[]>('/messages', { locale })
  },
  /** Marque comme lus tous les messages reçus (le back-office ne distingue pas les fils). */
  markRead(locale?: string): Promise<{ ok: boolean }> {
    return bffFetch<{ ok: boolean }>('/messages/read', { method: 'POST', locale })
  },
}
