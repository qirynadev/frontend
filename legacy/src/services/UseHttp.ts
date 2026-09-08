import router from "@/router";
import { useAuthStore, useSettingStore } from "@/stores";
import { i18nRoute } from "@/utils";
import axios, { AxiosError } from "axios";
import { computed } from "vue";

export const useHttp = (useToken: boolean = false) => {
  //base url de connexion
  const $http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  });

  let isRefresh = false;

  try {
    $http.interceptors.request.use((config: any) => {
      const authStore = useAuthStore();
      const tokenStored = computed(() => authStore.token);
      const settingStore = useSettingStore();
      const locale = computed(() => settingStore.getLocale);

      if (locale.value) {
        config.headers["lang"] = locale.value;
      }

      if (tokenStored && useToken) {
        config.headers["Authorization"] = `Bearer ${tokenStored.value ?? tokenStored}`;
      }

      return config;
    });

    // Intercept responses
    $http.interceptors.response.use(
      (response) => response,
      function (error: AxiosError) {
        const authStore = useAuthStore();
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        if (error.response?.status === 401) {
          authStore.setToken(null);
          const currentRoute = router?.currentRoute.value?.name as string;
          if (!currentRoute?.includes("signin")) {
            router.push(i18nRoute({ name: "signin", query: { redirect: router.currentRoute.value.fullPath } }));
          }
        }

        if (error.code == "ERR_NETWORK" && !isRefresh) {
          authStore.setToken(null);
          if (router?.currentRoute.value?.name !== "login") {
            isRefresh = true;
          }
        }

        isRefresh = false;
        return Promise.reject(error);
      },
    );
  } catch (err) {}

  return $http;
};
