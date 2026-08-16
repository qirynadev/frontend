<script setup lang="ts">
import type { HomeCategory } from '~/config/home-categories'

/**
 * Raccourci de service — portage littéral de `.home-cat`.
 *
 * `flex: 1 1 0` · `rounded: 10px` · `padding: 16px` · icône 48×48 avec
 * `margin-bottom: 9px` · libellé 11px/13,75px centré sur deux lignes avec
 * `margin-bottom: 16px` · bouton 32×32 collé en bas (`margin-top: auto`).
 */
defineProps<{ category: HomeCategory }>()

const localePath = useLocalePath()
</script>

<template>
  <NuxtLink
    :to="localePath(category.to)"
    :class="[
      'flex min-w-0 flex-1 flex-col items-center rounded-xl p-2 text-navy no-underline max-3xs:basis-[calc(50%-6px)]',
      category.tint,
    ]"
  >
    <span class="mb-6 flex size-40 shrink-0 items-center justify-center">
      <QIcon :name="category.icon" :size="22" />
    </span>

    <span class="flex w-full flex-1 flex-col items-center justify-start text-center text-md leading-[13px] font-medium">
      <span>{{ $t(category.labelKey1) }}</span>
      <span>{{ $t(category.labelKey2) }}</span>
    </span>

    <span class="my-12 flex size-28 shrink-0 items-center justify-center">
      <QIcon :name="category.buttonIcon" :size="28" />
    </span>
  </NuxtLink>
</template>
