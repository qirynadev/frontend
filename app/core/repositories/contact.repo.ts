import type { ContactMessageInput } from '../contracts'
import { bffFetch } from '../http/client'

export const contactRepo = {
  /** `POST /send-email` — public côté API, envoie un e-mail au support. */
  send(input: ContactMessageInput, locale?: string): Promise<{ ok: boolean }> {
    return bffFetch<{ ok: boolean }>('/send-email', { method: 'POST', body: input, locale })
  },
}
