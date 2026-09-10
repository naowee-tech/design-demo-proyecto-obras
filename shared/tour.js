/* ============================================================================
   Proyecto de Obras · Presupuesto — TOUR GUIADO por HU (verificación de HU)
   Capa aditiva: por cada HU muestra TAREA + PROPÓSITO + spotlight de dónde hacer
   clic + "Paso N de M". Lanzador flotante abajo-derecha que lista las HU por
   submódulo; al elegir una, navega a su pantalla+rol y corre los pasos.
   Motor portado de suite-web-territorio v0.8.4. Acento: naranja DS.
   ========================================================================== */
(function () {
  'use strict';
  if (window.__obrasTour) return; window.__obrasTour = true;

  function qs(k) { return new URLSearchParams(location.search).get(k); }
  var ROLE = qs('role') || 'ADMIN';
  var PAGE = (location.pathname.split('/').pop() || '').toLowerCase() || 'index.html';

  // ── Catálogo de tours por HU (Proceso A · Catálogo de Precios, PPTO-01..21) ──
  var TOURS = {
    // 1 · CRUD del Catálogo
    'PPTO-01': { ph: '1 · CRUD del Catálogo', page: 'catalogos.html', role: 'ADMIN',
      title: 'Crear catálogo', purpose: 'Crear un nuevo catálogo de precios con su condición de aplicación (región) y vigencia.',
      steps: [
        { sel: '#btnCrear', body: 'Clic en <b>Crear catálogo</b> para abrir el formulario.', click: true },
        { sel: '#catNombre', body: 'Escribe el <b>nombre del catálogo</b> (obligatorio y único por condición).' },
        { sel: '#catRegion', body: 'Elige la <b>condición de aplicación</b>: la <b>región</b>. Así pueden coexistir varios catálogos activos, uno por región.' },
        { sel: '#mCrear .naowee-modal__footer .naowee-btn--loud', body: 'Clic en <b>Guardar</b>: queda registrado quién lo creó y cuándo, listo para configurar su estructura.' }
      ] },
    'PPTO-02': { ph: '1 · CRUD del Catálogo', page: 'catalogos.html', role: 'ADMIN',
      title: 'Editar catálogo', purpose: 'Actualizar nombre, condición de aplicación o vigencia de un catálogo existente, con traza.',
      steps: [
        { sel: '.t-kebab', body: 'En la fila de un catálogo, abre el menú de <b>acciones</b> (⋮).', click: true },
        { sel: '#rmEdit', body: 'Elige <b>Editar catálogo</b> para abrir sus datos generales.', click: true },
        { sel: '#catNombre, #mCrear', body: 'Modifica <b>nombre, condición o vigencia</b>. El sistema muestra un resumen antes de confirmar.' },
        { sel: '#mCrear .naowee-modal__footer .naowee-btn--loud', body: 'Al guardar, los cambios quedan en el <b>historial</b> del catálogo.' }
      ] },
    'PPTO-03': { ph: '1 · CRUD del Catálogo', page: 'catalogos.html', role: 'ADMIN',
      title: 'Consultar y buscar catálogos', purpose: 'Ver el listado de catálogos con su condición, vigencia, versión y estado; buscar y filtrar.',
      steps: [
        { sel: '#tblSearch', body: '<b>Busca</b> un catálogo por nombre o condición.' },
        { sel: '#fEstado', body: '<b>Filtra</b> por estado (Activo · Borrador · Inactivo) o por condición de aplicación.' },
        { sel: '#docTable', body: 'Cada fila muestra <b>nombre, condición, vigencia, versión activa y estado</b>. Las columnas son <b>ordenables</b> y desde el menú ⋮ se entra al detalle.' }
      ] },
    // 2 · Estructura (niveles de agrupación)
    'PPTO-04': { ph: '2 · Estructura', page: 'catalogo-detalle.html', role: 'ADMIN', catMode: 'vacio',
      title: 'Crear nivel de agrupación', purpose: 'Definir cómo se organiza jerárquicamente el catálogo (capítulos, actividades…).',
      steps: [
        { sel: '[data-tab="estructura"]', body: 'Este catálogo está <b>en blanco</b>: se creó sin estructura base, así que arrancas desde cero. Entra a la pestaña <b>Estructura</b>.', click: true },
        { sel: '#btnNivel', body: 'Clic en <b>Crear nivel</b> para agregar un nivel de agrupación.', click: true },
        { sel: '#nvNombre', body: 'Nombre del nivel, posición jerárquica y descripción. No guarda si el nombre está vacío o repetido.' },
        { sel: '#mNivel .naowee-modal__footer .naowee-btn--loud', body: 'Guarda: el nivel se suma a la estructura del catálogo.' }
      ] },
    'PPTO-05': { ph: '2 · Estructura', page: 'catalogo-detalle.html', role: 'ADMIN', catMode: 'lleno',
      title: 'Editar nivel de agrupación', purpose: 'Ajustar nombre, descripción o posición jerárquica de un nivel.',
      steps: [
        { sel: '[data-tab="estructura"]', body: 'Pestaña <b>Estructura</b>.', click: true },
        { sel: '#panel-estructura .t-kebab', body: 'Abre el menú de <b>acciones</b> (⋮) de un nivel.', click: true },
        { sel: '#rmNivelEdit', body: 'Elige <b>Editar nivel</b> para ajustar su nombre o posición.', click: true },
        { sel: '#mNivel .naowee-modal__footer .naowee-btn--loud', body: 'El sistema muestra un resumen y registra el cambio en el historial.' }
      ] },
    'PPTO-06': { ph: '2 · Estructura', page: 'catalogo-detalle.html', role: 'ADMIN', catMode: 'lleno',
      title: 'Desactivar nivel de agrupación', purpose: 'Retirar un nivel de la estructura sin eliminarlo, preservando la trazabilidad.',
      steps: [
        { sel: '[data-tab="estructura"]', body: 'Pestaña <b>Estructura</b>.', click: true },
        { sel: '#panel-estructura .t-kebab', body: 'Abre el menú de <b>acciones</b> (⋮) del nivel.', click: true },
        { sel: '#rmNivelOff', body: 'Elige <b>Desactivar nivel</b>. Si tiene ítems o valores, el sistema advierte antes.', click: true },
        { sel: '#mMotivo', body: 'La desactivación exige un <b>motivo obligatorio</b>. El nivel deja de aparecer como opción pero queda en la traza.' }
      ] },
    'PPTO-07': { ph: '2 · Estructura', page: 'catalogo-detalle.html', role: 'ADMIN', catMode: 'lleno',
      title: 'Consultar niveles configurados', purpose: 'Revisar la organización jerárquica de la estructura y su estado.',
      steps: [
        { sel: '[data-tab="estructura"]', body: 'Pestaña <b>Estructura</b>.', click: true },
        { sel: '#nivelList', body: 'La <b>jerarquía</b> se muestra de forma visual, con estado y fecha. Se puede filtrar por activo/inactivo.' }
      ] },
    // 3 · Valor y Ítems
    'PPTO-08': { ph: '3 · Valor y Ítems', page: 'catalogo-detalle.html', role: 'ADMIN', catMode: 'lleno',
      title: 'Configurar valor o fórmula en un nivel', purpose: 'Definir si un nivel lleva valor fijo o una fórmula de cálculo (ej. suma de ítems).',
      steps: [
        { sel: '[data-tab="estructura"]', body: 'Pestaña <b>Estructura</b>.', click: true },
        { sel: '#panel-estructura .t-kebab', body: 'Abre el menú de <b>acciones</b> (⋮) del nivel.', click: true },
        { sel: '#rmNivelEdit', body: 'Elige <b>Editar nivel</b>.', click: true },
        { sel: '#nvValorTipo', body: 'Elige si el nivel lleva <b>valor fijo</b> o <b>fórmula</b>. Si es fórmula, se define la expresión y el sistema la valida.' },
        { sel: '#nvFormula, #nvValorFijo', body: 'Aquí se ingresa el <b>valor</b> o se define la <b>fórmula</b> (ej. SUMA de los ítems del nivel).' }
      ] },
    'PPTO-09': { ph: '3 · Valor y Ítems', page: 'catalogo-detalle.html', role: 'ADMIN', catMode: 'lleno',
      title: 'Definir que un nivel admite ítems', purpose: 'Habilitar qué niveles pueden tener ítems (productos/servicios) asociados.',
      steps: [
        { sel: '[data-tab="estructura"]', body: 'Pestaña <b>Estructura</b>.', click: true },
        { sel: '#panel-estructura .t-kebab', body: 'Abre el menú de <b>acciones</b> (⋮) del nivel.', click: true },
        { sel: '#rmNivelEdit', body: 'Elige <b>Editar nivel</b>.', click: true },
        { sel: '#nvAdmiteItems', body: 'Activa <b>Admite ítems</b>. Varios niveles pueden admitirlos a la vez.' },
        { sel: '#nvCampos', body: 'Al habilitarlo se configuran los <b>campos (columnas)</b> que tendrá cada ítem de este nivel: código, ítem, unidad, cantidad, valor unitario…' },
        { sel: '#nvAddBtn', body: 'Con <b>Agregar campo</b> se añaden columnas propias del nivel (texto, número o moneda). La tabla de ítems y la plantilla de carga se ajustan solas.' }
      ] },
    'PPTO-10': { ph: '3 · Valor y Ítems', page: 'catalogo-detalle.html', role: 'ADMIN', catMode: 'lleno',
      title: 'Crear ítem en un nivel', purpose: 'Agregar un ítem (con o sin fórmula) al catálogo; el sistema calcula su valor.',
      steps: [
        { sel: '[data-tab="items"]', body: 'Entra a la pestaña <b>Ítems</b>.', click: true },
        { sel: '#btnItem', body: 'Clic en <b>Crear ítem</b>.', click: true },
        { sel: '#itNombre', body: 'Diligencia código, nombre, unidad y valor. Puedes asignarle o no una <b>fórmula</b>.' },
        { sel: '#mItem .naowee-modal__footer .naowee-btn--loud', body: 'El sistema <b>calcula el valor</b> del ítem y no guarda si faltan campos obligatorios.' }
      ] },
    'PPTO-11': { ph: '3 · Valor y Ítems', page: 'catalogo-detalle.html', role: 'ADMIN', catMode: 'lleno',
      title: 'Editar ítem', purpose: 'Actualizar precios, unidades u otros campos; el sistema recalcula lo impactado.',
      steps: [
        { sel: '[data-tab="items"]', body: 'Pestaña <b>Ítems</b>.', click: true },
        { sel: '#panel-items .t-kebab', body: 'Abre el menú de <b>acciones</b> (⋮) del ítem.', click: true },
        { sel: '#rmItemEdit', body: 'Elige <b>Editar ítem</b>.', click: true },
        { sel: '#mItem .naowee-modal__footer .naowee-btn--loud', body: 'Al modificar, el sistema <b>recalcula</b> y registra el cambio en el historial del ítem.' }
      ] },
    // 4 · Carga Masiva
    'PPTO-12': { ph: '4 · Carga Masiva', page: 'catalogo-detalle.html', role: 'ADMIN', catMode: 'lleno',
      title: 'Descargar plantilla de carga masiva', purpose: 'Obtener la plantilla vigente con las columnas del catálogo, versionada.',
      steps: [
        { sel: '[data-tab="carga"]', body: 'Entra a la pestaña <b>Carga masiva</b>.', click: true },
        { sel: '#btnPlantilla', body: 'Descarga la <b>plantilla vigente</b> (.xlsx). Trae las columnas de los ítems del catálogo y está <b>versionada</b>.' }
      ] },
    'PPTO-13': { ph: '4 · Carga Masiva', page: 'catalogo-detalle.html', role: 'ADMIN', catMode: 'lleno',
      title: 'Cargar archivo masivo de ítems', purpose: 'Ingresar múltiples ítems desde un archivo, con validación y vista previa.',
      steps: [
        { sel: '[data-tab="carga"]', body: 'Pestaña <b>Carga masiva</b>.', click: true },
        { sel: '#cargaDrop', body: 'Arrastra o selecciona el archivo. El sistema valida que corresponda a la <b>versión vigente</b> de la plantilla.' },
        { sel: '#cargaPrev', body: 'Muestra una <b>vista previa</b> de los ítems detectados antes de confirmar la carga.' }
      ] },
    'PPTO-14': { ph: '4 · Carga Masiva', page: 'catalogo-detalle.html', role: 'ADMIN', catMode: 'lleno',
      title: 'Visualizar resultado de la carga', purpose: 'Ver qué ítems se procesaron y cuáles fallaron con su motivo.',
      steps: [
        { sel: '[data-tab="carga"]', body: 'Pestaña <b>Carga masiva</b>.', click: true },
        { sel: '#cargaResult', body: 'Resumen: <b>detectados, procesados y fallidos</b>. Cada fallido muestra el <b>motivo</b>; el reporte se puede descargar.' }
      ] },
    // 5 · Versionamiento
    'PPTO-15': { ph: '5 · Versionamiento', page: 'catalogo-detalle.html', role: 'ADMIN', catMode: 'lleno',
      title: 'Crear nueva versión del catálogo', purpose: 'Aplicar cambios de precios/estructura sin afectar presupuestos ya creados.',
      steps: [
        { sel: '[data-tab="versiones"]', body: 'Entra a la pestaña <b>Versiones</b>.', click: true },
        { sel: '#btnVersion', body: 'Clic en <b>Crear versión</b>.', click: true },
        { sel: '#verMotivo', body: 'Escribe el <b>motivo del cambio</b>. La nueva versión nace de la actual; la anterior queda como <b>Histórica</b>.' },
        { sel: '#mVersion .naowee-modal__footer .naowee-btn--loud', body: 'Al confirmar, se genera la nueva versión activa.' }
      ] },
    'PPTO-16': { ph: '5 · Versionamiento', page: 'catalogo-detalle.html', role: 'ADMIN', catMode: 'lleno',
      title: 'Consultar historial de versiones', purpose: 'Revisar cómo evolucionó el contenido y los precios del catálogo.',
      steps: [
        { sel: '[data-tab="versiones"]', body: 'Pestaña <b>Versiones</b>.', click: true },
        { sel: '#verHist', body: 'El <b>historial</b> lista cada versión con número, motivo, autor y fecha. Se puede abrir una versión histórica en solo lectura.' }
      ] },
    // 6 · Consulta (lectura, Usuario autorizado)
    'PPTO-17': { ph: '6 · Consulta (lectura)', page: 'consulta.html', role: 'USUARIO',
      title: 'Consultar catálogo (usuario autorizado)', purpose: 'Ver el catálogo vigente organizado por su jerarquía, en solo lectura.',
      steps: [
        { sel: '#catTree', body: 'El catálogo se muestra por su <b>estructura jerárquica</b>. Cada nivel se <b>expande/colapsa</b> y muestra su total calculado.' }
      ] },
    'PPTO-18': { ph: '6 · Consulta (lectura)', page: 'consulta.html', role: 'USUARIO',
      title: 'Buscar y filtrar ítems dentro del catálogo', purpose: 'Encontrar rápidamente un producto/servicio sin recorrer toda la estructura.',
      steps: [
        { sel: '#itemSearch', body: '<b>Busca</b> un ítem por código o nombre.' },
        { sel: '#itemFiltro', body: '<b>Filtra</b> por tipo. El resultado muestra nivel, código, nombre, unidad, cantidad, valor unitario y total.' }
      ] },
    // 7 · Auditoría
    'PPTO-19': { ph: '7 · Auditoría', page: 'catalogo-detalle.html', role: 'ADMIN', catMode: 'lleno',
      title: 'Consultar historial de cambios del catálogo', purpose: 'Trazabilidad ante auditorías y procesos legales: toda acción sobre catálogo, niveles e ítems.',
      steps: [
        { sel: '[data-tab="auditoria"]', body: 'Entra a la pestaña <b>Auditoría</b>.', click: true },
        { sel: '#audTable', body: 'Cada entrada muestra <b>acción, elemento afectado, responsable y fecha/hora</b>. Es de solo lectura y no se puede modificar.' }
      ] },
    'PPTO-20': { ph: '7 · Auditoría', page: 'catalogo-detalle.html', role: 'ADMIN', catMode: 'lleno',
      title: 'Filtrar historial por acción, elemento y fecha', purpose: 'Ubicar rápidamente un cambio específico.',
      steps: [
        { sel: '[data-tab="auditoria"]', body: 'Pestaña <b>Auditoría</b>.', click: true },
        { sel: '#audAccion', body: 'Filtros combinables por <b>acción</b>, elemento afectado y responsable…' },
        { sel: '#audFecha', body: '…y por <b>rango de fechas</b>. El historial se actualiza al instante e indica cuántos resultados hay.' }
      ] },
    'PPTO-21': { ph: '7 · Auditoría', page: 'catalogo-detalle.html', role: 'ADMIN', catMode: 'lleno',
      title: 'Exportar historial de auditoría', purpose: 'Usar la traza en reportes externos, auditorías o procesos legales.',
      steps: [
        { sel: '[data-tab="auditoria"]', body: 'Pestaña <b>Auditoría</b>.', click: true },
        { sel: '#btnExport', body: 'Exporta el historial visible (con o sin filtros) en <b>Excel o PDF</b>. El archivo incluye todos los campos y la fecha de generación.' }
      ] }
  };
  var ORDER = ['PPTO-01','PPTO-02','PPTO-03','PPTO-04','PPTO-05','PPTO-06','PPTO-07','PPTO-08','PPTO-09','PPTO-10','PPTO-11','PPTO-12','PPTO-13','PPTO-14','PPTO-15','PPTO-16','PPTO-17','PPTO-18','PPTO-19','PPTO-20','PPTO-21'];

  // ── Estado ──
  var curHab = null, curStep = 0, _retry = null, _stepActed = false, _curEl = null, _curSel = null, _remeasure = null;
  function scrollHost(el) {
    var p = el.parentElement;
    while (p && p !== document.body) {
      var st = getComputedStyle(p).overflowY;
      if ((st === 'auto' || st === 'scroll') && p.scrollHeight > p.clientHeight + 4) return p;
      p = p.parentElement;
    }
    return null;
  }
  function openOverlays() {
    return [].filter.call(document.querySelectorAll('.naowee-modal-overlay'), function (o) { return o.classList.contains('open'); });
  }
  function closeOverlays(keep) {
    openOverlays().forEach(function (o) { if (o !== keep) o.classList.remove('open'); });
    if (!openOverlays().length) { try { document.body.style.overflow = ''; } catch (e) {} }
  }
  function overlayOf(el) { return el && el.closest ? el.closest('.naowee-modal-overlay') : null; }
  function bringIntoView(el) {
    var host = scrollHost(el);
    if (host) {
      var hr = host.getBoundingClientRect(), er = el.getBoundingClientRect();
      host.scrollTop += (er.top - hr.top) - (host.clientHeight / 2 - er.height / 2);
    } else { try { el.scrollIntoView({ block: 'center', behavior: 'auto' }); } catch (e) {} }
  }

  // ── CSS (acento naranja DS) ──
  function injectCSS() {
    if (document.getElementById('obrasTourCSS')) return;
    var ACC = 'var(--naowee-color-interactive-fill-loud-idle,#d74009)';
    var ACC_BG = 'var(--naowee-color-orange-100,#fdece3)';
    var ACC_TX = 'var(--naowee-color-orange-800,#9a3412)';
    var NAVY = 'var(--naowee-color-dark-blue-800,#12263f)';
    var st = document.createElement('style'); st.id = 'obrasTourCSS';
    st.textContent =
      '.tt-spot{position:fixed;border-radius:12px;box-shadow:0 0 0 9999px rgba(15,25,40,.55);z-index:9000;pointer-events:none;transition:top .25s,left .25s,width .25s,height .25s;border:2px solid ' + ACC + ';}' +
      '.tt-backdrop{position:fixed;inset:0;background:rgba(15,25,40,.55);z-index:8999;pointer-events:none;display:none;}' +
      '.tt-coach{position:fixed;z-index:9002;width:344px;max-width:calc(100vw - 28px);background:#fff;border-radius:16px;box-shadow:0 24px 60px -16px rgba(16,30,50,.45);pointer-events:auto;overflow:hidden;font-family:Inter,-apple-system,sans-serif;}' +
      '.tt-coach-h{display:flex;align-items:center;gap:8px;padding:13px 16px 0;}' +
      '.tt-chip{font-size:10px;font-weight:800;letter-spacing:.05em;color:' + ACC_TX + ';background:' + ACC_BG + ';padding:3px 9px;border-radius:999px;text-transform:uppercase;}' +
      '.tt-phase{font-size:10.5px;font-weight:600;color:#9aa3af;}' +
      '.tt-x{margin-left:auto;background:none;border:0;cursor:pointer;color:#9aa3af;font-size:20px;line-height:1;padding:2px 4px;}' +
      '.tt-x:hover{color:#1b2330;}' +
      '.tt-title{font-size:16px;font-weight:800;color:' + NAVY + ';padding:8px 16px 0;letter-spacing:-.2px;}' +
      '.tt-purpose{font-size:12px;color:#6b7480;padding:4px 16px 0;line-height:1.45;}' +
      '.tt-body{font-size:13.5px;color:#1b2330;padding:12px 16px 0;line-height:1.5;}' +
      '.tt-body b{color:' + ACC_TX + ';}' +
      '.tt-f{display:flex;align-items:center;gap:8px;padding:14px 16px 16px;margin-top:8px;}' +
      '.tt-count{font-size:11.5px;font-weight:700;color:#9aa3af;}' +
      '.tt-of{font-weight:800;color:' + ACC + ';}' +
      '.tt-btns{margin-left:auto;display:flex;gap:8px;}' +
      '.tt-btn{font-family:inherit;font-size:12.5px;font-weight:700;border-radius:10px;padding:8px 15px;cursor:pointer;color:' + NAVY + ';background:#fff;border:1px solid rgba(20,28,46,.14);transition:background .14s,border-color .14s;}' +
      '.tt-btn:hover{background:#f4f5f7;border-color:rgba(20,28,46,.22);}' +
      '.tt-btn--p{color:#fff;border:1px solid transparent;background:' + ACC + ';box-shadow:0 6px 16px -6px rgba(215,64,9,.5);}' +
      '.tt-btn--p:hover{background:' + ACC + ';box-shadow:0 10px 24px -6px rgba(215,64,9,.6);opacity:1;}' +
      '.tt-launch{position:fixed;right:18px;left:auto;bottom:18px;z-index:8000;display:flex;align-items:center;gap:8px;background:' + NAVY + ';border:1px solid rgba(255,255,255,.08);border-radius:999px;padding:10px 16px;font-family:Inter,sans-serif;font-size:12.5px;font-weight:700;color:#fff;cursor:pointer;box-shadow:0 10px 30px -10px rgba(16,30,50,.5);}' +
      '.tt-launch:hover{box-shadow:0 14px 36px -10px rgba(16,30,50,.6);}' +
      '.tt-launch svg{color:' + 'var(--naowee-color-orange-400,#fb923c)' + ';}' +
      '.tt-panel{position:fixed;right:18px;left:auto;bottom:64px;z-index:8001;width:320px;max-height:74vh;overflow:auto;background:#fff;border:1px solid rgba(20,28,46,.12);border-radius:16px;box-shadow:0 20px 50px -14px rgba(16,30,50,.4);padding:8px;display:none;font-family:Inter,sans-serif;}' +
      '.tt-panel.open{display:block;}' +
      '.tt-panel-h{font-size:12.5px;font-weight:800;color:' + NAVY + ';padding:8px 10px 2px;}' +
      '.tt-panel-sub{font-size:11px;color:#6b7480;padding:0 10px 8px;line-height:1.4;}' +
      '.tt-grp{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#9aa3af;padding:12px 10px 4px;}' +
      '.tt-item{width:100%;display:flex;align-items:center;gap:9px;background:none;border:0;cursor:pointer;padding:8px 10px;border-radius:9px;text-align:left;font-family:inherit;}' +
      '.tt-item:hover{background:' + ACC_BG + ';}' +
      '.tt-item-code{font-size:9.5px;font-weight:800;color:' + ACC_TX + ';background:' + ACC_BG + ';border-radius:6px;padding:3px 6px;flex-shrink:0;min-width:60px;text-align:center;}' +
      '.tt-item-t{font-size:12.5px;font-weight:600;color:#1b2330;}' +
      '@media (prefers-reduced-motion:reduce){.tt-spot{transition:none;}}' +
      '@media (max-width:768px){.tt-coach{left:50%!important;transform:translateX(-50%);bottom:14px!important;top:auto!important;}}';
    document.head.appendChild(st);
  }

  // ── Lanzador + panel (índice de HU por submódulo) ──
  function renderLauncher() {
    if (document.getElementById('ttLaunch')) return;
    var b = document.createElement('button'); b.id = 'ttLaunch'; b.className = 'tt-launch';
    b.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M14.5 9.5L11 11l-1.5 3.5L13 13z"/></svg>Recorrido HU';
    b.onclick = function (e) { e.stopPropagation(); togglePanel(); };
    var p = document.createElement('div'); p.id = 'ttPanel'; p.className = 'tt-panel';
    var groups = {};
    ORDER.forEach(function (h) { var t = TOURS[h]; (groups[t.ph] = groups[t.ph] || []).push(h); });
    var html = '<div class="tt-panel-h">Recorrido guiado por HU</div>' +
      '<div class="tt-panel-sub">Proceso A · Catálogo de Precios (21 HU). Cada paso indica la tarea, el propósito y dónde hacer clic.</div>';
    Object.keys(groups).forEach(function (ph) {
      html += '<div class="tt-grp">' + ph + '</div>';
      groups[ph].forEach(function (h) {
        var t = TOURS[h];
        html += '<button class="tt-item" data-hab="' + h + '"><span class="tt-item-code">' + h + '</span><span class="tt-item-t">' + t.title + '</span></button>';
      });
    });
    p.innerHTML = html;
    document.body.appendChild(b); document.body.appendChild(p);
    p.querySelectorAll('.tt-item').forEach(function (it) {
      it.onclick = function (e) { e.stopPropagation(); togglePanel(false); start(it.dataset.hab); };
    });
    document.addEventListener('click', function (e) {
      var pan = document.getElementById('ttPanel');
      if (pan && pan.classList.contains('open') && !pan.contains(e.target) && e.target.id !== 'ttLaunch' && !(e.target.closest && e.target.closest('#ttLaunch'))) pan.classList.remove('open');
    });
  }
  function togglePanel(force) {
    var p = document.getElementById('ttPanel'); if (!p) return;
    if (force === false) p.classList.remove('open'); else p.classList.toggle('open');
  }

  // ── Arranque de un tour (navega si hace falta: otra pantalla u otro rol) ──
  function runTour(hab) {
    var t = TOURS[hab]; if (!t) return;
    closeOverlays(null);
    curHab = hab; curStep = 0; _stepActed = false; renderStep();
  }
  // Algunas HU solo se entienden sobre un catálogo en blanco (crear el primer nivel).
  // catMode: 'vacio' apunta el recorrido al catálogo sin estructura; 'lleno' a uno con datos.
  function catParaModo(modo) {
    var D = window.OBRAS; if (!D || !modo) return null;
    var list = D.listCatalogos() || [];
    var match = list.filter(function (c) {
      return modo === 'vacio' ? !(c.niveles || []).length : (c.niveles || []).length > 0;
    })[0];
    return match ? match.id : null;
  }
  function start(hab) {
    var t = TOURS[hab]; if (!t) return;
    var destino = catParaModo(t.catMode);
    var actual = qs('cat');
    if (PAGE !== t.page || t.role !== ROLE || (destino && destino !== actual)) {
      var p = new URLSearchParams(location.search);
      p.set('role', t.role); p.set('tour', hab);
      if (destino) p.set('cat', destino);
      location.href = t.page + '?' + p.toString();
      return;
    }
    runTour(hab);
  }

  // ── Render de un paso (con reintento para targets dentro de modales) ──
  function findTarget(sel) {
    var els = sel.split(',').map(function (s) { return s.trim(); });
    for (var i = 0; i < els.length; i++) {
      var el = document.querySelector(els[i]);
      if (el && el.offsetParent !== null) return el;
    }
    return null;
  }
  function renderStep() {
    var t = TOURS[curHab]; if (!t) return; var step = t.steps[curStep];
    clearTimeout(_retry); clearTimeout(_remeasure);
    _curSel = step.center ? null : (step.sel || null);
    if (step.center || !step.sel) { paint(t, step, null); return; }
    var tries = 0;
    (function locate() {
      var el = findTarget(step.sel);
      if (el || tries > 12) { paint(t, step, el); return; }
      tries++; _retry = setTimeout(locate, 110);
    })();
  }
  function paint(t, step, el) {
    var spot = document.getElementById('ttSpot') || mk('div', 'tt-spot', 'ttSpot');
    var coach = document.getElementById('ttCoach') || mk('div', 'tt-coach', 'ttCoach');
    var backdrop = document.getElementById('ttBackdrop') || mk('div', 'tt-backdrop', 'ttBackdrop');
    var last = curStep === t.steps.length - 1;
    var _i = ORDER.indexOf(curHab), _nextHab = (_i >= 0 && _i < ORDER.length - 1) ? ORDER[_i + 1] : null;
    _curEl = step.center ? null : (el || null);
    closeOverlays(overlayOf(_curEl));
    if (_curEl) {
      backdrop.style.display = 'none';
      bringIntoView(_curEl);
      placeSpot(spot, _curEl);
      _remeasure = setTimeout(function () { reposition(); }, 260);
      if (step.click) { _curEl.addEventListener('click', function onc() { _stepActed = true; }, { once: true }); }
    } else {
      spot.style.display = 'none';
      backdrop.style.display = 'block';
    }
    coach.innerHTML =
      '<div class="tt-coach-h"><span class="tt-chip">' + curHab + '</span><span class="tt-phase">' + t.ph + '</span><button class="tt-x" aria-label="Cerrar">&times;</button></div>' +
      '<div class="tt-title">' + t.title + '</div>' +
      '<div class="tt-purpose">' + t.purpose + '</div>' +
      '<div class="tt-body">' + step.body + '</div>' +
      '<div class="tt-f"><span class="tt-count">Paso ' + (curStep + 1) + ' de ' + t.steps.length +
      (_i >= 0 ? '<span class="tt-of"> · ' + (_i + 1) + '/' + ORDER.length + '</span>' : '') + '</span>' +
      '<div class="tt-btns">' +
      (curStep > 0 ? '<button class="tt-btn" data-a="prev">Anterior</button>' : '') +
      (last
        ? (_nextHab
            ? '<button class="tt-btn" data-a="done">Cerrar</button><button class="tt-btn tt-btn--p" data-a="nexthab" title="' + _nextHab + ' · ' + (TOURS[_nextHab] ? TOURS[_nextHab].title : '') + '">Siguiente: ' + _nextHab + ' &rarr;</button>'
            : '<button class="tt-btn tt-btn--p" data-a="done">Finalizar</button>')
        : '<button class="tt-btn tt-btn--p" data-a="next">Siguiente</button>') +
      '</div></div>';
    positionCoach(coach, el);
    coach.querySelector('.tt-x').onclick = endTour;
    coach.querySelectorAll('[data-a]').forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        var a = btn.dataset.a;
        if (a === 'prev') { _stepActed = false; curStep = Math.max(0, curStep - 1); renderStep(); return; }
        if (a === 'done') { endTour(); return; }
        if (a === 'nexthab') { var nh = _nextHab; endTour(); start(nh); return; }
        var step = t.steps[curStep];
        if (step.click && !_stepActed) {
          var el = findTarget(step.sel);
          if (el) { _stepActed = true; try { el.click(); } catch (e) {} setTimeout(function () { _stepActed = false; curStep = Math.min(t.steps.length - 1, curStep + 1); renderStep(); }, 400); return; }
        }
        _stepActed = false; curStep = Math.min(t.steps.length - 1, curStep + 1); renderStep();
      };
    });
  }
  function placeSpot(spot, el) {
    var box = el.closest('.naowee-searchbox__input-wrap, .naowee-searchbox, .naowee-textfield__input-wrap, .naowee-textfield, .naowee-dropdown') || el;
    var r = box.getBoundingClientRect(), pad = 4;
    var br = getComputedStyle(box).borderTopLeftRadius || '8px', radius;
    if (br.indexOf('%') >= 0) radius = '50%';
    else { var n = parseFloat(br) || 0; radius = (n > 0 ? n + pad : 8) + 'px'; }
    spot.style.display = 'block';
    spot.style.top = (r.top - pad) + 'px';
    spot.style.left = (r.left - pad) + 'px';
    spot.style.width = (r.width + pad * 2) + 'px';
    spot.style.height = (r.height + pad * 2) + 'px';
    spot.style.borderRadius = radius;
  }
  function reposition() {
    if (!curHab) return;
    var coach = document.getElementById('ttCoach'), spot = document.getElementById('ttSpot');
    if (!coach) return;
    if (_curSel) { var fresh = findTarget(_curSel); if (fresh) _curEl = fresh; }
    if (_curEl && document.body.contains(_curEl) && _curEl.offsetParent !== null) {
      if (spot) placeSpot(spot, _curEl);
      positionCoach(coach, _curEl);
    } else if (spot) { spot.style.display = 'none'; positionCoach(coach, null); }
  }
  function positionCoach(coach, el) {
    coach.style.display = 'block';
    var cw = 344, ch = coach.offsetHeight || 240, m = 14, top, left;
    if (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom + ch + m < window.innerHeight) top = r.bottom + m;
      else if (r.top - ch - m > 0) top = r.top - ch - m;
      else top = Math.max(m, (window.innerHeight - ch) / 2);
      left = Math.min(Math.max(m, r.left), window.innerWidth - cw - m);
    } else { top = (window.innerHeight - ch) / 2; left = (window.innerWidth - cw) / 2; }
    coach.style.top = top + 'px'; coach.style.left = left + 'px';
  }
  function mk(tag, cls, id) { var e = document.createElement(tag); e.className = cls; e.id = id; document.body.appendChild(e); return e; }
  function endTour() {
    clearTimeout(_retry); clearTimeout(_remeasure);
    closeOverlays(null);
    curHab = null; _curEl = null; _curSel = null;
    ['ttSpot', 'ttCoach', 'ttBackdrop'].forEach(function (id) { var e = document.getElementById(id); if (e) e.remove(); });
    if (qs('tour')) { var u = new URL(location.href); u.searchParams.delete('tour'); history.replaceState(null, '', u); }
  }
  window.addEventListener('resize', reposition);
  window.addEventListener('scroll', reposition, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && curHab) endTour(); });

  // ── Boot ──
  function boot() {
    injectCSS(); renderLauncher();
    // Pasa por start() (no runTour) para que un enlace profundo con ?tour= se
    // autocorrija: navega a la pantalla, el rol y el catálogo que la HU necesita.
    var auto = qs('tour');
    if (auto && TOURS[auto]) setTimeout(function () { start(auto); }, 500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
