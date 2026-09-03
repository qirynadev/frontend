<script setup lang="ts">
import BannerRotator from "@/components/atoms/BannerRotator.vue";
import Accordion from "@/components/molecules/Accordion.vue";
import Loader from "@/components/molecules/Loader.vue";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";
import mobileLogo from "@/assets/images/home-mobile/logo.png";
import mobileIconBell from "@/assets/images/home-mobile/icon-bell.svg";
import backArrowIcon from "@/assets/images/profilage-landing-mobile/back-arrow.svg";
import iconPersonalInfo from "@/assets/images/settings-mobile/icon-personal-info.svg";
import iconSecurity from "@/assets/images/settings-mobile/icon-security.svg";
import iconNotifications from "@/assets/images/settings-mobile/icon-notifications.svg";
import iconLanguage from "@/assets/images/settings-mobile/icon-language.svg";
import iconTheme from "@/assets/images/settings-mobile/icon-theme.svg";
import iconHelpCenter from "@/assets/images/settings-mobile/icon-help-center.svg";
import iconLegal from "@/assets/images/settings-mobile/icon-legal.svg";
import iconChevron from "@/assets/images/settings-mobile/icon-chevron.svg";
import iconLogout from "@/assets/images/settings-mobile/icon-logout.svg";
import iconPasswordShield from "@/assets/images/password-mobile/icon-shield.svg";
import iconPasswordLock from "@/assets/images/password-mobile/icon-lock.svg";
import iconPasswordInfo from "@/assets/images/password-mobile/icon-info.svg";
import languageIllustration from "@/assets/images/language-mobile/illustration.png";
import { useAppStore, useAuthStore, useSettingStore } from "@/stores";
import {
  ChatBubbleLeftRightIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
  LockClosedIcon,
} from "@heroicons/vue/24/outline";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, onMounted, ref, unref, watch } from "vue";
import { useI18n } from "vue-i18n";
import PasswordMeter from "vue-simple-password-meter";
import Popper from "vue3-popper";
import { useRouter } from "vue-router";
import { ElNotification } from "element-plus";
import { isEmail } from "@/utils/is";
import { calculerAge, i18nRoute } from "@/utils";
import Tr from "@/i18n/translation";

const appStore = useAppStore();
const authStore = useAuthStore();
const settingStore = useSettingStore();
const { locale, theme } = storeToRefs(settingStore);

const router = useRouter();
const { t } = useI18n();

const themeLabelKey = computed(
  () =>
    ({ light: "theme-mobile-light-title", dark: "theme-mobile-dark-title", system: "theme-mobile-system-title" })[
      theme.value
    ],
);

const { user } = storeToRefs(authStore);

const hashes = ["#personal-informations", "#more-informations", "#security", "#languages"];

const activeAccordion = ref<number>(0);
const setActiveAccordion = (index: number) => {
  activeAccordion.value = index;
  window.history.pushState("", "", hashes[index]); // this works with animation
  //window.location.hash = hashes[index]; // this works without animation
};

// Mobile (<lg) : écran "Réglages" (menu Figma) affiché par défaut, bascule vers
// le formulaire (accordéons, partagés avec le desktop) quand une section est ouverte.
const showMobileForm = ref<boolean>(false);

const openMobileSection = (index: number) => {
  showMobileForm.value = true;
  setActiveAccordion(index);
};

const backToMobileMenu = () => {
  showMobileForm.value = false;
  activeAccordion.value = -1;
  window.history.pushState("", "", window.location.pathname);
};

// Écran mobile "Langue" : sélection en 2 temps (carte puis bouton Enregistrer),
// contrairement au sélecteur desktop qui bascule la locale instantanément.
const pendingLocale = ref<string>(locale.value);
watch(activeAccordion, (index) => {
  if (index === 3) pendingLocale.value = locale.value;
});
const saveLanguage = () => handleLanguageChange({ target: { value: pendingLocale.value } });

const handleLogout = async () => {
  await authStore.logout();
  router.push(i18nRoute({ name: "home" }));
};

const isLoading = ref<boolean>(false);
const isPasswordVisible = ref(false);
const countryList = ref<any[]>([]);
const oldLocale = ref<string>("");

const buildFormFromUser = (u: any) => ({
  email: u?.email ?? "",
  phone: u?.profile?.phone ?? "",
  last_name: u?.profile?.last_name ?? "",
  first_name: u?.profile?.first_name ?? "",
  address: u?.profile?.address ?? "",
  lc_country_id: u?.profile?.lc_country_id ?? "",
  birthday: u?.profile?.birthday_formatted ?? "",
  sex: u?.profile?.sex ?? "",
  city: u?.profile?.city ?? "",
});

const isError = ref<{
  message: string;
}>({
  message: "",
});

const formValue = ref<{
  email: string;
  phone: string;
  last_name: string;
  first_name: string;
  address: string;
  lc_country_id: number;
  birthday: string;
  sex: string;
  city: string;
}>(buildFormFromUser(user.value));

// Sync du formulaire si les données user changent (après fetchUserInfo ou updateProfile)
watch(
  user,
  (newUser) => {
    formValue.value = buildFormFromUser(newUser);
  },
  { deep: true },
);

const formMore = ref<{
  status: string;
  cv: any;
  diploma: any;
}>({
  status: "",
  cv: null,
  diploma: null,
});

