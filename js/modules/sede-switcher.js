(() => {
  const STORAGE_KEY = 'sepo.demo.sedeActiva';
  const SEDES = [
    {
      id: 'sede-central',
      nombre: 'Sede Central',
      codigo: 'SC-001',
      zona: 'Lima Centro',
      resumen: {
        pruebasActivas: 4,
        centrosMedicos: 9,
        evaluacionesHoy: 12,
        contexto: 'Mostrando información consolidada de la sede principal del sistema.',
        actividad: [
          { titulo: 'Escala de Ansiedad de Beck', meta: 'Guardado como Borrador • hace 2 horas', estado: 'Borrador', estadoClase: 'bg-warning text-dark' },
          { titulo: 'Test de Inteligencia Emocional', meta: 'Publicado • hace 1 día', estado: 'Activo', estadoClase: 'bg-success' },
          { titulo: 'Evaluación de Grupo Ocupacional', meta: 'Actualizado • hace 3 días', estado: 'Actualizado', estadoClase: 'bg-info text-dark' }
        ]
      }
    },
    {
      id: 'sede-san-miguel',
      nombre: 'Sede San Miguel',
      codigo: 'SM-014',
      zona: 'Lima Oeste',
      resumen: {
        pruebasActivas: 3,
        centrosMedicos: 6,
        evaluacionesHoy: 8,
        contexto: 'Mostrando información operativa de la sede San Miguel para la demo actual.',
        actividad: [
          { titulo: 'Inventario de iconos clínicos', meta: 'Ajustado en Parámetros • hace 40 min', estado: 'Configurado', estadoClase: 'bg-primary' },
          { titulo: 'Prueba de Fatiga y Somnolencia', meta: 'Programada • hace 3 horas', estado: 'Programado', estadoClase: 'bg-secondary' },
          { titulo: 'Seguimiento de episodio ocupacional', meta: 'En revisión • hoy', estado: 'En revisión', estadoClase: 'bg-warning text-dark' }
        ]
      }
    },
    {
      id: 'sede-norte',
      nombre: 'Sede Norte',
      codigo: 'SN-021',
      zona: 'Lima Norte',
      resumen: {
        pruebasActivas: 5,
        centrosMedicos: 7,
        evaluacionesHoy: 15,
        contexto: 'Mostrando información referencial de la sede Norte con alta carga de evaluaciones.',
        actividad: [
          { titulo: 'Audio para prueba psicológica', meta: 'Activado • hace 15 min', estado: 'Activo', estadoClase: 'bg-success' },
          { titulo: 'Tamaño de imágenes de portada', meta: 'Sincronizado • hace 5 horas', estado: 'Sincronizado', estadoClase: 'bg-info text-dark' },
          { titulo: 'Revisión de pacientes por episodios', meta: 'Pendiente • hoy', estado: 'Pendiente', estadoClase: 'bg-danger' }
        ]
      }
    }
  ];

  document.addEventListener('DOMContentLoaded', () => {
    ensureHeaderSelectors();
    applyStoredSede(false);
    document.addEventListener('change', onSelectorChange);
    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEY) applyStoredSede(false);
    });
  });

  function ensureHeaderSelectors() {
    const headers = document.querySelectorAll('.page-header');
    headers.forEach((header) => {
      if (header.querySelector('.sepo-sede-switcher')) return;

      const actionContainer = resolveActionContainer(header);
      if (actionContainer) actionContainer.classList.add('sepo-header-actions-shell');

      const wrapper = document.createElement('div');
      wrapper.className = 'sepo-sede-switcher';
      wrapper.innerHTML = `
        <label class="sepo-sede-label" for="sepoSedeSelect_${Math.random().toString(36).slice(2,8)}">
          <span class="sepo-sede-label-text"><i class="fas fa-building-circle-arrow-right"></i> Sede</span>
        </label>
        <div class="sepo-sede-select-wrap" title="Cambiar sede activa del sistema">
          <select class="form-select sepo-sede-select" aria-label="Seleccionar sede"></select>
        </div>
      `;
      const select = wrapper.querySelector('.sepo-sede-select');
      const label = wrapper.querySelector('.sepo-sede-label');
      const selectId = label.getAttribute('for');
      select.id = selectId;
      select.innerHTML = SEDES.map((sede) => `<option value="${sede.id}">${escapeHtml(sede.nombre)}</option>`).join('');
      (actionContainer || header).prepend(wrapper);
    });
  }

  function resolveActionContainer(header) {
    const directDivs = Array.from(header.children).filter((child) => child.matches?.('div'));
    if (directDivs.length >= 2) return directDivs[1];
    return header.querySelector('.ep-header-actions, .pm-header-actions, .d-flex, [class*="header-actions"]');
  }

  function onSelectorChange(event) {
    if (!event.target.matches('.sepo-sede-select')) return;
    const sede = getSedeById(event.target.value);
    if (!sede) return;
    persistSede(sede.id);
    syncSelectors(sede.id);
    applySedeToUi(sede, true);
  }

  function applyStoredSede(notify) {
    const sedeId = localStorage.getItem(STORAGE_KEY) || SEDES[0].id;
    const sede = getSedeById(sedeId) || SEDES[0];
    syncSelectors(sede.id);
    applySedeToUi(sede, notify);
  }

  function syncSelectors(sedeId) {
    document.querySelectorAll('.sepo-sede-select').forEach((select) => {
      select.value = sedeId;
    });
  }

  function applySedeToUi(sede, notify) {
    document.documentElement.setAttribute('data-sede-id', sede.id);
    document.body.setAttribute('data-sede-id', sede.id);
    document.querySelectorAll('[data-sepo-sede-actual]').forEach((el) => {
      el.textContent = sede.nombre;
    });
    document.querySelectorAll('[data-sepo-sede-codigo]').forEach((el) => {
      el.textContent = sede.codigo;
    });
    document.querySelectorAll('[data-sepo-sede-zona]').forEach((el) => {
      el.textContent = sede.zona;
    });
    updateDashboard(sede);
    if (notify) {
      notifySedeChange(`Sede cambiada correctamente a ${sede.nombre}.`);
    }
  }

  function updateDashboard(sede) {
    const screen = document.getElementById('screen-dashboard');
    if (!screen) return;
    const data = sede.resumen;
    setText('dashboardSedeActual', sede.nombre);
    setText('dashboardSedeCodigo', sede.codigo);
    setText('dashboardSedeZona', sede.zona);
    setText('dashboardSedeContexto', data.contexto);
    setText('dashboardKpiPruebas', String(data.pruebasActivas));
    setText('dashboardKpiCentros', String(data.centrosMedicos));
    setText('dashboardKpiEvaluaciones', String(data.evaluacionesHoy));
    const list = document.getElementById('dashboardActividadLista');
    if (list) {
      list.innerHTML = data.actividad.map((item, index) => `
        <div class="d-flex align-items-center gap-3 p-3 border rounded bg-white">
          <div class="dashboard-activity-icon dashboard-activity-icon-${index + 1}">
            <i class="fas ${index === 0 ? 'fa-brain text-primary' : index === 1 ? 'fa-chart-bar dashboard-icon-green' : 'fa-users dashboard-icon-amber'}"></i>
          </div>
          <div class="flex-grow-1">
            <div class="fw-semibold" style="font-size: 0.9rem">${escapeHtml(item.titulo)}</div>
            <small class="text-muted">${escapeHtml(item.meta)}</small>
          </div>
          <span class="badge ${escapeHtml(item.estadoClase)}">${escapeHtml(item.estado)}</span>
        </div>
      `).join('');
    }
  }

  function notifySedeChange(message) {
    if (typeof window.showToast === 'function') {
      window.showToast(`🏢 ${message}`);
      return;
    }
    const toastBody = document.getElementById('ep_toastBody') || document.getElementById('pm_toastBody');
    const toastEl = document.getElementById('ep_toast') || document.getElementById('pm_toast');
    if (toastBody && toastEl && window.bootstrap?.Toast) {
      toastBody.textContent = message;
      bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 2600 }).show();
    }
  }

  function persistSede(sedeId) {
    localStorage.setItem(STORAGE_KEY, sedeId);
  }

  function getSedeById(id) {
    return SEDES.find((item) => item.id === id);
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
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
