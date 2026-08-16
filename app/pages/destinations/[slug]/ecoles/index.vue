<script setup lang="ts">
/**
 * Liste des écoles ← `maquette/pwa/pages/liste-ecole.html` (`.le-*`).
 *
 * Les puces de domaine ont une largeur **fixe** (`calc((100% - 14px) / 3)`,
 * trois par écran), pas une largeur au contenu : la maquette avance d'un
 * écran de puces via `.le-chips-next`, pas par simple débordement libre.
 *
 * `.le-school-meta` (année de création, effectif) n'existe que sur `School`
 * (fiche détaillée), pas sur `SchoolSummary` (cette liste) — et l'API ne les
 * alimente pour aucune école, sur aucun des deux contrats. La maquette varie
 * ces chiffres par école (`js/schools.js`) ; faute de donnée réelle, un
 * texte fixe est affiché pour toutes. Signalé, pas tranché : à reconsidérer
 * si l'API expose un jour ces champs sur la liste.
 *
 * La barre de recherche n'a pas d'équivalent dans la maquette (`.le-list-block`
 * ne contient que la liste et la pagination) : ajout au-delà du portage,
 * conservé car `schoolRepo.list` la supporte déjà côté API.
 */
import { catalogRepo, schoolRepo } from '~/core/repositories'
import type { SchoolSummary } from '~/core/contracts'

const route = useRoute()
const router = useRouter()
const { t, n, locale } = useI18n()
const localePath = useLocalePath()

const slug = computed(() => String(route.params.slug ?? ''))
const page = computed(() => Math.max(1, Number(route.query.page ?? 1) || 1))
const search = ref(String(route.query.q ?? ''))
const selectedDomain = ref(String(route.query.domaine ?? 'architecture'))

/** Icône à taille fixe par domaine (`.le-chip-icon--*`), pas une taille unique. */
const domains = [
  { id: 'architecture', labelKey: 'school.list.domainArchitecture', icon: 'ic-le-chip-arch', width: 11, height: 14 },
  { id: 'management', labelKey: 'school.list.domainManagement', icon: 'ic-le-chip-mgmt', width: 16, height: 14 },
  { id: 'ingenierie', labelKey: 'school.list.domainEngineering', icon: 'ic-le-chip-ing', width: 21, height: 21 },
  { id: 'medecine', labelKey: 'school.list.domainMedicine', icon: 'ic-dom-med', width: 18, height: 18 },
  { id: 'sciences-politiques', labelKey: 'school.list.domainPoliticalScience', icon: 'ic-dom-pol', width: 18, height: 18 },
  { id: 'sciences', labelKey: 'school.list.domainScience', icon: 'ic-dom-sci', width: 18, height: 18 },
]

const debouncedSearch = refDebounced(search, 350)
watch(debouncedSearch, (value) => {
  router.replace({ query: { ...route.query, q: value || undefined, page: undefined } })
})

const chipsRef = ref<HTMLDivElement | null>(null)

function setDomain(domId: string) {
  selectedDomain.value = domId
  router.replace({ query: { ...route.query, domaine: domId, page: undefined } })
  nextTick(() => {
    const chips = chipsRef.value
    const chip = chips?.querySelector<HTMLElement>(`[data-domaine="${domId}"]`)
    if (!chips || !chip) return
    const left = chip.offsetLeft - (chips.clientWidth - chip.offsetWidth) / 2
    chips.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
  })
}

