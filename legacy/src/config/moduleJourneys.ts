/**
 * Déclaration générique des tunnels "parcours" trackés pour la reprise de progression
 * utilisateur (compte connecté uniquement). Ajouter un module = ajouter une entrée ici,
 * aucun autre code à toucher (voir stores/journey et router/index.ts).
 *
 * routeNames : noms de route SANS préfixe locale (ex. "schools", pas "fr.schools").
 * Plusieurs noms possibles pour une même étape quand des chemins alternatifs mènent au
 * même contenu (ex. Cours : choix manuel du prof vs finalisation directe).
 *
 * Les pages "annexes" (mentors, listes de profs, etc.) ne sont volontairement pas
 * déclarées ici : elles ne doivent pas modifier la progression enregistrée.
 */

export type ModuleJourneyKey = "school" | "course" | "mba" | "living" | "profilage";

export type ModuleJourneyStep = {
  routeNames: string[];
  paramsKeys: string[];
};

export const MODULE_JOURNEYS: Record<ModuleJourneyKey, ModuleJourneyStep[]> = {
  school: [
    { routeNames: ["destinations"], paramsKeys: ["slug"] },
    { routeNames: ["schools"], paramsKeys: ["slug", "areaslug"] },
    { routeNames: ["school-presentation"], paramsKeys: ["slug", "areaslug", "schoolslug"] },
  ],
  course: [
    { routeNames: ["courses"], paramsKeys: ["slug"] },
    { routeNames: ["courses-formulas"], paramsKeys: ["slug"] },
    { routeNames: ["teachers"], paramsKeys: ["slug"] },
    { routeNames: ["courses-finalize", "teacher-presentation"], paramsKeys: ["slug"] },
  ],
  mba: [
    { routeNames: ["mba"], paramsKeys: ["slug"] },
    { routeNames: ["mba-school-presentation"], paramsKeys: ["slug", "schoolslug"] },
    { routeNames: ["mba-formula"], paramsKeys: ["slug"] },
  ],
  living: [
    { routeNames: ["living-choose-destination"], paramsKeys: [] },
    { routeNames: ["living"], paramsKeys: ["slug"] },
    { routeNames: ["living-detail"], paramsKeys: ["slug", "expenseslug"] },
    { routeNames: ["living-formulas"], paramsKeys: [] },
  ],
  profilage: [
    { routeNames: ["profilage"], paramsKeys: [] },
    { routeNames: ["profilage-detail"], paramsKeys: ["slug"] },
    { routeNames: ["profilage-formulas"], paramsKeys: [] },
  ],
};

/**
 * Retrouve le module et l'index d'étape (0-based) correspondant à un nom de route de base.
 * Retourne null si la route n'est pas une étape trackée (ex. page annexe ou chooser sans cible).
 */
export function findModuleStep(
  baseRouteName: string,
): { module: ModuleJourneyKey; stepIndex: number; stepCount: number } | null {
  for (const [module, steps] of Object.entries(MODULE_JOURNEYS) as [ModuleJourneyKey, ModuleJourneyStep[]][]) {
    const stepIndex = steps.findIndex((step) => step.routeNames.includes(baseRouteName));
    if (stepIndex !== -1) {
      return { module, stepIndex, stepCount: steps.length };
    }
  }
  return null;
}
