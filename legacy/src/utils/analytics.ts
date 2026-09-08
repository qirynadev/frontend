// Google Analytics 4 (gtag) avec Google Consent Mode v2.
//
// Principe (détection Google + RGPD) :
//   - La balise gtag est chargée DÈS qu'un ID de mesure est disponible
//     (settings.site.ga_id servi par /all-data, sinon VITE_GA_ID), pour que
//     Google détecte la balise sur le site.
//   - Le consentement est par défaut "denied" (Consent Mode v2) → aucun cookie
//     ni stockage analytics tant que l'utilisateur n'a pas accepté la bannière.
//   - À l'acceptation des cookies → consentement "granted" (tracking complet).

import { useAppStore } from "@/stores";

const ENV_GA_ID = import.meta.env.VITE_GA_ID as string | undefined;
// Tag injecté statiquement dans index.html (id "ga-gtag") pour la détection Google.
// Sert d'ultime repli si aucun ID runtime/env n'est disponible, afin que le suivi
// SPA (page_view manuels) et le consentement restent opérationnels.
const STATIC_GA_ID = "G-JBVXJXX9HQ";
const CONSENT_KEY = "qiryna_cookie_consent";

let loaded = false;

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export function hasAnalyticsConsent(): boolean {
  return localStorage.getItem(CONSENT_KEY) === "accepted";
}

/** ID de mesure : back-office (runtime) prioritaire, puis variable d'env (build). */
function resolveGaId(): string | undefined {
  try {
    const appStore = useAppStore();
    const runtimeId = (appStore.settings as any)?.site?.ga_id;
    if (runtimeId) return runtimeId as string;
  } catch {
    // store non disponible (init très précoce) → fallback env / statique
  }
  return ENV_GA_ID || STATIC_GA_ID || undefined;
}

function loadGtagScript(id: string): void {
  if (document.getElementById("ga-gtag")) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };

  // Consent Mode v2 : tout refusé par défaut (aucun cookie/stockage avant accord)
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500,
  });

  // Si l'utilisateur avait déjà accepté lors d'une visite précédente
  if (hasAnalyticsConsent()) {
    grantConsent();
  }

  const script = document.createElement("script");
  script.id = "ga-gtag";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());
  // send_page_view: false → on envoie les vues manuellement (routeur SPA)
  window.gtag("config", id, { send_page_view: false });
}

/**
 * Charge la balise GA dès qu'un ID est disponible (consentement denied par défaut).
 * Idempotent — peut être rappelé tant que l'ID n'est pas encore connu (chargement async).
 */
export function initAnalytics(): void {
  if (loaded) return;
  const id = resolveGaId();
  if (!id) return;

  loadGtagScript(id);
  loaded = true;

  // Si le tag a été injecté statiquement (index.html), loadGtagScript sort tôt
  // et ne réapplique pas le consentement d'une visite précédente : on le fait ici.
  if (hasAnalyticsConsent()) grantConsent();
}

/** Autorise le stockage/tracking analytics (à l'acceptation des cookies). */
export function grantConsent(): void {
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
    });
  }
}

/** Refuse le stockage/tracking analytics (au refus des cookies). */
export function denyConsent(): void {
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    });
  }
}

/** À appeler à l'acceptation des cookies. */
export function enableAnalytics(): void {
  initAnalytics();
  grantConsent();
  trackPageView(window.location.pathname + window.location.search, document.title);
}

/**
 * Envoie une vue de page (router.afterEach). Retente l'init si l'ID n'était pas
 * encore disponible (settings chargés de façon asynchrone).
 */
export function trackPageView(path: string, title?: string): void {
  if (!loaded) initAnalytics();
  if (!loaded || typeof window.gtag !== "function") return;

  window.gtag("event", "page_view", {
    page_path: path,
    page_title: title ?? document.title,
    page_location: window.location.origin + path,
  });
}
