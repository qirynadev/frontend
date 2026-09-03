<script lang="ts" setup>
import { useAuthStore, usePaymentStore, useSettingStore, useCourseStore, useETestingStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";
import { i18nRoute } from "@/utils";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import router from "@/router";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import {
  ClockIcon,
  HomeIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  LinkIcon,
  ArrowUpTrayIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
} from "@heroicons/vue/24/outline";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/vue/20/solid";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";
import mobileLogo from "@/assets/images/home-mobile/logo.png";
import mobileIconBell from "@/assets/images/home-mobile/icon-bell.svg";
import backArrowIcon from "@/assets/images/profilage-landing-mobile/back-arrow.svg";
import checkmarkIllustration from "@/assets/images/payment-success-mobile/checkmark-illustration.png";
import welcomeIcon from "@/assets/images/payment-success-mobile/welcome-icon.svg";
import stepConnector from "@/assets/images/payment-success-mobile/step-connector.svg";
import mobileStepIcon1 from "@/assets/images/payment-success-mobile/step-icon-1.svg";
import mobileStepIcon2 from "@/assets/images/payment-success-mobile/step-icon-2.svg";
import mobileStepIcon3 from "@/assets/images/payment-success-mobile/step-icon-3.svg";
import mobileStepIcon4 from "@/assets/images/payment-success-mobile/step-icon-4.svg";
import supportIcon from "@/assets/images/payment-success-mobile/support-icon.svg";
import ctaArrowIcon from "@/assets/images/payment-success-mobile/cta-arrow.svg";
import profilageCheckmarkIcon from "@/assets/images/profilage-payment-success-mobile/checkmark-icon.svg";
import profilageEmailNoticeIcon from "@/assets/images/profilage-payment-success-mobile/email-notice-icon.svg";
import profilageStep1Icon from "@/assets/images/profilage-payment-success-mobile/step1-icon.svg";
import profilageStep2Icon from "@/assets/images/profilage-payment-success-mobile/step2-icon.svg";
import profilageStep3Icon from "@/assets/images/profilage-payment-success-mobile/step3-icon.svg";
import profilageStatusDoneIcon from "@/assets/images/profilage-payment-success-mobile/status-done-check.svg";
import profilageSupportIcon from "@/assets/images/profilage-payment-success-mobile/support-icon.svg";
import languageCheckmarkIcon from "@/assets/images/language-payment-success-mobile/checkmark-icon.svg";
import languageEmailNoticeIcon from "@/assets/images/language-payment-success-mobile/email-notice-icon.svg";
import languageStatusDoneIcon from "@/assets/images/language-payment-success-mobile/status-done-check.svg";
import languageStep1Icon from "@/assets/images/language-payment-success-mobile/step1-icon.svg";
import languageStep2Icon from "@/assets/images/language-payment-success-mobile/step2-icon.svg";
import languageStep3Icon from "@/assets/images/language-payment-success-mobile/step3-icon.svg";
import languageStep4Icon from "@/assets/images/language-payment-success-mobile/step4-icon.svg";
import languageStep5Icon from "@/assets/images/language-payment-success-mobile/step5-icon.svg";
import languageSupportIcon from "@/assets/images/language-payment-success-mobile/support-icon.svg";

const { setRegisterConfig } = useSettingStore();
const authStore = useAuthStore();
const paymentStore = usePaymentStore();
const { order } = storeToRefs(paymentStore);
const courseStore = useCourseStore();
const eTestingStore = useETestingStore();
// `associated_service` = objet cours (slug) ; `service` n'est qu'un libellé texte côté API.
const finalizeSlug = computed(() => (order.value?.associated_service?.slug as string) || courseStore.getSelectedCourse?.slug || "");
const { doPayment } = paymentStore;
const { t, locale } = useI18n();
const route = useRoute();
const goBack = () => router.back();

const isLoading = ref(false);
const paymentValidated = ref(false);
const paymentConfirmed = ref(false);
const paymentFailed = ref(false);
const emailSent = ref(false);

onBeforeMount(async () => {
  isLoading.value = true;

  let orderId = order.value?.id;
  if (!orderId) {
    orderId = route.query.order_id as string;
  }

  if (!orderId) {
    isLoading.value = false;
    return;
  }

  const res = await doPayment({ order_id: orderId });
  if (res) {
    paymentValidated.value = true;
    paymentConfirmed.value = res.confirmed ?? false;
    paymentFailed.value = res.failed ?? false;
    emailSent.value = paymentConfirmed.value;
  }

  isLoading.value = false;
  setRegisterConfig("REGISTER");

  if (authStore.token) await authStore.fetchUnreadNotificationCount();
  if (authStore.token && isProfilageOrder.value) await eTestingStore.fetchEvaluations();
});

const isCourseOrder = computed(
  () => order.value?.offer?.type === "course" || order.value?.service_type === "App\\Models\\Course",
);

const isLanguageCoursePreorder = computed(() => isCourseOrder.value && !!order.value?.options?.language);

const isProfilageOrder = computed(
  () => order.value?.offer?.type === "profilage" || order.value?.service_type === "App\\Models\\Profilage",
);

const showNextSteps = computed(() => paymentConfirmed.value && !isCourseOrder.value);

// Bloc mobile spécifique profilage (Figma "Orientation post paiement", node 795-432) :
// référence de commande générée depuis l'UUID (aucun n° de commande lisible en base),
// nombre de "dimensions" = formula.items.length (seul champ réel s'y apparentant),
// statuts d'étape dérivés de la vraie évaluation e-testing liée à cette commande.
const profilageOrderReference = computed(() => (order.value?.id ? `QRY-${order.value.id.slice(0, 8).toUpperCase()}` : ""));
const profilageDimensionsCount = computed(() => order.value?.offer?.items?.length ?? 0);

const profilageEvaluation = computed(() =>
  eTestingStore.evaluations.find((evaluation) => evaluation.order_id === order.value?.id) ?? null,
);

type ProfilageStepStatus = "done" | "todo" | "upcoming";

const profilageSteps = computed(() => {
  const testStatus: ProfilageStepStatus =
    profilageEvaluation.value?.etat_eval === 2 ? "done" : "todo";
  const reportStatus: ProfilageStepStatus =
    profilageEvaluation.value?.etat_eval === 2 && profilageEvaluation.value?.has_pdf ? "done" : "upcoming";

  return [
    {
      icon: profilageStep1Icon,
      iconBg: "#ecfdf5",
      title: t("payment-success.profilage-step1-title"),
      text: t("payment-success.profilage-step1-text"),
      status: "done" as ProfilageStepStatus,
    },
    {
      icon: profilageStep2Icon,
      iconBg: "#f5f2fd",
      title: t("payment-success.profilage-step2-title"),
      text: t("payment-success.profilage-step2-text"),
      status: testStatus,
    },
    {
      icon: profilageStep3Icon,
      iconBg: "#f5f2fe",
      title: t("payment-success.profilage-step3-title"),
      text: t("payment-success.profilage-step3-text"),
      status: reportStatus,
    },
  ];
});

// Bloc mobile spécifique préinscription langue (Figma "Langues - Post Payment", node
// 810-9) : même mécanique de référence de commande que le bloc profilage ci-dessus
// (aucun n° de commande lisible en base). Seule l'étape 1 (email envoyé) a un statut réel
// (emailSent) ; les étapes 2-5 n'ont pas encore de source de données back-end (pas de
// suivi de test de niveau / choix de professeur / planning pour ce module) donc restent
// aux statuts par défaut du Figma ("à faire" / "à venir").
const languageOrderReference = computed(() => (order.value?.id ? `QRY-${order.value.id.slice(0, 8).toUpperCase()}` : ""));

const languageSteps = computed(() => [
  {
    icon: languageStep1Icon,
    iconBg: "#ecfdf5",
    title: t("payment-success.language-step1-title"),
    text: t("payment-success.language-step1-text"),
    status: (emailSent.value ? "done" : "todo") as "done" | "todo",
  },
  {
    icon: languageStep2Icon,
    iconBg: "#f5f2fd",
    title: t("payment-success.language-step2-title"),
    text: t("payment-success.language-step2-text"),
    status: "todo" as const,
  },
  {
    icon: languageStep3Icon,
    iconBg: "#f5f2fe",
    title: t("payment-success.language-step3-title"),
    text: t("payment-success.language-step3-text"),
    status: "upcoming" as const,
  },
  {
    icon: languageStep4Icon,
    iconBg: "",
    title: t("payment-success.language-step4-title"),
    text: t("payment-success.language-step4-text"),
    status: "upcoming" as const,
  },
  {
    icon: languageStep5Icon,
    iconBg: "#f5f2fd",
    title: t("payment-success.language-step5-title"),
    text: t("payment-success.language-step5-text"),
    status: "upcoming" as const,
  },
]);

const nextSteps = computed(() => [
  {
    icon: EnvelopeIcon,
    title: t("payment-success.step1-title"),
    text: t("payment-success.step1-text"),
  },
  {
    icon: LinkIcon,
    title: t("payment-success.step2-title"),
    text: t("payment-success.step2-text"),
  },
  {
    icon: ArrowUpTrayIcon,
    title: t("payment-success.step3-title"),
    text: t("payment-success.step3-text"),
  },
  {
    icon: UserGroupIcon,
    title: t("payment-success.step4-title"),
    text: t("payment-success.step4-text"),
  },
]);

// Tone applied to each "Et ensuite ?" step icon, in order.
const stepTones = ["red", "purple", "green", "blue"];

// Icônes Figma (mobile) pour les mêmes 4 étapes que `nextSteps` ci-dessus — même
// contenu/ordre, juste un rendu pixel-fidèle au design mobile au lieu des Heroicons.
const mobileStepIcons = [mobileStepIcon1, mobileStepIcon2, mobileStepIcon3, mobileStepIcon4];

// Carte "Récapitulatif de commande" (mobile uniquement) : on s'appuie sur des champs
// présents sur TOUS les types de commande (offer.title/icon, order.amount) plutôt que
// de deviner un nom d'école/service qui n'existe pas de façon fiable pour tous les
// types (cf. handoff) — `order.offer` est un OfferType (école) ou FormulaType
// (profilage/living/course), les deux exposent title/icon.
const orderOfferTitle = computed(() => order.value?.offer?.title ?? "");
const orderOfferIcon = computed(() => order.value?.offer?.icon ?? "");

const formattedPaymentDate = computed(() => {
  if (!order.value?.created_at) return "";
  const d = dayjs(order.value.created_at).locale(locale.value === "en" ? "en" : "fr");
  return locale.value === "en" ? d.format("MMMM D, YYYY [at] HH:mm") : d.format("D MMMM YYYY [à] HH:mm");
});

// Confetti scattered around the success checkmark (computed once, SSR-safe).
const confetti = computed(() => {
  const colors = ["#3B6FE0", "#2CB45D", "#F23A47", "#8A5CE0", "#F2B33A"];
  const cx = 115;
  const cy = 75;
  const N = 16;
  const pieces = [];
  for (let i = 0; i < N; i++) {
    const ang = (i / N) * Math.PI * 2 + 0.25;
    const r = 78 + (i % 3) * 9;
    pieces.push({
      left: cx + Math.cos(ang) * r,
      top: cy + Math.sin(ang) * r * 0.62,
      width: 4 + (i % 3) * 2,
      height: 3 + (i % 2) * 4,
      background: colors[i % colors.length],
      rotate: ang * 57 + i * 13,
    });
  }
  return pieces;
});
</script>

<template>
  <div class="payment-success-root">
    <!-- Loading skeleton -->
    <template v-if="isLoading">
      <div class="ps-skeleton">
        <div class="sk-circle"></div>
        <div class="sk-line w56"></div>
        <div class="sk-line w72 thin"></div>
        <div class="sk-line w48 thin"></div>
        <div class="sk-grid">
          <div class="sk-box"></div>
          <div class="sk-box"></div>
        </div>
      </div>
    </template>

    <!-- Payment validated -->
    <template v-else-if="paymentValidated">
      <!-- ── COURSE CONFIRMED : réservations confirmées (wizard langue étrangère) ── -->
      <template v-if="paymentConfirmed && isCourseOrder && !isLanguageCoursePreorder">
        <section class="confirm-grid">
          <div>
            <div class="check-stage">
              <div class="cc-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="#1fa463" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <span v-for="(c, i) in confetti" :key="i" class="cc-confetti"
                :style="{ left: c.left + 'px', top: c.top + 'px', width: c.width + 'px', height: c.height + 'px', background: c.background, transform: 'rotate(' + c.rotate + 'deg)' }" />
            </div>
            <h1 class="confirm-title">{{ $t("course.congrats") }}</h1>
            <div class="confirm-sub">{{ $t("course.bookings-confirmed") }} 🎉</div>
            <p class="confirm-text">{{ $t("course.confirm-text") }}</p>
          </div>
          <div class="confirm-art">
            <div class="ca-blob"></div>
            <div class="ca-photo"></div>
            <span class="ca-deco ca-video">🎥</span>
            <span class="ca-deco ca-plane">✈️</span>
          </div>
        </section>

        <div class="help-banner">
          <div class="hb-ic">🎧</div>
          <div>
            <div class="hb-t">{{ $t("course.need-help") }}</div>
            <div class="hb-s">{{ $t("course.team-here") }}</div>
          </div>
          <router-link class="btn btn-outline" :to="i18nRoute({ name: 'contact' })">{{ $t("course.contact-support") }}</router-link>
          <router-link class="btn btn-fill" :to="i18nRoute({ name: 'home' })">{{ $t("course.back-home") }}</router-link>
          <router-link
            v-if="finalizeSlug"
            class="btn btn-fill"
            :to="i18nRoute({ name: 'courses-finalize', params: { slug: finalizeSlug } })"
          >
            {{ $t("course.finalize-cta") }}
          </router-link>
        </div>
      </template>

      <!-- ── CONFIRMED (autres services) ── -->
      <template v-else-if="paymentConfirmed">
        <!-- ═══════════════════════════════════════════
             MOBILE — Figma "Orientation post paiement" (< lg), spécifique profilage
             (node 795-432). Réutilise le header/bottom-nav communs ; contenu propre
             (récap avec réf. générée + suivi 3 étapes lié à l'évaluation e-testing).
        ═══════════════════════════════════════════ -->
        <div v-if="isProfilageOrder" class="mx-auto flex w-full max-w-[26.875rem] flex-col items-center overflow-x-hidden bg-[#faf9fe] pb-26 lg:hidden">
          <div class="flex w-full flex-col items-center px-4 pb-6 pt-4">
            <!-- Top bar -->
            <div class="flex w-full items-center justify-between pb-2">
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

            <!-- Illustration + titre -->
            <div class="flex w-full items-center gap-4 pt-2">
              <div class="relative flex size-24 shrink-0 items-center justify-center">
                <div class="absolute inset-0 rounded-full bg-[rgba(199,210,254,0.5)] blur-md"></div>
                <span class="absolute left-0 top-0 text-xs text-[#818cf8]">✦</span>
                <span class="absolute right-0 top-2 text-xs text-[#a5b4fc]">✦</span>
                <span class="absolute bottom-0 left-2 text-xs text-[#a5b4fc]">✦</span>
                <span class="absolute bottom-2 right-2 text-xs text-[#c084fc]">✦</span>
                <div class="relative flex size-20 items-center justify-center rounded-full bg-surface shadow-[0px_10px_12.5px_rgba(99,102,241,0.2)]">
                  <img :src="profilageCheckmarkIcon" class="size-10" alt="" />
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-lg font-semibold tracking-[-0.0375rem] text-ink">{{ $t("thank-you-for-your-payment") }}</p>
                <p class="pt-1 text-[0.625rem] text-ink">{{ $t("payment-success.profilage-subtitle") }}</p>
              </div>
            </div>

            <!-- Récapitulatif de commande -->
            <div v-if="order" class="mt-6 w-full rounded-[0.625rem] border border-border-default bg-surface px-[1.3125rem] py-[0.9375rem] shadow-[0px_4px_10px_rgba(0,0,0,0.03)]">
              <p class="text-[0.8125rem] font-semibold text-ink">{{ $t("payment-success.mobile-summary-title") }}</p>
              <div class="mt-4 flex items-start justify-between border-b border-border-default pb-3">
                <div class="flex items-center gap-3.5">
                  <div class="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f5f2fd]">
                    <img v-if="orderOfferIcon" :src="orderOfferIcon" class="size-7 object-contain" alt="" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-[#6323fd]">{{ orderOfferTitle }}</p>
                    <span v-if="profilageDimensionsCount" class="mt-0.5 inline-block rounded-[0.3125rem] bg-[#f3effd] px-2.5 py-0.5 text-[0.5625rem] font-medium text-[#4f46e5]">
                      {{ $t("payment-success.profilage-dimensions-badge", { count: profilageDimensionsCount }) }}
                    </span>
                    <p class="pt-1.5 text-sm font-semibold text-[#5715fb]">{{ order.amount }} €</p>
                  </div>
                </div>
                <div class="shrink-0 text-right">
                  <p class="text-[0.5625rem] text-[#94a3b8]">{{ $t("payment-success.profilage-order-date-label") }}</p>
                  <p class="pt-0.5 text-[0.5625rem] text-ink">{{ formattedPaymentDate }}</p>
                  <p class="pt-2 text-[0.5625rem] text-[#94a3b8]">{{ $t("payment-success.profilage-order-ref-label") }}</p>
                  <p class="pt-0.5 text-[0.5625rem] text-ink">{{ profilageOrderReference }}</p>
                </div>
              </div>
              <div class="mt-2.5 flex items-center gap-3">
                <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f5f4fa]">
                  <img :src="profilageEmailNoticeIcon" class="size-4" alt="" />
                </div>
                <p class="text-[0.625rem] leading-[0.859375rem] text-ink">
                  {{ $t("payment-success.profilage-email-notice-prefix") }}
                  <span class="font-semibold">{{ order.user?.email }}</span>
                </p>
              </div>
            </div>

            <!-- Les prochaines étapes -->
            <div class="w-full pt-5">
              <p class="pb-2.5 text-sm font-semibold text-ink">{{ $t("payment-success.profilage-next-steps-title") }}</p>
              <div class="flex flex-col gap-1.5">
                <div v-for="(step, index) in profilageSteps" :key="step.title" class="flex items-center gap-1.5">
                  <div class="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#4f46e5] shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
                    <span class="text-[0.625rem] font-medium text-white">{{ index + 1 }}</span>
                  </div>
                  <div class="flex flex-1 items-center gap-3.5 rounded-[0.625rem] border border-border-default bg-surface px-3 py-[1.0625rem] shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
                    <div class="flex size-11 shrink-0 items-center justify-center rounded-full" :style="{ backgroundColor: step.iconBg }">
                      <img :src="step.icon" class="size-5" alt="" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-[0.625rem] font-bold text-ink">{{ step.title }}</p>
                      <p class="pt-0.5 text-[0.625rem] text-ink">{{ step.text }}</p>
                    </div>
                    <span
                      class="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.625rem] font-medium"
                      :class="{
                        'bg-[#edf9ef] text-[#11b13a]': step.status === 'done',
                        'bg-[#f5f3fe] text-[#4f46e5]': step.status === 'todo',
                        'bg-[#f1f5f9] text-[#64748b]': step.status === 'upcoming',
                      }"
                    >
                      <img v-if="step.status === 'done'" :src="profilageStatusDoneIcon" class="size-3" alt="" />
                      {{
                        step.status === "done"
                          ? $t("payment-success.profilage-status-done")
                          : step.status === "todo"
                            ? $t("payment-success.profilage-status-todo")
                            : $t("payment-success.profilage-status-upcoming")
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Besoin d'aide -->
            <div class="mt-2 flex w-full items-center justify-between gap-2 rounded-[0.625rem] bg-surface-tint px-[0.5625rem] py-4">
              <div class="flex flex-1 items-start gap-[0.6875rem]">
                <div class="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#e8e2fd]">
                  <img :src="profilageSupportIcon" class="size-6" alt="" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-bold text-ink">{{ $t("payment-success.support-title") }}</p>
                  <p class="pt-1 text-[0.625rem] leading-4 text-ink">{{ $t("payment-success.support-text") }}</p>
                </div>
              </div>
              <router-link
                :to="i18nRoute({ name: 'contact' })"
                class="shrink-0 whitespace-nowrap rounded-lg border border-[#450ff2] px-3 py-2 text-[0.625rem] font-medium text-[#450ff2] no-underline"
              >
                {{ $t("payment-success.profilage-contact-support") }}
              </router-link>
            </div>
          </div>

          <!-- Bottom tab bar -->
          <MobileAppBottomNav active="orientation" :special-orientation-icon="true" />
        </div>

        <!-- ═══════════════════════════════════════════
             MOBILE — Figma "Langues - Post Payment" (< lg), spécifique préinscription
             langue (node 810-9). Réutilise le header/bottom-nav communs ; contenu propre
             (récap de formule + suivi 5 étapes).
        ═══════════════════════════════════════════ -->
        <div v-else-if="isLanguageCoursePreorder" class="mx-auto flex w-full max-w-[26.875rem] flex-col items-center overflow-x-hidden bg-[#faf9fe] pb-26 lg:hidden">
          <div class="flex w-full flex-col items-center px-4 pb-6 pt-4">
            <!-- Top bar -->
            <div class="flex w-full items-center justify-between pb-2">
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

            <!-- Illustration + titre -->
            <div class="flex w-full items-center gap-4 pt-2">
              <div class="relative flex size-24 shrink-0 items-center justify-center">
                <div class="absolute inset-0 rounded-full bg-[rgba(199,210,254,0.5)] blur-md"></div>
                <span class="absolute left-0 top-0 text-xs text-[#818cf8]">✦</span>
                <span class="absolute right-0 top-2 text-xs text-[#a5b4fc]">✦</span>
                <span class="absolute bottom-0 left-2 text-xs text-[#a5b4fc]">✦</span>
                <span class="absolute bottom-2 right-2 text-xs text-[#c084fc]">✦</span>
                <div class="relative flex size-20 items-center justify-center rounded-full bg-surface shadow-[0px_10px_12.5px_rgba(99,102,241,0.2)]">
                  <img :src="languageCheckmarkIcon" class="size-10" alt="" />
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-lg font-semibold tracking-[-0.0375rem] text-ink">{{ $t("thank-you-for-your-payment") }}</p>
                <p class="pt-1 text-[0.625rem] text-ink">{{ $t("payment-success.language-subtitle") }}</p>
              </div>
            </div>

            <!-- Récapitulatif de commande -->
            <div v-if="order" class="mt-6 w-full rounded-[0.625rem] border border-border-default bg-surface px-[1.3125rem] py-[0.9375rem] shadow-[0px_4px_10px_rgba(0,0,0,0.03)]">
              <p class="text-[0.8125rem] font-semibold text-ink">{{ $t("payment-success.mobile-summary-title") }}</p>
              <div class="mt-4 flex items-start justify-between border-b border-border-default pb-3">
                <div class="flex items-center gap-3.5">
                  <div class="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f5f2fd]">
                    <img v-if="orderOfferIcon" :src="orderOfferIcon" class="size-7 object-contain" alt="" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-[#6323fd]">{{ orderOfferTitle }}</p>
                    <span v-if="order.offer?.description" class="mt-0.5 block max-w-[7.3125rem] truncate rounded-[0.3125rem] bg-[#f3effd] px-2.5 py-0.5 text-[0.5625rem] font-medium text-[#6323fd]">
                      {{ order.offer.description }}
                    </span>
                    <span v-if="order.offer?.nbr_hours" class="mt-1 inline-block rounded-[0.3125rem] bg-[#f3effd] px-2.5 py-0.5 text-[0.5625rem] font-medium text-[#6323fd]">
                      {{ order.offer.nbr_hours }} {{ $t("course.sessions-per-month") }}
                    </span>
                    <p class="pt-1.5 text-sm font-semibold text-[#5715fb]">{{ order.amount }} €</p>
                  </div>
                </div>
                <div class="shrink-0 text-right">
                  <p class="text-[0.5625rem] text-[#94a3b8]">{{ $t("payment-success.profilage-order-date-label") }}</p>
                  <p class="pt-0.5 text-[0.5625rem] text-ink">{{ formattedPaymentDate }}</p>
                  <p class="pt-2 text-[0.5625rem] text-[#94a3b8]">{{ $t("payment-success.profilage-order-ref-label") }}</p>
                  <p class="pt-0.5 text-[0.5625rem] text-ink">{{ languageOrderReference }}</p>
                </div>
              </div>
              <div class="mt-2.5 flex items-center gap-3">
                <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f5f4fa]">
                  <img :src="languageEmailNoticeIcon" class="size-4" alt="" />
                </div>
                <p class="text-[0.625rem] leading-[0.859375rem] text-ink">
                  {{ $t("payment-success.profilage-email-notice-prefix") }}
                  <span class="font-semibold">{{ order.user?.email }}</span>
                </p>
              </div>
            </div>

            <!-- Les prochaines étapes -->
            <div class="w-full pt-5">
              <p class="pb-2.5 text-sm font-semibold text-ink">{{ $t("payment-success.language-next-steps-title") }}</p>
              <div class="flex flex-col gap-1.5">
                <div v-for="(step, index) in languageSteps" :key="step.title" class="flex items-center gap-1.5">
                  <div class="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#4f46e5] shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
                    <span class="text-[0.625rem] font-medium text-white">{{ index + 1 }}</span>
                  </div>
                  <div class="flex flex-1 items-center gap-3.5 rounded-[0.625rem] border border-border-default bg-surface px-3 py-[1.0625rem] shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
                    <div
                      class="flex size-11 shrink-0 items-center justify-center rounded-full"
                      :style="step.iconBg ? { backgroundColor: step.iconBg } : undefined"
                    >
                      <img :src="step.icon" class="size-5" alt="" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-[0.625rem] font-bold text-ink">{{ step.title }}</p>
                      <p class="pt-0.5 text-[0.625rem] text-ink">{{ step.text }}</p>
                    </div>
                    <span
                      class="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.625rem] font-medium"
                      :class="{
                        'bg-[#edf9ef] text-[#11b13a]': step.status === 'done',
                        'bg-[#f5f3fe] text-[#4f46e5]': step.status === 'todo',
                        'bg-[#f1f5f9] text-[#64748b]': step.status === 'upcoming',
                      }"
                    >
                      <img v-if="step.status === 'done'" :src="languageStatusDoneIcon" class="size-3" alt="" />
                      {{
                        step.status === "done"
                          ? $t("payment-success.profilage-status-done")
                          : step.status === "todo"
                            ? $t("payment-success.profilage-status-todo")
                            : $t("payment-success.profilage-status-upcoming")
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Besoin d'aide -->
            <div class="mt-2 flex w-full items-center justify-between gap-2 rounded-[0.625rem] bg-surface-tint px-[0.5625rem] py-4">
              <div class="flex flex-1 items-start gap-[0.6875rem]">
                <div class="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#e8e2fd]">
                  <img :src="languageSupportIcon" class="size-6" alt="" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-bold text-ink">{{ $t("payment-success.support-title") }}</p>
                  <p class="pt-1 text-[0.625rem] leading-4 text-ink">{{ $t("payment-success.support-text") }}</p>
                </div>
              </div>
              <router-link
                :to="i18nRoute({ name: 'contact' })"
                class="shrink-0 whitespace-nowrap rounded-lg border border-[#450ff2] px-3 py-2 text-[0.625rem] font-medium text-[#450ff2] no-underline"
              >
                {{ $t("payment-success.profilage-contact-support") }}
              </router-link>
            </div>
          </div>

          <!-- Bottom tab bar -->
          <MobileAppBottomNav active="orientation" :special-orientation-icon="true" />
        </div>

        <!-- ═══════════════════════════════════════════
             MOBILE — Figma "Paiement réussi" (< lg), autres services
        ═══════════════════════════════════════════ -->
        <div v-else class="mx-auto flex w-full max-w-[26.875rem] flex-col items-center overflow-x-hidden bg-surface pb-26 lg:hidden">
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

            <!-- Illustration + titre -->
            <img :src="checkmarkIllustration" class="w-[17.25rem] max-w-full object-contain" alt="" />
            <p class="text-2xl font-semibold tracking-[-0.039rem] text-ink">
              {{ $t("thank-you-for-your-payment") }}
            </p>
            <p class="pt-2 text-center text-sm text-ink">{{ $t("payment-success.mobile-subtitle") }}</p>

            <!-- Récapitulatif de commande -->
            <div v-if="order" class="mt-5 w-full rounded-[0.625rem] border border-border-default bg-surface p-[0.9375rem] shadow-[0px_0px_3.5px_rgba(0,0,0,0.1)]">
              <p class="text-[0.96875rem] font-semibold text-ink">{{ $t("payment-success.mobile-summary-title") }}</p>
              <div class="flex items-center justify-between py-1 pt-3">
                <div class="flex items-center gap-3">
                  <div class="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[0.4375rem] bg-[#f1f5f9]">
                    <img v-if="orderOfferIcon" :src="orderOfferIcon" class="size-full object-cover" alt="" />
                  </div>
                  <p class="text-xs font-medium text-ink">{{ orderOfferTitle }}</p>
                </div>
                <p class="shrink-0 pl-2 text-base font-bold text-ink">{{ order.amount }} €</p>
              </div>
              <div class="mt-3 border-t border-border-default pt-3.5">
                <div class="flex items-center justify-between">
                  <p class="text-xs text-ink">{{ $t("payment-success.mobile-payment-date-label") }}</p>
                  <p class="text-[0.8125rem] font-medium text-ink">{{ formattedPaymentDate }}</p>
                </div>
                <div class="mt-3.5 flex items-center justify-between">
                  <p class="text-xs text-ink">{{ $t("payment-success.mobile-payment-method-label") }}</p>
                  <div class="flex items-center gap-1.5">
                    <span class="rounded-[0.375rem] bg-[rgba(99,91,255,0.1)] px-2 py-0.5 text-[0.65625rem] font-bold tracking-[0.03125rem] text-[#492cfb]">
                      stripe
                    </span>
                    <span class="text-xs text-[#64748b]">{{ $t("payment-success.mobile-card-method") }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bienvenue -->
            <div class="mt-5 flex w-full items-center gap-4 rounded-[0.625rem] border border-[#f3f9f5] bg-[#f4f9f6] px-[0.625rem] py-[1.3125rem]">
              <img :src="welcomeIcon" class="size-11 shrink-0" alt="" />
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold text-ink">{{ $t("payment-success.mobile-welcome-title") }}</p>
                <p class="pt-1 text-[0.625rem] leading-4 text-ink">{{ $t("payment-success.mobile-welcome-text") }}</p>
              </div>
            </div>

            <!-- Et maintenant ? -->
            <div class="w-full pt-5">
              <p class="text-sm font-semibold tracking-[0.0375rem] text-ink">{{ $t("payment-success.next-steps-title") }}</p>
              <div class="relative flex items-start pt-[0.625rem]">
                <template v-for="(step, index) in nextSteps" :key="step.title">
                  <div class="flex flex-1 flex-col items-center gap-[0.6875rem]">
                    <div class="flex flex-col items-center gap-[1.125rem]">
                      <img :src="mobileStepIcons[index]" class="size-[3.125rem]" alt="" />
                    </div>
                    <div class="flex flex-col items-center gap-[0.3125rem] text-center text-[0.5625rem] text-ink">
                      <p class="font-bold leading-normal">{{ step.title }}</p>
                      <p class="font-medium leading-normal">{{ step.text }}</p>
                    </div>
                  </div>
                  <img
                    v-if="index < nextSteps.length - 1"
                    :src="stepConnector"
                    class="mt-[1.5625rem] h-[0.5625rem] w-[1.3125rem] shrink-0"
                    alt=""
                  />
                </template>
              </div>
            </div>

            <!-- Une question ? -->
            <div class="mt-5 flex w-full items-start justify-between gap-2 rounded-[0.625rem] bg-surface-tint px-[0.5625rem] py-4">
              <div class="flex flex-1 items-start gap-[0.6875rem]">
                <div class="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#e8e2fd]">
                  <img :src="supportIcon" class="size-6" alt="" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-[0.6875rem] font-bold text-ink">{{ $t("payment-success.support-title") }}</p>
                  <p class="pt-1 text-[0.625rem] leading-4 text-ink">{{ $t("payment-success.support-text") }}</p>
                </div>
              </div>
              <router-link
                :to="i18nRoute({ name: 'contact' })"
                class="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#5d2afb] px-3.5 py-2 no-underline"
              >
                <span class="text-[0.625rem] font-medium text-white">{{ $t("payment-success.mobile-contact-advisor") }}</span>
                <img :src="ctaArrowIcon" class="h-[0.4375rem] w-2" alt="" />
              </router-link>
            </div>
          </div>

          <!-- Bottom tab bar -->
          <MobileAppBottomNav active="orientation" :special-orientation-icon="true" />
        </div>

        <!-- ═══════════════════════════════════════════
             DESKTOP — page existante (≥ lg)
        ═══════════════════════════════════════════ -->
        <div class="hidden lg:block">
        <!-- Hero: success card + next step panel -->
        <section class="hero">
          <!-- success card -->
          <div class="success-card">
            <div class="check-wrap">
              <div class="check-circle">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span
                v-for="(c, i) in confetti"
                :key="i"
                class="confetti"
                :style="{
                  left: c.left + 'px',
                  top: c.top + 'px',
                  width: c.width + 'px',
                  height: c.height + 'px',
                  background: c.background,
                  transform: 'rotate(' + c.rotate + 'deg)',
                }"
              />
            </div>

            <h1>{{ $t("thank-you-for-your-payment") }}</h1>
            <p class="sub">{{ $t("thank-you-for-your-payment-description") }}</p>

            <!-- Email notice -->
            <div v-if="emailSent && !isLanguageCoursePreorder" class="notice blue">
              <span class="ic">
                <EnvelopeIcon />
              </span>
              <p>{{ $t("payment-success.email-sent-notice") }}</p>
            </div>

            <!-- Language preorder notice -->
            <div v-if="isLanguageCoursePreorder" class="notice green">
              <span class="ic">
                <CheckCircleIcon />
              </span>
              <p>{{ $t("payment-success.preorder-completed-notice") }}</p>
            </div>

            <!-- CTAs: course orders -->
            <div v-if="isCourseOrder" class="cta-row">
              <router-link :to="i18nRoute({ name: 'user-orders' })" class="btn-navy">
                <ClipboardDocumentListIcon class="btn-ic" />
                {{ $t("order-history") }}
              </router-link>
              <router-link
                v-if="!isLanguageCoursePreorder"
                :to="i18nRoute({ name: 'user-courses-unplanned' })"
                class="btn-fill"
              >
                <CalendarDaysIcon class="btn-ic" />
                {{ $t("schedule-my-course") }}
              </router-link>
            </div>

            <!-- CTAs: profilage -->
            <div
              v-if="order?.offer?.type === 'profilage' || order?.service_type === 'App\\Models\\Profilage'"
              class="cta-row"
            >
              <router-link :to="i18nRoute({ name: 'user-evaluations' })" class="btn-navy">
                <ClipboardDocumentListIcon class="btn-ic" />
                {{ $t("menu.account.evaluations") }}
              </router-link>
            </div>

            <!-- Notice + CTA: living orders -->
            <div v-if="order?.service_type === 'App\\Models\\CostOfLiving'" class="notice amber column">
              <p class="amber-text">{{ $t("payment-success.living-form-notice") }}</p>
              <router-link :to="i18nRoute({ name: 'user-orders' })" class="btn-navy">
                <ClipboardDocumentListIcon class="btn-ic" />
                {{ $t("order-history") }}
              </router-link>
            </div>
          </div>

          <!-- next step + illustration -->
          <div class="next">
            <div class="doc-badge">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M12 18v-6" />
                <path d="m9 15 3-3 3 3" />
              </svg>
            </div>
            <div class="next-text">
              <h2>
                {{ $t("payment-success.next-step-profile-title") }}
                <span class="accent">{{ $t("payment-success.next-step-profile-highlight") }}</span>
              </h2>
              <p>{{ $t("payment-success.next-step-profile-description") }}</p>
            </div>
            <div class="illus">
              <img src="/images/auth/illustration-v2.png" alt="" />
            </div>
          </div>
        </section>

        <!-- "Et ensuite ?" steps -->
        <section v-if="showNextSteps" class="ensuite">
          <h3>{{ $t("payment-success.next-steps-title") }}</h3>
          <div class="steps">
            <template v-for="(step, index) in nextSteps" :key="step.title">
              <div class="step">
                <div class="step-ic" :class="stepTones[index]">
                  <component :is="step.icon" />
                </div>
                <div class="step-body">
                  <h4>{{ index + 1 }}. {{ step.title }}</h4>
                  <p>{{ step.text }}</p>
                </div>
              </div>
              <div v-if="index < nextSteps.length - 1" class="step-arrow">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </template>
          </div>
        </section>

        <!-- Aide -->
        <section class="aide">
          <div class="aide-ic">
            <ChatBubbleLeftRightIcon />
          </div>
          <div class="aide-text">
            <h4>{{ $t("payment-success.support-title") }}</h4>
            <p>{{ $t("payment-success.support-text") }}</p>
          </div>
          <div class="aide-actions">
            <router-link :to="i18nRoute({ name: 'contact' })" class="btn-outline">
              <PhoneIcon class="btn-ic" />
              {{ $t("contact-us") }}
            </router-link>
            <router-link :to="i18nRoute({ name: 'home' })" class="btn-fill">
              <HomeIcon class="btn-ic" />
              {{ $t("back-to-home") }}
            </router-link>
          </div>
        </section>
        </div>
      </template>

      <!-- ── FAILED ── -->
      <template v-else-if="paymentFailed">
        <div class="status-wrap">
          <div class="status-card">
            <div class="status-ic red">
              <XCircleIcon />
            </div>
            <h1>{{ $t("payment-failed") }}</h1>
            <p>{{ $t("payment-failed-description") }}</p>
            <router-link :to="i18nRoute({ name: 'home' })" class="btn-fill">
              <HomeIcon class="btn-ic" />
              {{ $t("back-to-home") }}
            </router-link>
          </div>
        </div>
      </template>

      <!-- ── PENDING ── -->
      <template v-else>
        <div class="status-wrap">
          <div class="status-card">
            <div class="status-ic amber">
              <ClockIcon />
            </div>
            <h1 class="amber-title">{{ $t("payment-pending-confirmation") }}</h1>
            <p>{{ $t("payment-pending-confirmation-description") }}</p>
            <router-link :to="i18nRoute({ name: 'home' })" class="btn-navy">
              <HomeIcon class="btn-ic" />
              {{ $t("back-to-home") }}
            </router-link>
          </div>
        </div>
      </template>
    </template>

    <!-- No order found -->
    <template v-else>
      <div class="status-wrap">
        <div class="status-card">
          <div class="status-ic red square">
            <XCircleIcon />
          </div>
          <h1>{{ $t("order-not-found") }}</h1>
          <p>{{ $t("order-not-found-description") }}</p>
          <router-link :to="i18nRoute({ name: 'home' })" class="btn-fill">
            <HomeIcon class="btn-ic" />
            {{ $t("back-to-home") }}
          </router-link>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
/* ── Course « réservations confirmées » (wizard) ── */
.confirm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: center; min-height: 480px; padding: 40px 0 10px; }
.check-stage { position: relative; width: 230px; height: 180px; margin-bottom: 22px; }
.cc-circle { position: absolute; left: 50%; top: 8px; transform: translateX(-50%); width: 150px; height: 150px; border-radius: 50%; background: #e6f4ec; display: grid; place-items: center; }
.cc-circle svg { width: 78px; height: 78px; }
.cc-confetti { position: absolute; border-radius: 2px; }
.confirm-title { font-size: 60px; font-weight: 800; color: #16213f; margin: 0 0 6px; letter-spacing: -.02em; }
.confirm-sub { font-size: 30px; font-weight: 700; color: #1fa463; margin: 0 0 24px; }
.confirm-text { font-size: 18px; color: #46506b; line-height: 1.7; margin: 0; }
.confirm-art { position: relative; height: 420px; }
.ca-blob { position: absolute; right: 60px; top: 50px; width: 340px; height: 300px; background: #e3f3e8; border-radius: 56% 44% 50% 50% / 52% 50% 50% 48%; }
.ca-photo { position: absolute; right: 30px; top: 60px; width: 400px; height: 340px; max-width: 90%; background: #e6f1ea; border-radius: 22px; }
.ca-deco { position: absolute; font-size: 40px; }
.ca-video { right: 10px; top: 50px; }
.ca-plane { right: 360px; top: 230px; }
.help-banner { display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: 22px; background: linear-gradient(180deg,#fdeeee,#fdf4f4); border: 1px solid #f6dada; border-radius: 26px; padding: 26px 34px; margin: 16px 0 56px; }
.help-banner .hb-ic { width: 60px; height: 60px; border-radius: 50%; background: #fdecec; display: grid; place-items: center; font-size: 26px; }
.help-banner .hb-t { font-size: 22px; font-weight: 700; color: #16213f; }
.help-banner .hb-s { font-size: 16px; color: #46506b; margin-top: 2px; }
.help-banner .btn { padding: 16px 30px; font-size: 16px; white-space: nowrap; border-radius: 10px; font-weight: 600; text-decoration: none; }
@media (max-width: 1024px) {
  .confirm-grid { grid-template-columns: 1fr; }
  .confirm-art { display: none; }
  .confirm-title { font-size: 44px; }
  .help-banner { grid-template-columns: 1fr; text-align: center; }
}

.payment-success-root {
  --red: #f23a47;
  --red-strong: #ee3340;
  --navy: #1f2a47;
  --gray: #64718a;
  --blue: #3b6fe0;
  --blue-bg: #e9f1fe;
  --green: #2cb45d;

  font-family:
    "Poppins",
    system-ui,
    -apple-system,
    sans-serif;
  color: var(--navy);
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  padding: 112px 32px 72px;

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  @media only screen and (max-width: 1024px) {
    padding: 96px 18px 56px;
  }
}

/* ============ HERO ============ */
.hero {
  display: grid;
  grid-template-columns: 0.92fr 1.08fr;
  gap: 56px;
  align-items: stretch;
  margin-bottom: 24px;
}

/* success card */
.success-card {
  background: linear-gradient(180deg, #ffffff 0%, #fffcfb 100%);
  border-radius: 28px;
  box-shadow: 0 24px 60px -28px rgba(31, 42, 71, 0.18);
  padding: 50px 48px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.check-wrap {
  position: relative;
  width: 230px;
  height: 150px;
  margin-bottom: 22px;
}
.check-circle {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: var(--green);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16px 30px -14px rgba(44, 180, 93, 0.6);
}
.check-circle svg {
  width: 54px;
  height: 54px;
}
.confetti {
  position: absolute;
  border-radius: 2px;
  opacity: 0.92;
}

.success-card h1 {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 12px;
}
.success-card .sub {
  font-size: 16px;
  color: var(--gray);
  font-weight: 400;
  margin: 0 0 28px;
}

.notice {
  width: 100%;
  border-radius: 18px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 18px;
  text-align: left;
  margin-top: 6px;
}
.notice + .notice,
.cta-row + .notice,
.notice + .cta-row,
.cta-row + .cta-row {
  margin-top: 16px;
}
.notice.blue {
  background: var(--blue-bg);
  color: var(--blue);
}
.notice.green {
  background: #e9f6ee;
  color: var(--green);
}
.notice.amber {
  background: #fff7e6;
  color: #b7791f;
}
.notice.column {
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
}
.notice .ic {
  flex: none;
  display: flex;
}
.notice .ic :deep(svg) {
  width: 30px;
  height: 30px;
}
.notice p {
  font-weight: 600;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}
.amber-text {
  font-weight: 600;
  font-size: 14px;
  color: #92670f;
}

/* CTA buttons */
.cta-row {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
  margin-top: 24px;
}
.btn-navy,
.btn-fill,
.btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  font-family: inherit;
  font-weight: 600;
  font-size: 15px;
  padding: 14px 26px;
  border-radius: 14px;
  cursor: pointer;
  text-decoration: none;
  transition:
    transform 0.12s,
    box-shadow 0.15s,
    background 0.15s,
    border-color 0.15s;
}
.btn-ic {
  width: 18px;
  height: 18px;
}
.btn-navy {
  background: var(--navy);
  color: #fff;
}
.btn-navy:hover {
  transform: translateY(-1px);
  background: #16203a;
}
.btn-fill {
  background: var(--red);
  color: #fff;
  box-shadow: 0 12px 24px -12px rgba(242, 58, 71, 0.8);
}
.btn-fill:hover {
  background: var(--red-strong);
  transform: translateY(-1px);
}
.btn-outline {
  background: var(--color-surface);
  color: var(--red);
  border: 1.5px solid #f4b9b5;
}
.btn-outline:hover {
  border-color: var(--red);
  transform: translateY(-1px);
}

/* right column */
.next {
  position: relative;
  padding-top: 14px;
  min-height: 360px;
  display: flex;
  flex-direction: column;
}
.doc-badge {
  position: relative;
  z-index: 3;
  width: 70px;
  height: 70px;
  border-radius: 20px;
  background: #fce6e4;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--red);
  margin-bottom: 24px;
}
.doc-badge svg {
  width: 34px;
  height: 34px;
}
.next-text {
  max-width: 320px;
  position: relative;
  z-index: 3;
}
.next-text h2 {
  font-size: 26px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.01em;
  margin: 0 0 16px;
}
.next-text h2 .accent {
  color: var(--red);
}
.next-text p {
  color: var(--gray);
  font-size: 16px;
  line-height: 1.6;
  font-weight: 400;
  max-width: 270px;
  margin: 0 0 22px;
}
.next-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--red);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  padding: 12px 22px;
  border-radius: 12px;
  text-decoration: none;
  box-shadow: 0 12px 24px -12px rgba(242, 58, 71, 0.8);
  transition:
    background 0.15s,
    transform 0.12s;
}
.next-cta:hover {
  background: var(--red-strong);
  transform: translateY(-1px);
}
.illus {
  position: absolute;
  right: -20px;
  bottom: -8px;
  width: 58%;
  max-width: 420px;
  z-index: 2;
  pointer-events: none;
}
.illus img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
}

/* ============ ET ENSUITE ============ */
.ensuite {
  padding-top: 46px;
}
.ensuite h3 {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 36px;
}
.steps {
  display: flex;
  align-items: flex-start;
  gap: 4px;
}
.step {
  flex: 1;
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.step-ic {
  width: 70px;
  height: 70px;
  flex: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.step-ic :deep(svg) {
  width: 30px;
  height: 30px;
}
.step-ic.red {
  background: #fcedec;
  color: var(--red);
}
.step-ic.purple {
  background: #f1ecfb;
  color: #8a5ce0;
}
.step-ic.green {
  background: #e9f6ee;
  color: var(--green);
}
.step-ic.blue {
  background: #eaf1fb;
  color: var(--blue);
}
.step-body h4 {
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 8px;
  line-height: 1.25;
}
.step-body p {
  color: var(--gray);
  font-size: 13px;
  line-height: 1.5;
  font-weight: 400;
  margin: 0;
}
.step-arrow {
  flex: none;
  align-self: center;
  color: #c9d0dc;
  margin: 0 6px;
  padding-top: 24px;
}
.step-arrow svg {
  width: 26px;
  height: 26px;
}

/* ============ AIDE ============ */
.aide {
  margin-top: 56px;
  background: #fceae7;
  border-radius: 24px;
  padding: 28px 36px;
  display: flex;
  align-items: center;
  gap: 24px;
}
.aide-ic {
  width: 70px;
  height: 70px;
  flex: none;
  border-radius: 50%;
  background: #fbdbd7;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--red);
}
.aide-ic :deep(svg) {
  width: 34px;
  height: 34px;
}
.aide-text h4 {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 6px;
}
.aide-text p {
  color: var(--gray);
  font-size: 16px;
  font-weight: 400;
  margin: 0;
}
.aide-actions {
  margin-left: auto;
  display: flex;
  gap: 16px;
}

/* ============ STATUS (failed / pending / not found) ============ */
.status-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}
.status-card {
  background: var(--color-surface);
  border-radius: 28px;
  padding: 48px 44px;
  text-align: center;
  box-shadow: 0 24px 60px -28px rgba(31, 42, 71, 0.18);
  max-width: 440px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.status-ic {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}
.status-ic.square {
  border-radius: 22px;
  width: 80px;
  height: 80px;
}
.status-ic :deep(svg) {
  width: 52px;
  height: 52px;
}
.status-ic.red {
  background: #fdecec;
  color: var(--red);
}
.status-ic.amber {
  background: #fff7e6;
  color: #f0a500;
}
.status-card h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 12px;
}
.status-card h1.amber-title {
  color: #f0a500;
}
.status-card p {
  font-size: 14px;
  color: var(--gray);
  line-height: 1.6;
  margin: 0 0 28px;
}

/* ============ SKELETON ============ */
.ps-skeleton {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 60px 0;
}
.ps-skeleton > * {
  animation: pulse 1.4s ease-in-out infinite;
  background: #e6eaf1;
  border-radius: 14px;
}
.sk-circle {
  width: 96px;
  height: 96px;
  border-radius: 50%;
}
.sk-line {
  height: 26px;
}
.sk-line.thin {
  height: 16px;
}
.sk-line.w56 {
  width: 224px;
}
.sk-line.w72 {
  width: 288px;
}
.sk-line.w48 {
  width: 192px;
}
.sk-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;
  max-width: 520px;
  background: transparent;
  animation: none;
}
.sk-box {
  height: 48px;
  background: #e6eaf1;
  border-radius: 14px;
  animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* ============ RESPONSIVE ============ */
@media (max-width: 1080px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .next {
    min-height: auto;
    padding-bottom: 0;
  }
  .illus {
    position: static;
    width: 100%;
    margin-top: 24px;
  }
  .steps {
    flex-wrap: wrap;
    gap: 24px;
  }
  .step {
    flex: 1 1 45%;
  }
  .step-arrow {
    display: none;
  }
  .aide {
    flex-wrap: wrap;
  }
  .aide-actions {
    margin-left: 0;
    width: 100%;
  }
  .btn-outline,
  .aide-actions .btn-fill {
    flex: 1;
  }
}
@media (max-width: 560px) {
  .success-card {
    padding: 36px 24px 32px;
  }
  .cta-row {
    flex-direction: column;
  }
  .cta-row .btn-navy,
  .cta-row .btn-fill {
    width: 100%;
  }
  .step {
    flex: 1 1 100%;
  }
}
</style>
