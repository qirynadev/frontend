<script lang="ts" setup>
import AlertMessage from "@/components/atoms/AlertMessage.vue";
import router from "@/router";
import { useAuthStore, useSettingStore } from "@/stores";
import { isEmail } from "@/utils/is";
import { ElNotification } from "element-plus";
//import { formatPhoneNumberOnly } from '@/utils/numbers';
import { type ComputedRef, type Ref, computed, onBeforeMount, ref, unref } from "vue";
import { useI18n } from "vue-i18n";
import { i18nRoute } from "@/utils";
import LanguageSwitcher from "@/components/molecules/LanguageSwitcher.vue";
import ButtonGeneral from "@/components/atoms/ButtonGeneral.vue";
import { storeToRefs } from "pinia";
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/20/solid";
import { ExclamationCircleIcon } from "@heroicons/vue/24/outline";
import PasswordMeter from "vue-simple-password-meter";
import Popper from "vue3-popper";

const { t } = useI18n();
const authStore = useAuthStore();
const { resetPassword } = authStore;
const { setRegisterConfig } = useSettingStore();

const isError: Ref<{
  message: string;
}> = ref({
  message: "",
});
const formRef = ref();

const resetPasswordForm: Ref<{
  email: string;
  newPassword: string;
  confPassword: string;
  token: string;
}> = ref({
  email: "",
  newPassword: "",
  confPassword: "",
  token: "",
});

const isLoading: Ref<boolean> = ref(false);
const isNewPasswordVisible = ref(false);
const isConfPasswordVisible = ref(false);

