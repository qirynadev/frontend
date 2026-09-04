<script setup lang="ts">
/**
 * Destination desktop générique (Canada / Angleterre / USA).
 * Même layout boxed que France & Chine : hero flex, colonne droite 476.
 */
import type { AreaOfStudySummary, Destination } from '~/core/contracts'
import { desktopCountryScreens, type DesktopCountrySlug } from '~/config/desktop-destination-country'

const props = defineProps<{
  country: DesktopCountrySlug
  destination: Destination
  areas: AreaOfStudySummary[]
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const screen = computed(() => desktopCountryScreens[props.country])
const assetBase = computed(() => screen.value.assetBase)
const i18n = computed(() => screen.value.i18n)

interface FigmaDomain {
  id: string
  slugs: string[]
  labelKey: string
  icon: string
  iconBg: string
  twoLine?: boolean
}

const figmaDomains = computed<FigmaDomain[]>(() =>
  screen.value.domains.map(domain => ({
    ...domain,
    icon: `${assetBase.value}/domain/${domain.icon}`,
    labelKey: `${i18n.value}.${domain.labelKey}`,
  })),
)

function domainHref(domain: FigmaDomain) {
  const area = props.areas.find(a => domain.slugs.includes(a.slug))
  const slug = area?.slug ?? domain.slugs[0]
  return localePath(`/destinations/${props.destination.slug}/ecoles?domaine=${slug}`)
}

const schoolsCtaLink = computed(() =>
  localePath(`/destinations/${props.destination.slug}/ecoles`),
)

const stats = computed(() =>
  screen.value.stats.map((stat, index) => ({
    icon: `${assetBase.value}/stats/stat-${index + 1}.svg`,
    value: t(`${i18n.value}.${stat.valueKey}`),
    labelKey: `${i18n.value}.${stat.labelKey}`,
    bold: stat.bold,
  })),
)

const features = computed(() =>
  [1, 2, 3, 4].map(n => ({
    icon: `${assetBase.value}/features/feature-${n}.svg`,
    titleKey: `${i18n.value}.feature${n}Title`,
    descKey: `${i18n.value}.feature${n}Desc`,
  })),
)

const schools = computed(() =>
  screen.value.schools.map((school, index) => ({
    src: `${assetBase.value}/schools/school-${index + 1}.png`,
    w: school.w,
    h: school.h,
  })),
)

const trustItems = computed(() => [
  { icon: `${assetBase.value}/trust-verified.svg`, lines: screen.value.trust[0] },
  { icon: `${assetBase.value}/trust-compare.svg`, lines: screen.value.trust[1] },
  { icon: `${assetBase.value}/trust-support.svg`, lines: screen.value.trust[2] },
  { icon: `${assetBase.value}/trust-premium.svg`, lines: screen.value.trust[3] },
])
</script>

<template>
  <div class="flex w-full flex-col items-center bg-white pb-30 text-[#1a1d2b]">
    <section class="relative mb-[-36px] h-503 w-full overflow-hidden bg-white">
      <img
        :src="`${assetBase}/${screen.hero}`"
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
                <span
                  class="absolute overflow-clip"
                  :class="screen.flag.class"
                >
                  <img
                    :src="`${assetBase}/${screen.flag.src}`"
                    alt=""
                    :width="screen.flag.w"
                    :height="screen.flag.h"
                    class="block size-full object-contain"
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
            class="flex h-95 items-center justify-center rounded-[12px] border border-[#f3f4f6] bg-white p-5"
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
                  <br v-if="lineIndex > 0">{{ $t(`${i18n}.${line}`) }}
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
