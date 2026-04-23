(function () {
  'use strict';

  const BPQ = {
    state: {
      blocks: [],
      filter: '',
      editingId: null,
      draftType: 1,
      nextId: 4,
      nextRowId: 1,
    },
    refs: {},
    mockQuestions: [
      { id: 1, code: 'P-001', order: 1, text: '¿Sientes tensión en los músculos al iniciar tu jornada?', type: 'cerrada', alternatives: ['Nunca', 'A veces', 'Frecuentemente', 'Siempre'] },
      { id: 2, code: 'P-002', order: 2, text: '¿Te cuesta concentrarte cuando tienes muchas tareas pendientes?', type: 'cerrada', alternatives: ['Nunca', 'Rara vez', 'A veces', 'Casi siempre'] },
      { id: 3, code: 'P-003', order: 3, text: '¿Evitas actividades sociales por nervios o preocupación?', type: 'cerrada', alternatives: ['No', 'A veces', 'Sí, con frecuencia'] },
      { id: 4, code: 'P-004', order: 4, text: '¿Tu ritmo cardiaco aumenta antes de una evaluación?', type: 'cerrada', alternatives: ['Nunca', 'Leve', 'Moderado', 'Alto'] },
      { id: 5, code: 'P-005', order: 5, text: '¿Piensas en escenarios negativos antes de una entrevista?', type: 'cerrada', alternatives: ['Nunca', 'A veces', 'Frecuentemente'] },
      { id: 6, code: 'P-006', order: 6, text: '¿Te cuesta dormir por pensamientos repetitivos?', type: 'cerrada', alternatives: ['Nada', 'Poco', 'Moderado', 'Mucho'] },
      { id: 7, code: 'P-007', order: 7, text: '¿Sientes sudoración excesiva en situaciones de presión?', type: 'cerrada', alternatives: ['Nunca', 'Algunas veces', 'Con frecuencia'] },
      { id: 8, code: 'P-008', order: 8, text: '¿Prefieres postergar decisiones por miedo a equivocarte?', type: 'cerrada', alternatives: ['Nunca', 'A veces', 'Casi siempre'] },
      { id: 9, code: 'P-009', order: 9, text: '¿Necesitas validar tus respuestas antes de continuar?', type: 'cerrada', alternatives: ['No', 'En ocasiones', 'Sí'] },
      { id: 10, code: 'P-010', order: 10, text: '¿Se te dificulta hablar cuando te sientes observado?', type: 'cerrada', alternatives: ['Nunca', 'A veces', 'Frecuentemente'] },
      { id: 11, code: 'P-011', order: 11, text: '¿Experimentas respiración agitada bajo presión?', type: 'cerrada', alternatives: ['Nunca', 'Leve', 'Moderada', 'Alta'] },
      { id: 12, code: 'P-012', order: 12, text: '¿Sientes bloqueos mentales cuando recibes instrucciones complejas?', type: 'cerrada', alternatives: ['Nunca', 'A veces', 'Con frecuencia'] },
      { id: 13, code: 'P-013', order: 13, text: '¿Evitas responder si no estás completamente seguro?', type: 'cerrada', alternatives: ['No', 'A veces', 'Sí'] },
      { id: 14, code: 'P-014', order: 14, text: '¿Te distraen pensamientos ajenos a la tarea actual?', type: 'cerrada', alternatives: ['Nunca', 'A veces', 'Frecuentemente'] },
      { id: 15, code: 'P-015', order: 15, text: '¿Necesitas pausar antes de responder preguntas difíciles?', type: 'cerrada', alternatives: ['Nunca', 'A veces', 'Casi siempre'] },
      { id: 16, code: 'P-016', order: 16, text: 'Comentario libre del evaluado sobre su experiencia', type: 'abierta', alternatives: [] },
    ],
  };

  function $(id) {
    return document.getElementById(id);
  }

  function q(selector, ctx) {
    return Array.from((ctx || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getQuestionById(id) {
    return BPQ.mockQuestions.find((item) => item.id === Number(id)) || null;
  }

  function getClosedQuestions() {
    return BPQ.mockQuestions.filter((item) => item.type === 'cerrada');
  }

  function getQuestionLabel(id) {
    const q = getQuestionById(id);
    return q ? `${q.code} · ${q.text}` : 'Pregunta no encontrada';
  }

  function getRuleTypeLabel(type) {
    return ({ 1: 'Tipo 1 · Al menos una', 2: 'Tipo 2 · Todas', 3: 'Tipo 3 · Grupos' }[type] || 'Sin tipo');
  }

  function summarizeCondition(condition) {
    const question = getQuestionById(condition.questionId);
    if (!question) return 'Condición incompleta';
    const answers = (condition.selectedAlternatives || []).map((idx) => question.alternatives[idx]).filter(Boolean);
    return `${question.code} = ${answers.join(' / ')}`;
  }

  function summarizeRule(block) {
    if (!block || !Array.isArray(block.conditions) || !block.conditions.length) return 'Sin condiciones';
    if (Number(block.type) === 3) {
      const groups = {};
      block.conditions.forEach((cond) => {
        const groupKey = Number(cond.group || 1);
        groups[groupKey] = groups[groupKey] || [];
        groups[groupKey].push(summarizeCondition(cond));
      });
      return Object.keys(groups)
        .sort((a, b) => Number(a) - Number(b))
        .map((groupKey) => `(${groups[groupKey].join(' Y ')})`)
        .join(' O ');
    }
    const joiner = Number(block.type) === 2 ? ' Y ' : ' O ';
    return block.conditions.map(summarizeCondition).join(joiner);
  }

  function summarizeDestinations(block) {
    return (block.destinations || []).map((id) => getQuestionById(id)?.code).filter(Boolean).join(', ');
  }

  function buildSeedData() {
    return [
      {
        id: 1,
        type: 1,
        conditions: [
          { uid: 'seed-1', questionId: 2, selectedAlternatives: [2, 3], group: 1 },
          { uid: 'seed-2', questionId: 4, selectedAlternatives: [3], group: 1 },
        ],
        destinations: [7, 8],
      },
      {
        id: 2,
        type: 2,
        conditions: [
          { uid: 'seed-3', questionId: 5, selectedAlternatives: [2], group: 1 },
          { uid: 'seed-4', questionId: 6, selectedAlternatives: [2, 3], group: 1 },
        ],
        destinations: [10],
      },
      {
        id: 3,
        type: 3,
        conditions: [
          { uid: 'seed-5', questionId: 1, selectedAlternatives: [3], group: 1 },
          { uid: 'seed-6', questionId: 3, selectedAlternatives: [1, 2], group: 1 },
          { uid: 'seed-7', questionId: 8, selectedAlternatives: [2], group: 2 },
          { uid: 'seed-8', questionId: 9, selectedAlternatives: [2], group: 2 },
        ],
        destinations: [13, 14, 15],
      },
    ];
  }

  function collectRefs() {
    BPQ.refs = {
      search: $('bpqSearchInput'),
      tableBody: $('bpqTableBody'),
      empty: $('bpqEmptyState'),
      count: $('bpqResultsCount'),
      modalEl: $('bpqModal'),
      modalTitle: $('bpqModalTitle'),
      typeCards: q('[data-bpq-type-card]'),
      typeHint: $('bpqTypeHint'),
      form: $('bpqForm'),
      conditionsWrap: $('bpqConditionsWrap'),
      addConditionBtn: $('bpqAddConditionBtn'),
      destinationSearch: $('bpqDestinationSearch'),
      destinationList: $('bpqDestinationList'),
      destinationHint: $('bpqDestinationHint'),
      preview: $('bpqRulePreview'),
      saveBtn: $('bpqSaveBtn'),
      newBtn: $('bpqNewBtn'),
      groupLegend: $('bpqGroupLegend'),
      datalist: $('bpqQuestionOptions'),
    };
    if (BPQ.refs.modalEl) {
      if (BPQ.refs.modalEl.parentElement !== document.body) {
        document.body.appendChild(BPQ.refs.modalEl);
      }
      if (window.bootstrap) {
        BPQ.refs.modal = bootstrap.Modal.getOrCreateInstance(BPQ.refs.modalEl, {
          backdrop: true,
          focus: true,
          keyboard: true,
        });
      }
    }
  }

  function ensureDatalist() {
    if (!BPQ.refs.datalist) return;
    BPQ.refs.datalist.innerHTML = getClosedQuestions().map((question) =>
      `<option value="${escapeHtml(question.code)} · ${escapeHtml(question.text)}" data-id="${question.id}"></option>`
    ).join('');
  }

  function renderGrid() {
    if (!BPQ.refs.tableBody) return;
    const term = (BPQ.state.filter || '').trim().toLowerCase();
    const rows = BPQ.state.blocks.filter((block) => {
      if (!term) return true;
      const haystack = [
        getRuleTypeLabel(block.type),
        summarizeRule(block),
        summarizeDestinations(block),
        ...block.conditions.map((cond) => getQuestionLabel(cond.questionId)),
      ].join(' ').toLowerCase();
      return haystack.includes(term);
    });

    BPQ.refs.count.textContent = `${rows.length} bloqueo${rows.length === 1 ? '' : 's'}`;
    BPQ.refs.empty.classList.toggle('d-none', rows.length > 0);

    BPQ.refs.tableBody.innerHTML = rows.map((block) => {
      const groups = Number(block.type) === 3
        ? Array.from(new Set(block.conditions.map((cond) => Number(cond.group || 1)))).sort((a, b) => a - b).join(', ')
        : '—';
      const destinations = (block.destinations || []).map((id) => {
        const question = getQuestionById(id);
        return question ? `<span class="bpq-pill">${escapeHtml(question.code)}</span>` : '';
      }).join('');
      return `
        <tr>
          <td><span class="bpq-type-badge bpq-type-badge--${Number(block.type)}">${escapeHtml(getRuleTypeLabel(block.type))}</span></td>
          <td>
            <div class="bpq-rule-copy">${escapeHtml(summarizeRule(block))}</div>
          </td>
          <td><div class="bpq-destination-stack">${destinations || '<span class="text-muted small">Sin destino</span>'}</div></td>
          <td>${escapeHtml(groups)}</td>
          <td>
            <div class="bpq-row-actions">
              <button class="btn btn-sm btn-light border" type="button" data-bpq-action="edit" data-bpq-id="${block.id}"><i class="fas fa-pen"></i></button>
              <button class="btn btn-sm btn-light border" type="button" data-bpq-action="duplicate" data-bpq-id="${block.id}"><i class="fas fa-copy"></i></button>
              <button class="btn btn-sm btn-light border" type="button" data-bpq-action="delete" data-bpq-id="${block.id}"><i class="fas fa-trash-alt"></i></button>
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  function createConditionDraft(partial) {
    return Object.assign({
      uid: `bpq-cond-${Date.now()}-${BPQ.state.nextRowId++}`,
      questionId: null,
      selectedAlternatives: [],
      group: 1,
    }, partial || {});
  }

  function getDraftConditions() {
    return BPQ.state.draftConditions || [];
  }

  function setDraftConditions(next) {
    BPQ.state.draftConditions = next;
    renderConditions();
    renderDestinations();
    renderPreview();
  }

  function buildQuestionInputValue(questionId) {
    const question = getQuestionById(questionId);
    return question ? `${question.code} · ${question.text}` : '';
  }

  function renderConditions() {
    const wrap = BPQ.refs.conditionsWrap;
    if (!wrap) return;
    const type = Number(BPQ.state.draftType || 1);
    const conditions = getDraftConditions();
    BPQ.refs.groupLegend.classList.toggle('d-none', type !== 3);
    BPQ.refs.typeHint.textContent = ({
      1: 'Se cumplirá el bloqueo cuando al menos una condición sea verdadera.',
      2: 'Se cumplirá el bloqueo únicamente cuando todas las condiciones sean verdaderas.',
      3: 'Agrupa condiciones. Dentro del mismo grupo se evalúan con Y, entre grupos con O.',
    })[type];

    wrap.innerHTML = conditions.map((condition, index) => {
      const question = getQuestionById(condition.questionId);
      const alternatives = question ? question.alternatives : [];
      const altHtml = question
        ? `<div class="bpq-alt-grid">${alternatives.map((alt, altIndex) => `
            <label class="bpq-alt-option ${condition.selectedAlternatives.includes(altIndex) ? 'is-active' : ''}">
              <input type="checkbox" data-bpq-alt-input="${condition.uid}" value="${altIndex}" ${condition.selectedAlternatives.includes(altIndex) ? 'checked' : ''} />
              <span>${escapeHtml(alt)}</span>
            </label>`).join('')}</div>`
        : `<div class="bpq-field-note">Busca una pregunta cerrada para habilitar sus alternativas.</div>`;
      return `
        <article class="bpq-condition-card" data-bpq-condition="${condition.uid}">
          <div class="bpq-condition-top">
            <div class="bpq-condition-title">Condición ${index + 1}</div>
            <div class="bpq-condition-tools">
              <div class="bpq-group-chip ${type === 3 ? '' : 'd-none'}">
                <label for="bpqGroup_${condition.uid}">Grupo</label>
                <select id="bpqGroup_${condition.uid}" class="form-select form-select-sm" data-bpq-group-select="${condition.uid}">
                  ${[1,2,3,4,5,6].map((group) => `<option value="${group}" ${Number(condition.group) === group ? 'selected' : ''}>${group}</option>`).join('')}
                </select>
              </div>
              <button class="btn btn-sm btn-light border" type="button" data-bpq-remove-condition="${condition.uid}" ${conditions.length === 1 ? 'disabled' : ''}><i class="fas fa-times"></i></button>
            </div>
          </div>
          <div class="bpq-condition-grid">
            <div>
              <label class="bpq-field-label" for="bpqQuestion_${condition.uid}">Pregunta origen</label>
              <input class="form-control bpq-question-input" id="bpqQuestion_${condition.uid}" data-bpq-question-input="${condition.uid}" list="bpqQuestionOptions" value="${escapeHtml(buildQuestionInputValue(condition.questionId))}" placeholder="Buscar pregunta cerrada..." autocomplete="off" />
              <div class="bpq-field-note">Solo preguntas cerradas de la prueba demo.</div>
            </div>
            <div>
              <label class="bpq-field-label">Alternativas que activan el bloqueo</label>
              ${altHtml}
            </div>
          </div>
        </article>`;
    }).join('');
  }

  function getMaxConditionOrder() {
    const orders = getDraftConditions().map((cond) => getQuestionById(cond.questionId)?.order).filter(Boolean);
    return orders.length ? Math.max.apply(null, orders) : 0;
  }

  function renderDestinations() {
    const list = BPQ.refs.destinationList;
    if (!list) return;
    const term = (BPQ.refs.destinationSearch.value || '').trim().toLowerCase();
    const allowedMinOrder = getMaxConditionOrder();
    const selected = BPQ.state.draftDestinations || [];
    const options = BPQ.mockQuestions.filter((question) => question.order > allowedMinOrder && (!term || `${question.code} ${question.text}`.toLowerCase().includes(term)));
    BPQ.refs.destinationHint.textContent = allowedMinOrder
      ? `Solo se muestran preguntas con orden superior a la mayor pregunta origen seleccionada (>${allowedMinOrder}).`
      : 'Selecciona primero una o más preguntas origen para habilitar destinos posteriores.';

    list.innerHTML = options.length
      ? options.map((question) => `
          <label class="bpq-destination-option ${selected.includes(question.id) ? 'is-active' : ''}">
            <input type="checkbox" data-bpq-destination value="${question.id}" ${selected.includes(question.id) ? 'checked' : ''} />
            <span class="bpq-destination-code">${escapeHtml(question.code)}</span>
            <span class="bpq-destination-text">${escapeHtml(question.text)}</span>
          </label>`).join('')
      : `<div class="bpq-empty-inline">No hay preguntas disponibles con los filtros actuales.</div>`;
  }

  function renderPreview() {
    if (!BPQ.refs.preview) return;
    const draft = {
      type: BPQ.state.draftType,
      conditions: getDraftConditions(),
      destinations: BPQ.state.draftDestinations || [],
    };
    const conditionsReady = draft.conditions.every((cond) => cond.questionId && cond.selectedAlternatives.length);
    const destinationsReady = draft.destinations.length > 0;
    if (!conditionsReady || !destinationsReady) {
      BPQ.refs.preview.innerHTML = '<span class="text-muted">Arma la regla seleccionando condiciones y al menos una pregunta destino.</span>';
      return;
    }
    BPQ.refs.preview.innerHTML = `
      <div class="bpq-preview-line"><strong>SI</strong> ${escapeHtml(summarizeRule(draft))}</div>
      <div class="bpq-preview-line"><strong>ENTONCES</strong> bloquear ${escapeHtml((draft.destinations || []).map((id) => getQuestionLabel(id)).join(' · '))}</div>`;
  }

  function resetModalState(block) {
    const source = block ? JSON.parse(JSON.stringify(block)) : null;
    BPQ.state.editingId = source ? source.id : null;
    BPQ.state.draftType = source ? Number(source.type) : 1;
    BPQ.state.draftConditions = source ? source.conditions.map((cond) => createConditionDraft(cond)) : [createConditionDraft()];
    BPQ.state.draftDestinations = source ? source.destinations.slice() : [];
    BPQ.refs.modalTitle.textContent = source ? 'Editar bloqueo de preguntas' : 'Nuevo bloqueo de preguntas';
    q('[data-bpq-type-card]').forEach((btn) => btn.classList.toggle('is-active', Number(btn.getAttribute('data-bpq-type-card')) === Number(BPQ.state.draftType)));
    if (BPQ.refs.destinationSearch) BPQ.refs.destinationSearch.value = '';
    renderConditions();
    renderDestinations();
    renderPreview();
  }

  function openModalForCreate() {
    resetModalState(null);
    BPQ.refs.modal.show();
  }

  function openModalForEdit(id, duplicate) {
    const block = BPQ.state.blocks.find((item) => item.id === Number(id));
    if (!block) return;
    const clone = JSON.parse(JSON.stringify(block));
    if (duplicate) {
      clone.id = null;
      clone.conditions.forEach((cond) => { delete cond.uid; });
    }
    resetModalState(clone);
    BPQ.refs.modalTitle.textContent = duplicate ? 'Duplicar bloqueo de preguntas' : 'Editar bloqueo de preguntas';
    BPQ.refs.modal.show();
  }

  function removeCondition(uid) {
    const next = getDraftConditions().filter((cond) => cond.uid !== uid);
    if (next.length) setDraftConditions(next);
  }

  function resolveQuestionIdFromInput(value) {
    const trimmed = String(value || '').trim();
    const found = getClosedQuestions().find((question) => `${question.code} · ${question.text}`.toLowerCase() === trimmed.toLowerCase());
    return found ? found.id : null;
  }

  function updateConditionQuestion(uid, rawValue) {
    const questionId = resolveQuestionIdFromInput(rawValue);
    const next = getDraftConditions().map((cond) => {
      if (cond.uid !== uid) return cond;
      return Object.assign({}, cond, {
        questionId,
        selectedAlternatives: [],
      });
    });
    setDraftConditions(next);
  }

  function updateConditionAlternatives(uid, selectedValues) {
    const next = getDraftConditions().map((cond) => cond.uid === uid
      ? Object.assign({}, cond, { selectedAlternatives: selectedValues.map((v) => Number(v)).sort((a, b) => a - b) })
      : cond);
    setDraftConditions(next);
  }

  function updateConditionGroup(uid, value) {
    const next = getDraftConditions().map((cond) => cond.uid === uid ? Object.assign({}, cond, { group: Number(value) || 1 }) : cond);
    setDraftConditions(next);
  }

  function updateDestinations(values) {
    BPQ.state.draftDestinations = values.map((value) => Number(value));
    renderDestinations();
    renderPreview();
  }

  function validateDraft() {
    const conditions = getDraftConditions();
    if (!conditions.length) return 'Debes agregar al menos una condición.';
    for (const condition of conditions) {
      if (!condition.questionId) return 'Cada condición debe tener una pregunta origen válida.';
      if (!condition.selectedAlternatives.length) return 'Selecciona al menos una alternativa en cada condición.';
    }
    if (!(BPQ.state.draftDestinations || []).length) return 'Selecciona al menos una pregunta destino a bloquear.';
    return null;
  }

  function persistDraft() {
    const error = validateDraft();
    if (error) {
      window.alert(error);
      return;
    }
    const payload = {
      id: BPQ.state.editingId || BPQ.state.nextId++,
      type: Number(BPQ.state.draftType),
      conditions: getDraftConditions().map((cond) => ({
        uid: cond.uid,
        questionId: Number(cond.questionId),
        selectedAlternatives: cond.selectedAlternatives.slice(),
        group: Number(cond.group || 1),
      })),
      destinations: (BPQ.state.draftDestinations || []).slice(),
    };
    if (BPQ.state.editingId) {
      BPQ.state.blocks = BPQ.state.blocks.map((block) => block.id === payload.id ? payload : block);
    } else {
      BPQ.state.blocks.unshift(payload);
    }
    BPQ.refs.modal.hide();
    renderGrid();
  }

  function handleTableClick(event) {
    const button = event.target.closest('[data-bpq-action]');
    if (!button) return;
    const action = button.getAttribute('data-bpq-action');
    const id = Number(button.getAttribute('data-bpq-id'));
    if (action === 'edit') openModalForEdit(id, false);
    if (action === 'duplicate') openModalForEdit(id, true);
    if (action === 'delete') {
      if (window.confirm('¿Eliminar este bloqueo demo?')) {
        BPQ.state.blocks = BPQ.state.blocks.filter((item) => item.id !== id);
        renderGrid();
      }
    }
  }

  function bindEvents() {
    if (BPQ.refs.search) {
      BPQ.refs.search.addEventListener('input', function () {
        BPQ.state.filter = this.value || '';
        renderGrid();
      });
    }
    if (BPQ.refs.newBtn) BPQ.refs.newBtn.addEventListener('click', openModalForCreate);
    if (BPQ.refs.tableBody) BPQ.refs.tableBody.addEventListener('click', handleTableClick);
    BPQ.refs.typeCards.forEach((card) => card.addEventListener('click', function () {
      BPQ.state.draftType = Number(this.getAttribute('data-bpq-type-card'));
      q('[data-bpq-type-card]').forEach((btn) => btn.classList.toggle('is-active', btn === this));
      renderConditions();
      renderPreview();
    }));
    if (BPQ.refs.addConditionBtn) {
      BPQ.refs.addConditionBtn.addEventListener('click', function () {
        setDraftConditions(getDraftConditions().concat(createConditionDraft()));
      });
    }
    if (BPQ.refs.conditionsWrap) {
      BPQ.refs.conditionsWrap.addEventListener('click', function (event) {
        const removeBtn = event.target.closest('[data-bpq-remove-condition]');
        if (removeBtn) removeCondition(removeBtn.getAttribute('data-bpq-remove-condition'));
      });
      BPQ.refs.conditionsWrap.addEventListener('change', function (event) {
        const questionInput = event.target.closest('[data-bpq-question-input]');
        if (questionInput) {
          updateConditionQuestion(questionInput.getAttribute('data-bpq-question-input'), questionInput.value);
          return;
        }
        const groupSelect = event.target.closest('[data-bpq-group-select]');
        if (groupSelect) {
          updateConditionGroup(groupSelect.getAttribute('data-bpq-group-select'), groupSelect.value);
          return;
        }
        const altInput = event.target.closest('[data-bpq-alt-input]');
        if (altInput) {
          const uid = altInput.getAttribute('data-bpq-alt-input');
          const holder = altInput.closest('.bpq-condition-card');
          const selected = q(`[data-bpq-alt-input="${uid}"]:checked`, holder).map((input) => input.value);
          updateConditionAlternatives(uid, selected);
        }
      });
      BPQ.refs.conditionsWrap.addEventListener('input', function (event) {
        const questionInput = event.target.closest('[data-bpq-question-input]');
        if (questionInput && questionInput.value === '') {
          updateConditionQuestion(questionInput.getAttribute('data-bpq-question-input'), '');
        }
      });
    }
    if (BPQ.refs.destinationSearch) {
      BPQ.refs.destinationSearch.addEventListener('input', renderDestinations);
    }
    if (BPQ.refs.destinationList) {
      BPQ.refs.destinationList.addEventListener('change', function () {
        const selected = q('[data-bpq-destination]:checked', BPQ.refs.destinationList).map((input) => input.value);
        updateDestinations(selected);
      });
    }
    if (BPQ.refs.saveBtn) {
      BPQ.refs.saveBtn.addEventListener('click', persistDraft);
    }
    if (BPQ.refs.modalEl) {
      BPQ.refs.modalEl.addEventListener('hidden.bs.modal', function () {
        BPQ.state.editingId = null;
      });
    }
  }

  function init() {
    collectRefs();
    if (!BPQ.refs.tableBody || !BPQ.refs.modalEl) return;
    BPQ.state.blocks = buildSeedData();
    ensureDatalist();
    bindEvents();
    renderGrid();
    resetModalState(null);
    window.BPQQuestionBlockingDemo = {
      open: openModalForCreate,
      state: BPQ.state,
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
