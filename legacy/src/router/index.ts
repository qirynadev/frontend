import { createRouter, createWebHistory } from "vue-router";
import { buildRoutes } from "./routes";
import { useAuthStore, useAppStore, useJourneyStore } from "@/stores";
import { i18nRoute } from "@/utils";
import Tr from "@/i18n/translation";
import { findModuleStep } from "@/config/moduleJourneys";

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes: [
    // default routes
    {
      path: "/",
      name: "",
      component: () => import("@/layout/AppLayout.vue"),
      children: [...buildRoutes("fr"), ...buildRoutes("en")],
      beforeEnter: Tr.routeMiddleware,
    },
    /* Coming soon / Maintenance — affichée quand la restriction d'IP est active.
       Volontairement hors AppLayout et sans routeMiddleware : pas de nav/footer
       ni d'appel /all-data (qui renverrait 403 et boucle). */
    {
      path: "/maintenance",
      name: "maintenance",
      component: () => import("@/pages/Maintenance/Index.vue"),
    },
    /* 404 */
    {
      path: "/:catchAll(.*)",
      name: "404",
      component: () => import("@/pages/NotFound/Index.vue"),
      beforeEnter: Tr.routeMiddleware,
    },
  ],
  scrollBehavior() {
    // always scroll to top
    return { top: 0 };
  },
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const appStore = useAppStore();

  // Filet de sécurité : si la restriction d'IP est active (flag levé par
  // refreshData sur un 403), toute navigation hors « maintenance » y est renvoyée.
  if (appStore.isAccessRestricted && to.name !== "maintenance") {
    return next({ name: "maintenance" });
  }

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!authStore.token) {
      next(i18nRoute({ name: "signin", query: { redirect: to.fullPath } }));
    } else {
      next();
    }
  } else {
    next();
  }
});

// Tracking silencieux de la progression dans les tunnels École/Cours/MBA/Living/Profilage
// (compte connecté uniquement — les visiteurs non connectés ne sont pas suivis ici).
// Ne bloque jamais la navigation : erreurs réseau avalées par HttpService, appel non-awaité.
router.afterEach((to) => {
  const authStore = useAuthStore();
  if (!authStore.token) return;

  const routeName = typeof to.name === "string" ? to.name : "";
  const baseRouteName = routeName.split(".").slice(1).join(".");
  if (!baseRouteName) return;

  const match = findModuleStep(baseRouteName);
  if (!match) return;

  const journeyStore = useJourneyStore();
  journeyStore.trackStep(match.module, baseRouteName, to.params as Record<string, string>);
});

export default router;
