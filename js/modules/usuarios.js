(function () {
  const state = {
    editingId: null,
    roles: ['Administrador', 'Psicóloga', 'Recepción', 'Supervisor'],
    sedes: ['San Miguel', 'Lince', 'Jesús María', 'Ate'],
    users: [
      { id: 1, document: '72845129', names: 'María Elena', lastNames: 'Paredes Soto', role: 'Psicóloga', site: 'San Miguel', status: 'Activo' },
      { id: 2, document: '41789632', names: 'Luis Alberto', lastNames: 'Chávez Rojas', role: 'Administrador', site: 'Lince', status: 'Activo' },
      { id: 3, document: '76987541', names: 'Rosa Patricia', lastNames: 'Cáceres León', role: 'Recepción', site: 'Jesús María', status: 'Inactivo' },
      { id: 4, document: '70234567', names: 'Carlos Enrique', lastNames: 'Ruiz Gamarra', role: 'Supervisor', site: 'Ate', status: 'Activo' },
    ],
    bootstrap: {},
  };

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    state.bootstrap.modal = new bootstrap.Modal(document.getElementById('us_modalUsuario'));
    state.bootstrap.toast = new bootstrap.Toast(document.getElementById('us_toast'), { delay: 2600 });
    hydrateSelects();
    bindEvents();
    renderTable(state.users);
  }

  function hydrateSelects() {
    const rolTargets = [document.getElementById('us_filtroRol'), document.getElementById('us_inputRol')];
    const sedeTargets = [document.getElementById('us_filtroSede'), document.getElementById('us_inputSede')];
    rolTargets.forEach((select, index) => {
      const first = index === 0 ? '<option value="">[Todos]</option>' : '<option value="">[Seleccione]</option>';
      select.innerHTML = first + state.roles.map(v => `<option value="${v}">${v}</option>`).join('');
    });
    sedeTargets.forEach((select, index) => {
      const first = index === 0 ? '<option value="">[Todas]</option>' : '<option value="">[Seleccione]</option>';
      select.innerHTML = first + state.sedes.map(v => `<option value="${v}">${v}</option>`).join('');
    });
  }

  function bindEvents() {
    document.getElementById('us_btnBuscar').addEventListener('click', applyFilters);
    document.getElementById('us_btnLimpiar').addEventListener('click', clearFilters);
    document.getElementById('us_btnCrear').addEventListener('click', () => openModal());
    document.getElementById('us_btnGuardar').addEventListener('click', saveUser);
    document.querySelector('#us_tablaUsuarios tbody').addEventListener('click', onTableClick);
  }

  function renderTable(rows) {
    const tbody = document.querySelector('#us_tablaUsuarios tbody');
    tbody.innerHTML = rows.map(user => `
      <tr>
        <td>${escapeHtml(user.document)}</td>
        <td>${escapeHtml(`${user.names} ${user.lastNames}`)}</td>
        <td>${escapeHtml(user.role)}</td>
        <td><span class="badge ${user.status === 'Activo' ? 'bg-success-subtle text-success-emphasis' : 'bg-secondary-subtle text-secondary-emphasis'} rounded-pill">${escapeHtml(user.status)}</span></td>
        <td class="text-center">
          <div class="us-actions-cell">
            <button type="button" class="btn btn-outline-primary btn-sm rounded-pill px-2" data-action="edit" data-id="${user.id}" title="Editar"><i class="fas fa-pen"></i></button>
            <button type="button" class="btn btn-outline-danger btn-sm rounded-pill px-2" data-action="delete" data-id="${user.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>`).join('');
    document.getElementById('us_totalUsuarios').textContent = `${rows.length} usuario${rows.length === 1 ? '' : 's'}`;
  }

  function applyFilters() {
    const documentValue = document.getElementById('us_filtroDocumento').value.trim().toLowerCase();
    const nameValue = document.getElementById('us_filtroNombre').value.trim().toLowerCase();
    const roleValue = document.getElementById('us_filtroRol').value;
    const siteValue = document.getElementById('us_filtroSede').value;
    const stateValue = document.getElementById('us_filtroEstado').value;

    const rows = state.users.filter(user => {
      const fullName = `${user.names} ${user.lastNames}`.toLowerCase();
      return (!documentValue || user.document.toLowerCase().includes(documentValue))
        && (!nameValue || fullName.includes(nameValue))
        && (!roleValue || user.role === roleValue)
        && (!siteValue || user.site === siteValue)
        && (!stateValue || user.status === stateValue);
    });

    renderTable(rows);
  }

  function clearFilters() {
    document.getElementById('us_filtroDocumento').value = '';
    document.getElementById('us_filtroNombre').value = '';
    document.getElementById('us_filtroRol').value = '';
    document.getElementById('us_filtroSede').value = '';
    document.getElementById('us_filtroEstado').value = '';
    renderTable(state.users);
  }

  function openModal(userId = null) {
    state.editingId = userId;
    const user = userId ? state.users.find(item => item.id === userId) : null;
    document.getElementById('us_modalTitle').textContent = user ? 'Editar usuario' : 'Crear usuario';
    document.getElementById('us_inputDocumento').value = user?.document ?? '';
    document.getElementById('us_inputNombres').value = user?.names ?? '';
    document.getElementById('us_inputApellidos').value = user?.lastNames ?? '';
    document.getElementById('us_inputRol').value = user?.role ?? '';
    document.getElementById('us_inputSede').value = user?.site ?? '';
    document.getElementById('us_inputEstado').value = user?.status ?? 'Activo';
    state.bootstrap.modal.show();
  }

  function saveUser() {
    const documentValue = document.getElementById('us_inputDocumento').value.trim();
    const names = document.getElementById('us_inputNombres').value.trim();
    const lastNames = document.getElementById('us_inputApellidos').value.trim();
    const role = document.getElementById('us_inputRol').value;
    const site = document.getElementById('us_inputSede').value;
    const status = document.getElementById('us_inputEstado').value;

    if (!documentValue || !names || !lastNames || !role || !site) {
      showToast('Complete los campos obligatorios del usuario.', true);
      return;
    }

    if (state.editingId) {
      const user = state.users.find(item => item.id === state.editingId);
      Object.assign(user, { document: documentValue, names, lastNames, role, site, status });
      showToast('Usuario actualizado exitosamente.');
    } else {
      state.users.unshift({ id: Date.now(), document: documentValue, names, lastNames, role, site, status });
      showToast('Usuario creado exitosamente.');
    }

    state.bootstrap.modal.hide();
    applyFilters();
  }

  function onTableClick(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    if (button.dataset.action === 'edit') {
      openModal(id);
      return;
    }
    const user = state.users.find(item => item.id === id);
    if (!user) return;
    if (!confirm(`¿Desea eliminar al usuario ${user.names} ${user.lastNames}?`)) return;
    state.users = state.users.filter(item => item.id !== id);
    applyFilters();
    showToast('Usuario eliminado exitosamente.');
  }

  function showToast(message, isError = false) {
    const toastEl = document.getElementById('us_toast');
    const body = document.getElementById('us_toastBody');
    body.textContent = message;
    toastEl.classList.toggle('text-bg-danger', isError);
    toastEl.classList.toggle('text-bg-dark', !isError);
    state.bootstrap.toast.show();
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
})();
