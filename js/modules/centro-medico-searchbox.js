(function () {
  const RESPONSABLES = [
    { value: 'maria-paredes', label: 'María Elena Paredes Soto', meta: 'Psicóloga · San Miguel' },
    { value: 'luis-chavez', label: 'Luis Alberto Chávez Rojas', meta: 'Administrador · Lince' },
    { value: 'carlos-ruiz', label: 'Carlos Enrique Ruiz Gamarra', meta: 'Supervisor · Ate' },
    { value: 'ana-torres', label: 'Ana Lucía Torres Vega', meta: 'Coordinadora · San Borja' },
    { value: 'johanna-perez', label: 'Johanna Perez', meta: 'Coordinadora UX · Sede Central' },
    { value: 'rosa-caceres', label: 'Rosa Patricia Cáceres León', meta: 'Recepción · Jesús María' },
  ];

  const state = {
    instances: new Map(),
    documentBound: false,
  };

  function getPlaceholder(select) {
    const firstOption = select?.querySelector('option[value=""]');
    return firstOption?.textContent?.trim() || 'Seleccionar...';
  }

  function normalize(value) {
    return (value || '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function closeAll(exceptId = '') {
    state.instances.forEach((instance, selectId) => {
      if (selectId !== exceptId) close(instance);
    });
  }

  function setTriggerText(instance, text) {
    instance.triggerText.textContent = text || instance.placeholder;
  }

  function buildOptionsMarkup(instance, query = '') {
    const select = instance.select;
    const currentValue = select.value;
    const normalizedQuery = normalize(query);
    const options = Array.from(select.options)
      .filter((option) => option.value !== '')
      .filter((option) => {
        if (!normalizedQuery) return true;
        return normalize(option.textContent).includes(normalizedQuery);
      });

    if (!options.length) {
      instance.options.innerHTML = '<div class="cm-searchbox-empty">No se encontraron resultados.</div>';
      return;
    }

    instance.options.innerHTML = options
      .map((option, index) => {
        const isSelected = option.value === currentValue;
        const meta = option.dataset.meta ? `<small>${escapeHtml(option.dataset.meta)}</small>` : '';
        return `
          <button
            class="cm-searchbox-option${isSelected ? ' is-selected' : ''}${index === 0 ? ' is-active' : ''}"
            type="button"
            data-value="${escapeAttr(option.value)}"
            role="option"
            aria-selected="${isSelected ? 'true' : 'false'}"
          >
            <span>${escapeHtml(option.textContent)}</span>
            ${meta}
          </button>`;
      })
      .join('');
  }

  function syncDisabledState(instance) {
    const disabled = !!instance.select.disabled;
    instance.field.classList.toggle('is-disabled', disabled);
    instance.trigger.disabled = disabled;
    if (disabled) close(instance);
  }

  function syncFromSelect(selectId) {
    const instance = state.instances.get(selectId);
    if (!instance) return;
    const selected = instance.select.options[instance.select.selectedIndex];
    const text = selected && selected.value !== '' ? selected.textContent : instance.placeholder;
    setTriggerText(instance, text);
    syncDisabledState(instance);
    if (instance.field.classList.contains('is-open')) {
      buildOptionsMarkup(instance, instance.input.value);
    }
  }

  function open(instance) {
    if (instance.select.disabled) return;
    closeAll(instance.select.id);
    instance.field.classList.add('is-open');
    instance.panel.hidden = false;
    instance.trigger.setAttribute('aria-expanded', 'true');
    buildOptionsMarkup(instance, instance.input.value);
    instance.input.focus();
    instance.input.select();
  }

  function close(instance) {
    instance.field.classList.remove('is-open');
    instance.panel.hidden = true;
    instance.trigger.setAttribute('aria-expanded', 'false');
    instance.input.value = '';
  }

  function selectOption(instance, value) {
    instance.select.value = value;
    syncFromSelect(instance.select.id);
    instance.select.dispatchEvent(new Event('change', { bubbles: true }));
    close(instance);
  }

  function createInstance(field) {
    const selectId = field.dataset.sourceSelect;
    const select = document.getElementById(selectId);
    if (!select || state.instances.has(selectId)) return;

    const trigger = field.querySelector('.cm-searchbox-trigger');
    const triggerText = field.querySelector('.cm-searchbox-trigger-text');
    const panel = field.querySelector('.cm-searchbox-panel');
    const input = field.querySelector('.cm-searchbox-input');
    const options = field.querySelector('.cm-searchbox-options');
    const instance = {
      field,
      select,
      trigger,
      triggerText,
      panel,
      input,
      options,
      placeholder: field.dataset.placeholder || getPlaceholder(select),
    };

    trigger.addEventListener('click', () => {
      if (field.classList.contains('is-open')) close(instance);
      else open(instance);
    });

    input.addEventListener('input', () => buildOptionsMarkup(instance, input.value));

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        close(instance);
        trigger.focus();
      }
    });

    options.addEventListener('click', (event) => {
      const button = event.target.closest('.cm-searchbox-option');
      if (!button) return;
      selectOption(instance, button.dataset.value);
    });

    select.addEventListener('change', () => syncFromSelect(select.id));

    state.instances.set(selectId, instance);
    syncFromSelect(selectId);
  }

  function ensureResponsables() {
    const select = document.getElementById('cResponsable');
    if (!select) return;
    const currentValue = select.value;
    select.innerHTML = '<option value="">Seleccionar responsable...</option>' + RESPONSABLES.map((item) => {
      return `<option value="${escapeAttr(item.value)}" data-meta="${escapeAttr(item.meta)}">${escapeHtml(item.label)}</option>`;
    }).join('');
    if (currentValue) select.value = currentValue;
  }

  function ensureBindings() {
    if (state.documentBound) return;
    document.addEventListener('click', (event) => {
      state.instances.forEach((instance) => {
        if (!instance.field.contains(event.target)) close(instance);
      });
    });
    state.documentBound = true;
  }

  function init() {
    ensureResponsables();
    ensureBindings();
    document.querySelectorAll('#modalCentro [data-cm-searchbox]').forEach(createInstance);
    state.instances.forEach((instance, selectId) => syncFromSelect(selectId));
  }

  function preselectResponsable(value) {
    const select = document.getElementById('cResponsable');
    if (!select) return;
    select.value = value || '';
    syncFromSelect('cResponsable');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(str) {
    return escapeHtml(str);
  }

  window.CentroMedicoSearchbox = {
    init,
    refreshForSelect: syncFromSelect,
    preselectResponsable,
    hydrateResponsables: ensureResponsables,
  };

  document.addEventListener('DOMContentLoaded', init);
})();
