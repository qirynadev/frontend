<script setup lang="ts">
/**
 * Fiche destination — portage 100% fidèle de `maquette/pwa/pages/domaines-etude.html`.
 *
 * Règles de responsive précises (conformes aux breakpoints de la maquette CSS) :
 * - Mobile S (320px) & Mobile M (375px) : 2 colonnes (`grid-cols-2`) pour les statistiques ;
 * - Mobile L (425px+), Tablette (768px+) & Desktop : 4 colonnes (`min-[425px]:grid-cols-4`) sur 1 seule ligne ;
 * - Tailles de polices et espacements exacts d'après `app.css` :
 *   - .dom-banner-title : 14px font-600 #191919
 *   - .dom-stat-value : 11px font-600 #0d1b3e
 *   - .dom-stat-label : 9px font-500 #191919 (min-height 32px)
 *   - .dom-section-title : 14px font-600 #191919
 *   - .dom-card-name : 10px/11px font-600 #0d1b3e
 *   - .dom-card-meta : 9px font-500 #94a3b8
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

/** Cartographie des icônes et fonds selon le domaine pour une conformité 100% à la maquette */
const DOMAIN_STYLES: Record<string, { icon: string; bg: string }> = {
  architecture: { icon: 'ic-dom-arch', bg: '#f5f3ff' },
  management: { icon: 'ic-dom-mgmt', bg: '#fdeff0' },
  ingenierie: { icon: 'ic-dom-ing', bg: 'transparent' },
  medecine: { icon: 'ic-dom-med', bg: 'transparent' },
  'sciences-politiques': { icon: 'ic-dom-pol', bg: 'transparent' },
  sciences: { icon: 'ic-dom-sci', bg: 'transparent' },
  'sciences-exactes': { icon: 'ic-dom-sci', bg: 'transparent' },
  droit: { icon: 'ic-dom-pol', bg: 'transparent' },
  'sciences-humaines': { icon: 'ic-dom-pol', bg: 'transparent' },
  mba: { icon: 'ic-dom-mgmt', bg: '#fdeff0' },
}

