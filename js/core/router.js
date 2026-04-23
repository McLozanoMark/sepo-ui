/* ========================================== */
/* ACTUALIZACION: ROUTER Y NAVEGACION INTERNA */
/* ========================================== */
(function (window, document) {
  "use strict";
  if (!window.SEPO) return;

  const Router = {
    screensSelector: ".screen",
    navSelector: ".nav-link",
    show(screenId) {
      const screens = document.querySelectorAll(this.screensSelector);
      const navs = document.querySelectorAll(this.navSelector);
      screens.forEach((screen) => screen.classList.remove("active"));
      navs.forEach((link) => link.classList.remove("active"));

      const screen = document.getElementById("screen-" + screenId);
      const nav = document.getElementById("nav-" + screenId);

      if (screen) screen.classList.add("active");
      if (nav) nav.classList.add("active");
      window.SEPO.store.set("currentScreen", screenId);
      document.dispatchEvent(new CustomEvent("sepo:screen:change", { detail: { screenId } }));
    },
    current() {
      return window.SEPO.store.get("currentScreen", null);
    },
  };

  window.SEPO.registerModule("router", Router);
})(window, document);