<script setup lang="ts">
import type { AnyIconName, Tone } from './types'

/**
 * État **vide**. Absent de la maquette. Sert aussi bien à « aucune école ne
 * correspond à ces filtres » qu'à « votre projet est encore vide ».
 */

withDefaults(
  defineProps<{
    title: string
    description?: string
    icon?: AnyIconName
    tone?: Tone
  }>(),
  { description: undefined, icon: 'search', tone: 'neutral' },
)
</script>

<template>
  <div class="flex w-full flex-col items-center gap-12 px-gutter py-40 text-center">
    <QIconCircle :icon="icon" :tone="tone" size="xl" />
    <div class="max-w-320">
      <p class="m-0 text-3xl font-semibold text-text">{{ title }}</p>
      <p v-if="description" class="mt-8 mb-0 text-base text-muted-2">{{ description }}</p>
    </div>
    <div v-if="$slots.action" class="pt-4">
      <slot name="action" />
    </div>
  </div>
</template>
