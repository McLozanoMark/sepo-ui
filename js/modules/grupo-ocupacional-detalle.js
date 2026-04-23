(function () {
  var currentRows = [];
  var editingIndex = null;
  var searchboxInstances = {};

  var presetRowsByGroup = {
    'GO-001': [
      { grado: 'Secundaria Completa', ocupacion: 'Asistente Administrativo', tipo: 'Administrativo', estado: 'Activo' },
      { grado: 'Universitario Completo', ocupacion: 'Analista de Sistemas', tipo: 'Administrativo', estado: 'Activo' },
    ],
    'GO-004': [
      { grado: 'Técnico Completo', ocupacion: 'Enfermero(a) Ocupacional', tipo: 'Asistencial', estado: 'Activo' },
      { grado: 'Universitario Completo', ocupacion: 'Médico Evaluador', tipo: 'Asistencial', estado: 'Activo' },
      { grado: 'Secundaria Completa', ocupacion: 'Técnico en Laboratorio', tipo: 'Operativo', estado: 'Activo' },
    ],
    'GO-005': [
      { grado: 'Secundaria Completa', ocupacion: 'Operador de Montacarga', tipo: 'Operativo', estado: 'Activo' },
      { grado: 'Técnico Completo', ocupacion: 'Soldador', tipo: 'Operativo', estado: 'Activo' },
    ],
    'GO-011': [
      { grado: 'Universitario Completo', ocupacion: 'Analista de Recursos Humanos', tipo: 'Administrativo', estado: 'Activo' },
      { grado: 'Maestría / Postgrado', ocupacion: 'Psicólogo(a) Ocupacional', tipo: 'Especializado', estado: 'Activo' },
    ],
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function cloneRows(rows) {
    return (rows || []).map(function (row) {
      return {
        grado: row.grado,
        ocupacion: row.ocupacion,
        tipo: row.tipo,
        estado: row.estado || 'Activo',
      };
    });
  }

  function inferCardState(card) {
    var badge = card && card.querySelector('.b-activo, .b-inactivo');
    return !badge || !/inactivo/i.test((badge.textContent || '').trim());
  }

  function getNextCode(prefix, selector) {
    var numbers = Array.from(document.querySelectorAll(selector))
      .map(function (el) { return (el.textContent || '').trim(); })
      .filter(function (value) { return value.indexOf(prefix) === 0; })
      .map(function (value) { return Number(value.replace(prefix, '')); })
      .filter(function (value) { return !Number.isNaN(value); });
    var next = (numbers.length ? Math.max.apply(null, numbers) : 0) + 1;
    return prefix + String(next).padStart(3, '0');
  }

  function updateSwitchLabel() {
    var input = byId('goActivo');
    var label = byId('goActivoLabel');
    if (!input || !label) return;
    label.textContent = input.checked ? 'Estado (Activo)' : 'Estado (Inactivo)';
  }

  function configureHistorial(visible) {
    var button = byId('btnHistorialGrupoOcupacional');
    if (!button) return;
    button.style.display = visible ? 'inline-flex' : 'none';
    button.onclick = visible
      ? function () {
          if (typeof verHistorial === 'function') verHistorial('Grupos Ocupacionales');
        }
      : null;
  }

  function getOptionTexts(selector) {
    var values = Array.from(document.querySelectorAll(selector))
      .map(function (el) { return (el.textContent || '').trim(); })
      .filter(Boolean);
    return Array.from(new Set(values));
  }

  function fillSelect(selectId, values, placeholder) {
    var select = byId(selectId);
    if (!select) return;
    select.innerHTML = '';
    var placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = placeholder;
    select.appendChild(placeholderOption);
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }


  function normalizeSearch(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim();
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function getSelectPlaceholder(select, fallback) {
    var option = select && select.querySelector('option[value=""]');
    return (option && option.textContent || fallback || 'Seleccionar...').trim();
  }

  function closeGoSearchbox(selectId) {
    var instance = searchboxInstances[selectId];
    if (!instance) return;
    instance.field.classList.remove('is-open');
    instance.panel.hidden = true;
    instance.trigger.setAttribute('aria-expanded', 'false');
    instance.input.value = '';
  }

  function closeAllGoSearchboxes(exceptId) {
    Object.keys(searchboxInstances).forEach(function (selectId) {
      if (selectId !== exceptId) closeGoSearchbox(selectId);
    });
  }

  function setGoSearchboxTriggerText(instance, text) {
    instance.triggerText.textContent = text || instance.placeholder;
  }

  function buildGoSearchboxOptions(instance, query) {
    var normalizedQuery = normalizeSearch(query);
    var currentValue = instance.select.value;
    var options = Array.from(instance.select.options)
      .filter(function (option) { return option.value !== ''; })
      .filter(function (option) {
        if (!normalizedQuery) return true;
        return normalizeSearch(option.textContent).indexOf(normalizedQuery) !== -1;
      });

    if (!options.length) {
      instance.options.innerHTML = '<div class="go-searchbox-empty">No se encontraron resultados.</div>';
      return;
    }

    instance.options.innerHTML = options.map(function (option, index) {
      var selected = option.value === currentValue;
      return [
        '<button',
        ' class="go-searchbox-option' + (selected ? ' is-selected' : '') + (index === 0 ? ' is-active' : '') + '"',
        ' type="button"',
        ' data-value="' + escapeAttr(option.value) + '"',
        ' role="option"',
        ' aria-selected="' + (selected ? 'true' : 'false') + '">',
        '<span>' + escapeHtml(option.textContent) + '</span>',
        '</button>'
      ].join('');
    }).join('');
  }

  function syncGoSearchboxFromSelect(selectId) {
    var instance = searchboxInstances[selectId];
    if (!instance) return;
    instance.placeholder = getSelectPlaceholder(instance.select, instance.placeholder);
    var selected = instance.select.options[instance.select.selectedIndex];
    var text = selected && selected.value !== '' ? selected.textContent : instance.placeholder;
    setGoSearchboxTriggerText(instance, text);
    if (instance.select.disabled) {
      instance.field.classList.add('is-disabled');
      instance.trigger.disabled = true;
      closeGoSearchbox(selectId);
      return;
    }
    instance.field.classList.remove('is-disabled');
    instance.trigger.disabled = false;
    if (instance.field.classList.contains('is-open')) buildGoSearchboxOptions(instance, instance.input.value);
  }

  function selectGoSearchboxOption(instance, value) {
    instance.select.value = value;
    instance.select.dispatchEvent(new Event('change', { bubbles: true }));
    syncGoSearchboxFromSelect(instance.select.id);
    closeGoSearchbox(instance.select.id);
  }

  function openGoSearchbox(selectId) {
    var instance = searchboxInstances[selectId];
    if (!instance || instance.select.disabled) return;
    closeAllGoSearchboxes(selectId);
    instance.field.classList.add('is-open');
    instance.panel.hidden = false;
    instance.trigger.setAttribute('aria-expanded', 'true');
    buildGoSearchboxOptions(instance, instance.input.value);
    instance.input.focus();
    instance.input.select();
  }

  function ensureGoSearchbox(selectId, fallbackPlaceholder) {
    var select = byId(selectId);
    if (!select || searchboxInstances[selectId]) return;

    var field = document.createElement('div');
    field.className = 'go-searchbox-field';
    field.setAttribute('data-go-searchbox', selectId);
    field.innerHTML = [
      '<button class="go-searchbox-trigger" type="button" aria-expanded="false">',
      '<span class="go-searchbox-trigger-text"></span>',
      '<i class="fas fa-chevron-down" aria-hidden="true"></i>',
      '</button>',
      '<div class="go-searchbox-panel" hidden>',
        '<div class="go-searchbox-input-wrap">',
          '<i class="fas fa-search" aria-hidden="true"></i>',
          '<input class="go-searchbox-input" type="text" autocomplete="off" placeholder="Buscar..." />',
        '</div>',
        '<div class="go-searchbox-options" role="listbox"></div>',
      '</div>'
    ].join('');

    select.classList.add('go-searchbox-native');
    select.parentNode.insertBefore(field, select);

    var instance = {
      select: select,
      field: field,
      trigger: field.querySelector('.go-searchbox-trigger'),
      triggerText: field.querySelector('.go-searchbox-trigger-text'),
      panel: field.querySelector('.go-searchbox-panel'),
      input: field.querySelector('.go-searchbox-input'),
      options: field.querySelector('.go-searchbox-options'),
      placeholder: getSelectPlaceholder(select, fallbackPlaceholder)
    };

    instance.trigger.addEventListener('click', function () {
      if (instance.field.classList.contains('is-open')) closeGoSearchbox(selectId);
      else openGoSearchbox(selectId);
    });

    instance.input.addEventListener('input', function () {
      buildGoSearchboxOptions(instance, instance.input.value);
    });

    instance.input.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeGoSearchbox(selectId);
        instance.trigger.focus();
      }
    });

    instance.options.addEventListener('click', function (event) {
      var button = event.target.closest('.go-searchbox-option');
      if (!button) return;
      selectGoSearchboxOption(instance, button.getAttribute('data-value'));
    });

    select.addEventListener('change', function () {
      syncGoSearchboxFromSelect(selectId);
    });

    searchboxInstances[selectId] = instance;
    syncGoSearchboxFromSelect(selectId);
  }

  function initializeGoSearchboxes() {
    ensureGoSearchbox('goDetalleGrado', 'Seleccionar grado de instrucción');
    ensureGoSearchbox('goDetalleOcupacion', 'Seleccionar ocupación');
  }

  function setGoSearchboxValue(selectId, value) {
    var select = byId(selectId);
    if (!select) return;
    select.value = value || '';
    syncGoSearchboxFromSelect(selectId);
  }

  function deriveTipo(ocupacion) {
    var value = (ocupacion || '').toLowerCase();
    if (/m[eé]dico|enfermer|psic[oó]logo|laboratorio/.test(value)) return 'Asistencial';
    if (/analista|administr|asistente|recursos humanos|contador/.test(value)) return 'Administrativo';
    if (/soldador|operador|t[eé]cnico|chofer|mantenimiento/.test(value)) return 'Operativo';
    if (/gerente|jefe|coordinador/.test(value)) return 'Estratégico';
    return 'General';
  }

  function getDefaultRows(desc) {
    var normalized = (desc || '').toLowerCase();
    if (normalized.indexOf('salud') !== -1) return cloneRows(presetRowsByGroup['GO-004']);
    if (normalized.indexOf('miner') !== -1) return cloneRows(presetRowsByGroup['GO-005']);
    if (normalized.indexOf('recurso') !== -1) return cloneRows(presetRowsByGroup['GO-011']);
    return cloneRows(presetRowsByGroup['GO-001']);
  }

  function resetDetailForm() {
    var grado = byId('goDetalleGrado');
    var ocupacion = byId('goDetalleOcupacion');
    var button = byId('btnGoAddDetalle');
    if (grado) setGoSearchboxValue('goDetalleGrado', '');
    if (ocupacion) setGoSearchboxValue('goDetalleOcupacion', '');
    if (button) button.innerHTML = '<i class="fas fa-plus me-2"></i>Añadir';
    editingIndex = null;
  }

  function rowMatchesFilter(row, term) {
    if (!term) return true;
    var haystack = [row.grado, row.ocupacion, row.tipo, row.estado].join(' ').toLowerCase();
    return haystack.indexOf(term) !== -1;
  }

  function renderRows() {
    var tbody = byId('goDetalleTableBody');
    if (!tbody) return;
    var term = ((byId('goDetalleBuscar') && byId('goDetalleBuscar').value) || '').trim().toLowerCase();
    var visibleRows = currentRows.filter(function (row) {
      return rowMatchesFilter(row, term);
    });

    if (!visibleRows.length) {
      tbody.innerHTML = '<tr class="go-detalle-empty"><td colspan="5">No hay ocupaciones y grados de instrucción asociados para mostrar.</td></tr>';
      return;
    }

    tbody.innerHTML = visibleRows.map(function (row, filteredIndex) {
      var realIndex = currentRows.indexOf(row);
      return [
        '<tr>',
        '<td><span class="fw-semibold text-slate">' + escapeHtml(row.grado) + '</span></td>',
        '<td>' + escapeHtml(row.ocupacion) + '</td>',
        '<td><span class="go-chip-tipo">' + escapeHtml(row.tipo) + '</span></td>',
        '<td><span class="go-chip-estado activo">' + escapeHtml(row.estado) + '</span></td>',
        '<td class="text-center">',
          '<div class="go-table-actions">',
            '<button class="btn-action btn-edit" data-go-action="edit" data-go-index="' + realIndex + '" title="Editar asociación" type="button"><i class="fas fa-pen"></i></button>',
            '<button class="btn-action btn-del" data-go-action="delete" data-go-index="' + realIndex + '" title="Eliminar asociación" type="button"><i class="fas fa-trash"></i></button>',
          '</div>',
        '</td>',
        '</tr>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function upsertDetailRow() {
    var grado = (byId('goDetalleGrado') && byId('goDetalleGrado').value || '').trim();
    var ocupacion = (byId('goDetalleOcupacion') && byId('goDetalleOcupacion').value || '').trim();
    if (!grado || !ocupacion) {
      if (typeof showToast === 'function') showToast('Selecciona el grado de instrucción y la ocupación.');
      return;
    }

    var duplicateIndex = currentRows.findIndex(function (row, index) {
      return row.grado === grado && row.ocupacion === ocupacion && index !== editingIndex;
    });
    if (duplicateIndex !== -1) {
      if (typeof showToast === 'function') showToast('Esta asociación ya fue añadida al detalle.');
      return;
    }

    var row = {
      grado: grado,
      ocupacion: ocupacion,
      tipo: deriveTipo(ocupacion),
      estado: 'Activo',
    };

    if (editingIndex !== null) {
      currentRows[editingIndex] = row;
      if (typeof showToast === 'function') showToast('Asociación actualizada correctamente.');
    } else {
      currentRows.push(row);
      if (typeof showToast === 'function') showToast('Asociación añadida correctamente.');
    }

    resetDetailForm();
    renderRows();
  }

  function editDetailRow(index) {
    var row = currentRows[index];
    if (!row) return;
    var grado = byId('goDetalleGrado');
    var ocupacion = byId('goDetalleOcupacion');
    var button = byId('btnGoAddDetalle');
    if (grado) setGoSearchboxValue('goDetalleGrado', row.grado);
    if (ocupacion) setGoSearchboxValue('goDetalleOcupacion', row.ocupacion);
    if (button) button.innerHTML = '<i class="fas fa-pen me-2"></i>Actualizar';
    editingIndex = index;
  }

  function deleteDetailRow(index) {
    if (index < 0 || index >= currentRows.length) return;
    currentRows.splice(index, 1);
    if (editingIndex === index) resetDetailForm();
    if (editingIndex !== null && editingIndex > index) editingIndex -= 1;
    renderRows();
    if (typeof showToast === 'function') showToast('Asociación eliminada del detalle.');
  }

  function bindTableActions() {
    var tbody = byId('goDetalleTableBody');
    if (!tbody || tbody.dataset.bound === 'true') return;
    tbody.dataset.bound = 'true';
    tbody.addEventListener('click', function (event) {
      var button = event.target.closest('[data-go-action]');
      if (!button) return;
      var index = Number(button.getAttribute('data-go-index'));
      var action = button.getAttribute('data-go-action');
      if (action === 'edit') editDetailRow(index);
      if (action === 'delete') deleteDetailRow(index);
    });
  }

  function configureSave(modalId) {
    var button = byId('btnSaveGrupoOcupacional');
    if (!button) return;
    button.onclick = function () {
      var descInput = byId('goDesc');
      if (!descInput || !descInput.value.trim()) {
        if (typeof showToast === 'function') showToast('⚠️ Por favor, complete la descripción.');
        return;
      }
      if (!currentRows.length) {
        if (typeof showToast === 'function') showToast('Añade al menos una asociación al detalle del grupo ocupacional.');
        return;
      }
      if (typeof confirmarGuardar === 'function') {
        confirmarGuardar('Grupos', function () {
          var modalEl = byId(modalId);
          var modal = modalEl && window.bootstrap ? bootstrap.Modal.getInstance(modalEl) : null;
          if (modal) modal.hide();
          if (typeof showToast === 'function') showToast('Cambios guardados correctamente');
        });
      }
    };
  }

  function openGrupoOcupacionalModal(cod, desc, activo) {
    var isEdit = !!cod;
    byId('tGrupoOcupacionalModal').innerHTML = isEdit
      ? '<i class="fas fa-pen me-2 text-primary"></i>Editar Grupo Ocupacional'
      : '<i class="fas fa-plus me-2 text-primary"></i>Nuevo Grupo Ocupacional';
    byId('goAutoId').value = getNextCode('GO-', '#screen-grupos .card-item strong');
    byId('goCod').value = cod || '';
    byId('goCod').disabled = isEdit;
    byId('goDesc').value = desc || '';
    byId('goActivo').checked = typeof activo === 'boolean' ? activo : true;
    updateSwitchLabel();
    configureHistorial(isEdit);

    var grados = getOptionTexts('#screen-grado .card-item .fw-semibold');
    var ocupaciones = getOptionTexts('#screen-ocupaciones .card-item .fw-semibold');
    fillSelect('goDetalleGrado', grados, 'Seleccionar grado de instrucción');
    fillSelect('goDetalleOcupacion', ocupaciones, 'Seleccionar ocupación');
    initializeGoSearchboxes();
    syncGoSearchboxFromSelect('goDetalleGrado');
    syncGoSearchboxFromSelect('goDetalleOcupacion');

    currentRows = cloneRows((cod && presetRowsByGroup[cod]) || getDefaultRows(desc));
    if (byId('goDetalleBuscar')) byId('goDetalleBuscar').value = '';
    resetDetailForm();
    renderRows();
    configureSave('modalGrupoOcupacional');
  }

  function rewireNewButton() {
    var button = Array.from(document.querySelectorAll('#screen-grupos .btn-prim')).find(function (el) {
      return (el.textContent || '').trim().indexOf('Nuevo') !== -1;
    });
    if (!button) return;
    button.setAttribute('data-bs-target', '#modalGrupoOcupacional');
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('onclick', 'openGrupoOcupacionalModal()');
  }

  function rewireEditButtons() {
    document.querySelectorAll('#screen-grupos .card-item').forEach(function (card) {
      var editButton = card.querySelector('.btn-action.btn-edit');
      if (!editButton) return;
      var cod = (card.querySelector('strong') && card.querySelector('strong').textContent || '').trim();
      var desc = (card.querySelector('.fw-semibold') && card.querySelector('.fw-semibold').textContent || '').trim();
      var activo = inferCardState(card);
      editButton.setAttribute('data-bs-target', '#modalGrupoOcupacional');
      editButton.setAttribute('data-bs-toggle', 'modal');
      editButton.setAttribute('onclick', 'openGrupoOcupacionalModal(' + JSON.stringify(cod) + ', ' + JSON.stringify(desc) + ', ' + (activo ? 'true' : 'false') + ')');
    });
  }

  function bindEvents() {
    var addButton = byId('btnGoAddDetalle');
    var searchInput = byId('goDetalleBuscar');
    var switchInput = byId('goActivo');
    var modalEl = byId('modalGrupoOcupacional');

    if (addButton && addButton.dataset.bound !== 'true') {
      addButton.dataset.bound = 'true';
      addButton.addEventListener('click', upsertDetailRow);
    }

    if (searchInput && searchInput.dataset.bound !== 'true') {
      searchInput.dataset.bound = 'true';
      searchInput.addEventListener('input', renderRows);
    }

    if (switchInput && switchInput.dataset.bound !== 'true') {
      switchInput.dataset.bound = 'true';
      switchInput.addEventListener('change', updateSwitchLabel);
    }

    if (modalEl && modalEl.dataset.bound !== 'true') {
      modalEl.dataset.bound = 'true';
      modalEl.addEventListener('hidden.bs.modal', function () {
        if (byId('goDetalleBuscar')) byId('goDetalleBuscar').value = '';
        closeAllGoSearchboxes();
        resetDetailForm();
        renderRows();
      });
    }

    if (document.body && document.body.dataset.goSearchboxBound !== 'true') {
      document.body.dataset.goSearchboxBound = 'true';
      document.addEventListener('click', function (event) {
        Object.keys(searchboxInstances).forEach(function (selectId) {
          var instance = searchboxInstances[selectId];
          if (!instance || instance.field.contains(event.target)) return;
          closeGoSearchbox(selectId);
        });
      });
    }

    bindTableActions();
  }

  function init() {
    initializeGoSearchboxes();
    bindEvents();
    rewireNewButton();
    rewireEditButtons();
    updateSwitchLabel();
  }

  window.openGrupoOcupacionalModal = openGrupoOcupacionalModal;
  document.addEventListener('DOMContentLoaded', init);
})();
