<script setup lang="ts">
import type { SchoolSummary } from '~/core/contracts'

/**
 * Ligne de la liste d'écoles.
 *
 * ⚠️ La ville et le pays affichés sont **ceux de l'école**, pas ceux de la
 * destination parcourue. Le catalogue contient des rattachements erronés (l'IMD,
 * à Lausanne, est classé sous la France) : afficher le pays de la destination
 * donnerait une information fausse à l'utilisateur.
 */
defineProps<{ school: SchoolSummary; destinationSlug: string }>()

const localePath = useLocalePath()
</script>

<template>
  <QCard
    :to="localePath(`/destinations/${destinationSlug}/ecoles/${school.slug}`)"
    variant="outlined"
    padding="sm"
  >
    <QMediaRow align="start" gap="md">
      <template #leading>
        <div class="size-64 shrink-0 overflow-hidden rounded-lg bg-surface">
          <NuxtImg
            v-if="school.logo"
            :src="school.logo"
            :alt="school.title"
            width="64"
            height="64"
            format="webp"
            loading="lazy"
            class="size-full object-contain p-6"
          />
          <span v-else class="flex size-full items-center justify-center">
            <QIcon name="building" :size="24" class="text-muted" />
          </span>
        </div>
      </template>

      <template #title>
        <p class="m-0 line-clamp-2 text-base font-semibold text-navy">{{ school.title }}</p>
      </template>

      <template #meta>
        <span class="flex flex-wrap items-center gap-x-12 gap-y-2">
          <span v-if="school.city" class="flex items-center gap-4 text-sm text-muted-2">
            <QIcon name="map-pin" :size="12" />
            {{ school.city }}<template v-if="school.country.name">, {{ school.country.name }}</template>
          </span>
          <span v-if="school.formationCount > 0" class="flex items-center gap-4 text-sm text-muted-2">
            <QIcon name="graduation" :size="12" />
            {{ $t('school.formationCount', school.formationCount) }}
          </span>
        </span>
      </template>

      <template #trailing>
        <QIcon name="chevron-right" :size="16" class="text-muted" />
      </template>
    </QMediaRow>
  </QCard>
</template>
