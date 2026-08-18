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
 *
 * La carte n'affiche **pas** `formation.description` (contrairement à
 * `f.desc` dans la maquette, dont la donnée d'essai tient en une phrase) :
 * la modale ouverte au clic montre déjà ce même texte, réel et long sur
 * plusieurs paragraphes — le dupliquer dans la carte la rendrait
 * démesurément haute pour rien. Titre + méta suffisent en aperçu, comme le
 * veut `ecole-detail.html` (carte compacte, détail complet uniquement dans
 * la modale).
 */
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'
import { schoolRepo } from '~/core/repositories'
import type { SchoolFormation } from '~/core/contracts'

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
    { value: 'presentation', label: t('school.detail.tabPresentation'), icon: 'ed-tab-presentation' },
    { value: 'formations', label: t('school.detail.tabFormations'), icon: 'ed-tab-formations' },
    { value: 'points', label: t('school.detail.tabStrengths'), icon: 'ed-tab-points' },
  ]
})

const activeTab = ref('formations')

/**
 * Modale de détail d'une formation, à la place du renvoi vers l'offre du
 * domaine (resynchronisation maquette du 2026-08-17, commit `5d60a2d`).
 *
 * La maquette affiche cinq sections fixes (Cible/Programmes/Frais/Admission/
 * Débouchés, `buildFormationDetailHtml`) tirées de son jeu d'essai —
 * `SchoolFormation` n'a que `title`/`description` côté API réelle, aucune de
 * ces cinq rubriques n'existe. Montrer la vraie description plutôt
 * qu'inventer les rubriques manquantes, même vides.
 */
const activeFormation = ref<SchoolFormation | null>(null)
const formationModalOpen = computed({
  get: () => activeFormation.value !== null,
  set: (value: boolean) => { if (!value) activeFormation.value = null },
})

/**
 * CTA flottant : se cache/réapparaît au défilement. Logique portée de
 * `ecole-detail.html` (`updateFloatCtaFromScroll`) : visible en haut, visible
 * en bas, masqué en descendant, ré-affiché en remontant — au-delà d'un seuil
 * de 6px pour ignorer le bruit de micro-scroll.
 *
 * Le conteneur qui défile réellement dépend de la hauteur du contenu : sur
 * un écran court, c'est `<main>` (`overflow-y-auto` du layout `mobile.vue`,
 * équivalent du `.ed-main` de la maquette) ; une école à beaucoup de
 * formations dépasse `min-h-dvh` du shell (qui n'est qu'un plancher, pas un
 * plafond) et c'est alors le document entier qui défile. Détecté une fois au
 * montage plutôt que supposé, faute de quoi le CTA ne réagit jamais sur les
 * fiches longues (mesuré : `NEOMA Business School`, 11 formations).
 */
const floatCtaVisible = ref(true)
let scrollTarget: HTMLElement | Window = window
let lastScroll = 0
let ticking = false
const SCROLL_DELTA = 6

function scrollTop() {
  return scrollTarget === window ? window.scrollY : (scrollTarget as HTMLElement).scrollTop
}

function scrollMax() {
  if (scrollTarget === window) {
    const doc = document.scrollingElement ?? document.documentElement
    return Math.max(0, doc.scrollHeight - window.innerHeight)
  }
  const el = scrollTarget as HTMLElement
  return Math.max(0, el.scrollHeight - el.clientHeight)
}

function updateFloatCtaFromScroll() {
  if (activeFormation.value) return
  const st = scrollTop()
  const atBottom = scrollMax() - st <= 32
  const delta = st - lastScroll
  if (atBottom || st <= 8) floatCtaVisible.value = true
  else if (delta > SCROLL_DELTA) floatCtaVisible.value = false
  else if (delta < -SCROLL_DELTA) floatCtaVisible.value = true
  lastScroll = st
}

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => { updateFloatCtaFromScroll(); ticking = false })
}

onMounted(() => {
  const main = document.getElementById('q-shell')?.querySelector('main')
  scrollTarget = main && main.scrollHeight - main.clientHeight > 1 ? main : window
  lastScroll = scrollTop()
  scrollTarget.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  scrollTarget.removeEventListener('scroll', onScroll)
})

