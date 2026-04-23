/* ========================================== */
/* ACTUALIZACION: COMPONENTE TYPEAHEAD BASE   */
/* ACTUALIZACION: SOPORTE A LISTA FLOTANTE    */
/* ========================================== */
(function (window, document) {
  "use strict";
  if (!window.SEPO) return;

  const Typeahead = {
    ensureMenu(input) {
      if (!input) return null;
      let menu = input.parentElement && input.parentElement.querySelector(".sepo-typeahead-menu");
      if (!menu) {
        menu = document.createElement("div");
        menu.className = "sepo-typeahead-menu";
        menu.style.cssText = "position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:1065;background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 12px 28px rgba(15,23,42,.12);padding:6px;display:none;max-height:240px;overflow:auto;";
        const wrap = input.parentElement;
        if (wrap && getComputedStyle(wrap).position === "static") wrap.style.position = "relative";
        wrap && wrap.appendChild(menu);
      }
      return menu;
    },
    init(root = document) {
      root.querySelectorAll("[data-sepo-typeahead]").forEach((input) => {
        input.setAttribute("autocomplete", "off");
        this.ensureMenu(input);
      });
    },
  };

  window.SEPO.registerComponent("typeahead", Typeahead);
})(window, document);