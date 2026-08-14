import { renderBottomNav } from "./icons.js";

const navMount = document.querySelector("[data-bottom-nav]");
if (navMount) {
  navMount.innerHTML = renderBottomNav(navMount.dataset.active || "compte");
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swPath = window.location.pathname.includes("/pages/") ? "../sw.js" : "./sw.js";
    navigator.serviceWorker.register(swPath).catch(() => {});
  });
}
