(function(){
  const DEFAULT_ROWS = [
    { sexo:'M', edadMin:'18', edadMax:'25', p1:'10', p2:'3', p3:'Leve', interpretacion:'Varón de 18 a 25 con baremo inicial leve.' },
    { sexo:'F', edadMin:'26', edadMax:'40', p1:'14', p2:'5', p3:'Moderado', interpretacion:'Mujer de 26 a 40 con tendencia a rango moderado.' }
  ];
  const DEFAULT_RESULTS = {
    general: {
      levelName:'Nivel de riesgo medio',
      baseScore:'55',
      shortRecommendation:'Requiere seguimiento clínico',
      interpretation:'El resultado general sugiere presencia moderada del rasgo evaluado y requiere observación complementaria.',
      recommendation:'Se recomienda revisar antecedentes, comparar con entrevista clínica y aplicar seguimiento periódico.'
    },
    segmentacion: {
      interpretation:'Los baremos segmentados complementan la lectura general y refinan el resultado según sexo, edad y parámetros auxiliares.',
      recommendation:'Usar la segmentación para ajustar la interpretación final y priorizar intervenciones específicas por grupo.'
    }
  };
  function byId(id){ return document.getElementById(id); }
  function q(sel, root){ return (root || document).querySelector(sel); }
  function qa(sel, root){ return Array.from((root || document).querySelectorAll(sel)); }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }
  function toast(msg){ if (typeof window.showToast === 'function') window.showToast(msg); }
  function defaultState(){ return { auxRows: DEFAULT_ROWS.map(r => ({...r})), resultConfig: JSON.parse(JSON.stringify(DEFAULT_RESULTS)) }; }
  const state = defaultState();

  function buildRow(row, idx){
    return `<tr data-aux-row="${idx}">
      <td><select class="form-select" data-aux-field="sexo"><option value="M" ${row.sexo==='M'?'selected':''}>M</option><option value="F" ${row.sexo==='F'?'selected':''}>F</option></select></td>
      <td><input class="form-control" data-aux-field="edadMin" type="number" min="0" value="${esc(row.edadMin)}" /></td>
      <td><input class="form-control" data-aux-field="edadMax" type="number" min="0" value="${esc(row.edadMax)}" /></td>
      <td><input class="form-control" data-aux-field="p1" value="${esc(row.p1)}" /></td>
      <td><input class="form-control" data-aux-field="p2" value="${esc(row.p2)}" /></td>
      <td><input class="form-control" data-aux-field="p3" value="${esc(row.p3)}" /></td>
      <td><textarea class="form-control fac-aux-interpretacion" data-aux-field="interpretacion">${esc(row.interpretacion)}</textarea></td>
      <td class="text-center"><button class="btn btn-sm btn-outline-danger" data-aux-remove="${idx}" type="button"><i class="fas fa-trash-alt"></i></button></td>
    </tr>`;
  }
  function renderAuxTable(){
    const body = byId('facAuxTableBody');
    if (!body) return;
    body.innerHTML = state.auxRows.map(buildRow).join('');
    renderSegmentResults();
    renderRangeMaintenance();
    syncAuxLauncher();
    syncRangeTabState();
  }
  function renderSegmentResults(){
    const body = byId('facSegmentResultBody');
    if (!body) return;
    body.innerHTML = state.auxRows.map((row, idx) => `
      <tr>
        <td><span class="sepo-factor-aux-chip">Segmento ${idx + 1}</span></td>
        <td>${esc(row.sexo)} · ${esc(row.edadMin)}-${esc(row.edadMax)} años · P1 ${esc(row.p1)} · P2 ${esc(row.p2)} · P3 ${esc(row.p3)}</td>
        <td><textarea class="form-control fac-long-textarea" data-seg-field="interpretation" data-seg-row="${idx}">${esc(row.interpretacion || '')}</textarea></td>
        <td><textarea class="form-control fac-long-textarea" data-seg-field="recommendation" data-seg-row="${idx}">${esc('Aplicar seguimiento según ' + (row.p3 || 'segmento definido') + '.')}</textarea></td>
      </tr>`).join('');
  }
  function renderRangeMaintenance(){
    const body = byId('facRangeMaintenanceBody');
    if (!body) return;
    body.innerHTML = state.auxRows.map((row, idx) => `
      <tr>
        <td><span class="sepo-factor-aux-chip">Rango ${idx + 1}</span></td>
        <td>${esc(row.sexo)} · ${esc(row.edadMin)}-${esc(row.edadMax)} años</td>
        <td>
          <div class="small text-muted mb-1">P1 ${esc(row.p1)} · P2 ${esc(row.p2)} · P3 ${esc(row.p3)}</div>
          <textarea class="form-control fac-long-textarea" data-range-field="valueNote" data-range-row="${idx}" placeholder="Describe cómo se utiliza este rango...">${esc(row.interpretacion || '')}</textarea>
        </td>
        <td>
          <textarea class="form-control fac-long-textarea" data-range-field="opsNote" data-range-row="${idx}" placeholder="Describe la lectura operativa del rango...">${esc('Usar este rango cuando coincidan sexo, edad y valores auxiliares del segmento.')}</textarea>
        </td>
      </tr>`).join('');
  }
  function shouldEnableRangeMaintenance(){
    const formula = (byId('facFormulaReadonly')?.value || byId('facFormula')?.value || '').toUpperCase();
    const hasAuxRows = Array.isArray(state.auxRows) && state.auxRows.length > 0;
    const depEdad = !!byId('facDepEdad')?.checked;
    return hasAuxRows && (formula.includes('TABLA_AUXILIAR') || depEdad);
  }
  function syncRangeTabState(){
    const tabBtn = byId('facRangeMaintenanceTab');
    const panel = q('[data-baremo-panel="rangos"]');
    if (!tabBtn || !panel) return;
    const enabled = shouldEnableRangeMaintenance();
    tabBtn.classList.toggle('d-none', !enabled);
    panel.classList.toggle('d-none', !enabled);
    if (!enabled && tabBtn.classList.contains('is-active')) switchBaremos('general');
  }
  function syncAuxLauncher(){
    const countEl = byId('facAuxRangeCount');
    const modeEl = byId('facAuxModeText');
    const textEl = byId('facAuxStatusText');
    const count = Array.isArray(state.auxRows) ? state.auxRows.length : 0;
    if (countEl) countEl.textContent = String(count);
    if (modeEl) modeEl.textContent = count ? 'Lista' : 'Inactiva';
    if (textEl) {
      textEl.textContent = count
        ? `${count} rangos listos para usar.`
        : 'Sin rangos cargados.';
    }
  }
  function updateStateFromAuxTable(){
    const rows = qa('#facAuxTableBody tr');
    state.auxRows = rows.map(row => {
      const get = field => q(`[data-aux-field="${field}"]`, row)?.value || '';
      return { sexo:get('sexo'), edadMin:get('edadMin'), edadMax:get('edadMax'), p1:get('p1'), p2:get('p2'), p3:get('p3'), interpretacion:get('interpretacion') };
    });
    renderSegmentResults();
    renderRangeMaintenance();
    syncAuxLauncher();
    syncRangeTabState();
  }
  function bindResultsConfig(){
    byId('facGeneralLevelName').value = state.resultConfig.general.levelName || '';
    byId('facGeneralBaseScore').value = state.resultConfig.general.baseScore || '';
    byId('facGeneralShortRecommendation').value = state.resultConfig.general.shortRecommendation || '';
    byId('facGeneralInterpretation').value = state.resultConfig.general.interpretation || '';
    byId('facGeneralRecommendation').value = state.resultConfig.general.recommendation || '';
    byId('facSegmentInterpretation').value = state.resultConfig.segmentacion.interpretation || '';
    byId('facSegmentRecommendation').value = state.resultConfig.segmentacion.recommendation || '';
    syncRangeTabState();
    syncAuxLauncher();
  }
  function captureResultsConfig(){
    state.resultConfig.general = {
      levelName: byId('facGeneralLevelName')?.value || '',
      baseScore: byId('facGeneralBaseScore')?.value || '',
      shortRecommendation: byId('facGeneralShortRecommendation')?.value || '',
      interpretation: byId('facGeneralInterpretation')?.value || '',
      recommendation: byId('facGeneralRecommendation')?.value || ''
    };
    state.resultConfig.segmentacion = {
      interpretation: byId('facSegmentInterpretation')?.value || '',
      recommendation: byId('facSegmentRecommendation')?.value || ''
    };
  }
  function switchBaremos(tab){
    qa('.fac-baremos-tab').forEach(btn => btn.classList.toggle('is-active', btn.dataset.baremoTab === tab));
    qa('.fac-baremos-panel').forEach(panel => panel.classList.toggle('is-active', panel.dataset.baremoPanel === tab));
  }
  function translateFormula(formula){
    const clean = String(formula || '').trim();
    if (!clean) return 'Aquí se explicará en lenguaje natural cómo se interpreta la fórmula.';
    const normalized = clean.replace(/\s+/g, ' ').trim();
    const ifMatch = normalized.match(/^SI\s*\(\s*(.+?)\s*;\s*(.+?)\s*;\s*(.+?)\s*\)$/i);
    if (ifMatch) {
      const condText = humanizeCondition(ifMatch[1]);
      return `Si ${condText}, entonces el resultado es ${humanizeValue(ifMatch[2])}, de lo contrario es ${humanizeValue(ifMatch[3])}.`;
    }
    const auxMatch = normalized.match(/^TABLA_AUXILIAR_([A-Z0-9_\-]+)\s*\((.*?)\)$/i);
    if (auxMatch) {
      const params = auxMatch[2].split(',').map(v => v.trim()).filter(Boolean).map(humanizeValue);
      return `Se obtendrá el valor desde la Tabla Auxiliar usando los resultados de ${params.join(' y ')} para el factor ${humanizeCode(auxMatch[1])}.`;
    }
    if (/TABLA_AUXILIAR/i.test(normalized)) {
      const params = normalized.match(/\((.*?)\)/);
      const list = params ? params[1].split(',').map(v => v.trim()).filter(Boolean).map(humanizeValue) : [];
      return `Se obtendrá el valor desde la Tabla Auxiliar${list.length ? ' usando los resultados de ' + list.join(' y ') : ''}.`;
    }
    const comparators = ['>=','<=','>','<','=='];
    if (comparators.some(op => normalized.includes(op))) return humanizeCondition(normalized).replace(/^/, 'Se evaluará si ').replace(/$/, '.');
    return 'La fórmula combinará ' + normalized.split(/\s*[+×÷\-]\s*/).filter(Boolean).map(humanizeValue).join(', ') + ' para obtener el resultado final.';
  }
  function humanizeCondition(cond){
    const m = String(cond).trim().match(/(.+?)\s*(>=|<=|>|<|==)\s*(.+)/);
    if (!m) return humanizeValue(cond);
    const map = { '>':'es mayor a', '<':'es menor a', '>=':'es mayor o igual a', '<=':'es menor o igual a', '==':'es igual a' };
    return `${humanizeValue(m[1])} ${map[m[2]] || m[2]} ${humanizeValue(m[3])}`;
  }
  function humanizeValue(value){
    const raw = String(value || '').trim();
    if (/^FAC[-_]/i.test(raw)) return 'el ' + humanizeCode(raw).replace(/^factor\s+/i, 'Factor ');
    if (/^RP\d+$/i.test(raw)) return 'el resultado de ' + raw.toUpperCase();
    if (/^VALOR_/i.test(raw)) return raw.replace(/^VALOR_/i, 'Valor ').replace(/_/g, ' ');
    if (/^P\d+$/i.test(raw)) return 'P' + raw.slice(1);
    return raw.replace(/_/g, ' ');
  }
  function humanizeCode(code){
    const pretty = String(code || '').replace(/^FAC[-_]?/i, 'Factor ').replace(/_/g, ' ').replace(/-/g, ' ');
    return pretty;
  }
  function updateHumanFormula(){
    const src = byId('facFormulaReadonly');
    const dst = byId('facFormulaHumanReadonly');
    if (!dst) return;
    dst.value = translateFormula(src?.value || '');
  }
  function getConfig(){
    updateStateFromAuxTable();
    captureResultsConfig();
    return JSON.parse(JSON.stringify({ auxRows: state.auxRows, resultConfig: state.resultConfig }));
  }
  function setConfig(config){
    const next = config && typeof config === 'object' ? config : defaultState();
    state.auxRows = Array.isArray(next.auxRows) && next.auxRows.length ? next.auxRows.map(r => ({...r})) : defaultState().auxRows;
    state.resultConfig = next.resultConfig ? JSON.parse(JSON.stringify(next.resultConfig)) : JSON.parse(JSON.stringify(DEFAULT_RESULTS));
    renderAuxTable();
    bindResultsConfig();
    renderRangeMaintenance();
    syncRangeTabState();
    syncAuxLauncher();
  }
  function resetConfig(){ setConfig(defaultState()); }
  function attachEvents(){
    byId('facAuxAddRow')?.addEventListener('click', () => {
      updateStateFromAuxTable();
      state.auxRows.push({ sexo:'M', edadMin:'18', edadMax:'30', p1:'0', p2:'0', p3:'Nuevo', interpretacion:'Nueva interpretación segmentada.' });
      renderAuxTable();
      toast('✅ Fila añadida a la tabla auxiliar.');
    });
    byId('facAuxDownloadTemplate')?.addEventListener('click', () => toast('⬇️ Plantilla simulada descargada correctamente.'));
    byId('facAuxLoadTable')?.addEventListener('click', () => {
      state.auxRows = [
        { sexo:'M', edadMin:'18', edadMax:'25', p1:'10', p2:'3', p3:'Bajo', interpretacion:'Rango masculino joven con resultado bajo.' },
        { sexo:'F', edadMin:'26', edadMax:'35', p1:'15', p2:'6', p3:'Alto', interpretacion:'Rango femenino adulto con alerta alta.' },
        { sexo:'M', edadMin:'36', edadMax:'50', p1:'12', p2:'4', p3:'Moderado', interpretacion:'Rango adulto medio con lectura moderada.' }
      ];
      renderAuxTable();
      toast('📋 Tabla auxiliar simulada cargada correctamente.');
    });
    byId('facAuxOpenModal')?.addEventListener('click', () => {
      updateStateFromAuxTable();
      const modalEl = byId('facAuxModal');
      if (!modalEl || !window.bootstrap?.Modal) return;
      window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
    });
    byId('facAuxSaveAndClose')?.addEventListener('click', () => {
      updateStateFromAuxTable();
      syncAuxLauncher();
      syncRangeTabState();
      const modalEl = byId('facAuxModal');
      if (modalEl && window.bootstrap?.Modal) window.bootstrap.Modal.getOrCreateInstance(modalEl).hide();
      toast('✅ Tabla auxiliar actualizada correctamente.');
    });
    document.addEventListener('input', (e) => {
      if (e.target.closest('#facAuxTableBody')) updateStateFromAuxTable();
      if (e.target.id === 'facFormulaReadonly' || e.target.id === 'facFormula') {
        updateHumanFormula();
        syncRangeTabState();
      }
      if (e.target.closest('[data-seg-field]')) return;
      if (['facGeneralLevelName','facGeneralBaseScore','facGeneralShortRecommendation','facGeneralInterpretation','facGeneralRecommendation','facSegmentInterpretation','facSegmentRecommendation'].includes(e.target.id)) captureResultsConfig();
      if (['facDepEdad','facDepSexo','facDepNivel'].includes(e.target.id)) syncRangeTabState();
    });
    document.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('[data-aux-remove]');
      if (removeBtn) {
        updateStateFromAuxTable();
        const idx = Number(removeBtn.getAttribute('data-aux-remove'));
        if (!Number.isNaN(idx)) state.auxRows.splice(idx, 1);
        if (!state.auxRows.length) state.auxRows.push({ sexo:'M', edadMin:'18', edadMax:'30', p1:'0', p2:'0', p3:'Base', interpretacion:'Fila base de segmentación.' });
        renderAuxTable();
        toast('🗑️ Fila eliminada de la tabla auxiliar.');
        return;
      }
      const tab = e.target.closest('.fac-baremos-tab');
      if (tab) switchBaremos(tab.dataset.baremoTab || 'general');
    });
    const formulaReadonly = byId('facFormulaReadonly');
    if (formulaReadonly && 'MutationObserver' in window) {
      const observer = new MutationObserver(updateHumanFormula);
      observer.observe(formulaReadonly, { attributes:true, attributeFilter:['value'] });
    }
    ['facFormulaReadonly','facFormula'].forEach(id => byId(id)?.addEventListener('change', () => {
      updateHumanFormula();
      syncRangeTabState();
    }));
    ['facDepEdad','facDepSexo','facDepNivel'].forEach(id => byId(id)?.addEventListener('change', syncRangeTabState));
  }
  document.addEventListener('DOMContentLoaded', function(){
    renderAuxTable();
    bindResultsConfig();
    renderRangeMaintenance();
    switchBaremos('general');
    attachEvents();
    updateHumanFormula();
    syncAuxLauncher();
    syncRangeTabState();
    window.getSepoAuxConfig = getConfig;
    window.setSepoAuxConfig = setConfig;
    window.resetSepoAuxConfig = resetConfig;
    window.translateSepoFactorFormulaHuman = translateFormula;
  });
})();