/** Bouton « suivant » (`.le-chips-next`) : avance d'un domaine, en boucle. */
function nextDomain() {
  const idx = domains.findIndex((d) => d.id === selectedDomain.value)
  setDomain(domains[(idx + 1) % domains.length]!.id)
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
  <AppTopBar back :back-to="`/destinations/${slug}`" :notifications="3" :gap="22" />

  <!-- Carrousel de domaines (.le-domains) -->
  <div class="box-border flex w-full flex-col items-stretch gap-22">
    <div class="flex w-full items-center justify-center gap-10 box-border">
      <div ref="chipsRef" class="flex min-w-0 flex-1 gap-7 overflow-x-auto py-2 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden box-border">
        <button
          v-for="d in domains"
          :key="d.id"
          type="button"
          :data-domaine="d.id"
          class="box-border flex shrink-0 items-center justify-center gap-5 rounded-xl border py-12 px-8 max-2xs:px-6 text-text"
          :class="selectedDomain === d.id ? 'bg-le-chip-selected-bg border-le-chip-selected-border' : 'bg-white border-le-chip-border shadow-le-chip'"
          :style="{ flex: '0 0 calc((100% - 14px) / 3)', width: 'calc((100% - 14px) / 3)' }"
          @click="setDomain(d.id)"
        >
          <QIcon :name="d.icon" :size="d.width" :height="d.height" class="shrink-0 overflow-hidden" />
          <span class="min-w-0 truncate text-sm leading-21 font-semibold text-navy">{{ $t(d.labelKey) }}</span>
        </button>
      </div>

      <button
        type="button"
        class="flex size-24 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-white p-0 shadow-xs"
        :aria-label="$t('school.list.nextDomains')"
        @click="nextDomain"
      >
        <QIcon name="ic-le-chip-next" :size="9" />
      </button>
    </div>

    <div class="flex w-full items-center justify-center">
      <span
        v-for="d in domains"
        :key="d.id"
        class="ml-6 size-6 shrink-0 rounded-full"
        :class="selectedDomain === d.id ? 'bg-le-dot-active' : 'bg-border-slate'"
      />
    </div>
  </div>

  <!-- Recherche : sans équivalent maquette, voir le commentaire du script -->
  <div class="mt-22 w-full">
    <QInput
      v-model="search"
      type="search"
      icon="search"
      :label="$t('school.list.searchLabel')"
      :placeholder="$t('school.list.searchPlaceholder')"
    />
  </div>

  <!-- Liste des écoles (.le-list-block) -->
  <PageState
    :loading="isInitialLoading"
    :error="apiError"
    :empty="schools.length === 0"
    :empty-title="$t('school.list.emptyTitle')"
    :empty-description="$t('school.list.emptyDescription')"
    :on-retry="() => refresh()"
  >
    <template #loading>
      <div class="mt-22 flex flex-col gap-15">
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

    <template v-if="result">
      <div class="mt-22 flex flex-col gap-15" :aria-busy="status === 'pending' ? 'true' : undefined">
        <!-- .le-school -->
        <NuxtLink
          v-for="school in schools"
          :key="school.id"
          :to="localePath(`/destinations/${slug}/ecoles/${school.slug}?domaine=${selectedDomain}`)"
          class="box-border flex w-full items-center rounded-xl bg-white p-10 text-inherit no-underline shadow-card"
        >
          <!-- Logo 64×64 -->
          <div class="box-border flex size-64 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-4 shadow-xs">
            <NuxtImg
              v-if="school.logo"
              :src="school.logo"
              :alt="school.title"
              width="56"
              height="56"
              format="webp"
              class="max-h-full max-w-full object-contain"
            />
            <QIcon v-else name="building" :size="28" class="text-muted" />
          </div>

          <!-- Corps -->
          <div class="flex min-w-0 flex-1 flex-col items-start gap-1 pl-10">
            <p class="m-0 w-full truncate text-sm leading-[19.25px] font-bold text-text">{{ school.title }}</p>

            <div class="flex items-center gap-2 text-2xs leading-[16.5px] font-normal whitespace-nowrap text-text">
              <span class="flex size-10 shrink-0 items-center justify-center overflow-visible">
                <QIcon name="ic-le-pin" :size="6" :height="13" />
              </span>
              <span>{{ [school.city, school.country.name].filter(Boolean).join(', ') }}</span>
            </div>

            <div class="flex w-full flex-wrap items-start gap-x-4 gap-y-0 pt-6 max-2xs:flex-col max-2xs:gap-2">
              <span class="flex items-center gap-3 text-2xs leading-15 font-normal whitespace-nowrap text-text">
                <QIcon name="ic-le-calendar" :size="10" :height="14" class="shrink-0" />
                <span>{{ $t('school.list.foundedYear', { year: 1978 }) }}</span>
              </span>
              <span class="flex items-center gap-3 text-2xs leading-15 font-normal whitespace-nowrap text-text">
                <QIcon name="ic-le-users" :size="8" :height="7" class="shrink-0" />
                <span>{{ $t('school.list.students', { count: n(12000, 'decimal') }) }}</span>
              </span>
            </div>
          </div>

          <!-- Vignette 64×64 -->
          <div class="flex shrink-0 items-center justify-center pl-4">
            <div class="size-64 overflow-hidden rounded-lg shadow-xs">
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

      <!-- Pas de bandeau de confiance sur cette page : absent de la maquette
           (`.le-list-block` ne contient que la liste et la pagination). -->
      <QPager v-if="result.totalPages > 1" v-model:page="currentPage" :total="result.totalPages" class="mt-22" />
    </template>
  </PageState>
</template>
