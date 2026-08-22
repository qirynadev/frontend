<script setup lang="ts">
/**
 * Créneau Professeur ← Figma `858:3603`.
 *
 * API : `planningRepo.events` → créneaux libres découpés en 1h.
 * Mock (demo / API vide) : dates + heures Figma (`langueCreneauHoursMock`).
 * « Confirmer le créneau » → `/mon-projet/langues?tab=planned`.
 * Voir `docs/mon-projet-professeur-mocks.md`.
 */
import type { CalendarSlot, Teacher } from '~/core/contracts'
import {
  LANGUE_DEMO_COURSE_ID,
  langueCreneauHoursMock,
  langueTeachersMock,
} from '~/config/projet-langue-mock'
import { planningRepo } from '~/core/repositories'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const courseId = computed(() => String(route.params.courseId ?? ''))
const orderId = computed(() => String(route.query.order ?? ''))
const teacherId = computed(() => String(route.query.teacher ?? ''))
const lang = computed(() => String(route.query.lang ?? '') || t('languagePlanning.defaultSessionTitle'))
const isDemo = computed(() => courseId.value === LANGUE_DEMO_COURSE_ID || orderId.value.startsWith('demo'))

if (orderId.value === '' || teacherId.value === '') {
  throw createError({ statusCode: 400, statusMessage: t('languagePlanning.missingOrder'), fatal: true })
}

const backToProfesseur = computed(() =>
  `/mon-projet/langues/${courseId.value}/professeur?order=${orderId.value}&lang=${encodeURIComponent(String(route.query.lang ?? ''))}`,
)

const { data: events, apiError, isInitialLoading, refresh } = await usePageData(
  `langue-events-${teacherId.value}`,
  async () => {
    if (isDemo.value) return [] as CalendarSlot[]
    return planningRepo.events(teacherId.value, locale.value)
  },
  { watch: [teacherId, locale] },
)

const { data: teachers } = await usePageData(
  `langue-teachers-slot-${courseId.value}`,
  async () => {
    if (isDemo.value) return [] as Teacher[]
    return planningRepo.teachersByCourse(courseId.value, locale.value)
  },
  { watch: [courseId, locale] },
)

const teacherCard = computed(() => {
  const mock = langueTeachersMock.find(item => item.id === teacherId.value)
  if (mock) return mock
  const api = (teachers.value ?? []).find(item => item.id === teacherId.value)
  if (api) {
    return {
      id: api.id,
      fullName: api.fullName,
      photo: api.photo ?? '/img/mpl-prof/sarah.jpg',
      verified: false,
      countryLabel: null as string | null,
      flagSrc: null as string | null,
      rating: api.rating,
      reviewsCount: api.reviewsCount,
      qualification: null as string | null,
      experienceYears: api.experienceYears,
      availabilityLabel: null as string | null,
      availabilityTone: null as 'today' | 'tomorrow' | 'soon' | 'later' | null,
      priceFrom: '-',
    }
  }
  return langueTeachersMock[1]!
})

interface HourSlot { blockId: string; start: Date; end: Date; label: string }

const MIN_LEAD_MS = 2 * 60 * 60 * 1000

function hourlySlots(block: CalendarSlot): HourSlot[] {
  const slots: HourSlot[] = []
  let cursor = new Date(block.startDate)
  const end = new Date(block.endDate)
  const tf = new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' })

  while (cursor.getTime() + 3_600_000 <= end.getTime()) {
    const next = new Date(cursor.getTime() + 3_600_000)
    if (cursor.getTime() >= Date.now() + MIN_LEAD_MS) {
      slots.push({
        blockId: block.id,
        start: cursor,
        end: next,
        label: `${tf.format(cursor)} – ${tf.format(next)}`,
      })
    }
    cursor = next
  }
  return slots
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/** Mock : 7 jours à partir de demain, créneaux Figma 09h–20h. */
function buildMockSlots(): HourSlot[] {
  const slots: HourSlot[] = []
  const base = new Date()
  base.setHours(0, 0, 0, 0)
  for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
    const day = new Date(base)
    day.setDate(base.getDate() + dayOffset)
    for (const hour of langueCreneauHoursMock) {
      const [h, m] = hour.split(':').map(Number)
      const start = new Date(day)
      start.setHours(h!, m!, 0, 0)
      const end = new Date(start.getTime() + 3_600_000)
      const tf = new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' })
      slots.push({
        blockId: `mock-${dayKey(day)}-${hour}`,
        start,
        end,
        label: `${tf.format(start)} – ${tf.format(end)}`,
      })
    }
  }
  return slots
}

