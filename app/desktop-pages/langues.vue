<script setup lang="ts">
/**
 * Landing langues desktop ← Figma `1003:1436`, artboard 1728.
 * Formules ← Figma `601:1634` (Choix de la formule).
 *
 * Niveau choisi → paliers affichés : les trois boutons de niveau restaient
 * décoratifs, les trois mêmes formules et prix s'affichaient quel que soit le
 * niveau. Filtrage et objectif par niveau repris de mobile
 * (`visibleTiers`/`goalFor`, `app/pages/offres/[slug].vue`).
 *
 * Textes, icônes et photo réglables par langue dans le back-office depuis le
 * 2026-10-14 (`course.page`, lu par `pageText()`…) ; ce qui n'y est pas saisi
 * garde les traductions et les visuels de la maquette.
 */
import type { CourseSummary, LanguageLevelKey, OfferTier } from '~/core/contracts'
import { offerPageRepo } from '~/core/repositories'
import {
  DESKTOP_LANGUES_ASSET,
  DESKTOP_LANGUES_FORMULES_ASSET,
  desktopLangueDefaultLevels,
  desktopLangueFeatures,
  desktopLangueFormulaVisual,
  desktopLanguePath,
  deLanguage,
  leLanguage,
} from '~/config/desktop-langues'
import { isLanguageLevel } from '~/config/language-levels'
import { orderByMaquette } from '~/config/language-badges'
import { emphasisSegments } from '~/utils/emphasis'
import { pageIcon, pageListText, pageText } from '~/utils/page-content'

const props = defineProps<{
  courses: CourseSummary[]
}>()

const route = useRoute()
const router = useRouter()
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

const levels = computed(() => desktopLangueDefaultLevels.map((level, index) => ({
  id: level.id,
  visual: level.visual,
  name: pageListText(page.value, 'levels', index, 'title') ?? t(level.nameKey),
  desc: pageListText(page.value, 'levels', index, 'text') ?? t(level.descKey),
})))

/**
 * Niveau choisi — vit dans l'URL (`?niveau=`), comme sur mobile
 * (`/offres/[slug]`) : `useCheckout.toIntent()` le lit à cet endroit pour
 * l'envoyer à la commande, et un lien partagé rouvre sur le bon niveau.
 * Les trois boutons restent toujours affichés (maquette desktop), même si
 * aucun palier n'est décliné pour l'un d'eux.
 */
const selectedLevel = computed<LanguageLevelKey>({
  get: () => {
    const requested = route.query.niveau
    return isLanguageLevel(requested) ? requested : 'beginner'
  },
  set: (value) => {
    router.replace({ query: { ...route.query, niveau: value } })
  },
})

const selectedLevelMeta = computed(() => levels.value.find(level => level.id === selectedLevel.value) ?? levels.value[0]!)

const languageName = computed(() => selectedCourse.value?.name ?? '')

/** Contenu de la page réglé pour la langue choisie (vide = défauts du site). */
const page = computed(() => selectedCourse.value?.page ?? null)
const texte = (key: string) => pageText(page.value, key)

const titre = computed(() => {
  const saisi = texte('heading')
  return saisi ? emphasisSegments(saisi) : null
})
const titreNiveau = computed(() => {
  const saisi = texte('level_title')
  return saisi ? emphasisSegments(saisi) : null
})

const atouts = computed(() => desktopLangueFeatures.map((feat, index) => ({
  ...feat,
  image: pageIcon(page.value, 'features', index),
  titre: pageListText(page.value, 'features', index, 'title') ?? t(feat.titleKey),
  // Le texte sous chaque atout (`text` du back-office) n'est plus affiché
  // depuis la maquette du 17/10 : seul le titre reste.
})))

const etapes = computed(() => desktopLanguePath.map((step, index) => ({
  ...step,
  image: pageIcon(page.value, 'path', index),
  titre: pageListText(page.value, 'path', index, 'title') ?? t(step.titleKey),
  texte: pageListText(page.value, 'path', index, 'text') ?? t(step.descKey),
})))

const { data: offer, apiError, isInitialLoading, refresh } = await usePageData(
  'langues-offer-desktop',
  () => selectedSlug.value
    ? offerPageRepo.bySlug(selectedSlug.value, locale.value)
    : Promise.resolve(null),
  { watch: [selectedSlug, locale] },
)

const { pending: checkoutPending, errorKey: checkoutErrorKey, start: startCheckout } = useCheckout()

const highlightFormulas = ref(false)
let highlightTimer: ReturnType<typeof setTimeout> | null = null

