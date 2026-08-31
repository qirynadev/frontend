import type { ContactMessageInput, PublicContactMessageInput } from '../contracts'
import { bffFetch } from '../http/client'

export const contactRepo = {
  /** `POST /user/messages` — authentifié, persiste le message ET envoie l'e-mail de notification. */
  send(input: ContactMessageInput, locale?: string): Promise<{ ok: boolean }> {
    return bffFetch<{ ok: boolean }>('/messages', { method: 'POST', body: input, locale })
  },

  /** `POST /send-email` — public, e-mail seulement (rien enregistré en base). */
  sendPublic(input: PublicContactMessageInput, locale?: string): Promise<{ ok: boolean }> {
    return bffFetch<{ ok: boolean }>('/messages/public', { method: 'POST', body: input, locale })
  },
}
