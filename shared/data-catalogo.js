/* ============================================================================
 * Proyecto de Obras · Presupuesto — Catálogo de Precios
 * Store demo (localStorage, namespaced por ?proyecto= vía proyecto-ns.js).
 * Alcance: Proceso A.
 *
 * ⚠ PRECIOS SINTÉTICOS. La estructura (capítulos, actividades, unidades, variación
 * por región) replica la matriz APU de EnTerritorio, pero los VALORES son inventados
 * para la demo — mismo orden de magnitud, ningún dato real. No usar como referencia
 * de costos. La matriz real no se publica en este repo.
 * ========================================================================== */
(function () {
  'use strict';

  var LS_KEY = 'obras-ppto-catalogos';
  var LS_AUDIT = 'obras-ppto-auditoria';

  // 33 regiones reales (condición de aplicación de un catálogo).
  var REGIONES = ["Amazonas","Antioquia","Arauca","Atlantico","Bogota","Boyaca","Bolivar","Caldas","Caqueta","Cauca","Casanare","Cesar","Choco","Cordoba","Cundinamarca","Guajira","Guaviare","Guania","Huila","Magdalena","Meta","Nariño","Norte de Santander","Putumayo","Quindio","Risaralda","San Andres","Santander","Sucre","Tolima","Valle del Cauca","Vaupes","Vichada"];

  // Semilla de demo (7 capítulos · 6 actividades c/u · valor por región).
  // Nomenclatura APU estándar; VALORES SINTÉTICOS (ver aviso de cabecera).
  var SEED = [
    {cap:"1",nombre:"Preliminares",items:[
      {cod:"1.1",nombre:"Demolición cielo raso falso (incluye retiro)",uni:"m2",val:{Bogota:18420,Antioquia:18310,Amazonas:18760,Vichada:18690}},
      {cod:"1.2",nombre:"Demolición de caja de inspección 0,60 x 0,60 m (incluye retiro)",uni:"un",val:{Bogota:71350,Antioquia:74200,Amazonas:75600,Vichada:75010}},
      {cod:"1.3",nombre:"Demolición de caja de inspección 0,80 x 0,80 m (incluye retiro)",uni:"un",val:{Bogota:96480,Antioquia:100150,Amazonas:102030,Vichada:101240}},
      {cod:"1.4",nombre:"Demolición de caja de inspección 1,00 x 1,00 m (incluye retiro)",uni:"un",val:{Bogota:158700,Antioquia:164350,Amazonas:167110,Vichada:165890}},
      {cod:"1.5",nombre:"Demolición de caja de inspección 1,20 x 1,20 m (incluye retiro)",uni:"un",val:{Bogota:139240,Antioquia:145080,Amazonas:147620,Vichada:146410}},
      {cod:"1.6",nombre:"Demolición de mesón en concreto (incluye retiro)",uni:"m",val:{Bogota:81560,Antioquia:83790,Amazonas:84720,Vichada:84260}}
    ]},
    {cap:"2",nombre:"Excavaciones y rellenos",items:[
      {cod:"2.1",nombre:"Excavación manual en conglomerado h=0.0-2.0 m (retiro <5 km)",uni:"m3",val:{Bogota:63920,Antioquia:63810,Amazonas:63980,Vichada:63950}},
      {cod:"2.2",nombre:"Excavación manual zanja en tierra h=1.0 m",uni:"m3",val:{Bogota:44710,Antioquia:44710,Amazonas:44710,Vichada:44710}},
      {cod:"2.3",nombre:"Relleno con material del sitio compactado mecánicamente",uni:"m3",val:{Bogota:41830,Antioquia:41320,Amazonas:41920,Vichada:41640}},
      {cod:"2.4",nombre:"Relleno material granular seleccionado, compactado manual (zonas confinadas)",uni:"m3",val:{Bogota:72150,Antioquia:70600,Amazonas:72440,Vichada:72040}},
      {cod:"2.5",nombre:"Rellenos agregado en material de base compactada mecánicamente",uni:"m3",val:{Bogota:268940,Antioquia:279710,Amazonas:288550,Vichada:291980}},
      {cod:"2.6",nombre:"Rellenos en material seleccionado de la excavación en sitio, manual",uni:"m3",val:{Bogota:18270,Antioquia:18150,Amazonas:18290,Vichada:18230}}
    ]},
    {cap:"3",nombre:"Cimentación",items:[
      {cod:"3.1",nombre:"Base agregado pétreo (material de afirmado)",uni:"m3",val:{Bogota:171280,Antioquia:165980,Amazonas:169790,Vichada:166300}},
      {cod:"3.2",nombre:"Base arena cemento 1:20 (hecho en obra)",uni:"m3",val:{Bogota:295640,Antioquia:295420,Amazonas:305180,Vichada:311260}},
      {cod:"3.3",nombre:"Base en concreto pobre (hecho en obra)",uni:"m3",val:{Bogota:556190,Antioquia:543900,Amazonas:559230,Vichada:555880}},
      {cod:"3.4",nombre:"Concreto ciclópeo (60% concreto 2500 PSI + 40% piedra media zonga)",uni:"m3",val:{Bogota:672480,Antioquia:680660,Amazonas:693680,Vichada:701790}},
      {cod:"3.5",nombre:"Dados en concreto 3500 PSI",uni:"m3",val:{Bogota:993640,Antioquia:972320,Amazonas:997970,Vichada:992840}},
      {cod:"3.6",nombre:"Placa de concreto 2500 PSI e=10 cm (incluye malla M-131)",uni:"m2",val:{Bogota:160120,Antioquia:161400,Amazonas:164180,Vichada:163280}}
    ]},
    {cap:"4",nombre:"Estructuras en concreto",items:[
      {cod:"4.1",nombre:"Acero figurado 37000 PSI",uni:"kg",val:{Bogota:10320,Antioquia:10318,Amazonas:10648,Vichada:10871}},
      {cod:"4.2",nombre:"Acero figurado 60000 PSI",uni:"kg",val:{Bogota:8324,Antioquia:8321,Amazonas:8588,Vichada:8769}},
      {cod:"4.3",nombre:"Base en concreto de limpieza 1500 PSI",uni:"m3",val:{Bogota:500760,Antioquia:499240,Amazonas:515930,Vichada:526410}},
      {cod:"4.4",nombre:"Columnas cualquier área 3000 PSI",uni:"m3",val:{Bogota:1103290,Antioquia:1101550,Amazonas:1127260,Vichada:1131880}},
      {cod:"4.5",nombre:"Columnas cualquier área 3500 PSI",uni:"m3",val:{Bogota:1452940,Antioquia:1450740,Amazonas:1485510,Vichada:1450250}},
      {cod:"4.6",nombre:"Columneta concreto 3000 PSI cualquier dimensión (incluye refuerzo)",uni:"m",val:{Bogota:108020,Antioquia:112190,Amazonas:114350,Vichada:115720}}
    ]},
    {cap:"5",nombre:"Mampostería",items:[
      {cod:"5.1",nombre:"Alfajía en ladrillo prensado macizo",uni:"m",val:{Bogota:70740,Antioquia:70745,Amazonas:72020,Vichada:72870}},
      {cod:"5.2",nombre:"Anclaje 1/2\" l=50 cm",uni:"un",val:{Bogota:27440,Antioquia:27320,Amazonas:27770,Vichada:27920}},
      {cod:"5.3",nombre:"Anclaje 3/8\" l=30 cm",uni:"un",val:{Bogota:20610,Antioquia:20510,Amazonas:20860,Vichada:20960}},
      {cod:"5.4",nombre:"Apoyo en bloque no. 5 para mesón o lavadero (incluye pañete)",uni:"m",val:{Bogota:72550,Antioquia:71430,Amazonas:72800,Vichada:72540}},
      {cod:"5.5",nombre:"Dintel en sistema estructural steel frame",uni:"m",val:{Bogota:40510,Antioquia:40530,Amazonas:41230,Vichada:41670}},
      {cod:"5.6",nombre:"Dinteles concreto cualquier medida de 2500 PSI",uni:"m",val:{Bogota:99770,Antioquia:99730,Amazonas:101590,Vichada:102740}}
    ]},
    {cap:"8",nombre:"Instalaciones hidrosanitarias",items:[
      {cod:"8.1",nombre:"Acometida en PVC 1/2\" 5 m",uni:"un",val:{Bogota:470400,Antioquia:470300,Amazonas:480340,Vichada:487150}},
      {cod:"8.2",nombre:"Caja contador de agua",uni:"un",val:{Bogota:138310,Antioquia:138280,Amazonas:142060,Vichada:144630}},
      {cod:"8.3",nombre:"Caja de inspección 100 x 100 (incluye excavación)",uni:"un",val:{Bogota:762680,Antioquia:757760,Amazonas:777130,Vichada:789210}},
      {cod:"8.4",nombre:"Caja de inspección 40 x 40 (incluye excavación)",uni:"un",val:{Bogota:496760,Antioquia:465990,Amazonas:476910,Vichada:484030}},
      {cod:"8.5",nombre:"Caja de inspección 60 x 60 (incluye excavación)",uni:"un",val:{Bogota:454150,Antioquia:431730,Amazonas:442060,Vichada:448770}},
      {cod:"8.6",nombre:"Caja de inspección 80 x 80 (incluye excavación)",uni:"un",val:{Bogota:751790,Antioquia:723750,Amazonas:742450,Vichada:754690}}
    ]},
    {cap:"16",nombre:"Pinturas",items:[
      {cod:"16.1",nombre:"Estuco",uni:"m2",val:{Bogota:17590,Antioquia:17595,Amazonas:17747,Vichada:17840}},
      {cod:"16.2",nombre:"Estuco (lineal)",uni:"m",val:{Bogota:8877,Antioquia:8883,Amazonas:8946,Vichada:8980}},
      {cod:"16.3",nombre:"Estuco plástico acrílico sobre muros (incluye filos y dilataciones)",uni:"m2",val:{Bogota:31550,Antioquia:31553,Amazonas:32270,Vichada:32745}},
      {cod:"16.4",nombre:"Estuco y vinilo 3 manos",uni:"m2",val:{Bogota:31005,Antioquia:31006,Amazonas:31425,Vichada:31702}},
      {cod:"16.5",nombre:"Estuco y vinilo 3 manos (lineal)",uni:"m",val:{Bogota:24090,Antioquia:24097,Amazonas:24360,Vichada:24529}},
      {cod:"16.6",nombre:"Impermeabilización fachada en Sika transparente o similar",uni:"m2",val:{Bogota:14456,Antioquia:14466,Amazonas:14736,Vichada:14903}}
    ]}
  ];

  var uid = (function () { var n = 1; return function (p) { return (p || 'id') + '-' + (n++) + '-' + Math.random().toString(36).slice(2, 6); }; })();

  // Unidades de medida canónicas (las 25 que trae la matriz APU real).
  var UNIDADES = ['bls','bt','cj','cñ','dis.','día','glb','gln','h','jg','jr','kg','lb','lt','m','m2','m3','m3-km','mes','ml','pq','rol','ton','un','vj'];

  // PPTO-09 · campos que tendrá cada ítem del nivel. Se configuran por nivel al
  // habilitar "admite ítems". Los 'core' no se pueden quitar (el sistema calcula sobre ellos).
  // tipo: texto | numero | moneda | unidad  → determina el control y la validación.
  var CAMPOS_DEFAULT = [
    { key: 'cod',       label: 'Código',      tipo: 'texto',  req: true,  core: true },
    { key: 'nombre',    label: 'Ítem',        tipo: 'texto',  req: true,  core: true },
    { key: 'uni',       label: 'Unidad',      tipo: 'unidad', req: false, core: false },
    { key: 'cantidad',  label: 'Cantidad',    tipo: 'numero', req: false, core: false },
    { key: 'valorUnit', label: 'V. unitario', tipo: 'moneda', req: true,  core: true }
  ];
  function camposDefault() { return CAMPOS_DEFAULT.map(function (c) { return Object.assign({}, c); }); }

  // Construye niveles + ítems de un catálogo a partir de la semilla, para su región.
  function buildEstructura(region) {
    var niveles = [], items = [];
    SEED.forEach(function (ch, i) {
      var nid = 'nv-' + ch.cap;
      niveles.push({
        id: nid, nombre: ch.nombre, orden: i + 1, codigo: ch.cap,
        admiteItems: true, valorTipo: 'formula', valorFijo: null,
        formula: 'SUMA(ítems del nivel)', activo: true, campos: camposDefault()
      });
      ch.items.forEach(function (it) {
        var v = it.val[region] != null ? it.val[region] : it.val.Bogota;
        items.push({
          id: 'it-' + it.cod.replace('.', '_'), nivelId: nid, cod: it.cod,
          nombre: it.nombre, uni: it.uni, tipo: 'Producto', cantidad: 1,
          valorUnit: v, formula: null, valorTotal: v
        });
      });
    });
    return { niveles: niveles, items: items };
  }

  function nuevaFecha(daysAgo) {
    var d = new Date(); d.setDate(d.getDate() - (daysAgo || 0));
    return d.toISOString().slice(0, 10);
  }

  function seedCatalogos() {
    function mk(nombre, region, estado, ver, dias) {
      var est = buildEstructura(region);
      // La v1.0 se congela con un catálogo más pequeño (3 primeros niveles): así el
      // snapshot histórico muestra una diferencia real frente a la versión activa.
      var nv0 = est.niveles.slice(0, 3);
      var ids0 = nv0.map(function (n) { return n.id; });
      var snap0 = {
        niveles: JSON.parse(JSON.stringify(nv0)),
        items: JSON.parse(JSON.stringify(est.items.filter(function (it) { return ids0.indexOf(it.nivelId) >= 0; })))
      };
      return {
        id: uid('cat'), nombre: nombre, region: region,
        vigenciaIni: '2026-01-01', vigenciaFin: '2026-12-31',
        estado: estado, versionActiva: ver, creado: nuevaFecha(dias || 40),
        niveles: est.niveles, items: est.items,
        cambiosSinVersionar: 0,
        versiones: [
          { v: 'v1.0', motivo: 'Versión inicial del catálogo', autor: 'Jesús Díaz', fecha: nuevaFecha((dias || 40)), snapshot: snap0 },
          (ver !== 'v1.0' ? { v: ver, motivo: 'Actualización de precios ' + region + ' 2026', autor: 'Jesús Díaz', fecha: nuevaFecha(6) } : null)
        ].filter(Boolean)
      };
    }
    return [
      mk('Vivienda Rural — Bogotá 2026', 'Bogota', 'Activo', 'v1.3', 42),
      mk('Vivienda Rural — Antioquia 2026', 'Antioquia', 'Activo', 'v1.1', 33),
      mk('Vivienda Rural — Amazonas 2026', 'Amazonas', 'Borrador', 'v1.0', 9),
      mk('Mejoramiento Urbano — Vichada 2026', 'Vichada', 'Inactivo', 'v1.0', 120)
    ];
  }

  function seedAuditoria(cats) {
    var log = [];
    function add(cat, accion, elemento, resp, dias) {
      log.push({ id: uid('aud'), catId: cat.id, catNombre: cat.nombre, accion: accion, elemento: elemento, responsable: resp, fecha: nuevaFecha(dias), hora: '09:' + (10 + log.length % 40) });
    }
    cats.forEach(function (c, i) {
      add(c, 'Crear catálogo', 'Catálogo', 'Jesús Díaz', 40 - i * 5);
      add(c, 'Crear nivel', 'Nivel · Preliminares', 'Jesús Díaz', 38 - i * 5);
      add(c, 'Crear ítem', 'Ítem · 1.1', 'Carla Méndez', 30 - i * 4);
      if (c.versionActiva !== 'v1.0') add(c, 'Crear versión', 'Versión · ' + c.versionActiva, 'Jesús Díaz', 6);
    });
    return log;
  }

  function read(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; } }
  function write(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }

  function ensure() {
    var cats = read(LS_KEY);
    if (!cats || !cats.length) {
      cats = seedCatalogos();
      write(LS_KEY, cats);
      write(LS_AUDIT, seedAuditoria(cats));
    }
    return cats;
  }

  // ── API pública ──
  window.OBRAS = {
    REGIONES: REGIONES,
    UNIDADES: UNIDADES,
    camposDefault: camposDefault,
    // Versionamiento C: los cambios se acumulan y el Admin decide cuándo publicarlos.
    marcarCambio: function (cat) {
      cat.cambiosSinVersionar = (cat.cambiosSinVersionar || 0) + 1;
      this.saveCatalogo(cat);
    },
    // Al versionar, la versión saliente congela el contenido que tenía (snapshot).
    nuevaVersion: function (cat, motivo, autor) {
      var actual = cat.versiones.filter(function (v) { return v.v === cat.versionActiva; })[0];
      if (actual) actual.snapshot = JSON.parse(JSON.stringify({ niveles: cat.niveles, items: cat.items }));
      var p = cat.versionActiva.replace('v', '').split('.').map(Number);
      var next = 'v' + p[0] + '.' + (p[1] + 1);
      cat.versiones.push({ v: next, motivo: motivo, autor: autor || 'Jesús Díaz', fecha: nuevaFecha(0) });
      cat.versionActiva = next;
      cat.cambiosSinVersionar = 0;
      this.saveCatalogo(cat);
      this.logAudit(cat, 'Crear versión', 'Versión · ' + next, autor);
      return next;
    },
    DEMO_REGIONS: ['Bogota', 'Antioquia', 'Amazonas', 'Vichada'],
    reset: function () { localStorage.removeItem(LS_KEY); localStorage.removeItem(LS_AUDIT); ensure(); },
    listCatalogos: function () { return ensure(); },
    getCatalogo: function (id) { return ensure().filter(function (c) { return c.id === id; })[0] || null; },
    saveCatalogo: function (cat) {
      var cats = ensure(), i = cats.map(function (c) { return c.id; }).indexOf(cat.id);
      if (i >= 0) cats[i] = cat; else { cat.id = cat.id || uid('cat'); cats.push(cat); }
      write(LS_KEY, cats); return cat;
    },
    newCatalogo: function (data) {
      var est = buildEstructura(data.region || 'Bogota');
      var cat = {
        id: uid('cat'), nombre: data.nombre, region: data.region,
        vigenciaIni: data.vigenciaIni, vigenciaFin: data.vigenciaFin,
        estado: data.estado || 'Borrador', versionActiva: 'v1.0', creado: nuevaFecha(0),
        niveles: data.conEstructura ? est.niveles : [], items: data.conEstructura ? est.items : [],
        cambiosSinVersionar: 0,
        versiones: [{ v: 'v1.0', motivo: 'Versión inicial del catálogo', autor: 'Jesús Díaz', fecha: nuevaFecha(0) }]
      };
      this.saveCatalogo(cat);
      this.logAudit(cat, 'Crear catálogo', 'Catálogo', 'Jesús Díaz');
      return cat;
    },
    listAuditoria: function () { ensure(); return read(LS_AUDIT) || []; },
    logAudit: function (cat, accion, elemento, resp) {
      var log = read(LS_AUDIT) || [];
      var d = new Date();
      log.unshift({ id: uid('aud'), catId: cat.id, catNombre: cat.nombre, accion: accion, elemento: elemento, responsable: resp || 'Jesús Díaz', fecha: d.toISOString().slice(0, 10), hora: d.toTimeString().slice(0, 5) });
      write(LS_AUDIT, log);
    },
    fmtCOP: function (n) {
      if (n == null || isNaN(n)) return '—';
      return '$' + Math.round(n).toLocaleString('es-CO');
    },
    totalCatalogo: function (cat) {
      return (cat.items || []).reduce(function (s, it) { return s + (it.valorTotal || 0); }, 0);
    }
  };

  ensure();
})();
