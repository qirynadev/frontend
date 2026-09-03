<script lang="ts" setup>
import { computed, onBeforeMount } from "vue";
import { isImgLink } from "@/utils/is";
import router from "@/router";
import { i18nRoute } from "@/utils";
import { useHead } from "@unhead/vue";
import { useAppStore, useAuthStore, useJourneyStore, useArticleStore } from "@/stores";
import {
  AcademicCapIcon,
  ArrowRightIcon,
  PlayCircleIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ClockIcon,
  CheckIcon,
  BookmarkIcon,
} from "@heroicons/vue/24/outline";
import { BookmarkIcon as BookmarkIconSolid } from "@heroicons/vue/24/solid";
import ProfilageSection from "@/components/sections/ProfilageSection.vue";
import FichesEcolesSection from "@/components/sections/FichesEcolesSection.vue";
import HebergementSection from "@/components/sections/HebergementSection.vue";
import AccompagnementBand from "@/components/sections/AccompagnementBand.vue";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";
import { useSideBar } from "@/hooks/useSetting";
import mobileLogo from "@/assets/images/home-mobile/logo.png";
import mobileHeroBanner from "@/assets/images/home-mobile/hero-banner.png";
import mobileMountain from "@/assets/images/home-mobile/mountain.png";
import mobileArticleThumb from "@/assets/images/home-mobile/article-thumb.png";
import mobileIconMenu from "@/assets/images/home-mobile/icon-menu.svg";
import mobileIconBell from "@/assets/images/home-mobile/icon-bell.svg";
import mobileIconSchool from "@/assets/images/home-mobile/icon-school.svg";
import mobileIconArrowRed from "@/assets/images/home-mobile/icon-arrow-red.svg";
import mobileIconJob from "@/assets/images/home-mobile/icon-job.svg";
import mobileIconArrowPurple from "@/assets/images/home-mobile/icon-arrow-purple.svg";
import mobileIconHousing from "@/assets/images/home-mobile/icon-housing.svg";
import mobileIconArrowGreen from "@/assets/images/home-mobile/icon-arrow-green.svg";
import mobileIconLanguage from "@/assets/images/home-mobile/icon-language.svg";
import mobileIconArrowYellow from "@/assets/images/home-mobile/icon-arrow-yellow.svg";

const appStore = useAppStore();
const authStore = useAuthStore();
const journeyStore = useJourneyStore();
const articleStore = useArticleStore();
const { handleChangeSideBarState } = useSideBar();

// Anneau "Continuez votre parcours" : 0% tant que personne n'est connecté (aucune
// progression à suivre), sinon le vrai pourcentage du tunnel Profilage/Orientation
// (journeyStore.journeys.profilage, alimenté par /user/journey-progress).
const orientationProgress = computed(() => (authStore.token ? Math.round(journeyStore.journeys.profilage?.percent ?? 0) : 0));

const PROGRESS_RING_RADIUS = 25.5;
const PROGRESS_RING_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RING_RADIUS;
const progressRingOffset = computed(() => PROGRESS_RING_CIRCUMFERENCE * (1 - orientationProgress.value / 100));

const quickActions = [
  { key: "school", label: "home-mobile-quick-school", icon: mobileIconSchool, arrow: mobileIconArrowRed, bg: "#fff5f6" },
  { key: "job", label: "home-mobile-quick-job", icon: mobileIconJob, arrow: mobileIconArrowPurple, bg: "#f5f3ff" },
  { key: "housing", label: "home-mobile-quick-housing", icon: mobileIconHousing, arrow: mobileIconArrowGreen, bg: "#f0fdf4" },
  { key: "language", label: "home-mobile-quick-language", icon: mobileIconLanguage, arrow: mobileIconArrowYellow, bg: "#fffbeb" },
];

const homeData = computed<any>(() => appStore.homeData);
// Hero mobile : câblé sur HomePage.slides[0] (déjà exposé par /all-data pour le desktop),
// avec repli sur l'image statique tant que les données n'ont pas encore été chargées.
const heroSlide = computed<{ image?: string; description?: string; author?: string }>(
  () => homeData.value?.slides?.[0] ?? {},
);
const seo = computed<{
  logo: string;
  favicon: string;
  image: string;
  name: string;
  description: string;
}>(() => appStore.settings?.site);

onBeforeMount(async () => {
  await appStore.refreshData();
  await articleStore.fetchLatestArticles();
  if (authStore.token) {
    await authStore.fetchUnreadNotificationCount();
    await journeyStore.fetchJourneys();
  }
});

