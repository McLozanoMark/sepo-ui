(function(){
  const state = {
    tab: 'preguntas',
    search: '',
    page: 1,
    pageSize: 4,
    batchMode: false,
    selected: new Set(),
    tokens: [],
    smartSearch: '',
    activeTemplateId: null,
    chosenBatchOp: '+',
    libraryOpen: false,
    inlinePopupOpen: false,
    pendingBatchIds: [],
    operatorCategory: 'basic'
  };

  const data = {
    preguntas: [
      { id:'P1', code:'RP1', title:'¿Con qué frecuencia has sentido miedo sin motivo aparente?', meta:'Indicador vinculado a ansiedad general y sensación de amenaza.' },
      { id:'P2', code:'RP2', title:'¿Te cuesta dormir por preocupaciones o pensamientos repetitivos?', meta:'Evalúa impacto del pensamiento repetitivo en el descanso.' },
      { id:'P3', code:'RP3', title:'¿Sientes tensión muscular al enfrentar situaciones cotidianas?', meta:'Permite medir activación corporal frente a demandas habituales.' },
      { id:'P4', code:'RP4', title:'¿Evitas ciertos lugares por nerviosismo o inseguridad?', meta:'Observa conductas de evitación asociadas a inseguridad o temor.' },
      { id:'P5', code:'RP5', title:'¿Te sudan las manos cuando sientes presión o nervios?', meta:'Mide una reacción fisiológica frecuente ante situaciones tensas.' },
      { id:'P6', code:'RP6', title:'¿Te resulta difícil concentrarte cuando estás preocupado?', meta:'Relacionada con atención sostenida cuando existe preocupación.' },
      { id:'P7', code:'RP7', title:'¿Te sientes agotado después de una situación estresante?', meta:'Captura desgaste posterior a un episodio de estrés.' },
      { id:'P8', code:'RP8', title:'¿Piensas en escenarios negativos antes de que ocurran?', meta:'Recoge anticipación negativa antes de que sucedan los hechos.' }
    ],
    factores: [
      { id:'F1', code:'FAC-ANS-S', title:'Ansiedad Somática', meta:'Agrupa reacciones físicas y señales corporales de ansiedad.' },
      { id:'F2', code:'FAC-ANS-C', title:'Ansiedad Cognitiva', meta:'Concentra preocupación, rumiación y pensamientos asociados.' },
      { id:'F3', code:'FAC-EST-P', title:'Estrés Percibido', meta:'Resume percepción subjetiva de sobrecarga y tensión.' },
      { id:'F4', code:'FAC-EVI', title:'Evitación Conductual', meta:'Integra comportamientos de retiro o evitación frente a estímulos.' },
      { id:'F5', code:'FAC-AUT', title:'Autocontrol Emocional', meta:'Mide regulación interna y manejo emocional del evaluado.' },
      { id:'F6', code:'FAC-ALR', title:'Estado de Alerta', meta:'Agrupa vigilancia, activación y disposición de respuesta.' }
    ],
    templates: [
      { id:'T1', title:'SUMAR 2 PREGUNTAS', desc:'Ejemplo referencial para sumar dos preguntas del instrumento.', formula:'RP1 + RP2' },
      { id:'T2', title:'PROMEDIO DE 3 PREGUNTAS', desc:'Referencia para calcular el promedio de tres preguntas.', formula:'(RP1 + RP2 + RP3) / 3' },
      { id:'T3', title:'COMPARAR DOS FACTORES', desc:'Ejemplo de comparación entre dos factores configurados.', formula:'FAC-ANS-S > FAC-EST-P' },
      { id:'T4', title:'CONDICIONAL SIMPLE', desc:'Referencia para una regla básica entre preguntas y un resultado.', formula:'SI RP1 > 2 ENTONCES RP2' }
    ]
  };

  function q(sel, root){ return (root || document).querySelector(sel); }
  function qa(sel, root){ return Array.from((root || document).querySelectorAll(sel)); }
  function byId(id){ return document.getElementById(id); }
  function root(){ return byId('sfb2Root'); }
  function showToastSafe(msg){ if (typeof window.showToast === 'function') window.showToast(msg); }

  function currentList(){ return data[state.tab]; }
  function filteredList(){
    const term = state.search.trim().toLowerCase();
    if (!term) return currentList();
    return currentList().filter(item => `${item.code} ${item.title} ${item.meta}`.toLowerCase().includes(term));
  }
  function pagedList(){
    const list = filteredList();
    const totalPages = Math.max(1, Math.ceil(list.length / state.pageSize));
    if (state.page > totalPages) state.page = totalPages;
    const start = (state.page - 1) * state.pageSize;
    return { items: list.slice(start, start + state.pageSize), totalPages, total: list.length };
  }
  function getItemById(id){ return [...data.preguntas, ...data.factores].find(i => i.id === id); }
  function isOperatorText(txt){ return ['+','-','×','÷','==','>','<','>=','<=','SI','ENTONCES'].includes(String(txt).trim()); }
  function tokenFormula(token){ return token.formula || token.code || token.text || ''; }
  function computeFormula(){
    return state.tokens.map(tokenFormula).join(' ').replace(/\s+/g, ' ').trim();
  }
  function updateFormulaField(){
    const formula = computeFormula();
    const f = byId('facFormula');
    const readonly = byId('facFormulaReadonly');
    if (f) f.value = formula;
    if (readonly) readonly.value = formula;
  }
  function scrollCanvasToEnd(){
    const canvas = byId('sfb2Canvas');
    if (!canvas) return;
    canvas.scrollLeft = canvas.scrollWidth;
  }
  function renderCanvas(){
    const stream = byId('sfb2TokenStream');
    const empty = byId('sfb2CanvasEmpty');
    if (!stream || !empty) return;
    updateFormulaField();
    empty.classList.toggle('d-none', state.tokens.length > 0);
    stream.innerHTML = state.tokens.map((token, idx) => {
      if (token.kind === 'operator') {
        return `<div class="sfb2-token sfb2-token--operator" data-index="${idx}"><button class="sfb2-token-remove" type="button" data-remove-index="${idx}" aria-label="Quitar operador">×</button><span class="sfb2-token-main">${escapeHtml(token.text)}</span></div>`;
      }
      if (token.kind === 'group') {
        return `<div class="sfb2-token sfb2-token--group" data-index="${idx}"><button class="sfb2-token-remove" type="button" data-remove-index="${idx}" aria-label="Quitar bloque">×</button><div><div class="sfb2-token-type">bloque generado</div><div class="sfb2-token-main">${escapeHtml(token.formula)}</div></div></div>`;
      }
      const showQuestionDesc = !!(byId('facMostrarDescPregunta') || {}).checked;
      const showFactorDesc = !!(byId('facMostrarDescFactor') || {}).checked;
      const showDesc = token.itemType === 'pregunta' ? showQuestionDesc : showFactorDesc;
      const typeLabel = token.itemType === 'pregunta' ? 'pregunta' : 'factor';
      return `<div class="sfb2-token sfb2-token--item" data-index="${idx}">
        <button class="sfb2-token-remove" type="button" data-remove-index="${idx}" aria-label="Quitar ${typeLabel}">×</button>
        <div>
          <div class="sfb2-token-type">${typeLabel}</div>
          <div class="sfb2-token-main">${escapeHtml(token.code)}</div>
          ${showDesc ? `<div class="sfb2-token-sub">${escapeHtml(token.title)}</div>` : ''}
        </div>
      </div>`;
    }).join('');
    requestAnimationFrame(scrollCanvasToEnd);
  }
  function renderLibrary(){
    const listEl = byId('sfb2CardList');
    const batchHint = byId('sfb2BatchHint');
    const batchActions = byId('sfb2BatchActions');
    const toggle = byId('sfb2BatchToggle');
    const operators = byId('sfb2OperatorsPanel');
    if (!listEl) return;
    const { items, totalPages, total } = pagedList();
    const footer = byId('sfb2LibraryFooter');
    const fullList = filteredList();
    const offset = (state.page - 1) * state.pageSize;
    const r = root();
    if (r) r.classList.toggle('sfb2-batch-mode', state.batchMode);
    if (!state.batchMode && state.inlinePopupOpen) closeInlineBatchPopup();
    renderLibraryPopover();
    renderInlineBatchPopup();
    if (operators) operators.classList.toggle('is-disabled', state.batchMode);
    if (toggle) toggle.classList.toggle('is-active', state.batchMode);
    if (toggle) toggle.textContent = 'Seleccionar varios';
    if (batchHint) batchHint.classList.toggle('d-none', !state.batchMode);
    if (footer) footer.classList.toggle('is-active', !!state.batchMode);
    if (batchActions) batchActions.classList.toggle('is-active', !!state.batchMode);

    if (!items.length) {
      listEl.innerHTML = `<div class="sfb2-empty-state">No se encontraron ${state.tab === 'preguntas' ? 'preguntas' : 'factores'} para esta búsqueda.</div>`;
      return;
    }

    const showQuestionDesc = !!(byId('facMostrarDescPregunta') || {}).checked;
    const showFactorDesc = !!(byId('facMostrarDescFactor') || {}).checked;
    listEl.innerHTML = items.map((item, idx) => {
      const selected = state.selected.has(item.id);
      const itemNumber = fullList.findIndex(x => x.id === item.id) + 1 || (offset + idx + 1);
      const showDesc = state.tab === 'preguntas' ? showQuestionDesc : showFactorDesc;
      return `<article class="sfb2-card ${selected ? 'is-selected' : ''} ${state.batchMode ? 'is-disabled-click' : ''}" data-id="${item.id}" data-type="${state.tab === 'preguntas' ? 'pregunta' : 'factor'}">
        <div class="sfb2-card-index">${itemNumber}</div>
        <div class="sfb2-card-content">
          <div class="sfb2-card-title">${escapeHtml(item.title)}</div>
          ${showDesc ? `<div class="sfb2-card-desc">${escapeHtml(item.meta || '')}</div>` : ''}
        </div>
        <span class="sfb2-card-check"><i class="fas fa-check"></i></span>
      </article>`;
    }).join('');
  }
  function renderTabs(){
    qa('.sfb2-tab').forEach(btn => btn.classList.toggle('is-active', btn.dataset.tab === state.tab));
  }
  function renderOperatorTabs(){
    qa('.sfb2-operator-tab').forEach(btn => btn.classList.toggle('is-active', btn.dataset.opCat === state.operatorCategory));
    qa('[data-op-panel]').forEach(panel => panel.classList.toggle('is-active', panel.dataset.opPanel === state.operatorCategory));
  }
  function renderLibraryPopover(){
    const panel = q('.sfb2-library-panel', root());
    if (!panel) return;
    panel.classList.toggle('is-open', !!state.libraryOpen);
  }
  function renderSmart(){
    const listEl = byId('sfb2SmartList');
    if (!listEl) return;
    const term = state.smartSearch.trim().toLowerCase();
    const items = data.templates.filter(t => !term || `${t.title} ${t.desc} ${t.formula}`.toLowerCase().includes(term));
    listEl.innerHTML = items.map(t => `<article class="sfb2-template ${state.activeTemplateId === t.id ? 'is-active' : ''}" data-template-id="${t.id}">
      <div class="sfb2-template-title">${escapeHtml(t.title)}</div>
      <div class="sfb2-template-desc">${escapeHtml(t.desc)}</div>
    </article>`).join('') || `<div class="sfb2-empty-state">No hay fórmulas referenciales para esa búsqueda.</div>`;
  }
  function renderSmartPanel(){
    return;
  }
  function setReference(text){
    const ref = byId('sfb2ReferencePreview');
    if (ref) ref.textContent = text || '...';
  }
  function switchTab(tab){
    state.tab = tab;
    state.page = 1;
    state.search = '';
    state.selected.clear();
    const search = byId('sfb2LibrarySearch');
    if (search) {
      search.value = '';
      search.placeholder = tab === 'preguntas' ? 'Buscar preguntas...' : 'Buscar factores...';
    }
    renderTabs();
    state.libraryOpen = false;
    closeInlineBatchPopup();
    renderLibraryPopover();
    renderLibrary();
  }
  function makeItemToken(item){
    return { kind:'item', itemType: state.tab === 'preguntas' ? 'pregunta' : 'factor', code:item.code, title:item.title, formula:item.code };
  }
  function canAppendItem(){
    const last = state.tokens[state.tokens.length - 1];
    if (!last) return true;
    return last.kind === 'operator';
  }
  function canAppendOperator(txt){
    const clean = String(txt || '').trim();
    const last = state.tokens[state.tokens.length - 1];
    if (!last) return clean === 'SI';
    if (last.kind === 'operator') return clean === 'SI' && last.text.trim() !== 'SI';
    return true;
  }
  function appendItem(item){
    if (!canAppendItem()) {
      showToastSafe('ℹ️ Primero agrega un operador para continuar la fórmula.');
      return;
    }
    state.tokens.push(makeItemToken(item));
    renderCanvas();
  }
  function appendOperator(txt){
    if (state.batchMode) return;
    if (!canAppendOperator(txt)) {
      showToastSafe('ℹ️ Ese operador no puede ir en esa posición.');
      return;
    }
    state.tokens.push({ kind:'operator', text:String(txt).replace(/\s+/g,' ').trim() });
    renderCanvas();
  }
  function appendGeneratedGroup(formula){
    if (!formula) return;
    if (!canAppendItem()) {
      showToastSafe('ℹ️ Primero agrega un operador antes de insertar otro bloque.');
      return;
    }
    state.tokens.push({ kind:'group', formula });
    renderCanvas();
  }
  function toggleBatchMode(force){
    state.batchMode = typeof force === 'boolean' ? force : !state.batchMode;
    state.selected.clear();
    if (state.batchMode) {
      state.libraryOpen = true;
    } else {
      closeInlineBatchPopup();
    }
    renderLibraryPopover();
    renderLibrary();
  }
  function generateBatchFormula(ids, op){
    const items = ids.map(getItemById).filter(Boolean);
    const codes = items.map(i => i.code);
    if (!codes.length) return '';
    if (codes.length === 1) return codes[0];
    if (op === 'PROM') return `(${codes.join(' + ')}) / ${codes.length}`;
    return codes.join(` ${op} `);
  }
  function getBatchQuestion(){
    return state.tab === 'preguntas'
      ? '¿Qué deseas hacer con estas preguntas?'
      : '¿Qué deseas hacer con estos factores?';
  }
  function ensureInlineBatchPopup(){
    const host = byId('sfb2LibraryPopover');
    if (!host || byId('sfb2InlineBatchPopup')) return;
    const options = [
      { key:'+', label:'Sumar', symbol:'+' },
      { key:'-', label:'Restar', symbol:'−' },
      { key:'×', label:'Multiplicar', symbol:'×' },
      { key:'÷', label:'Dividir', symbol:'÷' },
      { key:'PROM', label:'Promediar', symbol:'AVG' }
    ];
    host.insertAdjacentHTML('beforeend', `
      <div class="sfb2-inline-popup" id="sfb2InlineBatchPopup" hidden>
        <div class="sfb2-inline-popup-card">
          <button class="sfb2-inline-popup-close" id="sfb2InlineBatchClose" type="button" aria-label="Cerrar">×</button>
          <div class="sfb2-inline-popup-head">
            <div class="sfb2-inline-popup-title" id="sfb2InlineBatchTitle">${getBatchQuestion()}</div>
            <div class="sfb2-inline-popup-count" id="sfb2InlineBatchCount">0 seleccionados</div>
          </div>
          <div class="sfb2-modal-op-grid sfb2-inline-popup-grid" id="sfb2InlineBatchOps">
            ${options.map(op => `<button type="button" class="sfb2-inline-op" data-op="${op.key}"><span class="sfb2-inline-op-symbol">${op.symbol}</span><span class="sfb2-inline-op-label">${op.label}</span></button>`).join('')}
          </div>
        </div>
      </div>`);
  }
  function renderInlineBatchPopup(){
    ensureInlineBatchPopup();
    const popup = byId('sfb2InlineBatchPopup');
    if (!popup) return;
    const isOpen = !!state.inlinePopupOpen && state.pendingBatchIds.length > 1;
    popup.hidden = !isOpen;
    popup.classList.toggle('is-open', isOpen);
    if (!isOpen) return;
    const title = byId('sfb2InlineBatchTitle');
    const count = byId('sfb2InlineBatchCount');
    if (title) title.textContent = getBatchQuestion();
    if (count) count.textContent = `${state.pendingBatchIds.length} seleccionado${state.pendingBatchIds.length === 1 ? '' : 's'}`;
    qa('.sfb2-inline-op', popup).forEach(btn => btn.classList.toggle('is-active', btn.dataset.op === state.chosenBatchOp));
  }
  function closeInlineBatchPopup(){
    state.inlinePopupOpen = false;
    state.pendingBatchIds = [];
    renderInlineBatchPopup();
  }
  function openInlineBatchPopup(ids){
    ensureInlineBatchPopup();
    state.pendingBatchIds = Array.from(ids || []);
    state.chosenBatchOp = '+';
    state.inlinePopupOpen = true;
    renderInlineBatchPopup();
  }
  function batchInsert(){
    const ids = Array.from(state.selected);
    if (!ids.length) {
      showToastSafe('ℹ️ Selecciona al menos un elemento.');
      return;
    }
    if (ids.length === 1) {
      const item = getItemById(ids[0]);
      if (item) appendItem(item);
      closeInlineBatchPopup();
      state.libraryOpen = false;
      toggleBatchMode(false);
      renderLibraryPopover();
      return;
    }
    openInlineBatchPopup(ids);
  }
  function attachEvents(){
    const r = root();
    if (!r || r.dataset.sfb2Ready === '1') return;
    r.dataset.sfb2Ready = '1';
    byId('sfb2TabPreguntas')?.addEventListener('click', () => switchTab('preguntas'));
    byId('sfb2TabFactores')?.addEventListener('click', () => switchTab('factores'));
    byId('sfb2LibrarySearch')?.addEventListener('input', (e) => { state.search = e.target.value || ''; state.page = 1; state.libraryOpen = true; renderLibraryPopover(); renderLibrary(); });
    byId('sfb2LibrarySearch')?.addEventListener('focus', () => { state.libraryOpen = true; renderLibraryPopover(); renderLibrary(); });
    byId('sfb2LibrarySearch')?.addEventListener('click', () => { state.libraryOpen = true; renderLibraryPopover(); renderLibrary(); });
    byId('sfb2BatchToggle')?.addEventListener('click', () => { toggleBatchMode(); });
    byId('sfb2BatchInsert')?.addEventListener('click', batchInsert);
    byId('sfb2UndoBtn')?.addEventListener('click', () => { state.tokens.pop(); renderCanvas(); });
    byId('sfb2ClearBtn')?.addEventListener('click', () => { state.tokens = []; renderCanvas(); });
    byId('sfb2SmartSearch')?.addEventListener('input', (e) => { state.smartSearch = e.target.value || ''; renderSmart(); });
    byId('sfb2SmartModal')?.addEventListener('hidden.bs.modal', () => { const input = byId('sfb2SmartSearch'); if (input) input.blur(); });
    byId('facMostrarDescPregunta')?.addEventListener('change', () => { renderLibrary(); renderCanvas(); });
    byId('facMostrarDescFactor')?.addEventListener('change', () => { renderLibrary(); renderCanvas(); });
    qa('.sfb2-operator-tab', r).forEach(btn => btn.addEventListener('click', () => { state.operatorCategory = btn.dataset.opCat || 'basic'; renderOperatorTabs(); }));
    document.addEventListener('click', (e) => {
      const panel = q('.sfb2-library-panel', root());
      const searchWrap = q('.sfb2-library-shell', root()) || byId('sfb2LibrarySearch')?.closest('.sfb2-library-shell');
      if (!panel) return;
      const clickedInsidePanel = !!e.target.closest('.sfb2-library-panel');
      const clickedSearch = !!(e.target.id === 'sfb2LibrarySearch' || e.target.closest('#sfb2LibrarySearch') || e.target.closest('.sfb2-library-search'));
      const clickedInsideShell = !!(searchWrap && searchWrap.contains(e.target));
      if (!clickedInsidePanel && !clickedSearch && !clickedInsideShell && !e.target.closest('.modal')) {
        state.libraryOpen = false;
        closeInlineBatchPopup();
        renderLibraryPopover();
      }
    });

    r.addEventListener('click', (e) => {
      const card = e.target.closest('.sfb2-card');
      if (card) {
        e.stopPropagation();
        const item = getItemById(card.dataset.id || '');
        if (!item) return;
        state.libraryOpen = true;
        if (state.batchMode) {
          if (state.selected.has(item.id)) state.selected.delete(item.id); else state.selected.add(item.id);
          renderLibrary();
        } else {
          appendItem(item);
          renderLibrary();
        }
        renderLibraryPopover();
        return;
      }
      const removeBtn = e.target.closest('.sfb2-token-remove');
      if (removeBtn) {
        const idx = Number(removeBtn.dataset.removeIndex);
        if (!Number.isNaN(idx) && state.tokens[idx]) {
          state.tokens.splice(idx, 1);
          renderCanvas();
        }
        return;
      }
      const inlineClose = e.target.closest('#sfb2InlineBatchClose');
      if (inlineClose) {
        closeInlineBatchPopup();
        return;
      }
      const inlineOp = e.target.closest('.sfb2-inline-op');
      if (inlineOp) {
        const op = inlineOp.dataset.op || '+';
        const formula = generateBatchFormula(state.pendingBatchIds, op);
        appendGeneratedGroup(formula);
        state.libraryOpen = false;
        closeInlineBatchPopup();
        toggleBatchMode(false);
        renderLibraryPopover();
        return;
      }
      const opBtn = e.target.closest('.sfb2-op-btn');
      if (opBtn) {
        if (state.batchMode) return;
        appendOperator(opBtn.dataset.insert || '');
        return;
      }
      const tpl = e.target.closest('.sfb2-template');
      if (tpl) {
        const t = data.templates.find(x => x.id === tpl.dataset.templateId);
        state.activeTemplateId = t ? t.id : null;
        setReference(t ? t.formula : '...');
        renderSmart();
      }
    });

    // expose globals compatible with legacy save flow
    window.insertarFormula = function(txt){ appendOperator(txt); };
    window.syncFormula = function(val){
      state.tokens = [];
      const clean = String(val || '').trim();
      if (clean) state.tokens.push({ kind:'group', formula: clean });
      renderCanvas();
    };
    window.filterFormulaTemplates = function(query){
      state.smartSearch = String(query || '');
      const input = byId('sfb2SmartSearch');
      if (input && input.value !== state.smartSearch) input.value = state.smartSearch;
      renderSmart();
    };
  }

  function dedupeFactorSummary(){
    const titles = qa('.soft-panel .fw-bold').filter(el => /Resumen de Factores/i.test(el.textContent || ''));
    if (titles.length <= 1) return;
    titles.slice(1).forEach(el => {
      const panel = el.closest('.soft-panel');
      if (panel) panel.remove();
    });
  }

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; });
  }

  function init(){
    if (!root()) return;
    attachEvents();
    renderTabs();
    state.libraryOpen = false;
    closeInlineBatchPopup();
    renderLibraryPopover();
    renderLibrary();
    renderInlineBatchPopup();
    renderCanvas();
    renderSmart();
    renderSmartPanel();
    const search = byId('sfb2LibrarySearch');
    if (search) search.placeholder = 'Buscar preguntas...';
    setReference('...');
    dedupeFactorSummary();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
