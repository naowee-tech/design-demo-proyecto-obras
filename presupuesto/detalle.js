/* ============================================================================
 * Proyecto de Obras — Detalle de catálogo (Estructura · Ítems · Carga · Versiones · Auditoría)
 * HU PPTO-04..16, 19..21. Componentes del espejo: .naowee-tabs/.t-panel,
 * .naowee-table + .t-kebab/.t-rowmenu, .t-empty/.t-icontile, .t-drop, .vg-card,
 * .t-esq-panel/.t-esq-chips/.t-esq-add (configurador de campos del ítem).
 * ========================================================================== */
(function () {
  'use strict';
  var D = window.OBRAS, UI = window.OBRAS_UI;
  function qs(k) { return new URLSearchParams(location.search).get(k); }
  function esc(s) { return (s || '').toString().replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fdate(iso) { if (!iso) return '—'; var p = iso.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  function slugKey(s) { return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '').toLowerCase() || ('c' + Date.now()); }

  var cat = null, nivelEditId = null, nivelDesId = null, itemEditId = null, camposDraft = [];
  var badgeMap = { Activo: 'positive', Borrador: 'caution', Inactivo: 'neutral' };
  var STD = { cod: 1, nombre: 1, uni: 1, cantidad: 1, valorUnit: 1 };

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
    return esc(v);
  }

  // ── Cabecera ──
  function renderHead() {
    var IC_MONEY = '<svg viewBox="0 0 24 24"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
    var IC_LIST = '<svg viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>';
    document.getElementById('kpiWrap').innerHTML =
      '<div class="t-kpi"><div class="kpi-ic">' + IC_MONEY + '</div><div><div class="kpi-l">Valor total del catálogo</div><div class="kpi-v">' + D.fmtCOP(D.totalCatalogo(cat)) + '</div></div></div>' +
      '<div class="t-kpi"><div class="kpi-ic">' + IC_LIST + '</div><div><div class="kpi-l">Ítems</div><div class="kpi-v">' + cat.items.length + '</div></div></div>';
    document.getElementById('pageTitle').textContent = cat.nombre;
    document.getElementById('catName').textContent = cat.nombre;
    document.getElementById('catMeta').textContent = 'Condición de aplicación: ' + cat.region + ' · Vigencia ' + fdate(cat.vigenciaIni) + ' → ' + fdate(cat.vigenciaFin);
    document.getElementById('catChips').innerHTML =
      '<span class="naowee-badge naowee-badge--informative naowee-badge--quiet naowee-badge--small">' + cat.versionActiva + '</span>' +
      '<span class="naowee-badge naowee-badge--' + (badgeMap[cat.estado] || 'neutral') + ' naowee-badge--quiet naowee-badge--small">' + cat.estado + '</span>' +
      '<span class="t-esq-chip">' + cat.niveles.filter(function (n) { return n.activo; }).length + ' niveles</span>';
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
  var MENUS = {
    nivel: '<button class="naowee-menu__item" role="menuitem" id="rmNivelEdit" onclick="rowAct(\'nivel-edit\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>Editar nivel</button>' +
           '<button class="naowee-menu__item" role="menuitem" id="rmNivelAdd" onclick="rowAct(\'nivel-add-item\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>Agregar ítem</button>' +
           '<button class="naowee-menu__item" role="menuitem" id="rmNivelOff" onclick="rowAct(\'nivel-off\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64A9 9 0 1 1 5.64 6.64M12 2v10"/></svg>Desactivar nivel</button>',
    item:  '<button class="naowee-menu__item" role="menuitem" id="rmItemEdit" onclick="rowAct(\'item-edit\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>Editar ítem</button>'
  };
  window.openRowMenu = function (e, kind, id) {
    e.stopPropagation();
    rowId = id;
    var menu = document.getElementById('rowMenu');
    document.getElementById('rowMenuList').innerHTML = MENUS[kind] || '';
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
  };
  document.addEventListener('click', closeRowMenu);
  window.addEventListener('scroll', closeRowMenu, true);
  function kebab(kind, id, label) {
    return '<button class="t-kebab" aria-label="' + label + '" aria-haspopup="menu" onclick="openRowMenu(event,\'' + kind + '\',\'' + id + '\')"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg></button>';
  }

  // ── ESTRUCTURA ──
  function renderNiveles() {
    var ns = cat.niveles.slice().sort(function (a, b) { return a.orden - b.orden; });
    document.getElementById('nivelBody').innerHTML = ns.map(function (n, i) {
      var valor = n.valorTipo === 'formula' ? 'Fórmula' : n.valorTipo === 'fijo' ? D.fmtCOP(n.valorFijo) : 'Sin valor';
      var nc = camposDe(n).length;
      return '<tr>' +
        '<td data-label="#">' + (n.codigo || (i + 1)) + '</td>' +
        '<td data-label="Nivel"><span class="t-cname" title="' + esc(n.nombre) + '">' + esc(n.nombre) + '</span></td>' +
        '<td data-label="Valor">' + valor + '</td>' +
        '<td data-label="Campos">' + (n.admiteItems ? nc + ' campos' : '—') + '</td>' +
        '<td data-label="Ítems">' + (n.admiteItems ? itemsDe(n.id).length : '—') + '</td>' +
        '<td data-label="Estado">' + (n.activo
          ? '<span class="naowee-badge naowee-badge--positive naowee-badge--quiet naowee-badge--small">Activo</span>'
          : '<span class="naowee-badge naowee-badge--neutral naowee-badge--quiet naowee-badge--small">Inactivo</span>') + '</td>' +
        '<td data-label="Total" class="tnum">' + D.fmtCOP(nivelTotal(n)) + '</td>' +
        '<td data-label="Acciones">' + kebab('nivel', n.id, 'Acciones del nivel') + '</td>' +
        '</tr>';
    }).join('');
    var empty = ns.length === 0;
    document.getElementById('nivelEmpty').classList.toggle('show', empty);
    document.getElementById('nivelList').style.display = empty ? 'none' : '';
  }

  function setSwitch(id, on) { var s = document.getElementById(id); s.classList.toggle('naowee-switch--on', on); s.setAttribute('aria-checked', on ? 'true' : 'false'); }
  function getSwitch(id) { return document.getElementById(id).classList.contains('naowee-switch--on'); }
  function valorCfg(tipo) {
    document.getElementById('nvFijoWrap').style.display = tipo === 'fijo' ? '' : 'none';
    document.getElementById('nvFormulaWrap').style.display = tipo === 'formula' ? '' : 'none';
  }

  // PPTO-09 · configurador de campos del ítem
  function renderCampos() {
    document.getElementById('nvCampos').innerHTML = camposDraft.map(function (c, i) {
      return '<span class="t-esq-chip">' + esc(c.label) +
        (c.req ? '<span class="req">*</span>' : '') +
        (c.core ? '' : '<button type="button" class="x" data-i="' + i + '" aria-label="Quitar ' + esc(c.label) + '">&times;</button>') +
        '</span>';
    }).join('') || '<span class="t-esq-empty">Sin campos configurados.</span>';
    document.getElementById('nvCampos').querySelectorAll('.x').forEach(function (b) {
      b.onclick = function (e) { e.stopPropagation(); camposDraft.splice(+b.dataset.i, 1); renderCampos(); };
    });
  }
  function toggleCamposWrap() {
    document.getElementById('camposWrap').style.display = getSwitch('nvAdmiteItems') ? '' : 'none';
  }
  function addCampo() {
    var inp = document.getElementById('nvAddIn');
    var label = inp.value.trim();
    if (!label) { inp.focus(); return; }
    var key = slugKey(label);
    if (camposDraft.some(function (c) { return c.key === key; })) { inp.select(); return; }
    camposDraft.push({ key: key, label: label, tipo: UI.getDD('nvAddTipo') || 'texto', req: false, core: false });
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
    document.getElementById('nvNombre').closest('.naowee-textfield__input-wrap').classList.remove('t-invalid');
    openModal('mNivel');
  }
  function saveNivel() {
    var el = document.getElementById('nvNombre'), nombre = el.value.trim();
    if (!nombre) { el.closest('.naowee-textfield__input-wrap').classList.add('t-invalid'); el.focus(); return; }
    var tipo = UI.getDD('nvValorTipo') || 'formula';
    var admite = getSwitch('nvAdmiteItems');
    var data = {
      nombre: nombre, orden: parseInt(document.getElementById('nvOrden').value, 10) || 1,
      descripcion: document.getElementById('nvDesc').value.trim(), valorTipo: tipo,
      valorFijo: tipo === 'fijo' ? (parseFloat(document.getElementById('nvValorFijo').value) || 0) : null,
      formula: tipo === 'formula' ? document.getElementById('nvFormula').value.trim() : null,
      admiteItems: admite, campos: admite ? camposDraft.slice() : [], activo: true
    };
    if (nivelEditId) {
      var n = nivelById(nivelEditId);
      Object.keys(data).forEach(function (k) { n[k] = data[k]; });
      D.logAudit(cat, 'Editar nivel', 'Nivel · ' + nombre, 'Jesús Díaz');
    } else {
      data.id = 'nv-' + slugKey(nombre) + '-' + cat.niveles.length;
      data.codigo = String(data.orden);
      cat.niveles.push(data);
      D.logAudit(cat, 'Crear nivel', 'Nivel · ' + nombre, 'Jesús Díaz');
    }
    D.saveCatalogo(cat); closeModal('mNivel');
    renderNiveles(); renderItems(); renderHead(); renderAuditoria();
  }
  function openDesactivar(id) {
    nivelDesId = id;
    var n = nivelById(id), cnt = itemsDe(id).length;
    document.getElementById('motivoWarn').innerHTML = cnt
      ? 'El nivel <b>' + esc(n.nombre) + '</b> tiene <b>' + cnt + ' ítems</b> asociados. Se retira de la estructura pero se conserva la trazabilidad.'
      : 'El nivel <b>' + esc(n.nombre) + '</b> se retira de la estructura. Se conserva la trazabilidad.';
    document.getElementById('motivoTxt').value = '';
    document.getElementById('motivoTxt').closest('.naowee-textfield__input-wrap').classList.remove('t-invalid');
    openModal('mMotivo');
  }
  function confirmDesactivar() {
    var el = document.getElementById('motivoTxt'), motivo = el.value.trim();
    if (!motivo) { el.closest('.naowee-textfield__input-wrap').classList.add('t-invalid'); el.focus(); return; }
    var n = nivelById(nivelDesId);
    n.activo = false; n.motivoBaja = motivo;
    D.saveCatalogo(cat); D.logAudit(cat, 'Desactivar nivel', 'Nivel · ' + n.nombre, 'Jesús Díaz');
    closeModal('mMotivo'); renderNiveles(); renderItems(); renderHead(); renderAuditoria();
  }

  // ── ÍTEMS ──
  // Columnas de la tabla = unión de los campos configurados en los niveles activos.
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
    var cols = tableCampos();
    document.getElementById('itemHead').innerHTML =
      '<tr><th>Código</th><th>Ítem</th><th>Nivel</th>' +
      cols.map(function (c) { return '<th>' + esc(c.label) + '</th>'; }).join('') +
      '<th>V. total</th><th>Acciones</th></tr>';

    var q = (document.getElementById('itSearch').value || '').toLowerCase();
    var rows = cat.items.filter(function (it) {
      return !q || it.nombre.toLowerCase().indexOf(q) >= 0 || (it.cod || '').toLowerCase().indexOf(q) >= 0;
    });
    document.getElementById('itemsBody').innerHTML = rows.map(function (it) {
      var n = nivelById(it.nivelId);
      return '<tr>' +
        '<td data-label="Código">' + esc(it.cod) + '</td>' +
        '<td data-label="Ítem"><span class="t-cname" title="' + esc(it.nombre) + '">' + esc(it.nombre) + '</span></td>' +
        '<td data-label="Nivel">' + esc(n ? n.nombre : '—') + '</td>' +
        cols.map(function (c) {
          var v = itemVal(it, c.key);
          var num = (c.tipo === 'moneda' || c.tipo === 'numero');
          return '<td data-label="' + esc(c.label) + '"' + (num ? ' class="tnum"' : '') + '>' + fmtCampo(c, v) + '</td>';
        }).join('') +
        '<td data-label="V. total" class="tnum">' + D.fmtCOP(it.valorTotal) + '</td>' +
        '<td data-label="Acciones">' + kebab('item', it.id, 'Acciones del ítem') + '</td>' +
        '</tr>';
    }).join('');
    var empty = rows.length === 0;
    document.getElementById('itemEmpty').classList.toggle('show', empty);
    document.getElementById('itemList').style.display = empty ? 'none' : '';
  }

  function fillNivelDD() {
    var activos = cat.niveles.filter(function (n) { return n.activo && n.admiteItems; }).map(function (n) { return { value: n.id, label: n.nombre }; });
    UI.fillDD('itNivel', activos, 'Seleccione una opción');
  }
  // Genera los inputs del ítem a partir de los campos del nivel (PPTO-09/10)
  function renderItemFields(nivelId, it) {
    var grid = document.getElementById('itGrid');
    grid.querySelectorAll('[data-campo]').forEach(function (e) { e.remove(); });
    var n = nivelById(nivelId);
    document.getElementById('itHint').style.display = n ? 'none' : '';
    if (!n) return;
    camposDe(n).forEach(function (c) {
      var v = it ? itemVal(it, c.key) : '';
      var wide = (c.key === 'nombre');
      var type = (c.tipo === 'numero' || c.tipo === 'moneda') ? 'number' : 'text';
      var div = document.createElement('div');
      div.className = 'naowee-textfield' + (wide ? ' t-col-full' : '');
      div.setAttribute('data-campo', c.key);
      div.innerHTML = '<label class="naowee-textfield__label' + (c.req ? ' naowee-textfield__label--required' : '') + '">' + esc(c.label) + (c.tipo === 'moneda' ? ' (COP)' : '') + '</label>' +
        '<div class="naowee-textfield__input-wrap"><input class="naowee-textfield__input" id="itf-' + c.key + '" type="' + type + '" value="' + (v == null ? '' : esc(v)) + '"></div>';
      grid.appendChild(div);
    });
    var f = document.createElement('div');
    f.className = 'naowee-textfield t-col-full'; f.setAttribute('data-campo', '__formula');
    f.innerHTML = '<label class="naowee-textfield__label">Fórmula (opcional)</label>' +
      '<div class="naowee-textfield__input-wrap"><input class="naowee-textfield__input" id="itFormula" placeholder="cantidad × valor unitario" value="' + (it && it.formula ? esc(it.formula) : '') + '"></div>';
    grid.appendChild(f);
  }
  function openItem(id, presetNivel) {
    itemEditId = id || null;
    fillNivelDD();
    var it = id ? cat.items.filter(function (x) { return x.id === id; })[0] : null;
    document.getElementById('mItemTitle').textContent = it ? 'Editar ítem' : 'Nuevo ítem';
    document.getElementById('itemError').style.display = 'none';
    var nivelId = it ? it.nivelId : (presetNivel || '');
    if (nivelId) { var n = nivelById(nivelId); UI.setDD('itNivel', nivelId, n ? n.nombre : ''); }
    else { UI.setDD('itNivel', '', 'Seleccione una opción'); document.getElementById('itNivel').querySelector('.naowee-dropdown__value').classList.add('naowee-dropdown__placeholder'); }
    renderItemFields(nivelId, it);
    openModal('mItem');
  }
  function saveItem() {
    var nivelId = UI.getDD('itNivel');
    if (!nivelId) { document.getElementById('itemErrorMsg').textContent = 'Selecciona el nivel del ítem.'; document.getElementById('itemError').style.display = ''; return; }
    var n = nivelById(nivelId), campos = camposDe(n);
    var vals = {}, faltan = [];
    campos.forEach(function (c) {
      var el = document.getElementById('itf-' + c.key);
      var raw = el ? el.value.trim() : '';
      if (c.req && !raw) faltan.push(c.label);
      vals[c.key] = (c.tipo === 'numero' || c.tipo === 'moneda') ? (raw === '' ? null : parseFloat(raw)) : raw;
      if (el) el.closest('.naowee-textfield__input-wrap').classList.toggle('t-invalid', !!(c.req && !raw));
    });
    if (faltan.length) {
      document.getElementById('itemErrorMsg').textContent = 'Campos obligatorios sin diligenciar: ' + faltan.join(', ') + '.';
      document.getElementById('itemError').style.display = ''; return;
    }
    var cant = vals.cantidad == null ? 1 : vals.cantidad;
    var vu = vals.valorUnit == null ? 0 : vals.valorUnit;
    var extra = {};
    campos.forEach(function (c) { if (!STD[c.key]) extra[c.key] = vals[c.key]; });
    var data = {
      nivelId: nivelId, cod: vals.cod || '', nombre: vals.nombre || '', uni: vals.uni || '',
      tipo: 'Producto', cantidad: cant, valorUnit: vu, extra: extra,
      formula: (document.getElementById('itFormula') || {}).value ? document.getElementById('itFormula').value.trim() : null,
      valorTotal: Math.round(vu * cant)
    };
    if (itemEditId) {
      var it = cat.items.filter(function (x) { return x.id === itemEditId; })[0];
      Object.keys(data).forEach(function (k) { it[k] = data[k]; });
      D.logAudit(cat, 'Editar ítem', 'Ítem · ' + data.cod, 'Jesús Díaz');
    } else {
      data.id = 'it-' + slugKey(data.cod) + '-' + cat.items.length;
      cat.items.push(data);
      D.logAudit(cat, 'Crear ítem', 'Ítem · ' + data.cod, 'Jesús Díaz');
    }
    D.saveCatalogo(cat); closeModal('mItem');
    renderItems(); renderNiveles(); renderHead(); renderAuditoria();
  }

  // ── CARGA MASIVA ──
  function vgCard(kind, label, value, icon) {
    return '<div class="vg-card ' + kind + '"><div class="vg-ic">' + icon + '</div><div><div class="vg-l">' + label + '</div><div class="vg-v">' + value + '</div></div></div>';
  }
  function renderCargaResult(det, ok, fail) {
    var IC_FILE = '<svg viewBox="0 0 24 24"><path d="M14 3v5h5"/><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>';
    var IC_OK = '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>';
    var IC_ERR = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>';
    document.getElementById('cargaResult').innerHTML =
      vgCard('neutral', 'Detectados', det, IC_FILE) + vgCard('ok', 'Procesados', ok, IC_OK) + vgCard('rech', 'Fallidos', fail, IC_ERR);
    var motivos = ['Unidad no reconocida', 'Valor unitario vacío', 'Nivel inexistente'];
    var rows = '';
    for (var i = 0; i < fail; i++) rows += '<tr><td data-label="Registro">fila ' + (det - fail + i + 1) + '</td><td data-label="Motivo">' + motivos[i % motivos.length] + '</td></tr>';
    var w = document.getElementById('cargaErrWrap');
    w.innerHTML = fail ? '<table class="naowee-table"><thead><tr><th>Registro</th><th>Motivo del error</th></tr></thead><tbody>' + rows + '</tbody></table>' : '';
    w.style.display = fail ? '' : 'none';
  }
  function simulateCarga() {
    var det = 20, fail = 2, ok = det - fail;
    document.getElementById('cargaPrev').innerHTML =
      '<div class="naowee-message naowee-message--informative" style="margin:14px 0"><div class="naowee-message__header"><span class="naowee-message__icon"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/></svg></span><div class="naowee-message__body">Vista previa: <b>' + det + ' ítems</b> detectados. Archivo válido para la versión <b>' + cat.versionActiva + '</b> de la plantilla.</div></div></div>';
    renderCargaResult(det, ok, fail);
    D.logAudit(cat, 'Carga masiva', 'Ítems · ' + ok + ' procesados', 'Jesús Díaz');
    renderAuditoria();
  }
  function initCarga() {
    renderCargaResult(20, 18, 2);
    var drop = document.getElementById('cargaDrop');
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.xlsx,.csv'; inp.style.display = 'none';
    document.body.appendChild(inp);
    drop.addEventListener('click', function () { inp.click(); });
    drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inp.click(); } });
    inp.addEventListener('change', simulateCarga);
    drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('drag'); });
    drop.addEventListener('dragleave', function () { drop.classList.remove('drag'); });
    drop.addEventListener('drop', function (e) { e.preventDefault(); drop.classList.remove('drag'); simulateCarga(); });
    // La plantilla se genera con los campos configurados en los niveles (PPTO-12)
    document.getElementById('btnPlantilla').onclick = function () {
      var cols = ['nivel', 'cod', 'nombre'].concat(tableCampos().map(function (c) { return c.key; }));
      downloadFile('plantilla-' + slug(cat.nombre) + '-' + cat.versionActiva + '.csv', cols.join(',') + '\n');
    };
  }

  // ── VERSIONES ──
  function renderVersiones() {
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
        '</tr>';
    }).join('');
  }
  function createVersion() {
    var el = document.getElementById('verMotivo'), motivo = el.value.trim();
    if (!motivo) { el.closest('.naowee-textfield__input-wrap').classList.add('t-invalid'); el.focus(); return; }
    var cur = cat.versionActiva.replace('v', '').split('.').map(Number);
    var next = 'v' + cur[0] + '.' + (cur[1] + 1);
    cat.versiones.push({ v: next, motivo: motivo, autor: 'Jesús Díaz', fecha: new Date().toISOString().slice(0, 10) });
    cat.versionActiva = next;
    D.saveCatalogo(cat); D.logAudit(cat, 'Crear versión', 'Versión · ' + next, 'Jesús Díaz');
    closeModal('mVersion'); el.value = '';
    renderVersiones(); renderHead(); renderAuditoria();
  }

  // ── AUDITORÍA ──
  function renderAuditoria() {
    var acc = UI.getDD('audAccion'), elem = UI.getDD('audElemento'), fecha = UI.dpGet('audFecha');
    var rows = D.listAuditoria().filter(function (a) { return a.catId === cat.id; })
      .filter(function (a) { return (!acc || a.accion === acc) && (!elem || a.elemento.indexOf(elem) === 0) && (!fecha || a.fecha === fecha); });
    document.getElementById('audBody').innerHTML = rows.map(function (a) {
      return '<tr>' +
        '<td data-label="Acción"><span class="naowee-badge naowee-badge--informative naowee-badge--quiet naowee-badge--small">' + esc(a.accion) + '</span></td>' +
        '<td data-label="Elemento">' + esc(a.elemento) + '</td>' +
        '<td data-label="Responsable">' + esc(a.responsable) + '</td>' +
        '<td data-label="Fecha">' + fdate(a.fecha) + '</td>' +
        '<td data-label="Hora">' + a.hora + '</td></tr>';
    }).join('');
    var empty = rows.length === 0;
    document.getElementById('audEmpty').classList.toggle('show', empty);
    document.querySelector('#panel-auditoria .naowee-table-wrap').style.display = empty ? 'none' : '';
  }
  function fillAudAcciones() {
    var accs = {}; D.listAuditoria().filter(function (a) { return a.catId === cat.id; }).forEach(function (a) { accs[a.accion] = 1; });
    UI.fillDD('audAccion', [{ value: '', label: 'Toda acción' }].concat(Object.keys(accs).map(function (a) { return { value: a, label: a }; })), null);
    UI.setDD('audAccion', '', 'Toda acción');
    document.getElementById('audAccion').addEventListener('dd:change', renderAuditoria);
  }
  function exportAud() {
    var rows = D.listAuditoria().filter(function (a) { return a.catId === cat.id; });
    var csv = 'accion,elemento,responsable,fecha,hora\n' + rows.map(function (a) { return [a.accion, a.elemento, a.responsable, a.fecha, a.hora].map(function (x) { return '"' + (x || '') + '"'; }).join(','); }).join('\n');
    downloadFile('auditoria-' + slug(cat.nombre) + '.csv', csv);
  }

  function slug(s) { return (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase(); }
  function downloadFile(name, content) {
    try {
      var blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    } catch (e) {}
  }

  document.addEventListener('DOMContentLoaded', function () {
    loadCat();
    document.getElementById('btnVolver').href = 'catalogos.html?role=' + ((window.OBRAS_SHELL || {}).role || 'ADMIN');
    renderHead(); renderNiveles(); renderItems(); initCarga(); renderVersiones();
    fillAudAcciones(); renderAuditoria();

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
    document.getElementById('nvAddIn').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); addCampo(); } });
    document.getElementById('motivoConfirm').onclick = confirmDesactivar;

    document.getElementById('btnItem').onclick = function () { openItem(null); };
    document.getElementById('itGuardar').onclick = saveItem;
    document.getElementById('itSearch').addEventListener('input', renderItems);
    document.getElementById('itNivel').addEventListener('dd:change', function (e) { renderItemFields(e.detail.value, null); });

    document.getElementById('btnVersion').onclick = function () { openModal('mVersion'); };
    document.getElementById('verGuardar').onclick = createVersion;

    document.getElementById('audElemento').addEventListener('dd:change', renderAuditoria);
    document.getElementById('audFecha').addEventListener('dp:change', renderAuditoria);
    document.getElementById('btnLimpiar').onclick = function () {
      UI.setDD('audAccion', '', 'Toda acción'); UI.setDD('audElemento', '', 'Todo elemento'); UI.dpSet('audFecha', '');
      renderAuditoria();
    };
    document.getElementById('btnExport').onclick = exportAud;
  });
})();
