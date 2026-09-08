<script lang="ts" setup>
import { computed, onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";
import { i18nRoute } from "@/utils";
import { useAuthStore, useETestingStore } from "@/stores";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";
import mobileLogo from "@/assets/images/home-mobile/logo.png";
import mobileIconBell from "@/assets/images/home-mobile/icon-bell.svg";
import backArrowIcon from "@/assets/images/profilage-landing-mobile/back-arrow.svg";
import mountainIllustration from "@/assets/images/profilage-project-mobile/mountain-illustration.png";
import testIconLeft from "@/assets/images/profilage-project-mobile/test-icon-left.png";
import testIllustrationRight from "@/assets/images/profilage-project-mobile/test-illustration-right.png";
import supportIllustration from "@/assets/images/profilage-project-mobile/support-illustration.png";
import stepCheckIcon from "@/assets/images/profilage-project-mobile/step-check-icon.svg";
import reportDocIcon from "@/assets/images/profilage-project-mobile/report-doc-icon.svg";
import testLinkIcon from "@/assets/images/profilage-project-mobile/test-link-icon.svg";
import infoIcon from "@/assets/images/profilage-project-mobile/info-icon.svg";
import bulletCheckIcon from "@/assets/images/profilage-project-mobile/bullet-check-icon.svg";

const router = useRouter();
const authStore = useAuthStore();
const eTestingStore = useETestingStore();

const isDownloading = ref(false);

onBeforeMount(async () => {
  await eTestingStore.fetchEvaluations();
  if (authStore.token) await authStore.fetchUnreadNotificationCount();
});

const goBack = () => router.back();

const profilageEvaluation = computed(() => {
  const evaluations = eTestingStore.evaluations
    .filter((evaluation) => evaluation.order?.service_type === "App\\Models\\Profilage")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return evaluations[0] ?? null;
});

const step1Done = computed(() => !!profilageEvaluation.value);
const step2Done = computed(() => profilageEvaluation.value?.etat_eval === 2);
const step3Done = computed(() => step2Done.value && !!profilageEvaluation.value?.has_pdf);

const steps = computed(() => [
  { labelKey: "profilage-project-step1", done: step1Done.value },
  { labelKey: "profilage-project-step2", done: step2Done.value },
  { labelKey: "profilage-project-step3", done: step3Done.value },
]);

const doneCount = computed(() => steps.value.filter((step) => step.done).length);
const percent = computed(() => Math.round((doneCount.value / steps.value.length) * 100));

const handleTakeTest = () => {
  if (profilageEvaluation.value?.url_eval) window.open(profilageEvaluation.value.url_eval, "_blank");
};

const handleDownloadReport = async () => {
  if (!profilageEvaluation.value) return;
  isDownloading.value = true;
  try {
    const data = await eTestingStore.downloadPdf(profilageEvaluation.value.id);
    const b64 = data?.programme_pdf ?? data?.pdf_synthese;
    if (!b64) return;
    const byteString = atob(b64);
    const bytes = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i);
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bilan-orientation-${profilageEvaluation.value.nom ?? "qiryna"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } finally {
    isDownloading.value = false;
  }
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

      <!-- Ma progression -->
      <div class="w-full rounded-[0.625rem] border border-[#f3f4f6] bg-[#fefefe] px-[1.1875rem] py-[1.5625rem] shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
        <div class="flex items-start justify-between">
          <div class="min-w-0 flex-1">
            <p class="text-lg font-bold text-ink">{{ $t("profilage-project-title") }}</p>
            <p class="pt-1 text-[0.625rem] text-[rgba(10,20,47,0.7)]">
              {{ $t(percent === 100 ? "profilage-project-subtitle-done" : "profilage-project-subtitle-in-progress") }}
            </p>
          </div>
          <div class="flex shrink-0 flex-col items-end">
            <p class="text-2xl font-bold text-[#fc037f]">{{ percent }}%</p>
            <p class="pt-0.5 text-xs font-medium tracking-[0.3px] text-ink">
              {{ $t(percent === 100 ? "profilage-project-status-done" : "profilage-project-status-in-progress") }}
            </p>
          </div>
        </div>

        <div class="mt-4 h-[0.375rem] w-full overflow-hidden rounded-full bg-[#e8e8ff]">
          <div class="h-full rounded-full bg-[#fc037f] transition-all" :style="{ width: `${percent}%` }"></div>
        </div>

        <div class="mt-6 flex items-start">
          <template v-for="(step, index) in steps" :key="step.labelKey">
            <div class="flex w-16 shrink-0 flex-col items-center gap-2">
              <div
                class="flex size-8 items-center justify-center rounded-full"
                :class="step.done ? 'bg-[#fb027d]' : 'bg-[#e8e8ff]'"
              >
                <img v-if="step.done" :src="stepCheckIcon" class="size-4" alt="" />
                <span v-else class="text-xs font-semibold text-[#8b83c9]">{{ index + 1 }}</span>
              </div>
              <p class="whitespace-pre-line text-center text-[0.625rem] leading-[0.78125rem] text-ink">{{ $t(step.labelKey) }}</p>
            </div>
            <div v-if="index < steps.length - 1" class="mt-4 h-0 flex-1 shrink-0 border-t border-[#bbb3f4]"></div>
          </template>
        </div>
      </div>

      <!-- Votre profil est prêt / en attente -->
      <div class="mt-5 w-full rounded-[0.625rem] border border-[#ffe5ee] bg-[#fff6f9] p-[1.0625rem] shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
        <div class="flex items-center gap-2.5">
          <img :src="mountainIllustration" class="h-[6.375rem] w-[6.8125rem] shrink-0 object-contain" alt="" />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-ink">
              {{ $t(step3Done ? "profilage-project-ready-title" : "profilage-project-pending-title") }}
            </p>
            <p class="pt-1 text-[0.71875rem] text-[#4b5563]">
              {{ $t(step3Done ? "profilage-project-ready-text" : "profilage-project-pending-text") }}
            </p>
          </div>
        </div>

        <div class="mt-3 flex items-stretch gap-3">
          <div class="flex flex-1 items-center gap-1.5 rounded-lg border border-[#ffe5ee] bg-surface px-[0.6875rem] py-[0.4375rem] shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
            <img :src="reportDocIcon" class="size-4 shrink-0" alt="" />
            <p class="min-w-0 flex-1 text-[0.625rem] font-semibold text-ink">
              {{ $t(step3Done ? "profilage-project-report-available" : "profilage-project-report-pending") }}
            </p>
          </div>
          <button
            v-if="step3Done"
            type="button"
            class="flex flex-1 items-center justify-center rounded-[0.625rem] bg-[#f05] px-4 py-2.5 disabled:opacity-60"
            :disabled="isDownloading"
            @click="handleDownloadReport"
          >
            <span class="text-[0.6875rem] font-semibold text-white">{{ $t("profilage-project-see-report") }}</span>
          </button>
        </div>
      </div>

      <!-- Votre test d'orientation -->
      <div class="mt-5 w-full rounded-[0.625rem] border border-[#f6f7fb] bg-[#fbfbfe] px-[0.6875rem] py-[1.0625rem] shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
        <div class="flex items-start gap-2">
          <img :src="testIconLeft" class="size-[5.3125rem] shrink-0 object-contain" alt="" />
          <div class="flex min-w-0 flex-1 flex-col items-start gap-[0.9375rem]">
            <div>
              <p class="text-sm font-bold text-ink">{{ $t("profilage-project-test-title") }}</p>
              <p class="pt-1 text-[0.71875rem] text-[#4b5563]">{{ $t("profilage-project-test-text") }}</p>
            </div>
            <button
              type="button"
              class="flex w-40 items-center justify-center gap-1.5 rounded-[0.3125rem] border border-[#4545f7] px-[0.8125rem] py-[0.5625rem] disabled:opacity-50"
              :disabled="!profilageEvaluation?.url_eval"
              @click="handleTakeTest"
            >
              <img :src="testLinkIcon" class="h-3.5 w-[0.84781rem]" alt="" />
              <span class="text-[0.6875rem] font-medium text-[#4545f7]">{{ $t("profilage-project-test-cta") }}</span>
            </button>
          </div>
          <img :src="testIllustrationRight" class="h-[5.0625rem] w-[6rem] shrink-0 object-contain" alt="" />
        </div>
      </div>

      <!-- À savoir -->
      <div class="mt-5 w-full rounded-[0.625rem] border border-[#f3f4f6] bg-[#f4f7fb] p-[1.3125rem] shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
        <div class="flex items-center gap-2">
          <img :src="infoIcon" class="size-[1.04167rem]" alt="" />
          <p class="text-[0.9375rem] font-medium text-[#0000f9]">{{ $t("profilage-project-info-title") }}</p>
        </div>
        <div class="mt-4 flex flex-col gap-3.5">
          <div v-for="itemKey in ['profilage-project-info-item1', 'profilage-project-info-item2', 'profilage-project-info-item3']" :key="itemKey" class="flex items-start gap-3">
            <div class="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-[#0805fe] p-px">
              <img :src="bulletCheckIcon" class="size-2.5" alt="" />
            </div>
            <p class="text-[0.78125rem] text-ink">{{ $t(itemKey) }}</p>
          </div>
        </div>
      </div>

      <!-- Besoin d'aide -->
      <div class="mt-5 flex w-full items-center justify-between gap-2 rounded-[0.625rem] bg-[#fff6f8] px-[0.5625rem] py-[0.8125rem]">
        <div class="flex flex-1 items-center gap-2.5">
          <img :src="supportIllustration" class="h-14 w-[3.75rem] shrink-0 object-contain" alt="" />
          <div class="min-w-0 flex-1">
            <p class="text-[0.625rem] font-bold text-ink">{{ $t("profilage-project-support-title") }}</p>
            <p class="pt-0.5 text-[0.5625rem] text-ink">{{ $t("profilage-project-support-text") }}</p>
          </div>
        </div>
        <RouterLink
          :to="i18nRoute({ name: 'user-notifications' })"
          class="shrink-0 whitespace-nowrap rounded-[0.625rem] border border-[#fe448b] px-2 py-[0.5625rem] text-[0.625rem] font-medium text-[#fe448b] no-underline"
        >
          {{ $t("profilage-project-support-cta") }}
        </RouterLink>
      </div>
    </div>

    <!-- Bottom tab bar -->
    <MobileAppBottomNav active="orientation" :special-orientation-icon="true" />
  </div>
</template>
