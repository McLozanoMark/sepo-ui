/* ========================================== */
/* ACTUALIZACION: COMPONENTE SWITCH BASE      */
/* ACTUALIZACION: REINICIALIZACION SEGURA     */
/* ========================================== */
(function (window, document) {
  "use strict";
  if (!window.SEPO) return;

  const Switch = {
    bindPair(toggle, target) {
      if (!toggle || !target || toggle.dataset.sepoSwitchBound === "1") return;
      const sync = () => {
        target.disabled = !toggle.checked;
      };
      toggle.addEventListener("change", sync);
      toggle.dataset.sepoSwitchBound = "1";
      sync();
    },
    autoInit(root = document) {
      root.querySelectorAll("[data-switch-target]").forEach((toggle) => {
        const selector = toggle.getAttribute("data-switch-target");
        const target = root.querySelector(selector) || document.querySelector(selector);
        if (target) this.bindPair(toggle, target);
      });

      root.querySelectorAll(".prest-codigo-row .form-check-input").forEach((toggle) => {
        const row = toggle.closest(".prest-codigo-row");
        const target = row && row.querySelector(".prest-factor-select");
        if (target) this.bindPair(toggle, target);
      });
    },
  };

  window.SEPO.registerComponent("switch", Switch);
})(window, document);