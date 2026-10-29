/**
 * Ce qui change quand le site tourne dans l'application mobile (Capacitor).
 *
 * Sur le site, chaque fonction garde le comportement d'avant : rien ne change
 * pour le web. Voir `MOBILE.md`.
 *
 * ### Pages hors de l'application (Stripe, LMS)
 *
 * Elles s'ouvrent dans le navigateur intégré du téléphone (onglet Chrome sur
 * Android, Safari sur iOS) par-dessus l'application, qui reste ouverte
 * dessous. Une navigation de la WebView elle-même les enverrait dans le
 * navigateur par défaut, d'où l'utilisateur ne sait pas revenir.
 *
 * ### Retour de paiement
 *
 * Stripe renvoie vers l'écran de succès **du site**, dans ce navigateur
 * intégré — pas dans l'application. Quand l'utilisateur le referme,
 * l'application ouvre son propre écran de succès pour la commande en cours :
 * celui-ci interroge le back-office avec la session de l'application et
 * affiche « confirmé », « en attente » ou « échoué ».
 */
import { Capacitor, CapacitorHttp } from '@capacitor/core'
import { Browser } from '@capacitor/browser'
import { Directory, Filesystem } from '@capacitor/filesystem'
import { FileOpener } from '@capawesome-team/capacitor-file-opener'
import { BFF_BASE } from '../core/http/client'

/** Commande dont le paiement est ouvert dans le navigateur intégré. */
const PAYMENT_RETURN_KEY = 'qiryna_app_payment_order'

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform()
}

/** Quitte le site pour une adresse externe (Stripe, LMS). */
export async function openExternal(url: string): Promise<void> {
  if (!isNativeApp()) {
    window.location.assign(url)
    return
  }
  await Browser.open({ url })
}

/**
 * Part payer.
 *
 * `redirectUrl` mène à Stripe, sauf pour une offre gratuite : le back-office
 * renvoie alors directement l'écran de succès du site, que l'application
 * ouvre chez elle plutôt que dans un navigateur.
 */
export async function goToPayment(redirectUrl: string, orderId: string | null): Promise<void> {
  if (!isNativeApp()) {
    window.location.assign(redirectUrl)
    return
  }

  const target = new URL(redirectUrl)
  if (target.pathname.endsWith('/paiement-reussi')) {
    // Le jeton `rt` ne sert qu'au navigateur : l'application a sa session.
    target.searchParams.delete('rt')
    await navigateTo(target.pathname + target.search)
    return
  }

  if (orderId) sessionStorage.setItem(PAYMENT_RETURN_KEY, orderId)
  await Browser.open({ url: redirectUrl })
}

/** Commande à confirmer au retour du navigateur intégré, consommée à la lecture. */
export function takePaymentReturn(): string | null {
  const orderId = sessionStorage.getItem(PAYMENT_RETURN_KEY)
  sessionStorage.removeItem(PAYMENT_RETURN_KEY)
  return orderId
}

/**
 * Ouvre un PDF servi par le BFF (`/api/bff/...`).
 *
 * Dans l'application, l'adresse relative n'existe pas et le navigateur du
 * téléphone n'a pas la session : le fichier est donc téléchargé par le HTTP
 * natif (cookie de session compris), rangé dans le cache de l'application,
 * puis confié à la visionneuse PDF du téléphone.
 */
export async function openBffPdf(path: string, fileName: string): Promise<void> {
  if (!isNativeApp()) {
    window.open(`/api/bff${path}`, '_blank', 'noopener')
    return
  }

  const response = await CapacitorHttp.request({
    url: `${BFF_BASE}${path}`,
    method: 'GET',
    responseType: 'blob',
  })
  if (response.status !== 200 || typeof response.data !== 'string') {
    throw new Error(`PDF indisponible (${response.status})`)
  }

  const { uri } = await Filesystem.writeFile({
    path: fileName,
    data: response.data,
    directory: Directory.Cache,
  })
  await FileOpener.openFile({ path: uri, mimeType: 'application/pdf' })
}
