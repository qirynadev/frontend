<script setup lang="ts">
/**
 * Landing temporaire « Français » — même composition que
 * `/destinations/chine` (Figma `Etudier Chine` 631:2).
 * Activée par `/langues?langue=francais`.
 */
import type { CourseSummary, OfferTier } from '~/core/contracts'
import { offerPageRepo } from '~/core/repositories'
import { DESKTOP_LANGUES_ASSET, DESKTOP_LANGUES_FORMULES_ASSET, desktopLangueFormulaVisual } from '~/config/desktop-langues'

const props = defineProps<{
  courses: CourseSummary[]
}>()

const { t, n, locale } = useI18n()
const localePath = useLocalePath()

const CHINE = '/img/desktop/destination/chine'
const LANGUES = DESKTOP_LANGUES_ASSET
const FORMULES = DESKTOP_LANGUES_FORMULES_ASSET
const i18n = 'desktop.languesFrancais'

function isFrancaisSlug(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes('francais')
}

const frenchSlug = computed(() => {
  const match = props.courses.find(course => isFrancaisSlug(course.slug) || isFrancaisSlug(course.name))
  return match?.slug ?? 'francais'
})

const objectifsHref = computed(() => localePath(`/langues/${frenchSlug.value}/objectifs`))

const { data: offer, apiError, isInitialLoading, refresh } = await usePageData(
  'langues-francais-offer-desktop',
  () => frenchSlug.value
    ? offerPageRepo.bySlug(frenchSlug.value, locale.value)
    : Promise.resolve(null),
  { watch: [frenchSlug, locale] },
)

const { pending: checkoutPending, errorKey: checkoutErrorKey, start: startCheckout } = useCheckout()

function taglineKey(visualKey: string) {
  if (visualKey === 'aconcagua') return 'desktop.langues.formulaTaglineAconcagua'
  if (visualKey === 'kilimandjaro') return 'desktop.langues.formulaTaglineKilimandjaro'
  return 'desktop.langues.formulaTaglineEverest'
}

function formulaFeatures(tier: OfferTier, visualKey: string): string[] {
  const hoursLabel = tier.hours != null
    ? t('desktop.langues.formulaHours', { count: tier.hours })
    : null
  const hasHours = hoursLabel != null && tier.features.some(feature =>
    feature.includes(String(tier.hours)) || /\d/.test(feature) && /h|séance|heure|session/i.test(feature),
  )

  if (tier.features.length === 0) {
    return [
      t('desktop.langues.formulaFeatTest'),
      t('desktop.langues.formulaFeatTeacher'),
      hoursLabel,
      t('desktop.langues.formulaFeatMaterials'),
      visualKey === 'everest' ? t('desktop.langues.formulaFeatFollow') : null,
    ].filter((item): item is string => Boolean(item))
  }

  const features = [...tier.features]
  if (hoursLabel && !hasHours) {
    features.splice(Math.min(2, features.length), 0, hoursLabel)
  }
  return features
}

const formulaCards = computed(() => {
  const reversed = [...(offer.value?.tiers ?? [])].reverse()
  return reversed.map((tier, index) => {
    const visual = desktopLangueFormulaVisual(tier.name, index)
    return {
      tier,
      visual,
      tagline: tier.tagline || t(taglineKey(visual.key)),
      features: formulaFeatures(tier, visual.key),
    }
  })
})

const highlightFormulas = ref(false)
let highlightTimer: ReturnType<typeof setTimeout> | null = null

onBeforeUnmount(() => {
  if (highlightTimer) clearTimeout(highlightTimer)
})

function flashFormulaCards() {
  highlightFormulas.value = false
  requestAnimationFrame(() => {
    highlightFormulas.value = true
    if (highlightTimer) clearTimeout(highlightTimer)
    highlightTimer = setTimeout(() => {
      highlightFormulas.value = false
      highlightTimer = null
    }, 1600)
  })
}

