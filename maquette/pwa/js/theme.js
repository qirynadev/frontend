export const THEME_KEY = "qiryna-theme";

export const THEME_LABELS = {
  clair: "Clair",
  sombre: "Sombre",
  systeme: "Système",
};

const META_COLORS = {
  light: "#582cfd",
  dark: "#151820",
};

let mediaListener;

/** @param {"clair"|"sombre"|"systeme"} preference */
export function resolveTheme(preference) {
  if (preference === "sombre") return "dark";
  if (preference === "systeme") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

function updateMetaThemeColor(resolved) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", META_COLORS[resolved] || META_COLORS.light);
}

/**
 * @param {"clair"|"sombre"|"systeme"} preference
 * @param {{ persist?: boolean }} [opts]
 */
export function applyTheme(preference, { persist = true } = {}) {
  const pref = THEME_LABELS[preference] ? preference : "clair";
  if (persist) localStorage.setItem(THEME_KEY, pref);

  const resolved = resolveTheme(pref);
  document.documentElement.setAttribute("data-theme-pref", pref);
  document.documentElement.setAttribute("data-theme", resolved);
  updateMetaThemeColor(resolved);
  bindSystemListener(pref);
  return resolved;
}

export function getStoredPreference() {
  const stored = localStorage.getItem(THEME_KEY) || "clair";
  return THEME_LABELS[stored] ? stored : "clair";
}

function bindSystemListener(preference) {
  if (mediaListener) {
    mediaListener.mql.removeEventListener("change", mediaListener.handler);
    mediaListener = null;
  }

  if (preference !== "systeme") return;

  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => applyTheme("systeme", { persist: false });
  mql.addEventListener("change", handler);
  mediaListener = { mql, handler };
}

export function initTheme() {
  applyTheme(getStoredPreference(), { persist: false });
}
