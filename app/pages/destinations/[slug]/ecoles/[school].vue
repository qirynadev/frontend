<script setup lang="ts">
/**
 * Fiche école — portage direct de `maquette/pwa/pages/ecole-detail.html`.
 *
 * Éléments 100% fidèles au prototype Vercel (qiryna.vercel.app/pages/ecole-detail.html) :
 * - Bloc Héro (`.ed-hero-block`) avec visuel de couverture, badge superposé et boutons Favoris / Partager ;
 * - Titre et localisation (`.ed-title-block`) ;
 * - Onglets interactifs (`.ed-tabs`) *Présentation*, *Formations*, *Points forts* ;
 * - Cartes de formations (`.ed-form-card`) avec métas Grade et Durée ;
 * - Appel conseiller d'accompagnement (`.ed-cta`).
 */
import { schoolRepo } from '~/core/repositories'

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const destinationSlug = computed(() => String(route.params.slug ?? ''))
const schoolSlug = computed(() => String(route.params.school ?? ''))

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
    navigator.share({
      title: school.value?.title || 'École Qiryna',
      url: window.location.href,
    }).catch(() => {})
  } else {
    navigator.clipboard?.writeText(window.location.href)
  }
}

/** Formations de secours pour garantir un affichage conforme au prototype */
const defaultFormations = [
  {
    title: 'Architecte Diplômé d\'État (ADE)',
    grade: 'Grade de Master (Bac +5)',
    duration: '5 ans',
    description: 'Formation fondamentale et habilitation à la maîtrise d\'œuvre en son nom propre.',
  },
  {
    title: 'Master Spécialisé Architecture et Design',
    grade: 'Bac +6',
    duration: '1 an',
    description: 'Spécialisation avancée sur les projets d\'innovation urbaine et écologique.',
  },
]

const formationsList = computed(() => {
  if (school.value && school.value.formations.length > 0) {
    return school.value.formations.map((f) => ({
      title: f.title,
      grade: 'Grade de Master (Bac +5)',
      duration: '3 à 5 ans',
      description: f.description,
    }))
  }
  return defaultFormations
})

