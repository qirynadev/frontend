<script setup lang="ts">
/**
 * Page tarifaire ← `maquette/pwa/pages/formule.html`.
 *
 * | Bloc | Règles reprises de `app.css` |
 * |---|---|
 * | barre supérieure | `.formule-topbar` `padding-bottom: 30px` |
 * | introduction | h1 20px `-0.65px` `line-height: normal` · p 14px/22,75px |
 * | carrousel | `.formule-slider` `max-width: 360px`, `padding: 20px 0 16px` (plein écran sous 380px) |
 * | cadre | `.formule-slider-frame` grille `28px 1fr 28px`, `gap: 4px` (24px / 2px sous 380px) |
 * | défilement | piste translatée, `transition: transform .32s ease` |
 * | pastilles | 6×6, active 18×6, `gap: 8px`, `margin-top: 14px` |
 * | arguments | `.formule-features` `padding: 13px 11px`, rayon 10, ombre `0 0 3.5px`, séparateurs 1×32 |
 * | réassurance | `data-trust-bar` |
 *
 * Le slug désigne indifféremment une **langue** (trois paliers mensuels
 * `courses[].formulas`) ou un **domaine d'étude** (un paiement unique
 * `offers[]`). L'adapter ramène les deux au même contrat : cette page n'a
 * qu'un cas à traiter.
 *
 * Le carrousel est écrit ici plutôt qu'avec `QCarousel` : la maquette translate
 * une piste, là où `QCarousel` s'appuie sur `scroll-snap` — deux mécaniques
 * différentes, et c'est celle de la maquette qui fait foi.
 */
import { offerPageRepo } from '~/core/repositories'

const route = useRoute()
const { t, locale } = useI18n()

const slug = computed(() => String(route.params.slug ?? ''))

const { data: offer, apiError, isInitialLoading, refresh } = await usePageData(
  `offer-${slug.value}`,
  () => offerPageRepo.bySlug(slug.value, locale.value),
  { watch: [slug, locale] },
)

if (offer.value === null && !apiError.value) {
  throw createError({ statusCode: 404, statusMessage: t('offer.notFound'), fatal: true })
}

const tiers = computed(() => offer.value?.tiers ?? [])
const current = ref(0)

watch(tiers, () => { current.value = 0 })

function go(index: number) {
  const total = tiers.value.length
  if (total === 0) return
  current.value = Math.min(Math.max(index, 0), total - 1)
}

/**
 * Départ du paiement.
 *
 * Un visiteur non connecté ne reçoit pas d'erreur : son choix est mémorisé et
 * il repart vers la connexion, d'où il sera ramené ici. Voir `useCheckout`.
 */
const { pending: checkoutPending, errorKey: checkoutErrorKey, start: startCheckout } = useCheckout()

/** Les trois arguments du bas de page — éditoriaux, non administrés. */
const features = [
  { icon: 'ic-formule-visio', titleKey: 'offer.feature.visio', subKey: 'offer.feature.visioSub' },
  { icon: 'ic-formule-profs', titleKey: 'offer.feature.certified', subKey: 'offer.feature.certifiedSub' },
  { icon: 'ic-formule-perso', titleKey: 'offer.feature.tailored', subKey: 'offer.feature.tailoredSub' },
]

useContractSeo(() => offer.value?.seo, t('offer.fallbackTitle'))
</script>

