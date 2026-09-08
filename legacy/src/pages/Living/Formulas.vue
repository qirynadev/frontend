<script lang="ts" setup>
import defaultImage from "@/assets/images/france.jpeg";
import type { FormulaType, LivingType } from "@/constants/constant.type";
import { useAuthStore, useLivingStore, usePaymentStore } from "@/stores";
import { type ComputedRef, type Ref, computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { i18nRoute } from "@/utils";
import ButtonGeneral from "@/components/atoms/ButtonGeneral.vue";
import { CheckCircleIcon } from "@heroicons/vue/20/solid";
import { useI18n } from "vue-i18n";
import { onBeforeMount } from "vue";
// import PreorderModal from "@/components/modals/PreorderModal.vue";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";
import mobileLogo from "@/assets/images/home-mobile/logo.png";
import mobileIconBell from "@/assets/images/home-mobile/icon-bell.svg";
import backArrowIcon from "@/assets/images/profilage-landing-mobile/back-arrow.svg";
import trustPaymentIcon from "@/assets/images/profilage-formulas-mobile/trust-payment-icon.svg";
import trustAccompagnementIcon from "@/assets/images/profilage-formulas-mobile/trust-accompagnement-icon.svg";
import trustSatisfactionIcon from "@/assets/images/profilage-formulas-mobile/trust-satisfaction-icon.svg";
import flagIcon from "@/assets/images/living-formulas-mobile/flag-icon.png";
import statIconDeposit from "@/assets/images/living-formulas-mobile/stat-icon-deposit.svg";
import statIconDuration from "@/assets/images/living-formulas-mobile/stat-icon-duration.svg";
import statIconCharges from "@/assets/images/living-formulas-mobile/stat-icon-charges.svg";
import statIconRent from "@/assets/images/living-formulas-mobile/stat-icon-rent.svg";
import comoeIcon from "@/assets/images/living-formulas-mobile/comoe-icon.svg";
import volgaIcon from "@/assets/images/living-formulas-mobile/volga-icon.svg";
import yukonIcon from "@/assets/images/living-formulas-mobile/yukon-icon.svg";
import ctaArrowWhite from "@/assets/images/living-formulas-mobile/cta-arrow.svg";
import { accentFor as accentForFormula } from "@/utils/formulaAccent";

const mobileStats = [
  { icon: statIconDeposit, field: "deposit_label", fallbackValueKey: "living-formulas-mobile-stat1-value", text: "living-formulas-mobile-stat1-text" },
  { icon: statIconDuration, field: "lease_duration_label", fallbackValueKey: "living-formulas-mobile-stat2-value", text: "living-formulas-mobile-stat2-text" },
  { icon: statIconCharges, field: "charges_label", fallbackValueKey: "living-formulas-mobile-stat3-value", text: "living-formulas-mobile-stat3-text" },
  { icon: statIconRent, field: "average_rent_label", fallbackValueKey: "living-formulas-mobile-stat4-value", text: "living-formulas-mobile-stat4-text" },
];

// Repli positionnel (formules pas encore migrées vers un accent explicite en back-office).
const DEFAULT_ACCENT_ORDER = ["green", "purple", "orange"];
const DEFAULT_ICONS = [comoeIcon, volgaIcon, yukonIcon];

const accentFor = (formula: FormulaType, index: number) => accentForFormula(formula, index, DEFAULT_ACCENT_ORDER);
const iconFor = (formula: FormulaType, index: number) => formula.icon || DEFAULT_ICONS[index % DEFAULT_ICONS.length];

const router = useRouter();
const livingStore = useLivingStore();
const authStore = useAuthStore();
const { iniPayment, setOrderData, redirectUrl } = usePaymentStore();
const { t } = useI18n();

const isFetching: Ref<boolean> = ref(false);
const isLoading: Ref<boolean> = ref(false);
// const showPreorderModal: Ref<boolean> = ref(false);
// const pendingFormula: Ref<FormulaType | null> = ref(null);

const userToken: Ref<string> = computed(() => authStore.token);

const formulaList: ComputedRef<FormulaType[]> = computed(() => livingStore.getFormulaList);
const selectedFormula: ComputedRef<FormulaType | null> = computed(() => livingStore.getSelectedFormula);
const selectedLiving: ComputedRef<LivingType | null> = computed(() => livingStore.getSelectedLiving);

const goBack = () => router.back();

onBeforeMount(async () => {
  isFetching.value = true;
  await livingStore.fetchFormulas();
  isFetching.value = false;
  if (authStore.token) await authStore.fetchUnreadNotificationCount();
});

const handleClick = async (formula: FormulaType) => {
  livingStore.setSelectedFormula(formula);

  const orderData = {
    offer_id: String(formula.id),
    service_id: String(selectedLiving.value?.id),
    service_type: "living",
  };

  if (!userToken.value) {
    setOrderData(orderData);

    return router.push(
      i18nRoute({
        name: "signin",
      }),
    );
  }

  isLoading.value = true;
  const res = await iniPayment(orderData);
  isLoading.value = false;

  if (res) {
    window.location.replace(redirectUrl ?? "");
  }
};

// const handlePreorderConfirm = async () => {};
// const handlePreorderClose = () => {};
</script>

<template>
  <div>
    <!-- ═══════════════════════════════════════════
         MOBILE — Figma "Offres de Logement" (< lg)
    ═══════════════════════════════════════════ -->
    <div class="mx-auto flex w-full max-w-[26.875rem] flex-col items-center overflow-x-hidden bg-surface pb-26 lg:hidden">
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

        <!-- Bandeau stats -->
        <div class="flex w-full flex-col items-center gap-8 rounded-[0.625rem] bg-surface-alt py-[1.0625rem]">
          <div class="flex w-full items-center gap-2.5 pl-[0.8125rem]">
            <img :src="selectedLiving?.country_flag || flagIcon" class="size-6 shrink-0" alt="" />
            <p class="flex-1 text-sm font-semibold tracking-[-0.041rem] text-ink">
              {{ selectedLiving?.hero_tagline || $t("living-formulas-mobile-hero-title") }}
            </p>
          </div>
          <div class="flex w-full items-center px-[0.5625rem]">
            <div v-for="(stat, index) in mobileStats" :key="index" class="flex flex-1 flex-col items-center gap-1.5">
              <img :src="stat.icon" class="size-10" alt="" />
              <p class="pt-1.5 text-[0.6875rem] font-semibold leading-[0.8203125rem] text-ink">
                {{ (selectedLiving as any)?.[stat.field] || $t(stat.fallbackValueKey) }}
              </p>
              <p class="text-center text-[0.5625rem] leading-normal text-ink">{{ $t(stat.text) }}</p>
            </div>
          </div>
        </div>

        <!-- Formules -->
        <div v-if="formulaList.length" class="w-full pb-5">
          <p class="pb-[1.0625rem] pt-6 text-sm font-semibold tracking-[0.0375rem] text-ink">
            {{ $t("living-formulas-mobile-section-title") }}
          </p>
          <div class="flex w-full items-stretch justify-center gap-[0.3125rem]">
            <div
              v-for="(formula, index) in formulaList"
              :key="index"
              class="relative flex flex-1 flex-col items-start rounded-[0.625rem] bg-surface px-[0.5625rem] pb-6"
              :class="formula.badge === 'most_chosen' ? 'border border-[#5c3cf3] pt-8' : 'pt-[2.3125rem] shadow-[0px_0px_3.5px_rgba(0,0,0,0.1)]'"
            >
              <div
                v-if="formula.badge === 'most_chosen'"
                class="absolute left-3 top-0 flex items-center gap-1 rounded-b-xl bg-[#5c3cf3] px-1.5 py-1"
              >
                <span class="text-[0.5625rem] font-extrabold uppercase tracking-[0.028125rem] text-white">★</span>
                <span class="text-[0.5rem] font-medium uppercase tracking-[0.028125rem] text-white">
                  {{ $t("living-formulas-mobile-most-chosen") }}
                </span>
              </div>

              <div class="flex items-center gap-2.5">
                <img :src="iconFor(formula, index)" class="size-[1.875rem]" alt="" />
                <p class="text-[0.8125rem] font-semibold" :style="{ color: accentFor(formula, index).titleColor }">
                  {{ formula.title }}
                </p>
              </div>
              <p class="w-full pt-2.5 text-[0.5625rem] leading-[1.21875rem] text-ink">
                {{ formula.description }}
              </p>
              <span
                v-if="formula.listings_count"
                class="mt-2 rounded-[0.3125rem] px-3 py-0.5 text-[0.5rem] font-medium"
                :style="{ backgroundColor: accentFor(formula, index).badgeBg, color: accentFor(formula, index).badgeText }"
              >
                {{ $t("living-formulas-mobile-listings-count", { n: formula.listings_count }) }}
              </span>
              <div class="mt-5 w-full border-t border-border-default"></div>

              <div class="flex w-full flex-1 flex-col gap-1.5 pt-[0.9375rem]">
                <div v-for="(item, itemIndex) in formula.items" :key="itemIndex" class="flex items-center gap-1.5">
                  <svg
                    class="h-[0.46875rem] w-[0.4375rem] shrink-0"
                    :style="{ color: accentFor(formula, index).titleColor }"
                    viewBox="0 0 12 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <p class="text-[0.4375rem] leading-[1rem] text-ink">{{ item.title }}</p>
                </div>
              </div>

              <div class="w-full pt-1.5">
                <p class="text-xl font-semibold" :style="{ color: accentFor(formula, index).priceColor }">
                  {{ formula.amount }} €
                </p>
                <button
                  type="button"
                  class="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-md py-2.5"
                  :style="{ backgroundColor: accentFor(formula, index).buttonBg }"
                  :disabled="isLoading"
                  @click="handleClick(formula)"
                >
                  <span class="text-[0.625rem] font-semibold text-white">
                    {{ $t("living-formulas-mobile-cta-prefix") }} {{ formula.title }}
                  </span>
                  <img :src="ctaArrowWhite" class="h-[0.4375rem] w-2" alt="" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Trust badges -->
        <div class="flex w-full items-center justify-center gap-[0.625rem] rounded-[0.625rem] border border-border-default bg-surface-alt px-px py-[0.6875rem]">
          <div class="flex flex-1 flex-col items-center gap-1.5 px-1">
            <img :src="trustPaymentIcon" class="size-10" alt="" />
            <p class="text-center text-[0.6875rem] font-semibold leading-[0.8203125rem] text-ink">
              {{ $t("profilage-formulas-mobile-trust-payment") }}
            </p>
          </div>
          <div class="h-9 w-px shrink-0 bg-border-default"></div>
          <div class="flex flex-1 flex-col items-center gap-1.5 px-1">
            <div class="flex size-10 items-center justify-center rounded-full bg-[#def5e3]">
              <img :src="trustAccompagnementIcon" class="size-6" alt="" />
            </div>
            <p class="text-center text-[0.6875rem] font-semibold leading-[0.8203125rem] text-ink">
              {{ $t("profilage-formulas-mobile-trust-support") }}
            </p>
          </div>
          <div class="h-9 w-px shrink-0 bg-border-default"></div>
          <div class="flex flex-1 flex-col items-center gap-1.5 px-1">
            <img :src="trustSatisfactionIcon" class="size-10" alt="" />
            <p class="text-center text-[0.6875rem] font-semibold leading-[0.8203125rem] text-ink">
              {{ $t("profilage-formulas-mobile-trust-satisfaction") }}
            </p>
          </div>
        </div>
      </div>

      <!-- Bottom tab bar -->
      <MobileAppBottomNav active="orientation" :special-orientation-icon="true" />
    </div>

    <!-- ═══════════════════════════════════════════
         DESKTOP — liste des formules existante (≥ lg)
    ═══════════════════════════════════════════ -->
    <div class="global-container hidden lg:block">
      <div class="container-inner">
        <div class="left-part">
          <h2 class="text-2xl font-bold mb-5">
            {{ $t("living.select-formula") }}
          </h2>

          <template v-for="(formula, index) in formulaList" :key="index">
            <div
              class="flex items-center bg-surface border border-border-default rounded-lg mb-5 shadow"
              @click="() => handleClick(formula)"
            >
              <img
                class="object-cover w-1/3 rounded-s-lg h-auto flex self-end"
                :src="formula.icon ?? defaultImage"
                alt=""
              />
              <div class="flex flex-col justify-between ps-[10px] leading-normal w-full">
                <h5 class="mb-2 text-2xl font-bold tracking-tight text-ink dark:text-white">
                  {{ formula.title }}
                </h5>
                <ul class="mb-3 font-normal text-ink-muted dark:text-gray-400">
                  <li v-for="(value, index) in formula.items" :key="index" class="flex items-center">
                    <CheckCircleIcon class="h-4 w-4 mr-1 text-red-500" />
                    {{ value.title }}
                  </li>
                </ul>
              </div>
              <div class="flex justify-end w-[100px]! px-2">
                <ButtonGeneral
                  :title="formula.amount + ' €'"
                  class="w-full px-4 py-2 whitespace-nowrap text-center bg-[#273c66]!"
                  @pressed="handleClick(formula)"
                />
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>

  <!-- <PreorderModal
    :visible="showPreorderModal"
    service-type="foreign-languages"
    :is-loading="isLoading"
    @close="handlePreorderClose"
    @confirm="handlePreorderConfirm"
  /> -->
</template>

<style lang="scss" scoped>
.global-container {
  .container-inner {
    @media (max-width: 1023px) {
      padding-bottom: 70px;
    }
  }
}
</style>
