<script setup lang="ts">
/**
 * Formules d'orientation ← `maquette/pwa/pages/orientation-formules.html`
 * (`.formule-*`, `.of-*`). Prolonge `/orientation` (lot B2, écran de
 * découverte) : atteint via son bouton « Commencer mon orientation »,
 * `?path=moi|enfant` conservé pour le bouton retour.
 *
 * **Données réelles** — `GET /profilage` + `GET /profilage/formulas` via
 * `offerPageRepo` (`kind: 'orientation'`, ajoutés le 2026-08-29 : la page
 * n'appelait jusque-là aucune API, trois formules et leur contenu étaient
 * écrits en dur dans le script, prix identique (300 €) sur les trois, et le
 * bouton « Choisir » n'était qu'un lien direct vers l'écran de succès —
 * aucune commande n'était jamais créée, paiement impossible à tester.
 *
 * Checkout Stripe via `useCheckout`, comme `logement/[slug]/index.vue`.
 *
 * **Habillage par rang, pas par nom API** (même choix que logement,
 * 2026-08-22) : les trois formules réelles (Jordan/Salarié/Spécialiste RH,
 * classées par prix croissant par `orderTiers`) reprennent les couleurs et
 * icônes Jordan/Tyson/Pelé de la maquette selon leur **rang**, pas leur nom —
 * seule « Jordan » correspond réellement au premier rang par coïncidence.
 *
 * **Tagline et badge restent éditoriaux** (`orientation.formules.{jordan,
 * tyson,pele}.{tagline,badge}`, par rang) : l'API n'a ni l'un ni l'autre
 * (`description` toujours vide sur les trois formules réelles, aucun champ
 * « badge »), rien à câbler. **Nom et puces viennent de l'API** en revanche
 * (`tier.name`/`tier.features`) — Jordan les a réels et soignés (identiques
 * à l'ancien contenu figé), Salarié/Spécialiste RH réels mais du texte de
 * test (« Odit quia eligendi i »…) : affiché tel quel, pas de repli sur
 * l'ancien contenu figé qui masquerait la vraie qualité éditoriale — voir
 * `docs/directives-backend.md`.
 */
import { offerPageRepo } from '~/core/repositories'

const route = useRoute()
const { t, n, locale } = useI18n()

const path = computed(() => (route.query.path === 'enfant' ? 'enfant' : 'moi'))

const { data: offer, apiError, isInitialLoading, refresh } = await usePageData(
  'orientation-offer',
  () => offerPageRepo.bySlug('orientation', locale.value),
  { watch: [locale] },
)

/** Couleurs/icônes Jordan → Tyson → Pelé de la maquette, par rang. */
const VISUALS = [
  {
    key: 'jordan',
    icon: 'ic-of-jordan',
    isTop: false,
    ribbonBg: 'bg-tier-2',
    card: 'border-tier-border',
    name: 'text-tier-2',
    badgeBg: 'bg-of-badge-jordan-bg',
    badgeText: 'text-of-badge-jordan',
    price: 'text-tier-2',
    button: 'border border-tier-2 bg-white text-tier-2',
    checkIcon: 'ic-of-check-purple',
  },
  {
    key: 'tyson',
    icon: 'ic-of-tyson',
    isTop: false,
    ribbonBg: 'bg-tier-1',
    card: 'border-tier-border',
    name: 'text-tier-1',
    badgeBg: 'bg-of-badge-tyson-bg',
    badgeText: 'text-of-badge-tyson',
    price: 'text-tier-1-price',
    button: 'border border-tier-1-line bg-white text-tier-1-line',
    checkIcon: 'ic-of-check-green',
  },
  {
    key: 'pele',
    icon: 'ic-of-pele',
    isTop: true,
    ribbonBg: 'bg-tier-3',
    card: 'border-tier-3-border',
    name: 'text-tier-3',
    badgeBg: 'bg-of-badge-pele-bg',
    badgeText: 'text-of-badge-pele',
    price: 'text-tier-3',
    button: 'border border-tier-3 bg-white text-tier-3',
    checkIcon: 'ic-of-check-red',
  },
] as const

