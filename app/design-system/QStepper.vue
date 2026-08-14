<script setup lang="ts">
import type { StepItem } from './types'

/**
 * Frise d'étapes. Absorbe les trois implémentations de la maquette :
 * `steps-container` (mot de passe), `lpp-steps-*` (langues post-paiement),
 * `paiement-step-*` (paiement réussi) — ~40 classes.
 */

withDefaults(
  defineProps<{
    steps: StepItem[]
    /** Index (base 0) de l'étape en cours. `-1` = aucune. */
    current?: number
    orientation?: 'vertical' | 'horizontal'
    /** Affiche la pastille numérotée à côté de l'icône. */
    numbered?: boolean
  }>(),
  { current: -1, orientation: 'vertical', numbered: true },
)
</script>

<template>
  <ol
    :class="[
      'm-0 flex list-none p-0',
      orientation === 'vertical' ? 'flex-col gap-6' : 'items-start justify-between gap-8',
    ]"
  >
    <li
      v-for="(step, index) in steps"
      :key="step.title"
      :aria-current="index === current ? 'step' : undefined"
      :class="[
        'flex',
        orientation === 'vertical' ? 'w-full gap-7' : 'flex-1 flex-col items-center text-center',
      ]"
    >
      <!-- Colonne pastille + trait de liaison -->
      <div
        :class="[
          'flex shrink-0 items-center',
          orientation === 'vertical' ? 'flex-col gap-6 self-stretch' : 'flex-col gap-6',
        ]"
      >
        <div class="relative flex items-center">
          <QIconCircle
            :icon="step.icon"
            :tone="step.tone ?? (index <= current ? 'success' : 'primary')"
            size="md"
          >
            <span v-if="!step.icon" class="text-base font-semibold">{{ index + 1 }}</span>
          </QIconCircle>

          <span
            v-if="numbered && step.icon"
            :class="[
              'absolute -right-6 -bottom-2 inline-flex size-15 items-center justify-center rounded-full text-xs font-semibold text-white',
              index <= current ? 'bg-success' : 'bg-primary',
            ]"
          >
            {{ index + 1 }}
          </span>
        </div>

        <QDivider
          v-if="orientation === 'vertical' && index < steps.length - 1"
          orientation="vertical"
          dashed
          :length="32"
          class="grow"
        />
      </div>

      <!-- Colonne texte -->
      <div :class="['flex min-w-0 flex-col', orientation === 'vertical' ? 'flex-1 pb-24' : 'items-center']">
        <p class="m-0 text-base font-bold text-text">{{ step.title }}</p>
        <p v-if="step.description" class="mt-2 mb-0 text-sm font-medium text-text">
          {{ step.description }}
        </p>
      </div>
    </li>
  </ol>
</template>
