<script setup lang="ts">
/**
 * Découverte logement ← Figma `1591:2293` « Logement sûr ».
 *
 * Après le choix du pays (`/logement`), avant les formules (`/logement/[slug]`).
 * Espacement vertical **22px** entre blocs majeurs. CTA produit conservé.
 *
 * Assets : `public/img/icons/log-sur/*`
 */
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()

const slug = computed(() => String(route.params.slug ?? ''))

const ICON = '/img/icons/log-sur'

const pains = [
  { id: 'garant', icon: `${ICON}/pain-garant.svg`, labelKey: 'housing.intro.painGarant' },
  { id: 'visite', icon: `${ICON}/pain-visite.svg`, labelKey: 'housing.intro.painVisite' },
  { id: 'arnaque', icon: `${ICON}/pain-arnaque.svg`, labelKey: 'housing.intro.painArnaque' },
  { id: 'delai', icon: `${ICON}/pain-delai.svg`, labelKey: 'housing.intro.painDelai' },
] as const

const steps = [
  {
    id: 'besoin',
    icon: `${ICON}/step-besoin.svg`,
    bg: 'bg-ls-step-1',
    numClass: 'text-ls-step-1',
    num: '01',
    labelKey: 'housing.intro.step1',
  },
  {
    id: 'sourcing',
    icon: `${ICON}/step-sourcing.svg`,
    bg: 'bg-ls-step-2',
    numClass: 'text-ls-step-2',
    num: '02',
    labelKey: 'housing.intro.step2',
  },
  {
    id: 'propositions',
    icon: `${ICON}/step-propositions.svg`,
    bg: 'bg-ls-step-3',
    numClass: 'text-ls-step-3',
    num: '03',
    labelKey: 'housing.intro.step3',
  },
  {
    id: 'bail',
    icon: `${ICON}/step-bail.svg`,
    bg: 'bg-ls-step-4',
    numClass: 'text-ls-step-4',
    num: '04',
    labelKey: 'housing.intro.step4',
  },
] as const

usePageSeo(() => ({
  title: t('housing.intro.seoTitle'),
  description: t('housing.intro.seoDescription'),
}))
</script>

<template>
  <div class="flex w-full flex-col gap-22 pb-22">
    <AppTopBar back back-to="/logement" :notifications="3" :gap="0" />

    <!-- Intro -->
    <section class="w-full">
      <h1 class="m-0 text-4xl leading-normal font-semibold tracking-[-0.65px] text-text">
        {{ $t('housing.intro.title') }}
      </h1>
      <p class="m-0 mt-4 text-xl leading-[22.75px] font-normal text-ls-muted">
        {{ $t('housing.intro.subtitle') }}
      </p>
    </section>

    <!-- Ce que nous venons résoudre -->
    <section class="flex w-full flex-col gap-16" aria-labelledby="log-pain-title">
      <h2 id="log-pain-title" class="m-0 text-xl leading-24 font-semibold text-black">
        {{ $t('housing.intro.painsTitle') }}
      </h2>
      <div class="grid w-full grid-cols-2 gap-12">
        <article
          v-for="pain in pains"
          :key="pain.id"
          class="box-border flex items-center rounded-[10px] border border-ls-pain-border bg-white px-16 py-10 shadow-ls-pain"
        >
          <img :src="pain.icon" alt="" width="40" height="40" class="mr-12 block size-40 shrink-0">
          <p class="m-0 min-w-0 flex-1 text-lg leading-[17.875px] font-medium whitespace-pre-line text-black">
            {{ $t(pain.labelKey) }}
          </p>
        </article>
      </div>
    </section>

    <!-- Notre méthode en 4 étapes -->
    <section class="flex w-full flex-col gap-16" aria-labelledby="log-method-title">
      <h2 id="log-method-title" class="m-0 text-xl leading-24 font-semibold text-black">
        {{ $t('housing.intro.methodTitle') }}
      </h2>

      <div class="relative flex w-full items-start">
        <!-- Ligne au centre des pastilles 48px (top 24px), derrière les icônes. -->
        <div
          aria-hidden="true"
          class="pointer-events-none absolute top-24 left-[12.5%] right-[12.5%] z-0 border-t border-dashed border-ls-step-line max-2xs:hidden"
        />
        <div
          v-for="step in steps"
          :key="step.id"
          class="relative z-1 flex min-w-0 flex-1 flex-col items-center text-center"
        >
          <span
            :class="[
              'relative z-1 mb-8 flex size-48 shrink-0 items-center justify-center rounded-full',
              step.bg,
            ]"
          >
            <img :src="step.icon" alt="" width="24" height="24" class="block size-24">
          </span>
          <p :class="['m-0 text-xl leading-21 font-bold', step.numClass]">{{ step.num }}</p>
          <p class="m-0 mt-2 w-full text-center text-sm leading-15 font-medium whitespace-nowrap text-ls-step-label max-2xs:text-xs">
            {{ $t(step.labelKey) }}
          </p>
        </div>
      </div>
    </section>

    <!-- Engagements — même typo que callouts orientation / bienvenue / messages -->
    <aside class="box-border flex w-full items-start gap-16 rounded-xl border border-ls-engage-border bg-ls-engage-bg px-9 py-20">
      <span class="flex size-44 shrink-0 items-center justify-center rounded-full bg-ls-engage-icon">
        <img
          :src="`${ICON}/engage-shield.svg`"
          alt=""
          width="20"
          height="20"
          class="block size-20"
        >
      </span>
      <div class="min-w-0 flex-1">
        <h3 class="m-0 text-base leading-20 font-bold text-ls-step-label">
          {{ $t('housing.intro.engageTitle') }}
        </h3>
        <p class="m-0 mt-4 text-sm leading-16 font-normal text-ls-engage-desc">
          {{ $t('housing.intro.engageDesc') }}
        </p>
      </div>
    </aside>

    <!-- CTA produit (hors Figma export, conservé) -->
    <NuxtLink
      :to="localePath(`/logement/${slug}`)"
      class="box-border flex w-full items-center justify-center rounded-[10px] bg-primary-cta px-24 py-16 text-center text-xl leading-[22.75px] font-semibold text-white no-underline"
    >
      {{ $t('housing.intro.cta') }}
    </NuxtLink>
  </div>
</template>
