<script setup lang="ts">
/**
 * Mon projet ← `maquette/pwa/pages/mon-projet.html`.
 *
 * Écran de suivi du projet utilisateur (Orientation, Langues, Logement),
 * protégé par le middleware `auth`.
 *
 * | Bloc | Règles reprises de `app.css` |
 * |---|---|
 * | en-tête | `padding-bottom: 30px`, logo 145×45, cloche notif 49×49 + badge rouge 20×20 |
 * | accroche | `.projet-hero` `padding: 30px 0 70px` · illustration 205×197 décalée |
 * | aperçu | `.projet-apercu` fond blanc, rayon 10, ombre `0 0 3.5px` · graphique circulaire 74×74 (65%) |
 * | stats | `.projet-stats` fond `#f6f5fd`, rayon 10, 4 colonnes séparées par diviseurs 52px |
 * | services | `.projet-services` 4 cartes (Orientation Essentiel/Premium, Langue, Logement) |
 * | rdv | `.projet-rdv-cta` fond `#f5f3ff`, rayon 10, 91px de haut, CTA positionné à droite |
 */
import { paymentRepo } from '~/core/repositories'

definePageMeta({ middleware: 'auth' })

const { t, locale } = useI18n()
const localePath = useLocalePath()

const { data: orders, apiError, isInitialLoading, refresh } = await usePageData(
  'user-orders',
  () => paymentRepo.orders(locale.value),
  { watch: [locale] },
)

/** Progression globale dérivée des commandes ou 65% par défaut (maquette). */
const progressPct = computed(() => {
  if (!orders.value || orders.value.length === 0) return 65
  const confirmed = orders.value.filter(o => o.status === 'confirmed').length
  return Math.min(100, Math.round((confirmed / orders.value.length) * 100))
})

/** Calcul du stroke-dasharray SVG pour le graphique (rayon r=34.5 -> circonférence ≈ 216.77). */
const circumference = 2 * Math.PI * 34.5
const dashArray = computed(() => {
  const filled = (progressPct.value / 100) * circumference
  return `${filled.toFixed(1)} ${circumference.toFixed(2)}`
})

/** Compteurs de statuts. */
const statsDoneCount = computed(() => orders.value?.filter(o => o.status === 'confirmed').length ?? 2)
const statsProgressCount = computed(() => orders.value?.filter(o => o.status === 'pending').length ?? 1)
const statsUpcomingCount = computed(() => 1)

