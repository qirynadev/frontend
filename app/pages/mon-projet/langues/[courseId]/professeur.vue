<script setup lang="ts">
/**
 * Choix du professeur ← Figma `865:2982` « Mon Projet - Professeur ».
 *
 * API : `planningRepo.teachersByCourse` → `Teacher` (nom, photo, bio, note, avis,
 * expérience, pays/drapeau, disponibilité, qualification, vérifié — voir
 * `planning.adapter.ts:toTeacher`). Qualité éditoriale de `qualification`
 * encore inégale selon le profil, et `verified` reflète une confirmation
 * d'e-mail plutôt qu'un contrôle de profil dédié — utilisés quand même en dev
 * (voir `docs/directives-backend.md`). Toujours hors API (mock) : prix.
 */
import type { Teacher } from '~/core/contracts'
import {
  LANGUE_DEMO_COURSE_ID,
  LANGUE_TEACHERS_PER_PAGE,
  type LangueTeacherAvailabilityTone,
  type LangueTeacherCardMock,
  langueTeachersMock,
} from '~/config/projet-langue-mock'
import { planningRepo } from '~/core/repositories'
import { resolveTeacherAvailability } from '~/utils/teacher-availability'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const courseId = computed(() => String(route.params.courseId ?? ''))
const orderId = computed(() => String(route.query.order ?? ''))
const lang = computed(() => String(route.query.lang ?? ''))
const isDemo = computed(() => courseId.value === LANGUE_DEMO_COURSE_ID || orderId.value.startsWith('demo'))

if (orderId.value === '') {
  throw createError({ statusCode: 400, statusMessage: t('languagePlanning.missingOrder'), fatal: true })
}

const { data: teachers, apiError, isInitialLoading, refresh } = await usePageData(
  `langue-teachers-${courseId.value}`,
  async () => {
    if (isDemo.value) return [] as Teacher[]
    return planningRepo.teachersByCourse(courseId.value, locale.value)
  },
  { watch: [courseId, locale] },
)

interface TeacherCardView {
  id: string
  fullName: string
  photo: string | null
  verified: boolean
  countryLabel: string | null
  flagSrc: string | null
  rating: number | null
  reviewsCount: number
  qualification: string | null
  experienceYears: number | null
  availabilityLabel: string | null
  availabilityTone: LangueTeacherAvailabilityTone | null
  priceFrom: string
}

const availabilityToneClass: Record<LangueTeacherAvailabilityTone, { bg: string; dot: string; text: string }> = {
  today: { bg: 'bg-[#e8fbea]', dot: 'bg-[#16a34a]', text: 'text-[#16a34a]' },
  tomorrow: { bg: 'bg-[#e2f0fd]', dot: 'bg-[#1481fc]', text: 'text-[#1481fc]' },
  soon: { bg: 'bg-[#fef4e8]', dot: 'bg-[#fe920b]', text: 'text-[#fe920b]' },
  later: { bg: 'bg-[#f0edfe]', dot: 'bg-[#4f18f6]', text: 'text-[#4f18f6]' },
}

function fromApi(teacher: Teacher): TeacherCardView {
  const availability = resolveTeacherAvailability(teacher.nextAvailableAt, locale.value, t)

  return {
    id: teacher.id,
    fullName: teacher.fullName,
    photo: teacher.photo,
    verified: teacher.verified,
    countryLabel: teacher.countryLabel,
    flagSrc: teacher.countryFlag,
    rating: teacher.rating,
    reviewsCount: teacher.reviewsCount,
    qualification: teacher.qualification,
    experienceYears: teacher.experienceYears,
    availabilityLabel: availability?.label ?? null,
    availabilityTone: availability?.tone ?? null,
    priceFrom: '-',
  }
}

function fromMock(teacher: LangueTeacherCardMock): TeacherCardView {
  return { ...teacher }
}

const displayTeachers = computed<TeacherCardView[]>(() => {
  const api = teachers.value ?? []
  return api.length > 0 ? api.map(fromApi) : langueTeachersMock.map(fromMock)
})

