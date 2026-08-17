<script setup lang="ts">
/**
 * Fiche école ← `maquette/pwa/pages/ecole-detail.html` (`.ed-*`).
 *
 * ⚠️ `.ed-title-block { display: none }` dans la maquette : le titre et la
 * localisation ne sont **pas visibles** — l'identité de l'école tient
 * entièrement dans le badge superposé au héros (logo, ou à défaut son nom
 * découpé en lignes sur fond marine). Rendu ici en `sr-only` plutôt qu'en
 * `display: none` littéral : même résultat visuel, accessible aux lecteurs
 * d'écran plutôt que masqué pour tout le monde — la maquette n'a pas de
 * bonne raison de vouloir l'inverse.
 *
 * Le badge sans logo (`.ed-badge.is-text`) affiche jusqu'à 4 lignes
 * pré-écrites par école (`js/schools.js`) — un champ que le contrat `School`
 * n'a pas. Faute de donnée dédiée, les lignes sont dérivées du nom réel
 * (découpé en mots) et de la ville : signalé, pas inventé de toutes pièces.
 *
 * `.ed-form-card` porte l'icône **propre à la formation** (`f.icon`, 44×44,
 * sans cercle de fond) et des méta Grade/Durée qui varient par formation.
 * `SchoolFormation` n'a ni l'un ni l'autre (juste `title`/`description`) et
 * l'API ne les alimente pour aucune école : une icône générique et un texte
 * fixe remplacent la donnée absente, comme sur la liste d'écoles voisine.
 */
import { schoolRepo } from '~/core/repositories'

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const destinationSlug = computed(() => String(route.params.slug ?? ''))
const schoolSlug = computed(() => String(route.params.school ?? ''))
/**
 * Domaine d'étude de l'école — porté par l'URL, pas par `School` (qui n'a
 * aucun champ domaine : ni l'API ni le contrat ne l'exposent). La liste
 * d'écoles le transmet déjà en query (`ecoles/index.vue`), reprenant le sien
 * de la fiche destination (`destinations/[slug]/index.vue`) : même
 * mécanique que `ecole-detail.html` (`params.get('domaine') || school.domaine
 * || 'architecture'`), sans le champ `school.domaine` que notre contrat n'a
 * pas.
 */
const domaine = computed(() => String(route.query.domaine ?? 'architecture'))

const { data: school, apiError, isInitialLoading, refresh } = await usePageData(
  `school-${schoolSlug.value}`,
  () => schoolRepo.bySlug(schoolSlug.value, locale.value),
  { watch: [schoolSlug, locale] },
)

if (school.value === null && !apiError.value) {
  throw createError({ statusCode: 404, statusMessage: t('school.detail.notFound'), fatal: true })
}

const isFavourite = ref(false)
function toggleFavourite() {
  isFavourite.value = !isFavourite.value
}

function shareSchool() {
  if (navigator.share) {
    navigator.share({ title: school.value?.title || '', url: window.location.href }).catch(() => {})
  }
  else {
    navigator.clipboard?.writeText(window.location.href)
  }
}

/** Lignes du badge sans logo : nom découpé en mots (3 lignes), puis la ville. */
const badgeLines = computed(() => {
  const value = school.value
  if (!value) return []
  const words = value.title.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if (lines.length >= 2) {
      current = current ? `${current} ${word}` : word
      continue
    }
    if (current) { lines.push(current); current = word }
    else current = word
  }
  if (current) lines.push(current)
  if (value.city) lines.push(value.city)
  return lines.slice(0, 4)
})

const tabs = computed(() => {
  if (!school.value) return []
  return [
    { value: 'presentation', label: t('school.detail.tabPresentation') },
    { value: 'formations', label: t('school.detail.tabFormations') },
    { value: 'points', label: t('school.detail.tabStrengths') },
  ]
})

const activeTab = ref('formations')

useContractSeo(() => school.value?.seo, t('school.detail.fallbackTitle'), school.value?.slugs)
useSchoolSchemaOrg(school)
</script>

