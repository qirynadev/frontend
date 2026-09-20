<script setup lang="ts">
/**
 * Landing langues desktop ← Figma `1003:1436`, artboard 1728.
 * Titre / badge / description et formules ← Figma `601:1634` (Choix de la formule).
 */
import type { CourseSummary, OfferTier } from '~/core/contracts'
import { offerPageRepo } from '~/core/repositories'
import {
  DESKTOP_LANGUES_ASSET,
  DESKTOP_LANGUES_FORMULES_ASSET,
  desktopLangueDefaultLevels,
  desktopLangueFeatures,
  desktopLangueFormulaVisual,
  desktopLanguePath,
  ofLanguage,
} from '~/config/desktop-langues'
import { orderByMaquette } from '~/config/language-badges'

const props = defineProps<{
  courses: CourseSummary[]
}>()

const route = useRoute()
const { t, n, locale } = useI18n()
const ASSET = DESKTOP_LANGUES_ASSET
const FORMULES = DESKTOP_LANGUES_FORMULES_ASSET

const ordered = computed(() => orderByMaquette(props.courses))

const selectedSlug = computed(() => {
  const fromQuery = String(route.query.langue ?? '')
  if (fromQuery && ordered.value.some(course => course.slug === fromQuery)) return fromQuery
  return ordered.value[0]?.slug ?? ''
})

const selectedCourse = computed(() => ordered.value.find(course => course.slug === selectedSlug.value) ?? ordered.value[0] ?? null)

const levels = desktopLangueDefaultLevels.map(level => ({
  id: level.id,
  nameKey: level.nameKey,
  descKey: level.descKey,
  visual: level.visual,
}))

const selectedLevel = ref<(typeof levels)[number]['id']>('beginner')

const selectedLevelMeta = computed(() => levels.find(level => level.id === selectedLevel.value) ?? levels[0]!)

const languageName = computed(() => selectedCourse.value?.name ?? '')

const heroDescKey = computed(() => {
  if (selectedLevel.value === 'intermediate') return 'desktop.langues.heroDescIntermediate'
  if (selectedLevel.value === 'advanced') return 'desktop.langues.heroDescAdvanced'
  return 'desktop.langues.heroDescBeginner'
})

const { data: offer, apiError, isInitialLoading, refresh } = await usePageData(
  'langues-offer-desktop',
  () => selectedSlug.value
    ? offerPageRepo.bySlug(selectedSlug.value, locale.value)
    : Promise.resolve(null),
  { watch: [selectedSlug, locale] },
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

function scrollToFormulas(event?: Event) {
  event?.preventDefault()
  if (!import.meta.client) return
  const target = document.getElementById('formules')
  if (!target) return
  const nav = document.querySelector('#q-shell-desktop .sticky') as HTMLElement | null
  const offset = nav?.getBoundingClientRect().height ?? 80
  window.scrollTo({
    top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset - 12),
    behavior: 'smooth',
  })
}
</script>

