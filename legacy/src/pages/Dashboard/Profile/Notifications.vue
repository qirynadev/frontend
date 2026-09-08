<script lang="ts" setup>
import { useRouter } from "vue-router";
import { i18nRoute } from "@/utils";
import { useAuthStore } from "@/stores";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";
import mobileLogo from "@/assets/images/home-mobile/logo.png";
import mobileIconBell from "@/assets/images/home-mobile/icon-bell.svg";
import backArrowIcon from "@/assets/images/profilage-landing-mobile/back-arrow.svg";
import iconNotifications from "@/assets/images/settings-mobile/icon-notifications.svg";

const router = useRouter();
const authStore = useAuthStore();

const goBack = () => router.back();
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

      <!-- Coming soon -->
      <div class="flex w-full flex-col items-center pt-16 text-center">
        <img :src="iconNotifications" class="mb-6 size-16" alt="" />
        <p class="text-xl font-semibold text-ink">{{ $t("coming-soon.notifications.title") }}</p>
        <p class="mt-3 text-sm leading-6 text-ink-muted">{{ $t("coming-soon.notifications.description") }}</p>
        <p class="mt-2 text-sm font-medium text-[#5825fd]">{{ $t("coming-soon.stay-tuned") }}</p>
      </div>
    </div>

    <MobileAppBottomNav active="account" />
  </div>
</template>
