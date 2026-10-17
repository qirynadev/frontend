<script setup lang="ts">
// Outil de développement — n'est pas embarqué dans les écrans du produit.
defineProps<{ title: string; source?: string }>()
</script>

<template>
  <section class="flex flex-col gap-16 rounded-2xl border border-border bg-surface-card p-20">
    <header class="flex flex-col gap-2 border-b border-border-soft pb-12">
      <h2 class="m-0 text-3xl font-semibold text-text">{{ title }}</h2>
      <p v-if="source" class="m-0 text-sm text-muted-2">
        Remplace&nbsp;: <code>{{ source }}</code>
      </p>
    </header>
    <slot />
  </section>
</template>
