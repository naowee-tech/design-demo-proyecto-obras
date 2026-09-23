/* ============================================================================
 * Proyecto de Obras — Detalle de catálogo
 * HU PPTO-04..16, 19..21. Componentes del espejo: .naowee-tabs/.t-panel,
 * .naowee-table + .t-kebab/.t-rowmenu, .t-empty/.t-icontile, .t-drop, .vg-card,
 * .t-esq-panel/.t-esq-chips/.t-esq-add (configurador de campos del ítem).
 * Versionamiento manual con contador de cambios sin publicar + snapshot histórico.
 * ========================================================================== */
(function () {
  'use strict';
  var D = window.OBRAS, UI = window.OBRAS_UI;
  function qs(k) { return new URLSearchParams(location.search).get(k); }
  function esc(s) { return (s || '').toString().replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fdate(iso) { if (!iso) return '—'; var p = iso.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  function slugKey(s) { return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '').toLowerCase() || 'campo'; }
  function num(v) { var n = parseFloat(v); return isNaN(n) ? null : n; }

  var cat = null, nivelEditId = null, nivelDesId = null, itemEditId = null, camposDraft = [];
  var badgeMap = { Activo: 'positive', Borrador: 'caution', Inactivo: 'neutral' };
  var STD = { cod: 1, nombre: 1, tipo: 1, uni: 1, cantidad: 1, valorUnit: 1 };
  var NUMERICO = { numero: 1, moneda: 1, porcentaje: 1 };
  function norm(s) { return (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }

  function loadCat() {
    var id = qs('cat');
    cat = id ? D.getCatalogo(id) : null;
    if (!cat) { var list = D.listCatalogos(); cat = list.filter(function (c) { return c.estado === 'Activo'; })[0] || list[0]; }
  }
  function nivelById(id) { return cat.niveles.filter(function (n) { return n.id === id; })[0]; }
  function camposDe(n) { return (n && n.campos && n.campos.length) ? n.campos : D.camposDefault(); }
  function itemsDe(nivelId) { return cat.items.filter(function (it) { return it.nivelId === nivelId; }); }
  function nivelTotal(n) { return itemsDe(n.id).reduce(function (s, it) { return s + (it.valorTotal || 0); }, 0); }
  function itemVal(it, key) { return STD[key] ? it[key] : ((it.extra || {})[key]); }
  function fmtCampo(c, v) {
    if (v == null || v === '') return '—';
    if (c.tipo === 'moneda') return D.fmtCOP(v);
    if (c.tipo === 'porcentaje') return esc(v) + ' %';
    if (c.tipo === 'fecha') return fdate(v);
    if (c.tipo === 'booleano') return v === true || v === 'Sí' ? 'Sí' : 'No';
    return esc(v);
  }
  // Toda mutación cuenta como cambio pendiente de publicar (versionamiento manual).
  function tocado() { D.marcarCambio(cat); renderVersiones(); }

  // ── Cabecera ──
  function renderHead() {
    var IC_MONEY = '<svg viewBox="0 0 24 24"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
    var IC_LIST = '<svg viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>';
    document.getElementById('kpiWrap').innerHTML =
      '<div class="t-kpi"><div class="kpi-ic">' + IC_MONEY + '</div><div><div class="kpi-l">Valor total del catálogo</div><div class="kpi-v">' + D.fmtCOP(D.totalCatalogo(cat)) + '</div></div></div>' +
      '<div class="t-kpi"><div class="kpi-ic">' + IC_LIST + '</div><div><div class="kpi-l">Ítems</div><div class="kpi-v">' + D.itemsActivos(cat).length + '</div></div></div>';
    document.getElementById('pageTitle').textContent = cat.nombre;
    document.getElementById('catName').textContent = cat.nombre;
    document.getElementById('catMeta').textContent = 'Condición de aplicación: ' + cat.region + ' · Vigencia ' + fdate(cat.vigenciaIni) + ' → ' + fdate(cat.vigenciaFin) +
      (cat.creado ? ' · Creado por ' + (cat.creadoPor || '—') + ' el ' + fdate(cat.creado) : '');
    document.getElementById('catChips').innerHTML =
      '<span class="naowee-badge naowee-badge--informative naowee-badge--quiet naowee-badge--small">' + cat.versionActiva + '</span>' +
      '<span class="naowee-badge naowee-badge--' + (badgeMap[cat.estado] || 'neutral') + ' naowee-badge--quiet naowee-badge--small">' + cat.estado + '</span>' +
      '<span class="t-esq-chip">' + cat.niveles.filter(function (n) { return n.activo; }).length + ' niveles</span>' +
      (cat.cambiosSinVersionar ? '<span class="naowee-badge naowee-badge--caution naowee-badge--quiet naowee-badge--small">' + cat.cambiosSinVersionar + ' sin versionar</span>' : '');
  }

  window.selTab = function (id) {
    document.querySelectorAll('#tabsBar .naowee-tab').forEach(function (t) {
      var sel = t.dataset.tab === id;
      t.classList.toggle('naowee-tab--selected', sel);
      t.setAttribute('aria-selected', sel);
    });
    document.querySelectorAll('.t-panel').forEach(function (p) { p.classList.toggle('active', p.id === 'panel-' + id); });
  };

  // ── Menú kebab compartido ──
  var rowId = null;
  var IC_EDIT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>';
  var IC_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>';
  var IC_DL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12M8 11l4 4 4-4M4 21h16"/></svg>';
  function menuNivel(id) {
    var n = nivelById(id);
    if (n && !n.activo) {
      return '<button class="naowee-menu__item" role="menuitem" id="rmNivelEdit" onclick="rowAct(\'nivel-edit\')">' + IC_EDIT + 'Editar nivel</button>' +
        '<button class="naowee-menu__item" role="menuitem" id="rmNivelOn" onclick="rowAct(\'nivel-on\')">' + IC_ON + 'Reactivar nivel</button>';
    }
    // "Agregar ítem" solo en niveles que admiten ítems.
    if (n && n.admiteItems) return MENUS.nivel;
    return MENUS.nivel.replace(/<button[^>]*id="rmNivelAdd"[\s\S]*?<\/button>/, '');
  }
  var MENUS = {
    exportar: '<button class="naowee-menu__item" role="menuitem" id="rmExportXls" onclick="rowAct(\'exp-xls\')">' + IC_DL + 'Excel (.xls)</button>' +
              '<button class="naowee-menu__item" role="menuitem" id="rmExportPdf" onclick="rowAct(\'exp-pdf\')">' + IC_DL + 'PDF (imprimir)</button>' +
              '<button class="naowee-menu__item" role="menuitem" id="rmExportCsv" onclick="rowAct(\'exp-csv\')">' + IC_DL + 'CSV</button>',
    nivel: '<button class="naowee-menu__item" role="menuitem" id="rmNivelEdit" onclick="rowAct(\'nivel-edit\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>Editar nivel</button>' +
           '<button class="naowee-menu__item" role="menuitem" id="rmNivelAdd" onclick="rowAct(\'nivel-add-item\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>Agregar ítem</button>' +
           '<button class="naowee-menu__item" role="menuitem" id="rmNivelOff" onclick="rowAct(\'nivel-off\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64A9 9 0 1 1 5.64 6.64M12 2v10"/></svg>Desactivar nivel</button>',
    item:  '<button class="naowee-menu__item" role="menuitem" id="rmItemEdit" onclick="rowAct(\'item-edit\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>Editar ítem</button>'
  };
  window.openRowMenu = function (e, kind, id) {
    e.stopPropagation();
    rowId = id;
    var menu = document.getElementById('rowMenu');
    document.getElementById('rowMenuList').innerHTML = kind === 'nivel' ? menuNivel(id) : (MENUS[kind] || '');
    document.querySelectorAll('.t-kebab.active').forEach(function (k) { k.classList.remove('active'); });
    e.currentTarget.classList.add('active');
    menu.classList.add('open');
    var r = e.currentTarget.getBoundingClientRect();
    var mw = menu.offsetWidth || 206, mh = menu.offsetHeight || 120;
    var top = r.bottom + 6, left = r.right - mw;
    if (top + mh > window.innerHeight - 8) top = r.top - mh - 6;
    if (left < 8) left = 8;
    menu.style.top = top + 'px'; menu.style.left = left + 'px';
  };
  function closeRowMenu() {
    var m = document.getElementById('rowMenu'); if (m) m.classList.remove('open');
    document.querySelectorAll('.t-kebab.active').forEach(function (k) { k.classList.remove('active'); });
  }
  window.rowAct = function (a) {
    var id = rowId; closeRowMenu();
    if (a === 'nivel-edit') openNivel(id);
    else if (a === 'nivel-off') openDesactivar(id);
    else if (a === 'nivel-add-item') { window.selTab('items'); openItem(null, id); }
    else if (a === 'item-edit') openItem(id);
    else if (a === 'nivel-on') reactivarNivel(id);
    else if (a.indexOf('exp-') === 0) exportAud(a.slice(4));
  };
  document.addEventListener('click', closeRowMenu);
  window.addEventListener('scroll', closeRowMenu, true);
  function kebab(kind, id, label) {
    return '<button class="t-kebab" aria-label="' + label + '" aria-haspopup="menu" onclick="openRowMenu(event,\'' + kind + '\',\'' + id + '\')"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg></button>';
  }

  // ── ESTRUCTURA ──
  function renderNiveles() {
    var fe = UI.getDD('nvFiltroEstado');
    var todos = cat.niveles.slice().sort(function (a, b) { return a.orden - b.orden; });
    var ns = todos.filter(function (n) { return !fe || (fe === 'activo' ? n.activo : !n.activo); });
    document.getElementById('nvCount').innerHTML = todos.length ? '<b>' + ns.length + '</b> de ' + todos.length + ' niveles' : '';
    document.getElementById('nivelBody').innerHTML = ns.map(function (n, i) {
      var valor = n.valorTipo === 'formula' ? 'Fórmula' : n.valorTipo === 'fijo' ? D.fmtCOP(n.valorFijo) : 'Sin valor';
      return '<tr class="t-row-click' + (n.activo ? '' : ' t-row-off') + '" data-nivel="' + n.id + '" tabindex="0" title="Abrir el detalle del nivel">' +
        '<td data-label="#">' + (n.codigo || (i + 1)) + '</td>' +
        '<td data-label="Nivel"><span class="t-cname" title="' + esc(n.nombre) + '">' + esc(n.nombre) + '</span></td>' +
        '<td data-label="Valor">' + valor + '</td>' +
        '<td data-label="Campos">' + (n.admiteItems ? camposDe(n).length + ' campos' : '—') + '</td>' +
        '<td data-label="Ítems">' + (n.admiteItems ? itemsDe(n.id).length : '—') + '</td>' +
        '<td data-label="Estado">' + (n.activo
          ? '<span class="naowee-badge naowee-badge--positive naowee-badge--quiet naowee-badge--small">Activo</span>'
          : '<span class="naowee-badge naowee-badge--neutral naowee-badge--quiet naowee-badge--small" title="' + esc(n.motivoBaja || '') + '">Inactivo</span>') + '</td>' +
        '<td data-label="Creado">' + fdate(n.creado) + '</td>' +
        '<td data-label="Total" class="tnum">' + D.fmtCOP(nivelTotal(n)) + '</td>' +
        '<td data-label="Acciones">' + kebab('nivel', n.id, 'Acciones del nivel') + '</td>' +
        '</tr>';
    }).join('');
    var empty = ns.length === 0;
    document.getElementById('nivelEmptyT').textContent = todos.length ? 'Sin niveles con ese estado' : 'Aún no hay niveles';
    document.getElementById('nivelEmptyM').innerHTML = todos.length ? 'Cambia el filtro de estado para ver los demás niveles.' : 'Crea el primero con <b>+ Crear nivel</b> para estructurar el catálogo.';
    document.getElementById('nivelEmpty').classList.toggle('show', empty);
    document.getElementById('nivelList').style.display = empty ? 'none' : '';
    // PPTO-07.3: la fila abre el detalle del nivel (el menú ⋮ conserva las demás acciones).
    document.querySelectorAll('#nivelBody tr[data-nivel]').forEach(function (tr) {
      tr.onclick = function (e) { if (!e.target.closest('.t-kebab')) openNivel(tr.dataset.nivel); };
      tr.onkeydown = function (e) { if (e.key === 'Enter' && e.target === tr) openNivel(tr.dataset.nivel); };
    });
  }
  function reactivarNivel(id) {
    var n = nivelById(id); if (!n) return;
    n.activo = true; delete n.motivoBaja;
    D.saveCatalogo(cat); D.logAudit(cat, 'Reactivar nivel', 'Nivel · ' + n.nombre, null, { items: itemsDe(id).length });
    tocado(); renderNiveles(); renderItems(); renderHead(); renderAuditoria();
    UI.toast('Nivel «' + esc(n.nombre) + '» reactivado: sus ítems vuelven a sumar en el catálogo.');
  }

  function setSwitch(id, on) { var s = document.getElementById(id); s.classList.toggle('naowee-switch--on', on); s.setAttribute('aria-checked', on ? 'true' : 'false'); }
  function getSwitch(id) { return document.getElementById(id).classList.contains('naowee-switch--on'); }
  function valorCfg(tipo) {
    document.getElementById('nvFijoWrap').style.display = tipo === 'fijo' ? '' : 'none';
    document.getElementById('nvFormulaWrap').style.display = tipo === 'formula' ? '' : 'none';
  }

  // PPTO-09 · configurador de campos del ítem
  var TIPO_LBL = { texto: 'texto', numero: 'número', moneda: 'moneda', porcentaje: 'porcentaje', unidad: 'unidad', fecha: 'fecha', booleano: 'sí / no', lista: 'lista' };
  function renderCampos() {
    document.getElementById('nvCampos').innerHTML = camposDraft.map(function (c, i) {
      return '<span class="t-esq-chip" title="Tipo: ' + (TIPO_LBL[c.tipo] || c.tipo) + '">' + esc(c.label) +
        (c.req ? '<span class="req">*</span>' : '') +
        (c.core ? '' : '<button type="button" class="x" data-i="' + i + '" aria-label="Quitar ' + esc(c.label) + '">&times;</button>') +
        '</span>';
    }).join('') || '<span class="t-esq-empty">Sin campos configurados.</span>';
    document.getElementById('nvCampos').querySelectorAll('.x').forEach(function (b) {
      b.onclick = function (e) { e.stopPropagation(); camposDraft.splice(+b.dataset.i, 1); renderCampos(); };
    });
  }
  // PPTO-09: apagar "admite ítems" en un nivel que ya tiene ítems se advierte en el momento.
  function toggleCamposWrap() {
    var on = getSwitch('nvAdmiteItems');
    document.getElementById('camposWrap').style.display = on ? '' : 'none';
    var w = document.getElementById('nvAdmiteWarn');
    if (!w) {
      w = document.createElement('div'); w.id = 'nvAdmiteWarn'; w.className = 'naowee-helper naowee-helper--caution'; w.style.marginTop = '6px';
      document.getElementById('nvAdmiteItems').parentNode.appendChild(w);
    }
    var cnt = nivelEditId ? itemsDe(nivelEditId).length : 0;
    w.style.display = (!on && cnt) ? '' : 'none';
    w.textContent = cnt + ' ítem' + (cnt === 1 ? '' : 's') + ' de este nivel dejarán de poder editarse y de recibir ítems nuevos. Se conservan en el catálogo y en la traza.';
  }
  function addCampo() {
    var inp = document.getElementById('nvAddIn'), label = inp.value.trim();
    if (!label) { inp.focus(); return; }
    var key = slugKey(label);
    if (camposDraft.some(function (c) { return c.key === key; })) { inp.select(); return; }
    var req = document.getElementById('nvAddReq'), tipo = UI.getDD('nvAddTipo') || 'texto';
    var campo = { key: key, label: label, tipo: tipo, req: req.classList.contains('naowee-checkbox--checked'), core: false };
    if (tipo === 'lista') {
      var opc = document.getElementById('nvAddOpc');
      campo.opciones = opc.value.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
      if (campo.opciones.length < 2) { opc.focus(); UI.toast('Una lista necesita al menos dos opciones, separadas por coma.', 'caution'); return; }
      opc.value = '';
    }
    camposDraft.push(campo);
    req.classList.remove('naowee-checkbox--checked'); req.setAttribute('aria-checked', 'false');
    inp.value = ''; renderCampos(); inp.focus();
  }

  function openNivel(id) {
    nivelEditId = id || null;
    var n = id ? nivelById(id) : null;
    document.getElementById('mNivelTitle').textContent = n ? 'Editar nivel' : 'Nuevo nivel';
    document.getElementById('nvNombre').value = n ? n.nombre : '';
    document.getElementById('nvOrden').value = n ? n.orden : (cat.niveles.length + 1);
    document.getElementById('nvDesc').value = n && n.descripcion ? n.descripcion : '';
    document.getElementById('nvValorFijo').value = n && n.valorFijo != null ? n.valorFijo : '';
    document.getElementById('nvFormula').value = n && n.formula ? n.formula : 'SUMA(ítems del nivel)';
    var tipo = n ? n.valorTipo : 'formula';
    UI.setDD('nvValorTipo', tipo, tipo === 'formula' ? 'Fórmula' : tipo === 'fijo' ? 'Valor fijo' : 'Sin valor');
    valorCfg(tipo);
    setSwitch('nvAdmiteItems', n ? !!n.admiteItems : true);
    camposDraft = camposDe(n).map(function (c) { return Object.assign({}, c); });
    renderCampos(); toggleCamposWrap();
    document.getElementById('nvAddForm').classList.remove('open');
    clearInvalid('#mNivel'); nombreErr('');
    openModal('mNivel');
  }
  var VALOR_LBL = { formula: 'Fórmula', fijo: 'Valor fijo', ninguno: 'Sin valor' };
  var CAMPOS_NIVEL = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'orden', label: 'Posición' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'valorTipo', label: 'Valor del nivel', fmt: function (v) { return VALOR_LBL[v] || '—'; } },
    { key: 'valorFijo', label: 'Valor fijo', fmt: function (v) { return v == null ? '—' : D.fmtCOP(v); } },
    { key: 'formula', label: 'Fórmula' },
    { key: 'admiteItems', label: 'Admite ítems', fmt: function (v) { return v ? 'Sí' : 'No'; } },
    { key: 'campos', label: 'Campos del ítem', fmt: function (v) { return (v && v.length) ? v.map(function (c) { return c.label + (c.req ? '*' : ''); }).join(', ') : '—'; } }
  ];
  function nombreErr(msg) {
    var el = document.getElementById('nvNombre'), wrap = el.closest('.naowee-textfield'), h = document.getElementById('nvNombreErr');
    if (!h) { h = document.createElement('div'); h.id = 'nvNombreErr'; h.className = 'naowee-helper naowee-helper--negative'; h.style.marginTop = '5px'; wrap.appendChild(h); }
    h.textContent = msg || ''; h.style.display = msg ? '' : 'none';
    if (msg) { markInvalid(el); el.focus(); }
  }
  function saveNivel() {
    var el = document.getElementById('nvNombre'), nombre = el.value.trim();
    nombreErr('');
    if (!nombre) { nombreErr('El nombre del nivel es obligatorio.'); return; }
    var repetido = cat.niveles.filter(function (x) { return x.id !== nivelEditId && norm(x.nombre) === norm(nombre); })[0];
    if (repetido) { nombreErr('Ya existe un nivel llamado «' + repetido.nombre + '»' + (repetido.activo ? '' : ' (inactivo)') + ' en esta estructura.'); return; }
    var tipo = UI.getDD('nvValorTipo') || 'formula';
    var admite = getSwitch('nvAdmiteItems');
    var data = {
      nombre: nombre, orden: parseInt(document.getElementById('nvOrden').value, 10) || 1,
      descripcion: document.getElementById('nvDesc').value.trim(), valorTipo: tipo,
      valorFijo: tipo === 'fijo' ? (num(document.getElementById('nvValorFijo').value) || 0) : null,
      formula: tipo === 'formula' ? document.getElementById('nvFormula').value.trim() : null,
      admiteItems: admite, campos: admite ? camposDraft.slice() : []
    };
    if (nivelEditId) {
      // PPTO-05: resumen antes de confirmar; si cambia la posición de un nivel con ítems,
      // se advierte el impacto. Editar no toca `activo` (reactivar es otra acción).
      var n = nivelById(nivelEditId);
      var cambios = D.diff(n, data, CAMPOS_NIVEL);
      var its = itemsDe(n.id), impacto = '';
      if (data.orden !== n.orden && its.length) {
        impacto += '<div class="naowee-message naowee-message--caution" style="margin-top:14px"><div class="naowee-message__header"><span class="naowee-message__icon"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2"><path d="M12 3l9 17H3z"/><path d="M12 9v4M12 17h.01"/></svg></span>' +
          '<div class="naowee-message__body"><b>Cambia la posición de un nivel con ítems.</b> «' + esc(n.nombre) + '» pasa de la posición ' + n.orden + ' a la ' + data.orden + ' y arrastra sus <b>' + its.length + ' ítems</b> (' + D.fmtCOP(nivelTotal(n)) + '). Cambia el orden en que se muestran la estructura, la consulta y la plantilla de carga.</div></div></div>';
      }
      var ids = its.map(function (x) { return x.id; });
      impacto += UI.avisoPresupuestos(D.presupuestosDe(cat.id).filter(function (p) { return p.itemsUsados.some(function (i) { return ids.indexOf(i) >= 0; }); }), 'Editar este nivel');
      UI.confirmarCambios({ titulo: 'Revisa los cambios del nivel', desde: 'mNivel', cambios: cambios, impacto: impacto }).then(function (ok) {
        if (!ok) return;
        Object.keys(data).forEach(function (k) { n[k] = data[k]; });
        D.logAudit(cat, 'Editar nivel', 'Nivel · ' + nombre, null, { cambios: cambios });
        D.saveCatalogo(cat); tocado();
        renderNiveles(); renderItems(); renderHead(); renderAuditoria(); renderCarga();
        UI.toast('Nivel actualizado. El cambio queda en el historial.');
      });
      return;
    } else {
      // Código = siguiente número libre (el orden puede chocar con un capítulo existente,
      // p. ej. '8' de Instalaciones); id único aunque se repitan nombres.
      var usados = cat.niveles.map(function (x) { return parseInt(x.codigo, 10) || 0; });
      data.id = 'nv-' + slugKey(nombre) + '-' + Date.now().toString(36);
      data.codigo = String(Math.max.apply(null, [0].concat(usados)) + 1);
      data.activo = true;
      data.creado = D.hoy();
      data.creadoPor = D.usuarioActual();
      cat.niveles.push(data);
      D.logAudit(cat, 'Crear nivel', 'Nivel · ' + nombre);
    }
    D.saveCatalogo(cat); closeModal('mNivel'); tocado();
    renderNiveles(); renderItems(); renderHead(); renderAuditoria(); renderCarga();
  }
  function openDesactivar(id) {
    nivelDesId = id;
    var n = nivelById(id), cnt = itemsDe(id).length;
    document.getElementById('motivoWarn').innerHTML = cnt
      ? 'El nivel <b>' + esc(n.nombre) + '</b> tiene <b>' + cnt + ' ítems</b> asociados. Se retira de la estructura pero se conserva la trazabilidad.'
      : 'El nivel <b>' + esc(n.nombre) + '</b> se retira de la estructura. Se conserva la trazabilidad.';
    document.getElementById('motivoTxt').value = '';
    clearInvalid('#mMotivo');
    openModal('mMotivo');
  }
  function confirmDesactivar() {
    var el = document.getElementById('motivoTxt'), motivo = el.value.trim();
    if (!motivo) { markInvalid(el); el.focus(); return; }
    var n = nivelById(nivelDesId);
    n.activo = false; n.motivoBaja = motivo;
    D.saveCatalogo(cat); D.logAudit(cat, 'Desactivar nivel', 'Nivel · ' + n.nombre, null, { motivo: motivo, items: itemsDe(n.id).length });
    closeModal('mMotivo'); tocado();
    renderNiveles(); renderItems(); renderHead(); renderAuditoria();
  }

  // ── Validación / helpers de formulario ──
  function markInvalid(el) { var w = el.closest('.naowee-textfield__input-wrap'); if (w) w.classList.add('t-invalid'); }
  function clearInvalid(sel) { document.querySelectorAll((sel || '') + ' .naowee-textfield__input-wrap.t-invalid').forEach(function (w) { w.classList.remove('t-invalid'); }); }
  // Campos numéricos: solo dígitos y un separador decimal. Sin spinners.
  function soloNumeros(input) {
    input.setAttribute('inputmode', 'decimal');
    input.addEventListener('input', function () {
      var limpio = input.value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
      var partes = limpio.split('.');
      if (partes.length > 2) limpio = partes[0] + '.' + partes.slice(1).join('');
      if (input.value !== limpio) input.value = limpio;
      var w = input.closest('.naowee-textfield__input-wrap'); if (w) w.classList.remove('t-invalid');
    });
  }

  // ── ÍTEMS ──
  function tableCampos() {
    var seen = {}, out = [];
    cat.niveles.filter(function (n) { return n.activo && n.admiteItems; }).forEach(function (n) {
      camposDe(n).forEach(function (c) {
        if (c.key === 'cod' || c.key === 'nombre') return;
        if (!seen[c.key]) { seen[c.key] = 1; out.push(c); }
      });
    });
    return out;
  }
  function renderItems() {
    fillFiltroNivel();
    var cols = tableCampos();
    document.getElementById('itemHead').innerHTML =
      '<tr><th>Código</th><th>Ítem</th><th>Nivel</th>' +
      cols.map(function (c) { return '<th>' + esc(c.label) + '</th>'; }).join('') +
      '<th>V. total</th><th>Acciones</th></tr>';

    var q = norm(document.getElementById('itSearch').value);
    var ft = UI.getDD('itFiltroTipo'), fn = UI.getDD('itFiltroNivel');
    var base = D.itemsActivos(cat);
    var rows = base.filter(function (it) {
      if (ft && (it.tipo || 'Producto') !== ft) return false;
      if (fn && it.nivelId !== fn) return false;
      return !q || norm(it.nombre).indexOf(q) >= 0 || norm(it.cod).indexOf(q) >= 0;
    });
    document.getElementById('itCount').innerHTML = '<b>' + rows.length + '</b> de ' + base.length + ' ítems';
    document.getElementById('itemsBody').innerHTML = rows.map(function (it) {
      var n = nivelById(it.nivelId);
      return '<tr' + (it.nuevo ? ' class="t-row-new"' : '') + '>' +
        '<td data-label="Código">' + esc(it.cod) + '</td>' +
        '<td data-label="Ítem"><span class="t-cname" title="' + esc(it.nombre) + '">' + esc(it.nombre) + '</span></td>' +
        '<td data-label="Nivel">' + esc(n ? n.nombre : '—') + '</td>' +
        cols.map(function (c) {
          var v = itemVal(it, c.key);
          return '<td data-label="' + esc(c.label) + '"' + (NUMERICO[c.tipo] ? ' class="tnum"' : '') + '>' + fmtCampo(c, v) + '</td>';
        }).join('') +
        '<td data-label="V. total" class="tnum">' + D.fmtCOP(it.valorTotal) + '</td>' +
        '<td data-label="Acciones">' + kebab('item', it.id, 'Acciones del ítem') + '</td>' +
        '</tr>';
    }).join('');
    var empty = rows.length === 0;
    document.getElementById('itemEmpty').classList.toggle('show', empty);
    document.getElementById('itemList').style.display = empty ? 'none' : '';
  }

  function fillFiltroNivel() {
    var sel = UI.getDD('itFiltroNivel');
    var opts = cat.niveles.filter(function (n) { return n.activo && n.admiteItems; }).sort(function (a, b) { return a.orden - b.orden; })
      .map(function (n) { return { value: n.id, label: n.nombre }; });
    UI.fillDD('itFiltroNivel', [{ value: '', label: 'Todo nivel' }].concat(opts), null);
    var still = opts.filter(function (o) { return o.value === sel; })[0];
    UI.setDD('itFiltroNivel', still ? sel : '', still ? still.label : 'Todo nivel');
  }
  function fillNivelDD() {
    var activos = cat.niveles.filter(function (n) { return n.activo && n.admiteItems; }).map(function (n) { return { value: n.id, label: n.nombre }; });
    UI.fillDD('itNivel', activos, 'Seleccione una opción');
  }

  var DD_TRIGGER = '<button class="naowee-dropdown__trigger" type="button" aria-haspopup="listbox"><span class="naowee-dropdown__value naowee-dropdown__placeholder">Seleccione</span><span class="naowee-dropdown__controls"><span class="naowee-dropdown__chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></span></span></button><div class="naowee-dropdown__menu" role="listbox"></div>';

  // Genera los inputs del ítem según los campos configurados en el nivel (PPTO-09/10)
  function renderItemFields(nivelId, it) {
    var grid = document.getElementById('itGrid');
    grid.querySelectorAll('[data-campo]').forEach(function (e) { e.remove(); });
    var n = nivelById(nivelId);
    document.getElementById('itHint').style.display = n ? 'none' : '';
    if (!n) return;
    var campos = camposDe(n);

    campos.forEach(function (c) {
      var v = it ? itemVal(it, c.key) : '';
      var wide = (c.key === 'nombre');
      var div = document.createElement('div');
      div.setAttribute('data-campo', c.key); div.setAttribute('data-tipo', c.tipo);
      var lbl = '<label class="naowee-textfield__label' + (c.req ? ' naowee-textfield__label--required' : '') + '" style="display:block;margin-bottom:6px">' + esc(c.label) + '</label>';

      if (c.tipo === 'unidad' || c.tipo === 'lista') {
        div.className = wide ? 't-col-full' : '';
        div.innerHTML = lbl + '<div class="naowee-dropdown" id="itf-' + c.key + '"' + (c.tipo === 'unidad' ? ' data-search' : '') + ' style="width:100%">' + DD_TRIGGER + '</div>';
        grid.appendChild(div);
        UI.fillDD('itf-' + c.key, c.tipo === 'unidad' ? D.UNIDADES : (c.opciones || []), c.tipo === 'unidad' ? 'Selecciona unidad' : 'Seleccione una opción');
        if (!v && c.key === 'tipo') v = 'Producto';
        if (v) UI.setDD('itf-' + c.key, v, v);
      } else if (c.tipo === 'booleano') {
        var on = v === true || v === 'Sí';
        div.innerHTML = lbl + '<div class="naowee-switch' + (on ? ' naowee-switch--on' : '') + '" id="itf-' + c.key + '" role="switch" aria-checked="' + on + '" tabindex="0" style="cursor:pointer;margin-top:8px"><span class="naowee-switch__track"><span class="naowee-switch__handle"></span></span><span class="naowee-switch__label">' + (on ? 'Sí' : 'No') + '</span></div>';
        grid.appendChild(div);
        (function (sw) {
          function t() { var o = !sw.classList.contains('naowee-switch--on'); sw.classList.toggle('naowee-switch--on', o); sw.setAttribute('aria-checked', o); sw.querySelector('.naowee-switch__label').textContent = o ? 'Sí' : 'No'; }
          sw.onclick = t; sw.onkeydown = function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); t(); } };
        })(document.getElementById('itf-' + c.key));
      } else if (c.tipo === 'fecha') {
        div.innerHTML = lbl + '<div class="naowee-datepicker-field" data-dp id="itf-' + c.key + '" style="width:100%"><div class="naowee-datepicker-field__input" tabindex="0" role="button" aria-haspopup="dialog">' +
          '<span class="naowee-datepicker-field__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></svg></span>' +
          '<span class="naowee-datepicker-field__value naowee-dropdown__placeholder" data-dp-value>DD/MM/AAAA</span></div><div class="t-dp-pop" data-dp-pop></div></div>';
        grid.appendChild(div);
        UI.initDatepickers(div);
        if (v) UI.dpSet('itf-' + c.key, v);
      } else {
        div.className = 'naowee-textfield' + (wide ? ' t-col-full' : '');
        div.innerHTML = '<label class="naowee-textfield__label' + (c.req ? ' naowee-textfield__label--required' : '') + '">' + esc(c.label) + (c.tipo === 'moneda' ? ' (COP)' : c.tipo === 'porcentaje' ? ' (%)' : '') + '</label>' +
          '<div class="naowee-textfield__input-wrap"><input class="naowee-textfield__input" id="itf-' + c.key + '" type="text" value="' + (v == null ? '' : esc(v)) + '"' + (c.tipo === 'porcentaje' ? ' placeholder="0 – 100"' : '') + '></div>';
        grid.appendChild(div);
        var inp = document.getElementById('itf-' + c.key);
        if (NUMERICO[c.tipo]) soloNumeros(inp);
        else inp.addEventListener('input', function () { var w = inp.closest('.naowee-textfield__input-wrap'); if (w) w.classList.remove('t-invalid'); });
      }
    });

    // V. total: se calcula solo. Si lo escribes tú, el sistema deriva el V. unitario.
    var tieneUnit = campos.some(function (c) { return c.key === 'valorUnit'; });
    if (tieneUnit) {
      var tdiv = document.createElement('div');
      tdiv.className = 'naowee-textfield'; tdiv.setAttribute('data-campo', '__total');
      tdiv.innerHTML = '<label class="naowee-textfield__label">V. total (COP)</label>' +
        '<div class="naowee-textfield__input-wrap"><input class="naowee-textfield__input" id="itf-total" type="text" value="' + (it && it.valorTotal != null ? it.valorTotal : '') + '"></div>' +
        '<div class="naowee-helper naowee-helper--informative" id="itCalcHint" style="margin-top:5px">Se calcula solo: cantidad × V. unitario. Si escribes el total, se deriva el V. unitario.</div>';
      grid.appendChild(tdiv);
      soloNumeros(document.getElementById('itf-total'));
      wireCalculo();
    }

    var f = document.createElement('div');
    f.className = 'naowee-textfield t-col-full'; f.setAttribute('data-campo', '__formula');
    f.innerHTML = '<label class="naowee-textfield__label">Fórmula (opcional)</label>' +
      '<div class="naowee-textfield__input-wrap"><input class="naowee-textfield__input" id="itFormula" placeholder="cantidad × valor unitario" value="' + (it && it.formula ? esc(it.formula) : '') + '"></div>';
    grid.appendChild(f);
  }

  // Cálculo automático en las 3 direcciones (PPTO-10 criterio 3)
  function wireCalculo() {
    var cant = document.getElementById('itf-cantidad');
    var unit = document.getElementById('itf-valorUnit');
    var total = document.getElementById('itf-total');
    var hint = document.getElementById('itCalcHint');
    if (!unit || !total) return;
    function q() { return cant ? (num(cant.value) == null ? 1 : num(cant.value)) : 1; }
    function haciaTotal() {
      var u = num(unit.value); if (u == null) return;
      total.value = Math.round(u * q());
      if (hint) hint.textContent = 'V. total calculado: ' + q() + ' × ' + D.fmtCOP(u);
    }
    function haciaUnit() {
      var t = num(total.value), c = q();
      if (t == null || !c) return;
      unit.value = Math.round(t / c);
      if (hint) hint.textContent = 'V. unitario derivado: ' + D.fmtCOP(t) + ' ÷ ' + c;
    }
    if (cant) cant.addEventListener('input', haciaTotal);
    unit.addEventListener('input', haciaTotal);
    total.addEventListener('input', haciaUnit);
  }

  // Valor de un campo del formulario según su control (texto, lista, sí/no, fecha).
  function leerCampo(key, tipo) {
    var el = document.getElementById('itf-' + key);
    if (!el) return '';
    if (tipo === 'booleano') return el.classList.contains('naowee-switch--on') ? 'Sí' : 'No';
    if (tipo === 'fecha') return UI.dpGet('itf-' + key);
    if (el.classList.contains('naowee-dropdown')) return UI.getDD('itf-' + key);
    return el.value.trim();
  }
  // Lo escrito en el formulario del ítem, con la misma forma de un ítem guardado.
  function leerItemForm() {
    var it = { extra: {} };
    document.querySelectorAll('#itGrid [data-campo]').forEach(function (div) {
      var k = div.getAttribute('data-campo');
      if (k === '__total') { var t = document.getElementById('itf-total'); if (t && t.value !== '') it.valorTotal = t.value; return; }
      if (k === '__formula') { var f = document.getElementById('itFormula'); if (f && f.value) it.formula = f.value; return; }
      var v = leerCampo(k, div.getAttribute('data-tipo'));
      if (v === '' || v == null) return;
      if (STD[k]) it[k] = v; else it.extra[k] = v;
    });
    return it;
  }

  function openItem(id, presetNivel) {
    itemEditId = id || null;
    fillNivelDD();
    var it = id ? cat.items.filter(function (x) { return x.id === id; })[0] : null;
    document.getElementById('mItemTitle').textContent = it ? 'Editar ítem' : 'Nuevo ítem';
    document.getElementById('itGuardarOtro').style.display = it ? 'none' : '';
    document.getElementById('itemError').style.display = 'none';
    var nivelId = it ? it.nivelId : (presetNivel || '');
    if (nivelId) { var n = nivelById(nivelId); UI.setDD('itNivel', nivelId, n ? n.nombre : ''); }
    else { UI.setDD('itNivel', '', 'Seleccione una opción'); document.getElementById('itNivel').querySelector('.naowee-dropdown__value').classList.add('naowee-dropdown__placeholder'); }
    renderItemFields(nivelId, it);
    clearInvalid('#mItem');
    openModal('mItem');
  }

  // Vista plana de un ítem para compararlo campo a campo (estándar + propios + cálculo).
  function planoItem(it) {
    var o = { __nivel: (nivelById(it.nivelId) || {}).nombre, formula: it.formula, valorTotal: it.valorTotal };
    Object.keys(STD).forEach(function (k) { o[k] = it[k]; });
    Object.keys(it.extra || {}).forEach(function (k) { o[k] = it.extra[k]; });
    return o;
  }
  function camposResumenItem(n) {
    var fmt = function (c) { return function (v) { return v == null || v === '' ? '—' : (c.tipo === 'moneda' ? D.fmtCOP(v) : String(v)); }; };
    return [{ key: '__nivel', label: 'Nivel' }]
      .concat(camposDe(n).map(function (c) { return { key: c.key, label: c.label, fmt: fmt(c) }; }))
      .concat([{ key: 'formula', label: 'Fórmula' }, { key: 'valorTotal', label: 'V. total', fmt: function (v) { return D.fmtCOP(v); } }]);
  }
  function saveItem(otro) {
    var nivelId = UI.getDD('itNivel');
    var err = document.getElementById('itemError'), msg = document.getElementById('itemErrorMsg');
    if (!nivelId) { msg.textContent = 'Selecciona el nivel del ítem.'; err.style.display = ''; return; }
    var n = nivelById(nivelId), campos = camposDe(n);
    var vals = {}, faltan = [], malos = [];
    clearInvalid('#mItem');

    campos.forEach(function (c) {
      var raw = leerCampo(c.key, c.tipo), el = document.getElementById('itf-' + c.key);
      var esInput = el && el.tagName === 'INPUT';
      if (c.req && !raw) { faltan.push(c.label); if (esInput) markInvalid(el); return; }
      if (NUMERICO[c.tipo] && raw !== '' && num(raw) == null) { malos.push(c.label); if (esInput) markInvalid(el); return; }
      if (c.tipo === 'porcentaje' && raw !== '' && (num(raw) < 0 || num(raw) > 100)) { malos.push(c.label + ' (entre 0 y 100)'); if (esInput) markInvalid(el); return; }
      vals[c.key] = NUMERICO[c.tipo] ? (raw === '' ? null : num(raw)) : raw;
    });

    // D13: el código del ítem es único en todo el catálogo.
    var dupCod = vals.cod && cat.items.filter(function (x) { return x.id !== itemEditId && norm(x.cod) === norm(vals.cod); })[0];

    if (faltan.length || malos.length || dupCod) {
      msg.textContent = (faltan.length ? 'Campos obligatorios sin diligenciar: ' + faltan.join(', ') + '. ' : '') +
                        (malos.length ? 'Valores no válidos en: ' + malos.join(', ') + '. ' : '') +
                        (dupCod ? 'El código ' + vals.cod + ' ya lo usa «' + dupCod.nombre + '».' : '');
      if (dupCod) markInvalid(document.getElementById('itf-cod'));
      err.style.display = ''; return;
    }

    var cant = vals.cantidad == null ? 1 : vals.cantidad;
    var vu = vals.valorUnit == null ? 0 : vals.valorUnit;
    var totalEl = document.getElementById('itf-total');
    var totalManual = totalEl ? num(totalEl.value) : null;
    var extra = {};
    campos.forEach(function (c) { if (!STD[c.key]) extra[c.key] = vals[c.key]; });

    var data = {
      nivelId: nivelId, cod: vals.cod || '', nombre: vals.nombre || '', uni: vals.uni || '',
      tipo: vals.tipo || (itemEditId ? (cat.items.filter(function (x) { return x.id === itemEditId; })[0].tipo || 'Producto') : 'Producto'),
      cantidad: cant, valorUnit: vu, extra: extra,
      formula: (document.getElementById('itFormula') || {}).value ? document.getElementById('itFormula').value.trim() : null,
      valorTotal: totalManual != null ? Math.round(totalManual) : Math.round(vu * cant)
    };

    if (itemEditId) {
      // PPTO-11: el resumen incluye el recálculo (V. total del ítem y total de su nivel)
      // y avisa si el ítem está en presupuestos activos.
      var it = cat.items.filter(function (x) { return x.id === itemEditId; })[0];
      var cambios = D.diff(planoItem(it), planoItem(data), camposResumenItem(n));
      var nvAntes = nivelById(it.nivelId), totAntes = nivelTotal(nvAntes);
      var totDespues = it.nivelId === data.nivelId ? totAntes - (it.valorTotal || 0) + data.valorTotal : nivelTotal(n) + data.valorTotal;
      if (totAntes !== totDespues || it.nivelId !== data.nivelId) {
        cambios.push({ campo: '__nivelTotal', etiqueta: 'Total del nivel ' + n.nombre, antes: D.fmtCOP(it.nivelId === data.nivelId ? totAntes : nivelTotal(n)), despues: D.fmtCOP(totDespues) });
      }
      UI.confirmarCambios({
        titulo: 'Revisa los cambios del ítem ' + (it.cod || ''), desde: 'mItem', cambios: cambios,
        impacto: UI.avisoPresupuestos(D.presupuestosConItem(cat.id, it.id), 'Este ítem está en uso y el cambio')
      }).then(function (ok) {
        if (!ok) return;
        Object.keys(data).forEach(function (k) { it[k] = data[k]; });
        D.logAudit(cat, 'Editar ítem', 'Ítem · ' + data.cod, null, { cambios: cambios });
        D.saveCatalogo(cat); tocado();
        renderItems(); renderNiveles(); renderHead(); renderAuditoria();
        UI.toast('Ítem actualizado y recalculado.');
      });
      return;
    } else {
      data.id = 'it-' + slugKey(data.cod) + '-' + cat.items.length;
      data.nuevo = true;
      cat.items.unshift(data);   // los nuevos se listan de primeros
      D.logAudit(cat, 'Crear ítem', 'Ítem · ' + data.cod);
    }
    D.saveCatalogo(cat); tocado();
    renderItems(); renderNiveles(); renderHead(); renderAuditoria();
    if (otro === true) {
      // PPTO-10.1 "uno o más": el formulario queda listo para el siguiente ítem del mismo nivel.
      UI.toast('Ítem ' + esc(data.cod) + ' creado. Sigue con el siguiente.');
      openItem(null, nivelId);
      var c0 = document.getElementById('itf-cod'); if (c0) c0.focus();
      return;
    }
    closeModal('mItem');
    UI.toast('Ítem ' + esc(data.cod) + ' guardado.');
  }

  // ── CARGA MASIVA (PPTO-12 plantilla · 13 carga · 14 resultado) ──
  // El CSV se lee de verdad: metadatos de la plantilla en la primera fila, encabezados en la
  // segunda y una fila por registro. Un .xlsx no se puede leer sin librería en esta demo:
  // se acepta y se procesa el ejemplo vigente, avisándolo en pantalla.
  var carga = null;   // { tipo, nivelId, archivo, filas:[{fila, ref, ok, motivo, dato}] }
  var ESTRUCTURA_COLS = [
    { key: 'codigo', label: 'Código', req: true }, { key: 'nombre', label: 'Nombre', req: true },
    { key: 'orden', label: 'Posición', tipo: 'numero' }, { key: 'descripcion', label: 'Descripción' },
    { key: 'admite_items', label: 'Admite ítems (si/no)', tipo: 'booleano' },
    { key: 'tipo_valor', label: 'Valor (formula/fijo/ninguno)' }, { key: 'valor_fijo', label: 'Valor fijo', tipo: 'moneda' }
  ];
  function cargaTipo() { return UI.getDD('cargaTipo') || 'items'; }
  function nivelesConItems() { return cat.niveles.filter(function (n) { return n.activo && n.admiteItems; }).sort(function (a, b) { return a.orden - b.orden; }); }
  function cargaNivel() { return UI.getDD('cargaNivel'); }
  function colsPlantilla() {
    if (cargaTipo() === 'niveles') return ESTRUCTURA_COLS;
    var n = nivelById(cargaNivel());
    return n ? camposDe(n) : [];
  }
  function metaPlantilla(v) {
    return '#plantilla=' + v + ';catalogo=' + cat.id + ';tipo=' + cargaTipo() + (cargaTipo() === 'items' ? ';nivel=' + cargaNivel() : '');
  }
  function csvDe(filas) {
    return '﻿' + filas.map(function (r) { return r.map(function (v) { v = v == null ? '' : String(v); return /[",;\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\r\n') + '\r\n';
  }
  function nombreArchivo(pref, v) { return pref + '-' + cargaTipo() + '-' + slug(cat.nombre) + (cargaTipo() === 'items' ? '-' + slug((nivelById(cargaNivel()) || {}).nombre) : '') + '-' + v + '.csv'; }

  function fillCargaNivel() {
    var sel = cargaNivel(), ns = nivelesConItems();
    UI.fillDD('cargaNivel', ns.map(function (n) { return { value: n.id, label: n.nombre }; }), null);
    var keep = ns.filter(function (n) { return n.id === sel; })[0] || ns[0];
    if (keep) UI.setDD('cargaNivel', keep.id, keep.nombre);
  }
  function renderCarga() {
    if (!document.getElementById('cargaTipo')) return;
    fillCargaNivel();
    var items = cargaTipo() === 'items';
    document.getElementById('cargaNivelWrap').style.display = items ? '' : 'none';
    var pv = D.plantillaVigente(cat), cols = colsPlantilla();
    var sinNivel = items && !cargaNivel();
    document.getElementById('btnPlantilla').disabled = sinNivel;
    document.getElementById('cargaCols').innerHTML = sinNivel
      ? 'Este catálogo aún no tiene niveles que admitan ítems. Crea uno en <b>Estructura</b> para poder cargar ítems.'
      : 'Plantilla vigente <b>' + pv.v + '</b> · generada el ' + fdate(pv.fecha) + (pv.anterior ? ' (reemplaza a la ' + pv.anterior + ')' : '') +
        '<br>Columnas: ' + cols.map(function (c) { return '<code>' + esc(c.key) + '</code>' + (c.req ? '*' : ''); }).join(' ') +
        ' <span style="opacity:.8">· * obligatoria</span>';
  }
  function paso(n) {
    [1, 2, 3].forEach(function (i) {
      document.getElementById('cargaPaso' + i).hidden = i !== n;
      var st = document.querySelector('#cargaStepper [data-paso="' + i + '"]');
      st.classList.toggle('naowee-stepper__step--active', i === n);
      st.classList.toggle('naowee-stepper__step--done', i < n);
    });
    document.querySelectorAll('#cargaStepper .naowee-stepper__connector').forEach(function (c, i) { c.classList.toggle('naowee-stepper__connector--done', i + 1 < n); });
  }
  function descargarPlantilla() {
    var pv = D.plantillaVigente(cat), cols = colsPlantilla();
    if (!cols.length) return;
    var nombre = nombreArchivo('plantilla', pv.v);
    UI.descargar(nombre, csvDe([[metaPlantilla(pv.v)], cols.map(function (c) { return c.key; })]), 'text/csv;charset=utf-8');
    D.logAudit(cat, 'Descargar plantilla', 'Plantilla · ' + pv.v, null, { archivo: nombre });
    renderAuditoria();
    UI.toast('Plantilla ' + pv.v + ' descargada: ' + esc(nombre));
  }
  // Archivos de ejemplo para recorrer la demo sin preparar nada: 10 filas válidas y 2 con error.
  function ejemploFilas() {
    var cols = colsPlantilla();
    if (cargaTipo() === 'niveles') {
      return [['90', 'Obras exteriores', '8', 'Andenes y cerramientos', 'si', 'formula', ''], ['91', 'Carpintería metálica', '9', '', 'si', 'formula', ''],
              ['92', 'Aseo final de obra', '10', '', 'no', 'fijo', '850000'], ['93', 'Señalización', '11', '', 'si', 'formula', ''],
              ['94', 'Preliminares', '12', 'Nombre repetido', 'si', 'formula', ''], ['95', '', '13', 'Sin nombre', 'si', 'formula', '']]
        .map(function (r) { return ESTRUCTURA_COLS.map(function (c, i) { return r[i]; }); });
    }
    var n = nivelById(cargaNivel()), base = (n && n.codigo) || '9', filas = [];
    // Códigos libres: el ejemplo se puede cargar varias veces sin chocar con lo ya cargado.
    var desde = 90 + cat.items.reduce(function (mx, it) {
      var m = new RegExp('^' + base.replace('.', '\\.') + '\\.(\\d+)$').exec(it.cod || '');
      return m ? Math.max(mx, +m[1] - 89) : mx;
    }, 0);
    var NOMBRES = ['Suministro e instalación de malla electrosoldada', 'Mortero de nivelación e=3 cm', 'Sello de juntas con masilla elástica', 'Retiro de sobrantes a botadero',
                   'Limpieza de superficie con cepillo de acero', 'Curado de concreto con antisol', 'Anclaje químico ø 1/2"', 'Formaleta metálica (alquiler)', 'Bordillo prefabricado',
                   'Imprimante asfáltico'];
    for (var i = 0; i < 12; i++) {
      var r = {}; cols.forEach(function (c) { r[c.key] = ''; });
      r.cod = base + '.' + (desde + i); r.nombre = NOMBRES[i % NOMBRES.length];
      r.tipo = i === 7 ? 'Servicio' : 'Producto'; r.uni = ['m2', 'm2', 'm', 'm3', 'm2', 'm2', 'un', 'mes', 'm', 'lt'][i % 10];
      r.cantidad = 1; r.valorUnit = 12000 + i * 3750;
      cols.forEach(function (c) {
        if (STD[c.key]) return;
        if (c.tipo === 'lista') r[c.key] = (c.opciones || [])[0] || '';
        else if (c.tipo === 'booleano') r[c.key] = 'no';
        else if (c.tipo === 'fecha') r[c.key] = D.hoy();
        else if (NUMERICO[c.tipo]) r[c.key] = c.tipo === 'porcentaje' ? 5 : 1;
        else r[c.key] = 'ok';
      });
      if (i === 10) r.uni = 'metros';        // unidad no reconocida
      if (i === 11) r.valorUnit = '';        // obligatorio vacío
      filas.push(cols.map(function (c) { return r[c.key]; }));
    }
    return filas;
  }
  function descargarEjemplo(viejo) {
    var pv = D.plantillaVigente(cat), cols = colsPlantilla(); if (!cols.length) return;
    var v = viejo ? 'P' + Math.max(1, parseInt(pv.v.slice(1), 10) - 1) : pv.v;
    var nombre = nombreArchivo(viejo ? 'ejemplo-version-anterior' : 'ejemplo', v);
    UI.descargar(nombre, csvDe([[metaPlantilla(v)], cols.map(function (c) { return c.key; })].concat(ejemploFilas())), 'text/csv;charset=utf-8');
  }

  function mensaje(tono, html) {
    return '<div class="naowee-message naowee-message--' + tono + '" style="margin:0 0 12px"><div class="naowee-message__header"><span class="naowee-message__icon"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2">' +
      (tono === 'negative' ? '<circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/>' : tono === 'caution' ? '<path d="M12 3l9 17H3z"/><path d="M12 9v4M12 17h.01"/>' : '<circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/>') +
      '</svg></span><div class="naowee-message__body">' + html + '</div></div></div>';
  }
  // Rechazo: el archivo no se procesa y se explica por qué (PPTO-13.2).
  function rechazar(html) {
    carga = null;
    document.getElementById('cargaPrev').innerHTML = mensaje('negative', html);
    document.getElementById('cargaPreviewWrap').style.display = 'none';
    document.getElementById('cargaConfirmar').style.display = 'none';
    paso(2);
  }
  function leerArchivo(file) {
    if (!file) return;
    var ext = (file.name.split('.').pop() || '').toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx') { rechazar('<b>Formato no admitido (.' + esc(ext) + ').</b> Usa la plantilla oficial en .csv o .xlsx.'); return; }
    if (ext === 'xlsx') {
      var pv = D.plantillaVigente(cat);
      procesar(csvDe([[metaPlantilla(pv.v)], colsPlantilla().map(function (c) { return c.key; })].concat(ejemploFilas())), file.name,
        '<b>' + esc(file.name) + '</b>: en esta demo los .xlsx no se leen; se procesa el ejemplo de la plantilla vigente para mostrar el flujo. El .csv sí se lee tal cual.');
      return;
    }
    var fr = new FileReader();
    fr.onload = function () { procesar(fr.result, file.name); };
    fr.readAsText(file, 'utf-8');
  }
  function valida(c, raw) {
    raw = (raw == null ? '' : String(raw)).trim();
    if (!raw) return c.req ? { err: c.label + ' es obligatorio' } : { v: NUMERICO[c.tipo] ? null : '' };
    if (NUMERICO[c.tipo]) {
      var n = num(raw.replace(/\$|\s/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));
      if (n == null) return { err: c.label + ' debe ser un número' };
      if (c.tipo === 'porcentaje' && (n < 0 || n > 100)) return { err: c.label + ' debe estar entre 0 y 100' };
      return { v: n };
    }
    if (c.tipo === 'unidad') { return D.UNIDADES.indexOf(raw) >= 0 ? { v: raw } : { err: 'Unidad «' + raw + '» no reconocida' }; }
    if (c.tipo === 'lista') {
      var op = (c.opciones || []).filter(function (o) { return norm(o) === norm(raw); })[0];
      return op ? { v: op } : { err: c.label + ' debe ser una de: ' + (c.opciones || []).join(', ') };
    }
    if (c.tipo === 'booleano') {
      if (/^(si|sí|s|true|1|x)$/i.test(raw)) return { v: 'Sí' };
      if (/^(no|n|false|0)$/i.test(raw)) return { v: 'No' };
      return { err: c.label + ' debe ser si o no' };
    }
    if (c.tipo === 'fecha') {
      var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw) || /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw);
      if (!m) return { err: c.label + ' debe ser AAAA-MM-DD o DD/MM/AAAA' };
      return { v: m[1].length === 4 ? raw : m[3] + '-' + m[2] + '-' + m[1] };
    }
    return { v: raw };
  }
  function procesar(txt, archivo, aviso) {
    var rows = UI.parseCSV(txt), pv = D.plantillaVigente(cat), cols = colsPlantilla();
    var metaRow = rows[0] && rows[0][0] && rows[0][0].charAt(0) === '#' ? rows.shift()[0] : '';
    var meta = {}; metaRow.slice(1).split(';').forEach(function (kv) { var p = kv.split('='); if (p[0]) meta[p[0].trim()] = (p[1] || '').trim(); });
    if (!meta.plantilla) { rechazar('<b>El archivo no es la plantilla oficial.</b> Falta la fila de identificación de la plantilla. Descarga la plantilla vigente (' + pv.v + ') y vuelve a cargar.'); return; }
    if (meta.plantilla !== pv.v) { rechazar('<b>La plantilla no corresponde a la versión vigente.</b> El archivo usa la <b>' + esc(meta.plantilla) + '</b> y la vigente es la <b>' + pv.v + '</b> (la estructura cambió el ' + fdate(pv.fecha) + '). Descarga la plantilla actual y vuelve a cargar.'); return; }
    if (meta.catalogo && meta.catalogo !== cat.id) { rechazar('<b>La plantilla es de otro catálogo.</b> Descárgala desde este catálogo.'); return; }
    if (meta.tipo && meta.tipo !== cargaTipo()) { rechazar('<b>La plantilla es de ' + (meta.tipo === 'items' ? 'ítems' : 'estructura') + '</b> y elegiste cargar ' + (cargaTipo() === 'items' ? 'ítems' : 'estructura') + '.'); return; }
    if (cargaTipo() === 'items' && meta.nivel && meta.nivel !== cargaNivel()) {
      var nv = nivelById(meta.nivel);
      rechazar('<b>La plantilla es del nivel «' + esc(nv ? nv.nombre : meta.nivel) + '».</b> Cambia el nivel destino o descarga la plantilla del nivel elegido.'); return;
    }
    var head = (rows.shift() || []).map(function (h) { return h.trim(); });
    var esperado = cols.map(function (c) { return c.key; });
    if (head.join('|') !== esperado.join('|')) { rechazar('<b>Los encabezados no coinciden con la plantilla ' + pv.v + '.</b> Se esperaban: <code>' + esperado.join(', ') + '</code>. No modifiques ni reordenes las columnas.'); return; }
    if (!rows.length) { rechazar('<b>El archivo no trae registros</b> debajo de los encabezados.'); return; }

    var vistos = {}, filas = rows.map(function (r, i) {
      var dato = {}, errs = [];
      cols.forEach(function (c, j) { var x = valida(c, r[j]); if (x.err) errs.push(x.err); else dato[c.key] = x.v; });
      var ref, dup;
      if (cargaTipo() === 'items') {
        ref = dato.cod || (r[0] || '').trim();
        dup = dato.cod && (vistos[norm(dato.cod)] || cat.items.some(function (it) { return norm(it.cod) === norm(dato.cod); }));
        if (dup) errs.push('Código ' + dato.cod + ' repetido');
        if (dato.cod) vistos[norm(dato.cod)] = 1;
      } else {
        ref = dato.nombre || '(sin nombre)';
        if (dato.tipo_valor && ['formula', 'fijo', 'ninguno'].indexOf(norm(dato.tipo_valor)) < 0) errs.push('Valor debe ser formula, fijo o ninguno');
        dup = dato.nombre && (vistos[norm(dato.nombre)] || cat.niveles.some(function (n) { return norm(n.nombre) === norm(dato.nombre); }));
        if (dup) errs.push('Ya existe un nivel «' + dato.nombre + '»');
        if (dato.nombre) vistos[norm(dato.nombre)] = 1;
      }
      return { fila: i + 3, ref: ref, ok: !errs.length, motivo: errs.join(' · '), dato: dato };
    });
    carga = { tipo: cargaTipo(), nivelId: cargaNivel(), archivo: archivo, plantilla: pv.v, filas: filas };
    var ok = filas.filter(function (f) { return f.ok; }).length, fail = filas.length - ok;
    document.getElementById('cargaPrev').innerHTML = (aviso ? mensaje('caution', aviso) : '') + mensaje(fail ? 'caution' : 'informative',
      'Vista previa de <b>' + esc(archivo) + '</b> · plantilla <b>' + pv.v + '</b> · destino <b>' + (carga.tipo === 'items' ? esc((nivelById(carga.nivelId) || {}).nombre) : 'estructura del catálogo') + '</b>: ' +
      '<b>' + filas.length + '</b> registros detectados, <b>' + ok + '</b> válidos' + (fail ? ' y <b>' + fail + '</b> con error (marcados en rojo). Los que tienen error no se cargan.' : '. Nada se guarda hasta que confirmes.'));
    var vis = cols.slice(0, 6);
    document.getElementById('cargaPreviewHead').innerHTML = '<tr><th>Fila</th><th>Estado</th>' + vis.map(function (c) { return '<th>' + esc(c.label || c.key) + '</th>'; }).join('') + '<th>Motivo</th></tr>';
    document.getElementById('cargaPreviewBody').innerHTML = filas.slice(0, 100).map(function (f, i) {
      var raw = rows[i];
      return '<tr' + (f.ok ? '' : ' class="t-carga-err"') + '><td>' + f.fila + '</td><td>' +
        (f.ok ? '<span class="naowee-badge naowee-badge--positive naowee-badge--quiet naowee-badge--small">Válido</span>' : '<span class="naowee-badge naowee-badge--negative naowee-badge--quiet naowee-badge--small">Error</span>') + '</td>' +
        vis.map(function (c, j) { return '<td>' + esc(raw[cols.indexOf(c)]) + '</td>'; }).join('') +
        '<td class="t-carga-motivo">' + esc(f.motivo) + '</td></tr>';
    }).join('');
    document.getElementById('cargaPreviewWrap').style.display = '';
    var btn = document.getElementById('cargaConfirmar');
    btn.style.display = ''; btn.disabled = !ok;
    btn.textContent = ok ? 'Cargar ' + ok + ' válido' + (ok === 1 ? '' : 's') + (fail ? ' · omitir ' + fail : '') : 'No hay registros válidos';
    paso(2);
  }
  function confirmarCarga() {
    if (!carga) return;
    var ok = carga.filas.filter(function (f) { return f.ok; });
    if (carga.tipo === 'items') {
      var n = nivelById(carga.nivelId), campos = camposDe(n);
      ok.forEach(function (f, i) {
        var d = f.dato, extra = {};
        campos.forEach(function (c) { if (!STD[c.key]) extra[c.key] = d[c.key]; });
        var cant = d.cantidad == null ? 1 : d.cantidad, vu = d.valorUnit || 0;
        cat.items.unshift({ id: 'it-' + slugKey(d.cod) + '-' + Date.now().toString(36) + i, nivelId: n.id, cod: d.cod, nombre: d.nombre, tipo: d.tipo || 'Producto',
          uni: d.uni || '', cantidad: cant, valorUnit: vu, extra: extra, formula: null, valorTotal: Math.round(vu * cant), nuevo: true });
      });
    } else {
      var maxOrden = Math.max.apply(null, [0].concat(cat.niveles.map(function (x) { return x.orden; })));
      ok.forEach(function (f, i) {
        var d = f.dato, tv = norm(d.tipo_valor) || 'formula';
        cat.niveles.push({ id: 'nv-' + slugKey(d.nombre) + '-' + Date.now().toString(36) + i, codigo: d.codigo, nombre: d.nombre, orden: d.orden || (maxOrden + i + 1),
          descripcion: d.descripcion || '', admiteItems: d.admite_items !== 'No', valorTipo: tv, valorFijo: tv === 'fijo' ? (d.valor_fijo || 0) : null,
          formula: tv === 'formula' ? 'SUMA(ítems del nivel)' : null, campos: D.camposDefault(), activo: true, creado: D.hoy(), creadoPor: D.usuarioActual() });
      });
    }
    var ahora = new Date();
    var reg = { id: 'cg-' + ahora.getTime().toString(36), fecha: D.hoy(), hora: ahora.toTimeString().slice(0, 5), usuario: D.usuarioActual(), archivo: carga.archivo,
      tipo: carga.tipo, destino: carga.tipo === 'items' ? (nivelById(carga.nivelId) || {}).nombre : 'Estructura', plantilla: carga.plantilla,
      detectados: carga.filas.length, ok: ok.length, fail: carga.filas.length - ok.length,
      filas: carga.filas.map(function (f) { return { fila: f.fila, ref: f.ref, ok: f.ok, motivo: f.motivo }; }) };
    cat.cargas = cat.cargas || []; cat.cargas.unshift(reg);
    D.saveCatalogo(cat);
    D.logAudit(cat, 'Carga masiva', (carga.tipo === 'items' ? 'Ítem' : 'Nivel') + ' · ' + reg.ok + ' cargados en ' + reg.destino, null, { archivo: reg.archivo, ok: reg.ok, fail: reg.fail });
    tocado();
    renderNiveles(); renderItems(); renderHead(); renderAuditoria(); renderCarga();
    renderResultado(reg); renderHistorial();
    carga = null;
    paso(3);
  }
  function vgCard(kind, label, value, icon) {
    return '<div class="vg-card ' + kind + '"><div class="vg-ic">' + icon + '</div><div><div class="vg-l">' + label + '</div><div class="vg-v">' + value + '</div></div></div>';
  }
  var _ultimo = null;
  function renderResultado(reg) {
    _ultimo = reg;
    var IC_FILE = '<svg viewBox="0 0 24 24"><path d="M14 3v5h5"/><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>';
    var IC_OK = '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>';
    var IC_ERR = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>';
    document.getElementById('cargaResult').innerHTML =
      vgCard('neutral', 'Detectados', reg.detectados, IC_FILE) + vgCard('ok', 'Procesados', reg.ok, IC_OK) + vgCard('rech', 'Fallidos', reg.fail, IC_ERR);
    var fallidos = reg.filas.filter(function (f) { return !f.ok; });
    var w = document.getElementById('cargaErrWrap');
    w.innerHTML = fallidos.length ? '<table class="naowee-table naowee-table--compact"><thead><tr><th>Fila</th><th>Registro</th><th>Motivo del error</th></tr></thead><tbody>' +
      fallidos.map(function (f) { return '<tr><td data-label="Fila">' + f.fila + '</td><td data-label="Registro">' + esc(f.ref) + '</td><td data-label="Motivo" class="t-carga-motivo">' + esc(f.motivo) + '</td></tr>'; }).join('') + '</tbody></table>' : '';
    w.style.display = fallidos.length ? '' : 'none';
  }
  function reporte(reg) {
    var archivo = UI.exportar({
      formato: 'xls', nombre: 'reporte-carga-' + slug(cat.nombre),
      titulo: 'Resultado de carga masiva · ' + cat.nombre,
      meta: ['Archivo: ' + reg.archivo + ' · plantilla ' + reg.plantilla + ' · destino: ' + reg.destino,
             'Cargado el ' + fdate(reg.fecha) + ' ' + reg.hora + ' por ' + reg.usuario + ' · ' + reg.detectados + ' detectados, ' + reg.ok + ' procesados, ' + reg.fail + ' fallidos'],
      columnas: ['Fila', 'Registro', 'Estado', 'Motivo'],
      filas: reg.filas.map(function (f) { return [f.fila, f.ref, f.ok ? 'Procesado' : 'Fallido', f.motivo]; })
    });
    if (archivo) UI.toast('Reporte descargado: ' + esc(archivo));
  }
  function renderHistorial() {
    var hs = cat.cargas || [];
    document.getElementById('cargaHistBody').innerHTML = hs.map(function (h) {
      return '<tr><td data-label="Fecha">' + fdate(h.fecha) + ' ' + h.hora + '</td><td data-label="Usuario">' + esc(h.usuario) + '</td>' +
        '<td data-label="Archivo"><span class="t-cname" title="' + esc(h.archivo) + '">' + esc(h.archivo) + '</span></td><td data-label="Destino">' + esc(h.destino) + '</td>' +
        '<td data-label="Detectados" class="tnum">' + h.detectados + '</td><td data-label="Procesados" class="tnum">' + h.ok + '</td><td data-label="Fallidos" class="tnum">' + h.fail + '</td>' +
        '<td data-label="Reporte"><button class="naowee-btn naowee-btn--mute naowee-btn--small" data-rep="' + h.id + '">Descargar</button></td></tr>';
    }).join('');
    document.querySelectorAll('#cargaHistBody [data-rep]').forEach(function (b) {
      b.onclick = function () { reporte(hs.filter(function (h) { return h.id === b.dataset.rep; })[0]); };
    });
    document.getElementById('cargaHistWrap').style.display = hs.length ? '' : 'none';
    document.getElementById('cargaHistEmpty').classList.toggle('show', !hs.length);
  }
  function initCarga() {
    renderCarga(); renderHistorial(); paso(1);
    var drop = document.getElementById('cargaDrop');
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.csv,.xlsx'; inp.style.display = 'none'; inp.id = 'cargaFile';
    document.body.appendChild(inp);
    drop.addEventListener('click', function () { inp.value = ''; inp.click(); });
    drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inp.value = ''; inp.click(); } });
    inp.addEventListener('change', function () { leerArchivo(inp.files[0]); });
    drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('drag'); });
    drop.addEventListener('dragleave', function () { drop.classList.remove('drag'); });
    drop.addEventListener('drop', function (e) { e.preventDefault(); drop.classList.remove('drag'); leerArchivo(e.dataTransfer.files[0]); });
    document.getElementById('cargaTipo').addEventListener('dd:change', function () { renderCarga(); paso(1); });
    document.getElementById('cargaNivel').addEventListener('dd:change', function () { renderCarga(); paso(1); });
    document.getElementById('btnPlantilla').onclick = descargarPlantilla;
    document.getElementById('btnEjemplo').onclick = function () { descargarEjemplo(false); };
    document.getElementById('btnEjemploViejo').onclick = function () { descargarEjemplo(true); };
    document.getElementById('cargaCambiar').onclick = function () { carga = null; paso(1); };
    document.getElementById('cargaConfirmar').onclick = confirmarCarga;
    document.getElementById('cargaNueva').onclick = function () { paso(1); };
    document.getElementById('btnReporte').onclick = function () { if (_ultimo) reporte(_ultimo); };
    // Para el recorrido guiado: carga el ejemplo (vigente o anterior) sin pasar por el explorador de archivos.
    window.cargaDemo = function (viejo) {
      var pv = D.plantillaVigente(cat), v = viejo ? 'P' + Math.max(1, parseInt(pv.v.slice(1), 10) - 1) : pv.v;
      procesar(csvDe([[metaPlantilla(v)], colsPlantilla().map(function (c) { return c.key; })].concat(ejemploFilas())), nombreArchivo(viejo ? 'ejemplo-version-anterior' : 'ejemplo', v));
    };
  }

  // ── VERSIONES ──
  function renderVersiones() {
    var pend = cat.cambiosSinVersionar || 0;
    document.getElementById('verAviso').innerHTML = pend
      ? '<div class="naowee-message naowee-message--caution" style="margin-bottom:14px"><div class="naowee-message__header"><span class="naowee-message__icon"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2"><path d="M12 3l9 17H3z"/><path d="M12 9v4M12 17h.01"/></svg></span><div class="naowee-message__body"><b>' + pend + ' cambio' + (pend === 1 ? '' : 's') + ' sin versionar</b> desde ' + cat.versionActiva + '. Están activos en el catálogo, pero no quedan congelados hasta que publiques una nueva versión.</div></div></div>'
      : '';
    var vs = cat.versiones.slice().reverse();
    document.getElementById('verBody').innerHTML = vs.map(function (v) {
      var activa = v.v === cat.versionActiva;
      return '<tr>' +
        '<td data-label="Versión"><b>' + v.v + '</b></td>' +
        '<td data-label="Motivo del cambio">' + esc(v.motivo) + '</td>' +
        '<td data-label="Autor">' + esc(v.autor) + '</td>' +
        '<td data-label="Fecha">' + fdate(v.fecha) + '</td>' +
        '<td data-label="Estado">' + (activa
          ? '<span class="naowee-badge naowee-badge--positive naowee-badge--quiet naowee-badge--small">Activa</span>'
          : '<span class="naowee-badge naowee-badge--neutral naowee-badge--quiet naowee-badge--small">Histórica</span>') + '</td>' +
        '<td data-label="Contenido">' + (activa
          ? '<span style="font-size:12px;color:var(--t-text-2)">en vivo</span>'
          : (v.snapshot
              ? '<button class="naowee-btn naowee-btn--mute naowee-btn--small" onclick="verSnapshot(\'' + v.v + '\')">Ver contenido</button>'
              : '<span style="font-size:12px;color:var(--t-text-2)">sin snapshot</span>')) + '</td>' +
        '</tr>';
    }).join('');
  }
  window.verSnapshot = function (ver) {
    var v = cat.versiones.filter(function (x) { return x.v === ver; })[0];
    if (!v || !v.snapshot) return;
    var s = v.snapshot;
    var tot = s.items.reduce(function (a, it) { return a + (it.valorTotal || 0); }, 0);
    document.getElementById('snapTitle').textContent = 'Contenido congelado · ' + v.v;
    document.getElementById('snapMeta').innerHTML = 'Solo lectura · <b>' + s.niveles.length + ' niveles</b> y <b>' + s.items.length + ' ítems</b> · total ' + D.fmtCOP(tot) + ' · congelado el ' + fdate(v.fecha) + '.';
    document.getElementById('snapNiveles').innerHTML = s.niveles.map(function (n, i) {
      var its = s.items.filter(function (it) { return it.nivelId === n.id; });
      var t = its.reduce(function (a, it) { return a + (it.valorTotal || 0); }, 0);
      return '<tr><td>' + (n.codigo || i + 1) + '</td><td>' + esc(n.nombre) + '</td><td>' + its.length + '</td><td class="tnum">' + D.fmtCOP(t) + '</td></tr>';
    }).join('');
    document.getElementById('snapItems').innerHTML = s.items.map(function (it) {
      return '<tr><td>' + esc(it.cod) + '</td><td>' + esc(it.nombre) + '</td><td>' + esc(it.uni) + '</td><td class="tnum">' + D.fmtCOP(it.valorUnit) + '</td><td class="tnum">' + D.fmtCOP(it.valorTotal) + '</td></tr>';
    }).join('');
    openModal('mSnapshot');
  };
  function createVersion() {
    var el = document.getElementById('verMotivo'), motivo = el.value.trim();
    if (!motivo) { markInvalid(el); el.focus(); return; }
    cat.items.forEach(function (it) { delete it.nuevo; });
    D.nuevaVersion(cat, motivo);
    closeModal('mVersion'); el.value = '';
    renderVersiones(); renderHead(); renderAuditoria(); renderItems();
  }

  // ── AUDITORÍA ──
  // PPTO-20: filtros independientes y combinables (acción, elemento, responsable, rango).
  function audFiltradas() {
    var acc = UI.getDD('audAccion'), elem = UI.getDD('audElemento'), usr = UI.getDD('audUsuario'), r = UI.dpRange('audFecha');
    var todas = D.listAuditoria().filter(function (a) { return a.catId === cat.id; });
    var rows = todas.filter(function (a) {
      return (!acc || a.accion === acc) && (!elem || a.elemento.indexOf(elem + ' ') === 0 || a.elemento === elem) &&
        (!usr || a.responsable === usr) && (!r.desde || a.fecha >= r.desde) && (!r.hasta || a.fecha <= r.hasta);
    });
    return { rows: rows, total: todas.length, filtrado: !!(acc || elem || usr || r.desde) };
  }
  function renderAuditoria() {
    refreshAudAcciones(); refreshAudUsuarios();
    var f = audFiltradas(), rows = f.rows;
    document.getElementById('audCount').innerHTML = f.filtrado ? '<b>' + rows.length + '</b> de ' + f.total + ' registros' : '<b>' + f.total + '</b> registros';
    document.getElementById('audBody').innerHTML = rows.map(function (a) {
      var det = detalleAud(a.detalle);
      return '<tr' + (det ? ' class="t-aud-row" data-aud="' + a.id + '" tabindex="0" aria-expanded="false"' : '') + '>' +
        '<td data-label="Acción">' + (det ? '<span class="t-aud-chev" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 6l6 6-6 6"/></svg></span>' : '<span class="t-aud-chev t-aud-chev--none"></span>') +
          '<span class="naowee-badge naowee-badge--informative naowee-badge--quiet naowee-badge--small">' + esc(a.accion) + '</span></td>' +
        '<td data-label="Elemento">' + esc(a.elemento) + (det ? ' <span class="t-aud-more">· ver detalle</span>' : '') + '</td>' +
        '<td data-label="Responsable">' + esc(a.responsable) + '</td>' +
        '<td data-label="Fecha">' + fdate(a.fecha) + '</td>' +
        '<td data-label="Hora">' + a.hora + '</td></tr>' +
        (det ? '<tr class="t-aud-det" data-aud-det="' + a.id + '" hidden><td colspan="5">' + det + '</td></tr>' : '');
    }).join('');
    document.querySelectorAll('#audBody .t-aud-row').forEach(function (tr) {
      function toggle() {
        var d = document.querySelector('[data-aud-det="' + tr.dataset.aud + '"]'), open = d.hidden;
        d.hidden = !open; tr.setAttribute('aria-expanded', open ? 'true' : 'false'); tr.classList.toggle('open', open);
      }
      tr.onclick = toggle;
      tr.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } };
    });
    var empty = rows.length === 0;
    document.getElementById('audEmpty').classList.toggle('show', empty);
    document.querySelector('#panel-auditoria .naowee-table-wrap').style.display = empty ? 'none' : '';
  }
  // Detalle de una entrada de auditoría: antes/después, motivo o resultado de carga.
  function detalleAud(d) {
    if (!d) return '';
    var out = '';
    if (d.cambios && d.cambios.length) {
      out += '<table class="naowee-table naowee-table--compact t-aud-diff"><thead><tr><th>Campo</th><th>Antes</th><th>Después</th></tr></thead><tbody>' +
        d.cambios.map(function (c) { return '<tr><td>' + esc(c.etiqueta) + '</td><td class="t-aud-old">' + esc(c.antes) + '</td><td><b>' + esc(c.despues) + '</b></td></tr>'; }).join('') + '</tbody></table>';
    }
    if (d.motivo) out += '<div class="t-aud-kv"><b>Motivo:</b> ' + esc(d.motivo) + (d.items != null ? ' · ' + d.items + ' ítems asociados' : '') + '</div>';
    if (d.archivo) out += '<div class="t-aud-kv"><b>Archivo:</b> ' + esc(d.archivo) + ' · ' + (d.ok || 0) + ' procesados · ' + (d.fail || 0) + ' fallidos</div>';
    return out;
  }
  // Las opciones salen de las acciones que ya hay en el historial; se rearman en cada
  // render para que una acción nueva (p. ej. "Desactivar nivel") sea filtrable sin recargar.
  var _audAccKey = null;
  function refreshAudAcciones() {
    var accs = {}; D.listAuditoria().filter(function (a) { return a.catId === cat.id; }).forEach(function (a) { accs[a.accion] = 1; });
    var keys = Object.keys(accs).sort(), k = keys.join('|');
    if (k === _audAccKey) return;
    _audAccKey = k;
    var sel = UI.getDD('audAccion');
    UI.fillDD('audAccion', [{ value: '', label: 'Toda acción' }].concat(keys.map(function (a) { return { value: a, label: a }; })), null);
    UI.setDD('audAccion', accs[sel] ? sel : '', accs[sel] ? sel : 'Toda acción');
  }
  var _audUsrKey = null;
  function refreshAudUsuarios() {
    var us = {}; D.listAuditoria().filter(function (a) { return a.catId === cat.id; }).forEach(function (a) { us[a.responsable] = 1; });
    var keys = Object.keys(us).sort(), k = keys.join('|');
    if (k === _audUsrKey) return;
    _audUsrKey = k;
    var sel = UI.getDD('audUsuario');
    UI.fillDD('audUsuario', [{ value: '', label: 'Todo responsable' }].concat(keys.map(function (u) { return { value: u, label: u }; })), null);
    UI.setDD('audUsuario', us[sel] ? sel : '', us[sel] ? sel : 'Todo responsable');
  }
  function fillAudAcciones() {
    refreshAudAcciones();
    document.getElementById('audAccion').addEventListener('dd:change', renderAuditoria);
  }
  // PPTO-21: exporta lo que se ve (con los filtros aplicados), en Excel, PDF o CSV; el
  // nombre lleva la fecha de generación y la exportación queda en la propia auditoría.
  function exportAud(formato) {
    var f = audFiltradas();
    if (!f.rows.length) { UI.toast('No hay registros para exportar con los filtros aplicados.', 'caution'); return; }
    var r = UI.dpRange('audFecha'), filtros = [];
    if (UI.getDD('audAccion')) filtros.push('acción: ' + UI.getDD('audAccion'));
    if (UI.getDD('audElemento')) filtros.push('elemento: ' + UI.getDD('audElemento'));
    if (UI.getDD('audUsuario')) filtros.push('responsable: ' + UI.getDD('audUsuario'));
    if (r.desde) filtros.push('fechas: ' + fdate(r.desde) + ' a ' + fdate(r.hasta || r.desde));
    var archivo = UI.exportar({
      formato: formato, nombre: 'auditoria-' + slug(cat.nombre),
      titulo: 'Historial de auditoría · ' + cat.nombre,
      meta: ['Generado el ' + fdate(D.hoy()) + ' a las ' + new Date().toTimeString().slice(0, 5) + ' por ' + D.usuarioActual(),
             'Filtros: ' + (filtros.length ? filtros.join(' · ') : 'ninguno') + ' · ' + f.rows.length + ' de ' + f.total + ' registros'],
      columnas: ['Catálogo', 'Acción', 'Elemento', 'Responsable', 'Fecha', 'Hora', 'Detalle'],
      filas: f.rows.map(function (a) {
        var d = a.detalle || {}, det = (d.cambios || []).map(function (c) { return c.etiqueta + ': ' + c.antes + ' → ' + c.despues; });
        if (d.motivo) det.push('Motivo: ' + d.motivo);
        if (d.archivo) det.push('Archivo: ' + d.archivo);
        return [a.catNombre, a.accion, a.elemento, a.responsable, fdate(a.fecha), a.hora, det.join(' · ')];
      })
    });
    if (!archivo) return;
    D.logAudit(cat, 'Exportar historial', 'Auditoría · ' + formato.toUpperCase(), null, { archivo: archivo, ok: f.rows.length, fail: 0 });
    renderAuditoria();
    UI.toast('Exportado: ' + esc(archivo));
  }

  function slug(s) { return (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase(); }


  document.addEventListener('DOMContentLoaded', function () {
    loadCat();
    document.getElementById('btnVolver').href = 'catalogos.html?role=' + ((window.OBRAS_SHELL || {}).role || 'ADMIN');
    // Solo rol, proyecto y el catálogo a editar: no arrastra ?tour= ni ?cat= a la otra pantalla.
    var qEd = new URLSearchParams({ role: (window.OBRAS_SHELL || {}).role || 'ADMIN', edit: cat.id });
    var proy = qs('proyecto'); if (proy) qEd.set('proyecto', proy);
    document.getElementById('btnEditarCat').href = 'catalogos.html?' + qEd.toString();
    renderHead(); renderNiveles(); renderItems(); initCarga(); renderVersiones();
    fillAudAcciones(); renderAuditoria();
    soloNumeros(document.getElementById('nvOrden'));
    soloNumeros(document.getElementById('nvValorFijo'));

    document.getElementById('btnNivel').onclick = function () { openNivel(null); };
    document.getElementById('nvGuardar').onclick = saveNivel;
    document.getElementById('nvValorTipo').addEventListener('dd:change', function (e) { valorCfg(e.detail.value); });
    document.getElementById('nvAdmiteItems').onclick = function () { setSwitch('nvAdmiteItems', !getSwitch('nvAdmiteItems')); toggleCamposWrap(); };
    document.getElementById('nvAddBtn').onclick = function () {
      var f = document.getElementById('nvAddForm');
      f.classList.toggle('open');
      if (f.classList.contains('open')) document.getElementById('nvAddIn').focus();
    };
    document.getElementById('nvAddOk').onclick = addCampo;
    var reqBox = document.getElementById('nvAddReq');
    function toggleReq() { var on = reqBox.classList.toggle('naowee-checkbox--checked'); reqBox.setAttribute('aria-checked', on ? 'true' : 'false'); }
    reqBox.onclick = toggleReq;
    reqBox.onkeydown = function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleReq(); } };
    document.getElementById('nvAddIn').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); addCampo(); } });
    document.getElementById('motivoConfirm').onclick = confirmDesactivar;

    document.getElementById('btnItem').onclick = function () { openItem(null); };
    document.getElementById('itGuardar').onclick = saveItem;
    document.getElementById('itSearch').addEventListener('input', renderItems);
    // Cambiar de nivel re-arma el formulario con los campos del nuevo nivel, pero conserva
    // lo ya escrito en los campos que ambos niveles comparten.
    document.getElementById('itNivel').addEventListener('dd:change', function (e) { renderItemFields(e.detail.value, leerItemForm()); });

    document.getElementById('btnVersion').onclick = function () { clearInvalid('#mVersion'); openModal('mVersion'); };
    document.getElementById('verGuardar').onclick = createVersion;

    document.getElementById('audElemento').addEventListener('dd:change', renderAuditoria);
    document.getElementById('audUsuario').addEventListener('dd:change', renderAuditoria);
    document.getElementById('audFecha').addEventListener('dp:change', renderAuditoria);
    document.getElementById('btnLimpiar').onclick = function () {
      UI.setDD('audAccion', '', 'Toda acción'); UI.setDD('audElemento', '', 'Todo elemento'); UI.setDD('audUsuario', '', 'Todo responsable'); UI.dpSet('audFecha', '');
      renderAuditoria();
    };
    document.getElementById('btnExport').onclick = function (e) { openRowMenu(e, 'exportar', null); };

    document.getElementById('nvFiltroEstado').addEventListener('dd:change', renderNiveles);
    document.getElementById('itFiltroTipo').addEventListener('dd:change', renderItems);
    document.getElementById('itFiltroNivel').addEventListener('dd:change', renderItems);
    document.getElementById('itGuardarOtro').onclick = function () { saveItem(true); };
    document.getElementById('nvAddTipo').addEventListener('dd:change', function (e) {
      var o = document.getElementById('nvAddOpc'); o.style.display = e.detail.value === 'lista' ? '' : 'none';
      if (e.detail.value === 'lista') o.focus();
    });
  });
})();
