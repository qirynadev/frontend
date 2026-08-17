<script setup lang="ts">
/**
 * Formules d'orientation ← `maquette/pwa/pages/orientation-formules.html`
 * (`.formule-*`, `.of-*`). Prolonge `/orientation` (lot B2, écran de
 * découverte) : atteint via son bouton « Commencer mon orientation »,
 * `?path=moi|enfant` conservé pour le bouton retour.
 *
 * Page entièrement statique côté maquette (les trois formules et leur
 * contenu sont écrits en dur dans son script, aucun appel réseau) — pas de
 * `PageState`, `usePageSeo` seul.
 *
 * Resynchronisation maquette du 2026-08-17 (commit `5d60a2d`) : le carrousel
 * (`.formule-slider`, flèches/pastilles/`translateX`) a été retiré, remplacé
 * par une simple pile verticale `.formule-stack` (`gap: 22px`). Les trois
 * cartes s'affichent donc empilées, sans mécanique de défilement.
 *
 * L'accent de chaque carte suit le nom du palier dans la maquette, pas son
 * rang : Jordan (1er, moins cher) porte l'accent violet `--color-tier-2`,
 * Tyson le vert `--color-tier-1`, Pelé le rouge `--color-tier-3` — un ordre
 * non séquentiel, à l'inverse de `formule.html`/`OfferTierCard`. Codé en
 * dur par palier plutôt que déduit du rang.
 *
 * Les trois formules affichent le même prix (300 €/mois) : ainsi dans la
 * maquette, reproduit tel quel.
 */
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()

const path = computed(() => (route.query.path === 'enfant' ? 'enfant' : 'moi'))

