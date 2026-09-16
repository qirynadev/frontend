<script setup lang="ts">
/**
 * Orientation desktop ← Figma `Profilage` (998:555), 1728 px.
 * Formules : `GET /profilage` + `GET /profilage/formulas` (même source que mobile).
 */
import { offerPageRepo } from '~/core/repositories'

const { n, locale } = useI18n()
const ASSET = '/img/desktop/orientation'

type Audience = 'eleve' | 'etudiant' | 'professionnel'

const audience = ref<Audience>('eleve')

const audiences = [
  {
    id: 'eleve' as const,
    icon: `${ASSET}/path-eleve.svg`,
    iconBg: 'bg-transparent',
    titleKey: 'desktop.orientation.audience.studentHighschool',
    descKey: 'desktop.orientation.audience.studentHighschoolDesc',
  },
  {
    id: 'etudiant' as const,
    icon: `${ASSET}/path-etudiant.svg`,
    iconBg: 'bg-[#faf5ff]',
    titleKey: 'desktop.orientation.audience.studentUni',
    descKey: 'desktop.orientation.audience.studentUniDesc',
  },
  {
    id: 'professionnel' as const,
    icon: `${ASSET}/path-pro.svg`,
    iconBg: 'bg-[#fff7ed]',
    titleKey: 'desktop.orientation.audience.pro',
    descKey: 'desktop.orientation.audience.proDesc',
  },
] as const

const heroStats = [
  { icon: `${ASSET}/stat-profiles.svg`, valueKey: 'desktop.orientation.stat1Value', labelKey: 'desktop.orientation.stat1Label', bg: 'bg-[#fee7e7]' },
  { icon: `${ASSET}/stat-satisfaction.svg`, valueKey: 'desktop.orientation.stat2Value', labelKey: 'desktop.orientation.stat2Label', bg: '' },
  { icon: `${ASSET}/stat-experts.svg`, valueKey: 'desktop.orientation.stat3Value', labelKey: 'desktop.orientation.stat3Label', bg: 'bg-[#fef0e6]' },
] as const

const trusts = [
  { icon: `${ASSET}/trust-pay.svg`, bg: 'bg-[#f3eefd]', titleKey: 'desktop.orientation.trustPayTitle', descKey: 'desktop.orientation.trustPayDesc' },
  { icon: `${ASSET}/trust-visio.svg`, bg: 'bg-[#ecf8ef]', titleKey: 'desktop.orientation.trustVisioTitle', descKey: 'desktop.orientation.trustVisioDesc' },
  { icon: `${ASSET}/trust-experts.svg`, bg: 'bg-[#fef0e5]', titleKey: 'desktop.orientation.trustExpertsTitle', descKey: 'desktop.orientation.trustExpertsDesc' },
] as const

const VISUALS = [
  {
    key: 'jordan',
    icon: `${ASSET}/icon-jordan.svg`,
    iconBg: 'bg-[#faf5ff]',
    name: 'text-[#570ef8]',
    card: 'border-[#f1effd]',
    price: 'text-[#570ef8]',
    button: 'border border-[#e9d5ff] bg-white text-[#9333ea]',
    check: `${ASSET}/check-jordan.svg`,
    popular: false,
  },
  {
    key: 'tyson',
    icon: `${ASSET}/icon-tyson.svg`,
    iconBg: 'bg-[#f0fdf4]',
    name: 'text-[#149841]',
    card: 'border-[#f5faf8]',
    price: 'text-[#149841]',
    button: 'border border-[#bbf7d0] bg-white text-[#16a34a]',
    check: `${ASSET}/check-tyson.svg`,
    popular: false,
  },
  {
    key: 'pele',
    icon: `${ASSET}/icon-pele.svg`,
    iconBg: 'bg-[#fef2f2]',
    name: 'text-[#fd0302]',
    card: 'border-[#febfc6]',
    price: 'text-[#f50210]',
    button: 'border-0 bg-[#f50210] text-white',
    check: `${ASSET}/check-pele.svg`,
    popular: true,
  },
] as const

