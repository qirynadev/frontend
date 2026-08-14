<script setup lang="ts">
import { toneOutline, toneSoft, toneSolid, type AnyIconName, type Size, type Tone } from './types'

withDefaults(
  defineProps<{
    tone?: Tone
    variant?: 'soft' | 'solid' | 'outline'
    size?: Size
    icon?: AnyIconName
    /** Pastille pleine à gauche du libellé (statuts « en cours », « à venir »). */
    dot?: boolean
  }>(),
  { tone: 'primary', variant: 'soft', size: 'md', icon: undefined, dot: false },
)

const sizeClass: Record<Size, string> = {
  sm: 'gap-4 px-8 py-2 text-2xs',
  md: 'gap-4 px-8 py-3 text-sm',
  lg: 'gap-4 px-11 py-4 text-md',
}

const glyphSize: Record<Size, number> = { sm: 10, md: 12, lg: 14 }
const variants = { soft: toneSoft, solid: toneSolid, outline: toneOutline }
</script>

<template>
  <span
    :class="[
      'inline-flex w-fit items-center justify-center rounded-md font-semibold whitespace-nowrap',
      sizeClass[size],
      variants[variant][tone],
    ]"
  >
    <span v-if="dot" class="size-6 shrink-0 rounded-full bg-current" />
    <QIcon v-else-if="icon" :name="icon" :size="glyphSize[size]" />
    <slot />
  </span>
</template>
