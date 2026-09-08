import { HttpService } from "@/services/httpService";
import { defineStore } from "pinia";
import { ref } from "vue";
import { MODULE_JOURNEYS, type ModuleJourneyKey } from "@/config/moduleJourneys";

const http = new HttpService();

export type ModuleJourneyProgress = {
  id: string;
  module: ModuleJourneyKey;
  route_name: string;
  params: Record<string, string>;
  step_index: number;
  step_count: number;
  percent: number;
  completed_at: string | null;
};

/**
 * Progression des utilisateurs connectés dans les tunnels École/Cours/MBA/Living/Profilage.
 * Volontairement NON persisté (persist: true) : c'est une donnée de compte, toujours
 * resynchronisée depuis le serveur via fetchJourneys(), pas un état local à conserver hors-ligne.
 *
 * Ce store n'est pour l'instant consommé par aucune UI (pas de bandeau "reprendre votre
 * parcours") — seul le tracking silencieux (trackStep, appelé depuis router/index.ts) est
 * branché. fetchJourneys() est prêt à être appelé le jour où l'UX de reprise est construite.
 */
export const useJourneyStore = defineStore("journeyStore", () => {
  const journeys = ref<Partial<Record<ModuleJourneyKey, ModuleJourneyProgress>>>({});

  async function fetchJourneys() {
    const { data, success } = await http.get(`/user/journey-progress`);
    if (!success || !Array.isArray(data)) return;

    const map: Partial<Record<ModuleJourneyKey, ModuleJourneyProgress>> = {};
    for (const item of data as ModuleJourneyProgress[]) {
      map[item.module] = item;
    }
    journeys.value = map;
  }

  async function trackStep(module: ModuleJourneyKey, baseRouteName: string, params: Record<string, string>) {
    const steps = MODULE_JOURNEYS[module];
    const stepIndex = steps.findIndex((step) => step.routeNames.includes(baseRouteName));
    if (stepIndex === -1) return;

    const { data, success } = await http.put(`/user/journey-progress/${module}`, {
      route_name: baseRouteName,
      params,
      step_index: stepIndex + 1,
      step_count: steps.length,
    });
    if (success) journeys.value[module] = data;
  }

  return {
    journeys,
    fetchJourneys,
    trackStep,
  };
});
