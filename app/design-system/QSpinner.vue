<script setup lang="ts">
import type { Size } from './types'

withDefaults(
  defineProps<{
    size?: Size
    /** Renseigné → le spinner est annoncé (`role="status"`). Sinon décoratif. */
    label?: string
  }>(),
  { size: 'md', label: undefined },
)

const dimension: Record<Size, string> = {
  sm: 'size-14',
  md: 'size-18',
  lg: 'size-24',
}
</script>

<template>
  <span
    :class="[
      dimension[size],
      'inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent',
    ]"
    :role="label ? 'status' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
  />
</template>
