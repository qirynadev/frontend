<script setup lang="ts">
import type { Tone } from './types'

type Variant = 'elevated' | 'outlined' | 'flat' | 'tinted'
type Padding = 'none' | 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    /** Utilisé par `tinted` (fond) et par l'état sélectionné (bordure). */
    tone?: Tone
    padding?: Padding
    /** Rend la carte cliquable : `<button>` + états sélection. */
    selectable?: boolean
    selected?: boolean
    disabled?: boolean
    /** Balise de rendu quand la carte n'est pas sélectionnable. */
    as?: 'div' | 'article' | 'li' | 'section'
    to?: string
  }>(),
  {
    variant: 'elevated',
    tone: 'primary',
    padding: 'md',
    selectable: false,
    selected: false,
    disabled: false,
    as: 'div',
    to: undefined,
  },
)

const paddingClass: Record<Padding, string> = {
  none: 'p-0',
  sm: 'p-11',
  md: 'p-17',
  lg: 'px-20 py-25',
}

const variantClass: Record<Variant, string> = {
  elevated: 'bg-white shadow-card',
  outlined: 'bg-white border border-border-soft',
  flat: 'bg-white',
  tinted: '',
}

const tintClass: Record<Tone, string> = {
  primary: 'bg-surface-2',
  success: 'bg-success-bg',
  warning: 'bg-warning-bg',
  danger: 'bg-danger-bg',
  info: 'bg-info-bg',
  neutral: 'bg-surface',
}

const selectedBorder: Record<Tone, string> = {
  primary: 'border-primary-link',
  success: 'border-success',
  warning: 'border-warning',
  danger: 'border-danger',
  info: 'border-info',
  neutral: 'border-navy',
}

const component = computed(() => {
  if (props.to) return resolveComponent('NuxtLink')
  return props.selectable ? 'button' : props.as
})
</script>

<template>
  <component
    :is="component"
    :to="!disabled && to ? to : undefined"
    :type="selectable && !to ? 'button' : undefined"
    :disabled="selectable && !to ? disabled : undefined"
    :aria-pressed="selectable && !to ? selected : undefined"
    :class="[
      'block w-full rounded-xl text-left transition-colors duration-150',
      paddingClass[padding],
      variant === 'tinted' ? tintClass[tone] : variantClass[variant],
      selectable ? 'cursor-pointer border border-transparent' : '',
      selectable && selected ? `${selectedBorder[tone]} shadow-none` : '',
      disabled ? 'pointer-events-none opacity-50' : '',
    ]"
  >
    <slot />
  </component>
</template>
