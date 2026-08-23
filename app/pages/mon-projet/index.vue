<script setup lang="ts">
/**
 * Mon projet ← `maquette/pwa/pages/mon-projet.html`.
 *
 * | Bloc | Règles |
 * |---|---|
 * | rythme | `.mp-main` `gap: 22px` (topbar → hero → titre → liste → CTA) |
 * | topbar | `pb-0` — l’espace sous la navbar = gap parent 22px |
 * | hero | `min-h-130`, copie max 166px, illus 220×155 |
 * | cartes | progress + conseiller + date toujours visibles (0 %/vide si aucune commande réelle) |
 *
 * Données : API via `useProjetData` — voir `docs/mon-projet-mocks.md`.
 */
import type { ProjetBadgeTone } from '~/core/contracts/projet'

definePageMeta({ middleware: 'auth' })

const { t, locale } = useI18n()
const localePath = useLocalePath()

const { data, apiError, isInitialLoading, refresh } = await useProjetData(locale)

/**
 * Toujours exactement 4 cartes (Admission, Logement, Cours de langues,
 * Orientation) — une par rubrique, jamais une par commande/langue/bilan
 * (consigne du responsable, 2026-08-23). Une rubrique sans commande réelle
 * affiche une carte à 0 %, pas un contenu inventé. Lien Langues →
 * `/mon-projet/langues` (Figma Mon Projet - Langue).
 */
const accompagnements = computed(() => toAccompagnements(
  data.value?.orders ?? [],
  data.value?.languages ?? [],
  data.value?.sessions ?? [],
  data.value?.evaluations ?? [],
))

const usingMockOnly = computed(() => {
  const orders = data.value?.orders ?? []
  const languages = data.value?.languages ?? []
  return orders.length === 0 && languages.length === 0
})

/** `.mp-badge--purple|green|pink|orange` (`app.css`). */
const badgeToneClass: Record<ProjetBadgeTone, string> = {
  purple: 'mp-badge--purple bg-mp-badge-purple-bg text-mp-badge-purple',
  green: 'mp-badge--green bg-mp-badge-green-bg text-mp-badge-green',
  pink: 'mp-badge--pink bg-mp-badge-pink-bg text-mp-badge-pink',
  orange: 'mp-badge--orange bg-mp-badge-orange-bg text-mp-badge-orange',
}

