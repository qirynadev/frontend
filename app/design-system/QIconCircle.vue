<script setup lang="ts">
import type { AnyIconName, Tone } from './types'

type CircleSize = 'sm' | 'md' | 'lg' | 'xl'

withDefaults(
  defineProps<{
    /** Icône du registre. Omise → le slot par défaut est utilisé (logo, drapeau…). */
    icon?: AnyIconName
    tone?: Tone
    size?: CircleSize
    /** Cercle plein de la tonalité plutôt que fond teinté. */
    solid?: boolean
  }>(),
  { icon: undefined, tone: 'primary', size: 'md', solid: false },
)

const boxSize: Record<CircleSize, string> = {
  sm: 'size-32',
  md: 'size-40',
  lg: 'size-44',
  xl: 'size-48',
}

const glyphSize: Record<CircleSize, number> = { sm: 16, md: 20, lg: 24, xl: 24 }

const softTone: Record<Tone, string> = {
  primary: 'bg-primary-soft text-primary',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
  info: 'bg-info-bg text-info',
  neutral: 'bg-neutral-bg text-neutral',
}

const solidTone: Record<Tone, string> = {
  primary: 'bg-primary text-white',
  success: 'bg-success text-white',
  warning: 'bg-warning text-white',
  danger: 'bg-danger text-white',
  info: 'bg-info text-white',
  neutral: 'bg-neutral text-white',
}
</script>

<template>
  <span
    :class="[
      'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
      boxSize[size],
      solid ? solidTone[tone] : softTone[tone],
    ]"
  >
    <slot>
      <QIcon v-if="icon" :name="icon" :size="glyphSize[size]" />
    </slot>
  </span>
</template>
