/* ============================================================================
 * Proyecto de Obras · Presupuesto — Catálogo de Precios (modelo del backend)
 * Store demo (localStorage, namespaced por ?proyecto= vía proyecto-ns.js).
 *
 * v0.7 · El modelo sigue al backend actual (micro-presupuesto, import-apu-excel):
 *  - Un catálogo es una BASE DE PRECIOS; cada versión es una price_base. Todo cambio
 *    (editar, importar, retirar) cae en la "vN en preparación"; la vigente no se toca
 *    hasta activarla. Así una versión histórica nunca cambia después de publicada
 *    (era el bug del snapshot de v0.6: se congelaba al crear la siguiente).
 *  - El DEPARTAMENTO es una dimensión del catálogo, no otro catálogo: el alcance es
 *    departamentos + roles + condición adicional.
 *  - Estructura fija de 3 niveles: Capítulo › APU › insumo, con las columnas fijas del
 *    Excel. Capítulos e insumos son GLOBALES (por nombre / por código, sin versión):
 *    renombrarlos cambia todas las versiones, por eso la UI lo advierte.
 *  - El valor del APU viene del archivo (Valor total) y no se recalcula: la demo lo
 *    contrasta con la suma de sus insumos ("control del valor").
 *
 * ⚠ PRECIOS SINTÉTICOS. La estructura replica la matriz APU de EnTerritorio; los
 * VALORES son inventados (mismo orden de magnitud). La matriz real no entra al repo.
 * ========================================================================== */
