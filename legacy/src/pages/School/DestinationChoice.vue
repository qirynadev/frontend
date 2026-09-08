<script lang="ts" setup>
import { computed, onBeforeMount, ref } from "vue";
import router from "@/router";
import { i18nRoute } from "@/utils";
import { useAuthStore } from "@/stores";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";
import FrontPagination from "@/components/molecules/FrontPagination.vue";
import mobileLogo from "@/assets/images/destination-choice-mobile/logo.png";
import iconBack from "@/assets/images/destination-choice-mobile/icon-back.svg";
import iconBell from "@/assets/images/destination-choice-mobile/icon-bell.svg";
import iconHome from "@/assets/images/destination-choice-mobile/icon-home.svg";
import iconChevron from "@/assets/images/destination-choice-mobile/icon-chevron.svg";
import iconGlobe from "@/assets/images/destination-choice-mobile/icon-globe.svg";
import iconPayment from "@/assets/images/destination-choice-mobile/icon-payment.svg";
import iconSupport from "@/assets/images/destination-choice-mobile/icon-support.svg";
import iconSatisfaction from "@/assets/images/destination-choice-mobile/icon-satisfaction.svg";
import photoFrance from "@/assets/images/destination-choice-mobile/photo-france.jpg";
import flagFrance from "@/assets/images/destination-choice-mobile/flag-france.png";
import photoCanada from "@/assets/images/destination-choice-mobile/photo-canada.jpg";
import flagCanada from "@/assets/images/destination-choice-mobile/flag-canada.png";
import photoGermany from "@/assets/images/destination-choice-mobile/photo-germany.jpg";
import flagGermany from "@/assets/images/destination-choice-mobile/flag-germany.png";
import photoChina from "@/assets/images/destination-choice-mobile/photo-china.jpg";
import flagChina from "@/assets/images/destination-choice-mobile/flag-china.png";
import photoUk from "@/assets/images/destination-choice-mobile/photo-uk.jpg";
import flagUk from "@/assets/images/destination-choice-mobile/flag-uk.png";
import photoUsa from "@/assets/images/destination-choice-mobile/photo-usa.jpg";
import flagUsa from "@/assets/images/destination-choice-mobile/flag-usa.png";

// Slugs vérifiés côté back-office (database/seeders/LcCountriesTranslationsTableSeeder.php)
const destinations = [
  { key: "france", label: "school-dest-france", photo: photoFrance, flag: flagFrance, slug: "france" },
  { key: "canada", label: "school-dest-canada", photo: photoCanada, flag: flagCanada, slug: "canada" },
  { key: "germany", label: "school-dest-germany", photo: photoGermany, flag: flagGermany, slug: "germany" },
  { key: "china", label: "school-dest-china", photo: photoChina, flag: flagChina, slug: "china" },
  { key: "uk", label: "destination-choice-country-uk", photo: photoUk, flag: flagUk, slug: "united-kingdom" },
  { key: "usa", label: "destination-choice-country-usa", photo: photoUsa, flag: flagUsa, slug: "united-states-of-america" },
];

// Grille 3 colonnes x 2 lignes (comme sur le Figma) — pagination dès qu'on dépasse 6 destinations
const perPage = 6;
const currentPage = ref(1);
const paginatedDestinations = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return destinations.slice(start, start + perPage);
});
const goToPage = (page: number) => {
  currentPage.value = page;
};

const goToDestination = (slug: string) => {
  // "destinations" (School/Index.vue) affiche les stats du pays + le choix du domaine
  // d'étude, qui route ensuite vers "schools" avec le vrai areaslug choisi (plus de "all").
  router.push(i18nRoute({ name: "destinations", params: { slug } }));
};

const authStore = useAuthStore();

onBeforeMount(async () => {
  if (authStore.token) await authStore.fetchUnreadNotificationCount();
});
</script>

