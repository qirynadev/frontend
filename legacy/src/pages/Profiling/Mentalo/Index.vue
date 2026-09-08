<script setup lang="ts">
import BannerRotator from "@/components/atoms/BannerRotator.vue";
import { useETestingStore, type ETestingEvaluation } from "@/stores";
import { computed, onBeforeMount, ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
} from "@heroicons/vue/20/solid";

const eTestingStore = useETestingStore();
const { t } = useI18n();

const isFetching = ref(false);
const refreshingId = ref<string | null>(null);
const downloadingId = ref<string | null>(null);

const evaluations = computed(() => eTestingStore.evaluations);

onBeforeMount(async () => {
  isFetching.value = true;
  await eTestingStore.fetchEvaluations();
  isFetching.value = false;
});

const etatLabel = (etat: number): string => {
  switch (etat) {
    case 0:
      return t("etesting.status.pending");
    case 1:
      return t("etesting.status.in_progress");
    case 2:
      return t("etesting.status.finished");
    case 3:
      return t("etesting.status.cancelled");
    default:
      return "-";
  }
};

const etatColor = (etat: number): string => {
  switch (etat) {
    case 0:
      return "text-gray-500 bg-gray-100";
    case 1:
      return "text-blue-600 bg-blue-100";
    case 2:
      return "text-green-700 bg-green-100";
    case 3:
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-500 bg-gray-100";
  }
};

const handleRefresh = async (id: string) => {
  refreshingId.value = id;
  await eTestingStore.refreshResults(id);
  refreshingId.value = null;
};

const handleDownloadPdf = async (evaluation: ETestingEvaluation) => {
  if (!evaluation.has_pdf) return;
  downloadingId.value = evaluation.id;
  const result = await eTestingStore.downloadPdf(evaluation.id);
  downloadingId.value = null;
  const b64 = result?.programme_pdf ?? result?.pdf_synthese;
  if (!b64) return;

  const byteString = atob(b64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  const blob = new Blob([ab], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rapport-${evaluation.nom ?? "evaluation"}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="global-container">
    <div class="container-inner">
      <div class="left-part">
        <div class="flex items-center justify-between border-b pb-2 mb-5">
          <h1 class="text-[16px] font-bold">{{ $t("etesting.title") }}</h1>
          <span class="text-sm text-ink-muted">{{ evaluations.length }} {{ $t("etesting.evaluations") }}</span>
        </div>

        <!-- Loading skeleton -->
        <template v-if="isFetching">
          <div v-for="n in 3" :key="n" class="animate-pulse bg-surface-alt rounded-lg h-24 mb-3" />
        </template>

        <!-- Empty state -->
        <div v-else-if="evaluations.length === 0" class="text-center py-12 text-ink-muted">
          <ExclamationCircleIcon class="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p class="text-sm">{{ $t("etesting.no-evaluations") }}</p>
        </div>

        <!-- Evaluation cards -->
        <template v-else>
          <div
            v-for="evaluation in evaluations"
            :key="evaluation.id"
            class="border border-border-default rounded-lg p-4 mb-3 bg-surface shadow-sm"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span
                    class="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                    :class="etatColor(evaluation.etat_eval)"
                  >
                    <CheckCircleIcon v-if="evaluation.etat_eval === 2" class="h-3 w-3" />
                    <ClockIcon v-else-if="evaluation.etat_eval === 1" class="h-3 w-3" />
                    {{ etatLabel(evaluation.etat_eval) }}
                  </span>
                  <span class="text-xs text-ink-muted uppercase tracking-wide">
                    {{ evaluation.flux_type === "programme" ? $t("etesting.programme") : $t("etesting.test") }}
                  </span>
                </div>

                <p class="font-semibold text-sm text-ink truncate">
                  {{ evaluation.nom ?? $t("etesting.unnamed") }}
                </p>

                <div v-if="evaluation.etat_eval === 2 && evaluation.score" class="mt-1">
                  <span class="text-xs text-ink-muted">{{ $t("etesting.score") }} :</span>
                  <span class="text-xs font-bold text-[#273c66]">{{ evaluation.score }}/100</span>
                </div>

                <div v-if="evaluation.limite_eval && evaluation.etat_eval === 0" class="mt-1 text-xs text-ink-muted">
                  {{ $t("etesting.expires") }}: {{ evaluation.limite_eval?.substring(0, 10) }}
                </div>
              </div>

              <div class="flex flex-col gap-2 items-end shrink-0">
                <!-- Start test link -->
                <a
                  v-if="evaluation.url_eval && evaluation.etat_eval < 2"
                  :href="evaluation.url_eval"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-1 text-xs font-medium text-white bg-[#ff3942] hover:bg-[#e02030] rounded px-3 py-1.5 transition"
                >
                  {{ evaluation.etat_eval === 0 ? $t("etesting.start") : $t("etesting.continue") }}
                </a>

                <!-- Download PDF -->
                <button
                  v-if="evaluation.has_pdf"
                  :disabled="downloadingId === evaluation.id"
                  @click="handleDownloadPdf(evaluation)"
                  class="inline-flex items-center gap-1 text-xs font-medium text-[#273c66] border border-[#273c66] rounded px-3 py-1.5 hover:bg-[#273c66] hover:text-white transition disabled:opacity-50"
                >
                  <ArrowDownTrayIcon class="h-3.5 w-3.5" />
                  {{ $t("etesting.download-pdf") }}
                </button>

                <!-- Refresh results -->
                <button
                  v-if="evaluation.etat_eval === 2 && !evaluation.has_pdf"
                  :disabled="refreshingId === evaluation.id"
                  @click="handleRefresh(evaluation.id)"
                  class="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-gray-700 transition disabled:opacity-50"
                >
                  <ArrowPathIcon class="h-3.5 w-3.5" :class="{ 'animate-spin': refreshingId === evaluation.id }" />
                  {{ $t("etesting.refresh") }}
                </button>
              </div>
            </div>

            <!-- Rubriques breakdown (only when finished) -->
            <div
              v-if="evaluation.etat_eval === 2 && evaluation.rubriques?.length"
              class="mt-3 pt-3 border-t border-border-default"
            >
              <p class="text-xs text-ink-muted mb-2 uppercase tracking-wide">{{ $t("etesting.breakdown") }}</p>
              <div class="grid grid-cols-2 gap-1.5">
                <div
                  v-for="rubrique in evaluation.rubriques"
                  :key="rubrique.ID"
                  class="flex items-center justify-between bg-surface-alt rounded px-2 py-1"
                >
                  <span class="text-xs text-ink-muted truncate">{{ rubrique.Nom }}</span>
                  <span class="text-xs font-semibold text-[#273c66] ml-2">{{ rubrique.Score }}/100</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="right-part hidden lg:block">
        <BannerRotator />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.global-container {
  .container-inner {
    padding-top: 20px;
    @media (max-width: 1023px) {
      padding-bottom: 70px;
    }
  }
}
</style>
