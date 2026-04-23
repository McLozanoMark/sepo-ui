(() => {
  const state = {
    records: [],
    filteredRecords: [],
    selectedRecord: null,
    pendingAction: null,
    bootstrap: { mainModal: null, confirmModal: null, toast: null, tooltips: [] },
  };

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    state.records = buildRecords();
    state.filteredRecords = [...state.records];

    setupSidebar();
    state.bootstrap.mainModal = new bootstrap.Modal(document.getElementById('rs_modalPrincipal'));
    state.bootstrap.confirmModal = new bootstrap.Modal(document.getElementById('rs_modalConfirmacion'));
    state.bootstrap.toast = new bootstrap.Toast(document.getElementById('rs_toast'), { delay: 2200 });

    fillFilterOptions();
    bindEvents();
    renderTable();
  }

  function setupSidebar() {
    const sidebar = document.getElementById('rs_sidebar');
    const main = document.getElementById('rs_mainContent');
    const toggle = document.getElementById('rs_sidebarToggle');
    const brand = document.getElementById('rs_sidebarBrandBtn');
    const run = () => {
      sidebar.classList.toggle('collapsed');
      main.classList.toggle('expanded');
    };
    toggle?.addEventListener('click', run);
    brand?.addEventListener('click', run);
  }

  function bindEvents() {
    document.getElementById('rs_btnBuscar').addEventListener('click', applyFilters);
    document.getElementById('rs_btnLimpiar').addEventListener('click', clearFilters);
    document.querySelectorAll('#rs_filtrosCard input, #rs_filtrosCard select').forEach((el) => {
      el.addEventListener('change', applyFilters);
      if (el.tagName === 'INPUT' && el.type !== 'checkbox' && el.type !== 'date') {
        el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') applyFilters(); });
      }
    });

    document.getElementById('rs_tablaBody').addEventListener('click', onTableClick);
    document.getElementById('rs_btnIrDetalle').addEventListener('click', () => focusSection('detalle'));
    document.getElementById('rs_btnIrResumen').addEventListener('click', () => focusSection('resumen'));
    document.getElementById('rs_resumenBody').addEventListener('click', onActionGridClick);
    document.getElementById('rs_recPruebaBody').addEventListener('click', onActionGridClick);
    document.getElementById('rs_recPreguntaBody').addEventListener('click', onActionGridClick);
    document.getElementById('rs_recFactorBody').addEventListener('click', onActionGridClick);
    document.getElementById('rs_chkResumenFuera').addEventListener('change', renderSummarySections);
    document.getElementById('rs_resumenFiltroPrueba').addEventListener('change', renderSummarySections);
    document.getElementById('rs_resumenFiltroFactor').addEventListener('change', renderSummarySections);
    document.getElementById('rs_btnConfirmarAccion').addEventListener('click', confirmPendingAction);
  }

  function fillFilterOptions() {
    const companies = [...new Set(state.records.map((r) => r.empresa))].sort();
    const occupations = [...new Set(state.records.map((r) => r.ocupacion))].sort();
    const pruebas = [...new Set(state.records.flatMap((r) => r.pruebas.map((p) => p.nombre)))].sort();
    const factores = [...new Set(state.records.flatMap((r) => r.pruebas.flatMap((p) => p.factores.map((f) => f.nombre))))].sort();

    document.getElementById('rs_empresasList').innerHTML = companies.map((v) => `<option value="${escapeAttr(v)}"></option>`).join('');
    document.getElementById('rs_ocupacionesList').innerHTML = occupations.map((v) => `<option value="${escapeAttr(v)}"></option>`).join('');
    document.getElementById('rs_filtroPrueba').innerHTML = '<option value="">[Todas]</option>' + pruebas.map((v) => `<option value="${escapeAttr(v)}">${escapeHtml(v)}</option>`).join('');
    document.getElementById('rs_filtroFactor').innerHTML = '<option value="">[Todos]</option>' + factores.map((v) => `<option value="${escapeAttr(v)}">${escapeHtml(v)}</option>`).join('');
  }

  function clearFilters() {
    ['rs_filtroEmpresa', 'rs_filtroHistoria', 'rs_filtroOcupacion', 'rs_filtroFechaDesde', 'rs_filtroFechaHasta'].forEach((id) => { document.getElementById(id).value = ''; });
    document.getElementById('rs_filtroPrueba').value = '';
    document.getElementById('rs_filtroFactor').value = '';
    document.getElementById('rs_chkSoloFuera').checked = false;
    applyFilters();
  }

  function applyFilters() {
    const empresa = valueOf('rs_filtroEmpresa');
    const historia = valueOf('rs_filtroHistoria');
    const ocupacion = valueOf('rs_filtroOcupacion');
    const desde = document.getElementById('rs_filtroFechaDesde').value;
    const hasta = document.getElementById('rs_filtroFechaHasta').value;
    const prueba = document.getElementById('rs_filtroPrueba').value;
    const factor = document.getElementById('rs_filtroFactor').value;
    const onlyOut = document.getElementById('rs_chkSoloFuera').checked;

    state.filteredRecords = state.records.filter((record) => {
      const hasPrueba = !prueba || record.pruebas.some((p) => p.nombre === prueba);
      const hasFactor = !factor || record.pruebas.some((p) => p.factores.some((f) => f.nombre === factor));
      return (!empresa || record.empresa.toLowerCase().includes(empresa))
        && (!historia || record.historiaClinica.toLowerCase().includes(historia))
        && (!ocupacion || record.ocupacion.toLowerCase().includes(ocupacion))
        && (!desde || record.fechaISO >= desde)
        && (!hasta || record.fechaISO <= hasta)
        && hasPrueba
        && hasFactor
        && (!onlyOut || record.hasOutOfRangeFactor);
    });
    renderTable();
  }

  function renderTable() {
    const tbody = document.getElementById('rs_tablaBody');
    const infoCount = state.filteredRecords.filter((r) => r.hasOutOfRangeFactor).length;
    document.getElementById('rs_resultSummary').innerHTML = `<i class="fas fa-filter"></i>${state.filteredRecords.length} registros / ${infoCount} con indicador`;

    if (!state.filteredRecords.length) {
      tbody.innerHTML = emptyRow(8, 'No existen registros con los filtros aplicados.');
      activateTooltips();
      return;
    }

    tbody.innerHTML = state.filteredRecords.map((record) => {
      return `
        <tr>
          <td>${escapeHtml(record.episodio)}</td>
          <td>${escapeHtml(record.historiaClinica)}</td>
          <td>${escapeHtml(record.paciente)}</td>
          <td>${escapeHtml(record.empresa)}</td>
          <td>${escapeHtml(record.ocupacion)}</td>
          <td>${escapeHtml(record.fecha)}</td>
          <td>${statusPill(record.estado)}</td>
          <td>
            <div class="rs-actions">
              <button type="button" class="rs-icon-btn" data-rs-open="detalle" data-id="${record.id}" data-bs-toggle="tooltip" title="Ver detalle de respuestas"><i class="fas fa-table-list"></i></button>
              <button type="button" class="rs-icon-btn" data-rs-open="resumen" data-id="${record.id}" data-bs-toggle="tooltip" title="Ver resumen"><i class="fas fa-rectangle-list"></i></button>
              ${record.hasOutOfRangeFactor ? `<button type="button" class="rs-flag-icon is-info-out" data-rs-open="resumen" data-id="${record.id}" data-bs-toggle="tooltip" title="Existe un factor fuera del valor esperado"><i class="fas fa-circle-exclamation"></i></button>` : ''}
              ${record.hasReevalFlag ? `<button type="button" class="rs-flag-icon is-info-flag" data-rs-open="resumen" data-id="${record.id}" data-bs-toggle="tooltip" title="Existe una prueba con flag activo configurado para reevaluación"><i class="fas fa-circle-info"></i></button>` : ''}
              ${record.hasOutOfRangeFactor || record.hasReevalFlag ? `<button type="button" class="rs-small-action" data-rs-quick-action="reevaluar" data-id="${record.id}" data-bs-toggle="tooltip" title="Reevaluar"><i class="fas fa-rotate-right"></i><span class="d-none d-xl-inline">Reevaluar</span></button>` : ''}
              <button type="button" class="rs-small-action" data-rs-quick-action="aperturar" data-id="${record.id}" data-bs-toggle="tooltip" title="Aperturar"><i class="fas fa-lock-open"></i><span class="d-none d-xl-inline">Aperturar</span></button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    activateTooltips();
  }

  function onTableClick(event) {
    const openBtn = event.target.closest('[data-rs-open]');
    if (openBtn) {
      const record = findRecord(Number(openBtn.dataset.id));
      if (record) openUnifiedModal(record, openBtn.dataset.rsOpen);
      return;
    }

    const quickBtn = event.target.closest('[data-rs-quick-action]');
    if (!quickBtn) return;
    const record = findRecord(Number(quickBtn.dataset.id));
    if (!record) return;
    state.selectedRecord = record;

    if (quickBtn.dataset.rsQuickAction === 'aperturar') {
      openAperturar(record);
      return;
    }

    const firstActionable = flattenSummaryRows(record).find((row) => row.canReevaluateByFactor || row.canReevaluateByTest || row.canReevaluateByQuestion);
    if (firstActionable) {
      openUnifiedModal(record, 'resumen');
      setTimeout(() => {
        openReevaluation(firstActionable.canReevaluateByFactor ? 'factor' : firstActionable.canReevaluateByTest ? 'prueba' : 'pregunta', firstActionable.prueba, firstActionable.factor, firstActionable.codigoActuacion);
      }, 250);
    }
  }

  function openUnifiedModal(record, focus) {
    state.selectedRecord = record;
    document.getElementById('rs_modalTitle').textContent = focus === 'detalle' ? 'Detalle de respuestas' : 'Resumen';
    renderContext(record);
    renderMarkers(record);
    renderDetail(record);
    fillSummaryFilterOptions(record);
    renderSummarySections();
    state.bootstrap.mainModal.show();
    setTimeout(() => focusSection(focus), 200);
  }

  function renderContext(record) {
    const items = [
      ['Historia clínica', record.historiaClinica],
      ['Paciente', record.paciente],
      ['Empresa', record.empresa],
      ['Ocupación', record.ocupacion],
      ['Tipo de examen', record.tipoExamen],
      ['Fecha de examen', record.fecha],
    ];
    document.getElementById('rs_contextGrid').innerHTML = items.map(([label, value]) => `
      <div class="rs-context-item">
        <div class="rs-context-label">${escapeHtml(label)}</div>
        <div class="rs-context-value">${escapeHtml(value)}</div>
      </div>
    `).join('');
  }

  function renderMarkers(record) {
    const items = [];
    if (record.hasOutOfRangeFactor) items.push('<span class="rs-inline-marker is-info-out"><i class="fas fa-circle-exclamation"></i>Factor fuera del valor esperado</span>');
    if (record.hasReevalFlag) items.push('<span class="rs-inline-marker is-info-flag"><i class="fas fa-circle-info"></i>Prueba con flag activo para reevaluación</span>');
    if (!items.length) items.push('<span class="rs-inline-marker"><i class="fas fa-circle-check"></i>Sin indicadores informativos</span>');
    document.getElementById('rs_markerBar').innerHTML = items.join('');
  }

  function renderDetail(record) {
    const rows = flattenDetailRows(record);
    document.getElementById('rs_detalleBody').innerHTML = rows.length ? rows.map((row) => `
      <tr>
        <td>${escapeHtml(row.codigoActuacion)}</td>
        <td>${escapeHtml(row.actuacion)}</td>
        <td>${escapeHtml(row.prueba)}</td>
        <td>${escapeHtml(row.pregunta)}</td>
        <td>${escapeHtml(row.respuesta)}</td>
        <td>${statusPill(row.estadoPregunta, true)}</td>
      </tr>
    `).join('') : emptyRow(6);
  }

  function fillSummaryFilterOptions(record) {
    const rows = flattenSummaryRows(record);
    const pruebas = [...new Set(rows.map((row) => row.prueba))];
    const factores = [...new Set(rows.map((row) => row.factor))];
    document.getElementById('rs_resumenFiltroPrueba').innerHTML = '<option value="">[Todas las pruebas]</option>' + pruebas.map((v) => `<option value="${escapeAttr(v)}">${escapeHtml(v)}</option>`).join('');
    document.getElementById('rs_resumenFiltroFactor').innerHTML = '<option value="">[Todos los factores]</option>' + factores.map((v) => `<option value="${escapeAttr(v)}">${escapeHtml(v)}</option>`).join('');
    document.getElementById('rs_chkResumenFuera').checked = false;
  }

  function renderSummarySections() {
    if (!state.selectedRecord) return;
    const pruebaFilter = document.getElementById('rs_resumenFiltroPrueba').value;
    const factorFilter = document.getElementById('rs_resumenFiltroFactor').value;
    const onlyOut = document.getElementById('rs_chkResumenFuera').checked;

    const rows = flattenSummaryRows(state.selectedRecord).filter((row) => {
      return (!pruebaFilter || row.prueba === pruebaFilter)
        && (!factorFilter || row.factor === factorFilter)
        && (!onlyOut || row.isOutOfRange);
    });

    document.getElementById('rs_resumenBody').innerHTML = renderSummaryRows(rows, 'resumen');
    document.getElementById('rs_recPruebaBody').innerHTML = renderSummaryRows(rows.filter((row) => row.canReevaluateByTest), 'prueba');
    document.getElementById('rs_recPreguntaBody').innerHTML = renderSummaryRows(rows.filter((row) => row.canReevaluateByQuestion), 'pregunta');
    document.getElementById('rs_recFactorBody').innerHTML = renderSummaryRows(rows.filter((row) => row.canReevaluateByFactor), 'factor');
  }

  function renderSummaryRows(rows, mode) {
    if (!rows.length) return emptyRow(9);
    return rows.map((row) => `
      <tr>
        <td>${escapeHtml(row.codigoActuacion)}</td>
        <td>${escapeHtml(row.actuacion)}</td>
        <td>${escapeHtml(row.prueba)}</td>
        <td class="rs-factor-cell ${row.factorColor === 'orange' ? 'is-orange' : 'is-green'}">${escapeHtml(row.factor)}</td>
        <td>${escapeHtml(String(row.puntaje))}</td>
        <td>${escapeHtml(row.nivel)}</td>
        <td>${escapeHtml(row.interpretacion)}</td>
        <td>${statusPill(row.estadoTexto, true, row.isOutOfRange ? 'observado' : row.hasInfoFlag ? 'informativo' : 'normal')}</td>
        <td>${actionCell(row, mode)}</td>
      </tr>
    `).join('');
  }

  function actionCell(row, mode) {
    if (mode === 'prueba') return row.canReevaluateByTest ? buttonAction('prueba', row) : '<span class="text-muted">-</span>';
    if (mode === 'pregunta') return row.canReevaluateByQuestion ? buttonAction('pregunta', row) : '<span class="text-muted">-</span>';
    if (mode === 'factor') return row.canReevaluateByFactor ? buttonAction('factor', row) : '<span class="text-muted">-</span>';

    const actions = [];
    if (row.canReevaluateByFactor) actions.push(buttonAction('factor', row));
    else if (row.canReevaluateByTest) actions.push(buttonAction('prueba', row));
    else if (row.canReevaluateByQuestion) actions.push(buttonAction('pregunta', row));
    if (row.canAperturar) actions.push(`<button type="button" class="rs-link-action" data-rs-action="aperturar" data-codigo="${escapeAttr(row.codigoActuacion)}">Aperturar</button>`);
    return actions.length ? actions.join(' &nbsp; ') : '<span class="text-muted">-</span>';
  }

  function buttonAction(type, row) {
    return `<button type="button" class="rs-link-action" data-rs-action="${type}" data-codigo="${escapeAttr(row.codigoActuacion)}" data-prueba="${escapeAttr(row.prueba)}" data-factor="${escapeAttr(row.factor)}">Reevaluar</button>`;
  }

  function onActionGridClick(event) {
    const btn = event.target.closest('[data-rs-action]');
    if (!btn || !state.selectedRecord) return;
    if (btn.dataset.rsAction === 'aperturar') {
      openAperturar(state.selectedRecord);
      return;
    }
    openReevaluation(btn.dataset.rsAction, btn.dataset.prueba, btn.dataset.factor, btn.dataset.codigo);
  }

  function openAperturar(record) {
    state.pendingAction = { type: 'aperturar', record };
    document.getElementById('rs_confirmTitle').textContent = 'Aperturar episodio';
    document.getElementById('rs_confirmText').innerHTML = `¿Desea aperturar el episodio <strong>${escapeHtml(record.episodio)}</strong>?`;
    document.getElementById('rs_confirmNote').textContent = 'Esta acción simula el registro de auditoría del usuario que aperturó el caso.';
    hideConfirmBoxes();
    state.bootstrap.confirmModal.show();
  }

  function openReevaluation(type, prueba, factor, codigo) {
    const payload = buildReevaluationPayload(state.selectedRecord, type, prueba, factor, codigo);
    state.pendingAction = payload;
    document.getElementById('rs_confirmTitle').textContent = type === 'prueba' ? 'Reevaluación por prueba' : type === 'pregunta' ? 'Reevaluación por pregunta' : 'Reevaluación por factor';
    document.getElementById('rs_confirmText').innerHTML = payload.message;
    document.getElementById('rs_confirmNote').textContent = payload.note;

    if (payload.questions.length) {
      document.getElementById('rs_confirmLinkedBox').style.display = '';
      document.getElementById('rs_confirmQuestions').innerHTML = `<ul class="rs-list-linked">${payload.questions.map((q) => `<li>${escapeHtml(q)}</li>`).join('')}</ul>`;
    } else {
      document.getElementById('rs_confirmLinkedBox').style.display = 'none';
      document.getElementById('rs_confirmQuestions').innerHTML = '';
    }

    if (payload.relatedFactors.length) {
      document.getElementById('rs_confirmFactorsBox').style.display = '';
      document.getElementById('rs_confirmFactors').innerHTML = payload.relatedFactors.map((group) => `
        <div class="rs-factor-linked-item">
          <strong>${escapeHtml(group.factor)}</strong>
          <ul class="rs-list-linked">${group.questions.map((q) => `<li>${escapeHtml(q)}</li>`).join('')}</ul>
        </div>
      `).join('');
    } else {
      document.getElementById('rs_confirmFactorsBox').style.display = 'none';
      document.getElementById('rs_confirmFactors').innerHTML = '';
    }

    state.bootstrap.confirmModal.show();
  }

  function buildReevaluationPayload(record, type, prueba, factor, codigo) {
    const row = flattenSummaryRows(record).find((item) => item.codigoActuacion === codigo && item.prueba === prueba && item.factor === factor) || flattenSummaryRows(record)[0];
    const linked = getLinkedQuestions(record, prueba, factor);

    if (type === 'prueba') {
      return {
        type,
        record,
        message: `Se procederá a reevaluar al paciente la prueba <strong>${escapeHtml(prueba)}</strong>. ¿Desea continuar?`,
        note: 'El paciente visualizará toda la prueba como pendiente con su mismo login.',
        questions: [],
        relatedFactors: [],
        row,
      };
    }

    if (type === 'pregunta') {
      return {
        type,
        record,
        message: `Se procederá a reevaluar al paciente preguntas puntuales vinculadas al factor <strong>${escapeHtml(factor)}</strong>. ¿Desea continuar?`,
        note: 'Se listan únicamente las preguntas observadas para esta recuperación.',
        questions: linked.questions,
        relatedFactors: [],
        row,
      };
    }

    return {
      type,
      record,
      message: `Se procederá a reevaluar al paciente las preguntas vinculadas al factor <strong>${escapeHtml(factor)}</strong>. ¿Desea continuar?`,
      note: 'Se muestra el conjunto de preguntas y factores asociados para que el psicólogo confirme con contexto.',
      questions: linked.questions,
      relatedFactors: linked.relatedFactors,
      row,
    };
  }

  function confirmPendingAction() {
    if (!state.pendingAction) return;

    if (state.pendingAction.type === 'aperturar') {
      state.pendingAction.record.estado = 'Pendiente';
      showToast(`Se aperturó el episodio ${state.pendingAction.record.episodio}.`);
    } else {
      state.pendingAction.record.estado = 'Reevaluación pendiente';
      state.pendingAction.record.hasReevalFlag = true;
      showToast(
        state.pendingAction.type === 'prueba'
          ? `Se dejó pendiente la reevaluación de la prueba ${state.pendingAction.row.prueba}.`
          : state.pendingAction.type === 'pregunta'
            ? `Se creó una recuperación por pregunta para ${state.pendingAction.row.factor}.`
            : `Se creó una recuperación por factor para ${state.pendingAction.row.factor}.`
      );
      renderMarkers(state.pendingAction.record);
      renderSummarySections();
    }

    renderTable();
    state.bootstrap.confirmModal.hide();
  }

  function focusSection(target) {
    const section = document.getElementById(target === 'detalle' ? 'rs_sectionDetalle' : 'rs_sectionResumen');
    const body = document.getElementById('rs_modalBodyScroll');
    body.scrollTo({ top: section.offsetTop - 18, behavior: 'smooth' });
    section.classList.remove('rs-highlight-target');
    void section.offsetWidth;
    section.classList.add('rs-highlight-target');
  }

  function flattenDetailRows(record) {
    const rows = [];
    record.pruebas.forEach((prueba) => {
      prueba.factores.forEach((factor) => {
        factor.preguntas.forEach((pregunta) => {
          rows.push({
            codigoActuacion: pregunta.codigoActuacion,
            actuacion: pregunta.actuacion,
            prueba: prueba.nombre,
            pregunta: pregunta.texto,
            respuesta: pregunta.respuesta,
            estadoPregunta: pregunta.estado,
          });
        });
      });
    });
    return rows;
  }

  function flattenSummaryRows(record) {
    const rows = [];
    record.pruebas.forEach((prueba) => {
      prueba.factores.forEach((factor) => {
        const observedQuestions = factor.preguntas.filter((p) => ['Observado', 'Revisar'].includes(p.estado));
        rows.push({
          codigoActuacion: factor.codigoActuacion,
          actuacion: factor.actuacion,
          prueba: prueba.nombre,
          factor: factor.nombre,
          puntaje: factor.puntaje,
          nivel: factor.nivel,
          interpretacion: factor.interpretacion,
          estadoTexto: factor.estadoVisual,
          factorColor: factor.factorColor,
          hasInfoFlag: factor.hasInfoFlag,
          isOutOfRange: factor.isOutOfRange,
          canReevaluateByTest: prueba.reevaluarCompleta,
          canReevaluateByQuestion: observedQuestions.length > 0,
          canReevaluateByFactor: factor.puedeReevaluar,
          canAperturar: record.canAperturar,
        });
      });
    });
    return rows;
  }

  function getLinkedQuestions(record, pruebaNombre, factorNombre) {
    const prueba = record.pruebas.find((p) => p.nombre === pruebaNombre);
    const factor = prueba?.factores.find((f) => f.nombre === factorNombre);
    return {
      questions: factor ? factor.preguntas.map((p) => p.texto) : [],
      relatedFactors: prueba ? prueba.factores.map((f) => ({ factor: f.nombre, questions: f.preguntas.map((p) => p.texto) })) : [],
    };
  }

  function statusPill(text, compact = false, forceType = '') {
    const value = String(text || '');
    const normalized = forceType || normalizeStatus(value);
    const cls = normalized === 'culminada'
      ? 'rs-status-culminada'
      : normalized === 'pendiente'
        ? 'rs-status-pendiente'
        : normalized === 'reevaluacion'
          ? 'rs-status-reevaluacion'
          : normalized === 'observado'
            ? 'rs-status-observado'
            : normalized === 'informativo'
              ? 'rs-status-informativo'
              : 'rs-status-normal';
    return `<span class="rs-status-pill ${cls}${compact ? ' py-1 px-2' : ''}">${escapeHtml(value)}</span>`;
  }

  function normalizeStatus(text) {
    const value = String(text || '').toLowerCase();
    if (value.includes('culmin')) return 'culminada';
    if (value.includes('reevalu')) return 'reevaluacion';
    if (value.includes('observ') || value.includes('fuera')) return 'observado';
    if (value.includes('inform')) return 'informativo';
    if (value.includes('pend')) return 'pendiente';
    return 'normal';
  }

  function activateTooltips() {
    state.bootstrap.tooltips.forEach((tip) => tip.dispose());
    state.bootstrap.tooltips = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map((el) => new bootstrap.Tooltip(el));
  }

  function findRecord(id) {
    return state.records.find((row) => row.id === id);
  }

  function hideConfirmBoxes() {
    document.getElementById('rs_confirmLinkedBox').style.display = 'none';
    document.getElementById('rs_confirmFactorsBox').style.display = 'none';
    document.getElementById('rs_confirmQuestions').innerHTML = '';
    document.getElementById('rs_confirmFactors').innerHTML = '';
  }

  function emptyRow(colspan, text = 'No existen registros aún.') {
    return `<tr><td colspan="${colspan}"><div class="rs-empty">${escapeHtml(text)}</div></td></tr>`;
  }

  function showToast(text) {
    document.getElementById('rs_toastBody').textContent = text;
    state.bootstrap.toast.show();
  }

  function valueOf(id) {
    return document.getElementById(id).value.trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function buildRecords() {
    return [
      {
        id: 1,
        episodio: '00852026017279',
        historiaClinica: 'HC-001245',
        paciente: 'Acco Pino Jonathan Henry',
        empresa: 'MINERA SOTRAMI S.A.',
        ocupacion: 'Operador de planta',
        tipoExamen: 'Retiro',
        fecha: '10/04/2026',
        fechaISO: '2026-04-10',
        estado: 'Pendiente',
        hasOutOfRangeFactor: true,
        hasReevalFlag: true,
        canAperturar: true,
        pruebas: [
          {
            nombre: 'CPS-001 Escala de Ansiedad',
            reevaluarCompleta: true,
            factores: [
              {
                codigoActuacion: 'ACT-001',
                actuacion: 'Aplicación principal',
                nombre: 'FACTOR_A',
                puntaje: 18,
                nivel: 'Alto',
                interpretacion: 'Resultado por encima del valor esperado.',
                estadoVisual: 'Fuera del valor esperado',
                factorColor: 'orange',
                hasInfoFlag: false,
                isOutOfRange: true,
                puedeReevaluar: true,
                preguntas: [
                  { codigoActuacion: 'ACT-001', actuacion: 'Aplicación principal', texto: 'Pregunta 5 - ¿Ha sentido tensión últimamente?', respuesta: 'Sí, frecuente', estado: 'Observado' },
                  { codigoActuacion: 'ACT-001', actuacion: 'Aplicación principal', texto: 'Pregunta 12 - ¿Duerme adecuadamente?', respuesta: 'No', estado: 'Revisar' },
                  { codigoActuacion: 'ACT-001', actuacion: 'Aplicación principal', texto: 'Pregunta 18 - ¿Le cuesta relajarse?', respuesta: 'No', estado: 'Observado' },
                ],
              },
              {
                codigoActuacion: 'ACT-001',
                actuacion: 'Aplicación principal',
                nombre: 'FACTOR_B',
                puntaje: 9,
                nivel: 'Moderado',
                interpretacion: 'Dentro del comportamiento esperado.',
                estadoVisual: 'Correcto',
                factorColor: 'green',
                hasInfoFlag: false,
                isOutOfRange: false,
                puedeReevaluar: false,
                preguntas: [
                  { codigoActuacion: 'ACT-001', actuacion: 'Aplicación principal', texto: 'Pregunta 22 - ¿Se distrae con facilidad?', respuesta: 'A veces', estado: 'Normal' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 2,
        episodio: '00872026020152',
        historiaClinica: 'HC-001284',
        paciente: 'Acuña Clemente Odemary Luzverily',
        empresa: 'COMPAÑÍA DE MINAS BUENAVENTURA S.A.A.',
        ocupacion: 'Operaria',
        tipoExamen: 'Especial',
        fecha: '10/04/2026',
        fechaISO: '2026-04-10',
        estado: 'Culminada',
        hasOutOfRangeFactor: false,
        hasReevalFlag: false,
        canAperturar: false,
        pruebas: [
          {
            nombre: 'CPS-002 Atención Sostenida',
            reevaluarCompleta: false,
            factores: [
              {
                codigoActuacion: 'ACT-014',
                actuacion: 'Aplicación única',
                nombre: 'FACTOR_C',
                puntaje: 10,
                nivel: 'Adecuado',
                interpretacion: 'Sin hallazgos relevantes.',
                estadoVisual: 'Correcto',
                factorColor: 'green',
                hasInfoFlag: false,
                isOutOfRange: false,
                puedeReevaluar: false,
                preguntas: [
                  { codigoActuacion: 'ACT-014', actuacion: 'Aplicación única', texto: 'Pregunta 4 - ¿Mantiene el foco durante la tarea?', respuesta: 'Sí', estado: 'Normal' },
                  { codigoActuacion: 'ACT-014', actuacion: 'Aplicación única', texto: 'Pregunta 8 - ¿Comete omisiones frecuentes?', respuesta: 'No', estado: 'Normal' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 3,
        episodio: '00872026020150',
        historiaClinica: 'HC-001286',
        paciente: 'Acuña Clemente Odemary Luzverily',
        empresa: 'COMPAÑÍA DE MINAS BUENAVENTURA S.A.A.',
        ocupacion: 'Operaria',
        tipoExamen: 'Ingreso',
        fecha: '09/04/2026',
        fechaISO: '2026-04-09',
        estado: 'Culminada',
        hasOutOfRangeFactor: true,
        hasReevalFlag: false,
        canAperturar: true,
        pruebas: [
          {
            nombre: 'CPS-003 Estabilidad Emocional',
            reevaluarCompleta: false,
            factores: [
              {
                codigoActuacion: 'ACT-017',
                actuacion: 'Aplicación principal',
                nombre: 'FACTOR_A',
                puntaje: 16,
                nivel: 'Alto',
                interpretacion: 'Presenta una variación que requiere verificación.',
                estadoVisual: 'Observado',
                factorColor: 'orange',
                hasInfoFlag: true,
                isOutOfRange: true,
                puedeReevaluar: true,
                preguntas: [
                  { codigoActuacion: 'ACT-017', actuacion: 'Aplicación principal', texto: 'Pregunta 7 - ¿Siente cambios bruscos de ánimo?', respuesta: 'Sí', estado: 'Observado' },
                  { codigoActuacion: 'ACT-017', actuacion: 'Aplicación principal', texto: 'Pregunta 14 - ¿Se irrita con facilidad?', respuesta: 'A veces', estado: 'Revisar' },
                ],
              },
              {
                codigoActuacion: 'ACT-017',
                actuacion: 'Aplicación principal',
                nombre: 'FACTOR_B',
                puntaje: 11,
                nivel: 'Moderado',
                interpretacion: 'Resultado estable con seguimiento.',
                estadoVisual: 'Informativo',
                factorColor: 'green',
                hasInfoFlag: true,
                isOutOfRange: false,
                puedeReevaluar: false,
                preguntas: [
                  { codigoActuacion: 'ACT-017', actuacion: 'Aplicación principal', texto: 'Pregunta 20 - ¿Logra mantener el control emocional?', respuesta: 'A veces', estado: 'Normal' },
                ],
              },
            ],
          },
        ],
      },
    ];
  }
})();