const toggleArticleBookmark = async (articleId: string) => {
  if (!authStore.token) {
    router.push(i18nRoute({ name: "signin", query: { redirect: router.currentRoute.value.fullPath } }));
    return;
  }
  await articleStore.toggleBookmark(articleId);
};

// Cartes actions rapides mobile : Logement/Cours exigent un slug de destination — pas de page
// générique, on réutilise la destination par défaut déjà employée ailleurs sur le site
// (cf. FichesEcolesSection.vue → goSchools()). Écoles passe par un écran de choix de destination
// dédié (plus de slug en dur).
const goToQuickAction = (key: string) => {
  if (key === "school") {
    router.push(i18nRoute({ name: "choose-destination" }));
  } else if (key === "job") {
    router.push(i18nRoute({ name: "profilage-landing" }));
  } else if (key === "housing") {
    router.push(i18nRoute({ name: "living-choose-destination" }));
  } else if (key === "language") {
    router.push(i18nRoute({ name: "choose-language" }));
  }
};

const handleDiscoverCourses = () => {
  const slug = (appStore.menuData?.courses as any)?.sub_menus?.[0]?.slug;
  router.push(
    slug
      ? i18nRoute({ name: "courses", params: { slug } })
      : i18nRoute({ name: "home" }),
  );
};

// ---- Languages Focus Section ----
const langFeatures = [
  { icon: ChatBubbleLeftRightIcon, title: "lang-feat1-title", desc: "lang-feat1-desc" },
  { icon: ShieldCheckIcon, title: "lang-feat2-title", desc: "lang-feat2-desc" },
  { icon: ChartBarIcon, title: "lang-feat3-title", desc: "lang-feat3-desc" },
  { icon: ClockIcon, title: "lang-feat4-title", desc: "lang-feat4-desc" },
];

const langWhyFeatures = [
  "lang-why-feat1",
  "lang-why-feat2",
  "lang-why-feat3",
  "lang-why-feat4",
];

// Circular flag SVGs rendered inline as background images (no external assets).
const flagSvg = (inner: string) =>
  `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'><clipPath id='c'><circle cx='30' cy='30' r='30'/></clipPath><g clip-path='url(%23c)'>${inner}</g></svg>")`;

const availableLanguages = [
  { label: "lang-lang-en", flag: flagSvg("<rect width='60' height='60' fill='%23012169'/><path d='M0 0l60 60M60 0L0 60' stroke='%23fff' stroke-width='10'/><path d='M0 0l60 60M60 0L0 60' stroke='%23C8102E' stroke-width='5'/><path d='M30 0v60M0 30h60' stroke='%23fff' stroke-width='16'/><path d='M30 0v60M0 30h60' stroke='%23C8102E' stroke-width='9'/>") },
  { label: "lang-lang-de", flag: flagSvg("<rect width='60' height='20' y='0' fill='%23000'/><rect width='60' height='20' y='20' fill='%23DD0000'/><rect width='60' height='20' y='40' fill='%23FFCE00'/>") },
  { label: "lang-lang-es", flag: flagSvg("<rect width='60' height='60' fill='%23AA151B'/><rect width='60' height='30' y='15' fill='%23F1BF00'/>") },
  { label: "lang-lang-fr", flag: flagSvg("<rect width='20' height='60' x='0' fill='%23002395'/><rect width='20' height='60' x='20' fill='%23fff'/><rect width='20' height='60' x='40' fill='%23ED2939'/>") },
  { label: "lang-lang-ar", flag: flagSvg("<rect width='60' height='60' fill='%23006233'/><circle cx='30' cy='30' r='9' fill='none' stroke='%23fff' stroke-width='2.5'/>") },
  { label: "lang-lang-more", flag: flagSvg("<rect width='60' height='60' fill='%23EEF1F6'/><g fill='none' stroke='%237A859B' stroke-width='2'><circle cx='30' cy='30' r='20'/><ellipse cx='30' cy='30' rx='9' ry='20'/><path d='M11 24h38M11 36h38'/></g>") },
];

const langBubbles = [
  { text: "Hello", cls: "top-[14%] right-[18%]" },
  { text: "Hallo", cls: "top-[34%] left-[2%]" },
  { text: "Salut", cls: "top-[40%] right-[4%]" },
  { text: "Hola", cls: "top-[56%] left-[8%]" },
  { text: "مرحبا", cls: "top-[62%] right-[8%]" },
];

