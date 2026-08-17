<script setup lang="ts">
/**
 * Offres de logement ← `maquette/pwa/pages/offres-logement.html`
 * (`.formule-*`, `.of-card-badge`, `.ol-*`). Un carrousel de paliers, comme
 * `orientation/formules.vue` (même famille `.formule-*`) — bandeau pays et
 * statistiques en plus (`.ol-banner`), propres à cet écran.
 *
 * **Données réelles depuis 2026-08-17** — `GET /livings` via `offerPageRepo`
 * (même mécanisme que `offres/[slug].vue` pour une langue ou un domaine ;
 * `offer.living` porte ce qui est propre au logement : pays, photo, bandeau
 * statistique). Auparavant les trois formules (Comoé/Volga/Yukon) venaient de
 * `config/logement-offers.ts`, une donnée d'essai reprise de la maquette,
 * jamais rattachée au catalogue, et le CTA ne déclenchait aucun paiement
 * (`NuxtLink` direct vers `logement/paiement-reussi`). Les deux sont corrigés
 * ici : `useCheckout` démarre un vrai paiement Stripe au clic, comme sur
 * `offres/[slug].vue`.
 *
 * La mise en page pixel-vérifiée (carrousel, bandeau) est conservée telle
 * quelle ; seul son contenu change :
 *
 * - **paliers** : plus d'identifiants fixes (`comoe`/`volga`/`yukon`) — les
 *   trois vraies formules changent de nom au gré du back-office (« Colorado »,
 *   « Amazone », « Zambeze » pour la France aujourd'hui). L'habillage
 *   (couleur, icône, bouton plein) suit donc le **rang** du palier, pas son
 *   nom — même principe que `OfferTierCard`, portée ici pour garder le
 *   bandeau `.ol-banner` propre à cet écran plutôt que de passer par ce
 *   composant, pensé pour `formule.html` sans bandeau.
 * - **badge « X logements proposés »** : retiré. `listings_count` vaut `null`
 *   sur les quinze formules réelles (5 destinations × 3) — aucun signal à
 *   afficher, plutôt que de réafficher les anciens chiffres d'essai (2/3/3).
 * - **bandeau statistique** : `caution`/`bail`/`charges`/`loyer` viennent de
 *   `offer.living` et sont **réels**, mais seule la France les porte au
 *   2026-08-17 — les quatre autres destinations réelles n'ont rien. Chaque
 *   statistique absente est masquée plutôt que de réafficher celle d'un autre
 *   pays, comme le faisait l'implémentation précédente (bug documenté dans la
 *   mémoire projet).
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

/** Une seule statistique par ligne, et seulement celles que le back-office a renseignées pour ce pays. */
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
 * orange plein (dernier) — même principe que `OfferTierCard.accent`, adapté
 * aux tons `.ol-*` de ce bandeau. Indépendant du nom réel de la formule.
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
      featured: false,
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
      featured: false,
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
    featured: true,
  }
}

const tiers = computed(() => {
  const list = offer.value?.tiers ?? []
  return list.map((tier, index) => ({
    tier,
    visual: visualFor(index, list.length),
    // `courses[].formulas[].description` est vide sur les quinze formules
    // réelles : repli sur une accroche générique indexée par rang, comme
    // `OfferTierCard.tagline`.
    tagline: tier.tagline || t(`housing.offers.tagline${Math.min(index + 1, 3)}`),
  }))
})

const current = ref(0)
watch(tiers, () => { current.value = Math.min(current.value, Math.max(tiers.value.length - 1, 0)) })

function go(index: number) {
  const total = tiers.value.length
  if (total === 0) return
  current.value = Math.min(Math.max(index, 0), total - 1)
}

/**
 * Départ du paiement — comme `offres/[slug].vue`. Un visiteur non connecté
 * n'a pas d'erreur : son choix est mémorisé, il repart vers la connexion,
 * d'où il sera ramené ici. Voir `useCheckout`.
 */
const { pending: checkoutPending, errorKey: checkoutErrorKey, start: startCheckout } = useCheckout()

useContractSeo(() => offer.value?.seo, t('housing.offers.fallbackTitle'))
</script>

