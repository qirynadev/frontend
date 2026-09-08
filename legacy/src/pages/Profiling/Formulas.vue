<script lang="ts" setup>
import defaultImage from "@/assets/images/france.jpeg";
import type { FormulaType } from "@/constants/constant.type";
import { useAuthStore, useProfilageStore, usePaymentStore } from "@/stores";
import { type ComputedRef, type Ref, computed, ref } from "vue";
import { useRouter } from "vue-router";
import { i18nRoute } from "@/utils";
import ButtonGeneral from "@/components/atoms/ButtonGeneral.vue";
import { CheckCircleIcon } from "@heroicons/vue/20/solid";
import { useI18n } from "vue-i18n";
import { onBeforeMount } from "vue";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";
import mobileLogo from "@/assets/images/home-mobile/logo.png";
import mobileIconBell from "@/assets/images/home-mobile/icon-bell.svg";
import backArrowIcon from "@/assets/images/profilage-landing-mobile/back-arrow.svg";
import trustPaymentIcon from "@/assets/images/profilage-formulas-mobile/trust-payment-icon.svg";
import trustAccompagnementIcon from "@/assets/images/profilage-formulas-mobile/trust-accompagnement-icon.svg";
import trustSatisfactionIcon from "@/assets/images/profilage-formulas-mobile/trust-satisfaction-icon.svg";
import compassIllustration from "@/assets/images/profilage-formulas-grid-mobile/compass-illustration.png";
import planIconJordan from "@/assets/images/profilage-formulas-grid-mobile/plan-icon-jordan.svg";
import planIconTyson from "@/assets/images/profilage-formulas-grid-mobile/plan-icon-tyson.svg";
import planIconPele from "@/assets/images/profilage-formulas-grid-mobile/plan-icon-pele.svg";
import checkJordan from "@/assets/images/profilage-formulas-grid-mobile/check-jordan.svg";
import checkTyson from "@/assets/images/profilage-formulas-grid-mobile/check-tyson.svg";
import checkPele from "@/assets/images/profilage-formulas-grid-mobile/check-pele.svg";
import trustVideoIcon from "@/assets/images/profilage-formulas-grid-mobile/trust-video-icon.svg";
import trustAdvisorIcon from "@/assets/images/profilage-formulas-grid-mobile/trust-advisor-icon.svg";
import trustJourneyIcon from "@/assets/images/profilage-formulas-grid-mobile/trust-journey-icon.svg";

// Style par POSITION (1re/2e/3e formule), pas par nom : les taglines/couleurs du Figma
// sont décoratives (aucun champ réel équivalent sur FormulaType), même principe déjà
// retenu pour Living/Formulas.vue. Titre/prix/items restent 100% réels (formula.*).
const planStyles = [
  { icon: planIconJordan, check: checkJordan, color: "#570bfd", taglineKey: "profilage-formulas-grid-tagline-1" },
  { icon: planIconTyson, check: checkTyson, color: "#00a31c", taglineKey: "profilage-formulas-grid-tagline-2" },
  { icon: planIconPele, check: checkPele, color: "#fc010d", taglineKey: "profilage-formulas-grid-tagline-3" },
];

const router = useRouter();
const profilageStore = useProfilageStore();
const authStore = useAuthStore();
const { iniPayment, setOrderData, redirectUrl } = usePaymentStore();
const { t } = useI18n();

const isFetching: Ref<boolean> = ref(false);
const isLoading: Ref<boolean> = ref(false);

const userToken: Ref<string> = computed(() => authStore.token);

const formulaList: ComputedRef<FormulaType[]> = computed(() => profilageStore.formulaList);

const goBack = () => router.back();

onBeforeMount(async () => {
  isFetching.value = true;
  // selectedProfilage est nécessaire pour service_id lors du paiement (handleClick) ;
  // sans ce fetch, un utilisateur arrivant ici sans être passé par Profiling/Index.vue
  // (ex. depuis Profiling/Landing.vue, le CTA mobile) envoie service_id="undefined".
  await Promise.all([profilageStore.fetchProfilage(), profilageStore.fetchFormulas()]);
  isFetching.value = false;
  if (authStore.token) await authStore.fetchUnreadNotificationCount();
});