watch(activeTab, () => {
  lastScroll = scrollTop()
  updateFloatCtaFromScroll()
})

watch(activeFormation, (value) => {
  if (value) floatCtaVisible.value = false
  else updateFloatCtaFromScroll()
})

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
            role="tab"
            :aria-selected="activeTab === tb.value"
            class="relative flex flex-1 items-center justify-center gap-4 max-2xs:gap-8 border-0 bg-transparent pb-12 text-xl max-2xs:text-base leading-21 font-medium whitespace-nowrap"
            :class="activeTab === tb.value ? 'text-le-chip-selected-border' : 'text-text'"
            @click="activeTab = tb.value"
          >
            <QIcon :name="tb.icon" :size="16" class="max-2xs:size-14" />
            <span>{{ tb.label }}</span>
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
            <button
              v-for="formation in school.formations"
              :key="formation.title"
              type="button"
              class="box-border flex w-full items-start gap-16 rounded-xl border-0 bg-white p-20 text-left text-text shadow-card"
              @click="activeFormation = formation"
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
              </div>

              <QIcon name="ic-ed-chevron" :size="16" class="mt-4 shrink-0 text-muted" />
            </button>
          </div>

          <div v-else class="w-full">
            <ul v-if="school.details.length > 0" class="m-0 flex list-disc flex-col gap-12 pl-18">
              <li v-for="d in school.details" :key="d.title" class="text-lg leading-21 text-text">{{ d.title }}</li>
            </ul>
            <p v-else class="m-0 text-lg leading-21 text-text">{{ $t('school.detail.emptyDescription') }}</p>
          </div>
        </div>
      </div>

    </template>
  </PageState>

  <!-- CTA flottant (.ed-float-cta) : remplace le bloc « Appel conseiller »
       statique depuis la resynchronisation du 2026-08-17 (commit `5d60a2d`). -->
  <NuxtLink
    v-if="school"
    :to="localePath(`/offres/${domaine}`)"
    class="fixed bottom-[calc(var(--spacing-nav-bottom)+85px)] left-1/2 z-49 box-border w-[calc(100%-var(--spacing-nav-inset)*2)] max-w-[calc(var(--container-shell)-var(--spacing-nav-inset)*2)] rounded-xl bg-primary px-16 py-16 text-center text-xl leading-20 font-semibold whitespace-nowrap text-white no-underline shadow-ed-float-cta transition-[transform,opacity] duration-250 ease-in-out"
    :class="floatCtaVisible ? '-translate-x-1/2 translate-y-0 opacity-100' : '-translate-x-1/2 translate-y-[calc(100%+24px)] pointer-events-none opacity-0'"
  >
    {{ $t('school.detail.floatingCta') }}
  </NuxtLink>

  <!-- Modale de détail de formation (.ed-form-modal) -->
  <DialogRoot v-model:open="formationModalOpen">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-100 bg-[rgba(13,27,62,0.45)]" />
      <DialogContent
        class="fixed inset-x-0 bottom-0 z-100 mx-auto flex w-full max-w-shell max-h-[min(85vh,640px)] flex-col overflow-hidden rounded-t-3xl bg-white"
      >
        <header class="flex shrink-0 items-start justify-between gap-12 border-b border-border-soft px-20 pt-20 pb-12">
          <DialogTitle class="m-0 pr-8 text-xl leading-21 font-bold text-navy">
            {{ activeFormation?.title }}
          </DialogTitle>
          <DialogClose
            class="flex size-36 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-surface-2 p-0"
            :aria-label="$t('ds.sheet.close')"
          >
            <QIcon name="ic-menu-close" :size="14" />
          </DialogClose>
        </header>

        <div class="flex flex-col gap-18 overflow-y-auto px-20 pt-16 pb-[calc(24px+env(safe-area-inset-bottom,0px))]">
          <RichText v-if="activeFormation?.description" :content="activeFormation.description" />
          <p v-else class="m-0 text-lg leading-21 text-text">{{ $t('school.detail.emptyDescription') }}</p>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
