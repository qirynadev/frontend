<script setup lang="ts">
/**
 * Mon projet — Orientation ← `maquette/pwa/pages/mon-projet-orientation.html`.
 *
 * Bilan du parcours d'orientation, protégé par le middleware `auth`.
 *
 * | Bloc | Règles reprises de `app.css` |
 * |---|---|
 * | progression | `.mpo-progress` `padding: 25px 19px` · titre 18px/28px · pourcentage 24px/30px rose |
 * | jalons | 5 pastilles de 32px, libellés 10px/12,5px · trait de liaison positionné par script |
 * | profil | `.mpo-profile-card` fond `#fff6f9`, illustration 109×102 · badge + bouton à parts égales |
 * | test | `.mpo-test-card` `padding: 17px 11px` · deux illustrations encadrant la copie, la seconde alignée en bas |
 * | à savoir | `.mpo-info` fond `#f4f7fb` · puces cerclées 16px, texte 12,5px/17,188px |
 * | aide | `.mpo-support` fond `#fff6f8`, bouton contourné rose |
 *
 * Le trait des jalons est calculé comme dans la maquette (centre de la
 * première pastille au centre de la dernière). Même correctif que
 * `MpaStepsCard` : un `ResizeObserver` couvre le montage, sans quoi le trait
 * reste sans style en ligne, donc invisible.
 *
 * Resynchronisation données réelles (Chantier 4, 2026-08-18) : la maquette
 * n'a que l'état « 100% terminé », cinq jalons figés qui racontent un
 * parcours de cours de langue (Inscription/Test de niveau/Cours en
 * cours/Évaluation intermédiaire/Certification finale) sur un écran de bilan
 * d'orientation — voir `useOrientationData` pour les trois jalons réels qui
 * les remplacent.
 */
import { orientationEvaluationRepo } from '~/core/repositories'

definePageMeta({ middleware: 'auth' })

const { t, locale } = useI18n()

const { data: orientation, apiError, isInitialLoading, refresh } = await useOrientationData(locale)

const reportPending = ref(false)

/** Les URL de PDF ne sont pas portées par la liste (`has_pdf` seul) — second appel à la demande. */
async function openReport() {
  const evaluation = orientation.value?.evaluation
  if (!evaluation || reportPending.value) return

  reportPending.value = true
  try {
    const pdf = await orientationEvaluationRepo.pdf(evaluation.id, locale.value)
    const url = pdf.synthese ?? pdf.programme ?? pdf.detail ?? pdf.programmeDetail ?? pdf.candidat
    if (url) window.open(url, '_blank', 'noopener')
  }
  catch {
    // Action secondaire : un échec ne bloque pas la page, l'utilisateur peut réessayer.
  }
  finally {
    reportPending.value = false
  }
}

const infoKeys = [
  'projectOrientation.infoProfile',
  'projectOrientation.infoReport',
  'projectOrientation.infoDownload',
]

const milestonesRef = ref<HTMLDivElement | null>(null)
const lineRef = ref<HTMLSpanElement | null>(null)

function updateLine() {
  const container = milestonesRef.value
  const line = lineRef.value
  const dots = container ? [...container.querySelectorAll<HTMLElement>('.mpo-milestone-dot')] : []
  if (!container || !line || dots.length < 2) return

  const box = container.getBoundingClientRect()
  const first = dots[0]!.getBoundingClientRect()
  const last = dots[dots.length - 1]!.getBoundingClientRect()

  const y = first.top + first.height / 2 - box.top
  const left = first.left + first.width / 2 - box.left
  const width = last.left + last.width / 2 - box.left - left

  line.style.top = `${y}px`
  line.style.left = `${left}px`
  line.style.width = `${Math.max(0, width)}px`
}

let observer: ResizeObserver | null = null

