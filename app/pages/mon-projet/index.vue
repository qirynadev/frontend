<script setup lang="ts">
/**
 * Mon projet ← `maquette/pwa/pages/mon-projet.html`.
 *
 * Liste des accompagnements suivis, protégée par le middleware `auth`.
 *
 * | Bloc | Règles reprises de `app.css` |
 * |---|---|
 * | rythme | `.page-mp .mp-main` `gap: 22px` (`--mp-block-gap`) entre tous les blocs — plus de marges/paddings individuels depuis la resynchronisation `f9ca05c` |
 * | en-tête | `.page-mp .home-topbar` `padding-bottom: 0`, `margin-bottom: 0` |
 * | accroche | `.page-mp .mp-hero` `padding: 0`, `min-height: 130px` · copie plafonnée à 166px · illustration 220×155 ancrée en haut à droite (`top: 0`) |
 * | titre de section | `.mp-section-head` h2 14px/27,5px |
 * | liste | `.mp-list` `gap: 14px` · cartes `padding: 17px`, rayon 10 |
 * | carte | icône ronde 44×44 · pastille 10px · sous-titre 12,5px/15,625px · chevron 18×16 opacité 0,7 |
 * | progression | piste 4px `#f1f5f9` · remplissage propre à chaque accompagnement · pourcentage 13px/19,5px |
 * | méta | filet `rgba(241,245,249,0.8)` · conseiller 11,5px/17,25px |
 * | encart | `.mp-cta` hauteur fixe 86px, fond `#f5f3ff`, `padding: 0 9px` |
 *
 * L'écran `mon-projet-apercu.html` (blocs aperçu, statistiques et rendez-vous,
 * classes `.projet-*`) est une **maquette distincte** : il a sa propre route à
 * cadrer, il ne s'agit pas de la même page.
 *
 * Une carte par **commande**, pas par type : un client peut avoir plusieurs
 * bilans d'orientation, par exemple (voir `useProjetData.ts`). La maquette
 * n'en montre qu'une par type parce que sa donnée d'essai n'en avait qu'une —
 * `.mp-list`/`.mp-card` sont déjà une liste répétable, rien à changer côté
 * gabarit.
 *
 * Exception : les **langues** se regroupent par langue, pas par commande
 * (deux commandes d'anglais → une carte, heures additionnées) — confirmé par
 * le responsable le 2026-08-17. `toLanguageAccompagnements` les calcule à
 * part, insérées à la position que la maquette leur donne (après logement,
 * avant orientation).
 */
import type { ProjetBadgeTone } from '~/core/contracts/projet'

definePageMeta({ middleware: 'auth' })

const { t, locale } = useI18n()
const localePath = useLocalePath()

const { data, apiError, isInitialLoading, refresh } = await useProjetData(locale)

const accompagnements = computed(() => {
  const orders = data.value?.orders ?? []
  const before = toAccompagnements(orders.filter((order) => order.serviceType === 'areaofstudy' || order.serviceType === 'costofliving'))
  const languages = toLanguageAccompagnements(data.value?.languages ?? [], data.value?.sessions ?? [])
  const after = toAccompagnements(orders.filter((order) => order.serviceType === 'profilage'))
  return [...before, ...languages, ...after]
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
    :empty="accompagnements.length === 0"
    :on-retry="() => refresh()"
  >
    <template #loading>
      <div class="flex flex-col gap-14">
        <QSkeleton v-for="index in 4" :key="index" variant="rect" :height="120" />
      </div>
    </template>

    <template #empty>
      <p class="m-0">{{ $t('myProject.emptyTitle') }}</p>
    </template>

    <!-- Les gouttières (16px) et le retrait supérieur viennent du layout
         mobile ; ne pas les doubler ici. -->
    <div class="page-mp flex flex-1 flex-col bg-white">
      <div class="mp-main flex w-full max-w-full flex-col gap-22 box-border">
        <!-- Topbar : Retour + Logo + Cloche -->
        <AppTopBar :back="true" back-to="/" :notifications="3" :gap="0" />

        <!-- Accroche -->
        <section class="mp-hero relative flex w-full min-h-130 items-start gap-10" aria-labelledby="projet-title">
          <div class="mp-hero-copy relative z-1 min-w-0 max-w-166 flex-1">
            <h1 id="projet-title" class="m-0 text-4xl leading-[31.25px] font-semibold tracking-[-0.625px] text-text">
              {{ $t('myProject.title') }}
            </h1>
            <p class="m-0 mt-8 text-xl leading-[normal] font-normal text-text">
              {{ $t('myProject.intro') }}
            </p>
          </div>
          <!-- `width: min(220px, 58%)` : l'illustration se rogne par la droite
               plutôt que de pousser la copie. -->
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

        <!-- Titre de section -->
        <div class="mp-section-head flex w-full items-center justify-between box-border">
          <h2 id="accompagnements-title" class="m-0 text-xl leading-[27.5px] font-bold text-navy-2">
            {{ $t('myProject.accompaniementsTitle') }}
          </h2>
        </div>

        <!-- Liste des accompagnements -->
        <div class="mp-list flex w-full flex-col gap-14" aria-labelledby="accompagnements-title">
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

            <div v-if="item.progressPercent !== null" class="mp-progress flex w-full items-center gap-12 pt-10 box-border">
              <span class="mp-progress-track h-4 min-w-0 flex-1 overflow-hidden rounded-full bg-border-soft">
                <span class="mp-progress-fill block h-4 rounded-full" :style="{ width: `${item.progressPercent}%`, background: item.progressColor }" />
              </span>
              <span class="mp-progress-pct shrink-0 text-lg leading-[19.5px] font-semibold text-navy-2">{{ item.progressPercent }}%</span>
            </div>

            <div class="mp-card-meta mt-12 flex w-full items-center justify-between gap-8 border-t border-mp-divider pt-5 box-border">
              <span v-if="item.advisorName" class="mp-meta-person inline-flex min-w-0 items-center gap-6 text-exact-11-5 font-medium text-slate">
                <img src="/img/icons/ic-user.svg" alt="" width="11" height="11" class="size-11 shrink-0 opacity-70">
                <span>{{ $t('myProject.advisorLabel') }}<strong class="font-medium text-navy-2">{{ item.advisorName }}</strong></span>
              </span>
              <span v-if="item.updatedAt" class="mp-meta-updated shrink-0 ml-auto text-exact-11-5 font-medium text-mp-updated">
                {{ $t('myProject.updatedDaysAgo', daysSince(item.updatedAt)) }}
              </span>
            </div>
          </NuxtLink>
        </div>

        <!-- Encart d'encouragement -->
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
