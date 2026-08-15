import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // SSR obligatoire : session lisible côté serveur, SEO, first paint.
  ssr: true,

  future: { compatibilityVersion: 4 },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/image',
    '@vueuse/nuxt',
  ],

  runtimeConfig: {
    /** Uniquement côté serveur : jamais exposé au navigateur. */
    apiBaseUrl: process.env.NUXT_API_BASE_URL || 'https://admin.stage.qiryna.com/api',
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
    },
    // Le reste n'a rien à faire dans `public` : le navigateur n'a besoin de
    // connaître ni l'URL de l'API, ni la durée du cache. Il ne parle qu'au BFF,
    // dont le préfixe est une constante (`BFF_BASE` dans `app/core/http/client.ts`).
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
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap',
        },
      ],
    },
  },
})