const tiers = [
  {
    id: 'jordan',
    icon: 'ic-of-jordan',
    isTop: false,
    card: 'border-tier-border',
    name: 'text-tier-2',
    badgeBg: 'bg-of-badge-jordan-bg',
    badgeText: 'text-of-badge-jordan',
    price: 'text-tier-2',
    button: 'border border-tier-2 bg-white text-tier-2',
    checkIcon: 'ic-of-check-purple',
    features: [1, 2, 3, 4],
  },
  {
    id: 'tyson',
    icon: 'ic-of-tyson',
    isTop: false,
    card: 'border-tier-border',
    name: 'text-tier-1',
    badgeBg: 'bg-of-badge-tyson-bg',
    badgeText: 'text-of-badge-tyson',
    price: 'text-tier-1-price',
    button: 'border border-tier-1-line bg-white text-tier-1-line',
    checkIcon: 'ic-of-check-green',
    features: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    id: 'pele',
    icon: 'ic-of-pele',
    isTop: true,
    card: 'border-tier-3-border',
    name: 'text-tier-3',
    badgeBg: 'bg-of-badge-pele-bg',
    badgeText: 'text-of-badge-pele',
    price: 'text-tier-3',
    button: 'border border-tier-3 bg-tier-3 text-white',
    checkIcon: 'ic-of-check-red',
    features: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
] as const

const features = [
  { icon: 'ic-of-feat-visio', titleKey: 'orientation.formules.featVisioTitle', subKey: 'orientation.formules.featVisioSub' },
  { icon: 'ic-of-feat-conseillers', titleKey: 'orientation.formules.featConseillersTitle', subKey: 'orientation.formules.featConseillersSub' },
  { icon: 'ic-of-feat-parcours', titleKey: 'orientation.formules.featParcoursTitle', subKey: 'orientation.formules.featParcoursSub' },
]

usePageSeo(() => ({
  title: t('orientation.formules.title'),
  description: t('orientation.formules.seoDescription'),
}))
</script>

<template>
  <AppTopBar back :back-to="`/orientation?path=${path}`" :notifications="3" :gap="0" />

  <!-- Introduction. `.of-intro` porte `padding-bottom: 8px` dans la
       maquette, mais une règle plus spécifique le ramène à 0 (mesuré, pas
       reproduit tel quel lu). -->
  <div class="flex w-full items-start justify-between gap-8">
    <div class="min-w-0 flex-1">
      <h1 class="m-0 text-exact-16 leading-normal font-semibold tracking-tight text-text">
        {{ $t('orientation.formules.title') }}
      </h1>
      <p class="m-0 text-lg leading-[22.75px] text-text">
        {{ $t('orientation.formules.subtitle') }}
      </p>
    </div>
    <img
      src="/img/orientation-formules-hero.webp"
      alt=""
      width="105"
      height="105"
      class="-mt-19 -mr-8 block h-105 w-105 shrink-0 object-cover max-sm:hidden"
    >
  </div>

  <!-- Pile de formules -->
  <div class="flex w-full flex-col gap-22 pt-22 pb-22">
    <article
      v-for="tier in tiers"
      :key="tier.id"
      :class="['box-border flex w-full flex-col gap-14 rounded-2xl border bg-white px-20 pt-22 pb-24 max-2xs:px-14 max-2xs:pt-18 max-2xs:pb-20', tier.card]"
    >
      <header class="flex w-full flex-col items-center">
        <span
          v-if="tier.isTop"
          class="flex size-36 shrink-0 items-center justify-center overflow-hidden rounded-full bg-tier-3-bg"
        >
          <QIcon :name="tier.icon" :size="44" />
        </span>
        <QIcon v-else :name="tier.icon" :size="36" />

        <h2 :class="['mt-4 mb-0 text-4xl leading-28 font-semibold whitespace-nowrap max-2xs:text-3xl', tier.name]">
          {{ $t(`orientation.formules.${tier.id}.name`) }}
        </h2>
        <span :class="['mt-8 inline-flex items-center justify-center rounded-exact-5 px-6 text-sm leading-[16.5px] font-semibold whitespace-nowrap', tier.badgeBg, tier.badgeText]">
          {{ $t(`orientation.formules.${tier.id}.badge`) }}
        </span>
        <p class="m-0 max-w-260 pt-6 text-center text-lg leading-18 text-text">
          {{ $t(`orientation.formules.${tier.id}.tagline`) }}
        </p>

        <hr class="mt-14 w-full border-0 border-t border-border-soft">
      </header>

      <ul class="m-0 flex w-full list-none flex-col gap-8 p-0">
        <li v-for="n in tier.features" :key="n" class="flex items-start gap-10 text-lg leading-18 text-text">
          <QIcon :name="tier.checkIcon" :size="12" />
          <span class="min-w-0">{{ $t(`orientation.formules.${tier.id}.feature${n}`) }}</span>
        </li>
      </ul>

      <footer class="mt-8 flex w-full flex-col items-center gap-14 pt-8">
        <div class="flex flex-col items-center gap-2">
          <p :class="['m-0 text-6xl leading-[1.1] font-semibold whitespace-nowrap max-2xs:text-5xl', tier.price]">
            {{ $n(300, 'currency') }}
          </p>
          <p class="m-0 text-center text-base leading-[1.2] font-medium text-tier-period">
            {{ $t('offer.perMonth') }}
          </p>
        </div>

        <NuxtLink
          :to="localePath(`/orientation/paiement-reussi?path=${path}&formule=${tier.id}`)"
          :class="['flex w-full cursor-pointer items-center justify-center rounded-lg px-16 py-14 text-center text-xl leading-20 font-semibold whitespace-nowrap no-underline', tier.button]"
        >
          {{ $t('orientation.formules.choose') }}
        </NuxtLink>
      </footer>
    </article>
  </div>

  <!-- Arguments -->
  <div class="w-full pb-20">
    <div class="flex w-full items-center justify-center gap-13 rounded-xl bg-white px-11 py-13 shadow-card">
      <template v-for="(feature, index) in features" :key="feature.titleKey">
        <span v-if="index > 0" aria-hidden="true" class="h-32 w-0 shrink-0 border-l border-tier-border" />
        <div class="flex min-w-0 flex-1 items-center justify-center gap-5">
          <QIcon :name="feature.icon" :size="24" />
          <div class="flex flex-col items-start pt-6 leading-[13.125px] text-navy">
            <p class="m-0 text-xs leading-[13.125px] font-medium">{{ $t(feature.titleKey) }}</p>
            <p class="m-0 text-2xs leading-[13.125px] font-normal">{{ $t(feature.subKey) }}</p>
          </div>
        </div>
      </template>
    </div>
  </div>

  <TrustStrip />
</template>
