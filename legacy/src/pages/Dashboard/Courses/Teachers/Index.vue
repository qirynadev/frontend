<script lang="ts" setup>
import BannerRotator from "@/components/atoms/BannerRotator.vue";
import { useAuthStore, usePaymentStore } from "@/stores";
import { computed, onBeforeMount, ref } from "vue";
import type { FormulaType, OrderType, TeacherType } from "@/constants/constant.type";
import router from "@/router";
import { i18nRoute } from "@/utils";
import FrontPagination from "@/components/molecules/FrontPagination.vue";
import TeacherCard from "@/components/atoms/TeacherCard.vue";
import FormulaItem from "@/components/molecules/FormulaItem.vue";
import ButtonGeneral from "@/components/atoms/ButtonGeneral.vue";
import { storeToRefs } from "pinia";
import { CheckBadgeIcon } from "@heroicons/vue/20/solid";
import { useI18n } from "vue-i18n";
import defaultCoachIMG from "@/assets/images/talk/coach-2.1669457228.png";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";
import mobileLogo from "@/assets/images/home-mobile/logo.png";
import mobileIconBell from "@/assets/images/home-mobile/icon-bell.svg";
import backArrowIcon from "@/assets/images/profilage-landing-mobile/back-arrow.svg";
import searchIcon from "@/assets/images/teachers-mobile/search-icon.svg";
import filterIcon from "@/assets/images/teachers-mobile/filter-icon.svg";
import starIcon from "@/assets/images/teachers-mobile/star-icon.svg";
import certificationIcon from "@/assets/images/teachers-mobile/certification-icon.svg";
import experienceIcon from "@/assets/images/teachers-mobile/experience-icon.svg";
import satisfactionIcon from "@/assets/images/teachers-mobile/satisfaction-icon.svg";
import bannerArrowIcon from "@/assets/images/teachers-mobile/banner-arrow-icon.svg";

const authStore = useAuthStore();
const paymentStore = usePaymentStore();
const { locale, t } = useI18n();

const isFetching = ref<boolean>(false);
const currentPage = ref<number>(1);
const perPage = 6;
const mobileSearch = ref<string>("");

const { selectedPlanning, allTeachersList } = storeToRefs(authStore);

// Bloc mobile (Figma "Mon Projet - Professeur", node 865-2982) : recherche par nom
// fonctionnelle (filtre local), bouton "Filtres" décoratif (aucun panneau de filtre
// spécifié dans ce node). Badge "Disponible" générique et fixe — aucune donnée de
// planning par professeur n'existe dans ce listing ; prix "À partir de -" repris tel
// quel du Figma (le prix dépend de la formule choisie ensuite, pas du professeur).
const mobileFilteredTeachers = computed<TeacherType[]>(() => {
  const query = mobileSearch.value.trim().toLowerCase();
  if (!query) return allTeachersList.value as TeacherType[];
  return (allTeachersList.value as TeacherType[]).filter((teacher) =>
    teacher.full_name?.toLowerCase().includes(query),
  );
});

const mobileRating = (teacher: TeacherType) => {
  const r = teacher?.rating;
  if (r === null || r === undefined) return null;
  const f = Number(r).toFixed(1);
  return String(locale.value).startsWith("fr") ? f.replace(".", ",") : f;
};

const mobileCertification = (teacher: TeacherType) => teacher.formations?.[0]?.diploma || teacher.formations?.[0]?.title || "";

const mobileExperience = (teacher: TeacherType) => {
  const years = teacher?.experience_years;
  if (!years) return "";
  return t("course.years-of-experience", { count: years }, years);
};

const { userPaymentList } = storeToRefs(paymentStore);
const selectedFormula = computed(
  () => userPaymentList.value.find((order: OrderType) => order.id === selectedPlanning.value?.id)?.offer,
);

const totalPages = computed(() => Math.ceil(allTeachersList.value.length / perPage));

const paginatedTeachers = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return allTeachersList.value.slice(start, start + perPage);
});

const handleClickTeacher = (teacher: TeacherType) => {
  authStore.selectedTeacher = teacher;

  router.push(
    i18nRoute({
      name: "user-courses-teacher-detail",
      params: {
        teacherslug: teacher.slug,
      },
    }),
  );
};

const handleGoBack = () => {
  router.push(
    i18nRoute({
      name: "user-courses-planning",
      params: { id: selectedPlanning.value?.id },
    }),
  );
};

const goBack = () => router.back();

onBeforeMount(async () => {
  isFetching.value = true;
  await Promise.all([authStore.fetchAllTeachersByCourse(), paymentStore.fetchUserPayment()]);
  isFetching.value = false;
  if (authStore.token) await authStore.fetchUnreadNotificationCount();
});
</script>

