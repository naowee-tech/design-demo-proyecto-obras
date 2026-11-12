/* ============================================================================
 * Proyecto de Obras · v0.7 — Espacio de trabajo del catálogo (docs/rediseno V1–V4)
 *
 * Un catálogo, cuatro momentos: Contenido (construir y mantener), Alcance y estructura
 * (qué cubre y cómo se organiza), Versiones (revisar y activar) e Historial (traza).
 * Toda edición cae en la "vN en preparación": si no hay una, el primer cambio la abre
 * copiando la vigente, y lo avisa. La vigente es lo que ven los usuarios en Consulta.
 * Reemplaza a detalle.js (v0.6), que ordenaba la pantalla por HU y no por momento.
 * ========================================================================== */
(function () {
  'use strict';
  var D = window.OBRAS, U = window.OBRAS_UI, R = window.RD, esc = R.esc, ic = R.ic;
  var catId = R.qs('cat');
  if (!catId || !D.getCatalogo(catId)) { var f = D.listCatalogos()[0]; catId = f.id; }

  var S = { tab: R.qs('tab') || 'contenido', depto: R.qs('dep') || null, sel: null, abiertos: {}, cerrados: {}, q: '', verVista: R.qs('ver') || null, audF: {} };
  if (R.qs('apu')) S.sel = { tipo: 'apu', id: R.qs('apu') };

  function cat() { return D.getCatalogo(catId); }
  // Versión de trabajo: la que está en preparación; si no hay, la vigente (editarla abre una).
  function trabajo(c) { c = c || cat(); return D.preparacion(c) || D.vigente(c) || c.versiones[c.versiones.length - 1]; }
  function vista(c) {
    c = c || cat();
    if (S.verVista) { var v = D.version(c, S.verVista); if (v && v.estado === 'historica') return v; S.verVista = null; }
    return trabajo(c);
  }
  function soloLectura() { return !!S.verVista; }
  function syncUrl() {
    var u = new URL(location.href);
    u.searchParams.set('cat', catId); u.searchParams.set('tab', S.tab);
    if (S.depto) u.searchParams.set('dep', S.depto); else u.searchParams.delete('dep');
    if (S.sel && S.sel.tipo === 'apu') u.searchParams.set('apu', S.sel.id); else u.searchParams.delete('apu');
    if (S.verVista) u.searchParams.set('ver', S.verVista); else u.searchParams.delete('ver');
    history.replaceState(null, '', u);
  }

  // Todo cambio pasa por aquí: abre la versión en preparación si hace falta.
  function paraEditar() {
    var c = cat(), r = D.abrirPreparacion(c);
    if (r.nueva) R.toast('Se abrió la <b>' + r.ver.v + ' en preparación</b>. La ' + (D.vigente(c) ? D.vigente(c).v + ' vigente' : 'versión vigente') + ' no cambia hasta que la actives.', 'informative', 5200);
    return { c: c, ver: r.ver };
  }
  function registrar(c, accion, elemento, extra) { D.logAudit(c, accion, elemento, Object.assign({ version: trabajo(c).v }, extra || {})); }

  // ════════════ Encabezado + barra de versión ════════════
  function renderHead() {
    var c = cat(), vig = D.vigente(c);
    document.getElementById('bcCat').textContent = c.nombre;
    document.getElementById('bcCats').href = R.href('catalogos.html');
    document.getElementById('wsHead').innerHTML =
      '<div class="rd-grow"><h2 class="rd-ws-title">' + esc(c.nombre) + '</h2>' +
      '<div class="rd-ws-meta">' + R.chipEstado(c.estado) + '<span>' + ic('map', 14) + ' ' + esc(R.alcanceTxt(c)) + '</span><span>·</span><span>' + ic('users', 14) + ' ' + esc(R.rolesTxt(c)) + '</span>' +
      (c.alcance.condicion ? '<span>·</span><span>' + esc(c.alcance.condicion) + '</span>' : '') + '<span>·</span><span>Vigencia ' + D.fmtFecha(c.vigenciaIni) + ' – ' + D.fmtFecha(c.vigenciaFin) + '</span></div></div>' +
      '<div class="rd-ws-actions">' +
      '<button class="naowee-btn naowee-btn--mute" id="btnDatos">' + ic('edit') + 'Datos generales</button>' +
      '<a class="naowee-btn naowee-btn--mute" id="btnImportar" href="' + R.href('importar.html', { cat: c.id }) + '">' + ic('upload') + 'Importar matriz</a>' +
      '</div>';
    document.getElementById('btnDatos').onclick = function () { window.CAT_FORM.abrir(cat(), function () { renderAll(); }); };
    if (c.estado === 'Inactivo') document.getElementById('btnImportar').style.display = 'none';
  }

  function renderVerbar() {
    var c = cat(), vig = D.vigente(c), p = D.preparacion(c), el = document.getElementById('wsVerbar'), h = '';
    if (c.importacionActiva && c.importacionActiva.estado !== 'terminada') {
      var imp = c.importacionActiva, hechos = imp.cola.filter(function (q) { return q.estado === 'ok'; }).length;
      h += '<div class="rd-verbar" style="background:#FFFAEB;border-color:#FEDF89">' + ic('clock', 18) + '<div class="rd-verbar-txt"><b>Importación sin terminar</b> · ' + hechos + ' de ' + imp.cola.length + ' departamentos cargados en la ' + esc(imp.destino) + '. Lo cargado quedó guardado.</div>' +
        '<div class="rd-verbar-cta"><a class="naowee-btn naowee-btn--loud naowee-btn--small" href="' + R.href('importar.html', { cat: c.id }) + '">Retomar importación</a></div></div>';
    }
    if (S.verVista) {
      var hv = D.version(c, S.verVista);
      h += '<div class="rd-verbar" style="background:#F2F4F7;border-color:#E4E8EE">' + ic('clock', 18) + '<div class="rd-verbar-txt">Estás viendo la <b>' + esc(hv.v) + ' histórica</b> (activada el ' + D.fmtFecha(hv.activada) + '), tal como quedó: <b>solo lectura</b>.</div>' +
        '<div class="rd-verbar-cta"><button class="naowee-btn naowee-btn--mute naowee-btn--small" id="btnSalirHist">Volver a la versión de trabajo</button></div></div>';
    } else if (p) {
      var n = D.cambiosDe(c, p.v).length;
      h += '<div class="rd-verbar" id="verbar">' + R.chip(p.v + ' en preparación', 'prep') +
        '<div class="rd-verbar-txt"><b>' + n + ' cambio' + (n === 1 ? '' : 's') + '</b> ' + (vig ? 'desde la ' + vig.v + ' vigente, que es la que ven los usuarios.' : '· aún no hay versión vigente: los usuarios no ven este catálogo.') + ' Todo lo que edites cae aquí.</div>' +
        '<div class="rd-verbar-cta"><button class="naowee-btn naowee-btn--loud naowee-btn--small" id="btnRevisar">Revisar y activar ' + p.v + '</button></div></div>';
    } else if (vig) {
      h += '<div class="rd-verbar rd-verbar--vig" id="verbar">' + R.chip(vig.v + ' vigente', 'ok') + '<div class="rd-verbar-txt">Sin cambios pendientes. El primer cambio abre la <b>versión en preparación</b> siguiente; la ' + vig.v + ' no se toca.</div></div>';
    }
    el.innerHTML = h;
    var b = document.getElementById('btnRevisar'); if (b) b.onclick = function () { selTab('versiones'); };
    var s = document.getElementById('btnSalirHist'); if (s) s.onclick = function () { S.verVista = null; S.sel = null; renderAll(); };
  }

  // ════════════ Pestañas ════════════
  function selTab(t) {
    S.tab = t;
    document.querySelectorAll('#tabsBar .naowee-tab').forEach(function (b) {
      var on = b.dataset.tab === t; b.classList.toggle('naowee-tab--selected', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1;
    });
    document.querySelectorAll('.t-panel').forEach(function (p) { p.classList.toggle('active', p.id === 'panel-' + t); });
    ({ contenido: renderContenido, alcance: renderAlcance, versiones: renderVersiones, historial: renderHistorial })[t]();
    syncUrl();
  }
  window.selTab = selTab;
  document.querySelectorAll('#tabsBar .naowee-tab').forEach(function (b, i, all) {
    b.onclick = function () { selTab(b.dataset.tab); };
    b.onkeydown = function (e) {
      var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!k) return;
      var n = all[(i + k + all.length) % all.length]; n.focus(); n.click();
    };
  });

  // ════════════ Contenido: árbol por departamento + detalle ════════════
  function deptoActual(c, ver) {
    var cargados = D.deptosCargados(ver);
    if (!S.depto || c.alcance.deptos.indexOf(S.depto) < 0) S.depto = cargados[0] || c.alcance.deptos[0] || null;
    return S.depto;
  }
  function esNuevo(c, apuId) { var vig = D.vigente(c), p = D.preparacion(c); return p && !S.verVista && vig && !D.apu(vig, apuId); }

  function checklistCard(c, ver) {
    var req = D.requisitos(c, ver);
    return '<div class="rd-card" id="wsChecklist" style="margin-bottom:14px"><div class="rd-row"><div class="rd-grow"><h3 class="rd-h2">' + esc(ver.v) + ' en preparación: qué falta para activarla</h3>' +
      '<p class="rd-sub">Cuando todo esté en verde, <b>Revisar y activar</b> la publica para los roles del alcance.</p></div></div>' +
      '<ul class="rd-check" style="margin-top:8px">' + req.map(function (r) {
        var st = r.ok ? 'ok' : r.aviso ? 'warn' : 'todo';
        var cta = r.ok ? '' : r.id === 'contenido' || r.id === 'deptos' ? '<a class="naowee-btn naowee-btn--loud naowee-btn--small" id="ckImportar" href="' + R.href('importar.html', { cat: c.id }) + '">' + ic('upload') + 'Importar matriz</a>' :
          r.id === 'alcance' ? '<button class="naowee-btn naowee-btn--mute naowee-btn--small" onclick="selTab(\'alcance\')">Definir alcance</button>' : '';
        if (r.id === 'contenido' && !r.ok) cta += ' <button class="naowee-btn naowee-btn--mute naowee-btn--small" id="ckCapitulo">' + ic('plus') + 'Crear capítulo</button>';
        return '<li><span class="rd-check-ic rd-check-ic--' + st + '">' + (r.ok ? ic('check') : r.aviso ? ic('warn') : '') + '</span><div class="rd-grow"><div class="rd-check-t">' + esc(r.t) + '</div><div class="rd-check-d">' + esc(r.d) + '</div></div><div class="rd-check-a">' + cta + '</div></li>';
      }).join('') + '</ul></div>';
  }

  // Contenido: franja horizontal arriba (departamento, búsqueda, números, crear) y debajo
  // los capítulos a todo lo ancho. Al elegir un APU la tabla se contrae a árbol y entra su
  // detalle: nunca hay un panel vacío ni uno que repita lo que ya muestra el árbol.
  function renderContenido() {
    var c = cat(), ver = vista(c), el = document.getElementById('panel-contenido');
    var depto = deptoActual(c, ver), ro = soloLectura(), sinVig = !D.vigente(c);
    var caps = ver.contenido.capitulos, h = '';
    if (sinVig && !ro) h += checklistCard(c, ver);
    if (!ver.contenido.apus.length && !caps.length) {
      el.innerHTML = h + (sinVig ? '' : '<div class="rd-card rd-empty"><b>Esta versión no tiene contenido</b>Importa la matriz o crea el primer capítulo.</div>');
      wireChecklist(); return;
    }
    var cargados = D.deptosCargados(ver), des = D.descuadres(c, ver);
    var selApu = S.sel && S.sel.tipo === 'apu' ? D.apu(ver, S.sel.id) : null;
    if (S.sel && S.sel.tipo === 'apu' && !selApu) S.sel = null;
    // Franja superior
    h += '<div class="rd-card" id="wsBarra" style="padding:14px 16px;margin-bottom:14px"><div class="rd-row" style="align-items:flex-end;gap:14px">' +
      '<div style="min-width:220px"><label class="naowee-textfield__label" for="wsDepto" style="margin:0 0 6px;display:block">Departamento</label><select id="wsDepto" class="rd-select" aria-describedby="wsDeptoHelp">' + c.alcance.deptos.map(function (d) {
        return '<option value="' + esc(d) + '"' + (d === depto ? ' selected' : '') + '>' + esc(d) + (cargados.indexOf(d) >= 0 ? '' : ' — sin precios') + '</option>';
      }).join('') + '</select></div>' +
      '<div class="naowee-searchbox naowee-searchbox--small" style="flex:1 1 240px;max-width:340px"><div class="naowee-searchbox__input-wrap"><span class="naowee-searchbox__icon">' + ic('search', 15) + '</span><input class="naowee-searchbox__input" id="wsBuscar" placeholder="Buscar APU por código o nombre" aria-label="Buscar APU" value="' + esc(S.q) + '"></div></div>' +
      '<div class="rd-row rd-grow" id="wsNumeros" style="gap:18px;justify-content:flex-end">' + dato('Capítulos', caps.length) + dato('APU activos', D.nApus(ver)) +
      dato('Con precios', cargados.length + ' de ' + c.alcance.deptos.length, 'wsDeptoHelp') + dato('No cuadran', des.length, null, des.length ? 'var(--rd-warn)' : null) + '</div>' +
      (ro ? '' : '<div class="rd-row"><button class="naowee-btn naowee-btn--mute naowee-btn--small" id="btnNuevoCap">' + ic('plus') + 'Capítulo</button><button class="naowee-btn naowee-btn--mute naowee-btn--small" id="btnNuevoApu">' + ic('plus') + 'APU</button></div>') +
      '</div></div>';
    h += selApu ? '<div class="rd-split">' + arbolAngosto(c, ver, depto) + '<div id="wsDetail">' + detalleApu(c, ver, depto, selApu) + '</div></div>' : tablaAncha(c, ver, depto);
    el.innerHTML = h;
    wireChecklist(); wireContenido(c, ver);
  }
  function dato(k, v, id, color) { return '<div' + (id ? ' id="' + id + '"' : '') + ' style="text-align:right"><div class="rd-crumb" style="font-size:11px;text-transform:uppercase;letter-spacing:.04em">' + k + '</div><div style="font-size:18px;font-weight:800;' + (color ? 'color:' + color : '') + '" class="rd-num">' + v + '</div></div>'; }
  function capsOrden(ver) { return ver.contenido.capitulos.slice().sort(function (a, b) { return D.capitulo(a.id).orden - D.capitulo(b.id).orden; }); }
  function apusFiltrados(ver, capId) { var q = U.norm(S.q); return D.apusDeCapitulo(ver, capId).filter(function (a) { return !q || U.norm(a.cod + ' ' + a.nombre).indexOf(q) >= 0; }); }
  function marcas(c, ver, depto, a, descu) {
    return (descu[a.id] ? '<span class="rd-dot rd-dot--warn" title="No coincide con la suma de sus insumos"></span>' : '') +
      (esNuevo(c, a.id) ? '<span class="rd-dot rd-dot--new" title="Nuevo en la ' + esc(ver.v) + '"></span>' : '');
  }
  function descuDe(c, ver, depto) { var m = {}; D.descuadres(c, ver).forEach(function (d) { if (d.depto === depto) m[d.apuId] = 1; }); return m; }

  function tablaAncha(c, ver, depto) {
    var ro = soloLectura(), descu = descuDe(c, ver, depto), q = S.q;
    var t = '<div class="rd-card" id="wsTree" data-modo="tabla" style="padding:6px 12px"><div class="rd-tbl-wrap"><table class="rd-tbl" aria-label="Capítulos y APU en ' + esc(depto) + '"><thead><tr><th>Código</th><th>APU</th><th>Unidad</th><th class="r">Valor en ' + esc(depto) + '</th><th>Control</th></tr></thead>';
    capsOrden(ver).forEach(function (cp) {
      var g = D.capitulo(cp.id), apus = apusFiltrados(ver, cp.id);
      if (q && !apus.length) return;
      var open = q || !S.cerrados[cp.id], nAct = D.apusDeCapitulo(ver, cp.id).filter(function (a) { return a.activo !== false; }).length;
      t += '<tbody data-nivel="' + cp.id + '"><tr><td colspan="5" style="background:var(--rd-soft);padding:0"><div class="rd-row" style="gap:0">' +
        '<button class="rd-tree-cap rd-grow" data-cap="' + cp.id + '" aria-expanded="' + !!open + '" style="width:auto;border-radius:0;padding:11px 12px"><svg class="rd-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 6l6 6-6 6"/></svg><span>' + esc(g.cod) + ' · ' + esc(g.nombre) + '</span><span class="rd-tree-n">' + nAct + ' APU</span></button>' +
        (ro ? '' : '<button class="naowee-btn naowee-btn--mute naowee-btn--small" data-rencap="' + cp.id + '" title="El capítulo es global: cambia en todas las versiones">' + ic('edit', 14) + 'Renombrar</button><button class="naowee-btn naowee-btn--mute naowee-btn--small" data-apucap="' + cp.id + '" style="margin-right:6px">' + ic('plus', 14) + 'APU</button>') + '</div></td></tr>' +
        (open ? apus.map(function (a) {
          var p = D.precio(ver, depto, a.id), ctl = p && D.control(p);
          return '<tr class="rd-click' + (a.activo === false ? ' t-row-off' : '') + '" data-apu="' + a.id + '" tabindex="0"><td><b>' + esc(a.cod) + '</b></td><td><span class="rd-row" style="gap:8px;flex-wrap:nowrap"><span style="' + (a.activo === false ? 'text-decoration:line-through;color:#98A2B3' : '') + '">' + esc(a.nombre) + '</span>' + marcas(c, ver, depto, a, descu) + '</span></td><td>' + esc(a.unidad) + '</td>' +
            '<td class="r">' + (p ? '<b>' + D.fmtCOP(p.valor) + '</b> <span class="rd-muted">/' + esc(a.unidad) + '</span>' : '<span class="rd-muted">sin precio</span>') + '</td><td>' +
            (a.activo === false ? R.chip('Retirado', 'neutral') : !p ? '<span class="rd-muted">—</span>' : ctl.ok ? '<span style="display:inline-flex;gap:4px;align-items:center;color:var(--rd-ok);font-size:12.5px;font-weight:700">' + ic('check', 13) + 'Cuadra</span>' : R.chip('No cuadra', 'warn', 'warn')) + '</td></tr>';
        }).join('') : '') + '</tbody>';
    });
    return t + '</table></div></div>';
  }

  function arbolAngosto(c, ver, depto) {
    var descu = descuDe(c, ver, depto), q = S.q, selCap = (D.apu(ver, S.sel.id) || {}).capId;
    var t = '<div class="rd-tree" id="wsTree" data-modo="arbol"><div class="rd-tree-head" style="flex-direction:row;align-items:center"><b class="rd-grow" style="font-size:13px">' + esc(depto) + '</b><button class="naowee-btn naowee-btn--mute naowee-btn--small" id="btnVerTodos">' + ic('layers', 14) + 'Ver todos</button></div><div class="rd-tree-body" role="tree" aria-label="Capítulos y APU">';
    capsOrden(ver).forEach(function (cp) {
      var g = D.capitulo(cp.id), apus = apusFiltrados(ver, cp.id);
      if (q && !apus.length) return;
      var open = q || S.abiertos[cp.id] || cp.id === selCap;
      t += '<div role="treeitem" aria-expanded="' + !!open + '"><button class="rd-tree-cap" data-cap="' + cp.id + '" aria-expanded="' + !!open + '"><svg class="rd-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 6l6 6-6 6"/></svg><span>' + esc(g.cod) + ' · ' + esc(g.nombre) + '</span><span class="rd-tree-n">' + apus.length + ' APU</span></button>' +
        '<div class="rd-tree-apus" role="group"' + (open ? '' : ' hidden') + '>' + apus.map(function (a) {
          var sel = S.sel.id === a.id;
          return '<button class="rd-tree-apu' + (sel ? ' sel' : '') + (a.activo === false ? ' off' : '') + '" data-apu="' + a.id + '" role="treeitem" aria-selected="' + sel + '"><span class="rd-cod">' + esc(a.cod) + '</span><span class="rd-nm">' + esc(a.nombre) + '</span>' + marcas(c, ver, depto, a, descu) + '</button>';
        }).join('') + '</div></div>';
    });
    return t + '</div></div>';
  }
  function wireChecklist() {
    var b = document.getElementById('ckCapitulo'); if (b) b.onclick = function () { drawerCapitulo(null); };
  }
  function detalleApu(c, ver, depto, a) {
    var p = D.precio(ver, depto, a.id), ro = soloLectura(), g = D.capitulo(a.capId), vig = D.vigente(c);
    var h = '<div class="rd-card" id="wsApuDet"><div class="rd-detail-head"><div class="rd-grow"><div class="rd-crumb">' + esc(g.cod) + ' · ' + esc(g.nombre) + '</div>' +
      '<h3 class="rd-apu-title">' + esc(a.cod) + ' · ' + esc(a.nombre) + '</h3>' +
      '<div class="rd-row" style="margin-top:8px">' + R.chip('Unidad: ' + a.unidad, 'neutral') + (a.activo === false ? R.chip('Retirado de la ' + ver.v, 'bad') : '') + (esNuevo(c, a.id) ? R.chip('Nuevo en la ' + ver.v, 'prep') : '') + '</div></div>' +
      (ro ? '' : '<div class="rd-row">' + (a.activo === false
        ? '<button class="naowee-btn naowee-btn--mute naowee-btn--small" id="btnReincorporar">' + ic('undo') + 'Reincorporar</button>'
        : '<button class="naowee-btn naowee-btn--mute naowee-btn--small" id="btnEditarApu">' + ic('edit') + 'Editar APU</button><button class="naowee-btn naowee-btn--mute naowee-btn--small" id="btnRetirar">' + ic('off') + 'Retirar</button>') + '</div>') + '</div>';
    if (a.activo === false) h += '<div class="rd-note" style="margin-top:12px">' + ic('info') + '<span><b>Motivo del retiro:</b> ' + esc(a.motivoRetiro || '—') + '. No aparece en la ' + esc(ver.v) + ' cuando se active; ' + (vig && D.apu(vig, a.id) ? 'la ' + vig.v + ' vigente todavía lo tiene.' : '') + '</span></div>';
    if (!p) {
      h += '<div class="rd-empty" style="padding:28px 10px"><b>Sin precios en ' + esc(depto) + '</b>Los precios de este departamento llegan al importar la hoja <b>APU ' + esc(depto) + '</b>.' +
        (ro ? '' : '<div style="margin-top:12px"><a class="naowee-btn naowee-btn--loud naowee-btn--small" href="' + R.href('importar.html', { cat: c.id }) + '">' + ic('upload') + 'Importar matriz</a></div>') + '</div></div>';
      return h;
    }
    var ctl = D.control(p);
    var pv = vig && vig !== ver ? D.precio(vig, depto, a.id) : null;
    h += '<div class="rd-row" style="margin-top:16px;align-items:flex-end"><div class="rd-grow"><div class="rd-crumb">Valor del APU en ' + esc(depto) + '</div><div class="rd-price" id="wsPrecio"><b>' + D.fmtCOP(p.valor) + '</b><span>por ' + esc(a.unidad) + '</span></div>' +
      (pv && pv.valor !== p.valor ? '<div class="rd-sub">En la ' + esc(vig.v) + ' vigente: ' + D.fmtCOP(pv.valor) + '</div>' : '') + '</div></div>' +
      '<div class="rd-control rd-control--' + (ctl.ok ? 'ok' : 'bad') + '" id="wsControl">' + ic(ctl.ok ? 'check' : 'warn') +
      '<span>' + (ctl.ok ? '<b>Control del valor:</b> coincide con la suma de sus ' + p.det.length + ' insumos.' : '<b>No coincide</b> con la suma de sus insumos (' + D.fmtCOP(ctl.suma) + '): diferencia de ' + D.fmtCOP(Math.abs(ctl.dif)) + '. El valor viene del archivo y no se recalcula solo.') + '</span>' +
      (!ctl.ok && !ro ? '<button class="naowee-btn naowee-btn--mute naowee-btn--small" id="btnUsarSuma">Usar la suma</button>' : '') + '</div>';
    h += '<div class="rd-row" style="margin-top:18px"><h4 class="rd-h3 rd-grow">Insumos en ' + esc(depto) + '</h4>' + (ro || a.activo === false ? '' : '<button class="naowee-btn naowee-btn--mute naowee-btn--small" id="btnAgregarIns">' + ic('plus') + 'Agregar insumo</button>') + '</div>' +
      '<div class="rd-tbl-wrap"><table class="rd-tbl" id="wsInsumos"><thead><tr><th>Código</th><th>Insumo</th><th>Unidad</th><th class="r">Cantidad por ' + esc(a.unidad) + '</th><th class="r">V. unitario</th><th class="r">V. total</th>' + (ro ? '' : '<th><span class="sr-only">Acciones</span></th>') + '</tr></thead><tbody>' +
      p.det.map(function (d, i) {
        var ins = D.insumo(d.ins);
        return '<tr><td><b>' + esc(d.ins) + '</b></td><td>' + esc(ins.nombre) + '</td><td>' + esc(ins.unidad) + '</td><td class="r">' + D.fmtNum(d.cantidad) + '</td><td class="r">' + D.fmtCOP(d.valorUnit) + '</td><td class="r">' + D.fmtCOP(D.totalDet(d)) + '</td>' +
          (ro ? '' : '<td class="r"><button class="naowee-btn naowee-btn--mute naowee-btn--small" data-edins="' + i + '" aria-label="Editar ' + esc(ins.nombre) + '">' + ic('edit') + '</button></td>') + '</tr>';
      }).join('') + '</tbody><tfoot><tr><td colspan="5">Suma de insumos</td><td class="r">' + D.fmtCOP(ctl.suma) + '</td>' + (ro ? '' : '<td></td>') + '</tr></tfoot></table></div>' +
      '<p class="rd-sub" style="margin-top:8px">' + ic('globe', 12) + ' Código, nombre y unidad del insumo son <b>globales</b>; la cantidad y el valor unitario son de este APU en ' + esc(depto) + '.</p>';
    var pp = D.presupuestosConApu(c.id, a.cod, depto);
    if (pp.length) h += '<div class="rd-note" style="margin-top:12px">' + ic('info') + '<span><b>' + pp.length + ' presupuesto' + (pp.length === 1 ? '' : 's') + '</b> usan este APU en ' + esc(depto) + ': ' + pp.map(function (x) { return esc(x.nombre) + ' (' + x.version + ')'; }).join(' · ') + '. Cada uno sigue con su versión.</span></div>';
    return h + '</div>';
  }

  function wireContenido(c, ver) {
    var sd = document.getElementById('wsDepto'); if (sd) sd.onchange = function () { S.depto = sd.value; renderContenido(); syncUrl(); };
    var sb = document.getElementById('wsBuscar'); if (sb) sb.oninput = function () { S.q = sb.value; var pos = sb.selectionStart; renderContenido(); var n = document.getElementById('wsBuscar'); n.focus(); n.setSelectionRange(pos, pos); };
    var enTabla = !!document.querySelector('#wsTree[data-modo="tabla"]');
    document.querySelectorAll('[data-cap]').forEach(function (b) {
      b.onclick = function () {
        var id = b.dataset.cap, abierto = b.getAttribute('aria-expanded') === 'true';
        if (enTabla) S.cerrados[id] = abierto; else S.abiertos[id] = !abierto;
        renderContenido(); syncUrl();
      };
    });
    document.querySelectorAll('[data-apu]').forEach(function (b) {
      b.onclick = function () { R.flip('#wsTree', '#wsDetail', function () { S.sel = { tipo: 'apu', id: b.dataset.apu }; renderContenido(); }); syncUrl(); };
      b.onkeydown = function (e) { if (b.tagName === 'TR' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); b.click(); } };
    });
    document.querySelectorAll('[data-rencap]').forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); drawerCapitulo(b.dataset.rencap); }; });
    document.querySelectorAll('[data-apucap]').forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); drawerNuevoApu(b.dataset.apucap); }; });
    function on(id, fn) { var e = document.getElementById(id); if (e) e.onclick = fn; }
    on('btnVerTodos', function () { R.flip('#wsTree', '#wsDetail', function () { S.sel = null; renderContenido(); }); syncUrl(); });
    on('btnNuevoCap', function () { drawerCapitulo(null); });
    on('btnNuevoApu', function () { var capSel = S.sel && S.sel.tipo === 'cap' ? S.sel.id : S.sel && S.sel.tipo === 'apu' ? (D.apu(ver, S.sel.id) || {}).capId : null; drawerNuevoApu(capSel); });
    on('btnEditarApu', function () { drawerApu(S.sel.id); });
    on('btnAgregarIns', function () { drawerInsumo(S.sel.id, null); });
    on('btnRetirar', retirarApu);
    on('btnReincorporar', reincorporarApu);
    on('btnUsarSuma', usarSuma);
    document.querySelectorAll('[data-edins]').forEach(function (b) { b.onclick = function () { drawerInsumo(S.sel.id, +b.dataset.edins); }; });
  }
  // ════════════ Acciones de contenido ════════════
  function usarSuma() {
    var e = paraEditar(), p = D.precio(e.ver, S.depto, S.sel.id), a = D.apu(e.ver, S.sel.id);
    var antes = p.valor; p.valor = D.sumaInsumos(p);
    D.saveCatalogo(e.c);
    registrar(e.c, 'Editar valor del APU', 'APU · ' + a.cod, { depto: S.depto, detalle: { cambios: [{ etiqueta: 'Valor del APU', antes: D.fmtCOP(antes), despues: D.fmtCOP(p.valor) }] } });
    R.toast('El valor del <b>' + esc(a.cod) + '</b> en ' + esc(S.depto) + ' ahora es la suma de sus insumos: ' + D.fmtCOP(p.valor) + '.');
    renderAll();
  }
  function retirarApu() {
    var c = cat(), ver = trabajo(c), a = D.apu(ver, S.sel.id);
    var pp = D.presupuestosConApu(c.id, a.cod);
    R.pedirMotivo({ titulo: 'Retirar el APU ' + a.cod, sub: a.nombre, ok: 'Retirar de la versión',
      extra: '<p class="rd-sub">Sale de la versión en preparación en todos los departamentos. No se borra: la versión vigente y las históricas lo conservan, y se puede reincorporar.' +
        (pp.length ? ' <b>' + pp.length + ' presupuesto' + (pp.length === 1 ? '' : 's') + '</b> lo usan y siguen con su versión.' : '') + '</p>' }).then(function (m) {
      if (!m) return;
      var e = paraEditar(), x = D.apu(e.ver, S.sel.id); x.activo = false; x.motivoRetiro = m; D.saveCatalogo(e.c);
      registrar(e.c, 'Retirar APU', 'APU · ' + x.cod, { detalle: { motivo: m } });
      R.toast('<b>' + esc(x.cod) + '</b> quedó retirado de la ' + esc(e.ver.v) + '.'); renderAll();
    });
  }
  function reincorporarApu() {
    var e = paraEditar(), x = D.apu(e.ver, S.sel.id); x.activo = true; delete x.motivoRetiro; D.saveCatalogo(e.c);
    registrar(e.c, 'Reincorporar APU', 'APU · ' + x.cod);
    R.toast('<b>' + esc(x.cod) + '</b> vuelve a la ' + esc(e.ver.v) + '.'); renderAll();
  }

  // ════════════ Drawers ════════════
  function drawer(crumb, titulo, body, pie) {
    document.getElementById('drCrumb').innerHTML = crumb; document.getElementById('drT').textContent = titulo;
    document.getElementById('drB').innerHTML = body; document.getElementById('drF').innerHTML = pie;
    openModal('wsDrawer');
    setTimeout(function () { var f = document.querySelector('#drB input:not([readonly]), #drB select'); if (f) f.focus(); }, 60);
  }
  function campo(id, label, val, extra) {
    extra = extra || {};
    return '<div class="naowee-textfield"><label class="naowee-textfield__label' + (extra.req ? ' naowee-textfield__label--required' : '') + '" for="' + id + '">' + label + '</label>' +
      '<div class="naowee-textfield__input-wrap"><input class="naowee-textfield__input" id="' + id + '" value="' + esc(val == null ? '' : val) + '"' + (extra.type ? ' type="' + extra.type + '" step="any"' : '') + (extra.ro ? ' readonly' : '') + ' autocomplete="off"></div>' +
      (extra.help ? '<span class="naowee-helper">' + extra.help + '</span>' : '') + '<div class="rd-err" id="' + id + 'Err" hidden></div></div>';
  }
  function selectHTML(id, label, opts, val) {
    return '<div><label class="naowee-textfield__label" for="' + id + '" style="display:block">' + label + '</label><select id="' + id + '" class="rd-select">' +
      opts.map(function (o) { return '<option value="' + esc(o.v) + '"' + (o.v === val ? ' selected' : '') + '>' + esc(o.l) + '</option>'; }).join('') + '</select></div>';
  }
  function err(id, msg) { var e = document.getElementById(id + 'Err'); if (!e) return; e.hidden = !msg; e.textContent = msg || ''; }
  function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
  function num(id) { var v = val(id).replace(/\./g, '').replace(',', '.'); return v === '' ? NaN : +v; }
  function numDec(id) { var v = val(id).replace(',', '.'); return v === '' ? NaN : +v; }
  var PIE = function (ok, label) { return '<button class="naowee-btn naowee-btn--mute" onclick="closeModal(\'wsDrawer\')">Cancelar</button><button class="naowee-btn naowee-btn--loud" id="' + ok + '">' + label + '</button>'; };

  // HU04 · capítulo (nuevo) / renombrar (global)
  function drawerCapitulo(capId) {
    var g = capId ? D.capitulo(capId) : null;
    var uso = capId ? D.usoGlobal('capitulo', capId) : [];
    var sug = String(D.listCapitulosGlobales().reduce(function (m, x) { return Math.max(m, +x.cod || 0); }, 0) + 1);
    drawer(esc(cat().nombre), g ? 'Renombrar capítulo' : 'Nuevo capítulo',
      (g ? '' : '<p class="rd-sub">El capítulo agrupa APU. Es <b>global</b>: si ya existe uno con ese nombre en otro catálogo, se reutiliza.</p>') +
      campo('capCod', 'Código', g ? g.cod : sug, { req: true, ro: !!g }) + campo('capNombre', 'Nombre', g ? g.nombre : '', { req: true }) +
      (g ? R.avisoGlobal(uso, 'El capítulo') : '') +
      '<div id="capExiste"></div>', PIE('capOk', g ? 'Renombrar' : 'Crear capítulo'));
    var inp = document.getElementById('capNombre');
    inp.oninput = function () {
      var ex = D.listCapitulosGlobales().filter(function (x) { return x.id !== capId && U.norm(x.nombre) === U.norm(inp.value); })[0];
      document.getElementById('capExiste').innerHTML = ex && !g ? '<div class="rd-note">' + ic('globe') + '<span>Ya existe el capítulo <b>' + esc(ex.cod + ' · ' + ex.nombre) + '</b>: se agrega ese a la versión.</span></div>' : '';
    };
    document.getElementById('capOk').onclick = function () {
      var nombre = val('capNombre'), cod = val('capCod');
      err('capNombre', nombre ? '' : 'El nombre es obligatorio.'); err('capCod', cod ? '' : 'El código es obligatorio.');
      if (!nombre || !cod) return;
      if (g) {
        if (nombre === g.nombre) { closeModal('wsDrawer'); return; }
        var antes = g.nombre; g.nombre = nombre; D.guardarCapituloGlobal(g);
        D.logAudit(cat(), 'Renombrar capítulo', 'Capítulo · ' + g.cod, { global: true, detalle: { cambios: [{ etiqueta: 'Nombre (global)', antes: antes, despues: nombre }] } });
        closeModal('wsDrawer'); R.toast('Capítulo renombrado en todas las versiones que lo usan.'); renderAll(); return;
      }
      var ex = D.listCapitulosGlobales().filter(function (x) { return U.norm(x.nombre) === U.norm(nombre); })[0];
      var mismoCod = D.listCapitulosGlobales().filter(function (x) { return x.cod === cod; })[0];
      if (!ex && mismoCod) { err('capCod', 'El código ' + cod + ' ya es del capítulo «' + mismoCod.nombre + '».'); return; }
      var e = paraEditar();
      var id = ex ? ex.id : 'cap-' + cod;
      if (!ex) D.guardarCapituloGlobal({ id: id, cod: cod, nombre: nombre, orden: +cod || 99 });
      if (e.ver.contenido.capitulos.some(function (x) { return x.id === id; })) { err('capNombre', 'Ese capítulo ya está en la versión.'); return; }
      e.ver.contenido.capitulos.push({ id: id, activo: true }); D.saveCatalogo(e.c);
      registrar(e.c, 'Crear capítulo', 'Capítulo · ' + (ex ? ex.cod : cod), { detalle: ex ? { motivo: 'Se reutiliza el capítulo global existente' } : null });
      closeModal('wsDrawer'); S.sel = null; delete S.cerrados[id];
      R.toast('Capítulo <b>' + esc(nombre) + '</b> agregado a la ' + esc(e.ver.v) + '.'); renderAll();
    };
  }

  // HU04 · APU nuevo
  function drawerNuevoApu(capId) {
    var c = cat(), ver = trabajo(c);
    if (!ver.contenido.capitulos.length) { R.toast('Primero crea un capítulo: el APU vive dentro de uno.', 'caution'); drawerCapitulo(null); return; }
    capId = capId || ver.contenido.capitulos[0].id;
    function sugerido(cid) { var g = D.capitulo(cid), n = D.apusDeCapitulo(ver, cid).reduce(function (m, a) { return Math.max(m, +a.cod.split('.')[1] || 0); }, 0); return g.cod + '.' + (n + 1); }
    var deptos = c.alcance.deptos;
    drawer(esc(c.nombre) + ' · ' + esc(ver.v), 'Nuevo APU',
      selectHTML('apuCap', 'Capítulo', ver.contenido.capitulos.map(function (x) { var g = D.capitulo(x.id); return { v: x.id, l: g.cod + ' · ' + g.nombre }; }), capId) +
      '<div class="rd-grid2">' + campo('apuCod', 'Código', sugerido(capId), { req: true, help: 'Capítulo.número, como en la matriz.' }) +
      selectHTML('apuUni', 'Unidad', D.UNIDADES.map(function (u) { return { v: u, l: u }; }), 'm2') + '</div>' +
      campo('apuNombre', 'Nombre', '', { req: true }) +
      selectHTML('apuDep', 'Primer precio en', deptos.map(function (d) { return { v: d, l: d }; }), S.depto || deptos[0]) +
      campo('apuValor', 'Valor del APU', '', { help: 'Opcional. Si lo dejas vacío, el APU queda sin precio en ese departamento hasta que agregues sus insumos o lo importes.' }) +
      '<div class="rd-note">' + ic('info') + '<span>El APU queda en la versión en preparación. Sus insumos se agregan desde su detalle.</span></div>', PIE('apuOk', 'Crear APU'));
    document.getElementById('apuCap').onchange = function () { document.getElementById('apuCod').value = sugerido(this.value); };
    document.getElementById('apuOk').onclick = function () {
      var cod = val('apuCod'), nombre = val('apuNombre'), v = num('apuValor'), cap = val('apuCap'), dep = val('apuDep');
      var dup = trabajo(cat()).contenido.apus.some(function (a) { return a.cod === cod; });
      err('apuCod', !cod ? 'El código es obligatorio.' : dup ? 'Ya hay un APU ' + cod + ' en esta versión.' : !/^\d+\.\d+$/.test(cod) ? 'Usa el formato capítulo.número (p. ej. 3.7).' : '');
      err('apuNombre', nombre ? '' : 'El nombre es obligatorio.');
      err('apuValor', val('apuValor') && (isNaN(v) || v < 0) ? 'Escribe un valor numérico.' : '');
      if (!cod || dup || !/^\d+\.\d+$/.test(cod) || !nombre || (val('apuValor') && (isNaN(v) || v < 0))) return;
      var e = paraEditar(), id = 'apu-' + cod;
      e.ver.contenido.apus.push({ id: id, cod: cod, capId: cap, nombre: nombre, unidad: val('apuUni'), orden: D.apusDeCapitulo(e.ver, cap).length + 1, activo: true });
      if (!isNaN(v)) { e.ver.contenido.precios[dep] = e.ver.contenido.precios[dep] || {}; e.ver.contenido.precios[dep][id] = { valor: v, det: [] }; }
      D.saveCatalogo(e.c);
      registrar(e.c, 'Crear APU', 'APU · ' + cod, { depto: isNaN(v) ? null : dep });
      closeModal('wsDrawer'); S.sel = { tipo: 'apu', id: id }; S.depto = dep; S.abiertos[cap] = true;
      R.toast('APU <b>' + esc(cod) + '</b> creado en la ' + esc(e.ver.v) + '.'); renderAll();
    };
  }

  // HU05 / HU08 · editar APU (identidad + valor en el departamento)
  function drawerApu(apuId) {
    var c = cat(), ver = trabajo(c), a = D.apu(ver, apuId), p = D.precio(ver, S.depto, apuId), dep = S.depto;
    var pp = D.presupuestosConApu(c.id, a.cod, dep);
    drawer(esc(D.capitulo(a.capId).nombre) + ' · ' + esc(ver.v), 'Editar APU ' + a.cod,
      '<h4 class="rd-h3">Identidad</h4>' +
      selectHTML('eaCap', 'Capítulo', ver.contenido.capitulos.map(function (x) { var g = D.capitulo(x.id); return { v: x.id, l: g.cod + ' · ' + g.nombre }; }), a.capId) +
      campo('eaNombre', 'Nombre', a.nombre, { req: true }) +
      selectHTML('eaUni', 'Unidad', D.UNIDADES.map(function (u) { return { v: u, l: u }; }), a.unidad) +
      (p ? '<h4 class="rd-h3" style="margin-top:6px">Valor en ' + esc(dep) + '</h4>' + campo('eaValor', 'Valor del APU (por ' + esc(a.unidad) + ')', p.valor, { req: true }) + '<div id="eaCtl"></div>' : '') +
      '<div class="rd-note">' + ic('layers') + '<span>El APU es de la versión: el cambio queda en la <b>' + esc(D.preparacion(c) ? D.preparacion(c).v : 'versión en preparación siguiente') + '</b> y la vigente no cambia.</span></div>' +
      (pp.length ? '<div class="rd-note">' + ic('info') + '<span><b>' + pp.length + ' presupuesto' + (pp.length === 1 ? '' : 's') + '</b> usan este APU en ' + esc(dep) + ' y siguen con su versión.</span></div>' : ''),
      PIE('eaOk', 'Revisar cambios'));
    function ctl() {
      if (!p) return; var v = num('eaValor'), s = D.sumaInsumos(p), ok = !isNaN(v) && Math.abs(v - s) <= D.tolerancia(v);
      document.getElementById('eaCtl').innerHTML = '<div class="rd-control rd-control--' + (ok ? 'ok' : 'bad') + '" style="margin-top:0">' + ic(ok ? 'check' : 'warn') + '<span>' + (ok ? 'Coincide con la suma de sus insumos.' : 'La suma de sus insumos es ' + D.fmtCOP(s) + '.') + '</span>' + (ok ? '' : '<button type="button" class="naowee-btn naowee-btn--mute naowee-btn--small" id="eaSuma">Usar la suma</button>') + '</div>';
      var b = document.getElementById('eaSuma'); if (b) b.onclick = function () { document.getElementById('eaValor').value = s; ctl(); };
    }
    if (p) { document.getElementById('eaValor').oninput = ctl; ctl(); }
    document.getElementById('eaOk').onclick = function () {
      var nombre = val('eaNombre'), v = p ? num('eaValor') : null;
      err('eaNombre', nombre ? '' : 'El nombre es obligatorio.');
      if (p) err('eaValor', isNaN(v) || v < 0 ? 'Escribe un valor numérico.' : '');
      if (!nombre || (p && (isNaN(v) || v < 0))) return;
      var antes = { nombre: a.nombre, unidad: a.unidad, cap: D.capitulo(a.capId).nombre, valor: p ? D.fmtCOP(p.valor) : '' };
      var desp = { nombre: nombre, unidad: val('eaUni'), cap: D.capitulo(val('eaCap')).nombre, valor: p ? D.fmtCOP(v) : '' };
      var cambios = D.diff(antes, desp, [{ key: 'nombre', label: 'Nombre' }, { key: 'unidad', label: 'Unidad' }, { key: 'cap', label: 'Capítulo' }, { key: 'valor', label: 'Valor en ' + dep }]);
      U.confirmarCambios({ titulo: 'Revisa los cambios del APU ' + a.cod, cambios: cambios, desde: 'wsDrawer',
        impacto: pp.length && cambios.some(function (x) { return x.campo === 'valor'; }) ? '<div class="rd-note" style="margin-top:12px">' + ic('info') + '<span>' + pp.map(function (x) { return esc(x.nombre); }).join(' · ') + ' siguen con el valor de su versión.</span></div>' : '' }).then(function (ok) {
        if (!ok) return;
        var e = paraEditar(), x = D.apu(e.ver, apuId), px = D.precio(e.ver, dep, apuId);
        x.nombre = nombre; x.unidad = desp.unidad; x.capId = val('eaCap') || x.capId; if (px) px.valor = v;
        D.saveCatalogo(e.c);
        registrar(e.c, cambios.length === 1 && cambios[0].campo === 'valor' ? 'Editar valor del APU' : 'Editar APU', 'APU · ' + x.cod, { depto: px ? dep : null, detalle: { cambios: cambios } });
        R.toast('APU <b>' + esc(x.cod) + '</b> actualizado en la ' + esc(e.ver.v) + '.'); renderAll();
      });
    };
  }

  // HU10 / HU11 · agregar o editar un insumo del APU
  function drawerInsumo(apuId, idx) {
    var c = cat(), ver = trabajo(c), a = D.apu(ver, apuId), dep = S.depto, p = D.precio(ver, dep, apuId);
    var d = idx != null ? p.det[idx] : null, ins = d ? D.insumo(d.ins) : null;
    var otros = D.deptosCargados(ver).filter(function (x) { return x !== dep && D.precio(ver, x, apuId); });
    var body;
    if (d) {
      body = '<h4 class="rd-h3">En este APU · ' + esc(dep) + '</h4><div class="rd-grid2">' + campo('inCant', 'Cantidad por ' + esc(a.unidad), d.cantidad, { req: true }) + campo('inVu', 'Valor unitario', d.valorUnit, { req: true }) + '</div>' +
        '<div id="inTot"></div>' +
        '<h4 class="rd-h3" style="margin-top:6px">Del insumo <span class="rd-global">' + ic('globe', 11) + ' global</span></h4>' +
        campo('inCod', 'Código', d.ins, { ro: true }) + campo('inNombre', 'Nombre', ins.nombre, { req: true }) +
        selectHTML('inUni', 'Unidad', D.UNIDADES.map(function (u) { return { v: u, l: u }; }), ins.unidad) +
        '<div id="inGlobal"></div>' +
        '<button type="button" class="naowee-btn naowee-btn--mute naowee-btn--small" id="inQuitar" style="align-self:flex-start">' + ic('off') + 'Quitar del APU en ' + esc(dep) + '</button>';
    } else {
      body = '<div class="naowee-searchbox"><div class="naowee-searchbox__input-wrap"><span class="naowee-searchbox__icon">' + ic('search', 15) + '</span><input class="naowee-searchbox__input" id="inBuscar" placeholder="Buscar insumo existente por código o nombre" aria-label="Buscar insumo"></div></div>' +
        '<div id="inRes" style="display:flex;flex-direction:column;gap:6px"></div>' +
        '<div id="inForm"></div>';
    }
    drawer(esc(a.cod) + ' · ' + esc(a.nombre), d ? 'Editar insumo' : 'Agregar insumo', body, PIE('inOk', d ? 'Revisar cambios' : 'Agregar al APU'));
    var elegido = d ? d.ins : null, nuevo = false;
    function totalPrev() {
      var t = numDec('inCant') * num('inVu'), s = D.sumaInsumos(p) - (d ? D.totalDet(d) : 0) + (isNaN(t) ? 0 : Math.round(t));
      var el = document.getElementById('inTot'); if (!el) return;
      el.innerHTML = '<div class="rd-kv"><div><div class="k">V. total</div><div class="v">' + (isNaN(t) ? '—' : D.fmtCOP(t)) + '</div></div><div><div class="k">Suma del APU</div><div class="v">' + D.fmtCOP(s) + '</div></div><div><div class="k">Valor del APU</div><div class="v">' + D.fmtCOP(p.valor) + '</div></div></div>' +
        (Math.abs(s - p.valor) > D.tolerancia(p.valor) ? '<p class="rd-sub" style="margin-top:6px">' + ic('warn', 12) + ' Con este cambio la suma no coincide con el valor del APU; después puedes usar la suma.</p>' : '');
    }
    function formLocal(extraHTML) {
      document.getElementById('inForm').innerHTML = extraHTML + '<div class="rd-grid2">' + campo('inCant', 'Cantidad por ' + esc(a.unidad), '', { req: true }) + campo('inVu', 'Valor unitario en ' + esc(dep), '', { req: true }) + '</div><div id="inTot"></div>' +
        (otros.length ? '<label class="rd-check-opt"><input type="checkbox" id="inOtros">Agregarlo también en los otros ' + otros.length + ' departamentos con precios, con la misma cantidad y valor</label>' : '');
      ['inCant', 'inVu'].forEach(function (id) { document.getElementById(id).oninput = totalPrev; }); totalPrev();
    }
    if (d) {
      ['inCant', 'inVu'].forEach(function (id) { document.getElementById(id).oninput = totalPrev; }); totalPrev();
      var ng = document.getElementById('inNombre'), ug = document.getElementById('inUni');
      function glob() { document.getElementById('inGlobal').innerHTML = (ng.value.trim() !== ins.nombre || ug.value !== ins.unidad) ? R.avisoGlobal(D.usoGlobal('insumo', d.ins), 'El insumo ' + d.ins) : ''; }
      ng.oninput = glob; ug.onchange = glob;
      document.getElementById('inQuitar').onclick = function () {
        var e = paraEditar(), px = D.precio(e.ver, dep, apuId), q = px.det.splice(idx, 1)[0]; D.saveCatalogo(e.c);
        registrar(e.c, 'Quitar insumo', 'Insumo · ' + q.ins + ' en APU ' + a.cod, { depto: dep });
        closeModal('wsDrawer'); R.toast('Insumo <b>' + esc(q.ins) + '</b> quitado del APU en ' + esc(dep) + '.'); renderAll();
      };
    } else {
      var bi = document.getElementById('inBuscar');
      function lista() {
        var q = U.norm(bi.value), ya = p.det.map(function (x) { return x.ins; });
        var res = D.listInsumos().filter(function (x) { return ya.indexOf(x.cod) < 0 && (!q || U.norm(x.cod + ' ' + x.nombre).indexOf(q) >= 0); }).slice(0, 6);
        document.getElementById('inRes').innerHTML = res.map(function (x) {
          return '<button type="button" class="rd-choice" data-ins="' + esc(x.cod) + '" aria-checked="' + (elegido === x.cod ? 'true' : 'false') + '"><span class="rd-radio"></span><span><span class="rd-choice-t">' + esc(x.cod) + ' · ' + esc(x.nombre) + '</span><span class="rd-choice-d">Unidad ' + esc(x.unidad) + ' · global</span></span></button>';
        }).join('') + '<button type="button" class="rd-choice" data-ins="__nuevo" aria-checked="' + (nuevo ? 'true' : 'false') + '"><span class="rd-radio"></span><span><span class="rd-choice-t">Crear un insumo nuevo</span><span class="rd-choice-d">Queda disponible para todos los catálogos.</span></span></button>';
        document.querySelectorAll('#inRes [data-ins]').forEach(function (b) {
          b.onclick = function () {
            nuevo = b.dataset.ins === '__nuevo'; elegido = nuevo ? null : b.dataset.ins; lista();
            formLocal(nuevo ? '<h4 class="rd-h3">Insumo nuevo <span class="rd-global">' + ic('globe', 11) + ' global</span></h4><div class="rd-grid2">' + campo('inCod', 'Código', '', { req: true }) + selectHTML('inUni', 'Unidad', D.UNIDADES.map(function (u) { return { v: u, l: u }; }), 'un') + '</div>' + campo('inNombre', 'Nombre', '', { req: true }) : '');
          };
        });
      }
      bi.oninput = lista; lista();
    }
    document.getElementById('inOk').onclick = function () {
      if (!d && !elegido && !nuevo) { R.toast('Elige un insumo existente o crea uno nuevo.', 'caution'); return; }
      var cant = numDec('inCant'), vu = num('inVu');
      err('inCant', isNaN(cant) || cant <= 0 ? 'Escribe una cantidad mayor que cero.' : '');
      err('inVu', isNaN(vu) || vu < 0 ? 'Escribe un valor numérico.' : '');
      if (isNaN(cant) || cant <= 0 || isNaN(vu) || vu < 0) return;
      if (nuevo) {
        var cod = val('inCod').toUpperCase(), nm = val('inNombre');
        err('inCod', !cod ? 'El código es obligatorio.' : D.listInsumos().some(function (x) { return x.cod === cod; }) ? 'Ya existe el insumo ' + cod + ': búscalo arriba.' : '');
        err('inNombre', nm ? '' : 'El nombre es obligatorio.');
        if (!cod || !nm || D.listInsumos().some(function (x) { return x.cod === cod; })) return;
        D.guardarInsumoGlobal({ cod: cod, nombre: nm, unidad: val('inUni') });
        D.logAudit(cat(), 'Crear insumo', 'Insumo · ' + cod, { global: true });
        elegido = cod;
      }
      if (!d) {
        var e = paraEditar(), todos = [dep].concat(document.getElementById('inOtros') && document.getElementById('inOtros').checked ? otros : []);
        todos.forEach(function (x) { var px = D.precio(e.ver, x, apuId); if (px) px.det.push({ ins: elegido, cantidad: cant, valorUnit: vu }); });
        D.saveCatalogo(e.c);
        registrar(e.c, 'Agregar insumo', 'Insumo · ' + elegido + ' en APU ' + a.cod, { depto: todos.length > 1 ? todos.length + ' departamentos' : dep });
        closeModal('wsDrawer'); R.toast('Insumo <b>' + esc(elegido) + '</b> agregado al APU ' + esc(a.cod) + '. Revisa el control del valor.'); renderAll();
        return;
      }
      var nm2 = val('inNombre'); err('inNombre', nm2 ? '' : 'El nombre es obligatorio.'); if (!nm2) return;
      var loc = D.diff({ c: D.fmtNum(d.cantidad), v: D.fmtCOP(d.valorUnit) }, { c: D.fmtNum(cant), v: D.fmtCOP(vu) }, [{ key: 'c', label: 'Cantidad (' + dep + ')' }, { key: 'v', label: 'Valor unitario (' + dep + ')' }]);
      var glo = D.diff({ n: ins.nombre, u: ins.unidad }, { n: nm2, u: val('inUni') }, [{ key: 'n', label: 'Nombre (global)' }, { key: 'u', label: 'Unidad (global)' }]);
      U.confirmarCambios({ titulo: 'Revisa los cambios del insumo ' + d.ins, cambios: loc.concat(glo), desde: 'wsDrawer',
        subtitulo: (loc.length ? loc.length + ' cambio' + (loc.length === 1 ? '' : 's') + ' de este APU en ' + dep + ' (van a la versión en preparación)' : '') + (loc.length && glo.length ? ' · ' : '') + (glo.length ? glo.length + ' global' + (glo.length === 1 ? '' : 'es') + ' (sin versión)' : ''),
        impacto: glo.length ? R.avisoGlobal(D.usoGlobal('insumo', d.ins), 'El insumo ' + d.ins) : '' }).then(function (ok) {
        if (!ok) return;
        if (loc.length) {
          var e = paraEditar(), px = D.precio(e.ver, dep, apuId); px.det[idx].cantidad = cant; px.det[idx].valorUnit = vu; D.saveCatalogo(e.c);
          registrar(e.c, 'Editar insumo', 'Insumo · ' + d.ins + ' en APU ' + a.cod, { depto: dep, detalle: { cambios: loc } });
        }
        if (glo.length) {
          D.guardarInsumoGlobal({ cod: d.ins, nombre: nm2, unidad: val('inUni') });
          D.logAudit(cat(), 'Editar insumo (global)', 'Insumo · ' + d.ins, { global: true, detalle: { cambios: glo } });
        }
        R.toast('Insumo <b>' + esc(d.ins) + '</b> actualizado.'); renderAll();
      });
    };
  }

  // ════════════ Alcance y estructura (HU09, HU12) ════════════
  function renderAlcance() {
    var c = cat(), ver = vista(c), cargados = D.deptosCargados(ver), el = document.getElementById('panel-alcance');
    el.innerHTML =
      '<div class="rd-card" id="wsAlcance"><div class="rd-row"><div class="rd-grow"><h3 class="rd-h2">Alcance</h3><p class="rd-sub">A quién y dónde aplica. Los roles cruzan con el perfil de quien consulta.</p></div>' +
      (soloLectura() ? '' : '<button class="naowee-btn naowee-btn--mute naowee-btn--small" id="btnEditAlc">' + ic('edit') + 'Editar alcance</button>') + '</div>' +
      '<div class="rd-kv" style="margin-top:12px"><div><div class="k">Departamentos</div><div class="v">' + c.alcance.deptos.length + ' de 33</div></div><div><div class="k">Con precios en la ' + esc(ver.v) + '</div><div class="v">' + cargados.length + '</div></div><div><div class="k">Roles</div><div class="v" style="font-size:13px">' + esc(R.rolesTxt(c)) + '</div></div><div><div class="k">Condición adicional</div><div class="v" style="font-size:13px">' + esc(c.alcance.condicion || '—') + '</div></div></div>' +
      '<div class="rd-row" style="margin-top:12px;gap:6px">' + c.alcance.deptos.map(function (d) { return R.chip(d, cargados.indexOf(d) >= 0 ? 'ok' : 'neutral', cargados.indexOf(d) >= 0 ? 'check' : null); }).join('') + '</div>' +
      '<p class="rd-sub" style="margin-top:8px">' + ic('check', 12) + ' con precios en la ' + esc(ver.v) + ' · los demás llegan al importar su hoja.</p></div>' +

      '<div class="rd-card" id="wsEstructura"><h3 class="rd-h2">Estructura</h3><p class="rd-sub">Fija: la definen la carga de la matriz y el modelo de datos, no se configura por catálogo.</p>' +
      '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:14px">' +
      nivel('1', 'Capítulo', 'Agrupa APU. Global: se reconoce por su nombre y lo comparten todas las versiones.', 'global') +
      nivel('2', 'APU', 'Análisis de precio unitario. Es de la versión y tiene un valor por departamento, que viene del archivo.', 'por versión y departamento') +
      nivel('3', 'Insumo', 'Lo único que lleva cantidad y valor unitario. Su código, nombre y unidad son globales; su cantidad y valor, del APU en cada departamento.', 'global + por APU') +
      '</div></div>' +

      '<div class="rd-card" id="wsPlantilla"><div class="rd-row"><div class="rd-grow"><h3 class="rd-h2">Plantilla de importación</h3>' +
      '<p class="rd-sub">Un libro con una hoja <b>APU &lt;Departamento&gt;</b> por cada departamento del alcance (' + c.alcance.deptos.length + ' hojas) y estas columnas, con estos nombres exactos:</p></div></div>' +
      '<div class="rd-tbl-wrap" style="margin-top:10px"><table class="rd-tbl"><thead><tr><th>Columna</th><th>Qué lleva</th></tr></thead><tbody>' +
      [['APU', 'Código del APU al que pertenece la fila. En la fila del capítulo y del APU, igual al Código.'], ['Código', 'Capítulo (solo dígitos: 3), APU (con punto: 3.4) o código del insumo (MO-01).'], ['Nombre', 'Nombre del capítulo, del APU o del insumo.'],
        ['unidad', 'En minúscula, como está. Unidad del APU o del insumo.'], ['Cantidad', 'Solo en insumos: cantidad por unidad del APU.'], ['Valor unitario', 'Solo en insumos.'], ['Valor total', 'En el APU, su valor (no se recalcula); en el insumo, cantidad × valor unitario.']]
        .map(function (r) { return '<tr><td><code>' + r[0] + '</code></td><td>' + r[1] + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<div class="rd-row" style="margin-top:14px"><button class="naowee-btn naowee-btn--loud" id="btnPlantilla">' + ic('download') + 'Descargar plantilla vacía</button>' +
      (cargados.length ? '<button class="naowee-btn naowee-btn--mute" id="btnPlantillaPrecios">' + ic('download') + 'Descargar con los precios de la ' + esc(ver.v) + '</button>' : '') + '</div>' +
      '<p class="rd-sub" style="margin-top:8px">La columna <b>Tipo</b> y cualquier otra columna se ignoran al importar. Los números van sin puntos de miles.</p></div>';
    function nivel(n, t, d, tag) { return '<div style="background:var(--rd-soft);border-radius:14px;padding:14px"><div class="rd-row"><span class="rd-check-ic rd-check-ic--ok" style="background:var(--rd-brand-bg);color:var(--rd-brand-ink);font-weight:800;font-size:12px">' + n + '</span><b>' + t + '</b></div><p class="rd-sub" style="margin-top:6px">' + d + '</p><div style="margin-top:8px">' + R.chip(tag, 'neutral') + '</div></div>'; }
    var ea = document.getElementById('btnEditAlc'); if (ea) ea.onclick = function () { window.CAT_FORM.abrir(cat(), function () { renderAll(); }); };
    document.getElementById('btnPlantilla').onclick = function () { descargarPlantilla(false); };
    var bp = document.getElementById('btnPlantillaPrecios'); if (bp) bp.onclick = function () { descargarPlantilla(true); };
  }
  function descargarPlantilla(conPrecios) {
    var c = cat(), ver = vista(c), nombre = window.MATRIZ.descargarPlantilla(c, ver, conPrecios);
    D.logAudit(c, 'Descargar plantilla', 'Plantilla · ' + c.alcance.deptos.length + ' hojas', { version: ver.v, detalle: { archivo: nombre } });
    R.toast('Plantilla descargada: <b>' + esc(nombre) + '</b>.');
  }

  // ════════════ Versiones (HU15, HU16) ════════════
  function comparar(c, vig, prep) {
    var r = { nuevos: [], retirados: [], precios: [], deptosNuevos: [], composicion: 0 };
    if (!prep) return r;
    prep.contenido.apus.forEach(function (a) {
      var va = vig && D.apu(vig, a.id);
      if (!va && a.activo !== false) r.nuevos.push(a);
      if (a.activo === false && (!va || va.activo !== false)) r.retirados.push(a);
    });
    Object.keys(prep.contenido.precios).forEach(function (d) {
      var pv = vig && vig.contenido.precios[d];
      if (!pv) { r.deptosNuevos.push(d); return; }
      Object.keys(prep.contenido.precios[d]).forEach(function (a) {
        var x = prep.contenido.precios[d][a], y = pv[a];
        if (y && x.valor !== y.valor) r.precios.push({ depto: d, apuId: a, antes: y.valor, despues: x.valor });
        else if (y && JSON.stringify(x.det) !== JSON.stringify(y.det)) r.composicion++;
      });
    });
    return r;
  }
  function renderVersiones() {
    var c = cat(), vig = D.vigente(c), p = D.preparacion(c), el = document.getElementById('panel-versiones'), h = '';
    if (p) {
      var req = D.requisitos(c, p), bloquea = req.filter(function (r) { return !r.ok && !r.noBloquea; });
      var cmp = comparar(c, vig, p), cambios = D.cambiosDe(c, p.v), pp = D.presupuestosDe(c.id);
      h += '<div class="rd-cols" id="wsRevisar"><div class="rd-card"><h3 class="rd-h2">Revisar y activar la ' + esc(p.v) + '</h3>' +
        '<p class="rd-sub">Al activarla pasa a ser la versión que ven los usuarios; la ' + (vig ? esc(vig.v) + ' queda histórica, con su contenido intacto' : 'versión anterior no existe: es la primera') + '.</p>' +
        '<div class="rd-kv" style="margin-top:14px" id="wsResumen"><div><div class="k">APU nuevos</div><div class="v">' + cmp.nuevos.length + '</div></div><div><div class="k">APU retirados</div><div class="v">' + cmp.retirados.length + '</div></div>' +
        '<div><div class="k">Precios que cambian</div><div class="v">' + cmp.precios.length + '</div></div><div><div class="k">Departamentos nuevos</div><div class="v">' + cmp.deptosNuevos.length + '</div></div></div>' +
        (cmp.precios.length ? '<div class="rd-tbl-wrap" style="margin-top:14px"><table class="rd-tbl"><thead><tr><th>APU</th><th>Departamento</th><th class="r">' + (vig ? esc(vig.v) : 'Antes') + '</th><th class="r">' + esc(p.v) + '</th></tr></thead><tbody>' +
          cmp.precios.slice(0, 8).map(function (x) { var a = D.apu(p, x.apuId); return '<tr><td><b>' + esc(a.cod) + '</b> ' + esc(a.nombre) + '</td><td>' + esc(x.depto) + '</td><td class="r">' + D.fmtCOP(x.antes) + '</td><td class="r"><b>' + D.fmtCOP(x.despues) + '</b></td></tr>'; }).join('') +
          '</tbody></table>' + (cmp.precios.length > 8 ? '<p class="rd-sub">… y ' + (cmp.precios.length - 8) + ' más.</p>' : '') + '</div>' : '') +
        (cmp.composicion ? '<p class="rd-sub" style="margin-top:8px">' + cmp.composicion + ' APU cambian sus insumos sin cambiar de valor.</p>' : '') +
        (cmp.deptosNuevos.length ? '<p class="rd-sub" style="margin-top:8px">Departamentos que se suman: <b>' + cmp.deptosNuevos.map(esc).join(', ') + '</b>.</p>' : '') +
        '<h4 class="rd-h3" style="margin-top:16px">Cambios registrados en la ' + esc(p.v) + ' (' + cambios.length + ')</h4>' +
        (cambios.length ? '<ul class="rd-queue" id="wsCambios" style="margin-top:6px">' + cambios.slice(0, 10).map(function (a) {
          return '<li><span class="rd-q-n">' + ic('edit', 12) + '</span><div class="rd-grow"><div class="rd-q-t">' + esc(a.accion) + ' · ' + esc(a.elemento) + '</div><div class="rd-q-d">' + esc(a.responsable) + ' · ' + D.fmtFecha(a.fecha) + ' ' + esc(a.hora) + (a.depto ? ' · ' + esc(a.depto) : '') + (a.detalle && a.detalle.motivo ? ' · ' + esc(a.detalle.motivo) : '') + '</div></div></li>';
        }).join('') + '</ul>' : '<p class="rd-sub">Aún no hay cambios en esta versión.</p>') +
        '</div><div class="rd-card"><h3 class="rd-h2">Requisitos</h3><ul class="rd-check" style="margin-top:6px">' + req.map(function (r) {
          var st = r.ok ? 'ok' : (r.aviso || r.noBloquea) ? 'warn' : 'todo';
          return '<li><span class="rd-check-ic rd-check-ic--' + st + '">' + (r.ok ? ic('check') : st === 'warn' ? ic('warn') : '') + '</span><div><div class="rd-check-t">' + esc(r.t) + '</div><div class="rd-check-d">' + esc(r.d) + (r.noBloquea && !r.ok ? ' · no impide activar' : '') + '</div></div></li>';
        }).join('') + '</ul>' +
        '<h4 class="rd-h3" style="margin-top:14px">Presupuestos</h4><p class="rd-sub">' + (pp.length ? pp.length + ' presupuestos usan este catálogo y <b>se quedan en su versión</b>: ' + pp.map(function (x) { return esc(x.nombre) + ' (' + x.version + ')'; }).join(' · ') + '.' : 'Ningún presupuesto usa este catálogo todavía.') + '</p>' +
        '<div class="naowee-textfield" style="margin-top:14px"><label class="naowee-textfield__label naowee-textfield__label--required" for="verMotivo">Motivo de la versión</label><div class="naowee-textfield__input-wrap"><input class="naowee-textfield__input" id="verMotivo" placeholder="Ej. Actualización de precios del segundo semestre" autocomplete="off" value="' + esc(p.motivo || '') + '"></div><div class="rd-err" id="verMotivoErr" hidden>El motivo es obligatorio: queda en el historial.</div></div>' +
        (bloquea.length ? '<div class="naowee-message naowee-message--caution" style="margin-top:12px"><div class="naowee-message__header"><span class="naowee-message__icon">' + ic('warn', 16, ' stroke="#fff"') + '</span><div class="naowee-message__body">Falta: ' + bloquea.map(function (r) { return esc(r.t.toLowerCase()); }).join(', ') + '.</div></div></div>' : '') +
        '<div class="rd-row" style="margin-top:14px"><button class="naowee-btn naowee-btn--loud" id="btnActivar"' + (bloquea.length ? ' disabled' : '') + '>Activar ' + esc(p.v) + '</button><button class="naowee-btn naowee-btn--mute" id="btnDescartar">Descartar ' + esc(p.v) + '</button></div></div></div>';
    } else {
      h += '<div class="rd-note" style="margin-bottom:14px">' + ic('info') + '<span>No hay versión en preparación. El primer cambio en <b>Contenido</b>, en el alcance o una importación la abre, copiando la ' + (vig ? esc(vig.v) : 'vigente') + '.</span></div>';
    }
    h += '<div class="rd-card" id="verHist" style="margin-top:14px"><h3 class="rd-h2">Historial de versiones</h3><div class="rd-tbl-wrap" style="margin-top:10px"><table class="rd-tbl"><thead><tr><th>Versión</th><th>Estado</th><th>Motivo</th><th>Autor</th><th>Activada</th><th class="r">Departamentos</th><th class="r">APU</th><th><span class="sr-only">Acciones</span></th></tr></thead><tbody>' +
      c.versiones.slice().reverse().map(function (v) {
        return '<tr><td><b>' + esc(v.v) + '</b></td><td>' + R.chipVersion(v) + '</td><td>' + esc(v.motivo || '—') + '</td><td>' + esc(v.autor) + '</td><td>' + (v.activada ? D.fmtFecha(v.activada) : '—') + '</td><td class="r">' + D.deptosCargados(v).length + '</td><td class="r">' + D.nApus(v) + '</td>' +
          '<td class="r"><button class="naowee-btn naowee-btn--mute naowee-btn--small" data-verv="' + esc(v.v) + '">' + (v.estado === 'historica' ? 'Ver contenido' : 'Abrir') + '</button></td></tr>';
      }).join('') + '</tbody></table></div></div>';
    el.innerHTML = h;
    var ba = document.getElementById('btnActivar');
    if (ba) ba.onclick = function () {
      var m = val('verMotivo'); document.getElementById('verMotivoErr').hidden = !!m; if (!m) { document.getElementById('verMotivo').focus(); return; }
      var cc = cat(), act = D.activar(cc, m);
      R.toast('<b>' + esc(act.v) + '</b> activada: es la que ven ahora los usuarios.' + (vig ? ' La ' + esc(vig.v) + ' quedó histórica.' : ''), 'positive', 5200);
      renderAll();
    };
    var bd = document.getElementById('btnDescartar');
    if (bd) bd.onclick = function () {
      R.pedirMotivo({ titulo: 'Descartar la ' + p.v, sub: 'Se pierden los cambios que no estén en la vigente.', ok: 'Descartar' }).then(function (m) {
        if (!m) return; D.descartarPreparacion(cat(), m); R.toast('<b>' + esc(p.v) + '</b> descartada.'); renderAll();
      });
    };
    document.querySelectorAll('[data-verv]').forEach(function (b) {
      b.onclick = function () {
        var v = D.version(cat(), b.dataset.verv);
        S.verVista = v.estado === 'historica' ? v.v : null; S.sel = null; renderHead(); renderVerbar(); selTab('contenido');
      };
    });
  }

  // ════════════ Historial (HU19, HU20, HU21) ════════════
  var ELEMENTOS = ['Catálogo', 'Versión', 'Capítulo', 'APU', 'Insumo', 'Importación', 'Plantilla', 'Historial'];
  function audCat() { return D.listAuditoria().filter(function (a) { return a.catId === catId || (a.global && a.catId === catId); }); }
  function filtrados() {
    var f = S.audF, r = U.dpRange ? U.dpRange('audFecha') : { desde: '', hasta: '' };
    return audCat().filter(function (a) {
      if (f.accion && a.accion !== f.accion) return false;
      if (f.elemento && a.elemento.split(' · ')[0] !== f.elemento) return false;
      if (f.version && a.version !== f.version) return false;
      if (f.usuario && a.responsable !== f.usuario) return false;
      if (r.desde && a.fecha < r.desde) return false;
      if (r.hasta && a.fecha > r.hasta) return false;
      return true;
    });
  }
  function dd(id, ph, opts) {
    return '<div class="naowee-dropdown naowee-dropdown--small" id="' + id + '" style="width:180px;flex-shrink:0"><button class="naowee-dropdown__trigger" type="button" aria-haspopup="listbox" aria-label="' + ph + '"><span class="naowee-dropdown__value">' + ph + '</span><span class="naowee-dropdown__controls"><span class="naowee-dropdown__chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></span></span></button>' +
      '<div class="naowee-dropdown__menu" role="listbox"><div class="naowee-dropdown__option naowee-dropdown__option--selected" data-value="">' + ph + '</div>' + opts.map(function (o) { return '<div class="naowee-dropdown__option" data-value="' + esc(o) + '">' + esc(o) + '</div>'; }).join('') + '</div></div>';
  }
  function renderHistorial() {
    var all = audCat(), el = document.getElementById('panel-historial');
    function uniq(k) { var m = {}; all.forEach(function (a) { if (a[k]) m[a[k]] = 1; }); return Object.keys(m).sort(); }
    el.innerHTML = '<div class="t-sechead" style="margin-bottom:12px"><div class="rd-row">' +
      dd('audAccion', 'Toda acción', uniq('accion')) + dd('audElemento', 'Todo elemento', ELEMENTOS) + dd('audVersion', 'Toda versión', uniq('version')) + dd('audUsuario', 'Todo responsable', uniq('responsable')) +
      '<div class="naowee-datepicker-field naowee-datepicker-field--small" data-dp data-dp-range id="audFecha" style="width:230px"><div class="naowee-datepicker-field__input" tabindex="0" role="button" aria-haspopup="dialog" aria-label="Rango de fechas"><span class="naowee-datepicker-field__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></svg></span><span class="naowee-datepicker-field__value naowee-dropdown__placeholder" data-dp-value>Todas las fechas</span></div><div class="t-dp-pop" data-dp-pop></div></div>' +
      '<button class="naowee-btn naowee-btn--mute naowee-btn--small" id="audLimpiar">Limpiar</button><span class="t-count" id="audCount"></span></div>' +
      '<button class="naowee-btn naowee-btn--mute naowee-btn--small" id="btnExport">' + ic('download') + 'Exportar</button></div>' +
      '<div class="rd-card" style="padding:6px 12px"><div class="rd-tbl-wrap"><table class="rd-tbl" id="audTable"><thead><tr><th>Fecha</th><th>Acción</th><th>Elemento</th><th>Versión</th><th>Departamento</th><th>Responsable</th><th><span class="sr-only">Detalle</span></th></tr></thead><tbody id="audBody"></tbody></table></div></div>';
    U.initDropdowns(el); U.initDatepickers(el);
    [['audAccion', 'accion'], ['audElemento', 'elemento'], ['audVersion', 'version'], ['audUsuario', 'usuario']].forEach(function (x) {
      if (S.audF[x[1]]) U.setDD(x[0], S.audF[x[1]], S.audF[x[1]]);
      document.getElementById(x[0]).addEventListener('dd:change', function (e) { S.audF[x[1]] = e.detail.value; pintarAud(); });
    });
    document.getElementById('audFecha').addEventListener('dp:change', pintarAud);
    document.getElementById('audLimpiar').onclick = function () { S.audF = {}; renderHistorial(); };
    document.getElementById('btnExport').onclick = function (e) {
      e.stopPropagation(); var m = document.getElementById('expMenu'), r = this.getBoundingClientRect();
      m.style.top = (r.bottom + 4) + 'px'; m.style.left = Math.max(8, r.right - 206) + 'px'; m.classList.add('open');
    };
    pintarAud();
  }
  function detalleTxt(a) {
    var d = a.detalle; if (!d) return '';
    if (d.cambios) return d.cambios.map(function (x) { return x.etiqueta + ': ' + x.antes + ' → ' + x.despues; }).join(' · ');
    if (d.motivo) return 'Motivo: ' + d.motivo;
    if (d.archivo) return 'Archivo: ' + d.archivo + (d.deptos ? ' · ' + d.deptos.length + ' departamentos' : '') + (d.resumen ? ' · ' + d.resumen : '');
    return '';
  }
  function pintarAud() {
    var rows = filtrados();
    document.getElementById('audCount').textContent = rows.length + ' de ' + audCat().length + ' registros';
    document.getElementById('audBody').innerHTML = rows.length ? rows.map(function (a, i) {
      var det = detalleTxt(a);
      return '<tr class="t-aud-row' + (det ? ' rd-click' : '') + '" data-i="' + i + '"' + (det ? ' tabindex="0" aria-expanded="false"' : '') + '><td class="rd-num">' + D.fmtFecha(a.fecha) + ' ' + esc(a.hora) + '</td><td><b>' + esc(a.accion) + '</b>' + (a.global ? ' <span class="rd-global">' + ic('globe', 11) + ' global</span>' : '') + '</td><td>' + esc(a.elemento) + '</td><td>' + esc(a.version || '—') + '</td><td>' + esc(a.depto || '—') + '</td><td>' + esc(a.responsable) + '</td><td class="r">' + (det ? '<span class="rd-muted" style="font-size:12px">ver detalle</span>' : '') + '</td></tr>' +
        (det ? '<tr class="t-aud-det" hidden><td colspan="7" style="background:var(--rd-soft)">' + esc(det) + '</td></tr>' : '');
    }).join('') : '<tr><td colspan="7"><div class="rd-empty"><b>Ningún registro coincide</b>Quita algún filtro.</div></td></tr>';
    document.querySelectorAll('#audBody .t-aud-row.rd-click').forEach(function (tr) {
      function t() { var d = tr.nextElementSibling, o = d.hidden; d.hidden = !o; tr.setAttribute('aria-expanded', o ? 'true' : 'false'); }
      tr.onclick = t; tr.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t(); } };
    });
  }
  document.querySelectorAll('#expMenu [data-fmt]').forEach(function (b) {
    b.onclick = function () {
      document.getElementById('expMenu').classList.remove('open');
      var c = cat(), rows = filtrados(), f = S.audF, r = U.dpRange('audFecha');
      var filtros = [f.accion, f.elemento, f.version, f.usuario, r.desde && (r.desde + ' a ' + (r.hasta || '…'))].filter(Boolean);
      var nombre = U.exportar({ nombre: 'historial-' + c.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-'), titulo: 'Historial · ' + c.nombre, formato: b.dataset.fmt,
        meta: ['Generado el ' + D.fmtFecha(D.hoy()) + ' por ' + D.usuarioActual(), filtros.length ? 'Filtros: ' + filtros.join(' · ') : 'Sin filtros: historial completo', rows.length + ' registros'],
        columnas: ['Fecha', 'Hora', 'Acción', 'Elemento', 'Versión', 'Departamento', 'Responsable', 'Detalle'],
        filas: rows.map(function (a) { return [a.fecha, a.hora, a.accion, a.elemento, a.version || '', a.depto || '', a.responsable, detalleTxt(a)]; }) });
      if (!nombre) return;
      D.logAudit(c, 'Exportar historial', 'Historial · ' + rows.length + ' registros', { detalle: { archivo: nombre } });
      R.toast('Historial exportado: <b>' + esc(nombre) + '</b>.'); pintarAud();
    };
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('#expMenu')) document.getElementById('expMenu').classList.remove('open'); });

  function renderAll() { renderHead(); renderVerbar(); selTab(S.tab); }
  // Ganchos para el recorrido guiado.
  window.WS = {
    abrirApu: function (id, depto) { if (depto) S.depto = depto; S.sel = { tipo: 'apu', id: id }; selTab('contenido'); },
    abrirCap: function (id) { S.sel = null; delete S.cerrados[id]; selTab('contenido'); },
    depto: function (d) { S.depto = d; selTab('contenido'); },
    render: renderAll
  };

  renderAll();
  if (R.qs('nuevo') === '1') { R.toast('Catálogo creado con la <b>v1.0 en preparación</b>. Llénalo y actívalo cuando esté listo.', 'positive', 5200); var u = new URL(location.href); u.searchParams.delete('nuevo'); history.replaceState(null, '', u); }
})();
