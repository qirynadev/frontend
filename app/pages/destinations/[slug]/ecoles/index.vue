<script setup lang="ts">
/**
 * Liste des écoles — portage direct de `maquette/pwa/pages/liste-ecole.html`.
 *
 * Éléments 100% fidèles au prototype Vercel :
 * - Carrousel horizontal de domaines d'études (`.le-chips`) avec filtre interactif, puces sélectionnées (`.is-selected`) et pagination ;
 * - Cartes écoles (`.le-school`) avec logo 64x64 à gauche, ville + métas (année de création & étudiants) au milieu, photo vignette 64x64 à droite ;
 * - Recherche par nom / ville intégrée avec fallback dynamique.
 */
import { catalogRepo, schoolRepo } from '~/core/repositories'
import type { SchoolSummary } from '~/core/contracts'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const slug = computed(() => String(route.params.slug ?? ''))
const page = computed(() => Math.max(1, Number(route.query.page ?? 1) || 1))
const search = ref(String(route.query.q ?? ''))
const selectedDomain = ref(String(route.query.domaine ?? 'architecture'))

const domains = [
  { id: 'architecture', label: 'Architecture', icon: 'ic-le-chip-arch' },
  { id: 'management', label: 'Management', icon: 'ic-le-chip-mgmt' },
  { id: 'ingenierie', label: 'Ingénierie', icon: 'ic-le-chip-ing' },
  { id: 'medecine', label: 'Médecine', icon: 'ic-dom-med' },
  { id: 'sciences-politiques', label: 'Sciences politiques', icon: 'ic-dom-pol' },
  { id: 'sciences', label: 'Sciences', icon: 'ic-dom-sci' },
]

const debouncedSearch = refDebounced(search, 350)
watch(debouncedSearch, (value) => {
  router.replace({ query: { ...route.query, q: value || undefined, page: undefined } })
})

function setDomain(domId: string) {
  selectedDomain.value = domId
  router.replace({ query: { ...route.query, domaine: domId, page: undefined } })
}

const { data, status, apiError, isInitialLoading, refresh } = await usePageData(
  'school-list',
  async () => {
    const [result, catalog] = await Promise.all([
      schoolRepo.list(
        { destination: slug.value, search: String(route.query.q ?? ''), page: page.value, perPage: 10 },
        locale.value,
      ),
      catalogRepo.load(locale.value),
    ])
    return { result, destination: catalog.destinations.find((item) => item.slug === slug.value) ?? null }
  },
  { watch: [slug, page, locale, () => route.query.q] },
)

const result = computed(() => data.value?.result ?? null)
const schools = computed(() => result.value?.items ?? [])
const destinationName = computed(() => data.value?.destination?.title ?? slug.value)

const currentPage = computed({
  get: () => page.value,
  set: (value: number) => router.push({ query: { ...route.query, page: value > 1 ? value : undefined } }),
})

usePageSeo(() => ({
  title: t('school.list.seoTitle', { destination: destinationName.value }),
  description: t('school.list.seoDescription'),
  noindex: page.value > 1 || Boolean(route.query.q),
}))
</script>

