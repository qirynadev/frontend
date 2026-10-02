<script setup lang="ts">
/**
 * Liste écoles desktop ← Figma `Domaines d'etudes` (54:488), 1728 px.
 *
 * Onglets : le domaine `?domaine=` reste figé à gauche ; les flèches
 * font défiler les autres. Sans paramètre, toute la rangée défile.
 */
import type { AreaOfStudySummary, SchoolSummary } from '~/core/contracts'
import type { ApiError } from '~/core/http/errors'
import { desktopDomainTabIcon } from '~/config/desktop-domaines'

const props = defineProps<{
  areas: AreaOfStudySummary[]
  schools: SchoolSummary[]
  selectedDomain: string
  destinationSlug: string
  loading: boolean
  error?: ApiError | null
  empty: boolean
  page: number
  totalPages: number
  pending?: boolean
  onRetry?: () => void
}>()

const emit = defineEmits<{
  'select-domain': [slug: string]
  'update:page': [page: number]
}>()

const localePath = useLocalePath()

const ASSET = '/img/desktop/domaines'
const tabOffset = ref(0)

const activeArea = computed(() =>
  props.selectedDomain
    ? props.areas.find(area => area.slug === props.selectedDomain) ?? null
    : null,
)

const trackAreas = computed(() =>
  activeArea.value
    ? props.areas.filter(area => area.slug !== activeArea.value!.slug)
    : props.areas,
)

const windowSize = computed(() => (activeArea.value ? 3 : 4))
const maxOffset = computed(() => Math.max(0, trackAreas.value.length - windowSize.value))
const canShiftTabs = computed(() => trackAreas.value.length > windowSize.value)

watch(
  () => props.selectedDomain,
  () => { tabOffset.value = 0 },
)

watch(maxOffset, (max) => {
  if (tabOffset.value > max) tabOffset.value = max
})

function prevTabs() {
  if (!canShiftTabs.value || tabOffset.value <= 0) return
  tabOffset.value -= 1
}

function nextTabs() {
  if (!canShiftTabs.value || tabOffset.value >= maxOffset.value) return
  tabOffset.value += 1
}

function selectDomain(slug: string) {
  if (slug === props.selectedDomain) return
  emit('select-domain', slug)
}

function tabIcon(area: AreaOfStudySummary) {
  return desktopDomainTabIcon(area.slug, props.selectedDomain === area.slug, area.icon)
}

function invertTabIcon(area: AreaOfStudySummary) {
  return props.selectedDomain === area.slug && area.slug !== 'management'
}

function schoolHref(school: SchoolSummary) {
  const base = `/destinations/${props.destinationSlug}/ecoles/${school.slug}`
  return localePath(props.selectedDomain ? `${base}?domaine=${props.selectedDomain}` : base)
}

const promptSelect = ref(false)
const firstSchoolEl = ref<HTMLElement | null>(null)

watch(
  () => [props.selectedDomain, props.page] as const,
  () => { promptSelect.value = false },
)

function bindFirstSchool(el: Element | null, index: number) {
  if (index === 0) firstSchoolEl.value = el as HTMLElement | null
}