(function () {
  'use strict';

  var LS_KEY = 'obras-ppto-catalogos';
  var LS_GLOBAL = 'obras-ppto-globales';
  var LS_AUDIT = 'obras-ppto-auditoria';
  var LS_PPTOS = 'obras-ppto-presupuestos';
  var LS_SEEDV = 'obras-ppto-seedv';
  var SEED_V = 8;

  // Los 33 departamentos tal como están en m_regions: la hoja "APU <nombre>" tiene que
  // coincidir exacto (mayúsculas y tildes) o el endpoint la omite.
  var DEPARTAMENTOS = ['Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bogotá, D. C.', 'Bolívar', 'Boyacá', 'Caldas',
    'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila',
    'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda',
    'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'];

  // Roles del backend a los que aplica un catálogo (condición "rol" del alcance).
  var ROLES_ALCANCE = ['Gestor de presupuesto', 'Revisor técnico', 'Interventoría', 'Supervisor de obra'];

  // Columnas fijas del Excel que acepta el endpoint (encabezados literales).
  var COLUMNAS = ['APU', 'Código', 'Nombre', 'unidad', 'Cantidad', 'Valor unitario', 'Valor total'];

  var UNIDADES = ['bls', 'bt', 'cj', 'cñ', 'dis.', 'día', 'glb', 'gln', 'h', 'jg', 'jr', 'kg', 'lb', 'lt', 'm', 'm2', 'm3', 'm3-km', 'mes', 'ml', 'pq', 'rol', 'ton', 'un', 'vj'];

  // Semilla: 7 capítulos · 45 APU. B = valor en Bogotá (sintético); los demás
  // departamentos salen de un factor regional estable (ver factorDe).
  var SEED = [
    { cap: '1', nombre: 'Preliminares', apus: [
      ['1.1', 'Demolición cielo raso falso (incluye retiro)', 'm2', 18420], ['1.2', 'Demolición de caja de inspección 0,60 x 0,60 m (incluye retiro)', 'un', 71350],
      ['1.3', 'Demolición de caja de inspección 0,80 x 0,80 m (incluye retiro)', 'un', 96480], ['1.4', 'Demolición de caja de inspección 1,00 x 1,00 m (incluye retiro)', 'un', 158700],
      ['1.5', 'Demolición de caja de inspección 1,20 x 1,20 m (incluye retiro)', 'un', 139240], ['1.6', 'Demolición de mesón en concreto (incluye retiro)', 'm', 81560],
      ['1.7', 'Transporte y disposición de escombros en volqueta', 'vj', 385000]] },
    { cap: '2', nombre: 'Excavaciones y rellenos', apus: [
      ['2.1', 'Excavación manual en conglomerado h=0.0-2.0 m (retiro <5 km)', 'm3', 63920], ['2.2', 'Excavación manual zanja en tierra h=1.0 m', 'm3', 44710],
      ['2.3', 'Relleno con material del sitio compactado mecánicamente', 'm3', 41830], ['2.4', 'Relleno material granular seleccionado, compactado manual', 'm3', 72150],
      ['2.5', 'Rellenos agregado en material de base compactada mecánicamente', 'm3', 268940], ['2.6', 'Rellenos en material seleccionado de la excavación, manual', 'm3', 18270]] },
    { cap: '3', nombre: 'Cimentación', apus: [
      ['3.1', 'Base agregado pétreo (material de afirmado)', 'm3', 171280], ['3.2', 'Base arena cemento 1:20 (hecho en obra)', 'm3', 295640],
      ['3.3', 'Base en concreto pobre (hecho en obra)', 'm3', 556190], ['3.4', 'Concreto ciclópeo (60% concreto 2500 PSI + 40% piedra media zonga)', 'm3', 672480],
      ['3.5', 'Dados en concreto 3500 PSI', 'm3', 993640], ['3.6', 'Placa de concreto 2500 PSI e=10 cm (incluye malla M-131)', 'm2', 160120]] },
    { cap: '4', nombre: 'Estructuras en concreto', apus: [
      ['4.1', 'Acero figurado 37000 PSI', 'kg', 10320], ['4.2', 'Acero figurado 60000 PSI', 'kg', 8324], ['4.3', 'Base en concreto de limpieza 1500 PSI', 'm3', 500760],
      ['4.4', 'Columnas cualquier área 3000 PSI', 'm3', 1103290], ['4.5', 'Columnas cualquier área 3500 PSI', 'm3', 1452940],
      ['4.6', 'Columneta concreto 3000 PSI cualquier dimensión (incluye refuerzo)', 'm', 108020]] },
    { cap: '5', nombre: 'Mampostería', apus: [
      ['5.1', 'Alfajía en ladrillo prensado macizo', 'm', 70740], ['5.2', 'Anclaje 1/2" l=50 cm', 'un', 27440], ['5.3', 'Anclaje 3/8" l=30 cm', 'un', 20610],
      ['5.4', 'Apoyo en bloque no. 5 para mesón o lavadero (incluye pañete)', 'm', 72550], ['5.5', 'Dintel en sistema estructural steel frame', 'm', 40510],
      ['5.6', 'Dinteles concreto cualquier medida de 2500 PSI', 'm', 99770]] },
    { cap: '8', nombre: 'Instalaciones hidrosanitarias', apus: [
      ['8.1', 'Acometida en PVC 1/2" 5 m', 'un', 470400], ['8.2', 'Caja contador de agua', 'un', 138310], ['8.3', 'Caja de inspección 100 x 100 (incluye excavación)', 'un', 762680],
      ['8.4', 'Caja de inspección 40 x 40 (incluye excavación)', 'un', 496760], ['8.5', 'Caja de inspección 60 x 60 (incluye excavación)', 'un', 454150],
      ['8.6', 'Caja de inspección 80 x 80 (incluye excavación)', 'un', 751790], ['8.7', 'Prueba hidrostática de red de suministro', 'glb', 640000]] },
    { cap: '16', nombre: 'Pinturas', apus: [
      ['16.1', 'Estuco', 'm2', 17590], ['16.2', 'Estuco (lineal)', 'm', 8877], ['16.3', 'Estuco plástico acrílico sobre muros (incluye filos y dilataciones)', 'm2', 31550],
      ['16.4', 'Estuco y vinilo 3 manos', 'm2', 31005], ['16.5', 'Estuco y vinilo 3 manos (lineal)', 'm', 24090],
      ['16.6', 'Impermeabilización fachada en Sika transparente o similar', 'm2', 14456], ['16.7', 'Cuadrilla de pintura (oficial + ayudante)', 'día', 265000]] }
  ];

  // Insumos globales (m_products, por reference). El material principal es uno por capítulo.
  var MATERIAL = { '1': ['Retiro y cargue de sobrantes', 'm3'], '2': ['Material de relleno seleccionado', 'm3'], '3': ['Concreto de obra 2500 PSI', 'm3'],
    '4': ['Concreto premezclado 3000 PSI', 'm3'], '5': ['Bloque de arcilla No. 5', 'un'], '8': ['Tubería y accesorios PVC', 'glb'], '16': ['Pintura tipo 1 / estuco', 'gln'] };
  var CON_TRANSPORTE = { '2': 1, '3': 1, '4': 1, '5': 1 };

  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
  // Factor regional estable: la periferia es más cara (transporte), el centro cerca de Bogotá.
  var FACTOR_FIJO = { 'Bogotá, D. C.': 1, 'Antioquia': 0.995, 'Cundinamarca': 0.985, 'Amazonas': 1.035, 'Vichada': 1.04, 'Guainía': 1.06, 'Vaupés': 1.07, 'San Andrés y Providencia': 1.09 };
  function factorDe(depto) { return FACTOR_FIJO[depto] != null ? FACTOR_FIJO[depto] : 0.97 + (hash(depto) % 70) / 1000; }

  function uid(p) { return (p || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function isoLocal(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function nuevaFecha(daysAgo) { var d = new Date(); d.setDate(d.getDate() - (daysAgo || 0)); return isoLocal(d); }
  function r2(n) { return Math.round(n); }

  // Composición de un APU de valor V en un departamento: mano de obra, material, transporte
  // (en los capítulos que lo llevan) y herramienta menor = 5 % de la mano de obra. Los
  // valores unitarios cuadran con V: la suma de sus insumos da el valor del APU.
  function composicion(cap, V) {
    var mo = V * 0.32, herr = r2(mo * 0.05), tr = CON_TRANSPORTE[cap] ? V * 0.06 : 0;
    var vuMo = 185000, cMo = Math.round(mo / vuMo * 10000) / 10000, tMo = r2(cMo * vuMo);
    var det = [{ ins: 'MO-01', cantidad: cMo, valorUnit: vuMo }];
    var tTr = 0;
    if (tr) { var vuTr = r2(tr / 0.1); det.push({ ins: 'TR-01', cantidad: 0.1, valorUnit: vuTr }); tTr = r2(vuTr * 0.1); }
    det.push({ ins: 'EQ-01', cantidad: 1, valorUnit: herr });
    // El material cierra la cuenta para que la suma sea exactamente V.
    var tMat = V - tMo - tTr - herr, vuMat = Math.round(tMat / 1.05 * 100) / 100;
    det.splice(1, 0, { ins: 'MA-' + cap, cantidad: 1.05, valorUnit: vuMat });
    return det;
  }
  // La matriz real redondea cada fila de insumo: diferencias de unos pesos entre el valor del
  // APU y la suma de sus insumos son ruido (se vieron en casi todos los APU de la matriz de
  // agosto). Se marca solo lo que pasa de $20 o del 0,5 %.
  function tolerancia(v) { return Math.max(20, Math.abs(v || 0) * 0.005); }
  function totalDet(d) { return Math.round((+d.cantidad || 0) * (+d.valorUnit || 0)); }
  function sumaInsumos(p) { return (p && p.det || []).reduce(function (s, d) { return s + totalDet(d); }, 0); }

  // ── Globales: capítulos (m_categories) e insumos (m_products) ──
  function seedGlobales() {
    var g = { capitulos: {}, insumos: {} };
    SEED.forEach(function (ch, i) { g.capitulos['cap-' + ch.cap] = { id: 'cap-' + ch.cap, cod: ch.cap, nombre: ch.nombre, orden: i + 1 }; });
    g.insumos['MO-01'] = { cod: 'MO-01', nombre: 'Cuadrilla (oficial + ayudante)', unidad: 'jr' };
    g.insumos['TR-01'] = { cod: 'TR-01', nombre: 'Transporte de materiales', unidad: 'vj' };
    g.insumos['EQ-01'] = { cod: 'EQ-01', nombre: 'Herramienta menor (5 % de la mano de obra)', unidad: 'glb' };
    Object.keys(MATERIAL).forEach(function (c) { g.insumos['MA-' + c] = { cod: 'MA-' + c, nombre: MATERIAL[c][0], unidad: MATERIAL[c][1] }; });
    return g;
  }

  // Contenido de una versión: capítulos que usa, sus APU y los precios por departamento.
  // opts: { caps: n primeros capítulos, deptos: [..], f: factor de precios de la época }
  function contenidoSemilla(opts) {
    var caps = SEED.slice(0, opts.caps || SEED.length), c = { capitulos: [], apus: [], precios: {} };
    caps.forEach(function (ch) {
      c.capitulos.push({ id: 'cap-' + ch.cap, activo: true });
      ch.apus.forEach(function (a, j) { c.apus.push({ id: 'apu-' + a[0], cod: a[0], capId: 'cap-' + ch.cap, nombre: a[1], unidad: a[2], orden: j + 1, activo: true }); });
    });
    (opts.deptos || []).forEach(function (d) {
      var p = c.precios[d] = {};
      caps.forEach(function (ch) {
        ch.apus.forEach(function (a) {
          var V = Math.round(a[3] * factorDe(d) * (opts.f || 1));
          p['apu-' + a[0]] = { valor: V, det: composicion(ch.cap, V) };
        });
      });
    });
    return c;
  }

  function mkVersion(v, estado, motivo, autor, dias, contenido, extra) {
    return Object.assign({ v: v, estado: estado, motivo: motivo, autor: autor, fecha: nuevaFecha(dias), contenido: contenido }, extra || {});
  }

  function seedCatalogos() {
    var D4 = ['Bogotá, D. C.', 'Antioquia', 'Amazonas', 'Vichada'];
    // 1 · La base general: 33 departamentos en el alcance, 4 cargados en la vigente. La v1.4
    // en preparación ya trae tres cambios (para revisar y activar sin preparar nada).
    var gen = {
      id: 'cat-general', nombre: 'Base de precios general 2026', vigenciaIni: '2026-01-01', vigenciaFin: '2026-12-31',
      alcance: { deptos: DEPARTAMENTOS.slice(), roles: ['Gestor de presupuesto', 'Revisor técnico'], condicion: 'Obras de vivienda y equipamiento' },
      estado: 'Activo', creado: nuevaFecha(160), creadoPor: 'Jesús Díaz', importaciones: [],
      versiones: [
        mkVersion('v1.0', 'historica', 'Versión inicial de la base', 'Jesús Díaz', 160, contenidoSemilla({ caps: 3, deptos: D4.slice(0, 2), f: 0.94 }), { activada: nuevaFecha(158) }),
        mkVersion('v1.1', 'historica', 'Se agregan estructuras en concreto y mampostería', 'Carla Méndez', 120, contenidoSemilla({ caps: 5, deptos: D4.slice(0, 3), f: 0.965 }), { activada: nuevaFecha(118) }),
        mkVersion('v1.2', 'historica', 'Se agregan instalaciones hidrosanitarias y pinturas', 'Jesús Díaz', 75, contenidoSemilla({ caps: 7, deptos: D4, f: 0.99 }), { activada: nuevaFecha(74) }),
        mkVersion('v1.3', 'vigente', 'Actualización de precios 2026 (IPC)', 'Carla Méndez', 30, contenidoSemilla({ caps: 7, deptos: D4, f: 1 }), { activada: nuevaFecha(29) })
      ]
    };
    var prep = clone(gen.versiones[3].contenido);
    // Cambio 1: el valor del 3.4 en Bogotá se editó y ya no cuadra con sus insumos (HU08).
    prep.precios['Bogotá, D. C.']['apu-3.4'].valor = 689900;
    // Cambio 2: se retira la cuadrilla de pintura (16.7) con motivo.
    prep.apus.filter(function (a) { return a.id === 'apu-16.7'; })[0].activo = false;
    prep.apus.filter(function (a) { return a.id === 'apu-16.7'; })[0].motivoRetiro = 'Se contrata como servicio aparte';
    // Cambio 3: APU nuevo 5.7 en Mampostería, cargado solo en Bogotá.
    prep.apus.push({ id: 'apu-5.7', cod: '5.7', capId: 'cap-5', nombre: 'Muro en bloque de concreto e=15 cm', unidad: 'm2', orden: 7, activo: true });
    prep.precios['Bogotá, D. C.']['apu-5.7'] = { valor: 96400, det: composicion('5', 96400) };
    gen.versiones.push(mkVersion('v1.4', 'preparacion', '', 'Jesús Díaz', 6, prep));
    // La importación con la que se armó la v1.3 (historial de importaciones, HU14).
    gen.importaciones = [{ id: 'imp-v13', archivo: 'Base_Matriz_2026-agosto.xlsx', destino: 'v1.3', modo: 'actualizar', fecha: nuevaFecha(31), hora: '09:10', usuario: 'Carla Méndez',
      deptos: D4.map(function (d, i) { return { depto: d, hoja: 'APU ' + d, estado: 'ok', filas: 211, creados: 0, actualizados: 45, avisos: i === 2 ? 1 : 0, errores: 0,
        detalleAvisos: i === 2 ? ['El APU 8.3 vale $790.370 y la suma de sus insumos da $789.310.'] : [], detalleErrores: [] }; }) }];

    // 2 · Catálogo de un programa: 5 departamentos, solo para gestores. 2 sin cargar.
    var D5 = ['Antioquia', 'Boyacá', 'Cauca', 'Nariño', 'Tolima'];
    var rural = {
      id: 'cat-rural', nombre: 'Mejoramiento de vivienda rural 2026', vigenciaIni: '2026-02-01', vigenciaFin: '2026-12-31',
      alcance: { deptos: D5, roles: ['Gestor de presupuesto'], condicion: 'Programa de mejoramiento rural' },
      estado: 'Activo', creado: nuevaFecha(90), creadoPor: 'Carla Méndez', importaciones: [],
      versiones: [
        mkVersion('v1.0', 'historica', 'Versión inicial', 'Carla Méndez', 90, contenidoSemilla({ caps: 5, deptos: ['Antioquia', 'Boyacá'], f: 0.97 }), { activada: nuevaFecha(88) }),
        mkVersion('v1.1', 'vigente', 'Se carga Nariño y se actualizan precios', 'Carla Méndez', 40, contenidoSemilla({ caps: 5, deptos: ['Antioquia', 'Boyacá', 'Nariño'], f: 1 }), { activada: nuevaFecha(39) })
      ]
    };

    // 3 · Recién creado: v1.0 en preparación sin contenido (lienzo para HU01/04/13).
    var caribe = {
      id: 'cat-caribe', nombre: 'Interventoría obras Caribe 2026', vigenciaIni: '2026-03-01', vigenciaFin: '2026-12-31',
      alcance: { deptos: ['Atlántico', 'Bolívar', 'Cesar', 'La Guajira', 'Magdalena'], roles: ['Revisor técnico', 'Interventoría'], condicion: '' },
      estado: 'Borrador', creado: nuevaFecha(2), creadoPor: 'Jesús Díaz', importaciones: [],
      versiones: [mkVersion('v1.0', 'preparacion', '', 'Jesús Díaz', 2, { capitulos: [], apus: [], precios: {} })]
    };

    // 4 · Del año pasado: inactivo, no aparece en Consulta.
    var viejo = {
      id: 'cat-2025', nombre: 'Base de precios general 2025', vigenciaIni: '2025-01-01', vigenciaFin: '2025-12-31',
      alcance: { deptos: D4, roles: ['Gestor de presupuesto', 'Revisor técnico'], condicion: '' },
      estado: 'Inactivo', motivoInactivo: 'Reemplazada por la base 2026', creado: nuevaFecha(420), creadoPor: 'Jesús Díaz', importaciones: [],
      versiones: [
        mkVersion('v1.0', 'historica', 'Versión inicial', 'Jesús Díaz', 420, contenidoSemilla({ caps: 4, deptos: D4.slice(0, 2), f: 0.88 }), { activada: nuevaFecha(418) }),
        mkVersion('v1.1', 'vigente', 'Ajuste de precios', 'Jesús Díaz', 300, contenidoSemilla({ caps: 4, deptos: D4.slice(0, 2), f: 0.91 }), { activada: nuevaFecha(299) })
      ]
    };
    return [gen, rural, caribe, viejo];
  }

  function seedAuditoria(cats) {
    var log = [];
    function add(cat, accion, elemento, resp, dias, hora, extra) {
      log.push(Object.assign({ id: uid('aud'), catId: cat.id, catNombre: cat.nombre, accion: accion, elemento: elemento, responsable: resp, fecha: nuevaFecha(dias), hora: hora }, extra || {}));
    }
    cats.forEach(function (c) {
      var d0 = Math.round((Date.now() - Date.parse(c.creado + 'T12:00:00')) / 864e5);
      add(c, 'Crear catálogo', 'Catálogo', c.creadoPor, d0, '08:40', { version: 'v1.0' });
      c.versiones.forEach(function (v) {
        if (v.activada) {
          var dv = Math.round((Date.now() - Date.parse(v.activada + 'T12:00:00')) / 864e5);
          add(c, 'Importar matriz', 'Importación · ' + Object.keys(v.contenido.precios).length + ' departamentos', v.autor, dv + 1, '09:10', { version: v.v, detalle: { archivo: 'Base_Matriz_' + v.v + '.xlsx', deptos: Object.keys(v.contenido.precios) } });
          add(c, 'Activar versión', 'Versión · ' + v.v, v.autor, dv, '11:30', { version: v.v, detalle: { motivo: v.motivo } });
        }
      });
      if (c.estado === 'Inactivo') add(c, 'Desactivar catálogo', 'Catálogo', 'Jesús Díaz', 40, '10:05', { detalle: { motivo: c.motivoInactivo } });
    });
    var gen = cats[0];
    add(gen, 'Abrir versión', 'Versión · v1.4', 'Jesús Díaz', 6, '08:15', { version: 'v1.4' });
    add(gen, 'Editar valor del APU', 'APU · 3.4', 'Carla Méndez', 5, '15:45', { version: 'v1.4', depto: 'Bogotá, D. C.', detalle: { cambios: [{ etiqueta: 'Valor del APU', antes: '$672.480', despues: '$689.900' }] } });
    add(gen, 'Retirar APU', 'APU · 16.7', 'Jesús Díaz', 4, '10:20', { version: 'v1.4', detalle: { motivo: 'Se contrata como servicio aparte' } });
    add(gen, 'Crear APU', 'APU · 5.7', 'Jesús Díaz', 3, '09:05', { version: 'v1.4', depto: 'Bogotá, D. C.' });
    return log;
  }

  // Presupuestos que usan el catálogo: la demo no los arma, pero sin ellos no se ve qué
  // queda en qué versión al activar (HU15) ni el impacto de editar un APU.
  function seedPresupuestos() {
    function p(cat, nombre, version, estado, depto, apus, resp) { return { id: uid('pp'), catId: cat, nombre: nombre, version: version, estado: estado, depto: depto, apus: apus, responsable: resp }; }
    return [
      p('cat-general', 'Mejoramiento de vivienda rural — Usme, lote 1', 'v1.3', 'En elaboración', 'Bogotá, D. C.', ['1.1', '3.4', '4.4', '16.4'], 'Marta Ríos'),
      p('cat-general', 'Vivienda rural nueva — Sumapaz, fase 2', 'v1.3', 'En revisión', 'Bogotá, D. C.', ['2.1', '3.4', '5.6'], 'Andrés Pérez'),
      p('cat-general', 'Reforzamiento estructural — Ciudad Bolívar', 'v1.3', 'Aprobado', 'Bogotá, D. C.', ['4.1', '4.2', '4.4'], 'Marta Ríos'),
      p('cat-general', 'Vivienda rural — Pasquilla', 'v1.2', 'Aprobado', 'Bogotá, D. C.', ['3.4', '8.3'], 'Andrés Pérez'),
      p('cat-general', 'Centro de desarrollo infantil — Leticia', 'v1.3', 'En elaboración', 'Amazonas', ['3.3', '4.4', '16.7'], 'Marta Ríos'),
      p('cat-rural', 'Mejoramiento de vivienda — Urabá', 'v1.1', 'En elaboración', 'Antioquia', ['1.2', '3.3'], 'Marta Ríos')
    ];
  }

  function read(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; } }
  function write(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); return true; } catch (e) { return false; } }

  function ensure() {
    var cats = read(LS_KEY);
    if (!cats || !cats.length || read(LS_SEEDV) !== SEED_V) {
      cats = seedCatalogos();
      write(LS_SEEDV, SEED_V);
      write(LS_KEY, cats);
      write(LS_GLOBAL, seedGlobales());
      write(LS_AUDIT, seedAuditoria(cats));
      write(LS_PPTOS, seedPresupuestos());
    }
    return cats;
  }
  function globales() { ensure(); return read(LS_GLOBAL) || seedGlobales(); }

  function usuarioActual() { try { return window.OBRAS_SHELL.roleData.who; } catch (e) { return 'Jesús Díaz'; } }

  function sigVersion(cat) {
    var max = cat.versiones.reduce(function (m, v) { var n = v.v.replace('v', '').split('.').map(Number); return n[0] * 1000 + n[1] > m ? n[0] * 1000 + n[1] : m; }, 0);
    return 'v' + Math.floor(max / 1000) + '.' + (max % 1000 + 1);
  }

  var API = {
    DEPARTAMENTOS: DEPARTAMENTOS,
    ROLES_ALCANCE: ROLES_ALCANCE,
    COLUMNAS: COLUMNAS,
    UNIDADES: UNIDADES,
    usuarioActual: usuarioActual,
    hoy: function () { return nuevaFecha(0); },
    clone: clone,
    reset: function () { [LS_KEY, LS_GLOBAL, LS_AUDIT, LS_PPTOS, LS_SEEDV].forEach(function (k) { localStorage.removeItem(k); }); ensure(); },

    // ── Catálogos ──
    listCatalogos: function () { return ensure(); },
    getCatalogo: function (id) { return ensure().filter(function (c) { return c.id === id; })[0] || null; },
    saveCatalogo: function (cat) {
      var cats = ensure(), i = cats.map(function (c) { return c.id; }).indexOf(cat.id);
      if (i >= 0) cats[i] = cat; else cats.unshift(cat);
      if (!write(LS_KEY, cats)) { try { window.OBRAS_UI.toast('El navegador no tiene espacio para guardar la demo. Usa <b>Reiniciar demo</b>.', 'negative', 6000); } catch (e) {} }
      return cat;
    },
    // HU01: nace con la v1.0 en preparación, sin contenido.
    newCatalogo: function (data) {
      var cat = {
        id: uid('cat'), nombre: data.nombre, vigenciaIni: data.vigenciaIni, vigenciaFin: data.vigenciaFin,
        alcance: { deptos: data.deptos || [], roles: data.roles || [], condicion: data.condicion || '' },
        estado: 'Borrador', creado: nuevaFecha(0), creadoPor: usuarioActual(), importaciones: [],
        versiones: [mkVersion('v1.0', 'preparacion', '', usuarioActual(), 0, { capitulos: [], apus: [], precios: {} })]
      };
      this.saveCatalogo(cat);
      this.logAudit(cat, 'Crear catálogo', 'Catálogo', { version: 'v1.0', detalle: { cambios: [
        { etiqueta: 'Departamentos', antes: '—', despues: cat.alcance.deptos.length + ' de 33' },
        { etiqueta: 'Roles', antes: '—', despues: cat.alcance.roles.join(', ') || '—' }] } });
      return cat;
    },

    // ── Versiones ──
    vigente: function (cat) { return cat.versiones.filter(function (v) { return v.estado === 'vigente'; })[0] || null; },
    preparacion: function (cat) { return cat.versiones.filter(function (v) { return v.estado === 'preparacion'; })[0] || null; },
    version: function (cat, v) { return cat.versiones.filter(function (x) { return x.v === v; })[0] || null; },
    // Todo cambio se hace sobre la versión en preparación; si no hay, se abre una copiando la
    // vigente. Devuelve { v, nueva } para que la UI avise "se abrió la v1.5".
    abrirPreparacion: function (cat, motivo) {
      var p = this.preparacion(cat);
      if (p) return { ver: p, nueva: false };
      var vig = this.vigente(cat);
      p = mkVersion(sigVersion(cat), 'preparacion', motivo || '', usuarioActual(), 0, vig ? clone(vig.contenido) : { capitulos: [], apus: [], precios: {} });
      cat.versiones.push(p);
      this.saveCatalogo(cat);
      this.logAudit(cat, 'Abrir versión', 'Versión · ' + p.v, { version: p.v, detalle: vig ? { motivo: 'Copia de la ' + vig.v + ' vigente' } : null });
      return { ver: p, nueva: true };
    },
    // HU15: la vigente pasa a histórica con su contenido intacto; la preparación rige.
    activar: function (cat, motivo) {
      var p = this.preparacion(cat); if (!p) return null;
      var vig = this.vigente(cat);
      if (vig) vig.estado = 'historica';
      p.estado = 'vigente'; p.motivo = motivo; p.activada = nuevaFecha(0); p.autor = usuarioActual();
      if (cat.estado === 'Borrador') cat.estado = 'Activo';
      this.saveCatalogo(cat);
      this.logAudit(cat, 'Activar versión', 'Versión · ' + p.v, { version: p.v, detalle: { motivo: motivo } });
      return p;
    },
    // Descartar la versión en preparación (vuelve a regir solo la vigente).
    descartarPreparacion: function (cat, motivo) {
      var p = this.preparacion(cat); if (!p) return;
      cat.versiones = cat.versiones.filter(function (v) { return v !== p; });
      this.saveCatalogo(cat);
      this.logAudit(cat, 'Descartar versión', 'Versión · ' + p.v, { version: p.v, detalle: { motivo: motivo } });
    },
    cambiosDe: function (cat, v) {
      return this.listAuditoria().filter(function (a) { return a.catId === cat.id && a.version === v && a.accion !== 'Abrir versión' && a.accion !== 'Activar versión'; });
    },
    // Lo que falta para activar una versión (checklist del espacio de trabajo, HU01/15).
    requisitos: function (cat, ver) {
      var c = ver.contenido, cargados = Object.keys(c.precios);
      var apusAct = c.apus.filter(function (a) { return a.activo !== false; });
      var descuadres = this.descuadres(cat, ver);
      return [
        { id: 'alcance', ok: cat.alcance.deptos.length > 0 && cat.alcance.roles.length > 0, t: 'Alcance definido', d: cat.alcance.deptos.length + ' departamentos · ' + (cat.alcance.roles.join(', ') || 'sin roles') },
        { id: 'contenido', ok: apusAct.length > 0, t: 'Contenido cargado', d: apusAct.length ? c.capitulos.length + ' capítulos · ' + apusAct.length + ' APU' : 'Importa la matriz o crea el primer capítulo' },
        { id: 'deptos', ok: cargados.length > 0, t: 'Precios por departamento', d: cargados.length + ' de ' + cat.alcance.deptos.length + ' departamentos con precios', aviso: cargados.length > 0 && cargados.length < cat.alcance.deptos.length },
        { id: 'control', ok: descuadres.length === 0, t: 'Valores que cuadran', d: descuadres.length ? descuadres.length + ' APU no coinciden con la suma de sus insumos' : 'Todos los APU coinciden con sus insumos', aviso: descuadres.length > 0, noBloquea: true }
      ];
    },

    // ── Contenido ──
    capitulo: function (id) { return globales().capitulos[id] || { id: id, nombre: id, cod: '' }; },
    insumo: function (cod) { return globales().insumos[cod] || { cod: cod, nombre: cod, unidad: '' }; },
    listInsumos: function () { var g = globales().insumos; return Object.keys(g).map(function (k) { return g[k]; }); },
    listCapitulosGlobales: function () { var g = globales().capitulos; return Object.keys(g).map(function (k) { return g[k]; }).sort(function (a, b) { return a.orden - b.orden; }); },
    // Cambios globales (sin versión): se registran en la auditoría como tales.
    guardarCapituloGlobal: function (cap) { var g = globales(); g.capitulos[cap.id] = cap; write(LS_GLOBAL, g); },
    guardarInsumoGlobal: function (ins) { var g = globales(); g.insumos[ins.cod] = ins; write(LS_GLOBAL, g); },
    // Versiones y catálogos que usan un insumo o un capítulo: el alcance de un cambio global.
    usoGlobal: function (tipo, id) {
      var out = [];
      ensure().forEach(function (cat) {
        cat.versiones.forEach(function (v) {
          var c = v.contenido, usa = false;
          if (tipo === 'capitulo') usa = c.capitulos.some(function (x) { return x.id === id; });
          else usa = Object.keys(c.precios).some(function (d) { var p = c.precios[d]; return Object.keys(p).some(function (a) { return p[a].det.some(function (x) { return x.ins === id; }); }); });
          if (usa) out.push({ cat: cat.nombre, v: v.v, estado: v.estado });
        });
      });
      return out;
    },
    apusDeCapitulo: function (ver, capId) { return ver.contenido.apus.filter(function (a) { return a.capId === capId; }).sort(function (a, b) { return a.orden - b.orden; }); },
    apu: function (ver, id) { return ver.contenido.apus.filter(function (a) { return a.id === id; })[0] || null; },
    precio: function (ver, depto, apuId) { var p = ver.contenido.precios[depto]; return p ? p[apuId] || null : null; },
    deptosCargados: function (ver) { return Object.keys(ver.contenido.precios); },
    totalDet: totalDet,
    tolerancia: tolerancia,
    sumaInsumos: sumaInsumos,
    // Control del valor (HU08): el valor del APU viene del archivo; se contrasta con la suma.
    control: function (p) {
      if (!p) return null;
      var s = sumaInsumos(p), dif = p.valor - s;
      return { suma: s, dif: dif, ok: Math.abs(dif) <= tolerancia(p.valor) };
    },
    descuadres: function (cat, ver) {
      var self = this, out = [];
      Object.keys(ver.contenido.precios).forEach(function (d) {
        var p = ver.contenido.precios[d];
        Object.keys(p).forEach(function (a) {
          var apu = self.apu(ver, a); if (!apu || apu.activo === false) return;
          var c = self.control(p[a]); if (c && !c.ok) out.push({ depto: d, apuId: a, cod: apu.cod, dif: c.dif });
        });
      });
      return out;
    },
    // Valor de un capítulo en un departamento: solo de referencia (suma precios de unidades distintas).
    nApus: function (ver) { return ver.contenido.apus.filter(function (a) { return a.activo !== false; }).length; },
    composicion: composicion,
    contenidoSemilla: contenidoSemilla,
    factorDe: factorDe,
    SEED: SEED,

    // ── Presupuestos ──
    presupuestosDe: function (catId) { ensure(); return (read(LS_PPTOS) || []).filter(function (p) { return p.catId === catId && p.estado !== 'Cerrado'; }); },
    presupuestosConApu: function (catId, cod, depto) {
      return this.presupuestosDe(catId).filter(function (p) { return p.apus.indexOf(cod) >= 0 && (!depto || p.depto === depto); });
    },

    // ── Consulta por rol (HU17) ──
    catalogosParaRol: function (rolAlcance) {
      var self = this;
      return ensure().filter(function (c) { return c.estado === 'Activo' && self.vigente(c) && (!rolAlcance || c.alcance.roles.indexOf(rolAlcance) >= 0); });
    },

    // ── Importación en curso (HU13): vive en el catálogo para sobrevivir al recargue ──
    guardarImportacion: function (cat, imp) { cat.importacionActiva = imp; this.saveCatalogo(cat); },
    cerrarImportacion: function (cat, registro) {
      cat.importacionActiva = null;
      cat.importaciones = cat.importaciones || [];
      if (registro) cat.importaciones.unshift(registro);
      this.saveCatalogo(cat);
    },

    // ── Auditoría ──
    listAuditoria: function () {
      ensure();
      return (read(LS_AUDIT) || []).slice().sort(function (a, b) {
        var ka = a.fecha + ' ' + a.hora, kb = b.fecha + ' ' + b.hora; return ka < kb ? 1 : ka > kb ? -1 : 0;
      });
    },
    // extra: { version, depto, detalle: { cambios:[{etiqueta, antes, despues}] | motivo | archivo... }, global }
    logAudit: function (cat, accion, elemento, extra) {
      var log = read(LS_AUDIT) || [], d = new Date();
      log.unshift(Object.assign({ id: uid('aud'), catId: cat ? cat.id : null, catNombre: cat ? cat.nombre : 'Global', accion: accion, elemento: elemento, responsable: usuarioActual(), fecha: isoLocal(d), hora: d.toTimeString().slice(0, 5) }, extra || {}));
      write(LS_AUDIT, log);
    },
    diff: function (antes, despues, campos) {
      return campos.reduce(function (out, c) {
        var f = c.fmt || function (v) { return v == null || v === '' ? '—' : String(v); };
        var a = f(antes ? antes[c.key] : null), b = f(despues ? despues[c.key] : null);
        if (a !== b) out.push({ campo: c.key, etiqueta: c.label, antes: a, despues: b });
        return out;
      }, []);
    },

    fmtCOP: function (n) { if (n == null || isNaN(n)) return '—'; return '$' + Math.round(n).toLocaleString('es-CO'); },
    fmtNum: function (n, dec) { if (n == null || isNaN(n)) return '—'; return (+n).toLocaleString('es-CO', { maximumFractionDigits: dec == null ? 4 : dec }); },
    fmtFecha: function (iso) {
      if (!iso) return '—';
      var M = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'], p = iso.split('-');
      return (+p[2]) + ' ' + M[+p[1] - 1] + ' ' + p[0];
    }
  };
  window.OBRAS = API;
  ensure();
})();
