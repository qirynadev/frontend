<script setup lang="ts">
import type { AnyIconName, Size, Tone } from './types'

type Variant = 'solid' | 'outline' | 'ghost' | 'link'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    tone?: Tone
    size?: Size
    /** Occupe toute la largeur — c'est le cas des CTA de la maquette. */
    block?: boolean
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    iconStart?: AnyIconName
    iconEnd?: AnyIconName
    /** Rend un `<NuxtLink>` au lieu d'un `<button>`. */
    to?: string
    href?: string
  }>(),
  {
    variant: 'solid',
    tone: 'primary',
    size: 'md',
    block: false,
    loading: false,
    disabled: false,
    type: 'button',
    iconStart: undefined,
    iconEnd: undefined,
    to: undefined,
    href: undefined,
  },
)

const sizeClass: Record<Size, string> = {
  sm: 'gap-6 px-12 py-9 text-sm',
  md: 'gap-8 px-16 py-13 text-base',
  lg: 'gap-8 px-16 py-16 text-xl',
}

const iconSize: Record<Size, number> = { sm: 14, md: 16, lg: 20 }

const solid: Record<Tone, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  success: 'bg-success text-white hover:opacity-90',
  warning: 'bg-warning text-white hover:opacity-90',
  danger: 'bg-danger text-white hover:opacity-90',
  info: 'bg-info text-white hover:opacity-90',
  neutral: 'bg-navy text-white hover:opacity-90',
}

const outline: Record<Tone, string> = {
  primary: 'border border-primary-link text-primary-link hover:bg-surface-2',
  success: 'border border-success text-success hover:bg-success-bg',
  warning: 'border border-warning text-warning hover:bg-warning-bg',
  danger: 'border border-danger text-danger hover:bg-danger-bg',
  info: 'border border-info text-info hover:bg-info-bg',
  neutral: 'border border-border text-navy hover:bg-surface',
}

const ghost: Record<Tone, string> = {
  primary: 'text-primary-link hover:bg-surface-2',
  success: 'text-success hover:bg-success-bg',
  warning: 'text-warning hover:bg-warning-bg',
  danger: 'text-danger hover:bg-danger-bg',
  info: 'text-info hover:bg-info-bg',
  neutral: 'text-navy hover:bg-surface',
}

const link: Record<Tone, string> = {
  primary: 'text-primary-link underline',
  success: 'text-success underline',
  warning: 'text-warning underline',
  danger: 'text-danger underline',
  info: 'text-info underline',
  neutral: 'text-navy underline',
}

const variantClass = computed(() => {
  const table: Record<Variant, Record<Tone, string>> = { solid, outline, ghost, link }
  return table[props.variant][props.tone]
})

const isLink = computed(() => Boolean(props.to || props.href))
const isInert = computed(() => props.disabled || props.loading)

const component = computed(() => {
  if (!isLink.value) return 'button'
  return props.to ? resolveComponent('NuxtLink') : 'a'
})
</script>

<template>
  <component
    :is="component"
    :to="!isInert && to ? to : undefined"
    :href="!isInert && href ? href : undefined"
    :type="isLink ? undefined : type"
    :disabled="isLink ? undefined : isInert"
    :aria-disabled="isLink && isInert ? 'true' : undefined"
    :aria-busy="loading ? 'true' : undefined"
    :class="[
      'inline-flex cursor-pointer items-center justify-center rounded-xl font-semibold no-underline transition-[opacity,background-color] duration-150',
      variant === 'link' ? 'px-0 py-0' : sizeClass[size],
      variantClass,
      block ? 'w-full' : '',
      isInert ? 'pointer-events-none opacity-50' : '',
    ]"
  >
    <QSpinner v-if="loading" :size="size === 'lg' ? 'md' : 'sm'" />
    <QIcon v-else-if="iconStart" :name="iconStart" :size="iconSize[size]" />
    <span v-if="$slots.default"><slot /></span>
    <QIcon v-if="iconEnd && !loading" :name="iconEnd" :size="iconSize[size]" />
  </component>
</template>
