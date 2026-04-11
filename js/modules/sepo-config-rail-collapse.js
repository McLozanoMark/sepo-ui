(function () {
  const LAYOUT_ID = "sepoConfigLayout";
  const TOGGLE_ID = "sepoConfigRailToggle";
  const STORAGE_KEY = "sepo-config-rail-collapsed";

  function getLayout() {
    return document.getElementById(LAYOUT_ID);
  }

  function getToggle() {
    return document.getElementById(TOGGLE_ID);
  }

  function applyState(collapsed) {
    const layout = getLayout();
    const toggle = getToggle();
    if (!layout || !toggle) return;

    layout.classList.toggle("sepo-config-compact", collapsed);
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.setAttribute(
      "aria-label",
      collapsed
        ? "Expandir progreso de configuración"
        : "Encoger progreso de configuración"
    );
    toggle.setAttribute(
      "title",
      collapsed ? "Expandir progreso" : "Encoger progreso"
    );
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch (_) {}
  }

  window.toggleSepoConfigRail = function toggleSepoConfigRail(force) {
    const layout = getLayout();
    if (!layout) return;
    const nextState =
      typeof force === "boolean"
        ? force
        : !layout.classList.contains("sepo-config-compact");
    applyState(nextState);
  };

  function initRail() {
    const layout = getLayout();
    if (!layout) return;

    document
      .querySelectorAll("#stepperNav .sepo-config-step-item")
      .forEach((item) => {
        item.setAttribute("tabindex", "0");
        const label = item.getAttribute("data-sepo-step-label") || "Paso";
        item.setAttribute("title", label);
        item.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            item.click();
          }
        });
      });

    let collapsed = false;
    try {
      collapsed = localStorage.getItem(STORAGE_KEY) === "1";
    } catch (_) {}
    applyState(collapsed);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRail, { once: true });
  } else {
    initRail();
  }
})();
