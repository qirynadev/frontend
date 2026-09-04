<script setup lang="ts">
/**
 * Parcours : `/logement` → `/logement/[slug]/decouverte` → `/logement/[slug]`
 * (formules).
 * même barre supérieure, même grille, même encart d'aide. Seuls le décompte
 * (villes couvertes) et les visuels changent.
 *
 * | Bloc | Règles reprises de `app.css` |
 * |---|---|
 * | barre supérieure | `.dest-topbar` `padding-bottom: 30px` |
 * | introduction | `.dest-intro` `padding-bottom: 22px` · h1 20px `-0.65px` · p 14px/22,75px |
 * | grille | `.dest-grid` 3 colonnes, **2 sous 400px**, `gap: 10px` |
 * | carte | `min-height: 217px`, `padding: 7px 7px 10px`, rayon 10 · photo 112px · drapeau 31×31 à `bottom: -15.5px` |
 * | encart d'aide | `.dest-help-wrap` `padding: 22px 0` · fond `#f5f3ff`, `padding: 20px 9px`, icône 44×44 |
 *
 * **Grille dynamique** (décision du responsable, 2026-08-17) : les destinations
 * viennent de `GET /livings`, pas d'une liste éditoriale fixe — seuls les pays
 * réellement dotés de formules apparaissent. Au 2026-08-17, cinq pays sur les
 * six qu'affichait l'ancienne liste statique (`config/logement-destinations.ts`,
 * supprimé) : pas d'Allemagne, faute de formule publiée côté back-office.
 * Mêmes cartes, même structure `DestinationCard` que `destinations/index.vue` —
 * portée ici en ligne plutôt qu'en composant partagé ; le badge affiche le
 * nombre de villes (`cityCount`) quand l'API le fournit, sinon un libellé
 * éditorial « 350+ villes ». Voir `docs/logement-mocks.md`.
 */
import { livingRepo } from '~/core/repositories'

const { t, locale } = useI18n()
const localePath = useLocalePath()

/** Repli éditorial tant que `/livings` n'expose pas `cities_count`. */
const FALLBACK_CITY_COUNT = 350

const { data, apiError, isInitialLoading, refresh } = await usePageData(
  'logement-destinations',
  () => livingRepo.list(locale.value),
  { watch: [locale] },
)

const destinations = computed(() => data.value ?? [])

function cityLabel(count: number | null): string {
  const n = count ?? FALLBACK_CITY_COUNT
  if (count === null) return t('housing.countLabel', { count: n })
  return t('housing.cityCount', n)
}

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

    <PageState
      :loading="isInitialLoading"
      :error="apiError"
      :empty="destinations.length === 0"
      :empty-title="$t('housing.emptyTitle')"
      :empty-description="$t('housing.emptyDescription')"
      :on-retry="() => refresh()"
    >
      <template #loading>
        <div class="grid w-full grid-cols-3 gap-10 max-xs:grid-cols-2">
          <QSkeleton v-for="index in 6" :key="index" variant="rect" :height="217" />
        </div>
      </template>

      <div class="grid w-full grid-cols-3 gap-10 max-xs:grid-cols-2">
        <NuxtLink
          v-for="destination in destinations"
          :key="destination.slug"
          :to="localePath(`/logement/${destination.slug}/decouverte`)"
          class="relative flex min-h-217 max-xs:min-h-0 w-full flex-col items-start gap-22 rounded-xl border border-transparent bg-surface-card px-7 pt-7 pb-10 text-left text-text no-underline shadow-card box-border"
        >
          <div class="relative h-112 w-full shrink-0">
            <NuxtImg
              v-if="destination.photo"
              :src="destination.photo"
              :alt="destination.country.name"
              width="206"
              height="224"
              format="webp"
              loading="lazy"
              sizes="110px shell:220px"
              class="block h-112 w-full rounded-sm object-cover"
            />
            <div v-else class="flex h-112 w-full items-center justify-center rounded-sm bg-surface-2">
              <QIcon name="ic-dom-stat-globe" :size="24" />
            </div>
            <img
              v-if="destination.country.flag"
              :src="destination.country.flag"
              alt=""
              width="31"
              height="31"
              loading="lazy"
              class="absolute bottom-[-15.5px] left-1/2 z-1 block size-31 -translate-x-1/2 rounded-full object-cover"
            >
          </div>

          <div class="flex w-full flex-col items-start">
            <p class="m-0 w-full text-base leading-20 font-bold text-text">{{ destination.country.name }}</p>

            <div class="flex w-full items-center justify-between">
              <span class="flex min-w-0 flex-1 items-center gap-4">
                <QIcon name="ic-log-home" :size="9" />
                <span class="truncate text-3xs leading-[16.5px] font-semibold text-text">
                  {{ cityLabel(destination.cityCount) }}
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
    </PageState>
  </div>
</template>