// "Choisissez votre parcours" (Orientation Landing) : si l'achat est fait pour un
// enfant, ses infos (saisies là-bas, persistées dans profilageStore.beneficiary)
// voyagent dans order.options — lues par ETestingAction::bookForOrder côté backend.
const buildOrderOptions = () => {
  const beneficiary = profilageStore.beneficiary;
  if (beneficiary.type !== "child") return {};

  return {
    beneficiary_type: "child",
    beneficiary_first_name: beneficiary.first_name,
    beneficiary_last_name: beneficiary.last_name,
    beneficiary_birthday: beneficiary.birthday,
    beneficiary_gender: beneficiary.gender,
  };
};

const handleClick = async (formula: FormulaType) => {
  const orderData = {
    offer_id: String(formula.id),
    service_id: String(profilageStore.selectedProfilage?.id),
    service_type: "profilage",
    options: buildOrderOptions(),
  };

  if (!userToken.value) {
    setOrderData(orderData);
    return router.push(i18nRoute({ name: "signin" }));
  }

  isLoading.value = true;
  const res = await iniPayment(orderData);
  isLoading.value = false;

  if (res) {
    window.location.replace(redirectUrl ?? "");
  }
};
</script>

<template>
  <div>
    <!-- ═══════════════════════════════════════════
         MOBILE — Figma "Orientation Formules" (< lg), node 795-1558
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

        <!-- Hero -->
        <div class="flex w-full items-start gap-2">
          <div class="min-w-0 flex-1">
            <p class="text-base font-semibold tracking-[-0.041rem] text-ink">
              {{ $t("profilage-formulas-grid-hero-title") }}
            </p>
            <p class="pt-1 text-[0.8125rem] leading-[1.421875rem] text-ink">
              {{ $t("profilage-formulas-grid-hero-text") }}
            </p>
          </div>
          <img :src="compassIllustration" class="size-[3.9375rem] shrink-0 object-contain" alt="" />
        </div>

        <!-- Formules -->
        <div v-if="formulaList.length" class="w-full pb-5 pt-5">
          <div class="flex w-full items-stretch gap-1.5">
            <div
              v-for="(formula, index) in formulaList"
              :key="formula.id"
              class="flex flex-1 flex-col items-center rounded-[0.625rem] border-[0.5px] border-border-default bg-surface px-2 pb-6 pt-3"
            >
              <img :src="planStyles[index % planStyles.length].icon" class="size-[1.875rem]" alt="" />
              <p class="pt-1 text-[0.8125rem] font-semibold" :style="{ color: planStyles[index % planStyles.length].color }">
                {{ formula.title }}
              </p>
              <span
                v-if="formula.items?.length"
                class="mt-1.5 rounded-[0.3125rem] px-1.5 py-0.5 text-[0.4375rem] font-semibold"
                :style="{ backgroundColor: planStyles[index % planStyles.length].color + '14', color: planStyles[index % planStyles.length].color }"
              >
                {{ $t("profilage-formulas-grid-dimensions-badge", { count: formula.items.length }) }}
              </span>
              <p class="h-10 pt-1.5 text-center text-[0.5rem] leading-normal text-ink">
                {{ $t(planStyles[index % planStyles.length].taglineKey) }}
              </p>
              <div class="mt-2.5 w-full border-t border-[#ededf8]"></div>

              <div class="mt-2.5 flex w-full flex-1 flex-col gap-1.5">
                <div v-for="(item, itemIndex) in formula.items" :key="itemIndex" class="flex items-start gap-1">
                  <img :src="planStyles[index % planStyles.length].check" class="mt-0.5 size-[0.4375rem] shrink-0" alt="" />
                  <div class="min-w-0 flex-1 text-[0.375rem] leading-normal text-ink">
                    <p>{{ item.title }}</p>
                    <p v-if="item.description">{{ item.description }}</p>
                  </div>
                </div>
              </div>

              <div class="mt-2.5 w-full border-t border-[#ededf8]"></div>
              <div class="w-full pt-1.5 text-center">
                <p class="text-xl font-semibold" :style="{ color: planStyles[index % planStyles.length].color }">
                  {{ formula.amount }} €
                </p>
                <button
                  type="button"
                  class="mt-2.5 flex w-full items-center justify-center rounded-md border py-2.5"
                  :style="{ borderColor: planStyles[index % planStyles.length].color }"
                  :disabled="isLoading"
                  @click="handleClick(formula)"
                >
                  <span class="text-[0.5625rem] font-semibold" :style="{ color: planStyles[index % planStyles.length].color }">
                    {{ $t("profilage-formulas-grid-cta") }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Bandeau confiance (marketing générique, pas lié à une formule) -->
        <div class="flex w-full items-center justify-center gap-[0.8125rem] rounded-[0.625rem] bg-surface px-2.5 py-3 shadow-[0px_0px_3.5px_rgba(0,0,0,0.1)]">
          <div class="flex flex-1 items-center justify-center gap-1">
            <img :src="trustVideoIcon" class="size-6 shrink-0" alt="" />
            <div class="min-w-0 text-center leading-[0.8203125rem] text-ink">
              <p class="text-[0.5625rem] font-medium">{{ $t("profilage-formulas-grid-trust-video-title") }}</p>
              <p class="text-[0.5rem]">{{ $t("profilage-formulas-grid-trust-video-text") }}</p>
            </div>
          </div>
          <div class="h-8 w-px shrink-0 bg-[#e4e7f0]"></div>
          <div class="flex flex-1 items-center justify-center gap-1">
            <img :src="trustAdvisorIcon" class="size-6 shrink-0" alt="" />
            <div class="min-w-0 text-center leading-[0.8203125rem] text-ink">
              <p class="text-[0.5625rem] font-medium">{{ $t("profilage-formulas-grid-trust-advisor-title") }}</p>
              <p class="text-[0.5rem]">{{ $t("profilage-formulas-grid-trust-advisor-text") }}</p>
            </div>
          </div>
          <div class="h-8 w-px shrink-0 bg-[#e4e7f0]"></div>
          <div class="flex flex-1 items-center justify-center gap-1">
            <img :src="trustJourneyIcon" class="size-6 shrink-0" alt="" />
            <div class="min-w-0 text-center leading-[0.8203125rem] text-ink">
              <p class="text-[0.5625rem] font-medium">{{ $t("profilage-formulas-grid-trust-journey-title") }}</p>
              <p class="text-[0.5rem]">{{ $t("profilage-formulas-grid-trust-journey-text") }}</p>
            </div>
          </div>
        </div>

        <!-- Trust badges -->
        <div class="mt-5 flex w-full items-center justify-center gap-[0.625rem] rounded-[0.625rem] border border-border-default bg-surface-alt px-px py-[0.6875rem]">
          <div class="flex flex-1 flex-col items-center gap-1.5 px-1">
            <img :src="trustPaymentIcon" class="size-10" alt="" />
            <p class="text-center text-[0.6875rem] font-semibold leading-[0.8203125rem] text-ink">
              {{ $t("profilage-formulas-mobile-trust-payment") }}
            </p>
          </div>
          <div class="h-9 w-px shrink-0 bg-[#e6e5f5]"></div>
          <div class="flex flex-1 flex-col items-center gap-1.5 px-1">
            <div class="flex size-10 items-center justify-center rounded-full bg-[#def5e3]">
              <img :src="trustAccompagnementIcon" class="size-6" alt="" />
            </div>
            <p class="text-center text-[0.6875rem] font-semibold leading-[0.8203125rem] text-ink">
              {{ $t("profilage-formulas-mobile-trust-support") }}
            </p>
          </div>
          <div class="h-9 w-px shrink-0 bg-[#e6e5f5]"></div>
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
            {{ $t("profilage.select-formula") }}
          </h2>

          <template v-for="(formula, index) in formulaList" :key="index">
            <div
              class="flex items-center bg-surface border border-border-default rounded-lg mb-5 shadow"
              @click="handleClick(formula)"
            >
              <img
                class="object-cover w-1/3 rounded-s-lg h-auto flex self-end"
                :src="formula.icon ?? defaultImage"
                alt=""
              />
              <div class="flex flex-col justify-between ps-[10px] leading-normal w-full">
                <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {{ formula.title }}
                </h5>
                <ul class="mb-3 font-normal text-gray-700 dark:text-gray-400">
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