onBeforeUnmount(() => {
  if (highlightTimer) clearTimeout(highlightTimer)
})

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

/**
 * Paliers proposés au niveau choisi — un palier sans déclinaison
 * (`levels: []`) reste affiché à tous les niveaux, même logique que mobile
 * (`visibleTiers`, `app/pages/offres/[slug].vue`).
 */
const visibleTiers = computed(() =>
  (offer.value?.tiers ?? []).filter(tier =>
    tier.levels.length === 0 || tier.levels.some(entry => entry.key === selectedLevel.value),
  ),
)

const formulaCards = computed(() => {
  const reversed = [...visibleTiers.value].reverse()
  return reversed.map((tier, index) => {
    const visual = desktopLangueFormulaVisual(tier.name, index)
    const goal = tier.levels.find(entry => entry.key === selectedLevel.value)?.goal
    return {
      tier,
      visual,
      tagline: goal || tier.tagline || t(taglineKey(visual.key)),
      features: formulaFeatures(tier, visual.key),
    }
  })
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
</script>

<template>
  <div class="desktop-boxed bg-[#fefefe]">
    <div class="mx-auto flex w-1400 flex-col items-start py-11 pb-32">
      <div class="flex w-full items-start gap-24">
        <div class="flex w-939 shrink-0 flex-col">
          <div class="flex h-427 w-939 shrink-0 items-start gap-20 overflow-clip rounded-[10px] bg-white">
          <div class="flex h-427 w-505 shrink-0 flex-col pt-52">
            <div class="flex w-full flex-col gap-20">
              <span class="inline-flex h-36 w-fit items-center gap-8 rounded-[8px] bg-[#f6f6fe] px-16 py-8 text-[13px] leading-[19.5px] font-medium text-[#1a1d2b]">
                <img :src="`${ASSET}/badge.svg`" alt="" width="16" height="16" class="block size-16 shrink-0" loading="lazy" decoding="async">
                {{ texte('badge') ?? $t('desktop.langues.badge') }}
              </span>
              <h1 v-if="titre" class="m-0 text-[46px] leading-[54px] font-semibold tracking-[-1.2px] whitespace-pre-line text-black">
                <span
                  v-for="(segment, index) in titre"
                  :key="index"
                  :class="segment.emphasis ? 'text-[#fd1d36]' : ''"
                >{{ segment.text }}</span>
              </h1>
              <h1 v-else class="m-0 text-[46px] leading-[54px] font-semibold tracking-[-1.2px] text-black">
                {{ $t('desktop.langues.landingTitle', { leLanguage: leLanguage(languageName, locale) }) }}
                <span class="block text-[#fd1d36]">{{ $t('desktop.langues.landingAccent') }}</span>
              </h1>
              <p class="m-0 w-full pr-8 text-[18px] leading-[28px] whitespace-pre-line text-black">
                {{ texte('description') ?? $t('desktop.langues.landingDesc', { ofLanguage: deLanguage(languageName, locale) }) }}
              </p>
            </div>
            <div class="grid w-full grid-cols-4 gap-x-25 pt-32">
              <div
                v-for="feat in atouts"
                :key="feat.titleKey"
                class="flex flex-col items-center"
              >
                <img :src="feat.image ?? `${ASSET}/${feat.icon}`" alt="" width="48" height="48" class="block size-48 shrink-0" loading="lazy" decoding="async">
                <p class="m-0 w-full pt-12 text-center text-[10px] leading-[15px] font-bold text-[#1a1d2b]">
                  {{ feat.titre }}
                </p>
              </div>
            </div>
          </div>
          <div class="relative h-427 w-414 shrink-0 overflow-hidden">
            <img
              :src="page?.heroImage ?? `${ASSET}/hero.png`"
              alt=""
              width="414"
              height="427"
              class="block h-427 w-414 object-cover object-top"
              loading="lazy"
              decoding="async"
            >
          </div>
        </div>

        <section id="formules" class="w-full scroll-mt-92 pt-36">
          <div class="relative flex items-start">
            <h2 class="m-0 text-[16px] leading-28 font-semibold whitespace-nowrap text-[#1b254b]">
              {{ texte('formulas_title') ?? $t('desktop.langues.formulasHeading') }}
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

          <div v-if="isInitialLoading" class="flex gap-16 pt-40">
            <QSkeleton v-for="i in 3" :key="i" variant="rect" :height="405" class="min-w-px flex-1" />
          </div>
          <div
            v-else-if="formulaCards.length > 0"
            class="flex items-stretch justify-center gap-16 pt-40"
          >
            <article
              v-for="card in formulaCards"
              :key="card.tier.id"
              class="relative flex min-w-px flex-1 flex-col justify-between rounded-[10px] border bg-white p-25 transition-[box-shadow] duration-200"
              :class="[card.visual.border, highlightFormulas && 'q-formula-flash shadow-[0_0_0_3px_#ed1c24]']"
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
            class="mt-40"
            icon="ic-formule-kili"
            :title="$t('offer.emptyTitle')"
            :description="$t('offer.emptyDescription')"
          />
          <QAlert
            v-else
            class="mt-40"
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
        </div>

        <aside class="flex h-[621px] w-437 shrink-0 flex-col gap-20">
          <div class="flex w-full flex-col gap-16 rounded-[10px] border border-[#f4f5f7] bg-white p-25">
            <div>
              <h2 v-if="titreNiveau" class="m-0 whitespace-nowrap text-[22px] leading-28 font-semibold text-[#1a1d2b]">
                <span
                  v-for="(segment, index) in titreNiveau"
                  :key="index"
                  :class="segment.emphasis ? 'text-[#ed1c24]' : ''"
                >{{ segment.text }}</span>
              </h2>
              <h2 v-else class="m-0 whitespace-nowrap text-[22px] leading-28 font-semibold text-[#1a1d2b]">
                {{ $t('desktop.langues.levelTitle1') }}
                <span class="text-[#ed1c24]"> {{ $t('desktop.langues.levelTitle2') }}</span>
              </h2>
              <p class="m-0 w-358 pt-8 text-[14px] leading-21 text-[#090909]">
                {{ texte('level_text') ?? $t('desktop.langues.levelSubtitle') }}
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
                    <span class="text-[12px] leading-16 font-semibold text-black">{{ level.name }}</span>
                    <span class="text-[10px] leading-[15px] whitespace-nowrap text-black">{{ level.desc }}</span>
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
              @click.prevent="scrollToFormulas"
            >
              {{ texte('cta_label') ?? $t('desktop.langues.cta') }}
              <img :src="`${ASSET}/cta-arrow.svg`" alt="" width="16" height="16" class="block size-16 shrink-0" loading="lazy" decoding="async">
            </a>
          </div>

          <div class="flex w-full flex-col">
            <p class="m-0 flex items-center gap-8 text-[13px] leading-[19.5px] font-medium text-[#3e3e3e]">
              <img :src="`${ASSET}/shield.svg`" alt="" width="16" height="16" class="block size-16 shrink-0" loading="lazy" decoding="async">
              {{ texte('trust_text') ?? $t('desktop.langues.trust') }}
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
                <span class="text-[12px] leading-16 font-extrabold text-black">{{ texte('rating') ?? $t('desktop.langues.rating') }}</span>
                <span class="pl-8 text-[12px] leading-16 text-[#fbbf24]">★★★★★</span>
              </div>
            </div>
          </div>
        </aside>
      </div>


      <div class="w-full pt-24">
        <div class="flex w-full flex-col rounded-[16px] border border-[#f0f2f6] bg-white px-32 py-24">
          <h2 class="m-0 text-[17px] leading-[27px] font-bold text-[#1a1d2b]">
            {{ texte('path_title') ?? $t('desktop.langues.pathTitle') }}
          </h2>
          <div class="flex w-full items-center gap-16 pt-24">
            <template v-for="(step, index) in etapes" :key="step.titleKey">
              <div class="flex min-w-0 flex-1 items-center gap-16">
                <img v-if="step.image" :src="step.image" alt="" width="48" height="48" class="block size-48 shrink-0" loading="lazy" decoding="async">
                <span v-else class="flex size-48 shrink-0 items-center justify-center rounded-full" :class="step.bg">
                  <img :src="`${ASSET}/${step.icon}`" alt="" width="20" height="20" class="block size-20" loading="lazy" decoding="async">
                </span>
                <div class="flex w-[214.5px] min-w-0 flex-col">
                  <p class="m-0 text-[13px] leading-[19.5px] font-semibold text-[#1a1d2b]">{{ step.titre }}</p>
                  <p class="m-0 w-207 pt-2 pr-8 text-[11px] leading-[13.75px] text-[#6b7280]">{{ step.texte }}</p>
                </div>
              </div>
              <span
                v-if="index < etapes.length - 1"
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

<style scoped>
.q-formula-flash {
  animation: q-formula-flash 1.6s ease-out;
}

@keyframes q-formula-flash {
  0%,
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
  18%,
  38% {
    box-shadow: 0 0 0 3px #ed1c24;
  }
  55%,
  75% {
    box-shadow: 0 0 0 3px #ed1c24;
  }
}
</style>
