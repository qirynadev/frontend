<script setup lang="ts">
/**
 * Parcours logement desktop — boxed 1728, pas d’artboard Figma.
 * Rail types de logement + formules API.
 *
 * Textes, icônes et photo réglables par pays dans le back-office depuis le
 * 2026-10-14 (`living.page`, lu par `pageText()`…) ; ce qui n'y est pas saisi
 * garde les traductions et les visuels de la maquette.
 */
import { livingRepo, offerPageRepo } from '~/core/repositories'
import {
  DESKTOP_LOGEMENT_ASSET,
  DESKTOP_LOGEMENT_ICON,
  desktopLogementFormulaVisual,
  desktopLogementMethod,
  desktopLogementPains,
  desktopLogementTrusts,
  desktopLogementTypes,
} from '~/config/desktop-logement'
import { emphasisSegments } from '~/utils/emphasis'
import { pageIcon, pageListText, pageText } from '~/utils/page-content'

const props = defineProps<{
  initialSlug?: string
}>()

const route = useRoute()
const { t, n, locale } = useI18n()
const HOME = DESKTOP_LOGEMENT_ASSET
const ICON = DESKTOP_LOGEMENT_ICON

const { data: destinations, apiError: destError, isInitialLoading: destLoading, refresh: refreshDest } = await usePageData(
  'logement-destinations-desktop',
  () => livingRepo.list(locale.value),
  { watch: [locale] },
)

const list = computed(() => destinations.value ?? [])

const selectedSlug = ref('')

function resolveSlug(): string {
  const fromProp = props.initialSlug ?? ''
  const fromQuery = String(route.query.pays ?? '')
  const candidates = [fromProp, fromQuery]
  for (const slug of candidates) {
    if (slug && list.value.some(item => item.slug === slug)) return slug
  }
  return list.value[0]?.slug ?? ''
}

watch(list, () => {
  if (!selectedSlug.value || !list.value.some(item => item.slug === selectedSlug.value)) {
    selectedSlug.value = resolveSlug()
  }
}, { immediate: true })

const selected = computed(() => list.value.find(item => item.slug === selectedSlug.value) ?? list.value[0] ?? null)

/** Contenu de la page réglé pour le pays choisi (vide = défauts du site). */
const page = computed(() => selected.value?.page ?? null)
const texte = (key: string) => pageText(page.value, key)
const liste = (key: string, index: number, field?: string) => pageListText(page.value, key, index, field)
const icone = (zone: string, index: number) => pageIcon(page.value, zone, index)

const titre = computed(() => {
  const saisi = texte('heading')
  return saisi ? emphasisSegments(saisi) : null
})

/** Trois chiffres du bandeau ; le premier compte les pays tant qu'il n'est pas saisi. */
const chiffres = computed(() => [
  { bg: 'bg-[#fff7ed]', icon: 'house-choice.svg', value: String(list.value.length || '-'), labelKey: 'desktop.logement.statCountries' },
  { bg: 'bg-[#ecf8ef]', icon: 'house-secure.svg', value: t('desktop.logement.statSecureValue'), labelKey: 'desktop.logement.statSecureLabel' },
  { bg: 'bg-[#fef0e5]', icon: 'house-support.svg', value: t('desktop.logement.statSupportValue'), labelKey: 'desktop.logement.statSupportLabel' },
].map((stat, index) => ({
  ...stat,
  image: icone('stats', index),
  value: liste('stats', index, 'value') ?? stat.value,
  label: liste('stats', index, 'label') ?? t(stat.labelKey),
})))

const difficultes = computed(() => desktopLogementPains.map((pain, index) => ({
  ...pain,
  image: icone('pains', index),
  label: liste('pains', index) ?? t(pain.labelKey),
})))

const methode = computed(() => desktopLogementMethod.map((step, index) => ({
  ...step,
  image: icone('method', index),
  titre: liste('method', index, 'title') ?? t(step.titleKey),
  texte: liste('method', index, 'text') ?? t(step.descKey),
})))

