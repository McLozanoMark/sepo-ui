(function(){
  if (window.__sepoOpenPrecargaCardsFinal) return;
  window.__sepoOpenPrecargaCardsFinal = true;

  const OPTIONS = [
    'Presenta episodios de estrés',
    'Presenta indicadores leves de ansiedad',
    'Demuestra recursos de afrontamiento',
    'Sugiere reforzar hábitos de autocuidado',
    'No se evidencian factores de riesgo significativos',
    'Requiere seguimiento preventivo',
    'Perfil compatible con funciones operativas',
    'Perfil compatible con funciones administrativas',
    'Se recomienda entrevista complementaria',
    'Necesita reforzar regulación emocional',
    'Sin observaciones relevantes',
    'Procede monitoreo periódico'
  ];

  function q(sel, root){ return (root || document).querySelector(sel); }
  function qa(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function getRoot(){ return q('#mpContenedorPregunta') || document; }

  function parseValues(raw){
    return String(raw || '').split(',').map(v => v.trim()).filter(Boolean);
  }

  function getSeed(root){
    const hostHidden = q('#mp_A_precargaValue_stable', root);
    const legacyHidden = q('#mp_A_precargaValue', root);
    const fields = q('#mp_A_precargaFields', root);
    const raw = (hostHidden && hostHidden.value) || (legacyHidden && legacyHidden.value) || (fields && fields.dataset && fields.dataset.sepoOpenPrecargaSeed) || '';
    return parseValues(raw);
  }

  function writeValue(root, values){
    const raw = values.join(', ');
    const hostHidden = q('#mp_A_precargaValue_stable', root);
    if (hostHidden) hostHidden.value = raw;

    let legacyHidden = q('#mp_A_precargaValue', root);
    if (!legacyHidden) {
      const host = q('#mp_A_precargaStableHost', root);
      if (host) {
        legacyHidden = document.createElement('input');
        legacyHidden.type = 'hidden';
        legacyHidden.id = 'mp_A_precargaValue';
        host.appendChild(legacyHidden);
      }
    }
    if (legacyHidden) legacyHidden.value = raw;

    const fields = q('#mp_A_precargaFields', root);
    if (fields && fields.dataset) fields.dataset.sepoOpenPrecargaSeed = raw;
  }

  function ensureHost(root){
    const box = q('#mp_A_boxPrecarga', root);
    if (!box) return null;

    const fields = q('#mp_A_precargaFields', root);
    if (fields) {
      fields.dataset.sepoManagedOpenPrecarga = '1';
      fields.style.display = 'none';
      fields.innerHTML = '';
    }

    let host = q('#mp_A_precargaStableHost', box);
    if (!host) {
      host = document.createElement('div');
      host.id = 'mp_A_precargaStableHost';
      host.className = 'p-3 bg-light rounded border border-secondary border-opacity-25';
      if (fields && fields.parentNode === box) box.insertBefore(host, fields.nextSibling);
      else box.appendChild(host);
    }

    if (host.dataset.initialized === '1') return host;
    host.dataset.initialized = '1';

    const top = document.createElement('div');
    top.className = 'd-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-2';

    const label = document.createElement('label');
    label.className = 'form-label small text-primary fw-bold mb-0';
    label.textContent = 'Alternativas por defecto';

    const search = document.createElement('input');
    search.type = 'text';
    search.id = 'mp_A_precargaSearch_stable';
    search.className = 'form-control form-control-sm mp-precarga-search';
    search.placeholder = 'Buscar alternativa...';

    top.appendChild(label);
    top.appendChild(search);

    const hiddenStable = document.createElement('input');
    hiddenStable.type = 'hidden';
    hiddenStable.id = 'mp_A_precargaValue_stable';

    const list = document.createElement('div');
    list.id = 'mp_A_precargaList_stable';
    list.className = 'mp-precarga-card-list';

    OPTIONS.forEach((opt, idx) => {
      const card = document.createElement('label');
      card.className = 'mp-precarga-card';
      card.setAttribute('data-label', opt.toLowerCase());

      const check = document.createElement('input');
      check.type = 'checkbox';
      check.className = 'mp-precarga-check';
      check.value = opt;

      const index = document.createElement('span');
      index.className = 'mp-precarga-card-index';
      index.textContent = String(idx + 1);

      const text = document.createElement('span');
      text.className = 'mp-precarga-card-text';
      text.textContent = opt;

      card.appendChild(check);
      card.appendChild(index);
      card.appendChild(text);
      list.appendChild(card);
    });

    const empty = document.createElement('div');
    empty.id = 'mp_A_precargaEmpty_stable';
    empty.className = 'mp-precarga-empty small text-muted text-center py-2';
    empty.style.display = 'none';
    empty.textContent = 'No se encontraron alternativas.';

    host.appendChild(top);
    host.appendChild(hiddenStable);
    host.appendChild(list);
    host.appendChild(empty);

    function sync(){
      const values = qa('.mp-precarga-check:checked', host).map(el => el.value);
      qa('.mp-precarga-card', host).forEach(card => {
        const ck = q('.mp-precarga-check', card);
        card.classList.toggle('is-selected', !!(ck && ck.checked));
      });
      writeValue(root, values);
    }

    function filter(){
      const term = (search.value || '').trim().toLowerCase();
      let visible = 0;
      qa('.mp-precarga-card', host).forEach(card => {
        const show = !term || (card.getAttribute('data-label') || '').indexOf(term) !== -1;
        card.style.display = show ? 'flex' : 'none';
        if (show) visible += 1;
      });
      empty.style.display = visible ? 'none' : 'block';
    }

    host.__sync = sync;
    host.__filter = filter;
    search.addEventListener('input', filter);
    qa('.mp-precarga-check', host).forEach(el => el.addEventListener('change', sync));

    return host;
  }

  function syncSelection(root){
    const host = ensureHost(root);
    if (!host) return;
    const selected = new Set(getSeed(root));
    qa('.mp-precarga-check', host).forEach(el => {
      el.checked = selected.has(el.value);
    });
    if (typeof host.__sync === 'function') host.__sync();
    if (typeof host.__filter === 'function') host.__filter();
  }

  function apply(){
    const root = getRoot();
    const yes = q('#mp_A_precargaSi', root);
    const editable = q('#mp_A_editable', root);
    const editableWrap = q('#mp_A_editableWrap', root);
    const box = q('#mp_A_boxPrecarga', root);
    if (!yes || !editable || !editableWrap || !box) return;

    editableWrap.style.display = yes.checked ? 'block' : 'none';
    const host = ensureHost(root);
    if (!host) return;

    const show = !!(yes.checked && editable.checked);
    box.style.display = show ? 'block' : 'none';
    host.style.display = show ? 'block' : 'none';

    if (show) syncSelection(root);
  }

  let raf = 0;
  function schedule(){
    if (raf) return;
    raf = requestAnimationFrame(function(){
      raf = 0;
      try { apply(); } catch (err) { console.error('stable open precarga fix failed', err); }
    });
  }

  const prevCtrl = window.ctrlAbierta;
  window.ctrlAbierta = function(){
    const res = typeof prevCtrl === 'function' ? prevCtrl.apply(this, arguments) : undefined;
    schedule();
    return res;
  };

  const prevRender = window.renderizarControlesPregunta;
  if (typeof prevRender === 'function') {
    window.renderizarControlesPregunta = function(){
      const res = prevRender.apply(this, arguments);
      schedule();
      return res;
    };
  }

  document.addEventListener('change', function(e){
    if (!e.target) return;
    if (e.target.id === 'mp_A_precargaSi' || e.target.id === 'mp_A_precargaNo' || e.target.id === 'mp_A_editable') schedule();
  }, true);
  document.addEventListener('input', function(e){
    if (e.target && e.target.id === 'mp_A_precargaSearch_stable') schedule();
  }, true);

  const mo = new MutationObserver(schedule);
  mo.observe(document.documentElement, { childList:true, subtree:true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule, { once:true });
  } else {
    schedule();
  }
})();
