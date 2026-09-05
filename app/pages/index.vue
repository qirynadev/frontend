<script setup lang="ts">
/**
 * Accueil ← `maquette/pwa/pages/home.html`, porté au pixel.
 *
 * Correspondances avec `app.css` :
 *
 * | Bloc | Règles reprises |
 * |---|---|
 * | bandeau | `.home-banner-wrap` `padding-top: 16px`, `margin-bottom: 24px` · `.home-banner` `aspect-ratio: 1819/865`, rayon 10 — image de `HomeContent.slides[0]` (`homeData.slides`, `/all-data`), déjà dans la bonne langue ; repli sur le visuel maquette `home-banner.png` si aucune diapositive n'existe |
 * | raccourcis | `.home-categories` `gap: 12px`, `padding-top: 0`, une seule rangée (2×2 sous 360px) |
 * | sections | `.home-section` `padding-top: 16px` · titre 18px/28px, `letter-spacing: -0.45px` · enfant non-titre `margin-top: 16px` |
 * | carte parcours | `.home-progress-card` fond `#fef4f5`, `padding: 20px`, `min-height: 154px`, illustration en absolu `right: -20px` |
 * | actualités | `.home-news-scroll` défilement horizontal, `gap: 16px`, cartes de 322px |
 *
 * Écart de **données**, pas de rendu : `GET /articles` renvoie un tableau
 * vide, les deux cartes de la maquette servent de contenu de repli
 * (`config/home-articles.ts`).
 *
 * L'anneau « Continuez votre parcours » affiche la moyenne réelle de tous les
 * accompagnements du client (`loadJourneyProgress`, 0 % si non connecté) —
 * dessiné en SVG (`progressRingOffset`), pas les deux icônes statiques de la
 * maquette (`ic-home-progress-bg/-fill`) dont le remplissage était figé à un
 * pourcentage arbitraire, sans rapport avec le nombre affiché à côté.
 */
import { articleRepo, catalogRepo, orientationEvaluationRepo, paymentRepo } from '~/core/repositories'
import { useSessionStore } from '~/core/stores'
import { homeCategories } from '~/config/home-categories'
import { fallbackArticles } from '~/config/home-articles'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const session = useSessionStore()

/**
 * Avancement moyen de tous les accompagnements du client (école, logement,
 * langues, orientation) — 0 % pour un visiteur non connecté, qui n'a par
 * définition aucune commande. Réutilise `toAccompagnements` (même agrégation
 * que `mon-projet/index.vue`) plutôt qu'un calcul dédié.
 */
async function loadJourneyProgress(): Promise<number> {
  if (!session.isAuthenticated) return 0

  const [orders, evaluations] = await Promise.all([
    paymentRepo.orders(locale.value),
    orientationEvaluationRepo.list(locale.value),
  ])
  const accompagnements = toAccompagnements(orders, evaluations)
  if (accompagnements.length === 0) return 0

  const total = accompagnements.reduce((sum, item) => sum + (item.progressPercent ?? 0), 0)
  return Math.round(total / accompagnements.length)
}

const { data, apiError, isInitialLoading, refresh } = await usePageData(
  'home',
  async () => {
    const [catalog, articles, progress] = await Promise.all([
      catalogRepo.load(locale.value),
      articleRepo.list(locale.value).catch(() => []),
      loadJourneyProgress(),
    ])
    return { catalog, articles, progress }
  },
  // Le back-office sert de vraies traductions : changer de langue doit
  // recharger le contenu, pas seulement les libellés d'interface. Idem si la
  // session change (connexion/déconnexion) : l'avancement doit suivre.
  { watch: [locale, () => session.isAuthenticated] },
)

const home = computed(() => data.value?.catalog.home ?? null)

/** Les articles du back-office l'emportent ; sinon, ceux de la maquette. */
const articles = computed(() => {
  const fetched = data.value?.articles ?? []
  return fetched.length > 0 ? fetched : fallbackArticles(t('home.news.placeholderTitle'))
})

/**
 * Bandeau hero.
 *
 * `HomeContent.slides[0]` (`homeData.slides`, `/all-data`) — pas
 * `Catalog.banners` (bannières publicitaires, un tout autre contenu). Une
 * seule diapositive existe actuellement côté back-office, déjà servie dans la
 * bonne langue par l'API (contrairement à `banners`, `homeData` respecte
 * l'en-tête `lang` — vérifié en direct : image différente entre `lang: fr` et
 * `lang: en`). Repli sur le visuel maquette (`pwa/assets/images/
 * home-banner.png`) tant qu'aucune diapositive n'existe.
 *
 * `preload` (`fetchPriority: 'high'`) sur son `NuxtImg` : c'est l'élément LCP
 * de la page d'accueil — audit perf du 5 septembre 2026 (PageSpeed Insights
 * mobile, LCP 3,6 s).
 */
const bannerSrc = computed(() => home.value?.slides[0]?.image ?? '/img/home-banner.webp')

