<script lang="ts" setup>
import Loader from "@/components/molecules/Loader.vue";
import { useAuthStore, usePaymentStore } from "@/stores";
import { i18nRoute } from "@/utils";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ElNotification } from "element-plus";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { registerWithLinkedin } = useAuthStore();
const { iniPayment } = usePaymentStore();

const { redirectUrl, orderData } = storeToRefs(usePaymentStore());

const router = useRouter();
const isLoading = ref<boolean>(false);
const clientId = ref<string>(import.meta.env.VITE_LINKEDIN_CLIENT_ID);
const redirectUri = ref<string>(location.origin + router.currentRoute.value.path);

const showError = (errorMessage: string) => {
  ElNotification({
    title: t("oauth.errors.title.linkedin-register"),
    type: "error",
    message: errorMessage,
    duration: 6000,
  });
};

const generateSecureState = (): string => {
  const array = new Uint32Array(4);
  crypto.getRandomValues(array);
  return Array.from(array, (n) => n.toString(36)).join("");
};

const registerWithLinkedIn = () => {
  try {
    if (!clientId.value) {
      showError(t("oauth.errors.linkedin.not-configured"));
      return;
    }

    const scope = encodeURIComponent("openid profile email");
    const state = generateSecureState(); // State CSRF cryptographiquement sécurisé
    sessionStorage.setItem("linkedin_oauth_state", state);

    window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId.value}&redirect_uri=${encodeURIComponent(redirectUri.value)}&scope=${scope}&state=${state}`;
  } catch (error: any) {
    console.error("Erreur initialisation LinkedIn:", error);
    showError(t("oauth.errors.linkedin.generic"));
  }
};

const handleAuthCallback = async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const error = urlParams.get("error");

    // Vérifier s'il y a une erreur OAuth
    if (error) {
      if (error === "user_cancelled_login" || error === "user_cancelled_authorize") {
        throw { type: "cancelled" };
      }
      if (error === "access_denied") {
        throw { type: "access-denied" };
      }
      throw { type: "generic" };
    }

    // Vérifier le code et le state
    if (code && state) {
      const storedState = sessionStorage.getItem("linkedin_oauth_state");

      // Vérification CSRF
      if (state !== storedState) {
        throw { type: "csrf-error" };
      }

      // Nettoyer le state stocké
      sessionStorage.removeItem("linkedin_oauth_state");

      isLoading.value = true;

      const res = await registerWithLinkedin(code, redirectUri.value);

      if (!res) {
        throw { type: "register-failed" };
      }

      // Nettoyer l'URL des paramètres OAuth
      window.history.replaceState({}, document.title, router.currentRoute.value.path);
      await handleRedirect();
    }
  } catch (error: any) {
    console.error("Erreur authentification LinkedIn:", error);

    let errorMessage: string;

    switch (error?.type) {
      case "cancelled":
        errorMessage = t("oauth.errors.linkedin.cancelled");
        break;
      case "access-denied":
        errorMessage = t("oauth.errors.linkedin.access-denied");
        break;
      case "csrf-error":
        errorMessage = t("oauth.errors.linkedin.csrf-error");
        break;
      case "register-failed":
        errorMessage = t("oauth.errors.linkedin.register-failed");
        break;
      default:
        errorMessage = t("oauth.errors.linkedin.generic");
    }

    showError(errorMessage);
    // Nettoyer l'URL en cas d'erreur
    window.history.replaceState({}, document.title, router.currentRoute.value.path);
  } finally {
    isLoading.value = false;
  }
};

const handleRedirect = async () => {
  if (orderData.value !== null) {
    const resp = await iniPayment(orderData.value);
    if (resp) {
      window.location.href = redirectUrl.value;
    }
  } else {
    router.currentRoute.value.query.redirect
      ? router.push(router.currentRoute.value.query.redirect as string)
      : router.push(i18nRoute({ name: "user-settings" }));
  }
};

onMounted(() => {
  handleAuthCallback();
});
</script>

<template>
  <div class="social-connection flex items-center justify-center">
    <button
      @click="registerWithLinkedIn"
      :disabled="isLoading"
      class="flex items-center justify-center gap-3 w-full h-full disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="LinkedIn"
    >
      <Loader v-if="isLoading" />
      <img v-else src="/images/socials/linkedin.svg" class="h-6 w-6" alt="" />
      LinkedIn
    </button>
  </div>
</template>
