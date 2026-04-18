(function () {
  'use strict';

  var STORAGE_KEY = 'sepo.sidebar.collapsed';
  var PRINCIPAL_ORDER = ['bienvenida', 'dashboard', 'pruebas', 'episodios', 'resultados'];
  var PRINCIPAL_LINKS = {
    bienvenida: { href: 'index.html#bienvenida', icon: 'fas fa-door-open fa-fw', text: 'Bienvenida', title: 'Bienvenida' },
    dashboard: { href: 'index.html#dashboard', icon: 'fas fa-th-large fa-fw', text: 'Dashboard', title: 'Dashboard' },
    pruebas: { href: 'index.html#pruebas', icon: 'fas fa-file-medical-alt fa-fw', text: 'Pruebas Psicológicas', title: 'Pruebas Psicológicas' },
    episodios: { href: 'episodios.html', icon: 'fas fa-notes-medical fa-fw', text: 'Episodios', title: 'Episodios' },
    resultados: { href: 'resultados.html', icon: 'fas fa-chart-line fa-fw', text: 'Resultados', title: 'Resultados' }
  };

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function getSidebar() {
    return document.querySelector('.sidebar');
  }

  function getMainContent() {
    return document.querySelector('.main-content');
  }

  function findToggleTargets() {
    return {
      toggle: document.querySelector('[id$="_sidebarToggle"]') || document.querySelector('.toggle-btn'),
      brand: document.querySelector('[id$="_sidebarBrandBtn"]') || document.querySelector('.brand-logo-text')
    };
  }

  function applyCollapsedState(isCollapsed) {
    var sidebar = getSidebar();
    var main = getMainContent();
    if (!sidebar || !main) return;
    sidebar.classList.toggle('collapsed', !!isCollapsed);
    main.classList.toggle('expanded', !!isCollapsed);
  }

  function persistCollapsedState(isCollapsed) {
    try {
      localStorage.setItem(STORAGE_KEY, isCollapsed ? '1' : '0');
    } catch (e) {}
  }

  function readCollapsedState() {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function toggleSidebarShared(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    var sidebar = getSidebar();
    if (!sidebar) return;
    var next = !sidebar.classList.contains('collapsed');
    applyCollapsedState(next);
    persistCollapsedState(next);
  }

  function getPrincipalNavList() {
    var sections = Array.from(document.querySelectorAll('.sidebar-section'));
    var principalSection = sections.find(function (section) {
      return (section.textContent || '').trim().toLowerCase() === 'principal';
    });
    if (!principalSection) return null;
    var next = principalSection.nextElementSibling;
    return next && next.matches('ul.nav') ? next : null;
  }

  function linkKeyFromAnchor(anchor) {
    if (!anchor) return '';
    var href = anchor.getAttribute('href') || '';
    var onclick = anchor.getAttribute('onclick') || '';
    if (/go\(['"]bienvenida['"]\)/.test(onclick) || /#bienvenida$/.test(href)) return 'bienvenida';
    if (/go\(['"]dashboard['"]\)/.test(onclick) || /#dashboard$/.test(href)) return 'dashboard';
    if (/go\(['"]pruebas['"]\)/.test(onclick) || /#pruebas$/.test(href)) return 'pruebas';
    if (/episodios\.html(?:$|[#?])/.test(href)) return 'episodios';
    if (/resultados\.html(?:$|[#?])/.test(href)) return 'resultados';
    if (/reportes\.html(?:$|[#?])/.test(href)) return 'reportes';
    if (/roles\.html(?:$|[#?])/.test(href)) return 'roles';
    if (/usuarios\.html(?:$|[#?])/.test(href)) return 'usuarios';
    if (/parametros\.html(?:$|[#?])/.test(href)) return 'parametros';
    if (/go\(['"]centros['"]\)/.test(onclick) || /#centros$/.test(href)) return 'centros';
    if (/go\(['"]grado['"]\)/.test(onclick) || /#grado$/.test(href)) return 'grado';
    if (/go\(['"]ocupaciones['"]\)/.test(onclick) || /#ocupaciones$/.test(href)) return 'ocupaciones';
    if (/go\(['"]grupos['"]\)/.test(onclick) || /#grupos$/.test(href)) return 'grupos';
    if (/go\(['"]prestaciones['"]\)/.test(onclick) || /#prestaciones$/.test(href)) return 'prestaciones';
    if (/go\(['"]fichas['"]\)/.test(onclick) || /#fichas$/.test(href)) return 'fichas';
    if (/go\(['"]orden['"]\)/.test(onclick) || /#orden$/.test(href)) return 'orden';
    return '';
  }

  function ensurePrincipalMenuConsistency() {
    var principalList = getPrincipalNavList();
    if (!principalList) return;

    var existing = {};
    Array.from(principalList.querySelectorAll('a.nav-link')).forEach(function (anchor) {
      var key = linkKeyFromAnchor(anchor);
      if (key) existing[key] = anchor.closest('li');
    });

    PRINCIPAL_ORDER.forEach(function (key) {
      if (!existing[key]) {
        var config = PRINCIPAL_LINKS[key];
        var li = document.createElement('li');
        li.innerHTML = '<a class="nav-link" href="' + config.href + '" title="' + config.title + '"><i class="' + config.icon + '"></i><span>' + config.text + '</span></a>';
        existing[key] = li;
      }
    });

    PRINCIPAL_ORDER.forEach(function (key) {
      principalList.appendChild(existing[key]);
    });
  }

  function getCurrentNavKey() {
    var path = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var hash = (window.location.hash || '').replace(/^#/, '').trim().toLowerCase();

    if (path === 'episodios.html') return 'episodios';
    if (path === 'resultados.html') return 'resultados';
    if (path === 'reportes.html') return 'reportes';
    if (path === 'roles.html') return 'roles';
    if (path === 'usuarios.html') return 'usuarios';
    if (path === 'parametros.html') return 'parametros';

    if (path === 'index.html' || path === '') {
      if (hash) return hash;
      return 'bienvenida';
    }

    return '';
  }

  function syncActiveLink() {
    var currentKey = getCurrentNavKey();
    Array.from(document.querySelectorAll('.sidebar .nav-link')).forEach(function (anchor) {
      if (anchor.classList.contains('nav-link-settings')) return;
      anchor.classList.toggle('active', linkKeyFromAnchor(anchor) === currentKey);
    });
  }

  function bindSidebarTriggers() {
    var targets = findToggleTargets();
    if (targets.toggle && !targets.toggle.dataset.sharedSidebarBound) {
      targets.toggle.dataset.sharedSidebarBound = '1';
      targets.toggle.addEventListener('click', function(event){ event.stopImmediatePropagation(); toggleSidebarShared(event); }, true);
    }
    if (targets.brand && !targets.brand.dataset.sharedSidebarBound) {
      targets.brand.dataset.sharedSidebarBound = '1';
      targets.brand.addEventListener('click', function(event){ event.stopImmediatePropagation(); toggleSidebarShared(event); }, true);
      targets.brand.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') toggleSidebarShared(event);
      });
    }
  }

  ready(function () {
    ensurePrincipalMenuConsistency();
    applyCollapsedState(readCollapsedState());
    bindSidebarTriggers();
    syncActiveLink();
    window.addEventListener('hashchange', syncActiveLink);
  });
})();
