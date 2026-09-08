<script lang="ts" setup>
import AlertMessage from "@/components/atoms/AlertMessage.vue";
import router from "@/router";
import { useAppStore, useAuthStore, usePaymentStore, useSettingStore } from "@/stores";
import { isEmail } from "@/utils/is";
import { ElNotification } from "element-plus";
import { type Ref, ref, unref, onBeforeMount } from "vue";
import { useI18n } from "vue-i18n";
import { i18nRoute } from "@/utils";
import {
  EnvelopeIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  PaperAirplaneIcon,
  ChevronDownIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/vue/24/outline";
import { storeToRefs } from "pinia";
import FButton from "./_Partials/FButton.vue";
import GButton from "./_Partials/GButton.vue";
import LButton from "./_Partials/LButton.vue";
import Tr from "@/i18n/translation";
import checkIcon from "@/assets/images/login/check.svg";
import arrowRightIcon from "@/assets/images/login/arrow-right.svg";
import decoConnector from "@/assets/images/login/connector.svg";
import mobileLogo from "@/assets/images/login-mobile/logo.png";
import mobileIllustration from "@/assets/images/login-mobile/illustration.png";
import mobileIconEmail from "@/assets/images/login-mobile/icon-email.svg";
import mobileIconPassword from "@/assets/images/login-mobile/icon-password.svg";
import mobileIconSecure from "@/assets/images/login-mobile/icon-secure.svg";
import mobileIconPersonalized from "@/assets/images/login-mobile/icon-personalized.svg";
import mobileIconTime from "@/assets/images/login-mobile/icon-time.svg";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";

const authStore = useAuthStore();
const { login } = authStore;
const { token } = storeToRefs(authStore);

const appStore = useAppStore();
const settingStore = useSettingStore();
const { iniPayment } = usePaymentStore();
const { redirectUrl, orderData } = storeToRefs(usePaymentStore());

const { t } = useI18n();

onBeforeMount(() => {
  const redirect = router.currentRoute.value.query.redirect as string | undefined;
  if (token.value) {
    redirect ? router.push(redirect) : router.push(i18nRoute({ name: "home" }));
    return;
  }
  if (redirect) {
    const resolved = router.resolve(redirect);
    const requiresAuth = resolved.matched.some((r) => r.meta.requiresAuth);
    if (!requiresAuth && resolved.name !== "404") router.push(redirect);
  }
});

const isLoading: Ref<boolean> = ref(false);
const isPasswordVisible = ref(false);
const rememberMe = ref(true);
const isError: Ref<{ message: string }> = ref({ message: "" });
const formRef = ref();
const formValue: Ref<{ email: string; password: string }> = ref({
  email: "",
  password: "",
});

const onSubmit = async () => {
  isLoading.value = true;
  if (isInputWrong()) {
    ElNotification({ type: "danger", message: isError.value.message ?? "" });
    isLoading.value = false;
    return;
  }
  const result = await login(unref(formValue), t);
  isLoading.value = false;
  if (result) handleRedirect();
};

const isInputWrong = (): boolean => {
  if (!formValue.value.email) {
    isError.value.message = t("validation.email-required");
    return true;
  } else if (!isEmail(formValue.value.email)) {
    isError.value.message = t("validation.email-invalid");
    return true;
  }
  if (!formValue.value.password) {
    isError.value.message = t("validation.password-required");
    return true;
  } else if (formValue.value.password.length < 8) {
    isError.value.message = t("validation.password-min-length");
    return true;
  }
  isError.value.message = "";
  return false;
};

const handleRedirect = async () => {
  if (orderData.value !== null) {
    const resp = await iniPayment(orderData.value);
    if (resp) window.location.href = redirectUrl.value;
  } else {
    router.currentRoute.value.query.redirect
      ? router.push(router.currentRoute.value.query.redirect as string)
      : router.push(i18nRoute({ name: "home" }));
  }
};

const goToRegister = () => router.push(i18nRoute({ name: "signup" }));

/* ── Language dropdown ── */
const langDropdownOpen = ref(false);
const supportedLocales = (import.meta.env.VITE_SUPPORTED_LOCALES ?? "fr,en").split(",").map((l: string) => l.trim());
const flagSrc = (locale: string) => (locale === "en" ? "/images/flags/en.svg" : `/images/flags/${locale}.png`);
const switchLocale = async (locale: string) => {
  langDropdownOpen.value = false;
  if (settingStore.getLocale === locale) return;
  await Tr.switchLanguage(locale);
  if (appStore.fetchedLocale !== locale) await appStore.refreshData(locale);
};
</script>

<template>
  <div class="q-page">
    <!-- ═══════════════════════════════════════════
         MOBILE — Figma "Connexion" screen (< lg)
    ═══════════════════════════════════════════ -->
    <div class="flex w-full flex-col items-center overflow-x-hidden bg-surface pb-26 lg:hidden">
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

        <!-- Welcome + illustration (même pattern que ForgotPassword : colonne image shrink-0
             avec overflow-hidden — l'image ne peut jamais déborder sur le texte) -->
        <div class="flex w-full items-start gap-[0.625rem] pb-[0.4375rem] pt-[1.875rem]">
          <div class="flex flex-1 flex-col">
            <div class="flex items-center gap-[0.375rem]">
              <p
                class="whitespace-nowrap font-jost text-xl font-semibold leading-[1.5625rem] tracking-[-0.03906rem] text-ink"
              >
                {{ $t("login-mobile-welcome") }}
              </p>
              <span class="shrink-0 text-base leading-[1.5625rem]">👋</span>
            </div>
            <p class="w-[10rem] pt-2 text-sm leading-normal text-ink">{{ $t("login-mobile-subtitle") }}</p>
          </div>
          <div class="relative h-[11.125rem] w-[11.5625rem] shrink-0 overflow-hidden">
            <img
              :src="mobileIllustration"
              alt=""
              class="absolute left-[-2.5625rem] top-[-0.875rem] h-[12.75rem] w-[15.625rem] max-w-none object-cover"
            />
          </div>
        </div>

        <!-- Se connecter / S'inscrire toggle -->
        <div class="w-full pt-6">
          <div class="flex w-full items-center gap-0 rounded-[0.625rem] border border-[#e6e5f2] p-[0.4375rem]">
            <div
              class="flex-1 rounded-[0.625rem] bg-[#3b2cf2] py-3 text-center shadow-[0_0.0625rem_0.0625rem_rgba(0,0,0,0.05)]"
            >
              <span class="text-sm font-semibold text-white">{{ $t("signin-me") }}</span>
            </div>
            <button type="button" class="flex-1 rounded-[0.75rem] py-3 text-center" @click="goToRegister">
              <span class="text-sm font-semibold text-ink">{{ $t("signup") }}</span>
            </button>
          </div>
        </div>

        <!-- Form -->
        <div class="w-full pt-[0.9375rem]">
          <AlertMessage class="mb-3" place="Login-form" />
          <form
            class="w-full rounded-[0.625rem] bg-surface px-5 py-[1.5625rem] drop-shadow-[0px_0px_3.5px_rgba(0,0,0,0.1)]"
            autocomplete="off"
            @submit.prevent="onSubmit()"
          >
            <div class="flex flex-col gap-[1.375rem]">
              <!-- Email -->
              <div>
                <p class="text-xs font-medium tracking-[0.01875rem] text-ink">{{ $t("forgot-email-label") }}</p>
                <div class="pt-[0.375rem]">
                  <div
                    class="flex items-center gap-3 rounded-[0.625rem] border border-[#e6e5f2] bg-surface px-[1.0625rem] py-[0.9375rem]"
                  >
                    <img :src="mobileIconEmail" class="h-[0.78125rem] w-[1.015625rem]" alt="" />
                    <input
                      type="email"
                      required
                      spellcheck="false"
                      autocomplete="off"
                      v-model="formValue.email"
                      :placeholder="$t('email-example-placeholder')"
                      class="w-full border-0 bg-transparent text-sm text-ink outline-none placeholder:text-[#9c9ac6]"
                    />
                  </div>
                </div>
              </div>

              <!-- Password -->
              <div>
                <p class="text-xs font-medium tracking-[0.01875rem] text-ink">{{ $t("password-label") }}</p>
                <div class="pt-[0.375rem]">
                  <div
                    class="relative flex items-center gap-3 rounded-[0.625rem] border border-[#e6e5f2] bg-surface px-[1.0625rem] py-[0.9375rem]"
                  >
                    <img :src="mobileIconPassword" class="h-[1.015625rem] w-[0.78125rem]" alt="" />
                    <input
                      :type="isPasswordVisible ? 'text' : 'password'"
                      required
                      spellcheck="false"
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
              </div>

              <!-- Forgot password -->
              <div class="flex h-8 w-full items-start justify-end">
                <RouterLink
                  :to="i18nRoute({ name: 'password-forgot' })"
                  class="text-xs font-medium text-[#4920fc] underline"
                >
                  {{ $t("forget-password-label") }}
                </RouterLink>
              </div>
            </div>

            <!-- Submit -->
            <div class="w-full pt-[0.3125rem]">
              <button
                type="submit"
                :disabled="isLoading"
                class="flex w-full items-center justify-center rounded-[0.625rem] bg-[#582cfd] py-4 disabled:cursor-not-allowed disabled:opacity-60"
                @click.prevent="onSubmit()"
              >
                <span v-if="!isLoading" class="text-sm font-semibold text-white">{{ $t("signin-me") }}</span>
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
              <GButton variant="stacked" />
              <LButton variant="stacked" />
              <FButton variant="stacked" />
            </div>
          </form>
        </div>

        <!-- Info card -->
        <div class="w-full pt-6">
          <div
            class="flex w-full flex-col gap-[0.9375rem] rounded-[0.625rem] border border-[#f8f6fe] bg-[#f7f6fe] px-[1.0625rem] py-[1.3125rem]"
          >
            <div class="flex items-center gap-[0.3125rem]">
              <img :src="mobileIconSecure" class="size-10 flex-none" alt="" />
              <div class="flex-1">
                <p class="text-xs font-semibold text-ink">{{ $t("login-mobile-security-title") }}</p>
                <p class="text-[0.6875rem] leading-[1.21875rem] text-ink">
                  {{ $t("login-mobile-security-text") }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-[0.3125rem]">
              <img :src="mobileIconPersonalized" class="size-10 flex-none" alt="" />
              <div class="flex-1">
                <p class="text-xs font-semibold text-ink">{{ $t("login-mobile-personalized-title") }}</p>
                <p class="text-[0.6875rem] leading-[1.21875rem] text-ink">
                  {{ $t("login-mobile-personalized-text") }}
                </p>
              </div>
            </div>
            <div class="flex items-start gap-[0.3125rem]">
              <img :src="mobileIconTime" class="size-10 flex-none" alt="" />
              <div class="flex-1">
                <p class="text-xs font-semibold text-ink">{{ $t("login-mobile-time-title") }}</p>
                <p class="text-[0.6875rem] leading-[1.21875rem] text-ink">{{ $t("login-mobile-time-text") }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom tab bar -->
      <MobileAppBottomNav active="account" />
    </div>

    <!-- ═══════════════════════════════════════════
         LEFT — Form panel (≥ lg)
    ═══════════════════════════════════════════ -->
    <div class="q-left hidden lg:flex lg:w-175 lg:min-w-175 flex-col overflow-y-auto">
      <div class="q-left__inner flex-1">
        <!-- Logo -->
        <RouterLink :to="i18nRoute({ name: 'home' })" class="q-logo">
          <img src="/logo.svg" class="q-logo__mark" alt="Qiryna" />
          <span class="q-logo__word">Qiryna</span>
        </RouterLink>

        <!-- Headline -->
        <div class="q-headline">
          <h1 class="q-title">
            {{ $t("login-title-start") }}&nbsp;<span class="accent">{{ $t("login-title-highlight") }}&nbsp;!</span>
          </h1>
          <p class="q-subtitle">{{ $t("login-subtitle") }}</p>
        </div>

        <!-- Social section label -->
        <p class="q-label">{{ $t("login-with-label") }}</p>

        <!-- Social buttons -->
        <div class="q-social-row">
          <div class="q-social"><FButton /></div>
          <div class="q-social"><GButton /></div>
          <div class="q-social"><LButton /></div>
        </div>

        <!-- OR divider -->
        <div class="q-or">
          <span>{{ $t("or") }}</span>
        </div>

        <!-- Email label -->
        <p class="q-field-label">{{ $t("login-with-email-label") }}</p>

        <AlertMessage class="mb-3" place="Login-form" />

        <form ref="formRef" @submit.prevent="onSubmit()" autocomplete="off">
          <!-- Email field -->
          <label class="q-field">
            <EnvelopeIcon class="q-field__icon" />
            <input
              type="email"
              required
              spellcheck="false"
              autocomplete="off"
              v-model="formValue.email"
              :placeholder="$t('email-placeholder')"
            />
          </label>

          <!-- Password field -->
          <label class="q-field">
            <LockClosedIcon class="q-field__icon" />
            <input
              :type="isPasswordVisible ? 'text' : 'password'"
              required
              spellcheck="false"
              v-model="formValue.password"
              :placeholder="$t('password-label')"
            />
            <button type="button" @click="isPasswordVisible = !isPasswordVisible" class="q-field__eye-btn">
              <EyeSlashIcon v-if="isPasswordVisible" class="q-field__eye" />
              <EyeIcon v-else class="q-field__eye" />
            </button>
          </label>

          <!-- Options: remember + forgot -->
          <div class="q-options">
            <label class="q-remember" @click.prevent="rememberMe = !rememberMe">
              <span class="q-check" :class="{ 'q-check--off': !rememberMe }">
                <img :src="checkIcon" alt="" />
              </span>
              {{ $t("remember-me-label") }}
            </label>
            <RouterLink :to="i18nRoute({ name: 'password-forgot' })" class="q-forgot">
              {{ $t("forget-password-label") }}
            </RouterLink>
          </div>

          <!-- Submit -->
          <button type="submit" class="q-submit" :disabled="isLoading" @click.prevent="onSubmit()">
            <span v-if="!isLoading">
              {{ $t("signin-me") }}
              <img :src="arrowRightIcon" alt="" />
            </span>
            <span v-else class="q-submit__loader"></span>
          </button>
        </form>

        <!-- Security note -->
        <div class="q-secure">
          <span class="q-secure__badge">
            <ShieldCheckIcon />
          </span>
          <span>{{ $t("data-secure-label") }}</span>
        </div>

        <!-- Mobile: link to register -->
        <RouterLink :to="i18nRoute({ name: 'signup' })" class="q-mobile-signup lg:hidden">
          {{ $t("signup") }}
        </RouterLink>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════
         RIGHT — Hero panel
    ═══════════════════════════════════════════ -->
    <div class="q-right hidden lg:block flex-1 relative overflow-hidden">
      <!-- Background photo -->
      <img src="/images/login-bg.jpeg" alt="" class="q-hero" />

      <!-- Top bar -->
      <div class="q-topbar">
        <RouterLink :to="i18nRoute({ name: 'password-forgot' })" class="q-topbar__link">
          {{ $t("forget-password-label") }}
        </RouterLink>
        <button class="q-signup-btn" @click="goToRegister">
          {{ $t("signup") }}
        </button>
        <!-- Language selector -->
        <div class="q-lang-wrap">
          <button class="q-lang" @click.stop="langDropdownOpen = !langDropdownOpen">
            <span class="q-lang__flag">
              <img :src="flagSrc(settingStore.getLocale)" :alt="settingStore.getLocale" />
            </span>
            <ChevronDownIcon class="q-lang__chev" :class="{ 'rotate-180': langDropdownOpen }" />
          </button>
          <div v-if="langDropdownOpen" class="fixed inset-0 z-40" @click="langDropdownOpen = false" />
          <div v-if="langDropdownOpen" class="q-lang__dropdown">
            <button
              v-for="locale in supportedLocales"
              :key="locale"
              @click="switchLocale(locale)"
              class="q-lang__option"
              :class="{
                'q-lang__option--active': settingStore.getLocale === locale,
              }"
            >
              <img :src="flagSrc(locale)" class="w-5 h-5 rounded-sm object-cover" :alt="locale" />
              {{ locale.toUpperCase() }}
            </button>
          </div>
        </div>
      </div>

      <!-- Quote card -->
      <div class="q-quote">
        <div class="q-quote__mark">"</div>
        <p class="q-quote__text">
          {{ $t("login-panel-line1") }} {{ $t("login-panel-line2") }}
          <span class="accent">{{ $t("login-panel-highlight") }}</span>
        </p>
        <div class="q-quote__rule"></div>
      </div>

      <!-- Feature card -->
      <div class="q-features">
        <div class="q-feature">
          <span class="q-feature__ico q-feature__ico--pink">
            <ShieldCheckIcon />
          </span>
          <p>{{ $t("login-feature-secure") }}</p>
        </div>
        <div class="q-feature__sep"></div>
        <div class="q-feature">
          <span class="q-feature__ico q-feature__ico--purple">
            <UserCircleIcon />
          </span>
          <p>{{ $t("login-feature-coaching") }}</p>
        </div>
        <div class="q-feature__sep"></div>
        <div class="q-feature">
          <span class="q-feature__ico q-feature__ico--pink">
            <AcademicCapIcon />
          </span>
          <p>{{ $t("login-feature-international") }}</p>
        </div>
      </div>
    </div>

    <!-- Decorative connector + floating icon badges (crisp vector).
         Lives on .q-page (not .q-right) so it straddles the seam between
         the form and the hero without being clipped by overflow:hidden. -->
    <div class="q-deco">
      <img class="q-deco__svg" :src="decoConnector" alt="" />

      <!-- Rond blanc de départ du connecteur (en haut à droite) -->
      <div class="q-dot q-dot--start"></div>

      <div class="q-badge q-badge--globe"><GlobeAltIcon /></div>
      <div class="q-badge q-badge--cap"><AcademicCapIcon /></div>
      <div class="q-badge q-badge--plane"><PaperAirplaneIcon /></div>
    </div>
  </div>
</template>
