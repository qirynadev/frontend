<script setup lang="ts">
import { useAuthStore, usePaymentStore, useSchoolStore } from "@/stores";
import { computed, onBeforeMount, ref } from "vue";
import type { MentorType, OfferType } from "@/constants/constant.type";
import { useRouter } from "vue-router";
import { i18nRoute } from "@/utils";
import BannerRotator from "@/components/atoms/BannerRotator.vue";
import OfferItem from "@/components/molecules/OfferItem.vue";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";
import { storeToRefs } from "pinia";
import HMentorCard from "./_Partials/HMentorCard.vue";
import mobileLogo from "@/assets/images/destination-choice-mobile/logo.png";
import mobileIconBack from "@/assets/images/destination-choice-mobile/icon-back.svg";
import mobileIconBell from "@/assets/images/destination-choice-mobile/icon-bell.svg";
import giftIllustration from "@/assets/images/area-formula-mobile/gift.png";
import iconProject from "@/assets/images/area-formula-mobile/icon-project.svg";
import iconTest from "@/assets/images/area-formula-mobile/icon-test.svg";
import iconApplication from "@/assets/images/area-formula-mobile/icon-application.svg";
import iconInterview from "@/assets/images/area-formula-mobile/icon-interview.svg";
import checkBadge from "@/assets/images/area-formula-mobile/check-badge-1.svg";
import checkPlain from "@/assets/images/area-formula-mobile/check-plain.svg";
import ctaArrow from "@/assets/images/area-formula-mobile/icon-cta-arrow.svg";
import shieldWhite from "@/assets/images/area-formula-mobile/icon-shield-white.svg";
import trustPayment from "@/assets/images/area-formula-mobile/icon-trust-payment.svg";

const featureIcons = [iconProject, iconTest, iconApplication, iconInterview];

const authStore = useAuthStore();
const schoolStore = useSchoolStore();
const paymentStore = usePaymentStore();

const { token } = storeToRefs(authStore);

const selectedMentor = computed<MentorType | null>(() => schoolStore.selectedMentor);
const selectedOffer = computed<OfferType | null>(() => schoolStore.selectedOffer);
const firstMentor = computed<MentorType | null>(() => {
  if (selectedOffer.value && "mentors" in selectedOffer.value && selectedOffer.value.mentors.length > 0) {
    return selectedOffer.value.mentors[0] ?? null;
  }
  return null;
});
const secondMentor = computed<MentorType | null>(() => {
  if (selectedOffer.value && "mentors" in selectedOffer.value && selectedOffer.value.mentors.length > 0) {
    return selectedOffer.value.mentors[1] ?? null;
  }
  return null;
});

const router = useRouter();

const isFetching = ref<boolean>(false);

const goToPayment = async () => {
  const orderData = {
    offer_id: String(selectedOffer.value?.id),
    service_id: String(selectedOffer.value?.area?.id),
    service_type: "area",
    profile_id: String(selectedMentor.value?.id ?? firstMentor.value?.id),
  };

  if (!token.value) {
    paymentStore.setOrderData(orderData);
    router.push(i18nRoute({ name: "signin" }));
    return;
  }

  isFetching.value = true;
  const success = await paymentStore.iniPayment(orderData);
  isFetching.value = false;

  if (success) {
    window.location.replace(paymentStore.redirectUrl);
  }
};

onBeforeMount(async () => {
  /* isFetching.value = true;
  await schoolStore.fetchOffer(selectedOffer.value?.id as any);
  isFetching.value = false; */
});
</script>

