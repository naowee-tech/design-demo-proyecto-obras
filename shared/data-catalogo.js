/* ============================================================================
 * Proyecto de Obras · Presupuesto — Catálogo de Precios
 * Store demo (localStorage, namespaced por ?proyecto= vía proyecto-ns.js).
 * Datos sembrados desde la matriz APU real (Base Matriz 2026). Alcance: Proceso A.
 * ========================================================================== */
(function () {
  'use strict';

  var LS_KEY = 'obras-ppto-catalogos';
  var LS_AUDIT = 'obras-ppto-auditoria';

  // 33 regiones reales (condición de aplicación de un catálogo).
  var REGIONES = ["Amazonas","Antioquia","Arauca","Atlantico","Bogota","Boyaca","Bolivar","Caldas","Caqueta","Cauca","Casanare","Cesar","Choco","Cordoba","Cundinamarca","Guajira","Guaviare","Guania","Huila","Magdalena","Meta","Nariño","Norte de Santander","Putumayo","Quindio","Risaralda","San Andres","Santander","Sucre","Tolima","Valle del Cauca","Vaupes","Vichada"];

  // Semilla curada desde APU (7 capítulos · 6 actividades c/u · valor por región).
  var SEED = [
    {cap:"1",nombre:"PRELIMINARES",items:[
      {cod:"1.1",nombre:"Demolición cielo raso falso (incluye retiro)",uni:"m2",val:{Bogota:16605,Antioquia:16549,Amazonas:16688,Vichada:16676}},
      {cod:"1.2",nombre:"Demolición de caja de inspección 0,60 x 0,60 m (incluye retiro)",uni:"un",val:{Bogota:78924,Antioquia:82299,Amazonas:83799,Vichada:83107}},
      {cod:"1.3",nombre:"Demolición de caja de inspección 0,80 x 0,80 m (incluye retiro)",uni:"un",val:{Bogota:108123,Antioquia:112860,Amazonas:114958,Vichada:113991}},
      {cod:"1.4",nombre:"Demolición de caja de inspección 1,00 x 1,00 m (incluye retiro)",uni:"un",val:{Bogota:143013,Antioquia:148431,Amazonas:150829,Vichada:149724}},
      {cod:"1.5",nombre:"Demolición de caja de inspección 1,20 x 1,20 m (incluye retiro)",uni:"un",val:{Bogota:154819,Antioquia:161600,Amazonas:164596,Vichada:163215}},
      {cod:"1.6",nombre:"Demolición de mesón en concreto (incluye retiro)",uni:"m",val:{Bogota:73910,Antioquia:75884,Amazonas:76770,Vichada:76362}}
    ]},
    {cap:"2",nombre:"EXCAVACIONES Y RELLENOS",items:[
      {cod:"2.1",nombre:"Excavación manual en conglomerado h=0.0-2.0 m (retiro <5 km)",uni:"m3",val:{Bogota:70850,Antioquia:70729,Amazonas:70886,Vichada:70862}},
      {cod:"2.2",nombre:"Excavación manual zanja en tierra h=1.0 m",uni:"m3",val:{Bogota:40348,Antioquia:40348,Amazonas:40348,Vichada:40348}},
      {cod:"2.3",nombre:"Relleno con material del sitio compactado mecánicamente",uni:"m3",val:{Bogota:37504,Antioquia:37044,Amazonas:37594,Vichada:37340}},
      {cod:"2.4",nombre:"Relleno material granular seleccionado, compactado manual (zonas confinadas)",uni:"m3",val:{Bogota:80604,Antioquia:78866,Amazonas:80925,Vichada:80479}},
      {cod:"2.5",nombre:"Rellenos agregado en material de base compactada mecánicamente",uni:"m3",val:{Bogota:300501,Antioquia:312534,Amazonas:322414,Vichada:326250}},
      {cod:"2.6",nombre:"Rellenos en material seleccionado de la excavación en sitio, manual",uni:"m3",val:{Bogota:16421,Antioquia:16310,Amazonas:16440,Vichada:16383}}
    ]},
    {cap:"3",nombre:"CIMENTACIÓN",items:[
      {cod:"3.1",nombre:"Base agregado pétreo (material de afirmado)",uni:"m3",val:{Bogota:153559,Antioquia:148829,Amazonas:152228,Vichada:149115}},
      {cod:"3.2",nombre:"Base arena cemento 1:20 (hecho en obra)",uni:"m3",val:{Bogota:330123,Antioquia:329878,Amazonas:340784,Vichada:347569}},
      {cod:"3.3",nombre:"Base en concreto pobre (hecho en obra)",uni:"m3",val:{Bogota:497786,Antioquia:486789,Amazonas:500509,Vichada:497512}},
      {cod:"3.4",nombre:"Concreto ciclópeo (60% concreto 2500 PSI + 40% piedra media zonga)",uni:"m3",val:{Bogota:751669,Antioquia:760810,Amazonas:775365,Vichada:784423}},
      {cod:"3.5",nombre:"Dados en concreto 3500 PSI",uni:"m3",val:{Bogota:889918,Antioquia:870822,Amazonas:893877,Vichada:889287}},
      {cod:"3.6",nombre:"Placa de concreto 2500 PSI e=10 cm (incluye malla M-131)",uni:"m2",val:{Bogota:178863,Antioquia:180296,Amazonas:183395,Vichada:182395}}
    ]},
    {cap:"4",nombre:"ESTRUCTURAS EN CONCRETO",items:[
      {cod:"4.1",nombre:"Acero figurado 37000 PSI",uni:"kg",val:{Bogota:9241,Antioquia:9239,Amazonas:9534,Vichada:9734}},
      {cod:"4.2",nombre:"Acero figurado 60000 PSI",uni:"kg",val:{Bogota:9297,Antioquia:9294,Amazonas:9592,Vichada:9794}},
      {cod:"4.3",nombre:"Base en concreto de limpieza 1500 PSI",uni:"m3",val:{Bogota:448395,Antioquia:447712,Amazonas:462671,Vichada:472067}},
      {cod:"4.4",nombre:"Columnas cualquier área 3000 PSI",uni:"m3",val:{Bogota:1233873,Antioquia:1231927,Amazonas:1260679,Vichada:1265851}},
      {cod:"4.5",nombre:"Columnas cualquier área 3500 PSI",uni:"m3",val:{Bogota:1301019,Antioquia:1299050,Amazonas:1330184,Vichada:1298614}},
      {cod:"4.6",nombre:"Columneta concreto 3000 PSI cualquier dimensión (incluye refuerzo)",uni:"m",val:{Bogota:120775,Antioquia:125433,Amazonas:127855,Vichada:129386}}
    ]},
    {cap:"5",nombre:"MAMPOSTERÍA",items:[
      {cod:"5.1",nombre:"Alfajía en ladrillo prensado macizo",uni:"m",val:{Bogota:63364,Antioquia:63366,Amazonas:64511,Vichada:65274}},
      {cod:"5.2",nombre:"Anclaje 1/2\" l=50 cm",uni:"un",val:{Bogota:24574,Antioquia:24464,Amazonas:24869,Vichada:24998}},
      {cod:"5.3",nombre:"Anclaje 3/8\" l=30 cm",uni:"un",val:{Bogota:23043,Antioquia:22933,Amazonas:23319,Vichada:23435}},
      {cod:"5.4",nombre:"Apoyo en bloque no. 5 para mesón o lavadero (incluye pañete)",uni:"m",val:{Bogota:64975,Antioquia:63969,Amazonas:65199,Vichada:64965}},
      {cod:"5.5",nombre:"Dintel en sistema estructural steel frame",uni:"m",val:{Bogota:45297,Antioquia:45318,Amazonas:46100,Vichada:46592}},
      {cod:"5.6",nombre:"Dinteles concreto cualquier medida de 2500 PSI",uni:"m",val:{Bogota:89353,Antioquia:89320,Amazonas:90988,Vichada:92018}}
    ]},
    {cap:"8",nombre:"INSTALACIONES HIDROSANITARIAS",items:[
      {cod:"8.1",nombre:"Acometida en PVC 1/2\" 5 m",uni:"un",val:{Bogota:421250,Antioquia:421163,Amazonas:430152,Vichada:436249}},
      {cod:"8.2",nombre:"Caja contador de agua",uni:"un",val:{Bogota:154649,Antioquia:154610,Amazonas:158842,Vichada:161712}},
      {cod:"8.3",nombre:"Caja de inspección 100 x 100 (incluye excavación)",uni:"un",val:{Bogota:853061,Antioquia:847559,Amazonas:869227,Vichada:882735}},
      {cod:"8.4",nombre:"Caja de inspección 40 x 40 (incluye excavación)",uni:"un",val:{Bogota:444807,Antioquia:417266,Amazonas:427041,Vichada:433418}},
      {cod:"8.5",nombre:"Caja de inspección 60 x 60 (incluye excavación)",uni:"un",val:{Bogota:507899,Antioquia:482827,Amazonas:494380,Vichada:501886}},
      {cod:"8.6",nombre:"Caja de inspección 80 x 80 (incluye excavación)",uni:"un",val:{Bogota:673195,Antioquia:648085,Amazonas:664830,Vichada:675796}}
    ]},
    {cap:"16",nombre:"PINTURAS",items:[
      {cod:"16.1",nombre:"Estuco",uni:"m2",val:{Bogota:15751,Antioquia:15755,Amazonas:15891,Vichada:15974}},
      {cod:"16.2",nombre:"Estuco (lineal)",uni:"m",val:{Bogota:9928,Antioquia:9935,Amazonas:10005,Vichada:10043}},
      {cod:"16.3",nombre:"Estuco plástico acrílico sobre muros (incluye filos y dilataciones)",uni:"m2",val:{Bogota:28251,Antioquia:28253,Amazonas:28895,Vichada:29321}},
      {cod:"16.4",nombre:"Estuco y vinilo 3 manos",uni:"m2",val:{Bogota:34671,Antioquia:34672,Amazonas:35141,Vichada:35450}},
      {cod:"16.5",nombre:"Estuco y vinilo 3 manos (lineal)",uni:"m",val:{Bogota:21571,Antioquia:21577,Amazonas:21813,Vichada:21964}},
      {cod:"16.6",nombre:"Impermeabilización fachada en Sika transparente o similar",uni:"m2",val:{Bogota:16164,Antioquia:16175,Amazonas:16477,Vichada:16664}}
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
      add(c, 'Crear nivel', 'Nivel · PRELIMINARES', 'Jesús Díaz', 38 - i * 5);
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
