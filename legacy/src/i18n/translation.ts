import i18n from "@/i18n";
import { useAppStore, useSettingStore } from "@/stores";
import { nextTick } from "vue";

const Trans = {
  get currentLocale() {
    return i18n.global.locale.value;
  },

  get defaultLocale() {
    return import.meta.env.VITE_DEFAULT_LOCALE;
  },

  guessDefaultLocale() {
    const userPersistedLocale = Trans.getPersistedLocale();
    if (userPersistedLocale) {
      return userPersistedLocale;
    }
    const userPreferredLocale = Trans.getUserLocale();
    if (Trans.isLocaleSupported(userPreferredLocale.locale)) {
      return userPreferredLocale.locale;
    }
    if (Trans.isLocaleSupported(userPreferredLocale.localeNoRegion)) {
      return userPreferredLocale.localeNoRegion;
    }

    return Trans.defaultLocale;
  },

  isLocaleSupported(locale: string) {
    return Trans.supportedLocales.includes(locale);
  },

  getUserLocale() {
    const locale = window.navigator.language || Trans.defaultLocale;
    return {
      locale: locale,
      localeNoRegion: locale.split("-")[0],
    };
  },

  getPersistedLocale() {
    const persistedLocale = useSettingStore().getLocale;
    if (Trans.isLocaleSupported(persistedLocale)) {
      return persistedLocale;
    } else {
      return null;
    }
  },

  get supportedLocales() {
    return import.meta.env.VITE_SUPPORTED_LOCALES.split(",");
  },

  getRouteLocale(route: any) {
    const routeName = typeof route?.name === "string" ? route.name : "";
    const routeLocale = routeName.split(".")[0];

    return Trans.isLocaleSupported(routeLocale) ? routeLocale : null;
  },

  set currentLocale(newLocale: string) {
    i18n.global.locale.value = newLocale;
  },

  async switchLanguage(newLocale: string) {
    await Trans.loadLocaleMessages(newLocale);
    Trans.currentLocale = newLocale;
    const htmlElement = document.querySelector("html");
    if (htmlElement) {
      htmlElement.setAttribute("lang", newLocale);
    }

    useSettingStore().setLocale(newLocale);
  },

  async loadLocaleMessages(locale: string) {
    if (!i18n.global.availableLocales.includes(locale)) {
      const messages = await import(`@/i18n/locales/${locale}.json`);
      i18n.global.setLocaleMessage(locale, messages.default);
    }

    return nextTick();
  },

  async routeMiddleware(to: any, _from: any, next: any) {
    const appStore = useAppStore();

    const paramLocale = Trans.getRouteLocale(to) ?? Trans.guessDefaultLocale();

    if (!Trans.isLocaleSupported(paramLocale)) {
      return next(Trans.guessDefaultLocale());
    }

    await Trans.switchLanguage(paramLocale);

    if (!appStore.isDataFetched || appStore.fetchedLocale !== paramLocale) {
      await appStore.refreshData(paramLocale);
    }

    // Restriction d'IP active (back-office) → /all-data a renvoyé 403 :
    // on bascule sur la page « Coming soon » au lieu d'un site vide.
    if (appStore.isAccessRestricted && to.name !== "maintenance") {
      return next({ name: "maintenance" });
    }

    return next();
  },
};

export default Trans;