const tiers = computed(() => {
  const list = offer.value?.tiers ?? []
  return list.map((tier, index) => ({
    tier,
    visual: VISUALS[Math.min(index, VISUALS.length - 1)]!,
  }))
})

const { pending: checkoutPending, errorKey: checkoutErrorKey, start: startCheckout } = useCheckout()

useContractSeo(() => offer.value?.seo, t('offer.fallbackTitle'))
</script>

<template>
  <!-- `gap: 22` = espace topbar → intro (`.page-of .formule-main { gap: 22px }`) -->
  <AppTopBar back :back-to="`/orientation?path=${path}`" :notifications="3" :gap="22" />

  <PageState :loading="isInitialLoading" :error="apiError" :on-retry="() => refresh()">
    <template #loading>
      <div class="flex flex-col gap-16">
        <QSkeleton variant="text" :lines="2" />
        <QSkeleton variant="rect" :height="420" />
      </div>
    </template>

    <template v-if="offer">
      <div class="flex w-full flex-col gap-22">
        <div class="w-full pb-8">
          <h1 class="m-0 text-exact-16 leading-normal font-semibold tracking-tight text-text">
            {{ $t('offer.title') }}
          </h1>
          <p class="m-0 text-lg leading-[22.75px] text-text">
            {{ $t('offer.subtitle') }}
          </p>
        </div>

        <QAlert
          v-if="checkoutErrorKey"
          tone="danger"
          :title="$t('auth.error.title')"
          :message="$t(checkoutErrorKey)"
        />

        <!-- `.formule-stack` — `padding-top: 8px`, `gap: 22px` -->
        <div v-if="tiers.length > 0" class="flex w-full flex-col gap-22 pt-8">
          <article
            v-for="entry in tiers"
            :key="entry.tier.id"
            :class="[
              'relative box-border flex w-full flex-col gap-8 overflow-visible rounded-2xl border bg-white px-20 pt-26 pb-16 max-2xs:px-14 max-2xs:pb-14',
              entry.visual.card,
            ]"
          >
            <span
              :class="[
                'absolute -top-11 left-14 z-1 inline-flex max-w-[calc(100%-28px)] items-center justify-center rounded-full px-12 py-4 text-center text-md leading-14 font-semibold text-white',
                entry.visual.ribbonBg,
              ]"
            >
              {{ $t(`orientation.formules.${entry.visual.key}.tagline`) }}
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
              <span :class="['mt-8 inline-flex items-center justify-center rounded-exact-5 px-6 text-sm leading-[16.5px] font-semibold whitespace-nowrap', entry.visual.badgeBg, entry.visual.badgeText]">
                {{ $t(`orientation.formules.${entry.visual.key}.badge`) }}
              </span>

              <hr class="mt-14 w-full border-0 border-t border-border-soft">
            </header>

            <ul v-if="entry.tier.features.length > 0" class="m-0 flex w-full list-none flex-col gap-8 p-0">
              <li v-for="feature in entry.tier.features" :key="feature" class="flex items-start gap-10 text-lg leading-18 text-text">
                <QIcon :name="entry.visual.checkIcon" :size="12" class="mt-3 shrink-0" />
                <span class="min-w-0">{{ feature }}</span>
              </li>
            </ul>

            <!-- `.formule-card-foot` -->
            <footer class="mt-8 flex w-full flex-col items-center gap-8 pt-8">
              <div class="flex flex-col items-center gap-2">
                <p :class="['m-0 text-6xl leading-[1.1] font-semibold whitespace-nowrap max-2xs:text-5xl', entry.visual.price]">
                  {{ n(entry.tier.price.amount, 'currency') }}
                </p>
                <p class="m-0 text-center text-base leading-[1.2] font-medium text-tier-period">
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
          <QEmptyState icon="ic-of-jordan" :title="$t('offer.emptyTitle')" :description="$t('offer.emptyDescription')" />
        </QCard>
      </div>
    </template>
  </PageState>
</template>
