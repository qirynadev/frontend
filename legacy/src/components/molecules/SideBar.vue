<script lang="ts" setup>
import { useSideBar } from "@/hooks/useSetting";
import { useAppStore, useAuthStore } from "@/stores";
import { i18nRoute } from "@/utils";
import { type ComputedRef, computed } from "vue";
import router from "@/router";
import logo from "@/assets/images/sidebar-mobile/logo.png";
import iconClose from "@/assets/images/sidebar-mobile/icon-close.svg";
import iconAvatar from "@/assets/images/sidebar-mobile/icon-avatar.svg";
import bgSchool from "@/assets/images/sidebar-mobile/bg-school.svg";
import bgOrientation from "@/assets/images/sidebar-mobile/bg-orientation.svg";
import bgHousing from "@/assets/images/sidebar-mobile/bg-housing.svg";
import bgLanguage from "@/assets/images/sidebar-mobile/bg-language.svg";
import bgSettings from "@/assets/images/sidebar-mobile/bg-settings.svg";
import iconChevronRight from "@/assets/images/sidebar-mobile/icon-chevron-right.svg";
import iconChevronRightPurple from "@/assets/images/sidebar-mobile/icon-chevron-right-purple.svg";
import iconHelp from "@/assets/images/sidebar-mobile/icon-help.svg";

const authStore = useAuthStore();
const appStore = useAppStore();
const { handleHideSideBar, sideBarState } = useSideBar();

const showSideBar: ComputedRef<boolean> = computed(() => sideBarState?.value.show);

const services = [
  { key: "school", label: "home-mobile-quick-school", bg: bgSchool },
  { key: "orientation", label: "mobile-nav-orientation", bg: bgOrientation },
  { key: "housing", label: "home-mobile-quick-housing", bg: bgHousing },
  { key: "language", label: "home-mobile-quick-language", bg: bgLanguage },
];

// Logement/Cours exigent un slug de destination — pas de page générique, même destination par
// défaut que sur Home mobile / FichesEcolesSection.vue → goSchools(). Écoles passe par l'écran
// de choix de destination dédié (plus de slug en dur).
const goToService = (key: string) => {
  handleHideSideBar();
  if (key === "school") {
    router.push(i18nRoute({ name: "choose-destination" }));
  } else if (key === "orientation") {
    router.push(i18nRoute({ name: "profilage" }));
  } else if (key === "housing") {
    router.push(i18nRoute({ name: "living", params: { slug: "france" } }));
  } else if (key === "language") {
    const slug = (appStore.menuData?.courses as any)?.sub_menus?.[0]?.slug;
    router.push(slug ? i18nRoute({ name: "courses", params: { slug } }) : i18nRoute({ name: "home" }));
  }
};

const handleLogout = async () => {
  handleHideSideBar();
  await authStore.logout();
  router.push(i18nRoute({ name: "home" }));
};
</script>

