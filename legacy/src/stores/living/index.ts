import type { LivingType, FormulaType } from "@/constants/constant.type";
import { HttpService } from "@/services/httpService";
import { defineStore } from "pinia";

const http = new HttpService();

export const useLivingStore = defineStore("livingStore", {
  state: (): {
    selectedExpense: { title: string; description: string } | null;
    selectedFormula: FormulaType | null;
    selectedLiving: LivingType | null;
    formulaList: FormulaType[];
    livingList: LivingType[];
  } => {
    return {
      selectedExpense: null,
      selectedFormula: null,
      selectedLiving: null,
      formulaList: [],
      livingList: [],
    };
  },
  getters: {
    getSelectedExpense(): { title: string; description: string } | null {
      return this.selectedExpense;
    },
    getSelectedFormula(): FormulaType | null {
      return this.selectedFormula;
    },
    getSelectedLiving(): LivingType | null {
      return this.selectedLiving;
    },
    getLivingList(): LivingType[] {
      return this.livingList;
    },
    getFormulaList(): FormulaType[] {
      return this.formulaList;
    },
  },

  actions: {
    getLivingBySlug(slug: string) {
      const index = this.livingList.findIndex((item) => item.slug === slug);
      return this.livingList[index];
    },
    async fetchLivings() {
      const { data } = await http.get(`/livings`);
      this.livingList = data;
    },
    async fetchFormulas() {
      const { data } = await http.get(`/livings/formulas?livingId=${this.selectedLiving?.id}`);
      this.formulaList = data;
    },
    async fetchLivingByID(id: string) {
      const { data } = await http.get(`/livings/${id}`);
      return data;
    },
    setSelectedLiving(living: LivingType) {
      this.selectedLiving = living;
    },
    setSelectedFormula(formula: FormulaType) {
      this.selectedFormula = formula;
    },
    setSelectedExpense(expense: { title: string; description: string }) {
      this.selectedExpense = expense;
    },
  },
  persist: true,
});
