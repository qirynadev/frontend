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
 * `destination.detail.statUniversities`/`statNobel` portent un retour à la
 * ligne littéral (`\n` + `whitespace-pre-line`) : la maquette les coupe avec
 * `<br>`, interdit dans une clé i18n (rejette le fichier de locale entier).
 */
import { catalogRepo, destinationRepo } from '~/core/repositories'

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const slug = computed(() => String(route.params.slug ?? ''))

const { data, apiError, isInitialLoading, refresh } = await usePageData(
  `destination-${slug.value}`,
  async () => {
    const [destination, catalog] = await Promise.all([
      destinationRepo.bySlug(slug.value, locale.value),
      catalogRepo.load(locale.value),
    ])
    return { destination, domains: catalog.offers }
  },
  { watch: [slug, locale] },
)

const destination = computed(() => data.value?.destination ?? null)
const domains = computed(() => data.value?.domains ?? [])

/**
 * Cartographie des icônes et fonds selon le domaine.
 *
 * Deux traitements dans la maquette (`.dom-card-icon--arch`/`--mgmt` contre
 * `--full`) : le cercle fait **toujours 32px**, mais une icône colorée
 * déborde volontairement à 44px et se fait rogner par l'`overflow: hidden`
 * du cercle (effet de zoom), quand une icône « pleine » (fond transparent)
 * remplit exactement les 32px, sans rognage (`overflow: visible`).
 */
const DOMAIN_STYLES: Record<string, { icon: string; bg: string; size: number; clipped: boolean }> = {
  architecture: { icon: 'ic-dom-arch', bg: '#f5f3ff', size: 44, clipped: true },
  management: { icon: 'ic-dom-mgmt', bg: '#fdeff0', size: 44, clipped: true },
  ingenierie: { icon: 'ic-dom-ing', bg: 'transparent', size: 32, clipped: false },
  medecine: { icon: 'ic-dom-med', bg: 'transparent', size: 32, clipped: false },
  'sciences-politiques': { icon: 'ic-dom-pol', bg: 'transparent', size: 32, clipped: false },
  sciences: { icon: 'ic-dom-sci', bg: 'transparent', size: 32, clipped: false },
  'sciences-exactes': { icon: 'ic-dom-sci', bg: 'transparent', size: 32, clipped: false },
  droit: { icon: 'ic-dom-pol', bg: 'transparent', size: 32, clipped: false },
  'sciences-humaines': { icon: 'ic-dom-pol', bg: 'transparent', size: 32, clipped: false },
  mba: { icon: 'ic-dom-mgmt', bg: '#fdeff0', size: 44, clipped: true },
}

function getDomainStyle(domainSlug: string) {
  const normalized = domainSlug.toLowerCase().trim()
  return DOMAIN_STYLES[normalized] || { icon: 'ic-dom-arch', bg: '#f5f3ff', size: 44, clipped: true }
}

// Domaines statiques de secours conformes à la maquette si l'API est vide
const defaultDomains = [
  { id: 'architecture', slug: 'architecture', title: 'Architecture', count: '20+ écoles' },
  { id: 'management', slug: 'management', title: 'Management', count: '20+ écoles' },
  { id: 'ingenierie', slug: 'ingenierie', title: 'Ingénierie', count: '20+ écoles' },
  { id: 'medecine', slug: 'medecine', title: 'Médecine', count: '20+ écoles' },
  { id: 'sciences-politiques', slug: 'sciences-politiques', title: 'Sciences politiques', count: '20+ écoles' },
  { id: 'sciences', slug: 'sciences', title: 'Sciences', count: '20+ écoles' },
]

const displayDomains = computed(() => {
  if (domains.value.length > 0) {
    return domains.value.map((d) => ({
      id: d.id,
      slug: d.slug,
      title: d.title,
      count: '20+ écoles',
    }))
  }
  return defaultDomains
})

if (data.value && !data.value.destination) {
  throw createError({ statusCode: 404, statusMessage: t('destination.detail.notFound'), fatal: true })
}

useContractSeo(() => destination.value?.seo, t('destination.detail.fallbackTitle'), destination.value?.slugs)
</script>

<template>
  <AppTopBar back back-to="/destinations" :notifications="3" :gap="22" />

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
          {{ $t('destination.detail.bannerTitle', { country: destination.title }) }}
        </h1>

        <div class="box-border flex w-full items-start px-9 max-2xs:flex-wrap max-2xs:gap-12">
          <div
            v-for="stat in [
              { icon: 'ic-dom-stat-uni', bg: 'bg-dom-stat-uni-bg', value: destination.schoolCount > 0 ? `${destination.schoolCount}+` : '350+', labelKey: 'destination.detail.statUniversities' },
              { icon: 'ic-dom-stat-globe', bg: 'bg-dom-stat-globe-bg', value: '430 000+', labelKey: 'destination.detail.statStudents' },
              { icon: 'ic-dom-stat-podium', bg: 'bg-dom-stat-podium-bg', value: '3ème', labelKey: 'destination.detail.statRanking' },
              { icon: 'ic-dom-stat-nobel', bg: 'bg-dom-stat-nobel-bg', value: '8', labelKey: 'destination.detail.statNobel' },
            ]"
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
              {{ $t(stat.labelKey) }}
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
            v-for="dom in displayDomains"
            :key="dom.id"
            :to="localePath(`/destinations/${destination.slug}/ecoles?domaine=${dom.slug}`)"
            class="box-border flex w-full items-center justify-between gap-4 rounded-xl border-0 bg-white py-17 px-11 text-text no-underline shadow-card"
          >
            <div class="flex min-w-0 flex-1 items-center gap-10">
              <div
                class="flex size-32 shrink-0 items-center justify-center rounded-full"
                :class="getDomainStyle(dom.slug).clipped ? 'overflow-hidden' : 'overflow-visible'"
                :style="{ backgroundColor: getDomainStyle(dom.slug).bg }"
              >
                <QIcon
                  :name="getDomainStyle(dom.slug).icon"
                  :size="getDomainStyle(dom.slug).size"
                  :class="getDomainStyle(dom.slug).clipped ? 'max-w-none' : ''"
                />
              </div>
              <div class="flex min-w-0 flex-col items-start leading-tight">
                <span class="text-sm font-semibold leading-21 text-navy truncate max-2xs:whitespace-normal">{{ dom.title }}</span>
                <span class="pt-2 text-xs leading-[16.5px] font-medium text-dom-card-meta truncate whitespace-nowrap">{{ dom.count }}</span>
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
