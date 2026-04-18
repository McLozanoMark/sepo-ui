
(() => {
  const PERMISSION_ROWS = [
    { menu: 'Principal', submenu: 'Dashboard' },
    { menu: 'Principal', submenu: 'Pruebas Psicológicas' },
    { menu: 'Principal', submenu: 'Episodios' },
    { menu: 'Principal', submenu: 'Resultados' },
    { menu: 'Configuración', submenu: 'Reportes' },
    { menu: 'Configuración', submenu: 'Roles' },
    { menu: 'Configuración', submenu: 'Parámetros' },
  ];

  const DEFAULT_PERMISSIONS = () => PERMISSION_ROWS.map((row, idx) => ({
    id: idx + 1,
    menu: row.menu,
    submenu: row.submenu,
    view: true,
    create: row.submenu !== 'Dashboard',
    edit: row.submenu !== 'Dashboard',
    delete: ['Reportes', 'Dashboard'].includes(row.submenu) ? false : true,
  }));

  const state = {
    bootstrap: {},
    editingId: null,
    roles: [
      { id: 1, code: 'ROL-001', description: 'Administrador', status: 'Activo', permissions: DEFAULT_PERMISSIONS() },
      { id: 2, code: 'ROL-002', description: 'Psicólogo evaluador', status: 'Activo', permissions: DEFAULT_PERMISSIONS().map(p => ({...p, delete:false, create:p.submenu !== 'Dashboard'})) },
      { id: 3, code: 'ROL-003', description: 'Consulta', status: 'Inactivo', permissions: DEFAULT_PERMISSIONS().map(p => ({...p, create:false, edit:false, delete:false})) },
    ],
    filtered: [],
  };

  document.addEventListener('DOMContentLoaded', () => {
    initBootstrap();
    initSidebar();
    bindEvents();
    renderTable(state.roles);
  });

  function initBootstrap() {
    state.bootstrap.toast = new bootstrap.Toast(document.getElementById('rl_toast'), { delay: 2400 });
    state.bootstrap.modal = new bootstrap.Modal(document.getElementById('rl_modalRol'));
  }

  function initSidebar() {
    const sidebar = document.getElementById('rl_sidebar');
    const main = document.getElementById('rl_mainContent');
    const toggle = () => {
      sidebar.classList.toggle('collapsed');
      main.classList.toggle('expanded');
    };
    document.getElementById('rl_sidebarToggle').addEventListener('click', toggle);
    document.getElementById('rl_sidebarBrandBtn').addEventListener('click', toggle);
  }

  function bindEvents() {
    document.getElementById('rl_btnBuscar').addEventListener('click', applyFilters);
    document.getElementById('rl_btnLimpiar').addEventListener('click', clearFilters);
    document.getElementById('rl_btnCrear').addEventListener('click', () => openModal());
    document.getElementById('rl_btnGuardar').addEventListener('click', saveRole);
    document.querySelector('#rl_tablaRoles tbody').addEventListener('click', onTableClick);
  }

  function renderTable(rows) {
    state.filtered = rows;
    const tbody = document.querySelector('#rl_tablaRoles tbody');
    tbody.innerHTML = rows.map(role => `
      <tr>
        <td>${escapeHtml(role.code)}</td>
        <td>${escapeHtml(role.description)}</td>
        <td><span class="badge ${role.status === 'Activo' ? 'text-bg-success' : 'text-bg-secondary'}">${escapeHtml(role.status)}</span></td>
        <td class="text-center">
          <div class="rl-actions-cell">
            <button type="button" class="btn btn-outline-primary btn-sm rounded-pill px-3" data-action="edit" data-id="${role.id}"><i class="fas fa-pen-to-square me-1"></i>Editar</button>
            <button type="button" class="btn btn-outline-danger btn-sm rounded-pill px-3" data-action="delete" data-id="${role.id}"><i class="fas fa-trash-can me-1"></i>Eliminar</button>
          </div>
        </td>
      </tr>
    `).join('');
    document.getElementById('rl_totalRoles').textContent = `${rows.length} rol${rows.length === 1 ? '' : 'es'}`;
  }

  function applyFilters() {
    const code = document.getElementById('rl_filtroCodigo').value.trim().toLowerCase();
    const description = document.getElementById('rl_filtroDescripcion').value.trim().toLowerCase();
    const status = document.getElementById('rl_filtroEstado').value;
    const rows = state.roles.filter(role => {
      if (code && !role.code.toLowerCase().includes(code)) return false;
      if (description && !role.description.toLowerCase().includes(description)) return false;
      if (status && role.status !== status) return false;
      return true;
    });
    renderTable(rows);
  }

  function clearFilters() {
    document.getElementById('rl_filtroCodigo').value = '';
    document.getElementById('rl_filtroDescripcion').value = '';
    document.getElementById('rl_filtroEstado').value = '';
    renderTable(state.roles);
  }

  function openModal(roleId = null) {
    state.editingId = roleId;
    const role = roleId ? state.roles.find(r => r.id === roleId) : null;
    document.getElementById('rl_modalTitle').textContent = role ? 'Editar rol' : 'Crear rol';
    document.getElementById('rl_inputCodigo').value = role ? role.code : nextCode();
    document.getElementById('rl_inputDescripcion').value = role ? role.description : '';
    document.getElementById('rl_inputEstado').value = role ? role.status : 'Activo';
    renderPermissionRows(role ? structuredClone(role.permissions) : DEFAULT_PERMISSIONS());
    state.bootstrap.modal.show();
  }

  function renderPermissionRows(rows) {
    const tbody = document.getElementById('rl_permissionsBody');
    tbody.innerHTML = rows.map((row, idx) => `
      <tr data-row-index="${idx}">
        <td class="rl-permissions-menu">${escapeHtml(row.menu)}</td>
        <td>${escapeHtml(row.submenu)}</td>
        ${switchCell('view', row.view)}
        ${switchCell('create', row.create)}
        ${switchCell('edit', row.edit)}
        ${switchCell('delete', row.delete)}
      </tr>
    `).join('');
  }

  function switchCell(name, checked) {
    return `<td class="rl-switch-cell"><label class="rl-switch"><input type="checkbox" data-perm="${name}" ${checked ? 'checked' : ''}><span class="rl-switch-slider" aria-hidden="true"></span></label></td>`;
  }

  function collectPermissions() {
    return Array.from(document.querySelectorAll('#rl_permissionsBody tr')).map(tr => ({
      menu: tr.children[0].textContent.trim(),
      submenu: tr.children[1].textContent.trim(),
      view: tr.querySelector('[data-perm="view"]').checked,
      create: tr.querySelector('[data-perm="create"]').checked,
      edit: tr.querySelector('[data-perm="edit"]').checked,
      delete: tr.querySelector('[data-perm="delete"]').checked,
    }));
  }

  function saveRole() {
    const code = document.getElementById('rl_inputCodigo').value.trim();
    const description = document.getElementById('rl_inputDescripcion').value.trim();
    const status = document.getElementById('rl_inputEstado').value;
    if (!code || !description) {
      showToast('Complete el código y la descripción del rol.', true);
      return;
    }
    const permissions = collectPermissions();
    if (state.editingId) {
      const role = state.roles.find(r => r.id === state.editingId);
      role.code = code;
      role.description = description;
      role.status = status;
      role.permissions = permissions;
      showToast('Rol actualizado exitosamente.');
    } else {
      state.roles.unshift({ id: Date.now(), code, description, status, permissions });
      showToast('Rol creado exitosamente.');
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
    const role = state.roles.find(r => r.id === id);
    if (!role) return;
    if (!confirm(`¿Desea eliminar el rol ${role.code}?`)) return;
    state.roles = state.roles.filter(r => r.id !== id);
    applyFilters();
    showToast('Rol eliminado exitosamente.');
  }

  function nextCode() {
    const num = state.roles.length + 1;
    return `ROL-${String(num).padStart(3, '0')}`;
  }

  function showToast(message, isError = false) {
    const toastEl = document.getElementById('rl_toast');
    const body = document.getElementById('rl_toastBody');
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