const availableSlots = computed<HourSlot[]>(() => {
  const apiSlots = (events.value ?? [])
    .filter(event => event.free)
    .flatMap(hourlySlots)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
  if (apiSlots.length > 0) return apiSlots
  return buildMockSlots()
})

interface DayOption {
  key: string
  date: Date
  weekdayShort: string
  dayNum: string
  monthShort: string
  slots: HourSlot[]
}

const days = computed<DayOption[]>(() => {
  const map = new Map<string, DayOption>()
  const weekdayFmt = new Intl.DateTimeFormat(locale.value, { weekday: 'short' })
  const monthFmt = new Intl.DateTimeFormat(locale.value, { month: 'short' })

  for (const slot of availableSlots.value) {
    const key = dayKey(slot.start)
    let day = map.get(key)
    if (!day) {
      const rawWeek = weekdayFmt.format(slot.start).replace(/\.$/, '')
      day = {
        key,
        date: new Date(slot.start.getFullYear(), slot.start.getMonth(), slot.start.getDate()),
        weekdayShort: `${rawWeek.charAt(0).toUpperCase()}${rawWeek.slice(1)}.`,
        dayNum: String(slot.start.getDate()),
        monthShort: monthFmt.format(slot.start).replace(/\.$/, ''),
        slots: [],
      }
      map.set(key, day)
    }
    day.slots.push(slot)
  }
  return [...map.values()]
})

const selectedDayKey = ref('')
const selectedSlotKey = ref('')
const dateWindowStart = ref(0)
const DATE_WINDOW = 5

watch(days, (list) => {
  if (!list.length) return
  if (!list.some(d => d.key === selectedDayKey.value)) {
    selectedDayKey.value = list[Math.min(1, list.length - 1)]!.key
    selectedSlotKey.value = ''
  }
  if (dateWindowStart.value > Math.max(0, list.length - DATE_WINDOW)) {
    dateWindowStart.value = Math.max(0, list.length - DATE_WINDOW)
  }
}, { immediate: true })

const visibleDays = computed(() =>
  days.value.slice(dateWindowStart.value, dateWindowStart.value + DATE_WINDOW),
)

const selectedDay = computed(() => days.value.find(d => d.key === selectedDayKey.value) ?? null)
const selectedSlot = computed(() =>
  selectedDay.value?.slots.find(s => `${s.blockId}-${s.start.getTime()}` === selectedSlotKey.value) ?? null,
)

function selectDay(key: string) {
  selectedDayKey.value = key
  selectedSlotKey.value = ''
}

function selectSlot(slot: HourSlot) {
  selectedSlotKey.value = `${slot.blockId}-${slot.start.getTime()}`
}

function shiftDates(delta: number) {
  const max = Math.max(0, days.value.length - DATE_WINDOW)
  dateWindowStart.value = Math.min(max, Math.max(0, dateWindowStart.value + delta))
}

