<script setup lang="ts">
/**
 * Offre d'orientation ← `maquette/pwa/pages/offre-orientation.html`.
 *
 * Source : `GET /profilage`. Les « catégories » du back-office deviennent le
 * bloc « Ce qui est inclus » — même chose, nom différent.
 *
 * ⚠️ **La maquette affiche « 899 € — paiement unique ». L'API n'expose aucun
 * prix pour cette offre.** Plutôt que d'inscrire en dur un montant commercial —
 * la pire chose à figer dans du code — le bloc tarifaire ne s'affiche que si le
 * champ est alimenté. En attendant, l'appel à l'action reste, sans prix.
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
  <div class="flex flex-col gap-24 pb-24">
    <AppTopBar back back-to="/" />

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
          <QSkeleton variant="text" :lines="3" />
          <QSkeleton variant="row" />
          <QSkeleton variant="row" />
          <QSkeleton variant="rect" :height="96" />
        </div>
      </template>

      <div v-if="orientation" class="flex flex-col gap-32">
        <QHero :title="orientation.title" :text="$t('orientation.heroText')">
          <template #illustration>
            <NuxtImg
              v-if="orientation.image"
              :src="orientation.image"
              alt=""
              width="185"
              height="145"
              format="webp"
              sizes="185px shell:260px"
              class="h-auto w-full rounded-xl object-cover"
            />
            <div v-else class="flex h-145 w-full items-center justify-center rounded-xl bg-surface-2">
              <QIcon name="target" :size="48" class="text-primary" />
            </div>
          </template>
        </QHero>

        <!-- Ce qui est inclus -->
        <section class="flex flex-col gap-16">
          <QSectionHeader :title="$t('orientation.includedTitle')" variant="page" />

          <div v-if="orientation.features.length > 0" class="flex flex-col gap-12">
            <QCard
              v-for="feature in orientation.features"
              :key="feature.slug || feature.title"
              variant="outlined"
              padding="sm"
            >
              <QMediaRow align="start" gap="md">
                <template #leading>
                  <QIconCircle tone="primary" size="xl">
                    <NuxtImg
                      v-if="feature.icon"
                      :src="feature.icon"
                      alt=""
                      width="24"
                      height="24"
                      format="webp"
                      loading="lazy"
                      class="size-24 object-contain"
                    />
                    <QIcon v-else name="check" :size="24" />
                  </QIconCircle>
                </template>

                <template #title>
                  <p class="m-0 text-base font-semibold text-navy">{{ feature.title }}</p>
                </template>

                <template #description>
                  <RichText v-if="feature.description" :content="feature.description" size="sm" class="line-clamp-3" />
                </template>

                <template #trailing>
                  <QIcon name="check-circle" :size="20" class="text-success" />
                </template>
              </QMediaRow>
            </QCard>
          </div>

          <QCard v-else variant="outlined" padding="none">
            <QEmptyState icon="target" :title="$t('orientation.featuresEmpty')" />
          </QCard>
        </section>

        <RichText v-if="orientation.description" :content="orientation.description" />

        <!-- Tarif : affiché seulement s'il existe réellement -->
        <QCard variant="tinted" tone="primary" padding="lg">
          <div class="flex flex-col gap-16">
            <div v-if="orientation.price" class="flex flex-col gap-4">
              <QBadge tone="primary" size="sm">{{ $t('orientation.priceBadge') }}</QBadge>
              <p class="m-0 text-6xl font-bold text-text">{{ n(orientation.price.amount, 'currency') }}</p>
              <p class="m-0 text-sm text-muted-2">
                {{ orientation.price.mode === 'once' ? $t('offer.oneOff') : $t('offer.perMonth') }}
              </p>
            </div>
            <p v-else class="m-0 text-base text-muted-2">{{ $t('orientation.priceOnRequest') }}</p>

            <QButton :to="localePath('/compte')" block size="lg" icon-end="arrow-right">
              {{ $t('orientation.cta') }}
            </QButton>

            <p class="m-0 flex items-center justify-center gap-6 text-sm text-muted-2">
              <QIcon name="shield" :size="16" class="text-success" />
              {{ $t('orientation.secure') }}
            </p>
          </div>
        </QCard>

        <TrustStrip />
      </div>
    </PageState>
  </div>
</template>
