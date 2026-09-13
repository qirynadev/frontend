<script setup lang="ts">
import type { LanguageLevelPresentation } from '~/config/language-levels'

/**
 * Carte de niveau — « Quel est votre niveau actuel ? » (`/langues`).
 *
 * Même grammaire que `LanguageCard` : bord `border-soft` et ombre douce au
 * repos, bord `primary-select` et coche ronde une fois choisie. L'icône est
 * un « signal » à trois barres dont le nombre de barres pleines croît avec le
 * niveau — dessiné en CSS plutôt qu'en asset, il suit la teinte de sélection.
 */
defineProps<{ level: LanguageLevelPresentation; selected: boolean }>()
defineEmits<{ select: [key: LanguageLevelPresentation['key']] }>()

/** Hauteur de chaque barre, de la plus courte à la plus haute. */
const BAR_HEIGHTS = ['h-10', 'h-16', 'h-22'] as const
</script>

<template>
  <button
    type="button"
    role="radio"
    :aria-checked="selected"
    :class="[
      'relative flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-10 rounded-xl border px-8 pt-16 pb-14',
      selected ? 'border-primary-select bg-primary-bg shadow-none' : 'border-border-soft bg-white shadow-soft',
    ]"
    @click="$emit('select', level.key)"
  >
    <span aria-hidden="true" class="flex h-22 items-end gap-3">
      <span
        v-for="(height, index) in BAR_HEIGHTS"
        :key="height"
        :class="[
          'block w-6 rounded-xs',
          height,
          index < level.bars ? 'bg-primary-select' : 'bg-border',
        ]"
      />
    </span>

    <span class="text-lg leading-18 font-medium whitespace-nowrap text-navy">
      {{ $t(level.labelKey) }}
    </span>

    <span
      v-if="selected"
      aria-hidden="true"
      class="absolute top-6 right-6 flex size-16 items-center justify-center rounded-full bg-primary-select"
    >
      <QIcon name="ic-lang-check" :size="14" />
    </span>
  </button>
</template>
