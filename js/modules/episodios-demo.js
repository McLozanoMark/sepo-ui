(() => {
  const DEGREE_OPTIONS = [
    'Primaria completa',
    'Secundaria completa',
    'Técnico incompleto',
    'Técnico completo',
    'Universitario incompleto',
    'Universitario completo'
  ];

  const GROUP_CATALOG = {
    'Evaluación Psicológica': {
      default: ['Operativo general', 'Administrativo', 'Supervisión'],
      'Secundaria completa': ['Operativo general', 'Apoyo logístico'],
      'Técnico completo': ['Técnico de campo', 'Supervisión'],
      'Universitario completo': ['Profesional senior', 'Coordinación']
    },
    'Riesgo Psicosocial': {
      default: ['Operativo general', 'Administrativo'],
      'Universitario completo': ['Analista SST', 'Coordinación SST']
    },
    'Fatiga y Somnolencia': {
      default: ['Operación minera', 'Conductores'],
      'Técnico completo': ['Conductores', 'Supervisor de ruta']
    },
    'Conducción Segura': {
      default: ['Conductores', 'Conductores de alto tonelaje'],
      'Secundaria completa': ['Conductores'],
      'Técnico completo': ['Conductores de alto tonelaje', 'Supervisor de flota']
    }
  };

  const DB = buildDatabase();
  const state = {
    filteredPatients: [],
    openPatients: new Set(),
    openEpisodes: new Set(),
    openPrestations: new Set(),
    selectedRecoveryContext: null,
    selectedGroupContext: null,
    pendingReplicaAction: null,
    bootstrap: {}
  };

  document.addEventListener('DOMContentLoaded', () => {
    initBootstrapBits();
    initSidebar();
    fillFilterOptions();
    bindEvents();
    seedDefaultFilters();
    state.openPatients = new Set(DB.slice(0, 4).map((p) => p.id));
    applyFilters();
  });

  function initBootstrapBits() {
    state.bootstrap.groupModal = new bootstrap.Modal(document.getElementById('ep_modalGrupo'));
    state.bootstrap.replicaModal = new bootstrap.Modal(document.getElementById('ep_modalReplica'));
    state.bootstrap.recoveryModal = new bootstrap.Modal(document.getElementById('ep_modalRecuperacion'));
    state.bootstrap.toast = new bootstrap.Toast(document.getElementById('ep_toast'), { delay: 2600 });
    state.bootstrap.tooltips = [];
  }

  function initSidebar() {
    const sidebar = document.getElementById('ep_sidebar');
    const main = document.getElementById('ep_mainContent');
    const toggle = () => {
      sidebar.classList.toggle('collapsed');
      main.classList.toggle('expanded');
    };
    document.getElementById('ep_sidebarToggle').addEventListener('click', toggle);
    document.getElementById('ep_sidebarBrandBtn').addEventListener('click', toggle);
  }

  function fillFilterOptions() {
    const companySet = new Set();
    const examSet = new Set();
    DB.forEach((p) => {
      companySet.add(p.company);
      p.episodes.forEach((e) => examSet.add(e.examType));
    });
    fillDataList('ep_empresasList', [...companySet].sort());
    fillSelect('ep_filtroTipoExamen', [...examSet].sort());
    fillSelect('ep_grupoGrado', DEGREE_OPTIONS, true);
  }

  function fillSelect(id, values, keepFirst = false) {
    const select = document.getElementById(id);
    if (!keepFirst) return values.forEach(v => select.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`));
    select.innerHTML = '<option value="">Seleccionar</option>' + values.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');
  }

  function fillDataList(id, values) {
    const list = document.getElementById(id);
    list.innerHTML = values.map(v => `<option value="${escapeHtml(v)}"></option>`).join('');
  }

  function seedDefaultFilters() {
    const defaultDate = '2026-04-10';
    document.getElementById('ep_filtroFechaDesde').value = defaultDate;
    document.getElementById('ep_filtroFechaHasta').value = defaultDate;
  }

  function bindEvents() {
    ['ep_filtroPaciente','ep_filtroEmpresa','ep_filtroTipoExamen','ep_filtroFechaDesde','ep_filtroFechaHasta','ep_filtroEstado'].forEach((id) => {
      document.getElementById(id).addEventListener(id === 'ep_filtroPaciente' ? 'input' : 'change', applyFilters);
    });
    document.getElementById('ep_btnBuscar').addEventListener('click', applyFilters);
    document.getElementById('ep_tablaPacientesBody').addEventListener('click', onTableClick);
    document.getElementById('ep_grupoGrado').addEventListener('change', refreshGroupOptions);
    document.getElementById('ep_btnGuardarGrupo').addEventListener('click', saveGroupSelection);
    document.getElementById('ep_btnReplicaSi').addEventListener('click', () => {
      if (typeof state.pendingReplicaAction === 'function') state.pendingReplicaAction(true);
      state.bootstrap.replicaModal.hide();
    });
    document.getElementById('ep_btnReplicaNo').addEventListener('click', () => {
      if (typeof state.pendingReplicaAction === 'function') state.pendingReplicaAction(false);
      state.bootstrap.replicaModal.hide();
    });
    document.getElementById('ep_btnVerResultados').addEventListener('click', renderRecoveryPreview);
    document.getElementById('ep_btnRecuperar').addEventListener('click', recoverSelectedData);
  }

  function clearFilters() {
    ['ep_filtroPaciente','ep_filtroEmpresa','ep_filtroTipoExamen','ep_filtroFechaDesde','ep_filtroFechaHasta','ep_filtroEstado'].forEach((id) => {
      document.getElementById(id).value = '';
    });
    applyFilters();
  }

  function applyFilters() {
    const q = document.getElementById('ep_filtroPaciente').value.trim().toLowerCase();
    const company = document.getElementById('ep_filtroEmpresa').value;
    const exam = document.getElementById('ep_filtroTipoExamen').value;
    const from = document.getElementById('ep_filtroFechaDesde').value;
    const to = document.getElementById('ep_filtroFechaHasta').value;
    const status = document.getElementById('ep_filtroEstado').value;

    state.filteredPatients = DB.filter((patient) => {
      const matchesQ = !q || [patient.history, patient.document, patient.lastName, patient.motherLastName, patient.names].join(' ').toLowerCase().includes(q);
      const matchesCompany = !company || patient.company.toLowerCase() === company.toLowerCase();
      const matchingEpisodes = patient.episodes.filter((ep) => {
        const matchesExam = !exam || ep.examType === exam;
        const matchesStatus = !status || ep.status === status || ep.prestations.some(pr => pr.status === status || pr.tests.some(t => t.status === status));
        const matchesFrom = !from || ep.date >= from;
        const matchesTo = !to || ep.date <= to;
        return matchesExam && matchesStatus && matchesFrom && matchesTo;
      });
      patient._visibleEpisodes = matchingEpisodes;
      return matchesQ && matchesCompany && matchingEpisodes.length > 0;
    });
    renderPatients();
  }

  function renderPatients() {
    const tbody = document.getElementById('ep_tablaPacientesBody');
    if (!state.filteredPatients.length) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="ep-empty"><i class="fas fa-search mb-2 d-block fs-4"></i>No se encontraron pacientes con los filtros seleccionados.</div></td></tr>`;
      document.getElementById('ep_resultSummary').textContent = '0 pacientes';
      activateTooltips();
      return;
    }
    document.getElementById('ep_resultSummary').textContent = `${state.filteredPatients.length} pacientes · ${state.filteredPatients.reduce((acc,p)=> acc + p._visibleEpisodes.length, 0)} episodios visibles`;
    tbody.innerHTML = state.filteredPatients.map((patient) => patientRow(patient)).join('');
    activateTooltips();
  }

  function activateTooltips() {
    if (state.bootstrap.tooltips?.length) state.bootstrap.tooltips.forEach((tip) => tip.dispose());
    state.bootstrap.tooltips = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map((el) => new bootstrap.Tooltip(el));
  }

  function patientRow(patient) {
    const isOpen = state.openPatients.has(patient.id);
    return `
      <tr>
        <td>
          <button class="ep-expand-btn" type="button" data-ep-action="toggle-patient" data-patient-id="${patient.id}" aria-label="Expandir paciente">
            <i class="fas fa-chevron-${isOpen ? 'down' : 'right'}"></i>
          </button>
        </td>
        <td>${escapeHtml(patient.history)}</td>
        <td>${escapeHtml(patient.document)}</td>
        <td>${escapeHtml(patient.lastName)}</td>
        <td>${escapeHtml(patient.motherLastName)}</td>
        <td>${escapeHtml(patient.names)}</td>

      </tr>
      ${isOpen ? `<tr class="ep-detail-row"><td colspan="6">${renderPatientDetail(patient)}</td></tr>` : ''}
    `;
  }

  function renderPatientDetail(patient) {
    return `
      <div class="ep-detail-wrap">
        ${patient._visibleEpisodes.map((episode) => renderEpisode(patient, episode)).join('')}
      </div>
    `;
  }

  function renderEpisode(patient, episode) {
    const canRecoverEpisode = episode.prestations.some((pr) => pr.tests.some((test) => test.status === 'Pendiente' && test.allowRecovery && pr.allowRecovery && episode.allowRecovery));
    return `
      <div class="ep-detail-card ep-structured-panel mb-3">
        <div class="ep-detail-wrap">
          <div class="ep-structured-title">EPISODIOS - ACTUACIONES</div>

          <div class="ep-structured-block">
            <div class="ep-block-title">EPISODIO</div>
            <table class="ep-plain-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo de Examen</th>
                  <th>Grado Instrucción</th>
                  <th>Ocupación</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${formatDate(episode.date)}</td>
                  <td>${escapeHtml(episode.examType)}</td>
                  <td>${patient.education ? escapeHtml(patient.education) : '<span class="text-warning fw-semibold">No registrado</span>'}</td>
                  <td>${escapeHtml(episode.occupation)}</td>
                  <td>${escapeHtml(episode.status)}</td>
                  <td class="ep-actions-cell">
                    ${canRecoverEpisode ? `<button type="button" class="ep-icon-btn ep-icon-btn-secondary" data-bs-toggle="tooltip" data-bs-placement="top" title="Recuperación de datos" data-ep-action="open-recovery" data-patient-id="${patient.id}" data-episode-id="${episode.id}" data-prestation-id="${episode.prestations[0].id}" data-test-id="${episode.prestations[0].tests[0].id}" aria-label="Recuperación de datos"><i class="fas fa-database"></i></button>` : '<span class="text-muted small">—</span>'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="ep-structured-block">
            <div class="ep-block-title">ACTUACIONES</div>
            <table class="ep-plain-table">
              <thead>
                <tr>
                  <th>Descripción Actuación</th>
                  <th>Vinculado Grupo Ocupacional</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${renderPrestations(patient, episode)}
              </tbody>
            </table>
          </div>

          <div class="ep-structured-block">
            <div class="ep-block-title">PRUEBAS</div>
            <table class="ep-plain-table">
              <thead>
                <tr>
                  <th>Descripción Prueba</th>
                  <th>Duración</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${renderTests(patient, episode)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    `;
  }

  function renderPrestations(patient, episode) {
    return episode.prestations.map((pr) => {
      const canRecover = pr.tests.some((test) => test.status === 'Pendiente' && test.allowRecovery && pr.allowRecovery && episode.allowRecovery);
      return `
        <tr>
          <td>${escapeHtml(pr.description)}</td>
          <td>${pr.requiresGroup ? 'Si' : 'No'}</td>
          <td>${escapeHtml(pr.status)}</td>
          <td class="ep-actions-cell">
            <div class="ep-action-stack">
              ${canRecover ? `<button type="button" class="ep-icon-btn ep-icon-btn-secondary" data-bs-toggle="tooltip" data-bs-placement="top" title="Recuperación de datos" data-ep-action="open-recovery" data-patient-id="${patient.id}" data-episode-id="${episode.id}" data-prestation-id="${pr.id}" data-test-id="${pr.tests[0].id}" aria-label="Recuperación de datos"><i class="fas fa-database"></i></button>` : ''}
              ${pr.requiresGroup ? `<button type="button" class="ep-icon-btn ep-icon-btn-primary" data-bs-toggle="tooltip" data-bs-placement="top" title="Asignar Grupo Ocupacional" data-ep-action="open-group" data-patient-id="${patient.id}" data-episode-id="${episode.id}" data-prestation-id="${pr.id}" aria-label="Asignar Grupo Ocupacional"><i class="fas fa-briefcase"></i></button>` : ''}
              ${!canRecover && !pr.requiresGroup ? '<span class="text-muted small">—</span>' : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderTests(patient, episode) {
    return episode.prestations.flatMap((prestation) => prestation.tests.map((test) => {
      const canRecover = test.status === 'Pendiente' && test.allowRecovery && prestation.allowRecovery && episode.allowRecovery;
      return `
        <tr>
          <td>${escapeHtml(test.description)}</td>
          <td>${escapeHtml(test.duration)}</td>
          <td>${escapeHtml(test.status)}</td>
          <td class="ep-actions-cell">
            ${canRecover ? `<button type="button" class="ep-icon-btn ep-icon-btn-secondary" data-bs-toggle="tooltip" data-bs-placement="top" title="Recuperación de datos" data-ep-action="open-recovery" data-patient-id="${patient.id}" data-episode-id="${episode.id}" data-prestation-id="${prestation.id}" data-test-id="${test.id}" aria-label="Recuperación de datos"><i class="fas fa-database"></i></button>` : '<span class="text-muted small">—</span>'}
          </td>
        </tr>
      `;
    })).join('');
  }

  function onTableClick(event) {
    const btn = event.target.closest('[data-ep-action]');
    if (!btn) return;
    const action = btn.dataset.epAction;
    if (action === 'toggle-patient') {
      toggleSet(state.openPatients, btn.dataset.patientId);
      renderPatients();
      return;
    }
    if (action === 'open-group') {
      openGroupModal(btn.dataset.patientId, btn.dataset.episodeId, btn.dataset.prestationId);
      return;
    }
    if (action === 'open-recovery') {
      openRecoveryModal(btn.dataset.patientId, btn.dataset.episodeId, btn.dataset.prestationId, btn.dataset.testId);
    }
  }

  function openGroupModal(patientId, episodeId, prestationId) {
    const patient = DB.find(p => p.id === patientId);
    const episode = patient.episodes.find(e => e.id === episodeId);
    const prestation = episode.prestations.find(p => p.id === prestationId);
    state.selectedGroupContext = { patient, episode, prestation };
    document.getElementById('ep_grupoContexto').innerHTML = `
      <div class="ep-context-title">Contexto de asignación</div>
      <div class="ep-context-main">${escapeHtml(patient.names)} ${escapeHtml(patient.lastName)} ${escapeHtml(patient.motherLastName)}</div>
      <div class="small text-muted mt-1">${escapeHtml(prestation.description)} · ${escapeHtml(episode.label)} · Empresa: ${escapeHtml(patient.company)}</div>
    `;
    document.getElementById('ep_grupoOcupacion').value = episode.occupation;
    document.getElementById('ep_grupoGrado').value = patient.education || '';
    document.getElementById('ep_gradoHint').textContent = patient.education ? 'Dato confirmado desde el paciente.' : 'El paciente no tiene grado de instrucción registrado. Selecciónalo para continuar.';
    refreshGroupOptions();
    state.bootstrap.groupModal.show();
  }

  function refreshGroupOptions() {
    const ctx = state.selectedGroupContext;
    if (!ctx) return;
    const degree = document.getElementById('ep_grupoGrado').value || 'default';
    const select = document.getElementById('ep_grupoSelect');
    const catalog = GROUP_CATALOG[ctx.prestation.description] || { default: ['Operativo general'] };
    const options = catalog[degree] || catalog.default || [];
    select.innerHTML = '<option value="">Seleccionar grupo ocupacional</option>' + options.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');
    if (ctx.prestation.groupSelected && options.includes(ctx.prestation.groupSelected)) {
      select.value = ctx.prestation.groupSelected;
    }
  }

  function saveGroupSelection() {
    const ctx = state.selectedGroupContext;
    if (!ctx) return;
    const degree = document.getElementById('ep_grupoGrado').value;
    const group = document.getElementById('ep_grupoSelect').value;
    if (!degree) return showToast('Selecciona el grado de instrucción para continuar.');
    if (!group) return showToast('Selecciona un grupo ocupacional.');

    ctx.patient.education = degree;
    ctx.prestation.groupSelected = group;
    ctx.prestation.groupStatus = 'Asignado';
    const compatible = ctx.patient.episodes.flatMap(ep => ep.prestations.filter(pr => pr.requiresGroup && !pr.groupSelected && pr.description === ctx.prestation.description));
    const afterSave = () => {
      state.bootstrap.groupModal.hide();
      renderPatients();
      showToast(`Grupo ocupacional "${group}" guardado correctamente.`);
    };

    if (compatible.length > 0) {
      state.pendingReplicaAction = (replicate) => {
        if (replicate) {
          compatible.forEach(pr => {
            pr.groupSelected = group;
            pr.groupStatus = 'Asignado';
          });
        }
        afterSave();
      };
      state.bootstrap.groupModal.hide();
      state.bootstrap.replicaModal.show();
      return;
    }
    afterSave();
  }

  function openRecoveryModal(patientId, episodeId, prestationId, testId) {
    const patient = DB.find(p => p.id === patientId);
    const episode = patient.episodes.find(e => e.id === episodeId);
    const prestation = episode.prestations.find(p => p.id === prestationId);
    const test = prestation.tests.find(t => t.id === testId);
    state.selectedRecoveryContext = { patient, episode, prestation, test };
    document.getElementById('ep_recuperacionContexto').innerHTML = `
      <div class="ep-context-title">Recuperar datos hacia</div>
      <div class="ep-context-main">${escapeHtml(test.description)}</div>
      <div class="small text-muted mt-1">Paciente: ${escapeHtml(patient.names)} ${escapeHtml(patient.lastName)} · Prestación: ${escapeHtml(prestation.description)} · Estado actual: ${escapeHtml(test.status)}</div>
    `;
    document.getElementById('ep_recuperacionLista').innerHTML = test.previousData.map((item, idx) => `
      <div class="ep-check-item">
        <label>
          <input class="form-check-input mt-1" type="checkbox" name="ep_recuperacionSel" value="${item.id}" ${idx === 0 ? 'checked' : ''} />
          <span>
            <span class="fw-semibold d-block">${escapeHtml(item.code)} · ${escapeHtml(item.date)} · ${escapeHtml(item.source)}</span>
            <span class="ep-check-meta">${escapeHtml(item.summary)}</span>
          </span>
        </label>
      </div>
    `).join('');
    document.getElementById('ep_resultadosPrevios').innerHTML = '<div class="text-muted small">Selecciona una o más pruebas anteriores y luego presiona <strong>Ver resultados</strong>.</div>';
    state.bootstrap.recoveryModal.show();
  }

  function renderRecoveryPreview() {
    const ctx = state.selectedRecoveryContext;
    if (!ctx) return;
    const selected = getSelectedRecoveryItems();
    const panel = document.getElementById('ep_resultadosPrevios');
    if (!selected.length) {
      panel.innerHTML = '<div class="text-muted small">Selecciona al menos una prueba anterior.</div>';
      return;
    }
    panel.innerHTML = selected.map((item) => `
      <div class="ep-preview-card">
        <div class="ep-preview-title">${escapeHtml(item.code)} · ${escapeHtml(item.source)}</div>
        <div class="small text-muted">${escapeHtml(item.date)} · ${escapeHtml(item.summary)}</div>
        <ul class="ep-preview-list">
          ${item.results.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  }

  function recoverSelectedData() {
    const ctx = state.selectedRecoveryContext;
    if (!ctx) return;
    const selected = getSelectedRecoveryItems();
    if (!selected.length) return showToast('Selecciona al menos una prueba previa para recuperar datos.');
    ctx.test.recoveredFrom = selected.map(s => s.code).join(', ');
    ctx.test.status = 'En proceso';
    state.bootstrap.recoveryModal.hide();
    renderPatients();
    showToast(`Se recuperaron datos desde ${selected.length} prueba(s) previa(s).`);
  }

  function getSelectedRecoveryItems() {
    const ctx = state.selectedRecoveryContext;
    if (!ctx) return [];
    const selectedIds = [...document.querySelectorAll('input[name="ep_recuperacionSel"]:checked')].map(i => i.value);
    return ctx.test.previousData.filter(item => selectedIds.includes(item.id));
  }

  function toggleSet(set, value) {
    if (set.has(value)) set.delete(value); else set.add(value);
  }

  function statusBadge(status) {
    const key = status.toLowerCase().replace(/\s+/g, '');
    const cls = key.includes('pendiente') ? 'ep-status-pendiente' : key.includes('proceso') ? 'ep-status-proceso' : key.includes('finalizado') ? 'ep-status-finalizado' : 'ep-status-observado';
    return `<span class="ep-status ${cls}">${escapeHtml(status)}</span>`;
  }

  function showToast(message) {
    document.getElementById('ep_toastBody').textContent = message;
    state.bootstrap.toast.show();
  }

  function formatDate(iso) {
    const [y,m,d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  }

  function buildDatabase() {
    const companies = ['Compañía Minera Andina', 'Transporte Río Azul', 'Operadora Pacífico', 'Servicios Integrales Kallpa', 'Consorcio San Gabriel'];
    const examTypes = ['Preocupacional', 'Periódico'];
    const occupations = ['Operador de maquinaria', 'Asistente administrativo', 'Conductor de ruta', 'Supervisor de campo', 'Técnico electricista'];
    const prestations = [
      'Evaluación Psicológica',
      'Riesgo Psicosocial',
      'Fatiga y Somnolencia',
      'Conducción Segura'
    ];
    const testsByPrestation = {
      'Evaluación Psicológica': ['BC2', 'BC3'],
      'Riesgo Psicosocial': ['FRP-12'],
      'Fatiga y Somnolencia': ['Epworth', 'Fatiga Laboral'],
      'Conducción Segura': ['BC2', 'Tiempo de reacción']
    };
    const names = [
      ['Carlos','Ramírez','Huamán'],['Lucía','Mendoza','Paredes'],['Jorge','Vargas','Luna'],['Andrea','Soto','Quispe'],
      ['Miguel','Rojas','Salazar'],['Paola','Navarro','Ríos'],['Luis','Gálvez','Pinto'],['Diana','Torres','Castro'],
      ['Renzo','Valle','Acuña'],['Fiorella','Córdova','Núñez'],['José','Benites','Peña'],['María','Ramos','Tello'],
      ['Víctor','Cáceres','Flores'],['Yessenia','León','Mamani'],['Omar','Delgado','Ortiz'],['Ruth','Silva','Campos']
    ];
    return names.map((triple, index) => {
      const [first,last,mother] = triple;
      const patient = {
        id: `ep_pat_${index+1}`,
        history: `HC-${String(4300 + index).padStart(5,'0')}`,
        document: `${73000000 + index}`,
        lastName: last,
        motherLastName: mother,
        names: first,
        education: index % 5 === 0 ? '' : DEGREE_OPTIONS[index % DEGREE_OPTIONS.length],
        company: companies[index % companies.length],
        hasGroupDependency: index % 2 === 0,
        episodes: []
      };
      const epCount = index % 3 === 0 ? 2 : 1;
      for (let e = 0; e < epCount; e++) {
        const episodeId = `${patient.id}_epi_${e+1}`;
        const date = '2026-04-10';
        const episode = {
          id: episodeId,
          label: `Episodio ${e+1} / ${patient.history}`,
          date,
          examType: examTypes[(index + e) % examTypes.length],
          occupation: occupations[(index + e) % occupations.length],
          status: ['Pendiente','En proceso','Finalizado'][(index + e) % 3],
          allowRecovery: true,
          prestations: []
        };
        const prestationCount = e === 0 ? 2 : 1;
        for (let p = 0; p < prestationCount; p++) {
          const desc = prestations[(index + e + p) % prestations.length];
          const prId = `${episodeId}_pre_${p+1}`;
          const pr = {
            id: prId,
            description: desc,
            status: ['Pendiente','En proceso','Finalizado'][(index + p) % 3],
            requiresGroup: ['Evaluación Psicológica','Riesgo Psicosocial','Conducción Segura'].includes(desc),
            allowRecovery: true,
            groupSelected: index % 4 === 0 && p === 0 ? (desc === 'Conducción Segura' ? 'Conductores' : 'Operativo general') : '',
            groupStatus: '',
            tests: []
          };
          testsByPrestation[desc].forEach((testName, tIdx) => {
            const pending = (index + e + p + tIdx) % 3 !== 0;
            pr.tests.push({
              id: `${prId}_test_${tIdx+1}`,
              description: testName,
              duration: `${15 + (tIdx * 10)} min`,
              status: pending ? 'Pendiente' : 'Finalizado',
              allowRecovery: pending,
              previousData: createPreviousData(patient, testName, index, tIdx),
              recoveredFrom: ''
            });
          });
          episode.prestations.push(pr);
        }
        patient.episodes.push(episode);
      }
      return patient;
    });
  }

  function createPreviousData(patient, testName, seed, offset) {
    return [0,1,2].map((n) => ({
      id: `${patient.id}_${seed}_${offset}_${n}`,
      code: `BC${n + 2}`,
      date: `${String(10 + n).padStart(2,'0')}/0${(seed % 3) + 1}/2025`,
      source: testName,
      summary: `Registro previo ${n + 1} de ${testName} del paciente ${patient.names} ${patient.lastName}`,
      results: [
        `Resultado: ${['Dentro de rango','En seguimiento','Requiere revisión'][n % 3]}`,
        `Puntaje total: ${52 + seed + n}`,
        `Observación: ${['Sin alertas críticas','Requiere seguimiento','Sugerir reevaluación'][n % 3]}`
      ]
    }));
  }
})();
