<script lang="ts" setup>
import BannerRotator from "@/components/atoms/BannerRotator.vue";
import { TagLoaderVue } from "@/components/atoms/loaders";
import SchoolCard from "@/components/molecules/SchoolCard.vue";
import { useAppStore, useAuthStore, useSchoolStore } from "@/stores";
import { computed, onBeforeMount, ref, watch, type ComputedRef, type Ref } from "vue";
import type { AreaType, OfferType, PaginatedData, SchoolType } from "@/constants/constant.type";
import router from "@/router";
import { useRoute } from "vue-router";
import { i18nRoute } from "@/utils";
import { isNumeric } from "@/utils/string";
import { Carousel, Slide } from "vue3-carousel";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/solid";
import Pagination from "@/components/molecules/Pagination.vue?inline";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";
import mobileLogo from "@/assets/images/destination-choice-mobile/logo.png";
import mobileIconBack from "@/assets/images/destination-choice-mobile/icon-back.svg";
import mobileIconBell from "@/assets/images/destination-choice-mobile/icon-bell.svg";
import mobileIconPayment from "@/assets/images/destination-choice-mobile/icon-payment.svg";
import mobileIconSupport from "@/assets/images/destination-choice-mobile/icon-support.svg";
import mobileIconSatisfaction from "@/assets/images/destination-choice-mobile/icon-satisfaction.svg";
import calendarIcon from "@/assets/images/areas-schools-mobile/calendar-icon.svg";
import studentCountIcon from "@/assets/images/areas-schools-mobile/student-count-icon.svg";
import { useI18n } from "vue-i18n";

const schoolStore = useSchoolStore();
const appStore = useAppStore();
const authStore = useAuthStore();
const route = useRoute();
const { locale } = useI18n();

const formatStudentCount = (count: number) => new Intl.NumberFormat(locale.value === "en" ? "en-US" : "fr-FR").format(count);

const isFetching = ref<boolean>(false);
const selectedOffer = computed<OfferType | null>(() => schoolStore.selectedOffer);
const areaList = computed<AreaType[]>(() => schoolStore.areaList);
const paginatedSchools = computed<PaginatedData>(() => schoolStore.paginatedSchools);
const selectedMenuSlug = computed<string | null>(
  () => appStore.selectedMenuSlug ?? (route.params.slug as string) ?? null,
);

// Filet de sécurité pour les liens du carrousel de zones : évite un crash "Missing required param"
// si ce composant re-rend une dernière fois pendant une transition de route (ex: navigation rapide
// vers une autre page pendant que l'autoplay du carrousel est encore en cours), moment où
// selectedMenuSlug peut momentanément retomber à null.
const carouselAreaSlug = computed<string>(() => selectedMenuSlug.value || "france");

// Bloc mobile (capture d'écran, cf. handoff) : nom du pays + favoris décoratifs (pas de
// fonctionnalité "favoris" en base côté schools — état local uniquement, non persisté).
const selectedSheet = computed(() => schoolStore.selectedSheet);
const countryName = computed(() => selectedSheet.value?.country?.name ?? "");
const favoriteSchoolIds = ref<Set<string>>(new Set());
const toggleFavorite = (school: SchoolType) => {
  const id = getSchoolSlug(school);
  if (!id) return;
  if (favoriteSchoolIds.value.has(id)) favoriteSchoolIds.value.delete(id);
  else favoriteSchoolIds.value.add(id);
};

const isFirstLoad = ref(true);

const fetchData = async (url: string | null = null) => {
  isFetching.value = true;
  await schoolStore.fetchPaginatedSchoolsByArea(url);
  isFetching.value = false;
  isFirstLoad.value = false;
};

// Pagination mobile (Figma) : boutons carrés arrondis + précédent/suivant, distincts du
// composant <Pagination> partagé (cercles rouges, sans précédent/suivant) pour ne pas
// changer son style ailleurs sur le site.
const numericPageLinks = computed(() => paginatedSchools.value?.links?.filter((l) => isNumeric(l.label)) ?? []);
const prevPageLink = computed(() => paginatedSchools.value?.links?.[0] ?? null);
const nextPageLink = computed(() => {
  const links = paginatedSchools.value?.links ?? [];
  return links[links.length - 1] ?? null;
});