<template>
  <AppTopBar back :back-to="`/destinations/${destinationSlug}/ecoles`" :notifications="3" :gap="0" />

  <PageState :loading="isInitialLoading" :error="apiError" :on-retry="() => refresh()">
    <template #loading>
      <div class="mt-22 flex flex-col gap-16">
        <QSkeleton variant="rect" :height="175" />
        <QSkeleton variant="text" :lines="2" />
        <QSkeleton variant="rect" :height="120" />
      </div>
    </template>

    <template v-if="school">
      <!-- Héros + badge (.ed-hero-block) -->
      <div class="relative mt-22 h-175 w-full shrink-0">
        <div class="relative h-140 w-full overflow-hidden rounded-xl bg-border-soft shadow-xs">
          <NuxtImg
            v-if="school.image"
            :src="school.image"
            :alt="school.title"
            width="720"
            height="220"
            format="webp"
            sizes="100vw shell:720px"
            class="pointer-events-none absolute top-0 left-0 h-[105%] w-full max-w-none object-cover object-center"
          />
          <div v-else class="flex h-full w-full items-center justify-center">
            <QIcon name="building" :size="48" class="text-muted" />
          </div>
        </div>

        <div class="pointer-events-none absolute inset-x-0 top-0 h-140 overflow-visible">
          <!-- Badge (.ed-badge) -->
          <div
            class="pointer-events-auto absolute -bottom-23 left-15 box-border flex size-102 flex-col items-center justify-center overflow-hidden rounded-3xl border border-ed-badge-border bg-white p-12 shadow-ed-badge"
            :class="!school.logo && 'bg-ed-badge-text-bg p-0 border-0'"
          >
            <NuxtImg
              v-if="school.logo"
              :src="school.logo"
              :alt="school.title"
              width="78"
              height="78"
              format="webp"
              class="block size-78 object-contain object-center"
            />
            <div v-else class="box-border flex h-full w-full flex-col items-start justify-center gap-0 p-12 px-9 font-jakarta text-xs leading-[12.5px] font-medium tracking-[0.5px] text-white">
              <span
                v-for="(line, i) in badgeLines"
                :key="i"
                class="block w-full min-h-[12.5px] overflow-hidden text-ellipsis whitespace-nowrap uppercase"
                :class="i === badgeLines.length - 1 && badgeLines.length > 1 && 'pt-2 opacity-80'"
              >{{ line }}</span>
            </div>
          </div>

          <!-- Favoris / partage (.ed-hero-actions) -->
          <div class="pointer-events-auto absolute right-14 bottom-0 flex translate-y-1/2 items-center gap-8">
            <button
              type="button"
              class="flex size-40 cursor-pointer items-center justify-center rounded-full border-0 bg-white p-0 shadow-ed-icon-btn"
              :aria-label="$t('school.detail.favourite')"
              @click="toggleFavourite"
            >
              <QIcon :name="isFavourite ? 'heart-filled' : 'ic-ed-heart'" :size="18" :class="isFavourite ? 'text-danger' : 'text-navy'" />
            </button>
            <button
              type="button"
              class="flex size-40 cursor-pointer items-center justify-center rounded-full border-0 bg-white p-0 shadow-ed-icon-btn"
              :aria-label="$t('school.detail.share')"
              @click="shareSchool"
            >
              <QIcon name="ic-ed-share" :size="18" class="text-navy" />
            </button>
          </div>
        </div>
      </div>

      <!-- Titre & localisation : invisibles dans la maquette (voir le commentaire du script) -->
      <div class="sr-only">
        <h1>{{ school.title }}</h1>
        <p v-if="school.city || school.country.name">{{ [school.city, school.country.name].filter(Boolean).join(', ') }}</p>
      </div>

      <!-- Contenu & onglets (.ed-content) -->
      <div class="mt-22 flex w-full flex-col">
        <div class="box-border flex w-full items-stretch border-b border-border-soft px-24 max-2xs:px-8">
          <button
            v-for="tb in tabs"
            :key="tb.value"
            type="button"
            class="relative flex-1 border-0 bg-transparent pb-12 text-xl max-2xs:text-base leading-21 font-medium whitespace-nowrap text-text"
            :class="activeTab === tb.value && 'text-le-chip-selected-border'"
            @click="activeTab = tb.value"
          >
            {{ tb.label }}
            <span
              v-if="activeTab === tb.value"
              class="absolute bottom-0 left-1/2 h-1 w-[min(108px,90%)] -translate-x-1/2 rounded-full bg-le-chip-selected-border"
            />
          </button>
        </div>

        <div class="pt-22 w-full">
          <div v-if="activeTab === 'presentation'" class="w-full">
            <RichText v-if="school.presentation" :content="school.presentation" />
            <p v-else class="m-0 text-lg leading-21 text-text">{{ $t('school.detail.emptyDescription') }}</p>
          </div>

          <div v-else-if="activeTab === 'formations'" class="flex w-full flex-col gap-16">
            <NuxtLink
              v-for="formation in school.formations"
              :key="formation.title"
              :to="localePath(`/offres/${domaine}`)"
              class="box-border flex w-full items-start gap-16 rounded-xl bg-white p-20 text-text no-underline shadow-card"
            >
              <div class="flex size-44 shrink-0 items-center justify-center overflow-hidden">
                <QIcon name="ic-ed-grad" :size="44" class="text-primary" />
              </div>

              <div class="min-w-0 flex-1">
                <h3 class="m-0 text-base leading-[19.938px] font-semibold text-navy">{{ formation.title }}</h3>

                <div class="flex flex-wrap items-center gap-12 pt-6">
                  <span class="flex items-center gap-6 text-md leading-[16.5px] font-medium whitespace-nowrap text-text">
                    <QIcon name="ic-ed-grad" :size="12" :height="9" />
                    <span>{{ $t('school.detail.founded') }}</span>
                  </span>
                  <span class="text-md leading-[16.5px] font-bold text-border-slate">|</span>
                  <span class="flex items-center gap-6 text-md leading-[16.5px] font-medium whitespace-nowrap text-text">
                    <QIcon name="ic-ed-clock" :size="9" :height="9" />
                    <span>{{ $t('school.detail.students') }}</span>
                  </span>
                </div>

                <RichText v-if="formation.description" :content="formation.description" class="mt-6" />
              </div>

              <QIcon name="ic-ed-chevron" :size="16" class="mt-4 shrink-0 text-muted" />
            </NuxtLink>
          </div>

          <div v-else class="w-full">
            <ul v-if="school.details.length > 0" class="m-0 flex list-disc flex-col gap-12 pl-18">
              <li v-for="d in school.details" :key="d.title" class="text-lg leading-21 text-text">{{ d.title }}</li>
            </ul>
            <p v-else class="m-0 text-lg leading-21 text-text">{{ $t('school.detail.emptyDescription') }}</p>
          </div>
        </div>
      </div>

      <!-- Appel conseiller (.ed-cta) -->
      <div class="relative mt-22 box-border flex min-h-120 w-full items-center rounded-xl bg-surface-2 py-20 px-9 max-2xs:flex-col max-2xs:items-stretch max-2xs:gap-12">
        <div class="flex min-w-0 flex-1 items-start gap-11 pr-110 max-2xs:flex-col max-2xs:pr-0">
          <span class="flex size-44 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft">
            <QIcon name="ic-ed-cta-headset" :size="24" />
          </span>
          <div class="min-w-0">
            <p class="m-0 text-base leading-20 font-bold text-text">{{ $t('school.detail.ctaTitle') }}</p>
            <p class="m-0 mt-4 text-sm leading-16 whitespace-pre-line text-text">{{ $t('school.detail.ctaDescription') }}</p>
          </div>
        </div>

        <NuxtLink
          :to="localePath(`/offres/${domaine}`)"
          class="absolute right-9 bottom-20 inline-flex items-center justify-center gap-5 rounded-xl border border-primary-link bg-transparent py-9 px-15 text-sm leading-16 font-medium whitespace-nowrap text-primary-link no-underline max-2xs:static max-2xs:self-end"
        >
          <span>{{ $t('school.detail.ctaButton') }}</span>
          <img src="/img/icons/ic-oo-cta-arrow.svg" alt="" width="8" height="7" class="block shrink-0">
        </NuxtLink>
      </div>
    </template>
  </PageState>
</template>
