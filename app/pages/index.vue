<script setup lang="ts">
/**
 * Accueil ← `maquette/pwa/pages/home.html`, porté au pixel.
 *
 * Correspondances avec `app.css` :
 *
 * | Bloc | Règles reprises |
 * |---|---|
 * | bandeau | `.home-banner-wrap` `padding-top: 16px`, `margin-bottom: 24px` · `.home-banner` `aspect-ratio: 1819/865`, rayon 10 — **visuel maquette** `home-banner.png` (pas le slide API) |
 * | raccourcis | `.home-categories` `gap: 12px`, `padding-top: 0`, une seule rangée (2×2 sous 360px) |
 * | sections | `.home-section` `padding-top: 16px` · titre 18px/28px, `letter-spacing: -0.45px` · enfant non-titre `margin-top: 16px` |
 * | carte parcours | `.home-progress-card` fond `#fef4f5`, `padding: 20px`, `min-height: 154px`, illustration en absolu `right: -20px` |
 * | actualités | `.home-news-scroll` défilement horizontal, `gap: 16px`, cartes de 322px |
 *
 * Deux écarts de **données**, pas de rendu :
 * 1. la progression « 60 % » est propre à un compte connecté ; le tunnel public
 *    n'a pas de session. La valeur affichée reste celle de la maquette tant que
 *    l'authentification n'existe pas (Lot 5) ;
 * 2. `GET /articles` renvoie un tableau vide : les deux cartes de la maquette
 *    servent de contenu de repli (`config/home-articles.ts`).
 */
import { articleRepo, catalogRepo } from '~/core/repositories'
import { homeCategories } from '~/config/home-categories'
import { fallbackArticles } from '~/config/home-articles'
import DesktopHome from '~/desktop-pages/index.vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const { data, apiError, isInitialLoading, refresh } = await usePageData(
  'home',
  async () => {
    const [catalog, articles] = await Promise.all([
      catalogRepo.load(locale.value),
      articleRepo.list(locale.value).catch(() => []),
    ])
    return { catalog, articles }
  },
  // Le back-office sert de vraies traductions : changer de langue doit
  // recharger le contenu, pas seulement les libellés d'interface.
  { watch: [locale] },
)

const home = computed(() => data.value?.catalog.home ?? null)

/** Les articles du back-office l'emportent ; sinon, ceux de la maquette. */
const articles = computed(() => {
  const fetched = data.value?.articles ?? []
  return fetched.length > 0 ? fetched : fallbackArticles(t('home.news.placeholderTitle'))
})

/** Bandeau hero : visuel maquette (`pwa/assets/images/home-banner.png`), pas le slide API. */
const bannerSrc = '/img/home-banner.webp'

/**
 * Progression de l'orientation.
 *
 * Valeur de la maquette tant qu'aucune session n'existe. L'anneau est composé
 * des deux SVG fournis (fond + remplissage), comme dans `home.html`.
 */
const progress = 60

/** Menu latéral (`home-menu` de la maquette). */
const menuOpen = ref(false)

usePageSeo(() => ({
  title: home.value?.seo.title || t('home.seoTitle'),
  description: home.value?.seo.description || t('home.seoDescription'),
  image: home.value?.seo.image ?? null,
}))
</script>

<template>
  <!-- Mobile -->
  <div class="shell:hidden">
    <AppTopBar menu :gap="0" :notifications="3" @open-menu="menuOpen = true" />
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
            <!-- Anneau : les deux SVG de la maquette, superposés -->
            <div class="relative size-56 shrink-0">
              <QIcon name="ic-home-progress-bg" :size="56" class="absolute inset-0" />
              <QIcon name="ic-home-progress-fill" :size="56" class="absolute inset-0" />
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
                :to="localePath('/orientation')"
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

  <!-- Desktop ← `desktop-pages/index.vue` -->
  <div class="hidden shell:block">
    <DesktopHome />
  </div>
</template>
