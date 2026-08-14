<script setup lang="ts">
/**
 * Absorbe `auth-toggle` (Connexion / Inscription) et `ed-tabs` (Présentation /
 * Formations) : même comportement, deux habillages.
 */

import type { SegmentOption } from './types'

const props = withDefaults(
  defineProps<{
    options: SegmentOption[]
    variant?: 'pill' | 'underline'
    /** Étiquette du groupe pour les lecteurs d'écran. */
    ariaLabel?: string
  }>(),
  { variant: 'pill', ariaLabel: undefined },
)

const model = defineModel<string>({ required: true })

const tabRefs = ref<HTMLButtonElement[]>([])

function select(option: SegmentOption) {
  if (option.disabled) return
  model.value = option.value
}

/** Navigation clavier ←/→/Home/End, attendue sur un `role="tablist"`. */
function onKeydown(event: KeyboardEvent, index: number) {
  const usable = props.options.map((option, i) => ({ option, i })).filter((entry) => !entry.option.disabled)
  if (usable.length === 0) return

  const position = usable.findIndex((entry) => entry.i === index)
  let next: number | undefined

  if (event.key === 'ArrowRight') next = usable[(position + 1) % usable.length]!.i
  else if (event.key === 'ArrowLeft') next = usable[(position - 1 + usable.length) % usable.length]!.i
  else if (event.key === 'Home') next = usable[0]!.i
  else if (event.key === 'End') next = usable[usable.length - 1]!.i
  else return

  event.preventDefault()
  select(props.options[next]!)
  tabRefs.value[next]?.focus()
}
</script>

<template>
  <div
    role="tablist"
    :aria-label="ariaLabel"
    :class="[
      'flex w-full',
      variant === 'pill'
        ? 'gap-0 rounded-xl border border-border p-7'
        : 'items-stretch border-b border-border-soft',
    ]"
  >
    <button
      v-for="(option, index) in options"
      :key="option.value"
      :ref="(element) => { if (element) tabRefs[index] = element as HTMLButtonElement }"
      type="button"
      role="tab"
      :aria-selected="model === option.value"
      :tabindex="model === option.value ? 0 : -1"
      :disabled="option.disabled"
      :class="[
        'flex-1 cursor-pointer text-center text-xl font-semibold transition-colors duration-150',
        variant === 'pill'
          ? ['rounded-xl p-12', model === option.value ? 'bg-primary-dark text-white shadow-xs' : 'bg-transparent text-text']
          : ['relative border-0 bg-transparent pb-12', model === option.value ? 'text-primary-link' : 'text-muted-2'],
        option.disabled ? 'pointer-events-none opacity-50' : '',
      ]"
      @click="select(option)"
      @keydown="onKeydown($event, index)"
    >
      {{ option.label }}
      <span
        v-if="variant === 'underline' && model === option.value"
        aria-hidden="true"
        class="absolute inset-x-0 -bottom-1 h-2 rounded-full bg-primary-link"
      />
    </button>
  </div>
</template>