<template>
  <div class="flex w-full flex-col items-center overflow-x-hidden bg-surface pb-26">
    <div class="flex w-full flex-col items-center px-4 pb-6 pt-4">
      <!-- Top bar -->
      <div class="flex w-full items-center justify-between pb-[1.875rem]">
        <button type="button" class="flex size-6 items-center justify-center" aria-label="Retour" @click="router.back()">
          <img :src="iconBack" class="size-full" alt="" />
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
          <img :src="iconBell" class="size-[1.5625rem]" alt="" />
          <span
            v-if="authStore.unreadNotificationCount > 0"
            class="absolute left-[1.5rem] top-[0.25rem] flex items-center justify-center rounded-full bg-[#ee163e] px-[0.375rem] py-[0.0625rem] text-xs font-medium text-white"
          >
            {{ authStore.unreadNotificationCount }}
          </span>
        </RouterLink>
      </div>

      <!-- Title -->
      <div class="w-full pb-6">
        <p class="text-xl font-semibold tracking-[-0.040625rem] text-ink">
          {{ $t("destination-choice-title") }}
        </p>
        <p class="pt-1 text-sm leading-[1.421875rem] text-ink">{{ $t("destination-choice-subtitle") }}</p>
      </div>

      <!-- Destinations grid -->
      <div class="grid w-full grid-cols-3 gap-[0.625rem]">
        <button
          v-for="dest in paginatedDestinations"
          :key="dest.key"
          type="button"
          class="relative flex flex-col items-start rounded-[0.625rem] border bg-surface px-[0.4375rem] pb-[0.625rem] pt-[0.4375rem] text-left shadow-[0_0_0.21875rem_rgba(0,0,0,0.1)]"
          :class="dest.key === 'france' ? 'border-[#f7344e]' : 'border-transparent'"
          @click="goToDestination(dest.slug)"
        >
          <div class="h-[7rem] w-full overflow-hidden rounded">
            <img :src="dest.photo" class="size-full object-cover" alt="" />
          </div>
          <img
            :src="dest.flag"
            class="absolute left-1/2 top-[7.4375rem] size-[1.9375rem] -translate-x-1/2 -translate-y-1/2"
            alt=""
          />
          <div class="w-full pt-4">
            <p class="text-xs font-bold text-ink">{{ $t(dest.label) }}</p>
            <div class="flex w-full items-center justify-between pt-1">
              <div class="flex min-w-0 flex-1 items-center gap-1">
                <img :src="iconHome" class="size-[0.5625rem] flex-none" alt="" />
                <span class="truncate text-[0.4375rem] font-semibold text-ink">
                  {{ $t("destination-choice-housing-count") }}
                </span>
              </div>
              <img :src="iconChevron" class="size-[0.5625rem] flex-none" alt="" />
            </div>
          </div>
        </button>
      </div>

      <FrontPagination
        v-if="destinations.length > perPage"
        :total="Math.ceil(destinations.length / perPage)"
        :per-page="perPage"
        :current="currentPage"
        @go-to-page="goToPage"
      />

      <!-- Support info -->
      <div class="w-full py-6">
        <div class="flex w-full items-start gap-4 rounded-[0.625rem] bg-surface-tint px-[0.5625rem] py-5">
          <img :src="iconGlobe" class="size-11 flex-none" alt="" />
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold text-ink">{{ $t("destination-choice-support-title") }}</p>
            <p class="pt-1 text-[0.625rem] leading-4 text-ink">{{ $t("destination-choice-support-text") }}</p>
          </div>
        </div>
      </div>

      <!-- Trust badges -->
      <div class="flex w-full items-center justify-center gap-2 rounded-[0.625rem] border border-border-default bg-surface-alt py-[0.6875rem]">
        <div class="flex flex-col items-center gap-[0.375rem] px-1">
          <img :src="iconPayment" class="size-10" alt="" />
          <p class="text-center text-[0.6875rem] font-semibold leading-[0.8203125rem] text-ink">
            {{ $t("trust-payment") }}
          </p>
        </div>
        <div class="h-[3.25rem] w-px bg-[#e4e7f0]"></div>
        <div class="flex flex-col items-center gap-[0.375rem] px-1">
          <img :src="iconSupport" class="size-10" alt="" />
          <p class="text-center text-[0.6875rem] font-semibold leading-[0.8203125rem] text-ink">
            {{ $t("trust-support") }}
          </p>
        </div>
        <div class="h-[3.25rem] w-px bg-[#e4e7f0]"></div>
        <div class="flex flex-col items-center gap-[0.375rem] px-1">
          <img :src="iconSatisfaction" class="size-10" alt="" />
          <p class="text-center text-[0.6875rem] font-semibold leading-[0.8203125rem] text-ink">
            {{ $t("trust-satisfaction") }}
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom tab bar -->
    <MobileAppBottomNav active="orientation" :special-orientation-icon="true" />
  </div>
</template>
