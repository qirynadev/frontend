<script setup lang="ts">
/**
 * Découverte logement ← capture produit (WhatsApp 2026-08-23).
 *
 * Placé après le choix du pays (`/logement`) et avant les formules
 * (`/logement/[slug]`). Espacement vertical **22px** entre blocs majeurs.
 *
 * | Bloc | Contenu |
 * |---|---|
 * | intro | titre + sous-titre |
 * | problèmes | grille 2×2 cartes pain points |
 * | méthode | 4 étapes + trait pointillé |
 * | engagements | bandeau violet clair |
 * | CTA | séparateur pointillé + « Trouver mon logement » |
 */
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()

const slug = computed(() => String(route.params.slug ?? ''))

const pains = [
  {
    id: 'garant',
    icon: '/img/icons/log-intro/pain-garant.svg',
    bg: 'bg-success-bg',
    labelKey: 'housing.intro.painGarant',
  },
  {
    id: 'visite',
    icon: '/img/icons/log-intro/pain-visite.svg',
    bg: 'bg-danger-bg',
    labelKey: 'housing.intro.painVisite',
  },
  {
    id: 'arnaque',
    icon: '/img/icons/log-intro/pain-arnaque.svg',
    bg: 'bg-warning-bg',
    labelKey: 'housing.intro.painArnaque',
  },
  {
    id: 'delai',
    icon: '/img/icons/log-intro/pain-delai.svg',
    bg: 'bg-info-bg',
    labelKey: 'housing.intro.painDelai',
  },
] as const

const steps = [
  {
    id: 'besoin',
    icon: '/img/icons/log-intro/step-besoin.svg',
    bg: 'bg-[#14B8A6]',
    numClass: 'text-[#14B8A6]',
    num: '01',
    labelKey: 'housing.intro.step1',
  },
  {
    id: 'sourcing',
    icon: '/img/icons/log-intro/step-sourcing.svg',
    bg: 'bg-[#EC4899]',
    numClass: 'text-[#EC4899]',
    num: '02',
    labelKey: 'housing.intro.step2',
  },
  {
    id: 'propositions',
    icon: '/img/icons/log-intro/step-propositions.svg',
    bg: 'bg-[#F59E0B]',
    numClass: 'text-[#F59E0B]',
    num: '03',
    labelKey: 'housing.intro.step3',
  },
  {
    id: 'bail',
    icon: '/img/icons/log-intro/step-bail.svg',
    bg: 'bg-[#16AA59]',
    numClass: 'text-[#16AA59]',
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
      <h1 class="m-0 text-4xl leading-normal font-semibold tracking-[-0.65px] text-navy">
        {{ $t('housing.intro.title') }}
      </h1>
      <p class="m-0 mt-4 text-xl leading-[22.75px] font-normal text-muted-2">
        {{ $t('housing.intro.subtitle') }}
      </p>
    </section>

    <!-- Ce que nous venons résoudre -->
    <section class="flex w-full flex-col gap-14" aria-labelledby="log-pain-title">
      <h2 id="log-pain-title" class="m-0 text-xl leading-16 font-semibold tracking-[0.6px] text-navy">
        {{ $t('housing.intro.painsTitle') }}
      </h2>
      <div class="grid w-full grid-cols-2 gap-10">
        <article
          v-for="pain in pains"
          :key="pain.id"
          class="box-border flex min-h-72 items-center gap-10 rounded-xl border border-border-soft bg-white p-12"
        >
          <span :class="['flex size-36 shrink-0 items-center justify-center rounded-full', pain.bg]">
            <img :src="pain.icon" alt="" width="20" height="20" class="block size-20">
          </span>
          <p class="m-0 min-w-0 flex-1 text-base leading-[16.5px] font-semibold text-navy">
            {{ $t(pain.labelKey) }}
          </p>
        </article>
      </div>
    </section>

    <!-- Notre méthode en 4 étapes -->
    <section class="flex w-full flex-col gap-14" aria-labelledby="log-method-title">
      <h2 id="log-method-title" class="m-0 text-xl leading-16 font-semibold tracking-[0.6px] text-navy">
        {{ $t('housing.intro.methodTitle') }}
      </h2>

      <div class="flex w-full items-start">
        <div
          v-for="(step, index) in steps"
          :key="step.id"
          class="flex min-w-0 flex-1 flex-col items-center gap-8 text-center"
        >
          <div class="relative flex w-88 max-w-full flex-col items-center">
            <span
              v-if="index < steps.length - 1"
              aria-hidden="true"
              class="absolute top-25 left-[calc(50%+25px)] h-0 w-[calc(100%-18px)] border-t-[1.5px] border-dashed border-[#CFCFE8] max-2xs:hidden"
            />
            <span
              :class="[
                'relative z-1 flex size-50 shrink-0 items-center justify-center rounded-full',
                step.bg,
              ]"
            >
              <img :src="step.icon" alt="" width="22" height="22" class="block size-22">
            </span>
          </div>
          <div class="flex w-full flex-col items-center gap-2">
            <p :class="['m-0 text-base leading-16 font-bold', step.numClass]">{{ step.num }}</p>
            <p class="m-0 w-full text-center text-xs leading-[13px] font-semibold text-navy">
              {{ $t(step.labelKey) }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Engagements -->
    <aside class="box-border flex w-full items-start gap-12 rounded-xl bg-surface-2 px-14 py-16">
      <img
        src="/img/icons/log-intro/engage-shield.svg"
        alt=""
        width="44"
        height="44"
        class="block size-44 shrink-0"
      >
      <div class="min-w-0 flex-1">
        <h3 class="m-0 text-base leading-20 font-bold text-navy">
          {{ $t('housing.intro.engageTitle') }}
        </h3>
        <p class="m-0 mt-4 text-sm leading-16 font-normal text-muted-2">
          {{ $t('housing.intro.engageDesc') }}
        </p>
      </div>
    </aside>

    <!-- Séparateur + CTA -->
    <div class="flex w-full flex-col gap-22">
      <div class="h-0 w-full border-t border-dashed border-[#CFCFE8]" aria-hidden="true" />
      <NuxtLink
        :to="localePath(`/logement/${slug}`)"
        class="box-border flex w-full items-center justify-center rounded-xl bg-primary-cta px-24 py-16 text-center text-xl leading-[22.5px] font-semibold text-white no-underline"
      >
        {{ $t('housing.intro.cta') }}
      </NuxtLink>
    </div>
  </div>
</template>
