<script setup lang="ts">
/**
 * Destination desktop ← Figma `Etudier Chine` (631:2).
 * Même layout boxed que France : hero flex, colonne droite 476.
 */
import type { AreaOfStudySummary, Destination } from '~/core/contracts'

const props = defineProps<{
  destination: Destination
  areas: AreaOfStudySummary[]
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const assetBase = '/img/desktop/destination/chine'
const i18n = 'desktop.destination.chine'

interface FigmaDomain {
  id: string
  slugs: string[]
  labelKey: string
  icon: string
  iconBg: string
  twoLine?: boolean
}

const figmaDomains: FigmaDomain[] = [
  { id: 'management', slugs: ['management'], labelKey: `${i18n}.domainManagement`, icon: `${assetBase}/domain/management.svg`, iconBg: 'bg-[#eaf6e8]' },
  { id: 'sciences-politiques', slugs: ['sciences-politiques'], labelKey: `${i18n}.domainSciencesPo`, icon: `${assetBase}/domain/sciences-politiques.svg`, iconBg: 'bg-[#ecf3fe]', twoLine: true },
  { id: 'architecture', slugs: ['architecture'], labelKey: `${i18n}.domainArchitecture`, icon: `${assetBase}/domain/architecture.svg`, iconBg: 'bg-[#fff4e7]' },
  { id: 'ingenierie', slugs: ['ingenierie'], labelKey: `${i18n}.domainIngenierie`, icon: `${assetBase}/domain/ingenierie.svg`, iconBg: 'bg-[#fef2e8]' },
  { id: 'medecine', slugs: ['medecine'], labelKey: `${i18n}.domainMedecine`, icon: `${assetBase}/domain/medecine.svg`, iconBg: 'bg-[#fcf0f0]' },
]

function domainHref(domain: FigmaDomain) {
  const area = props.areas.find(a => domain.slugs.includes(a.slug))
  const slug = area?.slug ?? domain.slugs[0]
  return localePath(`/destinations/${props.destination.slug}/ecoles?domaine=${slug}`)
}

const schoolsCtaLink = computed(() =>
  localePath(`/destinations/${props.destination.slug}/ecoles`),
)

const stats = computed(() => [
  { icon: `${assetBase}/stats/stat-1.svg`, value: t(`${i18n}.stat1Value`), labelKey: `${i18n}.stat1Label`, bold: false },
  { icon: `${assetBase}/stats/stat-2.svg`, value: t(`${i18n}.stat2Value`), labelKey: `${i18n}.stat2Label`, bold: true },
  { icon: `${assetBase}/stats/stat-3.svg`, value: t(`${i18n}.stat3Value`), labelKey: `${i18n}.stat3Label`, bold: false },
  { icon: `${assetBase}/stats/stat-4.svg`, value: t(`${i18n}.stat4Value`), labelKey: `${i18n}.stat4Label`, bold: false },
])

const features = [
  { icon: `${assetBase}/features/feature-1.svg`, titleKey: `${i18n}.feature1Title`, descKey: `${i18n}.feature1Desc` },
  { icon: `${assetBase}/features/feature-2.svg`, titleKey: `${i18n}.feature2Title`, descKey: `${i18n}.feature2Desc` },
  { icon: `${assetBase}/features/feature-3.svg`, titleKey: `${i18n}.feature3Title`, descKey: `${i18n}.feature3Desc` },
  { icon: `${assetBase}/features/feature-4.svg`, titleKey: `${i18n}.feature4Title`, descKey: `${i18n}.feature4Desc` },
] as const

const schools = [
  { src: `${assetBase}/schools/school-1.png`, w: 44, h: 44, line1Key: `${i18n}.school1a`, line2Key: `${i18n}.school1b` },
  { src: `${assetBase}/schools/school-2.png`, w: 42, h: 43, line1Key: `${i18n}.school2a`, line2Key: `${i18n}.school2b` },
  { src: `${assetBase}/schools/school-3.png`, w: 45, h: 45, line1Key: `${i18n}.school3a`, line2Key: `${i18n}.school3b` },
  { src: `${assetBase}/schools/school-4.png`, w: 48, h: 48, line1Key: `${i18n}.school4a`, line2Key: `${i18n}.school4b` },
  { src: `${assetBase}/schools/school-5.png`, w: 41, h: 41, line1Key: `${i18n}.school5a`, line2Key: `${i18n}.school5b` },
  { src: `${assetBase}/schools/school-6.png`, w: 36, h: 40, line1Key: `${i18n}.school6a`, line2Key: `${i18n}.school6b` },
  { src: `${assetBase}/schools/school-7.png`, w: 44, h: 44, line1Key: `${i18n}.school7a`, line2Key: `${i18n}.school7b` },
  { src: `${assetBase}/schools/school-8.png`, w: 47, h: 47, line1Key: `${i18n}.school8a`, line2Key: `${i18n}.school8b` },
] as const

const trustItems = [
  { icon: `${assetBase}/trust-verified.svg`, lines: [`${i18n}.trust1Line1`, `${i18n}.trust1Line2`] },
  { icon: `${assetBase}/trust-compare.svg`, lines: [`${i18n}.trust2Line1`, `${i18n}.trust2Line2`] },
  { icon: `${assetBase}/trust-support.svg`, lines: [`${i18n}.trust3Line1`, `${i18n}.trust3Line2`] },
  { icon: `${assetBase}/trust-premium.svg`, lines: [`${i18n}.trust4Line1`, `${i18n}.trust4Line2`] },
] as const
</script>

<template>
  <div class="flex w-full flex-col items-center bg-white pb-30 text-[#1a1d2b]">
    <section class="relative mb-[-36px] h-503 w-full overflow-hidden bg-white">
      <img
        :src="`${assetBase}/hero-chine.jpg`"
        alt=""
        width="1728"
        height="503"
        class="absolute inset-0 block size-full object-cover object-center"
      >
      <div
        class="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-white/50 via-white/40 to-transparent"
        aria-hidden="true"
      />

      <div class="desktop-boxed relative flex h-full items-start justify-between">
        <div class="flex max-w-672 flex-col items-start pt-[93px] pr-64">
          <div class="flex w-267 flex-col gap-12">
            <div class="flex w-full flex-col items-start gap-19">
              <span class="rounded-[6px] bg-[#fef2f2] px-12 py-4 text-[16px] leading-18 font-semibold tracking-[0.6px] text-[#ff1b40]">
                {{ $t(`${i18n}.badge`) }}
              </span>
              <div class="relative h-113 w-full">
                <h1 class="m-0 text-[49px] leading-[54.6px] font-semibold tracking-[-1.4px]">
                  <span class="block text-[#1a1a1a]">{{ $t(`${i18n}.titleBefore`) }}</span>
                  <span class="block text-[#ff1b40]">{{ $t(`${i18n}.titleAccent`) }}</span>
                </h1>
                <span class="absolute top-[61px] left-134 block size-48 overflow-clip">
                  <img
                    :src="`${assetBase}/china-flag.png`"
                    alt=""
                    width="48"
                    height="48"
                    class="block size-full object-cover"
                  >
                </span>
              </div>
            </div>

            <div class="flex w-full flex-col items-start gap-19">
              <p class="m-0 w-504 max-w-none text-[18px] leading-26 font-medium tracking-[-0.32px] whitespace-pre-line text-black">
                {{ $t(`${i18n}.subtitle`) }}
              </p>
              <NuxtLink
                :to="schoolsCtaLink"
                class="inline-flex items-center gap-12 rounded-[12px] bg-[#ff1b40] px-28 py-16 text-[16px] leading-20 font-semibold tracking-[-0.154px] text-white no-underline"
              >
                {{ $t(`${i18n}.ctaExplore`) }}
                <span class="size-20 shrink-0 overflow-clip">
                  <img :src="`${assetBase}/arrow-right.svg`" alt="" width="20" height="20" class="block size-full">
                </span>
              </NuxtLink>
            </div>
          </div>
        </div>

        <aside class="mt-19 flex w-476 shrink-0 flex-col items-start gap-8 rounded-[9px] border border-[#f9fafb] bg-white px-16 pt-21 pb-16 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <h2 class="m-0 w-full text-[20px] leading-28 font-semibold tracking-[-0.46px] text-[#040c3d]">
            {{ $t(`${i18n}.domainsTitle`) }}
          </h2>
          <p class="m-0 w-full text-[14px] leading-21 font-medium tracking-[-0.154px] text-black">
            {{ $t(`${i18n}.domainsDesc1`) }}<br>
            {{ $t(`${i18n}.domainsDesc2`) }}
          </p>

          <div class="grid w-full grid-cols-2 gap-16 pt-24">
            <NuxtLink
              v-for="domain in figmaDomains"
              :key="domain.id"
              :to="domainHref(domain)"
              class="flex h-66 items-center justify-between self-start rounded-[8px] border border-[#f3f4f6] bg-white p-13 text-[#040c3d] no-underline"
            >
              <span class="flex min-w-0 items-center gap-12">
                <span
                  class="flex size-40 shrink-0 items-center justify-center overflow-clip rounded-full"
                  :class="domain.iconBg"
                >
                  <span class="size-20 overflow-clip">
                    <img :src="domain.icon" alt="" width="20" height="20" class="block size-full">
                  </span>
                </span>
                <span
                  class="text-[14px] font-semibold tracking-[-0.154px] text-[#040c3d]"
                  :class="domain.twoLine ? 'leading-21 whitespace-pre' : 'leading-21 whitespace-nowrap'"
                >{{ $t(domain.labelKey) }}</span>
              </span>
              <span class="flex h-16 w-20 shrink-0 items-center justify-center pr-4">
                <span class="relative size-16 overflow-clip">
                  <img
                    :src="`${assetBase}/domain/chevron.svg`"
                    alt=""
                    width="6"
                    height="10"
                    class="absolute top-1/4 left-[37.5%] h-1/2 w-1/4 max-w-none"
                  >
                </span>
              </span>
            </NuxtLink>
          </div>
        </aside>
      </div>
    </section>

    <div class="desktop-boxed relative z-10 flex w-full items-start gap-24 pb-25">
      <div class="flex min-w-0 flex-1 flex-col gap-25">
        <div class="flex w-full items-start justify-center gap-15 rounded-[9px] border border-[#f9fafb] bg-white px-21 py-18 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <template v-for="(stat, index) in stats" :key="stat.labelKey">
            <div
              v-if="index > 0"
              class="h-64 w-px shrink-0 bg-[#f3f4f6]"
              aria-hidden="true"
            />
            <div class="flex min-w-0 flex-1 items-start justify-center gap-10">
              <span class="size-45 shrink-0 overflow-clip">
                <img :src="stat.icon" alt="" width="45" height="45" class="block size-full">
              </span>
              <div class="flex min-w-0 flex-1 flex-col gap-2">
                <p
                  class="m-0 text-[16px] leading-26 tracking-[0.208px] text-[#040c3d]"
                  :class="stat.bold ? 'font-bold' : 'font-semibold'"
                >
                  {{ stat.value }}
                </p>
                <p class="m-0 text-[14px] leading-15 font-normal text-black">
                  {{ $t(stat.labelKey) }}
                </p>
              </div>
            </div>
          </template>
        </div>

        <div class="flex w-full flex-col gap-20">
          <h2 class="m-0 text-[20px] leading-28 font-semibold tracking-[-0.46px] text-[#040c3d]">
            {{ $t(`${i18n}.whyTitle`) }}
          </h2>
          <div class="grid grid-cols-4 gap-16">
            <article
              v-for="feature in features"
              :key="feature.titleKey"
              class="flex flex-col gap-8 rounded-[9px] border border-[#f3f4f6] bg-white p-21"
            >
              <div class="flex items-center gap-8">
                <span class="size-40 shrink-0 overflow-clip">
                  <img :src="feature.icon" alt="" width="40" height="40" class="block size-full">
                </span>
                <h3 class="m-0 text-[14px] leading-[19.5px] font-bold tracking-[-0.078px] text-[#040c3d]">
                  {{ $t(feature.titleKey) }}
                </h3>
              </div>
              <p class="m-0 text-[14px] leading-[19.5px] font-normal text-black">
                {{ $t(feature.descKey) }}
              </p>
            </article>
          </div>
        </div>
      </div>

      <aside class="flex w-476 shrink-0 flex-col gap-32 rounded-[9px] border border-[#f9fafb] bg-white px-16 pt-21 pb-16 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
        <h2 class="m-0 text-[20px] leading-[25.5px] font-semibold tracking-[-0.442px] text-[#040c3d]">
          {{ $t(`${i18n}.schoolsTitle`) }}
        </h2>
        <div class="grid grid-cols-4 gap-12">
          <div
            v-for="(school, index) in schools"
            :key="index"
            class="flex h-95 flex-col items-center justify-center gap-5 rounded-[12px] border border-[#f3f4f6] bg-white p-5"
          >
            <span
              class="relative shrink-0 overflow-hidden"
              :style="{ width: `${school.w}px`, height: `${school.h}px` }"
            >
              <img
                :src="school.src"
                alt=""
                :width="school.w"
                :height="school.h"
                class="block size-full object-contain"
              >
            </span>
            <p class="m-0 text-center text-[8px] leading-10 font-semibold whitespace-pre-line text-[#1f2937]">
              {{ $t(school.line1Key) }}<template v-if="$t(school.line2Key).trim()"><br>{{ $t(school.line2Key) }}</template>
            </p>
          </div>
        </div>
      </aside>
    </div>

    <div class="desktop-boxed relative z-10 flex w-full items-center gap-25">
      <div class="flex min-w-0 flex-1 items-center justify-between rounded-[9px] border border-[#f3f4f6] bg-white p-21">
        <div class="flex min-w-0 flex-1 items-center gap-15">
          <template v-for="(item, index) in trustItems" :key="index">
            <div
              v-if="index > 0"
              class="h-49 w-px shrink-0 bg-[#f3f4f6]"
              aria-hidden="true"
            />
            <div class="flex min-w-0 flex-1 items-center gap-8">
              <span class="flex shrink-0 rounded-full bg-[#fef2f2] p-10">
                <span class="size-20 overflow-clip">
                  <img :src="item.icon" alt="" width="20" height="20" class="block size-full">
                </span>
              </span>
              <p class="m-0 max-w-130 text-[14px] leading-15 font-medium text-black">
                <template v-for="(line, lineIndex) in item.lines" :key="line">
                  <br v-if="lineIndex > 0">{{ $t(line) }}
                </template>
              </p>
            </div>
          </template>
        </div>
      </div>

      <div class="relative flex w-476 shrink-0 items-center justify-between overflow-hidden rounded-[9px] bg-[#192339] px-20 py-25 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]">
        <div
          class="pointer-events-none absolute top-0 right-0 size-160 rounded-full bg-white/5 blur-[20px]"
          aria-hidden="true"
        />
        <div class="flex min-w-0 flex-1 items-center gap-10">
          <span class="size-40 shrink-0 overflow-clip">
            <img :src="`${assetBase}/cta-icon.png`" alt="" width="40" height="40" class="block size-full">
          </span>
          <div class="flex min-w-0 flex-col gap-6">
            <p class="m-0 text-[16px] leading-[18.75px] font-normal tracking-[-0.24px] text-white">
              {{ $t(`${i18n}.ctaTitle`) }}
            </p>
            <p class="m-0 text-[14px] leading-[19.5px] font-normal tracking-[-0.078px] text-[#9ca3af]">
              {{ $t(`${i18n}.ctaDesc`) }}
            </p>
          </div>
        </div>
        <NuxtLink
          :to="schoolsCtaLink"
          class="inline-flex shrink-0 items-center gap-8 rounded-[12px] bg-[#ff1b40] px-20 py-12 text-[16px] leading-20 font-semibold tracking-[-0.154px] text-white no-underline"
        >
          {{ $t(`${i18n}.ctaButton`) }}
          <span class="size-16 shrink-0 overflow-clip">
            <img :src="`${assetBase}/cta-pin.svg`" alt="" width="16" height="16" class="block size-full">
          </span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
