<script setup lang="ts">
import { useMbaStore, useAuthStore, usePaymentStore } from "@/stores";
import { computed, onBeforeMount, ref } from "vue";
import type { MentorType, OfferType } from "@/constants/constant.type";
import { useRouter, useRoute } from "vue-router";
import { i18nRoute } from "@/utils";
import { storeToRefs } from "pinia";
import HMentorCard from "./_Partials/HMentorCard.vue";
import { useI18n } from "vue-i18n";
import {
  FileText,
  Target,
  PencilLine,
  TrendingUp,
  UserRound,
  GraduationCap,
  ShieldCheck,
  Flag,
  Lock,
  Send,
  Check,
  ChevronRight,
  Trophy,
  Star,
  Globe,
  Users,
  Lightbulb,
  Brain,
} from "lucide-vue-next";

const mbaStore = useMbaStore();
const authStore = useAuthStore();
const paymentStore = usePaymentStore();
const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const { token } = storeToRefs(authStore);

const selectedOffer = computed<OfferType | null>(() => mbaStore.selectedFormula);
const firstMentor = computed<MentorType | null>(() => selectedOffer.value?.mentors?.[0] ?? null);
const secondMentor = computed<MentorType | null>(() => selectedOffer.value?.mentors?.[1] ?? null);
const isFetching = ref(false);

const goToPayment = async () => {
  const orderData = {
    offer_id: String(selectedOffer.value?.id),
    service_id: String((selectedOffer.value as any)?.area?.id),
    service_type: "area",
    profile_id: String(firstMentor.value?.id ?? ""),
  };
  if (!token.value) {
    paymentStore.setOrderData(orderData);
    router.push(i18nRoute({ name: "signin" }));
    return;
  }
  isFetching.value = true;
  const success = await paymentStore.iniPayment(orderData);
  isFetching.value = false;
  if (success) window.location.replace(paymentStore.redirectUrl);
};

onBeforeMount(async () => {
  isFetching.value = true;
  await mbaStore.fetchFormula();
  isFetching.value = false;
});

const valueProps = computed(() => [
  { icon: UserRound, title: t("mba.formula.vp1-title"), text: t("mba.formula.vp1-text") },
  { icon: GraduationCap, title: t("mba.formula.vp2-title"), text: t("mba.formula.vp2-text") },
  { icon: ShieldCheck, title: t("mba.formula.vp3-title"), text: t("mba.formula.vp3-text") },
  { icon: Flag, title: t("mba.formula.vp4-title"), text: t("mba.formula.vp4-text") },
]);

// Icônes des items inclus, mappées par ordre (Dossier, Projet, Rédaction, Tests
// d'aptitude, Tests de langue, Simulation entretiens, Séances mentor).
const includedIcons = [FileText, Target, PencilLine, TrendingUp, Globe, Users, UserRound];

const methodSteps = computed(() => [
  { icon: UserRound, title: t("mba.formula.step1-title"), text: t("mba.formula.step1-text") },
  { icon: Target, title: t("mba.formula.step2-title"), text: t("mba.formula.step2-text") },
  { icon: FileText, title: t("mba.formula.step3-title"), text: t("mba.formula.step3-text") },
  { icon: PencilLine, title: t("mba.formula.step4-title"), text: t("mba.formula.step4-text") },
  { icon: TrendingUp, title: t("mba.formula.step5-title"), text: t("mba.formula.step5-text") },
  { icon: Send, title: t("mba.formula.step6-title"), text: t("mba.formula.step6-text") },
]);
</script>

