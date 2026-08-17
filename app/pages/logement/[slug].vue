<script setup lang="ts">
/**
 * Offres de logement ← `maquette/pwa/pages/offres-logement.html`
 * (`.formule-*`, `.of-card-badge`, `.ol-*`). Un carrousel de trois formules,
 * comme `orientation/formules.vue` (même famille `.formule-*`) — bandeau
 * pays et statistiques en plus (`.ol-banner`), propres à cet écran.
 *
 * `logement/index.vue` reste un sélecteur de destination sans navigation ;
 * ses cartes pointent maintenant ici (`logement/[slug]`, cadré avec le
 * responsable).
 *
 * Les trois formules (Comoé/Volga/Yukon) viennent de
 * `config/logement-offers.ts`, déjà utilisé par `logement/paiement-reussi.vue`
 * (même icône, même prix). L'accent de Comoé/Volga reprend les paliers
 * génériques 1/2 (`--color-tier-1*`/`--color-tier-2`, comme `OfferTierCard`) ;
 * Yukon a son propre orange, distinct du rouge « everest ». Volga porte en
 * plus le bandeau « La plus choisie » (`.ol-card-ribbon`) — absent des
 * paliers génériques.
 *
 * Le total de logements par formule (badge « X logements proposés ») vient
 * de `logementsCount`, comme le texte au pluriel du tableau de bord
 * (`logementConfirmation.featureLogements`).
 *
 * Le bouton « plein » de Yukon n'a **pas** de bordure — mesuré, pas une
 * coquille : `.formule-card--yukon .formule-card-btn--solid` fixe
 * `border-color` sans `border-style`/`-width`, contrairement au palier
 * « everest » générique qui pose `border: 1px solid`. 1,6px d'écart de
 * hauteur sinon, propagé aux trois cartes par l'étirement du carrousel
 * (`align-items: stretch` sur `.formule-slider-track`).
 */
import { logementDestinations } from '~/config/logement-destinations'
import { logementOffers } from '~/config/logement-offers'

const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()

const destination = computed(
  () => logementDestinations.find((d) => d.id === route.params.slug) ?? logementDestinations[0]!,
)
const pays = computed(() => destination.value.id)

const tiers = [
  {
    id: 'comoe',
    isTop: false,
    featured: false,
    card: 'border-tier-border',
    name: 'text-tier-1',
    badgeBg: 'bg-ol-badge-comoe-bg',
    badgeText: 'text-ol-badge-comoe',
    price: 'text-tier-1-price',
    button: 'border border-tier-1-line bg-white text-tier-1-line',
    items: [
      { icon: 'ic-ol-check-green', key: 'featureFicheLogement' },
      { icon: 'ic-ol-check-green', key: 'featureFicheQuartier' },
    ],
  },
  {
    id: 'volga',
    isTop: false,
    featured: true,
    card: 'border-ol-featured-border',
    name: 'text-tier-2',
    badgeBg: 'bg-ol-badge-volga-bg',
    badgeText: 'text-ol-badge-volga',
    price: 'text-tier-2',
    button: 'border border-tier-2 bg-white text-tier-2',
    items: [
      { icon: 'ic-ol-check-purple', key: 'featureFicheLogement' },
      { icon: 'ic-ol-check-purple', key: 'featureFicheQuartier' },
      { icon: 'ic-ol-check-purple', key: 'featureGarant' },
    ],
  },
  {
    id: 'yukon',
    isTop: true,
    featured: false,
    card: 'border-ol-yukon-border',
    name: 'text-ol-yukon-name',
    badgeBg: 'bg-ol-badge-yukon-bg',
    badgeText: 'text-ol-badge-yukon',
    price: 'text-ol-yukon-price',
    button: 'bg-ol-yukon-button text-white',
    items: [
      { icon: 'ic-ol-check-orange', key: 'featureFicheLogement' },
      { icon: 'ic-ol-check-orange', key: 'featureFicheQuartier' },
      { icon: 'ic-ol-check-orange', key: 'featureGarant' },
      { icon: 'ic-ol-check-orange-alt', key: 'featureAdmin' },
      { icon: 'ic-ol-check-orange-sm', key: 'featureTaxi' },
      { icon: 'ic-ol-check-orange-sm', key: 'featureSim' },
    ],
  },
] as const