usePageSeo(() => ({
  title: t('myProject.seoTitle'),
  description: t('myProject.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <PageState :loading="isInitialLoading" :error="apiError" :empty="false" :on-retry="() => refresh()">
    <!-- Le retrait supérieur (16px) vient du layout mobile ; ne pas le doubler. -->
    <div class="page-mon-projet">
      <div class="projet-main">
        <!-- Topbar : Logo + Cloche de notifications -->
        <AppTopBar :notifications="3" />

        <!-- Hero : Titre + Illustration -->
        <section class="projet-hero relative flex w-full items-start gap-10 pt-30 pb-70" aria-labelledby="projet-title">
          <div class="projet-hero-copy relative z-1 min-w-0 flex-1">
            <h1 id="projet-title" class="m-0 text-4xl leading-[31.25px] font-semibold tracking-[-0.625px] whitespace-nowrap text-text">
              {{ $t('myProject.title') }}
            </h1>
            <p class="m-0 w-160 pt-8 text-xl leading-normal font-normal text-text">
              {{ $t('myProject.intro') }}
            </p>
          </div>
          <!-- Sous 390px, la maquette recale l'illustration à droite et la
               rétrécit (`@media (max-width: 390px)`). C'est le cas du viewport
               de référence (375px), pas un cas limite. -->
          <div
            class="projet-hero-illus pointer-events-none absolute top-28 left-165 z-0 h-197 w-205 max-[390.02px]:left-auto max-[390.02px]:-right-8 max-[390.02px]:w-180"
            aria-hidden="true"
          >
            <img
              src="/img/hero-mon-projet.webp"
              alt=""
              width="211"
              height="167"
              class="absolute top-0 -left-6 h-167 w-211 max-w-none object-contain max-[390.02px]:left-0 max-[390.02px]:h-150 max-[390.02px]:w-190"
            >
          </div>
        </section>

        <!-- Aperçu général -->
        <section class="projet-apercu flex w-full flex-col gap-16 rounded-xl border border-surface-border bg-white p-15 shadow-card" aria-labelledby="apercu-title">
          <div class="projet-apercu-head flex w-full items-center justify-between">
            <h2 id="apercu-title" class="m-0 text-xl leading-16 font-semibold text-text">
              {{ $t('myProject.overviewTitle') }}
            </h2>
            <span class="projet-apercu-updated text-sm leading-15 font-medium whitespace-nowrap text-slate-400">
              {{ $t('myProject.updatedToday') }}
            </span>
          </div>

          <!-- Progress chart -->
          <div class="projet-progress-row relative flex h-94 w-full items-center">
            <div class="projet-progress-anchor absolute top-[11.72px] left-0 z-2 size-56" :aria-label="$t('myProject.progressPct', { pct: progressPct })">
              <div class="projet-progress-chart absolute top-0 left-0 z-1 size-74" :data-progress="progressPct" role="img">
                <svg class="projet-chart-svg block size-74 -rotate-90 overflow-visible" viewBox="0 0 74 74" width="74" height="74" aria-hidden="true">
                  <circle class="projet-chart-track fill-none stroke-[#e2d9fd] stroke-[5]" cx="37" cy="37" r="34.5" />
                  <circle
                    class="projet-chart-bar fill-none stroke-[#3300fd] stroke-[5]"
                    cx="37"
                    cy="37"
                    r="34.5"
                    :style="{ strokeDasharray: dashArray }"
                  />
                </svg>
              </div>
              <p class="projet-ring-pct absolute top-22 left-22 z-3 m-0 text-2xl leading-20 font-semibold tracking-[0.1px] whitespace-nowrap text-text">
                {{ progressPct }}%
              </p>
              <p class="projet-ring-label absolute top-48 left-13 z-3 m-0 -translate-y-1/2 text-3xs leading-[17.88px] font-normal whitespace-nowrap text-text">
                {{ $t('myProject.progressLabel') }}
              </p>
            </div>

            <div class="projet-progress-copy relative z-1 flex min-w-0 flex-1 flex-col gap-[5.44px] pl-90">
              <p class="projet-progress-title m-0 text-xl leading-[19.25px] font-semibold text-text">
                {{ $t('myProject.progressGood') }}
              </p>
              <p class="projet-progress-desc m-0 text-md leading-[17.88px] font-normal text-muted-1">
                {{ $t('myProject.progressGoodDesc') }}
              </p>
            </div>
          </div>

          <!-- Stats grid -->
          <div class="projet-stats flex w-full items-center gap-8 rounded-xl bg-[#f6f5fd] px-8 py-10">
            <!-- Terminés -->
            <div class="projet-stat flex min-w-0 flex-1 flex-col items-center gap-10">
              <span class="projet-stat-icon relative block size-15 shrink-0">
                <QIcon name="ic-stat-done" :size="15" />
              </span>
              <div class="projet-stat-text flex flex-col items-center">
                <span class="projet-stat-value text-center text-base leading-16 font-semibold text-text">{{ statsDoneCount }}</span>
                <span class="projet-stat-label mt-2 text-center text-xs leading-[13.5px] font-normal whitespace-nowrap text-text">{{ $t('myProject.statDone') }}</span>
              </div>
            </div>

            <div class="projet-stat-divider flex h-52 w-0 shrink-0 items-center justify-center" aria-hidden="true">
              <img src="/img/icons/ic-stat-divider.svg" alt="" width="52" height="1" class="block h-1 w-52 max-w-none rotate-90">
            </div>

            <!-- En cours -->
            <div class="projet-stat flex min-w-0 flex-1 flex-col items-center gap-10">
              <span class="projet-stat-icon relative block size-15 shrink-0">
                <QIcon name="ic-stat-progress" :size="15" />
              </span>
              <div class="projet-stat-text flex flex-col items-center">
                <span class="projet-stat-value projet-stat-value--orange text-center text-base leading-16 font-semibold text-[#fe6f00]">{{ statsProgressCount }}</span>
                <span class="projet-stat-label mt-2 text-center text-xs leading-[13.5px] font-normal whitespace-nowrap text-text">{{ $t('myProject.statInProgress') }}</span>
              </div>
            </div>

            <div class="projet-stat-divider flex h-52 w-0 shrink-0 items-center justify-center" aria-hidden="true">
              <img src="/img/icons/ic-stat-divider.svg" alt="" width="52" height="1" class="block h-1 w-52 max-w-none rotate-90">
            </div>

            <!-- À venir -->
            <div class="projet-stat flex min-w-0 flex-1 flex-col items-center gap-10">
              <span class="projet-stat-icon projet-stat-icon--soon relative block size-16 shrink-0">
                <span class="projet-stat-icon-inset absolute -inset-[4.69%] block">
                  <QIcon name="ic-stat-soon" :size="16" />
                </span>
              </span>
              <div class="projet-stat-text flex flex-col items-center">
                <span class="projet-stat-value text-center text-base leading-16 font-semibold text-text">{{ statsUpcomingCount }}</span>
                <span class="projet-stat-label mt-2 text-center text-xs leading-[13.5px] font-normal whitespace-nowrap text-text">{{ $t('myProject.statUpcoming') }}</span>
              </div>
            </div>

            <div class="projet-stat-divider flex h-52 w-0 shrink-0 items-center justify-center" aria-hidden="true">
              <img src="/img/icons/ic-stat-divider.svg" alt="" width="52" height="1" class="block h-1 w-52 max-w-none rotate-90">
            </div>

            <!-- Prochain RDV -->
            <div class="projet-stat projet-stat--rdv flex min-w-0 flex-1 flex-col items-center gap-10 pb-[4.75px]">
              <span class="projet-stat-icon projet-stat-icon--rdv relative block h-15 w-[13.5px] shrink-0">
                <span class="projet-stat-icon-inset projet-stat-icon-inset--rdv absolute -top-[5%] -bottom-[5%] -left-[5.56%] -right-[5.56%] block">
                  <QIcon name="ic-stat-rdv" :size="15" />
                </span>
              </span>
              <div class="projet-stat-text flex flex-col items-center">
                <span class="projet-stat-date text-center text-xs leading-[11.25px] font-normal whitespace-nowrap text-text">12 mai 2026</span>
                <span class="projet-stat-label projet-stat-label--bold mt-2 text-center text-xs leading-[13.5px] font-semibold whitespace-nowrap text-text">{{ $t('myProject.nextAppointment') }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Mes services -->
        <section class="projet-services flex w-full flex-col gap-16 pt-24" aria-labelledby="services-title">
          <div class="projet-services-head flex w-full items-center justify-between">
            <h2 id="services-title" class="m-0 text-xl leading-24 font-semibold text-text">
              {{ $t('myProject.myServices') }}
            </h2>
            <NuxtLink :to="localePath('/orientation')" class="projet-services-link flex items-center text-base leading-16 font-semibold text-[#1600f3] no-underline">
              <span>{{ $t('myProject.seeAll') }}</span>
              <span class="projet-services-chevron flex h-12 w-16 shrink-0 items-center justify-center pl-4">
                <img src="/img/icons/ic-chevron-voir-tout.svg" alt="" width="5" height="9" class="block h-[8.75px] w-5 max-w-none">
              </span>
            </NuxtLink>
          </div>

          <div class="projet-service-list flex w-full flex-col gap-10">
            <!-- 1. Orientation Pack Essentiel (Terminé) -->
            <article class="projet-service-card projet-service-card--h105 flex h-105 w-full items-center justify-between rounded-xl border border-surface-border bg-white px-12 py-13">
              <div class="projet-service-main flex h-full min-w-0 flex-1 items-start">
                <span class="projet-service-icon relative block size-44 shrink-0">
                  <img src="/img/icons/ic-service-orientation-bg.svg" alt="" width="44" height="44" class="block size-44 max-w-none">
                </span>
                <div class="projet-service-body flex h-full min-w-0 flex-1 flex-col gap-4 pl-14">
                  <h3 class="m-0 text-base leading-16 font-semibold text-text">{{ $t('myProject.cardOrientationTitle') }}</h3>
                  <p class="m-0 line-clamp-2 text-sm leading-[16.25px] font-normal text-text">
                    {{ $t('myProject.cardOrientationDesc') }}
                  </p>
                  <span class="projet-pack projet-pack--essentiel inline-flex w-fit items-center rounded-sm bg-[#efecfe] px-8 py-2 text-2xs leading-12 font-semibold text-[#2f00ff]">
                    {{ $t('myProject.packEssentiel') }}
                  </span>
                </div>
              </div>
              <div class="projet-service-aside flex shrink-0 items-center pl-8">
                <span class="projet-status projet-status--done inline-flex items-center gap-4 whitespace-nowrap rounded-sm bg-[#e5f7e7] px-7 py-4 text-xs leading-[13.5px] font-medium text-[#1fad36]">
                  <span>{{ $t('myProject.serviceDone') }}</span>
                  <img src="/img/icons/ic-status-done-check.svg" alt="" width="15" height="15" class="block size-15 shrink-0 max-w-none">
                </span>
                <span class="projet-chevron flex h-16 w-24 shrink-0 items-center justify-center pl-8">
                  <img src="/img/icons/ic-arrow-right-service.svg" alt="" width="7" height="12" class="block h-[11.5px] w-[6.5px] max-w-none">
                </span>
              </div>
            </article>

            <!-- 2. Orientation Premium En cours (70% complété) -->
            <article class="projet-service-card projet-service-card--h103 flex h-103 w-full items-center justify-between rounded-xl border border-surface-border bg-white px-12 py-13">
              <div class="projet-service-main flex h-full min-w-0 flex-1 items-start">
                <span class="projet-service-icon projet-service-icon--premium relative flex size-44 shrink-0 items-center justify-center rounded-full bg-[#e9f0fe]">
                  <img src="/img/icons/ic-service-orientation-premium.svg" alt="" width="24" height="24" class="block size-24">
                </span>
                <div class="projet-service-body flex h-full min-w-0 flex-1 flex-col gap-4 pl-14">
                  <h3 class="m-0 text-base leading-16 font-semibold text-text">{{ $t('myProject.cardOrientationTitle') }}</h3>
                  <p class="m-0 line-clamp-2 text-sm leading-[16.25px] font-normal text-text">
                    {{ $t('myProject.cardPremiumDesc') }}
                  </p>
                  <span class="projet-pack projet-pack--premium inline-flex w-fit items-center rounded-sm bg-[#e9f0fe] px-8 py-2 text-2xs leading-12 font-semibold text-[#004ffc]">
                    {{ $t('myProject.packPremium') }}
                  </span>
                </div>
              </div>
              <div class="projet-service-aside projet-service-aside--stack flex shrink-0 items-center pl-8">
                <div class="projet-service-aside-col flex flex-col items-end">
                  <span class="projet-status projet-status--progress inline-flex items-center gap-4 whitespace-nowrap rounded-sm bg-[#fff3e0] px-7 py-4 text-xs leading-[13.5px] font-medium text-[#fe7812]">
                    <span>{{ $t('myProject.serviceInProgress') }}</span>
                    <span class="projet-status-dot relative h-[7.5px] w-[7.5px] shrink-0 overflow-visible">
                      <img src="/img/icons/ic-status-progress-dot.svg" alt="" width="8" height="8" class="absolute top-1/2 left-1/2 block size-[8.3px] max-w-none -translate-x-1/2 -translate-y-1/2">
                    </span>
                  </span>
                  <div class="projet-mini-progress flex h-31 w-61 flex-col items-center gap-2">
                    <span class="projet-mini-progress-label whitespace-nowrap text-4xs leading-15 font-medium text-muted-2">
                      {{ $t('myProject.completedPct', { pct: 70 }) }}
                    </span>
                    <div class="projet-mini-progress-track relative h-4 w-full overflow-hidden rounded-full bg-[#e5e0fd]">
                      <span class="projet-mini-progress-fill absolute top-0 bottom-0 left-0 right-[22.95%] rounded-full bg-[#4c17fe]" />
                    </div>
                  </div>
                </div>
                <span class="projet-chevron flex h-16 w-24 shrink-0 items-center justify-center pl-8">
                  <img src="/img/icons/ic-arrow-right-service.svg" alt="" width="7" height="12" class="block h-[11.5px] w-[6.5px] max-w-none">
                </span>
              </div>
            </article>

            <!-- 3. Apprendre une langue (À venir) -->
            <article class="projet-service-card projet-service-card--h103 flex h-103 w-full items-center justify-between rounded-xl border border-surface-border bg-white px-12 py-13">
              <div class="projet-service-main flex h-full min-w-0 flex-1 items-start">
                <span class="projet-service-icon relative block size-44 shrink-0">
                  <img src="/img/icons/ic-service-langue-bg.svg" alt="" width="44" height="44" class="block size-44 max-w-none">
                </span>
                <div class="projet-service-body flex h-full min-w-0 flex-1 flex-col gap-4 pl-14">
                  <h3 class="m-0 text-base leading-16 font-semibold text-text">{{ $t('myProject.cardLangueTitle') }}</h3>
                  <p class="m-0 line-clamp-2 text-sm leading-[16.25px] font-normal text-text">
                    {{ $t('myProject.cardLangueDesc') }}
                  </p>
                  <span class="projet-pack projet-pack--langues inline-flex w-fit items-center rounded-sm bg-[#e9f8ec] px-8 py-2 text-2xs leading-12 font-semibold text-[#05b72d]">
                    {{ $t('myProject.packLangues') }}
                  </span>
                </div>
              </div>
              <div class="projet-service-aside projet-service-aside--stack flex shrink-0 items-center pl-8">
                <div class="projet-service-aside-col flex flex-col items-end">
                  <span class="projet-status projet-status--soon inline-flex items-center gap-4 whitespace-nowrap rounded-sm bg-[#f5f3fc] px-7 py-4 text-xs leading-[13.5px] font-medium text-[#6b679d]">
                    <span>{{ $t('myProject.serviceUpcoming') }}</span>
                    <span class="projet-status-dot relative h-[7.5px] w-[7.5px] shrink-0 overflow-visible">
                      <img src="/img/icons/ic-status-soon-dot.svg" alt="" width="8" height="8" class="absolute top-1/2 left-1/2 block size-[8.3px] max-w-none -translate-x-1/2 -translate-y-1/2">
                    </span>
                  </span>
                  <span class="projet-start-date flex h-17 w-61 items-start justify-center whitespace-nowrap text-4xs leading-15 font-medium text-muted-2">
                    {{ $t('myProject.startsOn', { date: '15/05/2026' }) }}
                  </span>
                </div>
                <span class="projet-chevron flex h-16 w-24 shrink-0 items-center justify-center pl-8">
                  <img src="/img/icons/ic-arrow-right-service.svg" alt="" width="7" height="12" class="block h-[11.5px] w-[6.5px] max-w-none">
                </span>
              </div>
            </article>

            <!-- 4. Trouver un logement (Commencer) -->
            <article class="projet-service-card projet-service-card--h103 flex h-103 w-full items-center justify-between rounded-xl border border-surface-border bg-white px-12 py-13">
              <div class="projet-service-main flex h-full min-w-0 flex-1 items-start">
                <span class="projet-service-icon relative block size-44 shrink-0">
                  <img src="/img/icons/ic-service-logement-bg.svg" alt="" width="44" height="44" class="block size-44 max-w-none">
                </span>
                <div class="projet-service-body flex h-full min-w-0 flex-1 flex-col gap-4 pl-14">
                  <h3 class="m-0 text-base leading-16 font-semibold text-text">{{ $t('myProject.cardLogementTitle') }}</h3>
                  <p class="m-0 line-clamp-2 text-sm leading-[16.25px] font-normal text-text">
                    {{ $t('myProject.cardLogementDesc') }}
                  </p>
                  <span class="projet-pack projet-pack--logement inline-flex w-fit items-center rounded-sm bg-[#fef0e4] px-8 py-2 text-2xs leading-12 font-semibold text-[#f16f02]">
                    {{ $t('myProject.packLogement') }}
                  </span>
                </div>
              </div>
              <div class="projet-service-aside projet-service-aside--stack flex shrink-0 items-center pl-8">
                <NuxtLink :to="localePath('/orientation')" class="projet-btn-start cursor-pointer whitespace-nowrap rounded-lg border border-[#450ff2] bg-transparent px-12 py-9 text-sm leading-16 font-medium text-[#450ff2] no-underline">
                  {{ $t('myProject.startBtn') }}
                </NuxtLink>
                <span class="projet-chevron flex h-16 w-24 shrink-0 items-center justify-center pl-8">
                  <img src="/img/icons/ic-arrow-right-service.svg" alt="" width="7" height="12" class="block h-[11.5px] w-[6.5px] max-w-none">
                </span>
              </div>
            </article>
          </div>

          <!-- RDV CTA. Sous 390px, la maquette casse la disposition : le bloc
               passe en hauteur auto, le bouton quitte l'absolu pour se caler à
               droite sous le texte (`@media (max-width: 390px)`). -->
          <aside class="projet-rdv-cta relative mt-4 flex h-91 w-full items-center rounded-xl bg-[#f5f3ff] px-9 max-[390.02px]:h-auto max-[390.02px]:min-h-91 max-[390.02px]:gap-10 max-[390.02px]:py-14">
            <div class="projet-rdv-left flex min-w-0 flex-1 items-start gap-11 pr-140 max-[390.02px]:pr-0">
              <span class="projet-rdv-icon relative block size-44 shrink-0">
                <img src="/img/icons/ic-rdv-calendar.svg" alt="" width="44" height="44" class="block size-44 max-w-none">
              </span>
              <div class="projet-rdv-copy min-w-0 flex-1">
                <p class="projet-rdv-title m-0 text-md leading-20 font-bold text-text">
                  {{ $t('myProject.supportTitle') }}
                </p>
                <p class="projet-rdv-desc m-0 pt-4 text-sm leading-16 font-normal whitespace-pre-line text-text">
                  {{ $t('myProject.supportDesc') }}
                </p>
              </div>
            </div>
            <NuxtLink :to="localePath('/orientation')" class="projet-rdv-btn absolute top-30 right-9 rounded-lg border border-[#450ff2] bg-transparent px-15 py-9 text-sm leading-16 font-medium text-[#450ff2] no-underline max-[390.02px]:static">
              {{ $t('myProject.bookAppointment') }}
            </NuxtLink>
          </aside>
        </section>
      </div>
    </div>
  </PageState>
</template>
