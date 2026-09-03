import type { ProfilageType, FormulaType } from "@/constants/constant.type";
import { HttpService } from "@/services/httpService";
import { defineStore } from "pinia";
import { ref } from "vue";

const http = new HttpService();

export type ProfilageBeneficiary = {
  type: "self" | "child";
  first_name: string;
  last_name: string;
  birthday: string;
  gender: "M" | "F";
};

export const useProfilageStore = defineStore(
  "profilageStore",
  () => {
    const selectedFormula = ref<FormulaType | null>(null);
    const selectedProfilage = ref<ProfilageType | null>(null);
    const formulaList = ref<FormulaType[]>([]);
    // "Choisissez votre parcours" (Orientation Landing) : pour qui l'achat/bilan est
    // fait. Lu par Formulas.vue au moment du paiement (order.options.beneficiary_*).
    const beneficiary = ref<ProfilageBeneficiary>({
      type: "self",
      first_name: "",
      last_name: "",
      birthday: "",
      gender: "M",
    });

    function getProfilageItem(slug: string) {
      const index = selectedProfilage.value?.categories.findIndex((item) => item.slug === slug);
      return selectedProfilage.value?.categories[index as number];
    }

    async function fetchFormulas() {
      const { data } = await http.get(`/profilage/formulas`);
      formulaList.value = data;
    }

    async function fetchProfilage() {
      const { data } = await http.get(`/profilage`);
      selectedProfilage.value = data;
      return data;
    }

    return {
      selectedFormula,
      selectedProfilage,
      formulaList,
      beneficiary,
      fetchFormulas,
      fetchProfilage,
      getProfilageItem,
    };
  },
  {
    persist: true,
  },
);
