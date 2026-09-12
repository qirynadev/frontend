<script setup lang="ts">
/**
 * Accueil desktop ← Figma `Home page` (1004:3493), contenu uniquement.
 * Nav / footer fournis par `layouts/desktop.vue`.
 */
const localePath = useLocalePath()
const ASSET = '/img/desktop/home'

const orientationFeats = [
  { icon: `${ASSET}/feat-test.svg`, key: 'desktop.home.orientation.f1' },
  { icon: `${ASSET}/feat-bilan.svg`, key: 'desktop.home.orientation.f2' },
  { icon: `${ASSET}/feat-experts.svg`, key: 'desktop.home.orientation.f3' },
  { icon: `${ASSET}/feat-mesure.svg`, key: 'desktop.home.orientation.f4' },
] as const

const schoolTypes = [
  { icon: `${ASSET}/type-management.svg`, key: 'desktop.home.school.type1' },
  { icon: `${ASSET}/type-ingenierie.svg`, key: 'desktop.home.school.type2' },
  { icon: `${ASSET}/type-medecine.svg`, key: 'desktop.home.school.type3' },
  { icon: `${ASSET}/type-architecture.svg`, key: 'desktop.home.school.type4' },
  { icon: `${ASSET}/type-scpo.svg`, key: 'desktop.home.school.type5' },
] as const

const languageFeats = [
  { icon: `${ASSET}/lang-online.svg`, key: 'desktop.home.languages.f1' },
  { icon: `${ASSET}/lang-teachers.svg`, key: 'desktop.home.languages.f2' },
  { icon: `${ASSET}/lang-method.svg`, key: 'desktop.home.languages.f3' },
  { icon: `${ASSET}/lang-cert.svg`, key: 'desktop.home.languages.f4' },
  { icon: `${ASSET}/lang-suivi.svg`, key: 'desktop.home.languages.f5' },
] as const

const studyDestinations = [
  { flag: `${ASSET}/flag-fr.png`, key: 'desktop.home.dest.fr' },
  { flag: `${ASSET}/flag-ca.png`, key: 'desktop.home.dest.ca' },
  { flag: `${ASSET}/flag-cn.png`, key: 'desktop.home.dest.cn' },
  { flag: `${ASSET}/flag-uk.png`, key: 'desktop.home.dest.uk' },
  { flag: `${ASSET}/flag-us.png`, key: 'desktop.home.dest.us' },
  { flag: `${ASSET}/flag-de.png`, key: 'desktop.home.dest.de' },
  { flag: `${ASSET}/flag-es.png`, key: 'desktop.home.dest.es' },
] as const

const languages = [
  { flag: `${ASSET}/flag-uk.png`, key: 'desktop.home.languages.en' },
  { flag: `${ASSET}/flag-es.png`, key: 'desktop.home.languages.es' },
  { flag: `${ASSET}/flag-de.png`, key: 'desktop.home.languages.de' },
  { flag: `${ASSET}/flag-fr.png`, key: 'desktop.home.languages.fr' },
  { flag: `${ASSET}/flag-pt.png`, key: 'desktop.home.languages.pt' },
] as const

const housingDestinations = [
  { flag: `${ASSET}/flag-fr.png`, key: 'desktop.home.dest.fr' },
  { flag: `${ASSET}/flag-ca.png`, key: 'desktop.home.dest.ca' },
  { flag: `${ASSET}/flag-uk.png`, key: 'desktop.home.dest.uk' },
  { flag: `${ASSET}/flag-us.png`, key: 'desktop.home.dest.us' },
  { flag: `${ASSET}/flag-de.png`, key: 'desktop.home.dest.de' },
  { flag: `${ASSET}/flag-es.png`, key: 'desktop.home.dest.es' },
] as const

const satRows = [
  { key: 'desktop.home.orientation.sat1', value: '90%', color: 'bg-[#ed1c24]' },
  { key: 'desktop.home.orientation.sat2', value: '75%', color: 'bg-[#eab308]' },
  { key: 'desktop.home.orientation.sat3', value: '80%', color: 'bg-[#22c55e]' },
  { key: 'desktop.home.orientation.sat4', value: '85%', color: 'bg-[#3b82f6]' },
] as const