// Défilement des pills de domaines côté mobile (conteneur natif overflow-x-auto, pas le
// <Carousel> desktop — celui-ci n'est pas monté sur mobile donc carousel.value y est null).
const areaPillsRef = ref<HTMLElement | null>(null);
const scrollAreaPills = () => {
  areaPillsRef.value?.scrollBy({ left: 180, behavior: "smooth" });
};

const handleClickArea = async (area: AreaType) => {
  schoolStore.selectedArea = area;
  schoolStore.selectedOffer = area?.offer;
};

const carousel: Ref<any | null> = ref(null);
const currentSlide = ref<number>(0);

const next = () => carousel.value?.next();
const prev = () => carousel.value?.prev();

const handleClickSchool = (school: SchoolType) => {
  schoolStore.selectedSchool = school;
};

const getSchoolSlug = (school: SchoolType) => {
  return school?.slug || school?.id || null;
};

const getAreaSlug = () => {
  return selectedOffer.value?.slug || (route.params.areaslug as string) || null;
};

const canShowSchoolLink = (school: SchoolType) => {
  return !!(selectedMenuSlug.value && getAreaSlug() && getSchoolSlug(school));
};

onBeforeMount(async () => {
  // 1. Charger la fiche destination si manquante (cas du refresh)
  if (!schoolStore.selectedSheet && route.params.slug) {
    await schoolStore.getSchoolSheetBySlug(route.params.slug as string);
  }

  // 2. Initialiser le domaine d'étude à partir de l'URL si manquant
  if (!schoolStore.selectedArea && route.params.areaslug) {
    const area = schoolStore.areaList.find((a) => a.slug === route.params.areaslug);
    if (area) {
      schoolStore.selectedArea = area;
      schoolStore.selectedOffer = area.offer;
    }
  }

  await fetchData();
  if (authStore.token) await authStore.fetchUnreadNotificationCount();
});

watch(
  () => route.params.areaslug,
  (newSlug) => {
    if (!newSlug || isFirstLoad.value) return;
    const area = areaList.value.find((a) => a.slug === newSlug);
    if (area) {
      schoolStore.selectedArea = area;
      schoolStore.selectedOffer = area.offer;
    }
    fetchData();
  },
);

const breakPoints = {
  1024: {
    itemsToShow: 4,
    snapAlign: "start",
    spaceBetween: 1,
  },
  768: {
    itemsToShow: 4,
    snapAlign: "start",
    spaceBetween: 1,
  },
  320: {
    itemsToShow: 2,
    snapAlign: "center",
  },
};
</script>

