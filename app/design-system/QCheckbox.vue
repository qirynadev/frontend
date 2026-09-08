<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    disabled?: boolean
    /** Force l'état d'erreur (case CGU non cochée à la soumission). */
    invalid?: boolean
    error?: string
    name?: string
  }>(),
  { label: undefined, disabled: false, invalid: false, error: undefined, name: undefined },
)

const model = defineModel<boolean>({ default: false })
const id = useId()
</script>

<template>
  <div class="flex flex-col">
    <div class="flex items-center gap-7">
      <!-- `<input>` natif : le clavier, le focus et les lecteurs d'écran
           fonctionnent sans code supplémentaire. -->
      <input
        :id="id"
        v-model="model"
        type="checkbox"
        :name="name"
        :disabled="disabled"
        :aria-invalid="invalid || undefined"
        :aria-describedby="error ? `${id}-err` : undefined"
        :class="[
          'size-13 shrink-0 cursor-pointer appearance-none rounded-xs border bg-surface-card',
          'checked:border-primary checked:bg-primary',
          invalid ? 'border-danger' : 'border-border',
          disabled ? 'pointer-events-none opacity-50' : '',
        ]"
      >
      <label
        :for="id"
        :class="['min-w-0 flex-1 cursor-pointer text-sm font-medium text-text', disabled ? 'opacity-50' : '']"
      >
        <slot>{{ label }}</slot>
      </label>
    </div>

    <p v-if="error" :id="`${id}-err`" class="mt-4 mb-0 text-xs text-danger">{{ error }}</p>
  </div>
</template>
