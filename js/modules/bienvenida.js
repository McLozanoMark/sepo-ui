(function (window, document) {
  "use strict";

  const BienvenidaModule = {
    start() {
      if (typeof window.go === "function") {
        window.go("pruebas");
        window.location.hash = "pruebas";
      }
    },
    exit() {
      if (typeof window.go === "function") {
        window.go("dashboard");
        window.location.hash = "dashboard";
      }
    },
    init() {
      const hasHash = !!(window.location.hash || "").replace(/^#/, "").trim();
      if (!hasHash && typeof window.go === "function") {
        window.go("bienvenida");
      }
    },
  };

  window.BienvenidaModule = BienvenidaModule;
  document.addEventListener("DOMContentLoaded", function () {
    BienvenidaModule.init();
  });
})(window, document);