<template>
  <!-- Overlay -->
  <div v-if="showSideBar" class="fixed inset-0 z-[55] bg-black/70" @click="handleHideSideBar()"></div>

  <!-- Drawer (z-[60] : doit rester au-dessus de MobileAppBottomNav, qui est en z-50 et fait
       partie du contenu de page monté après le NavBar/SideBar dans le DOM — à z-index égal,
       la bottom nav gagnerait le stacking et passerait devant le tiroir) -->
  <div
    class="fixed left-0 top-0 z-[60] flex h-full w-[20.6875rem] max-w-[85vw] flex-col gap-[0.3125rem] overflow-y-auto rounded-br-[1.875rem] rounded-tr-[1.875rem] bg-surface shadow-[0.9375rem_0_2.5rem_0_rgba(0,0,0,0.15)] transition-transform duration-300"
    :class="showSideBar ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Header -->
    <div
      class="flex w-full items-center justify-between border-b border-[rgba(248,250,252,0.5)] px-6 pb-[1.3125rem] pt-8"
    >
      <RouterLink
        :to="i18nRoute({ name: 'home' })"
        class="relative h-[2.4375rem] w-[7.8125rem] overflow-hidden"
        @click="handleHideSideBar()"
      >
        <img
          :src="logo"
          alt="Qiryna"
          class="absolute left-[-4.88%] top-[-63.5%] h-[251.38%] w-[117.84%] max-w-none"
        />
      </RouterLink>
      <button
        type="button"
        class="flex size-9 flex-none items-center justify-center rounded-full bg-[#f3f1fc] shadow-[0_0.0625rem_0.0625rem_rgba(0,0,0,0.05)]"
        aria-label="Fermer le menu"
        @click="handleHideSideBar()"
      >
        <img :src="iconClose" class="size-5" alt="" />
      </button>
    </div>

    <div class="flex w-full flex-col gap-7">
      <div class="flex w-full flex-col items-start gap-[0.375rem]">
        <!-- Welcome / user -->
        <template v-if="!authStore.user">
          <div class="flex w-full items-center px-6 pb-5 pt-[0.5625rem]">
            <div class="flex size-[3.6875rem] flex-none items-center justify-center rounded-full bg-[#f2effb]">
              <img :src="iconAvatar" class="size-7" alt="" />
            </div>
            <div class="flex flex-col items-start pl-4">
              <p class="text-lg font-semibold text-ink">{{ $t("sidebar-welcome-title") }}</p>
              <p class="pt-0.5 text-xs text-ink">{{ $t("sidebar-welcome-text") }}</p>
            </div>
          </div>
          <div class="flex w-full flex-col items-start gap-[0.625rem] px-6 pb-6">
            <RouterLink
              :to="i18nRoute({ name: 'signin' })"
              class="flex w-full items-center justify-center rounded-[0.625rem] bg-[#4211f8] py-[0.875rem] no-underline"
              @click="handleHideSideBar()"
            >
              <span class="text-sm font-semibold text-white">{{ $t("signin-me") }}</span>
            </RouterLink>
            <RouterLink
              :to="i18nRoute({ name: 'signup' })"
              class="flex w-full items-center justify-center rounded-[0.625rem] border border-[#2605f3] bg-surface py-[0.9375rem] no-underline"
              @click="handleHideSideBar()"
            >
              <span class="text-sm font-semibold text-[#2605f3]">{{ $t("signup") }}</span>
            </RouterLink>
          </div>
        </template>
        <template v-else>
          <RouterLink
            :to="i18nRoute({ name: 'user-settings' })"
            class="flex w-full items-center px-6 pb-5 pt-[0.5625rem] no-underline"
            @click="handleHideSideBar()"
          >
            <div class="size-[3.6875rem] flex-none overflow-hidden rounded-full bg-[#f2effb]">
              <img :src="authStore.user?.profile?.photo ?? iconAvatar" class="size-full object-cover" alt="" />
            </div>
            <div class="flex min-w-0 flex-col items-start pl-4">
              <p class="truncate text-lg font-semibold text-ink">{{ authStore.user?.name }}</p>
              <p class="truncate pt-0.5 text-xs text-ink">{{ authStore.user?.email }}</p>
            </div>
          </RouterLink>
        </template>

        <div class="w-full px-6"><div class="h-px w-full border-t border-[#e3e0f4]"></div></div>

        <!-- Nos services -->
        <div class="flex w-full flex-col gap-[0.375rem]">
          <p
            class="px-6 pb-[0.65625rem] pt-[0.625rem] text-[0.625rem] font-medium uppercase tracking-[0.0625rem] text-[#94a3b8]"
          >
            {{ $t("sidebar-services-title") }}
          </p>
          <div class="flex w-full flex-col px-4">
            <button
              v-for="service in services"
              :key="service.key"
              type="button"
              class="flex w-full items-center justify-between rounded-2xl p-3 text-left"
              @click="goToService(service.key)"
            >
              <div class="flex items-center">
                <img :src="service.bg" class="size-10 flex-none" alt="" />
                <p class="pl-3 text-sm font-medium text-ink">{{ $t(service.label) }}</p>
              </div>
              <img :src="iconChevronRight" class="size-4 flex-none" alt="" />
            </button>
          </div>
        </div>

        <div class="w-full px-6"><div class="h-px w-full border-t border-[#e3e0f4]"></div></div>

        <!-- Autre -->
        <div class="flex w-full flex-col gap-[0.375rem]">
          <p
            class="px-6 pb-[0.65625rem] pt-[0.625rem] text-[0.625rem] font-medium uppercase tracking-[0.0625rem] text-[#94a3b8]"
          >
            {{ $t("sidebar-other-title") }}
          </p>
          <div class="flex w-full flex-col px-4">
            <RouterLink
              :to="i18nRoute({ name: 'user-settings' })"
              class="flex w-full items-center justify-between rounded-2xl p-3 no-underline"
              @click="handleHideSideBar()"
            >
              <div class="flex items-center">
                <img :src="bgSettings" class="size-10 flex-none" alt="" />
                <p class="pl-3 text-sm font-medium text-ink">{{ $t("sidebar-settings") }}</p>
              </div>
              <img :src="iconChevronRight" class="size-4 flex-none" alt="" />
            </RouterLink>
            <!-- Déconnexion : hors Figma (seul l'état invité est maquetté), nécessaire pour un utilisateur connecté -->
            <button
              v-if="authStore.user"
              type="button"
              class="flex w-full items-center justify-between rounded-2xl p-3 text-left"
              @click="handleLogout"
            >
              <div class="flex items-center">
                <div class="flex size-10 flex-none items-center justify-center rounded-full bg-[#fef2f2]">
                  <svg class="size-4 text-[#ef4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
                <p class="pl-3 text-sm font-medium text-[#ef4444]">{{ $t("menu.account.logout") }}</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Besoin d'aide -->
      <RouterLink
        :to="i18nRoute({ name: 'contact' })"
        class="mx-6 mb-5 flex items-center gap-[0.6875rem] rounded-[0.625rem] bg-surface-tint px-[0.5625rem] py-[0.625rem] no-underline"
        @click="handleHideSideBar()"
      >
        <div class="flex size-11 flex-none items-center justify-center rounded-full bg-[#e8e2fd]">
          <img :src="iconHelp" class="size-6" alt="" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-bold text-ink">{{ $t("mobile-help-title") }}</p>
          <p class="text-[0.625rem] text-ink">{{ $t("sidebar-help-text") }}</p>
        </div>
        <img :src="iconChevronRightPurple" class="size-4 flex-none" alt="" />
      </RouterLink>
    </div>
  </div>
</template>
