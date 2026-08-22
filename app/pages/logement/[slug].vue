<script setup lang="ts">
/**
 * Offres de logement ← `maquette/pwa/pages/offres-logement.html`
 * (`.formule-*`, `.of-card-badge`, `.ol-*`).
 *
 * **UI alignée sur `/orientation/formules`** (2026-08-22) : pile verticale
 * `gap: 22px`, ruban coloré + titre/icône inline — plus de carrousel.
 * Conservé propres au logement : bandeau pays (`.ol-banner`), badges
 * « X logements proposés », palette Yukon/Comoé/Volga.
 *
 * **Données** — `GET /livings` via `offerPageRepo`. Checkout Stripe via
 * `useCheckout` (comme `offres/[slug].vue`).
 *
 * - **paliers** : habillage par **rang** (vert → violet mis en avant →
 *   orange plein), pas par nom API.
 * - **badge logements** : texte éditorial par rang (pas de `listings_count`
 *   API au 2026-08-17).
 * - **bandeau statistique** : champs absents masqués (pas de repli France).
 */
import { offerPageRepo } from '~/core/repositories'

const route = useRoute()
const { t, n, locale } = useI18n()

const slug = computed(() => String(route.params.slug ?? ''))

const { data: offer, apiError, isInitialLoading, refresh } = await usePageData(
  `logement-offer-${slug.value}`,
  () => offerPageRepo.bySlug(slug.value, locale.value),
  { watch: [slug, locale] },
)

if (offer.value === null && !apiError.value) {
  throw createError({ statusCode: 404, statusMessage: t('offer.notFound'), fatal: true })
}

const living = computed(() => offer.value?.living ?? null)

/** Une seule statistique par ligne, et seulement celles renseignées pour ce pays. */
const stats = computed(() => {
  const details = living.value
  if (!details) return []
  return (
    [
      details.depositLabel && { icon: 'ic-ol-stat-caution', value: details.depositLabel, labelKey: 'housing.offers.statCautionLabel' },
      details.leaseDurationLabel && { icon: 'ic-ol-stat-bail', value: details.leaseDurationLabel, labelKey: 'housing.offers.statBailLabel' },
      details.chargesLabel && { icon: 'ic-ol-stat-charges', value: details.chargesLabel, labelKey: 'housing.offers.statChargesLabel' },
      details.averageRentLabel && { icon: 'ic-ol-stat-loyer', value: details.averageRentLabel, labelKey: 'housing.offers.statLoyerLabel' },
    ] as const
  ).filter((stat): stat is { icon: string, value: string, labelKey: string } => Boolean(stat))
})

/**
 * Habillage par rang : vert (1ᵉʳ) / violet mis en avant (intermédiaires) /
 * orange plein (dernier) — indépendant du nom réel de la formule.
 */
function visualFor(index: number, total: number) {
  if (total > 1 && index === total - 1) {
    return {
      card: 'border-ol-yukon-border',
      name: 'text-ol-yukon-name',
      price: 'text-ol-yukon-price',
      button: 'bg-ol-yukon-button text-white',
      icon: 'ic-ol-yukon',
      check: 'ic-ol-check-orange',
      isTop: true,
      ribbonBg: 'bg-ol-yukon-button',
      badgeBg: 'bg-ol-badge-yukon-bg',
      badgeText: 'text-ol-badge-yukon',
      badgeKey: 'housing.offers.badge3',
    }
  }
  if (index === 0) {
    return {
      card: 'border-tier-border',
      name: 'text-tier-1',
      price: 'text-tier-1-price',
      button: 'border border-tier-1-line bg-white text-tier-1-line',
      icon: 'ic-ol-comoe',
      check: 'ic-ol-check-green',
      isTop: false,
      ribbonBg: 'bg-tier-1',
      badgeBg: 'bg-ol-badge-comoe-bg',
      badgeText: 'text-ol-badge-comoe',
      badgeKey: 'housing.offers.badge1',
    }
  }
  return {
    card: 'border-ol-featured-border',
    name: 'text-tier-2',
    price: 'text-tier-2',
    button: 'border border-tier-2 bg-white text-tier-2',
    icon: 'ic-ol-volga',
    check: 'ic-ol-check-purple',
    isTop: false,
    ribbonBg: 'bg-tier-2',
    badgeBg: 'bg-ol-badge-volga-bg',
    badgeText: 'text-ol-badge-volga',
    badgeKey: 'housing.offers.badge2',
  }
}

const tiers = computed(() => {
  const list = offer.value?.tiers ?? []
  return list.map((tier, index) => ({
    tier,
    visual: visualFor(index, list.length),
    tagline: tier.tagline || t(`housing.offers.tagline${Math.min(index + 1, 3)}`),
  }))
})

const { pending: checkoutPending, errorKey: checkoutErrorKey, start: startCheckout } = useCheckout()

useContractSeo(() => offer.value?.seo, t('housing.offers.fallbackTitle'))
</script>

