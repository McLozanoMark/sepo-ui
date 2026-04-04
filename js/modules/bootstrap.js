/* ========================================== */
/* ACTUALIZACION: BOOTSTRAP GENERAL SEPO      */
/* ========================================== */
(function (window, document) {
  "use strict";

  const THEME_STORAGE_KEY = "sepo_visual_config_v1";
  const DEFAULT_VISUAL_CONFIG = { theme: "classic", mode: "light" };

  function runSepoEnhancers(root) {
    if (!window.SEPO) return;
    if (window.SEPO.components.accordion) {
      window.SEPO.components.accordion.init(root || document);
    }
    if (window.SEPO.components.typeahead) {
      window.SEPO.components.typeahead.init(root || document);
    }
    if (window.SEPO.components.switch) {
      window.SEPO.components.switch.autoInit(root || document);
    }
  }

  function getSavedVisualConfig() {
    try {
      const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (!raw) return { ...DEFAULT_VISUAL_CONFIG };
      const parsed = JSON.parse(raw);
      const theme = ["classic", "purple", "dalton"].includes(parsed.theme)
        ? parsed.theme
        : DEFAULT_VISUAL_CONFIG.theme;
      const mode = ["light", "dark"].includes(parsed.mode)
        ? parsed.mode
        : DEFAULT_VISUAL_CONFIG.mode;
      return { theme, mode };
    } catch (error) {
      return { ...DEFAULT_VISUAL_CONFIG };
    }
  }

  function saveVisualConfig(config) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config));
    } catch (error) {}
  }

  function syncVisualForm(config) {
    const modeInput = document.querySelector(
      'input[name="sepoColorMode"][value="' + config.mode + '"]'
    );
    const themeInput = document.querySelector(
      'input[name="sepoUiTheme"][value="' + config.theme + '"]'
    );
    if (modeInput) modeInput.checked = true;
    if (themeInput) themeInput.checked = true;

    document
      .querySelectorAll(".config-theme-card")
      .forEach((card) => card.classList.remove("active-visual-card"));
    const activeCard = document.querySelector(
      '.config-theme-card[data-theme-card="' + config.theme + '"]'
    );
    if (activeCard) activeCard.classList.add("active-visual-card");
  }

  function applyVisualConfig(config, shouldPersist) {
    const safeConfig = {
      theme: ["classic", "purple", "dalton"].includes(config && config.theme)
        ? config.theme
        : DEFAULT_VISUAL_CONFIG.theme,
      mode: ["light", "dark"].includes(config && config.mode)
        ? config.mode
        : DEFAULT_VISUAL_CONFIG.mode,
    };

    document.body.setAttribute("data-theme", safeConfig.theme);
    document.body.setAttribute("data-mode", safeConfig.mode);
    syncVisualForm(safeConfig);

    if (shouldPersist !== false) {
      saveVisualConfig(safeConfig);
    }
  }

  function bindVisualConfigEvents() {
    document.querySelectorAll('input[name="sepoColorMode"]').forEach((input) => {
      input.addEventListener("change", function () {
        const current = getSavedVisualConfig();
        applyVisualConfig({ theme: current.theme, mode: this.value }, true);
      });
    });

    document.querySelectorAll('input[name="sepoUiTheme"]').forEach((input) => {
      input.addEventListener("change", function () {
        const current = getSavedVisualConfig();
        applyVisualConfig({ theme: this.value, mode: current.mode }, true);
      });
    });
  }

  window.abrirConfiguracionVisual = function abrirConfiguracionVisual() {
    const modalEl = document.getElementById("modalConfiguracionVisual");
    if (!modalEl || !window.bootstrap) return;
    syncVisualForm(getSavedVisualConfig());
    const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  };

  window.restablecerConfiguracionVisual = function restablecerConfiguracionVisual() {
    applyVisualConfig({ ...DEFAULT_VISUAL_CONFIG }, true);
    if (typeof window.showToast === "function") {
      window.showToast("Configuración visual restablecida.");
    }
  };

  const MODAL_BASE_Z = 1055;
  const MODAL_STEP_Z = 20;

  function moveModalsToBody() {
    document.querySelectorAll(".modal").forEach(function (modalEl) {
      if (modalEl.parentElement !== document.body) {
        document.body.appendChild(modalEl);
      }
    });
  }

  function getVisibleModals() {
    return Array.from(document.querySelectorAll('.modal.show'));
  }

  function getModalLevel(modalEl) {
    const level = Number(modalEl && modalEl.dataset && modalEl.dataset.sepoModalLevel);
    return Number.isFinite(level) && level > 0 ? level : 1;
  }

  function assignBackdropToModal(modalEl) {
    const backdrops = Array.from(document.querySelectorAll('.modal-backdrop.show'));
    if (!backdrops.length) return;
    const modalLevel = getModalLevel(modalEl);
    const targetBackdrop = backdrops.find(function (backdrop) {
      return !backdrop.dataset.sepoModalBound;
    }) || backdrops[backdrops.length - 1];
    if (!targetBackdrop) return;
    targetBackdrop.dataset.sepoModalBound = modalEl.id || 'sepo-modal';
    targetBackdrop.dataset.sepoModalLevel = String(modalLevel);
    targetBackdrop.style.zIndex = String(MODAL_BASE_Z + (modalLevel * MODAL_STEP_Z) - 10);
    targetBackdrop.classList.add('sepo-managed-backdrop');
  }

  function syncModalLayer(modalEl) {
    const level = getModalLevel(modalEl);
    modalEl.style.zIndex = String(MODAL_BASE_Z + (level * MODAL_STEP_Z));
    modalEl.classList.add('sepo-managed-modal');
    assignBackdropToModal(modalEl);
  }

  function refreshOpenModalState() {
    const visible = getVisibleModals();
    if (visible.length) {
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('padding-right');
      document.querySelectorAll('.modal-backdrop').forEach(function (backdrop) {
        if (!backdrop.classList.contains('show')) backdrop.remove();
      });
    }
  }

  function bindGlobalModalManager() {
    document.addEventListener('show.bs.modal', function (event) {
      const modalEl = event.target;
      if (!modalEl || !modalEl.classList.contains('modal')) return;
      moveModalsToBody();
      const level = getVisibleModals().length + 1;
      modalEl.dataset.sepoModalLevel = String(level);
      syncModalLayer(modalEl);
    });

    document.addEventListener('shown.bs.modal', function (event) {
      const modalEl = event.target;
      if (!modalEl || !modalEl.classList.contains('modal')) return;
      syncModalLayer(modalEl);
      refreshOpenModalState();
      runSepoEnhancers(modalEl || document);
    });

    document.addEventListener('hidden.bs.modal', function (event) {
      const modalEl = event.target;
      if (!modalEl || !modalEl.classList.contains('modal')) return;
      const modalId = modalEl.id || '';
      modalEl.style.removeProperty('z-index');
      modalEl.classList.remove('sepo-managed-modal');
      delete modalEl.dataset.sepoModalLevel;
      document.querySelectorAll('.modal-backdrop').forEach(function (backdrop) {
        if (backdrop.dataset.sepoModalBound === modalId && !backdrop.classList.contains('show')) {
          backdrop.remove();
        }
      });
      window.setTimeout(refreshOpenModalState, 20);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyVisualConfig(getSavedVisualConfig(), false);
    bindVisualConfigEvents();
    moveModalsToBody();
    bindGlobalModalManager();

    if (!window.SEPO) return;
    window.SEPO.init();
    runSepoEnhancers(document);
  });

  document.addEventListener("sepo:refresh", function (event) {
    runSepoEnhancers((event && event.detail && event.detail.root) || document);
  });
})(window, document);
