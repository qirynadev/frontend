<script lang="ts" setup>
import AlertMessage from "@/components/atoms/AlertMessage.vue";
import ButtonGeneral from "@/components/atoms/ButtonGeneral.vue";
import { useAppStore, useAuthStore, useSettingStore } from "@/stores";
import { isEmail } from "@/utils/is";
import { ElNotification } from "element-plus";
import { type Ref, ref } from "vue";
import { useI18n } from "vue-i18n";
import { i18nRoute } from "@/utils";
import router from "@/router";
import {
  EnvelopeIcon,
  ShieldCheckIcon,
  LinkIcon,
  LockClosedIcon,
  ChevronDownIcon,
  PaperAirplaneIcon,
} from "@heroicons/vue/24/outline";
import Tr from "@/i18n/translation";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";
import mobileLogo from "@/assets/images/forgot-password-mobile/logo.png";
import mobileIllustration from "@/assets/images/forgot-password-mobile/illustration.png";
import mobileIconEmail from "@/assets/images/forgot-password-mobile/icon-email.svg";
import mobileIconBackArrow from "@/assets/images/forgot-password-mobile/icon-back-arrow.svg";
import mobileIconStepEmail from "@/assets/images/forgot-password-mobile/icon-step-email.svg";
import mobileIconStepLink from "@/assets/images/forgot-password-mobile/icon-step-link.svg";
import mobileIconStepCheck from "@/assets/images/forgot-password-mobile/icon-step-check.svg";
import mobileIconHelp from "@/assets/images/forgot-password-mobile/icon-help.svg";

const { t } = useI18n();
const { forgotPassword } = useAuthStore();
const settingStore = useSettingStore();
const appStore = useAppStore();

const formRef = ref();
const formValue: Ref<{ email: string }> = ref({ email: "" });
const isLoading: Ref<boolean> = ref(false);

const handleForgotPassword = async () => {
  if (!formValue.value.email) {
    return ElNotification({ type: "danger", message: t("validation.email-required") });
  } else if (!isEmail(formValue.value.email)) {
    return ElNotification({ type: "danger", message: t("validation.email-invalid") });
  }
  isLoading.value = true;
  await forgotPassword({ email: formValue.value.email });
  isLoading.value = false;
};

