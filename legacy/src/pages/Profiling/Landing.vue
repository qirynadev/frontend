<script lang="ts" setup>
import { type ComputedRef, computed, onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";
import { i18nRoute } from "@/utils";
import { useAuthStore, useProfilageStore } from "@/stores";
import type { FormulaType } from "@/constants/constant.type";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";
import mobileLogo from "@/assets/images/home-mobile/logo.png";
import mobileIconBell from "@/assets/images/home-mobile/icon-bell.svg";
import backArrowIcon from "@/assets/images/profilage-landing-mobile/back-arrow.svg";
import statIcon1 from "@/assets/images/profilage-landing-mobile/stat-icon-1.svg";
import statIcon2 from "@/assets/images/profilage-landing-mobile/stat-icon-2.svg";
import statIcon3 from "@/assets/images/profilage-landing-mobile/stat-icon-3.svg";
import statIcon4 from "@/assets/images/profilage-landing-mobile/stat-icon-4.svg";
import promoIcon from "@/assets/images/profilage-landing-mobile/promo-icon.svg";
import stepIcon1 from "@/assets/images/profilage-landing-mobile/step-icon-1.svg";
import stepIcon2 from "@/assets/images/profilage-landing-mobile/step-icon-2.svg";
import stepIcon3 from "@/assets/images/profilage-landing-mobile/step-icon-3.svg";
import stepIcon4 from "@/assets/images/profilage-landing-mobile/step-icon-4.svg";
import pathMeIcon from "@/assets/images/profilage-landing-mobile/path-me-icon.svg";
import pathChildIcon from "@/assets/images/profilage-landing-mobile/path-child-icon.svg";
import packageIcon from "@/assets/images/profilage-landing-mobile/package-icon.svg";
import ctaArrowIcon from "@/assets/images/profilage-landing-mobile/cta-arrow-icon.svg";

const router = useRouter();
const authStore = useAuthStore();
const profilageStore = useProfilageStore();

const isFetching = ref(false);
// "Choisissez votre parcours" : persisté dans profilageStore.beneficiary (survit à la
// navigation vers Formulas.vue, lu au moment du paiement — voir handleClick là-bas).
const selectedPath = computed({
  get: () => profilageStore.beneficiary.type,
  set: (value: "self" | "child") => {
    profilageStore.beneficiary.type = value;
  },
});

const isChildFormValid = computed(
  () =>
    selectedPath.value === "self" ||
    (!!profilageStore.beneficiary.first_name &&
      !!profilageStore.beneficiary.last_name &&
      !!profilageStore.beneficiary.birthday),
);

const stats = [
  { icon: statIcon1, bg: "#eef2ff", value: "profilage-landing-stat1-value", text: "profilage-landing-stat1-text", valueClass: "text-[#4f46e5]", standalone: false },
  { icon: statIcon2, bg: "#fffbeb", value: "profilage-landing-stat2-value", text: "profilage-landing-stat2-text", valueClass: "text-[#f59e0b]", standalone: false },
  { icon: statIcon3, bg: "#ecfdf5", value: "profilage-landing-stat3-value", text: "profilage-landing-stat3-text", valueClass: "text-[#10b981]", standalone: false },
  { icon: statIcon4, bg: "", value: "profilage-landing-stat4-value", text: "profilage-landing-stat4-text", valueClass: "text-[#ff2d46]", standalone: true },
];

const steps = [
  { icon: stepIcon1, badge: "#3700f6", number: "1", title: "profilage-landing-step1-title", desc: "profilage-landing-step1-desc" },
  { icon: stepIcon2, badge: "#03b62a", number: "2", title: "profilage-landing-step2-title", desc: "profilage-landing-step2-desc" },
  { icon: stepIcon3, badge: "#ff8e03", number: "3", title: "profilage-landing-step3-title", desc: "profilage-landing-step3-desc" },
  { icon: stepIcon4, badge: "#0154f5", number: "4", title: "profilage-landing-step4-title", desc: "profilage-landing-step4-desc" },
];

const highlightedFormula: ComputedRef<FormulaType | null> = computed(() => profilageStore.formulaList?.[0] ?? null);

onBeforeMount(async () => {
  isFetching.value = true;
  await profilageStore.fetchFormulas();
  isFetching.value = false;
  if (authStore.token) await authStore.fetchUnreadNotificationCount();
});

const goBack = () => router.back();

const goFormulas = () => {
  if (!isChildFormValid.value) return;
  router.push(i18nRoute({ name: "profilage-formulas" }));
};
</script>

<template>
  <div class="mx-auto flex w-full max-w-[26.875rem] flex-col items-center overflow-x-hidden bg-surface pb-26">
    <div class="flex w-full flex-col items-center px-4 pb-6 pt-4">
      <!-- Top bar -->
      <div class="flex w-full items-center justify-between pb-[1.875rem]">
        <button type="button" class="flex size-6 items-center justify-center" aria-label="Retour" @click="goBack">
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
          v-if="authStore.token"
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
        <div v-else class="size-[3.0625rem]"></div>
      </div>

      <!-- Hero -->
      <div class="w-full pb-4">
        <p class="text-xl font-semibold leading-normal tracking-[-0.041rem] text-ink">
          {{ $t("profilage-landing-hero-title") }}
        </p>
        <p class="pt-2 text-sm text-ink">{{ $t("profilage-landing-hero-text") }}</p>
      </div>

      <!-- Le saviez-vous ? -->
      <div class="w-full">
        <p class="text-sm font-semibold tracking-[0.0375rem] text-ink">
          {{ $t("profilage-landing-stats-title") }}
        </p>
        <div class="grid grid-cols-2 gap-3 pt-3">
          <div
            v-for="(stat, index) in stats"
            :key="index"
            class="flex items-start gap-2.5 rounded-[0.625rem] border border-[#e6e5f2] bg-surface p-[0.6875rem]"
          >
            <div
              class="flex size-9 shrink-0 items-center justify-center rounded-full"
              :style="!stat.standalone ? { backgroundColor: stat.bg } : undefined"
            >
              <img :src="stat.icon" :class="stat.standalone ? 'size-9' : 'size-5'" alt="" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-semibold whitespace-nowrap" :class="stat.valueClass">{{ $t(stat.value) }}</p>
              <p class="pt-0.5 text-[0.5rem] font-medium leading-[0.84375rem] text-ink">{{ $t(stat.text) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bandeau promo -->
      <div class="w-full pt-[0.9375rem]">
        <div class="flex w-full items-center justify-between rounded-[0.625rem] bg-surface-tint px-[0.5625rem] py-5">
          <div class="flex flex-1 items-start gap-4">
            <div class="flex size-11 shrink-0 items-center justify-center">
              <img :src="promoIcon" class="size-full" alt="" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-bold leading-tight text-ink">
                {{ $t("profilage-landing-promo-title") }}
              </p>
              <p class="pt-1 text-[0.625rem] leading-tight text-ink">
                {{ $t("profilage-landing-promo-text") }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Notre méthode en 4 étapes -->
      <div class="w-full pt-5">
        <p class="text-sm font-semibold tracking-[0.0375rem] text-ink">
          {{ $t("profilage-landing-method-title") }}
        </p>
        <div class="relative flex items-start pt-[0.625rem]">
          <template v-for="(step, index) in steps" :key="index">
            <div class="flex flex-1 flex-col items-center gap-[0.6875rem]">
              <div class="flex flex-col items-center gap-[1.125rem]">
                <img :src="step.icon" class="size-[3.125rem]" alt="" />
                <div
                  class="flex h-5 w-[1.3125rem] items-center justify-center rounded-full text-[0.6875rem] font-semibold text-white"
                  :style="{ backgroundColor: step.badge }"
                >
                  {{ step.number }}
                </div>
              </div>
              <div class="flex flex-col items-center gap-[0.3125rem] text-center text-[0.5625rem] text-ink">
                <p class="font-bold leading-normal">{{ $t(step.title) }}</p>
                <p class="font-medium leading-normal">{{ $t(step.desc) }}</p>
              </div>
            </div>
            <div
              v-if="index < steps.length - 1"
              class="mt-[1.5rem] h-0 w-5 shrink-0 self-start border-t-2 border-dotted border-ink"
            />
          </template>
        </div>
      </div>

      <!-- Choisissez votre parcours -->
      <div class="w-full pt-7">
        <p class="text-sm font-semibold tracking-[0.0375rem] text-ink">
          {{ $t("profilage-landing-choose-path-title") }}
        </p>

        <button
          type="button"
          class="mt-[0.875rem] flex w-full items-center justify-between rounded-[0.625rem] border border-solid bg-surface p-[1.0625rem]"
          :class="selectedPath === 'self' ? 'border-[#6853fe]' : 'border-[#efeff6]'"
          @click="selectedPath = 'self'"
        >
          <div class="flex items-center gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e8e1fe]">
              <img :src="pathMeIcon" class="size-6" alt="" />
            </div>
            <div class="text-left">
              <div class="flex items-start gap-1.5">
                <p class="text-[0.8125rem] font-semibold text-ink">{{ $t("profilage-landing-path-me-title") }}</p>
                <span class="rounded-md bg-[#efecfe] px-1.5 py-0.5 text-[0.5rem] font-medium text-[#2a11f8]">
                  {{ $t("profilage-landing-recommended") }}
                </span>
              </div>
              <p class="pt-0.5 text-[0.65625rem] text-ink">{{ $t("profilage-landing-path-me-desc") }}</p>
            </div>
          </div>
          <div
            class="size-[0.875rem] shrink-0 rounded-full border-4"
            :class="selectedPath === 'self' ? 'border-[#330bfd]' : 'border-[#eeeff6]'"
          />
        </button>

        <button
          type="button"
          class="mt-[0.875rem] flex w-full items-center justify-between rounded-[0.625rem] border border-solid bg-surface p-[1.0625rem]"
          :class="selectedPath === 'child' ? 'border-[#6853fe]' : 'border-[#efeff6]'"
          @click="selectedPath = 'child'"
        >
          <div class="flex items-center gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#def5e3]">
              <img :src="pathChildIcon" class="size-5" alt="" />
            </div>
            <div class="text-left">
              <div class="flex items-start gap-1.5">
                <p class="text-[0.8125rem] font-semibold text-ink">
                  {{ $t("profilage-landing-path-child-title") }}
                </p>
                <span class="rounded-md bg-[#efecfe] px-1.5 py-0.5 text-[0.5rem] font-medium text-[#2a11f8]">
                  {{ $t("profilage-landing-recommended") }}
                </span>
              </div>
              <p class="pt-0.5 text-[0.65625rem] text-ink">{{ $t("profilage-landing-path-child-desc") }}</p>
            </div>
          </div>
          <div
            class="size-[0.875rem] shrink-0 rounded-full border"
            :class="selectedPath === 'child' ? 'border-4 border-[#330bfd]' : 'border-[#eeeff6]'"
          />
        </button>

        <!-- Infos de l'enfant : requises pour que le bilan soit réservé à son nom
             (pas de maquette dédiée pour ce sous-formulaire, voir audit backend). -->
        <div v-if="selectedPath === 'child'" class="mt-[0.875rem] flex flex-col gap-2 rounded-[0.625rem] border border-[#efeff6] bg-surface p-[1.0625rem]">
          <input
            v-model="profilageStore.beneficiary.first_name"
            type="text"
            required
            :placeholder="$t('profilage-landing-child-first-name-placeholder')"
            class="w-full rounded-lg border border-border-default bg-surface-alt px-3 py-2 text-xs text-ink outline-none placeholder:text-ink-muted"
          />
          <input
            v-model="profilageStore.beneficiary.last_name"
            type="text"
            required
            :placeholder="$t('profilage-landing-child-last-name-placeholder')"
            class="w-full rounded-lg border border-border-default bg-surface-alt px-3 py-2 text-xs text-ink outline-none placeholder:text-ink-muted"
          />
          <div class="flex gap-2">
            <input
              v-model="profilageStore.beneficiary.birthday"
              type="date"
              required
              class="w-full min-w-0 flex-1 rounded-lg border border-border-default bg-surface-alt px-3 py-2 text-xs text-ink outline-none"
            />
            <select
              v-model="profilageStore.beneficiary.gender"
              class="w-full min-w-0 flex-1 rounded-lg border border-border-default bg-surface-alt px-3 py-2 text-xs text-ink outline-none"
            >
              <option value="M">{{ $t("profilage-landing-child-gender-m") }}</option>
              <option value="F">{{ $t("profilage-landing-child-gender-f") }}</option>
            </select>
          </div>
        </div>

        <button
          v-if="highlightedFormula"
          type="button"
          class="mt-[0.875rem] flex h-[5.125rem] w-full items-center justify-between rounded-[0.625rem] bg-surface-tint px-4 pb-4 pt-3 shadow-[0px_2px_2px_0px_rgba(240,244,255,0.4)] disabled:opacity-50"
          :disabled="!isChildFormValid"
          @click="goFormulas"
        >
          <div class="flex flex-1 items-center gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f2eefd]">
              <img :src="packageIcon" class="size-5 -scale-y-100 rotate-180" alt="" />
            </div>
            <div class="min-w-0 flex-1 text-left">
              <p class="text-[0.8125rem] font-semibold text-ink">{{ highlightedFormula.title }}</p>
              <p class="pt-0.5 text-[0.625rem] text-ink">
                {{ $t("profilage-landing-promo-text") }}
              </p>
            </div>
          </div>
          <p class="shrink-0 text-xl font-extrabold text-[#3706f9]">{{ highlightedFormula.amount }} €</p>
        </button>
      </div>

      <!-- CTA -->
      <div class="w-full pt-5">
        <button
          type="button"
          class="flex w-full items-center justify-center gap-2.5 rounded-[0.625rem] bg-[#4309fc] px-6 py-4 disabled:opacity-50"
          :disabled="!isChildFormValid"
          @click="goFormulas"
        >
          <span class="text-sm font-semibold text-white">{{ $t("profilage-landing-cta") }}</span>
          <img :src="ctaArrowIcon" class="size-5" alt="" />
        </button>
      </div>
    </div>

    <!-- Bottom tab bar -->
    <MobileAppBottomNav active="orientation" :special-orientation-icon="true" />
  </div>
</template>
