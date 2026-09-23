<script setup lang="ts">
import { useCatalogStore } from '~/core/stores'

/**
 * Accueil desktop ← Figma `Home page` (1004:3493), contenu uniquement.
 * Nav / footer fournis par `layouts/desktop.vue`.
 */
const localePath = useLocalePath()
const router = useRouter()
const catalog = useCatalogStore()
const { open: openNavMenu } = useDesktopNavMenu()
const ASSET = '/img/desktop/home'

/**
 * Bandeau administré (`HomeContent.slides[0]`, saisi dans /cms/home sous
 * « Image du Hero »), comme le fait déjà l'accueil mobile. Le desktop servait
 * un fichier local (2026-09-23) : changer l'image en back-office n'avait
 * aucun effet ici. Repli sur le visuel de la maquette si aucune diapositive.
 */
const bandeau = computed(() => catalog.home?.slides[0]?.image || `${ASSET}/hero.png`)

/**
 * Illustrations des quatre sections, administrées dans /cms/home sous
 * « Images des sections de l'accueil » (`HomeContent.sectionImages`). Elles ne
 * sont pas traduites : la même image sert à toutes les langues. Tant qu'aucune
 * image n'est téléversée, on garde le visuel de la maquette.
 */
const photoOrientation = computed(
  () => catalog.home?.sectionImages.orientation || `${ASSET}/orientation-photo.png`,
)
const photoEcoles = computed(
  () => catalog.home?.sectionImages.schools || `${ASSET}/school-photo.jpg`,
)
const photoLangues = computed(
  () => catalog.home?.sectionImages.languages || `${ASSET}/languages-photo.png`,
)
const photoLogement = computed(
  () => catalog.home?.sectionImages.housing || `${ASSET}/housing-photo.png`,
)

function exploreLanguages() {
  if ((catalog.menu?.courses?.entries.length ?? 0) > 0) {
    openNavMenu('courses')
    return
  }
  void router.push(localePath('/langues'))
}

function exploreHousing() {
  if ((catalog.menu?.living?.entries.length ?? 0) > 0) {
    openNavMenu('living')
    return
  }
  void router.push(localePath('/logement'))
}

function exploreSchools() {
  openNavMenu('destinations')
}

const orientationFeats = [
  { icon: `${ASSET}/feat-test.svg`, key: 'desktop.home.orientation.f1', iconBg: 'bg-[#fef2f2]' },
  { icon: `${ASSET}/feat-bilan.svg`, key: 'desktop.home.orientation.f2', iconBg: 'bg-[#faf5ff]' },
  { icon: `${ASSET}/feat-experts.svg`, key: 'desktop.home.orientation.f3', iconBg: 'bg-[#f0fdf4]' },
  { icon: `${ASSET}/feat-mesure.svg`, key: 'desktop.home.orientation.f4', iconBg: 'bg-[#eff6ff]' },
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
  { icon: `${ASSET}/type-colo.svg`, title: 'desktop.home.housing.type1', desc: 'desktop.home.housing.type1desc', thumb: `${ASSET}/thumb-housing-1.jpg`, iconBg: 'bg-[#fff7ed]' },
  { icon: `${ASSET}/type-residence.svg`, title: 'desktop.home.housing.type2', desc: 'desktop.home.housing.type2desc', thumb: `${ASSET}/thumb-housing-1.jpg`, iconBg: 'bg-[#faf5ff]' },
  { icon: `${ASSET}/type-appart.svg`, title: 'desktop.home.housing.type3', desc: 'desktop.home.housing.type3desc', thumb: `${ASSET}/thumb-housing-2.jpg`, iconBg: 'bg-[#eff6ff]' },
] as const
</script>

