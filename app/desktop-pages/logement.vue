<script setup lang="ts">
/**
 * Parcours logement desktop — boxed 1728, pas d’artboard Figma.
 * Rail pays (comme le niveau langues / le profil orientation) + formules API.
 */
import { livingRepo, offerPageRepo } from '~/core/repositories'
import {
  DESKTOP_LOGEMENT_ASSET,
  DESKTOP_LOGEMENT_ICON,
  desktopLogementFormulaVisual,
  desktopLogementMethod,
  desktopLogementPains,
  desktopLogementTrusts,
} from '~/config/desktop-logement'

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

function cityLabel(count: number | null): string {
  if (count === null) return t('housing.countLabel', { count: 350 })
  return t('housing.cityCount', count)
}
</script>

<template>
  <div class="desktop-boxed flex w-full flex-col gap-24 pt-20 pb-32 text-[#1a1d2b]">
    <div class="desktop-split gap-32">
      <div class="flex min-w-0 flex-1 flex-col gap-32">
        <section class="flex items-center gap-32">
          <div class="flex min-w-0 flex-1 flex-col">
            <span class="inline-flex w-fit items-center gap-8 rounded-[6px] bg-[#fff1f2] px-12 py-4 text-[11px] leading-[16.5px] font-bold tracking-[0.4px] text-[#ed1c24]">
              <img :src="`${HOME}/badge-housing.svg`" alt="" width="14" height="14" class="block size-14">
              {{ $t('desktop.home.housing.badge') }}
            </span>
            <h1 class="m-0 pt-16 text-[36px] leading-[44px] font-semibold">
              <span>{{ $t('desktop.home.housing.titleBefore') }}</span>
              <span class="text-[#ed1c24]">{{ $t('desktop.home.housing.titleAccent') }}</span>
            </h1>
            <p class="m-0 max-w-520 pt-16 text-[15px] leading-[22.5px] text-[#3e3e3e]">
              {{ $t('desktop.home.housing.desc') }}
            </p>
            <div class="flex items-center gap-24 pt-28">
              <div class="flex items-center gap-12">
                <span class="flex size-40 items-center justify-center rounded-full bg-[#fff7ed]">
                  <img :src="`${HOME}/house-choice.svg`" alt="" width="20" height="20" class="block size-20">
                </span>
                <div>
                  <p class="m-0 text-[14px] leading-[17.5px] font-bold">{{ list.length || '—' }}</p>
                  <p class="m-0 text-[12px] leading-[15px] text-[#3e3e3e]">{{ $t('desktop.logement.statCountries') }}</p>
                </div>
              </div>
              <div class="flex items-center gap-12">
                <span class="flex size-40 items-center justify-center rounded-full bg-[#ecf8ef]">
                  <img :src="`${HOME}/house-secure.svg`" alt="" width="20" height="20" class="block size-20">
                </span>
                <div>
                  <p class="m-0 text-[14px] leading-[17.5px] font-bold">{{ $t('desktop.logement.statSecureValue') }}</p>
                  <p class="m-0 text-[12px] leading-[15px] text-[#3e3e3e]">{{ $t('desktop.logement.statSecureLabel') }}</p>
                </div>
              </div>
              <div class="flex items-center gap-12">
                <span class="flex size-40 items-center justify-center rounded-full bg-[#fef0e5]">
                  <img :src="`${HOME}/house-support.svg`" alt="" width="20" height="20" class="block size-20">
                </span>
                <div>
                  <p class="m-0 text-[14px] leading-[17.5px] font-bold">{{ $t('desktop.logement.statSupportValue') }}</p>
                  <p class="m-0 text-[12px] leading-[15px] text-[#3e3e3e]">{{ $t('desktop.logement.statSupportLabel') }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="relative h-280 w-420 shrink-0 overflow-hidden rounded-[24px] bg-[#fff7f5]">
            <img :src="`${HOME}/housing-photo.png`" alt="" width="420" height="280" class="size-full object-cover">
          </div>
        </section>

        <section>
          <h2 class="m-0 text-[20px] leading-28 font-semibold">{{ $t('housing.intro.painsTitle') }}</h2>
          <div class="flex gap-12 pt-16">
            <article
              v-for="pain in desktopLogementPains"
              :key="pain.id"
              class="flex min-w-0 flex-1 items-center gap-12 rounded-[12px] border border-[#f3f4f6] bg-white px-16 py-14"
            >
              <img :src="`${ICON}/${pain.icon}`" alt="" width="40" height="40" class="block size-40 shrink-0">
              <p class="m-0 text-[13px] leading-[18px] font-medium whitespace-pre-line">{{ $t(pain.labelKey) }}</p>
            </article>
          </div>
        </section>

        <section class="rounded-[16px] border border-[#f0f2f6] bg-white px-24 py-24">
          <h2 class="m-0 text-[20px] leading-28 font-semibold">{{ $t('housing.intro.methodTitle') }}</h2>
          <div class="flex items-start pt-24">
            <template v-for="(step, index) in desktopLogementMethod" :key="step.id">
              <div class="flex min-w-0 flex-1 flex-col items-center text-center">
                <span class="flex size-48 items-center justify-center rounded-full" :class="step.bg">
                  <img :src="`${ICON}/${step.icon}`" alt="" width="24" height="24" class="block size-24">
                </span>
                <p class="m-0 pt-8 text-[16px] leading-20 font-bold" :class="step.numClass">{{ step.num }}</p>
                <p class="m-0 pt-4 text-[12px] leading-16 font-medium text-[#525252]">{{ $t(step.labelKey) }}</p>
              </div>
              <span
                v-if="index < desktopLogementMethod.length - 1"
                class="mt-24 h-px min-w-16 flex-1 border-t border-dashed border-[#e5e7eb]"
              />
            </template>
          </div>
        </section>

        <section id="formules-logement" class="rounded-[16px] border border-[#f0f2f6] bg-white px-16 pt-15 pb-32">
          <h2 class="m-0 text-center text-[24px] leading-32 font-semibold">
            {{ $t('offer.title') }}
          </h2>
          <p class="m-0 pt-4 text-center text-[15px] leading-[22.5px] text-[#404040]">
            {{ selected ? $t('desktop.logement.formulasFor', { country: selected.country.name }) : $t('offer.subtitle') }}
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
                    <img :src="`${HOME}/${entry.visual.icon}`" alt="" width="24" height="24" class="block size-24">
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
                    <img :src="entry.visual.check" alt="" width="14" height="14" class="mt-1 block size-14 shrink-0">
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
                    @click="startCheckout(offer, entry.tier)"
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
            v-for="(item, index) in desktopLogementTrusts"
            :key="item.titleKey"
            class="flex min-w-0 flex-1 items-center gap-16"
            :class="index > 0 ? 'border-l border-[#f0f2f6] pl-32' : ''"
          >
            <span class="flex size-48 shrink-0 items-center justify-center rounded-full" :class="item.bg">
              <img :src="`${HOME}/${item.icon}`" alt="" width="24" height="24" class="block size-24">
            </span>
            <div class="min-w-0">
              <p class="m-0 text-[14px] leading-21 font-bold">{{ $t(item.titleKey) }}</p>
              <p class="m-0 text-[13px] leading-[19.5px] text-[#525252]">{{ $t(item.descKey) }}</p>
            </div>
          </div>
        </div>
      </div>

      <aside class="desktop-rail flex flex-col">
        <div class="rounded-[16px] border border-[#f3f4f6] bg-white p-24">
          <h2 class="m-0 text-[17px] leading-[25.5px] font-bold">{{ $t('housing.title') }}</h2>
          <p class="m-0 pt-4 text-[13px] leading-[19.5px] text-[#202020]">{{ $t('housing.subtitle') }}</p>
          <div class="flex flex-col gap-12 pt-24" role="radiogroup" :aria-label="$t('housing.title')">
            <button
              v-for="destination in list"
              :key="destination.slug"
              type="button"
              role="radio"
              :aria-checked="selectedSlug === destination.slug"
              class="relative flex w-full cursor-pointer items-center gap-16 rounded-[16px] border bg-white p-12 text-left"
              :class="selectedSlug === destination.slug ? 'border-[#fe5358]' : 'border-[#f2f4f8]'"
              @click="selectedSlug = destination.slug"
            >
              <span class="relative size-48 shrink-0 overflow-hidden rounded-full bg-[#f8f8fc]">
                <img
                  v-if="destination.country.flag"
                  :src="destination.country.flag"
                  alt=""
                  width="48"
                  height="48"
                  class="block size-full object-cover"
                >
              </span>
              <span class="min-w-0 flex-1 pr-28">
                <span class="block text-[15px] leading-[22.5px] font-semibold">{{ destination.country.name }}</span>
                <span class="mt-2 block text-[12px] leading-[15px] text-[#6b7280]">{{ cityLabel(destination.cityCount) }}</span>
              </span>
              <span
                class="absolute top-1/2 right-16 size-20 -translate-y-1/2 rounded-full border box-border"
                :class="selectedSlug === destination.slug ? 'border-[#f60914]' : 'border-[#e5e7eb]'"
                aria-hidden="true"
              >
                <span v-if="selectedSlug === destination.slug" class="absolute inset-[4px] rounded-full bg-[#f60914]" />
              </span>
            </button>
          </div>
        </div>

        <div class="mt-24 flex items-start gap-16 rounded-[16px] bg-[#fef2f3] p-24">
          <span class="flex size-48 shrink-0 items-center justify-center rounded-full bg-[#fee9ea]">
            <img :src="`${ICON}/engage-shield.svg`" alt="" width="20" height="20" class="block size-20">
          </span>
          <div>
            <p class="m-0 text-[15px] leading-[22.5px] font-bold text-[#252525]">{{ $t('housing.intro.engageTitle') }}</p>
            <p class="m-0 pt-4 text-[13px] leading-[21px]">{{ $t('housing.intro.engageDesc') }}</p>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
