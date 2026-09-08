<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { i18nRoute } from "@/utils";
import { useAuthStore, useSettingStore } from "@/stores";
import type { ThemeMode } from "@/utils/theme";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";
import mobileLogo from "@/assets/images/home-mobile/logo.png";
import mobileIconBell from "@/assets/images/home-mobile/icon-bell.svg";
import backArrowIcon from "@/assets/images/profilage-landing-mobile/back-arrow.svg";
import previewLight from "@/assets/images/theme-mobile/preview-light.png";
import previewDark from "@/assets/images/theme-mobile/preview-dark.png";
import previewSystem from "@/assets/images/theme-mobile/preview-system.png";
import iconSun from "@/assets/images/theme-mobile/icon-sun.svg";
import iconMoon from "@/assets/images/theme-mobile/icon-moon.svg";
import iconDevice from "@/assets/images/theme-mobile/icon-device.svg";
import iconInfo from "@/assets/images/theme-mobile/icon-info.svg";

const router = useRouter();
const authStore = useAuthStore();
const settingStore = useSettingStore();
const { theme } = storeToRefs(settingStore);

const pendingTheme = ref<ThemeMode>(theme.value);

type ThemeOption = {
  value: ThemeMode;
  preview: string;
  icon: string;
  titleKey: string;
  descKey: string;
};

const options: ThemeOption[] = [
  { value: "light", preview: previewLight, icon: iconSun, titleKey: "theme-mobile-light-title", descKey: "theme-mobile-light-desc" },
  { value: "dark", preview: previewDark, icon: iconMoon, titleKey: "theme-mobile-dark-title", descKey: "theme-mobile-dark-desc" },
  { value: "system", preview: previewSystem, icon: iconDevice, titleKey: "theme-mobile-system-title", descKey: "theme-mobile-system-desc" },
];

const save = () => settingStore.setTheme(pendingTheme.value);
</script>

<template>
  <!-- Mobile (écran Figma "Thème") -->
  <div class="mx-auto flex w-full max-w-[26.875rem] flex-col items-center overflow-x-hidden bg-surface pb-26 lg:hidden">
    <div class="flex w-full flex-col items-center px-4 pb-6 pt-4">
      <!-- Top bar -->
      <div class="flex w-full items-center justify-between pb-[1.875rem]">
        <button
          type="button"
          class="flex size-6 items-center justify-center"
          aria-label="Retour"
          @click="router.back()"
        >
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

      <!-- Heading -->
      <div class="flex w-full flex-col items-start pb-1">
        <p class="w-full text-xl font-semibold tracking-[-0.65px] text-ink">{{ $t("theme-mobile-title") }}</p>
        <p class="w-full pt-1 text-[0.8125rem] leading-[22.75px] text-ink">{{ $t("theme-mobile-subtitle") }}</p>
      </div>

      <!-- Options -->
      <p class="w-full pt-4 text-sm font-semibold text-ink">{{ $t("theme-mobile-choose") }}</p>
      <div class="mt-3 flex w-full flex-col items-start gap-3.5">
        <button
          v-for="option in options"
          :key="option.value"
          type="button"
          class="flex w-full items-center gap-3 rounded-[0.625rem] border p-[1.0625rem] text-left"
          :class="
            pendingTheme === option.value
              ? 'border-[#4f18f6] bg-surface-tint'
              : 'border-border-default bg-surface'
          "
          @click="pendingTheme = option.value"
        >
          <img :src="option.preview" class="h-[5.375rem] w-[5.375rem] shrink-0 rounded-lg object-cover" alt="" />
          <div class="flex min-w-0 flex-1 items-start gap-2.5">
            <img :src="option.icon" class="mt-0.5 size-9 shrink-0" alt="" />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-ink">{{ $t(option.titleKey) }}</p>
              <p class="pt-0.5 text-xs leading-[1.03125rem] text-ink">{{ $t(option.descKey) }}</p>
            </div>
          </div>
          <span
            class="flex size-5 shrink-0 items-center justify-center rounded-full border"
            :class="pendingTheme === option.value ? 'border-[#3f11fe]' : 'border-[#8383b6]'"
          >
            <span v-if="pendingTheme === option.value" class="size-2.5 rounded-full bg-[#4f18f6]"></span>
          </span>
        </button>
      </div>

      <!-- Info banner -->
      <div class="mt-5 flex w-full items-center gap-2.5 rounded-[0.625rem] bg-surface-tint px-[0.5625rem] py-3">
        <img :src="iconInfo" class="size-11 shrink-0" alt="" />
        <p class="min-w-0 flex-1 text-[0.625rem] leading-4 text-ink">{{ $t("theme-mobile-info") }}</p>
      </div>

      <!-- Save -->
      <button
        type="button"
        class="mt-5 w-full rounded-[0.625rem] bg-[#4309fc] px-6 py-4 text-center text-sm font-semibold text-white"
        @click="save"
      >
        {{ $t("theme-mobile-save") }}
      </button>
    </div>

    <MobileAppBottomNav active="account" />
  </div>

  <!-- Desktop (pas de maquette Figma dédiée : formulaire équivalent) -->
  <div class="global-container hidden lg:block">
    <div class="container-inner">
      <div class="py-[10px] lg:py-[50px]">
        <h1 class="mb-[10px] text-[3em] font-light">{{ $t("theme-mobile-title") }}</h1>
        <p class="mb-8 text-ink-muted">{{ $t("theme-mobile-subtitle") }}</p>
        <div class="flex max-w-2xl flex-col gap-3">
          <button
            v-for="option in options"
            :key="option.value"
            type="button"
            class="flex items-center gap-4 rounded-lg border p-4 text-left"
            :class="pendingTheme === option.value ? 'border-[#4f18f6] bg-surface-tint' : 'border-border-default'"
            @click="pendingTheme = option.value"
          >
            <img :src="option.icon" class="size-8 shrink-0" alt="" />
            <span class="min-w-0 flex-1">
              <span class="block font-semibold text-ink">{{ $t(option.titleKey) }}</span>
              <span class="block text-sm text-ink-muted">{{ $t(option.descKey) }}</span>
            </span>
            <span
              class="flex size-5 shrink-0 items-center justify-center rounded-full border"
              :class="pendingTheme === option.value ? 'border-[#3f11fe]' : 'border-gray-300'"
            >
              <span v-if="pendingTheme === option.value" class="size-2.5 rounded-full bg-[#4f18f6]"></span>
            </span>
          </button>
        </div>
        <button
          type="button"
          class="mt-6 rounded-lg bg-[#4309fc] px-6 py-3 text-sm font-semibold text-white"
          @click="save"
        >
          {{ $t("theme-mobile-save") }}
        </button>
      </div>
    </div>
  </div>
</template>
