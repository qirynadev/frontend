<script setup lang="ts">
/**
 * Destination desktop ← Figma `Etudier France` (694:2), 1728 px.
 *
 * Hero 503 + colonne droite 476 (domaines / écoles / CTA) alignée boxed.
 */
import type { AreaOfStudySummary, Destination } from '~/core/contracts'

const props = defineProps<{
  destination: Destination
  areas: AreaOfStudySummary[]
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const assetBase = '/img/desktop/destination/france'

type DomainIconKind = 'fill' | 'circle'

interface FigmaDomain {
  id: string
  slugs: string[]
  labelKey: string
  icon: string
  iconKind: DomainIconKind
  iconBg?: string
  twoLine?: boolean
  wide?: boolean
}

const figmaDomains: FigmaDomain[] = [
  {
    id: 'prepa',
    slugs: ['classes-prepa', 'prepa', 'classe-prepa'],
    labelKey: 'desktop.destination.france.domainPrepa',
    icon: `${assetBase}/domain/prepa.svg`,
    iconKind: 'fill',
  },
  {
    id: 'medecine',
    slugs: ['medecine'],
    labelKey: 'desktop.destination.france.domainMedecine',
    icon: `${assetBase}/domain/medecine.svg`,
    iconKind: 'circle',
    iconBg: 'bg-[#f3f5fe]',
  },
  {
    id: 'management',
    slugs: ['management'],
    labelKey: 'desktop.destination.france.domainManagement',
    icon: `${assetBase}/domain/management.svg`,
    iconKind: 'circle',
    iconBg: 'bg-[#eaf6e8]',
  },
  {
    id: 'ingenierie',
    slugs: ['ingenierie'],
    labelKey: 'desktop.destination.france.domainIngenierie',
    icon: `${assetBase}/domain/ingenierie.svg`,
    iconKind: 'fill',
  },
  {
    id: 'sciences-politiques',
    slugs: ['sciences-politiques'],
    labelKey: 'desktop.destination.france.domainSciencesPo',
    icon: `${assetBase}/domain/sciences-politiques.svg`,
    iconKind: 'circle',
    iconBg: 'bg-[#f4edff]',
    twoLine: true,
  },
  {
    id: 'droit',
    slugs: ['droit'],
    labelKey: 'desktop.destination.france.domainDroit',
    icon: `${assetBase}/domain/droit.svg`,
    iconKind: 'circle',
    iconBg: 'bg-[#fcf0f0]',
  },
  {
    id: 'architecture',
    slugs: ['architecture'],
    labelKey: 'desktop.destination.france.domainArchitecture',
    icon: `${assetBase}/domain/architecture.svg`,
    iconKind: 'circle',
    iconBg: 'bg-[#f3f9f7]',
    wide: true,
  },
]

const gridDomains = figmaDomains.filter(d => !d.wide)
const wideDomains = figmaDomains.filter(d => d.wide)

function domainHref(domain: FigmaDomain) {
  const area = props.areas.find(a => domain.slugs.includes(a.slug))
  const slug = area?.slug ?? domain.slugs[0]
  return localePath(`/destinations/${props.destination.slug}/ecoles?domaine=${slug}`)
}

const schoolsCtaLink = computed(() =>
  localePath(`/destinations/${props.destination.slug}/ecoles`),
)

const stats = computed(() => [
  {
    icon: `${assetBase}/stats/stat-1.svg`,
    value: props.destination.schoolCount > 0
      ? `${props.destination.schoolCount}+`
      : t('desktop.destination.france.stat1Value'),
    labelKey: 'desktop.destination.france.stat1Label',
    bold: false,
  },
  {
    icon: `${assetBase}/stats/stat-2.svg`,
    value: t('desktop.destination.france.stat2Value'),
    labelKey: 'desktop.destination.france.stat2Label',
    bold: true,
  },
  {
    icon: `${assetBase}/stats/stat-3.svg`,
    value: t('desktop.destination.france.stat3Value'),
    labelKey: 'desktop.destination.france.stat3Label',
    bold: false,
  },
  {
    icon: `${assetBase}/stats/stat-4.svg`,
    value: t('desktop.destination.france.stat4Value'),
    labelKey: 'desktop.destination.france.stat4Label',
    bold: false,
  },
])

const features = [
  {
    icon: `${assetBase}/features/feature-1.svg`,
    titleKey: 'desktop.destination.france.feature1Title',
    descKey: 'desktop.destination.france.feature1Desc',
    radius: 'rounded-[9px]',
    pad: 'p-21',
    gap: 'gap-8',
  },
  {
    icon: `${assetBase}/features/feature-2.svg`,
    titleKey: 'desktop.destination.france.feature2Title',
    descKey: 'desktop.destination.france.feature2Desc',
    radius: 'rounded-[16px]',
    pad: 'p-21',
    gap: 'gap-8',
  },
  {
    icon: `${assetBase}/features/feature-3.png`,
    titleKey: 'desktop.destination.france.feature3Title',
    descKey: 'desktop.destination.france.feature3Desc',
    radius: 'rounded-[16px]',
    pad: 'px-21 pt-21 pb-29',
    gap: 'gap-8',
  },
  {
    icon: `${assetBase}/features/feature-4.png`,
    titleKey: 'desktop.destination.france.feature4Title',
    descKey: 'desktop.destination.france.feature4Desc',
    radius: 'rounded-[16px]',
    pad: 'px-21 pt-21 pb-29',
    gap: 'gap-11',
  },
] as const

const schools = [
  { src: `${assetBase}/schools/school-1.png`, w: 65, h: 34 },
  { src: `${assetBase}/schools/school-2.png`, w: 59, h: 55 },
  { src: `${assetBase}/schools/school-3.png`, w: 63, h: 10 },
  { src: `${assetBase}/schools/school-8.png`, w: 34, h: 51, crop: true },
  { src: `${assetBase}/schools/school-4.png`, w: 63, h: 25 },
  { src: `${assetBase}/schools/school-5.png`, w: 57, h: 30 },
  { src: `${assetBase}/schools/school-6.png`, w: 68, h: 37 },
  { src: `${assetBase}/schools/school-7.png`, w: 62, h: 62 },
] as const

const trustItems = [
  { icon: `${assetBase}/trust-verified.svg`, lines: ['desktop.destination.france.trust1'] },
  { icon: `${assetBase}/trust-compare.svg`, lines: ['desktop.destination.france.trust2'] },
  { icon: `${assetBase}/trust-support.svg`, lines: ['desktop.destination.france.trust3Line1', 'desktop.destination.france.trust3Line2'] },
  { icon: `${assetBase}/trust-premium.svg`, lines: ['desktop.destination.france.trust4Line1', 'desktop.destination.france.trust4Line2'] },
] as const
</script>

<template>
  <div class="flex w-full flex-col items-center bg-white pb-30 text-[#1a1d2b]">
    <!-- Hero 503 · chevauche le bloc suivant de 36 px -->
    <section class="relative mb-[-36px] h-503 w-full overflow-hidden bg-white">
      <img
        :src="`${assetBase}/hero-france.jpg`"
        alt=""
        width="1728"
        height="503"
        class="absolute inset-0 block size-full object-cover object-center"
      >
      <div
        class="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-white/50 via-white/40 to-transparent"
        aria-hidden="true"
      />

      <!-- Gutters boxed (pas d'absolu left/right : ignore le padding) -->
      <div class="desktop-boxed relative flex h-full items-start justify-between">
        <!-- Copy hero : top 93 · badge + titre gap 19 · puis gap 12 · sous-titre + CTA gap 19 -->
        <div class="flex max-w-672 flex-col items-start pt-[93px] pr-64">
          <div class="flex w-267 flex-col gap-12">
            <div class="flex w-full flex-col items-start gap-19">
              <span class="rounded-[6px] bg-[#fef2f2] px-12 py-4 text-[16px] leading-18 font-semibold tracking-[0.6px] text-[#ff1b40]">
                {{ $t('desktop.destination.france.badge') }}
              </span>
              <div class="relative h-113 w-full">
                <h1 class="m-0 text-[49px] leading-[54.6px] font-semibold tracking-[-1.4px]">
                  <span class="block text-[#1a1a1a]">{{ $t('desktop.destination.france.titleBefore') }}</span>
                  <span class="block text-[#ff1b40]">{{ $t('desktop.destination.france.titleAccent') }}</span>
                </h1>
                <span class="absolute top-[70px] left-150 block h-31 w-47 overflow-clip">
                  <img
                    :src="`${assetBase}/france-flags.png`"
                    alt=""
                    width="47"
                    height="31"
                    class="block size-full object-contain"
                  >
                </span>
              </div>
            </div>

            <div class="flex w-full flex-col items-start gap-19">
              <p class="m-0 w-504 max-w-none text-[18px] leading-26 font-medium tracking-[-0.32px] text-black">
                {{ $t('desktop.destination.france.subtitle') }}
              </p>
              <NuxtLink
                :to="schoolsCtaLink"
                class="inline-flex items-center gap-12 rounded-[12px] bg-[#ff1b40] px-28 py-16 text-[16px] leading-20 font-semibold tracking-[-0.154px] text-white no-underline"
              >
                {{ $t('desktop.destination.france.ctaExplore') }}
                <span class="size-20 shrink-0 overflow-clip">
                  <img
                    :src="`${assetBase}/arrow-right.svg`"
                    alt=""
                    width="20"
                    height="20"
                    class="block size-full"
                  >
                </span>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Panneau domaines 476 · top 19 · gap 8 -->
        <aside class="mt-19 flex w-476 shrink-0 flex-col items-start gap-8 rounded-[9px] border border-[#f9fafb] bg-white px-16 pt-21 pb-16 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <h2 class="m-0 w-full text-[20px] leading-28 font-semibold tracking-[-0.46px] text-[#040c3d]">
            {{ $t('desktop.destination.france.domainsTitle') }}
          </h2>
          <p class="m-0 w-full text-[14px] leading-21 font-medium tracking-[-0.154px] text-black">
            {{ $t('desktop.destination.france.domainsDesc1') }}<br>
            {{ $t('desktop.destination.france.domainsDesc2') }}
          </p>

          <div class="flex w-full flex-col gap-16">
            <div class="grid w-full grid-cols-2 gap-16">
              <NuxtLink
                v-for="domain in gridDomains"
                :key="domain.id"
                :to="domainHref(domain)"
                class="flex h-66 items-center justify-between self-start rounded-[8px] border border-[#f3f4f6] bg-white p-13 text-[#040c3d] no-underline"
              >
                <span class="flex min-w-0 items-center gap-12">
                  <span
                    v-if="domain.iconKind === 'fill'"
                    class="relative size-40 shrink-0 overflow-clip"
                  >
                    <img :src="domain.icon" alt="" width="40" height="40" class="absolute inset-0 block size-full">
                  </span>
                  <span
                    v-else
                    class="flex size-40 shrink-0 items-center justify-center overflow-clip rounded-full"
                    :class="domain.iconBg"
                  >
                    <span class="size-20 overflow-clip">
                      <img :src="domain.icon" alt="" width="20" height="20" class="block size-full">
                    </span>
                  </span>
                  <span
                    class="text-[14px] font-semibold tracking-[-0.154px] text-[#040c3d]"
                    :class="domain.twoLine ? 'leading-21 whitespace-pre' : 'leading-[17.5px] whitespace-nowrap'"
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

            <NuxtLink
              v-for="domain in wideDomains"
              :key="domain.id"
              :to="domainHref(domain)"
              class="flex h-66 w-full items-center justify-between rounded-[8px] border border-[#f3f4f6] bg-white p-13 text-[#040c3d] no-underline"
            >
              <span class="flex items-center gap-12">
                <span
                  class="flex size-40 shrink-0 items-center justify-center overflow-clip rounded-full"
                  :class="domain.iconBg"
                >
                  <span class="size-20 overflow-clip">
                    <img :src="domain.icon" alt="" width="20" height="20" class="block size-full">
                  </span>
                </span>
                <span class="text-[14px] leading-21 font-semibold tracking-[-0.154px] whitespace-nowrap text-[#040c3d]">
                  {{ $t(domain.labelKey) }}
                </span>
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

    <!-- Stats + pourquoi + écoles -->
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
            {{ $t('desktop.destination.france.whyTitle') }}
          </h2>
          <div class="grid grid-cols-4 gap-16">
            <article
              v-for="feature in features"
              :key="feature.titleKey"
              class="flex flex-col border border-[#f3f4f6] bg-white"
              :class="[feature.radius, feature.pad, feature.gap]"
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

      <aside class="flex w-476 shrink-0 flex-col gap-32 rounded-[9px] border border-[#f9fafb] bg-white px-16 pt-26 pb-16 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
        <h2 class="m-0 text-[20px] leading-[25.5px] font-semibold tracking-[-0.442px] text-[#040c3d]">
          {{ $t('desktop.destination.france.schoolsTitle') }}
        </h2>
        <div class="grid grid-cols-4 gap-12">
          <div
            v-for="(school, index) in schools"
            :key="index"
            class="flex h-95 items-center justify-center rounded-[12px] border border-[#f3f4f6] bg-white px-5 py-6"
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
                :class="school.crop
                  ? 'absolute top-[-11.49%] left-[-15.44%] h-[124.94%] w-[132.35%] max-w-none'
                  : 'block size-full object-contain'"
              >
            </span>
          </div>
        </div>
      </aside>
    </div>

    <!-- Confiance (flex) + CTA 476 — même colonne droite que domaines / écoles -->
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
              {{ $t('desktop.destination.france.ctaTitle') }}
            </p>
            <p class="m-0 text-[14px] leading-[19.5px] font-normal tracking-[-0.078px] text-[#9ca3af]">
              {{ $t('desktop.destination.france.ctaDesc') }}
            </p>
          </div>
        </div>
        <NuxtLink
          :to="schoolsCtaLink"
          class="inline-flex shrink-0 items-center gap-8 rounded-[12px] bg-[#ff1b40] px-20 py-12 text-[16px] leading-20 font-semibold tracking-[-0.154px] text-white no-underline"
        >
          {{ $t('desktop.destination.france.ctaButton') }}
          <span class="size-16 shrink-0 overflow-clip">
            <img :src="`${assetBase}/cta-pin.svg`" alt="" width="16" height="16" class="block size-full">
          </span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