const engagements = computed(() => desktopLogementTrusts.map((item, index) => ({
  ...item,
  image: icone('trust', index),
  titre: liste('trust', index, 'title') ?? t(item.titleKey),
  texte: liste('trust', index, 'text') ?? t(item.descKey),
})))

const typesLogement = computed(() => desktopLogementTypes.map((item, index) => ({
  ...item,
  image: icone('types', index),
  titre: liste('types', index, 'title') ?? t(item.titleKey),
  texte: liste('types', index, 'text') ?? t(item.descKey),
})))

/** Phrase sous le titre des formules ; `{pays}` y est remplacé par le nom du pays. */
const sousTitreFormules = computed(() => {
  if (!selected.value) return t('offer.subtitle')
  const saisi = texte('formulas_text')
  return saisi
    ? saisi.replaceAll('{pays}', selected.value.country.name)
    : t('desktop.logement.formulasFor', { country: selected.value.country.name })
})

const { data: offer, apiError, isInitialLoading, refresh } = await usePageData(
  'logement-offer-desktop',
  () => selectedSlug.value
    ? offerPageRepo.bySlug(selectedSlug.value, locale.value)
    : Promise.resolve(null),
  { watch: [selectedSlug, locale] },
)

const tiers = computed(() => {
  const items = offer.value?.tiers ?? []
  return items
    .map((tier, index) => ({
      tier,
      visual: desktopLogementFormulaVisual(index, items.length),
      tagline: tier.tagline || t(`housing.offers.tagline${Math.min(index + 1, 3)}`),
      badgeKey: `housing.offers.badge${Math.min(index + 1, 3)}` as const,
    }))
    .sort((left, right) => Number(right.visual.popular) - Number(left.visual.popular))
})

const { pending: checkoutPending, errorKey: checkoutErrorKey, start: startCheckout } = useCheckout()

const selectedType = ref<(typeof desktopLogementTypes)[number]['id']>('appart')

/** Type de logement choisi, joint à la commande ; il préremplira le formulaire d'après achat. */
function checkoutOptions(): Record<string, string> {
  const type = desktopLogementTypes.find(item => item.id === selectedType.value)
  return type ? { accommodation_type: type.accommodationType } : {}
}
</script>

