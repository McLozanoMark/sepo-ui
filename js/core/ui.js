/* ========================================== */
/* ACTUALIZACION: UTILIDADES UI REUTILIZABLES */
/* ========================================== */
(function (window, document) {
  "use strict";
  if (!window.SEPO) return;

  const UI = {
    toast(message, type = "info") {
      if (typeof window.showToast === "function") {
        return window.showToast(message, type);
      }
      console.log("[SEPO toast][" + type + "] " + message);
    },
    toggleDisabled(target, disabled) {
      if (!target) return;
      target.disabled = !!disabled;
      target.classList.toggle("is-disabled", !!disabled);
    },
    setVisible(target, visible) {
      if (!target) return;
      target.style.display = visible ? "" : "none";
    },
  };

  window.SEPO.registerModule("ui", UI);
})(window, document);