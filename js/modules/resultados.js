(() => {
  const state = {
    records: [],
    filteredRecords: [],
    selectedRecord: null,
    pendingAction: null,
    dniSearchboxOpen: false,
    bootstrap: { mainModal: null, confirmModal: null, toast: null, tooltips: [] },
  };

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    state.records = buildRecords();
    state.filteredRecords = [...state.records];

    setupSidebar();
    state.bootstrap.mainModal = new bootstrap.Modal(document.getElementById('rs_modalPrincipal'));
    state.bootstrap.confirmModal = new bootstrap.Modal(document.getElementById('rs_modalConfirmacion'), { backdrop: false, focus: true });
    state.bootstrap.toast = new bootstrap.Toast(document.getElementById('rs_toast'), { delay: 2200 });

    fillFilterOptions();
    setupDniSearchbox();
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
    const modalActions = document.getElementById('rs_modalActions');
    if (modalActions) modalActions.addEventListener('click', onModalActionsClick);
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
    document.getElementById('rs_modalConfirmacion').addEventListener('hidden.bs.modal', normalizeModalState);
    document.getElementById('rs_modalPrincipal').addEventListener('hidden.bs.modal', normalizeModalState);
  }

  function fillFilterOptions() {
    const companies = [...new Set(state.records.map((r) => r.empresa))].sort();
    const occupations = [...new Set(state.records.map((r) => r.ocupacion))].sort();
    const pruebas = [...new Set(state.records.flatMap((r) => r.pruebas.map((p) => p.nombre)))].sort();
    const factores = [...new Set(state.records.flatMap((r) => r.pruebas.flatMap((p) => p.factores.map((f) => f.nombre))))].sort();

    state.dniOptions = state.records
      .map((r) => ({ dni: r.dni, paciente: r.paciente, historiaClinica: r.historiaClinica }))
      .filter((item) => item.dni)
      .sort((a, b) => a.dni.localeCompare(b.dni));

    document.getElementById('rs_empresasList').innerHTML = companies.map((v) => `<option value="${escapeAttr(v)}"></option>`).join('');
    document.getElementById('rs_ocupacionesList').innerHTML = occupations.map((v) => `<option value="${escapeAttr(v)}"></option>`).join('');
    document.getElementById('rs_filtroPrueba').innerHTML = '<option value="">[Todas]</option>' + pruebas.map((v) => `<option value="${escapeAttr(v)}">${escapeHtml(v)}</option>`).join('');
    document.getElementById('rs_filtroFactor').innerHTML = '<option value="">[Todos]</option>' + factores.map((v) => `<option value="${escapeAttr(v)}">${escapeHtml(v)}</option>`).join('');
  }

  function setupDniSearchbox() {
    const root = document.getElementById('rs_dniSearchbox');
    const input = document.getElementById('rs_filtroDniSearch');
    const hidden = document.getElementById('rs_filtroDni');
    const menu = document.getElementById('rs_dniSearchboxMenu');
    const clearBtn = document.getElementById('rs_btnLimpiarDni');
    if (!root || !input || !hidden || !menu || !clearBtn) return;

    const openMenu = () => {
      state.dniSearchboxOpen = true;
      root.classList.add('is-open');
      renderDniOptions(input.value);
    };

    const closeMenu = () => {
      state.dniSearchboxOpen = false;
      root.classList.remove('is-open');
    };

    input.addEventListener('focus', openMenu);
    input.addEventListener('click', openMenu);
    input.addEventListener('input', () => {
      hidden.value = '';
      openMenu();
    });
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        const first = menu.querySelector('[data-dni]');
        if (first) selectDniOption(first.dataset.dni);
        applyFilters();
      }
      if (ev.key === 'Escape') closeMenu();
    });

    clearBtn.addEventListener('click', () => {
      clearDniFilter();
      applyFilters();
      input.focus();
    });

    menu.addEventListener('mousedown', (ev) => {
      ev.preventDefault();
      const option = ev.target.closest('[data-dni]');
      if (!option) return;
      selectDniOption(option.dataset.dni);
      applyFilters();
    });

    document.addEventListener('mousedown', (ev) => {
      if (!root.contains(ev.target)) closeMenu();
    });
  }

  function renderDniOptions(query = '') {
    const menu = document.getElementById('rs_dniSearchboxMenu');
    if (!menu) return;
    const needle = normalizeText(query);
    const options = (state.dniOptions || [])
      .filter((item) => !needle
        || normalizeText(item.dni).includes(needle)
        || normalizeText(item.paciente).includes(needle)
        || normalizeText(item.historiaClinica).includes(needle))
      .slice(0, 8);

    if (!options.length) {
      menu.innerHTML = '<div class="rs-dni-searchbox-empty">No se encontraron DNIs.</div>';
      return;
    }

    menu.innerHTML = options.map((item) => `
      <button type="button" class="rs-dni-searchbox-option" data-dni="${escapeAttr(item.dni)}" role="option">
        <span class="rs-dni-searchbox-dni">${escapeHtml(item.dni)}</span>
        <span class="rs-dni-searchbox-person">${escapeHtml(item.paciente)}</span>
        <span class="rs-dni-searchbox-hc">${escapeHtml(item.historiaClinica)}</span>
      </button>
    `).join('');
  }

  function selectDniOption(dni) {
    const selected = (state.dniOptions || []).find((item) => item.dni === dni);
    if (!selected) return;
    document.getElementById('rs_filtroDni').value = selected.dni;
    document.getElementById('rs_filtroDniSearch').value = `${selected.dni} · ${selected.paciente}`;
    document.getElementById('rs_dniSearchbox')?.classList.remove('is-open');
    state.dniSearchboxOpen = false;
  }

  function clearDniFilter() {
    const hidden = document.getElementById('rs_filtroDni');
    const input = document.getElementById('rs_filtroDniSearch');
    if (hidden) hidden.value = '';
    if (input) input.value = '';
    renderDniOptions('');
  }

  function clearFilters() {
    ['rs_filtroEmpresa', 'rs_filtroHistoria', 'rs_filtroOcupacion', 'rs_filtroFechaDesde', 'rs_filtroFechaHasta'].forEach((id) => { document.getElementById(id).value = ''; });
    clearDniFilter();
    document.getElementById('rs_filtroPrueba').value = '';
    document.getElementById('rs_filtroFactor').value = '';
    document.getElementById('rs_chkSoloFuera').checked = false;
    applyFilters();
  }

  function applyFilters() {
    const empresa = valueOf('rs_filtroEmpresa');
    const historia = valueOf('rs_filtroHistoria');
    const ocupacion = valueOf('rs_filtroOcupacion');
    const dni = valueOf('rs_filtroDni');
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
        && (!dni || String(record.dni || '').includes(dni))
        && (!ocupacion || record.ocupacion.toLowerCase().includes(ocupacion))
        && (!desde || record.fechaISO >= desde)
        && (!hasta || record.fechaISO <= hasta)
        && hasPrueba
        && hasFactor
        && (!onlyOut || record.hasOutOfRangeFactor);
    });
    renderTable();
  }

  function getRecordUiSignals(record) {
    const rows = flattenSummaryRows(record);
    const episodioCerrado = ['culminada', 'cerrado', 'cerrada', 'finalizado', 'finalizada'].includes(String(record.estado || '').trim().toLowerCase());
    const hasReevaluation = rows.some((row) => row.canReevaluateByFactor || row.canReevaluateByTest || row.canReevaluateByQuestion || row.isOutOfRange);
    const hasWarning = rows.some((row) => row.isOutOfRange || row.hasInfoFlag);
    const canAperturar = episodioCerrado && !!record.canAperturar;
    return {
      episodioCerrado,
      hasReevaluation,
      hasWarning,
      canAperturar,
      showYellow: !canAperturar && (hasReevaluation || hasWarning),
      showRed: canAperturar,
      primaryAction: canAperturar ? 'aperturar' : (hasReevaluation ? 'reevaluar' : null),
    };
  }

  function renderTable() {
    const tbody = document.getElementById('rs_tablaBody');
    const yellowCount = state.filteredRecords.filter((r) => getRecordUiSignals(r).showYellow).length;
    const redCount = state.filteredRecords.filter((r) => getRecordUiSignals(r).showRed).length;
    document.getElementById('rs_resultSummary').innerHTML = `<i class="fas fa-filter"></i>${state.filteredRecords.length} registros / <span class="text-warning-emphasis">${yellowCount} reevaluables</span> / <span class="text-danger-emphasis">${redCount} aperturables</span>`;

    if (!state.filteredRecords.length) {
      tbody.innerHTML = emptyRow(9, 'No existen registros con los filtros aplicados.');
      activateTooltips();
      return;
    }

    tbody.innerHTML = state.filteredRecords.map((record) => {
      return `
        <tr>
          <td>${escapeHtml(record.episodio)}</td>
          <td>${escapeHtml(record.historiaClinica)}</td>
          <td>${escapeHtml(record.dni)}</td>
          <td>${escapeHtml(record.paciente)}</td>
          <td>${escapeHtml(record.empresa)}</td>
          <td>${escapeHtml(record.ocupacion)}</td>
          <td>${escapeHtml(record.fecha)}</td>
          <td>${statusPill(record.estado)}</td>
          <td>
            <div class="rs-actions rs-actions-single">
              <button type="button" class="rs-icon-btn" data-rs-open="detalle" data-id="${record.id}" data-bs-toggle="tooltip" title="Ver resultados"><i class="fas fa-eye"></i></button>
              ${(() => {
                const signals = getRecordUiSignals(record);
                const indicators = [];
                if (signals.showYellow) indicators.push('<span class="rs-flag-icon is-info-flag" data-bs-toggle="tooltip" title="Caso con observación o reevaluación pendiente"><i class="fas fa-triangle-exclamation"></i></span>');
                if (signals.showRed) indicators.push('<span class="rs-flag-icon is-critical" data-bs-toggle="tooltip" title="Caso que requiere aperturar episodio"><i class="fas fa-circle-exclamation"></i></span>');
                return indicators.join('');
              })()}
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
  }

  function renderModalActions(record) {
    return;
  }

  function onModalActionsClick(event) {
    const btn = event.target.closest('[data-rs-modal-action]');
    if (!btn || !state.selectedRecord) return;

    if (btn.dataset.rsModalAction === 'aperturar') {
      openAperturar(state.selectedRecord);
      return;
    }

    openReevaluation(btn.dataset.type, btn.dataset.prueba, btn.dataset.factor, btn.dataset.codigo);
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
    if (record.hasOutOfRangeFactor) items.push('<span class="badge bg-danger rs-alert-badge"><i class="fas fa-circle-exclamation me-1"></i>Factor fuera del valor esperado</span>');
    if (record.hasReevalFlag) items.push('<span class="badge bg-warning text-dark rs-alert-badge"><i class="fas fa-circle-info me-1"></i>Prueba con flag activo para reevaluación</span>');
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
    return rows.map((row, index) => `
      <tr>
        <td>${escapeHtml(row.codigoActuacion)}</td>
        <td>${escapeHtml(row.actuacion)}</td>
        <td>${escapeHtml(row.prueba)}</td>
        <td class="rs-factor-cell ${row.factorColor === 'orange' ? 'is-orange' : 'is-green'}">${escapeHtml(row.factor)}</td>
        <td>${escapeHtml(String(row.puntaje))}</td>
        <td>${escapeHtml(row.nivel)}</td>
        <td>${escapeHtml(row.interpretacion)}</td>
        <td>${statusPill(row.estadoTexto, true, row.isOutOfRange ? 'observado' : row.hasInfoFlag ? 'informativo' : 'normal')}</td>
        <td>${actionCell(row, mode, index)}</td>
      </tr>
    `).join('');
  }

  function actionCell(row, mode, index = 0) {
    if (mode === 'prueba') return row.canReevaluateByTest ? buttonAction('prueba', row) : '<span class="text-muted">-</span>';
    if (mode === 'pregunta') return row.canReevaluateByQuestion ? buttonAction('pregunta', row) : '<span class="text-muted">-</span>';
    if (mode === 'factor') return row.canReevaluateByFactor ? buttonAction('factor', row) : '<span class="text-muted">-</span>';

    const episodioCerrado = ['culminada', 'cerrado', 'cerrada', 'finalizado', 'finalizada'].includes(String(state.selectedRecord?.estado || '').trim().toLowerCase());
    const canAperturar = episodioCerrado && !!row.canAperturar;

    if (canAperturar) {
      return index === 0
        ? `<button type="button" class="rs-link-action" data-rs-action="aperturar" data-codigo="${escapeAttr(row.codigoActuacion)}">Aperturar</button>`
        : '<span class="text-muted">Caso aperturable</span>';
    }

    if (row.canReevaluateByFactor) return buttonAction('factor', row);
    if (row.canReevaluateByTest) return buttonAction('prueba', row);
    if (row.canReevaluateByQuestion) return buttonAction('pregunta', row);

    return '<span class="text-muted">-</span>';
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
      state.pendingAction.record.canAperturar = false;
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
    }

    renderMarkers(state.pendingAction.record);
    renderSummarySections();
    renderTable();
    state.pendingAction = null;
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

    if (normalized === 'observado') {
      return `<span class="badge bg-danger${compact ? ' rs-badge-compact' : ''}">${escapeHtml(value)}</span>`;
    }

    if (normalized === 'informativo' || normalized === 'pendiente') {
      return `<span class="badge bg-warning text-dark${compact ? ' rs-badge-compact' : ''}">${escapeHtml(value)}</span>`;
    }

    const cls = normalized === 'culminada'
      ? 'rs-status-culminada'
      : normalized === 'reevaluacion'
        ? 'rs-status-reevaluacion'
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

  function normalizeModalState() {
    const mainModalOpen = document.getElementById('rs_modalPrincipal')?.classList.contains('show');
    const confirmModalOpen = document.getElementById('rs_modalConfirmacion')?.classList.contains('show');
    const backdrops = Array.from(document.querySelectorAll('.modal-backdrop'));

    if (mainModalOpen || confirmModalOpen) {
      document.body.classList.add('modal-open');
      if (backdrops.length > 1) {
        backdrops.slice(1).forEach((node) => node.remove());
      }
      return;
    }

    backdrops.forEach((node) => node.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('padding-right');
    state.pendingAction = null;
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

  function normalizeText(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
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
    const q = (codigoActuacion, actuacion, texto, respuesta, estado) => ({ codigoActuacion, actuacion, texto, respuesta, estado });
    const factor = ({
      codigoActuacion,
      actuacion,
      nombre,
      puntaje,
      nivel,
      interpretacion,
      estadoVisual,
      factorColor = 'green',
      hasInfoFlag = false,
      isOutOfRange = false,
      puedeReevaluar = false,
      preguntas = [],
    }) => ({
      codigoActuacion,
      actuacion,
      nombre,
      puntaje,
      nivel,
      interpretacion,
      estadoVisual,
      factorColor,
      hasInfoFlag,
      isOutOfRange,
      puedeReevaluar,
      preguntas,
    });
    const prueba = (nombre, reevaluarCompleta, factores) => ({ nombre, reevaluarCompleta, factores });

    return [
      {
        id: 1,
        episodio: '00852026017279',
        historiaClinica: 'HC-001245',
        dni: '46271839',
        paciente: 'Acco Pino Jonathan Henry',
        empresa: 'MINERA SOTRAMI S.A.',
        ocupacion: 'Operador de planta',
        tipoExamen: 'Retiro',
        fecha: '10/04/2026',
        fechaISO: '2026-04-10',
        estado: 'Pendiente',
        hasOutOfRangeFactor: true,
        hasReevalFlag: true,
        canAperturar: false,
        pruebas: [
          prueba('CPS-001 Escala de Ansiedad', true, [
            factor({
              codigoActuacion: 'ACT-001',
              actuacion: 'Aplicación principal',
              nombre: 'FACTOR_A',
              puntaje: 18,
              nivel: 'Alto',
              interpretacion: 'Resultado por encima del valor esperado.',
              estadoVisual: 'Fuera del valor esperado',
              factorColor: 'orange',
              isOutOfRange: true,
              puedeReevaluar: true,
              preguntas: [
                q('ACT-001', 'Aplicación principal', 'Pregunta 5 - ¿Ha sentido tensión últimamente?', 'Sí, frecuente', 'Observado'),
                q('ACT-001', 'Aplicación principal', 'Pregunta 12 - ¿Duerme adecuadamente?', 'No', 'Revisar'),
                q('ACT-001', 'Aplicación principal', 'Pregunta 18 - ¿Le cuesta relajarse?', 'No', 'Observado'),
              ],
            }),
            factor({
              codigoActuacion: 'ACT-001',
              actuacion: 'Aplicación principal',
              nombre: 'FACTOR_B',
              puntaje: 9,
              nivel: 'Moderado',
              interpretacion: 'Dentro del comportamiento esperado.',
              estadoVisual: 'Correcto',
              preguntas: [
                q('ACT-001', 'Aplicación principal', 'Pregunta 22 - ¿Se distrae con facilidad?', 'A veces', 'Normal'),
              ],
            }),
          ]),
        ],
      },
      {
        id: 2,
        episodio: '00872026020152',
        historiaClinica: 'HC-001284',
        dni: '70519384',
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
          prueba('CPS-002 Atención Sostenida', false, [
            factor({
              codigoActuacion: 'ACT-014',
              actuacion: 'Aplicación única',
              nombre: 'FACTOR_C',
              puntaje: 10,
              nivel: 'Adecuado',
              interpretacion: 'Sin hallazgos relevantes.',
              estadoVisual: 'Correcto',
              preguntas: [
                q('ACT-014', 'Aplicación única', 'Pregunta 4 - ¿Mantiene el foco durante la tarea?', 'Sí', 'Normal'),
                q('ACT-014', 'Aplicación única', 'Pregunta 8 - ¿Comete omisiones frecuentes?', 'No', 'Normal'),
              ],
            }),
          ]),
        ],
      },
      {
        id: 3,
        episodio: '00872026020150',
        historiaClinica: 'HC-001286',
        dni: '43821976',
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
          prueba('CPS-003 Estabilidad Emocional', false, [
            factor({
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
                q('ACT-017', 'Aplicación principal', 'Pregunta 7 - ¿Siente cambios bruscos de ánimo?', 'Sí', 'Observado'),
                q('ACT-017', 'Aplicación principal', 'Pregunta 14 - ¿Se irrita con facilidad?', 'A veces', 'Revisar'),
              ],
            }),
            factor({
              codigoActuacion: 'ACT-017',
              actuacion: 'Aplicación principal',
              nombre: 'FACTOR_B',
              puntaje: 11,
              nivel: 'Moderado',
              interpretacion: 'Resultado estable con seguimiento.',
              estadoVisual: 'Informativo',
              factorColor: 'green',
              hasInfoFlag: true,
              preguntas: [
                q('ACT-017', 'Aplicación principal', 'Pregunta 20 - ¿Logra mantener el control emocional?', 'A veces', 'Normal'),
              ],
            }),
          ]),
        ],
      },
      {
        id: 4,
        episodio: '00912026020031',
        historiaClinica: 'HC-001315',
        dni: '72951460',
        paciente: 'Benites Rojas Carmen Luisa',
        empresa: 'MINERA CHINALCO PERÚ S.A.',
        ocupacion: 'Supervisora de turno',
        tipoExamen: 'Periódico',
        fecha: '08/04/2026',
        fechaISO: '2026-04-08',
        estado: 'Pendiente',
        hasOutOfRangeFactor: false,
        hasReevalFlag: false,
        canAperturar: false,
        pruebas: [
          prueba('CPS-004 Juicio y Toma de Decisiones', false, [
            factor({
              codigoActuacion: 'ACT-025',
              actuacion: 'Aplicación principal',
              nombre: 'FACTOR_C',
              puntaje: 13,
              nivel: 'Adecuado',
              interpretacion: 'Sin hallazgos clínicos, pero requiere repregunta puntual.',
              estadoVisual: 'Informativo',
              hasInfoFlag: true,
              preguntas: [
                q('ACT-025', 'Aplicación principal', 'Pregunta 3 - ¿Verifica procedimientos antes de decidir?', 'Sí', 'Normal'),
                q('ACT-025', 'Aplicación principal', 'Pregunta 10 - ¿Toma atajos bajo presión?', 'A veces', 'Revisar'),
              ],
            }),
          ]),
        ],
      },
      {
        id: 5,
        episodio: '00912026020048',
        historiaClinica: 'HC-001327',
        dni: '41608372',
        paciente: 'Castañeda Huamán Diego Alberto',
        empresa: 'SOUTHERN PERU COPPER CORPORATION',
        ocupacion: 'Mecánico de mantenimiento',
        tipoExamen: 'Periódico',
        fecha: '08/04/2026',
        fechaISO: '2026-04-08',
        estado: 'Reevaluación pendiente',
        hasOutOfRangeFactor: true,
        hasReevalFlag: true,
        canAperturar: false,
        pruebas: [
          prueba('CPS-005 Fatiga y Recuperación', false, [
            factor({
              codigoActuacion: 'ACT-031',
              actuacion: 'Aplicación de seguimiento',
              nombre: 'FACTOR_SUEÑO',
              puntaje: 15,
              nivel: 'Alto',
              interpretacion: 'Se mantiene seguimiento por higiene del sueño.',
              estadoVisual: 'Fuera del valor esperado',
              factorColor: 'orange',
              isOutOfRange: true,
              puedeReevaluar: true,
              preguntas: [
                q('ACT-031', 'Aplicación de seguimiento', 'Pregunta 2 - ¿Duerme menos de 6 horas?', 'Sí', 'Observado'),
                q('ACT-031', 'Aplicación de seguimiento', 'Pregunta 9 - ¿Se siente agotado al iniciar turno?', 'Sí', 'Observado'),
              ],
            }),
          ]),
        ],
      },
      {
        id: 6,
        episodio: '00932026020060',
        historiaClinica: 'HC-001340',
        dni: '76194258',
        paciente: 'Chávez Montalvo Fiorella Andrea',
        empresa: 'MINSUR S.A.',
        ocupacion: 'Analista de laboratorio',
        tipoExamen: 'Ingreso',
        fecha: '07/04/2026',
        fechaISO: '2026-04-07',
        estado: 'Pendiente',
        hasOutOfRangeFactor: true,
        hasReevalFlag: false,
        canAperturar: false,
        pruebas: [
          prueba('CPS-006 Perfil de Atención', true, [
            factor({
              codigoActuacion: 'ACT-040',
              actuacion: 'Aplicación principal',
              nombre: 'FACTOR_OMISIONES',
              puntaje: 17,
              nivel: 'Alto',
              interpretacion: 'Omisiones frecuentes durante la tarea.',
              estadoVisual: 'Fuera del valor esperado',
              factorColor: 'orange',
              isOutOfRange: true,
              preguntas: [
                q('ACT-040', 'Aplicación principal', 'Pregunta 6 - ¿Perdió elementos de la secuencia?', 'Sí', 'Observado'),
                q('ACT-040', 'Aplicación principal', 'Pregunta 11 - ¿Necesitó reinicio?', 'Sí', 'Revisar'),
              ],
            }),
            factor({
              codigoActuacion: 'ACT-040',
              actuacion: 'Aplicación principal',
              nombre: 'FACTOR_RITMO',
              puntaje: 10,
              nivel: 'Adecuado',
              interpretacion: 'Ritmo dentro del rango esperado.',
              estadoVisual: 'Correcto',
              preguntas: [
                q('ACT-040', 'Aplicación principal', 'Pregunta 17 - ¿Mantuvo velocidad constante?', 'Sí', 'Normal'),
              ],
            }),
          ]),
        ],
      },
      {
        id: 7,
        episodio: '00942026020077',
        historiaClinica: 'HC-001355',
        dni: '45289013',
        paciente: 'Dávila Gómez Manuel Esteban',
        empresa: 'SHOUGANG HIERRO PERÚ S.A.A.',
        ocupacion: 'Operador de camión',
        tipoExamen: 'Especial',
        fecha: '07/04/2026',
        fechaISO: '2026-04-07',
        estado: 'Finalizada',
        hasOutOfRangeFactor: false,
        hasReevalFlag: false,
        canAperturar: true,
        pruebas: [
          prueba('CPS-007 Tolerancia al Riesgo', false, [
            factor({
              codigoActuacion: 'ACT-048',
              actuacion: 'Aplicación única',
              nombre: 'FACTOR_RIESGO',
              puntaje: 12,
              nivel: 'Moderado',
              interpretacion: 'Caso cerrado con necesidad de reapertura administrativa.',
              estadoVisual: 'Informativo',
              hasInfoFlag: true,
              preguntas: [
                q('ACT-048', 'Aplicación única', 'Pregunta 13 - ¿Subestima riesgos operativos?', 'A veces', 'Normal'),
              ],
            }),
          ]),
        ],
      },
      {
        id: 8,
        episodio: '00952026020088',
        historiaClinica: 'HC-001366',
        dni: '67823591',
        paciente: 'Espinoza Salas Rosa Milagros',
        empresa: 'NEXA RESOURCES PERÚ S.A.A.',
        ocupacion: 'Técnica de seguridad',
        tipoExamen: 'Periódico',
        fecha: '06/04/2026',
        fechaISO: '2026-04-06',
        estado: 'Pendiente',
        hasOutOfRangeFactor: false,
        hasReevalFlag: false,
        canAperturar: false,
        pruebas: [
          prueba('CPS-008 Adaptación al Cambio', false, [
            factor({
              codigoActuacion: 'ACT-055',
              actuacion: 'Aplicación principal',
              nombre: 'FACTOR_ADAPTACION',
              puntaje: 9,
              nivel: 'Adecuado',
              interpretacion: 'Sin acciones adicionales.',
              estadoVisual: 'Correcto',
              preguntas: [
                q('ACT-055', 'Aplicación principal', 'Pregunta 5 - ¿Se adapta a cambios de turno?', 'Sí', 'Normal'),
                q('ACT-055', 'Aplicación principal', 'Pregunta 8 - ¿Tolera cambios imprevistos?', 'Sí', 'Normal'),
              ],
            }),
          ]),
        ],
      },
      {
        id: 9,
        episodio: '00962026020094',
        historiaClinica: 'HC-001374',
        dni: '73491025',
        paciente: 'Flores Cárdenas Kevin Martín',
        empresa: 'CONSORCIO MINERO HORIZONTE',
        ocupacion: 'Ayudante general',
        tipoExamen: 'Ingreso',
        fecha: '06/04/2026',
        fechaISO: '2026-04-06',
        estado: 'Culminada',
        hasOutOfRangeFactor: true,
        hasReevalFlag: false,
        canAperturar: true,
        pruebas: [
          prueba('CPS-009 Control de Impulsos', false, [
            factor({
              codigoActuacion: 'ACT-061',
              actuacion: 'Aplicación principal',
              nombre: 'FACTOR_AUTOCONTROL',
              puntaje: 19,
              nivel: 'Crítico',
              interpretacion: 'Hallazgo clínico que obliga a reabrir antes de continuar.',
              estadoVisual: 'Fuera del valor esperado',
              factorColor: 'orange',
              hasInfoFlag: true,
              isOutOfRange: true,
              puedeReevaluar: true,
              preguntas: [
                q('ACT-061', 'Aplicación principal', 'Pregunta 4 - ¿Responde impulsivamente ante presión?', 'Sí', 'Observado'),
                q('ACT-061', 'Aplicación principal', 'Pregunta 16 - ¿Rompe procedimientos por rapidez?', 'Sí', 'Observado'),
              ],
            }),
          ]),
        ],
      },
      {
        id: 10,
        episodio: '00972026020102',
        historiaClinica: 'HC-001389',
        dni: '40957268',
        paciente: 'Gómez Rivas Liliana Patricia',
        empresa: 'VOLCAN COMPAÑÍA MINERA S.A.A.',
        ocupacion: 'Administrativa',
        tipoExamen: 'Retorno',
        fecha: '05/04/2026',
        fechaISO: '2026-04-05',
        estado: 'Pendiente',
        hasOutOfRangeFactor: true,
        hasReevalFlag: false,
        canAperturar: false,
        pruebas: [
          prueba('CPS-010 Memoria de Trabajo', false, [
            factor({
              codigoActuacion: 'ACT-070',
              actuacion: 'Aplicación principal',
              nombre: 'FACTOR_MEMORIA',
              puntaje: 14,
              nivel: 'Moderado',
              interpretacion: 'Conviene reevaluar preguntas relacionadas con memoria inmediata.',
              estadoVisual: 'Observado',
              factorColor: 'orange',
              isOutOfRange: true,
              preguntas: [
                q('ACT-070', 'Aplicación principal', 'Pregunta 2 - ¿Olvida instrucciones secuenciales?', 'Sí', 'Observado'),
                q('ACT-070', 'Aplicación principal', 'Pregunta 6 - ¿Recuerda claves de trabajo?', 'A veces', 'Revisar'),
              ],
            }),
          ]),
        ],
      },
      {
        id: 11,
        episodio: '00982026020118',
        historiaClinica: 'HC-001401',
        dni: '48612037',
        paciente: 'Huamán Quispe Jorge Luis',
        empresa: 'MARCOBRE S.A.C.',
        ocupacion: 'Chofer de transporte interno',
        tipoExamen: 'Periódico',
        fecha: '05/04/2026',
        fechaISO: '2026-04-05',
        estado: 'Cerrado',
        hasOutOfRangeFactor: false,
        hasReevalFlag: false,
        canAperturar: true,
        pruebas: [
          prueba('CPS-011 Vigilancia Operativa', false, [
            factor({
              codigoActuacion: 'ACT-079',
              actuacion: 'Aplicación de cierre',
              nombre: 'FACTOR_VIGILANCIA',
              puntaje: 11,
              nivel: 'Adecuado',
              interpretacion: 'Resultado sin hallazgo, pero episodio requiere reapertura por continuidad.',
              estadoVisual: 'Informativo',
              hasInfoFlag: true,
              preguntas: [
                q('ACT-079', 'Aplicación de cierre', 'Pregunta 3 - ¿Mantiene atención en trayectos largos?', 'Sí', 'Normal'),
              ],
            }),
          ]),
        ],
      },
      {
        id: 12,
        episodio: '00992026020127',
        historiaClinica: 'HC-001415',
        dni: '71963840',
        paciente: 'Ibarra Peña Sandra Beatriz',
        empresa: 'ANTAMINA S.A.',
        ocupacion: 'Asistente de almacén',
        tipoExamen: 'Ingreso',
        fecha: '04/04/2026',
        fechaISO: '2026-04-04',
        estado: 'Pendiente',
        hasOutOfRangeFactor: true,
        hasReevalFlag: false,
        canAperturar: false,
        pruebas: [
          prueba('CPS-012 Respuesta al Estrés', false, [
            factor({
              codigoActuacion: 'ACT-085',
              actuacion: 'Aplicación principal',
              nombre: 'FACTOR_ESTRES',
              puntaje: 17,
              nivel: 'Alto',
              interpretacion: 'Se sugiere reevaluación por factor y seguimiento puntual.',
              estadoVisual: 'Fuera del valor esperado',
              factorColor: 'orange',
              isOutOfRange: true,
              puedeReevaluar: true,
              preguntas: [
                q('ACT-085', 'Aplicación principal', 'Pregunta 7 - ¿Presenta somatización bajo presión?', 'Sí', 'Observado'),
                q('ACT-085', 'Aplicación principal', 'Pregunta 15 - ¿Mantiene el autocontrol?', 'A veces', 'Revisar'),
              ],
            }),
            factor({
              codigoActuacion: 'ACT-085',
              actuacion: 'Aplicación principal',
              nombre: 'FACTOR_RECUPERACION',
              puntaje: 8,
              nivel: 'Adecuado',
              interpretacion: 'Capacidad de recuperación conservada.',
              estadoVisual: 'Correcto',
              preguntas: [
                q('ACT-085', 'Aplicación principal', 'Pregunta 19 - ¿Se recupera rápido de eventos intensos?', 'Sí', 'Normal'),
              ],
            }),
          ]),
        ],
      },
    ];
  }
})();