function scrollToFormulas(event?: Event) {
  event?.preventDefault()
  if (!import.meta.client) return
  const desktop = document.getElementById('q-shell-desktop')
  const target = (desktop ?? document).querySelector('#formules') as HTMLElement | null
  if (!target) return
  const nav = desktop?.querySelector('.sticky') as HTMLElement | null
  const offset = nav?.getBoundingClientRect().height ?? 80
  window.scrollTo({
    top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset - 12),
    behavior: 'smooth',
  })
  flashFormulaCards()
}

interface LanguageTrack {
  id: string
  labelKey: string
  icon: string
  iconBg: string
  twoLine?: boolean
}

const tracks: LanguageTrack[] = [
  { id: 'beginner', labelKey: `${i18n}.trackBeginner`, icon: `${CHINE}/domain/management.svg`, iconBg: 'bg-[#eaf6e8]' },
  { id: 'intermediate', labelKey: `${i18n}.trackIntermediate`, icon: `${CHINE}/domain/architecture.svg`, iconBg: 'bg-[#fff4e7]' },
  { id: 'advanced', labelKey: `${i18n}.trackAdvanced`, icon: `${CHINE}/domain/medecine.svg`, iconBg: 'bg-[#fcf0f0]' },
  { id: 'conversation', labelKey: `${i18n}.trackConversation`, icon: `${CHINE}/domain/sciences-politiques.svg`, iconBg: 'bg-[#ecf3fe]' },
  { id: 'exams', labelKey: `${i18n}.trackExams`, icon: `${CHINE}/domain/ingenierie.svg`, iconBg: 'bg-[#fef2e8]' },
]

const reassurance = [
  { icon: 'ic-trust-shield', labelKey: 'trust.payment' },
  { icon: 'ic-trust-laurel', labelKey: 'trust.support', circled: true },
  { icon: 'ic-trust-smile', labelKey: 'trust.satisfaction' },
] as const

const stats = computed(() => [
  { icon: `${CHINE}/stats/stat-1.svg`, value: t(`${i18n}.stat1Value`), labelKey: `${i18n}.stat1Label`, bold: false },
  { icon: `${CHINE}/stats/stat-2.svg`, value: t(`${i18n}.stat2Value`), labelKey: `${i18n}.stat2Label`, bold: true },
  { icon: `${CHINE}/stats/stat-3.svg`, value: t(`${i18n}.stat3Value`), labelKey: `${i18n}.stat3Label`, bold: false },
  { icon: `${CHINE}/stats/stat-4.svg`, value: t(`${i18n}.stat4Value`), labelKey: `${i18n}.stat4Label`, bold: false },
])

const formats = [
  { src: `${LANGUES}/feat-1.svg`, w: 36, h: 36, line1Key: `${i18n}.format1a`, line2Key: `${i18n}.format1b` },
  { src: `${LANGUES}/feat-2.svg`, w: 36, h: 36, line1Key: `${i18n}.format2a`, line2Key: `${i18n}.format2b` },
  { src: `${LANGUES}/feat-3.svg`, w: 36, h: 36, line1Key: `${i18n}.format3a`, line2Key: `${i18n}.format3b` },
  { src: `${LANGUES}/feat-4.svg`, w: 36, h: 36, line1Key: `${i18n}.format4a`, line2Key: `${i18n}.format4b` },
  { src: `${LANGUES}/path-1.svg`, w: 36, h: 36, line1Key: `${i18n}.format5a`, line2Key: `${i18n}.format5b` },
  { src: `${LANGUES}/path-2.svg`, w: 36, h: 36, line1Key: `${i18n}.format6a`, line2Key: `${i18n}.format6b` },
] as const
</script>

