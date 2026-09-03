<script lang="ts" setup>
import router from "@/router";
import { useAppStore, useAuthStore } from "@/stores";
import { i18nRoute } from "@/utils";
import { computed, onBeforeMount, ref } from "vue";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";
import mobileLogo from "@/assets/images/destination-choice-mobile/logo.png";
import iconBack from "@/assets/images/destination-choice-mobile/icon-back.svg";
import iconBell from "@/assets/images/destination-choice-mobile/icon-bell.svg";
import iconPayment from "@/assets/images/destination-choice-mobile/icon-payment.svg";
import iconSupport from "@/assets/images/destination-choice-mobile/icon-support.svg";
import iconSatisfaction from "@/assets/images/destination-choice-mobile/icon-satisfaction.svg";
import flagEnglish from "@/assets/images/language-choice-mobile/flag-english.svg";
import flagGerman from "@/assets/images/language-choice-mobile/flag-german.svg";
import flagFrench from "@/assets/images/language-choice-mobile/flag-french.svg";
import flagArabic from "@/assets/images/language-choice-mobile/flag-arabic.svg";
import flagSpanish from "@/assets/images/language-choice-mobile/flag-spanish.png";
import flagChinese from "@/assets/images/language-choice-mobile/flag-chinese.svg";
import flagJapanese from "@/assets/images/language-choice-mobile/flag-japanese.svg";
import flagKorean from "@/assets/images/language-choice-mobile/flag-korean.svg";
import iconCheck from "@/assets/images/language-choice-mobile/icon-check.svg";
import iconArrowContinue from "@/assets/images/language-choice-mobile/icon-arrow-continue.svg";
import iconGlobe from "@/assets/images/language-choice-mobile/icon-globe.svg";

const appStore = useAppStore();
const authStore = useAuthStore();

onBeforeMount(async () => {
  if (authStore.token) await authStore.fetchUnreadNotificationCount();
});

// Drapeau par slug connu (assets curés depuis le Figma) — repli sur une icône globe
// générique si le back-office ajoute une langue non couverte ici.
const FLAG_BY_SLUG: Record<string, string> = {
  anglais: flagEnglish,
  allemand: flagGerman,
  francais: flagFrench,
  arabe: flagArabic,
  espagnol: flagSpanish,
  mandarin: flagChinese,
  chinois: flagChinese,
  japonais: flagJapanese,
  coreen: flagKorean,
};
const flagFor = (slug: string) => FLAG_BY_SLUG[slug] ?? iconGlobe;

// Badge éditorial : géré en back-office (Course.badge, champ enum) et exposé dans
// menuData.courses.sub_menus. Couleurs + libellés i18n mappés ici par valeur d'enum.
const BADGE_STYLES: Record<string, { labelKey: string; bg: string; fg: string }> = {
  most_demanded: { labelKey: "language-badge-most-demanded", bg: "#ebe7fd", fg: "#4f46e5" },
  very_popular: { labelKey: "language-badge-very-popular", bg: "#feefe6", fg: "#ff4600" },
  popular: { labelKey: "language-badge-popular", bg: "#e4f7e7", fg: "#059669" },
  growing: { labelKey: "language-badge-growing", bg: "#eaf1fd", fg: "#003ef3" },
  trending: { labelKey: "language-badge-trending", bg: "#feefe6", fg: "#ff4600" },
};
const badgeFor = (badge?: string | null) => (badge ? (BADGE_STYLES[badge] ?? null) : null);

// Vraie liste des langues/cours, déjà utilisée par Home.vue pour la CTA "Apprendre une
// langue" (menuData.courses.sub_menus : {id, title, slug, badge}).
const languages = computed<{ id: string; title: string; slug: string; badge?: string | null }[]>(
  () => (appStore.menuData?.courses as any)?.sub_menus ?? [],
);

const selectedSlug = ref<string | null>(null);
const selectLanguage = (slug: string) => {
  selectedSlug.value = slug;
};

// "Demander une langue" : petit formulaire inline (langue + email), persisté en base
// côté backoffice (table language_requests) plutôt que redirigé vers le contact générique.
const showLanguageRequestForm = ref(false);
const isRequestingLanguage = ref(false);
const languageRequestSent = ref(false);
const languageRequestForm = ref<{ language: string; email: string }>({
  language: "",
  email: authStore.user?.email ?? "",
});

const openLanguageRequestForm = () => {
  showLanguageRequestForm.value = true;
};

const submitLanguageRequest = async () => {
  if (!languageRequestForm.value.language || !languageRequestForm.value.email) return;
  isRequestingLanguage.value = true;
  const success = await appStore.sendLanguageRequest(languageRequestForm.value);
  isRequestingLanguage.value = false;
  if (success) {
    languageRequestSent.value = true;
    showLanguageRequestForm.value = false;
    languageRequestForm.value.language = "";
  }
};

const goToCourse = () => {
  const slug = selectedSlug.value ?? languages.value[0]?.slug;
  if (!slug) return;
  router.push(i18nRoute({ name: "courses-objectives", params: { slug } }));
};
</script>