onMounted(() => {
  nextTick(updateLine)
  window.addEventListener('resize', updateLine)
  if (document.fonts?.ready) document.fonts.ready.then(updateLine)
  if (milestonesRef.value && typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(() => updateLine())
    observer.observe(milestonesRef.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateLine)
  observer?.disconnect()
})

usePageSeo(() => ({
  title: t('projectOrientation.seoTitle'),
  description: t('projectOrientation.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <div class="page-mpo flex min-h-screen flex-1 flex-col bg-white">
    <!-- Gouttières et retrait supérieur fournis par le layout mobile. -->
    <div class="mpo-main flex flex-col pb-[var(--spacing-content-bottom)] box-border">
      <!-- `gap: 0` : cet écran ne reprend pas le retrait de 30px sous la barre,
           le premier bloc vient à 8px (`.mpo-progress { margin-top: 8px }`). -->
      <AppTopBar :back="true" back-to="/mon-projet" :notifications="3" :gap="0" />

      <PageState
        :loading="isInitialLoading"
        :error="apiError"
        :empty="!orientation?.evaluation"
        :empty-title="$t('projectOrientation.emptyTitle')"
        :empty-description="$t('projectOrientation.emptyDescription')"
        :on-retry="() => refresh()"
      >
        <template #loading>
          <div class="mt-8 flex flex-col gap-16">
            <QSkeleton variant="rect" :height="180" />
            <QSkeleton variant="rect" :height="140" />
          </div>
        </template>

        <template v-if="orientation?.evaluation">
          <!-- Progression -->
          <section class="mpo-progress mt-8 w-full rounded-xl border border-mpo-card-border bg-mpo-card-bg px-19 py-25 shadow-2xs box-border" :aria-label="$t('projectOrientation.progressLabel')">
            <div class="mpo-progress-top flex items-start justify-between gap-12">
              <div class="mpo-progress-copy">
                <h1 class="m-0 text-3xl leading-28 font-bold text-mpo-heading">{{ $t('projectOrientation.title') }}</h1>
                <p class="m-0 mt-4 text-sm leading-20 font-normal text-mpo-heading-soft">{{ $t('projectOrientation.intro') }}</p>
              </div>
              <div class="mpo-progress-pct flex shrink-0 flex-col items-end">
                <span class="mpo-progress-num text-5xl leading-30 font-bold text-mpo-pink">{{ orientation.progressPercent }}%</span>
                <span class="mpo-progress-label text-base leading-16 font-medium tracking-[0.3px] text-mpo-heading">{{ $t('projectOrientation.done') }}</span>
              </div>
            </div>

            <div class="mpo-progress-bar mt-16 h-6 w-full overflow-hidden rounded-full bg-mpo-bar-bg" aria-hidden="true">
              <span class="mpo-progress-fill block h-full rounded-full bg-mpo-pink" :style="{ width: `${orientation.progressPercent}%` }" />
            </div>

            <div ref="milestonesRef" class="mpo-milestones relative mt-24 flex justify-between gap-4">
              <span ref="lineRef" class="mpo-milestones-line pointer-events-none absolute z-0 h-1 -translate-y-1/2 bg-mpo-line" aria-hidden="true" />
              <div v-for="m in orientation.milestones" :key="m.id" class="mpo-milestone relative z-1 flex w-64 shrink-0 flex-col items-center gap-8">
                <span
                  :class="[
                    'mpo-milestone-dot flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-full box-border border',
                    m.status === 'done' ? 'border-mpo-dot bg-mpo-dot' : '',
                    m.status === 'current' ? 'border-mpo-dot bg-white' : '',
                    m.status === 'upcoming' ? 'border-mpo-card-border bg-white' : '',
                  ]"
                >
                  <img v-if="m.status === 'done'" src="/img/icons/ic-mpo-check.svg" alt="" width="16" height="16" class="block size-16">
                </span>
                <span class="mpo-milestone-label text-sm leading-[12.5px] font-normal text-center text-black">
                  {{ $t(m.titleKey) }}
                </span>
              </div>
            </div>
          </section>

          <!-- Profil prêt -->
          <section v-if="orientation.evaluation.hasReport" class="mpo-profile-card mt-20 w-full rounded-xl border border-mpo-profile-border bg-mpo-profile-bg p-17 shadow-2xs box-border">
            <div class="mpo-profile-top flex items-center gap-10">
              <div class="mpo-profile-illus h-102 w-109 shrink-0 overflow-hidden">
                <img src="/img/mpo-profile-ready.png" alt="" width="109" height="102" class="block h-102 w-109 object-cover">
              </div>
              <div class="mpo-profile-copy min-w-0 flex-1">
                <h2 class="m-0 text-xl leading-[18.75px] font-bold text-mpo-heading">{{ $t('projectOrientation.profileTitle') }}</h2>
                <p class="m-0 mt-4 pr-4 text-exact-11-5 leading-[15.525px] font-normal text-mpo-text">{{ $t('projectOrientation.profileDesc') }}</p>
              </div>
            </div>
            <div class="mpo-profile-actions mt-12 flex gap-12">
              <span class="mpo-profile-badge flex min-w-0 flex-1 items-center gap-6 rounded-lg border border-mpo-profile-border bg-white px-11 py-7 shadow-2xs">
                <img src="/img/icons/ic-mpo-report.svg" alt="" width="16" height="16" class="block size-16 shrink-0">
                <span class="text-sm leading-15 font-semibold text-mpo-heading">{{ $t('projectOrientation.reportAvailable') }}</span>
              </span>
              <button
                type="button"
                :disabled="reportPending"
                class="mpo-profile-btn flex flex-1 cursor-pointer items-center justify-center rounded-xl border-0 bg-mpo-btn px-16 py-10 text-md leading-[16.5px] font-semibold text-center whitespace-nowrap text-white disabled:opacity-50"
                @click="openReport"
              >
                {{ $t('projectOrientation.seeReport') }}
              </button>
            </div>
          </section>

          <!-- Test d'orientation -->
          <section v-if="orientation.evaluation.testUrl" class="mpo-test-card mt-20 w-full rounded-xl border border-mpo-test-border bg-mpo-test-bg px-11 py-17 shadow-2xs box-border">
            <div class="mpo-test-top flex items-start gap-8">
              <div class="mpo-test-illus mpo-test-illus--clipboard size-85 shrink-0 overflow-hidden">
                <img src="/img/mpo-test-clipboard.png" alt="" width="85" height="85" class="block size-85 object-cover">
              </div>
              <div class="mpo-test-copy flex min-w-0 flex-1 flex-col gap-15 pt-4">
                <h2 class="m-0 text-xl leading-[18.75px] font-bold text-mpo-heading">{{ $t('projectOrientation.testTitle') }}</h2>
                <p class="m-0 mt-4 pr-4 text-exact-11-5 leading-[15.525px] font-normal text-mpo-text">{{ $t('projectOrientation.testDesc') }}</p>
                <a
                  :href="orientation.evaluation.testUrl"
                  target="_blank"
                  rel="noopener"
                  class="mpo-test-btn inline-flex w-fit max-w-full items-center gap-6 rounded-[5px] border border-mpo-test-btn bg-white px-13 py-9 text-md leading-[16.5px] font-medium text-mpo-test-btn no-underline"
                >
                  <img src="/img/icons/ic-mpo-external.svg" alt="" width="14" height="14" class="block size-14 shrink-0">
                  <span>{{ $t('projectOrientation.retakeTest') }}</span>
                </a>
              </div>
              <div class="mpo-test-illus mpo-test-illus--laptop h-81 w-96 shrink-0 self-end overflow-hidden">
                <img src="/img/mpo-test-laptop.png" alt="" width="96" height="81" class="block h-81 w-96 object-cover">
              </div>
            </div>
          </section>

          <!-- À savoir -->
          <section class="mpo-info mt-20 w-full rounded-xl border border-mpo-card-border bg-mpo-info-bg p-21 shadow-2xs box-border">
            <div class="mpo-info-head flex items-center gap-8">
              <img src="/img/icons/ic-mpo-info.svg" alt="" width="17" height="17" class="block size-17 shrink-0">
              <h2 class="m-0 text-2xl leading-[22.5px] font-medium text-mpo-info-title">{{ $t('projectOrientation.infoTitle') }}</h2>
            </div>
            <ul class="mpo-info-list m-0 mt-16 flex list-none flex-col gap-14 p-0">
              <li v-for="key in infoKeys" :key="key" class="flex items-start gap-12">
                <span class="mpo-info-check mt-2 flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-mpo-check-border">
                  <img src="/img/icons/ic-mpo-list-check.svg" alt="" width="10" height="10" class="block size-10">
                </span>
                <span class="text-exact-12-5 leading-[17.188px] font-normal text-mpo-info-text">{{ $t(key) }}</span>
              </li>
            </ul>
          </section>

          <!-- Besoin d'aide -->
          <section class="mpo-support mt-20 flex w-full items-center justify-between gap-8 rounded-xl bg-mpo-support-bg px-9 py-13 box-border">
            <div class="mpo-support-main flex min-w-0 flex-1 items-center gap-10">
              <div class="mpo-support-illus h-56 w-60 shrink-0 overflow-hidden">
                <img src="/img/mpo-advisor.png" alt="" width="60" height="56" class="block h-56 w-60 object-cover">
              </div>
              <div class="mpo-support-copy">
                <h3 class="m-0 text-sm leading-20 font-bold text-text">{{ $t('projectOrientation.helpTitle') }}</h3>
                <p class="m-0 text-xs leading-16 font-normal text-text">{{ $t('projectOrientation.helpDesc') }}</p>
              </div>
            </div>
            <a href="#" class="mpo-support-btn shrink-0 rounded-xl border border-mpo-support bg-transparent px-8 py-9 text-sm leading-16 font-medium text-center whitespace-nowrap text-mpo-support no-underline">
              {{ $t('projectOrientation.contactAdvisor') }}
            </a>
          </section>
        </template>
      </PageState>
    </div>
  </div>
</template>
