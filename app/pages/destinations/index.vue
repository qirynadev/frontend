<script setup lang="ts">
/**
 * Choix de la destination ← `maquette/pwa/pages/destination-etude.html`.
 *
 * | Bloc | Règles reprises de `app.css` |
 * |---|---|
 * | barre supérieure | `.dest-topbar` `padding-bottom: 30px` |
 * | introduction | `.dest-intro` `padding-bottom: var(--dest-block-gap)` = 22px · h1 20px `-0.65px` · p 14px/22,75px |
 * | grille | `.dest-grid` 3 colonnes, **2 sous 400px**, `gap: 10px` |
 * | encart d'aide | `.dest-help-wrap` `padding: 22px 0` · `.dest-help` fond `#f5f3ff`, `padding: 20px 9px`, `gap: 16px`, icône 44×44 |
 * | réassurance | `data-trust-bar` |
 */
import { destinationRepo } from '~/core/repositories'

const { t, locale } = useI18n()

const { data, apiError, isInitialLoading, refresh } = await usePageData(
  'destinations',
  () => destinationRepo.list(locale.value),
  { watch: [locale] },
)

const destinations = computed(() => data.value ?? [])

usePageSeo(() => ({
  title: t('destination.list.seoTitle'),
  description: t('destination.list.seoDescription'),
}))
</script>

<template>
  <div>
    <AppTopBar back back-to="/" />

    <div class="w-full pb-22">
      <h1 class="m-0 text-4xl leading-normal font-semibold tracking-tight text-text">
        {{ $t('destination.list.title') }}
      </h1>
    </div>

    <PageState
      :loading="isInitialLoading"
      :error="apiError"
      :empty="destinations.length === 0"
      :empty-title="$t('destination.list.emptyTitle')"
      :empty-description="$t('destination.list.emptyDescription')"
      :on-retry="() => refresh()"
    >
      <template #loading>
        <div class="grid w-full grid-cols-3 gap-10 max-xs:grid-cols-2">
          <QSkeleton v-for="index in 6" :key="index" variant="rect" :height="217" />
        </div>
      </template>

      <div class="grid w-full grid-cols-3 gap-10 max-xs:grid-cols-2">
        <DestinationCard
          v-for="destination in destinations"
          :key="destination.id"
          :destination="destination"
        />
      </div>

      <!-- Encart d'accompagnement -->
      <div class="w-full py-22">
        <div class="flex w-full items-start gap-16 rounded-xl bg-surface-2 px-9 py-20">
          <QIcon name="ic-dest-help" :size="44" />
          <div>
            <p class="m-0 text-base leading-20 font-bold text-text">
              {{ $t('destination.list.helpTitle') }}
            </p>
            <p class="m-0 pt-4 text-sm leading-16 text-text">
              {{ $t('destination.list.helpDescription') }}
            </p>
          </div>
        </div>
      </div>

      <TrustStrip />
    </PageState>
  </div>
</template>