const stats = [
  { icon: 'ic-ol-stat-caution', valueKey: 'housing.offers.statCautionValue', labelKey: 'housing.offers.statCautionLabel' },
  { icon: 'ic-ol-stat-bail', valueKey: 'housing.offers.statBailValue', labelKey: 'housing.offers.statBailLabel' },
  { icon: 'ic-ol-stat-charges', valueKey: 'housing.offers.statChargesValue', labelKey: 'housing.offers.statChargesLabel' },
  { icon: 'ic-ol-stat-loyer', valueKey: 'housing.offers.statLoyerValue', labelKey: 'housing.offers.statLoyerLabel' },
]

/** Volga (« LA PLUS CHOISIE ») en premier, comme la maquette. */
const current = ref(1)

function go(index: number) {
  current.value = Math.min(Math.max(index, 0), tiers.length - 1)
}

usePageSeo(() => ({
  title: t('housing.offers.seoTitle'),
  description: t('housing.offers.seoDescription'),
}))
</script>

<template>
  <AppTopBar back back-to="/logement" :notifications="3" />

  <!-- Bandeau pays -->
  <section class="box-border flex w-full flex-col items-center gap-24 rounded-xl bg-ol-banner-bg py-17">
    <div class="box-border flex w-full items-center gap-10 px-13">
      <img :src="destination.flag" alt="" width="24" height="24" class="block size-24 shrink-0 rounded-full object-cover">
      <h1 class="m-0 min-w-0 flex-1 text-xl leading-normal font-semibold tracking-[-0.65px] text-text">
        {{ $t('housing.offers.bannerHeadline') }}
      </h1>
    </div>
    <div class="box-border flex w-full items-start px-9">
      <div v-for="stat in stats" :key="stat.icon" class="flex min-w-0 flex-1 flex-col items-center gap-5 text-center">
        <QIcon :name="stat.icon" :size="40" />
        <p class="m-0 mt-6 text-md leading-[13.125px] font-semibold whitespace-nowrap text-navy">{{ $t(stat.valueKey) }}</p>
        <p class="m-0 text-xs leading-normal font-medium text-text">{{ $t(stat.labelKey) }}</p>
      </div>
    </div>
  </section>

  <!-- Introduction -->
  <div class="w-full pt-20 pb-8">
    <h1 class="m-0 text-exact-16 leading-22 font-semibold tracking-[0.2px] text-text">
      {{ $t('housing.offers.introTitle') }}
    </h1>
  </div>

  <!-- Carrousel de formules -->
  <div class="w-full pt-20 pb-16">
    <div class="grid w-full grid-cols-[28px_minmax(0,1fr)_28px] items-center gap-4 max-2xs:grid-cols-[24px_minmax(0,1fr)_24px] max-2xs:gap-2">
      <button
        type="button"
        class="inline-flex size-28 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-slider-arrow transition-colors duration-150 hover:bg-slider-arrow-bg hover:text-primary-cta"
        :aria-label="$t('ds.carousel.previous')"
        :disabled="current === 0"
        @click="go(current - 1)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 6L9 12L15 18" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <div class="w-full touch-pan-y overflow-hidden">
        <div
          class="flex w-full motion-safe:transition-transform motion-safe:duration-[320ms] motion-safe:ease-out"
          :style="{ transform: `translateX(-${current * 100}%)` }"
        >
          <article
            v-for="tier in tiers"
            :key="tier.id"
            :class="[
              'relative box-border flex w-full min-w-0 shrink-0 basis-full flex-col gap-14 rounded-2xl border bg-white px-20 pt-22 pb-24 max-2xs:px-14 max-2xs:pt-18 max-2xs:pb-20',
              tier.card,
              tier.featured ? 'overflow-hidden shadow-[0_0_7px_-2px_rgba(0,0,0,0.1)]' : 'overflow-visible',
            ]"
          >
            <div
              v-if="tier.featured"
              class="absolute top-0 left-1/2 z-1 flex -translate-x-1/2 items-center gap-4 rounded-b-2xl bg-ol-featured-border px-10 py-3 text-[9px] leading-[13.5px] font-medium tracking-[0.45px] whitespace-nowrap text-white uppercase shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
            >
              <span class="font-jakarta text-[10px] font-extrabold">★</span>
              <span>{{ $t('housing.offers.ribbon') }}</span>
            </div>

            <header :class="['flex w-full flex-col items-center', tier.featured ? 'pt-10' : '']">
              <span
                v-if="tier.isTop"
                class="flex size-36 shrink-0 items-center justify-center overflow-hidden rounded-full"
                :class="tier.badgeBg"
              >
                <QIcon :name="`ic-ol-${tier.id}`" :size="44" />
              </span>
              <QIcon v-else :name="`ic-ol-${tier.id}`" :size="36" />

              <h2 :class="['mt-4 mb-0 text-4xl leading-28 font-semibold whitespace-nowrap max-2xs:text-3xl', tier.name]">
                {{ $t(`housing.offers.${tier.id}.name`) }}
              </h2>
              <span :class="['mt-8 inline-flex items-center justify-center rounded-exact-5 px-6 text-sm leading-[16.5px] font-semibold whitespace-nowrap', tier.badgeBg, tier.badgeText]">
                {{ $t('housing.offers.badgeCount', logementOffers[tier.id]!.logementsCount) }}
              </span>
              <p class="m-0 max-w-260 pt-6 text-center text-lg leading-18 text-text">
                {{ $t(`housing.offers.${tier.id}.tagline`) }}
              </p>

              <hr class="mt-14 w-full border-0 border-t border-border-soft">
            </header>

            <ul class="m-0 flex w-full list-none flex-col gap-8 p-0">
              <li v-for="item in tier.items" :key="item.key" class="flex items-center gap-10 text-lg leading-18 text-text">
                <QIcon :name="item.icon" :size="12" />
                <span class="min-w-0">{{ $t(`housing.offers.${item.key}`) }}</span>
              </li>
            </ul>

            <footer class="mt-auto flex w-full flex-col items-center gap-14 pt-8">
              <p :class="['m-0 text-6xl leading-[1.1] font-semibold whitespace-nowrap max-2xs:text-5xl', tier.price]">
                {{ logementOffers[tier.id]!.price }}
              </p>

              <NuxtLink
                :to="localePath(`/logement/paiement-reussi?pays=${pays}&formule=${tier.id}`)"
                :class="['flex w-full cursor-pointer items-center justify-center rounded-lg px-16 py-14 text-center text-xl leading-20 font-semibold whitespace-nowrap no-underline', tier.button]"
              >
                {{ $t('offer.choose') }}
              </NuxtLink>
            </footer>
          </article>
        </div>
      </div>

      <button
        type="button"
        class="inline-flex size-28 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-slider-arrow transition-colors duration-150 hover:bg-slider-arrow-bg hover:text-primary-cta"
        :aria-label="$t('ds.carousel.next')"
        :disabled="current >= tiers.length - 1"
        @click="go(current + 1)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <div role="tablist" :aria-label="$t('offer.tiersLabel')" class="mt-14 flex items-center justify-center gap-8">
      <button
        v-for="(tier, index) in tiers"
        :key="tier.id"
        type="button"
        role="tab"
        :aria-selected="index === current"
        :aria-label="$t(`housing.offers.${tier.id}.name`)"
        :class="[
          'h-6 cursor-pointer rounded-full border-0 p-0 transition-all duration-200',
          index === current ? 'w-18 bg-primary-cta' : 'w-6 bg-slider-dot',
        ]"
        @click="go(index)"
      />
    </div>
  </div>

  <TrustStrip />
</template>
