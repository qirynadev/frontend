<script setup lang="ts">
import type { DestinationSummary } from '~/core/contracts'

/**
 * Carte de la grille de destinations — portage littéral de `.dest-card`.
 *
 * | Élément | Maquette |
 * |---|---|
 * | carte | `min-height: 217px` (0 sous 400px), `padding: 7px 7px 10px`, rayon 10, ombre `0 0 3.5px`, `gap: 32px` |
 * | photo | 100 % × 112px, `object-fit: cover`, rayon 4 |
 * | drapeau | 31×31 rond, centré, `bottom: -15.5px` |
 * | nom | 12px / 20px, `font-weight: 700` |
 * | méta | 7px / 16,5px, `font-weight: 600`, icône 9×9 |
 *
 * Écart de **donnée** : la maquette annonce « 350+ logements ». L'API ne
 * compte pas les logements ; on affiche le nombre d'écoles, qui est réel.
 */
defineProps<{ destination: DestinationSummary }>()

const localePath = useLocalePath()
</script>

<template>
  <NuxtLink
    :to="localePath(`/destinations/${destination.slug}`)"
    class="relative flex min-h-217 max-xs:min-h-0 w-full flex-col items-start gap-32 rounded-xl border border-transparent bg-white px-7 pt-7 pb-10 text-left text-text no-underline shadow-card"
  >
    <div class="relative h-112 w-full shrink-0">
      <NuxtImg
        v-if="destination.image"
        :src="destination.image"
        :alt="destination.title"
        width="206"
        height="224"
        format="webp"
        loading="lazy"
        sizes="110px shell:220px"
        class="block h-112 w-full rounded-sm object-cover"
      />
      <div v-else class="flex h-112 w-full items-center justify-center rounded-sm bg-surface-2">
        <QIcon name="ic-dom-stat-globe" :size="24" />
      </div>

      <img
        v-if="destination.country.flag"
        :src="destination.country.flag"
        alt=""
        width="31"
        height="31"
        loading="lazy"
        class="absolute bottom-[-15.5px] left-1/2 z-1 block size-31 -translate-x-1/2 rounded-full object-cover"
      >
    </div>

    <div class="flex w-full flex-col items-start">
      <p class="m-0 w-full text-base leading-20 font-bold text-text">{{ destination.title }}</p>

      <div class="flex w-full items-center justify-between">
        <span class="flex min-w-0 flex-1 items-center gap-4">
          <QIcon name="ic-dest-home" :size="9" />
          <span class="truncate text-3xs leading-[16.5px] font-semibold text-text">
            {{ $t('destination.schoolCount', destination.schoolCount) }}
          </span>
        </span>
        <QIcon name="ic-dest-chevron" :size="9" />
      </div>
    </div>
  </NuxtLink>
</template>