<template>
  <div class="desktop-boxed bg-[#fefefe]">
    <div class="mx-auto flex w-1400 flex-col items-start py-11 pb-32">
      <div class="flex w-full items-start gap-24">
        <div class="flex h-610 w-939 shrink-0 items-center gap-20 overflow-clip rounded-[10px] bg-white">
          <div class="flex h-610 w-505 shrink-0 flex-col pt-70">
            <div class="flex w-full flex-col gap-13">
              <div class="pb-24">
                <span class="inline-flex h-36 w-[330.375px] items-center gap-8 rounded-[8px] bg-[#f6f6fe] px-16 py-8 text-[13px] leading-[19.5px] font-medium text-[#1a1d2b]">
                  <img :src="`${ASSET}/badge.svg`" alt="" width="16" height="16" class="block size-16 shrink-0" loading="lazy" decoding="async">
                  {{ $t('desktop.langues.badge') }}
                </span>
              </div>
              <h1 class="m-0 text-[30px] leading-[37.5px] font-semibold text-black"><span>{{ $t('desktop.langues.heroTitle', { language: languageName }) }}</span><span class="text-[#fd1d36]">{{ t(selectedLevelMeta.nameKey) }}</span></h1>
              <p class="m-0 w-full whitespace-pre-line pb-16 pr-16 text-[12px] leading-[19.5px] text-black">
                {{ $t(heroDescKey, {
                  ofLanguage: ofLanguage(languageName, locale),
                  language: languageName.toLowerCase(),
                }) }}
              </p>
            </div>
            <div class="grid h-[131.5px] w-full grid-cols-4 gap-x-25">
              <div
                v-for="feat in desktopLangueFeatures"
                :key="feat.titleKey"
                class="flex h-[131.5px] flex-col items-center"
              >
                <img :src="`${ASSET}/${feat.icon}`" alt="" width="48" height="48" class="block size-48 shrink-0" loading="lazy" decoding="async">
                <p class="m-0 w-full pt-12 text-center text-[10px] leading-[15px] font-bold text-[#1a1d2b]">
                  {{ $t(feat.titleKey) }}
                </p>
                <p
                  class="m-0 pt-4 text-center text-[10px] leading-[12.5px] text-[#9ca3af]"
                  :class="feat.icon === 'feat-4.svg' ? 'w-94' : 'w-full'"
                >
                  {{ $t(feat.descKey) }}
                </p>
              </div>
            </div>
          </div>
          <div class="relative h-610 w-414 shrink-0 overflow-hidden">
            <img
              :src="`${ASSET}/hero.png`"
              alt=""
              width="414"
              height="610"
              class="block h-610 w-414 object-cover"
              loading="lazy"
              decoding="async"
            >
          </div>
        </div>

        <aside class="flex h-[621px] w-437 shrink-0 flex-col gap-20">
          <div class="flex w-full flex-col gap-16 rounded-[10px] border border-[#f4f5f7] bg-white p-25">
            <div>
              <h2 class="m-0 text-[28px] leading-35 font-semibold text-[#1a1d2b]">
                {{ $t('desktop.langues.levelTitle1') }}
                <span class="block text-[#ed1c24]">{{ $t('desktop.langues.levelTitle2') }}</span>
              </h2>
              <p class="m-0 w-358 pt-8 text-[14px] leading-21 text-[#090909]">
                {{ $t('desktop.langues.levelSubtitle') }}
              </p>
            </div>
            <div class="flex w-full flex-col gap-12" role="radiogroup" :aria-label="$t('desktop.langues.levelTitle2')">
              <button
                v-for="level in levels"
                :key="level.id"
                type="button"
                role="radio"
                :aria-checked="selectedLevel === level.id"
                class="flex w-full cursor-pointer items-center justify-between rounded-[10px] border p-17 text-left"
                :class="selectedLevel === level.id
                  ? 'border-[#e5002b]'
                  : level.visual === 'advanced' ? 'border-[#f1f5f9]' : 'border-[#f2f4f6]'"
                @click="selectedLevel = level.id"
              >
                <span class="flex items-center">
                  <img
                    v-if="level.visual === 'beginner'"
                    :src="`${ASSET}/level-1.svg`"
                    alt=""
                    width="36"
                    height="36"
                    class="block size-36 shrink-0"
                    loading="lazy"
                    decoding="async"
                  >
                  <span
                    v-else
                    class="flex size-36 shrink-0 items-center justify-center rounded-full text-[11px] text-white"
                    :class="level.visual === 'intermediate' ? 'bg-[#fda801]' : 'bg-[#fd1326]'"
                  >
                    <span v-if="level.visual === 'intermediate'" class="leading-24">★★</span>
                    <span v-else class="flex flex-col items-center leading-10">
                      <span>★★</span>
                      <span>★</span>
                    </span>
                  </span>
                  <span class="flex flex-col items-start gap-4 pl-14">
                    <span class="text-[12px] leading-16 font-semibold text-black">{{ t(level.nameKey) }}</span>
                    <span class="text-[10px] leading-[15px] whitespace-pre-line text-black">{{ t(level.descKey) }}</span>
                  </span>
                </span>
                <span
                  class="flex size-20 shrink-0 items-center justify-center rounded-full"
                  :class="selectedLevel === level.id
                    ? 'border-4 border-[#e5002b] bg-white p-4'
                    : 'border border-[#cbd5e1] bg-white'"
                >
                  <span v-if="selectedLevel === level.id" class="size-6 rounded-full bg-[#e5002b]" />
                </span>
              </button>
            </div>
            <a
              href="#formules"
              class="flex h-51 w-358 cursor-pointer items-center justify-center gap-8 rounded-[12px] bg-[#ed1c24] py-14 text-center text-[15px] leading-[22.5px] font-bold text-white no-underline shadow-[0_1px_1px_rgba(239,68,68,0.2)]"
              @click="scrollToFormulas"
            >
              {{ $t('desktop.langues.cta') }}
              <img :src="`${ASSET}/cta-arrow.svg`" alt="" width="16" height="16" class="block size-16 shrink-0" loading="lazy" decoding="async">
            </a>
          </div>

          <div class="flex w-full flex-col">
            <p class="m-0 flex items-center gap-8 text-[13px] leading-[19.5px] font-medium text-[#3e3e3e]">
              <img :src="`${ASSET}/shield.svg`" alt="" width="16" height="16" class="block size-16 shrink-0" loading="lazy" decoding="async">
              {{ $t('desktop.langues.trust') }}
            </p>
            <div class="flex items-center pt-20">
              <div class="flex items-start gap-2 overflow-clip">
                <img
                  v-for="index in 4"
                  :key="index"
                  :src="`${ASSET}/avatar-${index}.jpg`"
                  alt=""
                  width="32"
                  height="32"
                  class="size-32 shrink-0 rounded-full object-cover shadow-[0_0_0_2px_white]"
                  loading="lazy"
                  decoding="async"
                >
              </div>
              <div class="flex items-center pl-16">
                <span class="text-[12px] leading-16 font-extrabold text-black">{{ $t('desktop.langues.rating') }}</span>
                <span class="pl-8 text-[12px] leading-16 text-[#fbbf24]">★★★★★</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <section id="formules" class="w-939 pt-28">
        <div class="relative flex items-start">
          <h2 class="m-0 text-[16px] leading-28 font-semibold whitespace-nowrap text-[#1b254b]">
            {{ $t('desktop.langues.formulasHeading') }}
          </h2>
          <img
            :src="`${FORMULES}/formula-arrow.png`"
            alt=""
            width="86"
            height="62"
            class="pointer-events-none absolute top-0 left-[285px] h-62 w-86 object-contain"
            loading="lazy"
            decoding="async"
          >
        </div>

        <QAlert
          v-if="checkoutErrorKey"
          class="mt-16"
          tone="danger"
          :title="$t('auth.error.title')"
          :message="$t(checkoutErrorKey)"
        />

        <div v-if="isInitialLoading" class="flex gap-16 pt-56">
          <QSkeleton v-for="i in 3" :key="i" variant="rect" :height="405" class="min-w-px flex-1" />
        </div>
        <div
          v-else-if="formulaCards.length > 0"
          class="flex items-stretch justify-center gap-16 pt-56"
        >
          <article
            v-for="card in formulaCards"
            :key="card.tier.id"
            class="relative flex min-w-px flex-1 flex-col justify-between rounded-[10px] border bg-white p-25"
            :class="card.visual.border"
          >
            <span
              v-if="card.visual.popular"
              class="absolute top-[-1px] right-[-1px] inline-flex items-center rounded-tr-[10px] rounded-bl-[10px] bg-[#e5002b] px-12 py-4"
            >
              <img
                :src="`${FORMULES}/badge-star.svg`"
                alt=""
                width="9"
                height="8"
                class="block h-[8.433px] w-[8.739px] shrink-0"
                loading="lazy"
                decoding="async"
              >
              <span class="pl-4 text-[9px] leading-[13.5px] font-black text-white">
                {{ $t('desktop.langues.formulaPopular') }}
              </span>
            </span>
            <div class="flex w-full flex-col gap-16">
              <div class="flex items-start gap-16">
                <img
                  :src="`${FORMULES}/${card.visual.icon}`"
                  alt=""
                  width="48"
                  height="48"
                  class="block size-48 shrink-0"
                  loading="lazy"
                  decoding="async"
                >
                <div class="flex min-w-px flex-1 flex-col gap-2">
                  <h3 class="m-0 text-[16px] leading-24 font-black text-[#1b254b]">{{ card.tier.name }}</h3>
                  <p class="m-0 whitespace-pre-line text-[10px] leading-[15px] font-medium text-black">{{ card.tagline }}</p>
                </div>
              </div>
              <ul
                class="m-0 flex list-none flex-col gap-10 p-0"
                :class="card.visual.listBorder ? 'border-t border-[#f8fafc] pt-17' : 'pt-16'"
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
                    loading="lazy"
                    decoding="async"
                  >
                  <span class="pl-8 text-[12px] leading-16 text-black">{{ feature }}</span>
                </li>
              </ul>
            </div>
            <div class="flex w-full flex-col gap-16 pt-22">
              <div class="flex flex-col items-center pt-16">
                <p class="m-0 text-center text-[24px] leading-32 font-semibold whitespace-nowrap text-[#1b254b]">
                  {{ n(card.tier.price.amount, 'currency') }}
                </p>
              </div>
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
          class="mt-56"
          icon="ic-formule-kili"
          :title="$t('offer.emptyTitle')"
          :description="$t('offer.emptyDescription')"
        />
        <QAlert
          v-else
          class="mt-56"
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

      <div class="w-full pt-24">
        <div class="flex w-full flex-col rounded-[16px] border border-[#f0f2f6] bg-white px-32 py-24">
          <h2 class="m-0 text-[17px] leading-[27px] font-bold text-[#1a1d2b]">
            {{ $t('desktop.langues.pathTitle') }}
          </h2>
          <div class="flex w-full items-center gap-16 pt-24">
            <template v-for="(step, index) in desktopLanguePath" :key="step.titleKey">
              <div class="flex min-w-0 flex-1 items-center gap-16">
                <span class="flex size-48 shrink-0 items-center justify-center rounded-full" :class="step.bg">
                  <img :src="`${ASSET}/${step.icon}`" alt="" width="20" height="20" class="block size-20" loading="lazy" decoding="async">
                </span>
                <div class="flex w-[214.5px] min-w-0 flex-col">
                  <p class="m-0 text-[13px] leading-[19.5px] font-semibold text-[#1a1d2b]">{{ $t(step.titleKey) }}</p>
                  <p class="m-0 w-207 pt-2 pr-8 text-[11px] leading-[13.75px] text-[#6b7280]">{{ $t(step.descKey) }}</p>
                </div>
              </div>
              <span
                v-if="index < desktopLanguePath.length - 1"
                class="relative size-[11.667px] shrink-0"
              >
                <img
                  :src="`${ASSET}/chevron.svg`"
                  alt=""
                  width="13"
                  height="13"
                  class="absolute -inset-[7.14%] max-w-none"
                  loading="lazy"
                  decoding="async"
                >
              </span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
