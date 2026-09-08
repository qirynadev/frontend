<script lang="ts" setup>
import Footer from "@/components/molecules/Footer.vue";
import NavBar from "@/components/molecules/NavBar.vue";
import CookieBanner from "@/components/atoms/CookieBanner.vue";
import { useSettingStore, useAppStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useHead } from "@unhead/vue";
import { useSeo } from "@/composables/useSeo";
import { initAnalytics } from "@/utils/analytics";

const settingStore = useSettingStore();
const { getLocale } = storeToRefs(settingStore);

// Charge la balise GA dès que l'ID (settings.site.ga_id) est disponible,
// sans attendre une navigation — nécessaire pour la détection par Google.
const appStore = useAppStore();
watch(
  () => (appStore.settings as any)?.site?.ga_id,
  (id) => {
    if (id) initAnalytics();
  },
  { immediate: true }
);

const route = useRoute();
const router = useRouter();

// SEO de base appliqué à toutes les pages publiques (les pages individuelles
// peuvent surcharger title/description via leur propre appel à useSeo()).
useSeo();

const DEFAULT_LOCALE = (import.meta.env.VITE_DEFAULT_LOCALE as string) || "fr";
const SUPPORTED_LOCALES = ((import.meta.env.VITE_SUPPORTED_LOCALES as string) || "fr,en")
  .split(",")
  .map((l) => l.trim())
  .filter(Boolean);

const origin = () => (typeof window !== "undefined" ? window.location.origin : "");

// Locale courante déduite du nom de route (ex: "fr.home" → "fr")
const currentLocale = computed(() => {
  const match = String(route.name || "").match(/^([a-z]{2})\./);
  return match ? match[1] : DEFAULT_LOCALE;
});

// Lien canonique (sans query string)
const canonicalHref = computed(() => origin() + route.path);

// Alternates hreflang : même route résolue pour chaque locale supportée
const alternateLinks = computed(() => {
  const name = String(route.name || "");
  const base = name.replace(/^[a-z]{2}\./, "");
  if (!base) return [];

  const links: { rel: string; hreflang: string; href: string }[] = [];
  for (const loc of SUPPORTED_LOCALES) {
    try {
      const resolved = router.resolve({
        name: `${loc}.${base}`,
        params: route.params,
        query: route.query,
      });
      links.push({ rel: "alternate", hreflang: loc, href: origin() + resolved.path });
    } catch {
      // la route peut ne pas exister pour cette locale → ignorée
    }
  }
  if (links.length) {
    links.push({ rel: "alternate", hreflang: "x-default", href: canonicalHref.value });
  }
  return links;
});

useHead({
  htmlAttrs: { lang: currentLocale },
  link: computed(() => [{ rel: "canonical", href: canonicalHref.value }, ...alternateLinks.value]),
});
</script>

<template>
  <div class="app">
    <NavBar v-if="!$route.meta.hideNav" />
    <main class="main-container">
      <router-view :key="getLocale">
        <template #default="{ Component, route }">
          <keep-alive>
            <component :is="Component" :key="route.fullPath"></component>
          </keep-alive>
        </template>
      </router-view>
    </main>
    <Footer v-if="!$route.meta.hideFooter" />
    <CookieBanner />
  </div>
</template>

<style>
.app {
  position: relative;
  width: 100%;
}

@media only screen and (max-width: 768px) {
  .footer-c {
    display: none;
  }
}
</style>
