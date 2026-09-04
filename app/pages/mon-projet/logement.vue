<script setup lang="ts">
/**
 * Mon projet — Logement ← `maquette/pwa/pages/mon-projet-logement.html`.
 *
 * Suivi de l'accompagnement logement, protégé par le middleware `auth`.
 *
 * | Bloc | Règles reprises de `app.css` |
 * |---|---|
 * | progression | `.mpl-progress` `padding: 25px 19px`, fond `#faf9fd` · pourcentage 24px/30px rose |
 * | onglets | 2 onglets, `min-height: 41px` · l'actif se souligne en `#4b32f9` |
 * | chronologie | `.mpl-timeline` `padding: 21px 10px 21px 40px` · pastilles hors flux à `left: -31px` |
 * | étape | icône 48×48 · filet `#f2f2f8` en tête de chaque étape, y compris la première |
 * | documents | `.mpl-docs` `padding: 21px` · vignette cerclée 48×48, rayon 12 |
 *
 * Les deux traits de la chronologie sont positionnés comme dans la maquette
 * (centre de la première pastille au centre de la cinquième, puis jusqu'à la
 * dernière). Même correctif que `MpaStepsCard` : le `ResizeObserver` couvre le
 * montage **et** le retour sur l'onglet, que `v-show` avait replié à zéro.
 */
definePageMeta({ middleware: 'auth' })

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const { data: logement, apiError, isInitialLoading, refresh } = await useLogementData(locale)

type TabId = 'apercu' | 'formule'
// La maquette ouvre sur « Formule achetée ».
const activeTab = ref<TabId>('formule')

onMounted(() => {
  const fromQuery = route.query.tab as string
  if (fromQuery === 'apercu' || fromQuery === 'formule') activeTab.value = fromQuery
})

function setTab(tab: TabId) {
  activeTab.value = tab
  router.replace({ query: { ...route.query, tab: tab === 'formule' ? undefined : tab } })
}

const timelineRef = ref<HTMLDivElement | null>(null)
const pinkRef = ref<HTMLSpanElement | null>(null)
const greyRef = ref<HTMLSpanElement | null>(null)

function updateLines() {
  const timeline = timelineRef.value
  const pink = pinkRef.value
  const grey = greyRef.value
  const markers = timeline ? [...timeline.querySelectorAll<HTMLElement>('.mpl-marker')] : []
  if (!timeline || !pink || !grey || markers.length < 2) return
  if (timeline.offsetParent === null) return

  const box = timeline.getBoundingClientRect()
  const first = markers[0]!.getBoundingClientRect()
  // Scinde à la première étape « en cours » (`current`) — pas une position
  // fixe : une commande réelle peut avoir n'importe quel nombre d'étapes
  // terminées avant ce point. Repli sur la 3ᵉ pastille si aucune étape n'est
  // active (tout terminé, ou tout à venir), même défaut que `MpaStepsCard`.
  const currentIdx = markers.findIndex((m) => m.classList.contains('mpl-marker--current'))
  const splitIdx = currentIdx !== -1 ? currentIdx : Math.min(2, markers.length - 1)
  const split = markers[splitIdx]!.getBoundingClientRect()
  const last = markers[markers.length - 1]!.getBoundingClientRect()

  const top = first.top + first.height / 2 - box.top
  const splitY = split.top + split.height / 2 - box.top
  const bottom = box.bottom - (last.top + last.height / 2)

  pink.style.top = `${top}px`
  pink.style.height = `${Math.max(0, splitY - top)}px`
  grey.style.top = `${splitY}px`
  grey.style.bottom = `${bottom}px`
}

let observer: ResizeObserver | null = null

