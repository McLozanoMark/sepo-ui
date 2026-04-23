(function(){
  if (window.__sepoClosedPrecargaStableV10) return;
  window.__sepoClosedPrecargaStableV10 = true;

  function q(sel, root){ return (root || document).querySelector(sel); }
  function qa(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function getRoot(){ return q('#mpContenedorPregunta') || document; }

  const FALLBACK_OPTIONS = [
    'A menudo','Ocasionalmente','Nunca','Leve',
    'Moderado','Intenso','Sí, recientemente','No, actualmente'
  ];

  // Neutraliza el render legacy de cerradas. Este módulo controla la UI estable.
  window.sepoUpdateClosedPrecargaUI = function(){ try { schedule(); } catch (_) {} };

  function parseValues(raw){
    return String(raw || '').split(',').map(function(v){ return v.trim(); }).filter(Boolean);
  }

  function getAlternatives(root){
    const rows = qa('#mp_C_alternativas_box .item-alt', root);
    const values = rows.map(function(row){
      const inputs = qa('input[type="text"]', row);
      const main = inputs.find(function(inp){
        const v = String(inp.value || '').trim();
        return v && !/^texto$/i.test(v);
      });
      return main ? String(main.value || '').trim() : '';
    }).filter(Boolean);
    return values.length ? values : FALLBACK_OPTIONS.slice();
  }

  function getSeed(root){
    const hidden = q('#mp_C_precargaValue_stable', root);
    const raw = (hidden && hidden.value) || (root.dataset && root.dataset.sepoClosedPrecargaSeed) || '';
    return parseValues(raw);
  }

  function isMulti(root){
    const tipoResp = q('#mp_C_tipoResp', root);
    const raw = String((tipoResp && tipoResp.value) || '').trim().toLowerCase();
    return raw === 'multiple' || raw === 'múltiple' || raw === 'multiple choice';
  }

  function ensureEditableWrap(root){
    const editable = q('#mp_C_editable', root);
    if (!editable) return null;
    let wrap = q('#mp_C_editableWrapStable', root);
    const switchRow = editable.closest('.form-check.form-switch');
    if (!wrap && switchRow) {
      wrap = document.createElement('div');
      wrap.id = 'mp_C_editableWrapStable';
      wrap.className = 'mt-2';
      switchRow.parentNode.insertBefore(wrap, switchRow);
      wrap.appendChild(switchRow);
    }
    return wrap || (switchRow ? switchRow.parentElement : null);
  }

  function ensureMount(root){
    const legacyBox = q('#mp_C_precarga_opciones', root);
    if (!legacyBox) return null;

    // esconder totalmente el bloque legacy para evitar parpadeos o reconstrucción visible
    legacyBox.style.display = 'none';
    legacyBox.setAttribute('aria-hidden', 'true');

    let mount = q('#mp_C_precargaStableMount', root);
    if (!mount) {
      mount = document.createElement('div');
      mount.id = 'mp_C_precargaStableMount';
      mount.className = 'mt-2 ps-1 bg-light p-2 rounded';
      legacyBox.insertAdjacentElement('afterend', mount);
    }

    let host = q('#mp_C_precargaStableHost', mount);
    if (!host) {
      host = document.createElement('div');
      host.id = 'mp_C_precargaStableHost';
      host.className = 'mp-precarga-card-selector';
      mount.appendChild(host);
    }

    if (host.dataset.baseBuilt !== '1') {
      host.dataset.baseBuilt = '1';
      const top = document.createElement('div');
      top.className = 'd-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-2';

      const label = document.createElement('label');
      label.className = 'form-label small text-primary fw-bold mb-0';
      label.innerHTML = '<i class="fas fa-check-square me-1"></i> Alternativa(s) por defecto:';

      const search = document.createElement('input');
      search.type = 'text';
      search.id = 'mp_C_precargaSearch_stable';
      search.className = 'form-control form-control-sm mp-precarga-search';
      search.placeholder = 'Buscar alternativa...';

      const hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.id = 'mp_C_precargaValue_stable';

      const list = document.createElement('div');
      list.id = 'mp_C_precargaList_stable';
      list.className = 'mp-precarga-card-list';

      const empty = document.createElement('div');
      empty.id = 'mp_C_precargaEmpty_stable';
      empty.className = 'mp-precarga-empty small text-muted text-center py-2';
      empty.textContent = 'No se encontraron alternativas.';
      empty.style.display = 'none';

      top.appendChild(label);
      top.appendChild(search);
      host.appendChild(top);
      host.appendChild(hidden);
      host.appendChild(list);
      host.appendChild(empty);

      ['input','click','mousedown','pointerdown'].forEach(function(evt){
        search.addEventListener(evt, function(e){ e.stopPropagation(); });
      });
      search.addEventListener('input', function(){ filter(host); });
    }

    return { mount: mount, host: host };
  }

  function writeValue(root, values){
    const hidden = q('#mp_C_precargaValue_stable', root);
    const raw = values.join(',');
    if (hidden) hidden.value = raw;
    if (root.dataset) root.dataset.sepoClosedPrecargaSeed = raw;
  }

  function getSelectedValues(host){
    return qa('.mp-precarga-card.is-selected', host).map(function(card){
      return String(card.getAttribute('data-value') || '');
    }).filter(Boolean);
  }

  function paintSelection(host, values){
    const selected = new Set(values);
    qa('.mp-precarga-card', host).forEach(function(card){
      const on = selected.has(String(card.getAttribute('data-value') || ''));
      card.classList.toggle('is-selected', on);
      card.setAttribute('aria-checked', on ? 'true' : 'false');
    });
  }

  function toggleCard(card, host, root){
    const multi = isMulti(root);
    if (multi) {
      card.classList.toggle('is-selected');
    } else {
      const next = !card.classList.contains('is-selected');
      qa('.mp-precarga-card', host).forEach(function(other){ other.classList.remove('is-selected'); });
      if (next) card.classList.add('is-selected');
    }
    const values = getSelectedValues(host);
    const finalValues = multi ? values : (values[0] ? [values[0]] : []);
    paintSelection(host, finalValues);
    writeValue(root, finalValues);
  }

  function filter(host){
    const search = q('#mp_C_precargaSearch_stable', host);
    const term = String((search && search.value) || '').trim().toLowerCase();
    let visible = 0;
    qa('.mp-precarga-card', host).forEach(function(card){
      const show = !term || String(card.getAttribute('data-label') || '').indexOf(term) !== -1;
      card.style.display = show ? 'flex' : 'none';
      if (show) visible += 1;
    });
    const empty = q('#mp_C_precargaEmpty_stable', host);
    if (empty) empty.style.display = visible ? 'none' : 'block';
  }

  function buildCard(opt, idx, host, root){
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'mp-precarga-card';
    card.setAttribute('data-label', opt.toLowerCase());
    card.setAttribute('data-value', opt);
    card.setAttribute('role', 'checkbox');
    card.setAttribute('tabindex', '0');

    const stop = function(e){
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
    };
    ['pointerdown','mousedown','mouseup','touchstart','touchend'].forEach(function(evt){
      card.addEventListener(evt, stop, true);
    });
    card.addEventListener('click', function(e){ stop(e); toggleCard(card, host, root); }, true);
    card.addEventListener('keydown', function(e){ if (e.key === ' ' || e.key === 'Enter') { stop(e); toggleCard(card, host, root); } }, true);

    const faux = document.createElement('span');
    faux.className = 'mp-precarga-faux-check';
    faux.setAttribute('aria-hidden', 'true');
    faux.style.pointerEvents = 'none';

    const index = document.createElement('span');
    index.className = 'mp-precarga-card-index';
    index.textContent = String(idx + 1);
    index.style.pointerEvents = 'none';

    const text = document.createElement('span');
    text.className = 'mp-precarga-card-text';
    text.textContent = opt;
    text.style.pointerEvents = 'none';

    card.appendChild(faux);
    card.appendChild(index);
    card.appendChild(text);
    return card;
  }

  function rebuild(root, host){
    const list = q('#mp_C_precargaList_stable', host);
    if (!list) return;
    const options = getAlternatives(root);
    const structureSig = JSON.stringify({ options: options, multi: isMulti(root) });
    const seed = getSeed(root);
    const finalSeed = isMulti(root) ? seed : (seed[0] ? [seed[0]] : []);

    if (host.dataset.structureSig !== structureSig) {
      list.replaceChildren.apply(list, options.map(function(opt, idx){ return buildCard(opt, idx, host, root); }));
      host.dataset.structureSig = structureSig;
    }

    paintSelection(host, finalSeed);
    writeValue(root, finalSeed);
    filter(host);
  }

  function apply(){
    const root = getRoot();
    const precarga = q('#mp_C_precarga', root);
    const editable = q('#mp_C_editable', root);
    const editableWrap = ensureEditableWrap(root);
    const mountInfo = ensureMount(root);
    if (!precarga || !editable || !mountInfo) return;

    const showEditable = !!precarga.checked;
    const showCards = !!(precarga.checked && editable.checked);

    if (editableWrap) editableWrap.style.display = showEditable ? 'block' : 'none';
    if (!showEditable && editable.checked) editable.checked = false;

    mountInfo.mount.style.display = showCards ? 'block' : 'none';
    mountInfo.host.style.display = showCards ? 'block' : 'none';

    if (showCards) rebuild(root, mountInfo.host);
  }

  let raf = 0;
  function schedule(){
    if (raf) return;
    raf = requestAnimationFrame(function(){
      raf = 0;
      try { apply(); } catch (err) { console.error('stable closed precarga v10 failed', err); }
    });
  }

  const prevCtrl = window.ctrlCerrada;
  window.ctrlCerrada = function(){
    const res = typeof prevCtrl === 'function' ? prevCtrl.apply(this, arguments) : undefined;
    schedule();
    return res;
  };

  const wrapLater = ['addMpcAlternativa','duplicarAlternativa','renderizarControlesPregunta'];
  wrapLater.forEach(function(name){
    const prev = window[name];
    if (typeof prev === 'function') {
      window[name] = function(){ const res = prev.apply(this, arguments); setTimeout(schedule, 0); return res; };
    }
  });

  const prevEdit = window.editarPreguntaRow;
  if (typeof prevEdit === 'function') {
    window.editarPreguntaRow = function(btn){
      const row = btn && btn.closest ? btn.closest('.item-row') : null;
      let seed = '';
      try {
        const cfg = JSON.parse((row && row.dataset && row.dataset.sepoConfig) || '{}');
        seed = cfg && cfg.cerrada && cfg.cerrada.precarga ? cfg.cerrada.precarga : '';
      } catch (_) {}
      const res = prevEdit.apply(this, arguments);
      setTimeout(function(){
        const root = getRoot();
        if (root && root.dataset) root.dataset.sepoClosedPrecargaSeed = seed || '';
        schedule();
      }, 120);
      return res;
    };
  }

  document.addEventListener('change', function(e){
    if (!e.target) return;
    if (['mp_C_precarga','mp_C_editable','mp_C_tipoResp','mp_C_vineta'].indexOf(e.target.id) !== -1) schedule();
  }, true);

  document.addEventListener('input', function(e){
    if (!e.target) return;
    if (e.target.id === 'mp_C_precargaSearch_stable') {
      const host = q('#mp_C_precargaStableHost', getRoot());
      if (host) filter(host);
      return;
    }
    if (e.target.closest && e.target.closest('#mp_C_alternativas_box')) setTimeout(schedule, 0);
  }, true);

  document.addEventListener('click', function(e){
    if (!e.target) return;
    if (e.target.closest && e.target.closest('#mp_C_alternativas_box')) setTimeout(schedule, 0);
  }, true);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once:true });
  else schedule();
})();
