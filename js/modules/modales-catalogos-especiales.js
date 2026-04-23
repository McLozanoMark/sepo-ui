(function () {
  function inferCardState(card) {
    const badge = card && card.querySelector('.b-activo, .b-inactivo');
    return !badge || !/inactivo/i.test((badge.textContent || '').trim());
  }

  function updateSwitchLabel(input, label) {
    if (!input || !label) return;
    label.textContent = input.checked ? 'Estado (Activo)' : 'Estado (Inactivo)';
  }

  function getNextCode(prefix, selector) {
    const numbers = Array.from(document.querySelectorAll(selector))
      .map(function (el) { return (el.textContent || '').trim(); })
      .filter(function (value) { return value.indexOf(prefix) === 0; })
      .map(function (value) { return Number(value.replace(prefix, '')); })
      .filter(function (value) { return !Number.isNaN(value); });
    const next = (numbers.length ? Math.max.apply(null, numbers) : 0) + 1;
    return prefix + String(next).padStart(3, '0');
  }

  function configureHistorial(buttonId, modulo, visible) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    button.style.display = visible ? 'inline-flex' : 'none';
    button.onclick = visible
      ? function () {
          if (typeof verHistorial === 'function') verHistorial(modulo);
        }
      : null;
  }

  function configureSave(buttonId, modalId, modulo, descId) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    button.onclick = function () {
      const descInput = document.getElementById(descId);
      if (!descInput || !descInput.value.trim()) {
        if (typeof showToast === 'function') {
          showToast('⚠️ Por favor, complete la descripción.');
        }
        return;
      }
      if (typeof confirmarGuardar === 'function') {
        confirmarGuardar(modulo, function () {
          const modalEl = document.getElementById(modalId);
          const modal = modalEl && window.bootstrap ? bootstrap.Modal.getInstance(modalEl) : null;
          if (modal) modal.hide();
          if (typeof showToast === 'function') {
            showToast('Cambios guardados correctamente');
          }
        });
      }
    };
  }

  function openGradoModal(cod, desc, activo) {
    const isEdit = !!cod;
    document.getElementById('tGradoModal').innerHTML = isEdit
      ? '<i class="fas fa-pen me-2 text-primary"></i>Editar Grado de Instrucción'
      : '<i class="fas fa-plus me-2 text-primary"></i>Nuevo Grado de Instrucción';
    document.getElementById('gAutoId').value = getNextCode('GI-', '#screen-grado .card-item strong');
    document.getElementById('gCod').value = cod || '';
    document.getElementById('gCod').disabled = isEdit;
    document.getElementById('gDesc').value = desc || '';
    document.getElementById('gActivo').checked = typeof activo === 'boolean' ? activo : true;
    updateSwitchLabel(document.getElementById('gActivo'), document.getElementById('gActivoLabel'));
    configureHistorial('btnHistorialGrado', 'Grado de Instrucción', isEdit);
    configureSave('btnSaveGrado', 'modalGrado', 'Grado de Instrucción', 'gDesc');
  }

  function openOcupacionModal(cod, desc, activo) {
    const isEdit = !!cod;
    document.getElementById('tOcupacionModal').innerHTML = isEdit
      ? '<i class="fas fa-pen me-2 text-primary"></i>Editar Ocupación'
      : '<i class="fas fa-plus me-2 text-primary"></i>Nueva Ocupación';
    document.getElementById('oAutoId').value = getNextCode('OC-', '#screen-ocupaciones .card-item strong');
    document.getElementById('oCod').value = cod || '';
    document.getElementById('oCod').disabled = isEdit;
    document.getElementById('oDesc').value = desc || '';
    document.getElementById('oActivo').checked = typeof activo === 'boolean' ? activo : true;
    updateSwitchLabel(document.getElementById('oActivo'), document.getElementById('oActivoLabel'));
    configureHistorial('btnHistorialOcupacion', 'Ocupaciones', isEdit);
    configureSave('btnSaveOcupacion', 'modalOcupacion', 'Ocupaciones', 'oDesc');
  }

  function rewireCardButtons(screenSelector, targetModal, openerName) {
    document.querySelectorAll(screenSelector + ' .card-item').forEach(function (card) {
      const editButton = card.querySelector('[title="Editar"]');
      if (!editButton) return;
      const cod = (card.querySelector('strong') && card.querySelector('strong').textContent || '').trim();
      const desc = (card.querySelector('.fw-semibold') && card.querySelector('.fw-semibold').textContent || '').trim();
      const activo = inferCardState(card);
      editButton.setAttribute('data-bs-target', '#' + targetModal);
      editButton.setAttribute('data-bs-toggle', 'modal');
      editButton.setAttribute('onclick', openerName + '(' + JSON.stringify(cod) + ', ' + JSON.stringify(desc) + ', ' + (activo ? 'true' : 'false') + ')');
    });
  }

  function rewireNewButton(screenSelector, targetModal, openerName) {
    const button = Array.from(document.querySelectorAll(screenSelector + ' .btn-prim')).find(function (el) {
      return (el.textContent || '').trim().indexOf('Nuevo') !== -1;
    });
    if (!button) return;
    button.setAttribute('data-bs-target', '#' + targetModal);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('onclick', openerName + '()');
  }

  function bindSwitches() {
    [['gActivo', 'gActivoLabel'], ['oActivo', 'oActivoLabel']].forEach(function (ids) {
      const input = document.getElementById(ids[0]);
      const label = document.getElementById(ids[1]);
      if (!input || !label) return;
      input.addEventListener('change', function () {
        updateSwitchLabel(input, label);
      });
      updateSwitchLabel(input, label);
    });
  }

  function init() {
    bindSwitches();
    rewireNewButton('#screen-grado', 'modalGrado', 'openGradoModal');
    rewireCardButtons('#screen-grado', 'modalGrado', 'openGradoModal');
    rewireNewButton('#screen-ocupaciones', 'modalOcupacion', 'openOcupacionModal');
    rewireCardButtons('#screen-ocupaciones', 'modalOcupacion', 'openOcupacionModal');
  }

  window.openGradoModal = openGradoModal;
  window.openOcupacionModal = openOcupacionModal;
  document.addEventListener('DOMContentLoaded', init);
})();
