import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Application mobile Qiryna (Android, iOS) : le site livré en page unique dans
 * une coquille native. Mode d'emploi et limites : `MOBILE.md`.
 *
 * - `webDir` : sortie de `NUXT_MOBILE=1 nuxt generate`.
 * - `CapacitorHttp` : les appels au BFF du site déployé passent par le HTTP
 *   natif du téléphone. Pas de CORS à ouvrir côté site, et le cookie de session
 *   `httpOnly` reste dans le stockage natif (`CapacitorCookies`), jamais lisible
 *   en JavaScript, comme sur le site.
 * - Les liens vers un autre domaine (paiement Stripe, pages externes) s'ouvrent
 *   dans le navigateur du téléphone : le paiement reste sur le web.
 */
const config: CapacitorConfig = {
  appId: 'com.qiryna.app',
  appName: 'Qiryna',
  webDir: '.output/public',
  plugins: {
    CapacitorHttp: { enabled: true },
    CapacitorCookies: { enabled: true },
  },
  android: {
    // Pas de contenu mixte : tout passe en https.
    allowMixedContent: false,
  },
}

export default config
