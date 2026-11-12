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
  // v0.7: las HU ajustadas al backend (plans/PLAN-REDISENO-FLUJO.md §2). Cada tour declara su
  // pantalla, su perfil y los datos que necesita (antes), así se puede recorrer en cualquier orden.
  var GEN = 'cat-general', BOG = 'Bogotá, D. C.';
  function prep(D, id) { var c = D.getCatalogo(id || GEN); if (!c) return null; D.abrirPreparacion(c); c = D.getCatalogo(id || GEN); return { c: c, v: D.preparacion(c) }; }
  function hhmm() { return new Date().toTimeString().slice(0, 5); }
  var TOURS = {
    // 1 · Catálogo
    'PPTO-01': { ph: '1 · Catálogo', page: 'catalogos.html', role: 'ADMIN',
      title: 'Crear catálogo', purpose: 'Crear una base de precios con su alcance: departamentos, roles y una condición adicional.',
      steps: [
        { sel: '#btnCrear', body: 'Clic en <b>Nuevo catálogo</b>.', click: true },
        { sel: '#catNombre', body: 'El <b>nombre</b> es obligatorio y no se puede repetir.', fill: { sel: '#catNombre', value: function () { return 'Base de precios Orinoquía ' + hhmm(); } } },
        { sel: '#dpIni', body: 'La <b>vigencia</b>, desde y hasta. No deja guardar si termina antes de empezar.' },
        { sel: '#catDeptos', body: 'El <b>alcance</b>: los departamentos que cubre. Es una dimensión del catálogo, no un catálogo por región: cada departamento tendrá sus precios. Marcamos cinco de la Orinoquía.',
          act: function () { ['Arauca', 'Casanare', 'Guaviare', 'Meta', 'Vichada'].forEach(function (d) { var i = document.querySelector('#catDeptos input[value="' + d + '"]'); if (i && !i.checked) i.click(); }); } },
        { sel: '#catRoles', body: 'Los <b>roles</b> que lo consultan. Se cruzan con el perfil de quien entra a Consulta (PPTO-17).' },
        { sel: '#catCondicion', body: 'Una <b>condición adicional</b> opcional, como un programa.' },
        { sel: '#catGuardar', body: '<b>Crear catálogo</b>: nace con la <b>v1.0 en preparación</b> y te lleva a su espacio de trabajo.', click: true, nav: true },
        { page: 'catalogo-detalle.html', sel: '#wsChecklist', body: 'La lista de <b>qué falta para activarla</b>: alcance, contenido, precios por departamento y valores que cuadran. Cada punto trae su acción.' },
        { page: 'catalogo-detalle.html', sel: '#verbar', body: 'Mientras no se active, los usuarios <b>no ven</b> este catálogo. La creación ya quedó en el <b>Historial</b>.' }
      ] },
    'PPTO-02': { ph: '1 · Catálogo', page: 'catalogo-detalle.html', role: 'ADMIN', params: { cat: GEN, tab: 'contenido' },
      title: 'Editar catálogo', purpose: 'Cambiar nombre, vigencia o alcance sin salir del espacio de trabajo, con traza.',
      steps: [
        { sel: '#btnDatos', body: 'Los <b>datos generales</b> se editan en un modal sobre el espacio de trabajo: no se pierde el contexto.', click: true },
        { sel: '#catNombre', body: 'Le ajustamos el nombre para el recorrido.', fill: { sel: '#catNombre', value: function (v) { return / \(ajuste\)$/.test(v) ? v.replace(/ \(ajuste\)$/, '') : v + ' (ajuste)'; } } },
        { sel: '#catDeptos', body: 'El <b>alcance</b> también se edita aquí. Si cambia, el cambio cae en la <b>versión en preparación</b>: lo que ven hoy los usuarios no se mueve.' },
        { sel: '#mCatVer', body: 'El modal lo dice antes de guardar.' },
        { sel: '#catGuardar', body: '<b>Revisar cambios</b>.', click: true },
        { sel: '#mCambiosTable', body: 'El <b>resumen</b>: cada dato con su valor anterior y el nuevo, y el impacto en presupuestos.' },
        { sel: '#mCambiosOk', body: '<b>Confirma</b>. Queda en el Historial con antes y después, quién y cuándo.', click: true },
        { center: true, body: 'Listo. El nombre ya se ve en el encabezado y el cambio está en la pestaña <b>Historial</b>.' }
      ] },
    'PPTO-03': { ph: '1 · Catálogo', page: 'catalogos.html', role: 'ADMIN',
      title: 'Consultar y buscar catálogos', purpose: 'Ver los catálogos con su alcance, su versión vigente y la que está en preparación.',
      steps: [
        { sel: '#catTable', body: 'Cada fila: nombre y condición, <b>alcance</b> (departamentos y roles), <b>versión vigente</b> con cuántos departamentos tienen precios, la <b>versión en preparación</b> con sus cambios pendientes, y el estado.' },
        { sel: '#tblSearch', body: '<b>Busca</b> por nombre o por departamento: «Nariño» trae los catálogos que lo cubren.', fill: { sel: '#tblSearch', value: 'Nariño' } },
        { sel: '#fEstado', body: '<b>Filtra</b> por estado…' },
        { sel: '#fPrep', body: '…o por los que tienen cambios sin activar.' },
        { sel: '#tblSearch', body: 'Limpiamos la búsqueda. Clic en una fila abre su espacio de trabajo; el menú ⋮ tiene datos generales y desactivar.', fill: { sel: '#tblSearch', value: '' } }
      ] },
    // 2 · Contenido
    'PPTO-04': { ph: '2 · Contenido', page: 'catalogo-detalle.html', role: 'ADMIN', params: { cat: 'cat-caribe', tab: 'contenido' },
      antes: function (D) { var r = prep(D, 'cat-caribe'); if (r) { r.v.contenido = { capitulos: [], apus: [], precios: {} }; D.saveCatalogo(r.c); } },
      title: 'Crear capítulo y APU', purpose: 'Armar el contenido a mano: la estructura es fija (Capítulo › APU › insumo).',
      steps: [
        { sel: '#wsChecklist', body: 'Este catálogo está recién creado: su <b>v1.0 en preparación</b> está vacía. Lo usual es importar la matriz; aquí lo armamos a mano.' },
        { sel: '#ckCapitulo', body: 'Clic en <b>Crear capítulo</b>.', click: true },
        { sel: '#capNombre', body: 'Los capítulos son <b>globales</b>: si el nombre ya existe en otro catálogo, se reutiliza en vez de duplicarse.', fill: { sel: '#capNombre', value: 'Preliminares' } },
        { sel: '#capExiste, #capNombre', body: 'Aquí ya existe «1 · Preliminares»: se agrega ese.' },
        { sel: '#capOk', body: '<b>Crear capítulo</b>.', click: true },
        { sel: '#btnNuevoApu', body: 'Ahora un <b>APU</b> dentro del capítulo.', click: true },
        { sel: '#apuNombre', body: 'Código sugerido (capítulo.número), unidad y nombre.', fill: { sel: '#apuNombre', value: 'Demolición de andén en concreto e=10 cm' } },
        { sel: '#apuValor', body: 'Y, si ya lo tienes, su <b>valor</b> en un departamento. Sus insumos se agregan después (PPTO-10).', fill: { sel: '#apuValor', value: '52000' } },
        { sel: '#apuOk', body: '<b>Crear APU</b>.', click: true },
        { sel: '#wsApuDet', body: 'El APU queda en la versión en preparación, con su detalle al lado del árbol. Sin insumos, el <b>control del valor</b> lo marca.' }
      ] },
    'PPTO-05': { ph: '2 · Contenido', page: 'catalogo-detalle.html', role: 'ADMIN', params: { cat: GEN, tab: 'contenido', apu: 'apu-3.4', dep: BOG },
      antes: function (D) { prep(D); },
      title: 'Editar APU', purpose: 'Ajustar un APU en contexto, sin perder el árbol.',
      steps: [
        { sel: '#wsTree', body: 'El árbol queda a la vista mientras se edita: no hay que salir a otra pantalla.' },
        { sel: '#btnEditarApu', body: 'Clic en <b>Editar APU</b>: abre un <b>panel lateral</b>.', click: true },
        { sel: '#eaNombre', body: '<b>Identidad</b>: capítulo, nombre y unidad.' },
        { sel: '#eaValor', body: 'Y su <b>valor en Bogotá</b>. El control compara en vivo con la suma de sus insumos.', fill: { sel: '#eaValor', value: function (v) { return v === '695000' ? '689900' : '695000'; } } },
        { sel: '#eaOk', body: '<b>Revisar cambios</b>.', click: true },
        { sel: '#mCambiosTable', body: 'Resumen antes de confirmar, con los presupuestos que usan el APU.' },
        { sel: '#mCambiosOk', body: '<b>Confirma</b>.', click: true },
        { sel: '#wsApuDet', body: 'El cambio quedó en la <b>v1.4 en preparación</b>; la v1.3 vigente sigue igual hasta activarla.' }
      ] },
    'PPTO-06': { ph: '2 · Contenido', page: 'catalogo-detalle.html', role: 'ADMIN', params: { cat: GEN, tab: 'contenido', apu: 'apu-1.6', dep: BOG },
      antes: function (D) { var r = prep(D); var a = r && D.apu(r.v, 'apu-1.6'); if (a) { a.activo = true; delete a.motivoRetiro; D.saveCatalogo(r.c); } },
      title: 'Retirar un APU de la versión', purpose: 'Sacar un APU sin borrarlo: la vigente y las históricas lo conservan.',
      steps: [
        { sel: '#btnRetirar', body: 'Clic en <b>Retirar</b>.', click: true },
        { sel: '#rdMotivoTxt', body: 'El <b>motivo es obligatorio</b>: queda en el Historial.', fill: { sel: '#rdMotivoTxt', value: 'Se reemplaza por el APU 1.8' } },
        { sel: '#rdMotivoOk', body: '<b>Retirar de la versión</b>.', click: true },
        { sel: '#wsApuDet', body: 'Queda tachado en el árbol y con su motivo. No se borra: el archivo de carga tampoco borra nunca.' },
        { sel: '#btnReincorporar', body: 'Se puede <b>reincorporar</b> cuando se quiera.' }
      ] },
    'PPTO-07': { ph: '2 · Contenido', page: 'catalogo-detalle.html', role: 'ADMIN', params: { cat: GEN, tab: 'contenido', apu: 'apu-3.4', dep: BOG },
      title: 'Árbol por departamento', purpose: 'Recorrer capítulos y APU de un departamento, con el detalle al lado.',
      steps: [
        { sel: '#wsDepto', body: 'El <b>departamento</b> va arriba del árbol: el catálogo es uno solo y cada departamento tiene sus precios.' },
        { sel: '#wsPrecio', body: 'Cambiamos a <b>Amazonas</b>: cambian el precio y las cantidades del mismo APU.', act: function () { window.WS && window.WS.depto('Amazonas'); } },
        { sel: '#wsBuscar', body: '<b>Busca</b> un APU por código o nombre: el árbol se filtra.', fill: { sel: '#wsBuscar', value: 'caja' } },
        { sel: '#wsTree', body: 'Los capítulos se despliegan. Punto naranja: el valor no cuadra con sus insumos; punto morado: nuevo en la versión en preparación.', fill: { sel: '#wsBuscar', value: '' } }
      ] },
    'PPTO-08': { ph: '2 · Contenido', page: 'catalogo-detalle.html', role: 'ADMIN', params: { cat: GEN, tab: 'contenido', apu: 'apu-3.4', dep: BOG },
      antes: function (D) { var r = prep(D); var p = r && D.precio(r.v, BOG, 'apu-3.4'); if (p) { p.valor = D.sumaInsumos(p) + 17420; D.saveCatalogo(r.c); } },
      title: 'Valor del APU y control', purpose: 'El valor viene del archivo y no se recalcula: se contrasta con la suma de sus insumos.',
      steps: [
        { sel: '#wsPrecio', body: 'El <b>valor del APU en Bogotá</b>, por su unidad. Viene de la matriz tal cual (el backend no lo recalcula).' },
        { sel: '#wsControl', body: 'El <b>control del valor</b>: aquí no coincide con la suma de sus insumos.' },
        { sel: '#btnUsarSuma', body: '<b>Usar la suma</b> lo corrige con un clic, en la versión en preparación.', click: true },
        { sel: '#wsControl', body: 'Ahora coincide, y el cambio quedó registrado. Los descuadres también se ven en el diagnóstico de la importación y en los requisitos para activar.' }
      ] },
    'PPTO-09': { ph: '2 · Contenido', page: 'catalogo-detalle.html', role: 'ADMIN', params: { cat: GEN, tab: 'alcance' },
      title: 'Estructura fija', purpose: 'Saber qué nivel lleva insumos y qué columnas tiene: lo fija el sistema de carga.',
      steps: [
        { sel: '#wsAlcance', body: 'El <b>alcance</b>: departamentos (con precios o no), roles y condición.' },
        { sel: '#wsEstructura', body: 'La <b>estructura</b> es fija: Capítulo › APU › insumo. Solo el insumo lleva cantidad y valor unitario; capítulo e insumo son globales.' },
        { sel: '#wsPlantilla', body: 'Y las <b>columnas</b>, con sus nombres exactos. No se configuran por catálogo: se dice como es.' }
      ] },
    'PPTO-10': { ph: '2 · Contenido', page: 'catalogo-detalle.html', role: 'ADMIN', params: { cat: GEN, tab: 'contenido', apu: 'apu-3.4', dep: BOG },
      antes: function (D) { var r = prep(D); var p = r && D.precio(r.v, BOG, 'apu-3.4'); if (p) { p.det = p.det.filter(function (d) { return d.ins !== 'MA-8'; }); D.saveCatalogo(r.c); } },
      title: 'Agregar insumo al APU', purpose: 'Sumar un insumo existente (o uno nuevo) a un APU en un departamento.',
      steps: [
        { sel: '#btnAgregarIns', body: 'Clic en <b>Agregar insumo</b>.', click: true },
        { sel: '#inBuscar', body: 'Primero se <b>busca uno existente</b>: los insumos son globales y se reutilizan.', fill: { sel: '#inBuscar', value: 'pvc' } },
        { sel: '#inRes', body: 'Elegimos «Tubería y accesorios PVC». También se puede crear uno nuevo.', act: function () { var b = document.querySelector('#inRes [data-ins="MA-8"]'); if (b) b.click(); } },
        { sel: '#inCant', body: '<b>Cantidad</b> por unidad del APU…', fill: { sel: '#inCant', value: '0,2' } },
        { sel: '#inVu', body: '…y <b>valor unitario</b> en Bogotá. Se ve el total y cómo queda la suma frente al valor del APU.', fill: { sel: '#inVu', value: '12000' } },
        { sel: '#inOk', body: '<b>Agregar al APU</b>.', click: true },
        { sel: '#wsInsumos', body: 'Ya está en la composición. El control avisa que la suma cambió: se corrige con <b>Usar la suma</b> (PPTO-08).' }
      ] },
    'PPTO-11': { ph: '2 · Contenido', page: 'catalogo-detalle.html', role: 'ADMIN', params: { cat: GEN, tab: 'contenido', apu: 'apu-3.4', dep: BOG },
      antes: function (D) { prep(D); },
      title: 'Editar insumo', purpose: 'Distinguir lo que cambia solo en este APU de lo que cambia en todo el sistema.',
      steps: [
        { sel: '[data-edins="0"]', body: 'Editamos la <b>cuadrilla</b> de este APU.', click: true },
        { sel: '#inVu', body: '<b>Cantidad y valor unitario</b> son de este APU en Bogotá: van a la versión en preparación.', fill: { sel: '#inVu', value: function (v) { return v === '190000' ? '185000' : '190000'; } } },
        { sel: '#inNombre', body: '<b>Nombre y unidad</b> son del insumo, que es <b>global</b>: si cambian, cambian en todas las versiones y catálogos.', fill: { sel: '#inNombre', value: function (v) { return v === 'Cuadrilla oficial + ayudante' ? 'Cuadrilla (oficial + ayudante)' : 'Cuadrilla oficial + ayudante'; } } },
        { sel: '#inGlobal', body: 'Por eso el aviso lista <b>dónde se usa</b>, también en versiones históricas.' },
        { sel: '#inOk', body: '<b>Revisar cambios</b>.', click: true },
        { sel: '#mCambiosTable', body: 'El resumen separa lo <b>local</b> (de la versión) de lo <b>global</b> (sin versión).' },
        { sel: '#mCambiosOk', body: '<b>Confirma</b>.', click: true },
        { center: true, body: 'Listo. En el Historial, el cambio global queda marcado como tal.' }
      ] },
    // 3 · Importar
    'PPTO-12': { ph: '3 · Importar', page: 'catalogo-detalle.html', role: 'ADMIN', params: { cat: GEN, tab: 'alcance' },
      title: 'Descargar plantilla', purpose: 'Obtener el libro con las hojas y columnas exactas que acepta la carga.',
      steps: [
        { sel: '#wsPlantilla', body: 'La plantilla es <b>fija</b>: una hoja <b>APU &lt;Departamento&gt;</b> por cada departamento del alcance (aquí 33) y los 7 encabezados literales.' },
        { sel: '#btnPlantilla', body: '<b>Descarga la plantilla vacía</b>, o con los precios de la versión para actualizarlos. Queda en el Historial.' },
        { center: true, body: 'La misma descarga está en el primer paso de <b>Importar</b>.' }
      ] },
    'PPTO-13': { ph: '3 · Importar', page: 'importar.html', role: 'ADMIN', params: { cat: GEN },
      antes: function (D) { var c = D.getCatalogo(GEN); if (c && c.importacionActiva) D.cerrarImportacion(c, null); prep(D); },
      title: 'Importar la matriz', purpose: 'Cargar la matriz de a un departamento, dentro del flujo, con ajustes y diagnóstico antes.',
      steps: [
        { sel: '#impDrop', body: 'Importar es un <b>flujo a pantalla completa</b>. Se arrastra el libro (.xlsx) o se usa el de ejemplo.' },
        { sel: '#impEjemplo', body: 'Usamos el <b>archivo de ejemplo</b>: 7 departamentos con los errores típicos de una matriz real.', click: true },
        { sel: '#ajEncabezados', body: '<b>Ajustes</b> antes de que el servidor lo toque: encabezados con el nombre exacto…' },
        { sel: '#ajHojas', body: '…nombres de hoja contra los departamentos del sistema («APU Bogota» → «APU Bogotá, D. C.»)…' },
        { sel: '#ajMiles', body: '…y los <b>puntos de miles</b>: «1.200» se leería como 1,2 sin avisar.' },
        { sel: '#modoActualizar', body: 'El <b>modo</b>: actualizar la v1.4 en preparación (nunca borra) o empezarla de cero con este archivo.' },
        { sel: '#impDiagnosticar', body: '<b>Aplicar ajustes y diagnosticar</b>.', click: true },
        { sel: '#impDiag', body: 'El <b>diagnóstico por departamento</b>: filas, APU nuevos y actualizados, avisos y el <b>tiempo estimado</b>. Se elige cuáles y en qué orden.' },
        { sel: '#impEmpezar', body: '<b>Empezar carga</b>.', click: true },
        { sel: '#impActual', body: 'La carga se vive <b>dentro del flujo</b>: el departamento en curso, sus filas y el tiempo real estimado (≈ 1 h con la matriz completa; en la demo, segundos).' },
        { sel: '#impCola', body: 'La <b>cola</b>, uno a la vez: el endpoint se cuelga si van todos juntos.' },
        { sel: '#impDetener', body: 'Se puede <b>detener después del actual</b>. Si se cierra la ventana o el servidor falla (el ejemplo simula un error 500 en Norte de Santander), se <b>retoma desde el departamento pendiente</b>.' },
        { center: true, body: 'Deja que termine: el resultado se revisa en <b>PPTO-14</b>.' }
      ] },
    'PPTO-14': { ph: '3 · Importar', page: 'importar.html', role: 'ADMIN', params: { cat: GEN, ver: 'resultado' },
      antes: function (D) { var c = D.getCatalogo(GEN); if (c && c.importacionActiva) D.cerrarImportacion(c, null); },
      title: 'Resultado de la importación', purpose: 'Ver qué se cargó por departamento, los avisos y los errores, y descargar el reporte.',
      steps: [
        { sel: '#impKpis', body: 'El <b>resumen</b>: departamentos cargados, APU creados y actualizados, avisos y filas omitidas.' },
        { sel: '#impTablaRes', body: 'El detalle <b>por departamento</b>, con sus avisos y errores con la fila y el motivo.' },
        { sel: '#btnReporte', body: '<b>Descargar reporte</b>: todas las filas con su estado, para revisarlo fuera del sistema.' },
        { sel: '#impIrActivar', body: 'Nada llega a los usuarios hasta <b>revisar y activar</b> la versión (PPTO-15).' }
      ] },
    // 4 · Versiones
    'PPTO-15': { ph: '4 · Versiones', page: 'catalogo-detalle.html', role: 'ADMIN', params: { cat: GEN, tab: 'contenido' },
      antes: function (D) { prep(D); },
      title: 'Revisar y activar una versión', purpose: 'Publicar los cambios a sabiendas: qué cambia y a quién afecta.',
      steps: [
        { sel: '#btnRevisar', body: 'La barra de versión siempre dice qué está en preparación. Clic en <b>Revisar y activar</b>.', click: true },
        { sel: '#wsResumen', body: 'Qué cambia frente a la vigente: APU nuevos, retirados, precios y departamentos.' },
        { sel: '#wsCambios, #wsRevisar', body: 'Los <b>cambios registrados</b> en esta versión, con quién y cuándo.' },
        { sel: '#wsRevisar .rd-check', body: 'Los <b>requisitos</b>. Los descuadres avisan pero no impiden activar.' },
        { sel: '#verMotivo', body: 'El <b>motivo</b> es obligatorio.', fill: { sel: '#verMotivo', value: 'Actualización de precios de septiembre' } },
        { sel: '#btnActivar', body: '<b>Activar</b>: pasa a ser la que ven los usuarios. La anterior queda histórica con su contenido intacto, y cada presupuesto sigue en su versión.', click: true },
        { sel: '#verHist', body: 'El historial de versiones ya muestra la nueva vigente.' }
      ] },
    'PPTO-16': { ph: '4 · Versiones', page: 'catalogo-detalle.html', role: 'ADMIN', params: { cat: GEN, tab: 'versiones' },
      title: 'Historial de versiones', purpose: 'Ver cómo evolucionaron el contenido y los precios.',
      steps: [
        { sel: '#verHist', body: 'Cada versión con su estado (vigente, en preparación, histórica), motivo, autor, fecha, departamentos y APU.' },
        { sel: '[data-verv="v1.1"]', body: 'Abrimos la <b>v1.1</b>.', click: true },
        { sel: '#wsVerbar', body: 'Se ve <b>tal como quedó</b>, en solo lectura.' },
        { sel: '#wsTree', body: 'Con sus capítulos, departamentos y precios de entonces.' }
      ] },
    // 5 · Consulta (Usuario autorizado)
    'PPTO-17': { ph: '5 · Consulta', page: 'consulta.html', role: 'USUARIO',
      title: 'Consultar precios', purpose: 'Ver lo que rige para mi rol, por departamento, en solo lectura.',
      steps: [
        { sel: '#cqContexto', body: 'Primero <b>qué rige</b>: el catálogo para tu rol, su versión vigente y desde cuándo. Lo que está en preparación no se ve aquí.' },
        { sel: '#cqCat, #cqContexto', body: 'Marta es <b>Gestora de presupuesto</b>: ve dos catálogos. Andrés, <b>Revisor técnico</b>, solo ve la base general (cámbialo en <b>Cambiar perfil</b>).' },
        { sel: '#cqDepto', body: 'El <b>departamento</b>, arriba del árbol.' },
        { sel: '#catTree', body: 'Sin APU elegido, los <b>capítulos</b> se ven a todo lo ancho y expandidos: cada APU con su <b>precio por unidad</b> y si cuadra con sus insumos.' },
        { sel: '[data-apu="apu-3.4"]', body: 'Clic en un APU.', click: true },
        { sel: '#itemFold', body: 'La tabla se contrae a árbol y entra el <b>detalle</b>: precio por unidad, control del valor y composición, listos para el presupuesto.' },
        { sel: '#cqCerrar', body: '<b>Ver todos los capítulos</b> vuelve a la tabla ancha.' }
      ] },
    'PPTO-18': { ph: '5 · Consulta', page: 'consulta.html', role: 'USUARIO',
      title: 'Buscar APU o insumo', purpose: 'Llegar a un precio sin recorrer el árbol.',
      steps: [
        { sel: '#itemSearch', body: '<b>Busca</b> por código o nombre, sin importar tildes.', fill: { sel: '#itemSearch', value: 'concreto' } },
        { sel: '#cqRes', body: 'Trae los <b>APU</b> que coinciden y los <b>insumos</b>, con los APU que los usan.' },
        { sel: '#itemFold', body: 'Clic en un resultado abre su detalle, con el árbol al lado.', act: function () { var b = document.querySelector('#cqRes [data-go]'); if (b) b.click(); } }
      ] },
    // 6 · Historial
    'PPTO-19': { ph: '6 · Historial', page: 'catalogo-detalle.html', role: 'ADMIN', params: { cat: GEN, tab: 'historial' },
      title: 'Historial de cambios', purpose: 'Trazabilidad para auditorías: toda acción sobre el catálogo, su contenido y sus versiones.',
      steps: [
        { sel: '#audTable', body: 'Cada entrada: fecha, <b>acción</b>, elemento, <b>versión</b>, departamento y responsable. Es de solo lectura.' },
        { sel: '#audBody .t-aud-row.rd-click', body: 'Las que tienen detalle se despliegan: antes y después, el motivo o el archivo importado.', click: true },
        { sel: '#audBody .t-aud-det:not([hidden]), #audTable', body: 'El detalle tal como quedó registrado.' }
      ] },
    'PPTO-20': { ph: '6 · Historial', page: 'catalogo-detalle.html', role: 'ADMIN', params: { cat: GEN, tab: 'historial' },
      title: 'Filtrar historial', purpose: 'Ubicar rápido un cambio específico.',
      steps: [
        { sel: '#audAccion', body: 'Filtros combinables: <b>acción</b>…' },
        { sel: '#audElemento', body: '…<b>elemento</b> (catálogo, versión, capítulo, APU, insumo, importación)…' },
        { sel: '#audVersion', body: '…<b>versión</b>…' },
        { sel: '#audUsuario', body: '…<b>responsable</b>…' },
        { sel: '#audFecha', body: '…y <b>rango de fechas</b>.' },
        { sel: '#audCount', body: 'El conteo dice cuántos registros coinciden.' }
      ] },
    'PPTO-21': { ph: '6 · Historial', page: 'catalogo-detalle.html', role: 'ADMIN', params: { cat: GEN, tab: 'historial' },
      title: 'Exportar historial', purpose: 'Llevar la traza a reportes externos o procesos legales.',
      steps: [
        { sel: '#btnExport', body: '<b>Exportar</b> toma el historial tal como se ve: con los filtros aplicados, o completo.', click: true },
        { sel: '#rmExportXls', body: 'Excel, PDF o CSV, con la fecha de generación y los filtros en el encabezado.' },
        { center: true, body: 'Cada exportación queda registrada en el Historial.' }
      ] }
  };
  var PERFIL = { ADMIN: 'Admin', USUARIO: 'Gestor', REVISOR: 'Revisor' };
  var ORDER = ['PPTO-01','PPTO-02','PPTO-03','PPTO-04','PPTO-05','PPTO-06','PPTO-07','PPTO-08','PPTO-09','PPTO-10','PPTO-11','PPTO-12','PPTO-13','PPTO-14','PPTO-15','PPTO-16','PPTO-17','PPTO-18','PPTO-19','PPTO-20','PPTO-21'];

  // ── Estado ──
  var curHab = null, curStep = 0, _retry = null, _stepActed = false, _curEl = null, _curSel = null, _remeasure = null, _filled = {};
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
      'body:has(.naowee-modal-overlay.open) .tt-launch,body:has(.naowee-modal-overlay.open) .t-rolepill{display:none;}' +
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
      '<div class="tt-panel-sub">Proceso A · Catálogo de Precios (21 HU, ajustadas al backend). Cada recorrido cambia solo a la pantalla y al perfil que necesita.</div>';
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

  // ── Arranque de un tour (navega si hace falta: otra pantalla, otro rol u otro catálogo) ──
  // t.params: parámetros de URL que la HU necesita (cat, tab, apu, dep…).
  // t.antes(D): deja los datos en el estado que la HU necesita (idempotente: corre también
  // después de navegar).
  function runTour(hab, desde) {
    var t = TOURS[hab]; if (!t) return;
    closeOverlays(null);
    curHab = hab; curStep = desde || 0; _stepActed = false; _filled = {}; renderStep();
  }
  function start(hab) {
    var t = TOURS[hab]; if (!t) return;
    try { if (t.antes && window.OBRAS) t.antes(window.OBRAS); } catch (e) {}
    var params = t.params || {};
    var igual = PAGE === t.page && t.role === ROLE && Object.keys(params).every(function (k) { return qs(k) === String(params[k]); });
    if (!igual) {
      var p = new URLSearchParams();
      p.set('role', t.role); p.set('tour', hab);
      if (qs('proyecto')) p.set('proyecto', qs('proyecto'));
      Object.keys(params).forEach(function (k) { p.set(k, params[k]); });
      location.href = t.page + '?' + p.toString();
      return;
    }
    runTour(hab);
  }
  // Pasos que navegan a otra pantalla (nav:true): el recorrido sigue allá en el paso siguiente.
  function marcarNav(step) {
    if (!step.nav) return;
    try { sessionStorage.setItem('obrasTourResume', JSON.stringify({ hab: curHab, step: curStep + 1 })); } catch (e) {}
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
    // fill: el tour escribe en un campo para mostrar un cambio real (una vez por paso;
    // volver atrás no lo vuelve a aplicar).
    var fk = curHab + '#' + curStep;
    if (step.fill && !_filled[fk]) {
      var fe = document.querySelector(step.fill.sel);
      if (fe) {
        _filled[fk] = 1;
        var nv = typeof step.fill.value === 'function' ? step.fill.value(fe.value) : step.fill.value;
        if (fe.value !== nv) { fe.value = nv; fe.dispatchEvent(new Event('input', { bubbles: true })); }
      }
    }
    closeOverlays(overlayOf(_curEl));
    if (_curEl) {
      backdrop.style.display = 'none';
      bringIntoView(_curEl);
      placeSpot(spot, _curEl);
      _remeasure = setTimeout(function () { reposition(); }, 260);
      if (step.click) { _curEl.addEventListener('click', function onc() { _stepActed = true; marcarNav(step); }, { once: true }); }
    } else {
      spot.style.display = 'none';
      backdrop.style.display = 'block';
    }
    coach.innerHTML =
      '<div class="tt-coach-h"><span class="tt-chip">' + curHab + '</span><span class="tt-phase">' + t.ph + ' · ' + (PERFIL[t.role] || t.role) + '</span><button class="tt-x" aria-label="Cerrar">&times;</button></div>' +
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
        // act: el paso ejecuta una acción de la página al avanzar (p. ej. cargar el archivo de
        // ejemplo sin abrir el explorador de archivos) y espera a que se pinte.
        if (step.act && !_stepActed) {
          _stepActed = true;
          try { step.act(); } catch (e) {}
          setTimeout(function () { _stepActed = false; curStep = Math.min(t.steps.length - 1, curStep + 1); renderStep(); }, 450);
          return;
        }
        if (step.click && !_stepActed) {
          var el = findTarget(step.sel);
          if (el) { _stepActed = true; marcarNav(step); try { el.click(); } catch (e) {} setTimeout(function () { _stepActed = false; curStep = Math.min(t.steps.length - 1, curStep + 1); renderStep(); }, 400); return; }
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
    var res = null;
    try { res = JSON.parse(sessionStorage.getItem('obrasTourResume') || 'null'); sessionStorage.removeItem('obrasTourResume'); } catch (e) {}
    if (res && TOURS[res.hab] && TOURS[res.hab].steps[res.step] && (TOURS[res.hab].steps[res.step].page || TOURS[res.hab].page) === PAGE) {
      setTimeout(function () { runTour(res.hab, res.step); }, 600); return;
    }
    var auto = qs('tour');
    if (auto && TOURS[auto]) setTimeout(function () { start(auto); }, 500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
