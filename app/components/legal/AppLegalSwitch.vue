<script setup lang="ts">
/**
 * Interrupteur 48×24 de la politique cookies (Figma `1562:1890`).
 */
const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    disabled?: boolean
    locked?: boolean
    label: string
  }>(),
  { modelValue: false, disabled: false, locked: false },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const on = computed(() => props.locked || props.modelValue)

function toggle() {
  if (props.disabled || props.locked) return
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="on"
    :aria-label="label"
    :disabled="disabled || locked"
    class="relative h-24 w-48 shrink-0 rounded-full border-0 p-0"
    :class="[
      locked ? 'cursor-default bg-[#f3e8ff] opacity-80' : on ? 'cursor-pointer bg-primary' : 'cursor-pointer bg-[#e5e7eb]',
      disabled && !locked ? 'cursor-default opacity-60' : '',
    ]"
    @click="toggle"
  >
    <span
      class="absolute top-2 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
      :class="locked
        ? 'left-28 size-16'
        : on
          ? 'left-26 size-20 border border-white'
          : 'left-2 size-20 border border-[#d1d5db]'"
    />
  </button>
</template>
