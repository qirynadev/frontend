<script setup lang="ts">
import type { OfferSummary } from '~/core/contracts'

/**
 * Carte « domaine d'étude » de la fiche destination.
 *
 * La maquette annonce « 20+ écoles » par domaine. Ce chiffre **n'existe nulle
 * part** dans l'API : `/areas-of-studies/{id}` répond 500 et aucune école ne
 * porte de domaine. On affiche donc le prix de l'accompagnement, qui est réel,
 * plutôt qu'un décompte inventé.
 */
defineProps<{ offer: OfferSummary }>()

const localePath = useLocalePath()
const { n } = useI18n()
</script>

<template>
  <QCard :to="localePath(`/offres/${offer.slug}`)" variant="tinted" tone="neutral" padding="sm">
    <QMediaRow gap="md">
      <template #leading>
        <QIconCircle tone="primary" size="lg">
          <NuxtImg
            v-if="offer.icon"
            :src="offer.icon"
            alt=""
            width="24"
            height="24"
            format="webp"
            loading="lazy"
            class="size-24 object-contain"
          />
          <QIcon v-else name="graduation" :size="24" />
        </QIconCircle>
      </template>

      <template #title>
        <p class="m-0 text-base font-semibold text-navy">{{ offer.title }}</p>
      </template>

      <template #description>
        <p v-if="offer.price.amount > 0" class="m-0 text-sm text-muted-2">
          {{ $t('offer.fromPrice', { price: n(offer.price.amount, 'currency') }) }}
        </p>
      </template>

      <template #trailing>
        <QIconCircle tone="primary" size="sm" solid>
          <QIcon name="arrow-right" :size="14" />
        </QIconCircle>
      </template>
    </QMediaRow>
  </QCard>
</template>