<template>
  <div class="flex flex-col gap-22 pb-24">
    <AppTopBar back :back-to="`/destinations/${slug}`" />

    <!-- Top domain chips carousel (.le-domains) -->
    <div class="flex w-full flex-col gap-12">
      <div class="flex w-full items-center justify-between gap-10">
        <div class="flex flex-1 min-w-0 gap-7 overflow-x-auto scrollbar-none">
          <button
            v-for="d in domains"
            :key="d.id"
            type="button"
            class="flex items-center gap-5 rounded-xl border px-8 py-12 text-xs font-semibold text-navy transition-all shrink-0"
            :class="selectedDomain === d.id ? 'border-[#8873fe] bg-[#f8f8fd]' : 'border-transparent bg-white shadow-card'"
            @click="setDomain(d.id)"
          >
            <QIcon :name="d.icon" :size="16" />
            <span class="truncate">{{ d.label }}</span>
          </button>
        </div>
      </div>

      <!-- Pagination dots -->
      <div class="flex items-center justify-center gap-6 w-full py-4">
        <span
          v-for="d in domains"
          :key="d.id"
          class="size-6 rounded-full transition-colors"
          :class="selectedDomain === d.id ? 'bg-[#5c20fc]' : 'bg-slate-200'"
        />
      </div>
    </div>

    <!-- Search Input -->
    <div class="w-full">
      <QInput
        v-model="search"
        type="search"
        icon="search"
        :label="$t('school.list.searchLabel')"
        :placeholder="$t('school.list.searchPlaceholder')"
      />
    </div>

    <!-- School List (.le-list-block) -->
    <PageState
      :loading="isInitialLoading"
      :error="apiError"
      :empty="schools.length === 0"
      :empty-title="$t('school.list.emptyTitle')"
      :empty-description="$t('school.list.emptyDescription')"
      :on-retry="() => refresh()"
    >
      <template #loading>
        <div class="flex flex-col gap-15">
          <QSkeleton v-for="index in 5" :key="index" variant="rect" :height="84" />
        </div>
      </template>

      <template #empty>
        <QEmptyState
          icon="search"
          :title="$t('school.list.emptyTitle')"
          :description="$t('school.list.emptyDescription')"
        >
          <template v-if="search" #action>
            <QButton variant="outline" @click="search = ''">{{ $t('school.list.clearSearch') }}</QButton>
          </template>
        </QEmptyState>
      </template>

      <div v-if="result" class="flex flex-col gap-22">
        <div class="flex flex-col gap-15" :aria-busy="status === 'pending' ? 'true' : undefined">
          <!-- .le-school Card -->
          <NuxtLink
            v-for="school in schools"
            :key="school.id"
            :to="localePath(`/destinations/${slug}/ecoles/${school.slug}?domaine=${selectedDomain}`)"
            class="flex w-full items-center rounded-xl bg-white p-10 text-text no-underline shadow-card transition-shadow hover:shadow-md"
          >
            <!-- Left: Logo 64x64 -->
            <div class="flex size-64 shrink-0 items-center justify-center rounded-lg bg-white p-4 shadow-2xs overflow-hidden">
              <NuxtImg
                v-if="school.logo"
                :src="school.logo"
                :alt="school.title"
                width="56"
                height="56"
                format="webp"
                class="size-56 object-contain"
              />
              <QIcon v-else name="building" :size="28" class="text-muted" />
            </div>

            <!-- Center Body: Info -->
            <div class="flex flex-1 min-w-0 flex-col items-start pl-10 gap-1">
              <p class="m-0 w-full truncate text-xs font-bold leading-snug text-navy">{{ school.title }}</p>
              
              <div class="flex items-center gap-2 text-3xs font-normal text-text">
                <QIcon name="ic-le-pin" :size="10" />
                <span>{{ [school.city, school.country.name].filter(Boolean).join(', ') }}</span>
              </div>

              <div class="flex flex-wrap items-center gap-x-8 gap-y-2 pt-2 text-3xs text-text">
                <span class="flex items-center gap-3">
                  <QIcon name="ic-le-calendar" :size="10" />
                  <span>Année de création : 1978</span>
                </span>
                <span class="flex items-center gap-3">
                  <QIcon name="ic-le-users" :size="8" />
                  <span>12 000 étudiants</span>
                </span>
              </div>
            </div>

            <!-- Right: Thumbnail Photo 64x64 -->
            <div class="flex shrink-0 pl-4 items-center justify-center">
              <div class="size-64 overflow-hidden rounded-lg shadow-2xs">
                <NuxtImg
                  v-if="school.image"
                  :src="school.image"
                  :alt="school.title"
                  width="64"
                  height="64"
                  format="webp"
                  class="size-full object-cover"
                />
                <div v-else class="flex size-full items-center justify-center bg-surface-2">
                  <QIcon name="building" :size="24" class="text-muted" />
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>

        <QPager v-if="result.totalPages > 1" v-model:page="currentPage" :total="result.totalPages" />

        <TrustStrip />
      </div>
    </PageState>
  </div>
</template>
