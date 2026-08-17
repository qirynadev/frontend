<script setup lang="ts">
/**
 * Orientation — écran de découverte ← `maquette/pwa/pages/orientation-scolaire.html`
 * (`.osp-*`).
 *
 * Remplace l'ancien contenu de cette route (offre unique à 899 €, portée du
 * `offre-orientation.html` au lot A4) : la maquette resynchronisée fait de
 * `orientation-scolaire.html` la vraie destination de l'onglet « Orientation »
 * de la barre basse (lien réel vers lui-même, plus `href="#"`). Décision du
 * responsable : le contenu change, la route reste `/orientation`.
 *
 * Page entièrement statique côté maquette (pas d'appel réseau dans son
 * script) — pas de `PageState`, juste `usePageSeo`.
 *
 * | Bloc | Règles reprises de `app.css` |
 * |---|---|
 * | statistiques | grille 2 colonnes, `gap: 12px` (8px sous 420px — seuil propre à cette page) |
 * | méthode | 4 étapes, trait pointillé entre pastilles (position par script dans la maquette, ici du CSS pur suffit) |
 * | parcours | cartes radio 40×40, sélection par bordure `#6853fe` |
 *
 * `.osp-bilan` (encart de prix) existe dans `app.css` mais n'apparaît nulle
 * part dans le HTML de la maquette : bloc CSS mort, non reproduit.
 */
const path = ref<'moi' | 'enfant'>('moi')
const localePath = useLocalePath()
const { t } = useI18n()

const stats = [
  { icon: 'ic-osp-stat-students', tone: 'indigo', valueKey: 'orientation.stat1Value', descKey: 'orientation.stat1Desc' },
  { icon: 'ic-osp-stat-trend', tone: 'red', valueKey: 'orientation.stat2Value', descKey: 'orientation.stat2Desc' },
  { icon: 'ic-osp-stat-clock', tone: 'amber', valueKey: 'orientation.stat3Value', descKey: 'orientation.stat3Desc' },
  { icon: 'ic-osp-stat-chart', tone: 'green', valueKey: 'orientation.stat4Value', descKey: 'orientation.stat4Desc' },
]

const steps = [
  { icon: 'ic-osp-step-1', num: 1, titleKey: 'orientation.step1Title' },
  { icon: 'ic-osp-step-2', num: 2, titleKey: 'orientation.step2Title' },
  { icon: 'ic-osp-step-3', num: 3, titleKey: 'orientation.step3Title' },
  { icon: 'ic-osp-step-4', num: 4, titleKey: 'orientation.step4Title' },
]

const paths = [
  { id: 'moi' as const, icon: 'ic-osp-path-me', bg: 'bg-osp-path-me-bg', iconSize: 24, titleKey: 'orientation.pathMeTitle', descKey: 'orientation.pathMeDesc' },
  { id: 'enfant' as const, icon: 'ic-osp-path-child', bg: 'bg-osp-path-child-bg', iconSize: 20, titleKey: 'orientation.pathChildTitle', descKey: 'orientation.pathChildDesc' },
]

usePageSeo(() => ({
  title: t('orientation.fallbackTitle'),
  description: t('orientation.seoDescription'),
}))
</script>

