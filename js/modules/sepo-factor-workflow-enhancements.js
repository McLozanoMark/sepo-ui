(function(){
  const QUESTION_BANK = [
    { code:'RP1', title:'Pregunta 1' },
    { code:'RP2', title:'Pregunta 2' },
    { code:'RP3', title:'Pregunta 3' },
    { code:'RP4', title:'Pregunta 4' },
    { code:'RP5', title:'Pregunta 5' },
    { code:'RP6', title:'Pregunta 6' },
    { code:'RP7', title:'Pregunta 7' },
    { code:'RP8', title:'Pregunta 8' }
  ];
  const TYPE_META = {
    puntaje: 'Puntaje',
    nivel: 'Nivel',
    interpretacion: 'Interpretación'
  };
  const SEND_TYPE_META = {
    puntaje_bruto: 'Puntaje Bruto',
    nivel: 'Nivel',
    interpretacion: 'Interpretación'
  };

  function byId(id){ return document.getElementById(id); }
  function q(sel, root){ return (root || document).querySelector(sel); }
  function qa(sel, root){ return Array.from((root || document).querySelectorAll(sel)); }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }
  function showToastSafe(msg){ if (typeof window.showToast === 'function') window.showToast(msg); }
  function codeFromDesc(desc){
    if (typeof window.sepoFactorCodeFromDesc === 'function') return window.sepoFactorCodeFromDesc(desc);
    const clean = String(desc || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
    const short = clean.slice(0, 2).map(s => s.slice(0, 3)).join('-') || 'FAC';
    return `FAC-${short}`;
  }
  function detailHtml(lines){
    if (typeof window.sepoFactorDetailHTML === 'function') return window.sepoFactorDetailHTML(lines);
    return `<div class="sepo-factor-detail-lines">${(lines || []).map((line, idx) => idx === 0 ? `<span class="sepo-factor-detail-chip">${esc(line)}</span>` : `<div>${esc(line)}</div>`).join('')}</div>`;
  }
  function factors(){
    window.sepoFactorsData = Array.isArray(window.sepoFactorsData) ? window.sepoFactorsData : [];
    return window.sepoFactorsData;
  }
  function selectedOutputTypes(){
    const values = qa('input[name="facOutputType"]:checked').map(el => el.value);
    return values.length ? values : ['puntaje'];
  }
  function serializeForm(){
    return {
      desc: (byId('facDesc')?.value || '').trim(),
      formula: (byId('facFormula')?.value || '').trim(),
      ord: parseInt(byId('facOrd')?.value || '1', 10) || 1,
      dec: parseInt(byId('facDec')?.value || '2', 10) || 2,
      dep: qa('input[name="facDependencia"]:checked').map(i => i.value).join(','),
      outputTypes: selectedOutputTypes(),
      generateByQuestion: !!byId('facGenerateByQuestion')?.checked,
      expectedEnabled: !!byId('facExpectedSwitch')?.checked,
      expectedMin: byId('facExpectedMin')?.value || '',
      expectedMax: byId('facExpectedMax')?.value || '',
      resultConfig: typeof window.getSepoAuxConfig === 'function' ? window.getSepoAuxConfig() : null
    };
  }
  function applyForm(data){
    if (byId('facDesc')) byId('facDesc').value = data.desc || '';
    if (byId('facOrd')) byId('facOrd').value = data.ord || 1;
    if (byId('facDec')) byId('facDec').value = data.dec ?? 2;
    if (typeof window.syncFormula === 'function') window.syncFormula(data.formula || '');
    qa('input[name="facDependencia"]').forEach(i => { i.checked = String(data.dep || '').split(',').map(v => v.trim()).includes(i.value); });
    qa('input[name="facOutputType"]').forEach(i => { i.checked = (data.outputTypes || []).includes(i.value); });
    if (byId('facGenerateByQuestion')) byId('facGenerateByQuestion').checked = !!data.generateByQuestion;
    if (byId('facExpectedSwitch')) byId('facExpectedSwitch').checked = !!data.expectedEnabled;
    if (byId('facExpectedMin')) byId('facExpectedMin').value = data.expectedMin ?? '';
    if (byId('facExpectedMax')) byId('facExpectedMax').value = data.expectedMax ?? '';
    if (typeof window.setSepoAuxConfig === 'function') window.setSepoAuxConfig(data.resultConfig || null);
    toggleExpectedRange();
  }
  function resetForm(){
    applyForm({ desc:'', formula:'', ord:factors().length + 1, dec:2, dep:'', outputTypes:['puntaje'], generateByQuestion:false, expectedEnabled:false, expectedMin:'', expectedMax:'', sendDataType:'puntaje_bruto', resultConfig:null });
    if (typeof window.resetSepoAuxConfig === 'function') window.resetSepoAuxConfig();
    window.sepoFactorEditingIndex = null;
    const btn = document.querySelector('button[onclick="addFactor()"]');
    if (btn) btn.innerHTML = '<i class="fas fa-save me-2"></i> Guardar Nuevo Factor';
  }
  function ensureControls(){
    const deps = q('.sepo-factor-deps');
    if (!deps || byId('facGenerateByQuestion')) return;
    const wrap = document.createElement('div');
    wrap.className = 'sepo-factor-advanced-grid mt-3';
    wrap.innerHTML = `
      <div class="sepo-factor-advanced-card">
        <div class="sepo-factor-advanced-title">Automatización del factor</div>
        <label class="form-check form-switch sepo-ui-switch mb-0" for="facGenerateByQuestion">
          <input class="form-check-input" id="facGenerateByQuestion" type="checkbox" />
          <span class="form-check-label">Generar factores por respuesta</span>
        </label>
        <div class="sepo-factor-advanced-help">Si se activa, el sistema generará un factor por cada pregunta disponible para vincularlos luego en fichas asociadas.</div>
      </div>
      <div class="sepo-factor-advanced-card">
        <div class="sepo-factor-advanced-title">Tipos de vinculación</div>
        <div class="sepo-factor-output-types">
          <label class="form-check"><input class="form-check-input" type="checkbox" name="facOutputType" value="puntaje" checked /> <span class="form-check-label">Puntaje</span></label>
          <label class="form-check"><input class="form-check-input" type="checkbox" name="facOutputType" value="nivel" checked /> <span class="form-check-label">Nivel</span></label>
          <label class="form-check"><input class="form-check-input" type="checkbox" name="facOutputType" value="interpretacion" checked /> <span class="form-check-label">Interpretación</span></label>
        </div>
      </div>
      <div class="sepo-factor-advanced-card sepo-factor-advanced-card--expected">
        <div class="sepo-factor-advanced-title">Valor esperado</div>
        <label class="form-check form-switch sepo-ui-switch mb-0" for="facExpectedSwitch">
          <input class="form-check-input" id="facExpectedSwitch" type="checkbox" />
          <span class="form-check-label">Activar valor esperado</span>
        </label>
        <div class="sepo-factor-expected-range mt-2" id="facExpectedRange" hidden>
          <div class="row g-2">
            <div class="col-6"><label class="form-label small fw-bold text-primary">Mínimo</label><input class="form-control" id="facExpectedMin" type="number" step="any" /></div>
            <div class="col-6"><label class="form-label small fw-bold text-primary">Máximo</label><input class="form-control" id="facExpectedMax" type="number" step="any" /></div>
          </div>
        </div>
      </div>`;
    deps.insertAdjacentElement('afterend', wrap);
    byId('facExpectedSwitch')?.addEventListener('change', toggleExpectedRange);
  }
  function toggleExpectedRange(){
    const box = byId('facExpectedRange');
    if (!box) return;
    box.hidden = !byId('facExpectedSwitch')?.checked;
  }
  function normalizeFactor(f){
    return {
      ...f,
      outputTypes: Array.isArray(f.outputTypes) && f.outputTypes.length ? f.outputTypes : ['puntaje','nivel','interpretacion'],
      expectedEnabled: !!f.expectedEnabled,
      expectedMin: f.expectedMin ?? '',
      expectedMax: f.expectedMax ?? '',
      generatedByQuestion: !!f.generatedByQuestion,
      groupCode: f.groupCode || f.code,
      groupLabel: f.groupLabel || f.desc,
      sendDataType: f.sendDataType || 'puntaje_bruto',
      resultConfig: f.resultConfig || null
    };
  }
  function groupedFactors(){
    const map = new Map();
    factors().map(normalizeFactor).forEach((factor, index) => {
      const key = factor.generatedByQuestion ? (factor.groupCode || factor.code) : factor.code;
      const entry = map.get(key) || { factor, indexes: [], members: [] };
      entry.indexes.push(index);
      entry.members.push(factor);
      if (!map.has(key)) map.set(key, entry);
    });
    return Array.from(map.values());
  }
  function renderCards(){
    const box = byId('boxFac');
    if (!box) return;
    box.innerHTML = groupedFactors().map(group => {
      const factor = group.factor;
      const typeBadges = (factor.outputTypes || []).map(t => `<span class="sepo-factor-badge">${TYPE_META[t] || t}</span>`).join('');
      const expected = factor.expectedEnabled ? `<span class="sepo-factor-range">Esperado: ${esc(factor.expectedMin)} a ${esc(factor.expectedMax)}</span>` : '';
      const auto = factor.generatedByQuestion ? `<span class="sepo-factor-auto">Generado por respuesta · ${group.members.length} factor(es)</span>` : '';
      const aux = factor.resultConfig && Array.isArray(factor.resultConfig.auxRows) && factor.resultConfig.auxRows.length ? `<span class="sepo-factor-aux-chip"><i class="fas fa-table-list"></i>${factor.resultConfig.auxRows.length} baremo(s)</span>` : '';
      return `
        <div class="sepo-factor-item" data-index="${group.indexes[0]}">
          <div class="sepo-factor-item-main">
            <span class="sepo-factor-code">${esc(factor.generatedByQuestion ? factor.groupCode : factor.code)}</span>
            <span class="sepo-factor-title">${esc(factor.generatedByQuestion ? factor.groupLabel : factor.desc)}</span>
            <span class="sepo-factor-formula">${esc(factor.generatedByQuestion ? 'Generación automática por respuesta' : (factor.formula || 'Sin fórmula'))}</span>
            <div class="sepo-factor-meta-line">${typeBadges}${expected}${auto}${aux}</div>
          </div>
          <div class="sepo-factor-actions">
            <button class="btn btn-sm btn-outline-primary" title="Editar Factor" onclick="editarFactorRowByIndex(${group.indexes[0]})"><i class="fas fa-pen"></i></button>
            <button class="btn btn-sm btn-outline-secondary" title="Duplicar Factor" onclick="duplicarFactorByIndex(${group.indexes[0]})"><i class="fas fa-copy"></i></button>
            <button class="btn btn-sm btn-outline-danger" title="Eliminar Factor" onclick="eliminarFactorByIndex(${group.indexes[0]})"><i class="fas fa-times"></i></button>
          </div>
        </div>`;
    }).join('');
  }
  function renderSummary(){
    const table = q('.sepo-factor-summary-table');
    const body = byId('factorSummaryBody');
    if (!body || !table) return;
    const thead = table.querySelector('thead');
    if (thead) thead.innerHTML = `<tr><th>Factor</th><th>Descripción</th><th>Dato a Enviar</th><th>Vinculación</th><th>Valor esperado</th><th>Asignaciones</th><th>Acumulado</th><th>Detalle</th></tr>`;
    body.innerHTML = groupedFactors().map(group => {
      const factor = group.factor;
      const assignmentTotal = group.members.reduce((sum, item) => sum + Number(item.assignments || 0), 0);
      const accumTotal = group.members.reduce((sum, item) => sum + Number(item.total || 0), 0);
      const detailLines = factor.generatedByQuestion
        ? [factor.formula || 'Generado por respuesta', `Grupo automático: ${group.members.length} factor(es)`, ...group.members.map(item => `${item.desc} · ${item.formula || 'Sin fórmula'}`)]
        : (factor.detail || []);
      if (factor.resultConfig && Array.isArray(factor.resultConfig.auxRows) && factor.resultConfig.auxRows.length) detailLines.push(`Tabla auxiliar: ${factor.resultConfig.auxRows.length} segmento(s) configurado(s)`);
      return `
        <tr>
          <td><strong>${esc(factor.generatedByQuestion ? factor.groupCode : factor.code)}</strong></td>
          <td>${esc(factor.generatedByQuestion ? factor.groupLabel : factor.desc)}</td>
          <td>
            <select class="form-select sepo-factor-send-select" onchange="window.sepoSetFactorSendType(${group.indexes[0]}, this.value)">
              ${Object.entries(SEND_TYPE_META).map(([key,label]) => `<option value="${key}" ${factor.sendDataType === key ? 'selected' : ''}>${label}</option>`).join('')}
            </select>
          </td>
          <td><div class="sepo-factor-summary-types">${(factor.outputTypes || []).map(t => `<span class="sepo-factor-badge">${TYPE_META[t] || t}</span>`).join('')}</div></td>
          <td>${factor.expectedEnabled ? `<span class="sepo-factor-range">${esc(factor.expectedMin)} a ${esc(factor.expectedMax)}</span>` : '<span class="text-muted">No definido</span>'}</td>
          <td>${assignmentTotal}</td>
          <td><span class="badge rounded-pill text-bg-light border">${accumTotal}</span></td>
          <td>${detailHtml(detailLines)}</td>
        </tr>`;
    }).join('');
  }
  function renderAll(){ renderCards(); renderSummary(); }

  function buildFactorFromForm(data, overrides){
    const base = {
      code: codeFromDesc(data.desc),
      desc: data.desc,
      formula: data.formula || 'RP1 + RP2',
      ord: data.ord,
      dec: data.dec,
      dep: data.dep,
      assignments: 0,
      total: data.dec > 0 ? data.dec + 1 : 1,
      detail: [data.formula || 'RP1 + RP2', 'Base: 0', 'Sin asignaciones aún'],
      outputTypes: data.outputTypes.slice(),
      expectedEnabled: data.expectedEnabled,
      expectedMin: data.expectedMin,
      expectedMax: data.expectedMax,
      generatedByQuestion: false,
      groupCode: '',
      groupLabel: '',
      sendDataType: data.sendDataType || 'puntaje_bruto',
      resultConfig: data.resultConfig || null
    };
    return { ...base, ...(overrides || {}) };
  }
  function replaceGroup(startIndex, items){
    const current = normalizeFactor(factors()[startIndex] || {});
    const groupCode = current.generatedByQuestion ? current.groupCode : current.code;
    const indexes = [];
    factors().forEach((f, idx) => {
      const row = normalizeFactor(f);
      if ((row.generatedByQuestion && row.groupCode === groupCode) || (!row.generatedByQuestion && row.code === groupCode && idx === startIndex)) indexes.push(idx);
    });
    indexes.sort((a,b) => b-a).forEach(idx => factors().splice(idx,1));
    factors().push(...items);
  }
  function addOrUpdateFactor(){
    ensureControls();
    const data = serializeForm();
    if (!data.desc) { alert('Completa la descripción del factor.'); return; }
    if (!data.outputTypes.length) { alert('Selecciona al menos un tipo de vinculación para el factor.'); return; }
    if (data.expectedEnabled && (data.expectedMin === '' || data.expectedMax === '')) { alert('Completa el mínimo y máximo del valor esperado.'); return; }
    const editing = window.sepoFactorEditingIndex;
    const items = data.generateByQuestion
      ? QUESTION_BANK.map((q, idx) => buildFactorFromForm(data, {
          code: `${codeFromDesc(data.desc)}-P${idx+1}`,
          desc: `Factor Pregunta ${idx+1}`,
          formula: q.code,
          detail: [q.code, `Origen: ${q.title}`, 'Generado automáticamente por respuesta'],
          generatedByQuestion: true,
          groupCode: codeFromDesc(data.desc),
          groupLabel: data.desc,
          ord: data.ord + idx
        }))
      : [buildFactorFromForm(data)];

    if (editing !== null && editing !== undefined) {
      replaceGroup(Number(editing), items);
      showToastSafe('✅ Factor actualizado.');
    } else {
      factors().push(...items);
      showToastSafe(data.generateByQuestion ? '✅ Factores generados por respuesta.' : '✅ Factor guardado.');
    }
    resetForm();
    renderAll();
    window.renderSepoFichasAsociadasDemo?.();
  }
  function editFactor(index){
    const factor = normalizeFactor(factors()[index]);
    if (!factor) return;
    if (factor.generatedByQuestion) {
      const members = factors().map(normalizeFactor).filter(f => f.generatedByQuestion && f.groupCode === factor.groupCode);
      const source = members[0] || factor;
      applyForm({
        desc: source.groupLabel || source.desc,
        formula: source.formula || '',
        ord: source.ord || index + 1,
        dec: source.dec ?? 2,
        dep: source.dep || '',
        outputTypes: source.outputTypes || ['puntaje'],
        generateByQuestion: true,
        expectedEnabled: source.expectedEnabled,
        expectedMin: source.expectedMin,
        expectedMax: source.expectedMax,
        sendDataType: source.sendDataType,
        resultConfig: source.resultConfig
      });
    } else {
      applyForm({
        desc: factor.desc,
        formula: factor.formula,
        ord: factor.ord || index + 1,
        dec: factor.dec ?? 2,
        dep: factor.dep || '',
        outputTypes: factor.outputTypes || ['puntaje'],
        generateByQuestion: false,
        expectedEnabled: factor.expectedEnabled,
        expectedMin: factor.expectedMin,
        expectedMax: factor.expectedMax,
        sendDataType: factor.sendDataType,
        resultConfig: factor.resultConfig
      });
    }
    window.sepoFactorEditingIndex = index;
    const btn = document.querySelector('button[onclick="addFactor()"]');
    if (btn) btn.innerHTML = '<i class="fas fa-sync me-2"></i> Actualizar Factor';
    byId('facDesc')?.scrollIntoView({ behavior:'smooth', block:'center' });
  }
  function duplicateFactor(index){
    const factor = normalizeFactor(factors()[index]);
    if (!factor) return;
    if (factor.generatedByQuestion) {
      const members = factors().map(normalizeFactor).filter(f => f.generatedByQuestion && f.groupCode === factor.groupCode);
      const newGroupCode = `${factor.groupCode}-COPY`;
      const copies = members.map((item, idx) => ({
        ...item,
        code: `${newGroupCode}-P${idx+1}`,
        groupCode: newGroupCode,
        groupLabel: `${factor.groupLabel || factor.desc} (Copia)`,
        detail: [item.formula || '', 'Base: 0', 'Sin asignaciones aún'],
        assignments: 0
      }));
      factors().push(...copies);
      showToastSafe('✅ Grupo de factores duplicado.');
    } else {
      const copy = { ...factor, code: `${factor.code}_COPY`, desc: `${factor.desc} (Copia)`, detail:[factor.formula || 'RP1 + RP2', 'Base: 0', 'Sin asignaciones aún'], assignments:0 };
      factors().push(copy);
      showToastSafe('✅ Factor duplicado.');
    }
    renderAll();
    window.renderSepoFichasAsociadasDemo?.();
  }
  function deleteFactor(index){
    const factor = normalizeFactor(factors()[index]);
    if (!factor) return;
    if (factor.generatedByQuestion) {
      for (let i = factors().length - 1; i >= 0; i -= 1) {
        const row = normalizeFactor(factors()[i]);
        if (row.generatedByQuestion && row.groupCode === factor.groupCode) factors().splice(i, 1);
      }
    } else {
      factors().splice(index,1);
    }
    renderAll();
    window.renderSepoFichasAsociadasDemo?.();
  }


  function setFactorSendType(index, value){
    const factor = normalizeFactor(factors()[index]);
    if (!factor) return;
    if (factor.generatedByQuestion) {
      factors().forEach((item, idx) => {
        const row = normalizeFactor(item);
        if (row.generatedByQuestion && row.groupCode === factor.groupCode) factors()[idx].sendDataType = value;
      });
    } else {
      factors()[index].sendDataType = value;
    }
    renderSummary();
    showToastSafe('✅ Tipo de dato a enviar actualizado.');
  }

  function applyVisualDifferentiation(){
    q('.sfb2-library-panel')?.classList.add('sfb2-panel--library-accent');
    q('#sfb2OperatorsPanel')?.classList.add('sfb2-panel--operators-accent');
    q('.sfb2-canvas-panel')?.classList.add('sfb2-panel--formula-accent');
  }

  document.addEventListener('DOMContentLoaded', function(){
    ensureControls();
    toggleExpectedRange();
    qa('input[name="facOutputType"]').forEach(el => el.addEventListener('change', function(){
      if (!selectedOutputTypes().length) { this.checked = true; showToastSafe('Debe quedar al menos un tipo de vinculación activo.'); }
    }));
    applyVisualDifferentiation();
    window.renderFactorCards = renderCards;
    window.renderFactorSummary = renderSummary;
    window.renderFactorsStep = renderAll;
    window.addFactor = addOrUpdateFactor;
    window.editarFactorRowByIndex = editFactor;
    window.duplicarFactorByIndex = duplicateFactor;
    window.eliminarFactorByIndex = deleteFactor;
    window.sepoSetFactorSendType = setFactorSendType;
    renderAll();
  });
})();
