import { bffFetch } from '../http/client'

/** Abonnement d'un navigateur, tel que le back-office l'enregistre. */
export interface PushSubscriptionInput {
  endpoint: string
  keys: { p256dh: string; auth: string }
  contentEncoding: 'aes128gcm' | 'aesgcm'
}

/** `enabled` vaut `false` tant que l'environnement n'a pas ses clés VAPID. */
export interface PushKey {
  enabled: boolean
  publicKey: string | null
}

/**
 * Notifications push web (voir `qiryna-backoffice/docs/push-web.md`).
 */
export const pushRepo = {
  key(locale?: string): Promise<PushKey> {
    return bffFetch<PushKey>('/push/key', { locale })
  },

  subscribe(input: PushSubscriptionInput, locale?: string): Promise<{ ok: boolean }> {
    return bffFetch<{ ok: boolean }>('/push/subscriptions', { method: 'POST', body: input, locale })
  },

  unsubscribe(endpoint: string, locale?: string): Promise<{ ok: boolean }> {
    return bffFetch<{ ok: boolean }>('/push/subscriptions', { method: 'DELETE', body: { endpoint }, locale })
  },
}
