(() => {
  const TYPE_OPTIONS = [
    { value: 'general', label: 'Generales', icon: 'fa-sliders-h', hint: 'Valor libre que el sistema utiliza como configuración base.' },
    { value: 'icono', label: 'Carga de íconos', icon: 'fa-icons', hint: 'Íconos seleccionables para mantenimientos de prestación y prueba psicológica.' },
    { value: 'rtf', label: 'Plantillas RTF', icon: 'fa-file-signature', hint: 'Plantillas referenciales para portadas y documentos de salida.' },
    { value: 'imagen', label: 'Tamaños de imagen', icon: 'fa-image', hint: 'Define si la categoría usa tamaño Pequeño, Mediano o Grande.' },
    { value: 'audio', label: 'Audio en prueba', icon: 'fa-volume-high', hint: 'Activa o desactiva el apoyo de audio en una prueba psicológica.' }
  ];

  const MODULE_OPTIONS = [
    'Administración',
    'Prestaciones',
    'Prueba psicológica',
    'Documentos',
    'Portadas',
    'Multimedia'
  ];

  const ICON_OPTIONS = [
    { value: 'fa-stethoscope', label: 'Prestación', title: 'Stethoscope' },
    { value: 'fa-brain', label: 'Prueba', title: 'Brain' },
    { value: 'fa-file-signature', label: 'RTF', title: 'Portada' },
    { value: 'fa-image', label: 'Imagen', title: 'Imagen' },
    { value: 'fa-volume-high', label: 'Audio', title: 'Audio' },
    { value: 'fa-clipboard-check', label: 'Ficha', title: 'Ficha' },
    { value: 'fa-user-doctor', label: 'Atención', title: 'Atención' },
    { value: 'fa-chart-line', label: 'Indicador', title: 'Indicador' }
  ];

  const SIZE_OPTIONS = ['Pequeño', 'Mediano', 'Grande'];
  const AUDIO_OPTIONS = ['Sí', 'No'];

  const DB = buildDatabase();
  const state = {
    records: DB,
    filteredRecords: [],
    activeType: 'all',
    editingId: null,
    pendingConfirm: null,
    selectedIcon: 'fa-stethoscope',
    bootstrap: {}
  };

  document.addEventListener('DOMContentLoaded', () => {
    initBootstrapBits();
    initSidebar();
    fillStaticOptions();
    renderChipbar();
    bindEvents();
    applyFilters();
  });

  function initBootstrapBits() {
    state.bootstrap.editorModal = new bootstrap.Modal(document.getElementById('pm_modalEditor'));
    state.bootstrap.confirmModal = new bootstrap.Modal(document.getElementById('pm_modalConfirm'));
    state.bootstrap.toast = new bootstrap.Toast(document.getElementById('pm_toast'), { delay: 2600 });
    state.bootstrap.tooltips = [];
  }

  function initSidebar() {
    const sidebar = document.getElementById('pm_sidebar');
    const main = document.getElementById('pm_mainContent');
    const toggle = () => {
      sidebar.classList.toggle('collapsed');
      main.classList.toggle('expanded');
    };
    document.getElementById('pm_sidebarToggle').addEventListener('click', toggle);
    document.getElementById('pm_sidebarBrandBtn').addEventListener('click', toggle);
  }

  function fillStaticOptions() {
    fillSelect('pm_formTipo', TYPE_OPTIONS.map(item => item.label), false, TYPE_OPTIONS.map(item => item.value));
    fillSelect('pm_formModulo', MODULE_OPTIONS);
  }

  function bindEvents() {
    ['pm_filtroCodigo','pm_filtroDescripcion','pm_filtroValor'].forEach((id) => {
      document.getElementById(id).addEventListener('input', applyFilters);
    });
    document.getElementById('pm_filtroEstado').addEventListener('change', applyFilters);
    document.getElementById('pm_btnBuscar').addEventListener('click', applyFilters);
    document.getElementById('pm_btnLimpiar').addEventListener('click', clearFilters);
    document.getElementById('pm_btnNuevo').addEventListener('click', () => openEditor());
    document.getElementById('pm_btnNuevoHeader').addEventListener('click', () => openEditor());
    document.getElementById('pm_tablaBody').addEventListener('click', onTableClick);
    document.getElementById('pm_btnGuardar').addEventListener('click', saveRecord);
    document.getElementById('pm_btnConfirmar').addEventListener('click', () => {
      if (typeof state.pendingConfirm === 'function') state.pendingConfirm();
      state.pendingConfirm = null;
      state.bootstrap.confirmModal.hide();
    });
    document.getElementById('pm_formTipo').addEventListener('change', renderDynamicFields);
  }

  function renderChipbar() {
    const wrap = document.getElementById('pm_chipbar');
    const chips = [{ value: 'all', label: 'Todos' }].concat(TYPE_OPTIONS.map(item => ({ value: item.value, label: item.label })));
    wrap.innerHTML = chips.map((chip) => `
      <button type="button" class="pm-chip ${state.activeType === chip.value ? 'is-active' : ''}" data-pm-chip="${chip.value}">${chip.label}</button>
    `).join('');
    wrap.querySelectorAll('[data-pm-chip]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.activeType = btn.dataset.pmChip;
        renderChipbar();
        applyFilters();
      });
    });
  }

  function fillSelect(id, values, keepFirst = true, rawValues = null) {
    const select = document.getElementById(id);
    const options = values.map((label, index) => {
      const value = rawValues ? rawValues[index] : label;
      return `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;
    }).join('');
    select.innerHTML = keepFirst ? `<option value="">Seleccionar</option>${options}` : options;
  }

  function clearFilters() {
    ['pm_filtroCodigo','pm_filtroDescripcion','pm_filtroValor','pm_filtroEstado'].forEach((id) => {
      document.getElementById(id).value = '';
    });
    state.activeType = 'all';
    renderChipbar();
    applyFilters();
    showToast('Filtros restablecidos.', 'info');
  }

  function applyFilters() {
    const code = document.getElementById('pm_filtroCodigo').value.trim().toLowerCase();
    const description = document.getElementById('pm_filtroDescripcion').value.trim().toLowerCase();
    const value = document.getElementById('pm_filtroValor').value.trim().toLowerCase();
    const status = document.getElementById('pm_filtroEstado').value;

    state.filteredRecords = state.records.filter((record) => {
      const matchesCode = !code || record.code.toLowerCase().includes(code);
      const matchesDescription = !description || record.description.toLowerCase().includes(description) || record.meta.toLowerCase().includes(description);
      const matchesValue = !value || getValueLabel(record).toLowerCase().includes(value) || (record.valueDetail || '').toLowerCase().includes(value);
      const matchesStatus = !status || record.state === status;
      const matchesType = state.activeType === 'all' || record.type === state.activeType;
      return matchesCode && matchesDescription && matchesValue && matchesStatus && matchesType;
    });

    renderTable();
    renderImpactPreview();
  }

  function renderTable() {
    const tbody = document.getElementById('pm_tablaBody');
    if (!state.filteredRecords.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="pm-empty"><i class="fas fa-inbox mb-2 d-block fs-4"></i>No se encontraron parámetros con los filtros seleccionados.</div></td></tr>`;
      document.getElementById('pm_resultSummary').textContent = '0 resultados';
      activateTooltips();
      return;
    }

    tbody.innerHTML = state.filteredRecords.map((record) => `
      <tr>
        <td>
          <span class="pm-row-code">${escapeHtml(record.code)}</span>
          <span class="pm-row-meta">${escapeHtml(record.area)}</span>
        </td>
        <td>
          <span class="pm-row-desc">${escapeHtml(record.description)}</span>
          <span class="pm-row-meta">${escapeHtml(record.meta)}</span>
        </td>
        <td><span class="pm-value-pill">${renderValue(record)}</span></td>
        <td><span class="pm-type-pill"><i class="fas ${typeInfo(record.type).icon}"></i>${typeInfo(record.type).label}</span></td>
        <td><span class="pm-module-pill">${escapeHtml(record.module)}</span></td>
        <td>${statusBadge(record.state)}</td>
        <td>
          <div class="pm-actions">
            <button type="button" class="pm-icon-btn" data-pm-action="edit" data-id="${record.id}" data-bs-toggle="tooltip" title="Editar parámetro"><i class="fas fa-pen"></i></button>
            <button type="button" class="pm-icon-btn" data-pm-action="toggle" data-id="${record.id}" data-bs-toggle="tooltip" title="${record.state === 'Activo' ? 'Inactivar' : 'Activar'} parámetro"><i class="fas ${record.state === 'Activo' ? 'fa-toggle-on' : 'fa-toggle-off'}"></i></button>
            <button type="button" class="pm-icon-btn" data-pm-action="delete" data-id="${record.id}" data-bs-toggle="tooltip" title="Eliminar parámetro"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');

    const active = state.filteredRecords.filter(item => item.state === 'Activo').length;
    document.getElementById('pm_resultSummary').textContent = `${state.filteredRecords.length} resultados · ${active} activos`;
    activateTooltips();
  }

  function activateTooltips() {
    if (state.bootstrap.tooltips?.length) state.bootstrap.tooltips.forEach((tip) => tip.dispose());
    state.bootstrap.tooltips = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map((el) => new bootstrap.Tooltip(el));
  }

  function onTableClick(event) {
    const btn = event.target.closest('[data-pm-action]');
    if (!btn) return;
    const record = findRecord(btn.dataset.id);
    if (!record) return;
    const action = btn.dataset.pmAction;

    if (action === 'edit') {
      openEditor(record.id);
      return;
    }

    if (action === 'toggle') {
      const nextState = record.state === 'Activo' ? 'Inactivo' : 'Activo';
      openConfirm(`¿Deseas ${nextState === 'Activo' ? 'activar' : 'inactivar'} el parámetro <strong>${escapeHtml(record.code)}</strong>?`, () => {
        record.state = nextState;
        applyFilters();
        showToast(`Parámetro ${nextState === 'Activo' ? 'activado' : 'inactivado'} correctamente.`, nextState === 'Activo' ? 'success' : 'warning');
      });
      return;
    }

    if (action === 'delete') {
      openConfirm(`¿Deseas eliminar el parámetro <strong>${escapeHtml(record.code)}</strong>? Esta acción solo afecta a la demo actual.`, () => {
        state.records = state.records.filter((item) => item.id !== record.id);
        applyFilters();
        showToast('Parámetro eliminado correctamente.', 'danger');
      });
    }
  }

  function openEditor(id = null) {
    state.editingId = id;
    const record = id ? findRecord(id) : null;
    document.getElementById('pm_modalTitle').innerHTML = `<i class="fas fa-sliders-h me-2"></i>${record ? 'Editar parámetro' : 'Nuevo parámetro'}`;
    document.getElementById('pm_editorContexto').innerHTML = record
      ? `Estás editando <strong>${escapeHtml(record.code)}</strong>. Ajusta su configuración para simular cómo impacta en el sistema.`
      : 'Completa la configuración del parámetro. Los cambios se verán reflejados de forma inmediata en la demo.';

    document.getElementById('pm_formCodigo').value = record?.code || suggestNextCode();
    document.getElementById('pm_formDescripcion').value = record?.description || '';
    document.getElementById('pm_formTipo').value = record?.type || 'general';
    document.getElementById('pm_formModulo').value = record?.module || 'Administración';
    document.getElementById('pm_formEstado').value = record?.state || 'Activo';
    state.selectedIcon = record?.value || 'fa-stethoscope';
    renderDynamicFields(record || null);
    state.bootstrap.editorModal.show();
  }

  function renderDynamicFields(record = null) {
    const type = document.getElementById('pm_formTipo').value || 'general';
    const wrap = document.getElementById('pm_dynamicFields');
    const hint = typeInfo(type).hint;
    document.getElementById('pm_formHint').textContent = hint;

    if (type === 'general') {
      wrap.innerHTML = `
        <div class="row g-3">
          <div class="col-md-12">
            <label class="form-label" for="pm_formValorTexto">Valor</label>
            <input class="form-control" id="pm_formValorTexto" maxlength="180" value="${escapeAttr(record?.value || '')}" placeholder="Ej. Código, descripción, valor y estado" />
          </div>
          <div class="col-12">
            <label class="form-label" for="pm_formMeta">Detalle funcional</label>
            <textarea class="form-control" id="pm_formMeta" rows="3" placeholder="Describe para qué sirve esta configuración dentro del sistema.">${escapeHtml(record?.meta || '')}</textarea>
          </div>
        </div>
      `;
      return;
    }

    if (type === 'icono') {
      wrap.innerHTML = `
        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <label class="form-label" for="pm_formArea">Área de uso</label>
            <input class="form-control" id="pm_formArea" maxlength="70" value="${escapeAttr(record?.area || '')}" placeholder="Ej. Cabecera del mantenimiento" />
          </div>
          <div class="col-md-6">
            <label class="form-label" for="pm_formValueDetail">Etiqueta visible</label>
            <input class="form-control" id="pm_formValueDetail" maxlength="80" value="${escapeAttr(record?.valueDetail || '')}" placeholder="Ej. Ícono principal de prestación" />
          </div>
          <div class="col-12">
            <label class="form-label d-block">Ícono a aplicar</label>
            <div class="pm-icon-grid" id="pm_iconGrid">
              ${ICON_OPTIONS.map((icon) => `
                <button type="button" class="pm-icon-option ${state.selectedIcon === icon.value ? 'is-selected' : ''}" data-pm-icon="${icon.value}">
                  <i class="fas ${icon.value}"></i>
                  <span>${icon.label}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      `;
      wrap.querySelectorAll('[data-pm-icon]').forEach((btn) => {
        btn.addEventListener('click', () => {
          state.selectedIcon = btn.dataset.pmIcon;
          wrap.querySelectorAll('[data-pm-icon]').forEach((node) => node.classList.toggle('is-selected', node === btn));
        });
      });
      return;
    }

    if (type === 'rtf') {
      wrap.innerHTML = `
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label" for="pm_formValorTexto">Nombre de plantilla RTF</label>
            <input class="form-control" id="pm_formValorTexto" maxlength="120" value="${escapeAttr(record?.value || '')}" placeholder="Ej. portada_general.rtf" />
          </div>
          <div class="col-md-6">
            <label class="form-label" for="pm_formArea">Uso o portada asociada</label>
            <input class="form-control" id="pm_formArea" maxlength="80" value="${escapeAttr(record?.area || '')}" placeholder="Ej. Portada General Ocupacional" />
          </div>
          <div class="col-12">
            <label class="form-label" for="pm_formMeta">Observación operativa</label>
            <textarea class="form-control" id="pm_formMeta" rows="3" placeholder="Ej. Disponible para generación de portada institucional.">${escapeHtml(record?.meta || '')}</textarea>
          </div>
        </div>
      `;
      return;
    }

    if (type === 'imagen') {
      wrap.innerHTML = `
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label" for="pm_formArea">Categoría visual</label>
            <input class="form-control" id="pm_formArea" maxlength="80" value="${escapeAttr(record?.area || '')}" placeholder="Ej. Portada principal" />
          </div>
          <div class="col-md-6">
            <label class="form-label" for="pm_formTamano">Tamaño</label>
            <select class="form-select" id="pm_formTamano">${SIZE_OPTIONS.map((item) => `<option value="${item}" ${record?.value === item ? 'selected' : ''}>${item}</option>`).join('')}</select>
          </div>
          <div class="col-12">
            <label class="form-label" for="pm_formMeta">Descripción operativa</label>
            <textarea class="form-control" id="pm_formMeta" rows="3" placeholder="Explica dónde se usará este tamaño dentro del sistema.">${escapeHtml(record?.meta || '')}</textarea>
          </div>
        </div>
      `;
      return;
    }

    if (type === 'audio') {
      const current = record?.value || 'Sí';
      wrap.innerHTML = `
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label" for="pm_formArea">Prueba o contexto</label>
            <input class="form-control" id="pm_formArea" maxlength="80" value="${escapeAttr(record?.area || '')}" placeholder="Ej. BC2 - Evaluación de atención" />
          </div>
          <div class="col-md-6">
            <label class="form-label d-block">Audio habilitado</label>
            <div class="pm-radio-group" id="pm_audioGroup">
              ${AUDIO_OPTIONS.map((item) => `
                <label class="pm-radio-card ${current === item ? 'is-selected' : ''}">
                  <input type="radio" name="pm_formAudio" value="${item}" ${current === item ? 'checked' : ''} />
                  <strong>${item}</strong>
                  <small>${item === 'Sí' ? 'La prueba mostrará apoyo de audio.' : 'La prueba seguirá sin audio.'}</small>
                </label>
              `).join('')}
            </div>
          </div>
          <div class="col-12">
            <label class="form-label" for="pm_formMeta">Comportamiento esperado</label>
            <textarea class="form-control" id="pm_formMeta" rows="3" placeholder="Describe cómo responderá la prueba al activar o desactivar audio.">${escapeHtml(record?.meta || '')}</textarea>
          </div>
        </div>
      `;
      wrap.querySelectorAll('.pm-radio-card').forEach((card) => {
        card.addEventListener('click', () => {
          wrap.querySelectorAll('.pm-radio-card').forEach((node) => node.classList.remove('is-selected'));
          card.classList.add('is-selected');
          const radio = card.querySelector('input');
          radio.checked = true;
        });
      });
    }
  }

  function saveRecord() {
    const type = document.getElementById('pm_formTipo').value;
    const code = document.getElementById('pm_formCodigo').value.trim();
    const description = document.getElementById('pm_formDescripcion').value.trim();
    const module = document.getElementById('pm_formModulo').value;
    const stateValue = document.getElementById('pm_formEstado').value;

    if (!code || !description || !type || !module) {
      showToast('Completa código, descripción, tipo y módulo relacionado.', 'warning');
      return;
    }

    const duplicate = state.records.find((item) => item.code.toLowerCase() === code.toLowerCase() && item.id !== state.editingId);
    if (duplicate) {
      showToast('Ya existe un parámetro con ese código.', 'warning');
      return;
    }

    const payload = {
      id: state.editingId || `pm_${Date.now()}`,
      code,
      description,
      type,
      module,
      state: stateValue,
      area: '',
      meta: '',
      value: '',
      valueDetail: ''
    };

    if (type === 'general') {
      payload.value = document.getElementById('pm_formValorTexto')?.value.trim() || '';
      payload.meta = document.getElementById('pm_formMeta')?.value.trim() || 'Parámetro general utilizado por la pantalla administrativa.';
      payload.area = 'Configuración general';
    } else if (type === 'icono') {
      payload.value = state.selectedIcon;
      payload.area = document.getElementById('pm_formArea')?.value.trim() || 'Selector visual';
      payload.valueDetail = document.getElementById('pm_formValueDetail')?.value.trim() || 'Ícono principal';
      payload.meta = `Ícono disponible para ${module.toLowerCase()}${payload.area ? ` · ${payload.area}` : ''}.`;
    } else if (type === 'rtf') {
      payload.value = document.getElementById('pm_formValorTexto')?.value.trim() || '';
      payload.area = document.getElementById('pm_formArea')?.value.trim() || 'Portada institucional';
      payload.meta = document.getElementById('pm_formMeta')?.value.trim() || 'Plantilla RTF lista para salida documental.';
    } else if (type === 'imagen') {
      payload.value = document.getElementById('pm_formTamano')?.value || 'Mediano';
      payload.area = document.getElementById('pm_formArea')?.value.trim() || 'Categoría visual';
      payload.meta = document.getElementById('pm_formMeta')?.value.trim() || `La categoría utilizará tamaño ${payload.value}.`;
    } else if (type === 'audio') {
      payload.value = document.querySelector('input[name="pm_formAudio"]:checked')?.value || 'No';
      payload.area = document.getElementById('pm_formArea')?.value.trim() || 'Prueba psicológica';
      payload.meta = document.getElementById('pm_formMeta')?.value.trim() || (payload.value === 'Sí' ? 'La prueba habilitará apoyo de audio durante su ejecución.' : 'La prueba se ejecutará sin audio.');
    }

    if (!payload.value) {
      showToast('Completa el valor del parámetro antes de guardar.', 'warning');
      return;
    }

    if (state.editingId) {
      const index = state.records.findIndex((item) => item.id === state.editingId);
      if (index >= 0) state.records[index] = payload;
      showToast('Parámetro actualizado correctamente.', 'success');
    } else {
      state.records.unshift(payload);
      showToast('Parámetro registrado correctamente.', 'success');
    }

    state.bootstrap.editorModal.hide();
    state.editingId = null;
    applyFilters();
  }

  function openConfirm(message, onConfirm) {
    document.getElementById('pm_confirmMessage').innerHTML = message;
    state.pendingConfirm = onConfirm;
    state.bootstrap.confirmModal.show();
  }

  function renderImpactPreview() {
    const activeRecords = state.records.filter((item) => item.state === 'Activo');
    const iconPrest = activeRecords.find((item) => item.type === 'icono' && item.module === 'Prestaciones') || activeRecords.find((item) => item.type === 'icono');
    const iconPrueba = activeRecords.find((item) => item.type === 'icono' && item.module === 'Prueba psicológica') || iconPrest;
    const plantilla = activeRecords.find((item) => item.type === 'rtf') || state.records.find((item) => item.type === 'rtf');
    const imageSize = activeRecords.find((item) => item.type === 'imagen') || state.records.find((item) => item.type === 'imagen');
    const audio = activeRecords.find((item) => item.type === 'audio' && item.module === 'Prueba psicológica') || state.records.find((item) => item.type === 'audio');

    setPreviewIcon('pm_previewPrestacionIcon', iconPrest?.value || 'fa-stethoscope');
    document.getElementById('pm_previewPrestacionLabel').textContent = iconPrest?.value || 'fa-stethoscope';
    document.getElementById('pm_previewPrestacionState').textContent = iconPrest ? 'Disponible' : 'Sin configuración';

    setPreviewIcon('pm_previewPruebaIcon', iconPrueba?.value || 'fa-brain');
    document.getElementById('pm_previewPruebaLabel').textContent = iconPrueba?.value || 'fa-brain';
    document.getElementById('pm_previewAudioState').textContent = audio?.value || 'No';

    const audioPill = document.getElementById('pm_previewAudioPill');
    const audioEnabled = (audio?.value || 'No') === 'Sí';
    audioPill.classList.toggle('is-disabled', !audioEnabled);
    audioPill.innerHTML = `<i class="fas ${audioEnabled ? 'fa-volume-up' : 'fa-volume-mute'}"></i> ${audioEnabled ? 'Audio habilitado para la prueba activa' : 'Audio deshabilitado para la prueba activa'}`;

    document.getElementById('pm_previewPlantilla').textContent = plantilla?.value || 'sin_plantilla.rtf';
    document.getElementById('pm_previewPortadaNombre').textContent = plantilla?.area || 'Portada referencial';

    const sizeLabel = normalizeSizeClass(imageSize?.value || 'Mediano');
    document.getElementById('pm_previewImagenSize').textContent = imageSize?.value || 'Mediano';
    const imageBox = document.getElementById('pm_previewImageBox');
    imageBox.className = `pm-image-preview ${sizeLabel}`;
    document.getElementById('pm_previewImageTag').textContent = `${imageSize?.area || 'Categoría visual'} con tamaño ${imageSize?.value || 'Mediano'}`;
  }

  function setPreviewIcon(targetId, iconClass) {
    document.getElementById(targetId).innerHTML = `<i class="fas ${iconClass}"></i>`;
  }

  function normalizeSizeClass(value) {
    const key = String(value || '').toLowerCase();
    if (key.includes('peq')) return 'size-pequeno';
    if (key.includes('gran')) return 'size-grande';
    return 'size-mediano';
  }

  function showToast(message, type = 'success') {
    const toastEl = document.getElementById('pm_toast');
    const body = document.getElementById('pm_toastBody');
    body.textContent = message;
    toastEl.classList.remove('bg-success', 'bg-warning', 'bg-danger', 'bg-info', 'text-dark');
    if (type === 'warning') {
      toastEl.classList.add('bg-warning', 'text-dark');
    } else if (type === 'danger') {
      toastEl.classList.add('bg-danger');
    } else if (type === 'info') {
      toastEl.classList.add('bg-info', 'text-dark');
    } else {
      toastEl.classList.add('bg-success');
    }
    state.bootstrap.toast.show();
  }

  function statusBadge(status) {
    const cls = status === 'Activo' ? 'pm-status pm-status-activo' : 'pm-status pm-status-inactivo';
    return `<span class="${cls}"><i class="fas ${status === 'Activo' ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>${escapeHtml(status)}</span>`;
  }

  function renderValue(record) {
    if (record.type === 'icono') {
      return `<i class="fas ${record.value}"></i>${escapeHtml(record.valueDetail || record.value)}`;
    }
    return `${escapeHtml(getValueLabel(record))}`;
  }

  function getValueLabel(record) {
    return record.value || record.valueDetail || '—';
  }

  function typeInfo(type) {
    return TYPE_OPTIONS.find((item) => item.value === type) || TYPE_OPTIONS[0];
  }

  function suggestNextCode() {
    const max = state.records.reduce((acc, item) => {
      const num = Number(String(item.code).replace(/\D/g, ''));
      return Number.isFinite(num) ? Math.max(acc, num) : acc;
    }, 0);
    return `PRM-${String(max + 1).padStart(3, '0')}`;
  }

  function findRecord(id) {
    return state.records.find((item) => item.id === id) || null;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }

  function buildDatabase() {
    return [
      {
        id: 'pm_1',
        code: 'PRM-001',
        description: 'Ícono principal para mantenimiento de prestaciones',
        value: 'fa-stethoscope',
        valueDetail: 'Ícono cabecera de prestaciones',
        state: 'Activo',
        type: 'icono',
        module: 'Prestaciones',
        area: 'Cabecera del mantenimiento',
        meta: 'Ícono visible en tarjetas y selector del mantenimiento de prestaciones.'
      },
      {
        id: 'pm_2',
        code: 'PRM-002',
        description: 'Ícono principal para mantenimiento de prueba psicológica',
        value: 'fa-brain',
        valueDetail: 'Ícono cabecera de prueba psicológica',
        state: 'Activo',
        type: 'icono',
        module: 'Prueba psicológica',
        area: 'Cabecera del mantenimiento',
        meta: 'Ícono disponible en la pantalla principal de configuración de pruebas.'
      },
      {
        id: 'pm_3',
        code: 'PRM-003',
        description: 'Plantilla RTF para portada general ocupacional',
        value: 'portada_general.rtf',
        state: 'Activo',
        type: 'rtf',
        module: 'Documentos',
        area: 'Portada General Ocupacional',
        meta: 'Plantilla utilizada como base para la portada del documento emitido.'
      },
      {
        id: 'pm_4',
        code: 'PRM-004',
        description: 'Tamaño de imagen para portada principal',
        value: 'Grande',
        state: 'Activo',
        type: 'imagen',
        module: 'Portadas',
        area: 'Portada principal',
        meta: 'La imagen principal se presenta a tamaño Grande en la portada.'
      },
      {
        id: 'pm_5',
        code: 'PRM-005',
        description: 'Tamaño de imagen para miniatura de ficha',
        value: 'Pequeño',
        state: 'Activo',
        type: 'imagen',
        module: 'Multimedia',
        area: 'Miniatura de ficha',
        meta: 'Las miniaturas muestran tamaño Pequeño para conservar legibilidad.'
      },
      {
        id: 'pm_6',
        code: 'PRM-006',
        description: 'Activación de audio en la prueba BC2',
        value: 'Sí',
        state: 'Activo',
        type: 'audio',
        module: 'Prueba psicológica',
        area: 'BC2 - Atención sostenida',
        meta: 'La prueba habilita audio de apoyo durante las instrucciones iniciales.'
      },
      {
        id: 'pm_7',
        code: 'PRM-007',
        description: 'Activación de audio en la prueba FRP-12',
        value: 'No',
        state: 'Activo',
        type: 'audio',
        module: 'Prueba psicológica',
        area: 'FRP-12 - Riesgo psicosocial',
        meta: 'La prueba se ejecuta sin audio para priorizar lectura directa.'
      },
      {
        id: 'pm_8',
        code: 'PRM-008',
        description: 'Pantalla de búsqueda habilitada para mantenimiento de parámetros',
        value: 'Código, descripción, valor y estado',
        state: 'Activo',
        type: 'general',
        module: 'Administración',
        area: 'Configuración general',
        meta: 'Controla los filtros visibles en la pantalla principal del mantenimiento de parámetros.'
      },
      {
        id: 'pm_9',
        code: 'PRM-009',
        description: 'Plantilla RTF histórica para portada de evaluación clínica',
        value: 'portada_clinica_v1.rtf',
        state: 'Inactivo',
        type: 'rtf',
        module: 'Documentos',
        area: 'Portada evaluación clínica',
        meta: 'Versión anterior conservada solo para revisión histórica.'
      }
    ];
  }
})();
