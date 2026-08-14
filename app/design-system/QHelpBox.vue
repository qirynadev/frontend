<script setup lang="ts">
import type { AnyIconName, Tone } from './types'

/**
 * Encart d'aide teinté : icône ronde, titre, description, action à droite.
 * Remplace `help-box`, `inscription-help-box`, `dest-help`, `objectifs-help`,
 * `langue-other`, `lpp-support`, `paiement-help`, `home-menu-help`, `cta-box`.
 */

withDefaults(
  defineProps<{
    title: string
    description?: string
    icon?: AnyIconName
    tone?: Tone
    /** Action sous le texte plutôt qu'à droite (écrans étroits, texte long). */
    stackAction?: boolean
  }>(),
  { description: undefined, icon: 'headset', tone: 'primary', stackAction: false },
)

const tint: Record<Tone, string> = {
  primary: 'bg-surface-2',
  success: 'bg-success-bg',
  warning: 'bg-warning-bg',
  danger: 'bg-danger-bg',
  info: 'bg-info-bg',
  neutral: 'bg-surface',
}
</script>

<template>
  <div
    :class="[
      'flex w-full rounded-xl px-9 py-21',
      tint[tone],
      stackAction ? 'flex-col gap-12' : 'items-center justify-between gap-11',
    ]"
  >
    <div class="flex min-w-0 flex-1 items-center gap-11">
      <QIconCircle :icon="icon" :tone="tone" size="lg" />
      <div class="min-w-0 flex-1">
        <p class="m-0 text-base font-bold text-text">{{ title }}</p>
        <p v-if="description" class="mt-4 mb-0 text-sm text-text">{{ description }}</p>
      </div>
    </div>

    <div v-if="$slots.action" :class="['shrink-0', stackAction ? 'w-full' : '']">
      <slot name="action" />
    </div>
  </div>
</template>
