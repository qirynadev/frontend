<script setup lang="ts">
/**
 * Trouver mon logement ← `maquette/pwa/pages/logement.html`.
 *
 * La maquette réutilise la structure `.dest-*` de `destination-etude.html` :
 * même barre supérieure, même grille, même encart d'aide. Seuls le décompte
 * (« 350+ logements ») et les visuels changent.
 *
 * | Bloc | Règles reprises de `app.css` |
 * |---|---|
 * | barre supérieure | `.dest-topbar` `padding-bottom: 30px` |
 * | introduction | `.dest-intro` `padding-bottom: 22px` · h1 20px `-0.65px` · p 14px/22,75px |
 * | grille | `.dest-grid` 3 colonnes, **2 sous 400px**, `gap: 10px` |
 * | carte | `min-height: 217px`, `padding: 7px 7px 10px`, rayon 10 · photo 112px · drapeau 31×31 à `bottom: -15.5px` |
 * | encart d'aide | `.dest-help-wrap` `padding: 22px 0` · fond `#f5f3ff`, `padding: 20px 9px`, icône 44×44 |
 *
 * Les cartes de la maquette sont des **boutons de sélection**, sans mener
 * nulle part : `offres-logement.html` n'avait pas de route. Elle en a une
 * désormais (`logement/[slug]`, cadrée avec le responsable) : les cartes
 * y renvoient.
 */
import { logementDestinations } from '~/config/logement-destinations'

const { t } = useI18n()
const localePath = useLocalePath()

usePageSeo(() => ({
  title: t('housing.seoTitle'),
  description: t('housing.seoDescription'),
}))
</script>

<template>
  <div>
    <AppTopBar back back-to="/" />

    <div class="w-full pb-22">
      <h1 class="m-0 text-4xl leading-normal font-semibold tracking-tight text-text">
        {{ $t('housing.title') }}
      </h1>
      <p class="m-0 text-xl leading-[22.75px] text-text">
        {{ $t('housing.subtitle') }}
      </p>
    </div>

    <div class="grid w-full grid-cols-3 gap-10 max-xs:grid-cols-2">
      <NuxtLink
        v-for="destination in logementDestinations"
        :key="destination.id"
        :to="localePath(`/logement/${destination.id}`)"
        class="relative flex min-h-217 max-xs:min-h-0 w-full flex-col items-start gap-22 rounded-xl border border-transparent bg-white px-7 pt-7 pb-10 text-left text-text no-underline shadow-card box-border"
      >
        <div class="relative h-112 w-full shrink-0">
          <img
            :src="destination.photo"
            alt=""
            width="206"
            height="224"
            loading="lazy"
            class="block h-112 w-full rounded-sm object-cover"
          >
          <img
            :src="destination.flag"
            alt=""
            width="31"
            height="31"
            loading="lazy"
            class="absolute bottom-[-15.5px] left-1/2 z-1 block size-31 -translate-x-1/2 rounded-full object-cover"
          >
        </div>

        <div class="flex w-full flex-col items-start">
          <p class="m-0 w-full text-base leading-20 font-bold text-text">{{ $t(destination.labelKey) }}</p>

          <div class="flex w-full items-center justify-between">
            <span class="flex min-w-0 flex-1 items-center gap-4">
              <QIcon name="ic-log-home" :size="9" />
              <span class="truncate text-3xs leading-[16.5px] font-semibold text-text">
                {{ $t('housing.countLabel') }}
              </span>
            </span>
            <QIcon name="ic-log-chevron" :size="9" />
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Encart d'accompagnement -->
    <div class="w-full py-22">
      <div class="flex w-full items-start gap-16 rounded-xl bg-surface-2 px-9 py-20">
        <QIcon name="ic-log-help" :size="44" />
        <div>
          <p class="m-0 text-base leading-20 font-bold text-text">
            {{ $t('housing.helpTitle') }}
          </p>
          <p class="m-0 pt-4 text-sm leading-16 text-text">
            {{ $t('housing.helpDescription') }}
          </p>
        </div>
      </div>
    </div>

    <TrustStrip />
  </div>
</template>
