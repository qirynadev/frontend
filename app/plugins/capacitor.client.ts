import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'

/**
 * Comportements natifs de l'application mobile (Capacitor). Sans effet sur le
 * site : `isNativePlatform()` y vaut `false`.
 *
 * Bouton retour d'Android : revient à l'écran précédent, et ne ferme
 * l'application qu'une fois au premier écran — sinon il la quitterait dès le
 * premier appui, quel que soit l'écran affiché.
 *
 * Fermeture du navigateur intégré après un paiement : ouvre l'écran de succès
 * de l'application pour la commande en cours (voir `utils/native-app.ts`).
 * L'écran générique renvoie lui-même vers celui du bon tunnel.
 */
export default defineNuxtPlugin(() => {
  if (!Capacitor.isNativePlatform()) return

  const localePath = useLocalePath()

  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) window.history.back()
    else App.exitApp()
  })

  Browser.addListener('browserFinished', () => {
    const orderId = takePaymentReturn()
    if (orderId === null) return
    navigateTo({ path: localePath('/paiement-reussi'), query: { order_id: orderId } })
  })
})
