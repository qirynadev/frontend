<script lang="ts" setup>
import { computed, onBeforeMount } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { i18nRoute } from "@/utils";
import { useAuthStore, useETestingStore, useJourneyStore, usePaymentStore } from "@/stores";
import type { ModuleJourneyKey } from "@/config/moduleJourneys";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";
import mobileLogo from "@/assets/images/home-mobile/logo.png";
import mobileIconBell from "@/assets/images/home-mobile/icon-bell.svg";
import backArrowIcon from "@/assets/images/profilage-landing-mobile/back-arrow.svg";
import mobileIconSchool from "@/assets/images/home-mobile/icon-school.svg";
import heroIllustration from "@/assets/images/project-dashboard-mobile/hero-illustration.png";
import statIconDone from "@/assets/images/project-dashboard-mobile/stat-icon-done.svg";
import statIconProgress from "@/assets/images/project-dashboard-mobile/stat-icon-progress.svg";
import statIconUpcoming from "@/assets/images/project-dashboard-mobile/stat-icon-upcoming.svg";
import chevronRight from "@/assets/images/project-dashboard-mobile/chevron-right.svg";
import seeAllArrow from "@/assets/images/project-dashboard-mobile/see-all-arrow.svg";
import iconOrientation from "@/assets/images/project-dashboard-mobile/icon-orientation.svg";
import iconLanguage from "@/assets/images/project-dashboard-mobile/icon-language.svg";
import iconHousing from "@/assets/images/project-dashboard-mobile/icon-housing.svg";
import checkDone from "@/assets/images/project-dashboard-mobile/check-done.svg";
import dotInProgress from "@/assets/images/project-dashboard-mobile/dot-inprogress.svg";
import dotUpcoming from "@/assets/images/project-dashboard-mobile/dot-upcoming.svg";
import iconSupport from "@/assets/images/project-dashboard-mobile/icon-support.svg";

type ServiceCardConfig = {
  key: ModuleJourneyKey;
  icon: string;
  selfContainedIcon: boolean;
  iconWrapperBg: string;
  titleKey: string;
  descKey: string;
  packKey: string;
  packBg: string;
  packText: string;
  startRouteName: string;
  startParams?: Record<string, string>;
};

const services: ServiceCardConfig[] = [
  {
    key: "profilage",
    icon: iconOrientation,
    selfContainedIcon: true,
    iconWrapperBg: "",
    titleKey: "project-orientation-title",
    descKey: "project-orientation-desc",
    packKey: "project-orientation-pack",
    packBg: "#efecfe",
    packText: "#2f00ff",
    startRouteName: "profilage",
  },
  {
    key: "course",
    icon: iconLanguage,
    selfContainedIcon: false,
    iconWrapperBg: "#e9f0fe",
    titleKey: "project-language-title",
    descKey: "project-language-desc",
    packKey: "project-language-pack",
    packBg: "#e9f8ec",
    packText: "#05b72d",
    startRouteName: "choose-language",
  },
  {
    key: "living",
    icon: iconHousing,
    selfContainedIcon: true,
    iconWrapperBg: "",
    titleKey: "project-housing-title",
    descKey: "project-housing-desc",
    packKey: "project-housing-pack",
    packBg: "#fef0e4",
    packText: "#f16f02",
    startRouteName: "living-choose-destination",
  },
  {
    key: "school",
    icon: mobileIconSchool,
    selfContainedIcon: false,
    iconWrapperBg: "#fde8ea",
    titleKey: "project-school-title",
    descKey: "project-school-desc",
    packKey: "project-school-pack",
    packBg: "#fde8ea",
    packText: "#ed2530",
    startRouteName: "choose-destination",
  },
];

const router = useRouter();
const authStore = useAuthStore();
const journeyStore = useJourneyStore();
const eTestingStore = useETestingStore();
const paymentStore = usePaymentStore();
const { journeys } = storeToRefs(journeyStore);

const hasProfilageOrder = computed(() =>
  eTestingStore.evaluations.some((evaluation) => evaluation.order?.service_type === "App\\Models\\Profilage"),
);

const hasLivingOrder = computed(() =>
  paymentStore.userPaymentList.some((order) => order.service_type === "App\\Models\\CostOfLiving"),
);

onBeforeMount(async () => {
  await journeyStore.fetchJourneys();
  await authStore.fetchUnreadNotificationCount();
  await eTestingStore.fetchEvaluations();
  await paymentStore.fetchUserPayment();
});

const goBack = () => router.back();

type ServiceStatus = "done" | "progress" | "upcoming";

const statusOf = (key: ModuleJourneyKey): ServiceStatus => {
  const journey = journeys.value[key];
  if (journey?.completed_at) return "done";
  if (journey && journey.step_index > 0) return "progress";
  return "upcoming";
};

const RING_RADIUS = 34.5;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const overallPercent = computed(() => {
  const total = services.reduce((sum, service) => sum + (journeys.value[service.key]?.percent ?? 0), 0);
  return Math.round(total / services.length);
});