function promptSchoolSelect() {
  if (!props.schools.length) return
  promptSelect.value = true
  nextTick(() => {
    firstSchoolEl.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

function locationLabel(school: SchoolSummary) {
  return [school.city, school.country.name].filter(Boolean).join(', ')
}

const pagerPages = computed(() => {
  const total = Math.max(1, props.totalPages)
  const span = Math.min(5, total)
  let start = Math.max(1, props.page - Math.floor(span / 2))
  if (start + span - 1 > total) start = Math.max(1, total - span + 1)
  return Array.from({ length: span }, (_, i) => start + i)
})

function goPage(page: number) {
  if (page < 1 || page > props.totalPages || page === props.page) return
  emit('update:page', page)
}

const trustItems = [
  { icon: `${ASSET}/trust-1.svg`, bg: 'bg-[#ecfdf5]', titleKey: 'desktop.domaines.trust1Title', descKey: 'desktop.domaines.trust1Desc' },
  { icon: `${ASSET}/trust-2.svg`, bg: 'bg-[#faf5ff]', titleKey: 'desktop.domaines.trust2Title', descKey: 'desktop.domaines.trust2Desc' },
  { icon: `${ASSET}/trust-3.svg`, bg: 'bg-[#fff7ed]', titleKey: 'desktop.domaines.trust3Title', descKey: 'desktop.domaines.trust3Desc' },
  { icon: `${ASSET}/trust-4.svg`, bg: 'bg-[#eff6ff]', titleKey: 'desktop.domaines.trust4Title', descKey: 'desktop.domaines.trust4Desc' },
] as const

</script>

<template>
  <div class="desktop-boxed desktop-split gap-32 pt-32 pb-32">
    <!-- Colonne gauche -->
    <div class="flex min-w-0 flex-1 flex-col gap-32 pr-25">
      <div class="flex w-full items-start justify-between">
        <div class="flex items-center gap-16">
          <span class="flex size-56 shrink-0 items-center justify-center overflow-clip rounded-[16px] bg-[#eef2ff]">
            <img :src="`${ASSET}/header-icon.svg`" alt="" width="28" height="28" class="block size-28">
          </span>
          <div class="flex flex-col gap-4">
            <h1 class="m-0 text-[25px] leading-32 font-bold tracking-[-0.6px] text-black">
              {{ $t('desktop.domaines.title') }}
            </h1>
            <p class="m-0 text-[16px] leading-20 font-medium tracking-[-0.154px] text-[#6b7280]">
              {{ $t('desktop.domaines.subtitle') }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-8">
          <button
            type="button"
            class="flex size-40 shrink-0 items-center justify-center rounded-full border border-[#e5e7eb] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
            :aria-label="$t('desktop.domaines.prevDomains')"
            :disabled="!canShiftTabs || tabOffset === 0"
            :class="!canShiftTabs || tabOffset === 0 ? 'opacity-40' : 'cursor-pointer'"
            @click="prevTabs"
          >
            <span class="size-20 overflow-clip">
              <img :src="`${ASSET}/nav-prev.svg`" alt="" width="20" height="20" class="block size-full">
            </span>
          </button>
          <button
            type="button"
            class="flex size-40 shrink-0 items-center justify-center rounded-full border border-[#e5e7eb] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
            :aria-label="$t('desktop.domaines.nextDomains')"
            :disabled="!canShiftTabs || tabOffset >= maxOffset"
            :class="!canShiftTabs || tabOffset >= maxOffset ? 'opacity-40' : 'cursor-pointer'"
            @click="nextTabs"
          >
            <span class="size-20 overflow-clip">
              <img :src="`${ASSET}/nav-next.svg`" alt="" width="20" height="20" class="block size-full">
            </span>
          </button>
        </div>
      </div>

      <div v-if="areas.length" class="flex w-full items-stretch gap-12">
        <button
          v-if="activeArea"
          type="button"
          class="flex h-50 w-[calc((100%-36px)/4)] shrink-0 items-center justify-center gap-8 rounded-[6px] border border-[#232a4a] bg-[#232a4a] px-12 py-15 text-[16px] leading-20 font-medium tracking-[-0.154px] text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
        >
          <Transition name="domain-pin" mode="out-in">
            <span :key="activeArea.id" class="flex min-w-0 items-center justify-center gap-8">
              <span class="size-16 shrink-0 overflow-clip">
                <img
                  :src="tabIcon(activeArea)"
                  alt=""
                  width="16"
                  height="16"
                  class="block size-full"
                  :class="invertTabIcon(activeArea) ? 'brightness-0 invert' : ''"
                >
              </span>
              <span class="truncate">{{ activeArea.title }}</span>
            </span>
          </Transition>
        </button>

        <div
          class="min-h-50 min-w-0 flex-1 overflow-hidden"
          style="container-type: inline-size"
        >
          <Transition name="domain-track" mode="out-in">
            <div
              :key="activeArea?.id ?? 'all'"
              class="flex gap-12 transition-transform duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
              :style="{ transform: `translateX(calc(-${tabOffset} * (100cqw + 12px) / ${windowSize}))` }"
            >
              <button
                v-for="area in trackAreas"
                :key="area.id"
                type="button"
                class="flex h-50 shrink-0 cursor-pointer items-center justify-center gap-8 rounded-[6px] border border-[#f3f4f6] bg-white px-12 py-15 text-[16px] leading-20 font-medium tracking-[-0.154px] text-black shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
                :style="{ width: `calc((100cqw - ${(windowSize - 1) * 12}px) / ${windowSize})` }"
                @click="selectDomain(area.slug)"
              >
                <span class="size-16 shrink-0 overflow-clip">
                  <img
                    :src="tabIcon(area)"
                    alt=""
                    width="16"
                    height="16"
                    class="block size-full"
                  >
                </span>
                <span class="truncate">{{ area.title }}</span>
              </button>
            </div>
          </Transition>
        </div>
      </div>

      <PageState
        :loading="loading"
        :error="error"
        :empty="empty"
        :empty-title="$t('school.list.emptyTitle')"
        :empty-description="$t('school.list.emptyDescription')"
        :on-retry="onRetry"
      >
        <template #loading>
          <div class="flex flex-col gap-16">
            <QSkeleton v-for="index in 4" :key="index" variant="rect" :height="178" />
          </div>
        </template>

        <Transition name="domain-list" mode="out-in">
          <div
            :key="selectedDomain || 'all'"
            class="flex flex-col gap-16 transition-opacity duration-300"
            :class="pending ? 'opacity-55' : 'opacity-100'"
            :aria-busy="pending ? 'true' : undefined"
          >
          <div
            v-for="(school, index) in schools"
            :key="school.id"
            :ref="(el) => bindFirstSchool(el as Element | null, index)"
            class="relative"
          >
          <NuxtLink
            :to="schoolHref(school)"
            class="relative flex w-full items-center gap-24 rounded-[8px] bg-white p-25 text-inherit no-underline transition-[border-color,box-shadow] duration-200"
            :class="promptSelect && index === 0
              ? 'border border-[#ff1b40] shadow-[0_0_0_3px_rgba(255,27,64,0.22)]'
              : 'border border-[#f3f4f6] shadow-[0_0_2px_rgba(0,0,0,0.1)]'"
          >
            <div
              v-if="promptSelect && index === 0"
              role="status"
              class="pointer-events-none absolute top-12 right-72 z-20 flex flex-col items-end"
            >
              <p class="m-0 rounded-[8px] bg-[#192339] px-12 py-8 text-[13px] leading-16 font-medium text-white shadow-[0_4px_12px_rgba(0,0,0,0.16)]">
                {{ $t('desktop.domaines.selectSchoolHint') }}
              </p>
              <span
                class="mr-16 size-0 border-x-6 border-t-8 border-x-transparent border-t-[#192339]"
                aria-hidden="true"
              />
            </div>
            <div class="flex size-128 shrink-0 items-center justify-center overflow-hidden rounded-[5px] bg-white">
              <NuxtImg
                v-if="school.logo"
                :src="school.logo"
                :alt="school.title"
                width="128"
                height="128"
                format="webp"
                class="max-h-full max-w-full object-contain"
              />
              <QIcon v-else name="building" :size="40" class="text-muted" />
            </div>

            <div class="flex min-w-0 flex-1 flex-col gap-8">
              <h2 class="m-0 w-full truncate text-[18px] leading-28 font-semibold tracking-[-0.45px] text-black">
                {{ school.title }}
              </h2>
              <p
                v-if="school.excerpt"
                class="m-0 line-clamp-3 pr-32 text-[13px] leading-[21.13px] font-medium tracking-[-0.078px] text-[#161616]"
              >
                {{ school.excerpt }}
              </p>
              <div class="flex flex-wrap items-center gap-24 pt-8">
                <span v-if="locationLabel(school)" class="flex items-center gap-6 text-[12px] leading-18 font-medium text-[#65738f]">
                  <span class="size-14 shrink-0 overflow-clip">
                    <img :src="`${ASSET}/pin.svg`" alt="" width="14" height="14" class="block size-full">
                  </span>
                  {{ locationLabel(school) }}
                </span>
              </div>
            </div>

            <span
              class="flex size-40 shrink-0 items-center justify-center overflow-clip"
              :aria-label="$t('desktop.domaines.openSchool')"
            >
              <img :src="`${ASSET}/card-arrow.svg`" alt="" width="40" height="40" class="block size-full">
            </span>
          </NuxtLink>
          </div>
        </div>
        </Transition>

        <nav
          v-if="totalPages > 1"
          :aria-label="$t('ds.pager.label')"
          class="flex w-full items-center justify-center gap-8 pt-8"
        >
          <button
            v-for="item in pagerPages"
            :key="item"
            type="button"
            :aria-current="item === page ? 'page' : undefined"
            class="flex size-40 shrink-0 cursor-pointer items-center justify-center rounded-full text-[14px] leading-20 tracking-[-0.154px]"
            :class="item === page
              ? 'bg-[#ff1b40] font-normal text-white shadow-[0_4px_6px_-1px_#fecaca,0_2px_4px_-2px_#fecaca]'
              : 'border border-[#e5e7eb] bg-white font-medium text-[#040c3d]'"
            @click="goPage(item)"
          >
            {{ item }}
          </button>
          <button
            v-if="page < totalPages"
            type="button"
            class="flex size-40 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#e5e7eb] bg-white"
            :aria-label="$t('desktop.domaines.nextPage')"
            @click="goPage(page + 1)"
          >
            <span class="size-20 overflow-clip">
              <img :src="`${ASSET}/pager-next.svg`" alt="" width="20" height="20" class="block size-full">
            </span>
          </button>
        </nav>
      </PageState>
    </div>

    <!-- Colonne droite 404 -->
    <aside class="desktop-rail-md flex flex-col gap-19">
      <div class="flex w-full flex-col gap-8 rounded-[8px] border border-[#f9fafb] bg-[#fcfcfe] px-13 pt-33 pb-14 shadow-[0_0_2px_rgba(0,0,0,0.1)]">
        <h2 class="m-0 text-[20px] leading-28 font-semibold tracking-[-0.45px] text-black">
          {{ $t('desktop.domaines.trustTitle') }}
        </h2>
        <p class="m-0 text-[13px] leading-[19.5px] tracking-[-0.078px] text-[#6b7280]">
          {{ $t('desktop.domaines.trustLead') }}
        </p>
        <div class="flex w-full flex-col gap-15 rounded-[16px] bg-white py-16 shadow-[0_0_2px_rgba(0,0,0,0.1)]">
          <template v-for="(item, index) in trustItems" :key="item.titleKey">
            <div v-if="index > 0" class="h-px w-full bg-[#f3f4f6]" aria-hidden="true" />
            <div class="flex items-start gap-16 px-16">
              <span :class="['flex size-40 shrink-0 items-center justify-center overflow-clip rounded-full', item.bg]">
                <span class="size-20 overflow-clip">
                  <img :src="item.icon" alt="" width="20" height="20" class="block size-full">
                </span>
              </span>
              <div class="flex min-w-0 flex-1 flex-col gap-4">
                <p class="m-0 text-[14px] leading-20 font-semibold tracking-[-0.154px] text-black">
                  {{ $t(item.titleKey) }}
                </p>
                <p class="m-0 text-[12px] leading-[19.5px] text-[#65738f]">
                  {{ $t(item.descKey) }}
                </p>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="flex w-full flex-col items-center gap-8 rounded-[8px] border border-[#fee2e2] bg-[#fff0f2] p-33">
        <div class="flex w-full items-start gap-16">
          <span class="flex size-56 shrink-0 items-center justify-center overflow-clip rounded-full bg-[#fbe7e9] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <span class="size-24 overflow-clip">
              <img :src="`${ASSET}/cta-headset.svg`" alt="" width="24" height="24" class="block size-full">
            </span>
          </span>
          <div class="flex min-w-0 flex-1 flex-col gap-8 pt-8">
            <p class="m-0 text-[18px] leading-28 font-semibold tracking-[-0.45px] text-[#040c3d]">
              {{ $t('desktop.domaines.helpTitle') }}
            </p>
            <p class="m-0 pb-16 text-[13px] leading-[19.5px] tracking-[-0.078px] text-[#040c3d]">
              {{ $t('desktop.domaines.helpDesc') }}
            </p>
          </div>
        </div>
        <button
          type="button"
          class="flex w-full cursor-pointer items-center justify-center gap-8 rounded-[12px] border-0 bg-[#ff1b40] py-14 text-[14px] leading-20 font-semibold tracking-[-0.154px] text-white"
          @click="promptSchoolSelect"
        >
          {{ $t('desktop.domaines.helpCta') }}
          <span class="size-16 shrink-0 overflow-clip">
            <img :src="`${ASSET}/cta-arrow.svg`" alt="" width="16" height="16" class="block size-full">
          </span>
        </button>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.domain-pin-enter-active,
.domain-pin-leave-active,
.domain-track-enter-active,
.domain-track-leave-active,
.domain-list-enter-active,
.domain-list-leave-active {
  transition: opacity 0.28s cubic-bezier(0.22, 1, 0.36, 1), transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.domain-pin-enter-from,
.domain-track-enter-from,
.domain-list-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.domain-pin-leave-to,
.domain-track-leave-to,
.domain-list-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.domain-pin-enter-from {
  transform: translateX(10px);
}

.domain-pin-leave-to {
  transform: translateX(-10px);
}
</style>
