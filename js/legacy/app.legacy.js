// ── Orden de Prestaciones ─────────────────────────────────
// (Drag & Drop e initDrag definidos más abajo en el bloque dedicado)

/* ── Mover ítem arriba/abajo ── */
function moverOrden(btn, dir) {
  const card = btn.closest(".card-item");
  if (!card) return;
  if (dir === "up" && card.previousElementSibling) {
    card.parentNode.insertBefore(card, card.previousElementSibling);
  } else if (dir === "down" && card.nextElementSibling) {
    card.parentNode.insertBefore(card.nextElementSibling, card);
  }
}

/* ── Añadir Prestación Automática al final ── */
function appendNuevaPrestacion() {
  const cod = document.getElementById("pCod")
    ? document.getElementById("pCod").value || "PR-NUEVO"
    : "PR-NUEVO";
  const desc = document.getElementById("pDesc")
    ? document.getElementById("pDesc").value || "Nueva Prestación"
    : "Nueva Prestación";
  const activo = document.getElementById("pEstado")
    ? document.getElementById("pEstado").value === "activo"
    : true;
  const statusHTML = activo
    ? '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25" style="padding: 3px 6px; font-size: 0.7rem; font-weight: 500;">Activo</span>'
    : '<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25" style="padding: 3px 6px; font-size: 0.7rem; font-weight: 500;">Inactivo</span>';

  const isComplementario =
    document.getElementById("pTipoExamen") &&
    document.getElementById("pTipoExamen").value === "complementario";
  const listaId = isComplementario ? "lista-complementario" : "lista-sepo";
  const lista = document.getElementById(listaId);
  if (!lista) return;

  const totalItems = lista.querySelectorAll(".card-item").length;
  const card = document.createElement("div");
  const bgStyle = isComplementario
    ? "background: #ffedd5; color: #c2410c;"
    : "background: #e0f2fe; color: var(--primary);";
  const iconClass = isComplementario
    ? "fas fa-helmet-safety"
    : "fas fa-heart-pulse";

  card.className = "card-item p-2 d-flex align-items-center shadow-sm mb-2";
  card.style.cssText =
    "gap: 1rem; border-radius: 8px; border: 1px solid var(--border-light); background: #fff;";
  card.innerHTML = `
    <div class="d-flex align-items-center gap-3 w-100 p-2">
      <div class="icon-box" style="background: #e3f2fd; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 50%; flex-shrink: 0;">
        <i class="fas fa-file-medical text-primary" style="font-size: 1.2rem;"></i>
      </div>
      <div class="d-flex flex-column align-items-start gap-1 flex-shrink-0" style="width: 120px;">
        <label class="fw-bold text-muted mb-0" style="font-size: 0.65rem; letter-spacing: 0.8px;">ORDEN</label>
        <div style="width: 120px; height: 60px; background: #fff; border: 2px solid var(--primary); border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(21, 101, 192, 0.1);">
            <input type="number" class="form-control form-control-sm fw-bold text-primary border-0 bg-transparent p-0 text-center" onchange="reordenarPrestacion(this)" value="${totalItems + 1}" min="1" style="width: 100px; font-size: 1.25rem;">
        </div>
      </div>
      <div class="flex-grow-1 d-flex flex-column" style="min-width: 0;">
        <span class="fw-semibold text-dark" style="font-size: 1.1rem; line-height: 1.2;">${desc}</span>
        <div class="d-flex align-items-center gap-2 mt-1">
            <span class="text-muted fw-medium" style="font-size: 0.85rem;">${cod}</span>
            ${statusHTML}
        </div>
      </div>
    </div>`;

  lista.appendChild(card);
  if (typeof initDrag === "function") initDrag(card);
}

/* ── Modal: Añadir Prestación al Orden ── */
let _grupoOrdenActivo = "principal";

function abrirAddPrestOrden(grupo) {
  _grupoOrdenActivo = grupo;
  const lbl = document.getElementById("lblGrupoOrden");
  if (lbl)
    lbl.textContent =
      grupo === "principal"
        ? "Añadiendo a: Examen Principal"
        : "Añadiendo a: Exámenes Complementarios";
  const inp = document.getElementById("inputBuscadorPrestOrden");
  if (inp) inp.value = "";
  // Mostrar todos los items del listado
  document
    .querySelectorAll("#listaPrestOrden .item-row")
    .forEach((r) => (r.style.display = ""));
}

function filtrarListaPrestOrden(query) {
  const q = query.toLowerCase();
  document.querySelectorAll("#listaPrestOrden .item-row").forEach((row) => {
    const txt = row.textContent.toLowerCase();
    row.style.display = txt.includes(q) ? "" : "none";
  });
}

function confirmarAddPrestOrden(cod, nombre) {
  const lista = document.getElementById(
    _grupoOrdenActivo === "principal" ? "lista-sepo" : "lista-complementario",
  );
  if (!lista) return;
  const icoBg = _grupoOrdenActivo === "principal" ? "#e0f2fe" : "#ffedd5";
  const icoCol =
    _grupoOrdenActivo === "principal" ? "var(--primary)" : "#c2410c";
  const icoClass =
    _grupoOrdenActivo === "principal" ? "fa-heart-pulse" : "fa-helmet-safety";
  const tarjeta = document.createElement("div");
  tarjeta.className = "card-item";
  initDrag(tarjeta);
  tarjeta.innerHTML = `
    <div class="d-flex align-items-center gap-3 w-100 p-2">
      <div class="icon-box" style="background: #e3f2fd; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 50%; flex-shrink: 0;">
        <i class="fas fa-file-medical text-primary" style="font-size: 1.2rem;"></i>
      </div>
      <div class="flex-grow-1 d-flex flex-column" style="min-width: 0;">
        <span class="fw-semibold text-dark" style="font-size: 1.1rem; line-height: 1.2;">${nombre}</span>
        <div class="d-flex align-items-center gap-2 mt-1">
            <span class="text-muted fw-medium" style="font-size: 0.85rem;">${cod}</span>
            <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-10" style="font-size: 0.7rem;">Activo</span>
        </div>
        <div class="mt-2">
             <button class="btn btn-sm btn-outline-primary" style="font-size:0.75rem; padding: 2px 8px; border-radius: 4px;"
               data-bs-toggle="modal" data-bs-target="#modalOrdenPruebas"
               onclick="abrirOrdenPruebas('${cod}', false)">
               <i class="fas fa-sort me-1"></i>Orden de Pruebas
             </button>
        </div>
      </div>
      <div class="d-flex flex-column align-items-start gap-1 flex-shrink-0" style="width: 120px;">
        <label class="fw-bold text-muted mb-0" style="font-size: 0.65rem; letter-spacing: 0.8px;">ORDEN</label>
        <div style="width: 120px; height: 60px; background: #fff; border: 2px solid var(--primary); border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(21, 101, 192, 0.1);">
            <input type="number" class="form-control form-control-sm fw-bold text-primary border-0 bg-transparent p-0 text-center" onchange="reordenarPrestacion(this)" value="${lista.querySelectorAll(".card-item").length + 1}" min="1" style="width: 100px; font-size: 1.25rem;">
        </div>
      </div>
    </div>`;
  lista.appendChild(tarjeta);
  // Cerrar modal
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("modalAddPrestOrden"),
  );
  if (modal) modal.hide();
  showToast("✅ Prestación añadida al orden correctamente.");
}

/* ── Modal: Orden de Pruebas ── */
const _pruebasPorGrupo = {
  "GO-001": {
    nombre: "Profesionales",
    clasificaciones: {
      "Exámenes Clínicos": [
        { cod: "MED-CLIN-001", nom: "Evaluación Médica Ocupacional Anual" },
        { cod: "MED-CLIN-002", nom: "Examen Físico Completo" },
        { cod: "MED-OFT-001", nom: "Evaluación Agudeza Visual" },
        { cod: "MED-OFT-002", nom: "Test de Visión de Colores (Ishihara)" },
        { cod: "MED-AUD-001", nom: "Audiometría de Tamizaje" },
        { cod: "PR-CLIN-101", nom: "Triaje y Signos Vitales" },
        { cod: "PR-CLIN-102", nom: "Evaluación Médico Ocupacional" },
        { cod: "PR-CLIN-103", nom: "Examen Físico Segmentario" },
        { cod: "PR-ODON-104", nom: "Odontoscopía Básica" },
      ],
      "Pruebas Psicológicas": [
        { cod: "PSI-ANS-001", nom: "Escala de Ansiedad de Beck" },
        { cod: "PSI-EST-001", nom: "Cuestionario de Estrés Laboral" },
        {
          cod: "PSI-COG-001",
          nom: "Test de Atención y Concentración (Toulouse)",
        },
        { cod: "PSI-INT-001", nom: "Test de Inteligencia Emocional" },
        { cod: "PSI-PER-001", nom: "Inventario de Personalidad (NEO-PI)" },
        { cod: "PSI-BUR-001", nom: "Inventario de Burnout de Maslach" },
        { cod: "PR-PSI-108", nom: "Evaluación de Personalidad 16PF" },
        { cod: "PR-PSI-109", nom: "Test de Inteligencia (Raven)" },
        { cod: "PR-PSI-110", nom: "Escala de Depresión (Zung)" },
      ],
      "Exámenes Complementarios": [
        { cod: "COMP-LAB-001", nom: "Hemograma Completo" },
        { cod: "COMP-LAB-002", nom: "Perfil Lipídico" },
        { cod: "COMP-LAB-003", nom: "Examen Completo de Orina" },
        { cod: "COMP-LAB-004", nom: "Glucosa en Ayunas" },
        { cod: "COMP-CARD-001", nom: "Electrocardiograma en Reposo" },
        { cod: "CP-LAB-201", nom: "Hemograma Automatizado" },
        { cod: "CP-LAB-202", nom: "Perfil Bioquímico (12 parámetros)" },
        { cod: "CP-LAB-203", nom: "Prueba de VIH (Elisa)" },
        { cod: "CP-LAB-204", nom: "Marcadores Tumorales" },
      ],
    },
  },
  "GO-002": {
    nombre: "Administrativos",
    clasificaciones: {
      "Exámenes Clínicos, Odontológicos y Especializados": [
        { cod: "MED-CLIN-001", nom: "Evaluación Médica Ocupacional Anual" },
        { cod: "MED-OSTE-001", nom: "Evaluación Músculo Esquelética" },
        { cod: "MED-AUD-002", nom: "Audiometría Clínica" },
        { cod: "MED-OFT-001", nom: "Evaluación Agudeza Visual" },
        { cod: "MED-ODO-001", nom: "Odontograma Anual" },
        { cod: "PR-OFT-105", nom: "Refracción Computarizada" },
        { cod: "PR-OFT-106", nom: "Tonometría Ocular" },
        { cod: "PR-AUD-107", nom: "Audiometría Ocupacional" },
      ],
      "Pruebas Psicológicas": [
        { cod: "PSI-ALT-003", nom: "Evaluación Psicológica – Altura" },
        { cod: "PSI-FAT-001", nom: "Test de Fatiga y Somnolencia" },
        { cod: "PSI-MOT-001", nom: "Test de Coordinación Visomotriz" },
        { cod: "PR-PSI-111", nom: "Test de Wartegg" },
        { cod: "PR-PSI-112", nom: "Test de la Figura Humana" },
        { cod: "PR-PSI-113", nom: "Inventario de Intereses Vocationales" },
        { cod: "PR-PSI-114", nom: "Test de Habilidades Cognitivas" },
      ],
      "Laboratorio e Imágenes": [
        { cod: "COMP-LAB-001", nom: "Hemograma Completo" },
        { cod: "COMP-RAY-001", nom: "Radiografía de Tórax (OIT)" },
        { cod: "COMP-RESP-003", nom: "Espirometría Forzada (CVF)" },
        { cod: "CP-LAB-205", nom: "Perfil Tiroideo (TSH, T4)" },
        { cod: "CP-LAB-206", nom: "Examen de Heces (Coproparasitológico)" },
        { cod: "CP-LAB-207", nom: "Baciloscopía (BK en esputo)" },
        { cod: "CP-IMG-211", nom: "Radiografía de Tórax PA" },
        { cod: "CP-IMG-212", nom: "Radiografía de Columna Cervical" },
      ],
    },
  },
  "GO-003": {
    nombre: "Técnicos",
    clasificaciones: {
      "Pruebas Psicológicas": [
        { cod: "PSI-CHI-004", nom: "Entrevista Psicológica Chinalco" },
        { cod: "PSI-VIG-001", nom: "Test de Vigilancia Psicomotora" },
        { cod: "PR-PSI-115", nom: "Evaluación de Liderazgo" },
        { cod: "PR-PSI-116", nom: "Test de Estilo de Trabajo" },
        { cod: "PR-PSI-109", nom: "Test de Inteligencia (Raven)" },
      ],
      "Exámenes Médicos Generales": [
        { cod: "MED-CLIN-001", nom: "Evaluación Médica Ocupacional Anual" },
        { cod: "MED-DERM-001", nom: "Examen Dermatológico" },
        { cod: "PR-CLIN-117", nom: "Espirometría Basal" },
        { cod: "PR-CLIN-118", nom: "Electrocardiograma de Control" },
        { cod: "PR-CLIN-119", nom: "Evaluación Nutricional" },
        { cod: "PR-CLIN-120", nom: "Consulta Médica Especializada" },
      ],
      "Exámenes Complementarios Especiales": [
        { cod: "COMP-LAB-008", nom: "Examen Toxicológico (Drogas)" },
        { cod: "COMP-LAB-009", nom: "Prueba de Alcohol en Aliento" },
        { cod: "CP-LAB-208", nom: "Prueba de Embarazo (HCG)" },
        { cod: "CP-LAB-209", nom: "Dosaje de Alcohol Étilico" },
        { cod: "CP-LAB-210", nom: "Panel de Drogas (6 sustancias)" },
        { cod: "CP-IMG-213", nom: "Ecografía de Partes Blandas" },
        { cod: "CP-IMG-214", nom: "Ecografía Renal y de Vías Urinarias" },
        { cod: "CP-IMG-215", nom: "Tomografía Axial Computarizada (TAC)" },
        { cod: "CP-CARD-216", nom: "Holter de Arritmia (24h)" },
        { cod: "CP-CARD-217", nom: "Mapa de Presión Arterial" },
        { cod: "CP-RESP-218", nom: "Prueba de Función Pulmonar Completa" },
        { cod: "CP-NEU-219", nom: "Electroencefalograma Digital" },
        { cod: "CP-NEU-220", nom: "Electromiografía de Miembros Inferiores" },
      ],
    },
  },
};

function abrirOrdenPruebas(codPrest, depGrupo) {
  sepoToggleHistorialModalButton("btnHistorialOrden", "Orden de Prestaciones", true);
  // Actualizar título del modal
  const titulo = document.getElementById("tOrdenPruebas");
  if (titulo) {
    titulo.innerHTML = codPrest
      ? '<i class="fas fa-sort me-2 text-primary"></i>Orden de Pruebas — ' +
        codPrest
      : '<i class="fas fa-sort me-2 text-primary"></i>Orden de Pruebas';
  }

  const sel = document.getElementById("selectGrupoOrden");
  if (sel) sel.value = "";
  cargarPruebasOrden();
}

function cargarPruebasOrden() {
  const select = document.getElementById("selectGrupoOrden");
  const grupoValue = select?.value;
  const contenedor = document.getElementById("contenedorPruebasOrden");
  if (!contenedor) return;

  let dataGruposToRender = [];
  if (!grupoValue || !_pruebasPorGrupo[grupoValue]) {
    // Si no hay filtro, tomamos todos los grupos disponibles
    dataGruposToRender = Object.keys(_pruebasPorGrupo).map((key) => ({
      id: key,
      ..._pruebasPorGrupo[key],
    }));
  } else {
    // Si hay filtro, solo ese grupo
    dataGruposToRender = [
      {
        id: grupoValue,
        ..._pruebasPorGrupo[grupoValue],
      },
    ];
  }

  if (dataGruposToRender.length === 0) {
    contenedor.innerHTML =
      '<div class="text-center text-muted p-4">No hay grupos ni pruebas disponibles para mostrar.</div>';
    return;
  }

  // Helper template
  const getCardHTML = (p, index) => `
                <div class="card-item item-row p-3 border rounded shadow-sm bg-white d-flex flex-column" style="margin-bottom: 12px;">
                    <div class="d-flex align-items-center gap-3 w-100">
                        <div class="icon-box" style="background: #f8fafc; border: 1px solid var(--border-light); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0;">
                            <i class="fas fa-file-medical-alt text-primary opacity-75" style="font-size: 1.25rem;"></i>
                        </div>
                        <div class="d-flex flex-column align-items-start gap-1 flex-shrink-0" style="width: 120px;">
                            <span style="font-size: 0.65rem; font-weight: 700; color: var(--text-main); letter-spacing: 0.5px;">ORDEN</span>
                            <input type="number" class="form-control text-center fw-bold text-primary border-primary shadow-sm" onchange="reordenarPrestacion(this)" value="${index + 1}" min="1" style="width: 120px; height: 44px; border-radius: 10px; font-size: 1.1rem; background-color: #fff;">
                        </div>
                        <div class="flex-grow-1 d-flex flex-column" style="min-width: 0;">
                            <span style="font-size: 1.1rem; font-weight: 700; color: var(--primary, #2563eb); line-height: 1.35; display: block;">${p.nom || p.descripcion || "Prestación sin nombre"}</span>
                            <small class="text-muted fw-medium mt-1" style="font-size: 0.78rem;">${p.cod}</small>
                        </div>
                    </div>
                </div>`;

  let html = '<div class="accordion" id="accordionPruebasOrden">';
  const colors = ["primary", "success", "warning", "info", "danger"];
  let accordionIdx = 0;

  dataGruposToRender.forEach((dataGrupo) => {
    const nombreGrupo = dataGrupo.nombre;
    const clasificaciones = dataGrupo.clasificaciones;
    const clasifNames = Object.keys(clasificaciones);

    clasifNames.forEach((clasifName) => {
      const color = colors[accordionIdx % colors.length];
      const pruebas = clasificaciones[clasifName];
      const collapseId = `collapse-pruebas-${accordionIdx}`;
      const headingId = `heading-pruebas-${accordionIdx}`;

      html += `
              <div class="accordion-item mb-3 border-0 shadow-sm" style="border-radius: 12px; overflow: hidden;">
                <h2 class="accordion-header" id="${headingId}">
                  <button class="accordion-button collapsed bg-light fw-bold py-3 border-start border-${color} border-4" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
                    <i class="fas fa-layer-group me-2 text-${color}"></i>Grupo: ${nombreGrupo} (${clasifName})
                    <span class="badge bg-${color} rounded-pill ms-auto me-2">${pruebas.length}</span>
                  </button>
                </h2>
                <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headingId}">
                  <div class="accordion-body p-3 bg-white">
                    <div class="lista-ordenable" style="min-height: 60px; border-left: 4px solid var(--bs-${color}, var(--${color}, #2563eb)); padding-left: 8px;">
                      ${pruebas.map((p, i) => getCardHTML(p, i)).join("")}
                    </div>
                  </div>
                </div>
              </div>
            `;
      accordionIdx++;
    });
  });

  html += "</div>";
  contenedor.innerHTML = html;

  if (typeof initDrag === "function") {
    contenedor.querySelectorAll(".card-item").forEach(initDrag);
  }
}

// Inicializar drag & drop en los card-item dinámicos
document.addEventListener("DOMContentLoaded", function () {
  const contenedor = document.getElementById("contenedorPruebasOrden");
  if (contenedor && typeof initDrag === "function") {
    contenedor.querySelectorAll(".card-item").forEach(initDrag);
  }
});

/* ── TOASTS ── */
function showToast(msg) {
  const toastEl = document.getElementById("statusToast");
  document.getElementById("toastMsg").textContent = msg;
  const toast = new bootstrap.Toast(toastEl, { delay: 2500 });
  toast.show();
}

/* ── NAVEGACIÓN ── */
const SCREENS = [
  "bienvenida",
  "centros",
  "grado",
  "ocupaciones",
  "grupos",
  "prestaciones",
  "fichas",
  "dashboard",
  "pruebas",
  "prueba-form",
  "orden",
];
function go(id) {
  SCREENS.forEach((s) => {
    document.getElementById("screen-" + s)?.classList.remove("active");
    document.getElementById("nav-" + s)?.classList.remove("active");
  });
  document.getElementById("screen-" + id)?.classList.add("active");
  document.getElementById("nav-" + id)?.classList.add("active");
  return false;
}

/* ── ELIMINAR (SOLO SIMULACIÓN) ── */
function eliminarRegistro(btn, cardClass) {
  confirmarEliminar(
    "¿Eliminar registro?",
    "Esta acción no se puede deshacer.",
    () => {
      const card = btn.closest("." + cardClass);
      card.style.transition = "all 0.3s ease";
      card.style.opacity = "0";
      card.style.transform = "translateX(30px)";
      setTimeout(() => card.remove(), 300);
    },
  );
}

/* ── AUTOCOMPLETE ── */
const FICHAS_DB = [
  { codigo: "CPS-001", descripcion: "Escala de Ansiedad" },
  { codigo: "CPS-002", descripcion: "Escala de Depresión" },
  { codigo: "CPS-003", descripcion: "Competencias Laborales - Módulo 1" },
  { codigo: "CPS-004", descripcion: "Escala de Estrés Laboral" },
  { codigo: "CPS-005", descripcion: "Inventario de Personalidad" },
  { codigo: "CPS-010", descripcion: "Entrevista Psicológica - Básica" },
  { codigo: "CPSG-001", descripcion: "Competencias Laborales (Grupo)" },
  { codigo: "CPSG-002", descripcion: "Evaluación de Liderazgo (Grupo)" },
];
function autocompleteFicha(sourceId, targetId, isCodeSource) {
  const sourceInput = document.getElementById(sourceId);
  const targetInput = document.getElementById(targetId);
  const val = sourceInput.value.trim().toLowerCase();

  if (!val) {
    targetInput.value = "";
    targetInput.style.color = "";
    targetInput.style.fontWeight = "normal";
    return;
  }

  const encontrada = FICHAS_DB.find(
    (f) =>
      f.codigo.toLowerCase().includes(val) ||
      f.descripcion.toLowerCase().includes(val),
  );

  if (encontrada) {
    if (isCodeSource) {
      targetInput.value = encontrada.descripcion;
    } else {
      targetInput.value = encontrada.codigo;
    }
    targetInput.style.color = "var(--primary)";
    targetInput.style.fontWeight = "bold";
  } else {
    targetInput.value = "";
    targetInput.style.color = "";
    targetInput.style.fontWeight = "normal";
  }
}
document.addEventListener("input", (e) => {
  if (e.target?.id === "sfCod") autocompleteFicha("sfCod", "sfDes", true);
  if (e.target?.id === "sfDes") autocompleteFicha("sfDes", "sfCod", false);
});

/* ── HELPERS ── */
function pushItem(boxId, emptyId, html) {
  const box = document.getElementById(boxId);
  if (!box) return;
  document.getElementById(emptyId)?.remove();
  const d = document.createElement("div");
  d.innerHTML = html;
  box.appendChild(d.firstElementChild);
}
function resetBox(boxId, emptyId, icon, msg) {
  const box = document.getElementById(boxId);
  if (box)
    box.innerHTML = `<div class="text-center text-muted py-4 small" id="${emptyId}"><i class="${icon} fa-3x mb-3 opacity-25"></i><br>${msg}</div>`;
}

/* ── CENTROS ── */
function nuevoCentro() {
  sepoToggleHistorialModalButton("btnHistorialCentro", "Centros Médicos", false);
  document.getElementById("tCentro").innerHTML =
    '<i class="fas fa-hospital me-2 text-primary"></i>Nuevo Centro Médico';
  ["cCod", "cDesc", "cDir", "cResponsable"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  document.getElementById("cCod").disabled = false;
  document.getElementById("cActivo").checked = true;
  document.getElementById("cVirtual").checked = false;

  const modalCentro = document.getElementById("modalCentro");
  if (modalCentro) {
    delete modalCentro.dataset.dep;
    delete modalCentro.dataset.prov;
    delete modalCentro.dataset.dist;
    delete modalCentro.dataset.responsable;
  }

  window.CentroMedicoSearchbox?.preselectResponsable('');

  if (typeof inicializarModalCentro === "function") {
    inicializarModalCentro();
  }
}
function editarCentro(cod, activo, virtual) {
  sepoToggleHistorialModalButton("btnHistorialCentro", "Centros Médicos", true);
  document.getElementById("tCentro").innerHTML =
    '<i class="fas fa-pen me-2 text-primary"></i>Editar: ' + cod;
  document.getElementById("cCod").value = cod;
  document.getElementById("cCod").disabled = true;
  document.getElementById("cActivo").checked = !!activo;
  document.getElementById("cVirtual").checked = !!virtual;

  const cards = document.querySelectorAll("#screen-centros .card-item");
  const card = Array.from(cards).find((item) => {
    const codeEl = item.querySelector("strong");
    return codeEl && codeEl.textContent.trim() === cod;
  });

  let desc = "";
  let dir = "";
  let dep = "";
  let prov = "";
  let dist = "";
  let responsable = "";

  const responsablesPorCentro = {
    "CM-001": "johanna-perez",
    "CM-002": "luis-chavez",
    "CM-003": "maria-paredes",
    "CM-004": "carlos-ruiz",
    "CM-005": "ana-torres",
  };
  responsable = responsablesPorCentro[cod] || '';

  if (card) {
    const descEl = card.querySelector(".fw-semibold");
    const infoEl = card.querySelector("small.text-muted");
    desc = descEl ? descEl.textContent.trim() : "";

    const infoText = infoEl
      ? infoEl.textContent.replace(/\s+/g, " ").trim()
      : "";
    const cleanedInfo = infoText.replace(/^📍\s*/, "");
    const match = cleanedInfo.match(
      /^(.*?),\s*([^·]+?)\s*·\s*\(([^\/]+)\s*\/\s*([^\)]+)\)$/,
    );

    if (match) {
      dir = match[1].trim();
      dist = match[2].trim();
      dep = match[3].trim();
      prov = match[4].trim();
    } else {
      dir = cleanedInfo;
    }
  }

  document.getElementById("cDesc").value = desc;
  document.getElementById("cDir").value = dir;

  const modalCentro = document.getElementById("modalCentro");
  if (modalCentro) {
    if (dep) {
      modalCentro.dataset.dep = dep;
      modalCentro.dataset.prov = prov;
      modalCentro.dataset.dist = dist;
    } else {
      delete modalCentro.dataset.dep;
      delete modalCentro.dataset.prov;
      delete modalCentro.dataset.dist;
    }

    if (responsable) {
      modalCentro.dataset.responsable = responsable;
    } else {
      delete modalCentro.dataset.responsable;
    }
  }

  const responsableSelect = document.getElementById('cResponsable');
  if (responsableSelect) {
    responsableSelect.value = responsable;
  }
  window.CentroMedicoSearchbox?.preselectResponsable(responsable);
}

/* ── SIMPLE ── */

function sepoToggleHistorialModalButton(buttonId, modulo, visible) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  btn.style.display = visible ? "inline-flex" : "none";
  if (visible && modulo) {
    btn.onclick = function () {
      verHistorial(modulo);
    };
  }
}

function sepoInferModuloSimple(cod, tipo) {
  if (tipo === "Ocupación") return "Ocupaciones";
  if (tipo === "Grupo Ocupacional") return "Grupos Ocupacionales";
  if (tipo === "Grado de Instrucción") return "Grado de Instrucción";
  if (typeof cod === "string") {
    if (cod.indexOf("GI-") === 0) return "Grado de Instrucción";
    if (cod.indexOf("OC-") === 0) return "Ocupaciones";
    if (cod.indexOf("GO-") === 0) return "Grupos Ocupacionales";
  }
  return null;
}

function nuevoSimple(tipo) {
  const inferredTipo = tipo || "Registro";
  if (
    inferredTipo === "Grado de Instrucción" &&
    typeof window.openGradoModal === "function"
  ) {
    window.openGradoModal();
    return;
  }
  if (
    inferredTipo === "Ocupación" &&
    typeof window.openOcupacionModal === "function"
  ) {
    window.openOcupacionModal();
    return;
  }
  if (
    inferredTipo === "Grupo Ocupacional" &&
    typeof window.openGrupoOcupacionalModal === "function"
  ) {
    window.openGrupoOcupacionalModal();
    return;
  }

  sepoToggleHistorialModalButton("btnHistorialSimple", null, false);
  const moduloName =
    inferredTipo === "Ocupación"
      ? "Ocupaciones"
      : inferredTipo === "Grupo Ocupacional"
        ? "Grupos"
        : inferredTipo;
  document.getElementById("tSimple").innerHTML =
    '<i class="fas fa-plus me-2 text-primary"></i>Nuevo ' + inferredTipo;
  document.getElementById("sCod").value = "";
  document.getElementById("sCod").disabled = false;
  document.getElementById("sDesc").value = "";
  const sActivo = document.getElementById("sActivo");
  if (sActivo) sActivo.checked = true;

  const btnSave = document.getElementById("btnSaveSimple");
  if (btnSave) {
    btnSave.onclick = () => {
      confirmarGuardar(moduloName, () => {
        bootstrap.Modal.getInstance(
          document.getElementById("modalSimple"),
        ).hide();
        showToast("Cambios guardados correctamente");
      });
    };
  }
}
function editarSimple(cod, desc, tipo = "Registro") {
  const inferredTipo = sepoInferModuloSimple(cod, tipo) || tipo || "Registro";
  if (
    inferredTipo === "Grado de Instrucción" &&
    typeof window.openGradoModal === "function"
  ) {
    window.openGradoModal(cod, desc);
    return;
  }
  if (
    inferredTipo === "Ocupación" &&
    typeof window.openOcupacionModal === "function"
  ) {
    window.openOcupacionModal(cod, desc);
    return;
  }
  if (
    inferredTipo === "Grupo Ocupacional" &&
    typeof window.openGrupoOcupacionalModal === "function"
  ) {
    window.openGrupoOcupacionalModal(cod, desc);
    return;
  }

  sepoToggleHistorialModalButton(
    "btnHistorialSimple",
    inferredTipo,
    true,
  );
  const moduloName =
    tipo === "Ocupación"
      ? "Ocupaciones"
      : tipo === "Grupo Ocupacional"
        ? "Grupos"
        : tipo;
  document.getElementById("tSimple").innerHTML =
    '<i class="fas fa-pen me-2 text-primary"></i>Editar ' +
    (tipo || "Registro");
  document.getElementById("sCod").value = cod;
  document.getElementById("sCod").disabled = true;
  document.getElementById("sDesc").value = desc;

  const btnSave = document.getElementById("btnSaveSimple");
  if (btnSave) {
    btnSave.onclick = () => {
      confirmarGuardar(moduloName, () => {
        bootstrap.Modal.getInstance(
          document.getElementById("modalSimple"),
        ).hide();
        showToast("Cambios guardados correctamente");
      });
    };
  }
}

/* ── PRESTACIONES ── */
function nuevaPrestacion() {
  sepoToggleHistorialModalButton("btnHistorialPrestacion", "Prestaciones", false);
  document.getElementById("tPrest").innerHTML =
    '<i class="fas fa-stethoscope me-2 text-primary"></i>Nueva Prestación';
  ["pCod", "pDesc"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const pCod = document.getElementById("pCod");
  const pDesc = document.getElementById("pDesc");
  const pEstado = document.getElementById("pEstado");
  const pTipoExamen = document.getElementById("pTipoExamen");
  if (pCod) pCod.disabled = false;
  if (pDesc) pDesc.disabled = false;
  if (pEstado) {
    pEstado.disabled = false;
    pEstado.value = "activo";
  }
  if (pTipoExamen) {
    pTipoExamen.disabled = false;
    pTipoExamen.value = "emo";
  }
  const listaFichasPrestacion = document.getElementById(
    "listaFichasPrestacion",
  );
  if (listaFichasPrestacion) listaFichasPrestacion.innerHTML = "";

  const btnSave = document.getElementById("btnSavePrest");
  if (btnSave) {
    btnSave.onclick = () => {
      confirmarGuardar("Prestaciones", () => {
        bootstrap.Modal.getInstance(
          document.getElementById("modalPrestacion"),
        ).hide();
        showToast("Cambios guardados correctamente");
      });
    };
  }
}
function editarPrestacion(cod) {
  sepoToggleHistorialModalButton("btnHistorialPrestacion", "Prestaciones", true);
  document.getElementById("tPrest").innerHTML =
    '<i class="fas fa-pen me-2 text-primary"></i>Editar Prestación: <strong>' +
    cod +
    "</strong>";

  // Datos de todas las prestaciones del módulo
  const DATOS_PRESTACIONES = {
    "PR-MED-010": {
      desc: "Examen Médico Pre-ocupacional (EMO)",
      tipoExamen: "emo",
      estado: "activo",
    },
    "PR-LAB-015": {
      desc: "Perfil Lipídico y Glucosa",
      tipoExamen: "complementario",
      estado: "activo",
    },
    "PR-AUD-020": {
      desc: "Audiometría de Tamizaje",
      tipoExamen: "complementario",
      estado: "activo",
    },
    "PR-RAD-050": {
      desc: "Radiografía de Tórax (OIT)",
      tipoExamen: "complementario",
      estado: "activo",
    },
    "PR-PSI-001": {
      desc: "Evaluación Psicológica – Entrevista",
      tipoExamen: "emo",
      estado: "activo",
    },
    "PR-PSI-004": {
      desc: "Test 16PF – Personalidad",
      tipoExamen: "complementario",
      estado: "activo",
    },
    "PR-PSI-005": {
      desc: "Evaluación de Liderazgo",
      tipoExamen: "complementario",
      estado: "activo",
    },
    "PR-PSI-006": {
      desc: "Escala de Inteligencia WAIS-IV",
      tipoExamen: "complementario",
      estado: "activo",
    },
    "PR-PSI-007": {
      desc: "Inventario de Burnout (MBI)",
      tipoExamen: "complementario",
      estado: "activo",
    },
    "PR-PSI-008": {
      desc: "Test de Trabajo en Equipo (TWA)",
      tipoExamen: "complementario",
      estado: "activo",
    },
    "PR-ALT-002": {
      desc: "Psicología Ocupacional – Altura",
      tipoExamen: "complementario",
      estado: "activo",
    },
    "PR-ALT-005": {
      desc: "Evaluación de Aptitud en Altura",
      tipoExamen: "emo",
      estado: "activo",
    },
    "PR-MED-001": {
      desc: "Evaluación Médica General",
      tipoExamen: "emo",
      estado: "activo",
    },
    "PR-LAB-001": {
      desc: "Laboratorio Clínico Básico",
      tipoExamen: "complementario",
      estado: "activo",
    },
    "PR-IMG-001": {
      desc: "Imagenología Diagnóstica",
      tipoExamen: "complementario",
      estado: "activo",
    },
  };

  const datos = DATOS_PRESTACIONES[cod] || {
    desc: "Prestación ocupacional – " + cod,
    tipoExamen: "complementario",
    estado: "activo",
  };

  const pCod = document.getElementById("pCod");
  const pDesc = document.getElementById("pDesc");
  const pEstado = document.getElementById("pEstado");
  const pTipoExamen = document.getElementById("pTipoExamen");

  // Código: readonly (identificador), el resto editable
  if (pCod) {
    pCod.value = cod;
    pCod.disabled = true;
  }
  if (pDesc) {
    pDesc.value = datos.desc;
    pDesc.disabled = false;
  }
  if (pEstado) {
    pEstado.value = datos.estado;
    pEstado.disabled = false;
  }
  if (pTipoExamen) {
    pTipoExamen.value = datos.tipoExamen;
    pTipoExamen.disabled = false;
  }

  renderPrestacionFichas(cod);

  const btnSave = document.getElementById("btnSavePrest");
  if (btnSave) {
    btnSave.onclick = () => {
      confirmarGuardar("Prestaciones", () => {
        bootstrap.Modal.getInstance(
          document.getElementById("modalPrestacion"),
        ).hide();
        showToast("Cambios guardados correctamente.");
      });
    };
  }
}
function addFichaPrestacion() {
  const val = document.getElementById("pfCod").value.trim();
  if (!val) {
    alert("Ingrese una búsqueda");
    return;
  }

  // Find in DB
  const f =
    typeof FICHAS_DB !== "undefined"
      ? FICHAS_DB.find(
          (x) =>
            x.codigo.toLowerCase().includes(val.toLowerCase()) ||
            x.descripcion.toLowerCase().includes(val.toLowerCase()),
        )
      : null;

  let cod = val.toUpperCase();
  let des = "—";
  if (f) {
    cod = f.codigo;
    des = f.descripcion;
  }

  pushItem("boxPF", "emptyPF", rowPF(cod, des));
  document.getElementById("pfCod").value = "";
}
function rowPF(cod, des) {
  return `<div class="item-row"><div class="inf"><span class="tag tag-fich fw-bold"><i class="fas fa-file-alt me-1 text-primary"></i>${cod}</span><span class="fw-medium">${des}</span></div><button class="btn btn-light rounded-circle text-danger p-0" style="width:32px;height:32px;" onclick="this.closest('.item-row').remove()"><i class="fas fa-times"></i></button></div>`;
}

const PRESTACION_FICHAS_DEMO = {
  "PR-PSI-001": [
    {
      codigo: "CPS-001",
      nombre: "Escala de Ansiedad",
      subtitulo:
        "Ficha psicológica para screening inicial de síntomas ansiosos.",
      codigos: [
        {
          nombre: "Nivel de estrés",
          meta: "Indicador base del estado emocional actual.",
        },
        {
          nombre: "Puntaje total",
          meta: "Resultado consolidado de la escala aplicada.",
        },
        {
          nombre: "Tiempo de respuesta",
          meta: "Duración registrada durante la aplicación.",
        },
      ],
    },
    {
      codigo: "CPS-010",
      nombre: "Entrevista Psicológica Básica",
      subtitulo:
        "Ficha complementaria para explorar antecedentes y observaciones clínicas.",
      codigos: [
        {
          nombre: "Motivo de evaluación",
          meta: "Descripción resumida del motivo principal.",
        },
        {
          nombre: "Observación conductual",
          meta: "Registro breve del comportamiento observado.",
        },
        {
          nombre: "Nivel de riesgo",
          meta: "Clasificación inicial del caso evaluado.",
        },
      ],
    },
    {
      codigo: "CPS-022",
      nombre: "Contexto Psicosocial",
      subtitulo: "Ficha de apoyo para factores del entorno y red de soporte.",
      codigos: [
        {
          nombre: "Red de apoyo",
          meta: "Clasificación del soporte social disponible.",
        },
        {
          nombre: "Factor desencadenante",
          meta: "Evento asociado al motivo de consulta.",
        },
        {
          nombre: "Prioridad de intervención",
          meta: "Nivel sugerido de acción posterior.",
        },
      ],
    },
  ],
  "PR-ALT-002": [
    {
      codigo: "CAT-011",
      nombre: "Check Altura Operativa",
      subtitulo: "Ficha de control para evaluación en trabajos en altura.",
      codigos: [
        {
          nombre: "Aptitud en altura",
          meta: "Resultado general para labor operativa.",
        },
        {
          nombre: "Uso de arnés",
          meta: "Conformidad con protocolos de seguridad.",
        },
        {
          nombre: "Nivel de atención",
          meta: "Capacidad de concentración en entorno de riesgo.",
        },
      ],
    },
    {
      codigo: "CAT-017",
      nombre: "Observación de Riesgo Vertical",
      subtitulo: "Ficha ficticia para validación de criterios preventivos.",
      codigos: [
        {
          nombre: "Tolerancia al vértigo",
          meta: "Registro ante exposición vertical.",
        },
        {
          nombre: "Cumplimiento EPP",
          meta: "Chequeo del equipo de protección personal.",
        },
        { nombre: "Respuesta motora", meta: "Desempeño psicomotor observado." },
      ],
    },
  ],
  "PR-PSI-004": [
    {
      codigo: "CPS-031",
      nombre: "Evaluación de Fatiga Mental",
      subtitulo: "Ficha para detección de sobrecarga cognitiva.",
      codigos: [
        {
          nombre: "Índice de fatiga",
          meta: "Valor resultante del cuestionario.",
        },
        {
          nombre: "Atención sostenida",
          meta: "Desempeño observado en la sesión.",
        },
        {
          nombre: "Recomendación",
          meta: "Sugerencia de intervención inicial.",
        },
      ],
    },
    {
      codigo: "CPS-038",
      nombre: "Registro de Adaptación Laboral",
      subtitulo: "Ficha ficticia sobre ajuste emocional al puesto.",
      codigos: [
        {
          nombre: "Nivel de adaptación",
          meta: "Percepción del evaluado sobre su puesto.",
        },
        {
          nombre: "Estresor principal",
          meta: "Factor más incidente reportado.",
        },
        { nombre: "Plan de seguimiento", meta: "Propuesta básica de control." },
      ],
    },
  ],
  "PR-MED-001": [
    {
      codigo: "CME-001",
      nombre: "Examen Clínico General",
      subtitulo: "Ficha clínica principal para anamnesis y revisión básica.",
      codigos: [
        {
          nombre: "Presión arterial",
          meta: "Dato vital registrado en consulta.",
        },
        { nombre: "Frecuencia cardiaca", meta: "Medición basal del paciente." },
        {
          nombre: "Observaciones médicas",
          meta: "Notas generales del profesional.",
        },
      ],
    },
    {
      codigo: "CME-009",
      nombre: "Control de Antecedentes",
      subtitulo: "Ficha de apoyo para historial médico ocupacional.",
      codigos: [
        {
          nombre: "Antecedente relevante",
          meta: "Condición previa asociada al examen.",
        },
        {
          nombre: "Restricción médica",
          meta: "Limitación reportada o detectada.",
        },
        {
          nombre: "Seguimiento sugerido",
          meta: "Acción posterior recomendada.",
        },
      ],
    },
  ],
  "PR-LAB-001": [
    {
      codigo: "CLB-003",
      nombre: "Perfil Hematológico",
      subtitulo: "Ficha de laboratorio para parámetros sanguíneos básicos.",
      codigos: [
        { nombre: "Hemoglobina", meta: "Resultado cuantitativo del análisis." },
        {
          nombre: "Hematocrito",
          meta: "Indicador relativo de volumen globular.",
        },
        {
          nombre: "Observación de muestra",
          meta: "Comentario sobre el procesamiento.",
        },
      ],
    },
    {
      codigo: "CLB-014",
      nombre: "Panel Bioquímico",
      subtitulo: "Ficha complementaria con factores metabólicos de referencia.",
      codigos: [
        { nombre: "Glucosa", meta: "Valor medido en laboratorio." },
        {
          nombre: "Colesterol total",
          meta: "Marcador general del perfil lipídico.",
        },
        {
          nombre: "Tiempo de proceso",
          meta: "Duración del análisis de muestra.",
        },
      ],
    },
  ],
  "PR-IMG-001": [
    {
      codigo: "CIM-008",
      nombre: "Ficha Radiológica Básica",
      subtitulo: "Ficha de imagen para descripción y correlato radiológico.",
      codigos: [
        { nombre: "Zona evaluada", meta: "Área anatómica consignada." },
        {
          nombre: "Hallazgo principal",
          meta: "Resultado relevante del estudio.",
        },
        { nombre: "Calidad de imagen", meta: "Evaluación técnica del examen." },
      ],
    },
    {
      codigo: "CIM-015",
      nombre: "Lectura de Soporte Diagnóstico",
      subtitulo: "Ficha complementaria para correlación con factores clínicos.",
      codigos: [
        {
          nombre: "Conclusión preliminar",
          meta: "Interpretación inicial del examen.",
        },
        {
          nombre: "Necesidad de contraste",
          meta: "Validación para procedimiento complementario.",
        },
        {
          nombre: "Prioridad de revisión",
          meta: "Nivel sugerido de atención médica.",
        },
      ],
    },
  ],
  "PR-MED-010": [
    {
      codigo: "EMO-G",
      nombre: "Ficha EMO General",
      subtitulo: "Ficha principal del Examen Médico Pre-ocupacional.",
      codigos: [
        {
          nombre: "Aptitud para el trabajo",
          meta: "Clasificación final del evaluado (apto / no apto).",
        },
        {
          nombre: "Presión arterial",
          meta: "Medición sistólica y diastólica registrada.",
        },
        {
          nombre: "IMC",
          meta: "Índice de masa corporal calculado en consulta.",
        },
      ],
    },
    {
      codigo: "EMO-ANT",
      nombre: "Antecedentes Ocupacionales",
      subtitulo: "Historial laboral y exposiciones previas del evaluado.",
      codigos: [
        {
          nombre: "Tiempo de servicio",
          meta: "Años trabajados en ocupación previa.",
        },
        {
          nombre: "Exposición a riesgo",
          meta: "Tipo de agente o riesgo identificado.",
        },
        {
          nombre: "Restricción médica",
          meta: "Limitación detectada o reportada.",
        },
      ],
    },
  ],
  "PR-LAB-015": [
    {
      codigo: "LB-02",
      nombre: "Perfil Lipídico y Glucosa",
      subtitulo: "Resultados de análisis de sangre metabólico.",
      codigos: [
        { nombre: "Triglicéridos", meta: "Valor de referencia metabólica." },
        { nombre: "Colesterol HDL", meta: "Fracción de colesterol protector." },
        {
          nombre: "Glucosa en ayunas",
          meta: "Nivel de glucosa previo a la toma.",
        },
      ],
    },
    {
      codigo: "LB-HEM",
      nombre: "Hemograma Completo",
      subtitulo: "Ficha complementaria de análisis sanguíneo completo.",
      codigos: [
        {
          nombre: "Recuento leucocitario",
          meta: "Conteo de glóbulos blancos.",
        },
        { nombre: "Plaquetas", meta: "Conteo plaquetario del paciente." },
        { nombre: "VSG", meta: "Velocidad de sedimentación globular." },
      ],
    },
  ],
  "PR-AUD-020": [
    {
      codigo: "AUD-01",
      nombre: "Audiometría de Tamizaje",
      subtitulo: "Estudio auditivo básico por frecuencias.",
      codigos: [
        {
          nombre: "Umbral 500 Hz",
          meta: "Nivel de audición en frecuencia grave.",
        },
        { nombre: "Umbral 2000 Hz", meta: "Sensibilidad en frecuencia media." },
        {
          nombre: "Umbral 4000 Hz",
          meta: "Frecuencia crítica para daño auditivo.",
        },
      ],
    },
    {
      codigo: "AUD-OB",
      nombre: "Observaciones Audiológicas",
      subtitulo: "Ficha de notas del especialista en audiología.",
      codigos: [
        {
          nombre: "Tipo de curva",
          meta: "Clasificación de la curva audiométrica.",
        },
        {
          nombre: "Exposición a ruido",
          meta: "Historial de exposición laboral al ruido.",
        },
        {
          nombre: "Recomendación EPP",
          meta: "Sugerencia de equipo de protección auditiva.",
        },
      ],
    },
  ],
  "PR-RAD-050": [
    {
      codigo: "RX-OIT",
      nombre: "Radiografía de Tórax OIT",
      subtitulo: "Lectura estándar OIT para neumoconiosis.",
      codigos: [
        {
          nombre: "Clasificación OIT",
          meta: "Categoría 0/1/2/3 según opacidades.",
        },
        {
          nombre: "Zona afectada",
          meta: "Localización del hallazgo radiológico.",
        },
        { nombre: "Recomendación posterior", meta: "Acción médica sugerida." },
      ],
    },
    {
      codigo: "RX-CLD",
      nombre: "Contexto Laboral-Diagnóstico",
      subtitulo: "Ficha de correlación clínica para el resultado radiológico.",
      codigos: [
        {
          nombre: "Exposición a polvo",
          meta: "Tiempo e intensidad de exposición laboral.",
        },
        {
          nombre: "Antecedente respiratorio",
          meta: "Condición previa relevante del evaluado.",
        },
        {
          nombre: "Criterio de vigilancia",
          meta: "Nivel de seguimiento recomendado.",
        },
      ],
    },
  ],
};

const PRESTACION_FICHAS_STATE = {};

function clonePrestacionFichaList(list) {
  return Array.isArray(list)
    ? list.map((ficha) => ({
        ...ficha,
        codigos: Array.isArray(ficha.codigos)
          ? ficha.codigos.map((codigo) => ({ ...codigo }))
          : [],
      }))
    : [];
}

function ensurePrestacionFichasState(cod) {
  if (!cod) return [];
  if (!PRESTACION_FICHAS_STATE[cod]) {
    const desc = document.getElementById("pDesc")?.value || "";
    const source = PRESTACION_FICHAS_DEMO[cod] || buildPrestacionFichasDemo(cod, desc);
    PRESTACION_FICHAS_STATE[cod] = clonePrestacionFichaList(source);
  }
  return PRESTACION_FICHAS_STATE[cod];
}

function buildPrestacionFichasDemo(cod, desc) {
  const categoria = cod.includes("PSI")
    ? "Psicológica"
    : cod.includes("MED")
      ? "Médica"
      : cod.includes("LAB")
        ? "Laboratorio"
        : cod.includes("IMG")
          ? "Imagen"
          : cod.includes("CAR")
            ? "Cardiológica"
            : cod.includes("ERG")
              ? "Ergonómica"
              : "General";
  return [
    {
      codigo: `${cod.replace("PR-", "CF-")}-A`,
      nombre: `Ficha ${categoria} Base`,
      subtitulo: `Ficha ficticia asociada a ${desc || "la prestación"}.`,
      codigos: [
        {
          nombre: `${categoria} principal`,
          meta: "Dato principal de la ficha vinculada.",
        },
        {
          nombre: `${categoria} secundario`,
          meta: "Dato complementario configurable.",
        },
        {
          nombre: "Observación operativa",
          meta: "Comentario general para validación del proceso.",
        },
      ],
    },
    {
      codigo: `${cod.replace("PR-", "CF-")}-B`,
      nombre: `Ficha ${categoria} Complementaria`,
      subtitulo: `Apoyo visual para simular múltiples fichas en ${desc || "esta prestación"}.`,
      codigos: [
        {
          nombre: "Indicador de control",
          meta: "Variable usada para seguimiento.",
        },
        {
          nombre: "Resultado asociado",
          meta: "Dato resultante de la ficha ficticia.",
        },
        {
          nombre: "Validación final",
          meta: "Campo disponible para enlace con factores.",
        },
      ],
    },
  ];
}

function getPrestacionFichas(cod) {
  return ensurePrestacionFichasState(cod);
}

function removePrestacionFicha(codPrestacion, codFicha) {
  if (!codPrestacion || !codFicha) return;
  const fichas = ensurePrestacionFichasState(codPrestacion);
  const ficha = fichas.find((item) => item.codigo === codFicha);
  const nombreFicha = ficha?.nombre || codFicha;
  const confirmed = window.confirm(
    `¿Deseas eliminar la ficha asociada "${nombreFicha}" de esta prestación?`,
  );
  if (!confirmed) return;
  PRESTACION_FICHAS_STATE[codPrestacion] = fichas.filter(
    (item) => item.codigo !== codFicha,
  );
  renderPrestacionFichas(codPrestacion);
  showToast("Ficha asociada eliminada correctamente.");
}

function renderPrestacionFichas(cod) {
  const cont = document.getElementById("listaFichasPrestacion");
  if (!cont) return;
  const fichas = getPrestacionFichas(cod);

  if (!fichas.length) {
    cont.innerHTML = `
      <div class="prest-ficha-empty-state">
        <i class="fas fa-unlink"></i>
        <span>No hay fichas asociadas actualmente para esta prestación.</span>
      </div>
    `;
    return;
  }

  cont.innerHTML = fichas
    .map(
      (ficha) => `
              <div class="prest-ficha-card">
                <div class="prest-ficha-header">
                  <div class="prest-ficha-title">
                    <span class="prest-ficha-badge"><i class="fas fa-file-medical-alt"></i></span>
                    <div>
                      <div class="d-flex align-items-center gap-2 flex-wrap">
                        <span class="tag tag-fich">${ficha.codigo}</span>
                        <span class="fw-semibold text-dark">${ficha.nombre}</span>
                      </div>
                    </div>
                  </div>
                  <div class="prest-ficha-actions">
                    <button
                      type="button"
                      class="prest-ficha-remove"
                      title="Eliminar ficha asociada"
                      aria-label="Eliminar ficha asociada ${ficha.codigo}"
                      onclick="event.stopPropagation(); removePrestacionFicha('${cod}', '${ficha.codigo}')"
                    >
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              </div>
            `,
    )
    .join("");
}

function togglePrestacionFicha(trigger) {
  const card = trigger?.closest(".prest-ficha-card");
  if (!card) return;
  card.classList.toggle("is-collapsed");
}

function toggleFactorPrestacion(input) {
  const row = input.closest(".prest-codigo-row");
  if (!row) return;
  const select = row.querySelector(".prest-factor-select");
  const label = row.querySelector(".prest-switch-label");
  const enabled = input.checked;
  if (select) select.disabled = !enabled;
  if (label) label.textContent = enabled ? "Encendido" : "Apagado";
}

/* ── FICHAS ── */
const TIPO_LABEL = {
    puntaje: "Puntaje",
    nivel: "Nivel",
    interpretacion: "Interpretación",
  },
  TIPO_CLASS = {
    puntaje: "tag-punt",
    nivel: "tag-niv",
    interpretacion: "tag-int",
  },
  TIPO_ICON = { puntaje: "📊", nivel: "🔤", interpretacion: "📝" };
function setEstadoFichaMode(mode) {
  const sel = document.getElementById("fEstado");
  if (mode === "create") {
    sel.querySelector('option[value="cesado"]')?.remove();
    sel.value = "borrador";
  } else {
    if (!sel.querySelector('option[value="cesado"]')) {
      const o = document.createElement("option");
      o.value = "cesado";
      o.textContent = "Cesado";
      sel.appendChild(o);
    }
  }
}
let fichaItemsMode = "codigo";
let fichaItemsData = [];
let fichaEditIndex = -1;

function getDefaultFichaItems() {
  return [
    { codigo: "PTJ-001", descripcion: "Puntaje Total", tipo: "Puntaje numérico", estado: "Activo" },
    { codigo: "NVL-001", descripcion: "Nivel de Riesgo", tipo: "Nivel texto", estado: "Activo" },
    { codigo: "INT-001", descripcion: "Interpretación Clínica", tipo: "Interpretación texto", estado: "Activo" },
  ];
}

function getDefaultGrupoFichaItems() {
  return [
    { codigo: "SUB-001", descripcion: "Perfil Psicosocial Base", ficha: "CPS-001", grupo: "Administrativo", estado: "Activo" },
    { codigo: "SUB-002", descripcion: "Control de Fatiga", ficha: "CPS-007", grupo: "Operativo", estado: "Activo" },
    { codigo: "SUB-003", descripcion: "Evaluación de Ingreso", ficha: "CME-010", grupo: "Conductor", estado: "Inactivo" },
  ];
}

function renderEstadoFichaBadge(est) {
  const active = est === "Activo";
  return `<span class="badge ${active ? "bg-success" : "bg-secondary"} bg-opacity-10 ${active ? "text-success" : "text-secondary"} border ${active ? "border-success" : "border-secondary"} border-opacity-25" style="font-size: 0.72rem;">${est}</span>`;
}

function toggleFichaGrupoMode(isGrupo) {
  fichaItemsMode = isGrupo ? "grupo" : "codigo";
  const title = document.getElementById("fSectionTitle");
  if (title) {
    title.innerHTML = `<i class="fas ${isGrupo ? "fa-layer-group" : "fa-tag"} me-2"></i>${isGrupo ? "Grupo de Fichas (Sub-fichas)" : "Códigos Dato de la Ficha"}`;
  }
  document.getElementById("fTipoWrap").classList.toggle("d-none", isGrupo);
  document.getElementById("fFichaWrap").classList.toggle("d-none", !isGrupo);
  document.getElementById("fGrupoOcupWrap").classList.toggle("d-none", !isGrupo);
  document.getElementById("fCdCod").placeholder = isGrupo ? "Ej: SUB-001" : "Ej: PTJ-001";
  document.getElementById("fCdDesc").placeholder = isGrupo ? "Ej: Perfil Psicosocial Base" : "Ej: Puntaje Total";
  if (!Array.isArray(fichaItemsData) || !fichaItemsData.length || (isGrupo && fichaItemsData[0].tipo) || (!isGrupo && fichaItemsData[0].ficha)) {
    fichaItemsData = isGrupo ? getDefaultGrupoFichaItems() : getDefaultFichaItems();
  }
  renderFichaItemsTable();
}

function renderFichaItemsTable() {
  const thead = document.getElementById("fItemTableHead");
  const tbody = document.getElementById("fCdTableBody");
  if (!thead || !tbody) return;

  thead.innerHTML = fichaItemsMode === "grupo"
    ? `<tr><th class="ps-3 py-2">Código</th><th class="py-2">Descripción</th><th class="py-2">Ficha</th><th class="py-2">Grupo Ocupacional</th><th class="py-2">Estado</th><th class="text-center py-2">Acciones</th></tr>`
    : `<tr><th class="ps-3 py-2">Código</th><th class="py-2">Descripción</th><th class="py-2">Tipo</th><th class="py-2">Estado</th><th class="text-center py-2">Acciones</th></tr>`;

  const tipIcons = {
    "Puntaje numérico": "fa-calculator",
    "Nivel texto": "fa-font",
    "Interpretación texto": "fa-comment-alt",
  };

  tbody.innerHTML = fichaItemsData.map((item, idx) => {
    if (fichaItemsMode === "grupo") {
      return `<tr>
        <td class="ps-3"><span class="badge bg-light text-dark border shadow-sm"><i class="fas fa-layer-group me-1 text-primary"></i> ${item.codigo}</span></td>
        <td>${item.descripcion}</td>
        <td><span class="text-muted small"><i class="fas fa-file-alt me-1"></i> ${item.ficha}</span></td>
        <td><span class="text-muted small"><i class="fas fa-users me-1"></i> ${item.grupo}</span></td>
        <td>${renderEstadoFichaBadge(item.estado)}</td>
        <td class="text-center"><button class="btn btn-link btn-sm text-primary p-0 me-2" onclick="editarFichaItem(${idx})"><i class="fas fa-pen"></i></button><button class="btn btn-link btn-sm text-danger p-0" onclick="eliminarFichaItem(${idx})"><i class="fas fa-trash"></i></button></td>
      </tr>`;
    }
    return `<tr>
      <td class="ps-3"><span class="badge bg-light text-dark border shadow-sm"><i class="fas fa-tag me-1 text-primary"></i> ${item.codigo}</span></td>
      <td>${item.descripcion}</td>
      <td><span class="text-muted small"><i class="fas ${tipIcons[item.tipo] || "fa-tag"} me-1"></i> ${item.tipo}</span></td>
      <td>${renderEstadoFichaBadge(item.estado)}</td>
      <td class="text-center"><button class="btn btn-link btn-sm text-primary p-0 me-2" onclick="editarFichaItem(${idx})"><i class="fas fa-pen"></i></button><button class="btn btn-link btn-sm text-danger p-0" onclick="eliminarFichaItem(${idx})"><i class="fas fa-trash"></i></button></td>
    </tr>`;
  }).join("");
}

function nuevaFicha() {
  sepoToggleHistorialModalButton("btnHistorialFicha", "Fichas", false);
  document.getElementById("tFicha").innerHTML = '<i class="fas fa-clipboard-list me-2 text-primary"></i>Nueva Ficha';
  document.getElementById("fCod").value = "";
  document.getElementById("fCod").disabled = false;
  document.getElementById("fDesc").disabled = false;
  document.getElementById("fEstado").disabled = false;
  document.getElementById("fDesc").value = "";
  document.getElementById("fTieneGrupo").checked = false;
  document.getElementById("fFinalizada").checked = false;
  fichaItemsData = getDefaultFichaItems();
  toggleFichaGrupoMode(false);
  setEstadoFichaMode("create");
}

function editarFicha(cod, esGrupo) {
  sepoToggleHistorialModalButton("btnHistorialFicha", "Fichas", true);
  document.getElementById("tFicha").innerHTML = '<i class="fas fa-pen me-2 text-primary"></i>Editar Ficha: ' + cod;
  document.getElementById("fCod").value = cod;
  document.getElementById("fCod").disabled = true;
  document.getElementById("fDesc").disabled = true;
  document.getElementById("fEstado").disabled = true;

  const demoDescs = {
    "CPS-001": "Escala de Ansiedad",
    "CPS-010": "Entrevista Psicológica - Básica",
    "FLB-005": "Examen de Metales Pesados",
    "FMO-004": "Ficha Médica Ocupacional",
  };
  document.getElementById("fDesc").value = demoDescs[cod] || "Ficha de Evaluación";
  document.getElementById("fEstado").value = "activo";
  document.getElementById("fTieneGrupo").checked = !!esGrupo;
  fichaItemsData = esGrupo ? getDefaultGrupoFichaItems() : getDefaultFichaItems();
  toggleFichaGrupoMode(!!esGrupo);
  setEstadoFichaMode("edit");
}

function addFichaItem() {
  const cod = document.getElementById("fCdCod").value.trim().toUpperCase();
  const des = document.getElementById("fCdDesc").value.trim();
  const est = document.getElementById("fCdEstado").value;
  if (!cod || !des) {
    showToast("⚠️ Ingrese código y descripción");
    return;
  }

  if (fichaItemsMode === "grupo") {
    fichaItemsData.push({
      codigo: cod,
      descripcion: des,
      ficha: document.getElementById("fSubFicha").value,
      grupo: document.getElementById("fGrupoOcup").value,
      estado: est,
    });
  } else {
    fichaItemsData.push({
      codigo: cod,
      descripcion: des,
      tipo: document.getElementById("fCdTipo").value,
      estado: est,
    });
  }

  document.getElementById("fCdCod").value = "";
  document.getElementById("fCdDesc").value = "";
  renderFichaItemsTable();
  showToast("Elemento añadido para la demo");
}

function addCodigoDato() {
  addFichaItem();
}

function editarFichaItem(index) {
  fichaEditIndex = index;
  const item = fichaItemsData[index];
  document.getElementById("editItemCod").value = item.codigo || "";
  document.getElementById("editItemDesc").value = item.descripcion || "";
  document.getElementById("editItemEstado").value = item.estado || "Activo";
  const isGrupo = fichaItemsMode === "grupo";
  document.getElementById("editItemTipoWrap").classList.toggle("d-none", isGrupo);
  document.getElementById("editItemFichaWrap").classList.toggle("d-none", !isGrupo);
  document.getElementById("editItemGrupoWrap").classList.toggle("d-none", !isGrupo);
  if (isGrupo) {
    document.getElementById("editItemFicha").value = item.ficha || "CPS-001";
    document.getElementById("editItemGrupo").value = item.grupo || "Administrativo";
  } else {
    document.getElementById("editItemTipo").value = item.tipo || "Puntaje numérico";
  }
  new bootstrap.Modal(document.getElementById("modalEditFichaItem")).show();
}

function guardarEdicionFichaItem() {
  if (fichaEditIndex < 0) return;
  const item = fichaItemsData[fichaEditIndex];
  item.codigo = document.getElementById("editItemCod").value.trim().toUpperCase();
  item.descripcion = document.getElementById("editItemDesc").value.trim();
  item.estado = document.getElementById("editItemEstado").value;
  if (fichaItemsMode === "grupo") {
    item.ficha = document.getElementById("editItemFicha").value;
    item.grupo = document.getElementById("editItemGrupo").value;
  } else {
    item.tipo = document.getElementById("editItemTipo").value;
  }
  renderFichaItemsTable();
  bootstrap.Modal.getInstance(document.getElementById("modalEditFichaItem")).hide();
  showToast("Elemento actualizado para la demo");
}

function eliminarFichaItem(index) {
  fichaItemsData.splice(index, 1);
  renderFichaItemsTable();
}

function filtrarCodDatoFicha(val) {
  val = val.toLowerCase().trim();
  const tbody = document.getElementById("fCdTableBody");
  if (!tbody) return;
  const rows = tbody.querySelectorAll("tr");
  rows.forEach((tr) => {
    const text = tr.innerText.toLowerCase();
    tr.style.display = text.includes(val) ? "" : "none";
  });
}

function addSF() {
  addFichaItem();
}


/* ══════════════════════════════
       PRUEBAS PSICOLÓGICAS
    ══════════════════════════════ */
let currentStep = 0;
const TOTAL_STEPS = 7;
const STEP_PCT = [14, 28, 42, 57, 71, 85, 100];

function goStep(n) {
  for (let i = 0; i < TOTAL_STEPS; i++) {
    document.getElementById("step-" + i)?.classList.remove("active");
    const snum = document.getElementById("snum-" + i);
    const item = document.querySelectorAll("#stepperNav .stepper-item")[i];
    if (snum && item) {
      item.classList.remove("active");
      if (i < n) {
        snum.className = "stepper-num done";
        snum.innerHTML = '<i class="fas fa-check" style="font-size:.7rem"></i>';
      } else if (i === n) {
        snum.className = "stepper-num active";
        snum.innerHTML = i + 1;
        item.classList.add("active");
      } else {
        snum.className = "stepper-num pend";
        snum.innerHTML = i + 1;
      }
    }
  }
  if (n === 3) precargarBolsito();
  document.getElementById("step-" + n)?.classList.add("active");
  currentStep = n;
  const pct = STEP_PCT[n] !== undefined ? STEP_PCT[n] : 0;
  document.getElementById("modalProgressFill").style.width = pct + "%";
  document.getElementById("modalProgressPct").textContent = pct + "%";
  document.getElementById("btnPrev").style.display =
    n === 0 ? "none" : "inline-flex";
  document.getElementById("btnNext").style.display =
    n === TOTAL_STEPS - 1 ? "none" : "inline-flex";
  const btnFin = document.getElementById("btnFinalizarConf");
  if (btnFin)
    btnFin.style.display = n === TOTAL_STEPS - 1 ? "inline-flex" : "none";

  const btnFinal = document.getElementById("btnGuardarFinal");
  if (btnFinal) {
    btnFinal.style.display = n === TOTAL_STEPS - 1 ? "inline-flex" : "none";
  }
}

function precargarBolsito() {
  const containerC = document.getElementById("plantillaCerradasContainer");
  const containerA = document.getElementById("plantillaAbiertasContainer");
  if (!containerC || !containerA) return;

  // Simular la carga automática de preguntas (req: Adiós a la Sincronización Manual)
  containerC.innerHTML = `
            <div class="border rounded bg-white p-3 shadow-sm mb-2 border-primary">
               <h6 class="fw-bold text-primary mb-2 text-truncate" title="P1 - ¿Con qué frecuencia sientes fatiga?">P1 - ¿Con qué frecuencia sientes fatiga?</h6>
               <div class="d-flex align-items-center justify-content-between py-1 border-bottom border-light">
                   <span class="text-dark fw-medium small">A) Nunca</span>
                   <div class="d-flex align-items-center gap-2">
                       <label class="small text-muted fw-bold mb-0">Pts:</label>
                       <input type="number" class="form-control form-control-sm border-secondary text-success fw-bold text-center" style="width: 70px;" value="0" step="0.1">
                   </div>
               </div>
               <div class="d-flex align-items-center justify-content-between py-1 border-bottom border-light">
                   <span class="text-dark fw-medium small">B) A veces</span>
                   <div class="d-flex align-items-center gap-2">
                       <label class="small text-muted fw-bold mb-0">Pts:</label>
                       <input type="number" class="form-control form-control-sm border-secondary text-success fw-bold text-center" style="width: 70px;" value="1" step="0.1">
                   </div>
               </div>
               <div class="d-flex align-items-center justify-content-between py-1">
                   <span class="text-dark fw-medium small">C) Siempre</span>
                   <div class="d-flex align-items-center gap-2">
                       <label class="small text-muted fw-bold mb-0">Pts:</label>
                       <input type="number" class="form-control form-control-sm border-secondary text-success fw-bold text-center" style="width: 70px;" value="2.5" step="0.1">
                   </div>
               </div>
            </div>
            <div class="border rounded bg-white p-3 shadow-sm mb-2 border-primary">
               <h6 class="fw-bold text-primary mb-2 text-truncate" title="P2 - Rango de dolor">P2 - Rango de dolor</h6>
               <div class="d-flex align-items-center justify-content-between py-1 border-bottom border-light">
                   <span class="text-dark fw-medium small">A) Leve</span>
                   <div class="d-flex align-items-center gap-2">
                       <label class="small text-muted fw-bold mb-0">Pts:</label>
                       <input type="number" class="form-control form-control-sm border-secondary text-success fw-bold text-center" style="width: 70px;" value="1" step="0.1">
                   </div>
               </div>
               <div class="d-flex align-items-center justify-content-between py-1">
                   <span class="text-dark fw-medium small">B) Agudo</span>
                   <div class="d-flex align-items-center gap-2">
                       <label class="small text-muted fw-bold mb-0">Pts:</label>
                       <input type="number" class="form-control form-control-sm border-secondary text-success fw-bold text-center" style="width: 70px;" value="3" step="0.1">
                   </div>
               </div>
            </div>`;

  containerA.innerHTML = `
            <div class="border rounded bg-white p-3 shadow-sm mb-2 border-primary">
               <h6 class="fw-bold text-primary mb-2 text-truncate" title="P3 - Describa su rutina de dolor">P3 - Describa su rutina de dolor (Texto)</h6>
               <div class="d-flex align-items-center justify-content-between py-1">
                   <span class="text-muted fw-medium small fst-italic">Ingresar valor base o puntaje global:</span>
                   <div class="d-flex align-items-center gap-2">
                       <label class="small text-muted fw-bold mb-0">Pts/Valor:</label>
                       <input type="number" class="form-control form-control-sm border-secondary text-success fw-bold text-center" style="width: 70px;" value="0" step="0.1">
                   </div>
               </div>
            </div>
            <div class="border rounded bg-white p-3 shadow-sm mb-2 border-primary">
               <h6 class="fw-bold text-primary mb-2 text-truncate" title="P4 - Edad (Numérica)">P4 - Edad (Numérica)</h6>
               <div class="d-flex align-items-center justify-content-between py-1">
                   <span class="text-muted fw-medium small fst-italic">Referencia global para uso en fórmulas:</span>
                   <div class="d-flex align-items-center gap-2">
                       <label class="small text-muted fw-bold mb-0">Pts/Valor:</label>
                       <input type="number" class="form-control form-control-sm border-secondary text-success fw-bold text-center" style="width: 70px;" value="0" step="0.1">
                   </div>
               </div>
            </div>`;

  const containerM = document.getElementById("plantillaMatrizContainer");
  const containerT = document.getElementById("plantillaTarjetaContainer");

  if (containerM) {
    containerM.innerHTML = `
               <div class="border rounded bg-white p-3 shadow-sm mb-2 border-primary">
                  <h6 class="fw-bold text-primary mb-2 text-truncate" title="P5 - Evalúe su estado anímico (Matriz)">P5 - Evalúe su estado anímico (Matriz)</h6>
                  <div class="table-responsive">
                     <table class="table table-sm table-bordered text-center align-middle mb-0" style="font-size: 0.85rem;">
                        <thead class="table-light">
                           <tr>
                              <th class="text-start text-muted">Aserción / Opción</th>
                              <th>Rara vez</th>
                              <th>A veces</th>
                              <th>Muy frecuente</th>
                           </tr>
                        </thead>
                        <tbody>
                           <tr>
                              <td class="text-start fw-medium text-muted">Me siento agotado</td>
                              <td><input type="number" class="form-control form-control-sm mx-auto text-success fw-bold text-center border-secondary" style="width: 65px;" value="1" step="0.5"></td>
                              <td><input type="number" class="form-control form-control-sm mx-auto text-success fw-bold text-center border-secondary" style="width: 65px;" value="2" step="0.5"></td>
                              <td><input type="number" class="form-control form-control-sm mx-auto text-success fw-bold text-center border-secondary" style="width: 65px;" value="3" step="0.5"></td>
                           </tr>
                           <tr>
                              <td class="text-start fw-medium text-muted">Tengo dolores de cabeza</td>
                              <td><input type="number" class="form-control form-control-sm mx-auto text-success fw-bold text-center border-secondary" style="width: 65px;" value="1" step="0.5"></td>
                              <td><input type="number" class="form-control form-control-sm mx-auto text-success fw-bold text-center border-secondary" style="width: 65px;" value="2" step="0.5"></td>
                              <td><input type="number" class="form-control form-control-sm mx-auto text-success fw-bold text-center border-secondary" style="width: 65px;" value="3" step="0.5"></td>
                           </tr>
                        </tbody>
                     </table>
                  </div>
               </div>`;
  }

  if (containerT) {
    containerT.innerHTML = `
               <div class="border rounded bg-white p-3 shadow-sm mb-2 border-primary">
                  <h6 class="fw-bold text-primary mb-2 text-truncate" title="P6 - Asocie la tarjeta con la emoción (Tarjeta)">P6 - Asocie la tarjeta con la emoción (Tarjeta)</h6>
                  <div class="d-flex flex-wrap gap-2">
                     <div class="border rounded p-2 text-center bg-light" style="width: 140px;">
                        <i class="fas fa-image fa-2x text-muted mb-2"></i><br>
                        <span class="small fw-bold text-dark d-block text-truncate" title="Opción 1">Ficha A</span>
                        <div class="mt-2 input-group input-group-sm">
                           <span class="input-group-text bg-white p-1 px-2 border-secondary fw-bold text-muted">Pts</span>
                           <input type="number" class="form-control text-center text-success fw-bold border-secondary" value="2.5" step="0.5">
                        </div>
                     </div>
                     <div class="border rounded p-2 text-center bg-light" style="width: 140px;">
                        <i class="fas fa-image fa-2x text-muted mb-2"></i><br>
                        <span class="small fw-bold text-dark d-block text-truncate" title="Opción 2">Ficha B</span>
                        <div class="mt-2 input-group input-group-sm">
                           <span class="input-group-text bg-white p-1 px-2 border-secondary fw-bold text-muted">Pts</span>
                           <input type="number" class="form-control text-center text-success fw-bold border-secondary" value="5.0" step="0.5">
                        </div>
                     </div>
                  </div>
               </div>`;
  }
}

function nextStep() {
  if (currentStep === 0) {
    const cod = document.getElementById("prCod").value.trim();
    const nom = document.getElementById("prNom").value.trim();
    if (!cod || !nom) {
      alert("⚠️ Debes completar Código y Nombre para continuar.");
      return;
    }
  }
  if (currentStep < TOTAL_STEPS - 1) goStep(currentStep + 1);
}
function prevStep() {
  if (currentStep > 0) goStep(currentStep - 1);
}

function nuevaPrueba() {
  document.getElementById("tPrueba").innerHTML =
    '<i class="fas fa-file-medical-alt me-2 text-primary"></i>Nueva Prueba Psicológica';
  ["prCod", "prNom", "prIcon", "prDiasRecuperacion", "prNivelReevaluacion"].forEach(
    (id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    },
  );
  ["prPermiteRecuperacion", "prPermiteReevaluacion", "prTlimitado", "prPausarTest"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.checked = false;
  });
  if (document.getElementById("prVisTiempo")) document.getElementById("prVisTiempo").checked = true;
  if (document.getElementById("prPregObl")) document.getElementById("prPregObl").checked = true;
  if (document.getElementById("div-recuperacion-dias")) document.getElementById("div-recuperacion-dias").style.display = "none";
  if (document.getElementById("div-reevaluacion-nivel")) document.getElementById("div-reevaluacion-nivel").style.display = "none";
  if (document.getElementById("div-tiempo")) document.getElementById("div-tiempo").style.display = "none";
  document.getElementById("prCod").disabled = false;
  document.getElementById("prIconoSelect").value = "fa-brain";
  document.getElementById("prEmojiPreview").innerHTML =
    '<i class="fas fa-brain"></i>';
  resetBox("boxPreg", "emptyPreg", "fas fa-question", "Sin preguntas.");
  resetBox("boxFac", "emptyFac", "fas fa-layer-group", "Sin factores.");

  document.getElementById("portadaTitulo").value = "";
  document.getElementById("portadaInstrucciones").value = "";
  document.getElementById("selectPlantillaPortada").value = "estandar";
  renderPreviewPortada();

  go("prueba-form");
  goStep(0);
}

function editarPrueba(cod) {
  document.getElementById("tPrueba").innerHTML =
    '<i class="fas fa-pen me-2 text-primary"></i>Editar Prueba: ' + cod;
  const demos = {
    "PSI-ANS-001": {
      nom: "Escala de Ansiedad de Beck",
      tipo: "ingreso",
      est: "activo",
      icon: "fa-brain",
      step: 3,
      permiteRecuperacion: true,
      diasRecuperacion: 3,
      permiteReevaluacion: true,
      nivelReevaluacion: "factor",
    },
    "PSI-CMP-002": {
      nom: "Competencias Laborales Volcán",
      tipo: "periodico",
      est: "borrador",
      icon: "fa-puzzle-piece",
      step: 3,
    },
    "PSI-ALT-003": {
      nom: "Evaluación Psicológica – Altura",
      tipo: "altura",
      est: "borrador",
      icon: "fa-helmet-safety",
      step: 3,
    },
    "PSI-CHI-004": {
      nom: "Entrevista Psicológica Chinalco",
      tipo: "retiro",
      est: "cesado",
      icon: "fa-clipboard-check",
      step: 3,
    },
    "EST-STRESS-010": {
      nom: "Escala de Estrés Percibido",
      tipo: "periodico",
      est: "activo",
      icon: "fa-face-smile",
      step: 3,
    },
    "PSI-VOC-005": {
      nom: "Test Orientación Vocacional",
      tipo: "ingreso",
      est: "activo",
      icon: "fa-graduation-cap",
      step: 3,
    },
  };
  const d = demos[cod];
  if (d) {
    document.getElementById("prCod").value = cod;
    document.getElementById("prCod").disabled = true;
    document.getElementById("prNom").value = d.nom;
    document.getElementById("prIcon").value = d.icon;
    document.getElementById("prIconoSelect").value = d.icon;
    document.getElementById("prEmojiPreview").innerHTML =
      '<i class="fas ' + d.icon + '"></i>';
    if (document.getElementById("prPermiteRecuperacion")) {
      document.getElementById("prPermiteRecuperacion").checked = !!d.permiteRecuperacion;
      document.getElementById("div-recuperacion-dias").style.display = d.permiteRecuperacion ? "block" : "none";
      document.getElementById("prDiasRecuperacion").value = d.diasRecuperacion || "";
    }
    if (document.getElementById("prPermiteReevaluacion")) {
      document.getElementById("prPermiteReevaluacion").checked = !!d.permiteReevaluacion;
      document.getElementById("div-reevaluacion-nivel").style.display = d.permiteReevaluacion ? "block" : "none";
      document.getElementById("prNivelReevaluacion").value = d.nivelReevaluacion || "";
    }
    resetBox("boxPreg", "emptyPreg", "fas fa-question", "Sin preguntas.");

    const btnPrev = document.querySelector(
      "#screen-prueba-form button[onclick*='previsualizarPrueba']",
    );
    if (btnPrev)
      btnPrev.setAttribute("onclick", `previsualizarPrueba('${cod}')`);

    resetBox("boxFac", "emptyFac", "fas fa-layer-group", "Sin factores.");
    if (d.step >= 1) {
      document.getElementById("selectPlantillaPortada").value = "detallada";
      document.getElementById("portadaTitulo").value = d.nom + " - Bienvenida";
      document.getElementById("portadaInstrucciones").value =
        "1. Lea atentamente antes de contestar.\n2. No hay respuestas correctas o incorrectas.\n3. Tiene un tiempo límite según aplique.";
      renderPreviewPortada();
    }
    if (d.step >= 2 && PRUEBAS_DEMO[cod]) {
      PRUEBAS_DEMO[cod].preguntas.forEach((q, i) => {
        pushItem("boxPreg", "emptyPreg", rowPregunta(i + 1, q.texto, q.tipo));
      });
    }
    if (d.step >= 3 && PRUEBAS_DEMO[cod] && PRUEBAS_DEMO[cod].factores) {
      PRUEBAS_DEMO[cod].factores.forEach((f) => {
        pushItem("boxFac", "emptyFac", rowFactor(f.cod, f.nom));
      });
    }
    if (d.step >= 5) {
      // Ya no existe step 4 Claves de Respuesta original, pero simulamos Factores que es paso 6
    }
    go("prueba-form");
    goStep(0);
  }
}

function guardarPrueba() {
  showToast("✅ Prueba guardada como Borrador.");
  setTimeout(() => go("pruebas"), 300);
}

function renderPreviewPortada() {
  const plantilla = document.getElementById("selectPlantillaPortada").value;
  const titulo =
    document.getElementById("portadaTitulo").value || "TÍTULO DE LA PORTADA";
  const instrucciones =
    document.getElementById("portadaInstrucciones").value ||
    "Instrucciones de la prueba irán aquí...";
  const container = document.getElementById("previewPortada");
  const fileInput = document.getElementById("portadaImagen");

  let imagesHtml = "";

  if (fileInput && fileInput.files && fileInput.files.length > 0) {
    for (let i = 0; i < fileInput.files.length; i++) {
      const fileUrl = URL.createObjectURL(fileInput.files[i]);
      imagesHtml += `<img src="${fileUrl}" style="height: 140px; width: auto; max-width: 100%; object-fit: contain; border-radius: 2px;" />`;
    }
  } else {
    const fallbackImageSvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='#e2e8f0'/><circle cx='200' cy='120' r='45' fill='#cbd5e1'/><path d='M100,300 C100,200 300,200 300,300 Z' fill='#94a3b8'/><text x='200' y='280' text-anchor='middle' font-family='sans-serif' font-size='14' fill='#64748b'>Sin imagen</text></svg>`;
    const imgSrc = `data:image/svg+xml,${encodeURIComponent(fallbackImageSvg)}`;
    imagesHtml = `<img src="${imgSrc}" style="width: 100%; height: auto; max-height: 200px; object-fit: contain; border-radius: 2px;" />`;
  }

  let htmlPreview = "";

  // Asegurar que los saltos de línea se respeten en HTML si no usamos pre-wrap, pero pre-wrap es mejor
  const estiloTexto =
    "font-size: 0.95rem; line-height: 1.5; white-space: pre-wrap;";

  if (plantilla === "estandar") {
    // Diseño lado a lado limpio (Clínico)
    htmlPreview = `
            <div style="background-color: #ffffff; width: 100%; min-height: 240px; padding: 25px; text-align: left; box-sizing: border-box; border-radius: 6px;">
                <h2 style="color: #0d2a75; font-weight: 800; margin-bottom: 5px; font-size: 1.3rem; line-height: 1.2; text-transform: uppercase;">${titulo}</h2>
                <h4 style="color: #0b347a; font-weight: 700; margin-bottom: 20px; font-size: 0.9rem; text-transform: uppercase;"></h4>
                
                <div style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;">
                  <div style="flex: 1.2; min-width: 280px; display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center; align-items: center; gap: 10px; background: #fff; padding: 10px; border: 1px solid #e2e8f0; box-shadow: 2px 2px 10px rgba(0,0,0,0.08); border-radius: 4px;">
                     ${imagesHtml}
                  </div>
              
                  <div style="flex: 2; min-width: 300px; color: #0d2a75;">
                     <h5 style="font-weight: 800; font-size: 1rem; margin-bottom: 8px;">INSTRUCCIONES:</h5>
                     <div style="${estiloTexto}">${instrucciones}</div>
                  </div>
                </div>
            </div>
          `;
  } else if (plantilla === "detallada") {
    // Diseño vertical limpio con recuadro
    htmlPreview = `
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-top: 5px solid #0d2a75; width: 100%; min-height: 240px; padding: 25px; text-align: center; box-sizing: border-box; border-radius: 6px;">
                <h2 style="color: #0d2a75; font-weight: 800; margin-bottom: 5px; font-size: 1.4rem; line-height: 1.2; text-transform: uppercase;">${titulo}</h2>
                <h4 style="color: #1e3a8a; font-weight: 700; margin-bottom: 20px; font-size: 0.9rem; text-transform: uppercase;">EVALUACIÓN PSICOLÓGICA DETALLADA</h4>
                
                <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                  <div style="width: 100%; max-width: 600px; display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 10px; background: #fff; padding: 5px; border: 1px solid #e2e8f0; box-shadow: 2px 2px 10px rgba(0,0,0,0.08); border-radius: 4px;">
                     ${imagesHtml}
                  </div>
              
                  <div style="width: 100%; color: #0d2a75; text-align: left; background: #ffffff; padding: 20px; border-radius: 6px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                     <h5 style="font-weight: 800; font-size: 1rem; margin-bottom: 8px;">INSTRUCCIONES:</h5>
                     <div style="${estiloTexto}">${instrucciones}</div>
                  </div>
                </div>
            </div>
          `;
  }

  container.innerHTML = htmlPreview;
}

function filtrarPruebas() {
  const q = document.getElementById("buscarPrueba").value.trim().toLowerCase();
  document.querySelectorAll("#listaPruebas .card-prueba").forEach((card) => {
    const txt = (
      (card.dataset.nombre || "") +
      " " +
      (card.dataset.tipo || "") +
      " " +
      (card.dataset.codigo || "")
    ).toLowerCase();
    card.style.display = txt.includes(q) ? "" : "none";
  });
}

function filtrarPantalla(id, value) {
  const q = value.trim().toLowerCase();
  document.querySelectorAll("#" + id + " .card-item").forEach((card) => {
    const txt = card.textContent.toLowerCase();
    card.style.display = txt.includes(q) ? "" : "none";
  });
}

function filtrarCool(id, value) {
  const q = value.trim().toLowerCase();
  const cards = document.querySelectorAll("#" + id + " .card-item");

  cards.forEach((card, index) => {
    const txt = card.textContent.toLowerCase();
    const match = txt.includes(q);

    if (match) {
      card.style.display = "flex";
      // Retraso escalonado sutil para dar efecto "cascada"
      setTimeout(() => {
        card.style.opacity = "1";
        card.style.transform = "translateY(0) scale(1)";
      }, index * 15);
    } else {
      card.style.opacity = "0";
      card.style.transform = "translateY(5px) scale(0.98)";
      setTimeout(() => {
        if (card.style.opacity === "0") {
          card.style.display = "none";
        }
      }, 250);
    }
  });
}

function filtrarPillContainer(id, value) {
  const q = value.trim().toLowerCase();
  document.querySelectorAll("#" + id + " .item-row").forEach((card) => {
    const txt = card.textContent.toLowerCase();
    card.style.display = txt.includes(q) ? "" : "none";
  });
}
function filtrarPreguntas() {
  const q = document
    .getElementById("buscarPregunta")
    .value.trim()
    .toLowerCase();
  const tipoSel = document.getElementById("filtroTipoPregunta").value;
  document.querySelectorAll("#boxPreg .item-row").forEach((row) => {
    const txt = row.querySelector(".desc")
      ? row.querySelector(".desc").textContent.toLowerCase()
      : "";
    const rowTipo = row.getAttribute("data-tipo") || "";
    const matchText = txt.includes(q);
    const matchTipo = tipoSel === "todos" || rowTipo === tipoSel;
    row.style.display = matchText && matchTipo ? "" : "none";
  });
}

/* ACTUALIZACIÓN - RESTAURAR TIPO DE VIÑETA Y EVITAR REGRESIONES NO SOLICITADAS */
function numeroARomano(num) {
  const mapa = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let resultado = "";
  let n = Math.max(1, parseInt(num, 10) || 1);
  for (const [valor, simbolo] of mapa) {
    while (n >= valor) {
      resultado += simbolo;
      n -= valor;
    }
  }
  return resultado;
}

function obtenerVinetaAutomatica(index, totalItems = 0, tipo = "letras") {
  const pos = index + 1;
  if (tipo === "num") return pos + ")";
  if (tipo === "rom") return numeroARomano(pos) + ")";
  if (tipo === "otros") return "";
  if (totalItems > 26) return pos + ")";
  return String.fromCharCode(65 + index) + ")";
}

function getTipoVinetaContenedor(container) {
  if (!container) return "letras";
  const prefijo =
    container.id && container.id.startsWith("mp_A_") ? "mp_A" : "mp_C";
  const select = document.getElementById(prefijo + "_vineta");
  return select ? select.value : "letras";
}

function actualizarModoVineta(selectEl, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const manual = selectEl && selectEl.value === "otros";
  container.querySelectorAll(".manual-bullet-input").forEach((input) => {
    input.style.setProperty("display", manual ? "block" : "none", "important");
  });
  container.querySelectorAll(".badge-bullet").forEach((badge) => {
    badge.style.display = manual ? "none" : "";
  });
  renumerarContenedor("#" + containerId);
}

function renumerarContenedor(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const isAlt = containerSelector.includes("alternativas");
  const items = container.querySelectorAll(isAlt ? ".item-alt" : ".item-row");
  const tipoVineta = isAlt ? getTipoVinetaContenedor(container) : "letras";
  items.forEach((item, index) => {
    const inp = item.querySelector(".pos-input");
    if (inp) inp.value = index + 1;

    if (isAlt) {
      const badgeVineta = item.querySelector(".badge-bullet");
      const manualInput = item.querySelector(".manual-bullet-input");
      if (manualInput) {
        manualInput.style.setProperty(
          "display",
          tipoVineta === "otros" ? "block" : "none",
          "important",
        );
        manualInput.oninput = function () {
          if (badgeVineta) badgeVineta.textContent = this.value || "•";
          sepoUpdateClosedPrecargaUI();
        };
      }
      if (badgeVineta) {
        badgeVineta.style.display = tipoVineta === "otros" ? "none" : "";
        badgeVineta.textContent =
          tipoVineta === "otros"
            ? manualInput && manualInput.value
              ? manualInput.value
              : "•"
            : obtenerVinetaAutomatica(index, items.length, tipoVineta);
      }
    } else {
      const badge = item.querySelector(".badge.bg-primary");
      if (badge) badge.textContent = `P${index + 1}`;
    }
  });

  if (containerSelector === "#mp_C_alternativas_box") {
    sepoUpdateClosedPrecargaUI();
  }
}

let draggedPregItem = null;
function dragPregRow(e) {
  draggedPregItem = e.target.closest(".item-row");
  e.dataTransfer.effectAllowed = "move";
  setTimeout(() => {
    if (draggedPregItem) draggedPregItem.style.opacity = "0.5";
  }, 0);
}
function dragOverPregRow(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  const overItem = e.target.closest(".item-row");
  if (overItem && overItem !== draggedPregItem) {
    const list = overItem.parentNode;
    const items = [...list.querySelectorAll(".item-row")];
    if (items.indexOf(draggedPregItem) < items.indexOf(overItem))
      overItem.after(draggedPregItem);
    else overItem.before(draggedPregItem);
  }
}
function dropPregRow(e) {
  e.stopPropagation();
  return false;
}
function dragEndPregRow(e) {
  if (draggedPregItem) draggedPregItem.style.opacity = "1";
  const pId = draggedPregItem ? draggedPregItem.parentNode.id : "boxPreg";
  draggedPregItem = null;
  renumerarContenedor("#" + pId);
}

function duplicarPregunta(btn) {
  const row = btn.closest(".item-row");
  let txt = "Pregunta Copiada";
  const descEl = row.querySelector(".desc-text");
  if (descEl) txt = descEl.textContent;

  let tipoBadge = row.querySelector(".badge.bg-dark");
  let tipo = "abierta";
  if (tipoBadge) {
    const lbl = tipoBadge.textContent.toLowerCase();
    if (lbl.includes("cerrada")) tipo = "cerrada";
    else if (lbl.includes("matriz")) tipo = "matriz";
    else if (lbl.includes("tarjeta")) tipo = "tarjeta";
  }

  const sel = document.getElementById("mpTipoPreg_Master");
  if (sel) {
    sel.value = tipo;
    renderizarControlesPregunta();
    setTimeout(() => {
      const mapIdA = "mp_A_text";
      const mapIdC = "mp_C_text";
      if (tipo === "abierta" && document.getElementById(mapIdA)) {
        document.getElementById(mapIdA).value = txt + " (Copia)";
      } else if (tipo === "cerrada" && document.getElementById(mapIdC)) {
        document.getElementById(mapIdC).value = txt + " (Copia)";
      }
      const m = new bootstrap.Modal(
        document.getElementById("modalNuevaPregunta"),
      );
      m.show();
    }, 50);
  }
}

function reordenarPorInput(input, containerSelector) {
  let val = parseInt(input.value);
  if (isNaN(val) || val < 1) val = 1;

  const row = input.closest(".item-row") || input.closest(".item-alt");
  const container = document.querySelector(containerSelector);
  if (!row || !container) return;

  const children = Array.from(container.children);
  const max = children.length;
  if (val > max) val = max;

  const newPos = val - 1;
  if (children[newPos] !== row) {
    if (newPos === max - 1) {
      container.appendChild(row);
    } else {
      const target = children[newPos];
      if (children.indexOf(row) < newPos) {
        target.after(row);
      } else {
        target.before(row);
      }
    }
  } else {
    input.value = children.indexOf(row) + 1;
  }
  renumerarContenedor(containerSelector);
}

function renderizarControlesPregunta() {
  const tipo = document.getElementById("mpTipoPreg_Master").value;
  const c = document.getElementById("mpContenedorPregunta");

  if (!tipo) {
    c.style.display = "none";
    return;
  }
  c.style.display = "block";

  let html = "";
  if (tipo === "abierta") {
    html = `
            <div class="p-3 mb-0 border rounded shadow-sm bg-white border-top border-4" style="border-top-color: #f59e0b !important;">
              <h6 class="fw-bold mb-3"><i class="fas fa-align-left me-2 text-warning"></i>Configuración - Plantilla de Resultados</h6>
              
              <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label text-muted small fw-bold mb-1">Tipo de Vista</label>
                    <select class="form-select" id="mp_A_tipoVista" onchange="document.getElementById('mp_A_boxNumCol').style.display = this.value === '3' ? 'block' : 'none';">
                      <option value="1">Básica</option>
                      <option value="2">Ventana emergente (solo modal)</option>
                      <option value="3">Tabla</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted small fw-bold mb-1">Tipo de Dato de la Pregunta</label>
                    <select class="form-select" id="mp_A_tipoDato" onchange="ctrlAbierta()">
                      <option value="texto">Texto</option>
                      <option value="imagen">Imagen</option>
                      <option value="texto_imagen">Texto/Imagen</option>
                    </select>
                  </div>
                  
                  <div class="col-md-12" id="mp_A_boxText">
                    <label class="form-label fw-bold small text-primary mb-1">Descripción de Pregunta</label>
                    <input type="text" class="form-control" id="mp_A_text" placeholder="Escribe tu pregunta abierta aquí...">
                  </div>
                  
                  <div class="col-md-12" id="mp_A_boxImage" style="display:none;">
                    <label class="form-label fw-bold small text-primary mb-1"><i class="fas fa-image me-1"></i> Subir Imagen</label>
                    <input type="file" class="form-control" accept="image/*" style="display:inline-block; width:calc(100% - 110px);"><select class="form-select form-select-sm mt-1 float-end w-auto d-inline-block ps-2 pe-4" title="Tamaño de vista"><option value="small">Pequeño</option><option value="medium" selected>Mediano</option><option value="large">Grande</option></select>
                  </div>
                  
                  <div class="col-md-4">
                    <label class="form-label text-muted small fw-bold mb-1">Tipo de Respuesta</label>
                    <select class="form-select" id="mp_A_tipoResp" onchange="ctrlAbierta()">
                      <option value="unica">Única</option>
                      <option value="multiple">Múltiple</option>
                    </select>
                  </div>
                  
                  <div class="col-md-4" id="mp_A_boxNumResp" style="display:none;">
                    <label class="form-label text-muted small fw-bold mb-1">Cant. de Resp.</label>
                    <input type="number" class="form-control" id="mp_A_numResp" value="2" min="2" oninput="ctrlAbierta()">
                  </div>

                  <div class="col-md-4" id="mp_A_boxNumRespValidas" style="display:none;">
                    <label class="form-label text-muted small fw-bold mb-1">Resp. Válidas</label>
                    <input type="number" class="form-control" id="mp_A_numRespVal" value="1" min="1">
                  </div>

                  <div class="col-md-4" id="mp_A_boxNumCol" style="display:none;">
                    <label class="form-label text-muted small fw-bold mb-1">Nº Columnas</label>
                    <input type="number" class="form-control" id="mp_A_numCol" value="1" min="1" max="10">
                  </div>
                  
                  <div class="col-md-4">
                    <label class="form-label text-muted small fw-bold mb-1">Dato Respuesta</label>
                    <select class="form-select" id="mp_A_tipoDatoResp" onchange="const num = document.getElementById('mp_A_boxRango'); if(num) num.style.display = this.value === 'numerico' ? 'block' : 'none'; if(this.value === 'texto'){ document.getElementById('mp_A_numMin').value=''; document.getElementById('mp_A_numMax').value=''; }">
                      <option value="numerico">Numérico</option>
                      <option value="texto" selected>Texto</option>
                    </select>
                  </div>
                  <div class="col-md-4" id="mp_A_boxRango" style="display:none;">
                    <div class="row g-2">
                       <div class="col-6">
                         <label class="form-label text-muted small fw-bold mb-1" title="Límite Mínimo">Mínimo</label>
                         <input type="number" class="form-control" id="mp_A_numMin" placeholder="Mín">
                       </div>
                       <div class="col-6">
                         <label class="form-label text-muted small fw-bold mb-1" title="Límite Máximo">Máximo</label>
                         <input type="number" class="form-control" id="mp_A_numMax" placeholder="Máx">
                       </div>
                    </div>
                  </div>

                  <div class="col-md-12 mt-2">
                    <div class="d-flex align-items-center gap-3">
                      <label class="form-label m-0 text-muted small fw-bold">¿Tiene precarga? (Valores por defecto)</label>
                      <div class="form-check form-check-inline m-0">
                        <input class="form-check-input" type="radio" name="mp_A_precargaRd" id="mp_A_precargaNo" value="no" checked onchange="ctrlAbierta()">
                        <label class="form-check-label" for="mp_A_precargaNo">No</label>
                      </div>
                      <div class="form-check form-check-inline m-0">
                        <input class="form-check-input" type="radio" name="mp_A_precargaRd" id="mp_A_precargaSi" value="si" onchange="ctrlAbierta()">
                        <label class="form-check-label" for="mp_A_precargaSi">Sí</label>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-12 mt-2" id="mp_A_editableWrap" style="display:none;">
                    <div class="form-check form-switch m-0">
                      <input class="form-check-input" type="checkbox" id="mp_A_editable">
                      <label class="form-check-label small fw-bold text-muted" for="mp_A_editable">¿Es editable por el usuario?</label>
                    </div>
                  </div>
                  
                  <div class="col-md-12" id="mp_A_boxPrecarga" style="display:none;">
                     <div class="p-3 bg-light rounded border border-secondary border-opacity-25" id="mp_A_precargaFields"></div>
                  </div>

<div class="col-12 mt-4" style="display: none;">
                     <div class="d-flex justify-content-between align-items-center mb-2">
                       <h6 class="fw-bold text-muted m-0"><i class="fas fa-list mt-1 me-1"></i> Creador de Alternativas / Claves</h6>
                     </div>
                     <div id="mp_A_alternativas_box" class="d-flex flex-column gap-2 mb-3"></div>
                     <button class="btn btn-outline-warning text-dark btn-sm w-100 border-dashed fw-bold py-2" onclick="addMpaAlternativa()">
                       <i class="fas fa-plus me-1"></i> Añadir Nueva Alternativa
                     </button>
                  </div>
              </div>
            </div>
          `;
  } else if (tipo === "cerrada") {
    html = `
            <div class="p-3 mb-0 border rounded shadow-sm bg-white border-top border-4" style="border-top-color: #3b82f6 !important;">
              <h6 class="fw-bold mb-3"><i class="fas fa-check-circle me-2 text-primary"></i>Configuración - Pregunta Cerrada</h6>
              <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label text-muted small fw-bold mb-1">Tipo de Vista</label>
                    <select class="form-select" id="mp_C_tipoVista" onchange="document.getElementById('mp_C_boxNumCol').style.display = this.value === '3' ? 'block' : 'none';">
                      <option value="1">Básica</option>
                      <option value="2">Ventana emergente (solo modal)</option>
                      <option value="3">Tabla</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted small fw-bold mb-1">Tipo de Dato de la Pregunta</label>
                    <select class="form-select" id="mp_C_tipoDato" onchange="ctrlCerrada()">
                      <option value="texto">Texto</option>
                      <option value="imagen">Imagen</option>
                      <option value="texto_imagen">Texto/Imagen</option>
                    </select>
                  </div>
                  
                  <div class="col-md-12" id="mp_C_boxText">
                    <label class="form-label fw-bold small text-primary mb-1">Descripción de Pregunta</label>
                    <input type="text" class="form-control" id="mp_C_text" placeholder="Escribe tu pregunta cerrada aquí...">
                  </div>
                  
                  <div class="col-md-12" id="mp_C_boxImage" style="display:none;">
                    <label class="form-label fw-bold small text-primary mb-1"><i class="fas fa-image me-1"></i> Subir Imagen</label>
                    <div class="d-flex gap-2 mt-1 align-items-center">
                      <input type="file" class="form-control" accept="image/*">
                      <select class="form-select px-2 w-auto border-secondary mpc-img-size-master-sel" onchange="swMpcImgSize(this)">
                        <option value="small">IMG: Pequeño</option>
                        <option value="medium" selected>IMG: Mediano</option>
                        <option value="large">IMG: Grande</option>
                        <option value="otros">Otros</option>
                      </select>
                      <div class="mpc-img-custom-size-master d-none gap-2 align-items-center">
                        <input type="number" class="form-control form-control-sm mpc-img-w" placeholder="Ancho px" style="width:85px;">
                        <input type="number" class="form-control form-control-sm mpc-img-h" placeholder="Alto px" style="width:85px;">
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-4">
                    <label class="form-label text-muted small fw-bold mb-1">Tipo de Respuesta</label>
                    <select class="form-select" id="mp_C_tipoResp" onchange="ctrlCerrada()">
                      <option value="unica">Única</option>
                      <option value="multiple">Múltiple</option>
                    </select>
                  </div>
                  
                  <div class="col-md-4" id="mp_C_boxNumResp" style="display:none;">
                    <label class="form-label text-muted small fw-bold mb-1">Límite Múltiple</label>
                    <input type="number" class="form-control" id="mp_C_numResp" value="2" min="2">
                  </div>

                  <div class="col-md-4" id="mp_C_boxNumCol" style="display:none;">
                    <label class="form-label text-muted small fw-bold mb-1">Nº Columnas</label>
                    <input type="number" class="form-control" id="mp_C_numCol" value="1" min="1" max="6">
                  </div>

                  <div class="col-md-4">
                    <label class="form-label text-muted small fw-bold mb-1">Tipo de Viñeta</label>
                    <select class="form-select" id="mp_C_vineta" onchange="actualizarModoVineta(this, 'mp_C_alternativas_box')">
                      <option value="letras" selected>Letras</option>
                      <option value="num">Números</option>
                      <option value="rom">Números romanos</option>
                      <option value="otros">Otros</option>
                    </select>
                  </div>

                  <div class="col-md-8 mt-2 d-flex flex-column gap-1 justify-content-center">
                    <div class="form-check form-switch mt-1">
                      <input class="form-check-input" type="checkbox" id="mp_C_precarga">
                      <label class="form-check-label small fw-bold text-muted fw-bold">Activar Precarga</label>
                    </div>
                    <div id="mp_C_editableWrapStable" style="display:none;" class="mt-2">
                      <div class="form-check form-switch mt-1">
                        <input class="form-check-input" type="checkbox" id="mp_C_editable">
                        <label class="form-check-label small fw-bold text-muted fw-bold">¿Es editable por el usuario?</label>
                      </div>
                    </div>
                    <div id="mp_C_precarga_opciones" style="display:none;" class="mt-2 ps-1 bg-light p-2 rounded">
                      <label class="form-label small fw-bold text-primary mb-1"><i class="fas fa-check-square me-1"></i> Alternativa(s) por defecto:</label>
                      <div id="mp_C_precarga_dynamic_box"></div>
                    </div>
                  </div>

<div class="col-12 mt-4">
                     <div class="d-flex justify-content-between align-items-center mb-2">
                       <h6 class="fw-bold text-muted m-0"><i class="fas fa-list mt-1 me-1"></i> Creador de Alternativas</h6>
                     </div>
                     <div id="mp_C_alternativas_box" class="d-flex flex-column gap-2 mb-3"></div>
                     <button class="btn btn-outline-primary btn-sm w-100 border-dashed fw-bold py-2" onclick="addMpcAlternativa()">
                       <i class="fas fa-plus me-1"></i> Añadir Nueva Alternativa
                     </button>
                  </div>
              </div>
            </div>
          `;
  } else if (tipo === "numerica") {
    html = `
            <div class="p-3 mb-0 border rounded shadow-sm bg-white border-top border-4" style="border-top-color: #10b981 !important;">
              <h6 class="fw-bold mb-3"><i class="fas fa-hashtag me-2 text-success"></i>Configuración - Pregunta Numérica</h6>
              <div class="row g-3">
                  <div class="col-md-12">
                    <label class="form-label fw-bold small text-primary mb-1">Descripción de Pregunta</label>
                    <input type="text" id="mp_N_text" class="form-control" placeholder="Escribe tu pregunta numérica aquí...">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted small fw-bold mb-1">Valor Mínimo</label>
                    <input type="number" class="form-control" id="mp_N_min" placeholder="Ej: 0.0" step="0.5">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted small fw-bold mb-1">Valor Máximo</label>
                    <input type="number" class="form-control" id="mp_N_max" placeholder="Ej: 10.0" step="0.5">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted small fw-bold mb-1">Puntaje por Defecto</label>
                    <input type="number" class="form-control" id="mp_N_def" placeholder="Ej: 5.0" step="0.1">
                  </div>
              </div>
            </div>
          `;
  } else if (tipo === "matriz") {
    html = `
            <div class="p-3 mb-0 border rounded shadow-sm bg-white border-top border-4" style="border-top-color: #8b5cf6 !important;">
              <h6 class="fw-bold mb-3"><i class="fas fa-th me-2 text-purple" style="color:#8b5cf6"></i>Configuración - Pregunta Matriz</h6>
              <div class="row g-3">
                 <div class="col-md-9">
                   <label class="form-label fw-bold small text-primary mb-1">Descripción de la Matriz</label>
                   <input type="text" class="form-control" id="mp_M_text" placeholder="Escribe la pregunta matriz...">
                 </div>
                 <div class="col-md-3">
                   <label class="form-label text-muted small fw-bold mb-1">Nº Columnas Visibles</label>
                   <input type="number" class="form-control" id="mp_M_numCol" value="3" min="1" max="10">
                 </div>
                 <div class="col-md-6">
                   <label class="form-label text-muted small fw-bold mb-1">Filas (Sub-preguntas)</label>
                   <textarea class="form-control" id="mp_M_rows" rows="3" placeholder="Fila 1\\nFila 2\\n..."></textarea>
                 </div>
                 <div class="col-md-6">
                   <label class="form-label text-muted small fw-bold mb-1">Columnas (Opciones)</label>
                   <textarea class="form-control" id="mp_M_cols" rows="3" placeholder="Opción 1\\nOpción 2\\n..."></textarea>
                 </div>
              </div>
            </div>`;
  } else if (tipo === "tarjeta") {
    html = `
            <div class="p-3 mb-0 border rounded shadow-sm bg-white border-top border-4" style="border-top-color: #ec4899 !important;">
              <h6 class="fw-bold mb-3"><i class="fas fa-id-card me-2 text-pink" style="color:#ec4899"></i>Configuración - Pregunta Tarjeta</h6>
              <div class="row g-3">
                 <div class="col-md-12">
                   <label class="form-label fw-bold small text-primary mb-1">Descripción de la Tarjeta</label>
                   <input type="text" class="form-control" placeholder="Escribe la descripción de identificación...">
                 </div>
                 <div class="col-md-12">
                   <label class="form-label fw-bold small text-primary mb-1">Contenido HTML / Rich Text</label>
                   <textarea class="form-control" rows="4" placeholder="Contenido descriptivo de la tarjeta de presentación..."></textarea>
                 </div>
              </div>
            </div>`;
  } else {
    html = `<div class="alert alert-secondary mb-0"><i class="fas fa-info-circle me-2"></i>Funcionalidad no implementada para '${tipo}' actualmente. Elige Abierta, Cerrada, Numérica, Matriz o Tarjeta.</div>`;
  }

  c.innerHTML = html;

  if (tipo === "abierta") {
    ctrlAbierta();
  }
  if (tipo === "cerrada") {
    ctrlCerrada();
    const bC = document.getElementById("mp_C_alternativas_box");
    bC.innerHTML = "";
    if (!bC.dataset.sortInit) {
      Sortable.create(bC, { handle: ".handle", animation: 150 });
      bC.dataset.sortInit = "1";
    }
    addMpcAlternativa();
  }
}

function ctrlAbierta() {
  const td = document.getElementById("mp_A_tipoDato").value;
  document.getElementById("mp_A_boxText").style.display =
    td === "texto" || td === "texto_imagen" ? "block" : "none";
  document.getElementById("mp_A_boxImage").style.display =
    td === "imagen" || td === "texto_imagen" ? "block" : "none";

  const tr = document.getElementById("mp_A_tipoResp").value;
  const isMulti = tr === "multiple";
  document.getElementById("mp_A_boxNumResp").style.display = isMulti
    ? "block"
    : "none";
  document.getElementById("mp_A_boxNumRespValidas").style.display = isMulti
    ? "block"
    : "none";

  const boxNumCol = document.getElementById("mp_A_boxNumCol");
  const tipoVista = document.getElementById("mp_A_tipoVista");
  if (boxNumCol && tipoVista) {
    boxNumCol.style.display = tipoVista.value === "3" ? "block" : "none";
  }

  const rdSi = document.getElementById("mp_A_precargaSi");
  const boxPrecarga = document.getElementById("mp_A_boxPrecarga");
  const countFields = isMulti
    ? parseInt(document.getElementById("mp_A_numResp").value) || 1
    : 1;

  if (rdSi && rdSi.checked) {
    boxPrecarga.style.display = "block";
    const fields = document.getElementById("mp_A_precargaFields");
    if (fields && !fields.dataset.sepoManagedOpenPrecarga) {
      fields.innerHTML = "";
    }
  } else {
    boxPrecarga.style.display = "none";
  }
}

function ctrlCerrada() {
  const td = document.getElementById("mp_C_tipoDato").value;
  document.getElementById("mp_C_boxText").style.display =
    td === "texto" || td === "texto_imagen" ? "block" : "none";
  document.getElementById("mp_C_boxImage").style.display =
    td === "imagen" || td === "texto_imagen" ? "block" : "none";
  const tr = document.getElementById("mp_C_tipoResp").value;
  document.getElementById("mp_C_boxNumResp").style.display =
    tr === "multiple" ? "block" : "none";
}

function addMpcAlternativa() {
  const box = document.getElementById("mp_C_alternativas_box");
  const n = box.querySelectorAll(".item-alt").length + 1;
  const div = document.createElement("div");
  div.className =
    "d-flex gap-2 align-items-center p-2 border rounded bg-white shadow-sm item-alt";
  div.innerHTML = `
            <i class="fas fa-grip-vertical text-black-50 handle" style="cursor: grab;"></i>
            <input type="number" class="pos-input d-none" value="${n}">
            <div style="width: 40px;" class="text-center fw-bold text-primary badge-bullet">A)</div>
            <input type="text" class="form-control form-control-sm manual-bullet-input" placeholder="Viñeta" style="width: 90px; display:none;" oninput="const p = this.closest('[id]'); if (p) renumerarContenedor('#' + p.id);">
            <div style="width: 100px;">
              <select class="form-select form-select-sm mpc-tipoalt bg-light text-muted" onchange="swMpcAlt(this)">
                 <option value="texto">Texto</option>
                 <option value="imagen">Imagen</option>
              </select>
            </div>
            <div class="flex-grow-1 mpc-dynamic-box d-flex align-items-center gap-2">
               <input type="text" class="form-control form-control-sm border-primary" placeholder="Descripción de la alternativa...">
               <div class="img-preview-circle d-none"></div>
            </div>
            <button class="btn btn-sm btn-outline-primary border-0" title="Duplicar" onclick="duplicarAlternativa(this)"><i class="fas fa-copy"></i></button>
            <button class="btn btn-sm btn-outline-danger border-0" title="Eliminar" onclick="const p = this.closest('[id]'); this.closest('.item-alt').remove(); renumerarContenedor('#' + p.id);"><i class="fas fa-times"></i></button>
         `;
  box.appendChild(div);
  const selectorVineta = document.getElementById("mp_C_vineta");
  if (selectorVineta) {
    actualizarModoVineta(selectorVineta, "mp_C_alternativas_box");
  } else {
    renumerarContenedor("#mp_C_alternativas_box");
  }
}

function addMpaAlternativa() {
  const box = document.getElementById("mp_A_alternativas_box");
  const n = box.querySelectorAll(".item-alt").length + 1;
  const div = document.createElement("div");
  div.className =
    "d-flex gap-2 align-items-center p-2 border rounded bg-white shadow-sm item-alt";
  div.innerHTML = `
            <i class="fas fa-grip-vertical text-black-50 handle" style="cursor: grab;"></i>
            <input type="number" class="pos-input d-none" value="${n}">
            <div style="width: 40px;" class="text-center fw-bold text-warning badge-bullet">A)</div>
            <input type="text" class="form-control form-control-sm manual-bullet-input" placeholder="Viñeta" style="width: 90px; display:none;" oninput="const p = this.closest('[id]'); if (p) renumerarContenedor('#' + p.id);">
            <div style="width: 100px;">
              <select class="form-select form-select-sm mpc-tipoalt bg-light text-muted" onchange="swMpcAlt(this)">
                 <option value="texto">Texto</option>
                 <option value="imagen">Imagen</option>
              </select>
            </div>
            <div class="flex-grow-1 mpc-dynamic-box d-flex align-items-center gap-2">
               <input type="text" class="form-control form-control-sm border-warning" placeholder="Descripción de la alternativa...">
               <div class="img-preview-circle d-none"></div>
            </div>
            <button class="btn btn-sm btn-outline-primary border-0" title="Duplicar" onclick="duplicarAlternativa(this)"><i class="fas fa-copy"></i></button>
            <button class="btn btn-sm btn-outline-danger border-0" title="Eliminar" onclick="const p = this.closest('[id]'); this.closest('.item-alt').remove(); renumerarContenedor('#' + p.id);"><i class="fas fa-times"></i></button>
         `;
  box.appendChild(div);
  const selectorVineta = document.getElementById("mp_A_vineta");
  if (selectorVineta) {
    actualizarModoVineta(selectorVineta, "mp_A_alternativas_box");
  } else {
    renumerarContenedor("#mp_A_alternativas_box");
  }
}

function duplicarAlternativa(btn) {
  const row = btn.closest(".item-alt");
  const p = row.parentNode;
  const clone = row.cloneNode(true);
  // Transfer select states
  const selOriginal = row.querySelector("select");
  const selClone = clone.querySelector("select");
  if (selOriginal && selClone) {
    selClone.value = selOriginal.value;
  }
  row.after(clone);
  renumerarContenedor("#" + p.id);
}

function swMpcAlt(sel) {
  const c = sel.parentElement.nextElementSibling;
  if (sel.value === "texto") {
    c.innerHTML =
      '<input type="text" class="form-control form-control-sm border-primary" placeholder="Descripción de la alternativa..." oninput="sepoUpdateClosedPrecargaUI()"><div class="img-preview-circle d-none"></div>';
  } else {
    c.innerHTML = `
              <div class="d-flex flex-column gap-2 w-100 p-3 border rounded bg-white shadow-sm mt-1 mb-1">
                 <div class="d-flex align-items-center justify-content-between mb-1">
                    <div class="d-flex align-items-center gap-2">
                       <i class="fas fa-image text-primary"></i>
                       <span class="small fw-bold text-primary">Modo Imagen</span>
                    </div>
                    <select class="form-select form-select-sm w-auto border-secondary mpc-img-size-sel" onchange="swMpcImgSize(this)">
                      <option value="small">Pequeño</option>
                      <option value="medium" selected>Mediano</option>
                      <option value="large">Grande</option>
                      <option value="otros">Otros (Personalizado)</option>
                    </select>
                 </div>
                 <div class="d-flex gap-3 align-items-start">
                    <div class="img-preview-box border rounded d-flex align-items-center justify-content-center bg-light" style="width: 100px; height: 100px; overflow: hidden; border-style: dashed !important;">
                       <i class="fas fa-image text-muted opacity-25 fa-2x"></i>
                    </div>
                    <div class="flex-grow-1 d-flex flex-column gap-2">
                       <small class="text-muted fw-semibold">Seleccionar archivo de imagen:</small>
                       <input type="file" class="form-control form-control-sm" accept="image/*" onchange="previewImgAlt(this)">
                       <div class="mpc-img-custom-size d-none gap-2 align-items-center shadow-none p-0 mt-1">
                          <div class="flex-grow-1">
                            <input type="number" class="form-control form-control-sm mpc-img-w" placeholder="Ancho px" title="Ancho en píxeles">
                          </div>
                          <div class="flex-grow-1">
                            <input type="number" class="form-control form-control-sm mpc-img-h" placeholder="Alto px" title="Alto en píxeles">
                          </div>
                       </div>
                       <input type="text" class="form-control form-control-sm mt-1" placeholder="Texto descriptivo o valor de la alternativa..." oninput="sepoUpdateClosedPrecargaUI()">
                    </div>
                 </div>
              </div>`;
  }
}

window.swMpcImgSize = function (sel) {
  // Buscamos el contenedor de la alternativa o del cuerpo del modal
  const container =
    sel.closest(".item-alt") ||
    sel.closest(".p-3") ||
    sel.closest(".modal-body") ||
    sel.parentElement;
  if (!container) return;

  // Buscamos el bloque de dimensiones personalizadas dentro de ese contenedor
  const custom =
    container.querySelector(".mpc-img-custom-size") ||
    container.querySelector(".mpc-img-custom-size-master");
  if (custom) {
    const isOtros = sel.value === "otros";
    custom.classList.toggle("d-none", !isOtros);
    custom.classList.toggle("d-flex", isOtros);
  }
};

function sepoUpdateClosedPrecargaUI() {
  const box = document.getElementById("mp_C_alternativas_box");
  const precargaBox = document.getElementById("mp_C_precarga_dynamic_box");
  const tipoRespEl = document.getElementById("mp_C_tipoResp");
  const isMulti = tipoRespEl && tipoRespEl.value === "multiple";
  if (!box || !precargaBox) return;

  const items = Array.from(box.querySelectorAll(".item-alt"));
  const options = items.map(function (item, idx) {
    const input = item.querySelector('.mpc-dynamic-box input[type="text"]');
    const val = input ? input.value : "";
    const bulletInput = item.querySelector(".manual-bullet-input");
    const bullet =
      (bulletInput && bulletInput.value) ||
      obtenerVinetaAutomatica(idx, items.length, getTipoVinetaContenedor(box));
    return { id: idx, text: val || "Alternativa " + (idx + 1), bullet: bullet };
  });

  if (!options.length) {
    precargaBox.innerHTML =
      '<div class="alert alert-light border-dashed py-2 mb-0 small text-center text-muted">Añade alternativas para configurar la precarga.</div>';
    return;
  }

  if (isMulti) {
    precargaBox.innerHTML = `<div class="d-flex flex-wrap gap-2 mt-2">
            ${options
              .map(function (opt) {
                return `
                <div class="form-check p-2 border rounded bg-white shadow-sm d-flex align-items-center" style="min-width:140px;">
                  <input class="form-check-input ms-1 me-2" type="checkbox" name="mp_C_precarga_check" id="prec_alt_${opt.id}" value="${opt.id}">
                  <label class="form-check-label small fw-semibold text-truncate" for="prec_alt_${opt.id}" title="${opt.text}">${opt.bullet} ${opt.text}</label>
                </div>`;
              })
              .join("")}
          </div>`;
  } else {
    precargaBox.innerHTML = `<select class="form-select form-select-sm mt-2 border-primary" id="mp_C_precarga_sel">
            <option value="">-- Sin precarga (vacío) --</option>
            ${options
              .map(function (opt) {
                return `<option value="${opt.id}">${opt.bullet} ${opt.text}</option>`;
              })
              .join("")}
          </select>`;
  }
}

function previewImgAlt(input) {
  const wrap = input.closest(".p-3") || input.parentElement;
  const preview = wrap ? wrap.querySelector(".img-preview-box") : null;
  if (!preview) return;

  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:contain;">`;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function previsualizarPregunta() {
  console.log("Iniciando previsualización de pregunta...");
  try {
    const tipoSel = document.getElementById("mpTipoPreg_Master");
    const tipo = tipoSel ? tipoSel.value : null;

    if (!tipo) {
      showToast("Seleccione un tipo de pregunta primero.");
      return;
    }

    if (typeof window.sepoReadCurrentQuestionConfig !== "function") {
      showToast("Err: Motor de configuración no cargado.");
      return;
    }

    const cfg = window.sepoReadCurrentQuestionConfig(tipo);
    const qCfg = tipo === "abierta" ? cfg.abierta : cfg.cerrada;
    if (!qCfg) {
      showToast("Error al leer la configuración actual.");
      return;
    }

    // Construcción de la data para el motor de preview (qData)
    const qData = {
      id: "preview_q",
      tipo: tipo,
      texto: qCfg.texto || "Pregunta sin título",
      vineta: tipo === "cerrada" ? qCfg.vineta || "may" : "may",
      multiple: tipo === "cerrada" && qCfg.tipoResp === "multiple",
      alternativas: (qCfg.alternativas || []).map(function (a) {
        return {
          texto: a.texto,
          tipo: a.tipo,
          size: a.size,
          w: a.w,
          h: a.h,
          vinetaManual: a.vinetaManual,
        };
      }),
      opciones: (qCfg.alternativas || []).map(function (a) {
        return a.texto;
      }),
      precarga: qCfg.precarga || "",
      respuestaEsperada: qCfg.respuestaEsperada || "",
      valorEsperado: qCfg.valorEsperado || "",
    };

    // Fallback para matriz que no usa alternativas dinámicas aún
    if (tipo === "matriz") {
      const rowsVal = document.getElementById("mp_M_rows")?.value || "";
      const colsVal = document.getElementById("mp_M_cols")?.value || "";
      qData.filas = rowsVal
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s);
      qData.columnas = colsVal
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s);
      if (!qData.filas.length) qData.filas = ["Fila A", "Fila B"];
      if (!qData.columnas.length) qData.columnas = ["Col 1", "Col 2"];
    }

    // Asignación a variable global
    pvData = {
      titulo: "Previsualización Local",
      icono: "👁️",
      tipo: "Diseñador de Pregunta",
      desc: "Vista preliminar de los ajustes en tiempo real.",
      tiempo: "--:--",
      preguntas: [qData],
    };

    pvIdx = 0;
    pvSeconds = 0;
    pvRespuestas = {};

    // Actualización de elementos de cabecera del modal
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setText("pvTitle", pvData.titulo);
    setText("pvSubtitle", pvData.tipo);
    setText("pvIcon", pvData.icono);
    setText("pvCoverIcon", pvData.icono);
    setText("pvCoverTitle", pvData.titulo);
    setText("pvCoverDesc", pvData.desc);
    setText("pvTotalQ", 1);
    setText("pvEstTime", pvData.tiempo);

    // Force skip cover directly to questions for quick preview
    pvShow("pvPortada", false);
    pvShow("pvPreguntas", true, "block");
    pvShow("pvFinal", false);

    const pvT = document.getElementById("pvTimer");
    if (pvT) pvT.style.display = "none"; // Ocultamos el cronómetro en vista previa rápida

    renderPregunta();

    // Ocultar modal de edición momentaneamente (cerrar el que esté abierto)
    const editModal = document.getElementById("modalNuevaPregunta");
    if (editModal && typeof bootstrap !== "undefined") {
      const m =
        bootstrap.Modal.getInstance(editModal) ||
        new bootstrap.Modal(editModal);
      if (m) m.hide();
    }

    // Mostrar modal de preview
    const previewEl = document.getElementById("modalPreview");
    if (previewEl && typeof bootstrap !== "undefined") {
      const pm =
        bootstrap.Modal.getInstance(previewEl) ||
        new bootstrap.Modal(previewEl);
      pm.show();

      // Al cerrar, intentamos reabrir el editor
      const cleanupPreview = () => {
        const nModal = document.getElementById("modalNuevaPregunta");
        if (nModal) {
          const nm =
            bootstrap.Modal.getInstance(nModal) || new bootstrap.Modal(nModal);
          nm.show();
        }
        previewEl.removeEventListener("hidden.bs.modal", cleanupPreview);
      };
      previewEl.addEventListener("hidden.bs.modal", cleanupPreview);
    }
  } catch (e) {
    console.error("Error en Previsualizar Pregunta:", e);
    showToast("Error técnico al previsualizar. Revisa la consola.");
  }
}

let preguntaActualEditando = null;

function editarPreguntaRow(btn) {
  preguntaActualEditando = btn.closest(".item-row");
  const tipo = preguntaActualEditando.getAttribute("data-tipo");
  const txt = preguntaActualEditando.querySelector(".desc-text").textContent;

  const sel = document.getElementById("mpTipoPreg_Master");
  if (sel) {
    sel.value = tipo;
    renderizarControlesPregunta();
    setTimeout(() => {
      const mapIdA = "mp_A_text";
      const mapIdC = "mp_C_text";
      if (tipo === "abierta" && document.getElementById(mapIdA)) {
        document.getElementById(mapIdA).value = txt;
      } else if (tipo === "cerrada" && document.getElementById(mapIdC)) {
        document.getElementById(mapIdC).value = txt;
      }
      new bootstrap.Modal(document.getElementById("modalNuevaPregunta")).show();
    }, 50);
  }
}

function guardarNuevaPregunta() {
  const tipo = document.getElementById("mpTipoPreg_Master").value;
  if (!tipo) {
    alert("Selecciona el tipo de pregunta");
    return;
  }

  let txt =
    "Nueva Pregunta " +
    (document.querySelectorAll("#boxPreg .item-row").length + 1);
  if (tipo === "abierta" && document.getElementById("mp_A_text"))
    txt = document.getElementById("mp_A_text").value || txt;
  if (tipo === "cerrada" && document.getElementById("mp_C_text"))
    txt = document.getElementById("mp_C_text").value || txt;

  const div = document.createElement("div");

  if (preguntaActualEditando) {
    // Edit mode
    let n = 1;
    const posInput = preguntaActualEditando.querySelector(".pos-input");
    if (posInput) n = parseInt(posInput.value) || 1;

    div.innerHTML = rowPregunta(n, txt, tipo);
    preguntaActualEditando.outerHTML = div.innerHTML;
    preguntaActualEditando = null;
    showToast("✅ Pregunta actualizada.");
  } else {
    // Create mode
    const n = document.querySelectorAll("#boxPreg .item-row").length + 1;
    div.innerHTML = rowPregunta(n, txt, tipo);
    const empty = document.getElementById("emptyPreg");
    if (empty) empty.remove();
    document.getElementById("boxPreg").appendChild(div.firstElementChild);
    showToast("✅ Pregunta generada y guardada.");
  }

  bootstrap.Modal.getInstance(
    document.getElementById("modalNuevaPregunta"),
  ).hide();
}

function addAlternativa() {
  const clave = document.getElementById("altClave").value.trim().toUpperCase(),
    desc = document.getElementById("altDesc").value.trim(),
    pts = document.getElementById("altPts").value.trim();
  if (!clave || !desc) {
    alert("Completa clave y descripción.");
    return;
  }
  pushItem("boxAlt", "emptyAlt", rowAlternativa(clave, desc, pts));
  ["altClave", "altDesc", "altPts"].forEach(
    (id) => (document.getElementById(id).value = ""),
  );
}
function rowAlternativa(clave, desc, pts) {
  return `<div class="item-row"><div class="inf"><span class="tag" style="background:#F3E8FF;color:#6B21A8;font-weight:700">${clave}</span><span class="fw-medium">${desc}</span>${pts !== "" ? `<span class="tag" style="background:#E0F2FE;color:#0369A1">${pts} pts</span>` : ""}</div><button class="btn btn-light rounded-circle text-danger p-0" style="width:32px;height:32px;" onclick="this.closest('.item-row').remove()"><i class="fas fa-times"></i></button></div>`;
}

function insertarFormula(txt) {
  const t = document.getElementById("facFormula");
  if (!t) return;
  const current = String(t.value || "");
  const incoming = String(txt || "");
  t.value = current
    ? current + (current.endsWith(" ") ? "" : " ") + incoming
    : incoming;
  syncFormula(t.value);
}

function syncFormula(val) {
  const excelInput = document.getElementById("excelFormulaInput");
  const facFormula = document.getElementById("facFormula");
  const preview = document.getElementById("formulaTextPreview");
  const panel = document.getElementById("formulaPreviewFinal");

  if (excelInput) excelInput.value = val;
  if (facFormula) facFormula.value = val;
  if (!preview || !panel) return;

  const openP = (String(val || "").match(/\(/g) || []).length;
  const closeP = (String(val || "").match(/\)/g) || []).length;

  if (openP !== closeP) {
    preview.textContent = String(val || "") + " (⚠️ Paréntesis no cerrados)";
    preview.className =
      "monospace fw-bold text-danger fs-5 animate__animated animate__pulse";
    panel.className =
      "bg-danger bg-opacity-10 p-3 rounded border border-danger border-opacity-25";
  } else {
    preview.textContent = val || "...";
    preview.className = "monospace fw-bold text-success fs-5";
    panel.className =
      "bg-success bg-opacity-10 p-3 rounded border border-success border-opacity-25";
  }
}

function generarRangoSuma() {
  const input = document.getElementById("rangeSumInput").value.trim();
  if (!input.includes("-")) {
    alert("Use el formato inicio-fin (Ej: 1-10)");
    return;
  }
  const parts = input.split("-");
  const inicio = parseInt(parts[0]);
  const fin = parseInt(parts[1]);

  if (isNaN(inicio) || isNaN(fin) || inicio >= fin) {
    alert("Rango inválido.");
    return;
  }

  let formula = "";
  for (let i = inicio; i <= fin; i++) {
    formula += `{P${i}_PTJ}`;
    if (i < fin) formula += " + ";
  }

  insertarFormula(formula);
  document.getElementById("rangeSumInput").value = "";
  showToast("✅ Rango de suma generado.");
}

function insertarEnExcel(fn) {
  insertarFormula(fn);
}

function filterFormulaTemplates(query) {
  const box = document.getElementById("smartTemplatesBox");
  const items = box.querySelectorAll(".p-2");
  const q = query.toLowerCase();
  items.forEach((it) => {
    const text = it.textContent.toLowerCase();
    it.style.display = text.includes(q) ? "block" : "none";
  });
}

let factorActualEditando = null;

function addFactor() {
  const cod = document.getElementById("facCod").value.trim().toUpperCase();
  const desc = document.getElementById("facDesc").value.trim();
  const formula = document.getElementById("facFormula")
    ? document.getElementById("facFormula").value.trim()
    : "";

  if (!cod || !desc) {
    alert("Completa código y descripción.");
    return;
  }

  if (factorActualEditando) {
    // Update mode
    factorActualEditando.innerHTML = rowFactorHTML(cod, desc, formula);
    factorActualEditando = null;
    showToast("✅ Factor actualizado.");

    // Reset button text
    const btn = document.querySelector('button[onclick="addFactor()"]');
    if (btn)
      btn.innerHTML = '<i class="fas fa-save me-2"></i> Guardar Nuevo Factor';
  } else {
    // Create mode
    pushItem("boxFac", "emptyFac", rowFactor(cod, desc, formula));
    showToast("✅ Factor guardado.");
  }

  // Reset fields
  document.getElementById("facCod").value = "";
  document.getElementById("facDesc").value = "";
  if (document.getElementById("facFormula")) {
    document.getElementById("facFormula").value = "";
    syncFormula("");
  }
}
function rowPregunta(n, txt, tipo) {
  let lbl = tipo.charAt(0).toUpperCase() + tipo.slice(1);
  let badgeColor = "bg-primary";
  if (tipo === "abierta") badgeColor = "bg-warning text-dark";
  else if (tipo === "cerrada") badgeColor = "bg-primary";
  else if (tipo === "matriz") badgeColor = "bg-info text-dark";
  else if (tipo === "tarjeta") badgeColor = "bg-danger";
  else if (tipo === "numerica") badgeColor = "bg-success";
  else if (tipo === "imagen") badgeColor = "bg-dark text-white";

  return `<div class="item-row d-flex align-items-center mb-2 p-2 border rounded bg-light" draggable="true" ondragstart="dragPregRow(event)" ondragover="dragOverPregRow(event)" ondrop="dropPregRow(event)" ondragend="dragEndPregRow(event)" data-tipo="${tipo}">
          <i class="fas fa-grip-vertical handle me-3 text-muted" style="cursor: grab;"></i>
          <input type="number" class="form-control form-control-sm text-center pos-input me-3" style="width: 65px;" value="${n}" onchange="reordenarPorInput(this, '#boxPreg')">
          <span class="badge bg-primary me-3">P${n}</span>
          <span class="desc-text desc fw-medium flex-grow-1 px-2 py-1 editable-text rounded" contenteditable="true" onblur="this.scrollLeft = 0" onkeydown="if(event.key==='Enter'){event.preventDefault(); this.blur();}" title="Haga clic para editar nombre de pregunta">${txt}</span>
          <span class="badge ${badgeColor} me-3">${lbl}</span>
          <button class="btn btn-sm btn-outline-primary ms-1" data-bs-toggle="tooltip" title="Editar pregunta actual" onclick="editarPreguntaRow(this)"><i class="fas fa-pen"></i></button>
          <button class="btn btn-sm btn-outline-secondary ms-1" data-bs-toggle="tooltip" title="Clonar pregunta con todos sus atributos" onclick="duplicarPregunta(this)"><i class="fas fa-copy"></i></button>
          <button class="btn btn-sm btn-outline-danger ms-1" data-bs-toggle="tooltip" title="Eliminar pregunta" onclick="this.closest('.item-row').remove(); renumerarContenedor('#boxPreg');"><i class="fas fa-trash"></i></button>
        </div>`;
}

function rowFactor(cod, desc, formula = "") {
  return `<div class="item-row d-flex align-items-center mb-2 p-2 border rounded bg-light" data-cod="${cod}" data-desc="${desc}" data-formula="${formula}">
          ${rowFactorHTML(cod, desc, formula)}
        </div>`;
}

function rowFactorHTML(cod, desc, formula) {
  const fBadge = formula
    ? `<span class="badge bg-light text-primary border ms-2 d-inline-block mt-1 text-truncate" style="max-width:200px;" title="${formula}"><i class="fas fa-square-root-alt me-1"></i>${formula}</span>`
    : "";
  return `
          <div class="inf flex-grow-1">
            <span class="tag tag-punt fw-bold">${cod}</span>
            <span class="fw-medium">${desc}</span>
            ${fBadge}
          </div>
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-outline-primary" title="Editar Factor" onclick="editarFactorRow(this)"><i class="fas fa-pen"></i></button>
            <button class="btn btn-sm btn-outline-secondary" title="Duplicar Factor" onclick="duplicarFactor(this)"><i class="fas fa-copy"></i></button>
            <button class="btn btn-sm btn-outline-danger" title="Eliminar" onclick="this.closest('.item-row').remove()"><i class="fas fa-times"></i></button>
          </div>
        `;
}

function editarFactorRow(btn) {
  const row = btn.closest(".item-row");
  const cod = row.getAttribute("data-cod");
  const desc = row.getAttribute("data-desc");
  const formula = row.getAttribute("data-formula");

  document.getElementById("facCod").value = cod;
  document.getElementById("facDesc").value = desc;
  if (document.getElementById("facFormula")) {
    document.getElementById("facFormula").value = formula;
    syncFormula(formula);
  }

  factorActualEditando = row;

  // Update button text to indicate edit mode
  const saveBtn = document.querySelector('button[onclick="addFactor()"]');
  if (saveBtn)
    saveBtn.innerHTML = '<i class="fas fa-sync me-2"></i> Actualizar Factor';

  // Scroll to form
  document
    .getElementById("facCod")
    .scrollIntoView({ behavior: "smooth", block: "center" });
}

function duplicarFactor(btn) {
  const row = btn.closest(".item-row");
  const cod = row.getAttribute("data-cod") + "_COPY";
  const desc = row.getAttribute("data-desc") + " (Copia)";
  const formula = row.getAttribute("data-formula");

  pushItem("boxFac", "emptyFac", rowFactor(cod, desc, formula));
  showToast("✅ Factor duplicado.");
}

function addRespuesta() {
  const prg = document.getElementById("respPrg").value.trim(),
    clave = document.getElementById("respClave").value.trim().toUpperCase(),
    fac = document.getElementById("respFac").value.trim().toUpperCase();
  if (!prg || !clave) {
    alert("Completa pregunta y clave.");
    return;
  }
  pushItem("boxResp", "emptyResp", rowRespuesta(prg, clave, fac));
  ["respPrg", "respClave", "respFac"].forEach(
    (id) => (document.getElementById(id).value = ""),
  );
}
function rowRespuesta(prg, clave, fac) {
  return `<div class="item-row"><div class="inf"><span class="tag" style="background:#EFF6FF;color:#1D4ED8;font-weight:700">P${prg}</span><span class="tag" style="background:#F3E8FF;color:#6B21A8;font-weight:700">→ ${clave}</span>${fac ? `<span class="tag tag-niv fw-bold">${fac}</span>` : ""}</div><button class="btn btn-light rounded-circle text-danger p-0" style="width:32px;height:32px;" onclick="this.closest('.item-row').remove()"><i class="fas fa-times"></i></button></div>`;
}

function aplicarPlantillaRespuesta() {
  const tpl = document.getElementById("tplRespSelect").value;
  if (!tpl) return;

  const pregs = document.querySelectorAll("#boxPreg .item-row").length;
  if (pregs === 0) {
    showToast("⚠️ No hay preguntas para asignar plantillas.");
    return;
  }

  const templates = {
    likert5: [
      "A: Siempre",
      "B: Frecuentemente",
      "C: A veces",
      "D: Raramente",
      "E: Nunca",
    ],
    likert4: [
      "A: Totalmente de acuerdo",
      "B: De acuerdo",
      "C: En desacuerdo",
      "D: Totalmente en desacuerdo",
    ],
    si_no: ["A: Sí", "B: No"],
    frecuencia: ["A: Mucho", "B: Regular", "C: Poco", "D: Nada"],
  };

  const selected = templates[tpl];
  if (selected) {
    confirmarGeneral(
      "Cargar Plantilla",
      `Se generarán claves para ${pregs} preguntas basadas en la plantilla. ¿Continuar?`,
      () => {
        const box = document.getElementById("boxResp");
        const empty = document.getElementById("emptyResp");
        if (empty) empty.remove();

        const pregBadges = Array.from(
          document.querySelectorAll("#boxPreg .item-row .badge.bg-primary"),
        ).map((b) => b.textContent.replace("P", ""));
        pregBadges.forEach((qNum) => {
          selected.forEach((opt) => {
            const clave = opt.split(":")[0].trim();
            const div = document.createElement("div");
            div.innerHTML = rowRespuesta(qNum, clave, "");
            box.appendChild(div.firstElementChild);
          });
        });
        showToast("✅ Plantilla aplicada con éxito.");
        document.getElementById("tplRespSelect").value = "";
      },
    );
  }
}

/* ── DRAG & DROP para listas de orden de prestaciones ── */
let _dragSrc = null;

function initDrag(el) {
  el.setAttribute("draggable", "true");
  el.addEventListener("dragstart", function (e) {
    _dragSrc = this;
    this.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  });
  el.addEventListener("dragend", function () {
    this.classList.remove("dragging");
    document
      .querySelectorAll(".drag-over")
      .forEach((n) => n.classList.remove("drag-over"));

    // Feedback visual de confirmación
    this.classList.add("drop-flash");
    setTimeout(() => {
      this.classList.remove("drop-flash");
    }, 500);
  });
  el.addEventListener("dragover", function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (this !== _dragSrc) this.classList.add("drag-over");
  });
  el.addEventListener("dragleave", function () {
    this.classList.remove("drag-over");
  });
  el.addEventListener("drop", function (e) {
    e.stopPropagation();
    e.preventDefault();
    this.classList.remove("drag-over");
    if (
      _dragSrc &&
      _dragSrc !== this &&
      this.parentElement === _dragSrc.parentElement
    ) {
      const lista = this.parentElement;
      const items = Array.from(lista.querySelectorAll(".card-item"));
      const srcIdx = items.indexOf(_dragSrc);
      const tgtIdx = items.indexOf(this);
      if (srcIdx < tgtIdx) {
        lista.insertBefore(_dragSrc, this.nextSibling);
      } else {
        lista.insertBefore(_dragSrc, this);
      }

      // Actualizar índices visuales
      lista.querySelectorAll(".card-item").forEach((item, idx) => {
        const inputNum = item.querySelector("input[type='number']");
        if (inputNum) inputNum.value = idx + 1;
      });
    }
    _dragSrc = null;
  });
}

function initDragList(listId) {
  const lista = document.getElementById(listId);
  if (!lista) return;
  lista.querySelectorAll(".card-item").forEach(initDrag);
}

document.addEventListener("DOMContentLoaded", function () {
  initDragList("lista-sepo");
  initDragList("lista-complementario");
});

function updatePrestIconos() {
  document
    .querySelectorAll("#screen-prestaciones .card-item")
    .forEach((card) => {
      const icono = card.dataset.icono || "stethoscope"; // default
      const iconEl = card.querySelector(".icon-box i");
      if (iconEl) {
        iconEl.className = `fas fa-${icono}`;
      }
    });
}

// Ejecutar al cargar
document.addEventListener("DOMContentLoaded", updatePrestIconos);

let _accionOnConfirm = null;
function confirmarGeneral(
  titulo,
  mensaje,
  accionOnConfirm,
  tipo = "guardar",
  icono = "fa-save",
) {
  document.getElementById("mConfirmTitle").textContent = titulo;
  document.getElementById("mConfirmMsg").textContent = mensaje;
  const iconDiv = document.getElementById("mConfirmIcon");
  iconDiv.innerHTML = '<i class="fas ' + icono + '"></i>';
  const btn = document.getElementById("mConfirmBtn");
  if (tipo === "eliminar") {
    iconDiv.style.background = "#fee2e2";
    iconDiv.style.color = "#dc2626";
    btn.className = "btn btn-danger rounded-pill px-4 fw-bold shadow-sm";
    btn.innerHTML = "Eliminar";
  } else {
    iconDiv.style.background = "#e0f2fe";
    iconDiv.style.color = "var(--primary)";
    btn.className = "btn-prim px-4";
    btn.innerHTML = '<i class="fas fa-save me-2"></i>Guardar';
  }
  _accionOnConfirm = () => {
    const mEl = document.getElementById("modalConfirm");
    const modalInstance = bootstrap.Modal.getInstance(mEl);
    if (modalInstance) modalInstance.hide();
    if (accionOnConfirm) accionOnConfirm();
  };
  new bootstrap.Modal(document.getElementById("modalConfirm")).show();
}
document.getElementById("mConfirmBtn")?.addEventListener("click", () => {
  if (_accionOnConfirm) _accionOnConfirm();
});
function confirmarGuardar(modulo, accionOnConfirm) {
  confirmarGeneral(
    "¿Guardar cambios?",
    "Desea guardar los cambios en " + modulo + "?",
    () => {
      // Simular registro en historial
      agregarAlHistorialDemo(modulo, "Guardar / Actualizar");
      if (accionOnConfirm) accionOnConfirm();
    },
    "guardar",
    "fa-save",
  );
}

// --- LOGICA DE HISTORIAL (DEMO) ---
let _historialDemo = [
  {
    fecha: "2023-10-25 10:30",
    usuario: "Admin",
    accion: "Editar",
    registro: "SED-001",
    detalles: "Cambio de dirección",
    modulo: "Centros Médicos",
  },
  {
    fecha: "2023-10-24 15:45",
    usuario: "mlozano",
    accion: "Nuevo",
    registro: "GI-015",
    detalles: "Postgrado",
    modulo: "Grado de Instrucción",
  },
  {
    fecha: "2023-10-23 09:12",
    usuario: "Admin",
    accion: "Activar",
    registro: "OC-005",
    detalles: "Re-apertura de vacante",
    modulo: "Ocupaciones",
  },
  {
    fecha: "2023-10-23 11:45",
    usuario: "mlozano",
    accion: "Nuevo",
    registro: "GO-004",
    detalles: "Creación de grupo salud",
    modulo: "Grupos Ocupacionales",
  },
  {
    fecha: "2023-10-22 11:20",
    usuario: "jclark",
    accion: "Reordenar",
    registro: "PR-PSI-001",
    detalles: "Se movió al primer lugar de prioridad",
    modulo: "Orden de Prestaciones",
  },
  {
    fecha: "2023-10-22 14:05",
    usuario: "Admin",
    accion: "Editar",
    registro: "PR-ALT-002",
    detalles: "Actualización de factores asociados",
    modulo: "Orden de Prestaciones",
  },
  {
    fecha: "2023-10-21 16:30",
    usuario: "mlozano",
    accion: "Guardar",
    registro: "Protocolo 2024",
    detalles: "Ajuste masivo de posiciones",
    modulo: "Orden de Prestaciones",
  },
  {
    fecha: "2023-10-20 09:45",
    usuario: "Admin",
    accion: "Nuevo",
    registro: "PR-LAB-050",
    detalles: "Nuevo examen de sangre",
    modulo: "Prestaciones",
  },
  {
    fecha: "2023-10-19 14:12",
    usuario: "jclark",
    accion: "Editar",
    registro: "CPS-005",
    detalles: "Corrección de ortografía en etiqueta",
    modulo: "Fichas",
  },
  {
    fecha: "2023-10-18 11:05",
    usuario: "mlozano",
    accion: "Activar",
    registro: "GI-008",
    detalles: "Habilitación de grado técnico",
    modulo: "Grado de Instrucción",
  },
];

function verHistorial(modulo) {
  document.getElementById("historialModuloTitle").textContent = modulo;
  const tbody = document.getElementById("historialTableBody");
  tbody.innerHTML = "";

  const filtrados = _historialDemo.filter((h) => h.modulo === modulo);

  if (filtrados.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="text-center py-4 text-muted">No hay cambios registrados recientemente.</td></tr>';
  } else {
    filtrados.reverse().forEach((h) => {
      tbody.innerHTML += `
              <tr>
                <td class="ps-4 fw-medium text-muted">${h.fecha}</td>
                <td><span class="badge bg-light text-dark border-0 shadow-none" style="font-weight: 600;">@${h.usuario}</span></td>
                <td><span class="tag ${h.accion === "Nuevo" ? "tag-tipo" : "tag-niv"}">${h.accion}</span></td>
                <td><strong class="text-primary">${h.registro}</strong></td>
                <td class="pe-4 text-muted fst-italic">${h.detalles}</td>
              </tr>
            `;
    });
  }

  new bootstrap.Modal(document.getElementById("modalHistorial")).show();
}

function agregarAlHistorialDemo(modulo, accion) {
  const ahora = new Date();
  const fechaStr =
    ahora.getFullYear() +
    "-" +
    (ahora.getMonth() + 1).toString().padStart(2, "0") +
    "-" +
    ahora.getDate().toString().padStart(2, "0") +
    " " +
    ahora.getHours().toString().padStart(2, "0") +
    ":" +
    ahora.getMinutes().toString().padStart(2, "0");

  _historialDemo.push({
    fecha: fechaStr,
    usuario: "Usuario Logueado",
    accion: accion,
    registro: "ID-" + Math.floor(Math.random() * 900 + 100),
    detalles: "Cambios guardados desde el módulo",
    modulo: modulo,
  });
}
function confirmarEliminar(titulo, mensaje, accionOnConfirm) {
  confirmarGeneral(titulo, mensaje, accionOnConfirm, "eliminar", "fa-trash");
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("collapsed");
  document.getElementById("main-content").classList.toggle("expanded");

  const isCollapsed = sidebar.classList.contains("collapsed");
  sidebar.querySelectorAll(".nav-link").forEach((link) => {
    const tooltip = bootstrap.Tooltip.getInstance(link);
    if (tooltip) {
      if (isCollapsed) tooltip.enable();
      else tooltip.disable();
    }
  });
}

// ---- LOGICA DE DEMOSTRACION UX ----
document.addEventListener("DOMContentLoaded", () => {
  // --- Funcionalidad DEMO de Búsqueda y Filtros ---
  const screens = document.querySelectorAll(".screen");
  screens.forEach((screen) => {
    // La pantalla de edición de prueba tiene combos de configuración
    // que no deben comportarse como filtros de lista.
    if (screen.id === "screen-prueba-form") return;

    // Todos los inputs tipo buscador y combos
    const textInputs = screen.querySelectorAll(
      'input[type="text"], input[type="search"]',
    );
    const selects = screen.querySelectorAll("select");

    // Buscar el contenedor padre que agrupa la lista
    const firstCard = screen.querySelector(".card-item");
    if (!firstCard) return;

    const listContainer = firstCard.parentElement;

    // Identificamos al "Buscador Principal" que solemos usar en la cabecera
    const searchInput = Array.from(textInputs).find(
      (i) =>
        (i.placeholder || "").toLowerCase().includes("buscar") ||
        (i.title || "").toLowerCase().includes("buscar"),
    );

    const filterSelects = Array.from(selects);

    const aplicarFiltros = () => {
      const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
      const cards = listContainer.querySelectorAll(".card-item");

      cards.forEach((card) => {
        let matchSearch = true;
        let matchSelects = true;
        const cardContent = card.innerText.toLowerCase();

        if (query) {
          matchSearch = cardContent.includes(query);
        }

        filterSelects.forEach((sel) => {
          const val = sel.value.toLowerCase().trim();
          // Ignoramos selecciones vacías o default
          if (
            val &&
            val !== "todos" &&
            val !== "0" &&
            val !== "" &&
            !val.includes("seleccionar")
          ) {
            const dataStatus = (card.dataset.estado || "").toLowerCase();
            const dataType = (card.dataset.tipo || "").toLowerCase();
            const optText = sel.options[sel.selectedIndex].text.toLowerCase();

            // Verificamos si el valor o el texto del filtro está en la info del card, en estado o en su tipo.
            if (
              !cardContent.includes(optText) &&
              !cardContent.includes(val) &&
              !dataStatus.includes(val) &&
              !dataType.includes(val)
            ) {
              matchSelects = false;
            }
          }
        });

        card.style.display = matchSearch && matchSelects ? "" : "none";
      });
    };

    if (searchInput) {
      searchInput.addEventListener("input", aplicarFiltros);
      // Quitamos event handlers viejos como oninput en html si chocan (aunque JS manda y convive en este caso de DEMO)
    }
    filterSelects.forEach((sel) =>
      sel.addEventListener("change", aplicarFiltros),
    );
  });

  // --- Paginación Fake Dinámica ---
  const paginations = document.querySelectorAll(".pagination");
  paginations.forEach((ul) => {
    const links = ul.querySelectorAll(".page-link");
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const li = link.parentElement;
        if (
          li.classList.contains("active") ||
          li.classList.contains("disabled")
        )
          return;

        // Interfaz (pintamos el cuadrito azul)
        ul.querySelectorAll(".page-item").forEach((i) =>
          i.classList.remove("active"),
        );
        li.classList.add("active");

        // Lógica visual simulando cambio de página
        const screen = ul.closest(".screen");
        if (screen) {
          // Localizamos contenedor global de cards
          const firstC = screen.querySelector(".card-item");
          if (firstC) {
            const container = firstC.parentElement;
            const cards = Array.from(container.querySelectorAll(".card-item"));

            // Animamos opacidad simulando carga SPA
            container.style.opacity = "0";
            container.style.transition = "opacity 0.2s ease-in-out";

            setTimeout(() => {
              // Hacemos el popular "Shuffle Array" (cambiar el orden de las cartas para que parezca data nueva)
              for (let i = cards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [cards[i], cards[j]] = [cards[j], cards[i]];
              }
              cards.forEach((c) => container.appendChild(c)); // Mueve en el DOM

              // Encontramos inputs de esta pantalla y les aplicamos blur/limpieza si aplica, para una demo queda igual
              container.style.opacity = "1";
            }, 200);
          }
        }
      });
    });
  });
});
// ------------------------------------

function reordenarPrestacion(input) {
  const card = input.closest(".card-item");
  const container = card.parentNode;
  const cards = [...container.querySelectorAll(".card-item")];
  const newPos = parseInt(input.value) - 1;
  if (newPos >= 0 && newPos < cards.length) {
    if (newPos === 0) container.prepend(card);
    else if (newPos >= cards.length - 1) container.appendChild(card);
    else {
      const target = cards[newPos];
      if (cards.indexOf(card) < newPos) target.after(card);
      else target.before(card);
    }
    card.classList.add("highlight");
    setTimeout(() => card.classList.remove("highlight"), 1000);
  }
  container
    .querySelectorAll('.card-item .pos-input, .card-item input[type="number"]')
    .forEach((inp, idx) => {
      inp.value = idx + 1;
    });
}

function editarTextoEnLinea(btn) {
  const row = btn.closest(".item-row");
  const h6 = row.querySelector("h6.desc");
  const currentText = h6.textContent;
  const input = document.createElement("input");
  input.type = "text";
  input.className = "form-control form-control-sm fw-bold";
  input.value = currentText;
  input.style.marginTop = "4px";
  h6.style.display = "none";
  h6.after(input);
  input.focus();
  btn.onclick = () => guardarTextoEnLinea(btn);
  btn.className = "btn btn-sm btn-success border";
  btn.innerHTML = '<i class="fas fa-save"></i>';
  input.onkeydown = (e) => {
    if (e.key === "Enter") guardarTextoEnLinea(btn);
  };
}

function guardarTextoEnLinea(btn) {
  const row = btn.closest(".item-row");
  const h6 = row.querySelector("h6.desc");
  const input = row.querySelector('input[type="text"].fw-bold');
  if (!input) return;
  h6.textContent = input.value;
  h6.style.display = "block";
  input.remove();
  btn.onclick = () => editarTextoEnLinea(btn);
  btn.className = "btn btn-sm btn-light border btn-edit-desc";
  btn.innerHTML = '<i class="fas fa-edit text-muted"></i>';
  showToast("✅ Descripción actualizada.");
}

// Sync footer with sidebar collapse
document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  const footer = document.getElementById("appFooter");
  const obs = new MutationObserver(() => {
    if (footer && sidebar)
      footer.style.left = sidebar.classList.contains("collapsed")
        ? "80px"
        : "260px";
  });
  if (sidebar)
    obs.observe(sidebar, {
      attributes: true,
      attributeFilter: ["class"],
    });
});

const PRUEBAS_DEMO = {
  "PSI-ANS-001": {
    titulo: "Escala de Ansiedad de Beck (BAI)",
    icono: "🧠",
    tipo: "Clínico",
    desc: "Inventario de autoinforme para medir la severidad de la ansiedad.",
    tiempo: "~10 min",
    preguntas: [
      {
        tipo: "cerrada",
        texto:
          "En la última semana, ¿con qué frecuencia ha sentido miedo a que suceda lo peor?",
        vineta: "may",
        opciones: ["Nada", "Levemente", "Moderadamente", "Gravemente"],
      },
      {
        tipo: "cerrada",
        texto:
          "Seleccione los síntomas físicos que ha experimentado con mayor intensidad (Selección Múltiple):",
        multiple: true,
        vineta: "num",
        opciones: [
          "Adormecimiento",
          "Bochornos",
          "Inestabilidad",
          "Palpitaciones",
        ],
      },
      {
        tipo: "matriz",
        texto:
          "Valore el nivel de dificultad para realizar las siguientes actividades debido a la ansiedad:",
        filas: ["Trabajar", "Socializar", "Dormir"],
        columnas: ["Sin dificultad", "Dificultad leve", "Dificultad alta"],
      },
      {
        tipo: "tarjeta",
        texto: "¿Cuál es su estado de ánimo predominante en este momento?",
        tarjetas: [
          { emoji: "🧘", label: "Relajado" },
          { emoji: "😟", label: "Inquieto" },
          { emoji: "😰", label: "Muy ansioso" },
        ],
      },
      {
        tipo: "abierta",
        texto:
          "Mencione tres situaciones específicas que le disparen episodios de ansiedad:",
        numResp: 3,
        placeholders: ["Situación 1", "Situación 2", "Situación 3"],
      },
      {
        tipo: "cerrada",
        texto:
          "Observe la siguiente ilustración sobre técnicas de respiración. ¿Le resulta familiar este método?",
        image:
          "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=400&auto=format&fit=crop",
        opciones: [
          "Sí, lo practico",
          "Lo conozco pero no lo uso",
          "No lo conozco",
        ],
      },
      {
        tipo: "abierta",
        texto:
          "Dada la imagen anterior, describa brevemente cómo se siente al practicar ejercicios de relajación:",
        placeholder: "Escriba su experiencia...",
      },
    ],
    factores: [
      { cod: "FAC-ANS-S", nom: "Ansiedad Somática" },
      { cod: "FAC-ANS-C", nom: "Ansiedad Cognitiva" },
    ],
  },
  "PSI-CMP-002": {
    titulo: "Evaluación de Competencias Volcán",
    icono: "🌋",
    tipo: "Laboral",
    desc: "Perfil de competencias para el sector minero, enfocado en seguridad y eficiencia operativa.",
    tiempo: "~20 min",
    preguntas: [
      {
        tipo: "tarjeta",
        texto: "Seleccione su área de especialidad principal:",
        tarjetas: [
          { emoji: "🚜", label: "Maquinaria Pesada" },
          { emoji: "⛏️", label: "Extracción Socavón" },
          { emoji: "🛡️", label: "Seguridad Industrial" },
          { emoji: "⚙️", label: "Mantenimiento" },
        ],
      },
      {
        tipo: "cerrada",
        texto: "¿Conoce los protocolos de emergencia del tajo abierto?",
        opciones: ["Sí, perfectamente", "Parcialmente", "No los conozco"],
      },
      {
        tipo: "cerrada",
        texto:
          "Observe la siguiente señal ética. ¿Qué indica el uso obligatorio de este elemento?",
        image:
          "https://images.unsplash.com/photo-1590483734720-394f923b4992?q=80&w=400&auto=format&fit=crop",
        opciones: [
          "Protección auditiva",
          "Protección visual",
          "Protección respiratoria",
        ],
      },
      {
        tipo: "cerrada",
        texto: "Marque las herramientas de seguridad que domina (Múltiple):",
        multiple: true,
        vineta: "min",
        opciones: ["IPERC Continuo", "ATS", "Checklist Pre-uso", "PETAR"],
      },
      {
        tipo: "matriz",
        texto: "Dominio en las siguientes operaciones:",
        filas: [
          "Operación de equipos",
          "Reporte de incidentes",
          "Primeros auxilios",
        ],
        columnas: ["Ninguno", "Básico", "Avanzado"],
      },
      {
        tipo: "abierta",
        texto:
          "Explique brevemente cómo actuaría ante un amago de incendio por cortocircuito:",
        placeholder: "Describa el protocolo...",
      },
      {
        tipo: "numerica",
        texto:
          "En una escala del 1 al 10, ¿qué tan seguro se siente en su entorno actual?",
        min: 1,
        max: 10,
      },
      {
        tipo: "abierta",
        texto: "Mencione dos mejoras que implementaría en su puesto:",
        numResp: 2,
        placeholders: ["Mejora 1", "Mejora 2"],
      },
    ],
    factores: [
      { cod: "FAC-CMP-T", nom: "Competencias Técnicas" },
      { cod: "FAC-CMP-S", nom: "Seguridad y Salud" },
    ],
  },
  "PSI-ALT-003": {
    titulo: "Evaluación Psicológica – Altura",
    icono: "⛰️",
    tipo: "Altura",
    desc: "Evaluación de aptitud psicológica para trabajos en altura geográfica.",
    tiempo: "~12 min",
    preguntas: [
      {
        tipo: "cerrada",
        texto: "¿Ha sufrido desmayos o vértigo anteriormente?",
        vineta: "rom",
        opciones: ["Nunca", "Hace más de un año", "Recientemente"],
      },
      {
        tipo: "cerrada",
        texto: "Indique si presenta alguno de estos síntomas (Múltiple):",
        multiple: true,
        opciones: [
          "Dolor de cabeza",
          "Náuseas",
          "Dificultad para respirar",
          "Visión borrosa",
        ],
      },
      {
        tipo: "cerrada",
        texto: "Observe la imagen. ¿Representa una condición segura?",
        image:
          "https://images.unsplash.com/photo-1522071823910-fe3ece41159b?q=80&w=400&auto=format&fit=crop",
        opciones: ["Segura", "Insegura", "Faltan datos"],
      },
      {
        tipo: "matriz",
        texto: "Frecuencia de monitoreo de signos:",
        filas: ["Presión", "Oxigenación"],
        columnas: ["Diario", "Semanal", "Mensual"],
      },
      {
        tipo: "tarjeta",
        texto: "¿Qué equipo de protección considera más crítico?",
        tarjetas: [
          { emoji: "🪖", label: "Casco" },
          { emoji: "🦺", label: "Arnés" },
          { emoji: "🧗", label: "Línea de vida" },
        ],
      },
      {
        tipo: "numerica",
        texto: "Indique la altura máxima (en metros) a la que ha trabajado:",
        min: 0,
        max: 6000,
      },
    ],
    factores: [
      { cod: "FAC-ALT-F", nom: "Aptitud Física" },
      { cod: "FAC-ALT-P", nom: "Aptitud Psicológica" },
    ],
  },
  "PSI-CHI-004": {
    titulo: "Entrevista Psicológica Chinalco",
    icono: "📋",
    tipo: "Retiro",
    desc: "Evaluación de salida y satisfacción laboral.",
    tiempo: "~15 min",
    preguntas: [
      {
        tipo: "cerrada",
        texto: "¿Cuál es el motivo principal de su retiro?",
        opciones: [
          "Mejor oferta laboral",
          "Temas personales",
          "Estudios",
          "Otros",
        ],
      },
      {
        tipo: "matriz",
        texto: "Califique su experiencia en Chinalco:",
        filas: ["Clima", "Sueldo", "Beneficios"],
        columnas: ["Malo", "Regular", "Bueno", "Excelente"],
      },
      {
        tipo: "tarjeta",
        texto: "¿Cómo califica su relación con su supervisor?",
        tarjetas: [
          { emoji: "🤝", label: "Excelente" },
          { emoji: "😐", label: "Normal" },
          { emoji: "📉", label: "Conflictiva" },
        ],
      },
      {
        tipo: "cerrada",
        texto: "¿Qué beneficios sociales utilizó? (Múltiple):",
        multiple: true,
        vineta: "may",
        opciones: ["Seguro médico", "Bonos", "Capacitación", "Transporte"],
      },
      {
        tipo: "numerica",
        texto: "Del 1 al 10, ¿cuánto recomendaría la empresa?",
        min: 1,
        max: 10,
      },
      {
        tipo: "abierta",
        texto: "Comentarios finales:",
        placeholder: "Escriba aquí...",
      },
    ],
    factores: [
      { cod: "FAC-ENT-A", nom: "Competencias Blandas" },
      { cod: "FAC-ENT-B", nom: "Estabilidad Emocional" },
    ],
  },
  "EST-STRESS-010": {
    titulo: "Escala de Estrés Percibido",
    icono: "📉",
    tipo: "Bienestar",
    desc: "Medición de los niveles de estrés en la vida cotidiana.",
    tiempo: "~5 min",
    preguntas: [
      {
        tipo: "cerrada",
        texto: "¿Se siente sobrepasado por sus responsabilidades?",
        vineta: "min",
        opciones: ["Nunca", "A veces", "Frecuentemente", "Siempre"],
      },
      {
        tipo: "matriz",
        texto: "Nivel de estrés por ámbito:",
        filas: ["Familiar", "Económico", "Social"],
        columnas: ["Bajo", "Medio", "Alto"],
      },
      {
        tipo: "tarjeta",
        texto: "¿Cómo maneja el estrés normalmente?",
        tarjetas: [
          { emoji: "🧘", label: "Meditación" },
          { emoji: "🏃", label: "Deporte" },
          { emoji: "🍿", label: "Distracción" },
        ],
      },
      {
        tipo: "cerrada",
        texto: "Marque síntomas físicos presentes (Múltiple):",
        multiple: true,
        opciones: ["Insomnio", "Cansancio", "Jaquecas", "Tensión muscular"],
      },
      {
        tipo: "numerica",
        texto: "En una escala del 1 al 10, ¿nivel de paz mental?",
        min: 1,
        max: 10,
      },
      {
        tipo: "abierta",
        texto: "¿Desea agregar algo más?",
        placeholder: "...",
      },
    ],
    factores: [
      { cod: "FAC-EST-F", nom: "Estrés Físico" },
      { cod: "FAC-EST-M", nom: "Estrés Mental" },
    ],
  },
  "PSI-VOC-005": {
    titulo: "Test de Orientación Vocacional",
    icono: "🎓",
    tipo: "Educativo",
    desc: "Exploración de intereses y aptitudes profesionales.",
    tiempo: "~20 min",
    preguntas: [
      {
        tipo: "tarjeta",
        texto: "¿Qué entorno de trabajo prefiere?",
        tarjetas: [
          { emoji: "🏢", label: "Oficina" },
          { emoji: "🧪", label: "Laboratorio" },
          { emoji: "🎨", label: "Estudio Creativo" },
          { emoji: "🌍", label: "Campo / Exterior" },
        ],
      },
      {
        tipo: "cerrada",
        texto: "Elija su área de interés predominante:",
        opciones: ["Ingenierías", "Salud", "Letras", "Artes"],
      },
      {
        tipo: "matriz",
        texto: "Interés por las siguientes actividades:",
        filas: ["Investigar", "Diseñar", "Liderar"],
        columnas: ["Nada", "Poco", "Mucho"],
      },
      {
        tipo: "cerrada",
        texto: "Seleccione habilidades que posee (Múltiple):",
        multiple: true,
        vineta: "num",
        opciones: ["Lógica", "Creatividad", "Empatía", "Organización"],
      },
      {
        tipo: "abierta",
        texto: "Mencione sus 3 carreras favoritas:",
        numResp: 3,
        placeholders: ["Opción 1", "Opción 2", "Opción 3"],
      },
      {
        tipo: "numerica",
        texto: "¿Cuántas horas al día dedica al estudio autónomo?",
        min: 0,
        max: 24,
      },
    ],
    factores: [
      { cod: "FAC-VOC-I", nom: "Intereses" },
      { cod: "FAC-VOC-A", nom: "Aptitudes" },
    ],
  },
};

/* ── Estado de previsualización ── */
let pvData = null;
let pvIdx = 0;
let pvTimerInterval = null;
let pvSeconds = 0;
let pvRespuestas = {};

/* ── Helper: Obtener viñeta ── */
function getBulletValue(type, index, manualValue) {
  const t = (type || "").toLowerCase();
  if (t === "otros") return manualValue || "•";
  if (t === "num" || t === "números") return index + 1 + ".";
  if (t === "may" || t === "letras")
    return String.fromCharCode(65 + index) + ")";
  if (t === "min") return String.fromCharCode(97 + index) + ")";
  if (t === "rom" || t === "números romanos") {
    const roms = ["I", "II", "III", "IV", "V", "VI"];
    return (roms[index] || index + 1) + ".";
  }
  return "•";
}

function previsualizarPrueba(codigo) {
  pvData = PRUEBAS_DEMO[codigo];
  if (!pvData) {
    showToast("Datos de previsualización no disponibles para " + codigo);
    return;
  }
  pvIdx = 0;
  pvSeconds = 0;
  pvRespuestas = {};

  // Portada
  document.getElementById("pvTitle").textContent = pvData.titulo;
  document.getElementById("pvSubtitle").textContent =
    pvData.tipo + " · Previsualización";
  document.getElementById("pvIcon").textContent = pvData.icono;
  document.getElementById("pvCoverIcon").textContent = pvData.icono;
  document.getElementById("pvCoverTitle").textContent = pvData.titulo;
  document.getElementById("pvCoverDesc").textContent = pvData.desc;
  document.getElementById("pvTotalQ").textContent = pvData.preguntas.length;
  document.getElementById("pvEstTime").textContent = pvData.tiempo;

  // Reset vistas
  pvShow("pvPortada", true);
  pvShow("pvPreguntas", false);
  pvShow("pvFinal", false);
  document.getElementById("pvTimer").style.display = "none";

  new bootstrap.Modal(document.getElementById("modalPreview")).show();
}

/* Helper: show/hide sections avoiding Bootstrap !important conflict */
function pvShow(id, show, mode) {
  const el = document.getElementById(id);
  if (!el) return;
  const cls = mode === "block" ? "d-block" : "d-flex";
  if (show) {
    el.classList.remove("d-none");
    el.classList.add(cls);
  } else {
    el.classList.remove("d-flex", "d-block");
    el.classList.add("d-none");
  }
}

function iniciarPreview() {
  pvShow("pvPortada", false);
  pvShow("pvPreguntas", true, "block");
  document.getElementById("pvTimer").style.display = "flex";
  pvSeconds = 0;
  pvTimerInterval = setInterval(() => {
    pvSeconds++;
    const m = String(Math.floor(pvSeconds / 60)).padStart(2, "0");
    const s = String(pvSeconds % 60).padStart(2, "0");
    document.getElementById("pvTimerText").textContent = m + ":" + s;
  }, 1000);
  renderPregunta();
}

function renderPregunta() {
  if (!pvData) return;
  const q = pvData.preguntas[pvIdx];
  const total = pvData.preguntas.length;
  const pct = Math.round((pvIdx / total) * 100);

  document.getElementById("pvCurrentQ").textContent = pvIdx + 1;
  document.getElementById("pvTotalQ2").textContent = total;
  document.getElementById("pvPctText").textContent = pct + "%";
  document.getElementById("pvProgressBar").style.width = pct + "%";
  document.getElementById("pvQNum").textContent = pvIdx + 1;

  let headerHtml = `<h5 class="fw-bold text-white mb-2" id="pvQText">${q.texto}</h5>`;
  if (q.image) {
    headerHtml += `<div class="mb-3 rounded overflow-hidden shadow-sm" style="border:1px solid rgba(255,255,255,0.1);max-width:100%;">
            <img src="${q.image}" class="img-fluid w-100" style="max-height:300px;object-fit:cover;" alt="Imagen de pregunta">
          </div>`;
  }
  document.getElementById("pvQText").parentElement.innerHTML = `
          <span id="pvQBadge" class="badge rounded-pill mb-2"></span>
          ${headerHtml}
        `;

  document.getElementById("pvBtnPrev").style.visibility =
    pvIdx === 0 ? "hidden" : "visible";

  // Badge
  const badgeMap = {
    cerrada: "Respuesta Cerrada",
    abierta: "Respuesta Abierta",
    matriz: "Tipo Matriz",
    tarjeta: "Tipo Tarjeta",
    numerica: "Valor Numérico",
  };
  const badgeColor = {
    cerrada: "rgba(56,189,248,0.15)",
    abierta: "rgba(168,85,247,0.15)",
    matriz: "rgba(251,146,60,0.15)",
    tarjeta: "rgba(34,197,94,0.15)",
    numerica: "rgba(34,197,94,0.15)",
  };
  const badgeText = {
    cerrada: "#38bdf8",
    abierta: "#a855f7",
    matriz: "#fb923c",
    tarjeta: "#22c55e",
    numerica: "#22c55e",
  };
  document.getElementById("pvQBadge").textContent = badgeMap[q.tipo] || q.tipo;
  document.getElementById("pvQBadge").style.background =
    badgeColor[q.tipo] || badgeColor.cerrada;
  document.getElementById("pvQBadge").style.color =
    badgeText[q.tipo] || badgeText.cerrada;

  // Botón siguiente / finalizar
  const btnNext = document.getElementById("pvBtnNext");
  if (pvIdx === total - 1) {
    btnNext.innerHTML = 'Finalizar <i class="fas fa-flag-checkered ms-2"></i>';
    btnNext.style.background = "linear-gradient(135deg, #22c55e, #16a34a)";
  } else {
    btnNext.innerHTML = 'Siguiente <i class="fas fa-arrow-right ms-2"></i>';
    btnNext.style.background = "linear-gradient(135deg, #0ea5e9, #2563eb)";
  }

  // Opciones
  const optC = document.getElementById("pvQOptions");
  const savedResp = pvRespuestas[pvIdx];
  optC.innerHTML = "";

  if (q.tipo === "cerrada") {
    const isMulti = q.multiple === true;
    const alts = q.alternativas || [];
    const labels = q.opciones || [];

    labels.forEach((op, i) => {
      const alt = alts[i] || { tipo: "texto" };
      let sel = false;
      if (isMulti) {
        sel = (pvRespuestas[pvIdx] || []).includes(i);
      } else {
        sel = savedResp === i;
      }

      const bullet = getBulletValue(q.vineta || "may", i, alt.vinetaManual);
      const d = document.createElement("div");
      d.className =
        "pv-option d-flex align-items-center gap-3 p-3 rounded-3 mb-2";
      d.style.cssText = `cursor:pointer;border:1px solid ${sel ? "#0ea5e9" : "rgba(255,255,255,0.1)"};background:${sel ? "rgba(14,165,233,0.12)" : "rgba(255,255,255,0.03)"};transition:all 0.2s ease;`;

      let contentHtml = `<span class="flex-grow-1" style="color:${sel ? "#e2e8f0" : "#cbd5e1"}">${op}</span>`;
      if (alt.tipo === "imagen") {
        // Estilos de tamaño imagen
        let imgStyle = "max-width:150px;max-height:150px;object-fit:contain;";
        if (alt.size === "small")
          imgStyle = "width:50px;height:50px;object-fit:contain;";
        if (alt.size === "medium")
          imgStyle = "width:100px;height:100px;object-fit:contain;";
        if (alt.size === "large")
          imgStyle = "width:200px;height:200px;object-fit:contain;";
        if (alt.size === "otros" && alt.w) {
          imgStyle = `width:${alt.w}px;height:${alt.h || alt.w}px;object-fit:contain;`;
        }

        contentHtml = `
                <div class="flex-grow-1 d-flex flex-column gap-2">
                   <div class="rounded bg-black bg-opacity-25 d-flex align-items-center justify-content-center overflow-hidden" style="${imgStyle}">
                      <i class="fas fa-image opacity-25 fa-2x"></i>
                   </div>
                   <span class="small" style="color:${sel ? "#e2e8f0" : "#cbd5e1"}">${op}</span>
                </div>`;
      }

      d.innerHTML = `
              <div class="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style="width:32px;height:32px;background:${sel ? "#0ea5e9" : "rgba(255,255,255,0.08)"};color:${sel ? "white" : "#94a3b8"};font-weight:700;font-size:0.8rem;">
                ${bullet}
              </div>
              ${contentHtml}
              ${sel ? '<i class="fas fa-check-circle text-info ms-auto"></i>' : ""}
            `;

      d.onclick = () => {
        if (isMulti) {
          if (!pvRespuestas[pvIdx]) pvRespuestas[pvIdx] = [];
          const idx = pvRespuestas[pvIdx].indexOf(i);
          if (idx > -1) pvRespuestas[pvIdx].splice(idx, 1);
          else pvRespuestas[pvIdx].push(i);
        } else {
          pvRespuestas[pvIdx] = i;
        }
        renderPregunta();
      };
      optC.appendChild(d);
    });
  } else if (q.tipo === "abierta") {
    const count = q.numResp || 1;
    const resps = Array.isArray(savedResp) ? savedResp : [savedResp];
    for (let i = 0; i < count; i++) {
      const ta = document.createElement("textarea");
      ta.className = "form-control mb-2";
      ta.rows = count > 1 ? 2 : 4;
      ta.placeholder =
        (q.placeholders && q.placeholders[i]) ||
        q.placeholder ||
        `Respuesta ${i + 1}...`;
      ta.value = resps[i] || q.precarga || "";
      ta.style.cssText =
        "background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);color:#e2e8f0;border-radius:12px;resize:vertical;";
      ta.oninput = () => {
        if (count > 1) {
          if (!Array.isArray(pvRespuestas[pvIdx])) pvRespuestas[pvIdx] = [];
          pvRespuestas[pvIdx][i] = ta.value;
        } else {
          pvRespuestas[pvIdx] = ta.value;
        }
      };
      optC.appendChild(ta);
    }
  } else if (q.tipo === "numerica") {
    const divN = document.createElement("div");
    divN.className = "text-center py-3";
    const inp = document.createElement("input");
    inp.type = "number";
    inp.className = "form-control w-50 mx-auto text-center fs-3 fw-bold";
    inp.style.cssText =
      "background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);color:#38bdf8;border-radius:15px;";
    inp.value = savedResp || "";
    inp.oninput = () => {
      pvRespuestas[pvIdx] = inp.value;
    };
    divN.appendChild(inp);
    optC.appendChild(divN);
  } else if (q.tipo === "matriz") {
    const tbl = document.createElement("div");
    tbl.className = "table-responsive";
    let html =
      '<table class="table table-sm mb-0" style="color:#e2e8f0;"><thead><tr><th style="background:transparent;border-color:rgba(255,255,255,0.1);color:#94a3b8;"></th>';
    q.columnas.forEach((c) => {
      html += `<th class="text-center" style="background:transparent;border-color:rgba(255,255,255,0.1);color:#94a3b8;font-size:0.8rem;">${c}</th>`;
    });
    html += "</tr></thead><tbody>";
    q.filas.forEach((f, fi) => {
      html += `<tr><td style="border-color:rgba(255,255,255,0.1);font-weight:600;font-size:0.9rem;">${f}</td>`;
      q.columnas.forEach((c, ci) => {
        const key = fi + "-" + ci;
        const checked = (pvRespuestas[pvIdx] || {})[fi] === ci;
        html += `<td class="text-center" style="border-color:rgba(255,255,255,0.1);"><div class="form-check d-flex justify-content-center"><input class="form-check-input" type="radio" name="pvMat${pvIdx}_${fi}" ${checked ? "checked" : ""} onchange="pvRespuestas[${pvIdx}]=pvRespuestas[${pvIdx}]||{};pvRespuestas[${pvIdx}][${fi}]=${ci};"></div></td>`;
      });
      html += "</tr>";
    });
    html += "</tbody></table>";
    tbl.innerHTML = html;
    optC.appendChild(tbl);
  } else if (q.tipo === "tarjeta") {
    const wrap = document.createElement("div");
    wrap.className = "d-flex gap-3 flex-wrap justify-content-center mt-2";
    q.tarjetas.forEach((t, i) => {
      const sel = savedResp === i;
      const card = document.createElement("div");
      card.className = "text-center p-4 rounded-4";
      card.style.cssText = `cursor:pointer;min-width:140px;border:2px solid ${sel ? "#0ea5e9" : "rgba(255,255,255,0.1)"};background:${sel ? "rgba(14,165,233,0.12)" : "rgba(255,255,255,0.03)"};transition:all 0.2s ease;`;
      card.innerHTML = `<div style="font-size:3rem;margin-bottom:8px;">${t.emoji}</div><div class="fw-bold" style="color:${sel ? "#38bdf8" : "#cbd5e1"};font-size:0.9rem;">${t.label}</div>${sel ? '<i class="fas fa-check-circle text-info mt-2" style="font-size:1.2rem;"></i>' : ""}`;
      card.onmouseenter = () => {
        if (!sel) card.style.border = "2px solid rgba(56,189,248,0.4)";
      };
      card.onmouseleave = () => {
        if (!sel) card.style.border = "2px solid rgba(255,255,255,0.1)";
      };
      card.onclick = () => {
        pvRespuestas[pvIdx] = i;
        renderPregunta();
      };
      wrap.appendChild(card);
    });
    optC.appendChild(wrap);
  }

  // Dots
  const dotsC = document.getElementById("pvDots");
  dotsC.innerHTML = "";
  const maxDots = Math.min(total, 15);
  const start = Math.max(0, pvIdx - 7);
  const end = Math.min(total, start + maxDots);
  for (let i = start; i < end; i++) {
    const dot = document.createElement("div");
    const answered = pvRespuestas[i] !== undefined;
    dot.style.cssText = `width:8px;height:8px;border-radius:50%;cursor:pointer;transition:all 0.2s ease;background:${i === pvIdx ? "#0ea5e9" : answered ? "rgba(34,197,94,0.6)" : "rgba(255,255,255,0.2)"};${i === pvIdx ? "transform:scale(1.4);" : ""}`;
    dot.title = "Pregunta " + (i + 1);
    dot.onclick = () => {
      pvIdx = i;
      renderPregunta();
    };
    dotsC.appendChild(dot);
  }

  // Scroll to top
  document
    .getElementById("pvPreguntas")
    .scrollIntoView({ behavior: "smooth", block: "start" });
}

function pvNavegar(dir) {
  if (!pvData) return;
  pvIdx += dir;
  if (pvIdx >= pvData.preguntas.length) {
    // Finalizar
    pvShow("pvPreguntas", false);
    pvShow("pvFinal", true);
    document.getElementById("pvFinalTotal").textContent =
      pvData.preguntas.length;
    const m = String(Math.floor(pvSeconds / 60)).padStart(2, "0");
    const s = String(pvSeconds % 60).padStart(2, "0");
    document.getElementById("pvFinalTime").textContent = m + ":" + s;
    document.getElementById("pvFinalResp").textContent =
      Object.keys(pvRespuestas).length;
    detenerTimerPreview();
    return;
  }
  if (pvIdx < 0) pvIdx = 0;
  renderPregunta();
}

function detenerTimerPreview() {
  if (pvTimerInterval) {
    clearInterval(pvTimerInterval);
    pvTimerInterval = null;
  }
}

// Cleanup on modal hide
document.addEventListener("DOMContentLoaded", () => {
  const pvModal = document.getElementById("modalPreview");
  if (pvModal) pvModal.addEventListener("hidden.bs.modal", detenerTimerPreview);

  // Initialize tooltips for elements with title
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll("[title]"),
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    if (!tooltipTriggerEl.getAttribute("data-bs-toggle")) {
      tooltipTriggerEl.setAttribute("data-bs-toggle", "tooltip");
      if (!tooltipTriggerEl.getAttribute("data-bs-placement")) {
        tooltipTriggerEl.setAttribute("data-bs-placement", "top");
      }
    }
    const tooltip = new bootstrap.Tooltip(tooltipTriggerEl);
    // Only enable sidebar tooltips if it's collapsed
    if (
      tooltipTriggerEl.classList.contains("nav-link") &&
      tooltipTriggerEl.closest("#sidebar")
    ) {
      if (!document.getElementById("sidebar").classList.contains("collapsed")) {
        tooltip.disable();
      }
    }
    return tooltip;
  });
});

/* ========================================== */
/* ACTUALIZACION: PREGUNTAS Y PLANTILLAS REAL */
/* ========================================== */
(function (window, document) {
  "use strict";

  function q(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }
  function safeJsonParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return fallback;
    }
  }

  const _renderizarControlesPregunta = window.renderizarControlesPregunta;
  const _ctrlAbierta = window.ctrlAbierta;
  const _ctrlCerrada = window.ctrlCerrada;
  const _swMpcAlt = window.swMpcAlt;
  const _guardarNuevaPregunta = window.guardarNuevaPregunta;
  const _editarPreguntaRow = window.editarPreguntaRow;
  const _precargarBolsito = window.precargarBolsito;
  const _addMpcAlternativa = window.addMpcAlternativa;
  const _duplicarAlternativa = window.duplicarAlternativa;

  function sepoOpenDemoOptions() {
    return [
      ["Se observa un predominio de factores de protección ante situaciones de estrés.", "Factores de Protección"],
      ["La evaluación sugiere la necesidad de reforzar estrategias de afrontamiento.", "Estrategias de Afrontamiento"],
      ["Presenta un nivel de resiliencia adecuado para su perfil ocupacional.", "Resiliencia Adecuada"],
      ["Los resultados se encuentran dentro de los parámetros esperados, condición estable.", "Resultados Estables"],
      ["Se recomienda realizar un seguimiento presencial en el próximo trimestre.", "Recomendación Seguimiento"],
      ["Refiere preocupaciones frecuentes asociadas a la carga laboral reciente.", "Carga Laboral"],
      ["Manifiesta tensión sostenida ante escenarios de evaluación o supervisión.", "Tensión ante Evaluación"],
      ["Describe síntomas leves y esporádicos, sin interferencia funcional significativa.", "Síntomas Leves"],
      ["Se identifican señales que ameritan acompañamiento preventivo del área ocupacional.", "Acompañamiento Preventivo"],
      ["La persona reporta recursos personales suficientes para responder a las exigencias actuales.", "Recursos Personales"],
      ["Existe necesidad de reforzar hábitos de descanso y regulación emocional.", "Hábitos de Descanso"],
      ["Se sugiere monitoreo periódico por presencia de indicadores emocionales persistentes.", "Monitoreo Periódico"],
      ["No se advierten alertas críticas en la respuesta abierta registrada.", "Sin Alertas Críticas"],
      ["La narrativa evidencia sensibilidad elevada frente a situaciones de presión sostenida.", "Presión Sostenida"],
      ["Se recomienda intervención breve orientada a fortalecer contención y autocuidado.", "Intervención Breve"],
    ];
  }

  function sepoEnsureOpenPrecargaSelect() {
    const fields = q("#mp_A_precargaFields");
    if (!fields) return null;
    const legacySelect = q("#mp_A_precargaSelect", fields);
    if (legacySelect) {
      const legacyWrap = legacySelect.closest(".p-3, .bg-light, div");
      if (legacyWrap && legacyWrap !== fields && legacyWrap.parentNode) {
        legacyWrap.remove();
      } else {
        fields.innerHTML = "";
      }
    }
    return q("#mp_A_precargaValue", fields);
  }

  function sepoRefreshOpenPrecargaUI() {
    const yes = q("#mp_A_precargaSi");
    const editable = q("#mp_A_editable");
    const editableWrap = q("#mp_A_editableWrap");
    const boxPrecarga = q("#mp_A_boxPrecarga");
    if (!yes || !editable || !editableWrap || !boxPrecarga) return;

    const hasPrecarga = !!yes.checked;
    editableWrap.style.display = hasPrecarga ? "block" : "none";

    if (!hasPrecarga) {
      editable.checked = false;
      boxPrecarga.style.display = "none";
      return;
    }

    if (editable.checked) {
      sepoEnsureOpenPrecargaSelect();
      boxPrecarga.style.display = "block";
    } else {
      boxPrecarga.style.display = "none";
    }
  }

  function sepoInjectOpenExtras() {
    const editable = q("#mp_A_editable");
    if (editable && editable.dataset.sepoBoundOpenEditable !== "1") {
      editable.dataset.sepoBoundOpenEditable = "1";
      editable.addEventListener("change", function () {
        if (typeof ensureOpenPrecargaDemo === "function") {
          ensureOpenPrecargaDemo();
        } else {
          sepoRefreshOpenPrecargaUI();
        }
      });
    }
    if (typeof ensureOpenPrecargaDemo === "function") {
      ensureOpenPrecargaDemo();
      return;
    }
    sepoRefreshOpenPrecargaUI();
  }

  function sepoInjectClosedPrecargaSelect() {
    const root = q("#mpContenedorPregunta");
    const box = q("#mp_C_precarga_opciones", root);
    if (!box || q("#mp_C_precarga_defecto_select", box)) return;
    box.innerHTML = `
      <label class="form-label small fw-bold text-primary mb-1">Alternativa(s) por defecto:</label>
      <select class="form-select form-select-sm" id="mp_C_precarga_defecto_select">
        <option value="">Seleccionar alternativa...</option>
      </select>
    `;
  }

  function sepoFillClosedPrecargaOptions() {
    const select = q("#mp_C_precarga_defecto_select");
    const box = q("#mp_C_alternativas_box");
    if (!select || !box) return;
    const prev = select.value;
    const rows = qa(".item-alt", box);
    select.innerHTML = '<option value="">Seleccionar alternativa...</option>';
    rows.forEach(function (row, idx) {
      const bullet =
        q(".manual-bullet-input", row) &&
        q(".manual-bullet-input", row).style.display !== "none"
          ? (q(".manual-bullet-input", row).value || "").trim()
          : q(".badge-bullet", row)
            ? q(".badge-bullet", row).textContent.trim()
            : "";
      const txtInput = q(".mpc-dynamic-box input[type='text']", row);
      const label = txtInput
        ? (txtInput.value || "").trim()
        : "Alternativa " + (idx + 1);
      const opt = document.createElement("option");
      opt.value = "alt_" + (idx + 1);
      opt.textContent = (bullet ? bullet + " " : "") + label;
      select.appendChild(opt);
    });
    if (
      prev &&
      qa("option", select).some(function (o) {
        return o.value === prev;
      })
    )
      select.value = prev;
  }

  function sepoBindClosedAltObservers() {
    const box = q("#mp_C_alternativas_box");
    if (!box || box.dataset.sepoBoundFeature === "1") return;
    box.dataset.sepoBoundFeature = "1";
    box.addEventListener("input", function () {
      sepoFillClosedPrecargaOptions();
    });
    box.addEventListener("change", function () {
      sepoFillClosedPrecargaOptions();
      sepoSyncImageOtherInputs(box);
    });
    box.addEventListener("click", function () {
      setTimeout(function () {
        sepoFillClosedPrecargaOptions();
        sepoSyncImageOtherInputs(box);
      }, 0);
    });
  }

  function sepoSyncImageOtherInputs(root) {
    qa(".sepo-img-size", root || document).forEach(function (sel) {
      const wrap = sel.closest(".sepo-img-size-wrap");
      if (!wrap) return;
      const custom = q(".sepo-img-custom", wrap);
      if (custom)
        custom.style.display = sel.value === "otros" ? "flex" : "none";
    });
  }

  function sepoInjectImageOthers(root) {
    // ACTUALIZACION: Deshabilitado para usar implementación nativa en los templates
    return;
    qa(
      ".sepo-img-size, .mpc-dynamic-box select.form-select",
      root || document,
    ).forEach(function (sel) {
      if (!sel || sel.dataset.sepoOtherReady === "1") return;
      // only on small size image selectors
      if (
        ![...sel.options].some(function (o) {
          return (
            o.value === "small" || o.value === "medium" || o.value === "large"
          );
        })
      )
        return;
      const opt = document.createElement("option");
      opt.value = "otros";
      opt.textContent = "Otros";
      sel.appendChild(opt);
      sel.classList.add("sepo-img-size");
      sel.dataset.sepoOtherReady = "1";
      const wrap = document.createElement("div");
      wrap.className = "sepo-img-size-wrap d-flex align-items-center gap-2";
      sel.parentNode.insertBefore(wrap, sel);
      wrap.appendChild(sel);
      const custom = document.createElement("div");
      custom.className = "sepo-img-custom d-none align-items-center gap-2";
      custom.style.display = "none";
      custom.innerHTML = `
        <input type="number" class="form-control form-control-sm sepo-img-w" placeholder="Ancho" style="width:85px;" min="1">
        <input type="number" class="form-control form-control-sm sepo-img-h" placeholder="Alto" style="width:85px;" min="1">
      `;
      wrap.appendChild(custom);
      sel.addEventListener("change", function () {
        sepoSyncImageOtherInputs(root || document);
      });
    });
    sepoSyncImageOtherInputs(root || document);
  }

  window.renderizarControlesPregunta = function () {
    _renderizarControlesPregunta.apply(this, arguments);
    const tipo = q("#mpTipoPreg_Master") ? q("#mpTipoPreg_Master").value : "";
    if (tipo === "abierta") {
      sepoInjectOpenExtras();
    }
    if (tipo === "cerrada") {
      sepoInjectClosedPrecargaSelect();
      sepoFillClosedPrecargaOptions();
      sepoBindClosedAltObservers();
    }
    sepoInjectImageOthers(q("#mpContenedorPregunta"));
  };

  window.ctrlAbierta = function () {
    _ctrlAbierta.apply(this, arguments);
    sepoInjectOpenExtras();
    sepoRefreshOpenPrecargaUI();
  };

  window.ctrlCerrada = function () {
    _ctrlCerrada.apply(this, arguments);
    sepoInjectClosedPrecargaSelect();
    sepoFillClosedPrecargaOptions();
    sepoBindClosedAltObservers();
    sepoInjectImageOthers(q("#mpContenedorPregunta"));
  };

  window.swMpcAlt = function (sel) {
    _swMpcAlt.apply(this, arguments);
    sepoInjectImageOthers(sel.closest(".item-alt"));
    sepoFillClosedPrecargaOptions();
  };

  window.addMpcAlternativa = function () {
    _addMpcAlternativa.apply(this, arguments);
    sepoInjectImageOthers(q("#mp_C_alternativas_box"));
    sepoFillClosedPrecargaOptions();
    sepoBindClosedAltObservers();
  };

  window.duplicarAlternativa = function (btn) {
    _duplicarAlternativa.apply(this, arguments);
    setTimeout(function () {
      sepoInjectImageOthers(q("#mp_C_alternativas_box"));
      sepoFillClosedPrecargaOptions();
    }, 0);
  };

  window.sepoReadCurrentQuestionConfig = function (tipo) {
    const cfg = { tipo: tipo || "", abierta: {}, cerrada: {} };
    if (tipo === "abierta") {
      cfg.abierta = {
        tipoVista: q("#mp_A_tipoVista") ? q("#mp_A_tipoVista").value : "",
        tipoDato: q("#mp_A_tipoDato") ? q("#mp_A_tipoDato").value : "",
        texto: q("#mp_A_text") ? q("#mp_A_text").value : "",
        tipoResp: q("#mp_A_tipoResp") ? q("#mp_A_tipoResp").value : "",
        tienePrecarga: q("#mp_A_precargaSi")
          ? q("#mp_A_precargaSi").checked
          : false,
        editableUsuario: q("#mp_A_editable")
          ? q("#mp_A_editable").checked
          : false,
        precarga: q("#mp_A_precargaValue")
          ? q("#mp_A_precargaValue").value
          : q("#mp_A_precargaSelect")
            ? q("#mp_A_precargaSelect").value
            : "",
        respuestaEsperada: q("#mp_A_respuestaEsperada")
          ? q("#mp_A_respuestaEsperada").value
          : "",
        valorEsperado: q("#mp_A_valorEsperado")
          ? q("#mp_A_valorEsperado").value
          : "",
      };
    } else if (tipo === "cerrada") {
      const isMulti =
        q("#mp_C_tipoResp") && q("#mp_C_tipoResp").value === "multiple";
      let precargaVal = q("#mp_C_precargaValue_stable")
        ? q("#mp_C_precargaValue_stable").value
        : "";
      if (!precargaVal) {
        if (isMulti) {
          precargaVal = qa('input[name="mp_C_precarga_check"]:checked')
            .map(function (c) {
              return c.value;
            })
            .join(",");
        } else {
          precargaVal = q("#mp_C_precarga_sel")
            ? q("#mp_C_precarga_sel").value
            : "";
        }
      }

      cfg.cerrada = {
        tipoVista: q("#mp_C_tipoVista") ? q("#mp_C_tipoVista").value : "",
        tipoDato: q("#mp_C_tipoDato") ? q("#mp_C_tipoDato").value : "",
        texto: q("#mp_C_text") ? q("#mp_C_text").value : "",
        tipoResp: q("#mp_C_tipoResp") ? q("#mp_C_tipoResp").value : "",
        vineta: q("#mp_C_vineta") ? q("#mp_C_vineta").value : "letras",
        tienePrecarga: q("#mp_C_precarga")
          ? q("#mp_C_precarga").checked
          : false,
        precarga: precargaVal,
        alternativas: qa("#mp_C_alternativas_box .item-alt").map(
          function (row, idx) {
            const tSel = q(".mpc-tipoalt", row);
            const isText = !tSel || tSel.value === "texto";
            const textInput = q(".mpc-dynamic-box input[type='text']", row);
            const sizeSel = q(".mpc-img-size-sel", row);
            const manualVineta = q(".manual-bullet-input", row);
            return {
              texto: isText
                ? (textInput && textInput.value) || ""
                : (textInput && textInput.value) || "Imagen " + (idx + 1),
              tipo: isText ? "texto" : "imagen",
              vinetaManual:
                manualVineta && manualVineta.offsetParent !== null
                  ? manualVineta.value
                  : "",
              size: sizeSel ? sizeSel.value : "",
              w: q(".mpc-img-w", row) ? q(".mpc-img-w", row).value : "",
              h: q(".mpc-img-h", row) ? q(".mpc-img-h", row).value : "",
              valor: 0,
            };
          },
        ),
      };
    }
    return cfg;
  };

  function sepoApplyQuestionConfigToRow(row, cfg) {
    if (!row) return;
    row.dataset.sepoConfig = JSON.stringify(cfg || {});
  }

  function sepoGetStoredQuestions() {
    return qa("#boxPreg .item-row").map(function (row, idx) {
      const cfg = safeJsonParse(row.dataset.sepoConfig || "{}", {});
      const titulo = q(".desc-text", row)
        ? q(".desc-text", row).textContent.trim()
        : "Pregunta " + (idx + 1);
      const tipo = row.getAttribute("data-tipo") || cfg.tipo || "";
      const id = row.dataset.sepoId || "preg_" + (idx + 1);
      row.dataset.sepoId = id;
      let alternativas = [];
      if (
        tipo === "cerrada" &&
        cfg.cerrada &&
        Array.isArray(cfg.cerrada.alternativas)
      ) {
        alternativas = cfg.cerrada.alternativas;
      }
      return {
        id: id,
        titulo: titulo,
        tipo: tipo,
        cfg: cfg,
        alternativas: alternativas,
      };
    });
  }

  function sepoRenderPlantillaReal() {
    const c = q("#plantillaCerradasContainer");
    const a = q("#plantillaAbiertasContainer");
    const m = q("#plantillaMatrizContainer");
    const t = q("#plantillaTarjetaContainer");
    if (!c || !a) return;

    const preguntas = sepoGetStoredQuestions();
    const cerradas = preguntas.filter(function (p) {
      return p.tipo === "cerrada";
    });
    const abiertas = preguntas.filter(function (p) {
      return p.tipo === "abierta";
    });
    const matrices = preguntas.filter(function (p) {
      return p.tipo === "matriz";
    });
    const tarjetas = preguntas.filter(function (p) {
      return p.tipo === "tarjeta";
    });

    // 1. Cerradas
    c.innerHTML = cerradas.length
      ? cerradas
          .map(function (p, pIdx) {
            const vType =
              (p.cfg && p.cfg.cerrada && p.cfg.cerrada.vineta) || "may";
            return `
        <div class="border rounded bg-white p-3 shadow-sm mb-3 border-primary" data-question-id="${p.id}">
          <h6 class="fw-bold text-primary mb-2 text-truncate small">
            <span class="badge bg-primary me-2">${pIdx + 1}</span>${p.titulo}
          </h6>
          <div class="ms-4 ps-2">
            ${(p.alternativas || [])
              .map(function (alt, idx) {
                const bullet =
                  typeof window.getBulletValue === "function"
                    ? window.getBulletValue(vType, idx, alt.vinetaManual)
                    : "";
                const label =
                  alt.tipo === "imagen"
                    ? "(Imagen " + (idx + 1) + ")"
                    : alt.texto || "Alternativa " + (idx + 1);
                return `
                <div class="d-flex align-items-center justify-content-between py-1 ${idx < p.alternativas.length - 1 ? "border-bottom border-light" : ""}">
                  <span class="text-dark fw-medium small text-truncate" style="max-width:300px;">
                    <strong class="me-2 text-primary opacity-75">${bullet}</strong> ${label}
                  </span>
                  <div class="d-flex align-items-center gap-2">
                    <label class="small text-muted fw-bold mb-0">Pts:</label>
                    <input type="number" class="form-control form-control-sm border-secondary text-success fw-bold text-center"
                      style="width:70px;" step="0.1"
                      data-score-question="${p.id}" data-score-index="${idx}" value="${alt.valor || 0}">
                  </div>
                </div>`;
              })
              .join("")}
          </div>
        </div>`;
          })
          .join("")
      : `<div class="alert alert-light text-muted small shadow-sm"><i class="fas fa-info-circle me-2"></i>Las preguntas cerradas se cargarán automáticamente.</div>`;

    // 2. Abiertas
    a.innerHTML = abiertas.length
      ? abiertas
          .map(function (p, pIdx) {
            const abierta = (p.cfg && p.cfg.abierta) || {};
            return `
        <div class="border rounded bg-white p-3 shadow-sm mb-3 border-warning">
          <h6 class="fw-bold text-warning mb-2 text-truncate small">
            <span class="badge bg-warning me-2">${pIdx + 1}</span>${p.titulo}
          </h6>
          <div class="row g-2 mt-1 px-2">
            <div class="col-md-9">
              <label class="small text-muted fw-bold mb-1 d-block">Respuesta esperada (Numeración: ${abierta.tipoDatoResp || "Texto"})</label>
              <input type="text" class="form-control form-control-sm border-warning-subtle" value="${abierta.respuestaEsperada || ""}" placeholder="Ej: Respuesta estándar...">
            </div>
            <div class="col-md-3">
              <label class="small text-muted fw-bold mb-1 d-block">Puntaje</label>
              <input type="number" class="form-control form-control-sm border-warning-subtle text-center fw-bold text-warning" value="${abierta.valorEsperado || ""}" step="0.1">
            </div>
          </div>
        </div>`;
          })
          .join("")
      : `<div class="alert alert-light text-muted small shadow-sm"><i class="fas fa-info-circle me-2"></i>Las preguntas abiertas se cargarán automáticamente.</div>`;

    // 3. Matrices
    if (m) {
      m.innerHTML = matrices.length
        ? matrices
            .map(function (p, pIdx) {
              const matrix = (p.cfg && p.cfg.matriz) || {};
              const filas = Array.isArray(matrix.filas) ? matrix.filas : [];
              return `
          <div class="border rounded bg-white p-3 shadow-sm mb-3 border-info" data-question-id="${p.id}">
            <h6 class="fw-bold text-info mb-2 text-truncate small">
              <span class="badge bg-info me-2">${pIdx + 1}</span>${p.titulo}
            </h6>
            <div class="ms-4">
              ${filas
                .map(function (f, fIdx) {
                  return `
                  <div class="d-flex align-items-center justify-content-between py-1 border-bottom border-light">
                    <span class="text-dark small text-truncate" style="max-width:300px;">${f.texto || "Fila " + (fIdx + 1)}</span>
                    <div class="d-flex align-items-center gap-2">
                       <input type="number" class="form-control form-control-sm text-center" style="width:60px;" 
                         data-score-matrix-row="${p.id}" data-score-index="${fIdx}" value="${f.valor || 0}">
                    </div>
                  </div>`;
                })
                .join("")}
            </div>
          </div>`;
            })
            .join("")
        : `<div class="alert alert-light text-muted small shadow-sm"><i class="fas fa-info-circle me-2"></i>Esperando preguntas tipo Matriz...</div>`;
    }

    // 4. Tarjetas
    if (t) {
      t.innerHTML = tarjetas.length
        ? tarjetas
            .map(function (p, pIdx) {
              return `
          <div class="border rounded bg-white p-3 shadow-sm mb-3 border-dark" data-question-id="${p.id}">
            <h6 class="fw-bold text-dark mb-2 text-truncate small">
              <span class="badge bg-dark me-2">${pIdx + 1}</span>${p.titulo}
            </h6>
            <div class="p-2 d-flex align-items-center gap-3">
              <label class="small text-muted mb-0">Valor por item:</label>
              <input type="number" class="form-control form-control-sm text-center" style="width:80px;" 
                data-score-card="${p.id}" value="${(p.cfg && p.cfg.tarjeta && p.cfg.tarjeta.valor) || 0}">
            </div>
          </div>`;
            })
            .join("")
        : `<div class="alert alert-light text-muted small shadow-sm"><i class="fas fa-info-circle me-2"></i>Esperando preguntas tipo Tarjeta...</div>`;
    }
  }

  window.sepoGuardarPlantillaConfigSafe = function () {
    const box = q("#boxPreg");
    if (!box) return;
    const items = qa(".item-row", box);

    // Recolectar datos de los inputs en el Step 4
    const scores = {};
    qa("input[data-score-question]").forEach((inp) => {
      const qid = inp.dataset.scoreQuestion;
      const sidx = inp.dataset.scoreIndex;
      if (!scores[qid]) scores[qid] = { simple: [] };
      scores[qid].simple[sidx] = parseFloat(inp.value) || 0;
    });

    qa("input[data-score-matrix-row]").forEach((inp) => {
      const qid = inp.dataset.scoreMatrixRow;
      const sidx = inp.dataset.scoreIndex;
      if (!scores[qid]) scores[qid] = { matrix: [] };
      scores[qid].matrix[sidx] = parseFloat(inp.value) || 0;
    });

    qa("input[data-score-card]").forEach((inp) => {
      const qid = inp.dataset.scoreCard;
      if (!scores[qid]) scores[qid] = { card: parseFloat(inp.value) || 0 };
    });

    // Actualizar los data-attributes del Step 2
    items.forEach((row) => {
      const qid = row.dataset.sepoId;
      const cfg = parseJSON(row.dataset.sepoConfig || "{}", {});
      if (scores[qid]) {
        if (scores[qid].simple && cfg.cerrada) {
          scores[qid].simple.forEach((val, i) => {
            if (cfg.cerrada.alternativas[i])
              cfg.cerrada.alternativas[i].valor = val;
          });
        }
        if (scores[qid].matrix && cfg.matriz) {
          scores[qid].matrix.forEach((val, i) => {
            if (cfg.matriz.filas[i]) cfg.matriz.filas[i].valor = val;
          });
        }
        if (scores[qid].card !== undefined && cfg.tarjeta) {
          cfg.tarjeta.valor = scores[qid].card;
        }
      }
      // Caso Abiertas (inputs directos en el DOM del Tab)
      const abiertaInp = q(
        `#plantillaAbiertasContainer div[data-question-id="${qid}"] input[type="number"]`,
      );
      const abiertaTxt = q(
        `#plantillaAbiertasContainer div[data-question-id="${qid}"] input[type="text"]`,
      );
      if (abiertaInp && cfg.abierta) {
        cfg.abierta.valorEsperado = parseFloat(abiertaInp.value) || 0;
        cfg.abierta.respuestaEsperada = abiertaTxt ? abiertaTxt.value : "";
      }

      row.dataset.sepoConfig = JSON.stringify(cfg);
    });

    saveCurrentPsychDemo();
    showToast("✅ Plantilla de respuestas guardada con éxito.");
  };

  window.sepoLimpiarPlantillaSafe = function () {
    qa("#step-4 input[type='number']").forEach((inp) => (inp.value = 0));
    qa("#step-4 input[type='text']").forEach((inp) => (inp.value = ""));
    showToast("🧹 Campos de la plantilla reiniciados.");
  };

  window.guardarNuevaPregunta = function () {
    const tipo = q("#mpTipoPreg_Master") ? q("#mpTipoPreg_Master").value : "";
    const box = q("#boxPreg");
    const editRow = window.preguntaActualEditando || null;
    const editIndex =
      editRow && box ? qa(":scope > .item-row", box).indexOf(editRow) : -1;
    const cfg = sepoReadCurrentQuestionConfig(tipo);

    const result = _guardarNuevaPregunta.apply(this, arguments);

    const rows = box ? qa(":scope > .item-row", box) : [];
    const row =
      editIndex >= 0
        ? rows[editIndex]
        : rows.length
          ? rows[rows.length - 1]
          : null;
    sepoApplyQuestionConfigToRow(row, cfg);
    sepoRenderPlantillaReal();
    return result;
  };

  window.editarPreguntaRow = function (btn) {
    const row = btn.closest(".item-row");
    const cfg = safeJsonParse((row && row.dataset.sepoConfig) || "{}", {});
    _editarPreguntaRow.apply(this, arguments);
    setTimeout(function () {
      if (cfg.abierta) {
        if (q("#mp_A_precargaSi"))
          q("#mp_A_precargaSi").checked = !!cfg.abierta.tienePrecarga;
        if (q("#mp_A_precargaNo"))
          q("#mp_A_precargaNo").checked = !cfg.abierta.tienePrecarga;
        if (q("#mp_A_editable"))
          q("#mp_A_editable").checked = !!cfg.abierta.editableUsuario;
        const openPrecargaSeed = cfg.abierta.precarga || "";
        if (q("#mp_A_precargaFields"))
          q("#mp_A_precargaFields").dataset.sepoOpenPrecargaSeed = openPrecargaSeed;
        if (typeof window.ctrlAbierta === "function") window.ctrlAbierta();
        if (q("#mp_A_precargaValue"))
          q("#mp_A_precargaValue").value = openPrecargaSeed;
        if (q("#mp_A_respuestaEsperada"))
          q("#mp_A_respuestaEsperada").value =
            cfg.abierta.respuestaEsperada || "";
        if (q("#mp_A_valorEsperado"))
          q("#mp_A_valorEsperado").value = cfg.abierta.valorEsperado || "";
      }
      if (cfg.cerrada) {
        if (q("#mp_C_precarga"))
          q("#mp_C_precarga").checked = !!cfg.cerrada.tienePrecarga;
        if (q("#mp_C_precarga_opciones"))
          q("#mp_C_precarga_opciones").style.display = cfg.cerrada.tienePrecarga
            ? "block"
            : "none";
        if (q("#mp_C_precarga_defecto_select"))
          q("#mp_C_precarga_defecto_select").value = cfg.cerrada.precarga || "";
      }
    }, 80);
  };

  function sepoFillReplicaOrigen() {
    const sel = q("#replicaPreguntaOrigen");
    if (!sel) return;
    const preguntas = sepoGetStoredQuestions().filter(function (p) {
      return p.tipo === "cerrada";
    });
    sel.innerHTML = '<option value="">Seleccionar pregunta origen...</option>';
    preguntas.forEach(function (p) {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.titulo;
      sel.appendChild(opt);
    });
  }

  function sepoIsCompatible(origen, destino) {
    if (!origen || !destino || origen.id === destino.id) return false;
    if (origen.tipo !== destino.tipo) return false;
    if (
      (origen.alternativas || []).length !== (destino.alternativas || []).length
    )
      return false;
    const ot = (origen.alternativas || [])
      .map(function (a) {
        return a.tipo || "texto";
      })
      .join("|");
    const dt = (destino.alternativas || [])
      .map(function (a) {
        return a.tipo || "texto";
      })
      .join("|");
    return ot === dt;
  }

  function sepoRenderReplicaDestinos() {
    const box = q("#replicaPreguntasDestino");
    const origenSel = q("#replicaPreguntaOrigen");
    const searchInp = q("#replicaSearchDestino");
    if (!box || !origenSel) return;

    const query = searchInp ? searchInp.value.toLowerCase().trim() : "";
    const preguntas = sepoGetStoredQuestions().filter(function (p) {
      if (p.tipo !== "cerrada") return false;
      if (query && !p.titulo.toLowerCase().includes(query)) return false;
      return true;
    });

    const origen = sepoGetStoredQuestions().find(function (p) {
      return p.id === origenSel.value;
    });
    if (!origen) {
      box.innerHTML =
        '<div class="text-muted small py-3 text-center">Selecciona una pregunta origen.</div>';
      return;
    }

    box.innerHTML = preguntas.length
      ? preguntas
          .map(function (p) {
            const ok = sepoIsCompatible(origen, p);
            return `<label class="item-row" style="opacity:${ok ? "1" : ".5"};cursor:${ok ? "pointer" : "not-allowed"};">
        <div class="inf">
          <input type="checkbox" class="form-check-input me-2" value="${p.id}" ${ok ? "" : "disabled"}>
          <div><div class="fw-semibold text-truncate" style="max-width: 480px;">${p.titulo}</div><small class="text-muted">Alternativas: ${(p.alternativas || []).length}</small></div>
        </div>
      </label>`;
          })
          .join("")
      : '<div class="text-muted small py-3 text-center">No se encontraron preguntas compatibles.</div>';

    // Reset select all button text
    const btnAll = q("#btnReplicaSelectAll");
    if (btnAll) btnAll.textContent = "Todos";
  }

  function sepoOpenReplicaModal() {
    sepoFillReplicaOrigen();
    sepoRenderReplicaDestinos();
    const el = q("#modalReplicarValores");
    if (el && window.bootstrap) new window.bootstrap.Modal(el).show();
  }

  function sepoApplyReplica() {
    const origenSel = q("#replicaPreguntaOrigen");
    const box = q("#replicaPreguntasDestino");
    if (!origenSel || !box) return;
    const preguntas = sepoGetStoredQuestions().filter(function (p) {
      return p.tipo === "cerrada";
    });
    const origen = preguntas.find(function (p) {
      return p.id === origenSel.value;
    });
    const destinos = qa('input[type="checkbox"]:checked', box).map(
      function (c) {
        return c.value;
      },
    );
    if (!origen || !destinos.length) {
      alert("Selecciona una pregunta origen y al menos una pregunta destino.");
      return;
    }
    const origenVals = qa('[data-score-question="' + origen.id + '"]').map(
      function (input) {
        return Number(input.value || 0);
      },
    );
    destinos.forEach(function (destId) {
      qa('[data-score-question="' + destId + '"]').forEach(
        function (input, idx) {
          input.value = origenVals[idx] != null ? origenVals[idx] : 0;
        },
      );
    });
    const el = q("#modalReplicarValores");
    const modal =
      el && window.bootstrap ? window.bootstrap.Modal.getInstance(el) : null;
    if (modal) modal.hide();
  }

  function sepoBindFeatureEvents() {
    if (
      q("#btnReplicarValores") &&
      !q("#btnReplicarValores").dataset.sepoBound
    ) {
      q("#btnReplicarValores").dataset.sepoBound = "1";
      q("#btnReplicarValores").addEventListener("click", sepoOpenReplicaModal);
    }
    if (
      q("#replicaPreguntaOrigen") &&
      !q("#replicaPreguntaOrigen").dataset.sepoBound
    ) {
      q("#replicaPreguntaOrigen").dataset.sepoBound = "1";
      q("#replicaPreguntaOrigen").addEventListener(
        "change",
        sepoRenderReplicaDestinos,
      );
    }
    if (
      q("#btnConfirmarReplicaValores") &&
      !q("#btnConfirmarReplicaValores").dataset.sepoBound
    ) {
      q("#btnConfirmarReplicaValores").dataset.sepoBound = "1";
      q("#btnConfirmarReplicaValores").addEventListener(
        "click",
        sepoApplyReplica,
      );
    }
    if (
      q("#replicaSearchDestino") &&
      !q("#replicaSearchDestino").dataset.sepoBound
    ) {
      q("#replicaSearchDestino").dataset.sepoBound = "1";
      q("#replicaSearchDestino").addEventListener(
        "input",
        sepoRenderReplicaDestinos,
      );
    }
    if (
      q("#btnReplicaSelectAll") &&
      !q("#btnReplicaSelectAll").dataset.sepoBound
    ) {
      q("#btnReplicaSelectAll").dataset.sepoBound = "1";
      q("#btnReplicaSelectAll").addEventListener("click", function () {
        const box = q("#replicaPreguntasDestino");
        if (!box) return;
        const checks = qa('input[type="checkbox"]:not(:disabled)', box);
        if (!checks.length) return;
        const allChecked = checks.every(function (c) {
          return c.checked;
        });
        checks.forEach(function (c) {
          c.checked = !allChecked;
        });
        this.textContent = !allChecked ? "Ninguno" : "Todos";
      });
    }
  }

  window.precargarBolsito = function () {
    _precargarBolsito.apply(this, arguments);
    sepoRenderPlantillaReal();
    sepoBindFeatureEvents();
  };

  document.addEventListener("DOMContentLoaded", function () {
    sepoBindFeatureEvents();
  });
})(window, document);

/* ========================================== */
/* ACTUALIZACION: CORRECCIONES PUNTUALES UI   */
/* ========================================== */
(function (window, document) {
  "use strict";

  function q(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function sepoHardCloseModal(modalId) {
    const modalEl = document.getElementById(modalId);
    if (!modalEl) return;

    try {
      if (window.bootstrap) {
        const instance =
          window.bootstrap.Modal.getInstance(modalEl) ||
          new window.bootstrap.Modal(modalEl);
        instance.hide();
      }
    } catch (e) {}

    modalEl.classList.remove("show");
    modalEl.setAttribute("aria-hidden", "true");
    modalEl.style.display = "none";
    if (!document.querySelector(".modal.show")) {
      document.body.classList.remove("modal-open");
      document.body.style.removeProperty("padding-right");
      document.body.style.overflow = "";
    }
    qa(".modal-backdrop").forEach(function (bd) {
      if (!bd.classList.contains("show") || !document.querySelector(".modal.show")) bd.remove();
    });
  }

  function sepoEnsureModalCleanup() {
    const modalEl = document.getElementById("modalNuevaPregunta");
    if (!modalEl || modalEl.dataset.sepoCleanupBound === "1") return;
    modalEl.dataset.sepoCleanupBound = "1";
    modalEl.addEventListener("hidden.bs.modal", function () {
      if (!document.querySelector(".modal.show")) {
        document.body.classList.remove("modal-open");
        document.body.style.removeProperty("padding-right");
        document.body.style.overflow = "";
      }
      qa(".modal-backdrop").forEach(function (bd) {
        if (!bd.classList.contains("show") || !document.querySelector(".modal.show")) bd.remove();
      });
    });
  }

  const _guardarNuevaPregunta_fixBase = window.guardarNuevaPregunta;
  window.guardarNuevaPregunta = function () {
    const result = _guardarNuevaPregunta_fixBase.apply(this, arguments);
    setTimeout(function () {
      sepoHardCloseModal("modalNuevaPregunta");
    }, 10);
    return result;
  };

  window.duplicarPregunta = function (btn) {
    const row = btn.closest(".item-row");
    const box = document.getElementById("boxPreg");
    if (!row || !box) return;

    if (btn.dataset.sepoDupBusy === "1") return;
    btn.dataset.sepoDupBusy = "1";

    const clone = row.cloneNode(true);
    const desc = clone.querySelector(".desc-text");
    if (desc) {
      desc.textContent = (desc.textContent || "Pregunta") + " (Copia)";
    }

    clone.dataset.sepoId = "preg_" + Date.now();

    if (row.dataset.sepoConfig) {
      clone.dataset.sepoConfig = row.dataset.sepoConfig;
    }

    row.after(clone);

    if (typeof window.renumerarContenedor === "function") {
      window.renumerarContenedor("#boxPreg");
    }

    if (typeof window.precargarBolsito === "function") {
      window.precargarBolsito();
    }

    if (typeof window.showToast === "function") {
      window.showToast("✅ Pregunta duplicada.");
    }

    setTimeout(function () {
      btn.dataset.sepoDupBusy = "0";
    }, 250);
  };

  function sepoFindOrderBlock(card) {
    const candidates = qa("div", card);
    return (
      candidates.find(function (el) {
        const label = q("label", el);
        const input = q(
          'input[type="number"][onchange*="reordenarPrestacion"]',
          el,
        );
        return !!label && !!input && /orden/i.test(label.textContent || "");
      }) || null
    );
  }

  function sepoMoveOrderFieldsLeft() {
    qa(
      "#lista-sepo .card-item, #lista-complementario .card-item, #listaPrestOrden .card-item",
    ).forEach(function (card) {
      const orderInput = q(
        'input[type="number"][onchange*="reordenarPrestacion"]',
        card,
      );
      if (!orderInput) return;
      const orderBlock = orderInput.closest("div");
      const icon = q(".icon-box", card);
      const firstMeta = icon ? icon.nextElementSibling : null;
      if (!orderBlock || !icon || !firstMeta) return;
      if (orderBlock.previousElementSibling === icon) return;
      icon.insertAdjacentElement("afterend", orderBlock);
    });
  }

  function sepoInferHistorialDesdeDOM(modulo) {
    const map = {
      "Centros Médicos": "#screen-centros .card-item",
      "Grado de Instrucción": "#screen-grado .card-item",
      Ocupaciones: "#screen-ocupaciones .card-item",
      "Grupos Ocupacionales": "#screen-grupos .card-item",
      Prestaciones: "#screen-prestaciones .card-item",
      Fichas: "#screen-fichas .card-item",
      "Orden de Prestaciones": "#screen-orden .card-item",
      "Pruebas Psicológicas": "#screen-pruebas .card-prueba",
    };
    const selector = map[modulo];
    if (!selector) return [];
    const rows = qa(selector).slice(0, 10);
    const now = new Date();
    const stamp =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0") +
      " " +
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0");
    return rows.map(function (row, idx) {
      const strong = q("strong", row);
      const name = q(".fw-semibold, .prueba-title, .desc-text", row);
      return {
        fecha: stamp,
        usuario: "Sistema",
        accion: idx % 2 === 0 ? "Consulta" : "Edición",
        registro: strong ? strong.textContent.trim() : "REG-" + (idx + 1),
        detalles: name ? name.textContent.trim() : "Registro visualizado",
        modulo: modulo,
      };
    });
  }

  const _verHistorialBase = window.verHistorial;
  window.verHistorial = function (modulo) {
    const tbody = document.getElementById("historialTableBody");
    const title = document.getElementById("historialModuloTitle");
    if (!tbody || !title) {
      return _verHistorialBase
        ? _verHistorialBase.apply(this, arguments)
        : undefined;
    }

    title.textContent = modulo;
    let filtrados = [];
    try {
      filtrados = (_historialDemo || []).filter(function (h) {
        return h.modulo === modulo;
      });
    } catch (e) {
      filtrados = [];
    }

    if (!filtrados.length) {
      filtrados = sepoInferHistorialDesdeDOM(modulo);
    }

    tbody.innerHTML = "";
    if (!filtrados.length) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="text-center py-4 text-muted">No hay cambios registrados recientemente.</td></tr>';
    } else {
      filtrados
        .slice()
        .reverse()
        .forEach(function (h) {
          tbody.innerHTML += `
          <tr>
            <td class="ps-4 fw-medium text-muted">${h.fecha}</td>
            <td>${h.usuario}</td>
            <td><span class="badge bg-light text-dark border">${h.accion}</span></td>
            <td class="fw-semibold">${h.registro}</td>
            <td class="pe-4">${h.detalles}</td>
          </tr>
        `;
        });
    }

    const modalEl = document.getElementById("modalHistorial");
    if (modalEl && window.bootstrap) {
      new window.bootstrap.Modal(modalEl).show();
    }
  };

  function sepoCompactLists() {
    // la mayor parte se resuelve por CSS; aquí solo ajustamos alturas puntuales
    qa(".card-item").forEach(function (el) {
      el.style.minHeight = "unset";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    sepoEnsureModalCleanup();
    sepoMoveOrderFieldsLeft();
    sepoCompactLists();
  });

  document.addEventListener("sepo:screen:change", function () {
    setTimeout(function () {
      sepoMoveOrderFieldsLeft();
      sepoCompactLists();
    }, 30);
  });

  window.SEPOUIHardFixes = {
    sepoHardCloseModal,
    sepoMoveOrderFieldsLeft,
  };
})(window, document);

/* ========================================== */
/* ACTUALIZACION: HOTFIX DUPLICAR Y ORDEN     */
/* ========================================== */
(function (window, document) {
  "use strict";

  function q(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  document.addEventListener(
    "click",
    function (e) {
      const btn = e.target.closest(
        'button[title*="Duplicar"], button[title*="duplicar"]',
      );
      if (!btn) return;
      const row = btn.closest("#boxPreg .item-row");
      if (!row) return;

      e.preventDefault();
      e.stopPropagation();

      if (typeof window.duplicarPregunta === "function") {
        window.duplicarPregunta(btn);
      }
    },
    true,
  );

  function moveOnlyOrderField() {
    qa(
      "#lista-sepo .card-item, #lista-complementario .card-item, #listaPrestOrden .card-item",
    ).forEach(function (card) {
      const orderInput = q(
        'input[type="number"][onchange*="reordenarPrestacion"]',
        card,
      );
      if (!orderInput) return;

      const orderBlock = orderInput.closest("div");
      if (!orderBlock) return;

      const icon = q(".icon-box", card);
      const firstMeta = icon ? icon.nextElementSibling : null;
      if (!icon || !firstMeta) return;

      if (orderBlock.previousElementSibling === icon) return;

      icon.insertAdjacentElement("afterend", orderBlock);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    moveOnlyOrderField();
  });

  document.addEventListener("sepo:screen:change", function () {
    setTimeout(moveOnlyOrderField, 30);
  });

  window.SEPOHotfixV2 = { moveOnlyOrderField: moveOnlyOrderField };
})(window, document);

(function (window, document) {
  "use strict";

  function q(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function isOrderBlock(el) {
    if (!el || !el.querySelector) return false;
    const label = el.querySelector("label");
    const input = el.querySelector('input[type="number"]');
    return (
      !!label &&
      !!input &&
      /orden/i.test((label.textContent || "").trim())
    );
  }

  function collectDirectOrderBlocks(card) {
    if (!card) return [];
    return qa("div", card).filter(isOrderBlock);
  }

  function createOrderBlock(value, wide) {
    const wrap = document.createElement("div");
    wrap.className = "d-flex flex-column align-items-center gap-1";
    if (wide) wrap.style.width = "70px";
    wrap.innerHTML = `
      <label
        class="fw-bold text-muted mb-0"
        style="font-size: 0.6rem; letter-spacing: 0.5px; text-transform: uppercase;"
      >ORDEN</label>
      <input
        type="number"
        class="form-control form-control-sm fw-bold text-primary border"
        onchange="reordenarPrestacion(this)"
        value="${value}"
        min="1"
        style="width: ${wide ? "70px" : "65px"}; height: 32px; border-radius: 8px; font-size: 0.9rem;"
      />`;
    return wrap;
  }

  function normalizeOrderCards(selector, options) {
    const cards = qa(selector);
    cards.forEach(function (card, index) {
      const icon = q(".icon-box", card);
      const blocks = collectDirectOrderBlocks(card);
      let primary = blocks[0] || null;
      const existingInput = primary ? q('input[type="number"]', primary) : null;
      const preservedValue =
        existingInput && existingInput.value
          ? existingInput.value
          : String(index + 1);
      const row = icon
        ? icon.parentElement || card
        : q(".d-flex.align-items-center.gap-3.w-100", card) || card;

      if (!primary) {
        primary = createOrderBlock(preservedValue, !!(options && options.wide));
      }

      blocks.slice(1).forEach(function (dup) {
        if (dup !== primary) dup.remove();
      });

      const input = q('input[type="number"]', primary);
      if (input && (!input.value || Number(input.value) <= 0)) {
        input.value = preservedValue;
      }

      if (icon) {
        if (
          primary.parentElement !== row ||
          primary.previousElementSibling !== icon
        ) {
          icon.insertAdjacentElement("afterend", primary);
        }
      } else if (primary.parentElement !== row) {
        row.insertAdjacentElement("afterbegin", primary);
      }
    });
  }

  function removeOrderBlocks(selector) {
    qa(selector).forEach(function (card) {
      collectDirectOrderBlocks(card).forEach(function (block) {
        block.remove();
      });
    });
  }

  function sepoNormalizeVisibleOrderFields() {
    removeOrderBlocks("#screen-centros .card-item");
    normalizeOrderCards("#lista-sepo .card-item", { wide: true });
    normalizeOrderCards("#lista-complementario .card-item", { wide: false });
    normalizeOrderCards("#listaPrestOrden .card-item", { wide: false });
  }

  document.addEventListener("DOMContentLoaded", function () {
    sepoNormalizeVisibleOrderFields();
  });

  document.addEventListener("sepo:screen:change", function () {
    setTimeout(sepoNormalizeVisibleOrderFields, 30);
  });

  window.SEPONormalizeOrderFields = sepoNormalizeVisibleOrderFields;
})(window, document);

/* ========================================== */
/* ACTUALIZACION: PRUEBAS PSICOLOGICAS F1-F2  */
/* MODELO: PREGUNTA -> RESPUESTA -> FACTOR    */
/* ========================================== */
(function (window, document) {
  "use strict";

  function q(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }
  function parseJSON(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return fallback;
    }
  }

  function getPreguntaRows() {
    return qa("#boxPreg .item-row");
  }

  function getFactorsCatalog() {
    return qa("#boxFac .item-row").map(function (row, index) {
      const code = row.getAttribute("data-cod") || "FAC-" + (index + 1);
      const desc =
        row.getAttribute("data-desc") ||
        (q(".fw-medium", row)
          ? q(".fw-medium", row).textContent.trim()
          : "Factor " + (index + 1));
      return { id: code, code: code, label: desc };
    });
  }

  function getQuestionsModel() {
    return getPreguntaRows().map(function (row, index) {
      const cfg = parseJSON(row.dataset.sepoConfig || "{}", {});
      const id = row.dataset.sepoId || "preg_" + (index + 1);
      row.dataset.sepoId = id;
      const title = q(".desc-text", row)
        ? q(".desc-text", row).textContent.trim()
        : "Pregunta " + (index + 1);
      let tipo = row.getAttribute("data-tipo") || cfg.tipo || "";
      const badges = qa(".badge", row);
      if (!tipo && badges.length) {
        const txt = badges
          .map(function (b) {
            return (b.textContent || "").toLowerCase();
          })
          .join(" | ");
        if (txt.includes("abierta")) tipo = "abierta";
        else if (txt.includes("cerrada")) tipo = "cerrada";
        else if (txt.includes("matriz")) tipo = "matriz";
        else if (txt.includes("tarjeta")) tipo = "tarjeta";
        else if (txt.includes("numerica") || txt.includes("numérica"))
          tipo = "numerica";
      }
      if (tipo === "cerrada") {
        cfg.cerrada = cfg.cerrada || {};
        cfg.cerrada.alternativas = Array.isArray(cfg.cerrada.alternativas)
          ? cfg.cerrada.alternativas
          : [];
        cfg.cerrada.alternativas = cfg.cerrada.alternativas.map(
          function (alt, altIndex) {
            alt.asignaciones =
              Array.isArray(alt.asignaciones) && alt.asignaciones.length
                ? alt.asignaciones
                : [{ factorId: "", valor: 0 }];
            return alt;
          },
        );
      }
      if (tipo === "abierta") {
        cfg.abierta = cfg.abierta || {};
        cfg.abierta.asignaciones =
          Array.isArray(cfg.abierta.asignaciones) &&
          cfg.abierta.asignaciones.length
            ? cfg.abierta.asignaciones
            : [
                {
                  factorId: "",
                  valor: Number(cfg.abierta.valorEsperado || 0) || 0,
                },
              ];
      }
      row.dataset.sepoConfig = JSON.stringify(cfg);
      return { id: id, title: title, tipo: tipo, cfg: cfg, row: row };
    });
  }

  function writeQuestionCfg(questionId, updater) {
    const row = getPreguntaRows().find(function (r) {
      return r.dataset.sepoId === questionId;
    });
    if (!row) return;
    const cfg = parseJSON(row.dataset.sepoConfig || "{}", {});
    updater(cfg);
    row.dataset.sepoConfig = JSON.stringify(cfg);
  }

  function factorOptions(selected) {
    const factors = getFactorsCatalog();
    const base = ['<option value="">Seleccionar factor...</option>'];
    factors.forEach(function (f) {
      base.push(
        '<option value="' +
          f.id +
          '"' +
          (selected === f.id ? " selected" : "") +
          ">" +
          f.code +
          " · " +
          f.label +
          "</option>",
      );
    });
    return base.join("");
  }

  function renderClosedAssignments(question) {
    if (question.tipo === "abierta") return "";
    const alts =
      (question.cfg.cerrada && question.cfg.cerrada.alternativas) || [];
    if (!alts.length) {
      return '<div class="alert alert-light border text-muted small mb-0">Esta pregunta aún no tiene alternativas configuradas.</div>';
    }
    return `
      <div class="border rounded bg-white p-3 shadow-sm mb-2 border-primary" data-question-id="${question.id}">
        <div class="fw-bold text-primary mb-2">${question.title}</div>
        <div class="small text-muted mb-3">Aquí solo se asignan valores base a cada alternativa. Los factores se construyen en el paso Factores.</div>
        ${alts
          .map(function (alt, altIndex) {
            const label =
              alt.tipo === "imagen"
                ? "Imagen " + (altIndex + 1)
                : alt.texto || "Alternativa " + (altIndex + 1);
            return `
            <div class="d-flex align-items-center justify-content-between py-2 ${altIndex < alts.length - 1 ? "border-bottom border-light" : ""}">
              <div class="fw-medium text-dark">${label}</div>
              <div class="d-flex align-items-center gap-2">
                <label class="small text-muted fw-bold mb-0">Pts. base:</label>
                <input type="number" class="form-control form-control-sm text-center"
                  style="width:80px;"
                  data-role="score-value"
                  data-question-id="${question.id}"
                  data-alt-index="${altIndex}"
                  value="${Number(alt.valor || 0)}"
                  step="0.1">
              </div>
            </div>
          `;
          })
          .join("")}
      </div>
    `;
  }

  function renderOpenAssignments(question) {
    const abierta = question.cfg.abierta || {};
    return `
      <div class="border rounded bg-white p-3 shadow-sm mb-2 border-warning">
        <div class="fw-bold text-warning mb-2">${question.title}</div>
        <div class="small text-muted mb-3">Aquí se define la respuesta esperada y su valor base. Los factores se configuran en el paso Factores.</div>
        <div class="row g-3 mb-2">
          <div class="col-md-8">
            <label class="small text-muted fw-bold mb-1">Respuesta esperada</label>
            <input type="text" class="form-control form-control-sm"
              data-role="open-expected"
              data-question-id="${question.id}"
              value="${abierta.respuestaEsperada || ""}">
          </div>
          <div class="col-md-4">
            <label class="small text-muted fw-bold mb-1">Puntaje base</label>
            <input type="number" class="form-control form-control-sm"
              step="0.1"
              data-role="open-score"
              data-question-id="${question.id}"
              value="${Number(abierta.valorEsperado || 0)}">
          </div>
        </div>
      </div>`;
  }

  function renderPsicoPlantilla() {
    const closedContainer = q("#plantillaCerradasContainer");
    const openContainer = q("#plantillaAbiertasContainer");
    if (!closedContainer || !openContainer) return;

    const questions = getQuestionsModel();
    const closed = questions.filter(function (q) {
      return q.tipo === "cerrada";
    });
    const open = questions.filter(function (q) {
      return q.tipo === "abierta";
    });

    closedContainer.innerHTML = closed.length
      ? closed.map(renderClosedAssignments).join("")
      : '<div class="alert alert-light text-muted small shadow-sm"><i class="fas fa-info-circle me-2"></i>Las preguntas cerradas se cargarán automáticamente al ingresar a esta pestaña.</div>';

    openContainer.innerHTML = open.length
      ? open.map(renderOpenAssignments).join("")
      : '<div class="alert alert-light text-muted small shadow-sm"><i class="fas fa-info-circle me-2"></i>Las preguntas abiertas se cargarán automáticamente al ingresar a esta pestaña.</div>';
  }

  function syncOpenScoreToAssignments(questionId, newValue) {
    writeQuestionCfg(questionId, function (cfg) {
      cfg.abierta = cfg.abierta || {};
      cfg.abierta.valorEsperado = newValue;
      cfg.abierta.asignaciones = Array.isArray(cfg.abierta.asignaciones)
        ? cfg.abierta.asignaciones
        : [];
      cfg.abierta.asignaciones = cfg.abierta.asignaciones.map(function (item) {
        if (!item.valor || Number(item.valor) === 0) item.valor = newValue;
        return item;
      });
    });
  }

  function bindPlantillaEvents() {
    const closedContainer = q("#plantillaCerradasContainer");
    const openContainer = q("#plantillaAbiertasContainer");

    if (closedContainer && closedContainer.dataset.sepoPsicoBound !== "1") {
      closedContainer.dataset.sepoPsicoBound = "1";
      closedContainer.addEventListener("input", function (e) {
        const el = e.target;
        if (el.matches('[data-role="score-value"]')) {
          const qid = el.dataset.questionId;
          const altIndex = Number(el.dataset.altIndex);
          writeQuestionCfg(qid, function (cfg) {
            cfg.cerrada = cfg.cerrada || {};
            cfg.cerrada.alternativas = cfg.cerrada.alternativas || [];
            if (!cfg.cerrada.alternativas[altIndex]) return;
            cfg.cerrada.alternativas[altIndex].valor = Number(el.value || 0);
          });
        }
      });
    }

    if (openContainer && openContainer.dataset.sepoPsicoBound !== "1") {
      openContainer.dataset.sepoPsicoBound = "1";
      openContainer.addEventListener("input", function (e) {
        const el = e.target;
        if (el.matches('[data-role="open-expected"]')) {
          writeQuestionCfg(el.dataset.questionId, function (cfg) {
            cfg.abierta = cfg.abierta || {};
            cfg.abierta.respuestaEsperada = el.value;
          });
        }
        if (el.matches('[data-role="open-score"]')) {
          const val = Number(el.value || 0);
          writeQuestionCfg(el.dataset.questionId, function (cfg) {
            cfg.abierta = cfg.abierta || {};
            cfg.abierta.valorEsperado = val;
            cfg.abierta.asignaciones =
              Array.isArray(cfg.abierta.asignaciones) &&
              cfg.abierta.asignaciones.length
                ? cfg.abierta.asignaciones.map(function (item) {
                    item.valor = val;
                    return item;
                  })
                : [{ factorId: "", valor: val }];
          });
        }
      });
    }
  }

  const _oldGuardarPreguntaPsico = window.guardarNuevaPregunta;
  window.guardarNuevaPregunta = function () {
    const result = _oldGuardarPreguntaPsico.apply(this, arguments);
    setTimeout(function () {
      renderPsicoPlantilla();
      bindPlantillaEvents();
    }, 20);
    return result;
  };

  const _oldEditarPreguntaPsico = window.editarPreguntaRow;
  window.editarPreguntaRow = function (btn) {
    const result = _oldEditarPreguntaPsico.apply(this, arguments);
    return result;
  };

  const _oldAddFactorPsico = window.addFactor;
  if (typeof _oldAddFactorPsico === "function") {
    window.addFactor = function () {
      const result = _oldAddFactorPsico.apply(this, arguments);
      setTimeout(function () {
        renderPsicoPlantilla();
        bindPlantillaEvents();
      }, 20);
      return result;
    };
  }

  const _oldPrecargarBolsitoPsico = window.precargarBolsito;
  window.precargarBolsito = function () {
    const result = _oldPrecargarBolsitoPsico.apply(this, arguments);
    renderPsicoPlantilla();
    bindPlantillaEvents();
    return result;
  };

  document.addEventListener("DOMContentLoaded", function () {
    bindPlantillaEvents();
  });

  window.SEPOPruebasPsicoFases12 = {
    render: renderPsicoPlantilla,
    getQuestionsModel: getQuestionsModel,
    getFactorsCatalog: getFactorsCatalog,
  };
})(window, document);

/* ACTUALIZACION: CORRECCION TIPO ABIERTA */

/* ACTUALIZACION: FILTRO SOLO CERRADAS EN PLANTILLA */

/* ========================================== */
/* ACTUALIZACION: DEMO CONFIGURADA PRUEBAS    */
/* ========================================== */
(function (window, document) {
  "use strict";

  function q(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }
  function parseJSON(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return fallback;
    }
  }

  function sepoDemoClosedAlternatives(title) {
    const txt = String(title || "").toLowerCase();
    if (txt.includes("frecuencia") || txt.includes("intensidad")) {
      return [
        {
          texto: "Nunca",
          tipo: "texto",
          valor: 0,
          asignaciones: [{ factorId: "", valor: 0 }],
        },
        {
          texto: "A veces",
          tipo: "texto",
          valor: 1,
          asignaciones: [{ factorId: "", valor: 1 }],
        },
        {
          texto: "Siempre",
          tipo: "texto",
          valor: 2,
          asignaciones: [{ factorId: "", valor: 2 }],
        },
      ];
    }
    if (
      txt.includes("seleccione") ||
      txt.includes("síntoma") ||
      txt.includes("sintoma")
    ) {
      return [
        {
          texto: "Fatiga",
          tipo: "texto",
          valor: 1,
          asignaciones: [{ factorId: "", valor: 1 }],
        },
        {
          texto: "Palpitaciones",
          tipo: "texto",
          valor: 1,
          asignaciones: [{ factorId: "", valor: 1 }],
        },
        {
          texto: "Sudoración",
          tipo: "texto",
          valor: 1,
          asignaciones: [{ factorId: "", valor: 1 }],
        },
      ];
    }
    if (
      txt.includes("imagen") ||
      txt.includes("ilustración") ||
      txt.includes("ilustracion")
    ) {
      return [
        {
          texto: "Sí, me resulta familiar",
          tipo: "texto",
          valor: 2,
          asignaciones: [{ factorId: "", valor: 2 }],
        },
        {
          texto: "Parcialmente",
          tipo: "texto",
          valor: 1,
          asignaciones: [{ factorId: "", valor: 1 }],
        },
        {
          texto: "No",
          tipo: "texto",
          valor: 0,
          asignaciones: [{ factorId: "", valor: 0 }],
        },
      ];
    }
    return [
      {
        texto: "Opción A",
        tipo: "texto",
        valor: 0,
        asignaciones: [{ factorId: "", valor: 0 }],
      },
      {
        texto: "Opción B",
        tipo: "texto",
        valor: 1,
        asignaciones: [{ factorId: "", valor: 1 }],
      },
      {
        texto: "Opción C",
        tipo: "texto",
        valor: 2,
        asignaciones: [{ factorId: "", valor: 2 }],
      },
    ];
  }

  function sepoHydrateDemoQuestionConfigs() {
    qa("#boxPreg .item-row").forEach(function (row, index) {
      const cfg = parseJSON(row.dataset.sepoConfig || "{}", {});
      const title = q(".desc-text", row)
        ? q(".desc-text", row).textContent.trim()
        : "Pregunta " + (index + 1);
      const tipo = row.getAttribute("data-tipo") || cfg.tipo || "";

      if (tipo === "cerrada") {
        cfg.tipo = "cerrada";
        cfg.cerrada = cfg.cerrada || {};
        if (
          !Array.isArray(cfg.cerrada.alternativas) ||
          !cfg.cerrada.alternativas.length
        ) {
          cfg.cerrada.alternativas = sepoDemoClosedAlternatives(title);
        }
      }

      if (tipo === "abierta") {
        cfg.tipo = "abierta";
        cfg.abierta = cfg.abierta || {};
        if (
          !Array.isArray(cfg.abierta.asignaciones) ||
          !cfg.abierta.asignaciones.length
        ) {
          cfg.abierta.asignaciones = [
            {
              factorId: "",
              valor: Number(cfg.abierta.valorEsperado || 0) || 0,
            },
          ];
        }
      }

      row.dataset.sepoConfig = JSON.stringify(cfg);
    });
  }

  const _oldPrecargarBolsitoDemoSeed = window.precargarBolsito;
  if (typeof _oldPrecargarBolsitoDemoSeed === "function") {
    window.precargarBolsito = function () {
      const result = _oldPrecargarBolsitoDemoSeed.apply(this, arguments);
      try {
        sepoHydrateDemoQuestionConfigs();
      } catch (e) {}
      if (
        window.SEPOPruebasPsicoFases12 &&
        typeof window.SEPOPruebasPsicoFases12.render === "function"
      ) {
        window.SEPOPruebasPsicoFases12.render();
      }
      return result;
    };
  }

  document.addEventListener("DOMContentLoaded", function () {
    try {
      sepoHydrateDemoQuestionConfigs();
    } catch (e) {}
  });

  window.SEPODemoSeed = {
    sepoHydrateDemoQuestionConfigs: sepoHydrateDemoQuestionConfigs,
  };
})(window, document);

/* ========================================== */
/* ACTUALIZACION: FACTORES FASE 1 SEGURA      */
/* SOLO PRUEBAS PSICOLOGICAS                  */
/* ========================================== */
(function (window, document) {
  "use strict";

  function q(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }
  function parseJSON(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return fallback;
    }
  }

  function getCatalogFactorsSafe() {
    return qa("#boxFac .item-row").map(function (row, index) {
      const code = row.getAttribute("data-cod") || "FACT_" + (index + 1);
      const desc =
        row.getAttribute("data-desc") ||
        (q(".fw-medium", row)
          ? q(".fw-medium", row).textContent.trim()
          : "Factor " + (index + 1));
      return { id: code, code: code, label: desc };
    });
  }

  function factorOptionsSafe(selected) {
    const opts = ['<option value="">Seleccionar factor...</option>'];
    getCatalogFactorsSafe().forEach(function (f) {
      opts.push(
        '<option value="' +
          f.id +
          '"' +
          (selected === f.id ? " selected" : "") +
          ">" +
          f.code +
          " · " +
          f.label +
          "</option>",
      );
    });
    return opts.join("");
  }

  function updateQuestionConfigSafe(questionId, updater) {
    const row = qa("#boxPreg .item-row").find(function (r) {
      return r.dataset.sepoId === questionId;
    });
    if (!row) return;
    const cfg = parseJSON(row.dataset.sepoConfig || "{}", {});
    updater(cfg);
    row.dataset.sepoConfig = JSON.stringify(cfg);
  }

  function refreshFactorSelectsSafe() {
    return;
  }

  function normalizeAssignmentsSafe() {
    qa("#boxPreg .item-row").forEach(function (row, idx) {
      const cfg = parseJSON(row.dataset.sepoConfig || "{}", {});
      const tipo = row.getAttribute("data-tipo") || cfg.tipo || "";
      if (tipo === "cerrada") {
        cfg.tipo = "cerrada";
        cfg.cerrada = cfg.cerrada || {};
        cfg.cerrada.alternativas = Array.isArray(cfg.cerrada.alternativas)
          ? cfg.cerrada.alternativas
          : [];
        cfg.cerrada.alternativas = cfg.cerrada.alternativas.map(function (alt) {
          alt.asignaciones =
            Array.isArray(alt.asignaciones) && alt.asignaciones.length
              ? alt.asignaciones
              : [{ factorId: "", valor: Number(alt.valor || 0) || 0 }];
          return alt;
        });
      }
      if (tipo === "abierta") {
        cfg.tipo = "abierta";
        cfg.abierta = cfg.abierta || {};
        cfg.abierta.asignaciones =
          Array.isArray(cfg.abierta.asignaciones) &&
          cfg.abierta.asignaciones.length
            ? cfg.abierta.asignaciones
            : [
                {
                  factorId: "",
                  valor: Number(cfg.abierta.valorEsperado || 0) || 0,
                },
              ];
      }
      row.dataset.sepoConfig = JSON.stringify(cfg);
    });
  }

  function renderFactorSummarySafe() {
    const closedTitle = qa(
      "#plantillaCerradasContainer .border.rounded.bg-white.p-3.shadow-sm.mb-2.border-primary",
    );
    closedTitle.forEach(function (card) {
      const qid = card.getAttribute("data-question-id");
      if (!qid) return;
      const old = q('[data-role="factor-summary"]', card);
      if (old) old.remove();

      const row = qa("#boxPreg .item-row").find(function (r) {
        return r.dataset.sepoId === qid;
      });
      if (!row) return;
      const cfg = parseJSON(row.dataset.sepoConfig || "{}", {});
      const alts = ((cfg || {}).cerrada || {}).alternativas || [];
      let totalLinks = 0;
      alts.forEach(function (a) {
        totalLinks += (a.asignaciones || []).filter(function (x) {
          return x.factorId;
        }).length;
      });

      const summary = document.createElement("div");
      summary.setAttribute("data-role", "factor-summary");
      summary.className = "small text-muted mb-2";
      summary.innerHTML =
        '<i class="fas fa-link me-1"></i>' +
        totalLinks +
        " asignación(es) a factores";
      const header = q("h6", card);
      if (header) header.insertAdjacentElement("afterend", summary);
    });

    qa(
      "#plantillaAbiertasContainer .border.rounded.bg-white.p-3.shadow-sm.mb-2.border-warning",
    ).forEach(function (card) {
      const old = q('[data-role="factor-summary"]', card);
      if (old) old.remove();
      const sels = qa('select[data-role="open-factor-select"]', card);
      const totalLinks = sels.filter(function (s) {
        return !!s.value;
      }).length;
      const summary = document.createElement("div");
      summary.setAttribute("data-role", "factor-summary");
      summary.className = "small text-muted mb-2";
      summary.innerHTML =
        '<i class="fas fa-link me-1"></i>' +
        totalLinks +
        " asignación(es) a factores";
      const header = q("h6", card);
      if (header) header.insertAdjacentElement("afterend", summary);
    });
  }

  function bindFactorsPhase1Safe() {
    const closed = q("#plantillaCerradasContainer");
    const open = q("#plantillaAbiertasContainer");
    if (closed && closed.dataset.sepoFactorPhase1Bound !== "1") {
      closed.dataset.sepoFactorPhase1Bound = "1";
      closed.addEventListener("change", function (e) {
        const sel = e.target.closest('select[data-role="factor-select"]');
        if (!sel) return;
        const qid = sel.dataset.questionId;
        const altIndex = Number(sel.dataset.altIndex);
        const asigIndex = Number(sel.dataset.asigIndex);
        updateQuestionConfigSafe(qid, function (cfg) {
          cfg.cerrada = cfg.cerrada || {};
          cfg.cerrada.alternativas = cfg.cerrada.alternativas || [];
          if (!cfg.cerrada.alternativas[altIndex]) return;
          cfg.cerrada.alternativas[altIndex].asignaciones =
            cfg.cerrada.alternativas[altIndex].asignaciones || [];
          if (!cfg.cerrada.alternativas[altIndex].asignaciones[asigIndex])
            cfg.cerrada.alternativas[altIndex].asignaciones[asigIndex] = {
              factorId: "",
              valor: 0,
            };
          cfg.cerrada.alternativas[altIndex].asignaciones[asigIndex].factorId =
            sel.value;
        });
        renderFactorSummarySafe();
      });
      closed.addEventListener("input", function (e) {
        const inp = e.target.closest('input[data-role="factor-value"]');
        if (!inp) return;
        const qid = inp.dataset.questionId;
        const altIndex = Number(inp.dataset.altIndex);
        const asigIndex = Number(inp.dataset.asigIndex);
        updateQuestionConfigSafe(qid, function (cfg) {
          cfg.cerrada = cfg.cerrada || {};
          cfg.cerrada.alternativas = cfg.cerrada.alternativas || [];
          if (!cfg.cerrada.alternativas[altIndex]) return;
          cfg.cerrada.alternativas[altIndex].asignaciones =
            cfg.cerrada.alternativas[altIndex].asignaciones || [];
          if (!cfg.cerrada.alternativas[altIndex].asignaciones[asigIndex])
            cfg.cerrada.alternativas[altIndex].asignaciones[asigIndex] = {
              factorId: "",
              valor: 0,
            };
          cfg.cerrada.alternativas[altIndex].asignaciones[asigIndex].valor =
            Number(inp.value || 0);
        });
      });
    }

    if (open && open.dataset.sepoFactorPhase1Bound !== "1") {
      open.dataset.sepoFactorPhase1Bound = "1";
      open.addEventListener("change", function (e) {
        const sel = e.target.closest('select[data-role="open-factor-select"]');
        if (!sel) return;
        const qid = sel.dataset.questionId;
        const idx = Number(sel.dataset.asigIndex);
        updateQuestionConfigSafe(qid, function (cfg) {
          cfg.abierta = cfg.abierta || {};
          cfg.abierta.asignaciones = cfg.abierta.asignaciones || [];
          if (!cfg.abierta.asignaciones[idx])
            cfg.abierta.asignaciones[idx] = { factorId: "", valor: 0 };
          cfg.abierta.asignaciones[idx].factorId = sel.value;
        });
        renderFactorSummarySafe();
      });
      open.addEventListener("input", function (e) {
        const inp = e.target.closest('input[data-role="open-factor-value"]');
        if (!inp) return;
        const qid = inp.dataset.questionId;
        const idx = Number(inp.dataset.asigIndex);
        updateQuestionConfigSafe(qid, function (cfg) {
          cfg.abierta = cfg.abierta || {};
          cfg.abierta.asignaciones = cfg.abierta.asignaciones || [];
          if (!cfg.abierta.asignaciones[idx])
            cfg.abierta.asignaciones[idx] = { factorId: "", valor: 0 };
          cfg.abierta.asignaciones[idx].valor = Number(inp.value || 0);
        });
      });
    }
  }

  function refreshFactorsPhase1Safe() {
    normalizeAssignmentsSafe();
    refreshFactorSelectsSafe();
    bindFactorsPhase1Safe();
    renderFactorSummarySafe();
  }

  const _addFactorPhase1Safe = window.addFactor;
  if (
    typeof _addFactorPhase1Safe === "function" &&
    !_addFactorPhase1Safe._sepoFactorPhase1Wrapped
  ) {
    const wrapped = function () {
      const result = _addFactorPhase1Safe.apply(this, arguments);
      setTimeout(refreshFactorsPhase1Safe, 20);
      return result;
    };
    wrapped._sepoFactorPhase1Wrapped = true;
    window.addFactor = wrapped;
  }

  const _guardarPreguntaPhase1Safe = window.guardarNuevaPregunta;
  if (
    typeof _guardarPreguntaPhase1Safe === "function" &&
    !_guardarPreguntaPhase1Safe._sepoFactorPhase1Wrapped
  ) {
    const wrapped = function () {
      const result = _guardarPreguntaPhase1Safe.apply(this, arguments);
      setTimeout(refreshFactorsPhase1Safe, 30);
      return result;
    };
    wrapped._sepoFactorPhase1Wrapped = true;
    window.guardarNuevaPregunta = wrapped;
  }

  const _precargarBolsitoPhase1Safe = window.precargarBolsito;
  if (
    typeof _precargarBolsitoPhase1Safe === "function" &&
    !_precargarBolsitoPhase1Safe._sepoFactorPhase1Wrapped
  ) {
    const wrapped = function () {
      const result = _precargarBolsitoPhase1Safe.apply(this, arguments);
      setTimeout(refreshFactorsPhase1Safe, 30);
      return result;
    };
    wrapped._sepoFactorPhase1Wrapped = true;
    window.precargarBolsito = wrapped;
  }

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(refreshFactorsPhase1Safe, 60);
  });

  window.SEPOFactoresFase1Safe = {
    refresh: refreshFactorsPhase1Safe,
    getCatalogFactorsSafe: getCatalogFactorsSafe,
  };
})(window, document);

/* ========================================== */
/* ACTUALIZACION: FACTORES FASE 2 SEGURA      */
/* RESUMEN Y ACUMULADO CONFIGURADO            */
/* ========================================== */
(function (window, document) {
  "use strict";

  function q(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }
  function parseJSON(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return fallback;
    }
  }

  function getFactorCatalogPhase2() {
    return qa("#boxFac .item-row").map(function (row, index) {
      const code = row.getAttribute("data-cod") || "FACT_" + (index + 1);
      const desc =
        row.getAttribute("data-desc") ||
        (q(".fw-medium", row)
          ? q(".fw-medium", row).textContent.trim()
          : "Factor " + (index + 1));
      return { id: code, code: code, label: desc };
    });
  }

  function ensureFactorSummaryBox() {
    const host = q("#step-5");
    if (!host) return null;
    let box = q("#sepoFactorSummaryBox", host);
    if (!box) {
      box = document.createElement("div");
      box.id = "sepoFactorSummaryBox";
      box.className = "soft-panel mt-3 p-4";
      box.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h6 class="fw-bold m-0" style="color: var(--primary-hover)">
              <i class="fas fa-calculator me-2"></i>Resumen de Factores
            </h6>
            <small class="text-muted">Vista previa del acumulado configurado por factor según Plantilla de Respuestas.</small>
          </div>
          <button type="button" class="btn btn-outline-primary btn-sm fw-bold" id="btnRecalcularFactores">
            <i class="fas fa-arrows-rotate me-1"></i>Recalcular
          </button>
        </div>
        <div id="sepoFactorSummaryContent"></div>
      `;
      const target = q("#boxFac", host);
      if (target) {
        target.insertAdjacentElement("afterend", box);
      } else {
        host.appendChild(box);
      }
    }
    return box;
  }

  function getQuestionRowsPhase2() {
    return qa("#boxPreg .item-row");
  }

  function getQuestionModelPhase2() {
    return getQuestionRowsPhase2().map(function (row, index) {
      const cfg = parseJSON(row.dataset.sepoConfig || "{}", {});
      const id = row.dataset.sepoId || "preg_" + (index + 1);
      row.dataset.sepoId = id;
      const title = q(".desc-text", row)
        ? q(".desc-text", row).textContent.trim()
        : "Pregunta " + (index + 1);
      const tipo = row.getAttribute("data-tipo") || cfg.tipo || "";
      return { id: id, title: title, tipo: tipo, cfg: cfg };
    });
  }

  function buildFactorAccumulator() {
    const factorMap = {};
    getFactorCatalogPhase2().forEach(function (f) {
      factorMap[f.id] = {
        id: f.id,
        code: f.code,
        label: f.label,
        total: 0,
        links: 0,
        sources: [],
      };
    });

    getQuestionModelPhase2().forEach(function (question) {
      if (question.tipo === "cerrada") {
        const alts = ((question.cfg || {}).cerrada || {}).alternativas || [];
        alts.forEach(function (alt, altIndex) {
          (alt.asignaciones || []).forEach(function (asig) {
            if (!asig.factorId) return;
            if (!factorMap[asig.factorId]) {
              factorMap[asig.factorId] = {
                id: asig.factorId,
                code: asig.factorId,
                label: asig.factorId,
                total: 0,
                links: 0,
                sources: [],
              };
            }
            const value = Number(asig.valor || 0);
            factorMap[asig.factorId].total += value;
            factorMap[asig.factorId].links += 1;
            factorMap[asig.factorId].sources.push({
              question: question.title,
              item: alt.texto || "Alternativa " + (altIndex + 1),
              value: value,
            });
          });
        });
      }
      if (question.tipo === "abierta") {
        const abierta = (question.cfg || {}).abierta || {};
        (abierta.asignaciones || []).forEach(function (asig, openIndex) {
          if (!asig.factorId) return;
          if (!factorMap[asig.factorId]) {
            factorMap[asig.factorId] = {
              id: asig.factorId,
              code: asig.factorId,
              label: asig.factorId,
              total: 0,
              links: 0,
              sources: [],
            };
          }
          const value = Number(asig.valor || 0);
          factorMap[asig.factorId].total += value;
          factorMap[asig.factorId].links += 1;
          factorMap[asig.factorId].sources.push({
            question: question.title,
            item: "Abierta " + (openIndex + 1),
            value: value,
          });
        });
      }
    });

    return Object.values(factorMap);
  }

  function renderFactorAccumulator() {
    const box = ensureFactorSummaryBox();
    if (!box) return;
    const content = q("#sepoFactorSummaryContent", box);
    if (!content) return;

    const rows = buildFactorAccumulator();
    const useful = rows.filter(function (r) {
      return r.links > 0 || r.label;
    });

    if (!useful.length) {
      content.innerHTML =
        '<div class="alert alert-light text-muted small mb-0"><i class="fas fa-info-circle me-2"></i>No hay factores ni asignaciones configuradas todavía.</div>';
      return;
    }

    content.innerHTML = `
      <div class="table-responsive">
        <table class="table align-middle mb-0">
          <thead>
            <tr>
              <th>Factor</th>
              <th>Descripción</th>
              <th class="text-center">Asignaciones</th>
              <th class="text-center">Acumulado</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            ${useful
              .map(function (row) {
                const detail = row.sources.length
                  ? row.sources
                      .slice(0, 4)
                      .map(function (s) {
                        return (
                          '<span class="badge bg-light text-dark border me-1 mb-1">' +
                          s.question +
                          " · " +
                          s.item +
                          " = " +
                          s.value +
                          "</span>"
                        );
                      })
                      .join("")
                  : '<span class="text-muted small">Sin asignaciones aún</span>';
                return `
                <tr>
                  <td class="fw-bold">${row.code}</td>
                  <td>${row.label}</td>
                  <td class="text-center">${row.links}</td>
                  <td class="text-center">
                    <span class="badge bg-primary-subtle text-primary border">${row.total}</span>
                  </td>
                  <td>${detail}</td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function bindFactorPhase2Safe() {
    const box = ensureFactorSummaryBox();
    if (!box) return;
    const btn = q("#btnRecalcularFactores", box);
    if (btn && !btn.dataset.sepoBoundPhase2) {
      btn.dataset.sepoBoundPhase2 = "1";
      btn.addEventListener("click", renderFactorAccumulator);
    }

    const plantillaClosed = q("#plantillaCerradasContainer");
    const plantillaOpen = q("#plantillaAbiertasContainer");
    if (plantillaClosed && !plantillaClosed.dataset.sepoBoundPhase2) {
      plantillaClosed.dataset.sepoBoundPhase2 = "1";
      plantillaClosed.addEventListener("input", function () {
        setTimeout(renderFactorAccumulator, 10);
      });
      plantillaClosed.addEventListener("change", function () {
        setTimeout(renderFactorAccumulator, 10);
      });
      plantillaClosed.addEventListener("click", function () {
        setTimeout(renderFactorAccumulator, 10);
      });
    }
    if (plantillaOpen && !plantillaOpen.dataset.sepoBoundPhase2) {
      plantillaOpen.dataset.sepoBoundPhase2 = "1";
      plantillaOpen.addEventListener("input", function () {
        setTimeout(renderFactorAccumulator, 10);
      });
      plantillaOpen.addEventListener("change", function () {
        setTimeout(renderFactorAccumulator, 10);
      });
      plantillaOpen.addEventListener("click", function () {
        setTimeout(renderFactorAccumulator, 10);
      });
    }

    const factorsBox = q("#boxFac");
    if (factorsBox && !factorsBox.dataset.sepoBoundPhase2) {
      factorsBox.dataset.sepoBoundPhase2 = "1";
      factorsBox.addEventListener("click", function () {
        setTimeout(renderFactorAccumulator, 20);
      });
    }
  }

  function refreshFactorPhase2Safe() {
    bindFactorPhase2Safe();
    renderFactorAccumulator();
  }

  const _addFactorPhase2 = window.addFactor;
  if (
    typeof _addFactorPhase2 === "function" &&
    !_addFactorPhase2._sepoPhase2Wrapped
  ) {
    const wrapped = function () {
      const result = _addFactorPhase2.apply(this, arguments);
      setTimeout(refreshFactorPhase2Safe, 30);
      return result;
    };
    wrapped._sepoPhase2Wrapped = true;
    window.addFactor = wrapped;
  }

  const _guardarPreguntaPhase2 = window.guardarNuevaPregunta;
  if (
    typeof _guardarPreguntaPhase2 === "function" &&
    !_guardarPreguntaPhase2._sepoPhase2Wrapped
  ) {
    const wrapped = function () {
      const result = _guardarPreguntaPhase2.apply(this, arguments);
      setTimeout(refreshFactorPhase2Safe, 40);
      return result;
    };
    wrapped._sepoPhase2Wrapped = true;
    window.guardarNuevaPregunta = wrapped;
  }

  const _precargarPhase2 = window.precargarBolsito;
  if (
    typeof _precargarPhase2 === "function" &&
    !_precargarPhase2._sepoPhase2Wrapped
  ) {
    const wrapped = function () {
      const result = _precargarPhase2.apply(this, arguments);
      setTimeout(refreshFactorPhase2Safe, 40);
      return result;
    };
    wrapped._sepoPhase2Wrapped = true;
    window.precargarBolsito = wrapped;
  }

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(refreshFactorPhase2Safe, 80);
  });

  window.SEPOFactoresFase2Safe = {
    refresh: refreshFactorPhase2Safe,
    buildFactorAccumulator: buildFactorAccumulator,
  };
})(window, document);

/* ========================================== */
/* ACTUALIZACION: PREVIEW Y RESULTADO DEMO    */
/* SOLO PRUEBAS PSICOLOGICAS                  */
/* ========================================== */

function sepoParseConfig(value, fallback) {
  try {
    return JSON.parse(value);
  } catch (e) {
    return fallback;
  }
}

function sepoGetConfiguredQuestionRows() {
  return Array.from(document.querySelectorAll("#boxPreg .item-row"));
}

function sepoBuildConfiguredPreviewData() {
  const rows = sepoGetConfiguredQuestionRows();
  const preguntas = rows
    .map(function (row, index) {
      const cfg = sepoParseConfig(row.dataset.sepoConfig || "{}", {});
      const tipo = row.getAttribute("data-tipo") || cfg.tipo || "";
      const texto = row.querySelector(".desc-text")
        ? row.querySelector(".desc-text").textContent.trim()
        : "Pregunta " + (index + 1);

      if (tipo === "cerrada") {
        const cerrada = cfg.cerrada || {};
        let opciones = Array.isArray(cerrada.alternativas)
          ? cerrada.alternativas
          : [];
        if (
          !opciones.length &&
          typeof sepoDemoClosedAlternatives === "function"
        ) {
          opciones = sepoDemoClosedAlternatives(texto);
        }
        return {
          tipo: "cerrada",
          texto: texto,
          multiple: (cerrada.tipoResp || "") === "multiple",
          vineta: "may",
          opciones: opciones.map(function (alt, idx) {
            return alt.texto || "Alternativa " + (idx + 1);
          }),
          _config: { cerrada: { alternativas: opciones } },
        };
      }

      if (tipo === "abierta") {
        const abierta = cfg.abierta || {};
        return {
          tipo: "abierta",
          texto: texto,
          numResp: 1,
          _config: { abierta: abierta },
        };
      }

      return null;
    })
    .filter(Boolean);

  return {
    titulo:
      (document.getElementById("prNom") &&
        document.getElementById("prNom").value) ||
      "Previsualización de Prueba",
    icono: "🧠",
    tipo: "Ejecución Demo",
    desc: "Simulación de evaluación con cálculo de resultados por factores.",
    tiempo: "Auto",
    preguntas: preguntas,
  };
}

function sepoOpenConfiguredPreview() {
  const built = sepoBuildConfiguredPreviewData();
  if (!built.preguntas.length) {
    if (typeof showToast === "function")
      showToast("Agrega al menos una pregunta para previsualizar.");
    return;
  }
  pvData = built;
  pvIdx = 0;
  pvSeconds = 0;
  pvRespuestas = {};
  document.getElementById("pvTitle").textContent = pvData.titulo;
  document.getElementById("pvSubtitle").textContent =
    pvData.tipo + " · Previsualización";
  document.getElementById("pvIcon").textContent = pvData.icono;
  document.getElementById("pvCoverIcon").textContent = pvData.icono;
  document.getElementById("pvCoverTitle").textContent = pvData.titulo;
  document.getElementById("pvCoverDesc").textContent = pvData.desc;
  document.getElementById("pvTotalQ").textContent = pvData.preguntas.length;
  document.getElementById("pvEstTime").textContent = pvData.tiempo;
  const resultsBox = document.getElementById("pvFactorResults");
  if (resultsBox) resultsBox.innerHTML = "";
  pvShow("pvPortada", true);
  pvShow("pvPreguntas", false);
  pvShow("pvFinal", false);
  document.getElementById("pvTimer").style.display = "none";
  new bootstrap.Modal(document.getElementById("modalPreview")).show();
}

function previsualizarPruebaConfigurada() {
  sepoOpenConfiguredPreview();
}

function sepoFactorCatalogForPreview() {
  return Array.from(document.querySelectorAll("#boxFac .item-row")).map(
    function (row, index) {
      const code = row.getAttribute("data-cod") || "FACT_" + (index + 1);
      const desc =
        row.getAttribute("data-desc") ||
        (row.querySelector(".fw-medium")
          ? row.querySelector(".fw-medium").textContent.trim()
          : code);
      return { id: code, code: code, label: desc };
    },
  );
}

function sepoInterpretFactor(total) {
  const n = Number(total || 0);
  if (n <= 5) return "Bajo";
  if (n <= 10) return "Medio";
  return "Alto";
}

function sepoComputePreviewResults() {
  const factors = {};
  sepoFactorCatalogForPreview().forEach(function (f) {
    factors[f.id] = { code: f.code, label: f.label, total: 0 };
  });

  if (!pvData || !Array.isArray(pvData.preguntas)) return factors;

  pvData.preguntas.forEach(function (q, qIndex) {
    const resp = pvRespuestas[qIndex];

    if (q.tipo === "cerrada") {
      const alternativas =
        (((q || {})._config || {}).cerrada || {}).alternativas || [];
      const selected = Array.isArray(resp) ? resp : [resp];
      selected
        .filter(function (v) {
          return v !== undefined && v !== null && v !== "";
        })
        .forEach(function (optIndex) {
          const alt = alternativas[Number(optIndex)];
          if (!alt) return;
          (alt.asignaciones || []).forEach(function (asig) {
            if (!asig.factorId) return;
            if (!factors[asig.factorId]) {
              factors[asig.factorId] = {
                code: asig.factorId,
                label: asig.factorId,
                total: 0,
              };
            }
            factors[asig.factorId].total += Number(asig.valor || 0);
          });
        });
    }

    if (q.tipo === "abierta") {
      const text = Array.isArray(resp) ? resp[0] || "" : resp || "";
      if (!String(text || "").trim()) return;
      const abierta = ((q || {})._config || {}).abierta || {};
      (abierta.asignaciones || []).forEach(function (asig) {
        if (!asig.factorId) return;
        if (!factors[asig.factorId]) {
          factors[asig.factorId] = {
            code: asig.factorId,
            label: asig.factorId,
            total: 0,
          };
        }
        factors[asig.factorId].total += Number(asig.valor || 0);
      });
    }
  });

  return factors;
}

function sepoRenderPreviewResults() {
  const box = document.getElementById("pvFactorResults");
  if (!box) return;
  const rows = Object.values(sepoComputePreviewResults()).filter(function (r) {
    return Number(r.total || 0) !== 0 || r.label;
  });

  if (!rows.length) {
    box.innerHTML =
      '<div class="alert alert-light mt-4 mb-0">No hay resultados calculables todavía. Verifica factores y asignaciones en la plantilla.</div>';
    return;
  }

  box.innerHTML = `
    <div class="mt-4 text-start">
      <h4 class="fw-bold text-white mb-3"><i class="fas fa-chart-column me-2 text-info"></i>Resultado por factores</h4>
      <div class="row g-3">
        ${rows
          .map(function (r) {
            const nivel = sepoInterpretFactor(r.total);
            const color =
              nivel === "Bajo"
                ? "#22c55e"
                : nivel === "Medio"
                  ? "#f59e0b"
                  : "#ef4444";
            return `
            <div class="col-md-6">
              <div class="rounded-4 p-4" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <div class="fw-bold text-info">${r.code}</div>
                    <div class="text-white">${r.label}</div>
                  </div>
                  <div class="text-end">
                    <div class="fw-bold text-white" style="font-size:1.6rem;">${r.total}</div>
                    <small style="color:${color};font-weight:700;">${nivel}</small>
                  </div>
                </div>
                <div class="progress" style="height:8px;background:rgba(255,255,255,0.08);">
                  <div class="progress-bar" style="width:${Math.min(100, Math.max(8, Number(r.total || 0) * 8))}%;background:${color};"></div>
                </div>
              </div>
            </div>
          `;
          })
          .join("")}
      </div>
    </div>
  `;
}

if (typeof pvNavegar === "function") {
  const _pvNavegarConfiguredBase = pvNavegar;
  pvNavegar = function (dir) {
    _pvNavegarConfiguredBase(dir);
    const finalVisible =
      document.getElementById("pvFinal") &&
      !document.getElementById("pvFinal").classList.contains("d-none");
    if (finalVisible) {
      sepoRenderPreviewResults();
    }
  };
}

if (typeof previsualizarPrueba === "function") {
  const _previsualizarPruebaBase = previsualizarPrueba;
  previsualizarPrueba = function (codigo) {
    _previsualizarPruebaBase(codigo);
    const box = document.getElementById("pvFactorResults");
    if (box) box.innerHTML = "";
  };
}

/* ========================================== */
/* ACTUALIZACION: FACTORES FASE 2 SEGURA      */
/* RESUMEN Y ACUMULADO CONFIGURADO            */
/* ========================================== */
(function (window, document) {
  "use strict";

  function q(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }
  function parseJSON(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return fallback;
    }
  }

  function getFactorCatalogPhase2() {
    return qa("#boxFac .item-row").map(function (row, index) {
      const code = row.getAttribute("data-cod") || "FACT_" + (index + 1);
      const desc =
        row.getAttribute("data-desc") ||
        (q(".fw-medium", row)
          ? q(".fw-medium", row).textContent.trim()
          : "Factor " + (index + 1));
      return { id: code, code: code, label: desc };
    });
  }

  function ensureFactorSummaryBox() {
    const host = q("#step-5");
    if (!host) return null;
    let box = q("#sepoFactorSummaryBox", host);
    if (!box) {
      box = document.createElement("div");
      box.id = "sepoFactorSummaryBox";
      box.className = "soft-panel mt-3 p-4";
      box.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h6 class="fw-bold m-0" style="color: var(--primary-hover)">
              <i class="fas fa-calculator me-2"></i>Resumen de Factores
            </h6>
            <small class="text-muted">Vista previa del acumulado configurado por factor según Plantilla de Respuestas.</small>
          </div>
          <button type="button" class="btn btn-outline-primary btn-sm fw-bold" id="btnRecalcularFactores">
            <i class="fas fa-arrows-rotate me-1"></i>Recalcular
          </button>
        </div>
        <div id="sepoFactorSummaryContent"></div>
      `;
      const target = q("#boxFac", host);
      if (target) {
        target.insertAdjacentElement("afterend", box);
      } else {
        host.appendChild(box);
      }
    }
    return box;
  }

  function getQuestionRowsPhase2() {
    return qa("#boxPreg .item-row");
  }

  function getQuestionModelPhase2() {
    return getQuestionRowsPhase2().map(function (row, index) {
      const cfg = parseJSON(row.dataset.sepoConfig || "{}", {});
      const id = row.dataset.sepoId || "preg_" + (index + 1);
      row.dataset.sepoId = id;
      const title = q(".desc-text", row)
        ? q(".desc-text", row).textContent.trim()
        : "Pregunta " + (index + 1);
      const tipo = row.getAttribute("data-tipo") || cfg.tipo || "";
      return { id: id, title: title, tipo: tipo, cfg: cfg };
    });
  }

  function buildFactorAccumulator() {
    const factorMap = {};
    getFactorCatalogPhase2().forEach(function (f) {
      factorMap[f.id] = {
        id: f.id,
        code: f.code,
        label: f.label,
        total: 0,
        links: 0,
        sources: [],
      };
    });

    getQuestionModelPhase2().forEach(function (question) {
      if (question.tipo === "cerrada") {
        const alts = ((question.cfg || {}).cerrada || {}).alternativas || [];
        alts.forEach(function (alt, altIndex) {
          (alt.asignaciones || []).forEach(function (asig) {
            if (!asig.factorId) return;
            if (!factorMap[asig.factorId]) {
              factorMap[asig.factorId] = {
                id: asig.factorId,
                code: asig.factorId,
                label: asig.factorId,
                total: 0,
                links: 0,
                sources: [],
              };
            }
            const value = Number(asig.valor || 0);
            factorMap[asig.factorId].total += value;
            factorMap[asig.factorId].links += 1;
            factorMap[asig.factorId].sources.push({
              question: question.title,
              item: alt.texto || "Alternativa " + (altIndex + 1),
              value: value,
            });
          });
        });
      }
      if (question.tipo === "abierta") {
        const abierta = (question.cfg || {}).abierta || {};
        (abierta.asignaciones || []).forEach(function (asig, openIndex) {
          if (!asig.factorId) return;
          if (!factorMap[asig.factorId]) {
            factorMap[asig.factorId] = {
              id: asig.factorId,
              code: asig.factorId,
              label: asig.factorId,
              total: 0,
              links: 0,
              sources: [],
            };
          }
          const value = Number(asig.valor || 0);
          factorMap[asig.factorId].total += value;
          factorMap[asig.factorId].links += 1;
          factorMap[asig.factorId].sources.push({
            question: question.title,
            item: "Abierta " + (openIndex + 1),
            value: value,
          });
        });
      }
    });

    return Object.values(factorMap);
  }

  function renderFactorAccumulator() {
    const box = ensureFactorSummaryBox();
    if (!box) return;
    const content = q("#sepoFactorSummaryContent", box);
    if (!content) return;

    const rows = buildFactorAccumulator();
    const useful = rows.filter(function (r) {
      return r.links > 0 || r.label;
    });

    if (!useful.length) {
      content.innerHTML =
        '<div class="alert alert-light text-muted small mb-0"><i class="fas fa-info-circle me-2"></i>No hay factores ni asignaciones configuradas todavía.</div>';
      return;
    }

    content.innerHTML = `
      <div class="table-responsive">
        <table class="table align-middle mb-0">
          <thead>
            <tr>
              <th>Factor</th>
              <th>Descripción</th>
              <th class="text-center">Asignaciones</th>
              <th class="text-center">Acumulado</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            ${useful
              .map(function (row) {
                const detail = row.sources.length
                  ? row.sources
                      .slice(0, 4)
                      .map(function (s) {
                        return (
                          '<span class="badge bg-light text-dark border me-1 mb-1">' +
                          s.question +
                          " · " +
                          s.item +
                          " = " +
                          s.value +
                          "</span>"
                        );
                      })
                      .join("")
                  : '<span class="text-muted small">Sin asignaciones aún</span>';
                return `
                <tr>
                  <td class="fw-bold">${row.code}</td>
                  <td>${row.label}</td>
                  <td class="text-center">${row.links}</td>
                  <td class="text-center">
                    <span class="badge bg-primary-subtle text-primary border">${row.total}</span>
                  </td>
                  <td>${detail}</td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function bindFactorPhase2Safe() {
    const box = ensureFactorSummaryBox();
    if (!box) return;
    const btn = q("#btnRecalcularFactores", box);
    if (btn && !btn.dataset.sepoBoundPhase2) {
      btn.dataset.sepoBoundPhase2 = "1";
      btn.addEventListener("click", renderFactorAccumulator);
    }

    const plantillaClosed = q("#plantillaCerradasContainer");
    const plantillaOpen = q("#plantillaAbiertasContainer");
    if (plantillaClosed && !plantillaClosed.dataset.sepoBoundPhase2) {
      plantillaClosed.dataset.sepoBoundPhase2 = "1";
      plantillaClosed.addEventListener("input", function () {
        setTimeout(renderFactorAccumulator, 10);
      });
      plantillaClosed.addEventListener("change", function () {
        setTimeout(renderFactorAccumulator, 10);
      });
      plantillaClosed.addEventListener("click", function () {
        setTimeout(renderFactorAccumulator, 10);
      });
    }
    if (plantillaOpen && !plantillaOpen.dataset.sepoBoundPhase2) {
      plantillaOpen.dataset.sepoBoundPhase2 = "1";
      plantillaOpen.addEventListener("input", function () {
        setTimeout(renderFactorAccumulator, 10);
      });
      plantillaOpen.addEventListener("change", function () {
        setTimeout(renderFactorAccumulator, 10);
      });
      plantillaOpen.addEventListener("click", function () {
        setTimeout(renderFactorAccumulator, 10);
      });
    }

    const factorsBox = q("#boxFac");
    if (factorsBox && !factorsBox.dataset.sepoBoundPhase2) {
      factorsBox.dataset.sepoBoundPhase2 = "1";
      factorsBox.addEventListener("click", function () {
        setTimeout(renderFactorAccumulator, 20);
      });
    }
  }

  function refreshFactorPhase2Safe() {
    bindFactorPhase2Safe();
    renderFactorAccumulator();
  }

  const _addFactorPhase2 = window.addFactor;
  if (
    typeof _addFactorPhase2 === "function" &&
    !_addFactorPhase2._sepoPhase2Wrapped
  ) {
    const wrapped = function () {
      const result = _addFactorPhase2.apply(this, arguments);
      setTimeout(refreshFactorPhase2Safe, 30);
      return result;
    };
    wrapped._sepoPhase2Wrapped = true;
    window.addFactor = wrapped;
  }

  const _guardarPreguntaPhase2 = window.guardarNuevaPregunta;
  if (
    typeof _guardarPreguntaPhase2 === "function" &&
    !_guardarPreguntaPhase2._sepoPhase2Wrapped
  ) {
    const wrapped = function () {
      const result = _guardarPreguntaPhase2.apply(this, arguments);
      setTimeout(refreshFactorPhase2Safe, 40);
      return result;
    };
    wrapped._sepoPhase2Wrapped = true;
    window.guardarNuevaPregunta = wrapped;
  }

  const _precargarPhase2 = window.precargarBolsito;
  if (
    typeof _precargarPhase2 === "function" &&
    !_precargarPhase2._sepoPhase2Wrapped
  ) {
    const wrapped = function () {
      const result = _precargarPhase2.apply(this, arguments);
      setTimeout(refreshFactorPhase2Safe, 40);
      return result;
    };
    wrapped._sepoPhase2Wrapped = true;
    window.precargarBolsito = wrapped;
  }

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(refreshFactorPhase2Safe, 80);
  });

  window.SEPOFactoresFase2Safe = {
    refresh: refreshFactorPhase2Safe,
    buildFactorAccumulator: buildFactorAccumulator,
  };
})(window, document);

/* ========================================== */
/* ACTUALIZACION: FORMULAS FASE 4 SEGURA      */
/* SOLO PRUEBAS PSICOLOGICAS                  */
/* ========================================== */
(function (window, document) {
  "use strict";

  function q(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }
  function parseJSON(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return fallback;
    }
  }

  function getFactorRowsFormulaSafe() {
    return qa("#boxFac .item-row");
  }

  window.getFactorMetaFormulaSafe = function getFactorMetaFormulaSafe() {
    return getFactorRowsFormulaSafe().map(function (row, index) {
      const code = row.getAttribute("data-cod") || "FACT_" + (index + 1);
      const desc =
        row.getAttribute("data-desc") ||
        (q(".fw-medium", row) ? q(".fw-medium", row).textContent.trim() : code);
      const formula = (row.getAttribute("data-formula") || "").trim();
      return { row: row, code: code, desc: desc, formula: formula };
    });
  };

  function getConfiguredQuestionRowsFormulaSafe() {
    return qa("#boxPreg .item-row");
  }

  function getQuestionResponseBaseMapSafe() {
    const map = {};
    getConfiguredQuestionRowsFormulaSafe().forEach(function (row, index) {
      const cfg = parseJSON(row.dataset.sepoConfig || "{}", {});
      const tipo = row.getAttribute("data-tipo") || cfg.tipo || "";
      const qNumber = index + 1;

      if (tipo === "cerrada") {
        const alts = ((cfg || {}).cerrada || {}).alternativas || [];
        const maxAlt = alts.reduce(function (acc, alt) {
          const val = Number(alt.valor || 0);
          return val > acc ? val : acc;
        }, 0);
        map["RP" + qNumber] = maxAlt;
      } else if (tipo === "abierta") {
        const abierta = (cfg || {}).abierta || {};
        map["RP" + qNumber] = Number(abierta.valorEsperado || 0);
      } else {
        map["RP" + qNumber] = 0;
      }
    });
    return map;
  }

  function getPreviewResponseMapSafe() {
    const map = {};
    if (!window.pvData || !Array.isArray(window.pvData.preguntas)) return map;

    window.pvData.preguntas.forEach(function (pregunta, index) {
      const key = "RP" + (index + 1);
      const resp = window.pvRespuestas ? window.pvRespuestas[index] : undefined;

      if (pregunta.tipo === "cerrada") {
        const alts =
          (((pregunta || {})._config || {}).cerrada || {}).alternativas || [];
        let total = 0;
        const selected = Array.isArray(resp) ? resp : [resp];
        selected
          .filter(function (v) {
            return v !== undefined && v !== null && v !== "";
          })
          .forEach(function (optIndex) {
            const alt = alts[Number(optIndex)];
            if (!alt) return;
            total += Number(alt.valor || 0);
          });
        map[key] = total;
      } else if (pregunta.tipo === "abierta") {
        const abierta = ((pregunta || {})._config || {}).abierta || {};
        const hasValue = Array.isArray(resp)
          ? String(resp[0] || "").trim()
          : String(resp || "").trim();
        map[key] = hasValue ? Number(abierta.valorEsperado || 0) : 0;
      } else {
        map[key] = 0;
      }
    });

    return map;
  }

  function sanitizeFormulaSafe(expression) {
    return String(expression || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  window.replaceTokensSafe = function replaceTokensSafe(expr, tokenMap) {
    let out = String(expr || "");
    Object.keys(tokenMap)
      .sort(function (a, b) {
        return b.length - a.length;
      })
      .forEach(function (token) {
        const value = Number(tokenMap[token] || 0);
        const pattern = new RegExp(
          "\\b" + token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b",
          "g",
        );
        out = out.replace(pattern, String(value));
      });
    return out;
  };

  window.evalArithmeticSafe = function evalArithmeticSafe(expression) {
    const expr = String(expression || "").trim();
    if (!expr) return 0;
    if (!/^[0-9+\-*/().\s]+$/.test(expr)) return 0;
    try {
      const fn = new Function("return (" + expr + ");");
      const result = Number(fn());
      return Number.isFinite(result) ? result : 0;
    } catch (e) {
      return 0;
    }
  };

  function buildRawFactorTotalsSafe() {
    const totals = {};
    getFactorMetaFormulaSafe().forEach(function (f) {
      totals[f.code] = 0;
    });

    getConfiguredQuestionRowsFormulaSafe().forEach(function (row) {
      const cfg = parseJSON(row.dataset.sepoConfig || "{}", {});
      const tipo = row.getAttribute("data-tipo") || cfg.tipo || "";

      if (tipo === "cerrada") {
        (((cfg || {}).cerrada || {}).alternativas || []).forEach(
          function (alt) {
            (alt.asignaciones || []).forEach(function (asig) {
              if (!asig.factorId) return;
              totals[asig.factorId] =
                (totals[asig.factorId] || 0) + Number(asig.valor || 0);
            });
          },
        );
      }

      if (tipo === "abierta") {
        (((cfg || {}).abierta || {}).asignaciones || []).forEach(
          function (asig) {
            if (!asig.factorId) return;
            totals[asig.factorId] =
              (totals[asig.factorId] || 0) + Number(asig.valor || 0);
          },
        );
      }
    });

    return totals;
  }

  window.resolveFactorFormulasSafe = function resolveFactorFormulasSafe(
    rawTotals,
    rpMap,
  ) {
    const factors = getFactorMetaFormulaSafe();
    const resolved = Object.assign({}, rawTotals);
    const rawBase = Object.assign({}, rawTotals);

    for (let pass = 0; pass < 5; pass++) {
      factors.forEach(function (factor) {
        if (!factor.formula) return;
        const tokenMap = Object.assign(
          {},
          rpMap || {},
          resolved || {},
          rawBase || {},
        );
        tokenMap[factor.code] =
          resolved[factor.code] || rawBase[factor.code] || 0;
        const sanitized = sanitizeFormulaSafe(factor.formula);
        const replaced = replaceTokensSafe(sanitized, tokenMap);
        const val = evalArithmeticSafe(replaced);
        resolved[factor.code] = val;
      });
    }

    return resolved;
  };

  function buildConfiguredFormulaSummarySafe() {
    const rawTotals = buildRawFactorTotalsSafe();
    const rpMap = getQuestionResponseBaseMapSafe();
    const resolved = resolveFactorFormulasSafe(rawTotals, rpMap);

    return getFactorMetaFormulaSafe().map(function (factor) {
      return {
        code: factor.code,
        desc: factor.desc,
        formula: factor.formula,
        raw: Number(rawTotals[factor.code] || 0),
        total: Number(resolved[factor.code] || 0),
      };
    });
  }

  function renderFormulaInfoInFactorSummarySafe() {
    const box = document.getElementById("sepoFactorSummaryContent");
    if (!box) return;
    const table = q("table tbody", box);
    if (!table) return;

    const summary = buildConfiguredFormulaSummarySafe();
    qa("tr", table).forEach(function (tr) {
      const codeCell = q("td", tr);
      if (!codeCell) return;
      const code = codeCell.textContent.trim();
      const item = summary.find(function (s) {
        return s.code === code;
      });
      if (!item) return;

      const cells = qa("td", tr);
      if (cells[3]) {
        cells[3].innerHTML =
          '<span class="badge bg-primary-subtle text-primary border">' +
          item.total +
          "</span>";
      }
      if (cells[4]) {
        const formulaHtml = item.formula
          ? '<div class="small text-info mb-1"><i class="fas fa-square-root-alt me-1"></i>' +
            item.formula +
            "</div>"
          : "";
        const rawHtml =
          '<div class="small text-muted">Base: ' + item.raw + "</div>";
        cells[4].innerHTML = formulaHtml + rawHtml + cells[4].innerHTML;
      }
    });
  }

  function computePreviewResultsWithFormulasSafe() {
    const baseFactors = {};
    getFactorMetaFormulaSafe().forEach(function (f) {
      baseFactors[f.code] = {
        code: f.code,
        label: f.desc,
        raw: 0,
        total: 0,
        formula: f.formula || "",
      };
    });

    if (!window.pvData || !Array.isArray(window.pvData.preguntas))
      return baseFactors;

    window.pvData.preguntas.forEach(function (pregunta, qIndex) {
      const resp = window.pvRespuestas
        ? window.pvRespuestas[qIndex]
        : undefined;

      if (pregunta.tipo === "cerrada") {
        const alternativas =
          (((pregunta || {})._config || {}).cerrada || {}).alternativas || [];
        const selected = Array.isArray(resp) ? resp : [resp];
        selected
          .filter(function (v) {
            return v !== undefined && v !== null && v !== "";
          })
          .forEach(function (optIndex) {
            const alt = alternativas[Number(optIndex)];
            if (!alt) return;
            (alt.asignaciones || []).forEach(function (asig) {
              if (!asig.factorId) return;
              if (!baseFactors[asig.factorId]) {
                baseFactors[asig.factorId] = {
                  code: asig.factorId,
                  label: asig.factorId,
                  raw: 0,
                  total: 0,
                  formula: "",
                };
              }
              baseFactors[asig.factorId].raw += Number(asig.valor || 0);
            });
          });
      }

      if (pregunta.tipo === "abierta") {
        const abierta = ((pregunta || {})._config || {}).abierta || {};
        const hasValue = Array.isArray(resp)
          ? String(resp[0] || "").trim()
          : String(resp || "").trim();
        if (!hasValue) return;
        (abierta.asignaciones || []).forEach(function (asig) {
          if (!asig.factorId) return;
          if (!baseFactors[asig.factorId]) {
            baseFactors[asig.factorId] = {
              code: asig.factorId,
              label: asig.factorId,
              raw: 0,
              total: 0,
              formula: "",
            };
          }
          baseFactors[asig.factorId].raw += Number(asig.valor || 0);
        });
      }
    });

    const rawTotals = {};
    Object.keys(baseFactors).forEach(function (key) {
      rawTotals[key] = Number(baseFactors[key].raw || 0);
    });
    const rpMap = getPreviewResponseMapSafe();
    const resolved = resolveFactorFormulasSafe(rawTotals, rpMap);

    Object.keys(baseFactors).forEach(function (key) {
      baseFactors[key].total = Number(resolved[key] || 0);
    });

    return baseFactors;
  }

  window.sepoComputePreviewResults = computePreviewResultsWithFormulasSafe;

  if (
    typeof window.SEPOFactoresFase2Safe !== "undefined" &&
    window.SEPOFactoresFase2Safe &&
    typeof window.SEPOFactoresFase2Safe.refresh === "function"
  ) {
    const _baseRefresh = window.SEPOFactoresFase2Safe.refresh;
    window.SEPOFactoresFase2Safe.refresh = function () {
      const result = _baseRefresh.apply(this, arguments);
      setTimeout(renderFormulaInfoInFactorSummarySafe, 30);
      return result;
    };
  }

  const _addFactorFormulaSafe = window.addFactor;
  if (
    typeof _addFactorFormulaSafe === "function" &&
    !_addFactorFormulaSafe._sepoFormulaWrapped
  ) {
    const wrapped = function () {
      const result = _addFactorFormulaSafe.apply(this, arguments);
      setTimeout(renderFormulaInfoInFactorSummarySafe, 40);
      return result;
    };
    wrapped._sepoFormulaWrapped = true;
    window.addFactor = wrapped;
  }

  const _precargarFormulaSafe = window.precargarBolsito;
  if (
    typeof _precargarFormulaSafe === "function" &&
    !_precargarFormulaSafe._sepoFormulaWrapped
  ) {
    const wrapped = function () {
      const result = _precargarFormulaSafe.apply(this, arguments);
      setTimeout(renderFormulaInfoInFactorSummarySafe, 50);
      return result;
    };
    wrapped._sepoFormulaWrapped = true;
    window.precargarBolsito = wrapped;
  }

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(renderFormulaInfoInFactorSummarySafe, 150);
  });

  window.SEPOFormulasFase4Safe = {
    buildConfiguredFormulaSummarySafe: buildConfiguredFormulaSummarySafe,
    computePreviewResultsWithFormulasSafe:
      computePreviewResultsWithFormulasSafe,
  };
})(window, document);

/* ========================================== */
/* ACTUALIZACION: DEMO PERSISTENTE Y VISUAL   */
/* SOLO PRUEBAS PSICOLOGICAS                  */
/* ========================================== */
(function (window, document) {
  "use strict";

  const SEPO_PSICO_STORAGE_KEY = "sepo_psico_demo_tests_v2";

  function q(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }
  function parseJSON(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return fallback;
    }
  }

  function getStore() {
    return parseJSON(localStorage.getItem(SEPO_PSICO_STORAGE_KEY) || "{}", {});
  }

  function setStore(data) {
    localStorage.setItem(SEPO_PSICO_STORAGE_KEY, JSON.stringify(data || {}));
  }

  function currentTestCode() {
    return ((q("#prCod") && q("#prCod").value) || "").trim();
  }

  function currentTestName() {
    return ((q("#prNom") && q("#prNom").value) || "").trim();
  }

  function collectQuestionRows() {
    return qa("#boxPreg .item-row").map(function (row, index) {
      return {
        tipo: row.getAttribute("data-tipo") || "",
        texto: q(".desc-text", row)
          ? q(".desc-text", row).textContent.trim()
          : "Pregunta " + (index + 1),
        sepoId: row.dataset.sepoId || "",
        config: parseJSON(row.dataset.sepoConfig || "{}", {}),
      };
    });
  }

  function collectFactorRows() {
    return qa("#boxFac .item-row").map(function (row, index) {
      return {
        cod: row.getAttribute("data-cod") || "FACT_" + (index + 1),
        desc:
          row.getAttribute("data-desc") ||
          (q(".fw-medium", row)
            ? q(".fw-medium", row).textContent.trim()
            : "Factor " + (index + 1)),
        formula: row.getAttribute("data-formula") || "",
        interpret: parseJSON(row.dataset.sepoInterpret || "{}", {}),
      };
    });
  }

  function saveCurrentPsychDemo() {
    const code = currentTestCode();
    if (!code) return;

    const store = getStore();
    store[code] = {
      meta: {
        code: code,
        name: currentTestName(),
        portadaTitulo: q("#portadaTitulo") ? q("#portadaTitulo").value : "",
        portadaInstrucciones: q("#portadaInstrucciones")
          ? q("#portadaInstrucciones").value
          : "",
        portadaPlantilla: q("#selectPlantillaPortada")
          ? q("#selectPlantillaPortada").value
          : "estandar",
        // Reglas Step 3
        bloqueoRetroceso: q("#cfgBloqueoRetroceso")
          ? q("#cfgBloqueoRetroceso").checked
          : false,
        navegacionLibre: q("#cfgNavegacionLibre")
          ? q("#cfgNavegacionLibre").checked
          : true,
        tiempoPregunta: q("#cfgTiempoPregunta")
          ? q("#cfgTiempoPregunta").value
          : 0,
        mostrarContador: q("#cfgMostrarContadorIndividual")
          ? q("#cfgMostrarContadorIndividual").checked
          : false,
      },
      questions: collectQuestionRows(),
      factors: collectFactorRows(),
    };
    setStore(store);
  }

  function renderStoredQuestions(saved) {
    const box = q("#boxPreg");
    const empty = q("#emptyPreg");
    if (!box || !saved || !Array.isArray(saved.questions)) return;
    box.innerHTML = "";
    saved.questions.forEach(function (item, index) {
      if (typeof window.rowPregunta !== "function") return;
      const html = window.rowPregunta(
        index + 1,
        item.texto,
        item.tipo || "cerrada",
      );
      box.insertAdjacentHTML("beforeend", html);
      const row = box.lastElementChild;
      if (row) {
        row.dataset.sepoId = item.sepoId || "preg_" + Date.now() + "_" + index;
        row.dataset.sepoConfig = JSON.stringify(item.config || {});
      }
    });
    if (!saved.questions.length && empty) empty.style.display = "";
  }

  function renderStoredFactors(saved) {
    const box = q("#boxFac");
    const empty = q("#emptyFac");
    if (!box || !saved || !Array.isArray(saved.factors)) return;
    box.innerHTML = "";
    saved.factors.forEach(function (item) {
      if (typeof window.rowFactor !== "function") return;
      const html = window.rowFactor(item.cod, item.desc, item.formula || "");
      box.insertAdjacentHTML("beforeend", html);
      const row = box.lastElementChild;
      if (row) {
        row.setAttribute("data-cod", item.cod || "");
        row.setAttribute("data-desc", item.desc || "");
        row.setAttribute("data-formula", item.formula || "");
        row.dataset.sepoInterpret = JSON.stringify(item.interpret || {});
      }
    });
    if (!saved.factors.length && empty) empty.style.display = "";
  }

  function applySavedMeta(saved) {
    if (!saved || !saved.meta) return;
    if (q("#prNom")) q("#prNom").value = saved.meta.name || q("#prNom").value;
    if (q("#portadaTitulo"))
      q("#portadaTitulo").value = saved.meta.portadaTitulo || "";
    if (q("#portadaInstrucciones"))
      q("#portadaInstrucciones").value = saved.meta.portadaInstrucciones || "";
    if (q("#selectPlantillaPortada"))
      q("#selectPlantillaPortada").value =
        saved.meta.portadaPlantilla || "estandar";

    // Step 3 Restore
    if (q("#cfgBloqueoRetroceso"))
      q("#cfgBloqueoRetroceso").checked = !!saved.meta.bloqueoRetroceso;
    if (q("#cfgNavegacionLibre"))
      q("#cfgNavegacionLibre").checked = saved.meta.navegacionLibre !== false;
    if (q("#cfgTiempoPregunta"))
      q("#cfgTiempoPregunta").value = saved.meta.tiempoPregunta || 0;
    if (q("#cfgMostrarContadorIndividual"))
      q("#cfgMostrarContadorIndividual").checked = !!saved.meta.mostrarContador;

    if (typeof window.renderPreviewPortada === "function")
      window.renderPreviewPortada();
  }

  function seedDemoForCode(code) {
    const seeds = {
      "PSI-ANS-001": {
        questions: [
          {
            tipo: "cerrada",
            texto:
              "En la última semana, ¿con qué frecuencia ha sentido miedo a que suceda lo peor?",
            config: {
              tipo: "cerrada",
              cerrada: {
                tipoResp: "simple",
                alternativas: [
                  {
                    texto: "Nunca",
                    tipo: "texto",
                    valor: 0,
                    asignaciones: [{ factorId: "FAC-ANS-S", valor: 0 }],
                  },
                  {
                    texto: "A veces",
                    tipo: "texto",
                    valor: 1,
                    asignaciones: [{ factorId: "FAC-ANS-C", valor: 1 }],
                  },
                  {
                    texto: "Siempre",
                    tipo: "texto",
                    valor: 3,
                    asignaciones: [{ factorId: "FAC-ANS-C", valor: 3 }],
                  },
                ],
              },
            },
          },
          {
            tipo: "cerrada",
            texto:
              "Seleccione los síntomas físicos que ha experimentado con mayor intensidad:",
            config: {
              tipo: "cerrada",
              cerrada: {
                tipoResp: "multiple",
                alternativas: [
                  {
                    texto: "Palpitaciones",
                    tipo: "texto",
                    valor: 2,
                    asignaciones: [{ factorId: "FAC-ANS-S", valor: 2 }],
                  },
                  {
                    texto: "Sudoración",
                    tipo: "texto",
                    valor: 1,
                    asignaciones: [{ factorId: "FAC-ANS-S", valor: 1 }],
                  },
                  {
                    texto: "Temblor",
                    tipo: "texto",
                    valor: 2,
                    asignaciones: [{ factorId: "FAC-ANS-S", valor: 2 }],
                  },
                ],
              },
            },
          },
          {
            tipo: "abierta",
            texto:
              "Mencione tres situaciones específicas que le disparen episodios de ansiedad:",
            config: {
              tipo: "abierta",
              abierta: {
                respuestaEsperada: "Ejemplos de detonantes",
                valorEsperado: 2,
                asignaciones: [{ factorId: "FAC-ANS-C", valor: 2 }],
              },
            },
          },
        ],
        factors: [
          {
            cod: "FAC-ANS-S",
            desc: "Ansiedad Somática",
            formula: "RP1 + RP2",
            interpret: {
              bajoMax: 2,
              medioMax: 4,
              etiquetas: { bajo: "Leve", medio: "Moderado", alto: "Alto" },
            },
          },
          {
            cod: "FAC-ANS-C",
            desc: "Ansiedad Cognitiva",
            formula: "RP1 + RP3",
            interpret: {
              bajoMax: 2,
              medioMax: 4,
              etiquetas: { bajo: "Leve", medio: "Moderado", alto: "Alto" },
            },
          },
        ],
      },
      "PSI-CMP-002": {
        questions: [
          {
            tipo: "cerrada",
            texto: "Valore su capacidad para resolver problemas bajo presión:",
            config: {
              tipo: "cerrada",
              cerrada: {
                tipoResp: "simple",
                alternativas: [
                  {
                    texto: "Baja",
                    tipo: "texto",
                    valor: 1,
                    asignaciones: [{ factorId: "FAC-CMP-ANA", valor: 1 }],
                  },
                  {
                    texto: "Media",
                    tipo: "texto",
                    valor: 2,
                    asignaciones: [{ factorId: "FAC-CMP-ANA", valor: 2 }],
                  },
                  {
                    texto: "Alta",
                    tipo: "texto",
                    valor: 3,
                    asignaciones: [{ factorId: "FAC-CMP-ANA", valor: 3 }],
                  },
                ],
              },
            },
          },
          {
            tipo: "cerrada",
            texto: "Seleccione las competencias que mejor lo describen:",
            config: {
              tipo: "cerrada",
              cerrada: {
                tipoResp: "multiple",
                alternativas: [
                  {
                    texto: "Trabajo en equipo",
                    tipo: "texto",
                    valor: 2,
                    asignaciones: [{ factorId: "FAC-CMP-SOC", valor: 2 }],
                  },
                  {
                    texto: "Comunicación",
                    tipo: "texto",
                    valor: 2,
                    asignaciones: [{ factorId: "FAC-CMP-SOC", valor: 2 }],
                  },
                  {
                    texto: "Planificación",
                    tipo: "texto",
                    valor: 1,
                    asignaciones: [{ factorId: "FAC-CMP-ANA", valor: 1 }],
                  },
                ],
              },
            },
          },
          {
            tipo: "abierta",
            texto:
              "Explique brevemente cómo actuaría ante un amago de incendio por cortocircuito:",
            config: {
              tipo: "abierta",
              abierta: {
                respuestaEsperada: "Protocolo de seguridad básico",
                valorEsperado: 3,
                asignaciones: [{ factorId: "FAC-CMP-CRI", valor: 3 }],
              },
            },
          },
        ],
        factors: [
          {
            cod: "FAC-CMP-ANA",
            desc: "Análisis y Resolución",
            formula: "RP1 + RP2",
            interpret: {
              bajoMax: 2,
              medioMax: 5,
              etiquetas: {
                bajo: "Inicial",
                medio: "Adecuado",
                alto: "Destacado",
              },
            },
          },
          {
            cod: "FAC-CMP-SOC",
            desc: "Competencias Sociales",
            formula: "RP2",
            interpret: {
              bajoMax: 2,
              medioMax: 4,
              etiquetas: {
                bajo: "Inicial",
                medio: "Adecuado",
                alto: "Destacado",
              },
            },
          },
          {
            cod: "FAC-CMP-CRI",
            desc: "Respuesta Crítica",
            formula: "RP3",
            interpret: {
              bajoMax: 1,
              medioMax: 3,
              etiquetas: {
                bajo: "Inicial",
                medio: "Adecuado",
                alto: "Destacado",
              },
            },
          },
        ],
      },
      "PSI-EST-003": {
        questions: [
          {
            tipo: "cerrada",
            texto:
              "¿Siente que el volumen de trabajo es superior a sus capacidades?",
            config: {
              tipo: "cerrada",
              cerrada: {
                tipoResp: "simple",
                alternativas: [
                  {
                    texto: "Nunca",
                    valor: 0,
                    asignaciones: [{ factorId: "FAC-EST-COR", valor: 0 }],
                  },
                  {
                    texto: "A veces",
                    valor: 1,
                    asignaciones: [{ factorId: "FAC-EST-COR", valor: 1 }],
                  },
                  {
                    texto: "Casi siempre",
                    valor: 3,
                    asignaciones: [{ factorId: "FAC-EST-COR", valor: 3 }],
                  },
                ],
              },
            },
          },
          {
            tipo: "matriz",
            texto:
              "Califique su nivel de confort en las siguientes áreas de su puesto:",
            config: {
              tipo: "matriz",
              matriz: {
                filas: [
                  { texto: "Ambiente físico", valor: 2 },
                  { texto: "Relación con superiores", valor: 1 },
                  { texto: "Equipamiento tecnológico", valor: 1 },
                ],
                columnas: ["Insatisfactorio", "Regular", "Satisfactorio"],
              },
            },
          },
        ],
        factors: [
          {
            cod: "FAC-EST-COR",
            desc: "Estrés Laboral Global",
            formula: "RP1 + RP2.1 + RP2.2",
            interpret: {
              bajoMax: 2,
              medioMax: 5,
              etiquetas: {
                bajo: "Equilibrado",
                medio: "Estrés Moderado",
                alto: "Estrés Crítico",
              },
            },
          },
        ],
      },
    };

    const generic = {
      questions: [
        {
          tipo: "cerrada",
          texto: "¿Con qué frecuencia presenta el comportamiento evaluado?",
          config: {
            tipo: "cerrada",
            cerrada: {
              tipoResp: "simple",
              alternativas: [
                {
                  texto: "Nunca",
                  tipo: "texto",
                  valor: 0,
                  asignaciones: [{ factorId: "FAC-001", valor: 0 }],
                },
                {
                  texto: "A veces",
                  tipo: "texto",
                  valor: 1,
                  asignaciones: [{ factorId: "FAC-001", valor: 1 }],
                },
                {
                  texto: "Siempre",
                  tipo: "texto",
                  valor: 2,
                  asignaciones: [{ factorId: "FAC-001", valor: 2 }],
                },
              ],
            },
          },
        },
        {
          tipo: "abierta",
          texto: "Describa brevemente una situación asociada a la evaluación:",
          config: {
            tipo: "abierta",
            abierta: {
              respuestaEsperada: "Respuesta de ejemplo",
              valorEsperado: 2,
              asignaciones: [{ factorId: "FAC-002", valor: 2 }],
            },
          },
        },
      ],
      factors: [
        {
          cod: "FAC-001",
          desc: "Factor Principal",
          formula: "RP1",
          interpret: {
            bajoMax: 1,
            medioMax: 2,
            etiquetas: { bajo: "Bajo", medio: "Medio", alto: "Alto" },
          },
        },
        {
          cod: "FAC-002",
          desc: "Factor Complementario",
          formula: "RP2",
          interpret: {
            bajoMax: 1,
            medioMax: 2,
            etiquetas: { bajo: "Bajo", medio: "Medio", alto: "Alto" },
          },
        },
      ],
    };
    return seeds[code] || generic;
  }

  function applySeedData(seed) {
    const boxPreg = q("#boxPreg");
    const boxFac = q("#boxFac");
    if (!boxPreg || !boxFac || !seed) return;

    boxPreg.innerHTML = "";
    (seed.questions || []).forEach(function (item, index) {
      if (typeof window.rowPregunta !== "function") return;
      boxPreg.insertAdjacentHTML(
        "beforeend",
        window.rowPregunta(index + 1, item.texto, item.tipo),
      );
      const row = boxPreg.lastElementChild;
      if (row) {
        row.dataset.sepoId = "demo_" + Date.now() + "_" + index;
        row.dataset.sepoConfig = JSON.stringify(item.config || {});
      }
    });

    boxFac.innerHTML = "";
    (seed.factors || []).forEach(function (item) {
      if (typeof window.rowFactor !== "function") return;
      boxFac.insertAdjacentHTML(
        "beforeend",
        window.rowFactor(item.cod, item.desc, item.formula || ""),
      );
      const row = boxFac.lastElementChild;
      if (row) {
        row.setAttribute("data-cod", item.cod || "");
        row.setAttribute("data-desc", item.desc || "");
        row.setAttribute("data-formula", item.formula || "");
        row.dataset.sepoInterpret = JSON.stringify(item.interpret || {});
      }
    });

    if (typeof window.renumerarContenedor === "function") {
      window.renumerarContenedor("#boxPreg");
    }
  }

  function loadPsychDemoForCode(code) {
    if (!code) return;
    const store = getStore();
    const saved = store[code];

    if (saved && saved.questions && saved.factors) {
      renderStoredQuestions(saved);
      renderStoredFactors(saved);
      applySavedMeta(saved);
    } else {
      applySeedData(seedDemoForCode(code));
      saveCurrentPsychDemo();
    }

    if (typeof window.precargarBolsito === "function") {
      setTimeout(function () {
        window.precargarBolsito();
      }, 30);
    }
  }

  const _editarPruebaDemoSafe = window.editarPrueba;
  if (
    typeof _editarPruebaDemoSafe === "function" &&
    !_editarPruebaDemoSafe._sepoDemoWrapped
  ) {
    const wrapped = function (cod) {
      const result = _editarPruebaDemoSafe.apply(this, arguments);
      setTimeout(function () {
        loadPsychDemoForCode(cod);
      }, 80);
      return result;
    };
    wrapped._sepoDemoWrapped = true;
    window.editarPrueba = wrapped;
  }

  const _guardarPruebaDemoSafe = window.guardarPrueba;
  if (
    typeof _guardarPruebaDemoSafe === "function" &&
    !_guardarPruebaDemoSafe._sepoDemoWrapped
  ) {
    const wrapped = function () {
      saveCurrentPsychDemo();
      if (typeof window.showToast === "function") {
        window.showToast("✅ Demo guardada localmente.");
      }
      return _guardarPruebaDemoSafe.apply(this, arguments);
    };
    wrapped._sepoDemoWrapped = true;
    window.guardarPrueba = wrapped;
  }

  const _guardarPreguntaDemoSafe = window.guardarNuevaPregunta;
  if (
    typeof _guardarPreguntaDemoSafe === "function" &&
    !_guardarPreguntaDemoSafe._sepoDemoPersistWrapped
  ) {
    const wrapped = function () {
      const result = _guardarPreguntaDemoSafe.apply(this, arguments);
      setTimeout(saveCurrentPsychDemo, 40);
      return result;
    };
    wrapped._sepoDemoPersistWrapped = true;
    window.guardarNuevaPregunta = wrapped;
  }

  const _addFactorDemoSafe = window.addFactor;
  if (
    typeof _addFactorDemoSafe === "function" &&
    !_addFactorDemoSafe._sepoDemoPersistWrapped
  ) {
    const wrapped = function () {
      const result = _addFactorDemoSafe.apply(this, arguments);
      setTimeout(saveCurrentPsychDemo, 40);
      return result;
    };
    wrapped._sepoDemoPersistWrapped = true;
    window.addFactor = wrapped;
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (currentTestCode()) {
      loadPsychDemoForCode(currentTestCode());
    }
  });

  window.SEPODemoPersistence = {
    saveCurrentPsychDemo: saveCurrentPsychDemo,
    loadPsychDemoForCode: loadPsychDemoForCode,
  };
})(window, document);

/* ========================================== */
/* ACTUALIZACION: CONDICIONALES FASE 5 SAFE   */
/* SOLO PRUEBAS PSICOLOGICAS                  */
/* ========================================== */
(function (window, document) {
  "use strict";

  function sepoSanitizeExprSafe(expr) {
    return String(expr || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function sepoEvalConditionSafe(expr) {
    const test = String(expr || "").trim();
    if (!/^[0-9+\-*/().<>=!\s]+$/.test(test)) return false;
    try {
      const fn = new Function("return (" + test + ");");
      return !!fn();
    } catch (e) {
      return false;
    }
  }

  function sepoSplitArgsSafe(content) {
    const args = [];
    let current = "";
    let depth = 0;
    for (let i = 0; i < content.length; i++) {
      const ch = content[i];
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (ch === "," && depth === 0) {
        args.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    if (current.trim()) args.push(current.trim());
    return args;
  }

  function sepoResolveConditionalExprSafe(expr, tokenMap) {
    let out = String(expr || "").replace(/\bSI\s*\(/gi, "IF(");

    function innerResolve(input) {
      let source = input;
      let changed = true;
      while (changed) {
        changed = false;
        const start = source.lastIndexOf("IF(");
        if (start === -1) break;

        let depth = 0;
        let end = -1;
        for (let i = start; i < source.length; i++) {
          if (source[i] === "(") depth++;
          if (source[i] === ")") {
            depth--;
            if (depth === 0) {
              end = i;
              break;
            }
          }
        }
        if (end === -1) break;

        const full = source.slice(start, end + 1);
        const inner = full.slice(3, -1);
        const parts = sepoSplitArgsSafe(inner);
        if (parts.length < 3) break;

        const condExpr = window.replaceTokensSafe(
          innerResolve(parts[0]),
          tokenMap,
        );
        const trueExpr = innerResolve(parts[1]);
        const falseExpr = innerResolve(parts[2]);
        const selected = sepoEvalConditionSafe(condExpr) ? trueExpr : falseExpr;

        source =
          source.slice(0, start) + "(" + selected + ")" + source.slice(end + 1);
        changed = true;
      }
      return source;
    }

    return innerResolve(out);
  }

  if (
    typeof window.resolveFactorFormulasSafe === "function" &&
    !window.resolveFactorFormulasSafe._sepoConditionalWrapped
  ) {
    const baseResolve = window.resolveFactorFormulasSafe;
    const wrapped = function (rawTotals, rpMap) {
      const factors =
        typeof window.getFactorMetaFormulaSafe === "function"
          ? window.getFactorMetaFormulaSafe()
          : [];
      const resolved = Object.assign({}, rawTotals || {});
      const rawBase = Object.assign({}, rawTotals || {});

      for (let pass = 0; pass < 5; pass++) {
        factors.forEach(function (factor) {
          if (!factor.formula) return;
          const tokenMap = Object.assign(
            {},
            rpMap || {},
            resolved || {},
            rawBase || {},
          );
          tokenMap[factor.code] =
            resolved[factor.code] || rawBase[factor.code] || 0;
          const sanitized = sepoSanitizeExprSafe(factor.formula);
          const conditionalResolved = sepoResolveConditionalExprSafe(
            sanitized,
            tokenMap,
          );
          const replaced = window.replaceTokensSafe(
            conditionalResolved,
            tokenMap,
          );
          const val = window.evalArithmeticSafe(replaced);
          resolved[factor.code] = val;
        });
      }
      return resolved;
    };
    wrapped._sepoConditionalWrapped = true;
    window.resolveFactorFormulasSafe = wrapped;
  }

  window.SEPOCondicionalesFase5Safe = {
    ejemplo: "SI(RP1 > 2, FAC-001, FAC-002)",
  };
})(window, document);

/* ========================================== */
/* ACTUALIZACION: AJUSTE ESTRUCTURA EXCEL     */
/* SOLO PRUEBAS PSICOLOGICAS                  */
/* ========================================== */
(function (window, document) {
  "use strict";

  function q(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }
  function parseJSON(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return fallback;
    }
  }

  function getQuestionListForBuilder() {
    const list = [];
    qa("#boxPreg .item-row").forEach(function (row, index) {
      const qNum = index + 1;
      const type = row.dataset.sepoTipo || "cerrada";
      const title = q(".desc-text", row)
        ? q(".desc-text", row).textContent.trim()
        : "Pregunta " + qNum;

      if (type === "matriz") {
        const cfg = parseJSON(row.dataset.sepoConfig || "{}", {});
        const filas = (cfg.matriz && cfg.matriz.filas) || [];
        filas.forEach((f, fIdx) => {
          list.push({
            code: `RP${qNum}.${fIdx + 1}`,
            label: `${title} - ${f.texto || "Fila " + (fIdx + 1)}`,
          });
        });
      } else {
        list.push({ code: "RP" + qNum, label: title });
      }
    });
    return list;
  }

  function getFactorListForBuilder() {
    return qa("#boxFac .item-row").map(function (row, index) {
      const code =
        row.getAttribute("data-cod") ||
        "FAC-" + String(index + 1).padStart(3, "0");
      const label =
        row.getAttribute("data-desc") ||
        (q(".fw-medium", row) ? q(".fw-medium", row).textContent.trim() : code);
      return { code: code, label: label };
    });
  }

  function refreshFormulaBuilderOptions() {
    const qSel = q("#facSelPreg");
    const fSel = q("#facSelFac");
    if (!qSel || !fSel) return;

    const prevQ = qSel.value;
    const prevF = fSel.value;

    qSel.innerHTML =
      '<option value="">Insertar pregunta</option>' +
      getQuestionListForBuilder()
        .map(function (item) {
          return (
            '<option value="' +
            item.code +
            '">' +
            item.code +
            " · " +
            item.label +
            "</option>"
          );
        })
        .join("");

    fSel.innerHTML =
      '<option value="">Insertar factor</option>' +
      getFactorListForBuilder()
        .map(function (item) {
          return (
            '<option value="' +
            item.code +
            '">' +
            item.code +
            " · " +
            item.label +
            "</option>"
          );
        })
        .join("");

    if (prevQ) qSel.value = prevQ;
    if (prevF) fSel.value = prevF;
  }

  function labelFormulaArea() {
    const preview = q("#formulaPreviewFinal");
    if (!preview || preview.dataset.sepoLabeled === "1") return;
    preview.dataset.sepoLabeled = "1";
    preview.classList.add("sepo-formula-preview");
    preview.insertAdjacentHTML(
      "afterbegin",
      '<div class="sepo-formula-preview__badge">Constructor visual</div>',
    );
  }

  function refreshExcelStructure() {
    refreshFormulaBuilderOptions();
    labelFormulaArea();
  }

  const _editPruebaExcel = window.editarPrueba;
  if (
    typeof _editPruebaExcel === "function" &&
    !_editPruebaExcel._sepoExcelWrapped
  ) {
    const wrapped = function () {
      const result = _editPruebaExcel.apply(this, arguments);
      setTimeout(refreshExcelStructure, 80);
      return result;
    };
    wrapped._sepoExcelWrapped = true;
    window.editarPrueba = wrapped;
  }

  const _saveQuestionExcel = window.guardarNuevaPregunta;
  if (
    typeof _saveQuestionExcel === "function" &&
    !_saveQuestionExcel._sepoExcelWrapped
  ) {
    const wrapped = function () {
      const result = _saveQuestionExcel.apply(this, arguments);
      setTimeout(refreshExcelStructure, 40);
      return result;
    };
    wrapped._sepoExcelWrapped = true;
    window.guardarNuevaPregunta = wrapped;
  }

  const _saveFactorExcel = window.addFactor;
  if (
    typeof _saveFactorExcel === "function" &&
    !_saveFactorExcel._sepoExcelWrapped
  ) {
    const wrapped = function () {
      const result = _saveFactorExcel.apply(this, arguments);
      setTimeout(refreshExcelStructure, 40);
      return result;
    };
    wrapped._sepoExcelWrapped = true;
    window.addFactor = wrapped;
  }

  const _preloadExcel = window.precargarBolsito;
  if (typeof _preloadExcel === "function" && !_preloadExcel._sepoExcelWrapped) {
    const wrapped = function () {
      const result = _preloadExcel.apply(this, arguments);
      setTimeout(refreshExcelStructure, 40);
      return result;
    };
    wrapped._sepoExcelWrapped = true;
    window.precargarBolsito = wrapped;
  }

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(refreshExcelStructure, 120);
  });

  window.SEPOExcelStructure = {
    refresh: refreshExcelStructure,
  };
})(window, document);

/* ========================================== */
/* ACTUALIZACION: ESTABILIDAD PSICO DEMO      */
/* SOLO PRUEBAS PSICOLOGICAS                  */
/* ========================================== */
(function (window, document) {
  "use strict";

  function q(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function sepoSafeToast(msg) {
    if (typeof window.showToast === "function") {
      try {
        window.showToast(msg);
        return;
      } catch (e) {}
    }
    try {
      console.warn(msg);
    } catch (e) {}
  }

  function sepoCleanupUiLocks() {
    try {
      document.body.classList.remove("modal-open");
      document.body.style.removeProperty("padding-right");
      if (!document.querySelector(".modal.show")) {
        document.body.style.overflow = "";
      }
      qa(".modal-backdrop").forEach(function (el) {
        if (!document.querySelector(".modal.show")) el.remove();
      });
    } catch (e) {}
  }

  function sepoSafeWrapAction(name, fn) {
    if (typeof fn !== "function") return fn;
    if (fn._sepoStableWrapped) return fn;

    const wrapped = function () {
      try {
        return fn.apply(this, arguments);
      } catch (error) {
        console.error("[SEPO][" + name + "]", error);
        sepoCleanupUiLocks();
        sepoSafeToast(
          "⚠️ Se detectó un problema en " + name + ". La demo sigue activa.",
        );
        return undefined;
      }
    };
    wrapped._sepoStableWrapped = true;
    wrapped._sepoBase = fn;
    return wrapped;
  }

  function sepoEnsurePreviewNodes() {
    const ids = [
      "pvTitle",
      "pvSubtitle",
      "pvIcon",
      "pvCoverIcon",
      "pvCoverTitle",
      "pvCoverDesc",
      "pvTotalQ",
      "pvEstTime",
      "pvPreguntas",
      "pvFinal",
    ];
    return ids.every(function (id) {
      return !!document.getElementById(id);
    });
  }

  function sepoRebindPsychActions() {
    if (typeof window.editarPrueba === "function")
      window.editarPrueba = sepoSafeWrapAction(
        "editarPrueba",
        window.editarPrueba,
      );
    if (typeof window.guardarNuevaPregunta === "function")
      window.guardarNuevaPregunta = sepoSafeWrapAction(
        "guardarNuevaPregunta",
        window.guardarNuevaPregunta,
      );
    if (typeof window.addFactor === "function")
      window.addFactor = sepoSafeWrapAction("addFactor", window.addFactor);
    if (typeof window.duplicarPregunta === "function")
      window.duplicarPregunta = sepoSafeWrapAction(
        "duplicarPregunta",
        window.duplicarPregunta,
      );
    if (typeof window.goStep === "function")
      window.goStep = sepoSafeWrapAction("goStep", window.goStep);

    if (
      typeof window.previsualizarPruebaConfigurada === "function" &&
      !window.previsualizarPruebaConfigurada._sepoStableGuarded
    ) {
      const base = window.previsualizarPruebaConfigurada;
      const wrapped = function () {
        if (!sepoEnsurePreviewNodes()) {
          sepoSafeToast("⚠️ El preview no está listo todavía.");
          return;
        }
        return sepoSafeWrapAction("previsualizarPruebaConfigurada", base).apply(
          this,
          arguments,
        );
      };
      wrapped._sepoStableGuarded = true;
      window.previsualizarPruebaConfigurada = wrapped;
    }

    if (
      typeof window.previsualizarPrueba === "function" &&
      !window.previsualizarPrueba._sepoStableGuarded
    ) {
      const base = window.previsualizarPrueba;
      const wrapped = function () {
        if (!sepoEnsurePreviewNodes()) {
          sepoSafeToast("⚠️ El preview no está listo todavía.");
          return;
        }
        return sepoSafeWrapAction("previsualizarPrueba", base).apply(
          this,
          arguments,
        );
      };
      wrapped._sepoStableGuarded = true;
      window.previsualizarPrueba = wrapped;
    }
  }

  function sepoSafePersistDemo() {
    try {
      if (
        window.SEPODemoPersistence &&
        typeof window.SEPODemoPersistence.saveCurrentPsychDemo === "function"
      ) {
        window.SEPODemoPersistence.saveCurrentPsychDemo();
      }
    } catch (e) {
      console.warn("[SEPO][persistDemo]", e);
    }
  }

  function sepoBindPsychButtonsFallback() {
    const root = document.getElementById("screen-prueba-form") || document;
    if (root.dataset.sepoPsychFallbackBound === "1") return;
    root.dataset.sepoPsychFallbackBound = "1";

    root.addEventListener(
      "click",
      function (e) {
        const btn = e.target.closest("button");
        if (!btn) return;

        const title = (btn.getAttribute("title") || "").toLowerCase();

        if (title.includes("editar pregunta")) {
          e.preventDefault();
          const rowBtn = btn;
          if (typeof window.editarPreguntaRow === "function") {
            try {
              window.editarPreguntaRow(rowBtn);
            } catch (err) {
              console.error(err);
              sepoSafeToast("⚠️ No se pudo abrir la pregunta.");
            }
          }
        }

        if (title.includes("clonar pregunta")) {
          e.preventDefault();
          if (btn.dataset.sepoBusy === "1") return;
          btn.dataset.sepoBusy = "1";
          try {
            if (typeof window.duplicarPregunta === "function")
              window.duplicarPregunta(btn);
            setTimeout(sepoSafePersistDemo, 50);
          } catch (err) {
            console.error(err);
            sepoSafeToast("⚠️ No se pudo duplicar la pregunta.");
          } finally {
            setTimeout(function () {
              btn.dataset.sepoBusy = "0";
            }, 250);
          }
        }
      },
      true,
    );
  }

  function sepoBindPsychMutationSafe() {
    const boxPreg = document.getElementById("boxPreg");
    const boxFac = document.getElementById("boxFac");
    if (boxPreg && boxPreg.dataset.sepoPersistBound !== "1") {
      boxPreg.dataset.sepoPersistBound = "1";
      boxPreg.addEventListener("input", function () {
        setTimeout(sepoSafePersistDemo, 80);
      });
      boxPreg.addEventListener("change", function () {
        setTimeout(sepoSafePersistDemo, 80);
      });
      boxPreg.addEventListener("click", function () {
        setTimeout(sepoSafePersistDemo, 120);
      });
    }
    if (boxFac && boxFac.dataset.sepoPersistBound !== "1") {
      boxFac.dataset.sepoPersistBound = "1";
      boxFac.addEventListener("input", function () {
        setTimeout(sepoSafePersistDemo, 80);
      });
      boxFac.addEventListener("change", function () {
        setTimeout(sepoSafePersistDemo, 80);
      });
      boxFac.addEventListener("click", function () {
        setTimeout(sepoSafePersistDemo, 120);
      });
    }
  }

  window.addEventListener("error", function () {
    sepoCleanupUiLocks();
  });

  window.addEventListener("unhandledrejection", function () {
    sepoCleanupUiLocks();
  });

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
      sepoRebindPsychActions();
      sepoBindPsychButtonsFallback();
      sepoBindPsychMutationSafe();
      sepoCleanupUiLocks();
    }, 120);
  });

  window.SEPOPsicoEstabilidad = {
    rebind: sepoRebindPsychActions,
    cleanup: sepoCleanupUiLocks,
  };
})(window, document);

/* ========================================== */
/* ACTUALIZACION: AJUSTES JOHANA FACTORES     */
/* SOLO PRUEBAS PSICOLOGICAS                  */
/* ========================================== */
(function (window, document) {
  "use strict";

  function q(sel, root) {
    return (root || document).querySelector(sel);
  }

  const _insertarFormulaJohana = window.insertarFormula;
  if (
    typeof _insertarFormulaJohana === "function" &&
    !_insertarFormulaJohana._sepoJohanaWrapped
  ) {
    const wrapped = function (txt) {
      try {
        const normalized = String(txt || "")
          .replace(/\{([^}]+)\}/g, "$1")
          .replace(/\[([^\]]+)\]/g, "$1")
          .replace(/P(\d+)_PTJ/g, "RP$1")
          .replace(/SUM\(([^)]+)\)/gi, function (_, args) {
            return args.replace(/,/g, " + ");
          })
          .replace(/COUNT\(\{TODO\}\)/gi, "1")
          .replace(/COUNT\(([^)]+)\)/gi, function (_, args) {
            return String(args.split(",").length || 1);
          });
        return _insertarFormulaJohana.call(this, normalized);
      } catch (e) {
        console.error("[SEPO][insertarFormula]", e);
      }
    };
    wrapped._sepoJohanaWrapped = true;
    window.insertarFormula = wrapped;
  }

  const _filterFormulaTemplatesJohana = window.filterFormulaTemplates;
  window.filterFormulaTemplates = function (query) {
    try {
      const box = document.getElementById("smartTemplatesBox");
      if (!box) return;
      const items = box.querySelectorAll(".p-2");
      const qv = String(query || "").toLowerCase();
      items.forEach(function (it) {
        const text = (it.textContent || "").toLowerCase();
        it.style.display = text.includes(qv) ? "block" : "none";
      });
    } catch (e) {
      console.error("[SEPO][filterFormulaTemplates]", e);
    }
  };

  function enforceFactorFieldsOutsideTemplate() {
    const note = q("#sepoPlantillaNoFactoresNote");
    if (note) note.style.display = "";
  }

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(enforceFactorFieldsOutsideTemplate, 120);
  });

  window.SEPOJohanaAdjustments = {
    enforceFactorFieldsOutsideTemplate: enforceFactorFieldsOutsideTemplate,
  };
})();

/* ========================================== */
/* ACTUALIZACION: FIX SELECTORES FACTORES     */
/* SOLO PRUEBAS PSICOLOGICAS                  */
/* ========================================== */
(function (window, document) {
  "use strict";

  function bindFormulaSelectorsSafe() {
    const qSel = document.getElementById("facSelPreg");
    const fSel = document.getElementById("facSelFac");

    if (qSel && qSel.dataset.sepoBound !== "1") {
      qSel.dataset.sepoBound = "1";
      qSel.addEventListener("change", function () {
        try {
          if (this.value && typeof window.insertarFormula === "function") {
            window.insertarFormula(this.value);
          }
        } catch (e) {
          console.error("[SEPO][facSelPreg]", e);
        } finally {
          this.value = "";
        }
      });
    }

    if (fSel && fSel.dataset.sepoBound !== "1") {
      fSel.dataset.sepoBound = "1";
      fSel.addEventListener("change", function () {
        try {
          if (this.value && typeof window.insertarFormula === "function") {
            window.insertarFormula(this.value);
          }
        } catch (e) {
          console.error("[SEPO][facSelFac]", e);
        } finally {
          this.value = "";
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(bindFormulaSelectorsSafe, 120);
  });

  if (
    window.SEPOExcelStructure &&
    typeof window.SEPOExcelStructure.refresh === "function" &&
    !window.SEPOExcelStructure._sepoSelectorFixWrapped
  ) {
    const base = window.SEPOExcelStructure.refresh;
    window.SEPOExcelStructure.refresh = function () {
      const result = base.apply(this, arguments);
      setTimeout(bindFormulaSelectorsSafe, 40);
      return result;
    };
    window.SEPOExcelStructure._sepoSelectorFixWrapped = true;
  }

  window.SEPOFormulaSelectorsSafe = {
    bind: bindFormulaSelectorsSafe,
  };
})(window, document);


/* ========================================== */
/* AJUSTE: FLUJO PRECARGA PREGUNTA ABIERTA    */
/* AJUSTE: EDICION INICIA EN INFO GENERAL     */
/* ========================================== */
(function (window, document) {
  "use strict";

  function q(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function getOpenPrecargaDemoOptions() {
    return [
      "Sin observaciones relevantes",
      "Apto para continuar con la evaluación",
      "Requiere seguimiento psicológico preventivo",
      "Se recomienda entrevista complementaria",
      "Presenta indicadores leves de estrés situacional",
      "Refiere adecuada adaptación al entorno laboral",
      "Mantiene estabilidad emocional durante la jornada",
      "Demuestra recursos personales de afrontamiento",
      "Presenta buena disposición para el trabajo en equipo",
      "Sugiere fortalecimiento de hábitos de autocuidado",
      "No se evidencian factores de riesgo significativos",
      "Se recomienda monitoreo en la siguiente campaña",
      "Perfil compatible con funciones operativas",
      "Perfil compatible con funciones administrativas",
      "Perfil compatible con trabajo bajo presión moderada",
      "Requiere reforzar estrategias de regulación emocional"
    ];
  }

  function readOpenPrecargaSelection(root) {
    const fields = q("#mp_A_precargaFields", root);
    const hidden = q("#mp_A_precargaValue", root);
    const seed = fields && fields.dataset ? (fields.dataset.sepoOpenPrecargaSeed || "") : "";
    const raw = (hidden && hidden.value) || seed || "";
    return raw.split(",").map(function (item) {
      return item.trim();
    }).filter(Boolean);
  }

  function bindOpenPrecargaCardSelector(root) {
    const selector = q("#mp_A_precargaCardSelector", root);
    if (!selector || selector.dataset.bound === "1") return;
    selector.dataset.bound = "1";

    const search = q("#mp_A_precargaSearch", selector);
    const hidden = q("#mp_A_precargaValue", selector);
    const cards = qa(".mp-precarga-card", selector);
    const empty = q("#mp_A_precargaEmpty", selector);

    function syncValue() {
      const values = cards.map(function (card) {
        const check = q(".mp-precarga-check", card);
        return check && check.checked ? check.value : "";
      }).filter(Boolean);
      hidden.value = values.join(", ");
      const fields = q("#mp_A_precargaFields", root);
      if (fields && fields.dataset) {
        fields.dataset.sepoOpenPrecargaSeed = hidden.value;
      }
    }

    function syncCardState() {
      cards.forEach(function (card) {
        const check = q(".mp-precarga-check", card);
        card.classList.toggle("is-selected", !!(check && check.checked));
      });
    }

    function filterCards() {
      const term = ((search && search.value) || "").trim().toLowerCase();
      let visible = 0;
      cards.forEach(function (card) {
        const label = (card.getAttribute("data-label") || "").toLowerCase();
        const show = !term || label.indexOf(term) !== -1;
        card.style.display = show ? "flex" : "none";
        if (show) visible += 1;
      });
      if (empty) empty.style.display = visible ? "none" : "block";
    }

    cards.forEach(function (card) {
      const check = q(".mp-precarga-check", card);
      if (!check) return;
      check.addEventListener("change", function () {
        syncCardState();
        syncValue();
      });
    });

    if (search) search.addEventListener("input", filterCards);

    syncCardState();
    syncValue();
    filterCards();
  }

  function renderOpenPrecargaCards(root) {
    const fields = q("#mp_A_precargaFields", root);
    if (!fields) return;

    const selectedValues = readOpenPrecargaSelection(root);
    const demoOptions = getOpenPrecargaDemoOptions();

    fields.dataset.sepoManagedOpenPrecarga = "1";
    fields.innerHTML = [
      '<div class="mp-precarga-card-selector" id="mp_A_precargaCardSelector">',
      '  <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-2">',
      '    <label class="form-label small text-primary fw-bold mb-0">Alternativas por defecto:</label>',
      '    <input type="text" class="form-control form-control-sm mp-precarga-search" id="mp_A_precargaSearch" placeholder="Buscar alternativa...">',
      '  </div>',
      '  <input type="hidden" id="mp_A_precargaValue" value="' + selectedValues.join(", ").replace(/"/g, '&quot;') + '">',
      '  <div class="mp-precarga-card-list" id="mp_A_precargaList">',
         demoOptions.map(function (opt, idx) {
           const checked = selectedValues.indexOf(opt) !== -1;
           return [
             '    <label class="mp-precarga-card ' + (checked ? 'is-selected' : '') + '" data-label="' + opt.toLowerCase().replace(/"/g, '&quot;') + '">',
             '      <input class="mp-precarga-check" type="checkbox" value="' + opt.replace(/"/g, '&quot;') + '" ' + (checked ? 'checked' : '') + '>',
             '      <span class="mp-precarga-card-index">' + (idx + 1) + '</span>',
             '      <span class="mp-precarga-card-text">' + opt + '</span>',
             '    </label>'
           ].join('');
         }).join(''),
      '  </div>',
      '  <div class="mp-precarga-empty small text-muted text-center py-2" id="mp_A_precargaEmpty" style="display:none;">No se encontraron alternativas.</div>',
      '  <div class="form-text mt-2">Marque una o varias alternativas ficticias para la demostración.</div>',
      '</div>'
    ].join('');

    bindOpenPrecargaCardSelector(root);
  }

  function syncOpenPrecargaVisibility() {
    const root = q("#mpContenedorPregunta") || document;
    const wrapEditable = q("#mp_A_editableWrap", root);
    const editable = q("#mp_A_editable", root);
    const box = q("#mp_A_boxPrecarga", root);
    const fields = q("#mp_A_precargaFields", root);
    const yes = q("#mp_A_precargaSi", root);
    if (!wrapEditable || !editable || !box || !fields || !yes) return;

    wrapEditable.style.display = yes.checked ? "block" : "none";

    if (!yes.checked) {
      editable.checked = false;
      box.style.display = "none";
      fields.innerHTML = "";
      return;
    }

    if (!editable.checked) {
      box.style.display = "none";
      fields.innerHTML = "";
      return;
    }

    box.style.display = "block";
    if (!q("#mp_A_precargaCardSelector", fields)) {
      renderOpenPrecargaCards(root);
    } else {
      bindOpenPrecargaCardSelector(root);
    }
  }

  function bindOpenPrecargaToggles() {
    const root = q("#mpContenedorPregunta") || document;
    const editable = q("#mp_A_editable", root);
    const yes = q("#mp_A_precargaSi", root);
    const no = q("#mp_A_precargaNo", root);
    [editable, yes, no].forEach(function (el) {
      if (!el || el.dataset.sepoOpenPrecargaBound === "1") return;
      el.dataset.sepoOpenPrecargaBound = "1";
      el.addEventListener("change", function () {
        setTimeout(syncOpenPrecargaVisibility, 0);
      });
    });
  }

  function hardenLegacyOpenPrecargaContainer() {
    const root = q("#mpContenedorPregunta") || document;
    const fields = q("#mp_A_precargaFields", root);
    if (!fields || fields.dataset.sepoObserverBound === "1") return;
    fields.dataset.sepoObserverBound = "1";

    const observer = new MutationObserver(function () {
      const yes = q("#mp_A_precargaSi", root);
      const editable = q("#mp_A_editable", root);
      if (!yes || !editable || !yes.checked || !editable.checked) return;
      if (!q("#mp_A_precargaCardSelector", fields)) {
        renderOpenPrecargaCards(root);
      }
    });

    observer.observe(fields, { childList: true });
  }

  const previousCtrlAbierta = window.ctrlAbierta;
  if (typeof previousCtrlAbierta === "function" && !previousCtrlAbierta._sepoCardsFinalWrap) {
    const wrappedCtrlAbierta = function () {
      const result = previousCtrlAbierta.apply(this, arguments);
      bindOpenPrecargaToggles();
      hardenLegacyOpenPrecargaContainer();
      syncOpenPrecargaVisibility();
      return result;
    };
    wrappedCtrlAbierta._sepoCardsFinalWrap = true;
    window.ctrlAbierta = wrappedCtrlAbierta;
  }

  const previousRenderizar = window.renderizarControlesPregunta;
  if (typeof previousRenderizar === "function" && !previousRenderizar._sepoCardsFinalWrap) {
    const wrappedRender = function () {
      const result = previousRenderizar.apply(this, arguments);
      setTimeout(function () {
        bindOpenPrecargaToggles();
        hardenLegacyOpenPrecargaContainer();
        syncOpenPrecargaVisibility();
      }, 0);
      return result;
    };
    wrappedRender._sepoCardsFinalWrap = true;
    window.renderizarControlesPregunta = wrappedRender;
  }

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
      bindOpenPrecargaToggles();
      hardenLegacyOpenPrecargaContainer();
      syncOpenPrecargaVisibility();
    }, 80);
  });

  window.SEPOOpenPrecargaFlow = {
    refresh: syncOpenPrecargaVisibility,
  };
})(window, document);


/* === Stable open precarga cards patch === */
(function(){
  if (window.__sepoStablePrecargaPatchApplied) return;
  window.__sepoStablePrecargaPatchApplied = true;

  function q(sel, root){ return (root || document).querySelector(sel); }
  function qa(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function stableOptions(){
    return [
      'Presenta episodios de estrés',
      'Manifiesta tensión ante evaluaciones',
      'Refiere dificultades para dormir',
      'Muestra buena adaptación al entorno',
      'Requiere seguimiento psicológico preventivo',
      'Se recomienda entrevista complementaria',
      'Presenta indicadores leves de ansiedad',
      'Demuestra recursos de afrontamiento',
      'Sugiere reforzar hábitos de autocuidado',
      'No se evidencian factores de riesgo significativos',
      'Perfil compatible con funciones operativas',
      'Perfil compatible con funciones administrativas'
    ];
  }

  function ensureFreshFields(root){
    const current = q('#mp_A_precargaFields', root);
    if (!current) return null;
    if (current.dataset.sepoStableNode === '1') return current;
    const clean = current.cloneNode(false);
    clean.id = 'mp_A_precargaFields';
    clean.dataset.sepoStableNode = '1';
    clean.dataset.sepoManagedOpenPrecarga = '1';
    current.parentNode.replaceChild(clean, current);
    return clean;
  }

  function selectedValues(root){
    const hidden = q('#mp_A_precargaValue', root);
    const raw = hidden ? hidden.value : '';
    return raw.split(',').map(function(v){ return v.trim(); }).filter(Boolean);
  }

  function paintCards(root){
    const fields = ensureFreshFields(root);
    if (!fields) return;
    const current = new Set(selectedValues(root));
    const wrap = document.createElement('div');
    wrap.className = 'mp-precarga-card-selector';
    wrap.id = 'mp_A_precargaCardSelector';

    const top = document.createElement('div');
    top.className = 'd-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-2';

    const label = document.createElement('label');
    label.className = 'form-label small text-primary fw-bold mb-0';
    label.textContent = 'Alternativas por defecto:';

    const search = document.createElement('input');
    search.type = 'text';
    search.className = 'form-control form-control-sm mp-precarga-search';
    search.id = 'mp_A_precargaSearch';
    search.placeholder = 'Buscar alternativa...';

    top.appendChild(label);
    top.appendChild(search);

    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.id = 'mp_A_precargaValue';

    const list = document.createElement('div');
    list.className = 'mp-precarga-card-list';
    list.id = 'mp_A_precargaList';

    stableOptions().forEach(function(opt, idx){
      const card = document.createElement('label');
      card.className = 'mp-precarga-card' + (current.has(opt) ? ' is-selected' : '');
      card.setAttribute('data-label', opt.toLowerCase());

      const check = document.createElement('input');
      check.className = 'mp-precarga-check';
      check.type = 'checkbox';
      check.value = opt;
      check.checked = current.has(opt);

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
    empty.className = 'mp-precarga-empty small text-muted text-center py-2';
    empty.id = 'mp_A_precargaEmpty';
    empty.style.display = 'none';
    empty.textContent = 'No se encontraron alternativas.';

    const help = document.createElement('div');
    help.className = 'form-text mt-2';
    help.textContent = 'Marque una o varias alternativas ficticias para la demostración.';

    wrap.appendChild(top);
    wrap.appendChild(hidden);
    wrap.appendChild(list);
    wrap.appendChild(empty);
    wrap.appendChild(help);

    fields.innerHTML = '';
    fields.appendChild(wrap);

    function sync(){
      const values = qa('.mp-precarga-check:checked', wrap).map(function(el){ return el.value; });
      hidden.value = values.join(', ');
      fields.dataset.sepoOpenPrecargaSeed = hidden.value;
      qa('.mp-precarga-card', wrap).forEach(function(card){
        const ck = q('.mp-precarga-check', card);
        card.classList.toggle('is-selected', !!(ck && ck.checked));
      });
    }

    function filter(){
      const term = (search.value || '').trim().toLowerCase();
      let visible = 0;
      qa('.mp-precarga-card', wrap).forEach(function(card){
        const show = !term || (card.getAttribute('data-label') || '').indexOf(term) !== -1;
        card.style.display = show ? 'flex' : 'none';
        if (show) visible += 1;
      });
      empty.style.display = visible ? 'none' : 'block';
    }

    qa('.mp-precarga-check', wrap).forEach(function(el){ el.addEventListener('change', sync); });
    search.addEventListener('input', filter);
    sync();
    filter();
  }

  function stabilizeOpenPrecarga(){
    const root = q('#mpContenedorPregunta') || document;
    const yes = q('#mp_A_precargaSi', root);
    const no = q('#mp_A_precargaNo', root);
    const editable = q('#mp_A_editable', root);
    const editableWrap = q('#mp_A_editableWrap', root);
    const box = q('#mp_A_boxPrecarga', root);
    if (!yes || !editable || !editableWrap || !box) return;

    editableWrap.style.display = yes.checked ? 'block' : 'none';

    const shouldShow = !!(yes.checked && editable.checked);
    if (!shouldShow) {
      box.style.display = 'none';
      const fields = ensureFreshFields(root);
      if (fields) fields.innerHTML = '';
      return;
    }

    box.style.display = 'block';
    paintCards(root);

    [yes, no, editable].forEach(function(el){
      if (!el || el.dataset.sepoStableBound === '1') return;
      el.dataset.sepoStableBound = '1';
      el.addEventListener('change', function(){ setTimeout(stabilizeOpenPrecarga, 0); });
    });
  }

  const prevCtrl = window.ctrlAbierta;
  window.ctrlAbierta = function(){
    const result = typeof prevCtrl === 'function' ? prevCtrl.apply(this, arguments) : undefined;
    setTimeout(stabilizeOpenPrecarga, 0);
    return result;
  };

  const prevRender = window.renderizarControlesPregunta;
  if (typeof prevRender === 'function') {
    window.renderizarControlesPregunta = function(){
      const result = prevRender.apply(this, arguments);
      setTimeout(stabilizeOpenPrecarga, 0);
      return result;
    };
  }

  document.addEventListener('change', function(e){
    if (e.target && (e.target.id === 'mp_A_precargaSi' || e.target.id === 'mp_A_precargaNo' || e.target.id === 'mp_A_editable')) {
      setTimeout(stabilizeOpenPrecarga, 0);
    }
  });

  setTimeout(stabilizeOpenPrecarga, 0);
})();


/* === Ultimate fix: open precarga cards without loop === */
(function(){
  if (window.__sepoUltimateOpenPrecargaFix) return;
  window.__sepoUltimateOpenPrecargaFix = true;

  function q(sel, root){ return (root || document).querySelector(sel); }
  function qa(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  var OPTIONS = [
    'Presenta episodios de estrés',
    'Manifiesta tensión ante evaluaciones',
    'Refiere dificultades para dormir',
    'Muestra buena adaptación al entorno',
    'Requiere seguimiento psicológico preventivo',
    'Se recomienda entrevista complementaria',
    'Presenta indicadores leves de ansiedad',
    'Demuestra recursos de afrontamiento',
    'Sugiere reforzar hábitos de autocuidado',
    'No se evidencian factores de riesgo significativos',
    'Perfil compatible con funciones operativas',
    'Perfil compatible con funciones administrativas'
  ];

  function getRoot(){ return q('#mpContenedorPregunta') || document; }

  function getFields(root){
    var fields = q('#mp_A_precargaFields', root);
    if (!fields) return null;
    fields.dataset.sepoManagedOpenPrecarga = '1';
    return fields;
  }

  function getSelected(root){
    var fields = getFields(root);
    var hidden = q('#mp_A_precargaValue', root);
    var raw = '';
    if (hidden && hidden.value) raw = hidden.value;
    else if (fields && fields.dataset && fields.dataset.sepoOpenPrecargaSeed) raw = fields.dataset.sepoOpenPrecargaSeed;
    return raw.split(',').map(function(v){ return v.trim(); }).filter(Boolean);
  }

  function mount(root){
    var fields = getFields(root);
    if (!fields) return null;

    var host = q('#mp_A_precargaCardsHost', fields);
    if (!host) {
      fields.innerHTML = '';
      host = document.createElement('div');
      host.id = 'mp_A_precargaCardsHost';
      host.className = 'mp-precarga-card-selector';
      fields.appendChild(host);
    }

    if (!q('#mp_A_precargaSearch', host)) {
      host.innerHTML = '';

      var top = document.createElement('div');
      top.className = 'd-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-2';

      var label = document.createElement('label');
      label.className = 'form-label small text-primary fw-bold mb-0';
      label.textContent = 'Alternativas por defecto:';

      var search = document.createElement('input');
      search.type = 'text';
      search.className = 'form-control form-control-sm mp-precarga-search';
      search.id = 'mp_A_precargaSearch';
      search.placeholder = 'Buscar alternativa...';

      top.appendChild(label);
      top.appendChild(search);

      var hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.id = 'mp_A_precargaValue';

      var list = document.createElement('div');
      list.className = 'mp-precarga-card-list';
      list.id = 'mp_A_precargaList';

      OPTIONS.forEach(function(opt, idx){
        var card = document.createElement('label');
        card.className = 'mp-precarga-card';
        card.setAttribute('data-label', opt.toLowerCase());

        var check = document.createElement('input');
        check.type = 'checkbox';
        check.className = 'mp-precarga-check';
        check.value = opt;

        var index = document.createElement('span');
        index.className = 'mp-precarga-card-index';
        index.textContent = String(idx + 1);

        var text = document.createElement('span');
        text.className = 'mp-precarga-card-text';
        text.textContent = opt;

        card.appendChild(check);
        card.appendChild(index);
        card.appendChild(text);
        list.appendChild(card);
      });

      var empty = document.createElement('div');
      empty.className = 'mp-precarga-empty small text-muted text-center py-2';
      empty.id = 'mp_A_precargaEmpty';
      empty.style.display = 'none';
      empty.textContent = 'No se encontraron alternativas.';

      host.appendChild(top);
      host.appendChild(hidden);
      host.appendChild(list);
      host.appendChild(empty);

      var sync = function(){
        var values = qa('.mp-precarga-check:checked', host).map(function(el){ return el.value; });
        hidden.value = values.join(', ');
        fields.dataset.sepoOpenPrecargaSeed = hidden.value;
        qa('.mp-precarga-card', host).forEach(function(card){
          var ck = q('.mp-precarga-check', card);
          card.classList.toggle('is-selected', !!(ck && ck.checked));
        });
      };

      var filter = function(){
        var term = (search.value || '').trim().toLowerCase();
        var visible = 0;
        qa('.mp-precarga-card', host).forEach(function(card){
          var show = !term || (card.getAttribute('data-label') || '').indexOf(term) !== -1;
          card.style.display = show ? 'flex' : 'none';
          if (show) visible += 1;
        });
        empty.style.display = visible ? 'none' : 'block';
      };

      host.__sepoSync = sync;
      host.__sepoFilter = filter;
      qa('.mp-precarga-check', host).forEach(function(el){ el.addEventListener('change', sync); });
      search.addEventListener('input', filter);
    }

    return host;
  }

  function applySelection(root){
    var host = mount(root);
    if (!host) return;
    var selected = new Set(getSelected(root));
    qa('.mp-precarga-check', host).forEach(function(el){
      el.checked = selected.has(el.value);
    });
    if (typeof host.__sepoSync === 'function') host.__sepoSync();
    if (typeof host.__sepoFilter === 'function') host.__sepoFilter();
  }

  function updateVisibility(){
    var root = getRoot();
    var yes = q('#mp_A_precargaSi', root);
    var editable = q('#mp_A_editable', root);
    var editableWrap = q('#mp_A_editableWrap', root);
    var box = q('#mp_A_boxPrecarga', root);
    var fields = getFields(root);
    if (!yes || !editable || !editableWrap || !box || !fields) return;

    editableWrap.style.display = yes.checked ? 'block' : 'none';

    var show = !!(yes.checked && editable.checked);
    box.style.display = show ? 'block' : 'none';

    if (show) {
      applySelection(root);
    } else {
      fields.innerHTML = '';
    }
  }

  function bind(){
    var root = getRoot();
    ['#mp_A_precargaSi','#mp_A_precargaNo','#mp_A_editable'].forEach(function(sel){
      var el = q(sel, root);
      if (!el || el.dataset.sepoUltimateBound === '1') return;
      el.dataset.sepoUltimateBound = '1';
      el.addEventListener('change', function(){ setTimeout(updateVisibility, 0); });
    });
  }

  var prevCtrl = window.ctrlAbierta;
  window.ctrlAbierta = function(){
    var result = typeof prevCtrl === 'function' ? prevCtrl.apply(this, arguments) : undefined;
    bind();
    updateVisibility();
    return result;
  };

  var prevRender = window.renderizarControlesPregunta;
  if (typeof prevRender === 'function') {
    window.renderizarControlesPregunta = function(){
      var result = prevRender.apply(this, arguments);
      setTimeout(function(){ bind(); updateVisibility(); }, 0);
      return result;
    };
  }

  document.addEventListener('change', function(e){
    if (!e.target) return;
    if (e.target.id === 'mp_A_precargaSi' || e.target.id === 'mp_A_precargaNo' || e.target.id === 'mp_A_editable') {
      setTimeout(function(){ bind(); updateVisibility(); }, 0);
    }
  }, true);

  setTimeout(function(){ bind(); updateVisibility(); }, 100);
})();

/* ===== FACTORES STEP REDESIGN OVERRIDES ===== */
window.sepoFactorsData = window.sepoFactorsData || [
  {
    code: 'FAC-ANS-S',
    desc: 'Ansiedad Somática',
    formula: 'RP1 + RP2',
    ord: 1,
    dec: 2,
    dep: 'edad',
    assignments: 4,
    total: 3,
    detail: [
      'RP1 + RP2',
      'Base: 5',
      'En la última semana, ¿con qué frecuencia ha sentido miedo a que suceda lo peor? (Copia) · Nunca = 0',
      'Seleccione los síntomas físicos que ha experimentado con mayor intensidad · Palpitaciones = 2',
      'Seleccione los síntomas físicos que ha experimentado con mayor intensidad · Sudoración = 1',
      'Seleccione los síntomas físicos que ha experimentado con mayor intensidad · Temblor = 2'
    ]
  },
  {
    code: 'FAC-ANS-C',
    desc: 'Ansiedad Cognitiva',
    formula: 'RP1 + RP3',
    ord: 2,
    dec: 2,
    dep: 'sexo',
    assignments: 3,
    total: 2,
    detail: [
      'RP1 + RP3',
      'Base: 6',
      'En la última semana, ¿con qué frecuencia ha sentido miedo a que suceda lo peor? (Copia) · A veces = 1',
      'En la última semana, ¿con qué frecuencia ha sentido miedo a que suceda lo peor? (Copia) · Siempre = 3',
      'Mencione tres situaciones específicas que le disparen episodios de ansiedad · Abierta 1 = 2'
    ]
  },
  {
    code: 'FAC-ANS-S_COPY',
    desc: 'Ansiedad Somática (Copia)',
    formula: 'RP1 + RP2',
    ord: 3,
    dec: 2,
    dep: 'nivel',
    assignments: 0,
    total: 3,
    detail: ['RP1 + RP2', 'Base: 0', 'Sin asignaciones aún']
  }
];

window.sepoFactorEditingIndex = null;

function sepoFactorCodeFromDesc(desc) {
  const clean = String(desc || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const short = clean.slice(0, 2).map(s => s.slice(0, 3)).join('-') || 'FAC';
  let base = `FAC-${short}`;
  let code = base;
  let n = 2;
  const editing = window.sepoFactorEditingIndex;
  while (window.sepoFactorsData.some((f, idx) => idx !== editing && f.code === code)) {
    code = `${base}-${n++}`;
  }
  return code;
}

function sepoFactorDetailHTML(lines) {
  return `<div class="sepo-factor-detail-lines">${(lines || []).map((line, idx) => idx === 0 ? `<span class="sepo-factor-detail-chip">${line}</span>` : `<div>${line}</div>`).join('')}</div>`;
}

function renderFactorCards() {
  const box = document.getElementById('boxFac');
  if (!box) return;
  box.innerHTML = window.sepoFactorsData.map((factor, idx) => `
    <div class="sepo-factor-item" data-index="${idx}">
      <div class="sepo-factor-item-main">
        <span class="sepo-factor-code">${factor.code}</span>
        <span class="sepo-factor-title">${factor.desc}</span>
        <span class="sepo-factor-formula">${factor.formula || 'Sin fórmula'}</span>
      </div>
      <div class="sepo-factor-actions">
        <button class="btn btn-sm btn-outline-primary" title="Editar Factor" onclick="editarFactorRowByIndex(${idx})"><i class="fas fa-pen"></i></button>
        <button class="btn btn-sm btn-outline-secondary" title="Duplicar Factor" onclick="duplicarFactorByIndex(${idx})"><i class="fas fa-copy"></i></button>
        <button class="btn btn-sm btn-outline-danger" title="Eliminar Factor" onclick="eliminarFactorByIndex(${idx})"><i class="fas fa-times"></i></button>
      </div>
    </div>
  `).join('');
}

function renderFactorSummary() {
  const body = document.getElementById('factorSummaryBody');
  if (!body) return;
  body.innerHTML = window.sepoFactorsData.map(factor => `
    <tr>
      <td><strong>${factor.code}</strong></td>
      <td>${factor.desc}</td>
      <td>${factor.assignments ?? 0}</td>
      <td><span class="badge rounded-pill text-bg-light border">${factor.total ?? 0}</span></td>
      <td>${sepoFactorDetailHTML(factor.detail)}</td>
    </tr>
  `).join('');
}

function renderFactorsStep() {
  renderFactorCards();
  renderFactorSummary();
}

function insertarFormula(txt) {
  const t = document.getElementById('facFormula');
  if (!t) return;
  const current = String(t.value || '').trim();
  const incoming = String(txt || '').replace(/\s+/g, ' ').trim();
  t.value = current ? `${current} ${incoming}`.trim() : incoming;
  syncFormula(t.value);
}

function syncFormula(val) {
  const text = String(val || '').trim();
  const facFormula = document.getElementById('facFormula');
  const preview = document.getElementById('formulaTextPreview');
  const reference = document.getElementById('formulaTextReference');
  const panel = document.getElementById('formulaPreviewFinal');
  if (facFormula) facFormula.value = text;
  if (preview) preview.textContent = text || '...';
  if (reference) reference.textContent = text || '...';
  if (panel) panel.className = 'sepo-formula-preview';
}

function filterFormulaTemplates(query) {
  const box = document.getElementById('smartTemplatesBox');
  if (!box) return;
  const q = String(query || '').toLowerCase();
  box.querySelectorAll('.sepo-template-row').forEach((item) => {
    item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function generarRangoSuma() {
  const input = (document.getElementById('rangeSumInput') || {}).value;
  if (!input) return;
}

function addFactor() {
  const descEl = document.getElementById('facDesc');
  const formulaEl = document.getElementById('facFormula');
  const ordEl = document.getElementById('facOrd');
  const decEl = document.getElementById('facDec');
  const desc = descEl ? descEl.value.trim() : '';
  const formula = formulaEl ? formulaEl.value.trim() : '';
  const ord = ordEl ? parseInt(ordEl.value || '1', 10) : 1;
  const dec = decEl ? parseInt(decEl.value || '2', 10) : 2;
  const dep = Array.from(document.querySelectorAll('input[name="facDependencia"]:checked')).map((i) => i.value).join(',');

  if (!desc) {
    alert('Completa la descripción del factor.');
    return;
  }

  const factor = {
    code: sepoFactorCodeFromDesc(desc),
    desc,
    formula: formula || 'RP1 + RP2',
    ord,
    dec,
    dep,
    assignments: 0,
    total: dec > 0 ? dec + 1 : 1,
    detail: [formula || 'RP1 + RP2', 'Base: 0', 'Sin asignaciones aún']
  };

  if (window.sepoFactorEditingIndex !== null) {
    const current = window.sepoFactorsData[window.sepoFactorEditingIndex] || {};
    factor.code = current.code || factor.code;
    factor.assignments = current.assignments ?? factor.assignments;
    factor.total = current.total ?? factor.total;
    factor.detail = current.detail || factor.detail;
    window.sepoFactorsData[window.sepoFactorEditingIndex] = factor;
    window.sepoFactorEditingIndex = null;
    const btn = document.querySelector('button[onclick="addFactor()"]');
    if (btn) btn.innerHTML = '<i class="fas fa-save me-2"></i> Guardar Nuevo Factor';
    showToast('✅ Factor actualizado.');
  } else {
    window.sepoFactorsData.push(factor);
    showToast('✅ Factor guardado.');
  }

  if (descEl) descEl.value = '';
  if (formulaEl) formulaEl.value = '';
  if (ordEl) ordEl.value = String(window.sepoFactorsData.length + 1);
  if (decEl) decEl.value = '2';
  document.querySelectorAll('input[name="facDependencia"]').forEach(i => i.checked = false);
  syncFormula('');
  renderFactorsStep();
}

function editarFactorRowByIndex(index) {
  const factor = window.sepoFactorsData[index];
  if (!factor) return;
  const descEl = document.getElementById('facDesc');
  const ordEl = document.getElementById('facOrd');
  const decEl = document.getElementById('facDec');
  if (descEl) descEl.value = factor.desc || '';
  if (ordEl) ordEl.value = factor.ord || index + 1;
  if (decEl) decEl.value = factor.dec ?? 2;
  const selectedDeps = String(factor.dep || '').split(',').map(v => v.trim()).filter(Boolean);
  document.querySelectorAll('input[name="facDependencia"]').forEach(i => {
    i.checked = selectedDeps.includes(i.value);
  });
  syncFormula(factor.formula || '');
  window.sepoFactorEditingIndex = index;
  const btn = document.querySelector('button[onclick="addFactor()"]');
  if (btn) btn.innerHTML = '<i class="fas fa-sync me-2"></i> Actualizar Factor';
  if (descEl) descEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function editarFactorRow(btn) {
  const row = btn.closest('[data-index]');
  if (!row) return;
  editarFactorRowByIndex(Number(row.getAttribute('data-index')));
}

function duplicarFactorByIndex(index) {
  const factor = window.sepoFactorsData[index];
  if (!factor) return;
  const copy = JSON.parse(JSON.stringify(factor));
  copy.code = `${factor.code}_COPY`;
  copy.desc = `${factor.desc} (Copia)`;
  copy.detail = [copy.formula || 'RP1 + RP2', 'Base: 0', 'Sin asignaciones aún'];
  copy.assignments = 0;
  window.sepoFactorsData.push(copy);
  renderFactorsStep();
  showToast('✅ Factor duplicado.');
}

function duplicarFactor(btn) {
  const row = btn.closest('[data-index]');
  if (!row) return;
  duplicarFactorByIndex(Number(row.getAttribute('data-index')));
}

function eliminarFactorByIndex(index) {
  window.sepoFactorsData.splice(index, 1);
  renderFactorsStep();
}

document.addEventListener('change', function (e) {
  if (e.target && e.target.id === 'facSelPreg' && e.target.value) {
    insertarFormula(e.target.value);
    e.target.value = '';
  }
  if (e.target && e.target.id === 'facSelFac' && e.target.value) {
    insertarFormula(e.target.value);
    e.target.value = '';
  }
});

document.addEventListener('DOMContentLoaded', function () {
  renderFactorsStep();
  syncFormula('');
});



/* Patch 2026-03-31: separar constructor visual vs visualización referencial
   y consolidar un solo Resumen de Factores sin duplicados. */
function syncReferenceFormula(val) {
  const text = String(val || '').trim();
  const reference = document.getElementById('formulaTextReference');
  if (reference) reference.textContent = text || '...';
}

function syncFormula(val) {
  const text = String(val || '').trim();
  const facFormula = document.getElementById('facFormula');
  const preview = document.getElementById('formulaTextPreview');
  const panel = document.getElementById('formulaPreviewFinal');
  if (facFormula) facFormula.value = text;
  if (preview) preview.textContent = text || '...';
  if (panel) panel.className = 'sepo-formula-preview';
}

function renderFactorAccumulator() {
  const body = document.getElementById('factorSummaryBody');
  const panel = document.querySelector('.sepo-factor-summary-panel');
  if (!body || !panel) return;

  document.querySelectorAll('#step-5 .soft-panel h6 .fa-calculator').forEach(function(icon){
    const candidate = icon.closest('.soft-panel');
    if (candidate && candidate !== panel) {
      candidate.remove();
    }
  });
  const duplicateDynamic = document.getElementById('sepoFactorSummaryBox');
  if (duplicateDynamic && duplicateDynamic !== panel) duplicateDynamic.remove();

  const rows = (window.sepoFactorsData || []).map(function (factor) {
    return {
      code: factor.code || '',
      label: factor.desc || '',
      links: Number(factor.assignments || 0),
      total: Number(factor.total || 0),
      sources: Array.isArray(factor.detail)
        ? factor.detail.map(function (item) {
            return { question: 'Fórmula', item: String(item), value: '' };
          })
        : []
    };
  });

  const useful = rows.filter(function (r) {
    return r && (r.links > 0 || r.label || r.code);
  });

  if (!useful.length) {
    body.innerHTML = '<tr><td colspan="5" class="text-muted small">No hay factores ni asignaciones configuradas todavía.</td></tr>';
    return;
  }

  body.innerHTML = useful.map(function (row) {
    const detail = Array.isArray(row.sources) && row.sources.length
      ? '<div class="sepo-factor-detail-lines">' + row.sources.slice(0, 4).map(function (s) {
          const text = [s.question, s.item].filter(Boolean).join(' · ');
          const suffix = (s.value !== undefined && s.value !== null && String(s.value) !== '') ? (' = ' + s.value) : '';
          return '<span class="sepo-factor-detail-chip">' + text + suffix + '</span>';
        }).join('') + '</div>'
      : '<span class="text-muted small">Sin asignaciones aún</span>';

    return '<tr>' +
      '<td><strong>' + (row.code || '') + '</strong></td>' +
      '<td>' + (row.label || '') + '</td>' +
      '<td>' + Number(row.links || 0) + '</td>' +
      '<td><span class="badge rounded-pill text-bg-light border">' + Number(row.total || 0) + '</span></td>' +
      '<td>' + detail + '</td>' +
      '</tr>';
  }).join('');
}

function renderFactorSummary() {
  renderFactorAccumulator();
}

function renderFormulaInfoInFactorSummarySafe() {
  renderFactorAccumulator();
}

function sepoNormalizeSmartSearchBindings() {
  const box = document.querySelector('.sepo-smart-search-box');
  if (!box) return;

  const clearBtn = box.querySelector('.btn-outline-secondary');
  if (clearBtn) {
    clearBtn.onclick = function () {
      const input = document.getElementById('smartFormulaSearch');
      if (input) input.value = '';
      filterFormulaTemplates('');
      syncReferenceFormula('');
    };
  }

  const rows = box.querySelectorAll('#smartTemplatesBox .sepo-template-row');
  rows.forEach(function (row) {
    const attr = row.getAttribute('onclick') || '';
    const match = attr.match(/insertarFormula\('([\s\S]*?)'\)/);
    const formula = match ? match[1] : row.dataset.formula || '';
    row.dataset.formula = formula;
    row.removeAttribute('onclick');
    row.onclick = function () {
      syncReferenceFormula(formula);
    };
  });
}

function sepoRemoveDuplicateFactorSummary() {
  const staticPanel = document.querySelector('.sepo-factor-summary-panel');
  document.querySelectorAll('#step-5 .soft-panel h6 .fa-calculator').forEach(function(icon){
    const candidate = icon.closest('.soft-panel');
    if (staticPanel && candidate && candidate !== staticPanel) candidate.remove();
  });
  const dynamic = document.getElementById('sepoFactorSummaryBox');
  if (dynamic && staticPanel && dynamic !== staticPanel) dynamic.remove();
}

document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    sepoNormalizeSmartSearchBindings();
    sepoRemoveDuplicateFactorSummary();
    renderFactorAccumulator();
    syncFormula((document.getElementById('facFormula') || {}).value || '');
    syncReferenceFormula('');
  }, 180);
});


/* Patch 2026-04-01 v3: aislamiento total entre constructor y Smart Search + deduplicación robusta */

window.sepoSmartReferenceFormula = window.sepoSmartReferenceFormula || '';

function ensureFactorSummaryBox() {
  return document.querySelector('.sepo-factor-summary-panel') || null;
}

function syncReferenceFormula(val) {
  const text = String(val || '').trim();
  window.sepoSmartReferenceFormula = text;
  const reference = document.getElementById('formulaTextReference');
  if (reference) reference.textContent = text || '...';
}

function syncFormula(val) {
  const text = String(val || '').trim();
  const facFormula = document.getElementById('facFormula');
  const preview = document.getElementById('formulaTextPreview');
  const panel = document.getElementById('formulaPreviewFinal');
  if (facFormula) facFormula.value = text;
  if (preview) preview.textContent = text || '...';
  if (panel) panel.className = 'sepo-formula-preview';
}

function insertarFormula(txt) {
  const t = document.getElementById('facFormula');
  if (!t) return;
  const current = String(t.value || '').trim();
  const incoming = String(txt || '').replace(/\s+/g, ' ').trim();
  const next = current ? `${current} ${incoming}`.trim() : incoming;
  syncFormula(next);
}

function sepoNormalizeSmartSearchBindings() {
  const box = document.querySelector('.sepo-smart-search-box');
  if (!box) return;

  const clearBtn = document.getElementById('smartFormulaClearBtn') || box.querySelector('.btn-outline-secondary');
  if (clearBtn) {
    clearBtn.removeAttribute('onclick');
    clearBtn.onclick = function (e) {
      if (e) e.preventDefault();
      const input = document.getElementById('smartFormulaSearch');
      if (input) input.value = '';
      box.querySelectorAll('.sepo-template-row').forEach(function (row) {
        row.classList.remove('is-selected');
        row.style.display = '';
      });
      syncReferenceFormula('');
    };
  }

  const rows = box.querySelectorAll('#smartTemplatesBox .sepo-template-row');
  rows.forEach(function (row) {
    const formula = row.dataset.formula || '';
    row.removeAttribute('onclick');
    row.onclick = function (e) {
      if (e) e.preventDefault();
      rows.forEach(function (item) { item.classList.remove('is-selected'); });
      row.classList.add('is-selected');
      syncReferenceFormula(formula);
    };
  });
}

function sepoRemoveDuplicateFactorSummary() {
  const staticPanel = document.querySelector('.sepo-factor-summary-panel');
  const allCandidates = Array.from(document.querySelectorAll('#step-5 .soft-panel, #step-5 .card, #step-5 .panel, #step-5 .box'));
  allCandidates.forEach(function(node){
    if (!node || node === staticPanel) return;
    const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
    if (/Resumen de Factores/i.test(text)) {
      node.remove();
    }
  });
  const dynamic = document.getElementById('sepoFactorSummaryBox');
  if (dynamic && dynamic !== staticPanel) dynamic.remove();
}

function renderFactorAccumulator() {
  sepoRemoveDuplicateFactorSummary();
  const body = document.getElementById('factorSummaryBody');
  const panel = document.querySelector('.sepo-factor-summary-panel');
  if (!body || !panel) return;

  const rows = (window.sepoFactorsData || []).map(function (factor) {
    return {
      code: factor.code || '',
      label: factor.desc || '',
      links: Number(factor.assignments || 0),
      total: Number(factor.total || 0),
      sources: Array.isArray(factor.detail)
        ? factor.detail.map(function (item) {
            return { question: 'Fórmula', item: String(item), value: '' };
          })
        : []
    };
  });

  const useful = rows.filter(function (r) {
    return r && (r.links > 0 || r.label || r.code);
  });

  if (!useful.length) {
    body.innerHTML = '<tr><td colspan="5" class="text-muted small">No hay factores ni asignaciones configuradas todavía.</td></tr>';
    return;
  }

  body.innerHTML = useful.map(function (row) {
    const detail = Array.isArray(row.sources) && row.sources.length
      ? '<div class="sepo-factor-detail-lines">' + row.sources.slice(0, 4).map(function (s) {
          const text = [s.question, s.item].filter(Boolean).join(' · ');
          const suffix = (s.value !== undefined && s.value !== null && String(s.value) !== '') ? (' = ' + s.value) : '';
          return '<span class="sepo-factor-detail-chip">' + text + suffix + '</span>';
        }).join('') + '</div>'
      : '<span class="text-muted small">Sin asignaciones aún</span>';

    return '<tr>' +
      '<td><strong>' + (row.code || '') + '</strong></td>' +
      '<td>' + (row.label || '') + '</td>' +
      '<td>' + Number(row.links || 0) + '</td>' +
      '<td><span class="badge rounded-pill text-bg-light border">' + Number(row.total || 0) + '</span></td>' +
      '<td>' + detail + '</td>' +
      '</tr>';
  }).join('');
}

document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    sepoNormalizeSmartSearchBindings();
    sepoRemoveDuplicateFactorSummary();
    syncFormula((document.getElementById('facFormula') || {}).value || '');
    syncReferenceFormula(window.sepoSmartReferenceFormula || '');
  }, 60);
  setTimeout(function () {
    sepoNormalizeSmartSearchBindings();
    sepoRemoveDuplicateFactorSummary();
  }, 400);
});


/* Patch 2026-04-01 v4: click en Smart Search solo actualiza visualización referencial */
(function(){
  function sepoGetConstructorValue(){
    var t=document.getElementById('facFormula');
    return t ? String(t.value || '') : '';
  }

  function sepoRestoreConstructorValue(value){
    var safe=String(value || '').trim();
    var t=document.getElementById('facFormula');
    var preview=document.getElementById('formulaTextPreview');
    if (t) t.value=safe;
    if (preview) preview.textContent=safe || '...';
  }

  function sepoSelectReferenceRow(row){
    if (!row) return;
    var formula=String(row.getAttribute('data-formula') || row.dataset.formula || '').trim();
    var box=document.getElementById('smartTemplatesBox');
    if (box) {
      box.querySelectorAll('.sepo-template-row').forEach(function(item){
        item.classList.remove('is-selected');
        item.setAttribute('aria-pressed','false');
      });
    }
    row.classList.add('is-selected');
    row.setAttribute('aria-pressed','true');
    if (typeof window.syncReferenceFormula === 'function') {
      window.syncReferenceFormula(formula);
    } else {
      var reference=document.getElementById('formulaTextReference');
      if (reference) reference.textContent=formula || '...';
    }
  }

  function sepoBindSmartSearchIsolation(){
    var box=document.getElementById('smartTemplatesBox');
    if (!box || box.dataset.sepoReferenceBound === '1') return;
    box.dataset.sepoReferenceBound='1';

    box.addEventListener('click', function(e){
      var row=e.target && e.target.closest ? e.target.closest('.sepo-template-row') : null;
      if (!row || !box.contains(row)) return;
      var constructorBefore=sepoGetConstructorValue();
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
      sepoSelectReferenceRow(row);
      setTimeout(function(){ sepoRestoreConstructorValue(constructorBefore); }, 0);
    }, true);

    box.querySelectorAll('.sepo-template-row').forEach(function(row){
      row.setAttribute('role','button');
      row.setAttribute('tabindex','0');
      row.setAttribute('aria-pressed','false');
      row.removeAttribute('onclick');
      row.addEventListener('keydown', function(e){
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          row.click();
        }
      });
    });

    var clearBtn=document.getElementById('smartFormulaClearBtn');
    if (clearBtn && !clearBtn.dataset.sepoReferenceBound) {
      clearBtn.dataset.sepoReferenceBound='1';
      clearBtn.addEventListener('click', function(e){
        var constructorBefore=sepoGetConstructorValue();
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
        var search=document.getElementById('smartFormulaSearch');
        if (search) search.value='';
        box.querySelectorAll('.sepo-template-row').forEach(function(item){
          item.classList.remove('is-selected');
          item.setAttribute('aria-pressed','false');
          item.style.display='';
        });
        if (typeof window.syncReferenceFormula === 'function') {
          window.syncReferenceFormula('');
        } else {
          var reference=document.getElementById('formulaTextReference');
          if (reference) reference.textContent='...';
        }
        setTimeout(function(){ sepoRestoreConstructorValue(constructorBefore); }, 0);
      }, true);
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(sepoBindSmartSearchIsolation, 80);
    setTimeout(sepoBindSmartSearchIsolation, 400);
    setTimeout(sepoBindSmartSearchIsolation, 900);
  });

  window.sepoBindSmartSearchIsolation = sepoBindSmartSearchIsolation;
})();


/* Patch 2026-04-01 v5: Smart Search siempre pinta solo la visualización referencial */
(function(){
  function sepoReferenceEl(){ return document.getElementById('formulaTextReference'); }
  function sepoPreviewEl(){ return document.getElementById('formulaTextPreview'); }
  function sepoFormulaInput(){ return document.getElementById('facFormula'); }

  function sepoGetConstructorFormula(){
    var input = sepoFormulaInput();
    return input ? String(input.value || '').trim() : '';
  }

  function sepoPaintConstructorOnly(text){
    var safe = String(text || '').trim();
    var input = sepoFormulaInput();
    var preview = sepoPreviewEl();
    if (input) input.value = safe;
    if (preview) preview.textContent = safe || '...';
  }

  function sepoGuessReferenceFormula(row){
    if (!row) return '';
    var formula = String(row.getAttribute('data-formula') || row.dataset.formula || '').trim();
    if (formula) return formula;
    var title = (row.querySelector('.fw-bold') || {}).textContent || row.textContent || '';
    title = String(title).trim().toUpperCase();
    if (title.indexOf('SUMAR 2') !== -1) return 'RP1 + RP2';
    if (title.indexOf('PROMEDIO DE 3') !== -1) return '(RP1 + RP2 + RP3) / 3';
    if (title.indexOf('CONDICIONAL SIMPLE') !== -1) return 'SI RP1 > 2 ENTONCES RP2';
    return '';
  }

  function sepoShowReferenceFormula(formula){
    var safe = String(formula || '').trim();
    window.sepoSmartReferenceFormula = safe;
    var ref = sepoReferenceEl();
    if (ref) ref.textContent = safe || '...';
  }

  function sepoSelectReferenceRowOnly(row){
    if (!row) return;
    var box = document.getElementById('smartTemplatesBox');
    if (box) {
      Array.prototype.forEach.call(box.querySelectorAll('.sepo-template-row'), function(item){
        item.classList.remove('is-selected');
        item.setAttribute('aria-pressed', 'false');
      });
    }
    row.classList.add('is-selected');
    row.setAttribute('aria-pressed', 'true');
    sepoShowReferenceFormula(sepoGuessReferenceFormula(row));
  }

  function sepoBindSmartSearchReferenceOnly(){
    var box = document.getElementById('smartTemplatesBox');
    if (!box) return;

    Array.prototype.forEach.call(box.querySelectorAll('.sepo-template-row'), function(row){
      if (!row.dataset.formula) {
        row.dataset.formula = sepoGuessReferenceFormula(row);
      }
      row.setAttribute('role', 'button');
      row.setAttribute('tabindex', '0');
      row.setAttribute('aria-pressed', row.classList.contains('is-selected') ? 'true' : 'false');
      row.onclick = function(e){
        var before = sepoGetConstructorFormula();
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        sepoSelectReferenceRowOnly(row);
        setTimeout(function(){ sepoPaintConstructorOnly(before); }, 0);
        return false;
      };
      row.onkeydown = function(e){
        if (e && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          row.click();
        }
      };
    });

    box.onclick = function(e){
      var row = e && e.target && e.target.closest ? e.target.closest('.sepo-template-row') : null;
      if (!row || !box.contains(row)) return;
      var before = sepoGetConstructorFormula();
      e.preventDefault();
      e.stopPropagation();
      sepoSelectReferenceRowOnly(row);
      setTimeout(function(){ sepoPaintConstructorOnly(before); }, 0);
      return false;
    };

    var clearBtn = document.getElementById('smartFormulaClearBtn');
    if (clearBtn) {
      clearBtn.onclick = function(e){
        var before = sepoGetConstructorFormula();
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        var input = document.getElementById('smartFormulaSearch');
        if (input) input.value = '';
        Array.prototype.forEach.call(box.querySelectorAll('.sepo-template-row'), function(item){
          item.classList.remove('is-selected');
          item.setAttribute('aria-pressed', 'false');
          item.style.display = '';
        });
        sepoShowReferenceFormula('');
        setTimeout(function(){ sepoPaintConstructorOnly(before); }, 0);
        return false;
      };
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(sepoBindSmartSearchReferenceOnly, 50);
    setTimeout(sepoBindSmartSearchReferenceOnly, 250);
    setTimeout(sepoBindSmartSearchReferenceOnly, 800);
  });

  window.sepoBindSmartSearchReferenceOnly = sepoBindSmartSearchReferenceOnly;
})();
