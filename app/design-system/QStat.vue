<script setup lang="ts">
import { toneText, type AnyIconName, type Tone } from './types'

/**
 * Cellule de statistique. Absorbe `stat-item`, `dom-stat*` et `projet-stat*`
 * (~28 classes). L'assemblage en grille se fait par le parent
 * (`flex` + `QDivider orientation="vertical"`).
 */

withDefaults(
  defineProps<{
    value: string
    label: string
    icon?: AnyIconName
    /** Colore la valeur (chiffre en orange pour « RDV bientôt », etc.). */
    tone?: Tone
    align?: 'center' | 'start'
  }>(),
  { icon: undefined, tone: undefined, align: 'center' },
)
</script>

<template>
  <div
    :class="[
      'flex min-w-0 flex-1 flex-col gap-4',
      align === 'center' ? 'items-center text-center' : 'items-start text-left',
    ]"
  >
    <QIcon v-if="icon" :name="icon" :size="15" class="text-primary" />
    <p :class="['m-0 text-base font-semibold', tone ? toneText[tone] : 'text-text']">{{ value }}</p>
    <p class="m-0 text-xs text-text">{{ label }}</p>
  </div>
</template>