const resetPasswordForm = ref<{
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}>({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const handleInfoSubmit = async () => {
  if (isInputWrong()) {
    ElNotification({
      type: "error",
      message: isError.value.message ?? "",
    });
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  await authStore.updateProfile(unref(formValue));
  // Le watch sur user met à jour formValue automatiquement via updateProfile → user.value = data.user
  isLoading.value = false;
};

const handleMoreSubmit = async () => {
  isLoading.value = true;
  isLoading.value = false;
};

// Verify form validator
const isInputWrong = (): boolean => {
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
  } else {
    if (!isEmail(formValue.value.email)) {
      isError.value.message = t("validation.email-invalid");

      return true;
    }
  }
  if (!formValue.value.lc_country_id) {
    isError.value.message = t("validation.country-required");

    return true;
  }
  if (!formValue.value.phone) {
    isError.value.message = t("validation.phone-required");

    return true;
  }
  /* if (!formValue.value.city) {
    isError.value.message = "La ville est obligatoire";

    return true;
  } */
  if (!formValue.value.birthday) {
    isError.value.message = t("validation.birthday-required");
    return true;
  } else {
    const age = calculerAge(formValue.value.birthday);
    if (age < 16) {
      isError.value.message = t("validation.age-minimum");
      return true;
    }
  }
  if (!formValue.value.sex) {
    isError.value.message = t("validation.sex-required");
    return true;
  }

  isError.value.message = "";

  return false;
};

const handleSecuritySubmit = async () => {
  if (resetPasswordForm.value.newPassword !== resetPasswordForm.value.confirmPassword) {
    ElNotification({
      type: "error",
      message: t("register-form.passwords-mismatch"),
    });
    return;
  }
  isLoading.value = true;
  const res = await authStore.updateUserPassword({
    oldPassword: resetPasswordForm.value.oldPassword,
    newPassword: resetPasswordForm.value.newPassword,
  });
  if (res) {
    resetPasswordForm.value = {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    activeAccordion.value = -1;
  }
  isLoading.value = false;
};

const handleLanguageChange = async ({ target }: any) => {
  const res = await authStore.changeUserLanguage(target.value);
  if (res) {
    // get current route name
    let routeName = router.currentRoute.value.name;
    routeName = String(routeName).split(`.`)[1];

    await Tr.switchLanguage(target.value);

    // refresh data
    await appStore.refreshData();

    activeAccordion.value = -1;

    // Return to home page
    router.push(
      i18nRoute({
        locale: target.value,
        name: routeName,
        hash: window.location.hash,
      }),
    );
  }
};

// null = champ vide (barre cachée), true = conforme, false = incorrecte
const passwordsMatch = computed<boolean | null>(() => {
  if (!resetPasswordForm.value.confirmPassword) return null;
  return resetPasswordForm.value.newPassword === resetPasswordForm.value.confirmPassword;
});

const passwordRequirements = computed(() => {
  const pwd = resetPasswordForm.value.newPassword;
  return {
    length: pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  };
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

onMounted(() => {
  const hash = window.location.hash;
  if (hash) {
    const index = hashes.indexOf(hash);
    if (index !== -1) {
      showMobileForm.value = true;
    }
    setActiveAccordion(index);
  }
});

onBeforeMount(async () => {
  countryList.value = await appStore.fetchCountries();
  await authStore.fetchUserInfo();
});

watch(locale, (newL, oldL) => {
  oldLocale.value = oldL;
});

const infoIcon = ref<string>(``);
</script>

<template>
  <!-- Mobile menu (écran Figma "Réglages") -->
  <div
    v-if="!showMobileForm"
    class="mx-auto flex w-full max-w-[26.875rem] flex-col items-center overflow-x-hidden bg-surface pb-26 lg:hidden"
  >
    <div class="flex w-full flex-col items-center px-4 pb-6 pt-4">
      <!-- Top bar -->
      <div class="flex w-full items-center justify-between pb-[1.875rem]">
        <button
          type="button"
          class="flex size-6 items-center justify-center"
          aria-label="Retour"
          @click="router.back()"
        >
          <img :src="backArrowIcon" class="size-full" alt="" />
        </button>
        <div class="relative h-[2.8125rem] w-[9.0625rem] overflow-hidden">
          <img
            :src="mobileLogo"
            alt="Qiryna"
            class="absolute left-[-4.88%] top-[-63.5%] h-[251.38%] w-[117.84%] max-w-none"
          />
        </div>
        <RouterLink
          :to="i18nRoute({ name: 'user-notifications' })"
          class="relative flex size-[3.0625rem] flex-col items-center justify-center no-underline"
        >
          <img :src="mobileIconBell" class="size-[1.5625rem]" alt="" />
          <span
            v-if="authStore.unreadNotificationCount > 0"
            class="absolute left-[1.5rem] top-[0.25rem] flex items-center justify-center rounded-full bg-[#ee163e] px-[0.375rem] py-[0.0625rem] text-xs font-medium text-white"
          >
            {{ authStore.unreadNotificationCount }}
          </span>
        </RouterLink>
      </div>

      <!-- Heading -->
      <div class="flex w-full flex-col items-start pb-[2.8125rem]">
        <p class="w-full text-xl font-semibold tracking-[-0.65px] text-ink">
          {{ $t("settings-mobile-title") }}
        </p>
        <p class="w-full pt-1 text-sm leading-[22.75px] text-ink">
          {{ $t("settings-mobile-subtitle") }}
        </p>
      </div>

      <!-- Compte -->
      <div class="flex w-full flex-col items-start pb-[2.8125rem]">
        <p class="w-full px-1 text-sm font-semibold tracking-[0.7px] text-ink">
          {{ $t("settings-mobile-account-section") }}
        </p>
        <div
          class="mt-3 flex w-full flex-col items-start overflow-hidden rounded-2xl border border-border-default bg-surface-alt shadow-[0px_2px_10px_-3px_rgba(6,81,237,0.05)]"
        >
          <button
            type="button"
            class="flex w-full items-center border-b border-border-default p-4 text-left"
            @click="openMobileSection(0)"
          >
            <img :src="iconPersonalInfo" class="mr-4 size-10 shrink-0" alt="" />
            <div class="min-w-0 flex-1">
              <p class="text-base font-semibold leading-6 text-ink">
                {{ $t("settings-mobile-personal-info-title") }}
              </p>
              <p class="pt-0.5 text-sm leading-5 text-ink">
                {{ $t("settings-mobile-personal-info-desc") }}
              </p>
            </div>
            <img :src="iconChevron" class="ml-4 size-5 shrink-0" alt="" />
          </button>
          <button type="button" class="flex w-full items-center p-4 text-left" @click="openMobileSection(2)">
            <img :src="iconSecurity" class="mr-4 size-10 shrink-0" alt="" />
            <div class="min-w-0 flex-1">
              <p class="text-base font-semibold leading-6 text-ink">
                {{ $t("settings-mobile-security-title") }}
              </p>
              <p class="pt-0.5 text-sm leading-5 text-ink">
                {{ $t("settings-mobile-security-desc") }}
              </p>
            </div>
            <img :src="iconChevron" class="ml-4 size-5 shrink-0" alt="" />
          </button>
        </div>
      </div>

      <!-- Préférences -->
      <div class="flex w-full flex-col items-start pb-[2.8125rem]">
        <p class="w-full px-1 text-sm font-semibold tracking-[0.7px] text-ink">
          {{ $t("settings-mobile-preferences-section") }}
        </p>
        <div
          class="mt-3 flex w-full flex-col items-start overflow-hidden rounded-2xl border border-border-default bg-surface-alt shadow-[0px_2px_10px_-3px_rgba(6,81,237,0.05)]"
        >
          <RouterLink
            :to="i18nRoute({ name: 'user-settings-notifications' })"
            class="flex w-full items-center border-b border-border-default p-4 no-underline"
          >
            <img :src="iconNotifications" class="mr-4 size-10 shrink-0" alt="" />
            <div class="min-w-0 flex-1">
              <p class="text-base font-semibold leading-6 text-ink">
                {{ $t("settings-mobile-notifications-title") }}
              </p>
              <p class="pt-0.5 text-sm leading-5 text-ink">
                {{ $t("settings-mobile-notifications-desc") }}
              </p>
            </div>
            <img :src="iconChevron" class="ml-4 size-5 shrink-0" alt="" />
          </RouterLink>
          <button
            type="button"
            class="flex w-full items-center border-b border-border-default p-4 text-left"
            @click="openMobileSection(3)"
          >
            <img :src="iconLanguage" class="mr-4 size-10 shrink-0" alt="" />
            <div class="min-w-0 flex-1">
              <p class="text-base font-semibold leading-6 text-ink">
                {{ $t("settings-mobile-language-title") }}
              </p>
              <p class="pt-0.5 text-sm leading-5 text-ink">
                {{ $t("settings-mobile-language-desc") }}
              </p>
            </div>
            <img :src="iconChevron" class="ml-4 size-5 shrink-0" alt="" />
          </button>
          <RouterLink
            :to="i18nRoute({ name: 'user-settings-theme' })"
            class="flex w-full items-center p-4 no-underline"
          >
            <p class="flex-1 text-base font-semibold leading-6 text-ink">
              {{ $t("settings-mobile-theme-title") }}
            </p>
            <div class="flex items-center">
              <span class="text-sm leading-5 text-ink-muted">{{ $t(themeLabelKey) }}</span>
              <img :src="iconChevron" class="ml-2 size-5 shrink-0" alt="" />
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- Autres -->
      <div class="flex w-full flex-col items-start">
        <p class="w-full px-1 text-sm font-semibold tracking-[0.7px] text-ink">
          {{ $t("settings-mobile-other-section") }}
        </p>
        <div
          class="mt-3 flex w-full flex-col items-start overflow-hidden rounded-2xl border border-border-default bg-surface-alt shadow-[0px_2px_10px_-3px_rgba(6,81,237,0.05)]"
        >
          <RouterLink
            :to="i18nRoute({ name: 'faq' })"
            class="flex w-full items-center border-b border-border-default p-4 no-underline"
          >
            <img :src="iconHelpCenter" class="mr-4 size-10 shrink-0" alt="" />
            <div class="min-w-0 flex-1">
              <p class="text-base font-semibold leading-6 text-ink">
                {{ $t("settings-mobile-help-title") }}
              </p>
              <p class="pt-0.5 text-sm leading-5 text-ink">
                {{ $t("settings-mobile-help-desc") }}
              </p>
            </div>
            <img :src="iconChevron" class="ml-4 size-5 shrink-0" alt="" />
          </RouterLink>
          <RouterLink
            :to="i18nRoute({ name: 'legals' })"
            class="flex w-full items-center border-b border-border-default p-4 no-underline"
          >
            <img :src="iconLegal" class="mr-4 size-10 shrink-0" alt="" />
            <div class="min-w-0 flex-1">
              <p class="text-base font-semibold leading-6 text-ink">
                {{ $t("settings-mobile-legal-title") }}
              </p>
              <p class="pt-0.5 text-sm leading-5 text-ink">
                {{ $t("settings-mobile-legal-desc") }}
              </p>
            </div>
            <img :src="iconChevron" class="ml-4 size-5 shrink-0" alt="" />
          </RouterLink>
          <button type="button" class="flex w-full items-center p-4 text-left" @click="handleLogout">
            <div class="mr-4 flex size-10 shrink-0 items-center justify-center rounded-[0.625rem] bg-[#fef2f2]">
              <img :src="iconLogout" class="size-5" alt="" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-base font-semibold leading-6 text-[#e71816]">
                {{ $t("settings-mobile-logout-title") }}
              </p>
              <p class="pt-0.5 text-sm leading-5 text-ink">
                {{ $t("settings-mobile-logout-desc") }}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>

    <MobileAppBottomNav active="account" />
  </div>

  <!-- Mobile : écran "Mot de passe" (Figma), section Sécurité -->
  <div
    v-if="showMobileForm && activeAccordion === 2"
    class="mx-auto flex w-full max-w-[26.875rem] flex-col items-center overflow-x-hidden bg-surface pb-26 lg:hidden"
  >
    <div class="flex w-full flex-col items-center px-4 pb-6 pt-4">
      <div class="flex w-full items-center justify-between pb-[1.875rem]">
        <button
          type="button"
          class="flex size-6 items-center justify-center"
          aria-label="Retour"
          @click="backToMobileMenu"
        >
          <img :src="backArrowIcon" class="size-full" alt="" />
        </button>
        <div class="relative h-[2.8125rem] w-[9.0625rem] overflow-hidden">
          <img
            :src="mobileLogo"
            alt="Qiryna"
            class="absolute left-[-4.88%] top-[-63.5%] h-[251.38%] w-[117.84%] max-w-none"
          />
        </div>
        <RouterLink
          :to="i18nRoute({ name: 'user-notifications' })"
          class="relative flex size-[3.0625rem] flex-col items-center justify-center no-underline"
        >
          <img :src="mobileIconBell" class="size-[1.5625rem]" alt="" />
          <span
            v-if="authStore.unreadNotificationCount > 0"
            class="absolute left-[1.5rem] top-[0.25rem] flex items-center justify-center rounded-full bg-[#ee163e] px-[0.375rem] py-[0.0625rem] text-xs font-medium text-white"
          >
            {{ authStore.unreadNotificationCount }}
          </span>
        </RouterLink>
      </div>

      <div class="flex w-full flex-col items-start pb-4">
        <p class="w-full text-xl font-semibold tracking-[-0.65px] text-ink">
          {{ $t("password-mobile-title") }}
        </p>
        <p class="w-full pt-1 text-[0.8125rem] leading-[22.75px] text-ink">
          {{ $t("password-mobile-subtitle") }}
        </p>
      </div>

      <div class="flex w-full items-center gap-2.5 rounded-[0.625rem] bg-surface-tint px-[0.5625rem] py-3">
        <img :src="iconPasswordShield" class="size-11 shrink-0" alt="" />
        <div class="min-w-0 flex-1">
          <p class="text-xs font-bold leading-5 text-ink">{{ $t("password-mobile-protect-title") }}</p>
          <p class="pt-1 text-[0.625rem] leading-4 text-ink">{{ $t("password-mobile-protect-desc") }}</p>
        </div>
      </div>

      <form
        @submit.prevent="handleSecuritySubmit"
        class="mt-5 flex w-full flex-col items-start rounded-[0.625rem] px-4 py-4 shadow-[0px_0px_3.5px_rgba(0,0,0,0.1)]"
      >
        <label class="w-full text-sm font-medium text-[#0d153e]">{{ $t("password-mobile-current-label") }}</label>
        <div class="relative mt-1.5 w-full">
          <img :src="iconPasswordLock" class="pointer-events-none absolute left-2.5 top-1/2 size-6 -translate-y-1/2" alt="" />
          <input
            :type="isPasswordVisible ? 'text' : 'password'"
            required
            spellcheck="false"
            v-model="resetPasswordForm.oldPassword"
            :placeholder="$t('password-mobile-current-placeholder')"
            class="w-full rounded-[0.625rem] border border-[#e2e8f0] py-2.5 pl-11 pr-9 text-[0.84375rem] text-[#0d153e] placeholder:text-[#94a3b8]"
          />
          <EyeSlashIcon
            v-if="isPasswordVisible"
            @click="isPasswordVisible = !isPasswordVisible"
            class="absolute right-2.5 top-1/2 size-5 -translate-y-1/2 cursor-pointer text-ink"
          />
          <EyeIcon
            v-else
            @click="isPasswordVisible = !isPasswordVisible"
            class="absolute right-2.5 top-1/2 size-5 -translate-y-1/2 cursor-pointer text-ink"
          />
        </div>

        <label class="mt-5 w-full text-sm font-medium text-[#0d153e]">{{ $t("password-mobile-new-label") }}</label>
        <div class="relative mt-1.5 w-full">
          <img :src="iconPasswordLock" class="pointer-events-none absolute left-2.5 top-1/2 size-6 -translate-y-1/2" alt="" />
          <input
            :type="isPasswordVisible ? 'text' : 'password'"
            required
            spellcheck="false"
            v-model="resetPasswordForm.newPassword"
            :placeholder="$t('password-mobile-new-placeholder')"
            class="w-full rounded-[0.625rem] border border-[#e2e8f0] py-2.5 pl-11 pr-9 text-[0.84375rem] text-[#0d153e] placeholder:text-[#94a3b8]"
          />
          <EyeSlashIcon
            v-if="isPasswordVisible"
            @click="isPasswordVisible = !isPasswordVisible"
            class="absolute right-2.5 top-1/2 size-5 -translate-y-1/2 cursor-pointer text-ink"
          />
          <EyeIcon
            v-else
            @click="isPasswordVisible = !isPasswordVisible"
            class="absolute right-2.5 top-1/2 size-5 -translate-y-1/2 cursor-pointer text-ink"
          />
        </div>

        <div class="mt-3.5 flex w-full items-center gap-1.5">
          <span class="text-xs font-medium text-[#64748b]">{{ $t("password-mobile-strength-label") }}</span>
          <span class="text-xs font-bold">{{ scoreMessage }}</span>
        </div>
        <PasswordMeter class="w-full" @score="onScore($event)" :password="resetPasswordForm.newPassword" />

        <div class="mt-2 grid w-full grid-cols-2 gap-x-2 gap-y-1.5">
          <div class="flex items-center gap-1.5">
            <span
              class="size-3.5 shrink-0 rounded-full border"
              :class="passwordRequirements.length ? 'border-green-500 bg-green-500' : 'border-[#cbd5e1]'"
            ></span>
            <span class="text-[0.71875rem] text-[#64748b]">{{ $t("password-mobile-req-length") }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span
              class="size-3.5 shrink-0 rounded-full border"
              :class="passwordRequirements.uppercase ? 'border-green-500 bg-green-500' : 'border-[#cbd5e1]'"
            ></span>
            <span class="text-[0.71875rem] text-[#64748b]">{{ $t("password-mobile-req-uppercase") }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span
              class="size-3.5 shrink-0 rounded-full border"
              :class="passwordRequirements.number ? 'border-green-500 bg-green-500' : 'border-[#cbd5e1]'"
            ></span>
            <span class="text-[0.71875rem] text-[#64748b]">{{ $t("password-mobile-req-number") }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span
              class="size-3.5 shrink-0 rounded-full border"
              :class="passwordRequirements.special ? 'border-green-500 bg-green-500' : 'border-[#cbd5e1]'"
            ></span>
            <span class="text-[0.71875rem] text-[#64748b]">{{ $t("password-mobile-req-special") }}</span>
          </div>
        </div>

        <label class="mt-5 w-full text-sm font-medium text-[#0d153e]">{{ $t("password-mobile-confirm-label") }}</label>
        <div class="relative mt-1.5 w-full">
          <img :src="iconPasswordLock" class="pointer-events-none absolute left-2.5 top-1/2 size-6 -translate-y-1/2" alt="" />
          <input
            :type="isPasswordVisible ? 'text' : 'password'"
            required
            spellcheck="false"
            v-model="resetPasswordForm.confirmPassword"
            :placeholder="$t('password-mobile-confirm-placeholder')"
            class="w-full rounded-[0.625rem] border border-[#e2e8f0] py-2.5 pl-11 pr-9 text-[0.84375rem] text-[#0d153e] placeholder:text-[#94a3b8]"
          />
          <EyeSlashIcon
            v-if="isPasswordVisible"
            @click="isPasswordVisible = !isPasswordVisible"
            class="absolute right-2.5 top-1/2 size-5 -translate-y-1/2 cursor-pointer text-ink"
          />
          <EyeIcon
            v-else
            @click="isPasswordVisible = !isPasswordVisible"
            class="absolute right-2.5 top-1/2 size-5 -translate-y-1/2 cursor-pointer text-ink"
          />
        </div>
        <div v-if="passwordsMatch !== null" class="mt-1.5 w-full">
          <div
            class="h-1 w-full rounded transition-all duration-300"
            :class="passwordsMatch ? 'bg-green-500' : 'bg-red-500'"
          ></div>
          <p class="mt-1 text-xs font-semibold" :class="passwordsMatch ? 'text-green-600' : 'text-red-500'">
            {{ passwordsMatch ? $t("register-form.passwords-match") : $t("register-form.passwords-mismatch") }}
          </p>
        </div>

        <div class="mt-5 flex w-full items-center gap-2.5 rounded-[0.625rem] bg-surface-tint px-[0.5625rem] py-3">
          <img :src="iconPasswordInfo" class="size-11 shrink-0" alt="" />
          <p class="min-w-0 flex-1 text-[0.625rem] leading-4 text-ink">
            {{ $t("password-mobile-different-info") }}
          </p>
        </div>

        <button
          type="submit"
          class="mt-3 flex w-full items-center justify-center gap-1 rounded-[0.625rem] bg-[#4309fc] px-6 py-4 text-center text-sm font-semibold text-white"
        >
          <Loader v-if="isLoading" />
          {{ $t("password-mobile-save") }}
        </button>
      </form>
    </div>

    <MobileAppBottomNav active="account" />
  </div>

  <!-- Mobile : écran "Langue" (Figma), section Langues -->
  <div
    v-if="showMobileForm && activeAccordion === 3"
    class="mx-auto flex w-full max-w-[26.875rem] flex-col items-center overflow-x-hidden bg-surface pb-26 lg:hidden"
  >
    <div class="flex w-full flex-col items-center px-4 pb-6 pt-4">
      <div class="flex w-full items-center justify-between pb-[1.875rem]">
        <button
          type="button"
          class="flex size-6 items-center justify-center"
          aria-label="Retour"
          @click="backToMobileMenu"
        >
          <img :src="backArrowIcon" class="size-full" alt="" />
        </button>
        <div class="relative h-[2.8125rem] w-[9.0625rem] overflow-hidden">
          <img
            :src="mobileLogo"
            alt="Qiryna"
            class="absolute left-[-4.88%] top-[-63.5%] h-[251.38%] w-[117.84%] max-w-none"
          />
        </div>
        <RouterLink
          :to="i18nRoute({ name: 'user-notifications' })"
          class="relative flex size-[3.0625rem] flex-col items-center justify-center no-underline"
        >
          <img :src="mobileIconBell" class="size-[1.5625rem]" alt="" />
          <span
            v-if="authStore.unreadNotificationCount > 0"
            class="absolute left-[1.5rem] top-[0.25rem] flex items-center justify-center rounded-full bg-[#ee163e] px-[0.375rem] py-[0.0625rem] text-xs font-medium text-white"
          >
            {{ authStore.unreadNotificationCount }}
          </span>
        </RouterLink>
      </div>

      <div class="flex w-full flex-col items-start pb-4">
        <p class="w-full text-xl font-semibold tracking-[-0.65px] text-ink">
          {{ $t("language-mobile-title") }}
        </p>
        <p class="w-full pt-1 text-[0.8125rem] leading-[22.75px] text-ink">
          {{ $t("language-mobile-subtitle") }}
        </p>
      </div>

      <div class="flex w-full flex-col items-start rounded-[0.625rem] p-4 shadow-[0px_0px_3.5px_rgba(0,0,0,0.1)]">
        <p class="text-[0.9375rem] font-bold text-ink">{{ $t("language-mobile-section-title") }}</p>
        <div class="mt-3 flex w-full flex-col items-start gap-2.5">
          <button
            type="button"
            class="flex w-full items-center gap-3.5 rounded-[0.625rem] border p-[0.9375rem] text-left"
            :class="pendingLocale === 'fr' ? 'border-[#8a6bfd] bg-surface-tint' : 'border-border-default bg-surface'"
            @click="pendingLocale = 'fr'"
          >
            <img src="/images/flags/fr.png" alt="fr" class="size-10 rounded-full object-cover" />
            <div class="min-w-0 flex-1">
              <p class="text-[0.9375rem] font-extrabold text-ink">{{ $t("language-french") }}</p>
              <p class="text-xs text-ink">
                {{ pendingLocale === "fr" ? $t("language-mobile-current") : "" }}
              </p>
            </div>
            <span
              class="flex size-5 shrink-0 items-center justify-center rounded-full border"
              :class="pendingLocale === 'fr' ? 'border-[#4114fb]' : 'border-[#8b8ab9]'"
            >
              <span v-if="pendingLocale === 'fr'" class="size-2.5 rounded-full bg-[#4f18f6]"></span>
            </span>
          </button>
          <button
            type="button"
            class="flex w-full items-center gap-3.5 rounded-[0.625rem] border p-[0.9375rem] text-left"
            :class="pendingLocale === 'en' ? 'border-[#8a6bfd] bg-surface-tint' : 'border-border-default bg-surface'"
            @click="pendingLocale = 'en'"
          >
            <img src="/images/flags/en.svg" alt="en" class="size-10 rounded-full object-cover" />
            <div class="min-w-0 flex-1">
              <p class="text-[0.9375rem] font-extrabold text-ink">{{ $t("language-english") }}</p>
              <p class="text-xs text-ink">{{ $t("language-mobile-english-desc") }}</p>
            </div>
            <span
              class="flex size-5 shrink-0 items-center justify-center rounded-full border"
              :class="pendingLocale === 'en' ? 'border-[#4114fb]' : 'border-[#8b8ab9]'"
            >
              <span v-if="pendingLocale === 'en'" class="size-2.5 rounded-full bg-[#4f18f6]"></span>
            </span>
          </button>
        </div>
      </div>

      <div class="mt-5 flex w-full items-center gap-2.5 rounded-[0.625rem] bg-surface-tint px-[0.5625rem] py-3">
        <img :src="languageIllustration" class="h-[4.875rem] w-[5.625rem] shrink-0 rounded-lg object-cover" alt="" />
        <div class="min-w-0 flex-1">
          <p class="text-xs font-bold leading-5 text-ink">{{ $t("language-mobile-adapted-title") }}</p>
          <p class="pt-1 text-[0.625rem] leading-4 text-ink">{{ $t("language-mobile-adapted-desc") }}</p>
        </div>
      </div>

      <button
        type="button"
        class="mt-5 w-full rounded-[0.625rem] bg-[#4309fc] px-6 py-4 text-center text-sm font-semibold text-white"
        @click="saveLanguage"
      >
        {{ $t("language-mobile-save") }}
      </button>
    </div>

    <MobileAppBottomNav active="account" />
  </div>

  <div
    class="global-container"
    :class="showMobileForm && activeAccordion !== 2 && activeAccordion !== 3 ? 'block' : 'hidden lg:block'"
  >
    <div class="container-inner">
      <div class="left-part">
        <button
          v-if="showMobileForm"
          type="button"
          class="mb-4 flex items-center gap-2 text-sm font-medium text-ink lg:hidden"
          @click="backToMobileMenu"
        >
          <img :src="backArrowIcon" class="size-4" alt="" />
          {{ $t("go-back") }}
        </button>
        <h2 class="font-bold text-2xl text-center mb-4 pb-3 border-b border-border-default">
          {{ $t("menu.account.settings.title") }}
        </h2>

        <Accordion
          :title="$t('menu.account.settings.personal-informations')"
          :id="`settings-${0}`"
          :index="0"
          :accordion-open="0 === activeAccordion"
          @opened="setActiveAccordion"
          class=""
        >
          <template #icon>
            <InformationCircleIcon class="size-5" />
          </template>

          <form @submit.prevent="handleInfoSubmit" class="flex justify-center items-start flex-col">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4">
              <div class="input-field">
                <input type="text" required spellcheck="false" v-model="formValue.last_name" />
                <label class="text-center">{{ $t("register-form.last_name") }}</label>
              </div>
              <div class="input-field">
                <input type="text" required spellcheck="false" v-model="formValue.first_name" />
                <label class="text-center">{{ $t("register-form.first_name") }}</label>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4">
              <div class="input-field">
                <input
                  type="text"
                  required
                  spellcheck="false"
                  v-maska="'##/##/####'"
                  :placeholder="t('register-form.date-placeholder')"
                  v-model="formValue.birthday"
                />
                <label class="text-center">{{ $t("register-form.birthday") }}</label>
              </div>
              <div class="input-field">
                <select v-model="formValue.lc_country_id" class="w-full">
                  <option value="">{{ $t("choose") }}</option>
                  <option v-for="country in countryList" :key="country.id" :value="country.id">
                    {{ country.name }}
                  </option>
                </select>
                <label class="text-center">{{ $t("register-form.country") }}</label>
              </div>
              <div class="input-field">
                <select v-model="formValue.sex" class="w-full">
                  <option value="">{{ $t("choose") }}</option>
                  <option value="M">{{ $t("register-form.male") }}</option>
                  <option value="F">{{ $t("register-form.female") }}</option>
                </select>
                <label class="text-center">{{ $t("register-form.sex") }}</label>
              </div>
            </div>
            <!-- <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4">
              <div class="input-field">
                <select v-model="formValue.lc_country_id" class="w-full">
                  <option value="">{{ $t("choose") }}</option>
                  <option
                    v-for="country in countryList"
                    :key="country.id"
                    :value="country.id"
                  >
                    {{ country.name }}
                  </option>
                </select>
                <label class="text-center">{{
                  $t("register-form.country")
                }}</label>
              </div>
              <div class="input-field">
                <input
                  type="text"
                  required
                  spellcheck="false"
                  v-model="formValue.city"
                />
                <label class="text-center">{{
                  $t("register-form.city")
                }}</label>
              </div>
            </div> -->

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4">
              <div class="input-field">
                <input
                  type="email"
                  required
                  spellcheck="false"
                  v-model="formValue.email"
                  class="bg-surface-alt! pointer-events-none"
                />
                <label class="text-center">{{ $t("register-form.email") }}</label>
              </div>
              <div class="input-field">
                <input type="tel" required spellcheck="false" v-model="formValue.phone" />
                <label class="text-center">{{ $t("register-form.phone") }}</label>
              </div>
            </div>

            <!-- <div class="input-field mt-4">
              <input
                type="text"
                required
                spellcheck="false"
                v-model="formValue.address"
              />
              <label class="text-center">{{
                $t("register-form.address")
              }}</label>
            </div> -->

            <div class="flex items-center justify-center w-full">
              <button
                type="submit"
                class="bg-[#ff3942] text-white rounded-md uppercase mt-5 px-3 flex items-center justify-center gap-1 text-[15px] w-[110px] h-[36px]"
              >
                <Loader v-if="isLoading" />
                {{ $t("send") }}
              </button>
            </div>
          </form>
        </Accordion>
        <!-- <Accordion
          :title="$t('menu.account.settings.more-informations')"
          :id="`settings-${1}`"
          :index="1"
          :accordion-open="1 === activeAccordion"
          @opened="setActiveAccordion"
          class="cursor-pointer"
        >
          <form
            @submit.prevent="handleMoreSubmit"
            class="flex justify-center items-start flex-col"
          >
            <div class="grid grid-cols-2 gap-4 mt-4 w-full">
              <div class="input-field">
                <input
                  type="text"
                  required
                  spellcheck="false"
                  v-model="formMore.status"
                />
                <label class="text-center">Un champ</label>
              </div>
              <div class="input-field">
                <input
                  type="text"
                  required
                  spellcheck="false"
                  v-model="formMore.status"
                />
                <label class="text-center">Un autre champ</label>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4 w-full">
              <div class="input-field relative">
                <label
                  for=""
                  class="block font-bold text-black text-xl bg-white w-max! px-4 py-2 z-20"
                  >CV</label
                >
                <UploadField v-model="formMore.cv" label="" format="PDF" />
              </div>
              <div class="input-field">
                <label for="" class="font-bold text-black text-xl"
                  >Diplôme</label
                >
                <UploadField v-model="formMore.diploma" label="" format="PDF" />
              </div>
            </div>

            <div class="flex items-center justify-center w-full mt-6">
              <button
                type="submit"
                class="bg-[#ff3942] text-white rounded-full uppercasex px-3 flex items-center justify-center gap-1 text-[15px] w-[110px] h-[36px]"
              >
                <Loader v-if="isLoading" />
                {{ $t("send") }}
              </button>
            </div>
          </form>
        </Accordion> -->
        <Accordion
          :title="$t('menu.account.settings.security')"
          :id="`settings-${2}`"
          :index="2"
          :accordion-open="2 === activeAccordion"
          @opened="setActiveAccordion"
          class=""
        >
          <template #icon>
            <LockClosedIcon class="size-5" />
          </template>

          <form @submit.prevent="handleSecuritySubmit">
            <div class="input-field mt-4">
              <input
                :type="isPasswordVisible ? 'text' : 'password'"
                required
                spellcheck="false"
                v-model="resetPasswordForm.oldPassword"
              />
              <label class="text-center">{{ $t("register-form.old-password") }}</label>
              <EyeSlashIcon
                @click="isPasswordVisible = !isPasswordVisible"
                v-if="isPasswordVisible"
                class="w-6 h-6 text-gray-400 absolute right-3 -mt-0.5 bottom-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
              />
              <EyeIcon
                @click="isPasswordVisible = !isPasswordVisible"
                v-else
                class="w-6 h-6 text-gray-400 absolute right-3 -mt-0.5 bottom-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
              />
            </div>
            <div class="input-field mt-4">
              <input
                :type="isPasswordVisible ? 'text' : 'password'"
                required
                spellcheck="false"
                v-model="resetPasswordForm.newPassword"
              />
              <label class="text-center">{{ $t("register-form.new-password") }}</label>
              <EyeSlashIcon
                @click="isPasswordVisible = !isPasswordVisible"
                v-if="isPasswordVisible"
                class="w-6 h-6 text-gray-400 absolute right-3 -mt-0.5 bottom-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
              />
              <EyeIcon
                @click="isPasswordVisible = !isPasswordVisible"
                v-else
                class="w-6 h-6 text-gray-400 absolute right-3 -mt-0.5 bottom-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
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
                    <ExclamationCircleIcon class="w-6 h-6 text-gray-400" />
                  </Popper>
                </div>
              </div>
            </div>
            <div class="input-field mt-4">
              <input
                :type="isPasswordVisible ? 'text' : 'password'"
                required
                spellcheck="false"
                v-model="resetPasswordForm.confirmPassword"
              />
              <label class="text-center">{{ $t("register-form.confirm-password") }}</label>
              <EyeSlashIcon
                @click="isPasswordVisible = !isPasswordVisible"
                v-if="isPasswordVisible"
                class="w-6 h-6 text-gray-400 absolute right-3 -mt-0.5 bottom-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
              />
              <EyeIcon
                @click="isPasswordVisible = !isPasswordVisible"
                v-else
                class="w-6 h-6 text-gray-400 absolute right-3 -mt-0.5 bottom-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
              />
            </div>

            <div v-if="passwordsMatch !== null" class="w-full mt-1 mb-2">
              <div
                class="h-1 w-full rounded transition-all duration-300"
                :class="passwordsMatch ? 'bg-green-500' : 'bg-red-500'"
              ></div>
              <p class="text-xs mt-1 font-semibold" :class="passwordsMatch ? 'text-green-600' : 'text-red-500'">
                {{ passwordsMatch ? $t("register-form.passwords-match") : $t("register-form.passwords-mismatch") }}
              </p>
            </div>

            <div class="flex items-center justify-center w-full">
              <button
                type="submit"
                class="bg-[#ff3942] text-white rounded-md uppercase mt-5 px-3 flex items-center justify-center gap-1 text-[15px] w-[110px] h-[36px]"
              >
                <Loader v-if="isLoading" />
                {{ $t("send") }}
              </button>
            </div>
          </form>
        </Accordion>
        <Accordion
          :title="$t('menu.account.settings.languages')"
          :id="`settings-${3}`"
          :index="3"
          :accordion-open="3 === activeAccordion"
          @opened="setActiveAccordion"
          class=""
        >
          <template #icon>
            <ChatBubbleLeftRightIcon class="size-5" />
          </template>

          <div class="flex items-center justify-between gap-4 mt-4">
            <label
              for="fr"
              class="flex items-center justify-between rounded border border-[#c0c0c0] p-3 gap-2 w-full cursor-pointer"
            >
              <div class="flex items-center justify-between gap-2">
                <img src="/images/flags/fr.png" alt="fr" class="w-6 h-6" />
                <span class="text-[20px] font-bold">{{ $t("language-french") }}</span>
              </div>
              <input
                id="fr"
                type="radio"
                name="language"
                value="fr"
                v-model="locale"
                @change="handleLanguageChange"
                class="hidden"
              />
              <div class="size-5 rounded-full" :class="locale === 'fr' ? 'bg-green-500' : 'bg-[#c0c0c0]'"></div>
            </label>
            <label
              for="en"
              class="flex items-center justify-between rounded border border-[#c0c0c0] p-3 gap-2 w-full cursor-pointer"
            >
              <div class="flex items-center gap-2">
                <img src="/images/flags/en.svg" alt="en" class="w-6 h-6" />
                <span class="text-[20px] font-bold">{{ $t("language-english") }}</span>
              </div>
              <input
                id="en"
                type="radio"
                name="language"
                value="en"
                v-model="locale"
                @change="handleLanguageChange"
                class="hidden"
              />
              <div class="size-5 rounded-full" :class="locale === 'en' ? 'bg-green-500' : 'bg-[#c0c0c0]'"></div>
            </label>
          </div>
        </Accordion>
      </div>
      <div class="right-part hidden lg:block">
        <BannerRotator class="pub mt-[10px]" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.input-field {
  width: 100%;
  position: relative;

  textarea {
    height: 100px !important;
  }

  input,
  select,
  textarea {
    width: 100%;
    border-radius: 4px;
    font-size: 14px;
    padding: 6px 12px;
    border: 1.5px solid #c9c9c9;
    background: transparent;
    color: var(--color-ink);
    /* box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); */
    outline: none;
    height: 45px;
    margin-bottom: 10px;

    &:focus {
      border: 2px solid #ff3942;
    }

    &:focus ~ label,
    &:valid ~ label {
      color: #ff3942;
    }

    &:required::after {
      content: "*";
      color: #ff3942;
      margin-left: 4px;
    }
  }

  label {
    position: absolute;
    top: -10px;
    left: 15px;
    font-size: 16px;
    padding: 0 2px;
    background: var(--color-surface);
    color: #555;
    font-size: 15px;
    pointer-events: none;
    transition: 0.3s;
    font-weight: 600;
  }
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
