<script setup lang="ts">
/**
 * Fiche destination ← `maquette/pwa/pages/domaines-etude.html` (`.dom-*`).
 *
 * Les quatre statistiques sont une **rangée flexible**, pas une grille : la
 * maquette les espace par `.dom-stat + .dom-stat { padding: 0 4px }` en
 * largeur normale, et bascule sous 380px (`max-2xs:`) en `flex-wrap` avec un
 * `gap: 12px` qui s'ajoute à ce padding — les deux coexistent, sans reset de
 * l'un par l'autre dans la feuille source. Une implémentation précédente
 * utilisait une grille 2/4 colonnes calée sur 425px : coïncidait par hasard à
 * 375px, divergeait ailleurs.
 *
 * Les 4 pastilles affichent `destination.stats` (`SchoolFile.stats`,
 * back-office) : libellé et valeur saisis librement par pays, jusqu'à 4
 * entrées — jamais une clé i18n fixe, chaque pays a son propre texte (voir
 * `docs/directives-backend.md`). Une entrée absente ou vide affiche « - »,
 * pas une valeur inventée.
 *
 * Le titre du bandeau (`destination.tagline`, le champ back-office `title`,
 * requis) est éditorial et propre à chaque pays (ex. Chine : « Puissance
 * académique émergente et innovation à grande échelle ») — l'ancien
 * `destination.detail.bannerTitle` affichait « {pays}, une destination
 * d'excellence » identique pour tous, en ignorant ce champ. Repli sur le nom
 * du pays si jamais vide (ne devrait pas arriver, le champ est requis côté
 * back-office). `subtitle` existe aussi côté back-office (accroche
 * secondaire par pays) mais n'a pas d'emplacement dans cette maquette —
 * non affiché, à considérer séparément si besoin.
 *
 * Domaines réels de la destination (`destinationRepo.areas`), pas le
 * catalogue générique d'offres : deux destinations n'ont pas les mêmes — la
 * France n'a que Management et Médecine quand la plupart en ont cinq
 * (Management, Ingénierie, Médecine, Droit, Architecture). Icônes réelles du
 * back-office, rendues `object-contain` comme `DomainCard.vue` : jamais de
 * rognage deviné pour une image dont on ne connaît pas le cadrage.
 */
import { domainAreaVisual, domainCardIconWrapClass } from '~/config/domain-area-visual'
import { destinationRepo } from '~/core/repositories'

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const slug = computed(() => String(route.params.slug ?? ''))

const { data, apiError, isInitialLoading, refresh } = await usePageData(
  `destination-${slug.value}`,
  async () => {
    const [destination, areas] = await Promise.all([
      destinationRepo.bySlug(slug.value, locale.value),
      destinationRepo.areas(slug.value, locale.value),
    ])
    return { destination, areas }
  },
  { watch: [slug, locale] },
)

const destination = computed(() => data.value?.destination ?? null)
const areas = computed(() => data.value?.areas ?? [])

/**
 * Les 4 pastilles du bandeau sont une position fixe (icône décorative), pas
 * une catégorie fixe : `SchoolFile.stats` est un libellé + une valeur saisis
 * librement par pays (back-office), jusqu'à 4 entrées, parfois moins — voir
 * `docs/directives-backend.md`. Une entrée absente ou vide affiche « - »,
 * jamais une valeur inventée (ex-repli « 350+ »/« 430 000+ » retiré).
 */
const STAT_SLOTS = [
  { icon: 'ic-dom-stat-uni', bg: 'bg-dom-stat-uni-bg' },
  { icon: 'ic-dom-stat-globe', bg: 'bg-dom-stat-globe-bg' },
  { icon: 'ic-dom-stat-podium', bg: 'bg-dom-stat-podium-bg' },
  { icon: 'ic-dom-stat-nobel', bg: 'bg-dom-stat-nobel-bg' },
] as const

const stats = computed(() => {
  const real = destination.value?.stats ?? []
  return STAT_SLOTS.map((slot, index) => ({
    ...slot,
    value: real[index]?.value || '-',
    label: real[index]?.label || '-',
  }))
})

