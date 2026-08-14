<script setup lang="ts">
import type { Size, Tone } from './types'

const props = withDefaults(
  defineProps<{
    value: number
    max?: number
    /** Libellé au-dessus de la barre. */
    label?: string
    /** Affiche le pourcentage à droite du libellé. */
    showValue?: boolean
    size?: Size
    tone?: Tone
  }>(),
  { max: 100, label: undefined, showValue: false, size: 'md', tone: 'primary' },
)

const percent = computed(() => {
  if (props.max <= 0) return 0
  return Math.min(100, Math.max(0, (props.value / props.max) * 100))
})

const trackHeight: Record<Size, string> = { sm: 'h-4', md: 'h-6', lg: 'h-8' }

const fillTone: Record<Tone, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  neutral: 'bg-neutral',
}
</script>

<template>
  <div class="flex w-full flex-col gap-2">
    <div v-if="label || showValue" class="flex items-center justify-between gap-8">
      <span v-if="label" class="text-4xs font-medium text-muted">{{ label }}</span>
      <span v-if="showValue" class="text-4xs font-medium text-muted">{{ Math.round(percent) }}%</span>
    </div>

    <div
      role="progressbar"
      :aria-valuenow="value"
      :aria-valuemin="0"
      :aria-valuemax="max"
      :aria-label="label"
      :class="['w-full overflow-hidden rounded-full bg-primary-soft', trackHeight[size]]"
    >
      <div
        :class="['h-full rounded-full transition-[width] duration-300', fillTone[tone]]"
        :style="{ width: `${percent}%` }"
      />
    </div>
  </div>
</template>