/**
 * Progression affichée dans l'anneau — 0 % si non connecté, sinon la moyenne
 * de tous les accompagnements du client (`loadJourneyProgress`).
 */
const progress = computed(() => data.value?.progress ?? 0)

/**
 * Anneau dessiné en SVG, dasharray/dashoffset pilotés par `progress` — pas
 * les deux icônes statiques de la maquette (`ic-home-progress-bg/-fill`),
 * dont le remplissage était une forme figée à un pourcentage arbitraire,
 * sans rapport avec le nombre affiché à côté. Même rayon (25,5) et mêmes
 * couleurs que ces icônes, pour un rendu identique mais réellement piloté
 * par la donnée.
 */
const PROGRESS_RING_RADIUS = 25.5
const progressRingCircumference = 2 * Math.PI * PROGRESS_RING_RADIUS
const progressRingOffset = computed(() => progressRingCircumference * (1 - progress.value / 100))

/** Menu latéral (`home-menu` de la maquette). */
const menuOpen = ref(false)

usePageSeo(() => ({
  title: home.value?.seo.title || t('home.seoTitle'),
  description: home.value?.seo.description || t('home.seoDescription'),
  image: home.value?.seo.image ?? null,
}))
</script>

<template>
  <div>
    <AppTopBar menu :gap="0" @open-menu="menuOpen = true" />
    <AppSideMenu v-model:open="menuOpen" />

    <PageState :loading="isInitialLoading" :error="apiError" :on-retry="() => refresh()">
      <template #loading>
        <div class="flex flex-col gap-24 pt-16">
          <QSkeleton variant="rect" :height="160" />
          <QSkeleton variant="row" />
          <QSkeleton variant="card" :height="120" />
        </div>
      </template>

      <!-- Bandeau éditorial ← `home-banner.png` maquette (aspect 1819/865) -->
      <div class="w-full pt-16 mb-24">
        <NuxtImg
          :src="bannerSrc"
          alt=""
          width="720"
          height="342"
          format="webp"
          sizes="100vw shell:720px"
          :preload="{ fetchPriority: 'high' }"
          class="block aspect-[1819/865] w-full rounded-xl object-cover"
        />
      </div>

      <!-- Raccourcis de service -->
      <div class="flex w-full items-stretch gap-12 max-3xs:flex-wrap">
        <HomeCategoryCard v-for="category in homeCategories" :key="category.id" :category="category" />
      </div>

      <!-- Continuez votre parcours -->
      <section class="pt-16">
        <h2 class="m-0 text-3xl leading-28 font-semibold tracking-snug text-text">
          {{ $t('home.progress.sectionTitle') }}
        </h2>

        <div class="relative mt-16 min-h-154 overflow-hidden rounded-xl bg-progress-bg p-20 shadow-xs">
          <div class="relative z-1 flex max-w-[calc(100%-100px)] items-start gap-16 max-3xs:max-w-full">
            <!-- Anneau : tracé SVG dynamique, conforme au taux affiché -->
            <div class="relative size-56 shrink-0">
              <svg class="absolute inset-0 -rotate-90" viewBox="0 0 56 56" width="56" height="56" aria-hidden="true">
                <circle cx="28" cy="28" r="25.5" fill="none" stroke="#FCE3E6" stroke-width="5" />
                <circle
                  cx="28"
                  cy="28"
                  r="25.5"
                  fill="none"
                  stroke="#EF2344"
                  stroke-width="5"
                  :stroke-dasharray="progressRingCircumference"
                  :stroke-dashoffset="progressRingOffset"
                />
              </svg>
              <span class="absolute top-20 left-15 text-xl leading-20 font-medium tracking-[0.1px] text-progress-value">
                {{ progress }}%
              </span>
            </div>

            <div>
              <p class="m-0 text-xl leading-[19.25px] font-semibold text-text">
                {{ $t('home.progress.title') }}
              </p>
              <p class="m-0 pt-4 pb-2 text-md leading-[17.875px] text-progress-text">
                {{ $t('home.progress.desc') }}
              </p>
              <NuxtLink
                :to="localePath('/mon-projet')"
                class="mt-6 inline-flex cursor-pointer rounded-lg bg-progress-btn px-13 py-8 text-base leading-16 font-semibold text-white no-underline"
              >
                {{ $t('home.progress.cta') }}
              </NuxtLink>
            </div>
          </div>

          <NuxtImg
            src="/img/home-progress-mountain.webp"
            alt=""
            width="231"
            height="154"
            format="webp"
            class="pointer-events-none absolute top-20 -right-20 h-154 w-231 object-cover max-3xs:-right-40 max-3xs:opacity-35"
          />
        </div>
      </section>

      <!-- Nouveautés & conseils -->
      <section class="pt-16">
        <h2 class="m-0 text-3xl leading-28 font-semibold tracking-snug text-text">
          {{ $t('home.news.title') }}
        </h2>

        <div class="-mx-3 mt-16 flex gap-16 overflow-x-auto px-3 pb-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
        </div>
      </section>
    </PageState>
  </div>
</template>
