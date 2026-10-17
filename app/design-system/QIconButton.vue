<script setup lang="ts">
import type { AnyIconName, Size } from './types'

type Variant = 'plain' | 'surface' | 'outline'

const props = withDefaults(
  defineProps<{
    icon: AnyIconName
    /** Obligatoire : sert d'`aria-label`. Un bouton-icône sans libellé est muet. */
    label: string
    size?: Size
    variant?: Variant
    /** Pastille de compteur (cloche de notification). `0` masque la pastille. */
    badge?: number
    /** Au-delà, la pastille affiche `99+`. */
    badgeMax?: number
    disabled?: boolean
    to?: string
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    size: 'md',
    variant: 'plain',
    badge: 0,
    badgeMax: 99,
    disabled: false,
    to: undefined,
    type: 'button',
  },
)

const boxSize: Record<Size, string> = { sm: 'size-32', md: 'size-40', lg: 'size-49' }
const glyphSize: Record<Size, number> = { sm: 16, md: 20, lg: 25 }

const variantClass: Record<Variant, string> = {
  plain: 'bg-transparent text-navy hover:bg-surface',
  surface: 'bg-surface-card text-navy shadow-card hover:bg-surface',
  outline: 'border border-border bg-surface-card text-navy hover:bg-surface',
}

const badgeText = computed(() =>
  props.badge > props.badgeMax ? `${props.badgeMax}+` : String(props.badge),
)

const component = computed(() => (props.to ? resolveComponent('NuxtLink') : 'button'))
</script>

<template>
  <component
    :is="component"
    :to="!disabled && to ? to : undefined"
    :type="to ? undefined : type"
    :disabled="to ? undefined : disabled"
    :aria-label="label"
    :class="[
      'relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl transition-colors duration-150',
      boxSize[size],
      variantClass[variant],
      disabled ? 'pointer-events-none opacity-50' : '',
    ]"
  >
    <QIcon :name="icon" :size="glyphSize[size]" />
    <span
      v-if="badge > 0"
      class="absolute top-0 right-0 inline-flex h-20 min-w-20 items-center justify-center rounded-full bg-danger px-6 text-base leading-none font-medium text-white"
    >
      {{ badgeText }}
    </span>
  </component>
</template>