<template>
  <div>
    <!-- ═══════════════════════════════════════════
         MOBILE — Figma "Mon Projet - Professeur" (< lg), node 865-2982
    ═══════════════════════════════════════════ -->
    <div class="mx-auto flex w-full max-w-[26.875rem] flex-col items-center overflow-x-hidden bg-surface pb-26 lg:hidden">
      <div class="flex w-full flex-col items-center px-4 pb-6 pt-4">
        <!-- Top bar -->
        <div class="flex w-full items-center justify-between pb-[1.875rem]">
          <button type="button" class="flex size-6 items-center justify-center" aria-label="Retour" @click="goBack">
            <img :src="backArrowIcon" class="size-full" alt="" />
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

        <p class="w-full text-xl font-semibold tracking-[-0.041rem] text-ink">
          {{ $t("course.teachers-list-headline") }}
        </p>

        <!-- Recherche + filtres -->
        <div class="flex w-full items-center gap-2.5 pt-4">
          <div class="relative min-w-0 flex-1">
            <img :src="searchIcon" class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" alt="" />
            <input
              v-model="mobileSearch"
              type="text"
              :placeholder="$t('course.teachers-search-placeholder')"
              class="w-full rounded-[0.625rem] border border-border-default py-[0.8125rem] pl-9 pr-3 text-[0.8125rem] text-ink shadow-[0px_1px_2px_rgba(0,0,0,0.05)] placeholder:text-ink"
            />
          </div>
          <button
            type="button"
            class="flex shrink-0 items-center gap-2 rounded-[0.625rem] border border-[#aea2fd] bg-surface px-[1.0625rem] py-3 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]"
          >
            <img :src="filterIcon" class="size-4" alt="" />
            <span class="text-[0.8125rem] font-bold text-ink">{{ $t("course.filters") }}</span>
          </button>
        </div>

        <!-- Skeleton loader -->
        <div v-if="isFetching" class="flex w-full flex-col gap-3 pt-4">
          <div v-for="n in 4" :key="n" class="h-[8.9375rem] animate-pulse rounded-[0.625rem] bg-[#f3f4f6]"></div>
        </div>

        <!-- Empty state -->
        <div v-else-if="mobileFilteredTeachers.length === 0" class="w-full pt-10 text-center text-sm text-ink-muted">
          {{ $t("course.teachers-list-empty") }}
        </div>

        <!-- Teachers list -->
        <div v-else class="flex w-full flex-col gap-3 pt-4">
          <div
            v-for="teacher in mobileFilteredTeachers"
            :key="teacher.id"
            class="w-full rounded-[0.625rem] border border-[#f3f4f6] bg-surface p-[0.9375rem] shadow-[0px_2px_6px_rgba(0,0,0,0.03)]"
          >
            <div class="flex items-start gap-3.5">
              <div class="h-full min-h-[6.875rem] w-[4.6875rem] shrink-0 overflow-hidden rounded-[0.625rem]">
                <img :src="teacher.photo ?? defaultCoachIMG" :alt="teacher.full_name" class="size-full object-cover" />
              </div>
              <div class="flex min-w-0 flex-1 items-start justify-between gap-2">
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5">
                    <p class="truncate text-[0.8125rem] font-semibold text-ink">{{ teacher.full_name }}</p>
                    <CheckBadgeIcon class="size-3 shrink-0 text-[#4f18f6]" />
                  </div>
                  <div v-if="teacher.country_flag" class="flex items-center gap-1.5 pt-1.5">
                    <img :src="teacher.country_flag" class="h-[0.625rem] w-[0.8125rem] shrink-0 rounded-[1px] object-cover" alt="" />
                    <span class="whitespace-nowrap text-[0.71875rem] text-[#374151]">{{ (teacher.country as any)?.name }}</span>
                  </div>
                  <div v-if="mobileRating(teacher)" class="flex items-center gap-1.5 pt-1.5">
                    <img :src="starIcon" class="size-3.5 shrink-0" alt="" />
                    <span class="text-[0.625rem] font-bold text-ink">{{ mobileRating(teacher) }}</span>
                    <span class="whitespace-nowrap text-[0.625rem] text-ink-muted">({{ teacher.reviews_count }} {{ $t("course.reviews") }})</span>
                  </div>
                  <div v-if="mobileCertification(teacher)" class="flex items-center gap-1.5 pt-1.5">
                    <img :src="certificationIcon" class="size-3.5 shrink-0" alt="" />
                    <span class="truncate text-[0.625rem] text-[#374151]">{{ mobileCertification(teacher) }}</span>
                  </div>
                  <div v-if="mobileExperience(teacher)" class="flex items-center gap-1.5 pt-1.5">
                    <img :src="experienceIcon" class="size-3.5 shrink-0" alt="" />
                    <span class="whitespace-nowrap text-[0.625rem] text-[#374151]">{{ mobileExperience(teacher) }}</span>
                  </div>
                </div>
                <div class="flex shrink-0 flex-col items-center gap-2.5 self-stretch">
                  <span class="flex items-center gap-1 whitespace-nowrap rounded-[0.3125rem] bg-[#e8fbea] px-2 py-1">
                    <span class="size-1.5 shrink-0 rounded-full bg-[#16a34a]"></span>
                    <span class="text-[0.4375rem] font-medium text-[#16a34a]">{{ $t("course.available") }}</span>
                  </span>
                  <div class="flex-1 text-center">
                    <p class="text-[0.625rem] text-ink">{{ $t("course.starting-from") }}</p>
                    <p class="pt-0.5 text-[0.8125rem] font-bold text-ink">-</p>
                  </div>
                  <button
                    type="button"
                    class="w-[5.9375rem] rounded-md bg-[#4f46e5] py-1.5 text-[0.6875rem] font-semibold text-white"
                    @click="handleClickTeacher(teacher)"
                  >
                    {{ $t("choose") }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Satisfaction garantie -->
        <div class="mt-5 flex w-full items-center gap-2.5 rounded-[0.625rem] bg-surface-tint px-2.5 py-4">
          <div class="flex size-11 shrink-0 items-center justify-center">
            <img :src="satisfactionIcon" class="size-full" alt="" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold text-ink">{{ $t("course.satisfaction-guarantee-title") }}</p>
            <p class="pt-1 text-[0.5625rem] leading-4 text-ink">{{ $t("course.satisfaction-guarantee-text") }}</p>
          </div>
          <img :src="bannerArrowIcon" class="h-[0.833rem] w-[0.46875rem] shrink-0" alt="" />
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
          <div class="flex flex-col justify-between h-full relative">
            <!-- Head -->
            <div class="h-full flex-1">
              <h6 class="font-bold pb-3 border-b mb-[30px] text-[18px]">
                {{ $t("course.teachers-list-headline") }}
              </h6>
              <!-- Skeleton loader -->
              <template v-if="isFetching">
                <div class="grid grid-cols-3 gap-y-4 gap-x-2 mt-3">
                  <div v-for="n in perPage" :key="n" class="h-[383px] bg-gray-100 rounded-xl animate-pulse" />
                </div>
              </template>

              <!-- Empty state -->
              <template v-else-if="allTeachersList.length === 0">
                <div class="flex flex-col items-center justify-center col-span-3 h-full mt-8">
                  <p class="text-center text-[18px] text-ink-muted">{{ $t("course.teachers-list-empty") }} !!</p>
                </div>
              </template>

              <!-- Teachers list -->
              <template v-else>
                <div class="grid grid-cols-3 gap-y-4 gap-x-2 mt-3">
                  <TeacherCard
                    v-for="teacher in paginatedTeachers"
                    :key="teacher.id"
                    :data="teacher as TeacherType"
                    @clicked="handleClickTeacher"
                    class="max-h-[383px]!"
                  />
                </div>
              </template>
            </div>
            <!-- End Head -->

            <!-- Pagination -->
            <FrontPagination
              v-if="!isFetching && totalPages > 1"
              :total="totalPages"
              :per-page="perPage"
              :current="currentPage"
              @goToPage="(p: number) => (currentPage = p)"
            />
            <!-- End Pagination -->

            <div class="flex items-center justify-start mt-4">
              <ButtonGeneral
                class="bg-navy btn-navigationx px-[20px] py-[9px] rounded-md"
                className="left-btn"
                :title="$t('go-back')"
                @pressed="handleGoBack"
              />
            </div>
          </div>
        </div>

        <div class="right-part hidden lg:block">
          <div class="">
            <FormulaItem
              :formula="selectedFormula as FormulaType"
              :withGlobalBgColor="true"
              :withPrice="false"
              :btnText="String(selectedFormula?.amount) + ' €'"
              class="h-max pointer-events-none opacity-95"
              btn-class-name="rounded-md bg-[#ff3942] w-[150px] h-[60px] mt-[25px]"
              btn-text-class="text-white text-[25px] text-center font-bold"
            />
          </div>

          <div class="mt-[30px]">
            <BannerRotator class="pub" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cursor-pointer {
  cursor: pointer;
}

.main {
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
}
</style>
