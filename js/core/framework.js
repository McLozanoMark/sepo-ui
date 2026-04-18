/* ========================================== */
/* ACTUALIZACION: MINI FRAMEWORK INTERNO SEPO */
/* ========================================== */
(function (window, document) {
  "use strict";

  const SEPO = {
    version: "1.0.0",
    modules: {},
    components: {},
    store: {
      state: {},
      set(key, value) {
        this.state[key] = value;
        return value;
      },
      get(key, fallback = null) {
        return Object.prototype.hasOwnProperty.call(this.state, key)
          ? this.state[key]
          : fallback;
      },
    },
    dom: {
      q(selector, root = document) {
        return root.querySelector(selector);
      },
      qa(selector, root = document) {
        return Array.from(root.querySelectorAll(selector));
      },
      on(target, event, handler, options) {
        if (target) target.addEventListener(event, handler, options || false);
      },
      delegate(root, eventName, selector, handler) {
        if (!root) return;
        root.addEventListener(eventName, function (event) {
          const match = event.target.closest(selector);
          if (match && root.contains(match)) {
            handler.call(match, event, match);
          }
        });
      },
    },
    registerModule(name, api) {
      this.modules[name] = api || {};
      return this.modules[name];
    },
    registerComponent(name, api) {
      this.components[name] = api || {};
      return this.components[name];
    },
    init() {
      document.dispatchEvent(new CustomEvent("sepo:framework:ready", { detail: this }));
    },
  };

  window.SEPO = SEPO;
})(window, document);