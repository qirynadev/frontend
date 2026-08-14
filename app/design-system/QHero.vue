<script setup lang="ts">
/**
 * En-tête d'écran : titre + accroche à gauche, illustration à droite.
 * Absorbe `hero-row`, `connexion-hero*`, `inscription-hero*`, `mdp-hero*`,
 * `oo-hero*`, `projet-hero*`, `dest-intro`, `langue-intro`, `objectifs-intro`,
 * `formule-intro` (~35 classes).
 *
 * L'illustration passe obligatoirement par `<NuxtImg>` : format WebP et
 * `sizes` responsives, jamais le PNG brut de la maquette.
 */

withDefaults(
  defineProps<{
    title: string
    text?: string
    /** Chemin de l'illustration. Omis → le slot `illustration` prend le relais. */
    image?: string
    /** Texte alternatif ; vide si l'image est purement décorative. */
    imageAlt?: string
    imageWidth?: number
    imageHeight?: number
    /** Sans illustration, le bloc texte peut être centré. */
    align?: 'start' | 'center'
  }>(),
  {
    text: undefined,
    image: undefined,
    imageAlt: '',
    imageWidth: 185,
    imageHeight: 178,
    align: 'start',
  },
)
</script>

<template>
  <section :class="['flex w-full gap-10 py-16', align === 'center' ? 'flex-col items-center text-center' : 'items-start']">
    <div class="min-w-0 flex-1">
      <h1 class="m-0 text-4xl font-semibold tracking-tight text-text">{{ title }}</h1>
      <p v-if="text" class="mt-8 mb-0 text-xl text-text">{{ text }}</p>
      <div v-if="$slots.default" class="pt-16">
        <slot />
      </div>
    </div>

    <div v-if="image || $slots.illustration" class="shrink-0" :style="{ width: `${imageWidth}px` }">
      <slot name="illustration">
        <NuxtImg
          v-if="image"
          :src="image"
          :alt="imageAlt"
          :width="imageWidth"
          :height="imageHeight"
          format="webp"
          sizes="185px shell:260px"
          class="h-auto w-full object-contain"
        />
      </slot>
    </div>
  </section>
</template>
