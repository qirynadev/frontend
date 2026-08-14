<script setup lang="ts">
import type { AnyIconName, Tone } from './types'

withDefaults(
  defineProps<{
    /** Puce de filtre sélectionnée. */
    selected?: boolean
    icon?: AnyIconName
    tone?: Tone
    disabled?: boolean
  }>(),
  { selected: false, icon: undefined, tone: 'primary', disabled: false },
)

const selectedRing: Record<Tone, string> = {
  primary: 'border-primary-link bg-surface-2',
  success: 'border-success bg-success-bg',
  warning: 'border-warning bg-warning-bg',
  danger: 'border-danger bg-danger-bg',
  info: 'border-info bg-info-bg',
  neutral: 'border-navy bg-surface',
}
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :aria-pressed="selected"
    :class="[
      'inline-flex shrink-0 cursor-pointer flex-col items-center gap-6 rounded-xl border px-12 py-12 text-base font-medium whitespace-nowrap transition-colors duration-150',
      selected ? selectedRing[tone] : 'border-border-soft bg-white text-navy hover:bg-surface',
      disabled ? 'pointer-events-none opacity-50' : '',
    ]"
  >
    <QIconCircle v-if="icon" :icon="icon" :tone="tone" size="sm" />
    <span><slot /></span>
  </button>
</template>