<template>
  <div>
    <AppTopBar back back-to="/logement" :notifications="3" :gap="22" />

    <PageState :loading="isInitialLoading" :error="apiError" :on-retry="() => refresh()">
      <template #loading>
        <div class="flex flex-col gap-16">
          <QSkeleton variant="rect" :height="130" />
          <QSkeleton variant="text" :lines="2" />
          <QSkeleton variant="rect" :height="420" />
        </div>
      </template>

      <template v-if="offer">
        <div class="flex w-full flex-col gap-22">
          <!-- Bandeau pays -->
          <section class="box-border flex w-full flex-col items-center gap-24 rounded-xl bg-ol-banner-bg py-17">
            <div class="box-border flex w-full items-center gap-10 px-13">
              <img v-if="offer.icon" :src="offer.icon" alt="" width="24" height="24" class="block size-24 shrink-0 rounded-full object-cover">
              <h1 class="m-0 min-w-0 flex-1 text-xl leading-normal font-semibold tracking-[-0.65px] text-text">
                {{ living?.heroTagline || $t('housing.offers.bannerHeadline') }}
              </h1>
            </div>
            <div v-if="stats.length > 0" class="box-border flex w-full items-start px-9">
              <div v-for="stat in stats" :key="stat.icon" class="flex min-w-0 flex-1 flex-col items-center gap-5 text-center">
                <QIcon :name="stat.icon" :size="40" />
                <p class="m-0 mt-6 text-md leading-[13.125px] font-semibold whitespace-nowrap text-navy">{{ stat.value }}</p>
                <p class="m-0 text-xs leading-normal font-medium text-text">{{ $t(stat.labelKey) }}</p>
              </div>
            </div>
          </section>

          <!-- Introduction -->
          <div class="w-full pb-8">
            <h1 class="m-0 text-exact-16 leading-22 font-semibold tracking-[0.2px] text-text">
              {{ $t('housing.offers.introTitle') }}
            </h1>
          </div>

          <QAlert
            v-if="checkoutErrorKey"
            tone="danger"
            :title="$t('auth.error.title')"
            :message="$t(checkoutErrorKey)"
          />

          <!-- Pile verticale (comme orientation/formules) -->
          <div v-if="tiers.length > 0" class="flex w-full flex-col gap-22 pt-8">
            <article
              v-for="entry in tiers"
              :key="entry.tier.id"
              :class="[
                'relative box-border flex w-full min-w-0 flex-col gap-14 overflow-visible rounded-2xl border bg-white px-20 pt-26 pb-16 max-2xs:px-14 max-2xs:pb-14',
                entry.visual.card,
              ]"
            >
              <span
                v-if="entry.tagline"
                :class="[
                  'absolute -top-11 left-14 z-1 inline-flex max-w-[calc(100%-28px)] items-center justify-center rounded-full px-12 py-4 text-center text-md leading-14 font-semibold text-white',
                  entry.visual.ribbonBg,
                ]"
              >
                {{ entry.tagline }}
              </span>

              <header class="flex w-full flex-col items-center">
                <div class="flex w-full flex-row items-center justify-center gap-8">
                  <span
                    v-if="entry.visual.isTop"
                    class="flex size-36 shrink-0 items-center justify-center overflow-hidden rounded-full bg-tier-3-bg"
                  >
                    <QIcon :name="entry.visual.icon" :size="44" />
                  </span>
                  <QIcon v-else :name="entry.visual.icon" :size="36" />
                  <h2 :class="['m-0 text-4xl leading-28 font-semibold whitespace-nowrap max-2xs:text-3xl', entry.visual.name]">
                    {{ entry.tier.name }}
                  </h2>
                </div>
                <span
                  :class="[
                    'mt-8 inline-flex items-center justify-center rounded-exact-5 px-6 text-sm leading-[16.5px] font-semibold whitespace-nowrap',
                    entry.visual.badgeBg,
                    entry.visual.badgeText,
                  ]"
                >
                  {{ $t(entry.visual.badgeKey) }}
                </span>

                <hr class="mt-14 w-full border-0 border-t border-border-soft">
              </header>

              <ul v-if="entry.tier.features.length > 0" class="m-0 flex w-full list-none flex-col gap-8 p-0">
                <li v-for="feature in entry.tier.features" :key="feature" class="flex items-start gap-10 text-lg leading-18 text-text">
                  <QIcon :name="entry.visual.check" :size="12" class="mt-3 shrink-0" />
                  <span class="min-w-0">{{ feature }}</span>
                </li>
              </ul>

              <footer class="mt-8 flex w-full flex-col items-center gap-8 pt-8">
                <div class="flex flex-col items-center gap-2">
                  <p :class="['m-0 text-6xl leading-[1.1] font-semibold whitespace-nowrap max-2xs:text-5xl', entry.visual.price]">
                    {{ n(entry.tier.price.amount, 'currency') }}
                  </p>
                  <p
                    v-if="entry.tier.periodLabel !== 'month'"
                    class="m-0 text-center text-base leading-[1.2] font-medium text-tier-period"
                  >
                    {{ $t('offer.oneOff') }}
                  </p>
                </div>

                <button
                  type="button"
                  :disabled="checkoutPending === entry.tier.id || (checkoutPending !== null && checkoutPending !== entry.tier.id)"
                  :class="[
                    'flex w-full cursor-pointer items-center justify-center rounded-lg px-16 py-14 text-center text-xl leading-20 font-semibold whitespace-nowrap',
                    entry.visual.button,
                    checkoutPending !== null && checkoutPending !== entry.tier.id ? 'cursor-not-allowed opacity-60' : '',
                  ]"
                  @click="startCheckout(offer, entry.tier)"
                >
                  <QSpinner v-if="checkoutPending === entry.tier.id" size="sm" />
                  <span v-else>{{ $t('offer.choose') }}</span>
                </button>
              </footer>
            </article>
          </div>

          <QCard v-else variant="outlined" padding="none">
            <QEmptyState icon="ic-ol-comoe" :title="$t('offer.emptyTitle')" :description="$t('offer.emptyDescription')" />
          </QCard>

          <TrustStrip />
        </div>
      </template>
    </PageState>
  </div>
</template>