<template>
  <div class="desktop-boxed flex w-full flex-col gap-24 pt-20 pb-32 text-[#1a1d2b]">
    <div class="desktop-split gap-32">
      <div class="flex min-w-0 flex-1 flex-col gap-32">
        <section class="flex items-center gap-32">
          <div class="flex min-w-0 flex-1 flex-col">
            <span class="inline-flex w-fit items-center gap-8 rounded-[6px] bg-[#fff1f2] px-12 py-4 text-[11px] leading-[16.5px] font-bold tracking-[0.4px] text-[#ed1c24]">
              <img :src="`${HOME}/badge-housing.svg`" alt="" width="14" height="14" class="block size-14" loading="lazy" decoding="async">
              {{ texte('badge') ?? $t('desktop.home.housing.badge') }}
            </span>
            <h1 v-if="titre" class="m-0 pt-16 text-[36px] leading-[44px] font-semibold whitespace-pre-line">
              <span
                v-for="(segment, index) in titre"
                :key="index"
                :class="segment.emphasis ? 'text-[#ed1c24]' : ''"
              >{{ segment.text }}</span>
            </h1>
            <h1 v-else class="m-0 pt-16 text-[36px] leading-[44px] font-semibold">
              <span>{{ $t('desktop.home.housing.titleBefore') }}</span>
              <span class="text-[#ed1c24]">{{ $t('desktop.home.housing.titleAccent') }}</span>
            </h1>
            <p class="m-0 max-w-520 pt-16 text-[15px] leading-[22.5px] whitespace-pre-line text-[#3e3e3e]">
              {{ texte('description') ?? $t('desktop.home.housing.desc') }}
            </p>
            <div class="flex items-center gap-24 pt-28">
              <div v-for="stat in chiffres" :key="stat.labelKey" class="flex items-center gap-12">
                <img v-if="stat.image" :src="stat.image" alt="" width="40" height="40" class="block size-40 shrink-0" loading="lazy" decoding="async">
                <span v-else class="flex size-40 items-center justify-center rounded-full" :class="stat.bg">
                  <img :src="`${HOME}/${stat.icon}`" alt="" width="20" height="20" class="block size-20" loading="lazy" decoding="async">
                </span>
                <div>
                  <p class="m-0 text-[14px] leading-[17.5px] font-bold">{{ stat.value }}</p>
                  <p class="m-0 text-[12px] leading-[15px] text-[#3e3e3e]">{{ stat.label }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="relative w-420 shrink-0 overflow-hidden rounded-[24px] bg-white">
            <img :src="page?.heroImage ?? `${HOME}/housing-photo.jpg`" alt="" width="1024" height="906" class="block h-auto w-full" loading="lazy" decoding="async">
          </div>
        </section>

        <section>
          <h2 class="m-0 text-[20px] leading-28 font-semibold">{{ texte('pains_title') ?? $t('housing.intro.painsTitle') }}</h2>
          <div class="flex gap-12 pt-16">
            <article
              v-for="pain in difficultes"
              :key="pain.id"
              class="flex min-w-0 flex-1 items-center gap-12 rounded-[12px] border border-[#f3f4f6] bg-white px-16 py-14"
            >
              <img :src="pain.image ?? `${ICON}/${pain.icon}`" alt="" width="40" height="40" class="block size-40 shrink-0" loading="lazy" decoding="async">
              <p class="m-0 text-[13px] leading-[18px] font-medium whitespace-pre-line">{{ pain.label }}</p>
            </article>
          </div>
        </section>

        <section class="rounded-[16px] border border-[#f0f2f6] bg-white px-24 py-24">
          <h2 class="m-0 text-[17px] leading-[27px] font-bold text-[#1a1d2b]">{{ texte('method_title') ?? $t('housing.intro.methodTitle') }}</h2>
          <div class="flex w-full items-center gap-16 pt-24">
            <template v-for="(step, index) in methode" :key="step.id">
              <div class="flex min-w-0 flex-1 items-center gap-16">
                <img v-if="step.image" :src="step.image" alt="" width="48" height="48" class="block size-48 shrink-0" loading="lazy" decoding="async">
                <span v-else class="flex size-48 shrink-0 items-center justify-center rounded-full" :class="step.bg">
                  <span
                    class="size-20 shrink-0"
                    :class="step.iconColor"
                    :style="{
                      maskImage: `url(${ICON}/${step.icon})`,
                      WebkitMaskImage: `url(${ICON}/${step.icon})`,
                      maskSize: 'contain',
                      WebkitMaskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      WebkitMaskRepeat: 'no-repeat',
                      maskPosition: 'center',
                      WebkitMaskPosition: 'center',
                    }"
                  />
                </span>
                <div class="flex min-w-0 flex-col">
                  <p class="m-0 text-[13px] leading-[19.5px] font-semibold text-[#1a1d2b]">{{ step.titre }}</p>
                  <p class="m-0 pt-2 pr-8 text-[11px] leading-[13.75px] whitespace-pre-line text-[#6b7280]">{{ step.texte }}</p>
                </div>
              </div>
              <span
                v-if="index < methode.length - 1"
                class="relative size-[11.667px] shrink-0"
              >
                <img
                  src="/img/desktop/langues/chevron.svg"
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
        </section>

        <section id="formules-logement" class="rounded-[16px] border border-[#f0f2f6] bg-white px-16 pt-15 pb-32">
          <h2 class="m-0 text-center text-[24px] leading-32 font-semibold">
            {{ texte('formulas_title') ?? $t('offer.title') }}
          </h2>
          <p class="m-0 pt-4 text-center text-[15px] leading-[22.5px] text-[#404040]">
            {{ sousTitreFormules }}
          </p>

          <PageState :loading="isInitialLoading || destLoading" :error="apiError || destError" :on-retry="() => { void refresh(); void refreshDest() }">
            <template #loading>
              <div class="flex gap-14 pt-24">
                <QSkeleton v-for="i in 3" :key="i" variant="rect" :height="420" class="min-w-0 flex-1" />
              </div>
            </template>

            <QAlert
              v-if="checkoutErrorKey"
              class="mt-16"
              tone="danger"
              :title="$t('auth.error.title')"
              :message="$t(checkoutErrorKey)"
            />

            <div v-if="tiers.length > 0" class="flex items-stretch gap-14 pt-24">
              <article
                v-for="entry in tiers"
                :key="entry.tier.id"
                class="relative flex min-w-0 flex-1 flex-col rounded-[16px] border bg-white p-24"
                :class="entry.visual.card"
              >
                <span
                  v-if="entry.visual.popular"
                  class="absolute top-[-1px] right-0 inline-flex items-center gap-4 rounded-tr-[16px] rounded-bl-[4px] bg-[#ed1c24] px-12 py-4 text-[11px] leading-[16.5px] font-bold text-white"
                >
                  {{ $t('housing.offers.ribbon') }}
                </span>
                <div class="flex flex-col items-center">
                  <span class="flex size-48 items-center justify-center rounded-full" :class="entry.visual.iconBg">
                    <img :src="`${HOME}/${entry.visual.icon}`" alt="" width="24" height="24" class="block size-24" loading="lazy" decoding="async">
                  </span>
                  <h3 class="m-0 pt-12 text-[20px] leading-28 font-semibold" :class="entry.visual.name">
                    {{ entry.tier.name }}
                  </h3>
                  <p class="m-0 pt-4 text-center text-[12px] leading-18 font-medium text-[#393939]">
                    {{ entry.tagline }}
                  </p>
                  <p class="m-0 pt-8 text-[11px] leading-16 font-semibold text-[#6b7280]">
                    {{ $t(entry.badgeKey) }}
                  </p>
                </div>
                <ul v-if="entry.tier.features.length > 0" class="m-0 flex flex-1 list-none flex-col gap-8 p-0 pt-20">
                  <li v-for="feature in entry.tier.features" :key="feature" class="flex items-start gap-10 text-[13px] leading-[16.25px]">
                    <img :src="entry.visual.check" alt="" width="14" height="14" class="mt-1 block size-14 shrink-0" loading="lazy" decoding="async">
                    <span class="min-w-0">{{ feature }}</span>
                  </li>
                </ul>
                <div class="mt-auto flex flex-col items-center pt-32">
                  <p class="m-0 pb-20 text-[28px] leading-42 font-semibold" :class="entry.visual.price">
                    {{ n(entry.tier.price.amount, 'currency') }}
                  </p>
                  <button
                    v-if="offer"
                    type="button"
                    :disabled="checkoutPending === entry.tier.id || (checkoutPending !== null && checkoutPending !== entry.tier.id)"
                    class="flex w-full cursor-pointer items-center justify-center rounded-[10px] px-16 py-12 text-[14px] leading-21 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                    :class="entry.visual.button"
                    @click="startCheckout(offer, entry.tier, checkoutOptions())"
                  >
                    <QSpinner v-if="checkoutPending === entry.tier.id" size="sm" />
                    <span v-else>{{ $t('offer.choose') }}</span>
                  </button>
                </div>
              </article>
            </div>
            <QEmptyState
              v-else-if="!isInitialLoading && !destLoading"
              class="mt-24"
              icon="ic-log-home"
              :title="$t('offer.emptyTitle')"
              :description="$t('offer.emptyDescription')"
            />
          </PageState>
        </section>

        <div class="flex rounded-[16px] border border-[#f0f2f6] bg-white px-32 py-20 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <div
            v-for="(item, index) in engagements"
            :key="item.titleKey"
            class="flex min-w-0 flex-1 items-center gap-16"
            :class="index > 0 ? 'border-l border-[#f0f2f6] pl-32' : ''"
          >
            <img v-if="item.image" :src="item.image" alt="" width="48" height="48" class="block size-48 shrink-0" loading="lazy" decoding="async">
            <span v-else class="flex size-48 shrink-0 items-center justify-center rounded-full" :class="item.bg">
              <img :src="`${HOME}/${item.icon}`" alt="" width="24" height="24" class="block size-24" loading="lazy" decoding="async">
            </span>
            <div class="min-w-0">
              <p class="m-0 text-[14px] leading-21 font-bold">{{ item.titre }}</p>
              <p class="m-0 text-[13px] leading-[19.5px] text-[#525252]">{{ item.texte }}</p>
            </div>
          </div>
        </div>
      </div>

      <aside class="desktop-rail flex flex-col">
        <div class="rounded-[16px] border border-[#f3f4f6] bg-white p-24">
          <h2 class="m-0 text-[17px] leading-[25.5px] font-bold">{{ texte('types_title') ?? $t('desktop.logement.typeTitle') }}</h2>
          <p class="m-0 pt-4 text-[13px] leading-[19.5px] text-[#202020]">{{ texte('types_text') ?? $t('desktop.logement.typeSubtitle') }}</p>
          <div class="flex flex-col gap-12 pt-24" role="radiogroup" :aria-label="$t('desktop.logement.typeTitle')">
            <button
              v-for="item in typesLogement"
              :key="item.id"
              type="button"
              role="radio"
              :aria-checked="selectedType === item.id"
              class="relative flex w-full cursor-pointer items-center gap-16 rounded-[16px] border bg-white p-12 text-left"
              :class="selectedType === item.id ? 'border-[#fe5358]' : 'border-[#f2f4f8]'"
              @click="selectedType = item.id"
            >
              <img v-if="item.image" :src="item.image" alt="" width="48" height="48" class="block size-48 shrink-0" loading="lazy" decoding="async">
              <span v-else class="flex size-48 shrink-0 items-center justify-center overflow-hidden rounded-full" :class="item.iconBg">
                <img :src="`${HOME}/${item.icon}`" alt="" width="24" height="24" class="block size-24" loading="lazy" decoding="async">
              </span>
              <span class="min-w-0 flex-1 pr-28">
                <span class="block text-[15px] leading-[22.5px] font-semibold">{{ item.titre }}</span>
                <span class="mt-2 block text-[12px] leading-[15px] text-[#6b7280]">{{ item.texte }}</span>
              </span>
              <span
                class="absolute top-1/2 right-16 size-20 -translate-y-1/2 rounded-full border box-border"
                :class="selectedType === item.id ? 'border-[#f60914]' : 'border-[#e5e7eb]'"
                aria-hidden="true"
              >
                <span v-if="selectedType === item.id" class="absolute inset-[4px] rounded-full bg-[#f60914]" />
              </span>
            </button>
          </div>
        </div>

        <div class="mt-24 flex items-start gap-16 rounded-[16px] bg-[#fef2f3] p-24">
          <img v-if="icone('engage', 0)" :src="icone('engage', 0)!" alt="" width="48" height="48" class="block size-48 shrink-0" loading="lazy" decoding="async">
          <span v-else class="flex size-48 shrink-0 items-center justify-center rounded-full bg-[#fee9ea]">
            <img :src="`${ICON}/engage-shield.svg`" alt="" width="20" height="20" class="block size-20" loading="lazy" decoding="async">
          </span>
          <div>
            <p class="m-0 text-[15px] leading-[22.5px] font-bold text-[#252525]">{{ texte('engage_title') ?? $t('housing.intro.engageTitle') }}</p>
            <p class="m-0 pt-4 text-[13px] leading-[21px] whitespace-pre-line">{{ texte('engage_text') ?? $t('housing.intro.engageDesc') }}</p>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
