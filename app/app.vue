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
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
