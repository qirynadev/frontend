<script setup lang="ts">
withDefaults(
  defineProps<{
    orientation?: 'horizontal' | 'vertical'
    /** Texte centré sur le trait (« OU » des écrans d'authentification). */
    label?: string
    /** Trait pointillé — frises d'étapes. */
    dashed?: boolean
    /** Hauteur du trait vertical, en px. */
    length?: number
  }>(),
  { orientation: 'horizontal', label: undefined, dashed: false, length: 52 },
)
</script>

<template>
  <div
    v-if="orientation === 'vertical'"
    role="separator"
    aria-orientation="vertical"
    :style="{ height: `${length}px` }"
    :class="[
      'w-0 shrink-0 self-center border-l',
      dashed ? 'border-dashed border-dash' : 'border-solid border-border',
    ]"
  />

  <div v-else-if="label" role="separator" class="flex items-center">
    <span class="h-1 flex-1 bg-border" />
    <span class="px-16 py-14 text-base font-medium tracking-widest text-muted-2 uppercase">
      {{ label }}
    </span>
    <span class="h-1 flex-1 bg-border" />
  </div>

  <hr
    v-else
    :class="['h-1 w-full border-0', dashed ? 'border-t border-dashed border-dash bg-transparent' : 'bg-border-soft']"
  >
</template>
