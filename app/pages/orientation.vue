<script setup lang="ts">
/**
 * Offre d'orientation ← `maquette/pwa/pages/offre-orientation.html`.
 *
 * Source : `GET /profilage`. Les « catégories » du back-office deviennent le
 * bloc « Ce qui est inclus » — même chose, nom différent.
 *
 * | Bloc | Règles reprises de `app.css` (`.oo-*`) |
 * |---|---|
 * | héros | dégradé `90deg`, `min-height: 196px`, illustration surdimensionnée en absolu |
 * | inclus | cartes `padding: 11px 21px` (14px sous 380px), icône 48×48, coche 28×28 |
 * | tarif | fond `#4f31eb`, badge `#4029c7`, prix en `Plus Jakarta Sans` 29px/40px |
 *
 * ⚠️ **La maquette affiche « 899 € — paiement unique ». L'API n'expose aucun
 * prix pour cette offre.** Plutôt que d'inscrire en dur un montant commercial —
 * la pire chose à figer dans du code — le bloc tarifaire ne s'affiche que si le
 * champ est alimenté. En attendant, l'appel à l'action reste, sans prix.
 *
 * `orientation.description` n'est pas optionnel dans le contrat, mais la
 * maquette ne lui réserve aucun bloc visuel (elle n'a que les fonctionnalités
 * et le tarif). Affiché en texte courant entre les deux pour ne pas perdre un
 * contenu réel de l'API — écart signalé, pas un oubli.
 *
 * Sous 380px (`max-2xs:`, `@media (max-width: 380px)` de la maquette) : le
 * titre du héros passe à 22px, les cartes resserrent leur retrait horizontal,
 * et la ligne tarif/CTA passe à la ligne (séparateur masqué, CTA pleine
 * largeur).
 */
import { orientationRepo } from '~/core/repositories'

const { t, n, locale } = useI18n()
const localePath = useLocalePath()

const { data: orientation, apiError, isInitialLoading, refresh } = await usePageData(
  'orientation',
  () => orientationRepo.load(locale.value),
  { watch: [locale] },
)

useContractSeo(() => orientation.value?.seo, t('orientation.fallbackTitle'))
useOfferSchemaOrg(orientation)
</script>

