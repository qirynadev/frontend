import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'

/**
 * Comportements natifs de l'application mobile (Capacitor). Sans effet sur le
 * site : `isNativePlatform()` y vaut `false`.
 *
 * Bouton retour d'Android : revient à l'écran précédent, et ne ferme
 * l'application qu'une fois au premier écran — sinon il la quitterait dès le
 * premier appui, quel que soit l'écran affiché.
 */
export default defineNuxtPlugin(() => {
  if (!Capacitor.isNativePlatform()) return

  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) window.history.back()
    else App.exitApp()
  })
})
