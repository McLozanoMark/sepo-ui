(function(){
  const PREFIX = 'sfam';
  const state = {
    fichas: [
      {
        id: 'SF-PSI-001',
        code: 'FPSI-001',
        name: 'Ficha Psicológica General',
        desc: 'Ficha base para evaluación psicológica ocupacional.',
        fields: [
          { code:'resultado_final', label:'Resultado final', required:true },
          { code:'nivel_riesgo', label:'Nivel de riesgo', required:true },
          { code:'puntaje_total', label:'Puntaje total', required:true },
          { code:'observacion_clinica', label:'Observación clínica', required:false },
          { code:'recomendacion', label:'Recomendación', required:false }
        ]
      },
      {
        id: 'SF-EST-002',
        code: 'FEST-002',
        name: 'Ficha de Estrés Laboral',
        desc: 'Ficha orientada a indicadores psicosociales y estrés.',
        fields: [
          { code:'score_estres', label:'Score de estrés', required:true },
          { code:'categoria_estres', label:'Categoría de estrés', required:true },
          { code:'riesgo_psicosocial', label:'Riesgo psicosocial', required:true },
          { code:'nota_profesional', label:'Nota del profesional', required:false }
        ]
      },
      {
        id: 'SF-ANS-003',
        code: 'FANS-003',
        name: 'Ficha de Ansiedad y Alerta',
        desc: 'Ficha específica para componentes de ansiedad y alerta.',
        fields: [
          { code:'ansiedad_somatica', label:'Ansiedad somática', required:true },
          { code:'ansiedad_cognitiva', label:'Ansiedad cognitiva', required:true },
          { code:'estado_alerta', label:'Estado de alerta', required:true },
          { code:'riesgo_alerta', label:'Riesgo de alerta', required:false }
        ]
      }
    ],
    selectedFichaId: '',
    query: '',
    mappings: {},
    registry: [
      {
        id: 'MAP-001',
        fichaId: 'SF-PSI-001',
        fichaCode: 'FPSI-001',
        fichaName: 'Ficha Psicológica General',
        updatedAt: new Date().toISOString(),
        factorSnapshot: ['FAC-ANS-S','FAC-ANS-C','FAC-EST-P','FAC-EVI'],
        mappings: {
          resultado_final: 'FAC-ANS-C',
          nivel_riesgo: 'FAC-EST-P',
          puntaje_total: 'FAC-ANS-S',
          observacion_clinica: '',
          recomendacion: 'FAC-EVI'
        }
      }
    ],
    editingId: null,
    gridSearch: ''
  };

  function byId(id){ return document.getElementById(id); }
  function qs(sel, root){ return (root || document).querySelector(sel); }
  function qsa(sel, root){ return Array.from((root || document).querySelectorAll(sel)); }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }
  function toast(msg){ if (typeof window.showToast === 'function') window.showToast(msg); }

  function getLiveFactors(){
    const fromWindow = Array.isArray(window.sepoFactorsData) ? window.sepoFactorsData : [];
    const normalized = fromWindow
      .map((f, idx) => ({ code: String(f.code || '').trim(), desc: String(f.desc || f.label || '').trim(), idx }))
      .filter(f => f.code);
    if (normalized.length) return normalized;
    return [
      { code:'FAC-ANS-S', desc:'Ansiedad Somática' },
      { code:'FAC-ANS-C', desc:'Ansiedad Cognitiva' },
      { code:'FAC-EST-P', desc:'Estrés Percibido' },
      { code:'FAC-EVI', desc:'Evitación Conductual' },
      { code:'FAC-AUT', desc:'Autocontrol Emocional' },
      { code:'FAC-ALR', desc:'Estado de Alerta' }
    ];
  }

  function getSelectedFicha(){
    return state.fichas.find(f => f.id === state.selectedFichaId) || null;
  }

  function defaultMappingsForFicha(ficha){
    const base = {};
    (ficha?.fields || []).forEach(field => { base[field.code] = ''; });
    return base;
  }

  function getCompletion(ficha, mappings){
    const fields = ficha?.fields || [];
    const total = fields.length;
    const required = fields.filter(f => f.required).length;
    const mapped = fields.filter(f => (mappings[f.code] || '').trim()).length;
    const requiredMapped = fields.filter(f => !f.required || (mappings[f.code] || '').trim()).length;
    const missingRequired = fields.filter(f => f.required && !(mappings[f.code] || '').trim());
    const percent = total ? Math.round((mapped / total) * 100) : 0;
    const valid = missingRequired.length === 0 && required > 0 ? true : missingRequired.length === 0;
    return { total, required, mapped, requiredMapped, missingRequired, percent, valid };
  }

  function getRegistryRows(){
    const factors = getLiveFactors();
    const currentCodes = new Set(factors.map(f => f.code));
    return state.registry.map(item => {
      const ficha = state.fichas.find(f => f.id === item.fichaId);
      const completion = getCompletion(ficha, item.mappings || {});
      const brokenRefs = Object.values(item.mappings || {}).filter(Boolean).filter(code => !currentCodes.has(code));
      return { ...item, ficha, completion, brokenRefs };
    });
  }

  function render(){
    const root = byId('step-6');
    if (!root) return;
    root.innerHTML = template();
    bind();
    renderAutocomplete();
    renderWorkspace();
    renderGrid();
  }

  function template(){
    return `
      <section class="${PREFIX}-shell">
        <div class="${PREFIX}-hero">
          <div>
            <h6 class="${PREFIX}-title"><i class="fas fa-link me-2"></i>Fichas asociadas</h6>
            <p class="${PREFIX}-subtitle">Configura el mapeo campo de ficha → factor del test con validación visual y seguimiento de avance.</p>
          </div>
          <div class="${PREFIX}-toolbar">
            <button type="button" class="btn btn-outline-secondary btn-sm fw-semibold" id="${PREFIX}-btn-reset-editor"><i class="fas fa-eraser me-1"></i>Limpiar editor</button>
          </div>
        </div>

        <div class="${PREFIX}-panel">
          <div class="row g-3 align-items-start">
            <div class="col-lg-7">
              <label class="form-label fw-bold small text-primary">Buscar ficha</label>
              <div class="${PREFIX}-autocomplete-wrap">
                <div class="search-wrap">
                  <i class="fas fa-search"></i>
                  <input type="text" class="form-control bg-white" id="${PREFIX}-search" placeholder="Escribe código o nombre de ficha..." style="padding-left:40px;" autocomplete="off" />
                </div>
                <div class="${PREFIX}-autocomplete-list" id="${PREFIX}-search-list"></div>
              </div>
            </div>
            <div class="col-lg-5">
              <div class="${PREFIX}-status-card" id="${PREFIX}-selected-card">
                <div class="${PREFIX}-status-empty">Selecciona una ficha para comenzar a mapear.</div>
              </div>
            </div>
          </div>
        </div>

        <div id="${PREFIX}-workspace"></div>

        <div class="${PREFIX}-panel mt-3">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div>
              <div class="${PREFIX}-grid-title">Asociaciones registradas</div>
              <div class="text-muted small">Busca, edita, duplica o elimina configuraciones ya armadas.</div>
            </div>
            <div class="search-wrap ${PREFIX}-grid-search-wrap">
              <i class="fas fa-search"></i>
              <input type="text" class="form-control" id="${PREFIX}-grid-search" placeholder="Buscar por ficha, código o factor..." style="padding-left:40px;" />
            </div>
          </div>
          <div class="table-responsive">
            <table class="table align-middle ${PREFIX}-table mb-0">
              <thead>
                <tr>
                  <th>Ficha</th>
                  <th>Estado de mapeo</th>
                  <th>Vista rápida</th>
                  <th>Última edición</th>
                  <th class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody id="${PREFIX}-grid-body"></tbody>
            </table>
          </div>
        </div>
      </section>`;
  }

  function renderAutocomplete(){
    const list = byId(`${PREFIX}-search-list`);
    const input = byId(`${PREFIX}-search`);
    if (!list || !input) return;
    const term = String(state.query || '').trim().toLowerCase();
    const items = state.fichas.filter(f => !term || `${f.code} ${f.name} ${f.desc}`.toLowerCase().includes(term)).slice(0, 8);
    list.innerHTML = items.length ? items.map(f => `
      <button type="button" class="${PREFIX}-autocomplete-item" data-ficha-id="${esc(f.id)}">
        <span class="${PREFIX}-autocomplete-code">${esc(f.code)}</span>
        <span class="${PREFIX}-autocomplete-name">${esc(f.name)}</span>
        <span class="${PREFIX}-autocomplete-desc">${esc(f.desc)}</span>
      </button>`).join('') : `<div class="${PREFIX}-autocomplete-empty">No se encontraron fichas para esa búsqueda.</div>`;
    list.classList.toggle('is-open', !!term || document.activeElement === input);
  }

  function renderSelectedCard(){
    const card = byId(`${PREFIX}-selected-card`);
    if (!card) return;
    const ficha = getSelectedFicha();
    if (!ficha) {
      card.innerHTML = `<div class="${PREFIX}-status-empty">Selecciona una ficha para comenzar a mapear.</div>`;
      return;
    }
    const completion = getCompletion(ficha, state.mappings);
    card.innerHTML = `
      <div class="${PREFIX}-selected-head">
        <div>
          <div class="${PREFIX}-selected-code">${esc(ficha.code)}</div>
          <div class="${PREFIX}-selected-name">${esc(ficha.name)}</div>
        </div>
        <span class="badge rounded-pill ${completion.valid ? 'text-bg-success' : 'text-bg-warning'}">${completion.percent}%</span>
      </div>
      <div class="${PREFIX}-progress">
        <div class="${PREFIX}-progress-bar" style="width:${completion.percent}%"></div>
      </div>
      <div class="${PREFIX}-status-meta">
        <span><strong>${completion.mapped}</strong> de <strong>${completion.total}</strong> campos mapeados</span>
        <span>${completion.missingRequired.length ? `<strong>${completion.missingRequired.length}</strong> obligatorios pendientes` : 'Obligatorios completos'}</span>
      </div>`;
  }

  function renderWorkspace(){
    renderSelectedCard();
    const host = byId(`${PREFIX}-workspace`);
    if (!host) return;
    const ficha = getSelectedFicha();
    if (!ficha) {
      host.innerHTML = '';
      return;
    }
    const factors = getLiveFactors();
    const factorCodes = new Set(factors.map(f => f.code));
    const completion = getCompletion(ficha, state.mappings);
    const impacted = Object.entries(state.mappings).filter(([, code]) => code && !factorCodes.has(code));
    host.innerHTML = `
      <div class="${PREFIX}-workspace mt-3">
        <div class="${PREFIX}-panel">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div>
              <div class="${PREFIX}-grid-title">Mapeo de datos</div>
              <div class="text-muted small">Asigna un factor del test a cada código de dato de la ficha.</div>
            </div>
            <div class="d-flex gap-2 flex-wrap">
              ${state.editingId ? '<span class="badge text-bg-primary-subtle text-primary-emphasis border">Editando asociación</span>' : '<span class="badge text-bg-light border">Nueva asociación</span>'}
              <span class="badge ${completion.valid ? 'text-bg-success' : 'text-bg-warning'}">${completion.valid ? 'Listo para guardar' : 'Requiere completar obligatorios'}</span>
            </div>
          </div>
          ${impacted.length ? `<div class="alert alert-warning ${PREFIX}-alert"><i class="fas fa-exclamation-triangle me-2"></i>Hay ${impacted.length} mapeo(s) afectados porque sus factores ya no existen o cambiaron en la configuración actual.</div>` : ''}
          <div class="${PREFIX}-summary-row">
            <div class="${PREFIX}-mini-card is-ok"><span class="${PREFIX}-mini-value">${completion.mapped}/${completion.total}</span><span class="${PREFIX}-mini-label">Campos mapeados</span></div>
            <div class="${PREFIX}-mini-card ${completion.missingRequired.length ? 'is-pending' : 'is-ok'}"><span class="${PREFIX}-mini-value">${completion.missingRequired.length}</span><span class="${PREFIX}-mini-label">Obligatorios pendientes</span></div>
            <div class="${PREFIX}-mini-card"><span class="${PREFIX}-mini-value">${factors.length}</span><span class="${PREFIX}-mini-label">Factores disponibles</span></div>
          </div>
          <div class="table-responsive mt-3">
            <table class="table align-middle ${PREFIX}-map-table mb-0">
              <thead>
                <tr>
                  <th style="width:40%">Código / campo de ficha</th>
                  <th style="width:42%">Factor del test</th>
                  <th style="width:18%">Estado</th>
                </tr>
              </thead>
              <tbody>
                ${ficha.fields.map(field => {
                  const value = state.mappings[field.code] || '';
                  const ok = !!value;
                  const missingRequired = field.required && !ok;
                  const broken = !!value && !factorCodes.has(value);
                  return `
                    <tr>
                      <td>
                        <div class="${PREFIX}-field-cell">
                          <div class="${PREFIX}-field-code">${esc(field.code)}</div>
                          <div class="${PREFIX}-field-label">${esc(field.label)}</div>
                          <div class="${PREFIX}-field-tags">
                            <span class="badge rounded-pill ${field.required ? 'text-bg-danger-subtle text-danger-emphasis' : 'text-bg-light border'}">${field.required ? 'Obligatorio' : 'Opcional'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <select class="form-select ${PREFIX}-map-select ${missingRequired ? 'is-invalid' : ''} ${broken ? 'is-broken' : ''}" data-field-code="${esc(field.code)}">
                          <option value="">Seleccionar factor...</option>
                          ${factors.map(f => `<option value="${esc(f.code)}" ${value === f.code ? 'selected' : ''}>${esc(f.code)} · ${esc(f.desc || 'Sin descripción')}</option>`).join('')}
                        </select>
                        ${broken ? `<div class="${PREFIX}-inline-warning">El factor ${esc(value)} ya no existe en la configuración actual.</div>` : ''}
                      </td>
                      <td>
                        <div class="${PREFIX}-state-pill ${broken ? 'is-broken' : ok ? 'is-ok' : missingRequired ? 'is-pending' : 'is-idle'}">
                          <i class="fas ${broken ? 'fa-link-slash' : ok ? 'fa-check-circle' : missingRequired ? 'fa-exclamation-circle' : 'fa-minus-circle'}"></i>
                          <span>${broken ? 'Afectado' : ok ? 'Mapeado' : missingRequired ? 'Pendiente' : 'Vacío'}</span>
                        </div>
                      </td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
          <div class="${PREFIX}-footer-actions mt-3">
            <button type="button" class="btn btn-light fw-semibold" id="${PREFIX}-btn-clear-current">Limpiar mapeo</button>
            <button type="button" class="btn btn-outline-secondary fw-semibold" id="${PREFIX}-btn-validate">Validar</button>
            <button type="button" class="btn-prim" id="${PREFIX}-btn-save">${state.editingId ? 'Actualizar asociación' : 'Guardar asociación'}</button>
          </div>
        </div>
      </div>`;
  }

  function renderGrid(){
    const body = byId(`${PREFIX}-grid-body`);
    if (!body) return;
    const term = String(state.gridSearch || '').trim().toLowerCase();
    const rows = getRegistryRows().filter(row => {
      const text = [row.fichaCode, row.fichaName, ...Object.values(row.mappings || {})].join(' ').toLowerCase();
      return !term || text.includes(term);
    });
    if (!rows.length) {
      body.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No hay asociaciones que coincidan con la búsqueda.</td></tr>`;
      return;
    }
    body.innerHTML = rows.map(row => {
      const preview = summarizeRule(row);
      const dt = new Date(row.updatedAt);
      const dateText = isNaN(dt.getTime()) ? '—' : dt.toLocaleString('es-PE');
      const statusHtml = row.brokenRefs.length
        ? `<span class="${PREFIX}-state-pill is-broken"><i class="fas fa-link-slash"></i><span>${row.brokenRefs.length} afectado(s)</span></span>`
        : row.completion.valid
          ? `<span class="${PREFIX}-state-pill is-ok"><i class="fas fa-check-circle"></i><span>${row.completion.percent}% completo</span></span>`
          : `<span class="${PREFIX}-state-pill is-pending"><i class="fas fa-exclamation-circle"></i><span>Incompleto</span></span>`;
      return `<tr>
        <td>
          <div class="${PREFIX}-grid-main">
            <div class="${PREFIX}-field-code">${esc(row.fichaCode)}</div>
            <div class="${PREFIX}-field-label">${esc(row.fichaName)}</div>
          </div>
        </td>
        <td>${statusHtml}</td>
        <td><div class="${PREFIX}-preview">${esc(preview)}</div></td>
        <td><span class="text-muted small">${esc(dateText)}</span></td>
        <td class="text-end">
          <div class="btn-group btn-group-sm">
            <button type="button" class="btn btn-outline-secondary" data-action="edit" data-id="${esc(row.id)}"><i class="fas fa-pen"></i></button>
            <button type="button" class="btn btn-outline-secondary" data-action="duplicate" data-id="${esc(row.id)}"><i class="fas fa-copy"></i></button>
            <button type="button" class="btn btn-outline-danger" data-action="delete" data-id="${esc(row.id)}"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  function summarizeRule(row){
    const parts = Object.entries(row.mappings || {}).filter(([, value]) => !!value).slice(0, 3).map(([field, value]) => `${field} ← ${value}`);
    const more = Math.max(0, Object.values(row.mappings || {}).filter(Boolean).length - parts.length);
    return parts.join(' · ') + (more ? ` · +${more} más` : parts.length ? '' : 'Sin factores asignados');
  }

  function selectFicha(id, options){
    const ficha = state.fichas.find(f => f.id === id);
    if (!ficha) return;
    state.selectedFichaId = ficha.id;
    state.query = `${ficha.code} · ${ficha.name}`;
    if (options?.keepMappings && state.mappings && Object.keys(state.mappings).length) {
      // keep current
    } else {
      state.mappings = defaultMappingsForFicha(ficha);
      state.editingId = null;
    }
    render();
    const input = byId(`${PREFIX}-search`);
    if (input) input.value = state.query;
  }

  function validateCurrent(showFeedback){
    const ficha = getSelectedFicha();
    if (!ficha) {
      if (showFeedback) toast('Selecciona una ficha primero.');
      return { ok:false, message:'Selecciona una ficha primero.' };
    }
    const completion = getCompletion(ficha, state.mappings);
    const factors = getLiveFactors();
    const factorCodes = new Set(factors.map(f => f.code));
    const broken = Object.entries(state.mappings).filter(([, code]) => code && !factorCodes.has(code));
    if (broken.length) {
      if (showFeedback) toast('Hay mapeos afectados por factores que ya no existen.');
      return { ok:false, message:'Hay mapeos afectados por factores que ya no existen.' };
    }
    if (completion.missingRequired.length) {
      if (showFeedback) toast(`Faltan ${completion.missingRequired.length} campo(s) obligatorio(s) por mapear.`);
      return { ok:false, message:`Faltan ${completion.missingRequired.length} campo(s) obligatorio(s) por mapear.` };
    }
    if (!completion.mapped) {
      if (showFeedback) toast('Asocia al menos un factor antes de guardar.');
      return { ok:false, message:'Asocia al menos un factor antes de guardar.' };
    }
    if (showFeedback) toast('Validación correcta. El mapeo está consistente.');
    return { ok:true, message:'OK' };
  }

  function saveCurrent(){
    const valid = validateCurrent(true);
    if (!valid.ok) return;
    const ficha = getSelectedFicha();
    const payload = {
      id: state.editingId || `MAP-${Date.now()}`,
      fichaId: ficha.id,
      fichaCode: ficha.code,
      fichaName: ficha.name,
      updatedAt: new Date().toISOString(),
      factorSnapshot: getLiveFactors().map(f => f.code),
      mappings: { ...state.mappings }
    };
    const existsIndex = state.registry.findIndex(r => r.id === payload.id);
    if (existsIndex >= 0) state.registry.splice(existsIndex, 1, payload);
    else state.registry.unshift(payload);
    state.editingId = null;
    toast('Asociación guardada correctamente.');
    render();
  }

  function clearCurrent(){
    const ficha = getSelectedFicha();
    if (!ficha) return;
    state.mappings = defaultMappingsForFicha(ficha);
    renderWorkspace();
    bindWorkspace();
    renderSelectedCard();
  }

  function editRecord(id, duplicate){
    const item = state.registry.find(r => r.id === id);
    if (!item) return;
    state.selectedFichaId = item.fichaId;
    state.query = `${item.fichaCode} · ${item.fichaName}`;
    state.mappings = { ...item.mappings };
    state.editingId = duplicate ? null : item.id;
    render();
    const current = new Set(getLiveFactors().map(f => f.code));
    const old = new Set(item.factorSnapshot || []);
    const changed = old.size !== current.size || [...old].some(code => !current.has(code));
    if (duplicate) toast('Se cargó una copia editable de la asociación.');
    else if (changed) toast('Aviso: la lista de factores cambió desde la última edición. Revisa el mapeo antes de guardar.');
    const work = byId(`${PREFIX}-workspace`);
    if (work) work.scrollIntoView({ behavior:'smooth', block:'start' });
  }

  function deleteRecord(id){
    const idx = state.registry.findIndex(r => r.id === id);
    if (idx < 0) return;
    state.registry.splice(idx, 1);
    toast('Asociación eliminada.');
    renderGrid();
    bindGrid();
  }

  function bind(){
    const search = byId(`${PREFIX}-search`);
    const gridSearch = byId(`${PREFIX}-grid-search`);
    const resetEditor = byId(`${PREFIX}-btn-reset-editor`);
    if (search) {
      search.value = state.query;
      search.addEventListener('input', function(){ state.query = this.value; renderAutocomplete(); });
      search.addEventListener('focus', renderAutocomplete);
      search.addEventListener('blur', function(){ setTimeout(() => { const list = byId(`${PREFIX}-search-list`); if (list) list.classList.remove('is-open'); }, 140); });
    }
    const list = byId(`${PREFIX}-search-list`);
    if (list) {
      list.addEventListener('click', function(e){
        const btn = e.target.closest(`[data-ficha-id]`);
        if (!btn) return;
        selectFicha(btn.getAttribute('data-ficha-id'));
      });
    }
    if (gridSearch) {
      gridSearch.value = state.gridSearch;
      gridSearch.addEventListener('input', function(){ state.gridSearch = this.value; renderGrid(); bindGrid(); });
    }
    if (resetEditor) resetEditor.addEventListener('click', function(){
      state.selectedFichaId = '';
      state.query = '';
      state.mappings = {};
      state.editingId = null;
      render();
    });
    bindWorkspace();
    bindGrid();
  }

  function bindWorkspace(){
    qsa(`.${PREFIX}-map-select`).forEach(sel => sel.addEventListener('change', function(){
      const fieldCode = this.getAttribute('data-field-code');
      state.mappings[fieldCode] = this.value;
      renderWorkspace();
      bindWorkspace();
      renderSelectedCard();
    }));
    const btnSave = byId(`${PREFIX}-btn-save`);
    const btnClear = byId(`${PREFIX}-btn-clear-current`);
    const btnValidate = byId(`${PREFIX}-btn-validate`);
    if (btnSave) btnSave.addEventListener('click', saveCurrent);
    if (btnClear) btnClear.addEventListener('click', clearCurrent);
    if (btnValidate) btnValidate.addEventListener('click', function(){ validateCurrent(true); });
  }

  function bindGrid(){
    const body = byId(`${PREFIX}-grid-body`);
    if (!body) return;
    body.onclick = function(e){
      const btn = e.target.closest('[data-action][data-id]');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      if (action === 'edit') editRecord(id, false);
      if (action === 'duplicate') editRecord(id, true);
      if (action === 'delete') deleteRecord(id);
    };
  }

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(render, 120);
  });
})();
