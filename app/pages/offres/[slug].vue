<script setup lang="ts">
/**
 * Page tarifaire ← `formule.html` (langue) / `offre-orientation.html` (domaine).
 *
 * **Langue / domaine** : même UI que `/orientation/formules` — pile verticale,
 * titre/sous-titre communs (`offer.title` / `offer.subtitle`), CTA plein.
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

useContractSeo(() => offer.value?.seo, t('offer.fallbackTitle'))
</script>

<template>
  <div>
    <AppTopBar back :back-to="backTo" :gap="22" />

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

          <!-- Domaine : carte unique (même pile visuelle que langue / orientation) -->
          <div v-if="isDomain && tiers.length > 0" class="w-full pt-8">
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

          <!-- Langue : pile verticale -->
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
        </div>
      </template>
    </PageState>
  </div>
</template>
