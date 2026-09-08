<script setup lang="ts">
/**
 * Barre supérieure : retour · logo/titre · action.
 * Absorbe les 12 `*-topbar` de la maquette et leurs `*-logo-frame`.
 */

withDefaults(
  defineProps<{
    /** Affiche le bouton retour. */
    back?: boolean
    /** Libellé accessible du bouton retour (déjà traduit). */
    backLabel?: string
    /** Titre centré. Sans titre ni slot `brand`, le centre reste vide. */
    title?: string
    sticky?: boolean
  }>(),
  { back: false, backLabel: undefined, title: undefined, sticky: false },
)

const emit = defineEmits<{ back: [] }>()
</script>

<template>
  <header
    :class="[
      'flex w-full items-center justify-between gap-8 bg-surface-card py-12',
      sticky ? 'sticky top-0 z-40 pt-safe-top' : '',
    ]"
  >
    <div class="flex min-w-49 shrink-0 justify-start">
      <slot name="leading">
        <QIconButton
          v-if="back"
          icon="chevron-left"
          :label="backLabel ?? $t('ds.topbar.back')"
          size="md"
          @click="emit('back')"
        />
      </slot>
    </div>

    <div class="flex min-w-0 flex-1 justify-center">
      <slot name="brand">
        <p v-if="title" class="m-0 truncate text-3xl font-semibold text-text">{{ title }}</p>
      </slot>
    </div>

    <div class="flex min-w-49 shrink-0 justify-end">
      <slot name="trailing" />
    </div>
  </header>
</template>