const housingChecks = [
  { icon: `${ASSET}/house-choice.svg`, title: 'desktop.home.housing.c1', desc: 'desktop.home.housing.c1desc' },
  { icon: `${ASSET}/house-secure.svg`, title: 'desktop.home.housing.c2', desc: 'desktop.home.housing.c2desc' },
  { icon: `${ASSET}/house-support.svg`, title: 'desktop.home.housing.c3', desc: 'desktop.home.housing.c3desc' },
] as const

const housingTypes = [
  { icon: `${ASSET}/type-colo.svg`, title: 'desktop.home.housing.type1', desc: 'desktop.home.housing.type1desc', thumb: `${ASSET}/thumb-housing-1.jpg` },
  { icon: `${ASSET}/type-residence.svg`, title: 'desktop.home.housing.type2', desc: 'desktop.home.housing.type2desc', thumb: `${ASSET}/thumb-housing-1.jpg` },
  { icon: `${ASSET}/type-appart.svg`, title: 'desktop.home.housing.type3', desc: 'desktop.home.housing.type3desc', thumb: `${ASSET}/thumb-housing-2.jpg` },
] as const
</script>

<template>
  <div class="w-full bg-white pb-80 text-[#1a1d2b]">
    <!-- Hero pleine largeur — citation Mandela dans l’export Figma -->
    <section class="relative w-full overflow-hidden">
      <img
        :src="`${ASSET}/hero.png`"
        alt=""
        width="1728"
        height="516"
        class="block h-[516px] w-full object-cover"
      >
    </section>

    <div class="mx-auto flex w-full max-w-[1400px] flex-col px-24 shell:px-0">
      <!-- ── Orientation ── -->
      <section class="flex flex-col items-center gap-26 pt-30 pb-20 lg:flex-row lg:items-center">
        <div class="relative flex min-w-0 flex-1 items-start gap-10">
          <div class="flex w-full shrink-0 flex-col justify-center lg:w-[472px]">
            <span class="inline-flex w-fit items-center gap-8 rounded-full bg-[#fef2f1] px-12 py-6 text-[11px] leading-[16.5px] font-bold tracking-[0.55px] text-[#fd1027] uppercase">
              <img :src="`${ASSET}/badge-orientation.svg`" alt="" width="12" height="12" class="size-12 shrink-0">
              {{ $t('desktop.home.orientation.badge') }}
            </span>
            <h2 class="m-0 max-w-419 pt-24 text-[27px] leading-[39.6px] font-bold">
              {{ $t('desktop.home.orientation.titleBefore') }}
              <span class="text-[#fc0814]">{{ $t('desktop.home.orientation.titleAccent') }}</span>
              {{ $t('desktop.home.orientation.titleAfter') }}
            </h2>
            <p class="m-0 max-w-403 pt-16 pr-16 text-exact-16 leading-24 text-[#292929]">
              {{ $t('desktop.home.orientation.desc') }}
            </p>
            <div class="grid max-w-[472px] grid-cols-4 gap-16 pt-40">
              <div v-for="item in orientationFeats" :key="item.key" class="flex flex-col items-center text-center">
                <span class="flex size-40 items-center justify-center rounded-full bg-[#fef6f5]">
                  <img :src="item.icon" alt="" width="16" height="16" class="size-16">
                </span>
                <span class="pt-8 text-[10px] leading-[12.5px] font-medium text-[#1a1a1a]">{{ $t(item.key) }}</span>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-16 pt-40">
              <NuxtLink
                :to="localePath('/orientation')"
                class="inline-flex items-center gap-8 rounded-lg bg-[#f9172d] px-24 py-12 text-[14px] leading-20 font-semibold text-white no-underline"
              >
                {{ $t('desktop.home.orientation.cta') }}
                <img :src="`${ASSET}/cta-arrow.svg`" alt="" width="16" height="16" class="size-16">
              </NuxtLink>
              <span class="inline-flex items-center gap-8 text-[14px] leading-20 font-medium text-[#2c2c2c]">
                <img :src="`${ASSET}/cta-play.svg`" alt="" width="20" height="20" class="size-20">
                {{ $t('desktop.home.howItWorks') }}
              </span>
            </div>
          </div>

          <div class="relative hidden h-469 w-495 shrink-0 lg:block">
            <img :src="`${ASSET}/orientation-photo.png`" alt="" class="absolute inset-0 size-full object-cover object-[center_20%]">
            <div class="absolute top-104 left-[271px] flex h-223 w-280 flex-col rounded-16 border border-[#f3f5fb] bg-white p-20">
              <p class="m-0 text-[14px] leading-20 font-bold text-[#242424]">{{ $t('desktop.home.orientation.resultsTitle') }}</p>
              <ul class="m-0 mt-16 flex list-none flex-col gap-12 p-0">
                <li v-for="i in 4" :key="i" class="flex items-center gap-8 text-[11px] leading-[16.5px] font-medium text-[#141414]">
                  <img :src="`${ASSET}/check-red.svg`" alt="" width="14" height="14" class="size-14 shrink-0">
                  {{ $t(`desktop.home.orientation.results${i}`) }}
                </li>
              </ul>
              <p class="m-0 mt-12 inline-flex items-center gap-4 text-[11px] leading-[16.5px] font-bold text-[#ed1c24]">
                {{ $t('desktop.home.orientation.resultsCta') }}
                <img :src="`${ASSET}/link-arrow.svg`" alt="" width="12" height="12" class="size-12">
              </p>
            </div>
          </div>
        </div>

        <div class="w-full rounded-16 border border-[#f3f4f6] bg-white p-24 shadow-[0_1px_1px_rgba(0,0,0,0.05)] lg:w-342 lg:shrink-0">
          <h3 class="m-0 text-[14px] leading-20 font-bold text-[#242424]">{{ $t('desktop.home.orientation.satTitle') }}</h3>
          <div class="mt-20 flex items-center gap-24">
            <div class="relative size-[111px] shrink-0">
              <img :src="`${ASSET}/donut-track.svg`" alt="" width="110" height="110" class="absolute top-[0.52px] left-[0.52px] size-110">
              <img :src="`${ASSET}/donut-arc.svg`" alt="" width="110" height="110" class="absolute inset-0 size-110 -rotate-[89.46deg]">
              <div class="absolute inset-0 flex flex-col items-center justify-center pt-2">
                <p class="m-0 text-[20px] leading-32 font-semibold text-[#232323]">85%</p>
                <p class="m-0 w-59 text-center text-[8px] leading-[13.75px] font-medium whitespace-pre-line text-[#040404]">{{ $t('desktop.home.orientation.satLabel') }}</p>
              </div>
            </div>
            <ul class="m-0 flex flex-1 list-none flex-col p-0">
              <li v-for="row in satRows" :key="row.key" class="flex items-center justify-between py-4 text-[10px] leading-[15px]">
                <span class="flex items-center gap-4 text-[#0f172a]">
                  <span class="size-8 shrink-0 rounded-full" :class="row.color" />
                  {{ $t(row.key) }}
                </span>
                <strong class="font-semibold text-black">{{ row.value }}</strong>
              </li>
            </ul>
          </div>
          <p class="m-0 pt-6 text-center text-[12px] leading-18 font-semibold">{{ $t('desktop.home.orientation.satFooter') }}</p>
        </div>
      </section>

      <!-- ── Fiches écoles ── -->
      <section class="flex flex-col items-start gap-26 py-20 lg:flex-row">
        <div class="relative flex min-w-0 flex-1 items-start gap-10">
          <div class="flex w-full shrink-0 flex-col justify-center lg:w-564">
            <span class="inline-flex w-fit items-center gap-8 rounded-full bg-[#fef2f1] px-12 py-6 text-[11px] leading-[16.5px] font-bold tracking-[0.55px] text-[#fd1027] uppercase">
              <img :src="`${ASSET}/badge-school.svg`" alt="" width="12" height="8" class="h-8 w-12 shrink-0">
              {{ $t('desktop.home.school.badge') }}
            </span>
            <h2 class="m-0 max-w-419 pt-24 text-[27px] leading-normal font-bold">
              {{ $t('desktop.home.school.titleBefore') }}
              <span class="block text-[#fc0814]">{{ $t('desktop.home.school.titleAccent') }}</span>
            </h2>
            <p class="m-0 max-w-403 pt-16 pr-16 text-exact-16 leading-24 text-[#292929]">
              {{ $t('desktop.home.school.desc') }}
            </p>
            <div class="grid max-w-[400px] grid-cols-5 gap-8 pt-40">
              <div v-for="item in schoolTypes" :key="item.key" class="flex flex-col items-center text-center">
                <img :src="item.icon" alt="" width="40" height="40" class="size-40">
                <span class="pt-8 text-[9px] leading-[11.25px] font-semibold text-[#1a1a1a]">{{ $t(item.key) }}</span>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-16 pt-40">
              <NuxtLink
                :to="localePath('/destinations')"
                class="inline-flex items-center gap-8 rounded-lg bg-[#f9172d] px-24 py-12 text-[14px] leading-20 font-semibold text-white no-underline"
              >
                {{ $t('desktop.home.school.cta') }}
                <img :src="`${ASSET}/cta-arrow.svg`" alt="" width="16" height="16" class="size-16">
              </NuxtLink>
              <span class="inline-flex items-center gap-8 text-[14px] leading-20 font-medium text-[#2c2c2c]">
                <img :src="`${ASSET}/cta-play.svg`" alt="" width="20" height="20" class="size-20">
                {{ $t('desktop.home.howItWorks') }}
              </span>
            </div>
          </div>

          <div class="relative hidden h-555 w-495 shrink-0 lg:block">
            <img :src="`${ASSET}/school-photo.jpg`" alt="" class="size-full object-contain">
            <img
              :src="`${ASSET}/school-comparatif.png`"
              alt=""
              class="absolute top-87 left-[249px] h-324 w-302 rounded-[10px] border border-[#f3f5fb] object-cover"
            >
          </div>
        </div>

        <div class="flex w-full flex-col lg:w-[342px] lg:shrink-0">
          <div class="rounded-16 border border-[#f3f5fb] bg-white p-24 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <h3 class="m-0 text-[14px] leading-20 font-bold">{{ $t('desktop.home.school.destTitle') }}</h3>
            <div class="mt-16 grid grid-cols-2 gap-16">
              <div v-for="d in studyDestinations" :key="d.key" class="flex items-center gap-8">
                <img :src="d.flag" alt="" width="16" height="16" class="size-16 rounded-full object-cover">
                <span class="text-[12px] leading-18 font-medium">{{ $t(d.key) }}</span>
              </div>
              <div class="flex items-center gap-8">
                <img :src="`${ASSET}/icon-plus.svg`" alt="" width="16" height="16" class="size-16">
                <span class="text-[12px] leading-18 font-medium">{{ $t('desktop.home.dest.more') }}</span>
              </div>
            </div>
          </div>
          <div class="relative mt-6 overflow-hidden rounded-16 bg-[#182a50] px-24 pt-24 pb-16 text-white">
            <p class="m-0 text-[15px] leading-[18.75px] font-semibold">
              {{ $t('desktop.home.school.supportTitle') }}
            </p>
            <ul class="m-0 mt-16 flex list-none flex-col gap-6 p-0">
              <li v-for="i in 6" :key="i" class="flex items-center gap-8 text-[11px] leading-[16.5px]">
                <span class="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#ed1c24]">
                  <img :src="`${ASSET}/check-white.svg`" alt="" width="10" height="10" class="size-10">
                </span>
                {{ $t(`desktop.home.school.support${i}`) }}
              </li>
            </ul>
            <p class="mt-20 flex items-center justify-center gap-3 rounded-lg bg-white px-12 py-10 text-[14px] leading-20 font-semibold text-[#151515]">
              <img :src="`${ASSET}/cta-play.svg`" alt="" width="24" height="24" class="size-24">
              {{ $t('desktop.home.school.supportCta') }}
            </p>
          </div>
        </div>
      </section>

      <!-- ── Langues ── -->
      <section class="flex flex-col items-center gap-26 py-20 lg:flex-row">
        <div class="relative flex min-w-0 flex-1 items-start gap-10">
          <div class="flex w-full shrink-0 flex-col justify-center lg:max-w-[472px]">
            <span class="inline-flex w-fit items-center gap-8 rounded-full bg-[#fef2f1] px-12 py-6 text-[11px] leading-[16.5px] font-bold tracking-[0.55px] text-[#fd1027] uppercase">
              <img :src="`${ASSET}/badge-lang.svg`" alt="" width="14" height="14" class="size-14 shrink-0">
              {{ $t('desktop.home.languages.badge') }}
            </span>
            <h2 class="m-0 max-w-419 pt-24 text-[27px] leading-[39.6px] font-bold">
              {{ $t('desktop.home.languages.titleBefore') }}
              <span class="block text-[#fc0814]">{{ $t('desktop.home.languages.titleAccent') }}</span>
            </h2>
            <p class="m-0 max-w-403 pt-16 pr-16 text-exact-16 leading-24 text-[#292929]">
              {{ $t('desktop.home.languages.desc') }}
            </p>
            <div class="grid max-w-[400px] grid-cols-5 gap-8 pt-40">
              <div v-for="item in languageFeats" :key="item.key" class="flex flex-col items-center text-center">
                <img :src="item.icon" alt="" width="40" height="40" class="size-40">
                <span class="pt-8 text-[9px] leading-[11.25px] font-semibold text-[#1a1a1a]">{{ $t(item.key) }}</span>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-16 pt-40">
              <NuxtLink
                :to="localePath('/langues')"
                class="inline-flex items-center gap-8 rounded-lg bg-[#f9172d] px-24 py-12 text-[14px] leading-20 font-semibold text-white no-underline"
              >
                {{ $t('desktop.home.languages.cta') }}
                <img :src="`${ASSET}/cta-arrow.svg`" alt="" width="16" height="16" class="size-16">
              </NuxtLink>
              <span class="inline-flex items-center gap-8 text-[14px] leading-20 font-medium text-[#2c2c2c]">
                <img :src="`${ASSET}/cta-play.svg`" alt="" width="20" height="20" class="size-20">
                {{ $t('desktop.home.howItWorks') }}
              </span>
            </div>
          </div>
          <div class="hidden h-469 w-495 shrink-0 lg:block">
            <img :src="`${ASSET}/languages-photo.png`" alt="" class="size-full object-contain">
          </div>
        </div>

        <div class="flex w-full flex-col lg:w-[342px] lg:shrink-0">
          <div class="rounded-16 border border-[#f3f5fb] bg-white p-24 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <h3 class="m-0 text-[14px] leading-20 font-bold">{{ $t('desktop.home.languages.listTitle') }}</h3>
            <ul class="m-0 mt-16 flex list-none flex-col p-0">
              <li v-for="lang in languages" :key="lang.key" class="flex items-center gap-12 py-6 text-[13px] leading-[19.5px] font-medium">
                <img :src="lang.flag" alt="" width="16" height="16" class="size-16 rounded-full object-cover">
                {{ $t(lang.key) }}
              </li>
              <li class="flex items-center gap-12 pt-20 text-[12px] leading-18 font-medium">
                <img :src="`${ASSET}/icon-plus.svg`" alt="" width="20" height="20" class="size-20">
                {{ $t('desktop.home.languages.more') }}
              </li>
            </ul>
          </div>
          <div class="mt-24 flex items-center gap-16 rounded-16 border border-[#e7e7f2] bg-white p-16 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <span class="flex size-48 shrink-0 items-center justify-center rounded-xl bg-[#faf5ff]">
              <img :src="`${ASSET}/icon-test.svg`" alt="" width="24" height="24" class="size-24">
            </span>
            <div>
              <p class="m-0 text-[14px] leading-20 font-bold">{{ $t('desktop.home.languages.testTitle') }}</p>
              <p class="m-0 text-[11px] leading-[16.5px] text-[#222]">{{ $t('desktop.home.languages.testDesc') }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Hébergement ── -->
      <section class="flex flex-col items-start gap-26 border-b border-[#f3f4f6] pt-20 pb-50 lg:flex-row">
        <div class="relative flex min-w-0 flex-1 items-start gap-10">
          <div class="flex w-full min-w-0 flex-col justify-center">
            <span class="inline-flex w-fit items-center gap-8 rounded-full bg-[#fef2f1] px-12 py-6 text-[11px] leading-[16.5px] font-bold tracking-[0.55px] text-[#fd1027] uppercase">
              <img :src="`${ASSET}/badge-housing.svg`" alt="" width="14" height="14" class="size-14 shrink-0">
              {{ $t('desktop.home.housing.badge') }}
            </span>
            <h2 class="m-0 max-w-419 pt-24 text-[27px] leading-normal font-bold">
              {{ $t('desktop.home.housing.titleBefore') }}
              <span class="block text-[#fc0814]">{{ $t('desktop.home.housing.titleAccent') }}</span>
            </h2>
            <p class="m-0 max-w-403 pt-16 pr-16 text-exact-16 leading-24 text-[#292929]">
              {{ $t('desktop.home.housing.desc') }}
            </p>
            <ul class="m-0 flex max-w-[419px] list-none flex-col gap-18 p-0 pt-40">
              <li v-for="item in housingChecks" :key="item.title" class="flex items-center gap-12">
                <img :src="item.icon" alt="" width="32" height="32" class="size-32 shrink-0">
                <div>
                  <p class="m-0 text-[14px] leading-21 font-medium">{{ $t(item.title) }}</p>
                  <p class="m-0 text-[14px] leading-[12.5px] text-[#6b7280]">{{ $t(item.desc) }}</p>
                </div>
              </li>
            </ul>
            <div class="pt-40">
              <NuxtLink
                :to="localePath('/logement')"
                class="inline-flex items-center gap-8 rounded-lg bg-[#f9172d] px-24 py-12 text-[14px] leading-20 font-semibold text-white no-underline"
              >
                {{ $t('desktop.home.housing.cta') }}
                <img :src="`${ASSET}/cta-arrow.svg`" alt="" width="16" height="16" class="size-16">
              </NuxtLink>
            </div>
          </div>

          <div class="relative hidden h-555 w-495 shrink-0 lg:block">
            <img :src="`${ASSET}/housing-photo.png`" alt="" class="size-full object-contain object-bottom">
            <div class="absolute top-80 left-[277px] flex w-260 flex-col gap-12">
              <div
                v-for="item in housingTypes"
                :key="item.title"
                class="flex items-center gap-12 rounded-xl border border-[#f3f4f6] bg-white p-12"
              >
                <span class="flex size-40 shrink-0 items-center justify-center rounded-full bg-[#fceff0]">
                  <img :src="item.icon" alt="" width="20" height="20" class="size-20">
                </span>
                <div class="min-w-0 flex-1">
                  <p class="m-0 text-[11px] leading-[15px] font-semibold">{{ $t(item.title) }}</p>
                  <p class="m-0 text-[10px] leading-[12.5px] text-[#6b7280]">{{ $t(item.desc) }}</p>
                </div>
                <img :src="item.thumb" alt="" width="48" height="40" class="h-40 w-48 shrink-0 rounded-[4px] object-cover shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              </div>
            </div>
            <div class="absolute top-146 left-42 flex max-w-160 items-center gap-12 rounded-full bg-white p-12">
              <span class="flex size-36 shrink-0 items-center justify-center rounded-full bg-[#fceff0]">
                <img :src="`${ASSET}/type-appart.svg`" alt="" width="20" height="20" class="size-20">
              </span>
              <p class="m-0 text-[11px] leading-[15px] font-semibold text-[#131b33] whitespace-pre-line">{{ $t('desktop.home.housing.homeLabel') }}</p>
            </div>
          </div>
        </div>

        <div class="flex w-full flex-col lg:w-[342px] lg:shrink-0">
          <div class="rounded-16 border border-[#f3f4f6] bg-white p-24 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <h3 class="m-0 text-[14px] leading-20 font-bold">{{ $t('desktop.home.housing.destTitle') }}</h3>
            <div class="mt-16 grid grid-cols-3 gap-16">
              <div v-for="d in housingDestinations" :key="d.key" class="flex flex-col items-center gap-4 text-center">
                <img :src="d.flag" alt="" width="32" height="32" class="size-32 rounded-full object-cover">
                <span class="text-[9px] leading-[13.5px] font-medium text-[#2c2c2c]">{{ $t(d.key) }}</span>
              </div>
            </div>
          </div>
          <div class="mt-24 rounded-16 border border-[#f3f4f6] bg-[#fef3f3] p-24 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <h3 class="m-0 text-[14px] leading-20 font-bold">{{ $t('desktop.home.housing.whyTitle') }}</h3>
            <ul class="m-0 mt-16 flex list-none flex-col gap-10 p-0">
              <li v-for="i in 5" :key="i" class="flex items-center gap-8 text-[12px] leading-18 text-[#080808]">
                <img :src="`${ASSET}/why-check.svg`" alt="" width="16" height="16" class="size-16 shrink-0">
                {{ $t(`desktop.home.housing.why${i}`) }}
              </li>
            </ul>
            <div class="mt-24 flex items-start gap-12 rounded-xl bg-white p-12">
              <span class="flex size-24 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                <img :src="`${ASSET}/why-heart.svg`" alt="" width="14" height="14" class="size-14">
              </span>
              <p class="m-0 text-[11px] leading-[16.5px] font-bold">{{ $t('desktop.home.housing.priority') }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
