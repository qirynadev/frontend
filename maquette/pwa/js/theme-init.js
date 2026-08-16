(function () {
  var KEY = "qiryna-theme";
  var META = { light: "#582cfd", dark: "#151820" };

  function getPref() {
    return localStorage.getItem(KEY) || "clair";
  }

  function resolve(preference) {
    if (preference === "sombre") return "dark";
    if (preference === "systeme") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  }

  function apply() {
    var pref = getPref();
    var resolved = resolve(pref);
    document.documentElement.setAttribute("data-theme-pref", pref);
    document.documentElement.setAttribute("data-theme", resolved);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", META[resolved] || META.light);
  }

  apply();

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
    if (getPref() === "systeme") apply();
  });
})();
