import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { paymentRepo } from '~/core/repositories'

/**
 * Comportements natifs de l'application mobile (Capacitor). Sans effet sur le
 * site : `isNativePlatform()` y vaut `false`.
 *
 * Bouton retour d'Android : revient à l'écran précédent, et ne ferme
 * l'application qu'une fois au premier écran — sinon il la quitterait dès le
 * premier appui, quel que soit l'écran affiché.
 *
 * Fermeture du navigateur intégré après un paiement (voir `utils/native-app.ts`) :
 * - commande payée ou refusée : écran de succès de l'application, qui renvoie
 *   lui-même vers celui du bon tunnel ;
 * - commande encore impayée (paiement abandonné) : on reste sur l'offre, d'où
 *   l'on peut réessayer. L'écran de succès attendrait en vain la confirmation
 *   de Stripe (jusqu'à 30 s côté back-office, au-delà du délai du BFF : 502).
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (!Capacitor.isNativePlatform()) return

  const localePath = useLocalePath()
  const locale = nuxtApp.$i18n.locale

  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) window.history.back()
    else App.exitApp()
  })

  Browser.addListener('browserFinished', async () => {
    const orderId = takePaymentReturn()
    if (orderId === null) return

    const orders = await paymentRepo.orders(locale.value).catch(() => [])
    const status = orders.find((order) => order.id === orderId)?.status
    if (status !== 'confirmed' && status !== 'failed') return

    await navigateTo({ path: localePath('/paiement-reussi'), query: { order_id: orderId } })
  })
})
