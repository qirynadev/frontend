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

const socialRegister = async () => {
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
        pendingToken.value = null;
        return;
      }
    }

    if (!res.success) {
      throw { type: "register-failed" };
    }

    await handleRedirect();
  } catch (error: any) {
    console.error("Erreur inscription Google:", error);

    let errorMessage: string;

    if (error?.type === "cancelled") {
      errorMessage = t("oauth.errors.google.cancelled");
    } else if (error?.type === "no-token") {
      errorMessage = t("oauth.errors.google.no-token");
    } else if (error?.type === "register-failed") {
      errorMessage = t("oauth.errors.google.register-failed");
    } else if (error?.type === "link-failed") {
      errorMessage = t("oauth.errors.google.link-failed");
    } else {
      errorMessage = getErrorMessage(error);
    }

    ElNotification({
      title: t("oauth.errors.title.google-register"),
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
      : router.push(i18nRoute({ name: "user-settings" }));
  }
};
</script>

<template>
  <div class="social-connection flex items-center justify-center border rounded w-full h-full">
    <!-- <GoogleLogin :callback="socialLogin" :auto-login="true" popup-type="token"> -->
    <div
      role="button"
      @click="socialRegister"
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
