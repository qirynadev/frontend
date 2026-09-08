<script lang="ts" setup>
import AlertMessage from "@/components/atoms/AlertMessage.vue";
import router from "@/router";
import { useAppStore, useAuthStore, usePaymentStore, useSettingStore } from "@/stores";
import { isEmail } from "@/utils/is";
import { ElNotification } from "element-plus";
import { type ComputedRef, type Ref, computed, onBeforeMount, ref, unref } from "vue";
import { i18nRoute } from "@/utils";
import LanguageSwitcher from "@/components/molecules/LanguageSwitcher.vue";
import Tr from "@/i18n/translation";
import ButtonGeneral from "@/components/atoms/ButtonGeneral.vue";
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/20/solid";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  ChevronDownIcon,
} from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";
import { calculerAge } from "@/utils";
import PasswordMeter from "vue-simple-password-meter";
import Popper from "vue3-popper";
import { storeToRefs } from "pinia";
import FButton from "./_Partials/FButton.vue";
import GButton from "./_Partials/GButton.vue";
import LButton from "./_Partials/LButton.vue";
import MobileFButton from "../Login/_Partials/FButton.vue";
import MobileGButton from "../Login/_Partials/GButton.vue";
import MobileLButton from "../Login/_Partials/LButton.vue";
import { Globe2, Star, BookOpen, ShieldCheck } from "lucide-vue-next";
import checkIcon from "@/assets/images/register/check.svg";
import capIcon from "@/assets/images/register/cap.svg";
import bankIcon from "@/assets/images/register/bank.svg";
import globeIcon from "@/assets/images/register/globe.svg";
import planeIcon from "@/assets/images/register/plane.svg";
import peopleIcon from "@/assets/images/register/people.svg";
import chartIcon from "@/assets/images/register/chart.svg";
import starIcon from "@/assets/images/register/star.svg";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";
import mobileLogo from "@/assets/images/register-mobile/logo.png";
import mobileIllustration from "@/assets/images/register-mobile/illustration.png";
import mobileIconPerson from "@/assets/images/register-mobile/icon-person.svg";
import mobileIconEmail from "@/assets/images/register-mobile/icon-email.svg";
import mobileIconPassword from "@/assets/images/register-mobile/icon-password.svg";
import mobileIconHelp from "@/assets/images/register-mobile/icon-help.svg";

const appStore = useAppStore();
const paymentStore = usePaymentStore();
const settingStore = useSettingStore();

const { createAccount, confirmAccount, resendCode, resetPassword } = useAuthStore();
const { setRegisterConfig } = settingStore;
const { getRegisterConfig } = storeToRefs(settingStore);

const { t } = useI18n();

const isPasswordVisible = ref(false);
const isConfirmPasswordVisible = ref(false);
const confirmPassword = ref("");
const acceptTerms = ref(false);
const countryList: Ref<any[]> = ref([]);

const pageContent: ComputedRef<string> = computed(() => getRegisterConfig.value.type ?? "REGISTER");