<template>
  <div class="flex w-full flex-col items-center bg-white pb-30 text-[#1a1d2b]">
    <section class="relative mb-[-36px] h-[503px] w-full overflow-hidden bg-white">
      <img
        :src="`${LANGUES}/hero.png`"
        alt=""
        width="1728"
        height="503"
        class="pointer-events-none absolute inset-0 block size-full object-cover object-top"
      >

      <div class="desktop-boxed desktop-split relative h-full items-center justify-between">
        <div class="flex min-w-0 max-w-672 flex-1 flex-col items-start justify-center pr-64">
          <div class="flex w-full max-w-504 flex-col gap-12">
            <h1 class="m-0 text-[49px] leading-[54.6px] font-semibold tracking-[-1.4px]">
              <span class="text-[#1a1a1a]">{{ $t(`${i18n}.titleBefore`) }}</span>
              {{ ' ' }}
              <span class="text-[#ff1b40]">{{ $t(`${i18n}.titleAccent`) }}</span>
            </h1>

            <div class="flex w-full flex-col items-start gap-19">
              <p class="m-0 w-full max-w-504 text-[18px] leading-26 font-medium tracking-[-0.32px] whitespace-pre-line text-black">
                {{ $t(`${i18n}.subtitle`) }}
              </p>
              <a
                href="#formules"
                class="inline-flex items-center gap-12 rounded-[12px] bg-[#ff1b40] px-28 py-16 text-[16px] leading-20 font-semibold tracking-[-0.154px] text-white no-underline"
                @click="scrollToFormulas"
              >
                {{ $t(`${i18n}.ctaExplore`) }}
                <span class="size-20 shrink-0 overflow-clip">
                  <img :src="`${CHINE}/arrow-right.svg`" alt="" width="20" height="20" class="block size-full">
                </span>
              </a>
            </div>
          </div>
        </div>

        <aside class="desktop-rail flex flex-col items-center gap-8 rounded-[9px] border border-[#d1d5db] bg-white px-16 pt-21 pb-16 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <h2 class="m-0 w-full text-center text-[20px] leading-28 font-semibold tracking-[-0.46px] text-[#040c3d]">
            {{ $t(`${i18n}.tracksTitle`) }}
          </h2>

          <div class="grid w-full grid-cols-2 gap-16 pt-16">
            <NuxtLink
              v-for="track in tracks"
              :key="track.id"
              :to="objectifsHref"
              class="flex h-66 items-center justify-between self-start rounded-[8px] border border-[#d1d5db] bg-white p-13 text-[#040c3d] no-underline"
            >
              <span class="flex min-w-0 items-center gap-12">
                <span
                  class="flex size-40 shrink-0 items-center justify-center overflow-clip rounded-full"
                  :class="track.iconBg"
                >
                  <span class="size-20 overflow-clip">
                    <img :src="track.icon" alt="" width="20" height="20" class="block size-full object-contain">
                  </span>
                </span>
                <span
                  class="text-[14px] font-semibold tracking-[-0.154px] text-[#040c3d]"
                  :class="track.twoLine ? 'leading-21 whitespace-pre' : 'leading-21 whitespace-nowrap'"
                >{{ $t(track.labelKey) }}</span>
              </span>
              <span class="flex h-16 w-20 shrink-0 items-center justify-center pr-4">
                <span class="relative size-16 overflow-clip">
                  <img
                    :src="`${CHINE}/domain/chevron.svg`"
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

    <div class="desktop-boxed desktop-split relative z-10 w-full">
      <div class="flex min-w-0 flex-1 flex-col gap-25">
        <div class="flex w-full items-center justify-center gap-15 rounded-[9px] border border-[#d1d5db] bg-white px-21 py-18 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <template v-for="(stat, index) in stats" :key="stat.labelKey">
            <div
              v-if="index > 0"
              class="h-64 w-px shrink-0 bg-[#d1d5db]"
              aria-hidden="true"
            />
            <div class="flex min-w-0 flex-1 items-start justify-center gap-10">
              <span class="size-45 shrink-0 overflow-clip">
                <img :src="stat.icon" alt="" width="45" height="45" class="block size-full">
              </span>
              <div class="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
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

        <section id="formules" class="flex w-full scroll-mt-92 flex-col gap-20">
          <h2 class="m-0 text-[20px] leading-28 font-semibold tracking-[-0.46px] text-[#040c3d]">
            {{ $t(`${i18n}.whyTitle`) }}
          </h2>

          <QAlert
            v-if="checkoutErrorKey"
            tone="danger"
            :title="$t('auth.error.title')"
            :message="$t(checkoutErrorKey)"
          />

          <div v-if="isInitialLoading" class="flex gap-12">
            <QSkeleton v-for="i in 4" :key="i" variant="rect" :height="405" class="min-w-px flex-1" />
          </div>
          <div
            v-else-if="formulaCards.length > 0"
            class="flex items-stretch justify-center gap-12"
          >
            <article
              v-for="card in formulaCards"
              :key="card.tier.id"
              class="relative flex min-w-px flex-1 flex-col justify-between rounded-[10px] border bg-white p-16 transition-[box-shadow] duration-200"
              :class="[card.visual.border, highlightFormulas && 'q-formula-flash shadow-[0_0_0_3px_#ed1c24]']"
            >
              <span
                v-if="card.visual.popular"
                class="absolute top-[-1px] right-[-1px] inline-flex items-center rounded-tr-[10px] rounded-bl-[10px] bg-[#e5002b] px-10 py-4"
              >
                <img
                  :src="`${FORMULES}/badge-star.svg`"
                  alt=""
                  width="9"
                  height="8"
                  class="block h-[8.433px] w-[8.739px] shrink-0"
                >
                <span class="pl-4 text-[9px] leading-[13.5px] font-black text-white">
                  {{ $t('desktop.langues.formulaPopular') }}
                </span>
              </span>
              <div class="flex w-full flex-col gap-12">
                <div class="flex items-start gap-10">
                  <img
                    :src="`${FORMULES}/${card.visual.icon}`"
                    alt=""
                    width="36"
                    height="36"
                    class="block size-36 shrink-0"
                  >
                  <div class="flex min-w-px flex-1 flex-col gap-2">
                    <h3 class="m-0 text-[14px] leading-20 font-black text-[#1b254b]">{{ card.tier.name }}</h3>
                    <p class="m-0 whitespace-pre-line text-[10px] leading-[15px] font-medium text-black">{{ card.tagline }}</p>
                  </div>
                </div>
                <ul
                  class="m-0 flex list-none flex-col gap-8 p-0"
                  :class="card.visual.listBorder ? 'border-t border-[#f8fafc] pt-12' : 'pt-10'"
                >
                  <li
                    v-for="feature in card.features"
                    :key="feature"
                    class="flex items-start"
                  >
                    <img
                      :src="`${FORMULES}/${card.visual.check}`"
                      alt=""
                      width="14"
                      height="14"
                      class="mt-1 block size-14 shrink-0"
                    >
                    <span class="pl-6 text-[11px] leading-15 text-black">{{ feature }}</span>
                  </li>
                </ul>
              </div>
              <div class="flex w-full flex-col gap-12 pt-16">
                <p class="m-0 text-center text-[20px] leading-28 font-semibold whitespace-nowrap text-[#1b254b]">
                  {{ n(card.tier.price.amount, 'currency') }}
                </p>
                <button
                  v-if="offer"
                  type="button"
                  :disabled="checkoutPending === card.tier.id || (checkoutPending !== null && checkoutPending !== card.tier.id)"
                  class="flex w-full cursor-pointer items-center justify-center rounded-[10px] text-center text-[12px] leading-16 tracking-[0.3px] disabled:cursor-not-allowed disabled:opacity-60"
                  :class="card.visual.button"
                  @click="startCheckout(offer, card.tier)"
                >
                  <QSpinner v-if="checkoutPending === card.tier.id" size="sm" />
                  <span v-else>{{ $t('offer.choose') }}</span>
                </button>
              </div>
            </article>
          </div>
          <QEmptyState
            v-else-if="!apiError"
            icon="ic-formule-kili"
            :title="$t('offer.emptyTitle')"
            :description="$t('offer.emptyDescription')"
          />
          <QAlert
            v-else
            tone="danger"
            :title="$t('state.error.title')"
            :message="apiError.kind === 'network' || apiError.kind === 'timeout'
              ? $t('state.error.network')
              : $t('state.error.server')"
          >
            <template #actions>
              <button
                type="button"
                class="cursor-pointer border-0 bg-transparent p-0 text-inherit underline"
                @click="refresh()"
              >
                {{ $t('state.error.retry') }}
              </button>
            </template>
          </QAlert>
        </section>

        <div
          class="flex min-h-108 min-w-0 w-full items-center rounded-[9px] border border-[#d1d5db] bg-white px-21 py-18"
          :aria-label="$t('trust.label')"
        >
          <div class="flex min-w-0 w-full items-center">
            <template v-for="(item, index) in reassurance" :key="item.labelKey">
              <div
                v-if="index > 0"
                class="h-49 w-px shrink-0 bg-[#d1d5db]"
                aria-hidden="true"
              />
              <div class="flex min-w-0 flex-1 items-center justify-center gap-12">
                <span
                  class="flex size-40 shrink-0 items-center justify-center"
                  :class="item.circled ? 'rounded-full bg-[#def5e3]' : ''"
                >
                  <QIcon :name="item.icon" :size="item.circled ? 24 : 40" />
                </span>
                <p class="m-0 text-[14px] leading-[18px] font-semibold text-[#040c3d]">
                  {{ $t(item.labelKey) }}
                </p>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div class="desktop-rail flex flex-col gap-25">
        <aside class="flex flex-col gap-32 rounded-[9px] border border-[#d1d5db] bg-white px-16 pt-21 pb-16 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <h2 class="m-0 text-center text-[20px] leading-[25.5px] font-semibold tracking-[-0.442px] text-[#040c3d]">
            {{ $t(`${i18n}.formatsTitle`) }}
          </h2>
          <div class="grid grid-cols-3 gap-12">
            <div
              v-for="(format, index) in formats"
              :key="index"
              class="flex h-95 flex-col items-center justify-center gap-5 rounded-[12px] border border-[#d1d5db] bg-white p-5"
            >
              <span
                class="relative shrink-0 overflow-hidden"
                :style="{ width: `${format.w}px`, height: `${format.h}px` }"
              >
                <img
                  :src="format.src"
                  alt=""
                  :width="format.w"
                  :height="format.h"
                  class="block size-full object-contain"
                >
              </span>
              <p class="m-0 text-center text-[8px] leading-10 font-semibold whitespace-pre-line text-[#1f2937]">
                {{ $t(format.line1Key) }}<template v-if="$t(format.line2Key).trim()"><br>{{ $t(format.line2Key) }}</template>
              </p>
            </div>
          </div>
        </aside>

        <div class="relative flex min-h-108 items-center justify-between overflow-hidden rounded-[9px] bg-[#192339] px-16 py-18 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]">
          <div
            class="pointer-events-none absolute top-0 right-0 size-160 rounded-full bg-white/5 blur-[20px]"
            aria-hidden="true"
          />
          <div class="flex min-w-0 flex-1 items-center gap-10">
            <span class="size-40 shrink-0 overflow-clip">
              <img :src="`${CHINE}/cta-icon.png`" alt="" width="40" height="40" class="block size-full">
            </span>
            <div class="flex min-w-0 flex-col gap-4">
              <p class="m-0 text-[14px] leading-18 font-normal tracking-[-0.24px] text-white">
                {{ $t(`${i18n}.ctaTitle`) }}
              </p>
              <p class="m-0 text-[13px] leading-16 font-normal tracking-[-0.078px] text-[#9ca3af]">
                {{ $t(`${i18n}.ctaDesc`) }}
              </p>
            </div>
          </div>
          <NuxtLink
            :to="objectifsHref"
            class="inline-flex shrink-0 items-center gap-8 rounded-[12px] bg-[#ff1b40] px-16 py-10 text-[14px] leading-20 font-semibold tracking-[-0.154px] text-white no-underline"
          >
            {{ $t(`${i18n}.ctaButton`) }}
            <span class="size-16 shrink-0 overflow-clip">
              <img :src="`${CHINE}/cta-pin.svg`" alt="" width="16" height="16" class="block size-full">
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
