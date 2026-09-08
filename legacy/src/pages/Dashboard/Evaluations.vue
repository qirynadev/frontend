<script setup lang="ts">
import { computed, onBeforeMount, ref } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { useETestingStore } from "@/stores";
import type { ETestingEvaluation, ETestingOrder } from "@/stores/etesting";
import { ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";

const { t } = useI18n();
const eTestingStore = useETestingStore();
const { evaluations, isFetching } = storeToRefs(eTestingStore);

const downloadingId = ref<string | null>(null);
const refreshingId = ref<string | null>(null);
const currentPage = ref(1);
const PER_PAGE = 10;

onBeforeMount(async () => {
  await eTestingStore.fetchEvaluations();
});

const totalPages = computed(() => Math.ceil(evaluations.value.length / PER_PAGE));

const paginatedEvaluations = computed(() =>
  evaluations.value.slice((currentPage.value - 1) * PER_PAGE, currentPage.value * PER_PAGE),
);

const statusLabel = (etat: ETestingEvaluation["etat_eval"]): string => {
  const map = { 0: "pending", 1: "in_progress", 2: "finished", 3: "cancelled" } as const;
  return t(`etesting.status.${map[etat] ?? "pending"}`);
};

const statusClass = (etat: ETestingEvaluation["etat_eval"]): string => {
  const map: Record<number, string> = {
    0: "bg-gray-100 text-gray-700",
    1: "bg-orange-100 text-orange-700",
    2: "bg-green-100 text-green-700",
    3: "bg-red-100 text-red-700",
  };
  return map[etat] ?? "bg-gray-100 text-gray-700";
};

const handleRefresh = async (evaluation: ETestingEvaluation): Promise<void> => {
  refreshingId.value = evaluation.id;
  await eTestingStore.refreshResults(evaluation.id);
  refreshingId.value = null;
};

const handleTest = (evaluation: ETestingEvaluation): void => {
  if (evaluation.url_eval) window.open(evaluation.url_eval, "_blank");
};

const handleDownloadPdf = async (evaluation: ETestingEvaluation): Promise<void> => {
  downloadingId.value = evaluation.id;
  try {
    const data = await eTestingStore.downloadPdf(evaluation.id);
    const b64 = (data as any)?.programme_pdf ?? data?.pdf_synthese;
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
  } finally {
    downloadingId.value = null;
  }
};
</script>

<template>
  <div class="global-container">
    <div class="container-inner">
      <div class="left-part">
        <!-- En-tête -->
        <div class="border-b text-[18px] font-bold mb-[15px] p-3 flex items-baseline gap-2">
          {{ $t("etesting.title") }}
          <span v-if="!isFetching" class="text-sm font-normal text-ink-muted">
            {{ evaluations.length }} {{ $t("etesting.evaluations") }}
          </span>
        </div>

        <!-- Loader -->
        <div v-if="isFetching" class="flex justify-center p-10">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#273c66]"></div>
        </div>

        <!-- État vide -->
        <div v-else-if="evaluations.length === 0" class="text-center text-ink-muted py-10">
          {{ $t("etesting.no-evaluations") }}
        </div>

        <template v-else>
          <!-- Desktop : Grille 5 colonnes -->
          <div class="hidden lg:block">
            <div class="grid grid-cols-3 gap-4">
              <div
                v-for="evaluation in paginatedEvaluations"
                :key="evaluation.id"
                class="border border-border-default rounded-lg p-3 bg-surface shadow-sm flex flex-col"
              >
                <!-- En-tête card -->
                <div class="flex flex-col items-center text-center mb-3">
                  <img
                    v-if="(evaluation.order?.options as any)?.category?.icon"
                    :src="(evaluation.order?.options as any).category.icon"
                    :alt="(evaluation.order?.options as any).category.title"
                    class="w-12 h-12 rounded-full object-cover mb-2"
                  />
                  <p class="font-semibold text-ink text-sm leading-tight">
                    {{
                      (evaluation.order?.options as any)?.category?.title ?? evaluation.nom ?? $t("etesting.unnamed")
                    }}
                  </p>
                  <span
                    class="mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
                    :class="statusClass(evaluation.etat_eval)"
                  >
                    {{ statusLabel(evaluation.etat_eval) }}
                  </span>
                  <p v-if="evaluation.limite_eval" class="text-xs text-ink-muted mt-1">
                    {{ $t("etesting.expires") }} {{ evaluation.limite_eval }}
                  </p>
                </div>

                <!-- Résultats si terminé -->
                <div
                  v-if="evaluation.etat_eval === 2 && (evaluation.score || evaluation.note)"
                  class="mb-2 p-2 bg-surface-alt rounded-md text-xs text-center"
                >
                  <span v-if="evaluation.score">{{ $t("etesting.score") }} : {{ evaluation.score }}</span>
                  <span v-if="evaluation.score && evaluation.note">·</span>
                  <span v-if="evaluation.note">Note : {{ evaluation.note }}</span>
                </div>

                <!-- Boutons d'action -->
                <div class="mt-auto flex flex-col gap-1.5">
                  <button
                    v-if="evaluation.etat_eval === 0 && evaluation.url_eval"
                    @click="handleTest(evaluation)"
                    class="w-full px-2 py-1.5 text-xs bg-[#273c66] text-white rounded-md hover:opacity-90 transition-opacity"
                  >
                    {{ $t("etesting.start") }}
                  </button>
                  <button
                    v-if="evaluation.etat_eval === 1 && evaluation.url_eval"
                    @click="handleTest(evaluation)"
                    class="w-full px-2 py-1.5 text-xs bg-orange-500 text-white rounded-md hover:opacity-90 transition-opacity"
                  >
                    {{ $t("etesting.continue") }}
                  </button>
                  <button
                    v-if="evaluation.etat_eval === 2 && evaluation.has_pdf"
                    @click="handleDownloadPdf(evaluation)"
                    :disabled="downloadingId === evaluation.id"
                    class="w-full px-2 py-1.5 text-xs bg-green-600 text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ $t("etesting.download-pdf") }}
                  </button>
                  <button
                    v-if="evaluation.etat_eval !== 3 && evaluation.etat_eval !== 2"
                    @click="handleRefresh(evaluation)"
                    :disabled="refreshingId === evaluation.id"
                    class="w-full px-2 py-1.5 text-xs border border-border-default text-ink-muted rounded-md hover:bg-surface-alt transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    <ArrowPathIcon class="size-3" :class="{ 'animate-spin': refreshingId === evaluation.id }" />
                    {{ $t("etesting.refresh") }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Pagination desktop -->
            <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="p-1.5 rounded-md border border-border-default text-ink-muted hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon class="size-4" />
              </button>
              <button
                v-for="page in totalPages"
                :key="page"
                @click="currentPage = page"
                class="w-8 h-8 text-sm rounded-md border transition-colors"
                :class="
                  page === currentPage
                    ? 'bg-[#273c66] text-white border-[#273c66]'
                    : 'border-border-default text-ink-muted hover:bg-surface-alt'
                "
              >
                {{ page }}
              </button>
              <button
                @click="currentPage++"
                :disabled="currentPage === totalPages"
                class="p-1.5 rounded-md border border-border-default text-ink-muted hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon class="size-4" />
              </button>
            </div>
          </div>

          <!-- Mobile : Tableau -->
          <div class="lg:hidden overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead class="text-xs text-ink-muted uppercase bg-surface-alt border-b">
                <tr>
                  <th class="px-3 py-2">{{ $t("etesting.col-name") }}</th>
                  <th class="px-3 py-2">{{ $t("etesting.col-status") }}</th>
                  <th class="px-3 py-2">{{ $t("etesting.col-actions") }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="evaluation in paginatedEvaluations" :key="evaluation.id">
                  <td class="px-3 py-3 font-medium text-ink max-w-[130px] truncate">
                    {{
                      (evaluation.order?.options as any)?.category?.title ?? evaluation.nom ?? $t("etesting.unnamed")
                    }}
                  </td>
                  <td class="px-3 py-3">
                    <span
                      class="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
                      :class="statusClass(evaluation.etat_eval)"
                    >
                      {{ statusLabel(evaluation.etat_eval) }}
                    </span>
                  </td>
                  <td class="px-3 py-3">
                    <div class="flex flex-col gap-1">
                      <button
                        v-if="evaluation.etat_eval === 0 && evaluation.url_eval"
                        @click="handleTest(evaluation)"
                        class="px-3 py-1 text-xs bg-[#273c66] text-white rounded-md"
                      >
                        {{ $t("etesting.start") }}
                      </button>
                      <button
                        v-if="evaluation.etat_eval === 1 && evaluation.url_eval"
                        @click="handleTest(evaluation)"
                        class="px-3 py-1 text-xs bg-orange-500 text-white rounded-md"
                      >
                        {{ $t("etesting.continue") }}
                      </button>
                      <button
                        v-if="evaluation.etat_eval === 2 && evaluation.has_pdf"
                        @click="handleDownloadPdf(evaluation)"
                        :disabled="downloadingId === evaluation.id"
                        class="px-3 py-1 text-xs bg-green-600 text-white rounded-md disabled:opacity-50"
                      >
                        {{ $t("etesting.download-pdf") }}
                      </button>
                      <button
                        v-if="evaluation.etat_eval !== 3 && evaluation.etat_eval !== 2"
                        @click="handleRefresh(evaluation)"
                        :disabled="refreshingId === evaluation.id"
                        class="px-3 py-1 text-xs border border-border-default text-ink-muted rounded-md disabled:opacity-50 flex items-center gap-1"
                      >
                        <ArrowPathIcon class="size-3" :class="{ 'animate-spin': refreshingId === evaluation.id }" />
                        {{ $t("etesting.refresh") }}
                      </button>
                      <span v-if="evaluation.etat_eval === 3" class="text-ink-muted">—</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Pagination mobile -->
            <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-4">
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="p-1.5 rounded-md border border-border-default text-ink-muted hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon class="size-4" />
              </button>
              <span class="text-sm text-ink-muted">{{ currentPage }} / {{ totalPages }}</span>
              <button
                @click="currentPage++"
                :disabled="currentPage === totalPages"
                class="p-1.5 rounded-md border border-border-default text-ink-muted hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon class="size-4" />
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.global-container {
  .container-inner {
    padding-bottom: 80px;

    @media (max-width: 1023px) {
      padding-bottom: 70px;
    }
  }
}
</style>