// Indicateur de force du mot de passe (3 niveaux) pour l'écran mobile
const passwordStrengthLevel: ComputedRef<number> = computed(() => {
  const pwd = formValue.value.password;
  if (!pwd) return 0;
  let level = 0;
  if (pwd.length >= 8) level++;
  if (/[A-Z]/.test(pwd) && /\d/.test(pwd)) level++;
  if (/[@$!%*?&\-_#]/.test(pwd)) level++;
  return level;
});

const initialState = {
  email: "",
  password: "",
  last_name: "",
  first_name: "",
  address: "",
  lc_country_id: "",
  birthday: "",
  sex: "",
};

const isError: Ref<{ message: string }> = ref({ message: "" });
const formRef = ref();
const formValue: Ref<{
  email: string;
  password: string;
  last_name: string;
  first_name: string;
  address: string;
  lc_country_id: string;
  birthday: string;
  sex: string;
}> = ref(initialState);

const verifyForm: Ref<{ email: string; code: string }> = ref({
  email: "",
  code: "",
});

const resetPasswordForm: Ref<{
  email: string;
  newPassword: string;
  confPassword: string;
}> = ref({
  email: "",
  newPassword: "",
  confPassword: "",
});

const isLoading: Ref<boolean> = ref(false);

const handleSubmit = async () => {
  isLoading.value = true;

  if (pageContent.value == "REGISTER") {
    if (isInputWrong()) {
      ElNotification({ type: "danger", message: isError.value.message ?? "" });
      isLoading.value = false;
      return;
    }
    if (!acceptTerms.value) {
      ElNotification({ type: "warning", message: t("accept-terms-required") });
      isLoading.value = false;
      return;
    }
    const res = await createAccount(unref(formValue));
    isLoading.value = false;
    verifyForm.value.email = formValue.value.email;
    res && setRegisterConfig("VERIFY_ACCOUNT");
    return;
  }

  if (pageContent.value == "VERIFY_ACCOUNT") {
    if (isInputWrong()) {
      ElNotification({ type: "danger", message: isError.value.message ?? "" });
      isLoading.value = false;
      return;
    }
    const res = await confirmAccount(unref(verifyForm));
    isLoading.value = false;
    if (paymentStore.orderData !== null) {
      const resp = await paymentStore.iniPayment(paymentStore.orderData);
      if (resp) window.location.href = paymentStore.redirectUrl;
    } else {
      formValue.value = initialState;
      res && setRegisterConfig("REGISTER");
      router.push(i18nRoute({ name: "signin" }));
    }
    return;
  }

  if (pageContent.value == "NEW_PASSWORD") {
    if (isInputWrong()) {
      ElNotification({ type: "danger", message: isError.value.message ?? "" });
      isLoading.value = false;
      return;
    }
    const res = await resetPassword(unref(resetPasswordForm));
    isLoading.value = false;
    if (res) router.push(i18nRoute({ name: "signin" }));
  }
};

const isInputWrong = (): boolean => {
  if (pageContent.value == "VALID_RESET_PASS" || pageContent.value == "VERIFY_ACCOUNT") {
    if (!verifyForm.value.email) {
      isError.value.message = t("validation.email-required");
      return true;
    } else if (!isEmail(verifyForm.value.email)) {
      isError.value.message = t("validation.email-invalid");
      return true;
    }
    if (!verifyForm.value.code) {
      isError.value.message = t("validation.code-required");
      return true;
    } else if (verifyForm.value.code.length < 5) {
      isError.value.message = t("validation.code-min-length");
      return true;
    }
  }

  if (pageContent.value == "NEW_PASSWORD") {
    if (!resetPasswordForm.value.email) {
      isError.value.message = t("validation.email-required");
      return true;
    } else if (!isEmail(resetPasswordForm.value.email)) {
      isError.value.message = t("validation.email-invalid");
      return true;
    }
    if (!resetPasswordForm.value.newPassword || !resetPasswordForm.value.confPassword) {
      isError.value.message = t("validation.passwords-required");
      return true;
    } else {
      if (resetPasswordForm.value.newPassword.length < 8 || resetPasswordForm.value.confPassword.length < 8) {
        isError.value.message = t("validation.passwords-min-length");
        return true;
      }
      if (resetPasswordForm.value.newPassword !== resetPasswordForm.value.confPassword) {
        isError.value.message = t("validation.passwords-mismatch");
        return true;
      }
    }
  }

  if (pageContent.value == "REGISTER") {
    if (!formValue.value.last_name) {
      isError.value.message = t("validation.last-name-required");
      return true;
    }
    if (!formValue.value.first_name) {
      isError.value.message = t("validation.first-name-required");
      return true;
    }
    if (!formValue.value.email) {
      isError.value.message = t("validation.email-required");
      return true;
    } else if (!isEmail(formValue.value.email)) {
      isError.value.message = t("validation.email-invalid");
      return true;
    }
    // Date de naissance / sexe : retirés du formulaire d'inscription (mobile et desktop).
    // On garde juste le contrôle d'âge minimum si une valeur est présente (autre flux éventuel).
    if (formValue.value.birthday) {
      const age = calculerAge(formValue.value.birthday);
      if (age < 16) {
        isError.value.message = t("validation.age-minimum");
        return true;
      }
    }
    if (!formValue.value.password) {
      isError.value.message = t("validation.password-required");
      return true;
    } else {
      if (formValue.value.password.length < 8) {
        isError.value.message = t("validation.passwords-min-length");
        return true;
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_#])[A-Za-z\d@$!%*?&\-_#]+$/;
      if (!passwordRegex.test(formValue.value.password)) {
        isError.value.message = t("validation.password-complexity");
        return true;
      }
    }
    // Le champ "confirmer le mot de passe" n'existe que sur l'écran mobile (masqué en desktop) :
    // on ne bloque que s'il a été rempli, pour ne pas casser la soumission desktop.
    if (confirmPassword.value && confirmPassword.value !== formValue.value.password) {
      isError.value.message = t("register-form.passwords-mismatch");
      return true;
    }
  }

  isError.value.message = "";
  return false;
};

const showLoginPage = () => {
  router.push(i18nRoute({ name: "signin", params: { redirect: router.currentRoute.value.fullPath } }));
};

const sendMeCode = async () => {
  isLoading.value = true;
  await resendCode(verifyForm.value.email);
  isLoading.value = false;
};

const handleGoBack = () => setRegisterConfig("REGISTER");

var score = ref(0);
var scoreMessage = ref(t("register-form.write-strong-password"));
const onScore = (payload: any) => {
  score.value = payload.score;
  const msgs = ["risky-password", "guessable-password", "weak-password", "safe-password", "secure-password"];
  scoreMessage.value = t(`register-form.${msgs[payload.score]}`);
};

const langDropdownOpen = ref(false);

const supportedLocales = (import.meta.env.VITE_SUPPORTED_LOCALES ?? "fr,en").split(",").map((l: string) => l.trim());

const flagSrc = (locale: string) => (locale === "en" ? "/images/flags/en.svg" : `/images/flags/${locale}.png`);

const switchLocale = async (locale: string) => {
  langDropdownOpen.value = false;
  if (settingStore.getLocale === locale) return;
  await Tr.switchLanguage(locale);
  if (appStore.fetchedLocale !== locale) {
    await appStore.refreshData(locale);
  }
};

onBeforeMount(async () => {
  countryList.value = await appStore.fetchCountries();
  formValue.value.lc_country_id = import.meta.env.VITE_COUNTRY_ID ?? "";
});
</script>

<template>
  <div class="signup-root">
    <!-- ═══════════════════════════════════════════
         MOBILE — Figma "Inscription" screen (< lg, REGISTER mode only)
    ═══════════════════════════════════════════ -->
    <div v-if="pageContent === 'REGISTER'" class="flex w-full flex-col items-center overflow-x-hidden bg-surface pb-26 lg:hidden">
      <div class="flex w-full flex-col items-center px-4 pb-6 pt-4">
        <!-- Logo -->
        <div class="flex w-full flex-col items-center pb-5">
          <div class="relative h-[2.9375rem] w-[9.375rem] overflow-hidden">
            <img
              :src="mobileLogo"
              alt="Qiryna"
              class="absolute left-[-4.88%] top-[-63.5%] h-[251.38%] w-[117.84%] max-w-none"
            />
          </div>
        </div>

        <!-- Title + illustration (même pattern que ForgotPassword : colonne image shrink-0
             avec overflow-hidden — l'image ne peut jamais déborder sur le texte) -->
        <div class="flex w-full items-start gap-[0.625rem] pb-[0.4375rem] pt-[1.875rem]">
          <div class="flex flex-1 flex-col">
            <p class="font-jost text-xl font-semibold leading-[1.5625rem] tracking-[-0.03906rem] text-ink">
              {{ $t("register-form.create-account") }}
            </p>
            <p class="w-[10rem] pt-2 text-sm leading-normal text-ink">
              {{ $t("register-mobile-subtitle") }}
            </p>
          </div>
          <div class="relative h-[12.3125rem] w-[12.8125rem] shrink-0 overflow-hidden">
            <img
              :src="mobileIllustration"
              alt=""
              class="absolute left-[-1.25rem] top-0 h-[11.125rem] w-[14.0625rem] max-w-none object-cover"
            />
          </div>
        </div>

        <!-- Se connecter / S'inscrire toggle -->
        <div class="flex w-full items-center gap-0 rounded-[0.625rem] border border-[#e6e5f2] p-[0.4375rem]">
          <button type="button" class="flex-1 rounded-[0.75rem] py-3 text-center" @click="showLoginPage">
            <span class="text-sm font-semibold text-ink">{{ $t("signin-me") }}</span>
          </button>
          <div
            class="flex-1 rounded-[0.625rem] bg-[#3b2cf2] py-3 text-center shadow-[0_0.0625rem_0.0625rem_rgba(0,0,0,0.05)]"
          >
            <span class="text-sm font-semibold text-white">{{ $t("signup") }}</span>
          </div>
        </div>

        <!-- Form -->
        <div class="w-full pt-[0.9375rem]">
          <AlertMessage class="mb-3" place="register-form" />
          <form
            class="w-full rounded-[0.625rem] bg-surface px-5 py-[1.5625rem] drop-shadow-[0px_0px_3.5px_rgba(0,0,0,0.1)]"
            autocomplete="off"
            novalidate
            @submit.prevent="handleSubmit()"
          >
            <!-- Prénom -->
            <div class="pb-5">
              <p class="text-xs font-medium tracking-[0.01875rem] text-ink">{{ $t("register-form.first_name") }}</p>
              <div class="pt-[0.375rem]">
                <div class="flex items-center gap-3 rounded-[0.625rem] border border-[#e6e5f2] bg-surface px-[1.0625rem] py-[0.9375rem]">
                  <img :src="mobileIconPerson" class="h-[1.125rem] w-[0.875rem]" alt="" />
                  <input
                    type="text"
                    required
                    spellcheck="false"
                    autocomplete="given-name"
                    v-model="formValue.first_name"
                    :placeholder="$t('register-mobile-firstname-placeholder')"
                    class="w-full border-0 bg-transparent text-sm text-ink outline-none placeholder:text-[#9c9ac6]"
                  />
                </div>
              </div>
            </div>

            <!-- Nom -->
            <div class="pb-5">
              <p class="text-xs font-medium tracking-[0.01875rem] text-ink">{{ $t("register-form.last_name") }}</p>
              <div class="pt-[0.375rem]">
                <div class="flex items-center gap-3 rounded-[0.625rem] border border-[#e6e5f2] bg-surface px-[1.0625rem] py-[0.9375rem]">
                  <img :src="mobileIconPerson" class="h-[1.125rem] w-[0.875rem]" alt="" />
                  <input
                    type="text"
                    required
                    spellcheck="false"
                    autocomplete="family-name"
                    v-model="formValue.last_name"
                    :placeholder="$t('register-mobile-lastname-placeholder')"
                    class="w-full border-0 bg-transparent text-sm text-ink outline-none placeholder:text-[#9c9ac6]"
                  />
                </div>
              </div>
            </div>

            <!-- Email -->
            <div>
              <p class="text-xs font-medium tracking-[0.01875rem] text-ink">{{ $t("forgot-email-label") }}</p>
              <div class="pt-[0.375rem]">
                <div class="flex items-center gap-3 rounded-[0.625rem] border border-[#e6e5f2] bg-surface px-[1.0625rem] py-[0.9375rem]">
                  <img :src="mobileIconEmail" class="h-[0.78125rem] w-[1.015625rem]" alt="" />
                  <input
                    type="email"
                    required
                    spellcheck="false"
                    autocomplete="email"
                    v-model="formValue.email"
                    :placeholder="$t('email-example-placeholder')"
                    class="w-full border-0 bg-transparent text-sm text-ink outline-none placeholder:text-[#9c9ac6]"
                  />
                </div>
              </div>
              <!-- Password strength dots (aperçu — la vraie force se calcule sur le champ mot de passe plus bas) -->
            </div>

            <!-- Mot de passe -->
            <div class="pt-5">
              <p class="text-xs font-medium tracking-[0.01875rem] text-ink">{{ $t("register-form.password") }}</p>
              <div class="pt-[0.375rem]">
                <div class="relative flex items-center gap-3 rounded-[0.625rem] border border-[#e6e5f2] bg-surface px-[1.0625rem] py-[0.9375rem]">
                  <img :src="mobileIconPassword" class="h-[1.015625rem] w-[0.78125rem]" alt="" />
                  <input
                    :type="isPasswordVisible ? 'text' : 'password'"
                    required
                    spellcheck="false"
                    autocomplete="new-password"
                    v-model="formValue.password"
                    placeholder="••••••••••••••••"
                    class="w-full border-0 bg-transparent text-lg text-ink outline-none placeholder:text-[#9c9ac6]"
                  />
                  <button
                    type="button"
                    class="flex size-5 flex-none items-center justify-center"
                    @click="isPasswordVisible = !isPasswordVisible"
                  >
                    <EyeSlashIcon v-if="isPasswordVisible" class="h-5 w-5 text-[#9c9ac6]" />
                    <EyeIcon v-else class="h-5 w-5 text-[#9c9ac6]" />
                  </button>
                </div>
              </div>
              <div class="flex flex-col gap-[0.3125rem] pt-[0.3125rem]">
                <div class="flex items-center gap-[0.3125rem]">
                  <div
                    v-for="bar in 3"
                    :key="bar"
                    class="h-1 flex-1 rounded-full"
                    :class="passwordStrengthLevel >= bar ? 'bg-[#582cfd]' : 'bg-[#f1f0fa]'"
                  ></div>
                </div>
                <p class="text-[0.5625rem] leading-4 text-ink">{{ $t("register-mobile-password-hint") }}</p>
              </div>
            </div>

            <!-- Confirmer le mot de passe -->
            <div class="pt-5">
              <p class="text-xs font-medium tracking-[0.01875rem] text-ink">{{ $t("register-form.confirm-password") }}</p>
              <div class="pt-[0.375rem]">
                <div class="relative flex items-center gap-3 rounded-[0.625rem] border border-[#e6e5f2] bg-surface px-[1.0625rem] py-[0.9375rem]">
                  <img :src="mobileIconPassword" class="h-[1.015625rem] w-[0.78125rem]" alt="" />
                  <input
                    :type="isConfirmPasswordVisible ? 'text' : 'password'"
                    required
                    spellcheck="false"
                    autocomplete="new-password"
                    v-model="confirmPassword"
                    placeholder="••••••••••••••••"
                    class="w-full border-0 bg-transparent text-lg text-ink outline-none placeholder:text-[#9c9ac6]"
                  />
                  <button
                    type="button"
                    class="flex size-5 flex-none items-center justify-center"
                    @click="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                  >
                    <EyeSlashIcon v-if="isConfirmPasswordVisible" class="h-5 w-5 text-[#9c9ac6]" />
                    <EyeIcon v-else class="h-5 w-5 text-[#9c9ac6]" />
                  </button>
                </div>
              </div>
            </div>

            <!-- CGU -->
            <label class="flex items-center gap-[0.4375rem] pt-5">
              <input type="checkbox" v-model="acceptTerms" class="sr-only" />
              <span
                class="flex size-[0.8125rem] flex-none items-center justify-center rounded-[0.125rem] border"
                :class="acceptTerms ? 'border-[#582cfd] bg-[#582cfd]' : 'border-[#e6e5f2] bg-surface'"
              >
                <img v-if="acceptTerms" :src="checkIcon" class="size-[0.5rem]" alt="" />
              </span>
              <span class="flex-1 text-[0.53125rem] leading-4 text-ink">
                {{ $t("accept-terms-prefix") }}
                <span class="text-[#4f20fc] underline">{{ $t("register-mobile-terms-link") }}</span>
                {{ $t("accept-terms-and") }}
                <span class="text-[#5121fc] underline">{{ $t("privacy-link") }}</span>
              </span>
            </label>

            <!-- Submit -->
            <div class="w-full pt-5">
              <button
                type="submit"
                :disabled="isLoading"
                class="flex w-full items-center justify-center rounded-[0.625rem] bg-[#582cfd] py-4 disabled:cursor-not-allowed disabled:opacity-60"
                @click.prevent="handleSubmit()"
              >
                <span v-if="!isLoading" class="text-sm font-semibold text-white">{{ $t("register-form.create-account") }}</span>
                <span v-else class="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
              </button>
            </div>

            <!-- OR divider -->
            <div class="flex w-full items-center py-[0.875rem]">
              <div class="h-px flex-1 border-t border-[#e6e5f2]"></div>
              <p class="px-2 text-center text-xs font-medium uppercase tracking-[0.075rem] text-[#7371a2]">
                {{ $t("or-continue-with") }}
              </p>
              <div class="h-px flex-1 border-t border-[#e6e5f2]"></div>
            </div>

            <!-- Social buttons -->
            <div class="flex w-full items-center gap-[0.3125rem]">
              <MobileGButton variant="stacked" />
              <MobileLButton variant="stacked" />
              <MobileFButton variant="stacked" />
            </div>
          </form>
        </div>

        <!-- Help card -->
        <div class="w-full pt-6">
          <div class="flex h-[5.375rem] w-full items-center justify-between rounded-[0.625rem] bg-surface-tint px-[0.5625rem]">
            <div class="flex flex-1 items-start gap-[0.6875rem]">
              <div class="flex size-11 flex-none items-center justify-center rounded-full bg-[#e8e2fd]">
                <img :src="mobileIconHelp" class="size-6" alt="" />
              </div>
              <div class="flex-1">
                <p class="text-xs font-bold text-ink">{{ $t("mobile-help-title") }}</p>
                <p class="pt-1 text-[0.625rem] leading-4 text-ink">{{ $t("mobile-help-text") }}</p>
              </div>
            </div>
            <RouterLink
              :to="i18nRoute({ name: 'contact' })"
              class="flex flex-none items-center justify-center rounded-[0.625rem] border border-[#450ff2] px-[0.9375rem] py-[0.5625rem] no-underline"
            >
              <span class="text-[0.625rem] font-medium text-[#450ff2]">{{ $t("contact-us-btn") }}</span>
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Bottom tab bar -->
      <MobileAppBottomNav active="account" />
    </div>

    <div class="page" :class="{ 'lg-register-only': pageContent === 'REGISTER' }">
      <!-- ===================== LEFT ===================== -->
      <section class="left">
        <div class="left-inner">
          <div class="brand">
            <RouterLink :to="i18nRoute({ name: 'home' })" class="brand-link">
              <img src="/images/qiryna-logo.png" alt="Qiryna" class="logo" />
            </RouterLink>
          </div>

          <!-- ── REGISTER mode ── -->
          <template v-if="pageContent == 'REGISTER'">
            <h1 class="title">
              {{ $t("register-title-line1") }}
              <br />
              {{ $t("register-title-line2") }}
              <span class="accent">{{ $t("register-title-highlight") }}</span>
              <span class="dot">.</span>
            </h1>
            <p class="subtitle">{{ $t("register-subtitle") }}</p>

            <div class="section-label">{{ $t("register-with-label") }}</div>
            <div class="social-row">
              <div class="social-btn"><GButton /></div>
              <div class="social-btn"><FButton /></div>
              <div class="social-btn"><LButton /></div>
            </div>

            <div class="divider">
              <span class="ln"></span>
              <span class="or">{{ $t("or") }}</span>
              <span class="ln"></span>
            </div>

            <div class="form-label">{{ $t("register-with-email-label") }}</div>

            <AlertMessage place="register-form" />

            <form ref="formRef" @submit.prevent="handleSubmit()" novalidate>
              <!-- Prénom / Nom -->
              <div class="row">
                <div class="field">
                  <span class="lead"><UserIcon /></span>
                  <input
                    type="text"
                    required
                    spellcheck="false"
                    v-model="formValue.first_name"
                    :placeholder="t('register-form.first_name')"
                    autocomplete="given-name"
                  />
                </div>
                <div class="field">
                  <span class="lead"><UserIcon /></span>
                  <input
                    type="text"
                    required
                    spellcheck="false"
                    v-model="formValue.last_name"
                    :placeholder="t('register-form.last_name')"
                    autocomplete="family-name"
                  />
                </div>
              </div>

              <!-- Email -->
              <div class="field">
                <span class="lead"><EnvelopeIcon /></span>
                <input
                  type="email"
                  required
                  spellcheck="false"
                  v-model="formValue.email"
                  :placeholder="t('register-form.email')"
                  autocomplete="email"
                />
              </div>

              <!-- Pays -->
              <div class="select-field">
                <span class="mini-label">{{ $t("register-form.country") }}</span>
                <select v-model="formValue.lc_country_id" :class="{ filled: !!formValue.lc_country_id }">
                  <option value="" disabled hidden>{{ $t("choose") }}</option>
                  <option v-for="country in countryList" :key="country.id" :value="country.id">
                    {{ country.name }}
                  </option>
                </select>
                <span class="chev"><ChevronDownIcon /></span>
              </div>

              <!-- Mot de passe -->
              <div class="field">
                <span class="lead"><LockClosedIcon /></span>
                <input
                  :type="isPasswordVisible ? 'text' : 'password'"
                  required
                  spellcheck="false"
                  v-model="formValue.password"
                  :placeholder="t('register-form.password')"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  class="trail"
                  @click="isPasswordVisible = !isPasswordVisible"
                  :aria-label="t('register-form.password')"
                >
                  <EyeSlashIcon v-if="isPasswordVisible" />
                  <EyeIcon v-else />
                </button>
              </div>

              <!-- Password hint -->
              <div class="pwd-hint">
                <ShieldCheckIcon />
                {{ $t("register-form.password-hint") }}
              </div>

              <!-- CGU -->
              <label class="terms">
                <input type="checkbox" v-model="acceptTerms" />
                <span class="box">
                  <img :src="checkIcon" alt="" />
                </span>
                <span class="terms-text">
                  {{ $t("accept-terms-prefix") }}
                  <a href="#">{{ $t("terms-link") }}</a>
                  {{ $t("accept-terms-and") }}
                  <a href="#" class="privacy">{{ $t("privacy-link") }}</a>
                  .
                </span>
              </label>

              <!-- Submit -->
              <button type="submit" class="submit" :disabled="isLoading || !acceptTerms">
                <span v-if="isLoading" class="spinner" aria-hidden="true"></span>
                {{ $t("register-form.create-account") }}
              </button>
            </form>

            <p class="bottom-login">
              {{ $t("already-account-label") }}
              <button type="button" @click="showLoginPage">{{ $t("signin") }}</button>
            </p>
          </template>

          <!-- ── VERIFY_ACCOUNT / VALID_RESET_PASS mode ── -->
          <template v-if="pageContent == 'VERIFY_ACCOUNT' || pageContent == 'VALID_RESET_PASS'">
            <h2 class="alt-title">{{ $t("confirm-label") }}</h2>
            <p class="alt-subtitle">{{ $t("confirm-description") }}</p>

            <form ref="formRef" @submit.prevent="handleSubmit()">
              <AlertMessage place="validate-form" />
              <p class="go-back" @click="handleGoBack">
                <span class="arrow">&LeftArrow;</span>
                <span>{{ $t("return-to-registration") }}</span>
              </p>
              <div class="alt-stack">
                <div class="field">
                  <span class="lead"><EnvelopeIcon /></span>
                  <input
                    type="email"
                    v-model="verifyForm.email"
                    required
                    spellcheck="false"
                    :placeholder="t('register-form.email')"
                    :class="{ locked: verifyForm.email.length > 0 }"
                  />
                </div>
                <div class="field">
                  <span class="lead"><ShieldCheckIcon /></span>
                  <input type="text" v-model="verifyForm.code" required spellcheck="false" placeholder="Code" />
                </div>
                <ButtonGeneral
                  :isLoading="isLoading"
                  @click.prevent="handleSubmit()"
                  :title="$t('confirm-action')"
                  class="submit alt-submit"
                />
                <p class="alt-foot">
                  {{ $t("no-confirmation-code") }}
                  <a @click.prevent="sendMeCode" href="#">{{ $t("click-here") }}</a>
                </p>
              </div>
            </form>
          </template>

          <!-- ── NEW_PASSWORD mode ── -->
          <template v-if="pageContent == 'NEW_PASSWORD'">
            <h2 class="alt-title">{{ $t("reset-password-label") }}</h2>
            <p class="alt-subtitle">{{ $t("reset-password-description") }}</p>

            <form ref="formRef" @submit.prevent="handleSubmit()">
              <AlertMessage place="changePassword-form" />
              <div class="alt-stack">
                <div class="field">
                  <span class="lead"><EnvelopeIcon /></span>
                  <input
                    type="email"
                    v-model="resetPasswordForm.email"
                    required
                    spellcheck="false"
                    placeholder="Email"
                  />
                </div>
                <div class="field">
                  <span class="lead"><LockClosedIcon /></span>
                  <input
                    type="password"
                    v-model="resetPasswordForm.newPassword"
                    required
                    spellcheck="false"
                    :placeholder="t('new-password-label')"
                  />
                </div>
                <div class="field">
                  <span class="lead"><LockClosedIcon /></span>
                  <input
                    type="password"
                    v-model="resetPasswordForm.confPassword"
                    required
                    spellcheck="false"
                    :placeholder="t('confirm-new-password-label')"
                  />
                </div>
                <ButtonGeneral
                  class="submit alt-submit"
                  :isLoading="isLoading"
                  @click.prevent="handleSubmit()"
                  :title="$t('change-password-action')"
                />
              </div>
            </form>
          </template>
        </div>
      </section>

      <!-- ===================== RIGHT ===================== -->
      <section class="right">
        <div class="photo"></div>

        <!-- floating badges -->
        <div class="float cap">
          <div class="badge"><img :src="capIcon" alt="" /></div>
        </div>
        <div class="float bank">
          <div class="badge"><img :src="bankIcon" alt="" /></div>
        </div>
        <div class="float globe">
          <div class="badge"><img :src="globeIcon" alt="" /></div>
        </div>
        <div class="float plane">
          <div class="badge"><img :src="planeIcon" alt="" /></div>
        </div>
        <div class="float people">
          <div class="badge"><img :src="peopleIcon" alt="" /></div>
        </div>
        <div class="float chart">
          <div class="badge"><img :src="chartIcon" alt="" /></div>
        </div>
        <div class="float star">
          <div class="badge"><img :src="starIcon" alt="" /></div>
        </div>

        <div class="right-content">
          <div class="topnav">
            <span class="have">{{ $t("already-account-label") }}</span>
            <button class="btn-outline" type="button" @click="showLoginPage">{{ $t("signin") }}</button>
            <div class="lang-wrap">
              <button class="lang" type="button" @click.stop="langDropdownOpen = !langDropdownOpen">
                <img :src="flagSrc(settingStore.getLocale)" class="lang-flag" :alt="settingStore.getLocale" />
                <span class="chev"><ChevronDownIcon :class="{ open: langDropdownOpen }" /></span>
              </button>
              <div v-if="langDropdownOpen" class="lang-backdrop" @click="langDropdownOpen = false" />
              <div v-if="langDropdownOpen" class="lang-menu">
                <button
                  v-for="locale in supportedLocales"
                  :key="locale"
                  type="button"
                  class="lang-item"
                  :class="{ active: settingStore.getLocale === locale }"
                  @click="switchLocale(locale)"
                >
                  <img :src="flagSrc(locale)" class="lang-flag" :alt="locale" />
                  {{ locale.toUpperCase() }}
                </button>
              </div>
            </div>
          </div>

          <div class="hero-text">
            <h2>
              {{ $t("register-right-line1") }}
              <br />
              <span class="accent">{{ $t("register-right-line2") }}</span>
              <br />
              {{ $t("register-right-line3") }}
            </h2>
            <p>
              {{ $t("register-right-sub1") }}
              <br />
              {{ $t("register-right-sub2") }}
            </p>
          </div>

          <div class="features">
            <div class="feature">
              <div class="fi purple"><Globe2 :size="22" /></div>
              <div>
                <div class="ft">{{ $t("register-feat-schools") }}</div>
                <div class="fs">{{ $t("register-feat-schools-sub") }}</div>
              </div>
            </div>
            <div class="feature">
              <div class="fi blue"><BookOpen :size="22" /></div>
              <div>
                <div class="ft">{{ $t("register-feat-programs") }}</div>
                <div class="fs">{{ $t("register-feat-programs-sub") }}</div>
              </div>
            </div>
            <div class="feature">
              <div class="fi gold"><Star :size="22" /></div>
              <div>
                <div class="ft">{{ $t("register-feat-opps") }}</div>
                <div class="fs">{{ $t("register-feat-opps-sub") }}</div>
              </div>
            </div>
            <div class="feature">
              <div class="fi green"><ShieldCheck :size="22" /></div>
              <div>
                <div class="ft">{{ $t("register-feat-support") }}</div>
                <div class="fs">{{ $t("register-feat-support-sub") }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