<template>
  <div class="flex w-full flex-col items-center overflow-x-hidden bg-surface pb-26">
    <div class="flex w-full flex-col items-center px-4 pb-6 pt-4">
      <!-- Top bar -->
      <div class="flex w-full items-center justify-between pb-[1.875rem]">
        <button type="button" class="flex size-6 items-center justify-center" aria-label="Retour" @click="router.back()">
          <img :src="iconBack" class="size-full" alt="" />
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
          <img :src="iconBell" class="size-[1.5625rem]" alt="" />
          <span
            v-if="authStore.unreadNotificationCount > 0"
            class="absolute left-[1.5rem] top-[0.25rem] flex items-center justify-center rounded-full bg-[#ee163e] px-[0.375rem] py-[0.0625rem] text-xs font-medium text-white"
          >
            {{ authStore.unreadNotificationCount }}
          </span>
        </RouterLink>
      </div>

      <!-- Title -->
      <div class="w-full pb-3">
        <p class="text-xl font-semibold tracking-[-0.040625rem] text-ink">
          {{ $t("language-choice-title") }}
        </p>
        <p class="pt-1 text-sm leading-[1.421875rem] text-ink">{{ $t("language-choice-subtitle") }}</p>
      </div>

      <!-- Languages grid -->
      <div class="grid w-full grid-cols-2 gap-[0.625rem]">
        <button
          v-for="lang in languages"
          :key="lang.id"
          type="button"
          class="relative flex items-center gap-[0.625rem] rounded-[0.625rem] border bg-surface p-[0.6875rem] text-left shadow-[0_0.125rem_0.25rem_rgba(241,245,249,0.5)]"
          :class="
            (selectedSlug ?? languages[0]?.slug) === lang.slug ? 'border-[#4b0ffb]' : 'border-border-default'
          "
          @click="selectLanguage(lang.slug)"
        >
          <img :src="flagFor(lang.slug)" class="size-8 flex-none rounded-full object-cover" alt="" />
          <span class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-ink">{{ lang.title }}</p>
            <span
              v-if="badgeFor(lang.badge)"
              class="mt-1 inline-flex items-center rounded px-[0.6875rem] py-[0.1875rem] text-[0.625rem] font-medium"
              :style="{ backgroundColor: badgeFor(lang.badge)!.bg, color: badgeFor(lang.badge)!.fg }"
            >
              {{ $t(badgeFor(lang.badge)!.labelKey) }}
            </span>
          </span>
          <span
            v-if="(selectedSlug ?? languages[0]?.slug) === lang.slug"
            class="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[#4b0ffb]"
          >
            <img :src="iconCheck" class="size-3.5" alt="" />
          </span>
        </button>
      </div>

      <!-- Request a language -->
      <div class="w-full pt-6">
        <div class="w-full rounded-[0.625rem] bg-surface-tint px-[0.5625rem] py-5">
          <div class="flex w-full items-center justify-between gap-3">
            <div class="flex min-w-0 flex-1 items-start gap-4">
              <img :src="iconGlobe" class="size-11 flex-none" alt="" />
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold text-ink">{{ $t("language-choice-request-title") }}</p>
                <p class="pt-1 text-[0.625rem] leading-4 text-ink">
                  {{ languageRequestSent ? $t("language-choice-request-sent") : $t("language-choice-request-text") }}
                </p>
              </div>
            </div>
            <button
              v-if="!showLanguageRequestForm && !languageRequestSent"
              type="button"
              class="flex-none rounded-[0.625rem] border border-[#450ff2] px-[0.9375rem] py-[0.5625rem] text-xs font-medium text-[#450ff2]"
              @click="openLanguageRequestForm"
            >
              {{ $t("language-choice-request-button") }}
            </button>
          </div>

          <form v-if="showLanguageRequestForm" class="mt-4 flex flex-col gap-2" @submit.prevent="submitLanguageRequest">
            <input
              v-model="languageRequestForm.language"
              type="text"
              required
              :placeholder="$t('language-choice-request-language-placeholder')"
              class="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-xs text-ink outline-none placeholder:text-ink-muted"
            />
            <input
              v-model="languageRequestForm.email"
              type="email"
              required
              :placeholder="$t('language-choice-request-email-placeholder')"
              class="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-xs text-ink outline-none placeholder:text-ink-muted"
            />
            <button
              type="submit"
              class="mt-1 w-full rounded-[0.625rem] bg-[#4309fc] py-2.5 text-xs font-semibold text-white disabled:opacity-50"
              :disabled="isRequestingLanguage"
            >
              {{ $t("language-choice-request-submit") }}
            </button>
          </form>
        </div>
      </div>

      <!-- Continue -->
      <div class="w-full pt-5">
        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-[0.625rem] bg-[#4309fc] px-6 py-4 text-sm font-semibold text-white"
          :disabled="!languages.length"
          @click="goToCourse"
        >
          {{ $t("continue-with-prefix") }}
          <img :src="iconArrowContinue" class="size-5" alt="" />
        </button>
      </div>

      <!-- Trust badges -->
      <div class="mt-6 flex w-full items-center justify-center gap-2 rounded-[0.625rem] border border-border-default bg-surface-alt py-[0.6875rem]">
        <div class="flex flex-col items-center gap-[0.375rem] px-1">
          <img :src="iconPayment" class="size-10" alt="" />
          <p class="text-center text-[0.6875rem] font-semibold leading-[0.8203125rem] text-ink">
            {{ $t("trust-payment") }}
          </p>
        </div>
        <div class="h-[3.25rem] w-px bg-border-default"></div>
        <div class="flex flex-col items-center gap-[0.375rem] px-1">
          <img :src="iconSupport" class="size-10" alt="" />
          <p class="text-center text-[0.6875rem] font-semibold leading-[0.8203125rem] text-ink">
            {{ $t("trust-support") }}
          </p>
        </div>
        <div class="h-[3.25rem] w-px bg-border-default"></div>
        <div class="flex flex-col items-center gap-[0.375rem] px-1">
          <img :src="iconSatisfaction" class="size-10" alt="" />
          <p class="text-center text-[0.6875rem] font-semibold leading-[0.8203125rem] text-ink">
            {{ $t("trust-satisfaction") }}
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom tab bar -->
    <MobileAppBottomNav active="orientation" :special-orientation-icon="true" />
  </div>
</template>
