<script setup lang="ts">
/**
 * État **chargement**. Absent de la maquette : celle-ci ne montre que le
 * nominal. Les gabarits `card` et `row` reproduisent la silhouette de `QCard`
 * et `QMediaRow` pour éviter le saut de mise en page à l'arrivée des données.
 */

withDefaults(
  defineProps<{
    variant?: 'text' | 'circle' | 'rect' | 'card' | 'row'
    /** Nombre de lignes du gabarit `text`. */
    lines?: number
    /** Dimensions en px pour `circle` / `rect`. */
    size?: number
    height?: number
  }>(),
  { variant: 'text', lines: 3, size: 40, height: 112 },
)
</script>

<template>
  <!-- `aria-hidden` : l'état de chargement est annoncé une seule fois par la
       région parente (`aria-busy`), pas par chaque barre grise. -->
  <div aria-hidden="true" class="w-full animate-pulse">
    <template v-if="variant === 'text'">
      <div class="flex flex-col gap-8">
        <span
          v-for="line in lines"
          :key="line"
          :class="['h-12 rounded-full bg-border-soft', line === lines ? 'w-3/5' : 'w-full']"
        />
      </div>
    </template>

    <span
      v-else-if="variant === 'circle'"
      class="block shrink-0 rounded-full bg-border-soft"
      :style="{ width: `${size}px`, height: `${size}px` }"
    />

    <span
      v-else-if="variant === 'rect'"
      class="block w-full rounded-xl bg-border-soft"
      :style="{ height: `${height}px` }"
    />

    <div v-else-if="variant === 'row'" class="flex w-full items-center gap-12">
      <span class="size-44 shrink-0 rounded-full bg-border-soft" />
      <div class="flex min-w-0 flex-1 flex-col gap-6">
        <span class="h-12 w-1/2 rounded-full bg-border-soft" />
        <span class="h-10 w-4/5 rounded-full bg-border-soft" />
      </div>
      <span class="size-16 shrink-0 rounded-sm bg-border-soft" />
    </div>

    <div v-else class="flex w-full flex-col gap-12 rounded-xl bg-white p-17 shadow-card">
      <span class="w-full rounded-sm bg-border-soft" :style="{ height: `${height}px` }" />
      <span class="h-12 w-2/3 rounded-full bg-border-soft" />
      <span class="h-10 w-2/5 rounded-full bg-border-soft" />
    </div>
  </div>
</template>
