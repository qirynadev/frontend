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
import { paymentRepo, planningRepo } from '~/core/repositories'
import type { LangueProgressStepStatus } from '~/config/projet-langue-mock'
import {
  langueNextCourseMock,
  langueProgressSteps,
} from '~/config/projet-langue-mock'
import { NuxtLink } from '#components'

/** Cartes par page, sur les deux onglets (planifiés / à planifier). */
const CARDS_PER_PAGE = 5

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

/** Horloge d'affichage — countdown et fenêtre de rejointure (`canJoinSession`) en dépendent. */
const nowTick = ref(Date.now())
let nowTickTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  nowTickTimer = setInterval(() => { nowTick.value = Date.now() }, 1000)
})
onBeforeUnmount(() => {
  if (nowTickTimer) clearInterval(nowTickTimer)
})

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

const { data: orders } = await usePageData(
  'langues-orders',
  () => paymentRepo.orders(locale.value),
  { watch: [locale] },
)

/** Vrai si le client a au moins une commande langue (planifiée ou non). */
const hasLanguageData = computed(() => (languages.value?.length ?? 0) > 0 || (sessions.value?.length ?? 0) > 0)

const courseOrders = computed(() => (orders.value ?? []).filter((order) => order.serviceType === 'course'))

/**
 * Avancement d'une commande de langue (étapes de la commande — `Order.checklist`
 * — pas les heures planifiées) ; moyenne de toutes les commandes langue s'il y
 * en a plusieurs (demande du responsable, 2026-08-30 — même principe que les
 * cartes de `mon-projet/index.vue`). 0 % sans commande plutôt qu'une valeur
 * inventée.
 */
const progressPct = computed(() => {
  const list = courseOrders.value
  if (list.length === 0) return 0
  const total = list.reduce((sum, order) => sum + orderChecklistProgress(order), 0)
  return Math.round(total / list.length)
})

/**
 * Statut des 3 pastilles (« Ma progression ») dérivé de `progressPct` — le
 * détail des étapes internes (`Order.checklist`) n'a pas de règle validée
 * pour ce cumul (§7, `docs/directives-backend.md`) : plutôt qu'inventer une
 * agrégation, seul le pourcentage déjà tranché par le responsable alimente
 * ces trois pastilles.
 */
const progressSteps = computed(() => langueProgressSteps.map((step, index) => {
  const status: LangueProgressStepStatus = progressPct.value >= 100
    ? 'done'
    : index === 0 ? 'done' : index === 1 ? 'current' : 'todo'
  return { ...step, status }
}))

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

/**
 * Rejoignable dès 2 min avant le début, jusqu'à la fin — même principe que
 * l'ancien projet (legacy, fenêtre de 15 min), fenêtre resserrée à 2 min à la
 * demande du responsable (2026-08-30).
 */
const JOIN_WINDOW_MS = 2 * 60 * 1000
function canJoinSession(session: PlannedSession): boolean {
  if (!session.startDate || !session.endDate || !session.meetingSessionName) return false
  const start = new Date(session.startDate).getTime()
  const end = new Date(session.endDate).getTime()
  return nowTick.value >= start - JOIN_WINDOW_MS && nowTick.value < end
}

function joinSession(sessionId: string) {
  void router.push(localePath(`/mon-projet/langues/visio/${sessionId}`))
}

/** Cartes onglet « planifiés » — vide si aucune séance n'est planifiée, pas de repli fictif. */
const plannedCards = computed(() => (sessions.value ?? []).map((session) => ({
  id: session.id,
  title: session.title || t('languagePlanning.defaultSessionTitle'),
  timeLabel: formatSessionTime(session),
  dateLabel: formatSessionDate(session.startDate),
  canJoin: canJoinSession(session),
})))

/** Cartes onglet « à planifier » — vide si tout est déjà planifié, pas de repli fictif. */
const unplannedCards = computed(() => (languages.value ?? []).flatMap((language: LanguageProgress) =>
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
))

/** Pagination client des deux listes, indépendante l'une de l'autre. */
function usePagedList<T>(list: Ref<T[]>) {
  const page = ref(1)
  const totalPages = computed(() => Math.max(1, Math.ceil(list.value.length / CARDS_PER_PAGE)))
  const paged = computed(() => {
    const start = (page.value - 1) * CARDS_PER_PAGE
    return list.value.slice(start, start + CARDS_PER_PAGE)
  })
  watch(totalPages, (total) => {
    if (page.value > total) page.value = total
  })
  return { page, totalPages, paged }
}

