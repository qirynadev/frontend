<script setup lang="ts">
/**
 * Accueil desktop ← Figma `Home page` (1004:3493), 1728×3541.
 *
 * Sections : hero slider · école · orientation · langues · hébergement.
 * Nav / footer fournis par `layouts/desktop.vue`.
 */
const localePath = useLocalePath()

const schoolTypes = [
  'desktop.home.school.type1',
  'desktop.home.school.type2',
  'desktop.home.school.type3',
  'desktop.home.school.type4',
  'desktop.home.school.type5',
] as const

const orientationFeatures = [
  'desktop.home.orientation.f1',
  'desktop.home.orientation.f2',
  'desktop.home.orientation.f3',
  'desktop.home.orientation.f4',
] as const

const languageFeatures = [
  'desktop.home.languages.f1',
  'desktop.home.languages.f2',
  'desktop.home.languages.f3',
  'desktop.home.languages.f4',
  'desktop.home.languages.f5',
] as const

const housingChecks = [
  'desktop.home.housing.c1',
  'desktop.home.housing.c2',
  'desktop.home.housing.c3',
  'desktop.home.housing.c4',
] as const

const languages = [
  { flag: '🇬🇧', labelKey: 'desktop.home.languages.en' },
  { flag: '🇪🇸', labelKey: 'desktop.home.languages.es' },
  { flag: '🇩🇪', labelKey: 'desktop.home.languages.de' },
  { flag: '🇫🇷', labelKey: 'desktop.home.languages.fr' },
  { flag: '🇵🇹', labelKey: 'desktop.home.languages.pt' },
] as const

const destinations = [
  { flag: '🇫🇷', labelKey: 'desktop.home.dest.fr' },
  { flag: '🇨🇦', labelKey: 'desktop.home.dest.ca' },
  { flag: '🇬🇧', labelKey: 'desktop.home.dest.uk' },
  { flag: '🇺🇸', labelKey: 'desktop.home.dest.us' },
  { flag: '🇩🇪', labelKey: 'desktop.home.dest.de' },
  { flag: '🇪🇸', labelKey: 'desktop.home.dest.es' },
] as const
</script>

