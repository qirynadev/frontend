<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { ElConfigProvider } from "element-plus";
import frLocale from "element-plus/es/locale/lang/fr";
import enLocale from "element-plus/es/locale/lang/en";
import { LogoutModal } from "./components/modals";
import { useSettingStore } from "@/stores";
import { applyTheme } from "@/utils/theme";

const { locale } = useI18n();
const elementLocale = computed(() => (locale.value === "fr" ? frLocale : enLocale));

// Réapplique le thème si l'OS change de préférence pendant que "Système" est sélectionné.
const settingStore = useSettingStore();
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
const handleSystemThemeChange = () => {
  if (settingStore.theme === "system") applyTheme("system");
};
onMounted(() => systemThemeQuery.addEventListener("change", handleSystemThemeChange));
onBeforeUnmount(() => systemThemeQuery.removeEventListener("change", handleSystemThemeChange));
</script>

<template>
  <el-config-provider :locale="elementLocale">
    <RouterView />
    <LogoutModal />
  </el-config-provider>
</template>