<template>
  <div>
    <AppTopBar back back-to="/langues" />

    <PageState :loading="isInitialLoading" :error="apiError" :on-retry="() => refresh()">
      <template #loading>
        <div class="flex flex-col gap-16">
          <QSkeleton variant="text" :lines="2" />
          <QSkeleton variant="rect" :height="420" />
        </div>
      </template>

      <template v-if="offer">
        <div class="w-full">
          <h1 class="m-0 text-4xl leading-normal font-semibold tracking-tight text-text">
            {{ $t('offer.title') }}
          </h1>
          <p class="m-0 text-xl leading-[22.75px] text-text">
            {{ $t('offer.subtitle') }}
          </p>
        </div>

        <!-- Le paiement n'a pas pu démarrer : dit ici, au-dessus des paliers,
             plutôt que sous un bouton hors du champ de vision après le clic. -->
        <QAlert
          v-if="checkoutErrorKey"
          tone="danger"
          :title="$t('auth.error.title')"
          :message="$t(checkoutErrorKey)"
          class="mt-16"
        />

        <!-- Carrousel de paliers -->
        <div v-if="tiers.length > 0" class="mx-auto w-full max-w-360 pt-20 pb-16 max-2xs:max-w-none">
          <div class="grid w-full grid-cols-[28px_minmax(0,1fr)_28px] items-center gap-4 max-2xs:grid-cols-[24px_minmax(0,1fr)_24px] max-2xs:gap-2">
            <button
              type="button"
              class="inline-flex size-28 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-slider-arrow transition-colors duration-150 hover:bg-slider-arrow-bg hover:text-primary-cta focus-visible:bg-slider-arrow-bg focus-visible:text-primary-cta"
              :aria-label="$t('ds.carousel.previous')"
              :disabled="current === 0"
              @click="go(current - 1)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 6L9 12L15 18" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>

            <div class="w-full touch-pan-y overflow-hidden">
              <div
                class="flex w-full motion-safe:transition-transform motion-safe:duration-[320ms] motion-safe:ease-out"
                :style="{ transform: `translateX(-${current * 100}%)` }"
              >
                <OfferTierCard
                  v-for="(tier, index) in tiers"
                  :key="tier.id"
                  :tier="tier"
                  :index="index"
                  :total="tiers.length"
                  :loading="checkoutPending === tier.id"
                  :disabled="checkoutPending !== null && checkoutPending !== tier.id"
                  @choose="offer && startCheckout(offer, $event)"
                />
              </div>
            </div>

            <button
              type="button"
              class="inline-flex size-28 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-slider-arrow transition-colors duration-150 hover:bg-slider-arrow-bg hover:text-primary-cta focus-visible:bg-slider-arrow-bg focus-visible:text-primary-cta"
              :aria-label="$t('ds.carousel.next')"
              :disabled="current >= tiers.length - 1"
              @click="go(current + 1)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <div
            v-if="tiers.length > 1"
            role="tablist"
            :aria-label="$t('offer.tiersLabel')"
            class="mt-14 flex items-center justify-center gap-8"
          >
            <button
              v-for="(tier, index) in tiers"
              :key="tier.id"
              type="button"
              role="tab"
              :aria-selected="index === current"
              :aria-label="tier.name"
              :class="[
                'h-6 cursor-pointer rounded-full border-0 p-0 transition-all duration-200',
                index === current ? 'w-18 bg-primary-cta' : 'w-6 bg-slider-dot',
              ]"
              @click="go(index)"
            />
          </div>
        </div>

        <QCard v-else variant="outlined" padding="none">
          <QEmptyState icon="ic-formule-kili" :title="$t('offer.emptyTitle')" :description="$t('offer.emptyDescription')" />
        </QCard>

        <!-- Arguments -->
        <div class="w-full pb-20">
          <div class="flex w-full items-center justify-center gap-13 rounded-xl bg-white px-11 py-13 shadow-card">
            <template v-for="(feature, index) in features" :key="feature.titleKey">
              <span v-if="index > 0" aria-hidden="true" class="h-32 w-0 shrink-0 border-l border-tier-border" />
              <div class="flex min-w-0 flex-1 items-center justify-center gap-5">
                <QIcon :name="feature.icon" :size="24" />
                <div class="flex flex-col items-start pt-6 leading-[13.125px] text-navy">
                  <p class="m-0 text-xs leading-[13.125px] font-medium">{{ $t(feature.titleKey) }}</p>
                  <p class="m-0 text-2xs leading-[13.125px] font-normal">{{ $t(feature.subKey) }}</p>
                </div>
              </div>
            </template>
          </div>
        </div>

        <TrustStrip />
      </template>
    </PageState>
  </div>
</template>
