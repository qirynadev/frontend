/**
 * Notifications push web, côté navigateur (voir `usePushNotifications`).
 *
 * Fonctions sans état Vue, pour être appelées aussi bien depuis l'écran
 * d'activation que depuis la déconnexion.
 */
import type { PushSubscriptionInput } from '../core/repositories/push.repo'
import { pushRepo } from '../core/repositories/push.repo'

/** Le service worker du site, réduit au push (`public/sw-push.js`). */
export const PUSH_SERVICE_WORKER = '/sw-push.js'

export function isPushSupported(): boolean {
  return typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window
}

/**
 * iPhone ou iPad dans Safari, hors écran d'accueil : Apple n'y autorise pas
 * le push. Il faut d'abord ajouter le site à l'écran d'accueil.
 */
export function isIosOutsideHomeScreen(): boolean {
  if (typeof window === 'undefined') return false
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true
  return ios && !standalone
}

/** Clé publique VAPID (base64url) → octets attendus par `pushManager.subscribe`. */
export function urlBase64ToUint8Array(value: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const bytes = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
  return bytes
}

/** Abonnement du navigateur, sous la forme attendue par le back-office. */
export function toSubscriptionInput(subscription: PushSubscription): PushSubscriptionInput {
  const json = subscription.toJSON()
  const encodings = (PushManager as unknown as { supportedContentEncodings?: string[] }).supportedContentEncodings ?? []
  return {
    endpoint: json.endpoint ?? subscription.endpoint,
    keys: { p256dh: json.keys?.p256dh ?? '', auth: json.keys?.auth ?? '' },
    contentEncoding: encodings.length === 0 || encodings.includes('aes128gcm') ? 'aes128gcm' : 'aesgcm',
  }
}

export async function currentPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null
  const registration = await navigator.serviceWorker.getRegistration('/')
  return registration ? registration.pushManager.getSubscription() : null
}

/**
 * À la déconnexion : ce navigateur cesse de recevoir les notifications du
 * compte, côté serveur comme côté navigateur. Un appareil partagé ne reçoit
 * ainsi jamais les notifications d'un compte qui n'y est plus connecté, et le
 * compte suivant devra les activer lui-même. Sans effet si rien n'est abonné.
 */
export async function forgetPushSubscription(locale?: string): Promise<void> {
  const subscription = await currentPushSubscription().catch(() => null)
  if (!subscription) return
  await pushRepo.unsubscribe(subscription.endpoint, locale).catch(() => {})
  await subscription.unsubscribe().catch(() => false)
}