function getDomainStyle(domainSlug: string) {
  const normalized = domainSlug.toLowerCase().trim()
  return DOMAIN_STYLES[normalized] || { icon: 'ic-dom-arch', bg: '#f5f3ff' }
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
  <div class="flex flex-col gap-22 pb-24">
    <AppTopBar back back-to="/destinations" />

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

      <div v-if="destination" class="flex flex-col gap-22">
        <!-- Excellence Banner (.dom-banner) -->
        <div class="flex w-full flex-col items-center gap-10 rounded-[10px] border border-[#f1f5f9] bg-[#f7f6fc] py-10 px-0 shadow-xs">
          <!-- Title: padding 35px left, 14px font-600 #191919 (35px sur mobile M/L, 12px sur mobile S) -->
          <h1 class="m-0 w-full pl-12 min-[381px]:pl-[35px] pr-10 text-[14px] font-semibold leading-normal tracking-[-0.65px] text-[#191919]">
            {{ $t('destination.detail.bannerTitle', { country: destination.title }) }}
          </h1>

          <!-- Stats: 2 colonnes sur Mobile S (320px) & Mobile M (375px), 4 colonnes sur Mobile L (425px+) & Tablette -->
          <div class="grid w-full grid-cols-2 min-[425px]:grid-cols-4 gap-y-12 gap-x-8 px-9 box-border">
            <div class="flex flex-col items-center gap-5 text-center min-w-0">
              <div class="flex size-40 shrink-0 items-center justify-center rounded-full bg-[#e8e1fe]">
                <QIcon name="ic-dom-stat-uni" :size="24" />
              </div>
              <p class="m-0 mt-6 text-[11px] font-semibold leading-[13.125px] text-[#0d1b3e] text-center whitespace-nowrap">
                {{ destination.schoolCount > 0 ? `${destination.schoolCount}+` : '350+' }}
              </p>
              <p class="m-0 min-h-[32px] text-[9px] font-medium leading-normal text-[#191919] text-center">
                Universités et<br />grandes écoles
              </p>
            </div>

            <div class="flex flex-col items-center gap-5 text-center min-w-0">
              <div class="flex size-40 shrink-0 items-center justify-center rounded-full bg-[#def5e3]">
                <QIcon name="ic-dom-stat-globe" :size="24" />
              </div>
              <p class="m-0 mt-6 text-[11px] font-semibold leading-[13.125px] text-[#0d1b3e] text-center whitespace-nowrap">
                430 000+
              </p>
              <p class="m-0 min-h-[32px] text-[9px] font-medium leading-normal text-[#191919] text-center">
                Étudiants internationaux
              </p>
            </div>

            <div class="flex flex-col items-center gap-5 text-center min-w-0">
              <div class="flex size-40 shrink-0 items-center justify-center rounded-full bg-[#fdf3e4]">
                <QIcon name="ic-dom-stat-podium" :size="24" />
              </div>
              <p class="m-0 mt-6 text-[11px] font-semibold leading-[13.125px] text-[#0d1b3e] text-center whitespace-nowrap">
                3ème
              </p>
              <p class="m-0 min-h-[32px] text-[9px] font-medium leading-normal text-[#191919] text-center">
                destination d'études dans le monde
              </p>
            </div>

            <div class="flex flex-col items-center gap-5 text-center min-w-0">
              <div class="flex size-40 shrink-0 items-center justify-center rounded-full bg-[#fde8eb]">
                <QIcon name="ic-dom-stat-nobel" :size="24" />
              </div>
              <p class="m-0 mt-6 text-[11px] font-semibold leading-[13.125px] text-[#0d1b3e] text-center whitespace-nowrap">
                8
              </p>
              <p class="m-0 min-h-[32px] text-[9px] font-medium leading-normal text-[#191919] text-center">
                Prix Nobel<br />en 2023
              </p>
            </div>
          </div>
        </div>

        <!-- Domains Section (.dom-section) -->
        <div class="flex w-full flex-col gap-16 pt-10">
          <h2 class="m-0 text-[14px] font-semibold leading-[16px] tracking-[0.6px] text-[#191919]">
            {{ $t('destination.detail.domainsTitle') }}
          </h2>

          <div class="grid w-full grid-cols-2 gap-16 pb-25">
            <NuxtLink
              v-for="dom in displayDomains"
              :key="dom.id"
              :to="localePath(`/destinations/${destination.slug}/ecoles?domaine=${dom.slug}`)"
              class="flex w-full items-center justify-between gap-4 rounded-[10px] border-none bg-white p-[11px] min-[381px]:p-[14px] text-text no-underline shadow-[0_0_3.5px_rgba(0,0,0,0.1)] transition-shadow hover:shadow-md box-border"
            >
              <div class="flex min-w-0 flex-1 items-center gap-[10px]">
                <div
                  class="flex size-32 shrink-0 items-center justify-center rounded-full overflow-hidden"
                  :style="{ backgroundColor: getDomainStyle(dom.slug).bg }"
                >
                  <QIcon :name="getDomainStyle(dom.slug).icon" :size="28" />
                </div>
                <div class="flex min-w-0 flex-col items-start leading-tight">
                  <span class="text-[10px] min-[381px]:text-[11px] font-semibold leading-[21px] text-[#0d1b3e] truncate max-[380px]:whitespace-normal">{{ dom.title }}</span>
                  <span class="text-[9px] font-medium leading-[16.5px] text-[#94a3b8] pt-[2px] truncate whitespace-nowrap">{{ dom.count }}</span>
                </div>
              </div>
              <QIcon name="ic-dom-btn" :size="24" class="shrink-0" />
            </NuxtLink>
          </div>
        </div>

        <TrustStrip />
      </div>
    </PageState>
  </div>
</template>
