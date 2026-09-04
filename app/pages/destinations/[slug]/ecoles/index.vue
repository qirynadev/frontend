<script setup lang="ts">
/**
 * Liste des écoles ← `maquette/pwa/pages/liste-ecole.html` (`.le-*`).
 *
 * Les puces de domaine ont une largeur **fixe** (`calc((100% - 14px) / 3)`,
 * trois par écran), pas une largeur au contenu : la maquette avance d'un
 * écran de puces via `.le-chips-next`, pas par simple débordement libre.
 *
 * `.le-school-meta` (année de création, effectif) : l'API ne les alimente pour
 * quasiment aucune école du catalogue actuel — `SchoolSummary.foundedYear`/
 * `studentCount` sont donc le plus souvent `null`. Consigne du responsable
 * (2026-08-24) : masquer l'info absente plutôt qu'afficher un chiffre fixe
 * pour toutes (la maquette variait ces chiffres par école, mais aucune
 * donnée réelle ne le permettait) — chaque puce (année / effectif) ne
 * s'affiche que si l'API la fournit pour cette école précise.
 *
 * Pas de recherche : `.le-list-block` ne contient que la liste et la
 * pagination, aucun champ de filtre dans la maquette.
 *
 * Cinq écoles par page.
 *
 * Domaines réels de la destination (`destinationRepo.areas`), plus leur
 * icône du back-office — pas les six domaines fixes devinés jusqu'ici, qui
 * ne couvraient ni Droit ni MBA et en montraient deux qu'aucune destination
 * n'a réellement (Sciences, Sciences politiques). Le domaine sélectionné
 * (`?domaine=`) se résout en son identifiant réel avant d'interroger
 * `GET /schools/{countryId}/{areaId}` — seul endpoint qui filtre
 * effectivement par domaine (voir `server/api/bff/schools/index.get.ts`).
 *
 * **Ordre aléatoire** (2026-09-03, sur demande explicite) : l'API trie par
 * `RAND(seed)`, mais retombe sur `seed=1` — un ordre fixe — si on ne lui en
 * fournit pas. La graine vit en mémoire du composant (pas dans l'URL) :
 * tirée une fois par montage, donc stable tant qu'on pagine ou change de
 * domaine (navigation interne, même instance de page), mais renouvelée à
 * chaque arrivée fraîche (F5, lien externe) — c'est le comportement voulu.
 *
 * **Pas dans l'URL** (corrigé le 2026-09-04, audit perf/SEO) : la première
 * implémentation l'écrivait via `router.replace({ query: { ...seed } })`.
 * Deux conséquences alors observées : la page devenait impossible à mettre
 * en cache SSR (chaque visite = une URL différente), et Google risquait
 * d'indexer un nombre infini d'URL quasi identiques (contenu dupliqué). Une
 * simple variable locale suffit : Vue réutilise la même instance de
 * composant tant que seuls `page`/`domaine` changent (navigation interne),
 * donc la graine survit sans avoir besoin de persister nulle part.
 */
import { domainAreaVisual } from '~/config/domain-area-visual'
import { catalogRepo, destinationRepo, schoolRepo } from '~/core/repositories'
import type { SchoolSummary } from '~/core/contracts'

const route = useRoute()
const router = useRouter()
const { t, n, locale } = useI18n()
const localePath = useLocalePath()

const slug = computed(() => String(route.params.slug ?? ''))
const page = computed(() => Math.max(1, Number(route.query.page ?? 1) || 1))
const domaineParam = computed(() => String(route.query.domaine ?? ''))

/** Graine d'ordre aléatoire — voir docblock plus haut. */
const effectiveSeed = 1 + Math.floor(Math.random() * 1_000_000)

const chipsRef = ref<HTMLDivElement | null>(null)

const { data, status, apiError, isInitialLoading, refresh } = await usePageData(
  'school-list',
  async () => {
    const [areas, catalog] = await Promise.all([
      destinationRepo.areas(slug.value, locale.value),
      catalogRepo.load(locale.value),
    ])
    // Le domaine demandé par l'URL s'il existe pour cette destination, sinon le premier.
    const selected = areas.find((area) => area.slug === domaineParam.value) ?? areas[0] ?? null

    const result = selected
      ? await schoolRepo.list({ destination: slug.value, area: selected.id, page: page.value, seed: effectiveSeed }, locale.value)
      : { items: [], page: page.value, perPage: 5, total: 0, totalPages: 1 }

    return {
      result,
      areas,
      selectedSlug: selected?.slug ?? '',
      destination: catalog.destinations.find((item) => item.slug === slug.value) ?? null,
    }
  },
  { watch: [slug, page, domaineParam, locale] },
)

const result = computed(() => data.value?.result ?? null)
const schools = computed(() => result.value?.items ?? [])
const areas = computed(() => data.value?.areas ?? [])
const selectedDomain = computed(() => data.value?.selectedSlug ?? '')
const destinationName = computed(() => data.value?.destination?.title ?? slug.value)

