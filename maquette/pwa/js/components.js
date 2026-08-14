/** Shared UI fragments for the Qiryna PWA (trust bar, pagination). */

function assetBase() {
  return window.location.pathname.includes("/pages/") ? "../assets/icons" : "./assets/icons";
}

/**
 * Trust / reassurance strip (Paiement · Accompagnement · Satisfaction).
 * Two vertical separators between the three items (Figma).
 */
export function renderTrustBar({ base = assetBase() } = {}) {
  return `
<aside class="q-trust" aria-label="Garanties">
  <div class="q-trust__item q-trust__item--shield">
    <img class="q-trust__icon" src="${base}/ic-trust-shield.svg" alt="" width="40" height="40" />
    <p class="q-trust__label">Paiement&nbsp;<br />sécurisé</p>
  </div>
  <span class="q-trust__sep" aria-hidden="true"></span>
  <div class="q-trust__item q-trust__item--laurel">
    <span class="q-trust__laurel">
      <img src="${base}/ic-trust-laurel.svg" alt="" width="24" height="24" />
    </span>
    <p class="q-trust__label">Accompagnement&nbsp;<br />garanti</p>
  </div>
  <span class="q-trust__sep" aria-hidden="true"></span>
  <div class="q-trust__item q-trust__item--smile">
    <img class="q-trust__icon" src="${base}/ic-trust-smile.svg" alt="" width="40" height="40" />
    <p class="q-trust__label">Satisfaction&nbsp;<br />garantie</p>
  </div>
</aside>`.trim();
}

/**
 * Numbered page controls: ‹ 1 2 3 4 ›
 * @param {{ pages?: number, current?: number, base?: string }} opts
 */
export function renderPagination({
  pages = 4,
  current = 1,
  base = assetBase(),
} = {}) {
  const total = Math.max(1, Number(pages) || 1);
  const active = Math.min(total, Math.max(1, Number(current) || 1));
  const nums = Array.from({ length: total }, (_, i) => i + 1)
    .map((n) => {
      const on = n === active;
      return `<button type="button" class="q-pager__btn${on ? " is-active" : ""}"${on ? ' aria-current="page"' : ""} data-page="${n}">${n}</button>`;
    })
    .join("");

  return `
<nav class="q-pager" aria-label="Pagination" data-pages="${total}" data-current="${active}">
  <button type="button" class="q-pager__btn q-pager__btn--prev" aria-label="Page précédente" data-page-prev>
    <img src="${base}/ic-le-page-prev.svg" alt="" width="20" height="20" />
  </button>
  ${nums}
  <button type="button" class="q-pager__btn q-pager__btn--next" aria-label="Page suivante" data-page-next>
    <img src="${base}/ic-le-page-next.svg" alt="" width="20" height="20" />
  </button>
</nav>`.trim();
}

/** Replace [data-trust-bar] and [data-pagination] placeholders in the document. */
export function mountComponents(root = document) {
  root.querySelectorAll("[data-trust-bar]").forEach((el) => {
    const wrap = document.createElement("div");
    wrap.innerHTML = renderTrustBar();
    el.replaceWith(wrap.firstElementChild);
  });

  root.querySelectorAll("[data-pagination]").forEach((el) => {
    const pages = Number(el.getAttribute("data-pages") || 4);
    const current = Number(el.getAttribute("data-current") || 1);
    const wrap = document.createElement("div");
    wrap.innerHTML = renderPagination({ pages, current });
    el.replaceWith(wrap.firstElementChild);
  });
}
