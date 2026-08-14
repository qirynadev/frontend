<script setup lang="ts">
/**
 * La forme la plus dupliquée de la maquette : `[visuel] · [titre + description] ·
 * [zone droite]`. Elle porte à elle seule ~70 classes du CSS d'origine
 * (`info-row`, `home-menu-item`, `dom-card-main`, `service-body`, `le-school-body`,
 * `ed-form-body`, `lpp-step-card`, `formule-feature`, `oo-feature`, `order-item`…).
 */

withDefaults(
  defineProps<{
    title?: string
    description?: string
    /** Tronque la description à N lignes (`0` = pas de troncature). */
    clamp?: 0 | 1 | 2 | 3
    align?: 'start' | 'center'
    /** Écarte visuellement le contenu gauche et la zone droite. */
    spread?: boolean
    gap?: 'sm' | 'md' | 'lg'
  }>(),
  { title: undefined, description: undefined, clamp: 0, align: 'center', spread: true, gap: 'md' },
)

const gapClass = { sm: 'gap-8', md: 'gap-12', lg: 'gap-16' }
const clampClass: Record<number, string> = {
  0: '',
  1: 'line-clamp-1',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
}
</script>

<template>
  <div
    :class="[
      'flex w-full',
      gapClass[gap],
      align === 'center' ? 'items-center' : 'items-start',
      spread ? 'justify-between' : '',
    ]"
  >
    <div :class="['flex min-w-0 flex-1', gapClass[gap], align === 'center' ? 'items-center' : 'items-start']">
      <slot name="leading" />

      <div class="flex min-w-0 flex-1 flex-col gap-4">
        <slot name="title">
          <p v-if="title" class="m-0 text-base font-semibold text-text">{{ title }}</p>
        </slot>
        <slot name="description">
          <p v-if="description" :class="['m-0 text-sm text-text', clampClass[clamp]]">
            {{ description }}
          </p>
        </slot>
        <slot name="meta" />
      </div>
    </div>

    <div v-if="$slots.trailing" class="flex shrink-0 items-center gap-8">
      <slot name="trailing" />
    </div>
  </div>
</template>
