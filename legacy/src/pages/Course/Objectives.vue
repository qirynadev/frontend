<script setup lang="ts">
import { computed, onBeforeMount, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { i18nRoute } from "@/utils";
import { useAuthStore, useCourseStore } from "@/stores";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";
import mobileLogo from "@/assets/images/destination-choice-mobile/logo.png";
import iconBack from "@/assets/images/destination-choice-mobile/icon-back.svg";
import iconBell from "@/assets/images/destination-choice-mobile/icon-bell.svg";
import iconPayment from "@/assets/images/destination-choice-mobile/icon-payment.svg";
import iconSupport from "@/assets/images/destination-choice-mobile/icon-support.svg";
import iconSatisfaction from "@/assets/images/destination-choice-mobile/icon-satisfaction.svg";
import iconArrowContinue from "@/assets/images/language-choice-mobile/icon-arrow-continue.svg";
import {
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
  BookOpenIcon,
  GlobeAltIcon,
  EllipsisHorizontalCircleIcon,
  LifebuoyIcon,
} from "@heroicons/vue/24/outline";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const courseStore = useCourseStore();

const slug = computed(() => route.params.slug as string);

// Pas de champ "objectif" en base pour l'instant : sélection informative côté UI
// uniquement (même statut que le formulaire de préférences logement), ne conditionne
// aucun résultat de formule. Confirmé avec l'utilisateur.
const objectives = [
  { key: "exams", icon: AcademicCapIcon, iconBg: "#ebe7ff", iconFg: "#4f18f6", badgeKey: "course-objectives-badge-popular", titleKey: "course-objectives-exams-title", descKey: "course-objectives-exams-desc" },
  { key: "conversation", icon: ChatBubbleLeftRightIcon, iconBg: "#eaf9ed", iconFg: "#10b981", titleKey: "course-objectives-conversation-title", descKey: "course-objectives-conversation-desc" },
  { key: "professional", icon: BriefcaseIcon, iconBg: "#fffbeb", iconFg: "#f59e0b", titleKey: "course-objectives-professional-title", descKey: "course-objectives-professional-desc" },
  { key: "refresher", icon: BookOpenIcon, iconBg: "#edf3fe", iconFg: "#3b82f6", titleKey: "course-objectives-refresher-title", descKey: "course-objectives-refresher-desc" },
  { key: "admission", icon: GlobeAltIcon, iconBg: "#ffedf0", iconFg: "#fd061b", titleKey: "course-objectives-admission-title", descKey: "course-objectives-admission-desc" },
  { key: "other", icon: EllipsisHorizontalCircleIcon, iconBg: "#f1f5f9", iconFg: "#64748b", titleKey: "course-objectives-other-title", descKey: "course-objectives-other-desc" },
];

const selectedKey = ref(objectives[0].key);

const goToContact = () => {
  router.push(i18nRoute({ name: "contact" }));
};

const goToFormulas = () => {
  const course = courseStore.getCourseBySlug(slug.value);
  if (course) courseStore.setSelectedCourse(course);
  router.push(i18nRoute({ name: "courses-formulas", params: { slug: slug.value } }));
};

onBeforeMount(async () => {
  if (authStore.token) await authStore.fetchUnreadNotificationCount();
  if (!courseStore.courseList.length) await courseStore.fetchCourses();
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
          v-if="authStore.token"
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
        <div v-else class="size-[3.0625rem]"></div>
      </div>

      <!-- Title -->
      <div class="w-full pb-[1.875rem]">
        <p class="text-xl font-semibold tracking-[-0.040625rem] text-ink">
          {{ $t("course-objectives-title") }}
        </p>
        <p class="pt-1 text-sm leading-[1.421875rem] text-ink">{{ $t("course-objectives-subtitle") }}</p>
      </div>

      <!-- Objectives list -->
      <div class="flex w-full flex-col gap-3">
        <button
          v-for="objective in objectives"
          :key="objective.key"
          type="button"
          class="flex w-full items-center gap-3.5 rounded-[0.625rem] border p-[1.0625rem] text-left"
          :class="selectedKey === objective.key ? 'border-[#440af6]' : 'border-border-default'"
          @click="selectedKey = objective.key"
        >
          <div class="flex size-12 flex-none items-center justify-center rounded-full" :style="{ backgroundColor: objective.iconBg }">
            <component :is="objective.icon" class="size-5" :style="{ color: objective.iconFg }" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <p class="text-sm font-semibold text-ink">{{ $t(objective.titleKey) }}</p>
              <span v-if="objective.badgeKey" class="rounded-md bg-[#ebe7ff] px-2 py-0.5 text-[0.6875rem] font-bold text-[#4f18f6]">
                {{ $t(objective.badgeKey) }}
              </span>
            </div>
            <p class="pt-0.5 text-xs leading-[1.075rem] text-ink">{{ $t(objective.descKey) }}</p>
          </div>
          <span
            class="size-[1.125rem] flex-none rounded-full border-2"
            :class="selectedKey === objective.key ? 'border-[#4f18f6] bg-[#4f18f6]' : 'border-border-default'"
          ></span>
        </button>
      </div>

      <!-- Need help -->
      <div class="w-full pt-5">
        <div class="flex w-full items-center justify-between gap-3 rounded-[0.625rem] bg-surface-tint px-[0.5625rem] py-5">
          <div class="flex min-w-0 flex-1 items-start gap-2.5">
            <div class="flex size-11 flex-none items-center justify-center rounded-full bg-[#e8e2fd]">
              <LifebuoyIcon class="size-6 text-[#4f18f6]" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-bold text-ink">{{ $t("course-objectives-help-title") }}</p>
              <p class="pt-1 text-[0.5625rem] leading-4 text-ink">{{ $t("course-objectives-help-text") }}</p>
            </div>
          </div>
          <button
            type="button"
            class="flex-none rounded-[0.625rem] border border-[#450ff2] px-[0.6875rem] py-[0.5625rem] text-[0.625rem] font-medium text-[#450ff2]"
            @click="goToContact"
          >
            {{ $t("course-objectives-help-button") }}
          </button>
        </div>
      </div>

      <!-- Continue -->
      <div class="w-full pt-5">
        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-[0.625rem] bg-[#4309fc] px-6 py-4 text-sm font-semibold text-white"
          @click="goToFormulas"
        >
          {{ $t("profilage-landing-cta") }}
          <img :src="iconArrowContinue" class="size-5" alt="" />
        </button>
      </div>

      <!-- Trust badges -->
      <div class="mt-6 flex w-full items-center justify-center gap-2 rounded-[0.625rem] border border-border-default bg-surface-alt py-[0.6875rem]">
        <div class="flex flex-col items-center gap-[0.375rem] px-1">
          <img :src="iconPayment" class="size-10" alt="" />
          <p class="text-center text-[0.6875rem] font-semibold leading-[0.8203125rem] text-ink">
            {{ $t("trust-payment") }}
          </p>
        </div>
        <div class="h-[3.25rem] w-px bg-border-default"></div>
        <div class="flex flex-col items-center gap-[0.375rem] px-1">
          <img :src="iconSupport" class="size-10" alt="" />
          <p class="text-center text-[0.6875rem] font-semibold leading-[0.8203125rem] text-ink">
            {{ $t("trust-support") }}
          </p>
        </div>
        <div class="h-[3.25rem] w-px bg-border-default"></div>
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
