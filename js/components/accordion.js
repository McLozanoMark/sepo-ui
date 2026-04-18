/* ========================================== */
/* ACTUALIZACION: COMPONENTE ACORDEON BASE    */
/* ========================================== */
(function (window, document) {
  "use strict";
  if (!window.SEPO) return;

  const Accordion = {
    init(root = document) {
      root.querySelectorAll("[data-sepo-accordion]").forEach((item) => {
        item.setAttribute("data-sepo-ready", "true");
      });
    },
    toggle(card) {
      if (!card) return;
      card.classList.toggle("is-collapsed");
    },
  };

  window.SEPO.registerComponent("accordion", Accordion);

  document.addEventListener("click", function (event) {
    const trigger = event.target.closest("[data-sepo-accordion-trigger]");
    if (!trigger) return;
    const card = trigger.closest("[data-sepo-accordion]");
    if (card) Accordion.toggle(card);
  });
})(window, document);