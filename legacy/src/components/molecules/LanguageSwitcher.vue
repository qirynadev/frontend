<script lang="ts" setup>
import { useAppStore, useSettingStore } from "@/stores";
import { useRouter } from "vue-router";
import { i18nRoute } from "@/utils";
import Tr from "@/i18n/translation";

const settingStore = useSettingStore();
const appStore = useAppStore();

const router = useRouter();

const handleChangeLocale = async (newLocale: string) => {
  await Tr.switchLanguage(newLocale);

  // Refetch uniquement si on n'a pas encore les données pour cette locale
  if (appStore.fetchedLocale !== newLocale) {
    await appStore.refreshData(newLocale);
  }

  const currentRoute = router.currentRoute.value;
  const currentRouteName = String(currentRoute.name);
  const routeNameWithoutLocale = currentRouteName.replace(/^(fr|en)\./, "");

  // If the route has dynamic params (slugs, ids, tokens), redirect to home
  // because these params may be locale-dependent
  const hasDynamicParams = Object.keys(currentRoute.params).length > 0;

  if (hasDynamicParams) {
    router.push(i18nRoute({ name: "home" }));
  } else {
    router.push(
      i18nRoute({
        name: routeNameWithoutLocale,
        query: currentRoute.query,
      }),
    );
  }
};
</script>

<template>
  <div
    role="button"
    class="flex items-center justify-center"
    @click="handleChangeLocale(settingStore.getLocale === 'fr' ? 'en' : 'fr')"
  >
    <img
      :src="`/images/flags/${settingStore.getLocale === 'fr' ? 'en.svg' : 'fr.png'}`"
      alt="lang flag"
      class="w-[26px] h-[26px]"
    />
  </div>
</template>
