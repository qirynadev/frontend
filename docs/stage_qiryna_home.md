
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" href="/logo.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" />
    <meta name="theme-color" content="#c0392b" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Qiryna" />
    <meta name="description" content="Qiryna — Plateforme éducative pour étudier à l'étranger" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Qiryna" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800&display=swap"
      rel="stylesheet"
    />
    <title>Qiryna</title>

    <!-- Google Analytics 4 (Consent Mode v2) — tag statique pour une détection
         fiable par Google, présent dès le chargement (indépendant de /all-data).
         RGPD : consentement refusé par défaut ; activé par l'app après acceptation
         de la bannière cookies. L'id "ga-gtag" évite une double injection côté SPA
         (voir src/utils/analytics.ts). -->
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        wait_for_update: 500,
      });
      gtag('js', new Date());
      gtag('config', 'G-JBVXJXX9HQ', { send_page_view: false });
    </script>
    <script async id="ga-gtag" src="https://www.googletagmanager.com/gtag/js?id=G-JBVXJXX9HQ"></script>

    <script src="/lottie.js" defer></script>

    <!-- Loader style -->
    <style>
      .js-loader {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        text-align: center;
        background-color: #fff;
        z-index: 999;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.3s ease;
      }
      .js-loader--hidden {
        opacity: 0;
        pointer-events: none;
      }
    </style>
    <script type="module" crossorigin src="/assets/index-fGAsBUGu.js"></script>
    <link rel="modulepreload" crossorigin href="/assets/vendor-vue-mg-6yTB0.js">
    <link rel="modulepreload" crossorigin href="/assets/vendor-element-4rh1ElZE.js">
    <link rel="modulepreload" crossorigin href="/assets/vendor-i18n-DaxRtEFL.js">
    <link rel="stylesheet" crossorigin href="/assets/index-CRM1kAGw.css">
  <link rel="manifest" href="/manifest.webmanifest"><script id="vite-plugin-pwa:register-sw" src="/registerSW.js"></script></head>
  <body>
    <!-- Loader -->
    <div class="js-loader">
      <lottie-player
        src="/qiryna_archery.json"
        background="transparent"
        speed="1"
        style="height: 50vh"
        direction="1"
        mode="normal"
        loop
        autoplay
      ></lottie-player>
    </div>

    <!-- App -->
    <div id="app"></div>

  </body>
</html>