const confirmDateLabel = computed(() => {
  if (!selectedDay.value) return ''
  return new Intl.DateTimeFormat(locale.value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(selectedDay.value.date)
})

const booking = ref(false)
const bookError = ref(false)

async function confirmSlot() {
  if (!selectedSlot.value || booking.value) return
  booking.value = true
  bookError.value = false
  try {
    if (!isDemo.value && !selectedSlot.value.blockId.startsWith('mock-')) {
      await planningRepo.book(
        {
          planningId: selectedSlot.value.blockId,
          orderId: orderId.value,
          title: lang.value,
          startAt: selectedSlot.value.start.toISOString(),
          endAt: selectedSlot.value.end.toISOString(),
        },
        locale.value,
      )
    }
    await router.push(localePath({ path: '/mon-projet/langues', query: { tab: 'planned' } }))
  }
  catch {
    bookError.value = true
    booking.value = false
    await refresh()
  }
}

function cancel() {
  void router.push(localePath(backToProfesseur.value))
}

function formatRating(value: number | null): string {
  if (value === null) return '—'
  return value.toLocaleString(locale.value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

usePageSeo(() => ({
  title: t('languagePlanning.bookingStepTitle'),
  description: t('languagePlanning.bookingStepIntro'),
  noindex: true,
}))
</script>

<template>
  <div class="flex w-full flex-col gap-20 pb-22">
    <AppTopBar back :back-to="backToProfesseur" :notifications="3" :gap="0" />

    <div>
      <h1 class="m-0 text-[20px] leading-normal font-semibold tracking-[-0.65px] text-[#191919]">
        {{ $t('languagePlanning.bookingStepTitle') }}
      </h1>
      <p class="m-0 text-[13px] leading-[22.75px] font-normal text-[#191919]">
        {{ $t('languagePlanning.bookingStepIntro') }}
      </p>
    </div>

    <QAlert v-if="bookError" tone="danger" :title="$t('languagePlanning.bookErrorTitle')" />

    <PageState
      :loading="isInitialLoading && !isDemo"
      :error="isDemo ? null : apiError"
      :empty="days.length === 0"
      :empty-title="$t('languagePlanning.noSlotTitle')"
      :empty-description="$t('languagePlanning.noSlotDescription')"
      :on-retry="() => refresh()"
    >
      <template #loading>
        <div class="flex flex-col gap-16">
          <QSkeleton variant="rect" :height="180" />
          <QSkeleton variant="rect" :height="100" />
          <QSkeleton variant="rect" :height="160" />
        </div>
      </template>

      <div class="flex w-full flex-col gap-20">
        <!-- Carte professeur -->
        <section class="box-border w-full rounded-[10px] border border-[#f1f1f8] bg-white p-17">
          <div class="flex items-start gap-14 pb-20">
            <div class="size-106 shrink-0 overflow-hidden rounded-[10px] bg-[#f1f5f9]">
              <img
                :src="teacherCard.photo"
                alt=""
                width="106"
                height="106"
                class="block size-106 object-cover"
              >
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-5">
                <h2 class="m-0 truncate text-[17px] leading-[21.25px] font-bold text-[#0d153e]">{{ teacherCard.fullName }}</h2>
                <img
                  v-if="teacherCard.verified"
                  src="/img/icons/mpl-prof/verified.svg"
                  alt=""
                  width="12"
                  height="12"
                  class="block size-12 shrink-0"
                >
              </div>
              <p v-if="teacherCard.countryLabel" class="m-0 flex items-center gap-6 pt-4 text-[12px] leading-18 font-normal text-black">
                <img
                  v-if="teacherCard.flagSrc"
                  :src="teacherCard.flagSrc"
                  alt=""
                  width="14"
                  height="8"
                  class="block h-8 w-14 shrink-0 rounded-[1px] object-cover"
                >
                <span>{{ teacherCard.countryLabel }}</span>
              </p>
              <p v-if="teacherCard.qualification" class="m-0 flex items-center gap-6 pt-4 text-[11.5px] leading-[17.25px] font-normal text-black">
                <img src="/img/icons/mpl-prof/grad.svg" alt="" width="14" height="14" class="block size-14 shrink-0">
                <span class="truncate">{{ teacherCard.qualification }}</span>
              </p>
              <p v-if="teacherCard.rating !== null" class="m-0 flex items-center gap-6 pt-4 text-[11.5px] leading-[17.25px]">
                <img src="/img/icons/mpl-prof/star.svg" alt="" width="14" height="14" class="block size-14 shrink-0">
                <span class="font-semibold text-black">{{ formatRating(teacherCard.rating) }}</span>
                <span class="text-[10px] font-medium text-[#94a3b8]">({{ $t('languagePlanning.reviewsCount', { count: teacherCard.reviewsCount }) }})</span>
              </p>
              <p v-if="teacherCard.experienceYears !== null" class="m-0 flex items-center gap-6 pt-4 text-[10px] leading-[17.25px] font-normal text-black">
                <img src="/img/icons/mpl-prof/chat.svg" alt="" width="14" height="14" class="block size-14 shrink-0">
                <span>{{ $t('languagePlanning.experienceYears', teacherCard.experienceYears) }}</span>
              </p>
            </div>
          </div>

          <div class="flex items-center border-t border-[#efeff6] pt-11">
            <div
              v-if="teacherCard.availabilityLabel"
              class="inline-flex items-center gap-4 rounded-[5px] bg-[#ebf4fd] px-10 py-4"
            >
              <span class="size-6 rounded-full bg-[#0a7ff8]" />
              <span class="text-[11px] leading-[16.5px] font-medium text-[#0a7ff8]">{{ teacherCard.availabilityLabel }}</span>
            </div>
            <div class="min-w-0 flex-1 text-right">
              <p class="m-0 text-[10px] leading-[15.625px] font-bold text-[#0d153e]">{{ lang }}</p>
              <p class="m-0 flex items-center justify-end gap-4 pt-2 text-[10px] leading-[17.25px] font-normal text-[#64748b]">
                <img src="/img/icons/mpl-creneau/clock.svg" alt="" width="11" height="11" class="block size-11 shrink-0 opacity-60">
                <span>{{ $t('languagePlanning.sessionDuration') }}</span>
              </p>
            </div>
          </div>
        </section>

        <!-- 1. Dates -->
        <section class="w-full">
          <h2 class="m-0 text-[13px] leading-[22.5px] font-semibold text-black">{{ $t('languagePlanning.chooseDate') }}</h2>
          <div class="flex items-center gap-8 pt-12">
            <button
              type="button"
              class="flex size-36 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-white shadow-[0_0_3.5px_rgba(0,0,0,0.1)] disabled:opacity-40"
              :disabled="dateWindowStart <= 0"
              :aria-label="$t('ds.pager.previous')"
              @click="shiftDates(-1)"
            >
              <img src="/img/icons/mpl-creneau/chevron-left.svg" alt="" width="8" height="12" class="block h-12 w-8">
            </button>

            <div class="grid min-w-0 flex-1 grid-cols-5 gap-8">
              <button
                v-for="day in visibleDays"
                :key="day.key"
                type="button"
                :class="[
                  'flex cursor-pointer flex-col items-center justify-center rounded-[10px] border px-5 py-11',
                  selectedDayKey === day.key
                    ? 'border-[#3709fc] bg-[#faf8ff]'
                    : 'border-[#e9e9f3] bg-white',
                ]"
                @click="selectDay(day.key)"
              >
                <span :class="['text-[11px] leading-[16.5px] font-medium', selectedDayKey === day.key ? 'text-[#4f18f6]' : 'text-[#64748b]']">
                  {{ day.weekdayShort }}
                </span>
                <span :class="['pt-2 text-[18px] leading-18 font-semibold', selectedDayKey === day.key ? 'text-[#4f18f6]' : 'text-[#0d153e]']">
                  {{ day.dayNum }}
                </span>
                <span :class="['pt-2 text-[11px] leading-[16.5px] font-medium capitalize', selectedDayKey === day.key ? 'text-[#4f18f6]' : 'text-[#94a3b8]']">
                  {{ day.monthShort }}
                </span>
                <span
                  v-if="selectedDayKey === day.key"
                  class="mt-4 size-6 rounded-full bg-[#4f18f6]"
                  aria-hidden="true"
                />
              </button>
            </div>

            <button
              type="button"
              class="flex size-36 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-white shadow-[0_0_3.5px_rgba(0,0,0,0.1)] disabled:opacity-40"
              :disabled="dateWindowStart >= Math.max(0, days.length - DATE_WINDOW)"
              :aria-label="$t('ds.pager.next')"
              @click="shiftDates(1)"
            >
              <img src="/img/icons/mpl-creneau/chevron-right.svg" alt="" width="8" height="12" class="block h-12 w-8">
            </button>
          </div>
        </section>

        <!-- 2. Créneaux -->
        <section class="w-full">
          <div class="flex flex-wrap items-center justify-between gap-8">
            <h2 class="m-0 text-[13px] leading-[22.5px] font-semibold text-black">{{ $t('languagePlanning.chooseSlot') }}</h2>
            <p class="m-0 flex items-center gap-4 text-[11px] leading-16 font-normal text-[#64748b]">
              <img src="/img/icons/mpl-creneau/slot-clock.svg" alt="" width="12" height="12" class="block size-12 shrink-0">
              <span>{{ $t('languagePlanning.teacherLocalTime') }}</span>
            </p>
          </div>
          <div class="grid grid-cols-4 gap-8 pt-12">
            <button
              v-for="slot in selectedDay?.slots ?? []"
              :key="`${slot.blockId}-${slot.start.getTime()}`"
              type="button"
              :class="[
                'cursor-pointer rounded-[8px] border bg-white px-4 py-10 text-[11px] leading-16 font-medium whitespace-nowrap',
                selectedSlotKey === `${slot.blockId}-${slot.start.getTime()}`
                  ? 'border-[#3709fc] text-[#4f18f6]'
                  : 'border-[#e9e9f3] text-[#0d153e]',
              ]"
              @click="selectSlot(slot)"
            >
              {{ slot.label }}
            </button>
          </div>
        </section>

        <!-- 3. Confirmation -->
        <section class="w-full">
          <h2 class="m-0 text-[13px] leading-[22.5px] font-semibold text-black">{{ $t('languagePlanning.confirmChoice') }}</h2>
          <div class="mt-12 box-border flex w-full items-start gap-12 rounded-[10px] border border-[#e9e9f3] bg-white p-14">
            <img src="/img/icons/mpl-creneau/confirm-cal.svg" alt="" width="28" height="28" class="mt-2 block size-28 shrink-0">
            <div class="min-w-0 flex-1">
              <p class="m-0 text-[13px] leading-18 font-semibold text-[#0d153e]">{{ teacherCard.fullName }}</p>
              <p class="m-0 pt-2 text-[11px] leading-16 font-normal text-[#64748b]">{{ lang }}</p>
              <p v-if="selectedDay" class="m-0 flex items-center gap-6 pt-8 text-[12px] leading-18 font-medium text-[#0d153e] capitalize">
                <img src="/img/icons/mpl-creneau/calendar.svg" alt="" width="12" height="12" class="block size-12 shrink-0">
                <span>{{ confirmDateLabel }}</span>
              </p>
              <p v-if="selectedSlot" class="m-0 flex items-center gap-6 pt-4 text-[12px] leading-18 font-medium text-[#0d153e]">
                <img src="/img/icons/mpl-creneau/clock.svg" alt="" width="12" height="12" class="block size-12 shrink-0">
                <span>{{ selectedSlot.label }}</span>
              </p>
              <p v-else class="m-0 pt-8 text-[11px] leading-16 text-[#94a3b8]">{{ $t('languagePlanning.selectSlotHint') }}</p>
            </div>
          </div>

          <button
            type="button"
            :disabled="!selectedSlot || booking"
            class="mt-16 flex h-48 w-full cursor-pointer items-center justify-center rounded-[10px] border-0 bg-[#4f46e5] text-[14px] leading-20 font-semibold text-white disabled:opacity-50"
            @click="confirmSlot"
          >
            <QSpinner v-if="booking" size="sm" />
            <span v-else>{{ $t('languagePlanning.confirmSlot') }}</span>
          </button>
          <button
            type="button"
            class="mt-10 flex h-48 w-full cursor-pointer items-center justify-center rounded-[10px] border border-[#4f46e5] bg-white text-[14px] leading-20 font-semibold text-[#0a142f]"
            @click="cancel"
          >
            {{ $t('languagePlanning.cancelSlot') }}
          </button>
        </section>
      </div>
    </PageState>
  </div>
</template>