<template>
  <!-- ═══════════════════════════════════════════
       MOBILE — écran "Liste des écoles" (< lg)
       Corrigé via get_design_context (node Figma 524-2). "Année de création"/
       "X étudiants" : champs ajoutés côté back-office (schools.founded_year/
       student_count, migration 2026_08_03_124200) — nullable, donc masqués tant
       qu'un admin ne les a pas renseignés pour l'école concernée.
  ═══════════════════════════════════════════ -->
  <div class="flex w-full flex-col items-center overflow-x-hidden bg-surface pb-26 lg:hidden">
    <div class="flex w-full flex-col items-center px-4 pb-6 pt-4">
      <!-- Top bar -->
      <div class="flex w-full items-center justify-between pb-[1.875rem]">
        <button type="button" class="flex size-6 items-center justify-center" aria-label="Retour" @click="router.back()">
          <img :src="mobileIconBack" class="size-full" alt="" />
        </button>
        <div class="relative h-[2.8125rem] w-[9.0625rem] overflow-hidden">
          <img
            :src="mobileLogo"
            alt="Qiryna"
            class="absolute left-[-4.88%] top-[-63.5%] h-[251.38%] w-[117.84%] max-w-none"
          />
        </div>
        <RouterLink
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
      </div>

      <!-- Area pills -->
      <div class="flex w-full items-center gap-2">
        <div
          ref="areaPillsRef"
          class="flex min-w-0 flex-1 gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <RouterLink
            v-for="area in areaList"
            :key="area.id"
            :to="i18nRoute({ name: 'schools', params: { slug: carouselAreaSlug, areaslug: area.slug || 'all' } })"
            class="flex shrink-0 items-center gap-2 rounded-[0.625rem] border bg-surface px-4 py-3 shadow-[0_0_0.21875rem_rgba(0,0,0,0.1)] no-underline"
            :class="selectedOffer?.area?.id === area.id ? 'border-[#8873fe] bg-[#f8f8fd]' : 'border-transparent'"
            @click="handleClickArea(area)"
          >
            <img v-if="area.icon" :src="area.icon" :alt="area.title" class="size-5 flex-none" />
            <span class="whitespace-nowrap text-sm font-semibold text-ink">{{ area.title }}</span>
          </RouterLink>
        </div>
        <button
          type="button"
          class="flex size-6 flex-none items-center justify-center rounded-full bg-surface text-[#5a6387] shadow-[0_0_0.21875rem_rgba(0,0,0,0.1)]"
          aria-label="Suivant"
          @click="scrollAreaPills"
        >
          <ChevronRightIcon class="size-2.5" />
        </button>
      </div>
      <div v-if="areaList.length" class="flex w-full items-center justify-center gap-1 pt-3">
        <span
          v-for="area in areaList"
          :key="area.id"
          class="size-[0.375rem] rounded-full"
          :class="selectedOffer?.area?.id === area.id ? 'bg-[#582cfd]' : 'bg-[#e6e5f2]'"
        ></span>
      </div>

      <!-- Heading -->
      <div class="w-full pt-[1.5625rem]">
        <p class="text-sm font-semibold tracking-[0.0375rem] text-ink">
          {{ $t("schools-mobile-heading", { area: selectedOffer?.area?.title ?? "", country: countryName }) }}
        </p>
        <p v-if="paginatedSchools.total" class="pt-1 text-xs font-medium text-ink">
          {{ paginatedSchools.total }}+ {{ $t("schools-mobile-count-suffix") }}
        </p>
      </div>

      <!-- School list -->
      <div class="w-full pt-4">
        <div v-if="isFetching" class="flex flex-col gap-3">
          <div v-for="i in 5" :key="i" class="h-[7.5rem] animate-pulse rounded-[0.625rem] bg-surface-alt"></div>
        </div>
        <div v-else class="flex flex-col gap-3">
          <div
            v-for="school in paginatedSchools.data"
            :key="school.id || school.title"
            class="relative flex items-center gap-3 rounded-[0.625rem] bg-surface p-[0.625rem] shadow-[0_0_0.21875rem_rgba(0,0,0,0.1)]"
          >
            <RouterLink
              v-if="canShowSchoolLink(school)"
              :to="
                i18nRoute({
                  name: 'school-presentation',
                  params: { slug: selectedMenuSlug, areaslug: getAreaSlug(), schoolslug: getSchoolSlug(school) },
                })
              "
              class="flex min-w-0 flex-1 items-center gap-3 no-underline"
              @click="handleClickSchool(school)"
            >
              <div class="flex size-16 flex-none items-center justify-center overflow-hidden rounded-md border border-[#e6e5f2]">
                <img :src="school?.logo" class="size-full object-contain p-1" alt="" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-bold text-ink">{{ school?.title }}</p>
                <p class="truncate pt-1 text-xs text-[#5a6387]">{{ school?.city }}<span v-if="school?.city && school?.country?.name">, </span>{{ school?.country?.name }}</p>
                <div v-if="school?.founded_year || school?.student_count" class="flex items-center gap-2.5 pt-1.5">
                  <span v-if="school?.founded_year" class="flex items-center gap-1">
                    <img :src="calendarIcon" class="h-[0.875rem] w-[0.643rem]" alt="" />
                    <span class="whitespace-nowrap text-[0.5rem] text-ink">
                      {{ $t("schools-mobile-founded-year", { year: school.founded_year }) }}
                    </span>
                  </span>
                  <span v-if="school?.student_count" class="flex items-center gap-1">
                    <img :src="studentCountIcon" class="h-[0.44375rem] w-[0.489rem]" alt="" />
                    <span class="whitespace-nowrap text-[0.5rem] text-ink">
                      {{ $t("schools-mobile-student-count", { count: formatStudentCount(school.student_count) }) }}
                    </span>
                  </span>
                </div>
              </div>
              <div v-if="school?.image" class="relative size-16 flex-none">
                <img :src="school.image" class="size-full overflow-hidden rounded-md object-cover" alt="" />
                <!-- Favori : décoratif, pas de fonctionnalité "favoris" en base pour les écoles -->
                <button
                  type="button"
                  class="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-surface shadow-[0_0_0.21875rem_rgba(0,0,0,0.15)]"
                  :aria-label="favoriteSchoolIds.has(getSchoolSlug(school) ?? '') ? 'Retirer des favoris' : 'Ajouter aux favoris'"
                  @click.stop.prevent="toggleFavorite(school)"
                >
                  <svg
                    viewBox="0 0 24 24"
                    :fill="favoriteSchoolIds.has(getSchoolSlug(school) ?? '') ? '#f7344e' : 'none'"
                    :stroke="favoriteSchoolIds.has(getSchoolSlug(school) ?? '') ? '#f7344e' : '#191919'"
                    stroke-width="1.4"
                    class="size-[0.5625rem]"
                  >
                    <path
                      d="M12 21s-6.7-4.35-9.3-8.1C1 10.3 1.6 6.9 4.4 5.3c2.2-1.3 4.9-.7 6.4 1.2l1.2 1.5 1.2-1.5c1.5-1.9 4.2-2.5 6.4-1.2 2.8 1.6 3.4 5 1.7 7.6C18.7 16.65 12 21 12 21z"
                    ></path>
                  </svg>
                </button>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="#191919" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 flex-none">
                <path d="m9 6 6 6-6 6"></path>
              </svg>
            </RouterLink>
            <div v-else class="flex min-w-0 flex-1 items-center gap-3">
              <div class="flex size-16 flex-none items-center justify-center overflow-hidden rounded-md border border-[#e6e5f2]">
                <img :src="school?.logo" class="size-full object-contain p-1" alt="" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-bold text-ink">{{ school?.title }}</p>
                <p class="truncate pt-1 text-xs text-[#5a6387]">{{ school?.city }}<span v-if="school?.city && school?.country?.name">, </span>{{ school?.country?.name }}</p>
                <div v-if="school?.founded_year || school?.student_count" class="flex items-center gap-2.5 pt-1.5">
                  <span v-if="school?.founded_year" class="flex items-center gap-1">
                    <img :src="calendarIcon" class="h-[0.875rem] w-[0.643rem]" alt="" />
                    <span class="whitespace-nowrap text-[0.5rem] text-ink">
                      {{ $t("schools-mobile-founded-year", { year: school.founded_year }) }}
                    </span>
                  </span>
                  <span v-if="school?.student_count" class="flex items-center gap-1">
                    <img :src="studentCountIcon" class="h-[0.44375rem] w-[0.489rem]" alt="" />
                    <span class="whitespace-nowrap text-[0.5rem] text-ink">
                      {{ $t("schools-mobile-student-count", { count: formatStudentCount(school.student_count) }) }}
                    </span>
                  </span>
                </div>
              </div>
              <div v-if="school?.image" class="relative size-16 flex-none">
                <img :src="school.image" class="size-full overflow-hidden rounded-md object-cover" alt="" />
                <button
                  type="button"
                  class="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-surface shadow-[0_0_0.21875rem_rgba(0,0,0,0.15)]"
                  :aria-label="favoriteSchoolIds.has(getSchoolSlug(school) ?? '') ? 'Retirer des favoris' : 'Ajouter aux favoris'"
                  @click.stop.prevent="toggleFavorite(school)"
                >
                  <svg
                    viewBox="0 0 24 24"
                    :fill="favoriteSchoolIds.has(getSchoolSlug(school) ?? '') ? '#f7344e' : 'none'"
                    :stroke="favoriteSchoolIds.has(getSchoolSlug(school) ?? '') ? '#f7344e' : '#191919'"
                    stroke-width="1.4"
                    class="size-[0.5625rem]"
                  >
                    <path
                      d="M12 21s-6.7-4.35-9.3-8.1C1 10.3 1.6 6.9 4.4 5.3c2.2-1.3 4.9-.7 6.4 1.2l1.2 1.5 1.2-1.5c1.5-1.9 4.2-2.5 6.4-1.2 2.8 1.6 3.4 5 1.7 7.6C18.7 16.65 12 21 12 21z"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="!isFetching && paginatedSchools.data?.length > 0 && paginatedSchools.total > 5"
          class="flex items-center justify-center gap-2 pt-4"
        >
          <button
            type="button"
            class="flex size-[1.875rem] items-center justify-center rounded-[0.4375rem] bg-surface shadow-[0_0_0.125rem_rgba(0,0,0,0.1)] disabled:opacity-40"
            :disabled="!prevPageLink?.url"
            aria-label="Précédent"
            @click="fetchData(prevPageLink.url)"
          >
            <ChevronLeftIcon class="size-3 text-ink" />
          </button>
          <button
            v-for="page in numericPageLinks"
            :key="page.label"
            type="button"
            class="flex size-[1.875rem] items-center justify-center rounded-[0.4375rem] text-sm font-medium shadow-[0_0_0.125rem_rgba(0,0,0,0.1)]"
            :class="page.active ? 'bg-[#7e57fd] text-white' : 'bg-surface text-ink'"
            @click="fetchData(page.url)"
          >
            {{ page.label }}
          </button>
          <button
            type="button"
            class="flex size-[1.875rem] items-center justify-center rounded-[0.4375rem] bg-surface shadow-[0_0_0.125rem_rgba(0,0,0,0.1)] disabled:opacity-40"
            :disabled="!nextPageLink?.url"
            aria-label="Suivant"
            @click="fetchData(nextPageLink.url)"
          >
            <ChevronRightIcon class="size-3 text-ink" />
          </button>
        </div>
      </div>

      <!-- Trust badges -->
      <div
        class="mt-6 flex w-full items-center justify-center gap-2 rounded-[0.625rem] border border-border-default bg-surface-alt py-[0.6875rem]"
      >
        <div class="flex flex-col items-center gap-[0.375rem] px-1">
          <img :src="mobileIconPayment" class="size-10" alt="" />
          <p class="text-center text-[0.6875rem] font-semibold leading-[0.8203125rem] text-ink">
            {{ $t("trust-payment") }}
          </p>
        </div>
        <div class="h-[3.25rem] w-px bg-[#e4e7f0]"></div>
        <div class="flex flex-col items-center gap-[0.375rem] px-1">
          <img :src="mobileIconSupport" class="size-10" alt="" />
          <p class="text-center text-[0.6875rem] font-semibold leading-[0.8203125rem] text-ink">
            {{ $t("trust-support") }}
          </p>
        </div>
        <div class="h-[3.25rem] w-px bg-[#e4e7f0]"></div>
        <div class="flex flex-col items-center gap-[0.375rem] px-1">
          <img :src="mobileIconSatisfaction" class="size-10" alt="" />
          <p class="text-center text-[0.6875rem] font-semibold leading-[0.8203125rem] text-ink">
            {{ $t("trust-satisfaction") }}
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom tab bar -->
    <MobileAppBottomNav active="orientation" :special-orientation-icon="true" />
  </div>

  <!-- ═══════════════════════════════════════════
       DESKTOP — page existante (≥ lg)
  ═══════════════════════════════════════════ -->
  <div class="global-container hidden lg:block">
    <div class="container-inner">
      <div class="left-part">
        <div class="flex flex-col justify-between h-full">
          <!-- Head -->
          <div class="">
            <div class="headline flex justify-between items-center">
              <h2 class="m-0 pb-2">
                {{ $t("area-of-studies-label") }}
              </h2>
              <div class="flex items-center gap-2 justify-end">
                <button
                  @click="prev"
                  class="flex p-1 rounded-full h-7 w-7 relative items-center justify-center border border-[#9e9e9e] text-[#9e9e9e]"
                >
                  <ChevronLeftIcon class="w-full h-full font-bold text-[#9e9e9e]" />
                </button>
                <button
                  @click="next"
                  class="flex p-1 rounded-full h-7 w-7 relative items-center justify-center border border-[#9e9e9e] text-[#9e9e9e]"
                >
                  <ChevronRightIcon class="w-full h-full font-bold text-[#9e9e9e]" />
                </button>
              </div>
            </div>
            <div v-if="!isFetching" class="-ms-1 -me-px mb-[20px]">
              <Carousel
                :itemsToScroll="1"
                :mouseDrag="true"
                :itemsToShow="4"
                :wrapAround="true"
                :breakpoints="breakPoints"
                :autoplay="4000"
                :pauseAutoplayOnHover="true"
                v-model="currentSlide"
                class="areas-carousel"
                ref="carousel"
              >
                <Slide v-for="item in areaList" :key="item.id || item.slug" :class="`vw-50`">
                  <router-link
                    :to="
                      i18nRoute({
                        name: 'schools',
                        params: {
                          slug: carouselAreaSlug,
                          areaslug: item?.slug || 'all',
                        },
                      })
                    "
                    @click="handleClickArea(item)"
                    class="flex border border-[#c0c0c0] rounded-md w-full py-2 px-2 mx-1 gx-1 items-center justify-center"
                    :class="{
                      'bg-[#273c66] text-white': selectedOffer?.area.id == item?.id,
                    }"
                  >
                    <img
                      class="hidden md:block h-[26px] w-[26px] me-1"
                      :src="item?.icon"
                      :class="{
                        invert: selectedOffer?.area.id == item?.id,
                      }"
                    />
                    <div class="whitespace-nowrap text-[12px] lg:text-[16px] font-medium">
                      {{ item?.title }}
                    </div>
                  </router-link>
                </Slide>
              </Carousel>
            </div>

            <!-- Loader section -->
            <div v-else class="flex items-center justify-between domaine-container mb-[20px]">
              <TagLoaderVue v-for="(item, index) in 4" :key="index" :data="item" class="mx-1" />
            </div>

            <div class="grid grid-cols-1" v-if="!isFetching && paginatedSchools.data?.length > 0">
              <template v-for="school in paginatedSchools.data" :key="school.id || school.title">
                <router-link
                  v-if="canShowSchoolLink(school)"
                  :to="
                    i18nRoute({
                      name: 'school-presentation',
                      params: {
                        slug: selectedMenuSlug,
                        areaslug: getAreaSlug(),
                        schoolslug: getSchoolSlug(school),
                      },
                    })
                  "
                  @click="handleClickSchool(school)"
                >
                  <SchoolCard :school="school" />
                </router-link>
                <div v-else @click="handleClickSchool(school)">
                  <SchoolCard :school="school" />
                </div>
              </template>
            </div>
          </div>
          <!-- End Head -->

          <!-- Pagination -->
          <Pagination
            v-if="!isFetching && paginatedSchools.data?.length > 0 && paginatedSchools.total > 5"
            :links="paginatedSchools?.links"
            @goToPage="fetchData"
          />
          <!-- End Pagination -->
        </div>
      </div>
      <div class="right-part hidden lg:block">
        <BannerRotator class="pub mt-[30px]" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.headline {
  border-bottom: 1px solid #c0c0c091;
  margin: 0px 0 25px;

  p {
    font-size: 18px;
    font-weight: 700;
    display: inline-block;
    width: 100%;
    border-bottom: none !important;
    padding-bottom: 10px !important;
  }
}
/* .main {
  margin-top: 90px;
  margin-bottom: 80px;
}
.area {
  border: 1px solid #000000;

  .area-name {
    color: #000000;
  }

  .area-logo {
    width: 28px;
    height: 28px;
    margin-right: 15px;
  }

  &.selected-area {
    background-color: #273c66;

    .area-logo {
      filter: invert(1);
    }

    .area-name {
      color: #ffffff;
    }
  }
}

.titre_main {
  border-bottom: 1px solid #c0c0c091;
}

.item_domain {
  flex: 1;
  font-weight: bold;
  border-radius: 5px;
  color: black;
  border: 1px solid #c0c0c0a8;
  margin-bottom: 0 !important;

  img {
    width: 26px;
  }

  &.active {
    background-color: #273c66;
    color: white;

    img {
      filter: invert(1);
    }
  }

  &:not(:last-child) {
    margin-right: 8px;
  }
}

@media only screen and (max-width: 768px) {
  .main {
    margin-top: 85px;
    height: calc(100vh - 165px);
  }

  .super-cont {
    margin: 13px 10px 10px;
  }
  .right-part {
    display: none;
  }
  .titre_main {
    display: none !important;
  }
}

@media only screen and (max-width: 425px) {
  .main {
    margin-top: 75px;
    height: calc(100vh - 155px);
  }

  .mobile-logo {
    display: none;
  }

  .mobile-logo-2 {
    display: block !important;
  }

  .custom_navbar {
    position: relative !important;
  }

  .c-button {
    margin-left: 90% !important;
  }
} */
</style>
