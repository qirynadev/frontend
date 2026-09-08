<script lang="ts" setup>
import Loader from "@/components/molecules/Loader.vue";
import { useAuthStore, usePaymentStore } from "@/stores";
import { i18nRoute } from "@/utils";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { googleTokenLogin } from "vue3-google-login";
import { ElNotification, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import iconGoogleStacked from "@/assets/images/login-mobile/icon-google.svg";

withDefaults(defineProps<{ variant?: "pill" | "stacked" }>(), { variant: "pill" });

const { t } = useI18n();
const { authenticateWithSocial, confirmSocialLink } = useAuthStore();
const { iniPayment } = usePaymentStore();

const { redirectUrl, orderData } = storeToRefs(usePaymentStore());

const router = useRouter();
const isLoading = ref<boolean>(false);

// Stockage temporaire du token pour la confirmation
const pendingToken = ref<string | null>(null);

const getErrorMessage = (error: any): string => {
  if (error?.error === "popup_closed_by_user") {
    return t("oauth.errors.google.popup-closed");
  }
  if (error?.error === "access_denied") {
    return t("oauth.errors.google.access-denied");
  }
  if (error?.message?.includes("not found")) {
    return t("oauth.errors.google.login-failed");
  }
  return t("oauth.errors.google.generic");
};

const showLinkConfirmation = async (confirmationData: {
  email: string;
  provider: string;
  existingProviders: string[];
}): Promise<boolean> => {
  const providersText =
    confirmationData.existingProviders.length > 0
      ? confirmationData.existingProviders.join(", ")
      : t("oauth.confirmation.password-account");

  try {
    await ElMessageBox.confirm(
      t("oauth.confirmation.message", {
        email: confirmationData.email,
        providers: providersText,
      }),
      t("oauth.confirmation.title"),
      {
        confirmButtonText: t("oauth.confirmation.confirm"),
        cancelButtonText: t("oauth.confirmation.cancel"),
        type: "warning",
      },
    );
    return true;
  } catch {
    return false;
  }
};

const socialLogin = async () => {
  try {
    isLoading.value = true;

    const response = await googleTokenLogin();

    if (!response) {
      throw { type: "cancelled" };
    }

    if (!response.access_token) {
      throw { type: "no-token" };
    }

    pendingToken.value = response.access_token;

    const res = await authenticateWithSocial(
      {
        provider: "google",
        token: response.access_token,
      },
      false,
    );

    // Vérifier si une confirmation est requise
    if (res.requiresConfirmation && res.confirmationData) {
      const confirmed = await showLinkConfirmation(res.confirmationData);

      if (confirmed && pendingToken.value) {
        // L'utilisateur a confirmé, procéder à la liaison
        const linkResult = await confirmSocialLink({
          provider: "google",
          token: pendingToken.value,
        });

        if (!linkResult) {
          throw { type: "link-failed" };
        }

        await handleRedirect();
        return;
      } else {
        // L'utilisateur a annulé
        pendingToken.value = null;
        return;
      }
    }

    if (!res.success) {
      throw { type: "login-failed" };
    }

    await handleRedirect();
  } catch (error: any) {
    console.error("Erreur connexion Google:", error);

    let errorMessage: string;

    if (error?.type === "cancelled") {
      errorMessage = t("oauth.errors.google.cancelled");
    } else if (error?.type === "no-token") {
      errorMessage = t("oauth.errors.google.no-token");
    } else if (error?.type === "login-failed") {
      errorMessage = t("oauth.errors.google.login-failed");
    } else if (error?.type === "link-failed") {
      errorMessage = t("oauth.errors.google.link-failed");
    } else {
      errorMessage = getErrorMessage(error);
    }

    ElNotification({
      title: t("oauth.errors.title.google-login"),
      type: "error",
      message: errorMessage,
      duration: 6000,
    });
  } finally {
    isLoading.value = false;
    pendingToken.value = null;
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
      : router.push(i18nRoute({ name: "home" }));
  }
};
</script>

<template>
  <div
    v-if="variant === 'stacked'"
    role="button"
    class="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-hidden rounded-[10px] border border-border-default bg-surface px-1 py-[13px]"
    aria-label="Google"
    @click="socialLogin"
  >
    <Loader v-if="isLoading" class="size-4" />
    <img v-else :src="iconGoogleStacked" class="h-4 w-4 flex-none" alt="" />
    <span class="min-w-0 flex-1 truncate text-center text-[11px] font-semibold text-ink">Google</span>
  </div>
  <div v-else class="social-connection flex items-center justify-center border rounded w-full h-full">
    <!-- <GoogleLogin :callback="socialLogin" :auto-login="true" popup-type="token"> -->
    <div
      role="button"
      @click="socialLogin"
      class="flex items-center justify-center h-full w-full gap-3"
      aria-label="Google"
    >
      <Loader v-if="isLoading" />
      <img class="h-6 w-6" src="/images/socials/google.svg" alt="" />
      Google
    </div>
    <!-- </GoogleLogin> -->
  </div>
</template>

<style scoped lang="scss">
.g-btn-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
