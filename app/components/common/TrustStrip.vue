<script setup lang="ts">
import type { TrustItem } from '~/design-system/types'

/**
 * Bandeau de réassurance présent au bas de six écrans de la maquette.
 *
 * Contenu **éditorial fixe** : il ne vient d'aucun endpoint. Défini ici une
 * fois et traduit — là où la maquette le recopie dans chaque page (41 classes
 * CSS pour six copies du même bloc).
 *
 * Les libellés tiennent sur deux lignes imposées, comme dans la maquette.
 */
const { t } = useI18n()

const items = computed<TrustItem[]>(() => [
  { icon: 'ic-trust-shield', label: t('trust.payment1'), label2: t('trust.payment2') },
  { icon: 'ic-trust-laurel', label: t('trust.support1'), label2: t('trust.support2'), circled: true },
  { icon: 'ic-trust-smile', label: t('trust.satisfaction1'), label2: t('trust.satisfaction2') },
])
</script>

<template>
  <QTrustBar :items="items" :aria-label="$t('trust.label')" />
</template>
