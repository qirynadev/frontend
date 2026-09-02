<script setup lang="ts">
/**
 * Mon Projet - Langue ← Figma (étape 3)
 * - Onglet planifiés : `860:4150` « Mon Projet - Langue 1 »
 * - Onglet à planifier : `862:241` « Mon Projet - Langues 2 »
 * - Étape 5 (certification) : `/mon-projet/langues/certification` ← `863:1956`
 * - CTA Planifier → `/mon-projet/langues/.../professeur` ← `865:2982`
 *
 * Espacement topbar → contenu : **22px** ; sections : **22px**.
 * Mock : `config/projet-langue-mock.ts` + `docs/mon-projet-langue-mocks.md`.
 */
import type { LanguageProgress, PlannedSession } from '~/core/contracts'
import { planningRepo } from '~/core/repositories'
import {
  langueNextCourseMock,
  languePlannedSessionsMock,
  langueProgressFallbackPct,
  langueProgressSteps,
  langueUnplannedSessionsMock,
} from '~/config/projet-langue-mock'

definePageMeta({ middleware: 'auth' })

const { t, locale } = useI18n()
const localePath = useLocalePath()

type TabId = 'planned' | 'unplanned'
const route = useRoute()
const router = useRouter()
const activeTab = ref<TabId>(
  route.query.tab === 'unplanned' || route.query.tab === 'planned'
    ? route.query.tab
    : 'planned',
)

function setTab(tab: TabId) {
  activeTab.value = tab
  void router.replace({ query: { ...route.query, tab } })
}

const { data: languages, apiError, isInitialLoading, refresh } = await usePageData(
  'langues-unplanned',
  () => planningRepo.unplanned(locale.value),
  { watch: [locale] },
)

const { data: sessions } = await usePageData(
  'langues-planned',
  () => planningRepo.planned(locale.value),
  { watch: [locale] },
)

const primaryLanguage = computed(() => (languages.value ?? [])[0] ?? null)

const progressPct = computed(() => {
  const lang = primaryLanguage.value
  if (!lang || lang.totalHours <= 0) return langueProgressFallbackPct
  return Math.min(100, Math.round((lang.totalPlanned / lang.totalHours) * 100))
})

function formatSessionTime(session: PlannedSession): string {
  if (!session.startDate || !session.endDate) return ''
  const start = new Date(session.startDate)
  const end = new Date(session.endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return ''
  const tf = new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' })
  const mins = Math.round((end.getTime() - start.getTime()) / 60000)
  const hours = Math.max(1, Math.round(mins / 60))
  return `${tf.format(start)} – ${tf.format(end)} (${hours}h)`
}

function formatSessionDate(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const raw = new Intl.DateTimeFormat(locale.value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date)
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

const plannedCards = computed(() => {
  const api = sessions.value ?? []
  if (api.length > 0) {
    return api.map((session) => ({
      id: session.id,
      title: session.title || t('languagePlanning.defaultSessionTitle'),
      timeLabel: formatSessionTime(session),
      dateLabel: formatSessionDate(session.startDate),
    }))
  }
  return languePlannedSessionsMock
})

/** Cartes onglet « à planifier » — API si dispo, sinon mock Langues 2. */
const unplannedCards = computed(() => {
  const list = languages.value ?? []
  const fromApi = list.flatMap((language: LanguageProgress) =>
    language.lessons.map((lesson, index) => {
      const lang = encodeURIComponent(language.title)
      const to = language.courseId === null
        ? null
        : lesson.needsTeacher
          ? `/mon-projet/langues/${language.courseId}/professeur?order=${lesson.orderId}&lang=${lang}`
          : `/mon-projet/langues/${language.courseId}/planifier?order=${lesson.orderId}&teacher=${lesson.teacher?.id ?? ''}&lang=${lang}`
      return {
        id: `${language.title}-${lesson.orderId}-${index}`,
        title: language.title || t('languagePlanning.defaultSessionTitle'),
        durationLabel: t('languageProject.duration60'),
        to,
      }
    }),
  )
  return fromApi.length > 0 ? fromApi : langueUnplannedSessionsMock
})

const countdownTarget = computed(() => {
  const upcoming = (sessions.value ?? [])
    .map(s => s.startDate)
    .filter((d): d is string => Boolean(d))
    .map(d => new Date(d).getTime())
    .filter(t => t > Date.now())
    .sort((a, b) => a - b)[0]

  if (upcoming) return upcoming
  return Date.now() + (22 * 3600 + 18 * 60 + 35) * 1000
})

const nowTick = ref(Date.now())
let countdownTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  countdownTimer = setInterval(() => { nowTick.value = Date.now() }, 1000)
})
onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})