<template>
  <div class="w-full bg-white pb-80 text-[#1a1d2b]">
    <!-- Hero pleine largeur — citation Mandela dans l’export Figma -->
    <section class="relative w-full overflow-hidden">
      <img
        :src="bandeau"
        alt=""
        width="1728"
        height="516"
        class="block h-[516px] w-full object-cover"
        loading="lazy"
        decoding="async"
      >
    </section>

    <div class="desktop-boxed flex w-full flex-col">
      <!-- ── Orientation ── -->
      <section class="desktop-home-band pt-30 pb-20">
        <div class="desktop-home-copy flex flex-col justify-center">
            <span class="inline-flex w-fit items-center gap-8 rounded-full bg-[#f5f3ff] px-12 py-6 text-[11px] leading-[16.5px] font-bold tracking-[0.55px] text-[#5c3cf3] uppercase">
              <img src="/img/icons/ic-home-cat-metier.svg" alt="" width="16" height="16" class="size-16 shrink-0" loading="lazy" decoding="async">
              {{ $t('desktop.home.orientation.badge') }}
            </span>
            <h2 class="m-0 w-full max-w-419 pt-24 text-[27px] leading-[39.6px] font-bold">
              {{ $t('desktop.home.orientation.titleBefore') }}
              <span class="text-[#fc0814]">{{ $t('desktop.home.orientation.titleAccent') }}</span>
              {{ $t('desktop.home.orientation.titleAfter') }}
            </h2>
            <p class="m-0 max-w-403 pt-16 pr-16 text-exact-16 leading-24 text-[#292929]">
              {{ $t('desktop.home.orientation.desc') }}
            </p>
            <div class="grid max-w-[472px] grid-cols-4 gap-16 pt-40">
              <div v-for="item in orientationFeats" :key="item.key" class="flex flex-col items-center text-center">
                <span class="flex size-40 items-center justify-center rounded-full" :class="item.iconBg">
                  <img :src="item.icon" alt="" width="16" height="16" class="size-16" loading="lazy" decoding="async">
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
                <img :src="`${ASSET}/cta-arrow.svg`" alt="" width="16" height="16" class="size-16" loading="lazy" decoding="async">
              </NuxtLink>
            </div>
          </div>

        <div class="desktop-home-media">
            <img :src="photoOrientation" alt="" class="absolute inset-0 size-full object-contain object-center" loading="lazy" decoding="async">
            <div class="absolute top-[22%] left-[55%] flex w-[min(240px,50%)] flex-col rounded-16 border border-[#f3f5fb] bg-white p-20">
              <p class="m-0 text-[14px] leading-20 font-bold text-[#242424]">{{ $t('desktop.home.orientation.resultsTitle') }}</p>
              <ul class="m-0 mt-16 flex list-none flex-col gap-12 p-0">
                <li v-for="i in 4" :key="i" class="flex items-center gap-8 text-[11px] leading-[16.5px] font-medium text-[#141414]">
                  <img :src="`${ASSET}/check-red.svg`" alt="" width="14" height="14" class="size-14 shrink-0" loading="lazy" decoding="async">
                  {{ $t(`desktop.home.orientation.results${i}`) }}
                </li>
              </ul>
              <p class="m-0 mt-12 inline-flex items-center gap-4 text-[11px] leading-[16.5px] font-bold text-[#ed1c24]">
                {{ $t('desktop.home.orientation.resultsCta') }}
                <img :src="`${ASSET}/link-arrow.svg`" alt="" width="12" height="12" class="size-12" loading="lazy" decoding="async">
              </p>
            </div>
          </div>

        <div class="desktop-home-card rounded-16 border border-[#f3f4f6] bg-white p-24 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <h3 class="m-0 text-[14px] leading-20 font-bold text-[#242424]">{{ $t('desktop.home.orientation.satTitle') }}</h3>
          <div class="mt-20 flex items-center gap-24">
            <div class="relative size-[111px] shrink-0">
              <img :src="`${ASSET}/donut-track.svg`" alt="" width="110" height="110" class="absolute top-[0.52px] left-[0.52px] size-110" loading="lazy" decoding="async">
              <img :src="`${ASSET}/donut-arc.svg`" alt="" width="110" height="110" class="absolute inset-0 size-110 -rotate-[89.46deg]" loading="lazy" decoding="async">
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
      <section class="desktop-home-band py-20">
        <div class="desktop-home-copy flex flex-col justify-center">
            <span class="inline-flex w-fit items-center gap-8 rounded-full bg-[#fff5f6] px-12 py-6 text-[11px] leading-[16.5px] font-bold tracking-[0.55px] text-[#ff2d46] uppercase">
              <img src="/img/icons/ic-home-cat-school.svg" alt="" width="16" height="16" class="size-16 shrink-0" loading="lazy" decoding="async">
              {{ $t('desktop.home.school.badge') }}
            </span>
            <h2 class="m-0 w-full max-w-419 pt-24 text-[27px] leading-[39.6px] font-bold">
              {{ $t('desktop.home.school.titleBefore') }}
              <span class="text-[#fc0814]">{{ $t('desktop.home.school.titleAccent') }}</span>
            </h2>
            <p class="m-0 max-w-403 pt-16 pr-16 text-exact-16 leading-24 text-[#292929]">
              {{ $t('desktop.home.school.desc') }}
            </p>
            <div class="grid max-w-[400px] grid-cols-5 gap-8 pt-40">
              <div v-for="item in schoolTypes" :key="item.key" class="flex flex-col items-center text-center">
                <img :src="item.icon" alt="" width="40" height="40" class="size-40" loading="lazy" decoding="async">
                <span class="pt-8 text-[9px] leading-[11.25px] font-semibold text-[#1a1a1a]">{{ $t(item.key) }}</span>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-16 pt-40">
              <button
                type="button"
                class="inline-flex cursor-pointer items-center gap-8 rounded-lg border-0 bg-[#f9172d] px-24 py-12 text-[14px] leading-20 font-semibold text-white"
                @click="exploreSchools"
              >
                {{ $t('desktop.home.school.cta') }}
                <img :src="`${ASSET}/cta-arrow.svg`" alt="" width="16" height="16" class="size-16" loading="lazy" decoding="async">
              </button>
            </div>
          </div>

        <div class="desktop-home-media">
            <img :src="photoEcoles" alt="" class="absolute inset-0 size-full object-contain object-center" loading="lazy" decoding="async">
          </div>

        <div class="desktop-home-card flex flex-col">
          <div class="rounded-16 border border-[#f3f5fb] bg-white p-24 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <h3 class="m-0 text-[14px] leading-20 font-bold">{{ $t('desktop.home.school.destTitle') }}</h3>
            <div class="mt-16 grid grid-cols-2 gap-16">
              <div v-for="d in studyDestinations" :key="d.key" class="flex items-center gap-8">
                <img :src="d.flag" alt="" width="16" height="16" class="size-16 rounded-full object-cover" loading="lazy" decoding="async">
                <span class="text-[12px] leading-18 font-medium">{{ $t(d.key) }}</span>
              </div>
              <div class="flex items-center gap-8">
                <img :src="`${ASSET}/icon-plus.svg`" alt="" width="16" height="16" class="size-16" loading="lazy" decoding="async">
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
                  <img :src="`${ASSET}/check-white.svg`" alt="" width="10" height="10" class="size-10" loading="lazy" decoding="async">
                </span>
                {{ $t(`desktop.home.school.support${i}`) }}
              </li>
            </ul>
            <p class="mt-20 flex items-center justify-center gap-3 rounded-lg bg-white px-12 py-10 text-[14px] leading-20 font-semibold text-[#151515]">
              <img :src="`${ASSET}/cta-play.svg`" alt="" width="24" height="24" class="size-24" loading="lazy" decoding="async">
              {{ $t('desktop.home.school.supportCta') }}
            </p>
          </div>
        </div>
      </section>

      <!-- ── Langues ── -->
      <section class="desktop-home-band py-20">
        <div class="desktop-home-copy flex flex-col justify-center">
            <span class="inline-flex w-fit items-center gap-8 rounded-full bg-[#fffbeb] px-12 py-6 text-[11px] leading-[16.5px] font-bold tracking-[0.55px] text-[#f59e0b] uppercase">
              <img src="/img/icons/ic-home-cat-langue.svg" alt="" width="16" height="16" class="size-16 shrink-0" loading="lazy" decoding="async">
              {{ $t('desktop.home.languages.badge') }}
            </span>
            <h2 class="m-0 w-full max-w-419 pt-24 text-[27px] leading-[39.6px] font-bold">
              {{ $t('desktop.home.languages.titleBefore') }}
              <span class="text-[#fc0814]">{{ $t('desktop.home.languages.titleAccent') }}</span>
            </h2>
            <p class="m-0 max-w-403 pt-16 pr-16 text-exact-16 leading-24 text-[#292929]">
              {{ $t('desktop.home.languages.desc') }}
            </p>
            <div class="grid max-w-[400px] grid-cols-5 gap-8 pt-40">
              <div v-for="item in languageFeats" :key="item.key" class="flex flex-col items-center text-center">
                <img :src="item.icon" alt="" width="40" height="40" class="size-40" loading="lazy" decoding="async">
                <span class="pt-8 text-[9px] leading-[11.25px] font-semibold text-[#1a1a1a]">{{ $t(item.key) }}</span>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-16 pt-40">
              <button
                type="button"
                class="inline-flex cursor-pointer items-center gap-8 rounded-lg border-0 bg-[#f9172d] px-24 py-12 text-[14px] leading-20 font-semibold text-white"
                @click="exploreLanguages"
              >
                {{ $t('desktop.home.languages.cta') }}
                <img :src="`${ASSET}/cta-arrow.svg`" alt="" width="16" height="16" class="size-16" loading="lazy" decoding="async">
              </button>
            </div>
          </div>
        <div class="desktop-home-media">
            <img :src="photoLangues" alt="" class="absolute inset-0 size-full object-contain object-center" loading="lazy" decoding="async">
          </div>

        <div class="desktop-home-card flex flex-col">
          <div class="rounded-16 border border-[#f3f5fb] bg-white p-24 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <h3 class="m-0 text-[14px] leading-20 font-bold">{{ $t('desktop.home.languages.listTitle') }}</h3>
            <ul class="m-0 mt-16 flex list-none flex-col p-0">
              <li v-for="lang in languages" :key="lang.key" class="flex items-center gap-12 py-6 text-[13px] leading-[19.5px] font-medium">
                <img :src="lang.flag" alt="" width="16" height="16" class="size-16 rounded-full object-cover" loading="lazy" decoding="async">
                {{ $t(lang.key) }}
              </li>
              <li class="flex items-center gap-12 pt-20 text-[12px] leading-18 font-medium">
                <img :src="`${ASSET}/icon-plus.svg`" alt="" width="20" height="20" class="size-20" loading="lazy" decoding="async">
                {{ $t('desktop.home.languages.more') }}
              </li>
            </ul>
          </div>
          <div class="mt-24 flex items-center gap-16 rounded-16 border border-[#e7e7f2] bg-white p-16 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <span class="flex size-48 shrink-0 items-center justify-center rounded-xl bg-[#faf5ff]">
              <img :src="`${ASSET}/icon-test.svg`" alt="" width="24" height="24" class="size-24" loading="lazy" decoding="async">
            </span>
            <div>
              <p class="m-0 text-[14px] leading-20 font-bold">{{ $t('desktop.home.languages.testTitle') }}</p>
              <p class="m-0 text-[11px] leading-[16.5px] text-[#222]">{{ $t('desktop.home.languages.testDesc') }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Hébergement ── -->
      <section class="desktop-home-band border-b border-[#f3f4f6] pt-20 pb-50">
        <div class="desktop-home-copy flex min-w-0 flex-col justify-center">
            <span class="inline-flex w-fit items-center gap-8 rounded-full bg-[#f0fdf4] px-12 py-6 text-[11px] leading-[16.5px] font-bold tracking-[0.55px] text-[#4fb756] uppercase">
              <img src="/img/icons/ic-home-cat-logement.svg" alt="" width="16" height="16" class="size-16 shrink-0" loading="lazy" decoding="async">
              {{ $t('desktop.home.housing.badge') }}
            </span>
            <h2 class="m-0 w-full max-w-419 pt-24 text-[27px] leading-[39.6px] font-bold">
              {{ $t('desktop.home.housing.titleBefore') }}
              <span class="text-[#fc0814]">{{ $t('desktop.home.housing.titleAccent') }}</span>
            </h2>
            <p class="m-0 max-w-403 pt-16 pr-16 text-exact-16 leading-24 text-[#292929]">
              {{ $t('desktop.home.housing.desc') }}
            </p>
            <ul class="m-0 flex max-w-[419px] list-none flex-col gap-18 p-0 pt-40">
              <li v-for="item in housingChecks" :key="item.title" class="flex items-center gap-12">
                <img :src="item.icon" alt="" width="32" height="32" class="size-32 shrink-0" loading="lazy" decoding="async">
                <div>
                  <p class="m-0 text-[14px] leading-21 font-medium">{{ $t(item.title) }}</p>
                  <p class="m-0 text-[14px] leading-[12.5px] text-[#6b7280]">{{ $t(item.desc) }}</p>
                </div>
              </li>
            </ul>
            <div class="pt-40">
              <button
                type="button"
                class="inline-flex cursor-pointer items-center gap-8 rounded-lg border-0 bg-[#f9172d] px-24 py-12 text-[14px] leading-20 font-semibold text-white"
                @click="exploreHousing"
              >
                {{ $t('desktop.home.housing.cta') }}
                <img :src="`${ASSET}/cta-arrow.svg`" alt="" width="16" height="16" class="size-16" loading="lazy" decoding="async">
              </button>
            </div>
          </div>

        <div class="desktop-home-media">
            <img :src="photoLogement" alt="" class="absolute inset-0 size-full object-contain object-center" loading="lazy" decoding="async">
            <div class="absolute top-[14.4%] left-[56%] flex w-[min(260px,53%)] flex-col gap-12">
              <div
                v-for="item in housingTypes"
                :key="item.title"
                class="flex items-center gap-12 rounded-xl border border-[#f3f4f6] bg-white p-12"
              >
                <span class="flex size-40 shrink-0 items-center justify-center rounded-full" :class="item.iconBg">
                  <img :src="item.icon" alt="" width="20" height="20" class="size-20" loading="lazy" decoding="async">
                </span>
                <div class="min-w-0 flex-1">
                  <p class="m-0 text-[11px] leading-[15px] font-semibold">{{ $t(item.title) }}</p>
                  <p class="m-0 text-[10px] leading-[12.5px] text-[#6b7280]">{{ $t(item.desc) }}</p>
                </div>
                <img :src="item.thumb" alt="" width="48" height="40" class="h-40 w-48 shrink-0 rounded-[4px] object-cover shadow-[0_1px_2px_rgba(0,0,0,0.05)]" loading="lazy" decoding="async">
              </div>
            </div>
            <div class="absolute top-[26%] left-[8.5%] flex max-w-160 items-center gap-12 rounded-full bg-white p-12">
              <span class="flex size-36 shrink-0 items-center justify-center rounded-full bg-[#eff6ff]">
                <img :src="`${ASSET}/type-appart.svg`" alt="" width="20" height="20" class="size-20" loading="lazy" decoding="async">
              </span>
              <p class="m-0 text-[11px] leading-[15px] font-semibold text-[#131b33] whitespace-pre-line">{{ $t('desktop.home.housing.homeLabel') }}</p>
            </div>
          </div>

        <div class="desktop-home-card flex flex-col">
          <div class="rounded-16 border border-[#f3f4f6] bg-white p-24 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <h3 class="m-0 text-[14px] leading-20 font-bold">{{ $t('desktop.home.housing.destTitle') }}</h3>
            <div class="mt-16 grid grid-cols-3 gap-16">
              <div v-for="d in housingDestinations" :key="d.key" class="flex flex-col items-center gap-4 text-center">
                <img :src="d.flag" alt="" width="32" height="32" class="size-32 rounded-full object-cover" loading="lazy" decoding="async">
                <span class="text-[9px] leading-[13.5px] font-medium text-[#2c2c2c]">{{ $t(d.key) }}</span>
              </div>
            </div>
          </div>
          <div class="mt-24 rounded-16 border border-[#f3f4f6] bg-[#fef3f3] p-24 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <h3 class="m-0 text-[14px] leading-20 font-bold">{{ $t('desktop.home.housing.whyTitle') }}</h3>
            <ul class="m-0 mt-16 flex list-none flex-col gap-10 p-0">
              <li v-for="i in 5" :key="i" class="flex items-center gap-8 text-[12px] leading-18 text-[#080808]">
                <img :src="`${ASSET}/why-check.svg`" alt="" width="16" height="16" class="size-16 shrink-0" loading="lazy" decoding="async">
                {{ $t(`desktop.home.housing.why${i}`) }}
              </li>
            </ul>
            <div class="mt-24 flex items-start gap-12 rounded-xl bg-white p-12">
              <span class="flex size-24 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                <img :src="`${ASSET}/why-heart.svg`" alt="" width="14" height="14" class="size-14" loading="lazy" decoding="async">
              </span>
              <p class="m-0 text-[11px] leading-[16.5px] font-bold">{{ $t('desktop.home.housing.priority') }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
