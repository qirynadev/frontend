import { HttpService } from "@/services/httpService";
import { defineStore } from "pinia";
import { ref } from "vue";

const http = new HttpService();

export type ETestingOrder = {
  id: string;
  user_id: string;
  offer_type: string | null;
  offer_id: string | null;
  service_type: string | null;
  service_id: string | null;
  profile_type: string | null;
  profile_id: string | null;
  montant: number;
  status: string;
  options: Record<string, unknown> | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type ETestingEvaluation = {
  id: string;
  order_id: string;
  eval_id: string | null;
  nom: string | null;
  flux_type: "test" | "programme";
  programme_ref: string | null;
  test_ref: string | null;
  etat_eval: 0 | 1 | 2 | 3;
  url_eval: string | null;
  type_eval: string | null;
  debut_eval: string | null;
  limite_eval: string | null;
  date_eval: string | null;
  score: string | null;
  note: string | null;
  temps: string | null;
  rubriques: Array<{ ID: string; Nom: string; Score: string; Note: string }> | null;
  has_pdf: boolean;
  created_at: string;
  order: ETestingOrder | null;
};

export const useETestingStore = defineStore(
  "eTestingStore",
  () => {
    const evaluations = ref<ETestingEvaluation[]>([]);
    const isFetching = ref<boolean>(false);

    async function fetchEvaluations(): Promise<boolean> {
      isFetching.value = true;
      const { data, success } = await http.get("/etesting/evaluations");
      isFetching.value = false;
      if (success) {
        evaluations.value = data ?? [];
        return true;
      }
      return false;
    }

    async function downloadPdf(
      id: string,
    ): Promise<{
      pdf_synthese?: string;
      pdf_detail?: string;
      pdf_candidat?: string;
      programme_pdf?: string;
      programme_pdf_detail?: string;
    } | null> {
      const { data, success } = await http.get(`/etesting/evaluations/${id}/pdf`);
      return success ? data : null;
    }

    async function refreshResults(id: string): Promise<boolean> {
      const { success } = await http.post(`/etesting/evaluations/${id}/refresh`, {});
      if (success) {
        await fetchEvaluations();
        return true;
      }
      return false;
    }

    return {
      evaluations,
      isFetching,
      fetchEvaluations,
      downloadPdf,
      refreshResults,
    };
  },
  { persist: false },
);