<template>
  <div>
    <AppTopBar back back-to="/logement" :notifications="3" />

    <PageState :loading="isInitialLoading" :error="apiError" :on-retry="() => refresh()">
      <template #loading>
        <div class="flex flex-col gap-16">
          <QSkeleton variant="rect" :height="130" />
          <QSkeleton variant="text" :lines="2" />
          <QSkeleton variant="rect" :height="420" />
        </div>
      </template>

      <template v-if="offer">
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
        <div class="w-full pt-20 pb-8">
          <h1 class="m-0 text-exact-16 leading-22 font-semibold tracking-[0.2px] text-text">
            {{ $t('housing.offers.introTitle') }}
          </h1>
        </div>

        <!-- Le paiement n'a pas pu démarrer. -->
        <QAlert
          v-if="checkoutErrorKey"
          tone="danger"
          :title="$t('auth.error.title')"
          :message="$t(checkoutErrorKey)"
          class="mb-16"
        />

        <!-- Carrousel de formules -->
        <div v-if="tiers.length > 0" class="w-full pt-20 pb-16">
          <div class="grid w-full grid-cols-[28px_minmax(0,1fr)_28px] items-center gap-4 max-2xs:grid-cols-[24px_minmax(0,1fr)_24px] max-2xs:gap-2">
            <button
              type="button"
              class="inline-flex size-28 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-slider-arrow transition-colors duration-150 hover:bg-slider-arrow-bg hover:text-primary-cta"
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
                <article
                  v-for="entry in tiers"
                  :key="entry.tier.id"
                  :class="[
                    'relative box-border flex w-full min-w-0 shrink-0 basis-full flex-col gap-14 rounded-2xl border bg-white px-20 pt-22 pb-24 max-2xs:px-14 max-2xs:pt-18 max-2xs:pb-20',
                    entry.visual.card,
                    entry.visual.featured ? 'overflow-hidden shadow-[0_0_7px_-2px_rgba(0,0,0,0.1)]' : 'overflow-visible',
                  ]"
                >
                  <div
                    v-if="entry.visual.featured"
                    class="absolute top-0 left-1/2 z-1 flex -translate-x-1/2 items-center gap-4 rounded-b-2xl bg-ol-featured-border px-10 py-3 text-[9px] leading-[13.5px] font-medium tracking-[0.45px] whitespace-nowrap text-white uppercase shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
                  >
                    <span class="font-jakarta text-[10px] font-extrabold">★</span>
                    <span>{{ $t('housing.offers.ribbon') }}</span>
                  </div>

                  <header :class="['flex w-full flex-col items-center', entry.visual.featured ? 'pt-10' : '']">
                    <span
                      v-if="entry.visual.isTop"
                      class="flex size-36 shrink-0 items-center justify-center overflow-hidden rounded-full bg-tier-3-bg"
                    >
                      <QIcon :name="entry.visual.icon" :size="44" />
                    </span>
                    <QIcon v-else :name="entry.visual.icon" :size="36" />

                    <h2 :class="['mt-4 mb-0 text-4xl leading-28 font-semibold whitespace-nowrap max-2xs:text-3xl', entry.visual.name]">
                      {{ entry.tier.name }}
                    </h2>
                    <p v-if="entry.tagline" class="m-0 max-w-260 pt-6 text-center text-lg leading-18 text-text">
                      {{ entry.tagline }}
                    </p>

                    <hr class="mt-14 w-full border-0 border-t border-border-soft">
                  </header>

                  <ul v-if="entry.tier.features.length > 0" class="m-0 flex w-full list-none flex-col gap-8 p-0">
                    <li v-for="feature in entry.tier.features" :key="feature" class="flex items-center gap-10 text-lg leading-18 text-text">
                      <QIcon :name="entry.visual.check" :size="12" />
                      <span class="min-w-0">{{ feature }}</span>
                    </li>
                  </ul>

                  <footer class="mt-auto flex w-full flex-col items-center gap-14 pt-8">
                    <p :class="['m-0 text-6xl leading-[1.1] font-semibold whitespace-nowrap max-2xs:text-5xl', entry.visual.price]">
                      {{ n(entry.tier.price.amount, 'currency') }}
                    </p>

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
            </div>

            <button
              type="button"
              class="inline-flex size-28 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-slider-arrow transition-colors duration-150 hover:bg-slider-arrow-bg hover:text-primary-cta"
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
              v-for="(entry, index) in tiers"
              :key="entry.tier.id"
              type="button"
              role="tab"
              :aria-selected="index === current"
              :aria-label="entry.tier.name"
              :class="[
                'h-6 cursor-pointer rounded-full border-0 p-0 transition-all duration-200',
                index === current ? 'w-18 bg-primary-cta' : 'w-6 bg-slider-dot',
              ]"
              @click="go(index)"
            />
          </div>
        </div>

        <QCard v-else variant="outlined" padding="none">
          <QEmptyState icon="ic-ol-comoe" :title="$t('offer.emptyTitle')" :description="$t('offer.emptyDescription')" />
        </QCard>

        <TrustStrip />
      </template>
    </PageState>
  </div>
</template>