<template>
  <AppTopBar back back-to="/" :notifications="3" />

  <PageState
    :loading="isInitialLoading"
    :error="apiError"
    :empty="orientation === null"
    :empty-title="$t('orientation.emptyTitle')"
    :empty-description="$t('orientation.emptyDescription')"
    :on-retry="() => refresh()"
  >
    <template #loading>
      <div class="flex flex-col gap-16">
        <QSkeleton variant="rect" :height="196" />
        <QSkeleton variant="row" />
        <QSkeleton variant="row" />
        <QSkeleton variant="rect" :height="96" />
      </div>
    </template>

    <template v-if="orientation">
      <!-- Héros -->
      <section
        class="relative box-border flex min-h-196 w-full items-center justify-between gap-8 overflow-hidden rounded-xl bg-gradient-to-r from-oo-hero-1 via-oo-hero-2 to-oo-hero-3 px-15 py-32 max-2xs:px-12 max-2xs:py-24"
      >
        <div class="min-w-0 flex-1">
          <h1 class="m-0 text-5xl leading-30 font-semibold text-text max-2xs:text-[22px]">{{ orientation.title }}</h1>
          <p class="m-0 mt-12 text-xl leading-20 font-normal text-text">{{ $t('orientation.heroText') }}</p>
        </div>
        <div class="relative size-130 shrink-0 overflow-visible">
          <NuxtImg
            :src="orientation.image || '/img/hero-gift.webp'"
            alt=""
            width="218"
            height="145"
            format="webp"
            class="pointer-events-none absolute top-8 -left-66 block h-145 w-218 max-w-none object-contain object-center"
          />
        </div>
      </section>

      <!-- Ce qui est inclus -->
      <section class="w-full pb-20">
        <h2 class="m-0 pt-32 pb-12 text-xl leading-16 font-semibold tracking-wider text-text">
          {{ $t('orientation.includedTitle') }}
        </h2>

        <div v-if="orientation.features.length > 0" class="flex w-full flex-col gap-16">
          <article
            v-for="feature in orientation.features"
            :key="feature.slug || feature.title"
            class="box-border flex w-full items-center justify-between gap-12 rounded-xl border border-oo-feature-border bg-white px-21 py-11 max-2xs:px-14"
          >
            <div class="flex min-w-0 flex-1 items-center gap-16">
              <span class="flex size-48 shrink-0 items-center justify-center overflow-hidden">
                <NuxtImg
                  v-if="feature.icon"
                  :src="feature.icon"
                  alt=""
                  width="48"
                  height="48"
                  format="webp"
                  loading="lazy"
                  class="block size-48 object-contain"
                />
                <QIcon v-else name="target" :size="24" class="text-primary" />
              </span>
              <div class="min-w-0 flex-1">
                <h3 class="m-0 text-xl leading-24 font-semibold text-text">{{ feature.title }}</h3>
                <RichText v-if="feature.description" :content="feature.description" class="mt-4" />
              </div>
            </div>
            <span class="flex size-28 shrink-0 items-center justify-center overflow-hidden">
              <img src="/img/icons/ic-oo-check.svg" alt="" width="28" height="28" class="block size-28">
            </span>
          </article>
        </div>

        <QCard v-else variant="outlined" padding="none">
          <QEmptyState icon="target" :title="$t('orientation.featuresEmpty')" />
        </QCard>
      </section>

      <RichText v-if="orientation.description" :content="orientation.description" class="mb-20" />

      <!-- Tarif -->
      <section class="mb-16 box-border flex w-full flex-col gap-9 rounded-xl bg-oo-price-bg p-11">
        <div class="flex w-full items-center gap-12 max-2xs:flex-wrap">
          <div v-if="orientation.price" class="min-w-0 flex-none">
            <span
              class="inline-flex h-23 items-center rounded-full bg-oo-price-badge-bg px-8 text-2xs leading-15 font-medium tracking-[0.5px] text-white uppercase"
            >
              {{ $t('orientation.priceBadge') }}
            </span>
            <p class="m-0 mt-6 font-jakarta text-[29px] leading-40 font-bold tracking-[-0.9px] whitespace-nowrap text-white">
              {{ n(orientation.price.amount, 'currency') }}
            </p>
            <p class="m-0 text-md leading-[16.5px] tracking-[0.275px] whitespace-nowrap text-white/90">
              {{ orientation.price.mode === 'once' ? $t('offer.oneOff') : $t('offer.perMonth') }}
            </p>
          </div>
          <p v-else class="m-0 min-w-0 flex-1 text-base text-white">{{ $t('orientation.priceOnRequest') }}</p>

          <span v-if="orientation.price" class="ml-4 h-52 w-1 shrink-0 bg-white/35 max-2xs:hidden" aria-hidden="true" />

          <NuxtLink
            :to="localePath('/compte')"
            class="box-border flex h-52 min-w-0 flex-1 items-center justify-center gap-8 rounded-xl bg-white px-12 text-center text-base leading-20 font-semibold text-primary-link no-underline max-2xs:w-full max-2xs:flex-[1_1_100%]"
          >
            <span>{{ $t('orientation.cta') }}</span>
            <img src="/img/icons/ic-oo-cta-arrow.svg" alt="" width="8" height="7" class="block shrink-0">
          </NuxtLink>
        </div>
        <div class="flex items-center gap-7">
          <img src="/img/icons/ic-oo-shield.svg" alt="" width="20" height="20" class="block shrink-0">
          <span class="text-md leading-[16.5px] text-white">{{ $t('orientation.secure') }}</span>
        </div>
      </section>

      <TrustStrip />
    </template>
  </PageState>
</template>