onMounted(() => {
  nextTick(updateLines)
  window.addEventListener('resize', updateLines)
  if (document.fonts?.ready) document.fonts.ready.then(updateLines)
  if (timelineRef.value && typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(() => updateLines())
    observer.observe(timelineRef.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateLines)
  observer?.disconnect()
})

usePageSeo(() => ({
  title: t('projectHousing.seoTitle'),
  description: t('projectHousing.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <div class="page-mpl flex flex-1 flex-col bg-surface-card">
    <!-- Gouttières et retrait supérieur fournis par le layout mobile. -->
    <div class="mpl-main flex flex-col box-border">
      <!-- `gap: 0` : pas de retrait sous la barre, le bandeau vient à 8px. -->
      <AppTopBar :back="true" back-to="/mon-projet" :gap="0" />

      <PageState
        :loading="isInitialLoading"
        :error="apiError"
        :empty="!logement?.order"
        :empty-title="$t('projectHousing.emptyTitle')"
        :empty-description="$t('projectHousing.emptyDescription')"
        :on-retry="() => refresh()"
      >
        <template #loading>
          <div class="mt-8 flex flex-col gap-16">
            <QSkeleton variant="rect" :height="120" />
            <QSkeleton variant="rect" :height="41" />
            <QSkeleton variant="rect" :height="280" />
          </div>
        </template>

        <template v-if="logement">
          <!-- Progression -->
          <section class="mpl-progress mt-8 w-full rounded-xl border border-mpo-card-border bg-mpl-progress-bg px-19 py-25 shadow-2xs box-border" :aria-label="$t('projectHousing.progressLabel')">
            <div class="mpl-progress-top flex items-start justify-between gap-12">
              <div class="mpl-progress-copy">
                <h1 class="m-0 text-3xl leading-28 font-bold text-mpo-heading">{{ $t('projectHousing.title') }}</h1>
                <p class="m-0 mt-4 text-sm leading-20 font-normal text-mpo-heading-soft">{{ $t('projectHousing.intro') }}</p>
              </div>
              <div class="mpl-progress-pct flex shrink-0 flex-col items-end">
                <span class="mpl-progress-num text-5xl leading-30 font-bold text-mpo-pink">{{ logement.progressPercent }}%</span>
                <span class="mpl-progress-label text-base leading-16 font-medium tracking-[0.3px] text-mpo-heading">{{ $t('projectHousing.done') }}</span>
              </div>
            </div>
            <div class="mpl-progress-bar mt-16 h-6 w-full overflow-hidden rounded-full bg-mpo-bar-bg" aria-hidden="true">
              <span class="mpl-progress-fill block h-full rounded-full bg-mpo-pink" :style="{ width: `${logement.progressPercent}%` }" />
            </div>
          </section>

          <!-- Onglets -->
          <div class="mpl-tabs mt-16 flex min-h-41 w-full rounded-md border border-mpl-tabs-border bg-mpl-tabs-bg p-1 box-border" role="tablist" :aria-label="$t('projectHousing.tabsLabel')">
            <button
              v-for="tab in (['apercu', 'formule'] as const)"
              :key="tab"
              type="button"
              role="tab"
              :aria-selected="activeTab === tab"
              :class="[
                'mpl-tab flex-1 flex items-center justify-center gap-8 border rounded-[5px] px-8 pt-10 pb-11 text-md leading-[19.5px] font-medium cursor-pointer box-border',
                activeTab === tab
                  ? 'is-active bg-mpl-tab-active-bg border-mpl-tab-active-border border-b-mpl-tab-active-underline text-mpl-tab-active-text'
                  : 'border-transparent bg-mpl-tab-bg text-text',
              ]"
              @click="setTab(tab)"
            >
              <img
                class="mpl-tab-icon block size-16 shrink-0 object-contain"
                :src="tab === 'apercu' ? '/img/icons/ic-lp-tab-eye.svg' : '/img/icons/ic-mpl-tab-calendar.svg'"
                alt=""
                width="16"
                height="16"
              >
              <span>{{ tab === 'apercu' ? $t('projectHousing.tabOverview') : $t('projectHousing.tabPlan') }}</span>
            </button>
          </div>

          <!-- Panneau Aperçu -->
          <div v-show="activeTab === 'apercu'" class="mpl-panel mt-24 w-full">
            <div class="mpl-apercu rounded-xl border border-mpl-apercu-border bg-mpl-apercu-bg px-16 py-20">
              <p class="mpl-apercu-title m-0 mb-6 text-xl leading-[normal] font-bold text-text">{{ $t('projectHousing.overviewTitle') }}</p>
              <!-- Le fragment en gras vit dans le gabarit : aucune balise ne doit
                   entrer dans un message i18n (le plugin rejetterait la locale). -->
              <p class="mpl-apercu-desc m-0 text-base leading-18 text-mpl-desc">
                {{ $t('projectHousing.overviewDescBefore') }}<strong>{{ $t('projectHousing.overviewDescTab') }}</strong>{{ $t('projectHousing.overviewDescAfter') }}
              </p>
            </div>
          </div>

          <!-- Panneau Formule achetée -->
          <div v-show="activeTab === 'formule'" class="mpl-panel mt-24 w-full">
            <!-- Commande antérieure au suivi par étapes (mécanisme le plus
                 ancien des trois types, mais non rétroactif comme les autres) :
                 `checklist` vide plutôt que neuf étapes fictives. -->
            <QEmptyState
              v-if="logement.steps.length === 0"
              icon="clock"
              :title="$t('projectHousing.stepsEmptyTitle')"
              :description="$t('projectHousing.stepsEmptyDescription')"
            />
            <div v-else ref="timelineRef" class="mpl-timeline relative w-full rounded-xl border border-mpo-card-border bg-surface-card pt-21 pr-10 pb-21 pl-40 shadow-xs box-border">
              <div class="mpl-timeline-lines pointer-events-none absolute top-0 bottom-0 left-21 w-1" aria-hidden="true">
                <span ref="pinkRef" class="mpl-timeline-line mpl-timeline-line--pink absolute left-0 w-1 bg-mpl-line-pink" />
                <span ref="greyRef" class="mpl-timeline-line mpl-timeline-line--grey absolute left-0 w-1 bg-mpl-line-grey" />
              </div>

              <!-- Toutes les étapes portent le filet supérieur, y compris la
                   première : la règle `.mpl-step:first-child` de la maquette est
                   inerte, le premier enfant de `.mpl-timeline` étant le conteneur
                   des traits, pas une étape. -->
              <div
                v-for="(step, index) in logement.steps"
                :key="step.id"
                :class="[
                  'mpl-step relative flex items-center gap-16 py-20 border-t border-t-mpl-step-border',
                  index === logement.steps.length - 1 ? 'mpl-step--last pb-0' : '',
                ]"
              >
                <span
                  :class="[
                    'mpl-marker absolute -left-31 top-1/2 -translate-y-1/2 flex size-24 shrink-0 items-center justify-center rounded-full box-border',
                    step.status === 'done' ? 'mpl-marker--done bg-mpl-marker-done' : '',
                    step.status === 'current' ? 'mpl-marker--current border border-mpl-marker-done bg-surface-card text-sm leading-15 font-bold text-mpl-marker-done' : '',
                    step.status === 'upcoming' ? 'mpl-marker--upcoming border border-mpl-marker-upcoming bg-surface-card text-sm leading-15 font-bold text-mpl-marker-upcoming' : '',
                  ]"
                >
                  <img v-if="step.status === 'done'" src="/img/icons/ic-mpl-check.svg" alt="" width="14" height="14" class="block size-14">
                  <template v-else>{{ step.stepNumber }}</template>
                </span>

                <span class="mpl-step-icon size-48 shrink-0 overflow-hidden">
                  <img :src="step.icon" alt="" width="48" height="48" class="block size-48">
                </span>

                <span class="mpl-step-copy flex min-w-0 flex-1 flex-col gap-2">
                  <span class="mpl-step-title text-xl leading-[22.5px] font-medium text-text">{{ $t(step.titleKey) }}</span>
                  <span
                    :class="[
                      'mpl-step-status text-lg leading-[19.5px] font-normal',
                      step.status === 'done' ? 'mpl-step-status--done text-mpl-status-done' : 'text-mpl-status',
                    ]"
                  >
                    <template v-if="step.completedAt">{{ step.completedAt }}</template>
                    <template v-else>{{ step.status === 'current' ? $t('projectHousing.statusPending') : $t('projectHousing.statusUpcoming') }}</template>
                  </span>
                </span>

                <img class="mpl-step-chevron block size-20 shrink-0" src="/img/icons/ic-mpl-chevron-step.svg" alt="" width="20" height="20">
              </div>
            </div>
          </div>

          <!-- Documents utiles -->
          <a href="#" class="mpl-docs mt-20 flex w-full items-center gap-16 rounded-xl border border-mpo-card-border bg-surface-card p-21 text-inherit no-underline shadow-xs box-border">
            <span class="mpl-docs-icon flex size-48 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-mpo-card-border">
              <img src="/img/icons/ic-mpl-folder.svg" alt="" width="24" height="24" class="block size-24">
            </span>
            <span class="mpl-docs-copy flex min-w-0 flex-1 flex-col gap-4">
              <span class="mpl-docs-title text-2xl leading-[22.5px] font-semibold text-text">{{ $t('projectHousing.docsTitle') }}</span>
              <span class="mpl-docs-desc text-base leading-[16.5px] font-normal text-mpo-heading">{{ $t('projectHousing.docsDesc') }}</span>
            </span>
            <img class="mpl-docs-chevron block size-20 shrink-0" src="/img/icons/ic-mpl-doc-chevron.svg" alt="" width="20" height="20">
          </a>
        </template>
      </PageState>
    </div>
  </div>
</template>
