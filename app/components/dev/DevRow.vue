<script setup lang="ts">
// Outil de développement — n'est pas embarqué dans les écrans du produit.
withDefaults(defineProps<{ label: string; stack?: boolean }>(), { stack: false })
</script>

<template>
  <div class="flex flex-col gap-8">
    <p class="m-0 text-xs font-semibold tracking-widest text-muted-2 uppercase">{{ label }}</p>
    <div :class="['flex gap-12', stack ? 'flex-col' : 'flex-wrap items-center']">
      <slot />
    </div>
  </div>
</template>
