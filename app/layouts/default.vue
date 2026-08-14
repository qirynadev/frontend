<script setup lang="ts">
/**
 * Layout par défaut — **le point d'arbitrage entre mobile et desktop**.
 *
 * Aujourd'hui il délègue intégralement à `mobile.vue`. Quand les maquettes
 * desktop arriveront, c'est **ce fichier seul** qui choisira entre `mobile.vue`
 * et `desktop.vue` : aucune page n'aura à changer, puisqu'aucune page ne nomme
 * son layout.
 *
 * ⚠️ L'arbitrage devra se faire en **CSS**, pas avec `useDevice()`.
 * `useMediaQuery` ignore la largeur d'écran au premier rendu serveur : un
 * `v-if="isDesktop"` autour de deux structures différentes provoquerait un
 * décalage d'hydratation, et le desktop recevrait d'abord le shell mobile.
 *
 * La bascule ressemblera à ceci — les deux shells sont rendus, un seul est
 * affiché, et c'est la feuille de style qui tranche :
 *
 * ```vue
 * <template>
 *   <div class="contents shell:hidden"><LayoutMobile><slot /></LayoutMobile></div>
 *   <div class="hidden shell:contents"><LayoutDesktop><slot /></LayoutDesktop></div>
 * </template>
 * ```
 */
</script>

<template>
  <NuxtLayout name="mobile">
    <slot />
    <template v-if="$slots.nav" #nav><slot name="nav" /></template>
  </NuxtLayout>
</template>
