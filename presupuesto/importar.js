/* ============================================================================
 * Proyecto de Obras · v0.7 — Importar matriz (docs/rediseno V5 · HU12, HU13, HU14)
 *
 * Flujo a pantalla completa: Archivo · Ajustes · Diagnóstico · Carga · Resultado.
 * Diseñado para el endpoint como está (import-apu-excel):
 *  - va de a UN departamento por vez (todas juntas lo cuelgan) y cada uno tarda cerca de
 *    una hora con la matriz completa;
 *  - la carga se vive DENTRO del flujo (decisión de Jorge, 22-sep: nada en segundo
 *    plano). Si se cierra la ventana o el servidor falla, se retoma desde el
 *    departamento pendiente: el endpoint es upsert, repetir uno no duplica;
 *  - nunca borra: "actualizar" suma y reemplaza; "versión nueva" parte de cero.
 * La demo simula el tiempo: cada departamento corre en segundos, pero muestra el
 * tiempo real estimado (≈ 1 h por cada 1.981 filas, medido en el backend).
 * ========================================================================== */
(function () {
  'use strict';
  var D = window.OBRAS, U = window.OBRAS_UI, R = window.RD, M = window.MATRIZ, esc = R.esc, ic = R.ic;
  var catId = R.qs('cat') || 'cat-general';
  if (!D.getCatalogo(catId)) catId = D.listCatalogos()[0].id;
  var PASOS = ['Archivo', 'Ajustes', 'Diagnóstico', 'Carga', 'Resultado'];
  var DEMO_MS = 4200;   // duración simulada de un departamento

  // Estado en memoria del flujo. El libro (filas) solo vive aquí; lo que se persiste para
  // retomar es la cola (sin filas): con el archivo de ejemplo se regenera, con uno propio
  // se pide volver a elegirlo.
  var S = { paso: 0, libro: null, analisis: null, modo: 'actualizar', hojas: [], mapeo: {}, error: null, timer: null };

  function cat() { return D.getCatalogo(catId); }
  function destinoTxt(c) {
    var p = D.preparacion(c), v = D.vigente(c);
    if (S.modo === 'nueva') return p ? p.v + ' (desde cero)' : sigV(c) + ' (desde cero)';
    return p ? p.v + ' en preparación' : sigV(c) + ' (desde la ' + (v ? v.v : '—') + ')';
  }
  function sigV(c) { var mx = c.versiones.map(function (v) { return v.v.replace('v', '').split('.').map(Number); }).sort(function (a, b) { return b[0] - a[0] || b[1] - a[1]; })[0]; return 'v' + mx[0] + '.' + (mx[1] + 1); }
  function fmtMin(m) { m = Math.max(0, Math.round(m)); return m >= 60 ? Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : '') : m + ' min'; }

  // ════════════ Chrome ════════════
  function chrome() {
    var c = cat();
    document.getElementById('impCat').textContent = c.nombre + ' · destino: ' + destinoTxt(c);
    document.getElementById('impArchivo').innerHTML = S.libro ? ic('file') + ' <b>' + esc(S.libro.archivo) + '</b> · ' + S.libro.hojas.length + ' hojas' : '';
    document.getElementById('impSteps').innerHTML = PASOS.map(function (p, i) {
      var done = i < S.paso, act = i === S.paso;
      return (i ? '<div class="naowee-stepper__connector' + (i <= S.paso ? ' naowee-stepper__connector--done' : '') + '"></div>' : '') +
        '<div class="naowee-stepper__step' + (done ? ' naowee-stepper__step--done' : '') + (act ? ' naowee-stepper__step--active' : '') + '"' + (act ? ' aria-current="step"' : '') + '><span class="naowee-stepper__number">' + (done ? ic('check', 14) : i + 1) + '</span><span class="naowee-stepper__label">' + p + '</span></div>';
    }).join('');
    var salir = document.getElementById('impSalir');
    salir.href = R.href('catalogo-detalle.html', { cat: catId });
  }
  function foot(html) { document.getElementById('impFoot').innerHTML = html; }
  function body(html) { document.getElementById('impBody').innerHTML = html; window.scrollTo(0, 0); }
  function ir(p) { S.paso = p; render(); }

  function render() {
    chrome();
    [pasoArchivo, pasoAjustes, pasoDiagnostico, pasoCarga, pasoResultado][S.paso]();
  }

  // ════════════ 1 · Archivo ════════════
  function pasoArchivo() {
    var c = cat(), hist = c.importaciones || [];
    body('<div class="rd-cols"><div class="rd-card">' +
      '<h2 class="rd-h2">Elige el libro de la matriz</h2><p class="rd-sub">Excel con una hoja <b>APU &lt;Departamento&gt;</b> por departamento. Antes de cargar nada, se revisa y se ajusta.</p>' +
      '<label class="rd-drop" id="impDrop" for="impFile" tabindex="0" style="margin-top:14px">' + ic('upload', 30) + '<b>Arrastra el archivo aquí o haz clic para elegirlo</b><span class="rd-muted" style="font-size:12.5px">.xlsx o .xls · se lee en este navegador</span></label>' +
      (S.error ? '<div class="naowee-message naowee-message--negative" id="impError" role="alert" style="margin-top:12px"><div class="naowee-message__header"><span class="naowee-message__icon">' + ic('x', 16, ' stroke="#fff"') + '</span><div class="naowee-message__body">' + esc(S.error) + '</div></div></div>' : '') +
      '<div class="rd-row" style="margin-top:14px"><button class="naowee-btn naowee-btn--mute" id="impEjemplo">' + ic('file') + 'Usar el archivo de ejemplo</button><span class="rd-sub">7 departamentos, con los errores típicos de una matriz real.</span></div>' +
      '</div><div><div class="rd-card"><h3 class="rd-h3">Cómo debe venir</h3><ul class="rd-sub" style="margin:8px 0 0 16px;padding:0;line-height:1.7">' +
      '<li>Una hoja por departamento, llamada <b>APU</b> y el nombre exacto del departamento.</li><li>Encabezados: ' + D.COLUMNAS.map(function (x) { return '<code>' + x + '</code>'; }).join(' ') + '.</li>' +
      '<li>Las filas en orden: capítulo, sus APU y los insumos de cada APU debajo.</li><li>El archivo nunca borra: lo que no venga se queda como está.</li></ul>' +
      '<button class="naowee-btn naowee-btn--mute naowee-btn--small" id="impPlantilla" style="margin-top:12px">' + ic('download') + 'Descargar plantilla (' + c.alcance.deptos.length + ' hojas)</button></div>' +
      '<div class="rd-card" id="impHist"><h3 class="rd-h3">Importaciones anteriores</h3>' + (hist.length ? '<ul class="rd-queue" style="margin-top:6px">' + hist.slice(0, 5).map(function (h, i) {
        var ok = h.deptos.filter(function (d) { return d.estado === 'ok'; }).length;
        return '<li><span class="rd-q-n">' + ic('file', 12) + '</span><div class="rd-grow"><div class="rd-q-t">' + esc(h.archivo) + '</div><div class="rd-q-d">' + D.fmtFecha(h.fecha) + ' ' + esc(h.hora) + ' · ' + esc(h.usuario) + ' · ' + ok + ' de ' + h.deptos.length + ' departamentos · ' + esc(h.destino) + '</div></div><button class="naowee-btn naowee-btn--mute naowee-btn--small" data-rep="' + i + '">Reporte</button></li>';
      }).join('') + '</ul>' : '<p class="rd-sub">Aún no hay importaciones en este catálogo.</p>') + '</div></div></div>');
    foot('<a class="naowee-btn naowee-btn--mute" href="' + R.href('catalogo-detalle.html', { cat: catId }) + '">' + ic('back') + 'Volver al catálogo</a>');
    var drop = document.getElementById('impDrop'), fi = document.getElementById('impFile');
    fi.value = '';
    fi.onchange = function () { if (fi.files[0]) cargarArchivo(fi.files[0]); };
    drop.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fi.click(); } };
    drop.ondragover = function (e) { e.preventDefault(); drop.classList.add('over'); };
    drop.ondragleave = function () { drop.classList.remove('over'); };
    drop.ondrop = function (e) { e.preventDefault(); drop.classList.remove('over'); if (e.dataTransfer.files[0]) cargarArchivo(e.dataTransfer.files[0]); };
    document.getElementById('impEjemplo').onclick = function () { usarLibro(M.ejemplo(cat())); };
    document.getElementById('impPlantilla').onclick = function () {
      var c = cat(), v = D.preparacion(c) || D.vigente(c), n = M.descargarPlantilla(c, v, false);
      D.logAudit(c, 'Descargar plantilla', 'Plantilla · ' + c.alcance.deptos.length + ' hojas', { version: v ? v.v : null, detalle: { archivo: n } });
      R.toast('Plantilla descargada: <b>' + esc(n) + '</b>.');
    };
    document.querySelectorAll('[data-rep]').forEach(function (b) { b.onclick = function () { reporte((cat().importaciones || [])[+b.dataset.rep]); }; });
  }
  function cargarArchivo(f) {
    S.error = null;
    M.leerArchivo(f).then(usarLibro, function (e) { S.error = e.message; pasoArchivo(); });
  }
  function usarLibro(libro) {
    S.libro = libro; S.error = null; S.mapeo = {};
    var reanudar = cat().importacionActiva;
    if (reanudar && reanudar.estado !== 'terminada' && reanudar.archivo === libro.archivo) { retomarCon(libro); return; }
    analizar(); ir(1);
  }
  function destinoVer(c) { return S.modo === 'nueva' ? null : (D.preparacion(c) || D.vigente(c)); }
  function analizar() {
    var c = cat();
    // Mapeo manual de hojas sin departamento (lo elige el usuario en Ajustes).
    S.libro.hojas.forEach(function (h) { if (S.mapeo[h.nombre]) h.nombre = 'APU ' + S.mapeo[h.nombre]; });
    S.analisis = M.analizar(S.libro, c, destinoVer(c));
    S.hojas = S.analisis.hojas.filter(function (h) { return h.depto; }).map(function (h, i) { return Object.assign(h, { incluir: !h.fueraAlcance && !h.error, orden: i, sumarAlcance: false }); });
  }

  // ════════════ 2 · Ajustes ════════════
  function pasoAjustes() {
    var c = cat(), a = S.analisis.ajustes, p = D.preparacion(c), v = D.vigente(c);
    var enc = Object.keys(a.encabezados);
    var filas = '';
    function fila(ok, t, d, chipTxt, tono, id) {
      return '<div class="rd-adj"' + (id ? ' id="' + id + '"' : '') + '><span class="rd-check-ic rd-check-ic--' + (ok ? 'ok' : 'warn') + '">' + ic(ok ? 'check' : 'warn') + '</span><div class="rd-grow"><div class="rd-check-t">' + t + '</div><div class="rd-check-d">' + d + '</div></div>' + (chipTxt ? R.chip(chipTxt, tono || 'ok') : '') + '</div>';
    }
    filas += fila(true, 'Encabezados', enc.length ? enc.map(function (x) { var s = x.split('→'); return '«' + esc(s[0]) + '» se usará como <b>' + esc(s[1]) + '</b>'; }).join(' · ') + '. La carga los necesita con ese nombre exacto.' : 'Ya vienen con los nombres exactos.', enc.length ? S.analisis.hojas.length + ' hojas' : 'sin cambios', enc.length ? 'ok' : 'neutral', 'ajEncabezados');
    filas += fila(true, 'Nombres de hoja contra los departamentos del sistema', a.hojas.length ? a.hojas.map(function (x) { return '«' + esc(x.de) + '» → <b>' + esc(x.a) + '</b>'; }).join(' · ') + '. Solo donde hay un único candidato.' : 'Todas coinciden exacto.', a.hojas.length ? a.hojas.length + ' hojas' : 'sin cambios', a.hojas.length ? 'ok' : 'neutral', 'ajHojas');
    filas += fila(true, 'Números con punto de miles', a.miles ? '«1.200» se convierte en 1200. Sin este ajuste la carga lo leería como 1,2 <b>sin avisar</b>.' : 'No hay números con punto de miles.', a.miles ? a.miles.toLocaleString('es-CO') + ' celdas' : 'sin cambios', a.miles ? 'warn' : 'neutral', 'ajMiles');
    if (S.analisis.omitidas.length) filas += fila(true, 'Hojas que no son de precios', S.analisis.omitidas.map(function (x) { return '«' + esc(x) + '»'; }).join(', ') + ' no empieza' + (S.analisis.omitidas.length === 1 ? '' : 'n') + ' por «APU» y se deja por fuera.', S.analisis.omitidas.length + ' hoja' + (S.analisis.omitidas.length === 1 ? '' : 's'), 'neutral');
    a.sinDepto.forEach(function (h) {
      filas += '<div class="rd-adj"><span class="rd-check-ic rd-check-ic--warn">' + ic('warn') + '</span><div class="rd-grow"><div class="rd-check-t">«' + esc(h) + '» no coincide con ningún departamento</div><div class="rd-check-d">Elige cuál es, o se deja por fuera.</div>' +
        '<select class="rd-select" data-map="' + esc(h) + '" style="margin-top:8px;max-width:320px"><option value="">Dejarla por fuera</option>' + D.DEPARTAMENTOS.map(function (d) { return '<option>' + esc(d) + '</option>'; }).join('') + '</select></div></div>';
    });
    var opt2 = p ? 'Empezar la ' + p.v + ' de cero con este archivo' : 'Crear la ' + sigV(c) + ' solo con este archivo';
    var nCamb = p ? D.cambiosDe(c, p.v).length : 0;
    body('<div class="rd-cols"><section class="rd-card"><div class="rd-row"><h2 class="rd-h2 rd-grow">Ajustes que haremos al archivo antes de cargarlo</h2><span class="rd-sub"><b>Nada se guarda todavía</b></span></div><div style="margin-top:6px">' + filas + '</div></section>' +
      '<section><div class="rd-card"><h2 class="rd-h2">¿Cómo entra este archivo?</h2><div role="radiogroup" aria-label="Modo de importación" style="display:flex;flex-direction:column;gap:10px;margin-top:12px">' +
      '<button type="button" class="rd-choice" role="radio" data-modo="actualizar" id="modoActualizar" aria-checked="' + (S.modo === 'actualizar') + '"><span class="rd-radio"></span><span><span class="rd-choice-t">' + (p ? 'Actualizar la ' + p.v + ' en preparación' : 'Abrir la ' + sigV(c) + ' desde la ' + (v ? v.v : 'vigente') + ' y actualizarla') + '</span><span class="rd-choice-d">Agrega o actualiza capítulos, APU e insumos que vengan en el archivo. Lo que no venga se queda como está: el archivo nunca borra.</span></span></button>' +
      '<button type="button" class="rd-choice" role="radio" data-modo="nueva" id="modoNueva" aria-checked="' + (S.modo === 'nueva') + '"><span class="rd-radio"></span><span><span class="rd-choice-t">' + opt2 + '</span><span class="rd-choice-d">Para una matriz renumerada o que reemplaza la anterior.' + (p && nCamb ? ' <b>Se descartan los ' + nCamb + ' cambios de la ' + p.v + '.</b>' : '') + ' La vigente no se toca.</span></span></button>' +
      '</div></div><div class="rd-card" style="display:flex;gap:12px;align-items:flex-start">' + ic('clock', 18) + '<div><div class="rd-check-t">La carga va de a un departamento</div><div class="rd-check-d">Cada uno tarda cerca de una hora con la matriz completa. En el siguiente paso eliges cuáles cargar y en qué orden.</div></div></div></section></div>');
    foot('<button class="naowee-btn naowee-btn--mute" id="impVolver">' + ic('back') + 'Volver</button><span class="rd-grow"></span><button class="naowee-btn naowee-btn--loud" id="impDiagnosticar">' + ic('next') + 'Aplicar ajustes y diagnosticar</button>');
    document.getElementById('impVolver').onclick = function () { S.libro = null; ir(0); };
    document.querySelectorAll('[data-modo]').forEach(function (b) { b.onclick = function () { S.modo = b.dataset.modo; analizar(); pasoAjustes(); chrome(); }; });
    document.querySelectorAll('[data-map]').forEach(function (s) { s.onchange = function () { if (s.value) S.mapeo[s.dataset.map] = s.value; else delete S.mapeo[s.dataset.map]; }; });
    document.getElementById('impDiagnosticar').onclick = function () { analizar(); ir(2); };
  }

  // ════════════ 3 · Diagnóstico ════════════
  function ordenadas() { return S.hojas.slice().sort(function (a, b) { return a.orden - b.orden; }); }
  function pasoDiagnostico() {
    var c = cat(), hs = ordenadas(), sel = hs.filter(function (h) { return h.incluir; });
    var min = sel.reduce(function (s, h) { return s + h.minutos; }, 0);
    var rows = hs.map(function (h, i) {
      var st = h.error ? R.chip('No se puede cargar', 'bad') : h.errores.length ? R.chip(h.errores.length + ' fila' + (h.errores.length === 1 ? '' : 's') + ' con error', 'bad') : h.avisos.length ? R.chip(h.avisos.length + ' aviso' + (h.avisos.length === 1 ? '' : 's'), 'warn') : R.chip('Lista', 'ok', 'check');
      return '<tr data-h="' + esc(h.nombre) + '"><td><input type="checkbox" aria-label="Incluir ' + esc(h.depto) + '"' + (h.incluir ? ' checked' : '') + (h.error ? ' disabled' : '') + ' data-inc="' + esc(h.nombre) + '"></td>' +
        '<td><span class="imp-order"><button type="button" data-up="' + esc(h.nombre) + '" aria-label="Subir"' + (i === 0 ? ' disabled' : '') + '>↑</button><button type="button" data-down="' + esc(h.nombre) + '" aria-label="Bajar"' + (i === hs.length - 1 ? ' disabled' : '') + '>↓</button></span></td>' +
        '<td><b>' + esc(h.depto) + '</b><div class="rd-sub">Hoja «' + esc(h.nombre) + '»</div>' +
        (h.fueraAlcance ? '<label class="rd-check-opt" style="margin-top:4px;font-size:12px"><input type="checkbox" data-alc="' + esc(h.nombre) + '"' + (h.sumarAlcance ? ' checked' : '') + '>No está en el alcance: sumarlo</label>' : '') +
        (h.avisos.length ? '<ul class="imp-avisos">' + h.avisos.slice(0, 3).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
        (h.errores.length ? '<ul class="imp-errores">' + h.errores.slice(0, 3).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + (h.errores.length > 3 ? '<li>… y ' + (h.errores.length - 3) + ' más</li>' : '') + '</ul>' : '') + '</td>' +
        '<td class="r">' + h.filas.toLocaleString('es-CO') + '</td><td class="r">' + h.caps + ' · ' + h.apus + ' · ' + h.insumos.toLocaleString('es-CO') + '</td>' +
        '<td class="r">' + (h.nuevos != null ? h.nuevos + ' nuevos · ' + h.actualizados + ' actualizados' : h.apus + ' nuevos') + '</td><td>' + st + '</td><td class="r">≈ ' + fmtMin(h.minutos) + '</td></tr>';
    }).join('');
    body('<div class="rd-card" id="impDiag"><div class="rd-row"><div class="rd-grow"><h2 class="rd-h2">Diagnóstico por departamento</h2><p class="rd-sub">Así lo leería la carga, fila por fila. Elige cuáles cargar y en qué orden: se cargan de a uno.</p></div>' +
      '<div class="rd-kv" style="min-width:420px"><div><div class="k">Departamentos</div><div class="v">' + sel.length + ' de ' + hs.length + '</div></div><div><div class="k">Filas</div><div class="v">' + sel.reduce(function (s, h) { return s + h.filas; }, 0).toLocaleString('es-CO') + '</div></div><div><div class="k">Tiempo estimado</div><div class="v" id="impTiempo">≈ ' + fmtMin(min) + '</div></div></div></div>' +
      '<div class="rd-tbl-wrap" style="margin-top:12px"><table class="rd-tbl"><thead><tr><th><span class="sr-only">Incluir</span></th><th>Orden</th><th>Departamento</th><th class="r">Filas</th><th class="r">Cap. · APU · insumos</th><th class="r">Contra la ' + esc(destinoTxt(c).split(' ')[0]) + '</th><th>Estado</th><th class="r">Tiempo</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<p class="rd-sub" style="margin-top:10px">' + ic('info', 12) + ' Los avisos no impiden cargar: el valor del APU se toma del archivo tal cual y después se revisa en el control del valor. Las filas con error se omiten y quedan en el reporte.</p></div>');
    foot('<button class="naowee-btn naowee-btn--mute" id="impVolver">' + ic('back') + 'Volver</button><span class="rd-flow-note rd-grow">Se cargan <b>' + sel.length + ' departamento' + (sel.length === 1 ? '' : 's') + '</b> uno por uno, en esta pantalla (≈ ' + fmtMin(min) + ').</span>' +
      '<button class="naowee-btn naowee-btn--loud" id="impEmpezar"' + (sel.length ? '' : ' disabled') + '>' + ic('play') + 'Empezar carga</button>');
    document.getElementById('impVolver').onclick = function () { ir(1); };
    function h(n) { return S.hojas.filter(function (x) { return x.nombre === n; })[0]; }
    document.querySelectorAll('[data-inc]').forEach(function (x) { x.onchange = function () { var o = h(x.dataset.inc); o.incluir = x.checked; if (o.fueraAlcance && x.checked) o.sumarAlcance = true; pasoDiagnostico(); }; });
    document.querySelectorAll('[data-alc]').forEach(function (x) { x.onchange = function () { var o = h(x.dataset.alc); o.sumarAlcance = x.checked; o.incluir = x.checked; pasoDiagnostico(); }; });
    function mover(n, d) { var hs2 = ordenadas(), i = hs2.indexOf(h(n)), j = i + d; if (j < 0 || j >= hs2.length) return; var t = hs2[i].orden; hs2[i].orden = hs2[j].orden; hs2[j].orden = t; pasoDiagnostico(); }
    document.querySelectorAll('[data-up]').forEach(function (b) { b.onclick = function () { mover(b.dataset.up, -1); }; });
    document.querySelectorAll('[data-down]').forEach(function (b) { b.onclick = function () { mover(b.dataset.down, 1); }; });
    document.getElementById('impEmpezar').onclick = empezar;
  }

  // ════════════ 4 · Carga ════════════
  function empezar() {
    var c = cat();
    // Destino: modo "nueva" reemplaza el contenido de la preparación (o abre una vacía).
    var p = D.preparacion(c);
    if (S.modo === 'nueva') {
      if (p) { p.contenido = { capitulos: [], apus: [], precios: {} }; D.saveCatalogo(c); D.logAudit(c, 'Reiniciar versión', 'Versión · ' + p.v, { version: p.v, detalle: { motivo: 'Importar ' + S.libro.archivo + ' como versión nueva' } }); }
      else { D.abrirPreparacion(c); c = cat(); p = D.preparacion(c); p.contenido = { capitulos: [], apus: [], precios: {} }; D.saveCatalogo(c); }
    } else if (!p) { D.abrirPreparacion(c); c = cat(); p = D.preparacion(c); }
    c = cat();
    var sel = ordenadas().filter(function (h) { return h.incluir; });
    sel.forEach(function (h) { if (h.sumarAlcance && c.alcance.deptos.indexOf(h.depto) < 0) c.alcance.deptos.push(h.depto); });
    var imp = { id: 'imp-' + Date.now().toString(36), archivo: S.libro.archivo, ejemplo: !!S.libro.ejemplo, modo: S.modo, destino: D.preparacion(c).v, inicio: Date.now(),
      estado: 'cargando', detenerTras: false, fallaUsada: false, fallaEn: S.libro.fallaEn || null,
      cola: sel.map(function (h) { return { depto: h.depto, hoja: h.nombre, filas: h.filas, minutos: h.minutos, estado: 'pendiente', progreso: 0, creados: 0, actualizados: 0, avisos: h.avisos.length, errores: h.errores.length, detalleAvisos: h.avisos.slice(0, 20), detalleErrores: h.errores.slice(0, 20) }; }) };
    D.guardarImportacion(c, imp);
    D.logAudit(c, 'Empezar importación', 'Importación · ' + imp.cola.length + ' departamentos', { version: imp.destino, detalle: { archivo: imp.archivo } });
    ir(3); siguiente();
  }
  function imp() { return cat().importacionActiva; }
  function guardar(i) { var c = cat(); D.guardarImportacion(c, i); }
  function hojaDe(nombre) { return S.hojas.filter(function (h) { return h.nombre === nombre; })[0]; }

  function siguiente() {
    var i = imp(); if (!i) return;
    var q = i.cola.filter(function (x) { return x.estado === 'pendiente' || x.estado === 'cargando'; })[0];
    if (!q) { terminar(); return; }
    if (!hojaDe(q.hoja)) { i.estado = 'interrumpida'; guardar(i); pasoCarga(); return; }
    q.estado = 'cargando'; q.progreso = 0; i.estado = 'cargando'; guardar(i); pasoCarga();
    var t0 = Date.now(), dur = DEMO_MS;
    clearInterval(S.timer);
    S.timer = setInterval(function () {
      var i2 = imp(), q2 = i2.cola.filter(function (x) { return x.depto === q.depto; })[0];
      var f = Math.min(1, (Date.now() - t0) / dur);
      q2.progreso = Math.round(q2.filas * f);
      // Falla simulada del servidor (una vez, en el archivo de ejemplo): error 500 a mitad.
      if (i2.fallaEn === q2.depto && !i2.fallaUsada && f >= 0.61) {
        clearInterval(S.timer); i2.fallaUsada = true; q2.estado = 'fallo'; i2.estado = 'fallo';
        q2.error = 'La carga se detuvo en ' + q2.depto + ' (error 500 del servidor) en la fila ' + q2.progreso.toLocaleString('es-CO') + '.';
        guardar(i2); D.logAudit(cat(), 'Falla de importación', 'Importación · ' + q2.depto, { version: i2.destino, depto: q2.depto, detalle: { motivo: q2.error } });
        pasoCarga(); return;
      }
      if (f >= 1) {
        clearInterval(S.timer);
        var c = cat(), ver = D.preparacion(c), r = M.aplicar(c, ver, hojaDe(q2.hoja));
        q2.estado = 'ok'; q2.creados = r.creados; q2.actualizados = r.actualizados; q2.segundos = Math.round((Date.now() - t0) / 1000);
        c.importacionActiva = i2; D.saveCatalogo(c);
        D.logAudit(c, 'Importar departamento', 'Importación · ' + q2.depto, { version: i2.destino, depto: q2.depto, detalle: { archivo: i2.archivo, resumen: r.creados + ' APU creados · ' + r.actualizados + ' actualizados' } });
        if (i2.detenerTras) { i2.estado = 'detenida'; i2.detenerTras = false; guardar(i2); pasoCarga(); return; }
        siguiente(); return;
      }
      pintarActual(i2, q2);
    }, 120);
  }
  function pintarActual(i, q) {
    var el = document.getElementById('impActual'); if (!el) { pasoCarga(); return; }
    var pct = q.filas ? Math.round(q.progreso / q.filas * 100) : 0;
    el.querySelector('[data-pct]').textContent = pct + ' %';
    el.querySelector('[data-filas]').textContent = q.progreso.toLocaleString('es-CO') + ' de ' + q.filas.toLocaleString('es-CO') + ' filas';
    el.querySelector('[data-bar]').style.width = pct + '%';
    el.querySelector('[data-bar]').parentElement.setAttribute('aria-valuenow', pct);
    el.querySelector('[data-tiempo]').textContent = 'Lleva ' + fmtMin(q.minutos * pct / 100) + ' · faltan ~' + fmtMin(q.minutos * (100 - pct) / 100);
  }

  function pasoCarga() {
    var i = imp(); if (!i) { ir(0); return; }
    var hechos = i.cola.filter(function (x) { return x.estado === 'ok'; }), cur = i.cola.filter(function (x) { return x.estado === 'cargando' || x.estado === 'fallo'; })[0];
    var pend = i.cola.filter(function (x) { return x.estado === 'pendiente'; });
    var restante = i.cola.filter(function (x) { return x.estado !== 'ok'; }).reduce(function (s, x) { return s + x.minutos * (1 - (x.progreso / (x.filas || 1))); }, 0);
    var h = '<div class="rd-cols"><div style="display:flex;flex-direction:column;gap:16px">';
    if (i.estado === 'cargando' && cur) {
      var pct = cur.filas ? Math.round(cur.progreso / cur.filas * 100) : 0;
      h += '<div class="rd-card imp-cur" id="impActual" aria-live="polite"><div class="rd-sub"><b>Cargando ahora · ' + (hechos.length + 1) + ' de ' + i.cola.length + '</b></div><div class="rd-row"><span class="big rd-grow">' + esc(cur.depto) + '</span>' + R.chip('Cargando', 'brand') + '</div>' +
        '<div class="rd-row"><span data-filas>' + cur.progreso.toLocaleString('es-CO') + ' de ' + cur.filas.toLocaleString('es-CO') + ' filas</span><span>·</span><b data-pct>' + pct + ' %</b><span class="rd-grow"></span><span class="rd-sub" data-tiempo>Lleva ' + fmtMin(cur.minutos * pct / 100) + ' · faltan ~' + fmtMin(cur.minutos * (100 - pct) / 100) + '</span></div>' +
        '<div class="rd-bar" role="progressbar" aria-label="Avance de ' + esc(cur.depto) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><span data-bar style="width:' + pct + '%"></span></div>' +
        '<p class="rd-sub">Tiempo real estimado de la carga. En la demo, cada departamento se simula en unos segundos.</p></div>';
    }
    if (i.estado === 'fallo' && cur) {
      h += '<div class="naowee-message naowee-message--negative" id="impFallo" role="alert"><div class="naowee-message__header"><span class="naowee-message__icon">' + ic('x', 16, ' stroke="#fff"') + '</span><div class="naowee-message__body"><b>' + esc(cur.error) + '</b><br>' +
        (hechos.length ? esc(hechos.map(function (x) { return x.depto; }).join(', ')) + ' ya quedaron guardados. ' : '') + 'Las filas escritas antes de la falla se vuelven a actualizar al reintentar: la carga no duplica.' +
        '<div class="rd-row" style="margin-top:10px"><button class="naowee-btn naowee-btn--loud naowee-btn--small" id="impReintentar">' + ic('undo') + 'Reintentar desde ' + esc(cur.depto) + '</button><button class="naowee-btn naowee-btn--mute naowee-btn--small" id="impTerminar">Terminar aquí</button></div></div></div></div>';
    }
    if (i.estado === 'detenida' || i.estado === 'interrumpida') {
      var nx = cur || pend[0];
      var necesitaArchivo = !S.libro && !i.ejemplo;
      h += '<div class="rd-card" id="impPausa"><h2 class="rd-h2">' + (i.estado === 'detenida' ? 'Carga detenida' : 'La carga se interrumpió') + '</h2><p class="rd-sub">' +
        (i.estado === 'detenida' ? 'Se detuvo al terminar el departamento en curso.' : 'Se cerró la ventana o se cortó la sesión mientras cargaba.') + ' ' + hechos.length + ' de ' + i.cola.length + ' departamentos quedaron guardados en la ' + esc(i.destino) + '.' +
        (nx ? ' Sigue <b>' + esc(nx.depto) + '</b>' + (i.estado === 'interrumpida' && nx.progreso ? ', que se vuelve a cargar completo (la carga no duplica)' : '') + (/\.$/.test(nx.depto) && !(i.estado === 'interrumpida' && nx.progreso) ? '' : '.') : '') + '</p>' +
        (necesitaArchivo ? '<div class="rd-note" style="margin-top:10px">' + ic('file') + '<span>Para retomar, vuelve a elegir <b>' + esc(i.archivo) + '</b>: el archivo no se guarda en el navegador.</span></div>' : '') +
        '<div class="rd-row" style="margin-top:12px">' + (nx ? (necesitaArchivo ? '<label class="naowee-btn naowee-btn--loud" for="impFile">' + ic('upload') + 'Elegir el archivo</label>' : '<button class="naowee-btn naowee-btn--loud" id="impContinuar">' + ic('play') + 'Retomar desde ' + esc(nx.depto) + '</button>') : '') +
        '<button class="naowee-btn naowee-btn--mute" id="impTerminar">Terminar aquí</button></div></div>';
    }
    var segs = i.cola.map(function (x) { return '<span class="' + (x.estado === 'ok' ? 'ok' : x.estado === 'cargando' ? 'cur' : x.estado === 'fallo' ? 'bad' : '') + '" title="' + esc(x.depto) + '"></span>'; }).join('');
    h += '<div class="rd-card"><div class="rd-row"><h3 class="rd-h3 rd-grow">Avance total</h3><span class="rd-sub">empezó ' + new Date(i.inicio).toTimeString().slice(0, 5) + ' · faltan ~' + fmtMin(restante) + '</span></div><div class="rd-segs" style="margin-top:10px" aria-hidden="true">' + segs + '</div>' +
      '<p class="rd-sub" style="margin-top:8px">' + hechos.length + ' de ' + i.cola.length + ' departamentos completos. Lo ya cargado queda guardado en la ' + esc(i.destino) + ' aunque la carga se detenga.</p></div></div>';
    h += '<div class="rd-card" id="impCola"><div class="rd-row"><h3 class="rd-h3 rd-grow">Cola de carga</h3><span class="rd-sub">uno a la vez</span></div><ul class="rd-queue" style="margin-top:6px">' + i.cola.map(function (x, k) {
      var st = x.estado === 'ok' ? R.chip('Completo', 'ok', 'check') : x.estado === 'cargando' ? R.chip('Cargando', 'brand') : x.estado === 'fallo' ? R.chip('Falló', 'bad') : R.chip('En cola', 'neutral');
      var d = x.estado === 'ok' ? x.creados + ' creados · ' + x.actualizados + ' actualizados' : x.estado === 'cargando' ? 'fila ' + x.progreso.toLocaleString('es-CO') + ' de ' + x.filas.toLocaleString('es-CO') : x.avisos ? x.avisos + ' avisos del diagnóstico' : '≈ ' + fmtMin(x.minutos);
      return '<li><span class="rd-q-n">' + (k + 1) + '</span><div class="rd-grow"><div class="rd-q-t">' + esc(x.depto) + '</div><div class="rd-q-d">' + d + '</div></div>' + st + '</li>';
    }).join('') + '</ul></div></div>';
    body(h);
    foot('<span class="rd-flow-note rd-grow">' + ic('info', 14) + ' <b>Mantén esta ventana abierta mientras carga.</b> Si se cierra o se corta la sesión, al volver retomas desde el departamento pendiente; lo cargado no se pierde.</span>' +
      (i.estado === 'cargando' ? '<button class="naowee-btn naowee-btn--mute" id="impDetener"' + (i.detenerTras ? ' disabled' : '') + '>' + ic('pause') + (i.detenerTras ? 'Se detendrá al terminar ' + esc(cur ? cur.depto : '') : 'Detener después del actual') + '</button>' : ''));
    var b;
    if ((b = document.getElementById('impDetener'))) b.onclick = function () { var x = imp(); x.detenerTras = true; guardar(x); pasoCarga(); };
    if ((b = document.getElementById('impReintentar'))) b.onclick = function () { var x = imp(); var q = x.cola.filter(function (y) { return y.estado === 'fallo'; })[0]; q.estado = 'pendiente'; q.progreso = 0; delete q.error; x.estado = 'cargando'; guardar(x); siguiente(); };
    if ((b = document.getElementById('impContinuar'))) b.onclick = function () { var x = imp(); x.cola.forEach(function (y) { if (y.estado === 'cargando') { y.estado = 'pendiente'; y.progreso = 0; } }); x.estado = 'cargando'; guardar(x); siguiente(); };
    if ((b = document.getElementById('impTerminar'))) b.onclick = function () {
      var x = imp(); x.cola.forEach(function (y) { if (y.estado !== 'ok') { y.estado = 'omitida'; y.progreso = 0; } }); guardar(x); terminar();
    };
    var fi = document.getElementById('impFile'); fi.value = '';
    fi.onchange = function () { if (fi.files[0]) M.leerArchivo(fi.files[0]).then(function (l) { if (l.archivo !== imp().archivo) { R.toast('Ese no es <b>' + esc(imp().archivo) + '</b>.', 'caution'); return; } retomarCon(l); }, function (e) { R.toast(esc(e.message), 'negative'); }); };
  }
  function retomarCon(libro) {
    S.libro = libro; S.modo = imp().modo;
    S.analisis = M.analizar(libro, cat(), null);
    S.hojas = S.analisis.hojas.filter(function (h) { return h.depto; });
    S.paso = 3; render();
  }

  // ════════════ 5 · Resultado ════════════
  function terminar() {
    clearInterval(S.timer);
    var c = cat(), i = c.importacionActiva, d = new Date();
    var reg = { id: i.id, archivo: i.archivo, destino: i.destino, modo: i.modo, fecha: D.hoy(), hora: d.toTimeString().slice(0, 5), usuario: D.usuarioActual(),
      deptos: i.cola.map(function (x) { return { depto: x.depto, hoja: x.hoja, estado: x.estado, filas: x.filas, creados: x.creados, actualizados: x.actualizados, avisos: x.avisos, errores: x.errores, detalleAvisos: x.detalleAvisos, detalleErrores: x.detalleErrores }; }) };
    D.cerrarImportacion(c, reg);
    var ok = reg.deptos.filter(function (x) { return x.estado === 'ok'; });
    D.logAudit(cat(), 'Importar matriz', 'Importación · ' + ok.length + ' de ' + reg.deptos.length + ' departamentos', { version: reg.destino, detalle: { archivo: reg.archivo, deptos: ok.map(function (x) { return x.depto; }),
      resumen: ok.reduce(function (s, x) { return s + x.creados; }, 0) + ' APU creados · ' + ok.reduce(function (s, x) { return s + x.actualizados; }, 0) + ' actualizados' } });
    S.resultado = reg; ir(4);
  }
  function pasoResultado() {
    var r = S.resultado || (cat().importaciones || [])[0]; if (!r) { ir(0); return; }
    var ok = r.deptos.filter(function (x) { return x.estado === 'ok'; });
    function sum(k) { return ok.reduce(function (s, x) { return s + (x[k] || 0); }, 0); }
    body('<div class="rd-card" id="impResultado"><div class="rd-row"><div class="rd-grow"><h2 class="rd-h2">' + (ok.length === r.deptos.length ? 'Importación completa' : 'Importación terminada con ' + (r.deptos.length - ok.length) + ' departamento' + (r.deptos.length - ok.length === 1 ? '' : 's') + ' sin cargar') + '</h2>' +
      '<p class="rd-sub">' + esc(r.archivo) + ' · en la <b>' + esc(r.destino) + ' en preparación</b>. Nada llega a los usuarios hasta que actives la versión.</p></div></div>' +
      '<div class="rd-kv" style="margin-top:14px" id="impKpis"><div><div class="k">Departamentos cargados</div><div class="v">' + ok.length + ' de ' + r.deptos.length + '</div></div><div><div class="k">APU creados</div><div class="v">' + sum('creados') + '</div></div><div><div class="k">APU actualizados</div><div class="v">' + sum('actualizados') + '</div></div>' +
      '<div><div class="k">Avisos</div><div class="v">' + sum('avisos') + '</div></div><div><div class="k">Filas omitidas</div><div class="v">' + ok.reduce(function (s, x) { return s + x.errores; }, 0) + '</div></div></div>' +
      '<div class="rd-tbl-wrap" style="margin-top:14px"><table class="rd-tbl" id="impTablaRes"><thead><tr><th>Departamento</th><th>Resultado</th><th class="r">Creados</th><th class="r">Actualizados</th><th>Avisos y errores</th></tr></thead><tbody>' +
      r.deptos.map(function (x) {
        return '<tr><td><b>' + esc(x.depto) + '</b></td><td>' + (x.estado === 'ok' ? R.chip('Cargado', 'ok', 'check') : R.chip('Sin cargar', 'neutral')) + '</td><td class="r">' + (x.creados || 0) + '</td><td class="r">' + (x.actualizados || 0) + '</td><td>' +
          ((x.detalleAvisos || []).concat(x.detalleErrores || []).slice(0, 2).map(function (m) { return '<div class="rd-sub">' + esc(m) + '</div>'; }).join('') || '<span class="rd-muted">—</span>') + '</td></tr>';
      }).join('') + '</tbody></table></div></div>');
    foot('<button class="naowee-btn naowee-btn--mute" id="btnReporte">' + ic('download') + 'Descargar reporte</button><span class="rd-grow"></span>' +
      '<a class="naowee-btn naowee-btn--mute" id="impIrContenido" href="' + R.href('catalogo-detalle.html', { cat: catId, tab: 'contenido', dep: ok[0] ? ok[0].depto : null }) + '">Ver el contenido</a>' +
      '<a class="naowee-btn naowee-btn--loud" id="impIrActivar" href="' + R.href('catalogo-detalle.html', { cat: catId, tab: 'versiones' }) + '">Revisar y activar ' + esc(r.destino) + '</a>');
    document.getElementById('btnReporte').onclick = function () { reporte(r); };
  }
  function reporte(r) {
    if (!r) return;
    var filas = [];
    r.deptos.forEach(function (x) {
      filas.push([x.depto, x.hoja, x.estado === 'ok' ? 'Cargado' : 'Sin cargar', x.filas, x.creados || 0, x.actualizados || 0, '', '']);
      (x.detalleAvisos || []).forEach(function (m) { filas.push([x.depto, x.hoja, 'Aviso', '', '', '', m, '']); });
      (x.detalleErrores || []).forEach(function (m) { filas.push([x.depto, x.hoja, 'Fila omitida', '', '', '', '', m]); });
    });
    var n = U.exportar({ nombre: 'reporte-importacion-' + r.destino, titulo: 'Reporte de importación · ' + cat().nombre, formato: 'xls',
      meta: [r.archivo + ' · destino ' + r.destino, D.fmtFecha(r.fecha) + ' ' + r.hora + ' · ' + r.usuario],
      columnas: ['Departamento', 'Hoja', 'Estado', 'Filas', 'APU creados', 'APU actualizados', 'Aviso', 'Error'], filas: filas });
    D.logAudit(cat(), 'Descargar reporte', 'Importación · ' + r.archivo, { version: r.destino, detalle: { archivo: n } });
    R.toast('Reporte descargado: <b>' + esc(n) + '</b>.');
  }

  // Avisar antes de cerrar a mitad de una carga (no la detiene el aviso: la retoma al volver).
  window.addEventListener('beforeunload', function (e) { var i = imp(); if (i && i.estado === 'cargando') { e.preventDefault(); e.returnValue = ''; } });

  // ── Arranque: si hay una importación sin terminar, se vuelve a ella ──
  (function () {
    var i = imp();
    if (i && i.estado !== 'terminada') {
      if (i.estado === 'cargando') { i.estado = 'interrumpida'; guardar(i); }
      if (i.ejemplo) { S.libro = M.ejemplo(cat()); S.analisis = M.analizar(S.libro, cat(), null); S.hojas = S.analisis.hojas.filter(function (h) { return h.depto; }); S.modo = i.modo; }
      S.paso = 3;
    } else if (R.qs('ver') === 'resultado' && (cat().importaciones || []).length) S.paso = 4;
    render();
  })();
  // Ganchos del recorrido guiado.
  window.IMP = { ejemplo: function () { usarLibro(M.ejemplo(cat())); }, paso: function () { return S.paso; }, rapido: function (ms) { DEMO_MS = ms; } };
})();
