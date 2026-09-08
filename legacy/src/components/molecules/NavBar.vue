<script lang="ts" setup>
import ButtonGeneral from "@/components/atoms/ButtonGeneral.vue";
import WebUserInfo from "@/components/atoms/WebUserInfo.vue";
import Menu from "@/components/molecules/Menu.vue";
import { useSideBar } from "@/hooks/useSetting";
import { type Ref, computed, onBeforeMount, reactive, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import SideBar from "./SideBar.vue";
import LanguageSwitcher from "@/components/molecules/LanguageSwitcher.vue";
import { useAppStore } from "@/stores";
import { i18nRoute } from "@/utils";

const { handleChangeSideBarState, sideBarState } = useSideBar();
const appStore = useAppStore();

const showMobileNavBar: Ref<boolean> = ref(true);

const router = useRouter();
const route = useRoute();

// Pages auth : elles ont leur propre navbar simplifiée, on masque le NavBar global
const AUTH_ROUTES = ["signin", "signup", "password-forgot", "reset-password"];
const isAuthPage = computed(() => AUTH_ROUTES.some((r) => String(route.name ?? "").endsWith(`.${r}`)));

// Pages avec leur propre header mobile Figma (menu/logo/notifications) : on masque la navbar
// mobile globale pour éviter le doublon. Desktop non concerné (NavBar desktop inchangée).
const CUSTOM_MOBILE_HEADER_ROUTES = [
  "home",
  "destinations",
  "choose-destination",
  "schools",
  "school-presentation",
  "choose-language",
  "user-messages",
  "profilage-landing",
  "profilage-formulas",
  "living-formulas",
  "user-project",
  "order-success",
  "user-courses-teachers",
  "profilage-project",
  "area-formula",
  "living-choose-destination",
  "user-project-living",
  "courses-formulas",
  "user-settings",
  "user-settings-notifications",
  "user-settings-theme",
  "legals",
];
const isHomeRoute = computed(
  () =>
    ["/", "/fr", "/en"].includes(route.path) ||
    CUSTOM_MOBILE_HEADER_ROUTES.some((r) => String(route.name ?? "").endsWith(`.${r}`)),
);

function myFunction(x: any) {
  if (x.matches) {
    showMobileNavBar.value = true;
  } else {
    showMobileNavBar.value = false;
  }
}

var x = window.matchMedia("(max-width: 48rem)");
myFunction(x);
x.addListener(myFunction);

const showProfilage = () =>
  router.push(
    i18nRoute({
      name: "profilage",
    }),
  );

const view = reactive({
  topOfPage: false,
});

const profilingLabel = computed(() => appStore.menuData?.profiling?.menu ?? "Profilage");

const isStudiesPage = computed(() =>
  [".destinations", ".schools", ".area-formula", ".area-mentors", ".mentor-presentation", ".school-presentation"].some(
    (suffix) => String(route.name ?? "").endsWith(suffix),
  ),
);

const handleScroll = () => {
  if (window.scrollY > 0) {
    view.topOfPage = true;
  } else {
    view.topOfPage = false;
  }
};

onBeforeMount(() => {
  window.addEventListener("scroll", handleScroll);
});
</script>

<template>
  <!-- Web navbar -->
  <div
    :class="{
      onScroll: view.topOfPage,
      homePage: ['/', '/fr', '/en'].includes($route.path),
      studyPage: isStudiesPage,
    }"
    class="custom_navbar h-20 py-1 fixed top-0 left-0 w-full bg-surface z-50"
    v-if="!showMobileNavBar && !isAuthPage"
  >
    <div class="global-container flex items-center justify-between relative">
      <div class="flex items-center justify-start">
        <RouterLink :to="i18nRoute({ name: 'home' })" class="logo mr-12.5">
          <img src="@/assets/images/logo-n.png" alt="Qiryna" />
        </RouterLink>

        <!-- Menu list -->
        <Menu class="menu-list-container" />
      </div>

      <div class="flex items-center gap-x-5 h-full">
        <router-link
          :to="i18nRoute({ name: 'profilage' })"
          class="profilage-pill text-white rounded-full px-6 h-12 flex items-center justify-center gap-2 text-[1rem] font-semibold"
        >
          <img src="/images/light.svg" class="size-6" />
          {{ profilingLabel }}
        </router-link>

        <LanguageSwitcher />

        <!-- user info -->
        <WebUserInfo />
      </div>
    </div>
  </div>

  <!-- Mobile navbar -->
  <div
    :class="{
      onScroll: view.topOfPage,
      homePage: ['/', '/fr', '/en'].includes($route.path),
    }"
    class="custom_navbar h-12.5 flex justify-between items-center lg:hidden py-1 fixed top-0 left-0 w-full z-50"
    v-if="showMobileNavBar && !isHomeRoute"
  >
    <button
      class="burger-container text-[2.1875rem] bg-transparent border-0 p-0 leading-none"
      @click.prevent="handleChangeSideBarState()"
      :aria-label="sideBarState.show ? 'Fermer le menu' : 'Ouvrir le menu'"
      :aria-expanded="sideBarState.show"
      aria-controls="mobile-sidebar"
      type="button"
    >
      ☰
    </button>

    <div class="mobile-logo" :class="{ 'home-page': ['/', '/fr', '/en'].includes($route.path) }">
      <RouterLink to="/">
        <img src="@/assets/images/logo_blanc.png" />
      </RouterLink>
    </div>
    <div class="mobile-logo-2" :class="{ 'home-page': ['/', '/fr', '/en'].includes($route.path) }">
      <RouterLink to="/">
        <img src="@/assets/images/logo-n.png" />
      </RouterLink>
    </div>

    <div class="others flex justify-center items-center">
      <ButtonGeneral
        title=""
        className="w-12.5 h-7.5 bg-[red]!"
        :withIcon="true"
        iconPosition="left"
        iconURL="/images/light.svg"
        @pressed="showProfilage"
      />
    </div>
  </div>

  <!-- Sidebar (multi-root component → manages its own visibility via sideBarState) -->
  <SideBar />
</template>
