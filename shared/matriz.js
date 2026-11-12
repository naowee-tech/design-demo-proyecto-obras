/* ============================================================================
 * Proyecto de Obras · v0.7 — La matriz APU como la entiende import-apu-excel
 *
 * - Plantilla: una hoja "APU <Departamento>" por departamento, 7 encabezados literales.
 *   Se escribe en SpreadsheetML (XML de Excel 2003): varias hojas sin librerías.
 * - Lectura: SpreadsheetML propio con DOMParser; .xlsx/.xls/.csv con SheetJS (cdnjs),
 *   que se carga solo cuando hace falta.
 * - Ajustes (lo que el endpoint no perdona): encabezados, nombre de hoja contra
 *   m_regions, números con punto de miles, hojas que no son de precios.
 * - Diagnóstico por hoja: clasifica filas igual que el backend (APU == Código: con solo
 *   dígitos es capítulo, con punto es APU; lo demás es insumo del último APU).
 * - Aplicar = upsert de un departamento sobre la versión destino: nunca borra.
 * ========================================================================== */
(function () {
  'use strict';
  var D = window.OBRAS;
  var COLS = D.COLUMNAS;
  function norm(s) { return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim(); }
  function xmlEsc(s) { return String(s == null ? '' : s).replace(/[<>&"]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]; }); }
  function slug(s) { return norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  // ── Plantilla ──
  function filasDe(ver, depto) {
    var rows = [], c = ver ? ver.contenido : null;
    if (!c || !c.precios[depto]) return rows;
    c.capitulos.forEach(function (cp) {
      var g = D.capitulo(cp.id); rows.push([g.cod, g.cod, g.nombre, '', '', '', '']);
      D.apusDeCapitulo(ver, cp.id).filter(function (a) { return a.activo !== false; }).forEach(function (a) {
        var p = D.precio(ver, depto, a.id); if (!p) return;
        rows.push([a.cod, a.cod, a.nombre, a.unidad, '', '', p.valor]);
        p.det.forEach(function (d) { var i = D.insumo(d.ins); rows.push([a.cod, d.ins, i.nombre, i.unidad, d.cantidad, d.valorUnit, D.totalDet(d)]); });
      });
    });
    return rows;
  }
  function libroXML(hojas) {
    var x = '<?xml version="1.0" encoding="UTF-8"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">' +
      '<Styles><Style ss:ID="h"><Font ss:Bold="1"/><Interior ss:Color="#E2F7FB" ss:Pattern="Solid"/></Style></Styles>';
    hojas.forEach(function (h) {
      x += '<Worksheet ss:Name="' + xmlEsc(h.nombre.slice(0, 31)) + '"><Table>';
      x += '<Row>' + h.encabezados.map(function (c) { return '<Cell ss:StyleID="h"><Data ss:Type="String">' + xmlEsc(c) + '</Data></Cell>'; }).join('') + '</Row>';
      h.filas.forEach(function (r) {
        x += '<Row>' + r.map(function (v) { var n = typeof v === 'number'; return '<Cell><Data ss:Type="' + (n ? 'Number' : 'String') + '">' + xmlEsc(v) + '</Data></Cell>'; }).join('') + '</Row>';
      });
      x += '</Table></Worksheet>';
    });
    return x + '</Workbook>';
  }
  function descargarPlantilla(cat, ver, conPrecios) {
    var hojas = cat.alcance.deptos.map(function (d) { return { nombre: 'APU ' + d, encabezados: COLS, filas: conPrecios ? filasDe(ver, d) : [] }; });
    var nombre = 'plantilla-' + slug(cat.nombre) + (conPrecios ? '-' + ver.v : '') + '.xls';
    window.OBRAS_UI.descargar(nombre, libroXML(hojas), 'application/vnd.ms-excel');
    return nombre;
  }

  // ── Lectura ──
  function leerXML(txt) {
    var doc = new DOMParser().parseFromString(txt, 'application/xml');
    var ws = doc.getElementsByTagNameNS('urn:schemas-microsoft-com:office:spreadsheet', 'Worksheet');
    if (!ws.length) return null;
    return [].map.call(ws, function (w) {
      var rows = [].map.call(w.getElementsByTagNameNS('urn:schemas-microsoft-com:office:spreadsheet', 'Row'), function (r) {
        return [].map.call(r.getElementsByTagNameNS('urn:schemas-microsoft-com:office:spreadsheet', 'Cell'), function (c) { return c.textContent; });
      });
      return { nombre: w.getAttribute('ss:Name') || w.getAttributeNS('urn:schemas-microsoft-com:office:spreadsheet', 'Name'), rows: rows };
    });
  }
  var _sheetjs = null;
  function sheetjs() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    if (_sheetjs) return _sheetjs;
    _sheetjs = new Promise(function (ok, ko) {
      var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      s.onload = function () { ok(window.XLSX); }; s.onerror = function () { _sheetjs = null; ko(new Error('No se pudo cargar el lector de Excel (sin conexión).')); };
      document.head.appendChild(s);
    });
    return _sheetjs;
  }
  // Devuelve { archivo, hojas:[{nombre, rows}] }. Las celdas se leen como TEXTO, igual que el
  // backend: así el diagnóstico ve "1.200" tal como llegaría.
  function leerArchivo(file) {
    var ext = (file.name.split('.').pop() || '').toLowerCase();
    if (['xlsx', 'xls', 'csv', 'xml'].indexOf(ext) < 0) return Promise.reject(new Error('El archivo debe ser Excel (.xlsx o .xls). «' + file.name + '» no lo es.'));
    return file.text().then(function (txt) {
      if (/^\s*<\?xml/.test(txt) && txt.indexOf('urn:schemas-microsoft-com:office:spreadsheet') > 0) {
        var h = leerXML(txt); if (h) return { archivo: file.name, hojas: h };
      }
      return file.arrayBuffer().then(function (buf) {
        return sheetjs().then(function (X) {
          var wb = X.read(buf, { type: 'array', cellText: true, cellFormula: false, raw: false });
          return { archivo: file.name, hojas: wb.SheetNames.map(function (n) { return { nombre: n, rows: X.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: false, defval: '' }) }; }) };
        });
      });
    });
  }

  // ── Archivo de ejemplo (sin preparar nada): los errores típicos de una matriz real ──
  function ejemplo(cat) {
    var deptos = ['La Guajira', 'Antioquia', 'Bogotá, D. C.', 'Norte de Santander', 'Tolima', 'Santander', 'Córdoba'];
    var nombreHoja = { 'Bogotá, D. C.': 'APU Bogota', 'La Guajira': 'APU Guajira', 'Córdoba': 'APU Cordoba' };
    var hojas = [{ nombre: 'LINEAMIENTOS', rows: [['Lineamientos de uso de la matriz'], ['Precios de referencia 2026. No modificar encabezados.']] }];
    deptos.forEach(function (d, k) {
      var c = D.contenidoSemilla({ caps: 7, deptos: [d], f: 1.035 }), rows = [['Item', 'Código', 'Nombre', 'unidad', 'Cantidad', 'Valor unitario', 'Valor Total 2026', 'Tipo']];
      var p = c.precios[d];
      c.capitulos.forEach(function (cp) {
        var g = D.capitulo(cp.id); rows.push([g.cod, g.cod, g.nombre, '', '', '', '', '']);
        c.apus.filter(function (a) { return a.capId === cp.id; }).forEach(function (a, j) {
          var pr = p[a.id], valor = pr.valor;
          // Santander trae dos APU cuyo total no cuadra con sus insumos (aviso, no error).
          if (d === 'Santander' && (a.cod === '4.4' || a.cod === '8.3')) valor = Math.round(valor * 1.04);
          rows.push([a.cod, a.cod, a.nombre, a.unidad, '', '', miles(valor, k), '']);
          pr.det.forEach(function (x) { var i = D.insumo(x.ins); rows.push([a.cod, x.ins, i.nombre, i.unidad, String(x.cantidad).replace('.', ','), miles(Math.round(x.valorUnit), k), miles(D.totalDet(x), k), x.ins.slice(0, 2)]); });
        });
      });
      // Un APU nuevo en Tolima y Córdoba, para que el diagnóstico tenga qué "crear".
      if (d === 'Tolima' || d === 'Córdoba') {
        rows.push(['5.8', '5.8', 'Muro en bloque de concreto e=20 cm', 'm2', '', '', miles(118400, k), '']);
        D.composicion('5', 118400).forEach(function (x) { var i = D.insumo(x.ins); rows.push(['5.8', x.ins, i.nombre, i.unidad, String(x.cantidad).replace('.', ','), miles(Math.round(x.valorUnit), k), miles(D.totalDet(x), k), '']); });
      }
      hojas.push({ nombre: nombreHoja[d] || 'APU ' + d, rows: rows });
    });
    return { archivo: 'Base_Matriz_2026-septiembre.xlsx', ejemplo: true, fallaEn: 'Norte de Santander', hojas: hojas };
  }
  // En las hojas pares, los miles vienen con punto ("1.200"): el backend los leería mal.
  function miles(n, k) { return k % 2 === 0 ? Math.round(n).toLocaleString('es-CO') : String(Math.round(n)); }

  // ── Ajustes ──
  var ALIAS_HOJA = { 'bogota': 'Bogotá, D. C.', 'bogota d.c.': 'Bogotá, D. C.', 'bogota dc': 'Bogotá, D. C.', 'guajira': 'La Guajira', 'guania': 'Guainía', 'san andres': 'San Andrés y Providencia', 'valle': 'Valle del Cauca', 'norte santander': 'Norte de Santander' };
  var ALIAS_COL = { 'apu': 'APU', 'item': 'APU', 'ítem': 'APU', 'codigo': 'Código', 'cod': 'Código', 'nombre': 'Nombre', 'descripcion': 'Nombre', 'unidad': 'unidad', 'und': 'unidad', 'un': 'unidad',
    'cantidad': 'Cantidad', 'cant': 'Cantidad', 'valor unitario': 'Valor unitario', 'vr unitario': 'Valor unitario', 'valor total': 'Valor total', 'vr total': 'Valor total' };
  function colCanonica(h) { var n = norm(h).replace(/\s*\d{4}$/, ''); return ALIAS_COL[n] || null; }
  function deptoDeHoja(nombre) {
    var m = /^\s*apu\s+(.+)$/i.exec(nombre || ''); if (!m) return { esAPU: false };
    var bruto = m[1].trim();
    if (D.DEPARTAMENTOS.indexOf(bruto) >= 0) return { esAPU: true, bruto: bruto, depto: bruto, exacto: true };
    var n = norm(bruto), hit = D.DEPARTAMENTOS.filter(function (d) { return norm(d) === n; })[0] || ALIAS_HOJA[n];
    if (!hit) { var c = D.DEPARTAMENTOS.filter(function (d) { return norm(d).indexOf(n) >= 0 || n.indexOf(norm(d)) >= 0; }); if (c.length === 1) hit = c[0]; }
    return { esAPU: true, bruto: bruto, depto: hit || null, exacto: false };
  }
  var RX_MILES = /^\$?\s*\d{1,3}(\.\d{3})+(,\d+)?$/;
  function aNumero(s) {
    if (s == null || s === '') return null;
    var t = String(s).trim().replace(/^\$\s*/, '');
    if (RX_MILES.test(t)) t = t.replace(/\./g, '').replace(',', '.');
    else if (/^\d+,\d+$/.test(t)) t = t.replace(',', '.');
    else t = t.replace(/,/g, '');
    var n = +t; return isNaN(n) ? NaN : n;
  }

  // Analiza el libro: por hoja, su departamento, encabezados a corregir, celdas con punto de
  // miles, filas por tipo y problemas. No escribe nada.
  function analizar(libro, cat, destino) {
    var out = { hojas: [], omitidas: [], ajustes: { encabezados: {}, hojas: [], miles: 0, sinDepto: [] } };
    libro.hojas.forEach(function (h) {
      var dh = deptoDeHoja(h.nombre);
      if (!dh.esAPU) { out.omitidas.push(h.nombre); return; }
      var hi = h.rows.findIndex(function (r) { return r.some(function (c) { return colCanonica(c) === 'Código'; }); });
      if (hi < 0) { out.hojas.push({ nombre: h.nombre, depto: dh.depto, error: 'No se encontró la fila de encabezados (falta «Código»).', filas: 0 }); return; }
      var head = h.rows[hi], map = {};
      head.forEach(function (c, i) {
        var can = colCanonica(c); if (!can || map[can] != null) return; map[can] = i;
        if (String(c).trim() !== can) out.ajustes.encabezados[String(c).trim() + '→' + can] = (out.ajustes.encabezados[String(c).trim() + '→' + can] || 0) + 1;
      });
      var faltan = COLS.filter(function (c) { return map[c] == null; });
      if (!dh.exacto && dh.depto) out.ajustes.hojas.push({ de: h.nombre, a: 'APU ' + dh.depto });
      if (!dh.depto) out.ajustes.sinDepto.push(h.nombre);
      var r = { nombre: h.nombre, depto: dh.depto, filas: 0, caps: 0, apus: 0, insumos: 0, miles: 0, errores: [], avisos: [], datos: [], faltan: faltan };
      if (faltan.length) r.errores.push('Faltan columnas: ' + faltan.join(', ') + '.');
      var apuActual = null, sumaIns = 0;
      function cerrarApu() {
        if (apuActual && apuActual.valor != null && apuActual.det.length && Math.abs(apuActual.valor - sumaIns) > D.tolerancia(apuActual.valor)) {
          r.avisos.push('El APU ' + apuActual.cod + ' vale ' + D.fmtCOP(apuActual.valor) + ' y la suma de sus insumos da ' + D.fmtCOP(sumaIns) + '.');
        }
      }
      for (var i = hi + 1; i < h.rows.length; i++) {
        var row = h.rows[i]; if (!row || !row.some(function (c) { return String(c).trim() !== ''; })) continue;
        function cel(k) { return map[k] == null ? '' : String(row[map[k]] == null ? '' : row[map[k]]).trim(); }
        var apu = cel('APU'), cod = cel('Código'); if (!cod) continue;
        r.filas++;
        ['Cantidad', 'Valor unitario', 'Valor total'].forEach(function (k) { if (RX_MILES.test(cel(k))) r.miles++; });
        if (apu === cod && /^\d+$/.test(cod)) { cerrarApu(); apuActual = null; r.caps++; r.datos.push({ t: 'cap', cod: cod, nombre: cel('Nombre') }); continue; }
        if (apu === cod && /^\d+\.\d+$/.test(cod)) {
          cerrarApu(); sumaIns = 0; r.apus++;
          var v = aNumero(cel('Valor total'));
          if (v == null || isNaN(v)) r.errores.push('Fila ' + (i + 1) + ': el APU ' + cod + ' no tiene un Valor total numérico.');
          apuActual = { t: 'apu', cod: cod, nombre: cel('Nombre'), unidad: cel('unidad'), valor: isNaN(v) ? null : v, det: [] };
          r.datos.push(apuActual); continue;
        }
        if (!apuActual) { r.errores.push('Fila ' + (i + 1) + ': el insumo ' + cod + ' aparece antes de cualquier APU; el orden de las filas importa.'); continue; }
        var cant = aNumero(cel('Cantidad')), vu = aNumero(cel('Valor unitario'));
        if (cant == null || isNaN(cant) || vu == null || isNaN(vu)) { r.errores.push('Fila ' + (i + 1) + ': el insumo ' + cod + ' del APU ' + apuActual.cod + ' tiene cantidad o valor que no es número.'); continue; }
        r.insumos++; sumaIns += Math.round(cant * vu);
        apuActual.det.push({ ins: cod, nombre: cel('Nombre'), unidad: cel('unidad'), cantidad: cant, valorUnit: vu });
      }
      cerrarApu();
      out.ajustes.miles += r.miles;
      // Contra la versión destino: qué se crearía y qué se actualizaría.
      if (r.depto && destino) {
        var nuevos = 0, act = 0;
        r.datos.filter(function (x) { return x.t === 'apu'; }).forEach(function (x) { if (D.precio(destino, r.depto, 'apu-' + x.cod)) act++; else nuevos++; });
        r.nuevos = nuevos; r.actualizados = act;
      }
      r.fueraAlcance = !!(r.depto && cat.alcance.deptos.indexOf(r.depto) < 0);
      r.minutos = Math.max(1, Math.round(r.filas * 3600 / 1981 / 60));   // ~1 h por cada 1.981 filas (medido en el backend)
      out.hojas.push(r);
    });
    return out;
  }

  // Upsert de un departamento sobre la versión: capítulos por nombre (globales), APU por código,
  // insumos globales por código y la composición del APU en ese departamento. Nunca borra.
  function aplicar(cat, ver, hoja) {
    var c = ver.contenido, dep = hoja.depto, creados = 0, actualizados = 0, capActual = null;
    c.precios[dep] = c.precios[dep] || {};
    hoja.datos.forEach(function (x) {
      if (x.t === 'cap') {
        var g = D.listCapitulosGlobales().filter(function (k) { return norm(k.nombre) === norm(x.nombre); })[0];
        if (!g) { g = { id: 'cap-' + x.cod, cod: x.cod, nombre: x.nombre, orden: +x.cod || 99 }; D.guardarCapituloGlobal(g); }
        if (!c.capitulos.some(function (k) { return k.id === g.id; })) c.capitulos.push({ id: g.id, activo: true });
        capActual = g.id; return;
      }
      var id = 'apu-' + x.cod, a = D.apu(ver, id);
      if (!a) { c.apus.push({ id: id, cod: x.cod, capId: capActual || ('cap-' + x.cod.split('.')[0]), nombre: x.nombre, unidad: x.unidad || 'un', orden: +x.cod.split('.')[1] || 1, activo: true }); }
      else { a.nombre = x.nombre || a.nombre; a.unidad = x.unidad || a.unidad; }
      if (c.precios[dep][id]) actualizados++; else creados++;
      var existentes = {}; D.listInsumos().forEach(function (k) { existentes[k.cod] = 1; });
      x.det.forEach(function (d) { if (!existentes[d.ins]) { D.guardarInsumoGlobal({ cod: d.ins, nombre: d.nombre, unidad: d.unidad }); existentes[d.ins] = 1; } });
      c.precios[dep][id] = { valor: x.valor != null ? x.valor : x.det.reduce(function (s, d) { return s + Math.round(d.cantidad * d.valorUnit); }, 0), det: x.det.map(function (d) { return { ins: d.ins, cantidad: d.cantidad, valorUnit: d.valorUnit }; }) };
    });
    return { creados: creados, actualizados: actualizados };
  }

  window.MATRIZ = { descargarPlantilla: descargarPlantilla, leerArchivo: leerArchivo, ejemplo: ejemplo, analizar: analizar, aplicar: aplicar, libroXML: libroXML, deptoDeHoja: deptoDeHoja, aNumero: aNumero };
})();
