import type { CookieConsentChoice } from '~/composables/useCookieConsent'
import { catalogRepo } from '~/core/repositories'

declare global {
  interface Window {
    dataLayer: unknown[][]
    gtag: (...args: unknown[]) => void
  }
}

const DENIED = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
} as const

const GRANTED = {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
} as const

/**
 * Google Analytics 4, chargé une fois, piloté par Google Consent Mode v2 —
 * même mécanisme que l'ancienne implémentation (`legacy/src/utils/
 * analytics.ts`), reconduit ici car le back-office est identique
 * (`settings.site.ga_id`, `core/adapters/common.adapter.ts`).
 *
 * Consentement par défaut **refusé** dès le chargement du script, avant même
 * que la bannière (`CookieConsentBanner.vue`) ait pu s'afficher : `gtag` se
 * charge techniquement, mais ne pose aucun cookie tant que rien n'est
 * accepté. Le choix stocké (`useCookieConsent`) n'accorde/refuse ensuite
 * qu'explicitement — jamais de rechargement du script.
 *
 * Client uniquement (`.client.ts`) : `gtag` n'a aucun sens au rendu serveur.
 * `catalogRepo.load()` est mis en cache côté Nitro (voir son docblock) —
 * l'appeler encore une fois ici ne recharge rien côté réseau.
 */
export default defineNuxtPlugin(async () => {
  const analyticsId = await catalogRepo.load().then(c => c.settings.analyticsId).catch(() => null)
  if (!analyticsId) return

  window.dataLayer = window.dataLayer || []
  window.gtag = (...args: unknown[]) => { window.dataLayer.push(args) }

  window.gtag('consent', 'default', DENIED)
  window.gtag('js', new Date())
  window.gtag('config', analyticsId)

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsId)}`
  document.head.appendChild(script)

  const { choice } = useCookieConsent()
  watch(choice, (value: CookieConsentChoice | null) => {
    if (value === null) return
    window.gtag('consent', 'update', value === 'accepted' ? GRANTED : DENIED)
  }, { immediate: true })
})