usePageSeo(() => ({
  title: t('myProject.seoTitle'),
  description: t('myProject.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <PageState
    :loading="isInitialLoading"
    :error="apiError"
    :empty="false"
    :on-retry="() => refresh()"
  >
    <template #loading>
      <div class="flex flex-col gap-14">
        <QSkeleton v-for="index in 4" :key="index" variant="rect" :height="120" />
      </div>
    </template>

    <div class="page-mp flex flex-1 flex-col bg-white">
      <div class="mp-main flex w-full max-w-full flex-col gap-22 box-border">
        <AppTopBar :back="true" back-to="/" :notifications="3" :gap="0" />

        <section class="mp-hero relative flex w-full min-h-130 items-start gap-10" aria-labelledby="projet-title">
          <div class="mp-hero-copy relative z-1 min-w-0 max-w-166 flex-1">
            <h1 id="projet-title" class="m-0 text-4xl leading-[31.25px] font-semibold tracking-[-0.625px] text-text">
              {{ $t('myProject.title') }}
            </h1>
            <p class="m-0 mt-8 text-xl leading-[normal] font-normal text-text">
              {{ $t('myProject.intro') }}
            </p>
          </div>
          <div
            class="mp-hero-illus pointer-events-none absolute top-0 right-0 flex h-155 w-[min(220px,58%)] items-start justify-end overflow-hidden"
            aria-hidden="true"
          >
            <img
              src="/img/hero-mon-projet-accompagnements.webp"
              alt=""
              width="220"
              height="155"
              class="block h-155 w-220 max-w-full object-contain object-right-top"
            >
          </div>
        </section>

        <div class="mp-section-head flex w-full items-center justify-between box-border">
          <h2 id="accompagnements-title" class="m-0 text-xl leading-[27.5px] font-bold text-navy-2">
            {{ $t('myProject.accompaniementsTitle') }}
          </h2>
        </div>

        <div class="mp-list flex w-full flex-col gap-14" aria-labelledby="accompagnements-title">
          <p v-if="usingMockOnly" class="sr-only">
            {{ $t('myProject.mockNotice') }}
          </p>
          <NuxtLink
            v-for="item in accompagnements"
            :key="item.id"
            :to="localePath(item.to)"
            class="mp-card flex w-full flex-col rounded-xl border border-mp-card-border bg-white p-17 text-inherit no-underline box-border"
          >
            <div class="mp-card-top flex w-full items-start justify-between gap-8">
              <div class="mp-card-main flex min-w-0 flex-1 items-center gap-12">
                <span class="mp-card-icon size-44 shrink-0 overflow-hidden rounded-full">
                  <img :src="item.icon" alt="" width="44" height="44" class="block size-44 object-cover">
                </span>
                <span class="mp-card-copy flex min-w-0 flex-col">
                  <span class="mp-card-title-row flex flex-wrap items-center gap-8">
                    <span class="mp-card-title text-xl leading-20 font-semibold text-navy-2">{{ $t(item.titleKey) }}</span>
                    <span :class="['mp-badge inline-flex rounded-md px-8 py-2 text-sm leading-[15.75px] font-semibold', badgeToneClass[item.badgeTone]]">
                      {{ $t(item.statusKey) }}
                    </span>
                  </span>
                  <span class="mp-card-sub mt-2 text-exact-12-5 font-normal text-mp-sub">{{ item.sub }}</span>
                </span>
              </div>
              <img class="mp-card-chevron h-16 w-18 shrink-0 mt-8 object-contain opacity-70" src="/img/icons/ic-rg-chevron.svg" alt="" width="8" height="16">
            </div>

            <!-- Maquette : barre toujours présente -->
            <div class="mp-progress flex w-full items-center gap-12 pt-10 box-border">
              <span class="mp-progress-track h-4 min-w-0 flex-1 overflow-hidden rounded-full bg-border-soft">
                <span
                  class="mp-progress-fill block h-4 rounded-full"
                  :style="{ width: `${item.progressPercent ?? 0}%`, background: item.progressColor }"
                />
              </span>
              <span class="mp-progress-pct shrink-0 text-lg leading-[19.5px] font-semibold text-navy-2">
                {{ item.progressPercent ?? 0 }}%
              </span>
            </div>

            <div class="mp-card-meta mt-12 flex w-full items-center justify-between gap-8 border-t border-mp-divider pt-5 box-border">
              <span class="mp-meta-person inline-flex min-w-0 items-center gap-6 text-exact-11-5 font-medium text-slate">
                <img src="/img/icons/ic-user.svg" alt="" width="11" height="11" class="size-11 shrink-0 opacity-70">
                <span>{{ $t('myProject.advisorLabel') }}<strong class="font-medium text-navy-2">{{ item.advisorName }}</strong></span>
              </span>
              <span v-if="item.updatedAt" class="mp-meta-updated shrink-0 ml-auto text-exact-11-5 font-medium text-mp-updated">
                {{ $t('myProject.updatedDaysAgo', daysSince(item.updatedAt)) }}
              </span>
            </div>
          </NuxtLink>
        </div>

        <aside class="mp-cta flex h-86 min-h-86 w-full items-center justify-between gap-8 rounded-xl bg-surface-2 px-9 box-border">
          <div class="mp-cta-main flex min-w-0 flex-1 items-start gap-11">
            <span class="mp-cta-icon size-44 shrink-0 overflow-hidden">
              <img src="/img/icons/ic-mp-trophy.svg" alt="" width="44" height="44" class="block size-44">
            </span>
            <div class="mp-cta-copy min-w-0 flex-1">
              <p class="mp-cta-title m-0 text-base leading-20 font-bold text-text">{{ $t('myProject.ctaTitle') }}</p>
              <p class="mp-cta-desc m-0 mt-4 text-xs leading-16 font-normal text-text">{{ $t('myProject.ctaDesc') }}</p>
            </div>
          </div>
          <NuxtLink :to="localePath('/')" class="mp-cta-btn shrink-0 rounded-xl border border-mp-cta-border bg-mp-cta-bg px-11 py-9 text-sm leading-16 font-medium whitespace-nowrap text-white no-underline">
            {{ $t('myProject.ctaButton') }}
          </NuxtLink>
        </aside>
      </div>
    </div>
  </PageState>
</template>
