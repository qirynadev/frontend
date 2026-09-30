import type { BotGuardFields } from '../contracts'
import { bffFetch } from '../http/client'

export const newsletterRepo = {
  /** `POST /newsletter` — public ; l'inscription n'est active qu'après le lien reçu par e-mail. */
  subscribe(email: string, locale?: string, guard?: BotGuardFields): Promise<{ ok: boolean }> {
    return bffFetch<{ ok: boolean }>('/newsletter', { method: 'POST', body: { email, ...guard }, locale })
  },
}
