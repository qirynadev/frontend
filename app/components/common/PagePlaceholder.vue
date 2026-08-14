<script setup lang="ts">
/**
 * Écran d'attente des routes de la navigation principale.
 *
 * Il existe pour que la barre basse soit réellement cliquable et vérifiable dès
 * le Lot 3. Chacun sera remplacé par son écran de maquette au Lot 4.
 */
defineProps<{ title: string }>()
</script>

<template>
  <div class="flex min-h-[60dvh] items-center">
    <QEmptyState :title="title" :description="$t('placeholder.description')" icon="lightbulb" tone="primary">
      <template #action>
        <QButton to="/" variant="outline" icon-start="home">{{ $t('nav.home') }}</QButton>
      </template>
    </QEmptyState>
  </div>
</template>