const countdownParts = computed(() => {
  const diff = Math.max(0, countdownTarget.value - nowTick.value)
  const totalSec = Math.floor(diff / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return { h, m, s }
})

const nextCourseLabels = computed(() => {
  const apiNext = (sessions.value ?? [])
    .filter(s => s.startDate && new Date(s.startDate).getTime() > Date.now())
    .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime())[0]

  if (apiNext) {
    return {
      dateLabel: formatSessionDate(apiNext.startDate),
      timeLabel: formatSessionTime(apiNext),
    }
  }
  return {
    dateLabel: langueNextCourseMock.dateLabel,
    timeLabel: langueNextCourseMock.timeLabel,
  }
})

usePageSeo(() => ({
  title: t('languageProject.seoTitle'),
  description: t('languageProject.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <!-- gap-22 = topbar → Ma progression (et entre sections) ; TopBar gap=0 pour éviter un double 22 -->
  <div class="flex w-full flex-col gap-22 pb-22">
    <AppTopBar back back-to="/mon-projet" :notifications="3" :gap="0" />

    <PageState
      :loading="isInitialLoading"
      :error="apiError"
      :empty="false"
      :on-retry="() => refresh()"
    >
      <template #loading>
        <div class="flex flex-col gap-22">
          <QSkeleton variant="rect" :height="180" />
          <QSkeleton variant="rect" :height="41" />
          <QSkeleton v-for="i in 3" :key="i" variant="rect" :height="90" />
        </div>
      </template>

      <div class="flex w-full flex-col gap-22">
        <!-- Ma progression -->
        <section
          class="box-border flex w-full flex-col rounded-[10px] border border-[#f3f4f6] bg-[#faf9fd] px-19 py-25 shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
          aria-labelledby="lang-progress-title"
        >
          <div class="flex w-full items-start justify-between gap-12">
            <div class="min-w-0 flex-1">
              <h1 id="lang-progress-title" class="m-0 text-[18px] leading-28 font-bold text-[#0a142f]">
                {{ $t('languageProject.progressTitle') }}
              </h1>
              <p class="m-0 pt-4 text-[10px] leading-20 font-normal text-[rgba(10,20,47,0.7)]">
                {{ $t('languageProject.progressHint') }}
              </p>
            </div>
            <div class="flex shrink-0 flex-col items-end">
              <p class="m-0 text-[24px] leading-30 font-bold text-[#fc037f]">{{ progressPct }}%</p>
              <p class="m-0 text-[12px] leading-16 font-medium tracking-[0.3px] text-[#0a142f]">
                {{ $t('languageProject.progressDone') }}
              </p>
            </div>
          </div>

          <div class="w-full pt-16">
            <div class="h-6 w-full overflow-hidden rounded-full bg-[#e8e8ff]">
              <div class="h-6 rounded-full bg-[#fc037f]" :style="{ width: `${progressPct}%` }" />
            </div>
          </div>

          <div class="relative flex w-full items-start justify-between pt-24">
            <div class="pointer-events-none absolute top-41 left-47 right-47 h-0 border-t border-[#e5e7eb]" aria-hidden="true" />
            <template v-for="step in langueProgressSteps" :key="step.id">
              <NuxtLink
                v-if="step.labelKey === 'languageProject.step5'"
                :to="localePath('/mon-projet/langues/certification')"
                class="relative z-1 flex w-64 flex-col items-center gap-8 no-underline"
              >
                <span
                  v-if="step.status === 'done'"
                  class="flex size-32 items-center justify-center rounded-full bg-[#fb027d]"
                >
                  <img src="/img/icons/mpl-langue/check.svg" alt="" width="16" height="16" class="block size-16">
                </span>
                <span
                  v-else-if="step.status === 'current'"
                  class="flex size-32 items-center justify-center rounded-full border border-[#fb027d] bg-white"
                >
                  <span class="text-[14px] leading-24 font-medium text-[#fb027d]">{{ step.id }}</span>
                </span>
                <span
                  v-else
                  class="flex size-32 items-center justify-center rounded-full border border-[#e5e7eb] bg-white"
                >
                  <span class="text-[14px] leading-24 font-medium text-[#66619e]">{{ step.id }}</span>
                </span>
                <p
                  :class="[
                    'm-0 whitespace-pre-line text-center text-[10px] leading-[12.5px]',
                    step.status === 'current' ? 'font-semibold text-black' : '',
                    step.status === 'todo' ? 'font-normal text-[#9ca3af]' : '',
                    step.status === 'done' ? 'font-normal text-black' : '',
                  ]"
                >{{ $t(step.labelKey) }}</p>
              </NuxtLink>
              <div
                v-else
                class="relative z-1 flex w-64 flex-col items-center gap-8"
              >
                <span
                  v-if="step.status === 'done'"
                  class="flex size-32 items-center justify-center rounded-full bg-[#fb027d]"
                >
                  <img src="/img/icons/mpl-langue/check.svg" alt="" width="16" height="16" class="block size-16">
                </span>
                <span
                  v-else-if="step.status === 'current'"
                  class="flex size-32 items-center justify-center rounded-full border border-[#fb027d] bg-white"
                >
                  <span class="text-[14px] leading-24 font-medium text-[#fb027d]">{{ step.id }}</span>
                </span>
                <span
                  v-else
                  class="flex size-32 items-center justify-center rounded-full border border-[#e5e7eb] bg-white"
                >
                  <span class="text-[14px] leading-24 font-medium text-[#66619e]">{{ step.id }}</span>
                </span>
                <p
                  :class="[
                    'm-0 whitespace-pre-line text-center text-[10px] leading-[12.5px]',
                    step.status === 'current' ? 'font-semibold text-black' : '',
                    step.status === 'todo' ? 'font-normal text-[#9ca3af]' : '',
                    step.status === 'done' ? 'font-normal text-black' : '',
                  ]"
                >{{ $t(step.labelKey) }}</p>
              </div>
            </template>
          </div>
        </section>

        <!-- Prochain cours : hauteur au contenu ; compteur responsive (s → m masqués) -->
        <aside
          class="box-border flex w-full flex-col rounded-2xl p-16 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]"
          style="background-image: linear-gradient(157.8deg, #4f46e5 0%, #ff0055 100%)"
        >
          <div class="flex w-full items-stretch gap-10">
            <div class="flex min-w-0 flex-1 flex-col justify-center">
              <div class="flex items-center gap-8">
                <span class="relative size-28 shrink-0 overflow-hidden">
                  <img src="/img/icons/mpl-langue/next-cal.svg" alt="" width="28" height="28" class="block size-28">
                </span>
                <h2 class="m-0 text-[13px] leading-20 font-semibold text-white">{{ $t('languageProject.nextTitle') }}</h2>
              </div>
              <div class="flex flex-col gap-4 pt-8">
                <p class="m-0 flex items-center gap-8 text-[10px] leading-16 font-normal text-white/90">
                  <img src="/img/icons/mpl-langue/next-date.svg" alt="" width="14" height="14" class="block size-14 shrink-0">
                  <span>{{ nextCourseLabels.dateLabel }}</span>
                </p>
                <p class="m-0 flex items-center gap-8 text-[10px] leading-16 font-normal text-white/90">
                  <img src="/img/icons/mpl-langue/next-clock.svg" alt="" width="14" height="14" class="block size-14 shrink-0">
                  <span>{{ nextCourseLabels.timeLabel }}</span>
                </p>
              </div>
            </div>

            <!-- Séparateur + bloc compteur décalés vers la gauche -->
            <div class="-ml-8 flex shrink-0 items-stretch gap-8">
              <div class="w-px shrink-0 self-stretch bg-white/20" aria-hidden="true" />

              <div class="flex flex-col items-center justify-center">
                <p class="m-0 pb-6 text-[12px] leading-16 font-normal text-white">{{ $t('languageProject.startsIn') }}</p>
                <div class="flex items-center gap-6">
                  <div class="flex size-40 flex-col items-center justify-center rounded-lg bg-white">
                    <span class="text-[16px] leading-20 font-bold text-[#fc037f]">{{ countdownParts.h }}</span>
                    <span class="text-[8px] leading-10 font-medium text-[#fc037f]">{{ $t('languageProject.unitH') }}</span>
                  </div>
                  <div class="flex size-40 flex-col items-center justify-center rounded-lg bg-white max-2xs:hidden">
                    <span class="text-[16px] leading-20 font-bold text-[#fc037f]">{{ countdownParts.m }}</span>
                    <span class="text-[8px] leading-10 font-medium text-[#fc037f]">{{ $t('languageProject.unitMin') }}</span>
                  </div>
                  <div class="flex size-40 flex-col items-center justify-center rounded-lg bg-white max-xs:hidden">
                    <span class="text-[16px] leading-20 font-bold text-[#fc037f]">{{ countdownParts.s }}</span>
                    <span class="text-[8px] leading-10 font-medium text-[#fc037f]">{{ $t('languageProject.unitS') }}</span>
                  </div>
                  <button
                    type="button"
                    class="inline-flex size-40 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-white p-0"
                    :aria-label="$t('languageProject.connect')"
                  >
                    <img src="/img/icons/mpl-langue/connect-video.svg" alt="" width="16" height="16" class="block size-16">
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Onglets + listes : hauteur = panneau actif uniquement (pas de scroll fantôme) -->
        <section class="flex w-full flex-col gap-22">
          <div
            class="box-border flex h-41 w-full items-stretch rounded-[6px] border border-[#efeff7] bg-[#f8f8fd] p-px"
            role="tablist"
            :aria-label="$t('languageProject.tabsLabel')"
          >
            <button
              type="button"
              role="tab"
              :aria-selected="activeTab === 'planned'"
              :class="[
                'flex h-full min-w-0 flex-1 cursor-pointer items-center justify-center gap-8 rounded-[5px] border-0',
                activeTab === 'planned'
                  ? 'border-b border-[#fa007b] bg-[#fefefe] text-[#fa007a]'
                  : 'bg-transparent text-black',
              ]"
              @click="setTab('planned')"
            >
              <img src="/img/icons/mpl-langue/tab-planned.svg" alt="" width="10" height="12" class="block h-12 w-10 shrink-0">
              <span class="text-[11px] leading-[19.5px] font-medium whitespace-nowrap">{{ $t('languageProject.tabPlanned') }}</span>
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="activeTab === 'unplanned'"
              :class="[
                'flex h-full min-w-0 flex-1 cursor-pointer items-center justify-center gap-8 rounded-[5px] border-0',
                activeTab === 'unplanned'
                  ? 'border-b border-[#4b32f9] bg-[#f5f4fd] text-[#4329f7]'
                  : 'bg-transparent text-black',
              ]"
              @click="setTab('unplanned')"
            >
              <img src="/img/icons/mpl-langue/tab-unplanned.svg" alt="" width="10" height="10" class="block size-10 shrink-0">
              <span class="text-[11px] leading-[19.5px] font-medium whitespace-nowrap">{{ $t('languageProject.tabUnplanned') }}</span>
            </button>
          </div>

          <!-- Cours planifiés -->
          <div
            v-show="activeTab === 'planned'"
            class="flex w-full flex-col gap-12"
            role="tabpanel"
            :aria-hidden="activeTab !== 'planned'"
          >
            <article
              v-for="card in plannedCards"
              :key="card.id"
              class="relative box-border flex w-full items-center gap-16 overflow-hidden rounded-2xl border border-[#f3f4f6] bg-white px-17 py-13 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"
            >
              <span class="absolute top-0 bottom-0 left-0 w-4 bg-[#fd087d]" aria-hidden="true" />
              <span class="relative size-44 shrink-0 overflow-hidden">
                <img src="/img/icons/mpl-langue/session-cal.svg" alt="" width="44" height="44" class="block size-44">
              </span>
              <div class="min-w-0 flex-1">
                <h2 class="m-0 text-[14px] leading-[22.5px] font-semibold text-[#0a142f]">{{ card.title }}</h2>
                <p class="m-0 flex items-center gap-6 pt-4 text-[12px] leading-16 font-normal text-[rgba(10,20,47,0.6)]">
                  <img src="/img/icons/mpl-langue/clock.svg" alt="" width="14" height="14" class="block size-14 shrink-0">
                  <span>{{ card.timeLabel }}</span>
                </p>
                <p class="m-0 flex items-center gap-6 pt-2 text-[12px] leading-16 font-normal text-[rgba(10,20,47,0.6)]">
                  <img src="/img/icons/mpl-langue/calendar.svg" alt="" width="14" height="14" class="block size-14 shrink-0">
                  <span>{{ card.dateLabel }}</span>
                </p>
              </div>
              <button
                type="button"
                class="inline-flex shrink-0 cursor-pointer items-center justify-center gap-6 rounded-lg border border-[#371bfa] bg-transparent px-7 py-9 text-[10px] leading-16 font-semibold whitespace-nowrap text-[#371bfa]"
              >
                <img src="/img/icons/mpl-langue/video.svg" alt="" width="16" height="16" class="block size-16">
                <span>{{ $t('languageProject.connect') }}</span>
              </button>
            </article>
          </div>

          <!-- Cours à planifier -->
          <div
            v-show="activeTab === 'unplanned'"
            class="flex w-full flex-col gap-12"
            role="tabpanel"
            :aria-hidden="activeTab !== 'unplanned'"
          >
            <article
              v-for="card in unplannedCards"
              :key="card.id"
              class="relative box-border flex w-full items-center gap-16 overflow-hidden rounded-2xl border border-[#f3f4f6] bg-white px-17 py-13 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"
            >
              <span class="absolute top-0 bottom-0 left-0 w-4 bg-[#fd087d]" aria-hidden="true" />
              <span class="relative size-44 shrink-0 overflow-hidden">
                <img src="/img/icons/mpl-langue/session-cal.svg" alt="" width="44" height="44" class="block size-44">
              </span>
              <div class="min-w-0 flex-1">
                <h2 class="m-0 text-[14px] leading-[22.5px] font-semibold text-[#0a142f]">{{ card.title }}</h2>
                <p class="m-0 pt-4 text-[12px] leading-16 font-normal text-[rgba(10,20,47,0.6)]">
                  {{ card.durationLabel }}
                </p>
              </div>
              <NuxtLink
                v-if="card.to"
                :to="localePath(card.to)"
                class="inline-flex shrink-0 items-center justify-center gap-6 rounded-lg border border-[#371bfa] bg-transparent px-7 py-9 text-[10px] leading-16 font-semibold whitespace-nowrap text-[#371bfa] no-underline"
              >
                <img src="/img/icons/mpl-langue/video.svg" alt="" width="16" height="16" class="block size-16">
                <span>{{ $t('languageProject.schedule') }}</span>
              </NuxtLink>
              <button
                v-else
                type="button"
                class="inline-flex shrink-0 cursor-pointer items-center justify-center gap-6 rounded-lg border border-[#371bfa] bg-transparent px-7 py-9 text-[10px] leading-16 font-semibold whitespace-nowrap text-[#371bfa]"
              >
                <img src="/img/icons/mpl-langue/video.svg" alt="" width="16" height="16" class="block size-16">
                <span>{{ $t('languageProject.schedule') }}</span>
              </button>
            </article>
          </div>
        </section>
      </div>
    </PageState>
  </div>
</template>
