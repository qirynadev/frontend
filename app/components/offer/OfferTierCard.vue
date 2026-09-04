<script setup lang="ts">
import type { OfferTier } from '~/core/contracts'
import { DOMAIN_OFFER_FEATURE_IDS } from '~/config/offer-domain-features'

/**
 * Carte tarifaire — `.formule-card` / pile type `orientation-formules.html`.
 *
 * | Mode | Usage |
 * |---|---|
 * | `domain` | Palier unique domaine — même pile que langue/orientation (ruban + titre/icône) |
 * | `stacked` | Pile langue (comme `/orientation/formules`) — ruban coloré + titre/icône inline |
 * | défaut | Carte classique (icône au-dessus du nom) — fallback |
 *
 * Accent déduit du rang (prix croissant) : vert → violet → rouge.
 */
const props = withDefaults(
  defineProps<{
    tier: OfferTier
    index?: number
    total?: number
    loading?: boolean
    disabled?: boolean
    domain?: boolean
    domainSlug?: string
    /** Pile verticale + ruban (formules langue / orientation). */
    stacked?: boolean
  }>(),
  {
    index: 0,
    total: 1,
    loading: false,
    disabled: false,
    domain: false,
    domainSlug: '',
    stacked: false,
  },
)

const emit = defineEmits<{ choose: [tier: OfferTier] }>()

const { n, t } = useI18n()

const tagline = computed(() => props.tier.tagline || t(`offer.tagline${Math.min(props.index + 1, 3)}`))

const isTop = computed(() => props.total > 1 && props.index === props.total - 1)

const accent = computed(() => {
  if (props.domain) {
    return {
      card: 'border-tier-border',
      name: 'text-tier-2',
      price: 'text-tier-2',
      button: 'border border-tier-2 bg-surface-card text-tier-2',
      icon: 'ic-oo-feature-1',
      check: 'ic-of-check-purple',
      ribbonBg: 'bg-tier-2',
    }
  }
  if (isTop.value) {
    return {
      card: 'border-tier-3-border',
      name: 'text-tier-3',
      price: 'text-tier-3',
      button: 'border border-tier-3 bg-surface-card text-tier-3',
      icon: 'ic-formule-everest',
      check: 'ic-of-check-red',
      ribbonBg: 'bg-tier-3',
    }
  }
  if (props.index === 0) {
    return {
      card: 'border-tier-border',
      name: 'text-tier-1',
      price: 'text-tier-1-price',
      button: 'border border-tier-1-line bg-surface-card text-tier-1-line',
      icon: 'ic-formule-kili',
      check: 'ic-of-check-green',
      ribbonBg: 'bg-tier-1',
    }
  }
  return {
    card: 'border-tier-border',
    name: 'text-tier-2',
    price: 'text-tier-2',
    button: 'border border-tier-2 bg-surface-card text-tier-2',
    icon: 'ic-formule-acon',
    check: 'ic-of-check-purple',
    ribbonBg: 'bg-tier-2',
  }
})

/**
 * Repli Figma : titres génériques, utilisés seulement quand l'offre du
 * domaine n'a encore aucune prestation renseignée côté back-office
 * (`tier.features` vide) — dès qu'un contenu admin existe, même sommaire, on
 * l'affiche (voir `docs/directives-backend.md` pour la qualité éditoriale
 * encore à compléter sur certains domaines).
 */
const domainFeatures = computed(() => {
  if (!props.domain) return []
  return DOMAIN_OFFER_FEATURE_IDS.map((id) => ({
    id,
    labelKey: `offer.domainFeature.${id}` as const,
  }))
})

const displayName = computed(() => (props.domain ? t('offer.domainCardName') : props.tier.name))

/** Domaine = même composition que la pile formules (ruban + titre/icône). */
const asStack = computed(() => props.stacked || props.domain)

const ribbonLabel = computed(() => {
  if (props.domain) return t('offer.domainBadge')
  return tagline.value
})
</script>