const TEACHERS_PER_PAGE = LANGUE_TEACHERS_PER_PAGE
const page = ref(1)

const totalPages = computed(() => Math.max(1, Math.ceil(displayTeachers.value.length / TEACHERS_PER_PAGE)))

const pagedTeachers = computed(() => {
  const start = (page.value - 1) * TEACHERS_PER_PAGE
  return displayTeachers.value.slice(start, start + TEACHERS_PER_PAGE)
})

watch(totalPages, (total) => {
  if (page.value > total) page.value = total
})

const assigning = ref<string | null>(null)
const assignError = ref(false)

async function choose(teacherId: string) {
  assigning.value = teacherId
  assignError.value = false
  try {
    if (!isDemo.value) {
      await planningRepo.assignTeacher(orderId.value, teacherId, locale.value)
    }
    await router.push(localePath(
      `/mon-projet/langues/${courseId.value}/planifier?order=${orderId.value}&teacher=${teacherId}&lang=${encodeURIComponent(lang.value)}`,
    ))
  }
  catch {
    assignError.value = true
    assigning.value = null
  }
}

function formatRating(value: number | null): string {
  if (value === null) return '—'
  return value.toLocaleString(locale.value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

usePageSeo(() => ({
  title: t('languagePlanning.teachersAvailableTitle'),
  description: t('languagePlanning.teacherStepIntro'),
  noindex: true,
}))
</script>

<template>
  <div class="flex w-full flex-col gap-16 pb-22">
    <AppTopBar back back-to="/mon-projet/langues" :gap="0" />

    <h1 class="m-0 text-[20px] leading-normal font-semibold tracking-[-0.65px] text-[#191919]">
      {{ $t('languagePlanning.teachersAvailableTitle') }}
    </h1>

    <QAlert v-if="assignError" tone="danger" :title="$t('languagePlanning.assignErrorTitle')" />

    <PageState
      :loading="isInitialLoading && !isDemo"
      :error="isDemo ? null : apiError"
      :empty="displayTeachers.length === 0"
      :empty-title="$t('languagePlanning.noTeacherAvailableTitle')"
      :empty-description="$t('languagePlanning.noTeacherAvailableDescription')"
      :on-retry="() => refresh()"
    >
      <template #loading>
        <div class="flex flex-col gap-12">
          <QSkeleton v-for="index in 3" :key="index" variant="rect" :height="143" />
        </div>
      </template>

      <div class="flex w-full flex-col gap-12">
        <article
          v-for="teacher in pagedTeachers"
          :key="teacher.id"
          class="box-border flex w-full gap-14 rounded-[10px] border border-[#f3f4f6] bg-surface-card p-15 shadow-[0_2px_6px_rgba(0,0,0,0.03)]"
        >
          <div class="h-113 w-75 shrink-0 overflow-hidden rounded-[10px] bg-[#f3f4f6]">
            <img
              v-if="teacher.photo"
              :src="teacher.photo"
              alt=""
              width="75"
              height="113"
              class="block size-full object-cover"
            >
          </div>

          <div class="flex min-w-0 flex-1 gap-22">
            <div class="min-w-0 w-[125px] shrink-0">
              <div class="flex items-center gap-6">
                <h2 class="m-0 truncate text-[13px] leading-15 font-semibold text-[#0a142f]">{{ teacher.fullName }}</h2>
                <img
                  v-if="teacher.verified"
                  src="/img/icons/mpl-prof/verified.svg"
                  alt=""
                  width="12"
                  height="12"
                  class="block size-12 shrink-0"
                >
              </div>

              <div class="flex flex-col pt-6">
                <p v-if="teacher.countryLabel" class="m-0 flex items-center gap-8 text-[10px] leading-[17.25px] font-medium text-[#374151]">
                  <img
                    v-if="teacher.flagSrc"
                    :src="teacher.flagSrc"
                    alt=""
                    width="13"
                    height="10"
                    class="block h-10 w-13 shrink-0 rounded-[1px] object-cover"
                  >
                  <span>{{ teacher.countryLabel }}</span>
                </p>

                <p v-if="teacher.rating !== null" class="m-0 flex h-24 items-center gap-8 text-[10px] leading-[17.25px]">
                  <img src="/img/icons/mpl-prof/star.svg" alt="" width="14" height="14" class="block size-14 shrink-0">
                  <span class="font-bold text-[#0a142f]">{{ formatRating(teacher.rating) }}</span>
                  <span class="font-normal text-[#6b7280]">({{ $t('languagePlanning.reviewsCount', { count: teacher.reviewsCount }) }})</span>
                </p>

                <p v-if="teacher.qualification" class="m-0 flex h-24 items-center gap-8 text-[10px] leading-[17.25px] font-normal text-[#374151]">
                  <img src="/img/icons/mpl-prof/grad.svg" alt="" width="14" height="14" class="block size-14 shrink-0">
                  <span class="truncate">{{ teacher.qualification }}</span>
                </p>

                <p v-if="teacher.experienceYears !== null" class="m-0 flex h-24 items-center gap-8 text-[10px] leading-[17.25px] font-normal text-[#374151]">
                  <img src="/img/icons/mpl-prof/chat.svg" alt="" width="14" height="14" class="block size-14 shrink-0">
                  <span>{{ $t('languagePlanning.experienceYears', teacher.experienceYears) }}</span>
                </p>
              </div>
            </div>

            <div class="flex min-w-0 flex-1 flex-col items-center justify-between">
              <div
                v-if="teacher.availabilityLabel && teacher.availabilityTone"
                :class="[
                  'inline-flex w-full items-center justify-center gap-4 rounded-[5px] px-8 py-4',
                  availabilityToneClass[teacher.availabilityTone].bg,
                ]"
              >
                <span :class="['size-6 shrink-0 rounded-full', availabilityToneClass[teacher.availabilityTone].dot]" />
                <span :class="['text-[7px] leading-[13.5px] font-medium whitespace-nowrap', availabilityToneClass[teacher.availabilityTone].text]">
                  {{ teacher.availabilityLabel }}
                </span>
              </div>
              <div v-else class="h-21" />

              <div class="flex flex-col items-center pb-6">
                <p class="m-0 text-center text-[10px] leading-[12.5px] font-normal text-[#282828]">
                  {{ $t('languagePlanning.priceFrom') }}
                </p>
                <p class="m-0 pt-2 text-center text-[13px] leading-[16.25px] font-bold text-[#0a142f]">
                  {{ teacher.priceFrom }}
                </p>
              </div>

              <button
                type="button"
                :disabled="assigning !== null"
                class="inline-flex w-95 cursor-pointer items-center justify-center rounded-[6px] border-0 bg-[#4f46e5] py-6 text-[11px] leading-18 font-semibold text-white disabled:opacity-60"
                @click="choose(teacher.id)"
              >
                <QSpinner v-if="assigning === teacher.id" size="sm" />
                <span v-else>{{ $t('languagePlanning.chooseTeacher') }}</span>
              </button>
            </div>
          </div>
        </article>

        <QPager
          v-if="totalPages > 1"
          v-model:page="page"
          :total="totalPages"
          :aria-label="$t('languagePlanning.teachersPagerLabel')"
          class="!px-0 !py-0"
        />

        <!-- Satisfaction garantie (Figma) -->
        <aside class="box-border flex w-full items-center gap-12 rounded-[10px] border border-[#e8e8ff] bg-[#f5f4fd] px-14 py-14">
          <img src="/img/icons/mpl-prof/shield.svg" alt="" width="44" height="44" class="block size-44 shrink-0">
          <div class="min-w-0 flex-1">
            <p class="m-0 text-[13px] leading-18 font-bold text-[#0a142f]">{{ $t('languagePlanning.guaranteeTitle') }}</p>
            <p class="m-0 pt-2 text-[11px] leading-16 font-normal text-[#4b5563]">{{ $t('languagePlanning.guaranteeDesc') }}</p>
          </div>
          <img src="/img/icons/mpl-prof/chevron.svg" alt="" width="8" height="13" class="block h-13 w-8 shrink-0 opacity-60">
        </aside>
      </div>
    </PageState>
  </div>
</template>
