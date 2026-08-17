<script setup lang="ts">
/**
 * Réservation d'un créneau — pas de maquette (voir `mon-projet/langues/index.vue`).
 *
 * `GET /plannings/events` renvoie le calendrier du professeur par blocs
 * (ex. 13h–17h, un seul `Planning`), pas heure par heure : chaque bloc est
 * découpé ici en créneaux d'1h sélectionnables. Le `planning_id` envoyé à la
 * réservation reste celui du **bloc d'origine** — `PlanningController::
 * createPlanning` s'occupe lui-même de fractionner le reste en créneaux
 * libres si l'heure choisie n'occupe pas tout le bloc.
 *
 * Le back-office impose déjà les règles qui comptent (≥2h à l'avance, ≤3
 * mois après l'achat, créneau réellement libre) : cette page filtre le
 * passé/les créneaux trop proches pour l'affichage, sans dupliquer le reste
 * — une tentative refusée remonte simplement l'erreur du serveur.
 */
import type { CalendarSlot } from '~/core/contracts'
import { planningRepo } from '~/core/repositories'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const courseId = computed(() => String(route.params.courseId ?? ''))
const orderId = computed(() => String(route.query.order ?? ''))
const teacherId = computed(() => String(route.query.teacher ?? ''))
const lang = computed(() => String(route.query.lang ?? ''))

if (orderId.value === '' || teacherId.value === '') {
  throw createError({ statusCode: 400, statusMessage: t('languagePlanning.missingOrder'), fatal: true })
}

const { data: events, apiError, isInitialLoading, refresh } = await usePageData(
  `langue-events-${teacherId.value}`,
  () => planningRepo.events(teacherId.value, locale.value),
  { watch: [teacherId, locale] },
)

interface HourSlot { blockId: string; start: Date; end: Date }

/** Le créneau doit commencer au moins 2h après maintenant — reflet côté affichage de la règle serveur. */
const MIN_LEAD_MS = 2 * 60 * 60 * 1000

function hourlySlots(block: CalendarSlot): HourSlot[] {
  const slots: HourSlot[] = []
  let cursor = new Date(block.startDate)
  const end = new Date(block.endDate)

  while (cursor.getTime() + 3_600_000 <= end.getTime()) {
    const next = new Date(cursor.getTime() + 3_600_000)
    if (cursor.getTime() >= Date.now() + MIN_LEAD_MS) slots.push({ blockId: block.id, start: cursor, end: next })
    cursor = next
  }
  return slots
}

const availableSlots = computed<HourSlot[]>(() =>
  (events.value ?? [])
    .filter((event) => event.free)
    .flatMap(hourlySlots)
    .sort((a, b) => a.start.getTime() - b.start.getTime()),
)

/** Groupées par jour — un `Map` conserve l'ordre d'insertion (déjà trié). */
const slotsByDay = computed(() => {
  const groups = new Map<string, HourSlot[]>()
  for (const slot of availableSlots.value) {
    const key = new Intl.DateTimeFormat(locale.value, { weekday: 'long', day: 'numeric', month: 'long' }).format(slot.start)
    const list = groups.get(key) ?? []
    list.push(slot)
    groups.set(key, list)
  }
  return groups
})

function formatHour(date: Date): string {
  return new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' }).format(date)
}

const booking = ref<string | null>(null)
const bookError = ref(false)

async function book(slot: HourSlot) {
  const key = `${slot.blockId}-${slot.start.getTime()}`
  booking.value = key
  bookError.value = false
  try {
    await planningRepo.book(
      {
        planningId: slot.blockId,
        orderId: orderId.value,
        title: lang.value || t('languagePlanning.defaultSessionTitle'),
        startAt: slot.start.toISOString(),
        endAt: slot.end.toISOString(),
      },
      locale.value,
    )
    await router.push(localePath('/mon-projet/langues'))
  }
  catch {
    bookError.value = true
    booking.value = null
    await refresh()
  }
}

usePageSeo(() => ({
  title: t('languagePlanning.bookingStepTitle'),
  description: t('languagePlanning.bookingStepIntro'),
  noindex: true,
}))
</script>

<template>
  <AppTopBar back :back-to="`/mon-projet/langues/${courseId}/professeur?order=${orderId}&lang=${lang}`" :notifications="3" />

  <div class="w-full pb-22">
    <h1 class="m-0 text-4xl leading-normal font-semibold tracking-tight text-text">
      {{ $t('languagePlanning.bookingStepTitle') }}
    </h1>
    <p class="m-0 text-xl leading-[22.75px] text-text">
      {{ $t('languagePlanning.bookingStepIntro') }}
    </p>
  </div>

  <QAlert v-if="bookError" tone="danger" :title="$t('languagePlanning.bookErrorTitle')" class="mb-16" />

  <PageState
    :loading="isInitialLoading"
    :error="apiError"
    :empty="availableSlots.length === 0"
    :empty-title="$t('languagePlanning.noSlotTitle')"
    :empty-description="$t('languagePlanning.noSlotDescription')"
    :on-retry="() => refresh()"
  >
    <template #loading>
      <div class="flex flex-col gap-16">
        <QSkeleton v-for="index in 3" :key="index" variant="rect" :height="80" />
      </div>
    </template>

    <div class="flex w-full flex-col gap-20">
      <div v-for="[day, slots] in slotsByDay" :key="day" class="flex w-full flex-col gap-8">
        <p class="m-0 text-sm font-semibold text-navy capitalize">{{ day }}</p>
        <div class="grid grid-cols-3 gap-8">
          <QButton
            v-for="slot in slots"
            :key="`${slot.blockId}-${slot.start.getTime()}`"
            variant="outline"
            size="sm"
            :loading="booking === `${slot.blockId}-${slot.start.getTime()}`"
            :disabled="booking !== null && booking !== `${slot.blockId}-${slot.start.getTime()}`"
            @click="book(slot)"
          >
            {{ formatHour(slot.start) }}
          </QButton>
        </div>
      </div>
    </div>
  </PageState>
</template>
