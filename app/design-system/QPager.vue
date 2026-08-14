<script setup lang="ts">
/**
 * Pagination. `numbered` reprend `q-pager`, `dots` reprend `le-dots` et
 * `formule-slider-dots` : même état, deux rendus.
 */

const props = withDefaults(
  defineProps<{
    total: number
    variant?: 'numbered' | 'dots'
    /** Nombre max de pastilles numérotées affichées. */
    window?: number
    ariaLabel?: string
  }>(),
  { variant: 'numbered', window: 5, ariaLabel: undefined },
)

/** Page courante, base 1. */
const model = defineModel<number>('page', { required: true })
const page = model

const pages = computed(() => {
  const span = Math.min(props.window, props.total)
  let start = Math.max(1, model.value - Math.floor(span / 2))
  if (start + span - 1 > props.total) start = Math.max(1, props.total - span + 1)
  return Array.from({ length: span }, (_, index) => start + index)
})

function go(page: number) {
  if (page < 1 || page > props.total || page === model.value) return
  model.value = page
}
</script>

<template>
  <nav :aria-label="ariaLabel ?? $t('ds.pager.label')" class="flex w-full items-center justify-center gap-15">
    <template v-if="variant === 'numbered'">
      <QIconButton
        icon="chevron-left"
        variant="surface"
        size="sm"
        :label="$t('ds.pager.previous')"
        :disabled="page <= 1"
        @click="go(page - 1)"
      />

      <button
        v-for="item in pages"
        :key="item"
        type="button"
        :aria-current="item === page ? 'page' : undefined"
        :class="[
          'inline-flex size-30 cursor-pointer items-center justify-center rounded-lg text-xl font-medium transition-colors duration-150',
          item === page ? 'bg-primary text-white' : 'bg-white text-text shadow-sm hover:bg-surface',
        ]"
        @click="go(item)"
      >
        {{ item }}
      </button>

      <QIconButton
        icon="chevron-right"
        variant="surface"
        size="sm"
        :label="$t('ds.pager.next')"
        :disabled="page >= total"
        @click="go(page + 1)"
      />
    </template>

    <template v-else>
      <button
        v-for="item in total"
        :key="item"
        type="button"
        :aria-label="$t('ds.pager.goTo', { page: item })"
        :aria-current="item === page ? 'true' : undefined"
        :class="[
          'h-6 cursor-pointer rounded-full transition-all duration-200',
          item === page ? 'w-20 bg-primary' : 'w-6 bg-border',
        ]"
        @click="go(item)"
      />
    </template>
  </nav>
</template>