const { page: plannedPage, totalPages: plannedTotalPages, paged: pagedPlannedCards } = usePagedList(plannedCards)
const { page: unplannedPage, totalPages: unplannedTotalPages, paged: pagedUnplannedCards } = usePagedList(unplannedCards)

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

const countdownParts = computed(() => {
  const diff = Math.max(0, countdownTarget.value - nowTick.value)
  const totalSec = Math.floor(diff / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return { h, m, s }
})

/** Prochaine séance réelle (déjà planifiée), pas encore terminée — `null` si aucune. */
const nextSession = computed(() => (sessions.value ?? [])
  .filter(s => s.endDate && new Date(s.endDate).getTime() > nowTick.value)
  .sort((a, b) => new Date(a.startDate ?? 0).getTime() - new Date(b.startDate ?? 0).getTime())[0] ?? null)

const nextCourseLabels = computed(() => {
  const apiNext = nextSession.value
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

const canJoinNext = computed(() => {
  const session = nextSession.value
  return session !== null && canJoinSession(session)
})

function joinNextSession() {
  const session = nextSession.value
  if (!session || !canJoinNext.value) return
  joinSession(session.id)
}

usePageSeo(() => ({
  title: t('languageProject.seoTitle'),
  description: t('languageProject.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <!-- gap-22 = topbar → Ma progression (et entre sections) ; TopBar gap=0 pour éviter un double 22 -->
  <div class="flex w-full flex-col gap-22 pb-22">
    <AppTopBar back back-to="/mon-projet" :gap="0" />

    <PageState
      :loading="isInitialLoading"
      :error="apiError"
      :empty="!hasLanguageData"
      :on-retry="() => refresh()"
    >
      <template #loading>
        <div class="flex flex-col gap-22">
          <QSkeleton variant="rect" :height="180" />
          <QSkeleton variant="rect" :height="41" />
          <QSkeleton v-for="i in 3" :key="i" variant="rect" :height="90" />
        </div>
      </template>

      <template #empty>
        <QEmptyState :title="$t('languagePlanning.emptyTitle')" :description="$t('languagePlanning.emptyDescription')">
          <template #action>
            <QButton :to="localePath('/langues')">{{ $t('languagePlanning.discoverCta') }}</QButton>
          </template>
        </QEmptyState>
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
            <!-- Ligne centrée sur les pastilles 32px (top 16px), 3 colonnes. -->
            <div
              class="pointer-events-none absolute top-40 left-[16.67%] right-[16.67%] z-0 border-t border-[#e5e7eb]"
              aria-hidden="true"
            />
            <component
              :is="step.to ? NuxtLink : 'div'"
              v-for="step in progressSteps"
              :key="step.id"
              :to="step.to ? localePath(step.to) : undefined"
              :class="[
                'relative z-1 flex w-64 flex-col items-center gap-8',
                step.to ? 'no-underline' : '',
              ]"
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
            </component>
          </div>
        </section>

        <!-- Onglets + listes (grille empilée = hauteur stable au changement d’onglet) -->
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

          <div class="grid w-full">
            <!-- Cours planifiés (Langue 1) -->
            <div
              :class="[
                'col-start-1 row-start-1 flex w-full flex-col gap-12',
                activeTab === 'planned' ? 'visible' : 'invisible pointer-events-none',
              ]"
              :aria-hidden="activeTab !== 'planned'"
            >
              <QEmptyState
                v-if="plannedCards.length === 0"
                icon="clock"
                :title="$t('languagePlanning.plannedEmptyTitle')"
                :description="$t('languagePlanning.plannedEmptyDescription')"
              />
              <article
                v-for="card in pagedPlannedCards"
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
                  :disabled="!card.canJoin"
                  :class="[
                    'inline-flex shrink-0 items-center justify-center gap-6 rounded-lg border border-[#371bfa] bg-transparent px-7 py-9 text-[10px] leading-16 font-semibold whitespace-nowrap text-[#371bfa]',
                    card.canJoin ? 'cursor-pointer' : 'cursor-not-allowed opacity-40',
                  ]"
                  @click="joinSession(card.id)"
                >
                  <img src="/img/icons/mpl-langue/video.svg" alt="" width="16" height="16" class="block size-16">
                  <span>{{ $t('languageProject.connect') }}</span>
                </button>
              </article>

              <QPager
                v-if="plannedTotalPages > 1"
                v-model:page="plannedPage"
                :total="plannedTotalPages"
                :aria-label="$t('languagePlanning.plannedPagerLabel')"
                class="!px-0"
              />
            </div>

            <!-- Cours à planifier (Langues 2) -->
            <div
              :class="[
                'col-start-1 row-start-1 flex w-full flex-col gap-12',
                activeTab === 'unplanned' ? 'visible' : 'invisible pointer-events-none',
              ]"
              :aria-hidden="activeTab !== 'unplanned'"
            >
              <QEmptyState
                v-if="unplannedCards.length === 0"
                icon="clock"
                :title="$t('languagePlanning.unplannedEmptyTitle')"
                :description="$t('languagePlanning.unplannedEmptyDescription')"
              />
              <article
                v-for="card in pagedUnplannedCards"
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

              <QPager
                v-if="unplannedTotalPages > 1"
                v-model:page="unplannedPage"
                :total="unplannedTotalPages"
                :aria-label="$t('languagePlanning.unplannedPagerLabel')"
                class="!px-0"
              />
            </div>
          </div>
        </section>

        <!-- Prochain cours : icône plus petite, proche du titre ; infos calées à gauche -->
        <aside
          class="box-border flex min-h-151 w-full flex-col rounded-2xl p-20 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]"
          style="background-image: linear-gradient(157.8deg, #4f46e5 0%, #ff0055 100%)"
        >
          <div class="flex w-full items-start gap-10">
            <div class="flex min-w-0 flex-1 flex-col">
              <div class="flex items-center gap-8">
                <span class="relative size-28 shrink-0 overflow-hidden">
                  <img src="/img/icons/mpl-langue/next-cal.svg" alt="" width="28" height="28" class="block size-28">
                </span>
                <h2 class="m-0 text-[13px] leading-28 font-semibold text-white">{{ $t('languageProject.nextTitle') }}</h2>
              </div>
              <div class="flex flex-col gap-6 pt-8">
                <p class="m-0 flex items-center gap-8 text-[10px] leading-20 font-normal text-white/90">
                  <img src="/img/icons/mpl-langue/next-date.svg" alt="" width="14" height="14" class="block size-14 shrink-0">
                  <span>{{ nextCourseLabels.dateLabel }}</span>
                </p>
                <p class="m-0 flex items-center gap-8 text-[10px] leading-20 font-normal text-white/90">
                  <img src="/img/icons/mpl-langue/next-clock.svg" alt="" width="14" height="14" class="block size-14 shrink-0">
                  <span>{{ nextCourseLabels.timeLabel }}</span>
                </p>
                <p class="m-0 flex items-center gap-8 text-[10px] leading-20 font-normal text-white/90">
                  <img src="/img/icons/mpl-langue/next-video.svg" alt="" width="14" height="14" class="block size-14 shrink-0">
                  <span>{{ $t('languageProject.visio') }}</span>
                </p>
              </div>
            </div>

            <div class="mx-4 h-96 w-px shrink-0 bg-white/20" aria-hidden="true" />

            <div class="flex shrink-0 flex-col items-center">
              <p class="m-0 pb-8 text-[12px] leading-16 font-normal text-white">{{ $t('languageProject.startsIn') }}</p>
              <div class="flex items-start gap-8">
                <div class="flex size-40 flex-col items-center justify-center rounded-lg bg-white">
                  <span class="text-[16px] leading-20 font-bold text-[#fc037f]">{{ countdownParts.h }}</span>
                  <span class="text-[8px] leading-10 font-medium text-[#fc037f]">{{ $t('languageProject.unitH') }}</span>
                </div>
                <div class="flex size-40 flex-col items-center justify-center rounded-lg bg-white">
                  <span class="text-[16px] leading-20 font-bold text-[#fc037f]">{{ countdownParts.m }}</span>
                  <span class="text-[8px] leading-10 font-medium text-[#fc037f]">{{ $t('languageProject.unitMin') }}</span>
                </div>
                <div class="flex size-40 flex-col items-center justify-center rounded-lg bg-white">
                  <span class="text-[16px] leading-20 font-bold text-[#fc037f]">{{ countdownParts.s }}</span>
                  <span class="text-[8px] leading-10 font-medium text-[#fc037f]">{{ $t('languageProject.unitS') }}</span>
                </div>
              </div>
              <button
                type="button"
                :disabled="!canJoinNext"
                :class="[
                  'mt-12 inline-flex items-center justify-center gap-6 rounded-full border-0 bg-white px-14 py-8 text-[10px] leading-16 font-semibold text-[#fc037f]',
                  canJoinNext ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
                ]"
                @click="joinNextSession"
              >
                <img src="/img/icons/mpl-langue/connect-video.svg" alt="" width="14" height="14" class="block size-14">
                <span>{{ $t('languageProject.connect') }}</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </PageState>
  </div>
</template>
