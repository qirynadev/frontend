<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { i18nRoute } from "@/utils";
import { useAuthStore } from "@/stores";
import { useSeo } from "@/composables/useSeo";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";
import mobileLogo from "@/assets/images/home-mobile/logo.png";
import mobileIconBell from "@/assets/images/home-mobile/icon-bell.svg";
import backArrowIcon from "@/assets/images/profilage-landing-mobile/back-arrow.svg";
import iconChevron from "@/assets/images/settings-mobile/icon-chevron.svg";
import iconTrust from "@/assets/images/legals-mobile/icon-trust.svg";
import iconCgu from "@/assets/images/legals-mobile/icon-cgu.svg";
import iconPrivacy from "@/assets/images/legals-mobile/icon-privacy.svg";
import iconCookies from "@/assets/images/legals-mobile/icon-cookies.svg";
import iconRgpd from "@/assets/images/legals-mobile/icon-rgpd.svg";
import iconCgv from "@/assets/images/legals-mobile/icon-cgv.svg";
import iconLegalNotice from "@/assets/images/legals-mobile/icon-legal-notice.svg";
import iconSupport from "@/assets/images/legals-mobile/icon-support.svg";

const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();

useSeo({ title: () => t("legals-mobile-title"), description: () => t("legals-mobile-subtitle") });

type LegalDoc = {
  icon: string;
  titleKey: string;
  descKey: string;
  routeName: string;
};

const documents: LegalDoc[] = [
  { icon: iconCgu, titleKey: "legals-mobile-cgu-title", descKey: "legals-mobile-cgu-desc", routeName: "cgu" },
  {
    icon: iconPrivacy,
    titleKey: "legals-mobile-privacy-title",
    descKey: "legals-mobile-privacy-desc",
    routeName: "privacy",
  },
  {
    icon: iconCookies,
    titleKey: "legals-mobile-cookies-title",
    descKey: "legals-mobile-cookies-desc",
    routeName: "cookies",
  },
  { icon: iconRgpd, titleKey: "legals-mobile-rgpd-title", descKey: "legals-mobile-rgpd-desc", routeName: "privacy" },
  { icon: iconCgv, titleKey: "legals-mobile-cgv-title", descKey: "legals-mobile-cgv-desc", routeName: "cgu" },
  {
    icon: iconLegalNotice,
    titleKey: "legals-mobile-legal-notice-title",
    descKey: "legals-mobile-legal-notice-desc",
    routeName: "legal-notice",
  },
];
</script>

<template>
  <!-- Mobile menu (écran Figma "Mentions légales") -->
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

      <!-- Heading -->
      <div class="flex w-full flex-col items-start pb-4">
        <p class="w-full text-xl font-semibold tracking-[-0.65px] text-ink">
          {{ $t("legals-mobile-title") }}
        </p>
        <p class="w-full pt-1 text-[0.8125rem] leading-[22.75px] text-ink">
          {{ $t("legals-mobile-subtitle") }}
        </p>
      </div>

      <!-- Transparence et confiance -->
      <div class="flex w-full items-center gap-[0.6875rem] rounded-[0.625rem] bg-surface-tint px-[0.5625rem] py-3">
        <img :src="iconTrust" class="size-11 shrink-0" alt="" />
        <div class="min-w-0 flex-1">
          <p class="text-xs font-bold leading-5 text-ink">{{ $t("legals-mobile-trust-title") }}</p>
          <p class="pt-1 text-[0.5625rem] leading-4 text-ink">{{ $t("legals-mobile-trust-desc") }}</p>
        </div>
      </div>

      <!-- Liste des documents légaux -->
      <div class="mt-5 flex w-full flex-col items-start overflow-hidden rounded-[0.625rem] border border-border-default">
        <RouterLink
          v-for="(doc, index) in documents"
          :key="doc.titleKey"
          :to="i18nRoute({ name: doc.routeName })"
          class="flex w-full items-center gap-3.5 p-4 no-underline"
          :class="{ 'border-t border-border-default': index > 0 }"
        >
          <img :src="doc.icon" class="size-10 shrink-0" alt="" />
          <div class="min-w-0 flex-1">
            <p class="text-[0.8125rem] font-medium leading-[1.133rem] text-ink">{{ $t(doc.titleKey) }}</p>
            <p class="pt-0.5 text-[0.625rem] leading-[0.9375rem] text-ink">{{ $t(doc.descKey) }}</p>
          </div>
          <img :src="iconChevron" class="size-4 shrink-0" alt="" />
        </RouterLink>
      </div>

      <!-- Besoin d'aide -->
      <div class="mt-5 flex w-full items-center justify-between gap-2 rounded-[0.625rem] bg-surface-tint px-[0.5625rem] py-3">
        <div class="flex min-w-0 flex-1 items-start gap-[0.6875rem]">
          <div class="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#e8e2fd]">
            <img :src="iconSupport" class="size-6" alt="" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold leading-5 text-ink">{{ $t("legals-mobile-help-title") }}</p>
            <p class="pt-1 text-[0.5625rem] leading-4 text-ink">{{ $t("legals-mobile-help-desc") }}</p>
          </div>
        </div>
        <RouterLink
          :to="i18nRoute({ name: 'contact' })"
          class="shrink-0 whitespace-nowrap rounded-[0.625rem] border border-[#450ff2] px-[0.6875rem] py-[0.5625rem] text-[0.625rem] font-medium text-[#450ff2] no-underline"
        >
          {{ $t("legals-mobile-contact-button") }}
        </RouterLink>
      </div>
    </div>

    <MobileAppBottomNav active="account" />
  </div>

  <!-- Desktop (pas de maquette Figma dédiée : liste fonctionnelle équivalente) -->
  <div class="global-container hidden lg:block">
    <div class="container-inner">
      <div class="py-[10px] lg:py-[50px]">
        <h1 class="text-[3em] font-light lg:mb-[10px]">{{ $t("legals-mobile-title") }}</h1>
        <p class="mb-8 text-ink-muted">{{ $t("legals-mobile-subtitle") }}</p>
        <ul class="max-w-2xl divide-y divide-border-default rounded-lg border border-border-default">
          <li v-for="doc in documents" :key="doc.titleKey">
            <RouterLink
              :to="i18nRoute({ name: doc.routeName })"
              class="flex items-center justify-between gap-4 p-4 no-underline hover:bg-surface-alt"
            >
              <span>
                <span class="block font-semibold text-ink">{{ $t(doc.titleKey) }}</span>
                <span class="block text-sm text-ink-muted">{{ $t(doc.descKey) }}</span>
              </span>
              <span class="text-ink-muted">&gt;</span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
