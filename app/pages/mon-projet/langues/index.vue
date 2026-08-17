<script setup lang="ts">
/**
 * Mes cours de langues — pas de maquette (aucun écran `mon-projet-langues.html`
 * n'existe ; voir la mémoire « quatre-parcours-paiement », validé avec le
 * responsable le 2026-08-17). Construit avec le design system plutôt que
 * porté d'une page `maquette/pwa/`.
 *
 * Regroupe par **langue**, pas par commande : une langue peut cumuler
 * plusieurs commandes (`mon-projet/index` en liste une carte par commande ;
 * ici leurs heures s'additionnent). Le professeur se choisit **par
 * commande** (`Order.profile_id`), pas par langue — la première heure non
 * planifiée (`lessons[0]`) porte la commande concernée par la prochaine
 * étape.
 */
import type { LanguageProgress } from '~/core/contracts'
import { planningRepo } from '~/core/repositories'

definePageMeta({ middleware: 'auth' })

const { t, locale } = useI18n()
const localePath = useLocalePath()

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

function sessionsFor(courseId: string | null) {
  if (courseId === null) return []
  return (sessions.value ?? []).filter((session) => session.courseId === courseId)
}

/** Étape suivante pour la première heure non planifiée — `null` si la langue est déjà entièrement planifiée. */
function nextStepPath(language: LanguageProgress): string | null {
  const next = language.lessons[0]
  if (!next || language.courseId === null) return null

  const lang = encodeURIComponent(language.title)
  return next.needsTeacher
    ? `/mon-projet/langues/${language.courseId}/professeur?order=${next.orderId}&lang=${lang}`
    : `/mon-projet/langues/${language.courseId}/planifier?order=${next.orderId}&teacher=${next.teacher?.id ?? ''}&lang=${lang}`
}

function formatSessionDate(iso: string | null): string {
  if (iso === null) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(date)
}

usePageSeo(() => ({
  title: t('languagePlanning.seoTitle'),
  description: t('languagePlanning.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <AppTopBar back back-to="/mon-projet" :notifications="3" />

  <div class="w-full pb-22">
    <h1 class="m-0 text-4xl leading-normal font-semibold tracking-tight text-text">
      {{ $t('languagePlanning.title') }}
    </h1>
    <p class="m-0 text-xl leading-[22.75px] text-text">
      {{ $t('languagePlanning.intro') }}
    </p>
  </div>

  <PageState
    :loading="isInitialLoading"
    :error="apiError"
    :empty="(languages ?? []).length === 0"
    :on-retry="() => refresh()"
  >
    <template #loading>
      <div class="flex flex-col gap-16">
        <QSkeleton v-for="index in 3" :key="index" variant="rect" :height="140" />
      </div>
    </template>

    <template #empty>
      <QEmptyState :title="$t('languagePlanning.emptyTitle')" :description="$t('languagePlanning.emptyDescription')" />
    </template>

    <div class="flex w-full flex-col gap-16">
      <QCard v-for="language in languages" :key="language.title" padding="md">
        <div class="flex items-center gap-12">
          <img
            v-if="language.flag"
            :src="language.flag"
            alt=""
            width="28"
            height="28"
            class="block size-28 shrink-0 rounded-full object-cover"
          >
          <div class="min-w-0 flex-1">
            <p class="m-0 text-xl font-semibold text-navy">{{ language.title }}</p>
            <p class="m-0 text-sm text-muted-2">
              {{ $t('languagePlanning.hoursProgress', { planned: language.totalPlanned, total: language.totalHours }) }}
            </p>
          </div>
        </div>

        <div class="mt-10 h-6 w-full overflow-hidden rounded-full bg-border-soft">
          <span
            class="block h-full rounded-full bg-primary"
            :style="{ width: `${language.totalHours > 0 ? Math.min(100, (language.totalPlanned / language.totalHours) * 100) : 0}%` }"
          />
        </div>

        <!-- Séances à venir -->
        <div v-if="sessionsFor(language.courseId).length > 0" class="mt-16 flex flex-col gap-8">
          <p class="m-0 text-sm font-semibold text-navy">{{ $t('languagePlanning.upcomingTitle') }}</p>
          <div
            v-for="session in sessionsFor(language.courseId)"
            :key="session.id"
            class="flex items-center gap-8 rounded-lg bg-surface-2 p-8"
          >
            <img
              v-if="session.teacher?.photo"
              :src="session.teacher.photo"
              alt=""
              width="28"
              height="28"
              class="block size-28 shrink-0 rounded-full object-cover"
            >
            <div class="min-w-0 flex-1 text-sm text-text">
              <p class="m-0 font-medium">{{ session.teacher?.fullName ?? $t('languagePlanning.noTeacher') }}</p>
              <p class="m-0 text-muted-2">{{ formatSessionDate(session.startDate) }}</p>
            </div>
          </div>
        </div>

        <QButton
          v-if="nextStepPath(language)"
          :to="localePath(nextStepPath(language)!)"
          block
          class="mt-16"
        >
          {{ $t('languagePlanning.planNext') }}
        </QButton>
      </QCard>
    </div>
  </PageState>
</template>