<template>
  <!-- ═══════════════════════════════════════════
       MOBILE — écran "Offre d'Orientation" (< lg)
       Atteint depuis la fiche école via le CTA "Être accompagnée".
       Construit via get_design_context (node Figma 442-815).
  ═══════════════════════════════════════════ -->
  <div class="flex w-full flex-col items-center overflow-x-hidden bg-surface pb-26 lg:hidden">
    <div class="flex w-full flex-col items-center px-4 pb-6 pt-4">
      <!-- Top bar -->
      <div class="flex w-full items-center justify-between pb-[1.875rem]">
        <button type="button" class="flex size-6 items-center justify-center" aria-label="Retour" @click="router.back()">
          <img :src="mobileIconBack" class="size-full" alt="" />
        </button>
        <div class="relative h-[2.8125rem] w-[9.0625rem] overflow-hidden">
          <img
            :src="mobileLogo"
            alt="Qiryna"
            class="absolute left-[-4.88%] top-[-63.5%] h-[251.38%] w-[117.84%] max-w-none"
          />
        </div>
        <RouterLink
          v-if="token"
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
      <div
        class="flex w-full items-center justify-between gap-3 overflow-hidden rounded-[0.625rem] bg-gradient-to-r from-[rgba(238,242,255,0.8)] via-[rgba(250,245,255,0.5)] to-[rgba(238,242,255,0.4)] px-[0.9375rem] py-8"
      >
        <div class="min-w-0 flex-1">
          <p class="text-2xl font-semibold leading-[1.875rem] text-ink">
            {{ selectedOffer?.hero_title || $t("area-formula-mobile-title") }}
          </p>
          <div class="min-w-0 pt-3 text-sm leading-5 text-ink" v-html="selectedOffer?.description"></div>
        </div>
        <div class="relative size-[8.125rem] shrink-0 overflow-hidden">
          <img
            :src="selectedOffer?.hero_image || giftIllustration"
            class="absolute left-[-33.8%] top-[4%] w-[167%] max-w-none object-cover"
            alt=""
          />
        </div>
      </div>

      <!-- Ce qui est inclus -->
      <div v-if="selectedOffer?.items?.length" class="w-full pb-5">
        <p class="pt-8 text-sm font-semibold uppercase leading-4 tracking-[0.0375rem] text-ink">
          {{ $t("area-formula-mobile-included-title") }}
        </p>
        <div class="flex w-full flex-col gap-4 pt-4">
          <div
            v-for="(item, index) in selectedOffer.items"
            :key="index"
            class="flex w-full items-center justify-between gap-4 rounded-[0.625rem] border border-border-default bg-surface px-[1.3125rem] py-[0.6875rem]"
          >
            <div class="flex min-w-0 flex-1 items-center gap-4">
              <img :src="item.icon || featureIcons[index % featureIcons.length]" class="size-12 shrink-0" alt="" />
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold leading-6 text-ink">{{ item.title }}</p>
                <p class="pt-1 text-xs leading-normal text-ink">{{ item.description }}</p>
              </div>
            </div>
            <img v-if="item.included" :src="checkBadge" class="size-7 shrink-0" alt="" />
            <div v-else class="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#f1f5f9]">
              <img :src="checkPlain" class="size-7 opacity-40 grayscale" alt="" />
            </div>
          </div>
        </div>
      </div>

      <div class="flex w-full flex-col gap-5">
        <!-- Carte prix -->
        <div class="flex w-full flex-col gap-[0.5625rem] rounded-[0.625rem] bg-[#4f31eb] p-[0.6875rem]">
          <div class="flex w-full items-center gap-[1.1875rem]">
            <div class="min-w-0 flex-1">
              <span
                v-if="selectedOffer?.badge_label"
                class="inline-block w-full rounded-full bg-[#4029c7] px-2 py-1 text-center text-[0.5rem] font-medium uppercase tracking-[0.03125rem] text-white"
              >
                {{ selectedOffer.badge_label }}
              </span>
              <p class="pt-[0.375rem] text-[1.8125rem] font-bold leading-10 tracking-[-0.05625rem] text-white">
                {{ selectedOffer?.amount }} €
              </p>
              <p class="pt-[0.375rem] text-[0.6875rem] leading-[1.03125rem] tracking-[0.017rem] text-white/90">
                {{
                  selectedOffer?.payment_type === "subscription"
                    ? $t("area-formula-mobile-payment-subscription")
                    : $t("area-formula-mobile-payment-once")
                }}
              </p>
            </div>
            <div class="h-[3.25rem] w-px shrink-0 bg-white/20"></div>
            <button
              type="button"
              :disabled="isFetching"
              class="flex w-[14.3125rem] shrink-0 items-center justify-center gap-2 rounded-[0.625rem] bg-surface py-4 disabled:opacity-60"
              @click.prevent="goToPayment"
            >
              <span class="text-xs font-semibold text-[#450ff2]">{{
                selectedOffer?.cta_text || $t("area-formula-mobile-cta")
              }}</span>
              <img :src="ctaArrow" class="h-[0.525rem] w-[0.5875rem]" alt="" />
            </button>
          </div>
          <div class="flex items-center gap-[0.4375rem]">
            <img :src="shieldWhite" class="size-5" alt="" />
            <p class="text-[0.6875rem] leading-[1.03125rem] text-white">
              {{ $t("area-formula-mobile-payment-secure") }}
            </p>
          </div>
        </div>

        <!-- Bandeau confiance -->
        <div
          v-if="selectedOffer?.trust_badges?.length"
          class="flex w-full items-center justify-center gap-[0.625rem] rounded-[0.625rem] border border-border-default bg-surface-alt px-px py-[0.6875rem]"
        >
          <template v-for="(badge, index) in selectedOffer.trust_badges" :key="index">
            <div class="flex flex-1 flex-col items-center gap-1.5 px-1">
              <img :src="badge.icon || trustPayment" class="size-10" alt="" />
              <p class="text-center text-[0.6875rem] font-semibold leading-[0.8203125rem] text-ink">
                {{ badge.label }}
              </p>
            </div>
            <div v-if="index < selectedOffer.trust_badges.length - 1" class="h-9 w-px shrink-0 bg-[#e6e5f5]"></div>
          </template>
        </div>
      </div>
    </div>

    <!-- Bottom tab bar -->
    <MobileAppBottomNav active="orientation" :special-orientation-icon="true" />
  </div>

  <div class="global-container area-formula hidden lg:block">
    <div class="container-inner">
      <div class="left-part">
        <div class="content-body">
          <div>
            <div class="headline">
              <p>
                {{ $t("area-formula-title") }}
              </p>
            </div>
            <div class="my-description mb-[20px] lg:mb-[40px]" v-html="selectedOffer?.description"></div>
          </div>

          <!-- Coach list-->
          <div class="mentor-container gap-x-2 lg:gap-x-0 w-full flex lg:flex-col items-start">
            <!-- Head coach -->
            <HMentorCard :mentor="firstMentor as MentorType" photo="left" />
            <!-- End Head coach -->

            <!-- Deputy coach -->
            <HMentorCard :mentor="secondMentor as MentorType" photo="right" />
            <!-- <div
              class="mentor-item-container w-1/2 lg:w-full lg:mt-4 flex justify-between"
            >
              <div
                class="mentor-description hidden lg:flex lg:flex-col lg:flex-1"
              >
                <h5 class="font-bold text-[18px] mb-[10px]">
                  {{ $t("biography") }}
                </h5>
                <div
                  class="m-0 my-description"
                  v-html="selectedOffer?.deputyCoach?.biography"
                ></div>
              </div>

              <div
                class="mentor-img-container overflow-hidden rounded-[5px] w-full lg:w-[263px] lg:ms-[30px] relative flex items-center flex-col justify-end"
              >
                <img
                  :src="selectedOffer?.deputyCoach?.photo"
                  :alt="selectedOffer?.deputyCoach?.full_name"
                  class="rounded-[5px] z-0"
                />

                <div
                  class="bg-gradient h-full w-full absolute top-0 left-0 bottom-0 z-10"
                ></div>

                <div class="flex items-center flex-col justify-end z-20">
                  <div
                    class="mentor-logo-container relative flex items-center justify-center mb-2"
                  >
                    <img
                      :src="
                        selectedOffer?.deputyCoach?.public_profils
                          ?.school_logo
                      "
                    />
                  </div>
                  <div class="mentor-name-container">
                    <h6 class="text-[14px]! mt-[10px] mb-[5px] font-medium">
                      {{ selectedOffer?.deputyCoach?.full_name }}
                    </h6>
                    <p class="text-capitalize text-[16px] text-ink">
                      {{ $t("deputy-coach-role") }}
                    </p>
                  </div>
                </div>
              </div>
            </div> -->
            <!-- End Deputy coach -->
          </div>

          <!-- Desktop CTA -->
          <div
            class="hidden lg:flex items-center justify-between gap-3 mt-[30px] pt-[20px] border-t border-[#c0c0c091]"
          >
            <p class="m-0 font-semibold text-[16px]">{{ $t("show-mentors-label") }}</p>
            <button
              @click.prevent="goToPayment"
              :disabled="isFetching"
              type="button"
              class="bg-[#ff3942] text-white px-[20px] py-[9px] rounded-md text-[14px] whitespace-nowrap disabled:opacity-60"
            >
              Passer au paiement
            </button>
          </div>
        </div>
      </div>

      <div class="right-part hidden lg:block">
        <div class="offer-wrapper">
          <OfferItem
            :offer="selectedOffer as OfferType"
            :withHover="false"
            btnClassName="rounded-md bg-[#ff3942] text-white text-[12px] text-center top-14! w-[105px] h-[34px]"
            @onPressContainer="goToPayment"
          />
        </div>

        <div class="mt-[30px]">
          <BannerRotator class="pub" />
        </div>
      </div>
    </div>
  </div>
</template>