<template>
  <AppTopBar back back-to="/" :notifications="3" :gap="0" />

  <!-- Introduction -->
  <div class="mt-22 w-full">
    <h1 class="m-0 text-4xl leading-normal font-semibold tracking-tight text-text">
      {{ $t('orientation.title') }}
    </h1>
    <p class="m-0 text-xl leading-normal font-normal text-text">
      {{ $t('orientation.subtitle') }}
    </p>
  </div>

  <!-- Statistiques -->
  <!-- `.osp-stat` a un `@media (max-width: 420px)` déclaré AVANT sa règle de
       base dans la maquette : la base gagne toujours au niveau de l'élément
       (source ultérieure, spécificité égale) — l'allègement sous 420px n'a
       jamais d'effet réel. Seul `.osp-stats-grid` (base déclarée avant sa
       propre media query) applique le sien. Reproduit tel quel : le grid
       gap varie, tout le reste de la carte reste fixe. -->
  <div class="mt-22 grid w-full grid-cols-2 gap-12 max-sm:gap-8">
    <div
      v-for="stat in stats"
      :key="stat.icon"
      class="box-border flex items-start gap-10 rounded-xl border border-border bg-white p-11"
    >
      <span
        :class="[
          'flex size-36 shrink-0 items-center justify-center overflow-hidden rounded-full',
          stat.tone === 'indigo' && 'bg-osp-stat-indigo-bg',
          stat.tone === 'red' && 'bg-transparent',
          stat.tone === 'amber' && 'bg-osp-stat-amber-bg',
          stat.tone === 'green' && 'bg-osp-stat-green-bg',
        ]"
      >
        <QIcon :name="stat.icon" :size="stat.tone === 'red' ? 36 : 20" />
      </span>
      <div class="min-w-0 flex-1">
        <p
          :class="[
            'm-0 text-base leading-[18.125px] font-semibold whitespace-nowrap',
            stat.tone === 'indigo' && 'text-osp-stat-indigo',
            stat.tone === 'red' && 'text-osp-stat-red',
            stat.tone === 'amber' && 'text-osp-stat-amber',
            stat.tone === 'green' && 'text-osp-stat-green',
          ]"
        >
          {{ $t(stat.valueKey) }}
        </p>
        <p class="m-0 mt-2 text-2xs leading-[13.5px] font-medium text-text">
          {{ $t(stat.descKey) }}
        </p>
      </div>
    </div>
  </div>

  <!-- Argument -->
  <div class="mt-22 box-border flex w-full items-start gap-16 rounded-xl bg-surface-2 px-9 py-20">
    <img src="/img/icons/ic-osp-compass.svg" alt="" width="44" height="44" class="block shrink-0">
    <div class="min-w-0 flex-1">
      <h3 class="m-0 text-base leading-20 font-bold text-text">{{ $t('orientation.calloutTitle') }}</h3>
      <p class="m-0 mt-4 text-sm leading-16 font-normal text-text">{{ $t('orientation.calloutDesc') }}</p>
    </div>
  </div>

  <!-- Méthode en 4 étapes -->
  <div class="mt-22 flex w-full flex-col gap-22">
    <h2 class="m-0 text-xl leading-16 font-semibold tracking-wider text-text">{{ $t('orientation.methodTitle') }}</h2>

    <div class="flex w-full items-start">
      <div v-for="(step, index) in steps" :key="step.icon" class="flex min-w-0 flex-1 flex-col items-center gap-8 text-center">
        <div class="relative flex w-88 max-w-full flex-col items-center">
          <span
            v-if="index < steps.length - 1"
            aria-hidden="true"
            class="absolute top-25 left-[calc(50%+25px)] h-0 w-[calc(100%-18px)] border-t-[1.5px] border-dashed border-osp-step-dash max-2xs:hidden"
          />
          <span class="relative z-1 flex size-50 shrink-0 items-center justify-center overflow-hidden">
            <QIcon :name="step.icon" :size="50" />
          </span>
        </div>
        <p class="m-0 flex min-h-28 w-full items-start justify-center text-center text-xs leading-normal font-bold whitespace-pre-line text-text">
          {{ $t(step.titleKey) }}
        </p>
      </div>
    </div>
  </div>

  <!-- Choix du parcours -->
  <div class="mt-22 flex w-full flex-col gap-22">
    <h2 class="m-0 text-xl leading-16 font-semibold tracking-wider text-text">{{ $t('orientation.pathsTitle') }}</h2>

    <div role="radiogroup" :aria-label="$t('orientation.pathsTitle')" class="flex w-full flex-col gap-14">
      <button
        v-for="p in paths"
        :key="p.id"
        type="button"
        role="radio"
        :aria-checked="path === p.id"
        :class="[
          'box-border flex w-full items-center justify-between gap-12 rounded-xl border bg-white p-17 text-left',
          path === p.id ? 'border-osp-path-selected-border' : 'border-osp-path-border',
        ]"
        @click="path = p.id"
      >
        <span class="flex min-w-0 flex-1 items-center gap-12">
          <span :class="['flex size-40 shrink-0 items-center justify-center overflow-hidden rounded-full', p.bg]">
            <QIcon :name="p.icon" :size="p.iconSize" />
          </span>
          <span class="flex min-w-0 flex-1 flex-col items-start">
            <span class="flex flex-wrap items-start gap-6 max-2xs:flex-col max-2xs:gap-4">
              <span class="text-lg leading-[16.25px] font-semibold text-text">{{ $t(p.titleKey) }}</span>
              <span class="whitespace-nowrap rounded-md bg-osp-path-badge-bg px-6 py-2 text-2xs leading-12 font-medium text-osp-path-badge">
                {{ $t('orientation.pathBadge') }}
              </span>
            </span>
            <span class="mt-2 text-exact-10-5 leading-[15.75px] font-normal text-text">{{ $t(p.descKey) }}</span>
          </span>
        </span>
        <span
          :class="[
            'size-14 shrink-0 rounded-full box-border',
            path === p.id ? 'border-4 border-osp-path-radio-selected' : 'border border-osp-path-radio-border',
          ]"
          aria-hidden="true"
        />
      </button>
    </div>
  </div>

  <div class="mt-22 w-full">
    <NuxtLink
      :to="localePath(`/orientation/formules?path=${path}`)"
      class="box-border flex w-full items-center justify-center gap-10 rounded-xl bg-primary-cta px-24 py-16 text-center text-xl leading-[22.5px] font-semibold text-white no-underline"
    >
      <span>{{ $t('orientation.cta') }}</span>
      <img src="/img/icons/ic-osp-cta-arrow.svg" alt="" width="20" height="20" class="block shrink-0">
    </NuxtLink>
  </div>

  <TrustStrip class="mt-22" />
</template>