const { data: offer, apiError, isInitialLoading, refresh } = await usePageData(
  'orientation-offer-desktop',
  () => offerPageRepo.bySlug('orientation', locale.value),
  { watch: [locale] },
)

const tiers = computed(() => {
  const list = offer.value?.tiers ?? []
  return list.map((tier, index) => ({
    tier,
    visual: VISUALS[Math.min(index, VISUALS.length - 1)]!,
  }))
})

const { pending: checkoutPending, errorKey: checkoutErrorKey, start: startCheckout } = useCheckout()
</script>

<template>
  <div class="desktop-boxed flex w-full flex-col gap-[var(--q-space-section,24px)] pt-20 pb-32 text-[#1a1d2b]">
    <div class="desktop-split gap-32">
      <div class="flex min-w-0 flex-1 flex-col gap-42">
        <section class="flex flex-col items-start gap-16 xl:flex-row xl:items-center">
          <div class="flex min-w-0 w-full max-w-498 flex-col">
            <span class="inline-flex w-fit rounded-[6px] bg-[#f0ecff] px-12 py-4 text-[11px] leading-[16.5px] font-bold tracking-[0.55px] text-[#580ffe] uppercase">
              {{ $t('desktop.orientation.badge') }}
            </span>
            <h1 class="m-0 pt-16 text-[length:var(--q-fs-hero,40px)] leading-[1.21] font-semibold">
              <span class="block">{{ $t('desktop.orientation.titleBefore') }}</span>
              <span>
                {{ $t('desktop.orientation.titleMid') }}
                <span class="text-[#ed1c24]">{{ $t('desktop.orientation.titleAccent') }}</span>
              </span>
            </h1>
            <p class="m-0 max-w-448 pt-16 text-[length:var(--q-fs-body,16px)] leading-26">
              {{ $t('desktop.orientation.intro') }}
            </p>
            <div class="flex flex-wrap items-center gap-24 pt-32">
              <div v-for="stat in heroStats" :key="stat.valueKey" class="flex items-center gap-12">
                <span
                  class="flex size-40 shrink-0 items-center justify-center overflow-hidden rounded-full"
                  :class="stat.bg || undefined"
                >
                  <img :src="stat.icon" alt="" width="20" height="20" class="size-20">
                </span>
                <div>
                  <p class="m-0 text-[14px] leading-[17.5px] font-bold">{{ $t(stat.valueKey) }}</p>
                  <p class="m-0 text-[12px] leading-[15px] text-[#3e3e3e]">{{ $t(stat.labelKey) }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="relative hidden h-331 w-full max-w-496 shrink-0 overflow-hidden rounded-[24px] xl:block">
            <img :src="`${ASSET}/hero.png`" alt="" width="496" height="331" class="size-full object-cover">
          </div>
        </section>

        <section class="rounded-16 border border-[#f0f2f6] bg-white px-16 pt-15 pb-32">
          <h2 class="m-0 text-center text-[length:var(--q-fs-title,24px)] leading-32 font-semibold">
            {{ $t('offer.title') }}
          </h2>
          <p class="m-0 pt-4 text-center text-[15px] leading-[22.5px] text-[#404040]">
            {{ $t('offer.subtitle') }}
          </p>

          <PageState :loading="isInitialLoading" :error="apiError" :on-retry="() => refresh()">
            <template #loading>
              <div class="grid grid-cols-1 gap-14 pt-24 md:grid-cols-3">
                <QSkeleton v-for="i in 3" :key="i" variant="rect" :height="420" />
              </div>
            </template>

            <QAlert
              v-if="checkoutErrorKey"
              class="mt-16"
              tone="danger"
              :title="$t('auth.error.title')"
              :message="$t(checkoutErrorKey)"
            />

            <div v-if="tiers.length > 0" class="grid grid-cols-1 gap-14 pt-24 md:grid-cols-3">
              <article
                v-for="entry in tiers"
                :key="entry.tier.id"
                class="relative flex flex-col rounded-16 border bg-white p-24"
                :class="entry.visual.card"
              >
                <span
                  v-if="entry.visual.popular"
                  class="absolute top-[-1px] right-0 inline-flex items-center gap-4 rounded-tr-[16px] rounded-bl-[4px] bg-[#ed1c24] px-12 py-4 text-[11px] leading-[16.5px] font-bold text-white"
                >
                  <img :src="`${ASSET}/star.svg`" alt="" width="12" height="12" class="size-12">
                  {{ $t('desktop.orientation.popular') }}
                </span>
                <div class="flex flex-col items-center">
                  <div class="flex items-center justify-center gap-16">
                    <span class="flex size-48 items-center justify-center rounded-full" :class="entry.visual.iconBg">
                      <img :src="entry.visual.icon" alt="" width="24" height="24" class="size-24">
                    </span>
                    <h3 class="m-0 text-[20px] leading-28 font-semibold" :class="entry.visual.name">
                      {{ entry.tier.name }}
                    </h3>
                  </div>
                  <p class="m-0 pt-8 text-center text-[12px] leading-18 font-medium text-[#393939]">
                    {{ $t(`orientation.formules.${entry.visual.key}.tagline`) }}
                  </p>
                </div>
                <ul v-if="entry.tier.features.length > 0" class="m-0 flex flex-1 list-none flex-col gap-8 p-0 pt-20">
                  <li v-for="feature in entry.tier.features" :key="feature" class="flex items-start gap-10 text-[13px] leading-[16.25px]">
                    <img :src="entry.visual.check" alt="" width="16" height="16" class="mt-2 size-16 shrink-0">
                    <span class="min-w-0">{{ feature }}</span>
                  </li>
                </ul>
                <div class="mt-auto flex flex-col items-center pt-32">
                  <p class="m-0 text-[28px] leading-42 font-semibold" :class="entry.visual.price">
                    {{ n(entry.tier.price.amount, 'currency') }}
                  </p>
                  <p class="m-0 pb-20 text-[11px] leading-[16.5px] text-[#181818]">{{ $t('offer.oneOff') }}</p>
                  <button
                    v-if="offer"
                    type="button"
                    :disabled="checkoutPending === entry.tier.id || (checkoutPending !== null && checkoutPending !== entry.tier.id)"
                    class="flex w-full cursor-pointer items-center justify-center rounded-[10px] px-16 py-12 text-[14px] leading-21 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                    :class="entry.visual.button"
                    @click="startCheckout(offer, entry.tier)"
                  >
                    <QSpinner v-if="checkoutPending === entry.tier.id" size="sm" />
                    <span v-else>{{ $t('offer.choose') }}</span>
                  </button>
                </div>
              </article>
            </div>
            <QEmptyState
              v-else-if="!isInitialLoading"
              class="mt-24"
              icon="ic-of-jordan"
              :title="$t('offer.emptyTitle')"
              :description="$t('offer.emptyDescription')"
            />
          </PageState>
        </section>

        <div class="grid grid-cols-1 gap-16 rounded-16 border border-[#f0f2f6] bg-white px-32 py-20 shadow-[0_1px_1px_rgba(0,0,0,0.05)] md:grid-cols-3">
          <div
            v-for="(item, index) in trusts"
            :key="item.titleKey"
            class="flex items-center gap-16"
            :class="index > 0 ? 'md:border-l md:border-[#f0f2f6] md:pl-32' : ''"
          >
            <span class="flex size-48 shrink-0 items-center justify-center rounded-full" :class="item.bg">
              <img :src="item.icon" alt="" width="24" height="24" class="size-24">
            </span>
            <div class="min-w-0">
              <p class="m-0 text-[14px] leading-21 font-bold">{{ $t(item.titleKey) }}</p>
              <p class="m-0 text-[13px] leading-[19.5px] text-[#525252]">{{ $t(item.descKey) }}</p>
            </div>
          </div>
        </div>
      </div>

      <aside class="desktop-rail flex flex-col">
        <div class="rounded-16 border border-[#f3f4f6] bg-white p-24">
          <h2 class="m-0 text-[17px] leading-[25.5px] font-bold">{{ $t('desktop.orientation.audience.title') }}</h2>
          <p class="m-0 pt-4 text-[13px] leading-[19.5px] text-[#202020]">{{ $t('desktop.orientation.audience.lead') }}</p>
          <div class="flex flex-col gap-16 pt-24" role="radiogroup" :aria-label="$t('desktop.orientation.audience.title')">
            <button
              v-for="item in audiences"
              :key="item.id"
              type="button"
              role="radio"
              :aria-checked="audience === item.id"
              class="relative flex w-full items-center gap-16 rounded-16 border bg-white p-16 text-left"
              :class="audience === item.id ? 'border-[#fe5358]' : 'border-[#f2f4f8]'"
              @click="audience = item.id"
            >
              <span class="flex size-48 shrink-0 items-center justify-center overflow-hidden rounded-full" :class="item.iconBg">
                <img :src="item.icon" alt="" width="24" height="24" class="size-24">
              </span>
              <span class="min-w-0 flex-1 pr-28">
                <span class="block text-[15px] leading-[22.5px] font-semibold">{{ $t(item.titleKey) }}</span>
                <span class="mt-2 block text-[12px] leading-[15px] text-[#252525]">{{ $t(item.descKey) }}</span>
              </span>
              <span
                class="absolute top-1/2 right-16 size-20 -translate-y-1/2 rounded-full border box-border"
                :class="audience === item.id ? 'border-[#f60914]' : 'border-[#e5e7eb]'"
                aria-hidden="true"
              >
                <span v-if="audience === item.id" class="absolute inset-[4px] rounded-full bg-[#f60914]" />
              </span>
            </button>
          </div>
        </div>

        <div class="mt-24 flex items-start gap-16 rounded-16 bg-[#fef2f3] p-24 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <span class="flex size-48 shrink-0 items-center justify-center rounded-full bg-[#fee9ea]">
            <img :src="`${ASSET}/guarantee.svg`" alt="" width="24" height="24" class="size-24">
          </span>
          <div>
            <p class="m-0 text-[15px] leading-[22.5px] font-bold text-[#252525]">{{ $t('desktop.orientation.guaranteeTitle') }}</p>
            <p class="m-0 pt-4 text-[13px] leading-[21px]">{{ $t('desktop.orientation.guaranteeDesc') }}</p>
          </div>
        </div>

        <div class="mt-24 rounded-16 border border-[#f3f4f6] bg-white p-24 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <p class="m-0 text-[15px] leading-[22.5px] font-bold text-[#151515]">{{ $t('desktop.orientation.socialTitle') }}</p>
          <div class="flex items-center pt-20">
            <div class="flex">
              <img
                v-for="i in 4"
                :key="i"
                :src="`${ASSET}/avatar-${i}.png`"
                alt=""
                width="32"
                height="32"
                class="-ml-2 size-32 rounded-full object-cover shadow-[0_0_0_2px_white] first:ml-0"
              >
            </div>
            <div class="pl-16 text-[12px] leading-16 font-extrabold">
              4.9/5
              <span class="pl-8 font-normal text-[#fbbf24]">★★★★★</span>
            </div>
          </div>
          <p class="m-0 pt-12 text-[12px] leading-18 text-[#2d2d2d]">{{ $t('desktop.orientation.socialCount') }}</p>
        </div>
      </aside>
    </div>
  </div>
</template>
