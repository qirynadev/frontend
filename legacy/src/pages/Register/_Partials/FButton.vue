<script lang="ts" setup>
import { useAuthStore, usePaymentStore } from "@/stores";
import { i18nRoute } from "@/utils";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { HFaceBookLogin } from "@healerlab/vue3-facebook-login";
import Loader from "@/components/molecules/Loader.vue";
import { ElNotification, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { authenticateWithSocial, confirmSocialLink } = useAuthStore();
const { iniPayment } = usePaymentStore();

const { redirectUrl, orderData } = storeToRefs(usePaymentStore());

const router = useRouter();
const isLoading = ref<boolean>(false);

const appId = ref<string>(import.meta.env.VITE_FACEBOOK_CLIENT_ID);

// Stockage temporaire du token pour la confirmation
const pendingToken = ref<string | null>(null);

const getErrorMessage = (error: any): string => {
  if (error?.status === "loginCancelled" || error?.error === "popup_closed_by_user") {
    return t("oauth.errors.facebook.popup-closed");
  }
  if (error?.error === "access_denied" || error?.status === "not_authorized") {
    return t("oauth.errors.facebook.access-denied");
  }
  return t("oauth.errors.facebook.generic");
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

const socialRegister = async (response: any) => {
  try {
    isLoading.value = true;

    if (!response?.authResponse?.accessToken) {
      throw { type: "no-token" };
    }

    pendingToken.value = response.authResponse.accessToken;

    const res = await authenticateWithSocial(
      {
        provider: "facebook",
        token: response.authResponse.accessToken,
      },
      false,
    );

    // Vérifier si une confirmation est requise
    if (res.requiresConfirmation && res.confirmationData) {
      const confirmed = await showLinkConfirmation(res.confirmationData);

      if (confirmed && pendingToken.value) {
        const linkResult = await confirmSocialLink({
          provider: "facebook",
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
    console.error("Erreur inscription Facebook:", error);

    let errorMessage: string;

    if (error?.type === "no-token") {
      errorMessage = t("oauth.errors.facebook.no-token");
    } else if (error?.type === "register-failed") {
      errorMessage = t("oauth.errors.facebook.register-failed");
    } else if (error?.type === "link-failed") {
      errorMessage = t("oauth.errors.facebook.link-failed");
    } else {
      errorMessage = getErrorMessage(error);
    }

    ElNotification({
      title: t("oauth.errors.title.facebook-register"),
      type: "error",
      message: errorMessage,
      duration: 6000,
    });
  } finally {
    isLoading.value = false;
    pendingToken.value = null;
  }
};

const onFailure = (error: any) => {
  console.error("Échec authentification Facebook:", error);

  let errorMessage: string;

  if (error?.status === "loginCancelled") {
    errorMessage = t("oauth.errors.facebook.cancelled");
  } else if (error?.status === "not_authorized") {
    errorMessage = t("oauth.errors.facebook.access-denied");
  } else {
    errorMessage = t("oauth.errors.facebook.generic");
  }

  ElNotification({
    title: t("oauth.errors.title.facebook-register"),
    type: "error",
    message: errorMessage,
    duration: 6000,
  });
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
  <div class="social-connection flex items-center justify-center">
    <HFaceBookLogin
      v-slot="fbLogin"
      :app-id="appId"
      @onSuccess="socialRegister"
      @onFailure="onFailure"
      scope="email,public_profile"
      fields="id,name,email,first_name,last_name,birthday"
    >
      <button class="flex items-center justify-center gap-3" aria-label="Facebook" @click="fbLogin.initFBLogin">
        <Loader v-if="isLoading" class="size-2 -mt-2" />
        <img src="/images/socials/facebook.svg" class="h-6 w-6" alt="" />
        Facebook
      </button>
    </HFaceBookLogin>
  </div>
</template>
