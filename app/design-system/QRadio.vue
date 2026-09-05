<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Valeur portée par ce bouton radio. */
    value: string
    label?: string
    name?: string
    disabled?: boolean
  }>(),
  { label: undefined, name: undefined, disabled: false },
)

const model = defineModel<string>({ default: '' })
const id = useId()
</script>

<template>
  <div class="flex items-center gap-8">
    <span class="relative inline-flex shrink-0 items-center justify-center">
      <input
        :id="id"
        v-model="model"
        type="radio"
        :value="value"
        :name="name"
        :disabled="disabled"
        :class="[
          'peer size-18 cursor-pointer appearance-none rounded-full border border-muted bg-white',
          'checked:border-primary-link checked:bg-primary-link',
          disabled ? 'pointer-events-none opacity-50' : '',
        ]"
      >
      <!-- Point central : visible seulement quand l'input natif est coché. -->
      <span
        aria-hidden="true"
        class="pointer-events-none absolute size-6 rounded-full bg-white opacity-0 peer-checked:opacity-100"
      />
    </span>

    <label v-if="label || $slots.default" :for="id" class="cursor-pointer text-base text-text">
      <slot>{{ label }}</slot>
    </label>
  </div>
</template>