function setDomain(areaSlug: string) {
  router.replace({ query: { ...route.query, domaine: areaSlug, page: undefined } })
  nextTick(() => {
    const chips = chipsRef.value
    const chip = chips?.querySelector<HTMLElement>(`[data-domaine="${areaSlug}"]`)
    if (!chips || !chip) return
    const left = chip.offsetLeft - (chips.clientWidth - chip.offsetWidth) / 2
    chips.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
  })
}

/** Bouton « suivant » (`.le-chips-next`) : avance d'un domaine, en boucle. */
function nextDomain() {
  const idx = areas.value.findIndex((area) => area.slug === selectedDomain.value)
  const next = areas.value[(idx + 1) % areas.value.length]
  if (next) setDomain(next.slug)
}

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
  <AppTopBar back :back-to="`/destinations/${slug}`" :gap="22" />

  <!-- Carrousel de domaines (.le-domains) -->
  <div class="box-border flex w-full flex-col items-stretch gap-22">
    <div class="flex w-full items-center justify-center gap-10 box-border">
      <div ref="chipsRef" class="flex min-w-0 flex-1 gap-7 overflow-x-auto py-2 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden box-border">
        <button
          v-for="area in areas"
          :key="area.id"
          type="button"
          :data-domaine="area.slug"
          class="box-border flex shrink-0 items-center justify-center gap-5 rounded-xl border py-12 px-8 max-2xs:px-6 text-text"
          :class="selectedDomain === area.slug ? 'bg-le-chip-selected-bg border-le-chip-selected-border' : 'bg-surface-card border-le-chip-border shadow-le-chip'"
          :style="{ flex: '0 0 calc((100% - 14px) / 3)', width: 'calc((100% - 14px) / 3)' }"
          @click="setDomain(area.slug)"
        >
          <span class="flex shrink-0 items-center justify-center overflow-clip">
            <NuxtImg
              v-if="area.icon"
              :src="area.icon"
              alt=""
              width="18"
              height="18"
              format="webp"
              class="block size-18 object-contain"
            />
            <QIcon
              v-else
              :name="domainAreaVisual(area.slug).chipIcon"
              :size="domainAreaVisual(area.slug).chipIconSize"
              :height="domainAreaVisual(area.slug).chipIconHeight"
            />
          </span>
          <span class="min-w-0 truncate text-sm leading-21 font-semibold text-navy">{{ area.title }}</span>
        </button>
      </div>

      <button
        type="button"
        class="flex size-24 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-surface-card p-0 shadow-xs"
        :aria-label="$t('school.list.nextDomains')"
        @click="nextDomain"
      >
        <QIcon name="ic-le-chip-next" :size="9" />
      </button>
    </div>

    <div class="flex w-full items-center justify-center">
      <span
        v-for="area in areas"
        :key="area.id"
        class="ml-6 size-6 shrink-0 rounded-full"
        :class="selectedDomain === area.slug ? 'bg-le-dot-active' : 'bg-border-slate'"
      />
    </div>
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
      />
    </template>

    <template v-if="result">
      <div class="mt-22 flex flex-col gap-15" :aria-busy="status === 'pending' ? 'true' : undefined">
        <!-- .le-school -->
        <NuxtLink
          v-for="school in schools"
          :key="school.id"
          :to="localePath(`/destinations/${slug}/ecoles/${school.slug}?domaine=${selectedDomain}`)"
          class="box-border flex w-full items-center rounded-xl bg-surface-card p-10 text-inherit no-underline shadow-card"
        >
          <!-- Logo 64×64 -->
          <div class="box-border flex size-64 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-card p-4 shadow-xs">
            <NuxtImg
              v-if="school.logo"
              :src="school.logo"
              :alt="school.title"
              width="56"
              height="56"
              format="webp"
              loading="lazy"
              decoding="async"
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

            <div
              v-if="school.foundedYear !== null || school.studentCount !== null"
              class="flex w-full flex-wrap items-start gap-x-4 gap-y-0 pt-6 max-2xs:flex-col max-2xs:gap-2"
            >
              <span v-if="school.foundedYear !== null" class="flex items-center gap-3 text-2xs leading-15 font-normal whitespace-nowrap text-text">
                <QIcon name="ic-le-calendar" :size="10" :height="14" class="shrink-0" />
                <span>{{ $t('school.list.foundedYear', { year: school.foundedYear }) }}</span>
              </span>
              <span v-if="school.studentCount !== null" class="flex items-center gap-3 text-2xs leading-15 font-normal whitespace-nowrap text-text">
                <QIcon name="ic-le-users" :size="8" :height="7" class="shrink-0" />
                <span>{{ $t('school.list.students', { count: n(school.studentCount, 'decimal') }) }}</span>
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
                loading="lazy"
                decoding="async"
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
