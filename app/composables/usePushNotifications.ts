import { pushRepo } from '~/core/repositories/push.repo'
import {
  currentPushSubscription,
  isIosOutsideHomeScreen,
  isPushSupported,
  PUSH_SERVICE_WORKER,
  toSubscriptionInput,
  urlBase64ToUint8Array,
} from '~/utils/push-browser'

/**
 * État des notifications push sur ce navigateur :
 * - `unknown` : pas encore déterminé (rendu serveur, ou lecture en cours) ;
 * - `unsupported` : navigateur sans push ;
 * - `ios-install` : iPhone ou iPad hors écran d'accueil, où Apple n'autorise pas le push ;
 * - `unavailable` : l'environnement n'a pas ses clés, le site ne propose rien ;
 * - `default` : rien d'activé, la question peut être posée ;
 * - `denied` : refusé dans le navigateur, que seul le client peut rétablir ;
 * - `subscribed` : activé sur ce navigateur.
 */
export type PushState = 'unknown' | 'unsupported' | 'ios-install' | 'unavailable' | 'default' | 'denied' | 'subscribed'

/**
 * Notifications push web (voir `qiryna-backoffice/docs/push-web.md`).
 *
 * L'autorisation n'est jamais demandée d'elle-même : seulement au clic du
 * client sur « Activer ». Un navigateur ne repose pas la question après un
 * refus, elle doit donc arriver au bon moment.
 */
export function usePushNotifications() {
  const { locale } = useI18n()

  const state = ref<PushState>('unknown')
  const busy = ref(false)
  const failed = ref(false)
  let publicKey: string | null = null

  async function refresh(): Promise<void> {
    if (!import.meta.client) return
    if (!isPushSupported()) {
      state.value = isIosOutsideHomeScreen() ? 'ios-install' : 'unsupported'
      return
    }

    const key = await pushRepo.key(locale.value).catch(() => null)
    if (!key?.enabled || !key.publicKey) {
      state.value = 'unavailable'
      return
    }
    publicKey = key.publicKey

    if (Notification.permission === 'denied') {
      state.value = 'denied'
      return
    }

    const subscription = await currentPushSubscription().catch(() => null)
    if (subscription && Notification.permission === 'granted') {
      // Renvoyé à chaque passage : l'abonnement reste rattaché au compte
      // connecté, même si le serveur l'avait retiré entre-temps.
      await pushRepo.subscribe(toSubscriptionInput(subscription), locale.value).catch(() => {})
      state.value = 'subscribed'
      return
    }

    state.value = 'default'
  }

  async function enable(): Promise<void> {
    if (busy.value || !publicKey) return
    busy.value = true
    failed.value = false

    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        state.value = permission === 'denied' ? 'denied' : 'default'
        return
      }

      const registration = await navigator.serviceWorker.register(PUSH_SERVICE_WORKER, { scope: '/' })
      await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
        ?? await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        })

      await pushRepo.subscribe(toSubscriptionInput(subscription), locale.value)
      state.value = 'subscribed'
    }
    catch {
      failed.value = true
    }
    finally {
      busy.value = false
    }
  }

  async function disable(): Promise<void> {
    if (busy.value) return
    busy.value = true
    failed.value = false

    try {
      const subscription = await currentPushSubscription()
      if (subscription) {
        await pushRepo.unsubscribe(subscription.endpoint, locale.value).catch(() => {})
        await subscription.unsubscribe()
      }
      state.value = 'default'
    }
    catch {
      failed.value = true
    }
    finally {
      busy.value = false
    }
  }

  onMounted(() => {
    void refresh()
  })

  return { state, busy, failed, enable, disable }
}
