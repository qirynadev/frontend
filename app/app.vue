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
