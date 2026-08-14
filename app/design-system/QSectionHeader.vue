<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    /** Niveau de titre HTML — le style ne dépend pas de lui. */
    level?: 1 | 2 | 3
    /** `page` : gros titre d'écran · `section` : intertitre de liste. */
    variant?: 'page' | 'section'
  }>(),
  { subtitle: undefined, level: 2, variant: 'section' },
)
</script>

<template>
  <div class="flex w-full items-end justify-between gap-12">
    <div class="min-w-0">
      <component
        :is="`h${level}`"
        :class="[
          'm-0 font-semibold text-text',
          variant === 'page' ? 'text-4xl tracking-tight' : 'text-xl tracking-wider',
        ]"
      >
        {{ title }}
      </component>
      <p v-if="subtitle" class="mt-4 mb-0 text-base font-medium text-muted-2">{{ subtitle }}</p>
    </div>

    <div v-if="$slots.action" class="shrink-0">
      <slot name="action" />
    </div>
  </div>
</template>
