<script setup lang="ts">
import type { Tone } from './types'

/**
 * Anneau de progression. La maquette utilisait une image PNG plus un texte
 * positionné en absolu ; ici c'est un SVG, donc net à toute densité et sans
 * requête réseau.
 */

const props = withDefaults(
  defineProps<{
    value: number
    max?: number
    /** Libellé sous le pourcentage (« du projet », « complété »…). */
    label?: string
    /** Diamètre en px. */
    size?: number
    thickness?: number
    tone?: Tone
  }>(),
  { max: 100, label: undefined, size: 74, thickness: 6, tone: 'primary' },
)

const percent = computed(() => {
  if (props.max <= 0) return 0
  return Math.min(100, Math.max(0, (props.value / props.max) * 100))
})

const radius = computed(() => (props.size - props.thickness) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = computed(() => circumference.value * (1 - percent.value / 100))

const strokeTone: Record<Tone, string> = {
  primary: 'stroke-primary',
  success: 'stroke-success',
  warning: 'stroke-warning',
  danger: 'stroke-danger',
  info: 'stroke-info',
  neutral: 'stroke-neutral',
}
</script>

<template>
  <div
    class="relative inline-flex shrink-0 items-center justify-center"
    :style="{ width: `${size}px`, height: `${size}px` }"
    role="progressbar"
    :aria-valuenow="value"
    :aria-valuemin="0"
    :aria-valuemax="max"
    :aria-label="label"
  >
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" aria-hidden="true" focusable="false">
      <circle
        class="stroke-primary-soft"
        fill="none"
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        :stroke-width="thickness"
      />
      <circle
        :class="[strokeTone[tone], 'transition-[stroke-dashoffset] duration-500']"
        fill="none"
        stroke-linecap="round"
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        :stroke-width="thickness"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        :transform="`rotate(-90 ${size / 2} ${size / 2})`"
      />
    </svg>

    <span class="absolute inset-0 flex flex-col items-center justify-center text-center">
      <span class="text-2xl leading-none font-semibold text-text">{{ Math.round(percent) }}%</span>
      <span v-if="label" class="pt-2 text-3xs whitespace-nowrap text-text">{{ label }}</span>
    </span>
  </div>
</template>