useHead({
  title: () => seo.value?.name || "Qiryna",
  meta: [
    { name: "description", content: () => seo.value?.description ?? "Qiryna" },
    { property: "og:title", content: () => seo.value?.name },
    { property: "og:description", content: () => seo.value?.description },
    { property: "og:image", content: () => seo.value?.image },
    { property: "og:url", content: () => location.href },
    { property: "og:site_name", content: () => seo.value?.name },
    { property: "og:type", content: () => "website" },
  ],
});
</script>

<template>
  <div class="p-0 position-relative h-full">
    <!-- ═══════════════════════════════════════════
         MOBILE — Figma "home page" (< lg)
    ═══════════════════════════════════════════ -->
    <div class="flex w-full flex-col items-center overflow-x-hidden bg-surface pb-26 lg:hidden">
      <div class="flex w-full flex-col items-center px-4 pb-6 pt-4">
        <!-- Top bar -->
        <div class="flex w-full items-center justify-between">
          <button
            type="button"
            class="flex size-[1.90625rem] items-center justify-center"
            aria-label="Menu"
            @click="handleChangeSideBarState()"
          >
            <img :src="mobileIconMenu" class="size-full" alt="" />
          </button>
          <div class="relative h-[2.8125rem] w-[9.0625rem] overflow-hidden">
            <img
              :src="mobileLogo"
              alt="Qiryna"
              class="absolute left-[-4.88%] top-[-63.5%] h-[251.38%] w-[117.84%] max-w-none"
            />
          </div>
          <RouterLink
            v-if="authStore.token"
            :to="i18nRoute({ name: 'user-notifications' })"
            class="relative flex size-[3.0625rem] flex-col items-center justify-center no-underline"
          >
            <img :src="mobileIconBell" class="size-[1.5625rem]" alt="" />
            <span
              v-if="authStore.unreadNotificationCount > 0"
              class="absolute left-[1.5rem] top-[0.25rem] flex items-center justify-center rounded-full bg-[#ee163e] px-[0.375rem] py-[0.0625rem] text-xs font-medium text-white"
            >
              {{ authStore.unreadNotificationCount }}
            </span>
          </RouterLink>
          <div v-else class="size-[3.0625rem]"></div>
        </div>

        <!-- Hero banner -->
        <div class="w-full pt-[1.875rem]">
          <div class="relative aspect-[1819/865] w-full overflow-hidden rounded-lg">
            <img :src="heroSlide.image || mobileHeroBanner" class="size-full object-cover" alt="" />
            <div
              v-if="heroSlide.description"
              class="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-4"
            >
              <p class="text-sm font-medium italic leading-5 text-white">
                <span class="align-top text-lg not-italic leading-none text-white/70">&ldquo;</span>{{ heroSlide.description
                }}<span class="align-bottom text-lg not-italic leading-none text-white/70">&rdquo;</span>
              </p>
              <p v-if="heroSlide.author" class="mt-2 text-xs font-semibold text-white/90">
                {{ heroSlide.author }}
              </p>
            </div>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="flex w-full items-stretch gap-3 pt-[1.375rem]">
          <button
            v-for="action in quickActions"
            :key="action.key"
            type="button"
            class="flex flex-1 flex-col items-center rounded-[0.625rem] p-4"
            :style="{ backgroundColor: action.bg }"
            @click="goToQuickAction(action.key)"
          >
            <div class="flex size-12 items-center justify-center rounded-full pb-[0.5625rem]">
              <img :src="action.icon" class="size-6" alt="" />
            </div>
            <p class="text-center text-[0.6875rem] font-medium leading-[0.859375rem] text-ink">
              {{ $t(action.label) }}
            </p>
            <img :src="action.arrow" class="mt-auto size-9 pt-4" alt="" />
          </button>
        </div>

        <!-- Continuez votre parcours -->
        <div class="w-full pt-8">
          <p class="text-lg font-semibold leading-7 tracking-[-0.028125rem] text-ink">
            {{ $t("home-mobile-continue-title") }}
          </p>
          <div
            class="relative mt-[0.625rem] flex w-full items-start overflow-hidden rounded-[0.625rem] bg-[#fef4f5] p-5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
          >
            <div class="relative z-[1] flex flex-1 items-start gap-4">
              <div class="relative size-14 shrink-0">
                <svg viewBox="0 0 56 56" class="size-full -rotate-90">
                  <circle cx="28" cy="28" r="25.5" fill="none" stroke="#FCE3E6" stroke-width="5" />
                  <circle
                    cx="28"
                    cy="28"
                    r="25.5"
                    fill="none"
                    stroke="#EF2344"
                    stroke-width="5"
                    stroke-linecap="round"
                    :stroke-dasharray="PROGRESS_RING_CIRCUMFERENCE"
                    :stroke-dashoffset="progressRingOffset"
                  />
                </svg>
                <p class="absolute inset-0 flex items-center justify-center text-sm font-medium text-[#ef2344]">
                  {{ orientationProgress }}%
                </p>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold leading-[1.203125rem] text-ink">
                  {{ $t("home-mobile-orientation-title") }}
                </p>
                <p
                  class="min-h-[3.3515625rem] w-[10.65625rem] pt-2 text-[0.6875rem] leading-[1.1171875rem] text-[#353f6b]"
                >
                  {{ $t("home-mobile-orientation-text") }}
                </p>
                <RouterLink
                  :to="
                    authStore.token
                      ? i18nRoute({ name: 'profilage' })
                      : i18nRoute({ name: 'signin', query: { redirect: router.resolve(i18nRoute({ name: 'profilage' })).fullPath } })
                  "
                  class="mt-[0.625rem] inline-flex items-center justify-center rounded-[0.5rem] bg-[#ff1f3f] px-[0.8125rem] py-2 no-underline"
                >
                  <span class="text-xs font-semibold text-white">{{ $t("continue-with-prefix") }}</span>
                </RouterLink>
              </div>
            </div>
            <img
              :src="mobileMountain"
              class="absolute right-0 top-[1.25rem] h-[9.625rem] w-[14.4375rem] object-cover"
              alt=""
            />
          </div>
        </div>

        <!-- Nouveautés & conseils : articles publiés (backoffice > CMS > Articles) -->
        <div v-if="articleStore.latestArticles.length" class="w-full pt-8">
          <p class="text-lg font-semibold leading-7 tracking-[-0.028125rem] text-ink">
            {{ $t("home-mobile-news-title") }}
          </p>
          <div class="mt-[0.6875rem] flex w-full gap-4 overflow-x-auto pb-4">
            <div
              v-for="article in articleStore.latestArticles"
              :key="article.id"
              class="flex w-[20.125rem] shrink-0 items-center gap-4 rounded-[0.625rem] bg-surface p-[0.375rem] shadow-[0_0_0.21875rem_rgba(0,0,0,0.1)]"
            >
              <div class="size-24 shrink-0 overflow-hidden rounded-md">
                <img :src="article.image ?? mobileArticleThumb" class="size-full object-cover" alt="" />
              </div>
              <div class="min-w-0 flex-1 pt-4">
                <div class="flex items-center gap-2">
                  <span
                    class="rounded-full bg-[#f1effd] px-2 py-0.5 text-[0.5625rem] font-medium tracking-[0.028125rem] text-[#4c29f3]"
                  >
                    {{ $t(`home-mobile-article-category-${article.category}`) }}
                  </span>
                  <span class="truncate text-[0.625rem] font-medium text-ink"
                    >• {{ $t("home-mobile-article-read-time", { minutes: article.read_time_minutes }) }}</span
                  >
                </div>
                <p class="pt-[0.625rem] text-xs font-medium leading-5 text-ink">
                  {{ article.title }}
                </p>
              </div>
              <button
                type="button"
                class="flex size-[1.125rem] flex-none items-center justify-center self-center"
                :aria-label="$t(article.is_bookmarked ? 'home-mobile-article-unbookmark' : 'home-mobile-article-bookmark')"
                @click="toggleArticleBookmark(article.id)"
              >
                <BookmarkIconSolid v-if="article.is_bookmarked" class="size-full text-[#4c29f3]" />
                <BookmarkIcon v-else class="size-full text-ink-muted" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom tab bar -->
      <MobileAppBottomNav active="orientation" :special-orientation-icon="true" />
    </div>

    <!-- ═══════════════════════════════════════════
         DESKTOP — page marketing existante (≥ lg)
    ═══════════════════════════════════════════ -->
    <div class="hidden lg:block">
    <!-- Header -->
    <div class="z-0 w-full h-[460px] lg:bg-surface lg:mt-12 overflow-hidden relative">
      <!-- Image fixe du Hero (carrousel désactivé — affichage d'une seule image) -->
      <template v-if="homeData?.slides?.[0]">
        <img
          v-if="isImgLink(homeData.slides[0].image)"
          :src="homeData.slides[0].image"
          class="absolute bottom-0 left-0 w-full h-[460px] object-cover"
          alt=""
        />
        <video
          v-else
          :src="homeData.slides[0].image"
          class="absolute bottom-0 left-0 w-full h-[460px] object-cover"
          autoplay
          loop
          muted
        />
      </template>
    </div>
    <!-- End header -->

    <!-- Bottom header -->
    <div class="-mt-20 h-[200px] z-10 relative hidden lg:block">
      <div
        class="global-container h-full divide-x divide-[#c0c0c038] grid grid-cols-1 lg:grid-cols-3 shadow-[1px_1px_12px_#5555553b] rounded-md bg-surface p-3"
      >
        <div
          v-for="(information, index) in homeData?.steps"
          :key="index"
          class="header-bottom-card w-full px-[10px] flex flex-col items-center justify-center"
        >
          <img class="w-[111.58px] h-[90px] mt-2" :src="information.image" />
          <h3 style="font-size: 16px" class="text-uppercase gap-1 flex items-center">
            <img src="@/assets/images/num1.png" class="w-[50px] h-[25px]" />
            <div class="font-bold uppercase text-[16px]">
              {{ information.title }}
            </div>
          </h3>
          <p class="text-center text-[14px] py-[5px]" v-html="information.description"></p>
        </div>
      </div>
    </div>
    <!-- End Bottom header -->

    <!-- Fiches Écoles Section -->
    <FichesEcolesSection />

    <!-- Languages Focus Section — full width -->
    <div class="mt-10 mb-12 w-full">
      <div class="global-container">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.02fr_0.78fr] gap-10 lg:gap-6 items-start">

        <!-- LEFT: Info & CTAs -->
        <section class="flex flex-col min-w-0">
          <span class="inline-block w-fit rounded-lg bg-[#FCE6E8] px-4 py-2 text-[13px] font-semibold tracking-[0.06em] text-[#ED2530] mb-6">
            {{ $t("lang-badge") }}
          </span>

          <h2 class="text-[28px] lg:text-[36px] font-bold leading-[1.1] tracking-[-0.015em] text-ink mb-5">
            {{ $t("lang-title-line1") }}<br />
            <span class="text-[#ED2530]">{{ $t("lang-title-line2") }}</span>
          </h2>

          <p class="text-[16px] lg:text-[18px] leading-[1.65] text-[#5B6275] max-w-[600px] mb-9">
            {{ $t("lang-description") }}
          </p>

          <!-- Features 2x2 -->
          <div class="grid grid-cols-2 gap-5 mb-9">
            <div v-for="feat in langFeatures" :key="feat.title" class="flex flex-col">
              <div class="flex h-[54px] w-[54px] items-center justify-center rounded-[14px] bg-[#FDEEEF] mb-4">
                <component :is="feat.icon" class="h-6 w-6 text-[#ED2530]" />
              </div>
              <h3 class="text-[15px] font-semibold text-ink leading-tight mb-2">{{ $t(feat.title) }}</h3>
              <p class="text-[13px] leading-[1.55] text-[#5B6275]">{{ $t(feat.desc) }}</p>
            </div>
          </div>

          <!-- CTAs -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-9">
            <button
              type="button"
              @click="handleDiscoverCourses"
              class="inline-flex items-center justify-center gap-3.5 rounded-xl bg-[#ED2530] px-7 py-4 text-[16px] font-semibold text-white shadow-[0_12px_26px_-10px_rgba(237,37,48,.55)] hover:bg-[#D81E29] hover:-translate-y-0.5 transition-all w-fit"
            >
              {{ $t("lang-discover-btn") }}
              <ArrowRightIcon class="h-5 w-5" />
            </button>
            <button class="inline-flex items-center gap-3.5 text-[15px] font-semibold text-ink w-fit group">
              <span class="flex h-[42px] w-[42px] items-center justify-center rounded-full border-[1.5px] border-[#ED2530]/35 group-hover:bg-[#FDEEEF] transition-colors">
                <PlayCircleIcon class="h-6 w-6 text-[#ED2530]" />
              </span>
              {{ $t("lang-watch-btn") }}
            </button>
          </div>
        </section>

        <!-- CENTER: Visual stage -->
        <section class="relative flex justify-center items-center self-center min-w-0 min-h-[400px] lg:min-h-[480px]">
          <!-- Halo -->
          <div
            class="absolute top-[6%] left-1/2 -translate-x-1/2 h-[340px] w-[340px] lg:h-[380px] lg:w-[380px] rounded-full z-0"
            style="background: radial-gradient(circle at 50% 45%, #FBDCDE 0%, #FCE9EA 45%, rgba(252,233,234,0) 72%);"
          ></div>

          <!-- Photo placeholder -->
          <div class="relative z-[2] h-[400px] w-[280px] lg:h-[440px] lg:w-[300px] rounded-[20px] bg-gradient-to-b from-[#FBDCDE] to-[#FDEEEF] flex flex-col items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ED2530" class="h-14 w-14 opacity-50" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>
            <span class="text-[12px] font-medium text-ink/40">Photo</span>
          </div>

          <!-- Sparks above head -->
          <div class="absolute z-[3] top-[14%] left-1/2 -translate-x-[130px]">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" class="h-12 w-12 lg:h-[60px] lg:w-[60px] stroke-[#ED2530]"><path d="M6 14L4 19M12 12l-1 6M18 14l3 4"/></svg>
          </div>

          <!-- Speech bubbles -->
          <div
            v-for="bubble in langBubbles"
            :key="bubble.text"
            :class="bubble.cls"
            class="absolute z-[3] bg-surface text-[#ED2530] font-semibold text-[16px] lg:text-[21px] px-4 lg:px-[22px] py-2 lg:py-3 rounded-2xl shadow-[0_14px_30px_-12px_rgba(16,26,61,.22)] after:content-[''] after:absolute after:-bottom-2 after:left-6 after:h-[18px] after:w-[18px] after:bg-surface after:rotate-45 after:rounded-br"
          >
            {{ bubble.text }}
          </div>
        </section>

        <!-- RIGHT: Languages + Why cards -->
        <section class="flex flex-col gap-5 min-w-0">
          <!-- Languages card -->
          <div class="rounded-[22px] border border-[#ECE9EF] bg-surface p-7 shadow-[0_24px_50px_-28px_rgba(16,26,61,.18)]">
            <h4 class="text-[18px] font-semibold text-ink mb-5">{{ $t("lang-langs-title") }}</h4>
            <div class="grid grid-cols-2 gap-x-6 gap-y-4">
              <div v-for="lang in availableLanguages" :key="lang.label" class="flex items-center gap-3 text-[15px] font-medium text-ink">
                <span
                  class="h-[30px] w-[30px] shrink-0 rounded-full bg-cover bg-center shadow-[0_0_0_1px_rgba(16,26,61,.06)]"
                  :style="{ backgroundImage: lang.flag }"
                ></span>
                {{ $t(lang.label) }}
              </div>
            </div>
          </div>

          <!-- Why card (navy) -->
          <div class="rounded-[22px] bg-[#1B2447] p-7 text-white shadow-[0_30px_60px_-30px_rgba(16,26,61,.5)]">
            <h4 class="text-[19px] font-semibold mb-5">{{ $t("lang-why-title") }}</h4>
            <ul class="flex flex-col gap-[18px] mb-6">
              <li v-for="feat in langWhyFeatures" :key="feat" class="flex gap-3 text-[14px] leading-[1.45] text-[#E8EAF2]">
                <span class="mt-[1px] flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#ED2530]">
                  <CheckIcon class="h-3 w-3 stroke-[3] text-white" />
                </span>
                {{ $t(feat) }}
              </li>
            </ul>

            <!-- Teachers banner -->
            <div class="flex items-center gap-4 rounded-2xl bg-[#FDEEEF] px-4 py-3.5">
              <div class="flex">
                <span
                  v-for="n in 3"
                  :key="n"
                  class="flex h-[42px] w-[42px] items-center justify-center rounded-full border-[2.5px] border-[#FDEEEF] bg-gradient-to-br from-slate-300 to-slate-400"
                  :class="n > 1 ? '-ml-3' : ''"
                >
                  <AcademicCapIcon class="h-5 w-5 text-white/80" />
                </span>
              </div>
              <p class="text-[14px] leading-[1.35] text-ink">
                <b class="font-semibold">{{ $t("lang-teachers-count") }}</b><br />
                {{ $t("lang-teachers-sub") }}
              </p>
            </div>
          </div>
        </section>

      </div>
      </div>
    </div>
    <!-- End Languages Focus Section -->

    <!-- Hébergement Section + frise d'accompagnement -->
    <HebergementSection />
    <AccompagnementBand />

    <!-- Profilage Section -->
    <ProfilageSection />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@media screen and (min-width: 768px) {
  .global-container {
    margin-bottom: 5px;
  }
}
</style>