<template>
  <article
    :class="[
      'relative box-border flex w-full min-w-0 flex-col gap-8 rounded-2xl border bg-surface-card px-20 pb-16 max-2xs:px-14 max-2xs:pb-14',
      asStack ? 'overflow-visible pt-26' : 'shrink-0 basis-full pt-22 max-2xs:pt-18',
      accent.card,
    ]"
  >
    <!-- Ruban (pile langue / orientation / domaine) -->
    <span
      v-if="asStack && ribbonLabel"
      :class="[
        'absolute -top-11 left-14 z-1 inline-flex max-w-[calc(100%-28px)] items-center justify-center rounded-full px-12 py-4 text-center text-md leading-14 font-semibold text-white',
        accent.ribbonBg,
      ]"
    >
      {{ ribbonLabel }}
    </span>

    <header class="flex w-full flex-col items-center">
      <!-- Titre + icône sur une ligne (mode pile) -->
      <div v-if="asStack" class="flex w-full flex-row items-center justify-center gap-8">
        <span
          v-if="isTop"
          class="flex size-36 shrink-0 items-center justify-center overflow-hidden rounded-full bg-tier-3-bg"
        >
          <QIcon :name="accent.icon" :size="44" />
        </span>
        <QIcon v-else :name="accent.icon" :size="36" />
        <h2
          :class="[
            'm-0 text-4xl leading-28 font-semibold max-2xs:text-3xl',
            domain ? 'text-center whitespace-normal' : 'whitespace-nowrap',
            accent.name,
          ]"
        >
          {{ displayName }}
        </h2>
      </div>

      <!-- Disposition classique (fallback) -->
      <template v-else>
        <span
          v-if="isTop"
          class="flex size-36 shrink-0 items-center justify-center overflow-hidden rounded-full bg-tier-3-bg"
        >
          <QIcon :name="accent.icon" :size="44" />
        </span>
        <QIcon v-else :name="accent.icon" :size="36" />

        <h2 :class="['mt-4 mb-0 text-4xl leading-28 font-semibold whitespace-nowrap max-2xs:text-3xl', accent.name]">
          {{ displayName }}
        </h2>
      </template>

      <p v-if="domain" class="m-0 max-w-260 pt-8 text-center text-lg leading-18 text-text">
        {{ $t('offer.domainIncluded') }}
      </p>
      <p v-else-if="!asStack && tagline" class="m-0 max-w-260 pt-6 text-center text-lg leading-18 text-text">
        {{ tagline }}
      </p>

      <hr class="mt-14 w-full border-0 border-t border-border-soft">
    </header>

    <ul v-if="tier.features.length > 0" class="m-0 flex w-full list-none flex-col gap-8 p-0">
      <li
        v-for="feature in tier.features"
        :key="feature"
        class="flex items-start gap-10 text-lg leading-18 text-text"
      >
        <QIcon :name="accent.check" :size="12" class="mt-3 shrink-0" />
        <span class="min-w-0">{{ feature }}</span>
      </li>
    </ul>

    <ul v-else-if="domain && domainFeatures.length > 0" class="m-0 flex w-full list-none flex-col gap-8 p-0">
      <li v-for="feature in domainFeatures" :key="feature.id" class="flex items-start gap-10 text-lg leading-18 text-text">
        <QIcon :name="accent.check" :size="12" class="mt-3 shrink-0" />
        <span class="min-w-0">{{ $t(feature.labelKey) }}</span>
      </li>
    </ul>

    <footer :class="['flex w-full flex-col items-center gap-8 pt-8', asStack ? 'mt-8' : 'mt-auto']">
      <div class="flex flex-col items-center gap-2">
        <p :class="['m-0 text-6xl leading-[1.1] font-semibold whitespace-nowrap max-2xs:text-5xl', accent.price]">
          {{ n(tier.price.amount, 'currency') }}
        </p>
        <p
          v-if="tier.periodLabel !== 'month'"
          class="m-0 text-center text-base leading-[1.2] font-medium text-tier-period"
        >
          {{ $t('offer.oneOff') }}
        </p>
      </div>

      <button
        type="button"
        :disabled="loading || disabled"
        :class="[
          'flex w-full cursor-pointer items-center justify-center rounded-lg px-16 py-14 text-center text-xl leading-20 font-semibold whitespace-nowrap',
          accent.button,
          loading || disabled ? 'cursor-not-allowed opacity-60' : '',
        ]"
        @click="emit('choose', tier)"
      >
        <QSpinner v-if="loading" size="sm" />
        <span v-else>{{ domain ? $t('offer.startAccompaniment') : $t('offer.choose') }}</span>
      </button>
    </footer>
  </article>
</template>
