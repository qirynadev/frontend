<script setup lang="ts">
/**
 * Page tarifaire ← `formule.html` (langue) / `offre-orientation.html` (domaine).
 *
 * **Langue** : même UI que `/orientation/formules` — pile verticale
 * (`.formule-stack`), ruban coloré + titre/icône inline, espacements
 * `gap: 22px` / `pt-8` / cartes `pt-26`. Plus de carrousel.
 *
 * **Domaine** : palier unique sans trust bar ni arguments.
 */
import { offerPageRepo } from '~/core/repositories'

const route = useRoute()
const { t, locale } = useI18n()

const slug = computed(() => String(route.params.slug ?? ''))
const objectif = computed(() => String(route.query.objectif ?? ''))

const { data: offer, apiError, isInitialLoading, refresh } = await usePageData(
  `offer-${slug.value}`,
  () => offerPageRepo.bySlug(slug.value, locale.value),
  { watch: [slug, locale] },
)

if (offer.value === null && !apiError.value) {
  throw createError({ statusCode: 404, statusMessage: t('offer.notFound'), fatal: true })
}

const isDomain = computed(() => offer.value?.kind === 'domain')
const tiers = computed(() => offer.value?.tiers ?? [])

const backTo = computed(() => {
  if (isDomain.value) return '/destinations'
  return objectif.value ? `/langues/${slug.value}/objectifs` : '/langues'
})

const { pending: checkoutPending, errorKey: checkoutErrorKey, start: startCheckout } = useCheckout()

const features = [
  { icon: 'ic-formule-visio', titleKey: 'offer.feature.visio', subKey: 'offer.feature.visioSub' },
  { icon: 'ic-formule-profs', titleKey: 'offer.feature.certified', subKey: 'offer.feature.certifiedSub' },
  { icon: 'ic-formule-perso', titleKey: 'offer.feature.tailored', subKey: 'offer.feature.tailoredSub' },
]

useContractSeo(() => offer.value?.seo, t('offer.fallbackTitle'))
</script>

<template>
  <div>
    <AppTopBar back :back-to="backTo" :notifications="3" :gap="22" />

    <PageState :loading="isInitialLoading" :error="apiError" :on-retry="() => refresh()">
      <template #loading>
        <div class="flex flex-col gap-16">
          <QSkeleton variant="text" :lines="2" />
          <QSkeleton variant="rect" :height="420" />
        </div>
      </template>

      <template v-if="offer">
        <div class="flex w-full flex-col gap-22">
          <!-- Intro langue — même rythme que `.of-intro` (pb-8) -->
          <div v-if="!isDomain" class="w-full pb-8">
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

          <!-- Domaine : carte unique -->
          <div v-if="isDomain && tiers.length > 0" class="w-full">
            <OfferTierCard
              :tier="tiers[0]!"
              :index="0"
              :total="1"
              domain
              :domain-slug="slug"
              :loading="checkoutPending === tiers[0]!.id"
              :disabled="checkoutPending !== null && checkoutPending !== tiers[0]!.id"
              @choose="offer && startCheckout(offer, $event)"
            />
          </div>

          <!-- Langue : pile verticale (comme orientation/formules) -->
          <div v-else-if="tiers.length > 0" class="flex w-full flex-col gap-22 pt-8">
            <OfferTierCard
              v-for="(tier, index) in tiers"
              :key="tier.id"
              stacked
              :tier="tier"
              :index="index"
              :total="tiers.length"
              :loading="checkoutPending === tier.id"
              :disabled="checkoutPending !== null && checkoutPending !== tier.id"
              @choose="offer && startCheckout(offer, $event)"
            />
          </div>

          <QCard v-else variant="outlined" padding="none">
            <QEmptyState icon="ic-formule-kili" :title="$t('offer.emptyTitle')" :description="$t('offer.emptyDescription')" />
          </QCard>

          <!-- Arguments + trust (langue uniquement) -->
          <template v-if="!isDomain">
            <div class="w-full">
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
        </div>
      </template>
    </PageState>
  </div>
</template>
