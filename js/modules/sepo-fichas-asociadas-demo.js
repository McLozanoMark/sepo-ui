(function(){
  const PREFIX = 'sfam';
  const TYPE_OPTIONS = [
    { value:'puntaje', label:'Puntaje' },
    { value:'nivel', label:'Nivel' },
    { value:'interpretacion', label:'Interpretación' }
  ];

  const state = {
    fichas: [
      {
        id: 'SF-PSI-001', code: 'FPSI-001', name: 'Ficha Psicológica General',
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
        id: 'SF-EST-002', code: 'FEST-002', name: 'Ficha de Estrés Laboral',
        desc: 'Ficha orientada a indicadores psicosociales y estrés.',
        fields: [
          { code:'score_estres', label:'Score de estrés', required:true },
          { code:'categoria_estres', label:'Categoría de estrés', required:true },
          { code:'riesgo_psicosocial', label:'Riesgo psicosocial', required:true },
          { code:'nota_profesional', label:'Nota del profesional', required:false }
        ]
      },
      {
        id: 'SF-ANS-003', code: 'FANS-003', name: 'Ficha de Ansiedad y Alerta',
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
    mappingTypes: {},
    registry: [
      {
        id: 'MAP-001', fichaId: 'SF-PSI-001', fichaCode: 'FPSI-001', fichaName: 'Ficha Psicológica General',
        linkedFactorCode: 'FAC-ANS-C', linkedFactorName: 'Ansiedad Cognitiva',
        updatedAt: '2026-04-04T08:15:00.000Z',
        factorSnapshot: ['FAC-ANS-S','FAC-ANS-C','FAC-EST-P','FAC-EVI','FAC-AUT','FAC-ALR'],
        mappings: { resultado_final: 'FAC-ANS-C', nivel_riesgo: 'FAC-EST-P', puntaje_total: 'FAC-ANS-S', observacion_clinica: '', recomendacion: 'FAC-EVI' },
        mappingTypes: { resultado_final:'interpretacion', nivel_riesgo:'nivel', puntaje_total:'puntaje', observacion_clinica:'interpretacion', recomendacion:'interpretacion' }
      },
      {
        id: 'MAP-002', fichaId: 'SF-EST-002', fichaCode: 'FEST-002', fichaName: 'Ficha de Estrés Laboral',
        linkedFactorCode: 'FAC-EST-P', linkedFactorName: 'Estrés Percibido',
        updatedAt: '2026-04-03T16:45:00.000Z',
        factorSnapshot: ['FAC-ANS-S','FAC-ANS-C','FAC-EST-P','FAC-EVI','FAC-AUT','FAC-ALR'],
        mappings: { score_estres: 'FAC-EST-P', categoria_estres: 'FAC-ALR', riesgo_psicosocial: 'FAC-AUT', nota_profesional: '' },
        mappingTypes: { score_estres:'puntaje', categoria_estres:'nivel', riesgo_psicosocial:'nivel', nota_profesional:'interpretacion' }
      },
      {
        id: 'MAP-003', fichaId: 'SF-ANS-003', fichaCode: 'FANS-003', fichaName: 'Ficha de Ansiedad y Alerta',
        linkedFactorCode: 'FAC-ALR', linkedFactorName: 'Estado de Alerta',
        updatedAt: '2026-04-03T11:20:00.000Z',
        factorSnapshot: ['FAC-ANS-S','FAC-ANS-C','FAC-EST-P','FAC-EVI','FAC-AUT','FAC-ALR'],
        mappings: { ansiedad_somatica: 'FAC-ANS-S', ansiedad_cognitiva: 'FAC-ANS-C', estado_alerta: 'FAC-ALR', riesgo_alerta: '__NO_APLICA__' },
        mappingTypes: { ansiedad_somatica:'puntaje', ansiedad_cognitiva:'puntaje', estado_alerta:'nivel', riesgo_alerta:'nivel' }
      }
    ],
    editingId: null,
    gridSearch: '',
    linkedFactorCode: '',
    factorPickerQuery: '',
    factorDraftCode: '',
    isFactorPickerOpen: false
  };

  let modalInstance = null;
  const byId = (id) => document.getElementById(id);
  const qsa = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  const toast = (msg) => { if (typeof window.showToast === 'function') window.showToast(msg); };

  function normalizeSearch(text){
    return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function inferTypeFromField(fieldCode){
    const code = String(fieldCode || '').toLowerCase();
    if (code.includes('puntaje') || code.includes('score')) return 'puntaje';
    if (code.includes('nivel') || code.includes('riesgo') || code.includes('categoria') || code.includes('estado')) return 'nivel';
    return 'interpretacion';
  }

  function getLiveFactors(){
    const fromWindow = Array.isArray(window.sepoFactorsData) ? window.sepoFactorsData : [];
    const normalized = fromWindow
      .map((f, idx) => ({
        code: String(f.code || '').trim(),
        desc: String(f.desc || f.label || '').trim(),
        types: Array.isArray(f.outputTypes) && f.outputTypes.length ? f.outputTypes.slice() : TYPE_OPTIONS.map(t => t.value),
        expectedEnabled: !!f.expectedEnabled,
        expectedMin: f.expectedMin,
        expectedMax: f.expectedMax,
        generatedByQuestion: !!f.generatedByQuestion,
        idx
      }))
      .filter(f => f.code);
    if (normalized.length) return normalized;
    return [
      { code:'FAC-ANS-S', desc:'Ansiedad Somática', types:['puntaje','nivel'] },
      { code:'FAC-ANS-C', desc:'Ansiedad Cognitiva', types:['puntaje','interpretacion'] },
      { code:'FAC-EST-P', desc:'Estrés Percibido', types:['puntaje','nivel'] },
      { code:'FAC-EVI', desc:'Evitación Conductual', types:['interpretacion'] },
      { code:'FAC-AUT', desc:'Autocontrol Emocional', types:['nivel','interpretacion'] },
      { code:'FAC-ALR', desc:'Estado de Alerta', types:['nivel'] }
    ];
  }

  function getFactorByCode(code){
    return getLiveFactors().find(f => f.code === code) || null;
  }

  function filteredFactorChoices(){
    const term = normalizeSearch(state.factorPickerQuery || '');
    return getLiveFactors().filter(f => !term || normalizeSearch(`${f.code} ${f.desc}`).includes(term));
  }

  function getSelectedFicha(){
    return state.fichas.find(f => f.id === state.selectedFichaId) || null;
  }

  function formatFichaQuery(ficha){ return ficha ? `${ficha.code} ${ficha.name}` : ''; }

  function defaultMappingsForFicha(ficha){
    const out = {};
    (ficha?.fields || []).forEach(field => { out[field.code] = ''; });
    return out;
  }

  function defaultTypesForFicha(ficha){
    const out = {};
    (ficha?.fields || []).forEach(field => { out[field.code] = inferTypeFromField(field.code); });
    return out;
  }

  function getCompletion(ficha, mappings, mappingTypes){
    const fields = ficha?.fields || [];
    const total = fields.length;
    const mapped = fields.filter(f => (mappings[f.code] || '').trim()).length;
    const missingRequired = fields.filter(f => f.required && !(mappings[f.code] || '').trim());
    const missingTypes = fields.filter(f => (mappings[f.code] || '').trim() && !(mappingTypes[f.code] || '').trim());
    const percent = total ? Math.round((mapped / total) * 100) : 0;
    return { total, mapped, missingRequired, missingTypes, percent, valid: missingRequired.length === 0 && missingTypes.length === 0 && mapped > 0 };
  }

  function normalizeRegistryItem(item){
    const linked = getFactorByCode(item.linkedFactorCode || item.questionCode || '') || null;
    return {
      ...item,
      linkedFactorCode: item.linkedFactorCode || item.questionCode || linked?.code || '',
      linkedFactorName: item.linkedFactorName || item.questionText || linked?.desc || '',
      mappingTypes: item.mappingTypes || Object.fromEntries(Object.keys(item.mappings || {}).map(k => [k, inferTypeFromField(k)]))
    };
  }

  function getRegistryRows(){
    const factors = getLiveFactors();
    const currentCodes = new Set(factors.map(f => f.code));
    state.registry = state.registry.map(normalizeRegistryItem);
    return state.registry.map(item => {
      const ficha = state.fichas.find(f => f.id === item.fichaId);
      const completion = getCompletion(ficha, item.mappings || {}, item.mappingTypes || {});
      const brokenRefs = Object.values(item.mappings || {}).filter(Boolean).filter(code => code !== '__NO_APLICA__' && !currentCodes.has(code));
      const linkedBroken = !!item.linkedFactorCode && !currentCodes.has(item.linkedFactorCode);
      return { ...item, ficha, completion, brokenRefs, linkedBroken };
    });
  }

  function template(){
    return `
      <section class="${PREFIX}-shell">
        <div class="${PREFIX}-hero">
          <div>
            <h6 class="${PREFIX}-title"><i class="fas fa-link me-2"></i>Fichas asociadas</h6>
            <p class="${PREFIX}-subtitle">Administra asociaciones de fichas y vincúlalas contra factores configurados, incluyendo puntaje, nivel e interpretación.</p>
          </div>
          <div class="${PREFIX}-toolbar">
            <button type="button" class="btn-prim" id="${PREFIX}-btn-new"><i class="fas fa-plus me-2"></i>Nueva asociación</button>
          </div>
        </div>

        <div class="${PREFIX}-panel mt-2">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div>
              <div class="${PREFIX}-grid-title">Asociaciones registradas</div>
              <div class="text-muted small">Busca, edita, duplica o elimina configuraciones ya armadas.</div>
            </div>
            <div class="search-wrap ${PREFIX}-grid-search-wrap">
              <i class="fas fa-search"></i>
              <input type="text" class="form-control" id="${PREFIX}-grid-search" placeholder="Buscar por ficha, factor o tipo..." style="padding-left:40px;" />
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

  function ensureModal(){
    let modal = byId(`${PREFIX}-modal`);
    if (modal) return modal;
    modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = `${PREFIX}-modal`;
    modal.tabIndex = -1;
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="modal-dialog modal-xl modal-dialog-scrollable ${PREFIX}-modal-dialog">
        <div class="modal-content ${PREFIX}-modal-content">
          <div class="modal-header ${PREFIX}-modal-header">
            <div>
              <h5 class="modal-title ${PREFIX}-modal-title"><i class="fas fa-link me-2"></i>Asociar ficha</h5>
              <div class="${PREFIX}-modal-subtitle">Selecciona una ficha, define el factor vínculo y mapea sus campos con tipo de dato.</div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body ${PREFIX}-modal-body" id="${PREFIX}-modal-body"></div>
          <div class="modal-footer ${PREFIX}-modal-footer">
            <button type="button" class="btn btn-light fw-semibold" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-outline-secondary fw-semibold" id="${PREFIX}-btn-validate">Validar</button>
            <button type="button" class="btn-prim" id="${PREFIX}-btn-save">Guardar asociación</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    if (window.bootstrap?.Modal) modalInstance = new bootstrap.Modal(modal, { backdrop:'static', keyboard:true });
    modal.addEventListener('hidden.bs.modal', () => {
      byId(`${PREFIX}-search-list`)?.classList.remove('is-open');
    });
    return modal;
  }

  function modalBodyTemplate(){
    const ficha = getSelectedFicha();
    const factors = getLiveFactors();
    const factorCodes = new Set(factors.map(f => f.code));
    const linkedFactor = getFactorByCode(state.linkedFactorCode);
    const completion = ficha ? getCompletion(ficha, state.mappings, state.mappingTypes) : { total:0, mapped:0, missingRequired:[], missingTypes:[], percent:0, valid:false };
    const impacted = Object.entries(state.mappings).filter(([, code]) => code && code !== '__NO_APLICA__' && !factorCodes.has(code));
    const factorRows = filteredFactorChoices();
    return `
      <div class="${PREFIX}-editor-grid">
        <div class="${PREFIX}-panel">
          <label class="form-label fw-bold small text-primary">Buscar ficha</label>
          <div class="${PREFIX}-autocomplete-wrap">
            <div class="search-wrap">
              <i class="fas fa-search"></i>
              <input type="text" class="form-control bg-white" id="${PREFIX}-search" placeholder="Escribe código o nombre de ficha..." style="padding-left:40px;" autocomplete="off" />
            </div>
            <div class="${PREFIX}-autocomplete-list" id="${PREFIX}-search-list"></div>
          </div>
        </div>
        <div class="${PREFIX}-status-card" id="${PREFIX}-selected-card"></div>
      </div>

      <div id="${PREFIX}-workspace-inner" class="mt-3 ${state.isFactorPickerOpen && ficha ? `${PREFIX}-workspace-locked` : ''}">
        ${!ficha ? `
          <div class="${PREFIX}-empty-state">
            <i class="fas fa-arrow-up"></i>
            <div class="${PREFIX}-empty-title">Selecciona una ficha para empezar</div>
            <div class="${PREFIX}-empty-text">Usa el buscador para abrir una ficha y configurar su mapeo en esta misma ventana.</div>
          </div>` : !linkedFactor ? `
          <div class="${PREFIX}-empty-state ${PREFIX}-empty-state-soft">
            <i class="fas fa-diagram-project"></i>
            <div class="${PREFIX}-empty-title">Primero vincula un factor</div>
            <div class="${PREFIX}-empty-text">La asociación necesita un factor ancla. Si generaste factores por respuesta, aquí aparecerán uno a uno para vincularlos.</div>
          </div>` : `
          <div class="${PREFIX}-panel">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <div>
                <div class="${PREFIX}-grid-title">Mapeo de datos</div>
                <div class="text-muted small">Asigna un factor del test a cada código de dato de la ficha y define si vincula puntaje, nivel o interpretación.</div>
              </div>
              <div class="d-flex gap-2 flex-wrap align-items-center">
                ${state.editingId ? '<span class="badge text-bg-primary-subtle text-primary-emphasis border">Editando asociación</span>' : '<span class="badge text-bg-light border">Nueva asociación</span>'}
                <span class="badge ${completion.valid ? 'text-bg-success' : 'text-bg-warning'}">${completion.valid ? 'Listo para guardar' : 'Requiere completar obligatorios'}</span>
              </div>
            </div>
            <div class="${PREFIX}-question-anchor mb-3">
              <div>
                <div class="${PREFIX}-anchor-label">Factor vinculado</div>
                <div class="${PREFIX}-anchor-value">${esc(linkedFactor.code)} · ${esc(linkedFactor.desc)}</div>
              </div>
              <button type="button" class="btn btn-light fw-semibold" id="${PREFIX}-btn-change-factor">Cambiar</button>
            </div>
            ${impacted.length ? `<div class="alert alert-warning ${PREFIX}-alert"><i class="fas fa-exclamation-triangle me-2"></i>Hay ${impacted.length} mapeo(s) afectados porque sus factores ya no existen o cambiaron en la configuración actual.</div>` : ''}
            <div class="${PREFIX}-summary-row">
              <div class="${PREFIX}-mini-card is-ok"><span class="${PREFIX}-mini-value">${completion.mapped}/${completion.total}</span><span class="${PREFIX}-mini-label">Campos mapeados</span></div>
              <div class="${PREFIX}-mini-card ${completion.missingRequired.length ? 'is-pending' : 'is-ok'}"><span class="${PREFIX}-mini-value">${completion.missingRequired.length}</span><span class="${PREFIX}-mini-label">Obligatorios pendientes</span></div>
              <div class="${PREFIX}-mini-card ${completion.missingTypes.length ? 'is-pending' : ''}"><span class="${PREFIX}-mini-value">${completion.missingTypes.length}</span><span class="${PREFIX}-mini-label">Tipos pendientes</span></div>
            </div>
            <div class="table-responsive mt-3">
              <table class="table align-middle ${PREFIX}-map-table mb-0">
                <thead>
                  <tr>
                    <th style="width:28%">Código / campo de ficha</th>
                    <th style="width:32%">Factor del test</th>
                    <th style="width:22%">Tipo vinculado</th>
                    <th style="width:18%">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${ficha.fields.map(field => {
                    const value = state.mappings[field.code] || '';
                    const factor = getFactorByCode(value);
                    const typesAvailable = factor?.types?.length ? factor.types : TYPE_OPTIONS.map(t => t.value);
                    const typeValue = state.mappingTypes[field.code] || inferTypeFromField(field.code);
                    const ok = !!value;
                    const missingRequired = field.required && !ok;
                    const broken = !!value && value !== '__NO_APLICA__' && !factorCodes.has(value);
                    const typeMissing = ok && !typeValue;
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
                            <option value="__NO_APLICA__" ${value === '__NO_APLICA__' ? 'selected' : ''}>No aplica</option>
                            ${factors.map(f => `<option value="${esc(f.code)}" ${value === f.code ? 'selected' : ''}>${esc(f.code)} · ${esc(f.desc || 'Sin descripción')}</option>`).join('')}
                          </select>
                          ${broken ? `<div class="${PREFIX}-inline-warning">El factor ${esc(value)} ya no existe en la configuración actual.</div>` : ''}
                        </td>
                        <td>
                          <select class="form-select ${PREFIX}-type-select ${typeMissing ? 'is-invalid' : ''}" data-type-field-code="${esc(field.code)}" ${ok && value !== '__NO_APLICA__' ? '' : 'disabled'}>
                            <option value="">Seleccionar tipo...</option>
                            ${TYPE_OPTIONS.filter(opt => typesAvailable.includes(opt.value)).map(opt => `<option value="${opt.value}" ${typeValue === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
                          </select>
                        </td>
                        <td>
                          <div class="${PREFIX}-state-pill ${broken ? 'is-broken' : ok ? (typeMissing ? 'is-pending' : 'is-ok') : missingRequired ? 'is-pending' : 'is-idle'}">
                            <i class="fas ${broken ? 'fa-link-slash' : ok ? (typeMissing ? 'fa-exclamation-circle' : 'fa-check-circle') : missingRequired ? 'fa-exclamation-circle' : 'fa-minus-circle'}"></i>
                            <span>${broken ? 'Afectado' : ok ? (typeMissing ? 'Tipo pendiente' : 'Mapeado') : missingRequired ? 'Pendiente' : 'Vacío'}</span>
                          </div>
                        </td>
                      </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
            <div class="${PREFIX}-footer-actions mt-3">
              <button type="button" class="btn btn-light fw-semibold" id="${PREFIX}-btn-clear-current">Limpiar mapeo</button>
            </div>
          </div>`}
      </div>

      ${state.isFactorPickerOpen && ficha ? `
        <div class="${PREFIX}-question-layer">
          <div class="${PREFIX}-question-picker-backdrop"></div>
          <div class="${PREFIX}-question-picker ${PREFIX}-factor-picker" role="dialog" aria-modal="true" aria-label="Seleccionar factor vinculado">
            <div class="${PREFIX}-question-picker-head">
              <div>
                <div class="${PREFIX}-question-picker-title">Selecciona el factor vinculado</div>
                <div class="${PREFIX}-question-picker-subtitle">Aquí deben aparecer los factores normales o los generados por respuesta para vincularlos uno a uno con la ficha.</div>
              </div>
              <button type="button" class="btn-close" id="${PREFIX}-question-cancel" aria-label="Cerrar"></button>
            </div>
            <div class="search-wrap mt-2">
              <i class="fas fa-search"></i>
              <input type="text" class="form-control bg-white" id="${PREFIX}-question-search" placeholder="Buscar factor por código o descripción..." style="padding-left:40px;" autocomplete="off" />
            </div>
            <div class="${PREFIX}-question-list mt-3 ${PREFIX}-factor-list-compact">
              ${factorRows.length ? factorRows.map(f => `
                <button type="button" class="${PREFIX}-question-option ${state.factorDraftCode === f.code ? 'is-selected' : ''}" data-question-id="${esc(f.code)}">
                  <span class="${PREFIX}-question-code">${esc(f.code)}</span>
                  <span class="${PREFIX}-question-text">${esc(f.desc)}</span>
                  <span class="${PREFIX}-factor-types">${(f.types || []).map(type => `<span class="badge rounded-pill text-bg-light border">${TYPE_OPTIONS.find(t => t.value === type)?.label || type}</span>`).join(' ')}</span>
                </button>`).join('') : `<div class="${PREFIX}-autocomplete-empty">No se encontraron factores para esa búsqueda.</div>`}
            </div>
            <div class="${PREFIX}-question-picker-actions mt-3">
              <button type="button" class="btn btn-light fw-semibold" id="${PREFIX}-question-reset">Cancelar</button>
              <button type="button" class="btn-prim" id="${PREFIX}-question-confirm" ${state.factorDraftCode ? '' : 'disabled'}>Confirmar factor</button>
            </div>
          </div>
        </div>` : ''}`;
  }

  function render(){
    const root = byId('step-6');
    if (!root) return;
    root.innerHTML = template();
    ensureModal();
    renderGrid();
    bindMain();
  }

  function summarizeRule(row){
    const entries = Object.entries(row.mappings || {}).filter(([, v]) => !!v && v !== '__NO_APLICA__').slice(0, 2).map(([field, value]) => {
      const type = row.mappingTypes?.[field] || inferTypeFromField(field);
      const typeLabel = TYPE_OPTIONS.find(t => t.value === type)?.label || type;
      return `${field} ← ${value} (${typeLabel})`;
    });
    const more = Math.max(0, Object.values(row.mappings || {}).filter(v => !!v && v !== '__NO_APLICA__').length - entries.length);
    const base = entries.join(' · ') + (more ? ` · +${more} más` : entries.length ? '' : 'Sin factores asignados');
    return row.linkedFactorCode ? `${row.linkedFactorCode} · ${base}` : base;
  }

  function renderGrid(){
    const body = byId(`${PREFIX}-grid-body`);
    if (!body) return;
    const term = String(state.gridSearch || '').trim().toLowerCase();
    const rows = getRegistryRows().filter(row => {
      const text = [row.fichaCode, row.fichaName, row.linkedFactorCode, row.linkedFactorName, ...Object.values(row.mappings || {}), ...Object.values(row.mappingTypes || {})].join(' ').toLowerCase();
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
      const statusHtml = row.linkedBroken || row.brokenRefs.length
        ? `<span class="${PREFIX}-state-pill is-broken"><i class="fas fa-link-slash"></i><span>${row.linkedBroken ? 'Factor vínculo afectado' : `${row.brokenRefs.length} afectado(s)`}</span></span>`
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

  function renderAutocomplete(){
    const list = byId(`${PREFIX}-search-list`);
    const input = byId(`${PREFIX}-search`);
    if (!list || !input) return;
    const isFocused = document.activeElement === input;
    const term = normalizeSearch(state.query || '');
    const items = state.fichas.filter(f => !term || normalizeSearch(`${f.code} ${f.name} ${f.desc}`).includes(term)).slice(0, 8);
    list.innerHTML = items.length ? items.map(f => `
      <button type="button" class="${PREFIX}-autocomplete-item" data-ficha-id="${esc(f.id)}">
        <span class="${PREFIX}-autocomplete-code">${esc(f.code)}</span>
        <span class="${PREFIX}-autocomplete-name">${esc(f.name)}</span>
        <span class="${PREFIX}-autocomplete-desc">${esc(f.desc)}</span>
      </button>`).join('') : `<div class="${PREFIX}-autocomplete-empty">No se encontraron fichas para esa búsqueda.</div>`;
    list.classList.toggle('is-open', isFocused);
  }

  function renderSelectedCard(){
    const card = byId(`${PREFIX}-selected-card`);
    if (!card) return;
    const ficha = getSelectedFicha();
    const linkedFactor = getFactorByCode(state.linkedFactorCode);
    if (!ficha) {
      card.innerHTML = `<div class="${PREFIX}-status-empty">Selecciona una ficha para comenzar a mapear.</div>`;
      return;
    }
    const completion = getCompletion(ficha, state.mappings, state.mappingTypes);
    card.innerHTML = `
      <div class="${PREFIX}-selected-head">
        <div>
          <div class="${PREFIX}-selected-code">${esc(ficha.code)}</div>
          <div class="${PREFIX}-selected-name">${esc(ficha.name)}</div>
        </div>
        <span class="badge rounded-pill ${completion.valid ? 'text-bg-success' : 'text-bg-warning'}">${completion.percent}%</span>
      </div>
      <div class="${PREFIX}-progress"><div class="${PREFIX}-progress-bar" style="width:${completion.percent}%"></div></div>
      <div class="${PREFIX}-status-meta">
        <span><strong>${completion.mapped}</strong> de <strong>${completion.total}</strong> campos mapeados</span>
        <span>${completion.missingRequired.length ? `<strong>${completion.missingRequired.length}</strong> obligatorios pendientes` : 'Obligatorios completos'}</span>
      </div>
      <div class="${PREFIX}-selected-question ${linkedFactor ? 'is-linked' : ''}">
        <span class="${PREFIX}-selected-question-label">Factor vinculado</span>
        <strong>${linkedFactor ? `${esc(linkedFactor.code)} · ${esc(linkedFactor.desc)}` : 'Pendiente por seleccionar'}</strong>
      </div>`;
  }

  function renderModalBody(){
    const body = byId(`${PREFIX}-modal-body`);
    if (!body) return;
    body.innerHTML = modalBodyTemplate();
    const title = document.querySelector(`#${PREFIX}-modal .${PREFIX}-modal-title`);
    if (title) title.innerHTML = `<i class="fas fa-link me-2"></i>${state.editingId ? 'Editar asociación de ficha' : 'Nueva asociación de ficha'}`;
    const saveBtn = byId(`${PREFIX}-btn-save`);
    if (saveBtn) saveBtn.textContent = state.editingId ? 'Actualizar asociación' : 'Guardar asociación';
    const search = byId(`${PREFIX}-search`);
    if (search) search.value = state.query;
    renderSelectedCard();
    renderAutocomplete();
    bindModal();
  }

  function selectFicha(id, options = {}){
    const ficha = state.fichas.find(f => f.id === id);
    if (!ficha) return;
    const sameFicha = state.selectedFichaId === ficha.id;
    state.selectedFichaId = ficha.id;
    state.query = formatFichaQuery(ficha);
    if (!sameFicha || !Object.keys(state.mappings || {}).length) {
      state.mappings = defaultMappingsForFicha(ficha);
      state.mappingTypes = defaultTypesForFicha(ficha);
    }
    if (options.requireFactor !== false) {
      state.linkedFactorCode = '';
      state.factorPickerQuery = '';
      state.factorDraftCode = '';
      state.isFactorPickerOpen = true;
    }
    renderModalBody();
    const input = byId(`${PREFIX}-search`);
    if (input) input.value = state.query;
  }

  function validateCurrent(showFeedback){
    const ficha = getSelectedFicha();
    if (!ficha) {
      if (showFeedback) toast('Selecciona una ficha primero.');
      return { ok:false };
    }
    const completion = getCompletion(ficha, state.mappings, state.mappingTypes);
    if (!state.linkedFactorCode) {
      if (showFeedback) toast('Selecciona el factor vinculado antes de validar o guardar.');
      return { ok:false };
    }
    const factorMap = new Map(getLiveFactors().map(f => [f.code, f]));
    const broken = Object.entries(state.mappings).filter(([, code]) => code && code !== '__NO_APLICA__' && !factorMap.has(code));
    if (broken.length || !factorMap.has(state.linkedFactorCode)) {
      if (showFeedback) toast('Hay mapeos afectados por factores que ya no existen.');
      return { ok:false };
    }
    if (completion.missingRequired.length) {
      if (showFeedback) toast(`Faltan ${completion.missingRequired.length} campo(s) obligatorio(s) por mapear.`);
      return { ok:false };
    }
    if (completion.missingTypes.length) {
      if (showFeedback) toast(`Faltan ${completion.missingTypes.length} tipo(s) de vínculo por definir.`);
      return { ok:false };
    }
    for (const [fieldCode, factorCode] of Object.entries(state.mappings)) {
      if (!factorCode || factorCode === '__NO_APLICA__') continue;
      const factor = factorMap.get(factorCode);
      const type = state.mappingTypes[fieldCode];
      if (factor && type && Array.isArray(factor.types) && factor.types.length && !factor.types.includes(type)) {
        if (showFeedback) toast(`El factor ${factor.code} no admite el tipo ${TYPE_OPTIONS.find(t => t.value === type)?.label || type}.`);
        return { ok:false };
      }
    }
    if (!completion.mapped) {
      if (showFeedback) toast('Asocia al menos un factor antes de guardar.');
      return { ok:false };
    }
    if (showFeedback) toast('Validación correcta. El mapeo está consistente.');
    return { ok:true };
  }

  function saveCurrent(){
    if (!validateCurrent(true).ok) return;
    const ficha = getSelectedFicha();
    const linkedFactor = getFactorByCode(state.linkedFactorCode);
    const payload = {
      id: state.editingId || `MAP-${Date.now()}`,
      fichaId: ficha.id,
      fichaCode: ficha.code,
      fichaName: ficha.name,
      linkedFactorCode: linkedFactor?.code || state.linkedFactorCode,
      linkedFactorName: linkedFactor?.desc || '',
      updatedAt: new Date().toISOString(),
      factorSnapshot: getLiveFactors().map(f => f.code),
      mappings: { ...state.mappings },
      mappingTypes: { ...state.mappingTypes }
    };
    const idx = state.registry.findIndex(r => r.id === payload.id);
    if (idx >= 0) state.registry.splice(idx, 1, payload); else state.registry.unshift(payload);
    toast('Asociación guardada correctamente.');
    closeModal();
    resetEditorState();
    render();
  }

  function clearCurrent(){
    const ficha = getSelectedFicha();
    if (!ficha) return;
    state.mappings = defaultMappingsForFicha(ficha);
    state.mappingTypes = defaultTypesForFicha(ficha);
    renderModalBody();
  }

  function resetEditorState(){
    state.selectedFichaId = '';
    state.query = '';
    state.mappings = {};
    state.mappingTypes = {};
    state.editingId = null;
    state.linkedFactorCode = '';
    state.factorPickerQuery = '';
    state.factorDraftCode = '';
    state.isFactorPickerOpen = false;
  }

  function editRecord(id, duplicate){
    const item = normalizeRegistryItem(state.registry.find(r => r.id === id));
    if (!item) return;
    state.selectedFichaId = item.fichaId;
    state.query = formatFichaQuery({ code:item.fichaCode, name:item.fichaName });
    state.mappings = { ...item.mappings };
    state.mappingTypes = { ...item.mappingTypes };
    state.linkedFactorCode = item.linkedFactorCode || '';
    state.factorPickerQuery = '';
    state.factorDraftCode = item.linkedFactorCode || '';
    state.isFactorPickerOpen = false;
    state.editingId = duplicate ? null : item.id;
    openModal();
    const current = new Set(getLiveFactors().map(f => f.code));
    const old = new Set(item.factorSnapshot || []);
    const changed = old.size !== current.size || [...old].some(code => !current.has(code));
    if (duplicate) toast('Se cargó una copia editable de la asociación.');
    else if (changed) toast('Aviso: la lista de factores cambió desde la última edición. Revisa el mapeo antes de guardar.');
  }

  function deleteRecord(id){
    const idx = state.registry.findIndex(r => r.id === id);
    if (idx < 0) return;
    state.registry.splice(idx, 1);
    toast('Asociación eliminada.');
    renderGrid();
    bindGrid();
  }

  function openModal(){
    const modal = ensureModal();
    renderModalBody();
    if (modalInstance) modalInstance.show(); else modal.classList.add('show');
  }
  function closeModal(){
    const modal = ensureModal();
    if (modalInstance) modalInstance.hide(); else modal.classList.remove('show');
  }

  function bindMain(){
    const btnNew = byId(`${PREFIX}-btn-new`);
    const gridSearch = byId(`${PREFIX}-grid-search`);
    if (btnNew) btnNew.addEventListener('click', () => { resetEditorState(); openModal(); });
    if (gridSearch) {
      gridSearch.value = state.gridSearch;
      gridSearch.addEventListener('input', function(){ state.gridSearch = this.value; renderGrid(); bindGrid(); });
    }
    bindGrid();
  }

  function bindGrid(){
    const body = byId(`${PREFIX}-grid-body`);
    if (!body) return;
    body.onclick = function(e){
      const btn = e.target.closest('[data-action][data-id]');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      const id = btn.getAttribute('data-id');
      if (action === 'edit') editRecord(id, false);
      if (action === 'duplicate') editRecord(id, true);
      if (action === 'delete') deleteRecord(id);
    };
  }

  function bindModal(){
    const search = byId(`${PREFIX}-search`);
    const list = byId(`${PREFIX}-search-list`);
    const btnSave = byId(`${PREFIX}-btn-save`);
    const btnClear = byId(`${PREFIX}-btn-clear-current`);
    const btnValidate = byId(`${PREFIX}-btn-validate`);
    const btnChangeFactor = byId(`${PREFIX}-btn-change-factor`);
    const factorSearch = byId(`${PREFIX}-question-search`);
    const factorConfirm = byId(`${PREFIX}-question-confirm`);
    const factorCancel = byId(`${PREFIX}-question-cancel`);
    const factorReset = byId(`${PREFIX}-question-reset`);
    const pickerHost = byId(`${PREFIX}-modal-body`);

    if (search) {
      search.addEventListener('input', function(){ state.query = this.value; renderAutocomplete(); });
      search.addEventListener('focus', renderAutocomplete);
      search.addEventListener('keydown', function(e){
        if (e.key === 'Enter') {
          const term = normalizeSearch(state.query || this.value || '');
          const first = state.fichas.find(f => !term || normalizeSearch(`${f.code} ${f.name} ${f.desc}`).includes(term));
          if (first) {
            e.preventDefault();
            selectFicha(first.id, { requireFactor:true });
          }
        }
      });
      search.addEventListener('blur', function(){
        setTimeout(() => {
          const l = byId(`${PREFIX}-search-list`);
          if (l && !l.matches(':hover')) l.classList.remove('is-open');
        }, 180);
      });
    }
    if (list) {
      const handleFichaPick = function(e){
        const btn = e.target.closest('[data-ficha-id]');
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        selectFicha(btn.getAttribute('data-ficha-id'), { requireFactor:true });
      };
      list.onmousedown = handleFichaPick;
      list.onclick = handleFichaPick;
    }
    qsa(`.${PREFIX}-map-select`).forEach(sel => sel.addEventListener('change', function(){
      const fieldCode = this.getAttribute('data-field-code');
      state.mappings[fieldCode] = this.value;
      if (this.value === '__NO_APLICA__' || !this.value) state.mappingTypes[fieldCode] = inferTypeFromField(fieldCode);
      else {
        const factor = getFactorByCode(this.value);
        const allowed = factor?.types?.length ? factor.types : TYPE_OPTIONS.map(t => t.value);
        if (!allowed.includes(state.mappingTypes[fieldCode])) state.mappingTypes[fieldCode] = allowed[0] || '';
      }
      renderModalBody();
    }));
    qsa(`.${PREFIX}-type-select`).forEach(sel => sel.addEventListener('change', function(){
      const fieldCode = this.getAttribute('data-type-field-code');
      state.mappingTypes[fieldCode] = this.value;
    }));
    if (btnChangeFactor) btnChangeFactor.addEventListener('click', function(){ state.factorDraftCode = state.linkedFactorCode || ''; state.factorPickerQuery = ''; state.isFactorPickerOpen = true; renderModalBody(); });
    if (factorSearch) {
      factorSearch.value = state.factorPickerQuery || '';
      factorSearch.addEventListener('input', function(){
        state.factorPickerQuery = this.value;
        renderModalBody();
        const inp = byId(`${PREFIX}-question-search`);
        if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
      });
      setTimeout(() => factorSearch.focus(), 20);
    }
    if (pickerHost) {
      pickerHost.onclick = function(e){
        const option = e.target.closest(`[data-question-id]`);
        if (option) {
          state.factorDraftCode = option.getAttribute('data-question-id') || '';
          qsa(`.${PREFIX}-question-option`, pickerHost).forEach(btn => btn.classList.toggle('is-selected', btn === option));
          const confirmBtn = byId(`${PREFIX}-question-confirm`);
          if (confirmBtn) confirmBtn.disabled = !state.factorDraftCode;
          return;
        }
      };
    }
    const cancelFactorFlow = () => {
      if (!state.linkedFactorCode) {
        state.selectedFichaId = '';
        state.query = '';
        state.mappings = {};
        state.mappingTypes = {};
      }
      state.factorDraftCode = '';
      state.factorPickerQuery = '';
      state.isFactorPickerOpen = false;
      renderModalBody();
    };
    if (factorCancel) factorCancel.addEventListener('click', cancelFactorFlow);
    if (factorReset) factorReset.addEventListener('click', cancelFactorFlow);
    if (factorConfirm) factorConfirm.addEventListener('click', function(){
      if (!state.factorDraftCode) return;
      state.linkedFactorCode = state.factorDraftCode;
      state.factorPickerQuery = '';
      state.isFactorPickerOpen = false;
      renderModalBody();
      toast('Factor vinculado seleccionado. Ya puedes continuar con el mapeo.');
    });
    if (btnClear) btnClear.addEventListener('click', clearCurrent);
    if (btnValidate) btnValidate.addEventListener('click', () => validateCurrent(true));
    if (btnSave) btnSave.addEventListener('click', saveCurrent);
  }

  document.addEventListener('DOMContentLoaded', render);
  window.renderSepoFichasAsociadasDemo = render;
})();