if (data.value && !data.value.destination) {
  throw createError({ statusCode: 404, statusMessage: t('destination.detail.notFound'), fatal: true })
}

useContractSeo(() => destination.value?.seo, t('destination.detail.fallbackTitle'), destination.value?.slugs)
</script>

<template>
  <AppTopBar back back-to="/destinations" :gap="22" />

  <PageState :loading="isInitialLoading" :error="apiError" :on-retry="() => refresh()">
    <template #loading>
      <div class="flex flex-col gap-20">
        <QSkeleton variant="rect" :height="120" />
        <QSkeleton variant="text" :lines="2" />
        <div class="grid grid-cols-2 gap-16">
          <QSkeleton v-for="n in 6" :key="n" variant="rect" :height="68" />
        </div>
      </div>
    </template>

    <template v-if="destination">
      <!-- Bandeau d'excellence (.dom-banner) -->
      <div class="box-border flex w-full flex-col items-center gap-10 rounded-xl border border-border-soft bg-dom-banner-bg py-10 px-0">
        <h1
          class="m-0 w-full box-border pl-35 max-2xs:pl-12 text-xl max-2xs:text-lg font-semibold leading-normal tracking-[-0.65px] text-text"
        >
          {{ destination.tagline || destination.title }}
        </h1>

        <div class="box-border flex w-full items-start px-9 max-2xs:flex-wrap max-2xs:gap-12">
          <div
            v-for="stat in stats"
            :key="stat.icon"
            class="flex min-w-0 flex-1 flex-col items-center gap-5 [&:not(:first-child)]:px-4 max-2xs:flex-[1_1_40%]"
          >
            <div :class="['flex size-40 shrink-0 items-center justify-center rounded-full', stat.bg]">
              <QIcon :name="stat.icon" :size="24" />
            </div>
            <p class="m-0 mt-6 text-md leading-[13.125px] font-semibold whitespace-nowrap text-navy text-center">
              {{ stat.value }}
            </p>
            <p class="m-0 min-h-32 text-xs leading-normal font-medium whitespace-pre-line text-text text-center">
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>

      <!-- Domaines (.dom-section) -->
      <div class="mt-22 flex w-full flex-col gap-22">
        <h2 class="m-0 text-xl leading-16 font-semibold tracking-wider text-text">
          {{ $t('destination.detail.domainsTitle') }}
        </h2>

        <div class="grid w-full grid-cols-2 gap-16 pb-25">
          <NuxtLink
            v-for="area in areas"
            :key="area.id"
            :to="localePath(`/destinations/${destination.slug}/ecoles?domaine=${area.slug}`)"
            class="box-border flex w-full items-center justify-between gap-4 rounded-xl border border-tier-border bg-surface-card py-17 px-11 text-text no-underline"
          >
            <div class="flex min-w-0 flex-1 items-center gap-10">
              <div
                :class="[
                  'flex size-32 shrink-0 items-center justify-center rounded-full',
                  domainCardIconWrapClass(domainAreaVisual(area.slug).cardVariant),
                ]"
              >
                <NuxtImg
                  v-if="area.icon"
                  :src="area.icon"
                  alt=""
                  width="32"
                  height="32"
                  format="webp"
                  :class="[
                    'object-contain',
                    domainAreaVisual(area.slug).cardVariant === 'full' ? 'size-32' : 'size-44 max-w-none',
                  ]"
                />
                <QIcon
                  v-else
                  :name="domainAreaVisual(area.slug).cardIcon"
                  :size="domainAreaVisual(area.slug).cardIconSize"
                />
              </div>
              <div class="flex min-w-0 flex-col items-start leading-tight">
                <span class="text-sm font-semibold leading-21 text-navy truncate max-2xs:whitespace-normal">{{ area.title }}</span>
                <span class="pt-2 text-xs leading-[16.5px] font-medium text-dom-card-meta truncate whitespace-nowrap">
                  {{ $t('destination.detail.domainSchoolCount', area.schoolCount) }}
                </span>
              </div>
            </div>
            <QIcon name="ic-dom-btn" :size="24" class="shrink-0" />
          </NuxtLink>
        </div>
      </div>

      <TrustStrip />
    </template>
  </PageState>
</template>
