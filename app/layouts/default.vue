<script setup lang="ts">
/**
 * Layout par défaut — **point d'arbitrage mobile / desktop**.
 *
 * Les deux shells sont rendus ; `shell:` (768px) tranche l'affichage —
 * jamais un `v-if` sur `useDevice()` (hydratation).
 *
 * Pages desktop : `app/desktop-pages/` (non routées), branchées depuis
 * `app/pages/` via `shell:hidden` / `hidden shell:block`.
 */
</script>

<template>
  <div class="contents shell:hidden">
    <NuxtLayout name="mobile">
      <slot />
      <template v-if="$slots.nav" #nav><slot name="nav" /></template>
    </NuxtLayout>
  </div>
  <div class="hidden shell:contents">
    <NuxtLayout name="desktop">
      <slot />
    </NuxtLayout>
  </div>
</template>