const ringDashOffset = computed(() => RING_CIRCUMFERENCE * (1 - overallPercent.value / 100));

const doneCount = computed(() => services.filter((service) => statusOf(service.key) === "done").length);
const progressCount = computed(() => services.filter((service) => statusOf(service.key) === "progress").length);
const upcomingCount = computed(() => services.length - doneCount.value - progressCount.value);

const goToService = (service: ServiceCardConfig) => {
  if (service.key === "profilage" && hasProfilageOrder.value) {
    router.push(i18nRoute({ name: "profilage-project" }));
    return;
  }

  if (service.key === "living" && hasLivingOrder.value) {
    router.push(i18nRoute({ name: "user-project-living" }));
    return;
  }

  const journey = journeys.value[service.key];
  if (journey) {
    router.push(i18nRoute({ name: journey.route_name, params: journey.params }));
  } else {
    router.push(i18nRoute({ name: service.startRouteName, params: service.startParams }));
  }
};
</script>

<template>
  <div class="mx-auto flex w-full max-w-[26.875rem] flex-col items-center overflow-x-hidden bg-surface pb-26">
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

      <!-- Hero -->
      <div class="flex w-full items-start gap-2.5 pb-[4.375rem] pt-[1.875rem]">
        <div class="min-w-0 flex-1">
          <p class="text-xl font-semibold tracking-[-0.039rem] text-ink">
            {{ $t("project-dashboard-title") }}
          </p>
          <p class="w-[10rem] pt-2 text-sm text-ink">{{ $t("project-dashboard-subtitle") }}</p>
        </div>
        <img :src="heroIllustration" class="w-[12.8125rem] max-w-[45%] shrink-0 object-contain" alt="" />
      </div>

      <!-- Aperçu général -->
      <div class="w-full rounded-[0.625rem] border border-[#f3f4f6] p-[0.9375rem] pb-6 shadow-[0px_0px_3.5px_rgba(0,0,0,0.1)]">
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold text-ink">{{ $t("project-dashboard-overview-title") }}</p>
          <p class="text-[0.625rem] font-medium text-ink-muted">{{ $t("project-dashboard-overview-updated") }}</p>
        </div>

        <div class="flex items-center gap-[1.375rem] pt-4">
          <div class="relative size-[4.625rem] shrink-0">
            <svg viewBox="0 0 74 74" class="size-full -rotate-90">
              <circle cx="37" cy="37" r="34.5" fill="none" stroke="#E2D9FD" stroke-width="5" />
              <circle
                cx="37"
                cy="37"
                r="34.5"
                fill="none"
                stroke="#3300FD"
                stroke-width="5"
                stroke-linecap="round"
                :stroke-dasharray="RING_CIRCUMFERENCE"
                :stroke-dashoffset="ringDashOffset"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <p class="text-[0.9375rem] font-semibold tracking-[0.00625rem] text-ink">{{ overallPercent }}%</p>
              <p class="text-[0.4375rem] text-ink">{{ $t("project-dashboard-progress-suffix") }}</p>
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-ink">{{ $t("project-dashboard-doing-well-title") }}</p>
            <p class="pt-1 text-[0.6875rem] leading-[1.115625rem] text-ink-muted">
              {{ $t("project-dashboard-doing-well-text") }}
            </p>
          </div>
        </div>

        <div class="mt-4 flex w-full items-center rounded-[0.625rem] bg-[#f6f5fd] px-2 py-2.5">
          <div class="flex flex-1 flex-col items-center gap-2.5">
            <img :src="statIconDone" class="size-[0.9375rem]" alt="" />
            <div class="flex flex-col items-center">
              <p class="text-xs font-semibold text-ink">{{ doneCount }}</p>
              <p class="pt-0.5 text-[0.5625rem] text-ink">{{ $t("project-dashboard-stat-done") }}</p>
            </div>
          </div>
          <div class="h-9 w-px shrink-0 bg-[#e6e5f5]"></div>
          <div class="flex flex-1 flex-col items-center gap-2.5">
            <img :src="statIconProgress" class="size-[0.9375rem]" alt="" />
            <div class="flex flex-col items-center">
              <p class="text-xs font-semibold text-[#fe6f00]">{{ progressCount }}</p>
              <p class="pt-0.5 text-[0.5625rem] text-ink">{{ $t("project-dashboard-stat-progress") }}</p>
            </div>
          </div>
          <div class="h-9 w-px shrink-0 bg-[#e6e5f5]"></div>
          <div class="flex flex-1 flex-col items-center gap-2.5">
            <img :src="statIconUpcoming" class="size-4" alt="" />
            <div class="flex flex-col items-center">
              <p class="text-xs font-semibold text-ink">{{ upcomingCount }}</p>
              <p class="pt-0.5 text-[0.5625rem] text-ink">{{ $t("project-dashboard-stat-upcoming") }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Mes services -->
      <div class="w-full pt-5">
        <div class="flex w-full items-center justify-between">
          <p class="text-sm font-semibold text-ink">{{ $t("project-dashboard-services-title") }}</p>
          <button type="button" class="flex items-center gap-1" @click="router.push(i18nRoute({ name: 'user-orders' }))">
            <span class="text-xs font-semibold text-[#1600f3]">{{ $t("project-dashboard-see-all") }}</span>
            <img :src="seeAllArrow" class="h-[0.546875rem] w-[0.3125rem]" alt="" />
          </button>
        </div>

        <div class="mt-4 flex w-full flex-col gap-2.5">
          <button
            v-for="service in services"
            :key="service.key"
            type="button"
            class="flex min-h-[6.4375rem] w-full items-center justify-between rounded-[0.625rem] border border-[#f3f4f6] px-3 py-[0.8125rem] text-left"
            @click="goToService(service)"
          >
            <div class="flex flex-1 items-start gap-3.5">
              <div
                class="flex size-11 shrink-0 items-center justify-center rounded-full"
                :style="!service.selfContainedIcon ? { backgroundColor: service.iconWrapperBg } : undefined"
              >
                <img :src="service.icon" :class="service.selfContainedIcon ? 'size-11' : 'size-6'" alt="" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-semibold text-ink">{{ $t(service.titleKey) }}</p>
                <p class="pt-1 text-[0.625rem] leading-[1.015625rem] text-ink">{{ $t(service.descKey) }}</p>
                <span
                  class="mt-1 inline-flex rounded px-2 py-0.5 text-[0.5rem] font-semibold"
                  :style="{ backgroundColor: service.packBg, color: service.packText }"
                >
                  {{ $t(service.packKey) }}
                </span>
              </div>
            </div>
            <div class="flex shrink-0 items-center gap-2 pl-2">
              <template v-if="statusOf(service.key) === 'done'">
                <span class="flex items-center gap-1 rounded-md bg-[#e5f7e7] px-1.5 py-1">
                  <span class="text-[0.5625rem] font-medium text-[#1fad36]">{{ $t("project-dashboard-status-done") }}</span>
                  <img :src="checkDone" class="size-[0.9375rem]" alt="" />
                </span>
              </template>
              <template v-else-if="statusOf(service.key) === 'progress'">
                <div class="flex flex-col items-start gap-0.5">
                  <span class="flex items-center gap-1 rounded-md bg-[#fff3e0] px-1.5 py-1">
                    <span class="text-[0.5625rem] font-medium text-[#fe7812]">{{ $t("project-dashboard-status-progress") }}</span>
                    <img :src="dotInProgress" class="size-[0.46875rem]" alt="" />
                  </span>
                  <div class="flex w-[3.8125rem] flex-col items-center gap-0.5">
                    <p class="text-[0.375rem] text-ink-muted">
                      {{ $t("project-dashboard-percent-complete", { percent: journeys[service.key]?.percent ?? 0 }) }}
                    </p>
                    <div class="h-1 w-full overflow-hidden rounded-full bg-[#e5e0fd]">
                      <div
                        class="h-full rounded-full bg-[#4c17fe]"
                        :style="{ width: `${journeys[service.key]?.percent ?? 0}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <span class="flex items-center gap-1 rounded-md bg-[#f5f3fc] px-1.5 py-1">
                  <span class="text-[0.5625rem] font-medium text-[#6b679d]">{{ $t("project-dashboard-status-upcoming") }}</span>
                  <img :src="dotUpcoming" class="size-[0.46875rem]" alt="" />
                </span>
              </template>
              <img :src="chevronRight" class="h-3 w-[0.40625rem]" alt="" />
            </div>
          </button>
        </div>
      </div>

      <!-- Besoin d'un accompagnement -->
      <div class="w-full pt-5">
        <div class="flex w-full items-start justify-between gap-2 rounded-[0.625rem] bg-surface-tint px-[0.5625rem] py-4">
          <div class="flex flex-1 items-start gap-[0.6875rem]">
            <img :src="iconSupport" class="size-11 shrink-0" alt="" />
            <div class="min-w-0 flex-1">
              <p class="text-[0.6875rem] font-bold text-ink">{{ $t("project-dashboard-support-title") }}</p>
              <p class="pt-1 text-[0.625rem] leading-4 text-ink">{{ $t("project-dashboard-support-text") }}</p>
            </div>
          </div>
          <RouterLink
            :to="i18nRoute({ name: 'user-notifications' })"
            class="shrink-0 whitespace-nowrap rounded-lg border border-[#450ff2] px-3 py-2 text-[0.625rem] font-medium text-[#450ff2] no-underline"
          >
            {{ $t("project-dashboard-support-cta") }}
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Bottom tab bar -->
    <MobileAppBottomNav active="project" />
  </div>
</template>
