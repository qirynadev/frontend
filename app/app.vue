<script setup lang="ts">
import { useThemeStore } from '~/core/stores'

/**
 * `useLocaleHead` pose `lang` (et les alternates) selon la locale de la route.
 * Sans lui, une page `/en/**` resterait annoncée en français aux lecteurs
 * d'écran et aux moteurs de recherche.
 *
 * Le reste des métadonnées SEO par page viendra au Lot 6.
 */
const localeHead = useLocaleHead()

/**
 * `data-theme` sur `<html>` — posé ici (pas dans un plugin séparé) pour que
 * le rendu serveur le connaisse déjà via le cookie (`theme.store.ts`) : la
 * première peinture est donc déjà dans le bon thème, sans flash au clair
 * après hydratation. Absent (`undefined`) pour « système » : la media query
 * de `main.css` décide seule dans ce cas.
 */
const theme = useThemeStore()

useHead(() => ({
  htmlAttrs: { ...localeHead.value.htmlAttrs, 'data-theme': theme.htmlAttr },
  link: localeHead.value.link,
  meta: localeHead.value.meta,
}))
</script>

<template>
  <QIconSprite />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <CookieConsentBanner />
</template>
