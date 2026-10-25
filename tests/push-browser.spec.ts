import { afterEach, describe, expect, it, vi } from 'vitest'
import { isPushSupported, toSubscriptionInput, urlBase64ToUint8Array } from '~/utils/push-browser'

// Le dépôt passe par le BFF (`#imports` de Nuxt) : sans objet pour ces fonctions pures.
vi.mock('~/core/repositories/push.repo', () => ({ pushRepo: {} }))

/**
 * Notifications push web, côté navigateur (`app/utils/push-browser.ts`).
 * Contrat du back-office : `qiryna-backoffice/docs/push-web.md`.
 */
describe('urlBase64ToUint8Array', () => {
  it('décode une clé VAPID en base64url, sans remplissage', () => {
    // « Qiryna » en base64url sans « = » final.
    expect(Array.from(urlBase64ToUint8Array('UWlyeW5h'))).toEqual([81, 105, 114, 121, 110, 97])
    // Caractères propres au base64url (« - » et « _ ») et remplissage à reconstituer.
    expect(Array.from(urlBase64ToUint8Array('-_8'))).toEqual([251, 255])
  })

  it('rend 65 octets pour une clé publique VAPID réelle (point non compressé)', () => {
    const key = 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM'
    const bytes = urlBase64ToUint8Array(key)
    expect(bytes).toHaveLength(65)
    expect(bytes[0]).toBe(4)
  })
})

describe('toSubscriptionInput', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function fakeSubscription(): PushSubscription {
    return {
      endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
      toJSON: () => ({ endpoint: 'https://fcm.googleapis.com/fcm/send/abc', keys: { p256dh: 'BKey', auth: 'tok' } }),
    } as unknown as PushSubscription
  }

  it('reprend l’adresse et les clés, au codage aes128gcm quand le navigateur le connaît', () => {
    vi.stubGlobal('PushManager', { supportedContentEncodings: ['aes128gcm', 'aesgcm'] })

    expect(toSubscriptionInput(fakeSubscription())).toEqual({
      endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
      keys: { p256dh: 'BKey', auth: 'tok' },
      contentEncoding: 'aes128gcm',
    })
  })

  it('retombe sur aesgcm pour un ancien navigateur qui ne connaît que lui', () => {
    vi.stubGlobal('PushManager', { supportedContentEncodings: ['aesgcm'] })

    expect(toSubscriptionInput(fakeSubscription()).contentEncoding).toBe('aesgcm')
  })
})

describe('isPushSupported', () => {
  it('répond non hors navigateur (rendu serveur)', () => {
    expect(isPushSupported()).toBe(false)
  })
})
