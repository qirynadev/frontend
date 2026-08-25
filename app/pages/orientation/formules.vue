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
 * Espacements relevés sur `.page-of .formule-main` :
 * - `gap: 22px` entre intro / pile / features / trust
 * - `.of-intro` `padding-bottom: 8px`
 * - `.formule-stack` `padding-top: 8px` + `gap: 22px` entre cartes
 * - cartes `.of-card` `padding-top: 26px` (sinon `22px 20px 24px` ; ≤380px → `px-14 pb-20`)
 * - pied de carte : `margin-top: 8px` + `padding-top: 8px` + `gap: 14px`
 *
 * L'accent de chaque carte suit le nom du palier dans la maquette, pas son
 * rang : Jordan (violet), Tyson (vert), Pelé (rouge).
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
    ribbonBg: 'bg-tier-2',
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
    ribbonBg: 'bg-tier-1',
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
    ribbonBg: 'bg-tier-3',
    card: 'border-tier-3-border',
    name: 'text-tier-3',
    badgeBg: 'bg-of-badge-pele-bg',
    badgeText: 'text-of-badge-pele',
    price: 'text-tier-3',
    button: 'border border-tier-3 bg-white text-tier-3',
    checkIcon: 'ic-of-check-red',
    features: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
] as const

usePageSeo(() => ({
  title: t('offer.title'),
  description: t('offer.subtitle'),
}))
</script>

<template>
  <!-- `gap: 22` = espace topbar → intro (`.page-of .formule-main { gap: 22px }`) -->
  <AppTopBar back :back-to="`/orientation?path=${path}`" :notifications="3" :gap="22" />

  <div class="flex w-full flex-col gap-22">
    <div class="w-full pb-8">
      <h1 class="m-0 text-exact-16 leading-normal font-semibold tracking-tight text-text">
        {{ $t('offer.title') }}
      </h1>
      <p class="m-0 text-lg leading-[22.75px] text-text">
        {{ $t('offer.subtitle') }}
      </p>
    </div>

    <!-- `.formule-stack` — `padding-top: 8px`, `gap: 22px` -->
    <div class="flex w-full flex-col gap-22 pt-8">
      <article
        v-for="tier in tiers"
        :key="tier.id"
        :class="[
          'relative box-border flex w-full flex-col gap-14 overflow-visible rounded-2xl border bg-white px-20 pt-26 pb-16 max-2xs:px-14 max-2xs:pb-14',
          tier.card,
        ]"
      >
        <span
          :class="[
            'absolute -top-11 left-14 z-1 inline-flex max-w-[calc(100%-28px)] items-center justify-center rounded-full px-12 py-4 text-center text-md leading-14 font-semibold text-white',
            tier.ribbonBg,
          ]"
        >
          {{ $t(`orientation.formules.${tier.id}.tagline`) }}
        </span>

        <header class="flex w-full flex-col items-center">
          <div class="flex w-full flex-row items-center justify-center gap-8">
            <span
              v-if="tier.isTop"
              class="flex size-36 shrink-0 items-center justify-center overflow-hidden rounded-full bg-tier-3-bg"
            >
              <QIcon :name="tier.icon" :size="44" />
            </span>
            <QIcon v-else :name="tier.icon" :size="36" />
            <h2 :class="['m-0 text-4xl leading-28 font-semibold whitespace-nowrap max-2xs:text-3xl', tier.name]">
              {{ $t(`orientation.formules.${tier.id}.name`) }}
            </h2>
          </div>
          <span :class="['mt-8 inline-flex items-center justify-center rounded-exact-5 px-6 text-sm leading-[16.5px] font-semibold whitespace-nowrap', tier.badgeBg, tier.badgeText]">
            {{ $t(`orientation.formules.${tier.id}.badge`) }}
          </span>

          <hr class="mt-14 w-full border-0 border-t border-border-soft">
        </header>

        <ul class="m-0 flex w-full list-none flex-col gap-8 p-0">
          <li v-for="n in tier.features" :key="n" class="flex items-start gap-10 text-lg leading-18 text-text">
            <QIcon :name="tier.checkIcon" :size="12" class="mt-3 shrink-0" />
            <span class="min-w-0">{{ $t(`orientation.formules.${tier.id}.feature${n}`) }}</span>
          </li>
        </ul>

        <!-- `.formule-card-foot` -->
        <footer class="mt-8 flex w-full flex-col items-center gap-8 pt-8">
          <p :class="['m-0 text-6xl leading-[1.1] font-semibold whitespace-nowrap max-2xs:text-5xl', tier.price]">
            {{ $n(300, 'currency') }}
          </p>

          <NuxtLink
            :to="localePath(`/orientation/paiement-reussi?path=${path}&formule=${tier.id}`)"
            :class="['flex w-full cursor-pointer items-center justify-center rounded-lg px-16 py-14 text-center text-xl leading-20 font-semibold whitespace-nowrap no-underline', tier.button]"
          >
            {{ $t('orientation.formules.choose') }}
          </NuxtLink>
        </footer>
      </article>
    </div>
  </div>
</template>
