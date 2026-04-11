
(function(){
  function q(sel, root){ return (root||document).querySelector(sel); }
  function qa(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }

  function getSmartBox(){ return q('.sepo-smart-search-box'); }
  function getRefEl(){ return q('#formulaTextReference') || q('.sepo-smart-search-box .monospace'); }
  function getConstructorInput(){ return q('#facFormula'); }
  function getConstructorPreview(){ return q('#formulaTextPreview'); }

  function currentConstructor(){
    var input = getConstructorInput();
    return input ? String(input.value || '').trim() : '';
  }

  function restoreConstructor(value){
    var safe = String(value || '').trim();
    var input = getConstructorInput();
    var preview = getConstructorPreview();
    if (input) input.value = safe;
    if (preview) preview.textContent = safe || '...';
  }

  function referenceFormulaFromRow(row){
    if (!row) return '';
    var f = String(row.getAttribute('data-formula') || (row.dataset && row.dataset.formula) || '').trim();
    if (f) return f;
    var titleEl = row.querySelector('.fw-bold, .sepo-template-title, strong');
    var title = String(titleEl ? titleEl.textContent : row.textContent || '').toUpperCase().replace(/\s+/g,' ').trim();
    if (title.indexOf('SUMAR 2 PREGUNTAS') !== -1) return 'RP1 + RP2';
    if (title.indexOf('PROMEDIO DE 3 PREGUNTAS') !== -1) return '(RP1 + RP2 + RP3) / 3';
    if (title.indexOf('CONDICIONAL SIMPLE') !== -1) return 'SI RP1 > 2 ENTONCES RP2';
    return '';
  }

  function paintReference(formula){
    var safe = String(formula || '').trim();
    window.sepoSmartReferenceFormula = safe;
    var el = getRefEl();
    if (el) {
      el.textContent = safe || '...';
      el.innerText = safe || '...';
    }
    if (typeof window.syncReferenceFormula === 'function') {
      try { window.syncReferenceFormula(safe); } catch(e) {}
    }
  }

  function selectRow(row){
    var box = getSmartBox();
    if (!box || !row) return;
    qa('.sepo-template-row', box).forEach(function(item){
      item.classList.remove('is-selected');
      item.setAttribute('aria-pressed', 'false');
    });
    row.classList.add('is-selected');
    row.setAttribute('aria-pressed', 'true');
  }

  function handleRowSelection(row){
    if (!row) return false;
    var before = currentConstructor();
    var formula = referenceFormulaFromRow(row);
    selectRow(row);
    paintReference(formula);
    setTimeout(function(){ restoreConstructor(before); }, 0);
    return false;
  }

  function bindRows(){
    var box = getSmartBox();
    if (!box) return;
    qa('.sepo-template-row', box).forEach(function(row){
      if (!row.getAttribute('data-formula')) {
        var guess = referenceFormulaFromRow(row);
        if (guess) row.setAttribute('data-formula', guess);
      }
      row.setAttribute('role','button');
      row.setAttribute('tabindex','0');
      row.onclick = function(e){
        if (e) { e.preventDefault(); e.stopPropagation(); }
        return handleRowSelection(row);
      };
      row.onkeydown = function(e){
        if (e && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleRowSelection(row);
        }
      };
    });

    var clearBtn = q('#smartFormulaClearBtn', box) || q('#smartFormulaClearBtn');
    if (clearBtn) {
      clearBtn.onclick = function(e){
        var before = currentConstructor();
        if (e) { e.preventDefault(); e.stopPropagation(); }
        var input = q('#smartFormulaSearch');
        if (input) input.value = '';
        qa('.sepo-template-row', box).forEach(function(item){
          item.classList.remove('is-selected');
          item.setAttribute('aria-pressed', 'false');
          item.style.display = '';
        });
        paintReference('');
        setTimeout(function(){ restoreConstructor(before); }, 0);
        return false;
      };
    }
  }

  function installDelegation(){
    document.addEventListener('click', function(e){
      var row = e.target && e.target.closest ? e.target.closest('.sepo-smart-search-box .sepo-template-row') : null;
      if (!row) return;
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
      handleRowSelection(row);
    }, true);
  }

  function init(){
    bindRows();
    if (!window.__sepoSmartSearchDelegated) {
      window.__sepoSmartSearchDelegated = true;
      installDelegation();
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    init();
    setTimeout(init, 100);
    setTimeout(init, 500);
    setTimeout(init, 1200);
    var mo = new MutationObserver(function(){ init(); });
    mo.observe(document.body, {childList:true, subtree:true});
  });
})();