<template>
  <div class="w-full bg-white text-[#1a1d2b]">
    <!-- Hero slider -->
    <section class="desktop-boxed pt-24">
      <div class="relative w-full overflow-hidden rounded-2xl">
        <img
          src="/img/desktop/home/hero-slider.jpg"
          alt=""
          width="1400"
          height="516"
          class="block aspect-[1400/516] w-full object-cover"
        >
        <div class="absolute bottom-22 left-1/2 flex -translate-x-1/2 gap-8" aria-hidden="true">
          <span class="size-8 rounded-full bg-[#ed1c24]" />
          <span class="size-8 rounded-full bg-white/50" />
          <span class="size-8 rounded-full bg-white/50" />
          <span class="size-8 rounded-full bg-white/50" />
        </div>
      </div>
    </section>

    <div class="desktop-boxed flex flex-col">
      <!-- ── École ── -->
      <section class="grid grid-cols-1 items-center gap-26 border-b border-[#f3f4f6] py-50 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)_minmax(260px,320px)]">
        <div class="flex flex-col justify-center">
          <span class="inline-flex w-fit items-center gap-8 rounded-full bg-desktop-badge-bg px-12 py-6 text-md leading-[16.5px] font-bold tracking-[0.55px] text-[#fd1027] uppercase">
            {{ $t('desktop.home.school.badge') }}
          </span>
          <h2 class="m-0 max-w-419 pt-24 text-[27px] leading-[39.6px] font-bold">
            {{ $t('desktop.home.school.titleBefore') }}
            <span class="text-[#fc0814]">{{ $t('desktop.home.school.titleAccent') }}</span>
          </h2>
          <p class="m-0 max-w-403 pt-16 text-exact-16 leading-24 text-[#292929]">
            {{ $t('desktop.home.school.desc') }}
          </p>
          <div class="flex flex-wrap gap-8 pt-40">
            <div
              v-for="key in schoolTypes"
              :key="key"
              class="flex w-78 flex-col items-center text-center"
            >
              <span class="flex size-40 items-center justify-center rounded-full bg-[#fef6f5] text-desktop-brand-strong">●</span>
              <span class="pt-8 text-xs leading-[11.25px] font-semibold">{{ $t(key) }}</span>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-16 pt-40">
            <NuxtLink
              :to="localePath('/destinations')"
              class="inline-flex items-center gap-8 rounded-lg bg-desktop-brand-strong px-24 py-12 text-xl leading-20 font-semibold text-white no-underline"
            >
              {{ $t('desktop.home.school.cta') }}
              <span aria-hidden="true">→</span>
            </NuxtLink>
            <span class="inline-flex items-center gap-8 text-xl leading-20 font-medium text-[#2c2c2c]">
              ▶ {{ $t('desktop.home.howItWorks') }}
            </span>
          </div>
        </div>

        <div class="relative min-h-400 overflow-hidden rounded-2xl xl:col-span-1">
          <img
            src="/img/desktop/home/section-school.png"
            alt=""
            class="block h-full min-h-400 w-full object-cover"
          >
        </div>

        <div class="flex flex-col gap-16">
          <div class="rounded-2xl border border-[#f3f5fb] bg-white p-24 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <h3 class="m-0 text-xl leading-20 font-bold">{{ $t('desktop.home.school.destTitle') }}</h3>
            <div class="mt-16 grid grid-cols-2 gap-12">
              <div v-for="d in destinations" :key="d.labelKey" class="flex items-center gap-8 text-lg">
                <span class="text-xl" aria-hidden="true">{{ d.flag }}</span>
                <span class="text-md font-medium">{{ $t(d.labelKey) }}</span>
              </div>
            </div>
          </div>
          <div class="rounded-2xl bg-desktop-footer p-24 text-white">
            <h3 class="m-0 text-xl leading-20 font-bold">{{ $t('desktop.home.school.supportTitle') }}</h3>
            <ul class="m-0 mt-16 list-none space-y-10 p-0 text-lg leading-[19.5px]">
              <li v-for="i in 6" :key="i" class="flex gap-8">
                <span class="mt-6 size-6 shrink-0 rounded-full bg-desktop-brand" aria-hidden="true" />
                {{ $t(`desktop.home.school.support${i}`) }}
              </li>
            </ul>
            <NuxtLink
              :to="localePath('/reglages/contact')"
              class="mt-20 flex w-full items-center justify-center rounded-lg bg-white px-16 py-12 text-xl font-semibold text-desktop-footer no-underline"
            >
              {{ $t('desktop.home.school.supportCta') }}
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- ── Orientation ── -->
      <section class="grid grid-cols-1 items-center gap-26 border-b border-[#f3f4f6] py-50 lg:grid-cols-[minmax(0,1fr)_minmax(280px,1fr)_minmax(260px,320px)]">
        <div>
          <span class="inline-flex w-fit items-center gap-8 rounded-full bg-desktop-badge-bg px-12 py-6 text-md leading-[16.5px] font-bold tracking-[0.55px] text-[#fd1027] uppercase">
            {{ $t('desktop.home.orientation.badge') }}
          </span>
          <h2 class="m-0 max-w-419 pt-24 text-[27px] leading-[39.6px] font-bold">
            {{ $t('desktop.home.orientation.titleBefore') }}
            <span class="text-[#fc0814]">{{ $t('desktop.home.orientation.titleAccent') }}</span>
            {{ $t('desktop.home.orientation.titleAfter') }}
          </h2>
          <p class="m-0 max-w-403 pt-16 text-exact-16 leading-24 text-[#292929]">
            {{ $t('desktop.home.orientation.desc') }}
          </p>
          <div class="grid max-w-400 grid-cols-4 gap-16 pt-40">
            <div v-for="key in orientationFeatures" :key="key" class="flex flex-col items-center text-center">
              <span class="flex size-40 items-center justify-center rounded-full bg-[#fef6f5]" aria-hidden="true">●</span>
              <span class="pt-8 text-sm leading-[12.5px] font-medium">{{ $t(key) }}</span>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-16 pt-40">
            <NuxtLink
              :to="localePath('/orientation')"
              class="inline-flex items-center gap-8 rounded-lg bg-desktop-brand-strong px-24 py-12 text-xl leading-20 font-semibold text-white no-underline"
            >
              {{ $t('desktop.home.orientation.cta') }}
              <span aria-hidden="true">→</span>
            </NuxtLink>
            <span class="inline-flex items-center gap-8 text-xl font-medium text-[#2c2c2c]">
              ▶ {{ $t('desktop.home.howItWorks') }}
            </span>
          </div>
        </div>

        <div class="relative overflow-hidden rounded-2xl">
          <img src="/img/desktop/home/section-orientation.png" alt="" class="block w-full object-cover">
        </div>

        <div class="rounded-2xl border border-[#f3f4f6] bg-white p-24 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <h3 class="m-0 text-xl font-bold">{{ $t('desktop.home.orientation.satTitle') }}</h3>
          <div class="mt-24 flex items-center gap-24">
            <div class="relative flex size-110 shrink-0 items-center justify-center rounded-full border-8 border-[#ed1c24]/30">
              <div class="text-center">
                <p class="m-0 text-4xl font-semibold">85%</p>
                <p class="m-0 text-2xs leading-[13.75px] font-medium">{{ $t('desktop.home.orientation.satLabel') }}</p>
              </div>
            </div>
            <ul class="m-0 flex flex-1 list-none flex-col gap-8 p-0 text-sm">
              <li class="flex justify-between"><span>● {{ $t('desktop.home.orientation.sat1') }}</span><strong>90%</strong></li>
              <li class="flex justify-between"><span>● {{ $t('desktop.home.orientation.sat2') }}</span><strong>75%</strong></li>
              <li class="flex justify-between"><span>● {{ $t('desktop.home.orientation.sat3') }}</span><strong>80%</strong></li>
              <li class="flex justify-between"><span>● {{ $t('desktop.home.orientation.sat4') }}</span><strong>85%</strong></li>
            </ul>
          </div>
          <p class="m-0 pt-16 text-center text-base font-semibold">{{ $t('desktop.home.orientation.satFooter') }}</p>
        </div>
      </section>

      <!-- ── Langues ── -->
      <section class="grid grid-cols-1 items-center gap-26 border-b border-[#f3f4f6] py-50 lg:grid-cols-[minmax(0,1fr)_minmax(280px,1fr)_minmax(260px,320px)]">
        <div>
          <span class="inline-flex w-fit items-center gap-8 rounded-full bg-desktop-badge-bg px-12 py-6 text-md leading-[16.5px] font-bold tracking-[0.55px] text-[#fd1027] uppercase">
            {{ $t('desktop.home.languages.badge') }}
          </span>
          <h2 class="m-0 max-w-419 pt-24 text-[27px] leading-[39.6px] font-bold">
            {{ $t('desktop.home.languages.titleBefore') }}
            <span class="text-[#fc0814]">{{ $t('desktop.home.languages.titleAccent') }}</span>
          </h2>
          <p class="m-0 max-w-403 pt-16 text-exact-16 leading-24 text-[#292929]">
            {{ $t('desktop.home.languages.desc') }}
          </p>
          <div class="flex flex-wrap gap-8 pt-40">
            <div v-for="key in languageFeatures" :key="key" class="flex w-78 flex-col items-center text-center">
              <span class="flex size-40 items-center justify-center rounded-full bg-[#fef6f5]" aria-hidden="true">●</span>
              <span class="pt-8 text-xs leading-[11.25px] font-semibold">{{ $t(key) }}</span>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-16 pt-40">
            <NuxtLink
              :to="localePath('/langues')"
              class="inline-flex items-center gap-8 rounded-lg bg-desktop-brand-strong px-24 py-12 text-xl leading-20 font-semibold text-white no-underline"
            >
              {{ $t('desktop.home.languages.cta') }}
              <span aria-hidden="true">→</span>
            </NuxtLink>
            <span class="inline-flex items-center gap-8 text-xl font-medium text-[#2c2c2c]">
              ▶ {{ $t('desktop.home.howItWorks') }}
            </span>
          </div>
        </div>

        <div class="overflow-hidden rounded-2xl">
          <img src="/img/desktop/home/section-langues.png" alt="" class="block w-full object-cover">
        </div>

        <div class="flex flex-col gap-24">
          <div class="rounded-2xl border border-[#f3f5fb] bg-white p-24 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <h3 class="m-0 text-xl font-bold">{{ $t('desktop.home.languages.listTitle') }}</h3>
            <ul class="m-0 mt-16 flex list-none flex-col gap-12 p-0">
              <li v-for="lang in languages" :key="lang.labelKey" class="flex items-center gap-12 text-lg font-medium">
                <span aria-hidden="true">{{ lang.flag }}</span>
                {{ $t(lang.labelKey) }}
              </li>
              <li class="pt-8 text-base font-medium">+ {{ $t('desktop.home.languages.more') }}</li>
            </ul>
          </div>
          <div class="flex items-center gap-16 rounded-2xl border border-[#e7e7f2] bg-white p-16 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <span class="flex size-48 shrink-0 items-center justify-center rounded-xl bg-[#faf5ff] text-primary">▶</span>
            <div>
              <p class="m-0 text-xl font-bold">{{ $t('desktop.home.languages.testTitle') }}</p>
              <p class="m-0 text-md text-[#222]">{{ $t('desktop.home.languages.testDesc') }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Hébergement ── -->
      <section class="grid grid-cols-1 items-start gap-26 py-50 lg:grid-cols-[minmax(0,1fr)_minmax(280px,1fr)_minmax(260px,320px)]">
        <div>
          <span class="inline-flex w-fit items-center gap-8 rounded-full bg-desktop-badge-bg px-12 py-6 text-md leading-[16.5px] font-bold tracking-[0.55px] text-[#fd1027] uppercase">
            {{ $t('desktop.home.housing.badge') }}
          </span>
          <h2 class="m-0 max-w-419 pt-24 text-[27px] leading-[39.6px] font-bold">
            {{ $t('desktop.home.housing.titleBefore') }}
            <span class="text-[#fc0814]">{{ $t('desktop.home.housing.titleAccent') }}</span>
          </h2>
          <p class="m-0 max-w-403 pt-16 text-exact-16 leading-24 text-[#292929]">
            {{ $t('desktop.home.housing.desc') }}
          </p>
          <ul class="m-0 flex list-none flex-col gap-16 p-0 pt-40">
            <li v-for="key in housingChecks" :key="key" class="flex items-center gap-12 text-xl font-medium">
              <span class="flex size-32 shrink-0 items-center justify-center rounded-full bg-[#fef6f5] text-desktop-brand" aria-hidden="true">✓</span>
              {{ $t(key) }}
            </li>
          </ul>
          <div class="flex flex-wrap items-center gap-16 pt-40">
            <NuxtLink
              :to="localePath('/logement')"
              class="inline-flex items-center gap-8 rounded-lg bg-desktop-brand-strong px-24 py-12 text-xl leading-20 font-semibold text-white no-underline"
            >
              {{ $t('desktop.home.housing.cta') }}
              <span aria-hidden="true">→</span>
            </NuxtLink>
            <span class="inline-flex items-center gap-8 text-xl font-medium text-[#2c2c2c]">
              ▶ {{ $t('desktop.home.howItWorks') }}
            </span>
          </div>
        </div>

        <div class="overflow-hidden rounded-2xl">
          <img src="/img/desktop/home/section-logement.png" alt="" class="block w-full object-cover">
        </div>

        <div class="flex flex-col gap-24">
          <div class="rounded-2xl border border-[#f3f4f6] bg-white p-24 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <h3 class="m-0 text-xl font-bold">{{ $t('desktop.home.housing.destTitle') }}</h3>
            <div class="mt-16 grid grid-cols-3 gap-16">
              <div v-for="d in destinations" :key="d.labelKey" class="flex flex-col items-center gap-4 text-center">
                <span class="text-5xl" aria-hidden="true">{{ d.flag }}</span>
                <span class="text-xs font-medium text-[#2c2c2c]">{{ $t(d.labelKey) }}</span>
              </div>
            </div>
          </div>
          <div class="rounded-2xl border border-[#f3f4f6] bg-[#fef3f3] p-24 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <h3 class="m-0 text-xl font-bold">{{ $t('desktop.home.housing.whyTitle') }}</h3>
            <ul class="m-0 mt-16 flex list-none flex-col gap-10 p-0 text-base">
              <li v-for="i in 4" :key="i" class="flex items-center gap-8">
                <span class="text-desktop-brand" aria-hidden="true">✓</span>
                {{ $t(`desktop.home.housing.why${i}`) }}
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