const passwordRules = computed(() => {
  const pwd = resetPasswordForm.value.newPassword;
  return [
    { label: t("password-rule.min-length"), valid: pwd.length >= 8 },
    { label: t("password-rule.uppercase"), valid: /[A-Z]/.test(pwd) },
    { label: t("password-rule.lowercase"), valid: /[a-z]/.test(pwd) },
    { label: t("password-rule.digit"), valid: /\d/.test(pwd) },
    { label: t("password-rule.special"), valid: /[@$!%*?&\-_#]/.test(pwd) },
  ];
});

var score = ref(0);
var scoreMessage = ref(t("register-form.write-strong-password"));
const onScore = (payload: any) => {
  score.value = payload.score;
  switch (payload.score) {
    case 0:
      scoreMessage.value = t("register-form.risky-password");
      break;
    case 1:
      scoreMessage.value = t("register-form.guessable-password");
      break;
    case 2:
      scoreMessage.value = t("register-form.weak-password");
      break;
    case 3:
      scoreMessage.value = t("register-form.safe-password");
      break;
    case 4:
      scoreMessage.value = t("register-form.secure-password");
      break;
  }
};

const handleSubmit = async () => {
  isLoading.value = true;

  if (isInputWrong()) {
    ElNotification({
      type: "danger",
      message: isError.value.message ?? "",
    });
    isLoading.value = false;
    return;
  }

  const res = await resetPassword(unref(resetPasswordForm));
  isLoading.value = false;

  if (res) {
    // Si le token est présent dans le store → connexion automatique réussie
    if (authStore.token) {
      router.push(i18nRoute({ name: "user-orders" }));
    } else {
      setRegisterConfig("REGISTER");
      router.push(i18nRoute({ name: "signin" }));
    }
    return;
  }
};

// Verify form validator
const isInputWrong = (): boolean => {
  if (!resetPasswordForm.value.email) {
    isError.value.message = t("validation.email-required");

    return true;
  } else {
    if (!isEmail(resetPasswordForm.value.email)) {
      isError.value.message = t("validation.email-invalid");

      return true;
    }
  }

  if (!resetPasswordForm.value.newPassword || !resetPasswordForm.value.confPassword) {
    isError.value.message = t("validation.passwords-required");

    return true;
  } else {
    if (resetPasswordForm.value.newPassword.length < 8 || resetPasswordForm.value.confPassword.length < 8) {
      isError.value.message = t("validation.passwords-min-length");
      return true;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_#])[A-Za-z\d@$!%*?&\-_#]+$/;
    if (!passwordRegex.test(resetPasswordForm.value.newPassword)) {
      isError.value.message = t("validation.password-complexity");
      return true;
    }

    if (resetPasswordForm.value.newPassword !== resetPasswordForm.value.confPassword) {
      isError.value.message = t("validation.passwords-mismatch");
      return true;
    }
  }

  isError.value.message = "";

  return false;
};

const showLoginPage = () => {
  router.push(
    i18nRoute({
      name: "signin",
      params: {
        redirect: router.currentRoute.value.fullPath,
      },
    }),
  );
};

onBeforeMount(() => {
  const query = new URLSearchParams(window.location.search);
  resetPasswordForm.value.email = query.get("email") ?? "";
  resetPasswordForm.value.token = query.get("token") ?? "";
});
</script>

<template>
  <div>
    <!-- Desktop only: custom auth navbar (mobile uses shared NavBar from AppLayout) -->
    <div
      :class="{ onScroll: false }"
      class="custom_navbar hidden lg:block h-[85px] py-1 fixed top-0 left-0 w-full bg-surface z-50 shadow-[0px_2px_5px_#2c2c2c63]"
    >
      <div class="global-container flex items-center justify-between relative">
        <div class="flex items-center justify-start">
          <RouterLink :to="i18nRoute({ name: 'home' })" class="logo mr-[50px]">
            <img src="@/assets/images/logo-n.png" />
          </RouterLink>
        </div>

        <div class="mt-2 flex justify-evenly items-center overflow-hidden gap-x-[18px] h-full">
          <ButtonGeneral
            :title="$t('signin')"
            className="rounded-full uppercasex px-3 flex items-center justify-center gap-1 text-[15px] w-[110px] h-[36px]"
            @pressed="showLoginPage"
          />

          <LanguageSwitcher />
        </div>
      </div>
    </div>

    <div class="register-container global-container">
      <!-- Formulaire de reset password -->
      <div class="w-full">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-x-5">
          <div class="w-full lg:w-5/12">
            <h3 class="text-[26px] font-bold mb-[20px] hidden lg:block">
              {{ $t("reset-password-label") }}
            </h3>
            <p class="mb-5 text-[15px]">
              {{ $t("reset-password-description") }}
            </p>

            <form ref="formRef" @submit.prevent="handleSubmit()">
              <!-- Alert -->
              <AlertMessage place="changePassword-form" />

              <div class="input_form">
                <div class="input-field">
                  <input type="email" v-model="resetPasswordForm.email" required spellcheck="false" />
                  <label class="text-center">Email</label>
                </div>

                <div class="input-field">
                  <input
                    :type="isNewPasswordVisible ? 'text' : 'password'"
                    v-model="resetPasswordForm.newPassword"
                    required
                    spellcheck="false"
                  />
                  <label class="text-center">{{ $t("new-password-label") }}</label>
                  <EyeSlashIcon
                    @click="isNewPasswordVisible = !isNewPasswordVisible"
                    v-if="isNewPasswordVisible"
                    class="w-6 h-6 text-ink-muted absolute right-3 -mt-0.5 bottom-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  />
                  <EyeIcon
                    @click="isNewPasswordVisible = !isNewPasswordVisible"
                    v-else
                    class="w-6 h-6 text-ink-muted absolute right-3 -mt-0.5 bottom-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  />
                </div>
                <div class="w-full mb-4 mt-2">
                  <PasswordMeter @score="onScore($event)" :password="resetPasswordForm.newPassword" />
                  <div class="w-full mt-1 flex *:w-full *:justify-between *:p-0">
                    <div class="w-full flex justify-between items-center">
                      <div id="pswmeter-message" class="rounded cursor-pointer">
                        {{ scoreMessage }}
                      </div>
                      <Popper hover arrow placement="right" :content="t('register-form.password-strength-content')">
                        <ExclamationCircleIcon class="w-6 h-6 text-ink-muted" />
                      </Popper>
                    </div>
                  </div>
                  <ul v-if="resetPasswordForm.newPassword.length > 0" class="mt-2 space-y-1">
                    <li
                      v-for="rule in passwordRules"
                      :key="rule.label"
                      class="flex items-center gap-2 text-[13px]"
                      :class="rule.valid ? 'text-green-600' : 'text-ink-muted'"
                    >
                      <span class="text-[16px] leading-none">{{ rule.valid ? "✓" : "○" }}</span>
                      {{ rule.label }}
                    </li>
                  </ul>
                </div>

                <div class="input-field">
                  <input
                    :type="isConfPasswordVisible ? 'text' : 'password'"
                    v-model="resetPasswordForm.confPassword"
                    required
                    spellcheck="false"
                  />
                  <label class="text-center">{{ $t("confirm-new-password-label") }}</label>
                  <EyeSlashIcon
                    @click="isConfPasswordVisible = !isConfPasswordVisible"
                    v-if="isConfPasswordVisible"
                    class="w-6 h-6 text-ink-muted absolute right-3 -mt-0.5 bottom-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  />
                  <EyeIcon
                    @click="isConfPasswordVisible = !isConfPasswordVisible"
                    v-else
                    class="w-6 h-6 text-ink-muted absolute right-3 -mt-0.5 bottom-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  />
                </div>
                <button
                  class="c-button flex items-center justify-center mt-4"
                  :isLoading="isLoading"
                  @click.prevent="handleSubmit()"
                >
                  {{ $t("change-password-action") }}
                </button>
                <p class="text-center text-[14px] mt-4">
                  {{ $t("remember-password-label") }}
                  <RouterLink :to="i18nRoute({ name: 'signin' })" class="underline text-[#ff3942]">
                    {{ $t("signin") }}
                  </RouterLink>
                </p>
              </div>
            </form>
          </div>
          <div class="hidden lg:block lg:w-7/12">
            <div class="wrapper_img">
              <img src="/images/register-image.jpg" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.global-container {
  padding-right: 15px;
  height: 100%;
}

.register-container {
  margin-top: 70px;
  min-height: auto;

  @media (min-width: 1024px) {
    margin-top: 150px;
    min-height: calc(100vh - 250px) !important;
  }
}

.input-field {
  width: 100%;
  position: relative;

  &:not(:first-child) {
    margin-top: 20px;
  }

  input,
  select {
    width: 100%;
    border-radius: 4px;
    font-size: 14px;
    padding: 6px 12px;
    border: 1.5px solid #c9c9c9;
    background: transparent;
    color: #000000;
    /* box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); */
    outline: none;
    height: 45px;

    &:focus {
      border: 2px solid #ff3942;
    }

    &:focus ~ label,
    &:valid ~ label {
      color: #ff3942;
    }
  }

  label {
    position: absolute;
    top: -10px;
    left: 15px;
    font-size: 16px;
    padding: 0 2px;
    background: var(--color-surface);
    color: var(--color-ink-muted);
    font-size: 14px;
    pointer-events: none;
    transition: 0.3s;
  }
}
.wrapper_img {
  width: 100%;
  img {
    width: 100%;
    height: 100%;
  }
}

.c-button {
  width: 100%;
  background-color: #ff3942;
  padding: 9px 20px;
  border: none;
  border-radius: 5px;
  color: white;
  font-size: 15px;
  font-weight: bold;
}

.po-password-strength-bar {
  background-color: #e9ecef;
  border-radius: 2px;
  transition: all 0.2s linear;
  height: 5px;
  margin-top: 8px;

  &.risky {
    background-color: #f95e68;
    width: 10%;
  }

  &.guessable {
    background-color: #fb964d;
    width: 32.5%;
  }

  &.weak {
    background-color: #fdd244;
    width: 55%;
  }

  &.safe {
    background-color: #b0dc53;
    width: 77.5%;
  }

  &.secure {
    background-color: #35cc62;
    width: 100%;
  }
}

:deep(.popper) {
  background: #ff3942;
  border-radius: 5px;
  color: #fff;
  font-size: 14px;
  padding: 10px;

  &.hover,
  &:hover > #arrow::before {
    background: #9f7e90;
  }

  #arrow::before {
    background: #ff3942;
  }
}
</style>
