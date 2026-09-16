<script setup lang="ts">
/**
 * Page tarifaire ← `formule.html` (langue) / `offre-orientation.html` (domaine).
 *
 * **Langue / domaine** : même UI que `/orientation/formules` — pile verticale,
 * titre/sous-titre communs (`offer.title` / `offer.subtitle`), CTA plein.
 *
 * **Niveau de langue** (2026-09-13) : quand les paliers d'une langue sont
 * déclinés par niveau, des onglets filtrent les paliers et chaque carte affiche
 * l'objectif propre au niveau. Les onglets se lisent seuls : leur intitulé
 * visible a été retiré (2026-09-16), `offer.levelLabel` ne sert plus qu'au
 * lecteur d'écran via `aria-label`. Le niveau vit dans l'URL
 * (`?niveau=`), choisi sur `/langues` et modifiable ici. Un palier sans
 * déclinaison reste affiché à tous les niveaux ; une langue sans aucune
 * déclinaison affiche ses paliers comme avant, sans onglets.
 */
import type { LanguageLevelKey, OfferTier } from '~/core/contracts'
import { isLanguageLevel, levelsAmong } from '~/config/language-levels'
import { offerPageRepo } from '~/core/repositories'

const route = useRoute()
const router = useRouter()
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

/** Niveaux couverts par au moins un palier, dans l'ordre de l'écran. */
const levelOptions = computed(() =>
  isDomain.value ? [] : levelsAmong(tiers.value.flatMap((tier) => tier.levels.map((level) => level.key))),
)

/** Niveau de l'URL s'il est proposé, sinon le premier. `null` : pas de déclinaison. */
const level = computed<LanguageLevelKey | null>(() => {
  const requested = route.query.niveau
  const available = levelOptions.value.map((option) => option.key)
  if (isLanguageLevel(requested) && available.includes(requested)) return requested
  return available[0] ?? null
})

function chooseLevel(key: LanguageLevelKey) {
  router.replace({ query: { ...route.query, niveau: key } })
}

const visibleTiers = computed(() =>
  level.value === null
    ? tiers.value
    : tiers.value.filter((tier) => tier.levels.length === 0 || tier.levels.some((entry) => entry.key === level.value)),
)

const goalFor = (tier: OfferTier) => tier.levels.find((entry) => entry.key === level.value)?.goal ?? ''

const backTo = computed(() => {
  if (isDomain.value) return '/destinations'
  const niveau = level.value ? `niveau=${level.value}` : ''
  if (objectif.value) return `/langues/${slug.value}/objectifs${niveau ? `?${niveau}` : ''}`
  return niveau ? `/langues?${niveau}` : '/langues'
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
          <div class="w-full" :class="{ 'pb-8': levelOptions.length === 0 }">
            <h1 class="m-0 text-exact-16 leading-normal font-semibold tracking-tight text-text">
              {{ $t('offer.title') }}
            </h1>
            <p class="m-0 text-lg leading-[22.75px] text-text">
              {{ $t('offer.subtitle') }}
            </p>
          </div>

          <!-- Onglets de niveau — seulement si la langue est déclinée par niveau -->
          <div
            v-if="levelOptions.length > 0"
            role="tablist"
            :aria-label="$t('offer.levelLabel')"
            class="flex w-full gap-4 rounded-xl bg-surface-2 p-4"
          >
            <button
              v-for="option in levelOptions"
              :key="option.key"
              type="button"
              role="tab"
              :aria-selected="level === option.key"
              :class="[
                'min-w-0 flex-1 cursor-pointer rounded-lg border-0 px-8 py-8 text-lg leading-18 whitespace-nowrap',
                level === option.key ? 'bg-white font-semibold text-text shadow-soft' : 'bg-transparent font-medium text-muted',
              ]"
              @click="chooseLevel(option.key)"
            >
              {{ $t(option.labelKey) }}
            </button>
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
          <div v-else-if="visibleTiers.length > 0" class="flex w-full flex-col gap-22 pt-8">
            <OfferTierCard
              v-for="(tier, index) in visibleTiers"
              :key="tier.id"
              stacked
              :tier="tier"
              :goal="goalFor(tier)"
              :index="index"
              :total="visibleTiers.length"
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
