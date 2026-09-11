<script setup lang="ts">
/**
 * `useLocaleHead` pose `lang` (et les alternates) selon la locale de la route.
 * Sans lui, une page `/en/**` resterait annoncée en français aux lecteurs
 * d'écran et aux moteurs de recherche.
 *
 * Le reste des métadonnées SEO par page viendra au Lot 6.
 */
const localeHead = useLocaleHead()

useHead(() => ({
  htmlAttrs: localeHead.value.htmlAttrs,
  link: localeHead.value.link,
  meta: localeHead.value.meta,
}))

/**
 * Logo clair et favicon administrés (directives-backend §25), résolus avant
 * le rendu : `AppLogo` relit la même clé, le serveur et le navigateur
 * affichent donc le même logo. Sans favicon administré, les trois icônes
 * statiques de `nuxt.config.ts` restent en place ; sinon, elles sont
 * remplacées par clé — l'icône Apple, qui exige un PNG 180×180, reste statique.
 */
const { data: branding } = await useBranding()

/**
 * Préconnexion vers le back-office qui héberge les médias (logos, photos
 * d'école, bannières) : la négociation TLS se fait pendant le chargement de
 * la page au lieu de retarder la première image.
 *
 * Calculée à l'exécution, depuis l'API que le serveur interroge vraiment
 * (`NUXT_API_BASE_URL`) : dans `nuxt.config.ts`, elle était figée au build,
 * et danube préconnectait la recette au lieu d'`admin.qiryna.com`.
 * `useState` transmet la valeur au navigateur, qui n'a pas accès à
 * `apiBaseUrl` (clé privée) : même balise au rendu et à l'hydratation.
 */
const mediaOrigin = useState('media-origin', () =>
  import.meta.server ? new URL(useRuntimeConfig().apiBaseUrl).origin : '',
)

useHead(() => (mediaOrigin.value
  ? { link: [{ key: 'media-preconnect', rel: 'preconnect', href: mediaOrigin.value }] }
  : {}))

useHead(() => {
  const favicon = branding.value.favicon
  if (!favicon) return {}
  const type = iconMimeType(favicon)
  return {
    link: ['favicon', 'favicon-32', 'favicon-16'].map((key) => ({ key, rel: 'icon', type, href: favicon })),
  }
})
</script>

<template>
  <QIconSprite />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <CookieConsentBanner />
</template>
