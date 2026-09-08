// Import our custom CSS
import "./assets/styles/tailwind.css";
import "./assets/styles/styles.css";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { vMaska } from "maska/vue";
import Popper from "vue3-popper";

import ElementPlus from "element-plus";
import i18n from "./i18n";

import App from "./App.vue";
import router from "./router";

import { createHead } from "@unhead/vue";
import vue3GoogleLogin from "vue3-google-login";
import VueFullscreen from "vue-fullscreen";

import { initAnalytics, trackPageView } from "@/utils/analytics";
import { applyTheme, type ThemeMode } from "@/utils/theme";

// Applique le thème avant le montage pour éviter un flash clair -> sombre.
// Lecture directe du localStorage (même clé que pinia-plugin-persistedstate, id du store = "settingStore").
// Migration ponctuelle (2026-08-08) : le défaut app passe de "system" à "light".
// Les visiteurs déjà passés avant ce changement ont un thème "system" persisté
// depuis l'ancien défaut ; on le force à "light" une seule fois (flag ci-dessous),
// puis le sélecteur Réglages > Thème reprend la main normalement pour tout choix futur.
const THEME_DEFAULT_MIGRATION_KEY = "qiryna_theme_default_light_migration";
const readInitialTheme = (): ThemeMode => {
  try {
    const raw = localStorage.getItem("settingStore");
    const parsed = raw ? JSON.parse(raw) : null;

    if (!localStorage.getItem(THEME_DEFAULT_MIGRATION_KEY)) {
      localStorage.setItem(THEME_DEFAULT_MIGRATION_KEY, "1");
      if (parsed) {
        parsed.theme = "light";
        localStorage.setItem("settingStore", JSON.stringify(parsed));
      }
      return "light";
    }

    return parsed?.theme ?? "light";
  } catch {
    return "light";
  }
};
applyTheme(readInitialTheme());

const app = createApp(App);
const head = createHead();

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
app.use(head);
app.use(i18n);
app.use(VueFullscreen);

app.use(ElementPlus);
app.use(vue3GoogleLogin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
});

app.directive("maska", vMaska);

app.component("Popper", Popper);

app.mount("#app");

// Google Analytics (RGPD : ne s'active que si VITE_GA_ID défini ET cookies acceptés)
initAnalytics();
router.afterEach((to) => {
  trackPageView(to.fullPath);
});

// Remove the initial loader after Vue has rendered
const loader = document.querySelector(".js-loader") as HTMLElement | null;
if (loader) {
  loader.classList.add("js-loader--hidden");
  loader.addEventListener("transitionend", () => loader.remove(), { once: true });
}