<template>
  <div class="global-container mba-formula">
    <!-- Loading skeleton -->
    <div v-if="isFetching" class="py-8 animate-pulse">
      <div class="mb-4 h-5 w-48 rounded-full bg-slate-200"></div>
      <div class="grid grid-cols-12 gap-10">
        <div class="col-span-12 lg:col-span-8 space-y-5">
          <div class="h-6 w-24 rounded-full bg-slate-200"></div>
          <div class="h-10 w-3/4 rounded-xl bg-slate-200"></div>
          <div class="h-4 w-full rounded bg-slate-200"></div>
          <div class="mt-6 grid grid-cols-4 gap-4">
            <div v-for="i in 4" :key="i" class="h-28 rounded-2xl bg-slate-200"></div>
          </div>
        </div>
        <div class="hidden lg:block col-span-4">
          <div class="h-96 rounded-3xl bg-slate-200"></div>
        </div>
      </div>
    </div>

    <template v-else>
      <!-- Breadcrumb -->
      <div class="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-muted">
        <router-link :to="i18nRoute({ name: 'home' })" class="hover:text-[#ED2530] transition-colors">
          {{ $t("home-label") }}
        </router-link>
        <ChevronRight :size="15" class="text-slate-300" />
        <router-link
          :to="i18nRoute({ name: 'mba', params: { slug: route.params.slug } })"
          class="hover:text-[#ED2530] transition-colors"
        >
          {{ $t("area-formula-title") }}
        </router-link>
        <ChevronRight :size="15" class="text-slate-300" />
        <span class="text-[#ED2530] font-bold">MBA</span>
      </div>

      <!-- Main grid -->
      <section class="grid grid-cols-12 gap-10">
        <!-- LEFT COLUMN -->
        <div class="col-span-12 lg:col-span-9">
          <!-- Hero -->
          <div class="grid grid-cols-12 items-stretch gap-8 mb-6">
            <div class="col-span-12 md:col-span-7">
              <span class="inline-flex w-fit items-center rounded-lg bg-[#FCE6E8] px-4 py-1.5 text-[13px] font-semibold text-[#ED2530]">
                {{ $t("mba.formula.badge") }}
              </span>
              <h1 class="mt-5 text-[34px] lg:text-[40px] font-bold leading-[1.12] tracking-[-0.015em] text-ink">
                {{ $t("mba.formula.hero-title") }}
                <span class="text-[#ED2530]">{{ $t("mba.formula.hero-accent") }}</span>
              </h1>
              <p class="mt-5 text-[16px] leading-[1.6] text-[#5a6387]">
                {{ $t("mba.formula.hero-description") }}
              </p>

              <!-- Value props (4) -->
              <div class="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-6">
                <div v-for="vp in valueProps" :key="vp.title" class="flex flex-col">
                  <div class="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#FDEEEF]">
                    <component :is="vp.icon" :size="20" class="text-[#ED2530]" />
                  </div>
                  <h3 class="text-[12.5px] font-semibold whitespace-nowrap text-ink">{{ vp.title }}</h3>
                  <p class="mt-2 text-[12px] leading-[1.5] text-[#5a6387]">{{ vp.text }}</p>
                </div>
              </div>
            </div>

            <!-- Illustration placeholder -->
            <div class="hidden md:block md:col-span-5">
              <div class="relative flex h-full min-h-[300px] items-center justify-center">
                <div
                  class="absolute top-1/2 left-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full z-0"
                  style="background: radial-gradient(circle at 50% 45%, #FBDCDE 0%, #FCE9EA 45%, rgba(252,233,234,0) 72%);"
                ></div>
                <div class="absolute top-[8%] left-[12%] z-10 flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow-[0_10px_24px_-10px_rgba(16,26,61,.3)]">
                  <Lightbulb :size="20" class="text-[#ED2530]" />
                </div>
                <div class="absolute top-[6%] right-[12%] z-10 flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow-[0_10px_24px_-10px_rgba(16,26,61,.3)]">
                  <Brain :size="20" class="text-[#ED2530]" />
                </div>
                <div class="absolute top-1/2 right-[4%] z-10 flex h-11 w-11 items-center justify-center rounded-full bg-surface shadow-[0_10px_24px_-10px_rgba(16,26,61,.3)]">
                  <Target :size="18" class="text-[#ED2530]" />
                </div>
                <div class="absolute bottom-[14%] left-[6%] z-10 flex h-11 w-11 items-center justify-center rounded-full bg-surface shadow-[0_10px_24px_-10px_rgba(16,26,61,.3)]">
                  <Star :size="18" class="text-[#ED2530]" />
                </div>
                <div class="relative z-[2] flex h-full w-full max-w-[320px] flex-col items-center justify-center gap-2 rounded-[20px] bg-gradient-to-b from-[#FBDCDE] to-[#FDEEEF]">
                  <UserRound :size="54" class="text-[#ED2530] opacity-50" />
                  <span class="text-[12px] font-medium text-ink/40">Illustration</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Included items -->
          <section v-if="selectedOffer?.items?.length" class="mt-14">
            <h2 class="mb-5 text-[20px] font-bold text-ink">{{ $t("mba.formula.included-title") }}</h2>
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
              <div
                v-for="(item, i) in selectedOffer.items"
                :key="item.title"
                class="flex items-center gap-2.5 rounded-2xl border border-[#F4E3E6] bg-[#FFF7F8] p-3.5"
              >
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FDEEEF]">
                  <component :is="includedIcons[i % includedIcons.length]" :size="17" class="text-[#ED2530]" />
                </div>
                <p class="text-[10px] font-semibold leading-snug text-ink">{{ item.title }}</p>
              </div>
            </div>
            <p class="mt-3 text-[12px] text-[#9aa0ad]">{{ $t("mba.formula.included-note") }}</p>
          </section>

          <!-- Methodology timeline (6 steps) -->
          <section class="mt-14">
            <h2 class="mb-8 text-[20px] font-bold text-ink">{{ $t("mba.formula.method-title") }}</h2>
            <div class="relative flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-0">
              <div
                v-for="(step, index) in methodSteps"
                :key="step.title"
                class="relative flex flex-col items-start text-left lg:flex-1 lg:pr-3"
              >
                <!-- dashed connector : relie le bord de l'icône à l'icône de l'étape suivante -->
                <div
                  v-if="index < methodSteps.length - 1"
                  class="absolute left-14 right-0 top-7 hidden border-t-2 border-dashed border-[#F1B9C0] lg:block"
                ></div>
                <div class="relative z-[1] mb-3">
                  <div class="flex h-14 w-14 items-center justify-center rounded-full bg-[#FDEEEF]">
                    <component :is="step.icon" :size="22" class="text-[#ED2530]" />
                  </div>
                  <span
                    class="absolute -top-1.5 -left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#ED2530] text-[12px] font-bold text-white shadow-[0_4px_10px_-2px_rgba(237,37,48,.5)]"
                  >
                    {{ index + 1 }}
                  </span>
                </div>
                <h3 class="text-[14px] font-semibold text-ink">{{ step.title }}</h3>
                <p class="mt-1 text-[12px] leading-[1.45] text-[#5a6387]">{{ step.text }}</p>
              </div>
            </div>
          </section>

          <!-- Mentors section (désactivée temporairement) -->
          <!--
          <section v-if="firstMentor || secondMentor" class="mt-14 pb-[90px] lg:pb-0">
            <h2 class="mb-6 text-[20px] font-bold text-ink">{{ $t("mba.formula.mentors-section-title") }}</h2>
            <div class="flex flex-col w-full items-start gap-4">
              <HMentorCard :mentor="firstMentor as MentorType" photo="left" />
              <HMentorCard v-if="secondMentor" :mentor="secondMentor as MentorType" photo="right" />
            </div>
          </section>
          -->
        </div>

        <!-- RIGHT SIDEBAR -->
        <aside class="hidden lg:block col-span-3">
          <div class="sticky top-28 space-y-6">
            <!-- Offer card -->
            <div class="overflow-hidden rounded-[22px] bg-surface shadow-[0_24px_50px_-28px_rgba(16,26,61,.25)] ring-1 ring-[#ECE9EF]">
              <!-- navy header -->
              <div class="flex items-center gap-3 bg-[#1a2d56] px-6 py-4 text-white">
                <Trophy :size="24" />
                <h2 class="text-[20px] font-bold">MBA</h2>
              </div>

              <div class="p-5">
                <ul v-if="selectedOffer?.items?.length" class="space-y-2">
                  <li
                    v-for="item in selectedOffer.items"
                    :key="item.title"
                    class="flex items-center gap-2.5 text-[13px] font-medium text-ink"
                  >
                    <span class="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full bg-[#ED2530]">
                      <Check :size="12" class="text-white" />
                    </span>
                    {{ item.title }}
                  </li>
                </ul>

                <div class="my-4 h-px bg-[#ECE9EF]" />

                <div class="text-center">
                  <p class="text-[12px] font-medium text-[#9aa0ad]">{{ $t("mba.formula.price-label") }}</p>
                  <div class="mt-0.5 text-[32px] font-extrabold leading-none text-ink">
                    {{ selectedOffer?.amount }} <span class="text-[22px]">€</span>
                  </div>
                </div>

                <button
                  type="button"
                  :disabled="isFetching"
                  @click.prevent="goToPayment"
                  class="mt-4 w-full rounded-xl bg-[#ED2530] py-3 text-[14px] font-semibold text-white shadow-[0_12px_26px_-10px_rgba(237,37,48,.55)] transition-all hover:bg-[#D81E29] disabled:opacity-60 active:scale-[0.98]"
                >
                  {{ isFetching ? "…" : $t("mba.formula.cta") }}
                </button>

                <div class="mt-2.5 flex items-center justify-center gap-2 text-[12px] font-medium text-[#9aa0ad]">
                  <Lock :size="13" />
                  {{ $t("mba.formula.payment-secure") }}
                </div>
              </div>
            </div>

            <!-- Human card -->
            <div class="rounded-[22px] bg-[#FDEEEF] p-7">
              <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow-sm">
                <Star :size="22" class="text-[#ED2530]" />
              </div>
              <h3 class="text-[17px] font-bold leading-snug text-ink">{{ $t("mba.formula.human-title") }}</h3>
              <p class="mt-3 text-[14px] leading-[1.6] text-[#5a6387]">{{ $t("mba.formula.human-text") }}</p>
            </div>
          </div>
        </aside>
      </section>
    </template>

    <!-- Mobile CTA (fixed bottom) -->
    <div
      v-if="!isFetching"
      class="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-border-default bg-surface/95 px-4 py-3 backdrop-blur-xl"
    >
      <button
        type="button"
        :disabled="isFetching"
        @click.prevent="goToPayment"
        class="w-full rounded-xl bg-[#ED2530] py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-100 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {{ $t("mba.formula.cta") }}
        <span class="rounded-lg bg-white/20 px-2 py-0.5 text-xs">{{ selectedOffer?.amount }} €</span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.global-container {
  width: min(100% - 6rem, 94rem);
  max-width: none;
  margin: 80px auto 0;
  padding: 28px 0 120px;
  overflow-x: visible;

  @media only screen and (max-width: 1024px) {
    width: min(100% - 2rem, 94rem);
    padding: 20px 0 120px;
  }
}
</style>