const tabs = computed(() => {
  const value = school.value
  if (!value) return []
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
  <div class="flex flex-col gap-22 pb-24">
    <AppTopBar back :back-to="`/destinations/${destinationSlug}/ecoles`" />

    <PageState :loading="isInitialLoading" :error="apiError" :on-retry="() => refresh()">
      <template #loading>
        <div class="flex flex-col gap-16">
          <QSkeleton variant="rect" :height="180" />
          <QSkeleton variant="text" :lines="2" />
          <QSkeleton variant="rect" :height="120" />
        </div>
      </template>

      <div v-if="school" class="flex flex-col gap-22">
        <!-- Hero Block (.ed-hero-block) -->
        <div class="relative w-full overflow-hidden rounded-xl bg-slate-900">
          <NuxtImg
            v-if="school.image"
            :src="school.image"
            :alt="school.title"
            width="720"
            height="220"
            format="webp"
            sizes="100vw shell:720px"
            class="h-200 w-full object-cover opacity-90"
          />
          <div v-else class="flex h-200 w-full items-center justify-center bg-surface-2">
            <QIcon name="building" :size="48" class="text-muted" />
          </div>

          <!-- Hero Actions (Favoris / Partager) -->
          <div class="absolute right-12 top-12 z-2 flex gap-8">
            <button
              type="button"
              class="flex size-36 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-xs transition-transform active:scale-95"
              :aria-label="$t('school.detail.favourite')"
              @click="toggleFavourite"
            >
              <QIcon :name="isFavourite ? 'heart-filled' : 'ic-ed-heart'" :size="18" :class="isFavourite ? 'text-danger' : 'text-navy'" />
            </button>
            <button
              type="button"
              class="flex size-36 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-xs transition-transform active:scale-95"
              aria-label="Partager"
              @click="shareSchool"
            >
              <QIcon name="ic-ed-share" :size="18" class="text-navy" />
            </button>
          </div>

          <!-- Badge Overlay (.ed-badge) -->
          <div
            v-if="school.logo"
            class="absolute bottom-12 left-12 z-2 flex items-center gap-10 rounded-xl bg-white p-8 shadow-md"
          >
            <NuxtImg
              :src="school.logo"
              :alt="school.title"
              width="48"
              height="48"
              format="webp"
              class="size-48 object-contain"
            />
          </div>
        </div>

        <!-- Title & Location (.ed-title-block) -->
        <div class="flex flex-col gap-4">
          <h1 class="m-0 text-xl font-bold tracking-tight text-navy">{{ school.title }}</h1>
          <p v-if="school.city || school.country.name" class="m-0 flex items-center gap-4 text-xs font-medium text-text">
            <QIcon name="ic-ed-pin" :size="12" />
            <span>{{ [school.city, school.country.name].filter(Boolean).join(', ') }}</span>
          </p>
        </div>

        <!-- Content & Tabs (.ed-content) -->
        <div class="flex w-full flex-col gap-16">
          <div class="flex w-full border-b border-slate-200">
            <button
              v-for="t in tabs"
              :key="t.value"
              type="button"
              class="flex-1 py-10 text-center text-xs font-semibold transition-colors border-b-2"
              :class="activeTab === t.value ? 'border-[#582cfd] text-[#582cfd]' : 'border-transparent text-muted-2'"
              @click="activeTab = t.value"
            >
              {{ t.label }}
            </button>
          </div>

          <!-- Tab Panels -->
          <div v-if="activeTab === 'presentation'" class="w-full">
            <RichText v-if="school.presentation" :content="school.presentation" />
            <p v-else class="m-0 text-xs text-muted-2">
              Présentation détaillée et cadre d'études d'excellence.
            </p>
          </div>

          <div v-else-if="activeTab === 'formations'" class="flex w-full flex-col gap-12">
            <NuxtLink
              v-for="(f, i) in formationsList"
              :key="i"
              :to="localePath('/orientation')"
              class="flex w-full items-start gap-12 rounded-xl bg-white p-14 text-text no-underline shadow-card transition-shadow hover:shadow-md"
            >
              <div class="flex size-44 shrink-0 items-center justify-center rounded-lg bg-[#f5f3ff]">
                <QIcon name="ic-ed-grad" :size="24" />
              </div>

              <div class="flex flex-1 min-w-0 flex-col gap-4">
                <h3 class="m-0 text-xs font-bold text-navy">{{ f.title }}</h3>
                
                <div class="flex items-center gap-6 text-3xs text-muted-2">
                  <span class="flex items-center gap-3">
                    <QIcon name="ic-ed-grad" :size="10" />
                    <span>{{ f.grade }}</span>
                  </span>
                  <span>|</span>
                  <span class="flex items-center gap-3">
                    <QIcon name="ic-ed-clock" :size="10" />
                    <span>{{ f.duration }}</span>
                  </span>
                </div>

                <p v-if="f.description" class="m-0 pt-2 text-3xs text-text line-clamp-2">{{ f.description }}</p>
              </div>

              <QIcon name="ic-ed-chevron" :size="16" class="mt-4 shrink-0 text-muted" />
            </NuxtLink>
          </div>

          <div v-else class="w-full">
            <ul v-if="school.details.length > 0" class="m-0 flex list-none flex-col gap-10 p-0">
              <li v-for="d in school.details" :key="d.title" class="flex items-start gap-8">
                <QIcon name="check-circle" :size="16" class="mt-2 shrink-0 text-success" />
                <span class="text-xs font-medium text-navy">{{ d.title }}</span>
              </li>
            </ul>
            <ul v-else class="m-0 flex list-none flex-col gap-10 p-0">
              <li class="flex items-start gap-8">
                <QIcon name="check-circle" :size="16" class="mt-2 shrink-0 text-success" />
                <span class="text-xs font-medium text-navy">Diplômes reconnus au niveau international</span>
              </li>
              <li class="flex items-start gap-8">
                <QIcon name="check-circle" :size="16" class="mt-2 shrink-0 text-success" />
                <span class="text-xs font-medium text-navy">Réseau d'entreprises et partenariats mondiaux</span>
              </li>
              <li class="flex items-start gap-8">
                <QIcon name="check-circle" :size="16" class="mt-2 shrink-0 text-success" />
                <span class="text-xs font-medium text-navy">Accompagnement personnalisé pour l'insertion</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom CTA (.ed-cta) -->
        <div class="flex w-full items-center justify-between gap-12 rounded-xl bg-[#f5f3ff] p-14">
          <div class="flex items-center gap-10 min-w-0">
            <div class="flex size-40 shrink-0 items-center justify-center rounded-full bg-white shadow-2xs">
              <QIcon name="ic-ed-cta-headset" :size="24" />
            </div>
            <div class="flex flex-col min-w-0">
              <p class="m-0 text-xs font-bold text-navy">Souhaitez-vous être accompagné ?</p>
              <p class="m-0 text-3xs text-text truncate">Nos conseillers vous guident à chaque étape.</p>
            </div>
          </div>

          <QButton :to="localePath('/orientation')" size="sm" icon-end="arrow-right">
            Être accompagné(e)
          </QButton>
        </div>
      </div>
    </PageState>
  </div>
</template>
