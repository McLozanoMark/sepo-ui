/* ================================================ */
/* ACTUALIZACION: CORRECCIONES DE REGRESIONES       */
/* ACTUALIZACION: ESTABILIZAR EDICION DE PREGUNTAS  */
/* ACTUALIZACION: RESTAURAR SUGERENCIAS DE FICHAS   */
/* ================================================ */
(function (window, document) {
  "use strict";

  function q(sel, root) { return (root || document).querySelector(sel); }
  function qa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function safeText(el) {
    return (el && (el.innerText || el.textContent) || "").toLowerCase().trim();
  }

  function ensureOpenQuestionVineta() {
    return;
  }

  function syncPreguntaVisualState() {
    try {
      if (q("#mp_A_tipoDato") && typeof window.ctrlAbierta === "function") window.ctrlAbierta();
    } catch (_) {}
    try {
      if (q("#mp_C_tipoDato") && typeof window.ctrlCerrada === "function") window.ctrlCerrada();
    } catch (_) {}

    const tipoVistaA = q("#mp_A_tipoVista");
    const boxNumColA = q("#mp_A_boxNumCol");
    if (tipoVistaA && boxNumColA) boxNumColA.style.display = tipoVistaA.value === "3" ? "block" : "none";

    const tipoVistaC = q("#mp_C_tipoVista");
    const boxNumColC = q("#mp_C_boxNumCol");
    if (tipoVistaC && boxNumColC) boxNumColC.style.display = tipoVistaC.value === "3" ? "block" : "none";

    if (typeof window.renumerarContenedor === "function") {
      if (q("#mp_A_alternativas_box")) window.renumerarContenedor("#mp_A_alternativas_box");
      if (q("#mp_C_alternativas_box")) window.renumerarContenedor("#mp_C_alternativas_box");
    }
  }


  function ensureFichaSearchUI() {
    const input = q("#inputBuscarFichaPrestacion");
    const list = q("#listaFichasPrestacion");
    if (!input || !list) return null;

    const wrap = input.closest(".search-wrap") || input.parentElement;
    if (wrap) wrap.style.position = "relative";

    let menu = q("#sepoFichaMenu");
    if (!menu) {
      menu = document.createElement("div");
      menu.id = "sepoFichaMenu";
      menu.style.position = "absolute";
      menu.style.left = "0";
      menu.style.right = "0";
      menu.style.top = "calc(100% + 6px)";
      menu.style.background = "#fff";
      menu.style.border = "1px solid #dbe4f0";
      menu.style.borderRadius = "12px";
      menu.style.boxShadow = "0 16px 30px rgba(15, 23, 42, 0.10)";
      menu.style.zIndex = "2000";
      menu.style.maxHeight = "240px";
      menu.style.overflow = "auto";
      menu.style.display = "none";
      wrap.appendChild(menu);
    }

    return { input, menu, list };
  }

  function bindFichaSearch() {
    const ui = ensureFichaSearchUI();
    if (!ui) return;
    const { input, menu, list } = ui;

    const cards = () => qa(".prest-ficha-card", list);

    function labelFor(card) {
      const codeEl = q(".tag-fich", card);
      const nameEl = q(".fw-semibold", card);
      const subEl = q(".prest-ficha-subtitle", card);
      const codeTxt = codeEl ? codeEl.textContent.trim() : "Ficha";
      const nameTxt = nameEl ? nameEl.textContent.trim() : "";
      const subTxt = subEl ? subEl.textContent.trim() : "";
      return { codeTxt, nameTxt, subTxt };
    }

    function renderMenu(results, query) {
      if (!results.length) {
        menu.innerHTML = query
          ? '<div style="padding:10px 12px;color:#64748b;font-size:.9rem;">Sin resultados</div>'
          : "";
        menu.style.display = query ? "block" : "none";
        return;
      }

      menu.innerHTML = results.map((r) => {
        return `
          <button type="button"
                  class="sepo-typeahead-option"
                  data-index="${r.index}"
                  style="width:100%;border:0;background:#fff;text-align:left;padding:10px 12px;display:block;">
            <div style="font-weight:700;color:#0f172a;">${r.codeTxt}</div>
            <div style="font-size:.92rem;color:#334155;">${r.nameTxt}</div>
            <div style="font-size:.82rem;color:#64748b;">${r.subTxt}</div>
          </button>
        `;
      }).join("");
      menu.style.display = "block";
    }

    function searchAndRender(rawValue) {
      const query = String(rawValue || "").trim().toLowerCase();
      const results = [];

      cards().forEach((card, index) => {
        const haystack = safeText(card);
        const visible = !query || haystack.includes(query);
        card.style.display = visible ? "" : "none";

        if (visible && results.length < 6) {
          const meta = labelFor(card);
          results.push({ index, card, ...meta });
        }
      });

      renderMenu(results, query);
      return results;
    }

    input.onfocus = function () {
      searchAndRender(input.value);
    };

    input.oninput = function () {
      searchAndRender(input.value);
    };

    input.onkeydown = function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        const results = searchAndRender(input.value);
        if (results[0]) {
          results[0].card.classList.remove("is-collapsed");
          results[0].card.scrollIntoView({ block: "nearest", behavior: "smooth" });
          menu.style.display = "none";
        }
      } else if (e.key === "Escape") {
        menu.style.display = "none";
      }
    };

    menu.onclick = function (e) {
      const option = e.target.closest(".sepo-typeahead-option");
      if (!option) return;
      const idx = Number(option.getAttribute("data-index"));
      const card = cards()[idx];
      if (!card) return;
      card.style.display = "";
      card.classList.remove("is-collapsed");
      card.scrollIntoView({ block: "nearest", behavior: "smooth" });
      menu.style.display = "none";
    };

    if (!document.body.dataset.sepoFichaOutsideBound) {
      document.body.dataset.sepoFichaOutsideBound = "1";
      document.addEventListener("click", function (e) {
        if (e.target === input) return;
        if (menu.contains(e.target)) return;
        menu.style.display = "none";
      });
    }
  }

  function bindAccordionFallback() {
    if (document.body.dataset.sepoAccordionFallbackBound === "1") return;
    document.body.dataset.sepoAccordionFallbackBound = "1";
    document.addEventListener("click", function (e) {
      const header = e.target.closest(".prest-ficha-header");
      if (!header) return;
      if (typeof window.togglePrestacionFicha === "function") {
        window.togglePrestacionFicha(header);
      } else {
        const card = header.closest(".prest-ficha-card");
        card && card.classList.toggle("is-collapsed");
      }
    });
  }

  function bindSwitchFallback() {
    if (document.body.dataset.sepoSwitchFallbackBound === "1") return;
    document.body.dataset.sepoSwitchFallbackBound = "1";
    document.addEventListener("change", function (e) {
      const input = e.target.closest(".prest-codigo-row .form-check-input");
      if (!input) return;
      if (typeof window.toggleFactorPrestacion === "function") {
        window.toggleFactorPrestacion(input);
      } else {
        const row = input.closest(".prest-codigo-row");
        const select = row && q(".prest-factor-select", row);
        const label = row && q(".prest-switch-label", row);
        if (select) select.disabled = !input.checked;
        if (label) label.textContent = input.checked ? "Encendido" : "Apagado";
      }
    });
  }

  
  let sepoPreguntaObserver = null;
  let sepoPreguntaObserverTick = null;

  function observeDynamicChanges() {
    if (document.body.dataset.sepoPreguntaObserverBound === "1") return;
    document.body.dataset.sepoPreguntaObserverBound = "1";

    const root = q("#mpContenedorPregunta") || document.body;
    if (!root) return;

    sepoPreguntaObserver = new MutationObserver(function () {
      if (sepoPreguntaObserverTick) {
        clearTimeout(sepoPreguntaObserverTick);
      }
      sepoPreguntaObserverTick = setTimeout(function () {
        ensureOpenQuestionVineta();
        syncPreguntaVisualState();
        bindFichaSearch();
      }, 30);
    });

    sepoPreguntaObserver.observe(root, { childList: true, subtree: true });
  }


  function bindPreguntaButtonsFallback() {
    if (document.body.dataset.sepoPreguntaFallbackBound === "1") return;
    document.body.dataset.sepoPreguntaFallbackBound = "1";
    document.addEventListener("click", function (e) {
      const btn = e.target.closest("#boxPreg button");
      if (!btn) return;
      const row = btn.closest(".item-row");
      if (!row) return;
      const icon = btn.querySelector("i");
      const iconCls = icon ? icon.className : "";
      const title = (btn.getAttribute("title") || "").toLowerCase();

      if (title.includes("editar") || iconCls.includes("fa-pen")) {
        if (btn.dataset.sepoEditing === "1") return;
        btn.dataset.sepoEditing = "1";
        e.preventDefault();
        e.stopPropagation();
        try {
          if (typeof window.editarPreguntaRow === "function") {
            window.editarPreguntaRow(btn);
          }
        } finally {
          setTimeout(function () {
            btn.dataset.sepoEditing = "0";
          }, 300);
        }
        return;
      }

      if (title.includes("clonar") || iconCls.includes("fa-copy")) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.duplicarPregunta === "function") {
          window.duplicarPregunta(btn);
        }
        return;
      }

      if (title.includes("eliminar") || iconCls.includes("fa-trash")) {
        e.preventDefault();
        e.stopPropagation();
        row.remove();
        if (typeof window.renumerarContenedor === "function") {
          window.renumerarContenedor("#boxPreg");
        }
      }
    });
  }


  function initRegressionFixes() {
    ensureOpenQuestionVineta();
    syncPreguntaVisualState();
    bindFichaSearch();
    bindAccordionFallback();
    bindSwitchFallback();
    bindPreguntaButtonsFallback();
    observeDynamicChanges();
  }

  document.addEventListener("DOMContentLoaded", initRegressionFixes);
  document.addEventListener("shown.bs.modal", initRegressionFixes);
  document.addEventListener("sepo:screen:change", initRegressionFixes);

  window.SEPORegressionFixes = {
    initRegressionFixes,
    syncPreguntaVisualState,
    bindFichaSearch
  };
})(window, document);
