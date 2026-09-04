import tailwindcss from '@tailwindcss/vite'

const apiBaseUrl = process.env.NUXT_API_BASE_URL || 'https://admin.stage.qiryna.com/api'
/**
 * Origine du back-office, seule (pas le chemin `/api`) : sert à `preconnect`
 * (`app.head.link` plus bas) pour les médias qu'il héberge (logos/photos
 * d'école, bannière d'accueil) — relevé par l'audit perf du 4 septembre 2026
 * comme non préconnecté, chaque image payant alors sa propre negociation
 * TLS pendant que la connexion vers `stage.qiryna.com` reste inutilisée.
 */
const mediaOrigin = new URL(apiBaseUrl).origin
/** Même variable que `i18n.baseUrl` plus bas — exposée aussi en `public` pour `robots.txt` (comparaison d'hôte). */
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://web.qiryna.com'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // SSR obligatoire : session lisible côté serveur, SEO, first paint.
  ssr: true,

  future: { compatibilityVersion: 4 },

  // Sans lui, un composable Nuxt (`useRequestHeaders`…) appelé après un
  // `await` — typiquement dans un repository invoqué depuis `useAsyncData` —
  // perd le contexte de la requête en cours (`NUXT_E1001`). `bffFetch`
  // (`app/core/http/client.ts`) en a besoin pour transmettre le cookie de
  // session au rendu serveur, voir son commentaire.
  experimental: { asyncContext: true },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/image',
    '@vueuse/nuxt',
  ],

  runtimeConfig: {
    /** Uniquement côté serveur : jamais exposé au navigateur. */
    apiBaseUrl,
    /** Durée de vie du cache Nitro du catalogue, en secondes. */
    catalogCacheTtl: Number(process.env.NUXT_CATALOG_CACHE_TTL ?? 300),
    /** Délai maximal d'un appel à l'API, en millisecondes. */
    apiTimeout: Number(process.env.NUXT_API_TIMEOUT ?? 15_000),

    public: {
      /**
       * Identifiants clients OAuth.
       *
       * Ce sont les **seules** valeurs publiques du projet, et elles le sont
       * par nature : un identifiant client apparaît dans l'URL d'autorisation
       * que le navigateur ouvre chez le fournisseur. Les *secrets*, eux,
       * restent côté back-office, qui valide les jetons.
       *
       * Non renseigné = fournisseur désactivé, bouton grisé. Aucun de ces
       * identifiants n'est fourni sur l'environnement de recette : voir
       * LOT-5.md § À obtenir.
       */
      oauth: {
        googleClientId: process.env.NUXT_PUBLIC_OAUTH_GOOGLE_CLIENT_ID || '',
        facebookAppId: process.env.NUXT_PUBLIC_OAUTH_FACEBOOK_APP_ID || '',
        linkedinClientId: process.env.NUXT_PUBLIC_OAUTH_LINKEDIN_CLIENT_ID || '',
      },
      /** Sert à `server/routes/robots.txt.ts` (comparaison d'hôte, staging vs production). */
      siteUrl,
    },
    // Le reste n'a rien à faire dans `public` : le navigateur n'a besoin de
    // connaître ni l'URL de l'API, ni la durée du cache. Il ne parle qu'au BFF,
    // dont le préfixe est une constante (`BFF_BASE` dans `app/core/http/client.ts`).
  },

  /**
   * Relevé par l'audit de charge/perf du 4 septembre 2026
   * (`stage.qiryna.com`, test réel + rafales de charge) :
   *
   * - **En-têtes de sécurité absents** sur le HTML servi. `X-Powered-By`
   *   (Passenger) reste à retirer côté nginx/Plesk — hors de portée du code.
   * - **`Cache-Control` bien trop court** sur les traductions (`_i18n`,
   *   10s) et les images redimensionnées (`_ipx`, 60s) : les deux sont
   *   pourtant immuables une fois générées (URL hashée pour les premières,
   *   jamais régénérées à identique pour les secondes).
   * - **Débit SSR plafonné** (~28 pages/s, un seul processus Passenger) :
   *   `swr` réduit la charge sur les pages publiques qui ne dépendent PAS
   *   de la session. Volontairement limité aux pages vérifiées comme telles
   *   (aucune lecture de `useSessionStore`/l'authentification pour son
   *   contenu) : PAS l'accueil (`/`, avancement personnel de l'utilisateur
   *   connecté), PAS les sous-arborescences `/logement/**`/`/langues/**`
   *   dans leur ensemble (elles contiennent chacune un écran
   *   `paiement-reussi` propre à une commande — un cache y afficherait la
   *   confirmation d'un visiteur à un autre).
   */
  routeRules: {
    '/**': {
      headers: {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    },

    // Toute la sous-arborescence est du contenu public (écoles, fiches) —
    // vérifié, aucune route de paiement/session dessous, contrairement à
    // `/logement` et `/langues`.
    '/destinations/**': { swr: 60 },
    '/orientation': { swr: 60 },
    '/orientation/formules': { swr: 60 },
    '/logement': { swr: 60 },
    '/langues': { swr: 60 },

    '/_i18n/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/_ipx/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
  },

  css: ['~/assets/css/main.css'],

  // Auto-import sans préfixe de dossier : `design-system/QButton.vue` → `QButton`,
  // `components/navigation/AppBottomNav.vue` → `AppBottomNav`. Les dossiers
  // servent au rangement, pas au nommage — un composant se nomme donc de façon
  // unique dans tout le projet, ce que Nuxt vérifie au démarrage.
  components: [
    { path: '~/design-system', pathPrefix: false },
    { path: '~/components', pathPrefix: false },
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  typescript: {
    strict: true,
    typeCheck: false, // activé via `npm run typecheck` (hors dev pour la vitesse)
  },

  i18n: {
    // Sert à générer les liens `hreflang`/canonical absolus (`useLocaleHead`) —
    // sans lui, `@nuxtjs/i18n` avertit et ces balises restent incomplètes.
    baseUrl: siteUrl,
    langDir: 'locales',
    locales: [
      { code: 'fr', language: 'fr-FR', name: 'Français', file: 'fr.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'fr',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'qiryna_locale',
      redirectOn: 'root',
    },
  },

  image: {
    format: ['webp'],
    // Points de rupture alignés sur le shell mobile puis le desktop (Lot 3).
    screens: {
      xs: 360,
      sm: 480,
      shell: 768,
      md: 1024,
      lg: 1280,
      xl: 1536,
    },
  },

  app: {
    head: {
      // `lang` n'est pas figé ici : il est posé dynamiquement par `useLocaleHead`
      // dans `app.vue`. Le coder en dur laisserait `lang="fr"` sur /en/**.
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#582cfd' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'preconnect', href: mediaOrigin },
        {
          // `Plus Jakarta Sans` (700 seul) : uniquement le prix de l'offre
          // d'orientation (`.oo-price-value`), seul écran à en sortir.
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@700&display=swap',
        },
      ],
    },
  },
})
