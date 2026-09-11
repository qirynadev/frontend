import tailwindcss from '@tailwindcss/vite'

const apiBaseUrl = process.env.NUXT_API_BASE_URL || 'https://admin.stage.qiryna.com/api'
/**
 * Hôtes des back-offices qui servent les médias (logos, photos d'école,
 * bannières), autorisés par l'optimiseur d'images (`image.domains`).
 *
 * **Les deux sont listés en dur**, en plus de celui du build : `apiBaseUrl`
 * ci-dessus n'est lu qu'AU BUILD. Constaté le 2026-09-11 : danube
 * (production, API `admin.qiryna.com`) avait été construit avec l'hôte de
 * recette, son optimiseur refusait donc `admin.qiryna.com` (« Forbidden
 * host ») et toutes ses images du back-office partaient brutes — 56 sur la
 * liste des écoles, jusqu'à 92 Ko pour un logo qui en pèse 2 une fois
 * optimisé. Le même build sert désormais `my` comme `danube`.
 *
 * La préconnexion vers ce back-office est posée à l'exécution par `app.vue`,
 * pour la même raison.
 */
const mediaHost = new URL(apiBaseUrl).host
const MEDIA_HOSTS = [...new Set([mediaHost, 'admin.qiryna.com', 'admin.stage.qiryna.com'])]
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
    // `/_ipx/**` n'a PAS de règle ici : l'optimiseur écrit ses en-têtes
    // directement sur la réponse Node et ignorait celle-ci (mesuré le
    // 2026-09-11 : 60 s en production malgré un an demandé). Sa durée de cache
    // se règle dans `image.ipx`, plus bas.

    /**
     * Statiques de `public/` : sans règle, Nitro ne pose qu'un `ETag`, donc le
     * navigateur revalide **chaque** icône (~70 SVG par écran) et chaque police
     * à chaque navigation — une requête conditionnelle par fichier, même en
     * cache. Mesuré le 2026-09-10 : 86 requêtes sur l'accueil mobile, presque
     * toutes des icônes de 0,8 Ko. Les polices ne changent jamais sans changer
     * de nom → immuables. Les icônes/images ne sont pas hachées → 7 jours,
     * puis `stale-while-revalidate` (servies en cache pendant la revalidation).
     */
    '/fonts/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/img/**': { headers: { 'cache-control': 'public, max-age=604800, stale-while-revalidate=86400' } },
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
    /**
     * Sans cet hôte ici, `$img()` (`image.js` de `@nuxt/image`) laisse passer
     * telles quelles toutes les URL d'un domaine non listé — silencieusement,
     * sans erreur. C'était le cas de **toutes** les photos hébergées par le
     * back-office (bannière d'accueil, logos, photos d'école) : `format`,
     * `sizes`, `quality` déclarés partout dans le code n'avaient jamais
     * d'effet dessus, elles partaient dans leur poids/format d'origine.
     * Repéré le 5 septembre 2026 (audit perf PageSpeed Insights, LCP/Speed
     * Index mobile en zone orange) en constatant que l'`<img>` du bandeau
     * d'accueil pointait directement `admin.stage.qiryna.com`, jamais
     * `/_ipx/...`. Seules les images de `public/` (locales) étaient donc
     * jamais concernées par ce bug — elles n'ont pas besoin d'être listées ici.
     */
    domains: MEDIA_HOSTS,
    /**
     * Durée de cache des images redimensionnées (`/_ipx/...`).
     *
     * `ipx` pose lui-même son `Cache-Control`, en contournant `routeRules` :
     * sans ces options, il renvoyait 60 s pour les images de `public/` et
     * 5 min pour celles du back-office (constaté en production le
     * 2026-09-11). Un téléphone retéléchargeait donc chaque photo à presque
     * chaque visite.
     *
     * - `fs` : images de `public/`, non hachées → 7 jours, comme `/img/**` ;
     * - `http` : images du back-office qui n'envoient aucun `Cache-Control` →
     *   1 jour. Quand le back-office en envoie un (directive §26), `ipx` le
     *   reprend tel quel : c'est le back-office qui décide.
     */
    ipx: {
      fs: { maxAge: 604800 },
      http: { maxAge: 86400 },
    },
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
        // Repris de la maquette (`ic-orientation-logo`, la marque Qiryna seule —
        // le logo complet a trop de marge/texte pour rester lisible en 16px).
        // Balises explicites plutôt que la convention implicite `/favicon.ico` :
        // fiable même si un cache CDN/navigateur a mémorisé une 404 passée.
        //
        // `key` : permet à `app.vue` de remplacer ces trois balises par le
        // favicon administré (directives-backend §25) quand il existe.
        { key: 'favicon', rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { key: 'favicon-32', rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { key: 'favicon-16', rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        /**
         * Plus aucun `preconnect` vers Google Fonts : Jost (2026-09-09) puis
         * `Plus Jakarta Sans` (2026-09-10) sont auto-hébergées dans
         * `public/fonts/` (voir `assets/css/main.css`). Le lien Google ajoutait
         * ~300ms de blocage du rendu (résolution DNS/TLS d'un domaine tiers).
         *
         * La préconnexion vers le back-office des médias n'est plus ici : son
         * origine était figée au build (danube préconnectait la recette).
         * Elle est posée à l'exécution par `app.vue`.
         */
      ],
    },
  },
})