const goToLogin = () => router.push(i18nRoute({ name: "signin" }));

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
  <div class="min-h-screen flex bg-surface">
    <!-- ═══════════════════════════════════════════
         MOBILE — Figma "Mot de passe" screen (< lg)
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

        <!-- Title + illustration -->
        <div class="flex w-full items-start gap-[0.625rem] pb-[0.4375rem] pt-[1.875rem]">
          <div class="flex flex-1 flex-col">
            <p class="font-jost text-xl font-semibold leading-[1.5625rem] tracking-[-0.03906rem] text-ink">
              {{ $t("forgot-mobile-title") }}
            </p>
            <p class="w-[10.3125rem] pt-2 text-sm leading-normal text-ink">
              {{ $t("forgot-mobile-subtitle") }}
            </p>
          </div>
          <div class="relative h-[11.125rem] w-[11.5625rem] shrink-0 overflow-hidden">
            <img
              :src="mobileIllustration"
              alt=""
              class="absolute left-[-1.5625rem] top-0 h-[11.3125rem] w-[14.25rem] max-w-none object-cover"
            />
          </div>
        </div>

        <!-- Form -->
        <div class="w-full pb-5 pt-[0.9375rem]">
          <AlertMessage class="mb-3" place="forgot-pass-form" />
          <form
            class="w-full rounded-[0.625rem] bg-surface px-5 py-[1.5625rem] shadow-[0_0_0.21875rem_rgba(0,0,0,0.1)]"
            autocomplete="off"
            @submit.prevent="handleForgotPassword()"
          >
            <div class="flex flex-col items-start pb-5">
              <div class="w-full">
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
                      v-model="formValue.email"
                      :placeholder="$t('email-example-placeholder')"
                      class="w-full border-0 bg-transparent text-sm text-ink outline-none placeholder:text-[#9c9ac6]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Submit -->
            <div class="w-full pt-[0.3125rem]">
              <button
                type="submit"
                :disabled="isLoading"
                class="flex w-full items-center justify-center rounded-[0.625rem] bg-[#582cfd] py-4 disabled:cursor-not-allowed disabled:opacity-60"
                @click.prevent="handleForgotPassword()"
              >
                <span v-if="!isLoading" class="text-sm font-semibold text-white">{{ $t("forgot-send-btn") }}</span>
                <span v-else class="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
              </button>
            </div>

            <!-- OR divider -->
            <div class="flex w-full items-center py-[0.875rem]">
              <div class="h-px flex-1 border-t border-[#e6e5f2]"></div>
              <p class="px-4 text-xs font-medium uppercase tracking-[0.075rem] text-[#7371a2]">{{ $t("or") }}</p>
              <div class="h-px flex-1 border-t border-[#e6e5f2]"></div>
            </div>

            <!-- Back to login -->
            <button
              type="button"
              class="flex w-full items-center justify-center gap-2 rounded-[0.625rem] border border-[#582cfd] px-px py-[1.0625rem]"
              @click="goToLogin"
            >
              <img :src="mobileIconBackArrow" class="size-5" alt="" />
              <span class="text-sm font-semibold text-[#582cfd]">{{ $t("back-to-login-label") }}</span>
            </button>
          </form>
        </div>

        <!-- Did you know? timeline -->
        <div class="w-full">
          <p class="text-sm font-semibold tracking-[0.0375rem] text-ink">
            {{ $t("forgot-mobile-did-you-know") }}
          </p>
          <div class="flex flex-col pt-3">
            <!-- Step 1 -->
            <div class="flex items-stretch gap-[0.625rem]">
              <div class="flex w-14 flex-none flex-col items-center">
                <div class="flex w-full aspect-square flex-none items-center justify-center rounded-full bg-[#f2effd]">
                  <img :src="mobileIconStepEmail" class="h-4 w-5" alt="" />
                </div>
                <div class="my-[0.375rem] w-px flex-1 bg-[#e6e5f2]"></div>
              </div>
              <div class="flex w-[1.3125rem] flex-none flex-col items-center">
                <div class="flex h-[0.875rem] w-[0.9375rem] flex-none items-center justify-center rounded-full bg-[#5121fc]">
                  <p class="text-[0.5625rem] font-semibold text-white">1</p>
                </div>
                <div class="my-[0.375rem] w-px flex-1 bg-[#e6e5f2]"></div>
              </div>
              <div class="flex-1 pb-[1.375rem] text-ink">
                <p class="text-xs font-bold leading-[1.25rem]">{{ $t("forgot-mobile-step1-title") }}</p>
                <p class="pt-0 text-[0.625rem] font-medium leading-normal">{{ $t("forgot-mobile-step1-text") }}</p>
              </div>
            </div>
            <!-- Step 2 -->
            <div class="flex items-stretch gap-[0.625rem]">
              <div class="flex w-14 flex-none flex-col items-center">
                <div class="flex w-full aspect-square flex-none items-center justify-center rounded-full bg-[#f2effd]">
                  <img :src="mobileIconStepLink" class="size-[1.24rem]" alt="" />
                </div>
                <div class="my-[0.375rem] w-px flex-1 bg-[#e6e5f2]"></div>
              </div>
              <div class="flex w-[1.3125rem] flex-none flex-col items-center">
                <div class="flex h-[0.875rem] w-[0.9375rem] flex-none items-center justify-center rounded-full bg-[#5121fc]">
                  <p class="text-[0.5625rem] font-semibold text-white">2</p>
                </div>
                <div class="my-[0.375rem] w-px flex-1 bg-[#e6e5f2]"></div>
              </div>
              <div class="flex-1 pb-[1.375rem] text-ink">
                <p class="text-xs font-bold leading-[1.25rem]">{{ $t("forgot-mobile-step2-title") }}</p>
                <p class="pt-0 text-[0.625rem] font-medium leading-normal">{{ $t("forgot-mobile-step2-text") }}</p>
              </div>
            </div>
            <!-- Step 3 (no connector after the last step) -->
            <div class="flex items-stretch gap-[0.625rem]">
              <div class="flex w-14 flex-none flex-col items-center">
                <div class="flex w-full aspect-square flex-none items-center justify-center rounded-full bg-[#eaf8eb]">
                  <img :src="mobileIconStepCheck" class="size-5" alt="" />
                </div>
              </div>
              <div class="flex w-[1.3125rem] flex-none flex-col items-center">
                <div class="flex h-[0.875rem] w-[0.9375rem] flex-none items-center justify-center rounded-full bg-[#0ca62f]">
                  <p class="text-[0.5625rem] font-semibold text-white">3</p>
                </div>
              </div>
              <div class="flex-1 text-ink">
                <p class="text-xs font-bold leading-[1.25rem]">{{ $t("forgot-mobile-step3-title") }}</p>
                <p class="pt-0 text-[0.625rem] font-medium leading-normal">{{ $t("forgot-mobile-step3-text") }}</p>
              </div>
            </div>
          </div>
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

    <!-- ═══════════════════════════════════════════
         LEFT — Form panel (≥ lg)
    ═══════════════════════════════════════════ -->
    <div class="hidden lg:flex lg:w-[580px] lg:min-w-[580px] flex-col bg-surface overflow-y-auto">
      <!-- Logo row -->
      <div class="px-8 py-5 border-b border-border-default shrink-0">
        <RouterLink :to="i18nRoute({ name: 'home' })" class="flex items-center gap-2">
          <img src="/logo.svg" class="h-9 w-9" alt="Qiryna" />
          <span class="text-[22px] font-black text-ink">Qiryna</span>
        </RouterLink>
      </div>

      <!-- Form content -->
      <div class="flex-1 px-10 py-10">
        <!-- Back link -->
        <button
          @click="goToLogin"
          class="flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink transition-colors mb-8"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {{ $t("signin-me") }}
        </button>

        <!-- Title -->
        <h1 class="text-[36px] font-black text-ink leading-tight mb-3">
          {{ $t("forgot-title-line1") }}
          <br />
          {{ $t("forgot-title-line2") }}
          <span class="text-[#ff3347]">{{ $t("forgot-title-highlight") }}</span>
        </h1>
        <p class="text-sm text-ink-muted mb-8 leading-relaxed max-w-[400px]">
          {{ $t("forgot-password-form-description") }}
        </p>

        <AlertMessage class="mb-4" place="forgot-pass-form" />

        <form ref="formRef" @submit.prevent="handleForgotPassword()" class="space-y-4">
          <!-- Email -->
          <div>
            <label class="block text-sm font-bold text-ink mb-2">{{ $t("forgot-email-label") }}</label>
            <div class="input-icon">
              <EnvelopeIcon class="icon" />
              <input
                type="email"
                required
                spellcheck="false"
                v-model="formValue.email"
                :placeholder="$t('forgot-email-placeholder')"
              />
            </div>
          </div>

          <!-- Submit -->
          <ButtonGeneral
            class="w-full flex items-center justify-center rounded-xl bg-[#ff3347] py-3.5 text-sm font-bold text-white shadow-md shadow-red-100 hover:bg-red-600 transition-colors"
            :isLoading="isLoading"
            @click.prevent="handleForgotPassword()"
            :title="$t('forgot-send-btn')"
          />
        </form>

        <!-- Separator -->
        <div class="flex items-center gap-3 my-6">
          <div class="flex-1 h-px bg-border-default"></div>
          <span class="text-xs text-ink-muted">{{ $t("or") }}</span>
          <div class="flex-1 h-px bg-border-default"></div>
        </div>

        <!-- Forgot email card -->
        <div class="flex items-start gap-4 rounded-2xl bg-surface-alt p-5">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
            <LockClosedIcon class="h-5 w-5 text-[#ff3347]" />
          </div>
          <div>
            <p class="text-sm font-bold text-ink">{{ $t("forgot-email-question") }}</p>
            <p class="text-xs text-ink-muted mt-1 leading-relaxed">{{ $t("forgot-email-text") }}</p>
          </div>
        </div>

        <!-- Security note -->
        <div class="mt-8 flex items-center justify-center gap-2">
          <ShieldCheckIcon class="h-4 w-4 text-ink-muted" />
          <span class="text-xs text-ink-muted font-medium">{{ $t("data-secure-label") }}</span>
        </div>
      </div>
    </div>

    <!-- ─── RIGHT: Image panel ─── -->
    <div class="hidden lg:flex flex-1 relative overflow-hidden">
      <!-- Background image -->
      <img src="/images/forgot-bg.jpeg" alt="" class="absolute inset-0 w-full h-full object-cover object-center" />

      <!-- Light overlay -->
      <div class="absolute inset-0 bg-white/10"></div>

      <!-- Nav items overlaid at top — transparent -->
      <div
        class="absolute top-0 left-0 right-0 flex items-center justify-end gap-5 px-8 z-20 bg-white/35"
        style="height: 73px"
      >
        <span class="text-sm font-semibold text-ink">{{ $t("already-account-label") }}</span>
        <button
          @click="goToLogin"
          class="rounded-lg bg-surface border border-[#ff3347] px-5 py-2 text-sm font-bold text-[#ff3347] hover:bg-red-50 transition-all"
        >
          {{ $t("signin-me") }}
        </button>
        <!-- Language dropdown -->
        <div class="relative">
          <button
            @click.stop="langDropdownOpen = !langDropdownOpen"
            class="flex items-center gap-1.5 bg-surface border border-border-default rounded-lg px-3 py-2 cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
          >
            <img
              :src="flagSrc(settingStore.getLocale)"
              class="w-5 h-5 rounded-sm object-cover"
              :alt="settingStore.getLocale"
            />
            <ChevronDownIcon
              class="h-3.5 w-3.5 text-ink-muted transition-transform duration-200"
              :class="{ 'rotate-180': langDropdownOpen }"
            />
          </button>
          <div v-if="langDropdownOpen" class="fixed inset-0 z-40" @click="langDropdownOpen = false" />
          <div
            v-if="langDropdownOpen"
            class="absolute right-0 top-full mt-1.5 z-50 min-w-[110px] overflow-hidden rounded-xl border border-border-default bg-surface shadow-xl"
          >
            <button
              v-for="locale in supportedLocales"
              :key="locale"
              @click="switchLocale(locale)"
              class="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-surface-alt"
              :class="settingStore.getLocale === locale ? 'text-[#ff3347] bg-red-50' : 'text-ink'"
            >
              <img :src="flagSrc(locale)" class="w-5 h-5 rounded-sm object-cover" :alt="locale" />
              {{ locale.toUpperCase() }}
            </button>
          </div>
        </div>
      </div>

      <!-- Content area below nav -->
      <div class="absolute left-0 right-0 bottom-0 overflow-hidden" style="top: 73px">
        <!-- White info card -->
        <div class="absolute top-[8%] left-[8%] max-w-[300px] z-10 rounded-3xl bg-surface p-7 shadow-2xl">
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 mb-4">
            <EnvelopeIcon class="h-7 w-7 text-[#ff3347]" />
          </div>
          <h2 class="text-lg font-black leading-snug text-ink">
            {{ $t("forgot-panel-line1") }}
            <br />
            <span class="text-[#ff3347]">{{ $t("forgot-panel-highlight") }}</span>
          </h2>
          <p class="mt-3 text-xs text-ink-muted leading-relaxed">{{ $t("forgot-password-panel-subtitle") }}</p>
        </div>

        <!-- Paper airplane (standalone red icon) -->
        <div class="absolute top-[14%] left-[62%] z-10 drop-shadow-md">
          <PaperAirplaneIcon class="h-10 w-10 text-[#ff3347]" />
        </div>

        <!-- SVG dashed arc from card top-right to airplane -->
        <svg
          class="absolute inset-0 w-full h-full pointer-events-none z-5"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M 42 16 C 50 -4, 65 4, 65 16"
            stroke="#ff3347"
            stroke-width="0.5"
            stroke-dasharray="2.2 1.5"
            stroke-linecap="round"
          />
        </svg>

        <!-- Bottom steps strip -->
        <div class="absolute bottom-6 left-6 right-6 z-10">
          <div class="grid grid-cols-3 divide-x divide-border-default bg-surface rounded-2xl px-4 py-4 shadow-lg">
            <div class="flex items-center gap-3 px-3">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50">
                <EnvelopeIcon class="h-5 w-5 text-[#ff3347]" />
              </div>
              <div>
                <p class="text-xs font-black text-ink leading-tight">{{ $t("forgot-password-step1-title") }}</p>
                <p class="text-[10px] text-ink-muted leading-tight mt-0.5">{{ $t("forgot-password-step1-text") }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 px-3">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50">
                <LinkIcon class="h-5 w-5 text-[#ff3347]" />
              </div>
              <div>
                <p class="text-xs font-black text-ink leading-tight">{{ $t("forgot-password-step2-title") }}</p>
                <p class="text-[10px] text-ink-muted leading-tight mt-0.5">{{ $t("forgot-password-step2-text") }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 px-3">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50">
                <ShieldCheckIcon class="h-5 w-5 text-[#ff3347]" />
              </div>
              <div>
                <p class="text-xs font-black text-ink leading-tight">{{ $t("forgot-password-step3-title") }}</p>
                <p class="text-[10px] text-ink-muted leading-tight mt-0.5">{{ $t("forgot-password-step3-text") }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.input-icon {
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;

  .icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: var(--color-ink-muted);
    pointer-events: none;
    z-index: 1;
  }

  input {
    width: 100%;
    border-radius: 10px;
    font-size: 14px;
    padding: 0 14px 0 38px;
    border: 1.5px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-ink);
    outline: none;
    height: 50px;
    transition: border-color 0.2s;

    &::placeholder {
      color: var(--color-ink-muted);
    }
    &:focus {
      border-color: #ff3347;
    }
  }
}
</style>
