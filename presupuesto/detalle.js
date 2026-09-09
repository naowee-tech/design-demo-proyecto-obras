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
  var STD = { cod: 1, nombre: 1, uni: 1, cantidad: 1, valorUnit: 1 };
  var NUMERICO = { numero: 1, moneda: 1 };

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
  // Toda mutación cuenta como cambio pendiente de publicar (versionamiento manual).
  function tocado() { D.marcarCambio(cat); renderVersiones(); }

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
      return '<tr>' +
        '<td data-label="#">' + (n.codigo || (i + 1)) + '</td>' +
        '<td data-label="Nivel"><span class="t-cname" title="' + esc(n.nombre) + '">' + esc(n.nombre) + '</span></td>' +
        '<td data-label="Valor">' + valor + '</td>' +
        '<td data-label="Campos">' + (n.admiteItems ? camposDe(n).length + ' campos' : '—') + '</td>' +
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
  var TIPO_LBL = { texto: 'texto', numero: 'número', moneda: 'moneda', unidad: 'unidad' };
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
  function toggleCamposWrap() { document.getElementById('camposWrap').style.display = getSwitch('nvAdmiteItems') ? '' : 'none'; }
  function addCampo() {
    var inp = document.getElementById('nvAddIn'), label = inp.value.trim();
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
    clearInvalid('#mNivel');
    openModal('mNivel');
  }
  function saveNivel() {
    var el = document.getElementById('nvNombre'), nombre = el.value.trim();
    if (!nombre) { markInvalid(el); el.focus(); return; }
    var tipo = UI.getDD('nvValorTipo') || 'formula';
    var admite = getSwitch('nvAdmiteItems');
    var data = {
      nombre: nombre, orden: parseInt(document.getElementById('nvOrden').value, 10) || 1,
      descripcion: document.getElementById('nvDesc').value.trim(), valorTipo: tipo,
      valorFijo: tipo === 'fijo' ? (num(document.getElementById('nvValorFijo').value) || 0) : null,
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
    D.saveCatalogo(cat); D.logAudit(cat, 'Desactivar nivel', 'Nivel · ' + n.nombre, 'Jesús Díaz');
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
      div.setAttribute('data-campo', c.key);

      if (c.tipo === 'unidad') {
        div.className = wide ? 't-col-full' : '';
        div.innerHTML = '<label class="naowee-textfield__label' + (c.req ? ' naowee-textfield__label--required' : '') + '" style="display:block;margin-bottom:6px">' + esc(c.label) + '</label>' +
          '<div class="naowee-dropdown" id="itf-' + c.key + '" data-search style="width:100%">' + DD_TRIGGER + '</div>';
        grid.appendChild(div);
        UI.fillDD('itf-' + c.key, D.UNIDADES, 'Selecciona unidad');
        if (v) UI.setDD('itf-' + c.key, v, v);
      } else {
        div.className = 'naowee-textfield' + (wide ? ' t-col-full' : '');
        div.innerHTML = '<label class="naowee-textfield__label' + (c.req ? ' naowee-textfield__label--required' : '') + '">' + esc(c.label) + (c.tipo === 'moneda' ? ' (COP)' : '') + '</label>' +
          '<div class="naowee-textfield__input-wrap"><input class="naowee-textfield__input" id="itf-' + c.key + '" type="text" value="' + (v == null ? '' : esc(v)) + '"></div>';
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
    clearInvalid('#mItem');
    openModal('mItem');
  }

  function saveItem() {
    var nivelId = UI.getDD('itNivel');
    var err = document.getElementById('itemError'), msg = document.getElementById('itemErrorMsg');
    if (!nivelId) { msg.textContent = 'Selecciona el nivel del ítem.'; err.style.display = ''; return; }
    var n = nivelById(nivelId), campos = camposDe(n);
    var vals = {}, faltan = [], malos = [];
    clearInvalid('#mItem');

    campos.forEach(function (c) {
      if (c.tipo === 'unidad') {
        var uv = UI.getDD('itf-' + c.key);
        if (c.req && !uv) faltan.push(c.label);
        vals[c.key] = uv; return;
      }
      var el = document.getElementById('itf-' + c.key);
      var raw = el ? el.value.trim() : '';
      if (c.req && !raw) { faltan.push(c.label); if (el) markInvalid(el); return; }
      if (NUMERICO[c.tipo] && raw !== '' && num(raw) == null) { malos.push(c.label); if (el) markInvalid(el); return; }
      vals[c.key] = NUMERICO[c.tipo] ? (raw === '' ? null : num(raw)) : raw;
    });

    if (faltan.length || malos.length) {
      msg.textContent = (faltan.length ? 'Campos obligatorios sin diligenciar: ' + faltan.join(', ') + '. ' : '') +
                        (malos.length ? 'Estos campos solo aceptan números: ' + malos.join(', ') + '.' : '');
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
      tipo: 'Producto', cantidad: cant, valorUnit: vu, extra: extra,
      formula: (document.getElementById('itFormula') || {}).value ? document.getElementById('itFormula').value.trim() : null,
      valorTotal: totalManual != null ? Math.round(totalManual) : Math.round(vu * cant)
    };

    if (itemEditId) {
      var it = cat.items.filter(function (x) { return x.id === itemEditId; })[0];
      Object.keys(data).forEach(function (k) { it[k] = data[k]; });
      D.logAudit(cat, 'Editar ítem', 'Ítem · ' + data.cod, 'Jesús Díaz');
    } else {
      data.id = 'it-' + slugKey(data.cod) + '-' + cat.items.length;
      data.nuevo = true;
      cat.items.unshift(data);   // los nuevos se listan de primeros
      D.logAudit(cat, 'Crear ítem', 'Ítem · ' + data.cod, 'Jesús Díaz');
    }
    D.saveCatalogo(cat); closeModal('mItem'); tocado();
    renderItems(); renderNiveles(); renderHead(); renderAuditoria();
  }

  // ── CARGA MASIVA (simulada) ──
  var PLANTILLAS = {
    items:   { label: 'Ítems del catálogo', cols: function () { return ['nivel', 'codigo', 'nombre'].concat(tableCampos().map(function (c) { return c.key; })); },
               motivos: ['Unidad no reconocida', 'Valor unitario vacío', 'Nivel inexistente'], sujeto: 'ítems' },
    niveles: { label: 'Estructura (niveles)', cols: function () { return ['codigo', 'nombre', 'orden', 'admite_items', 'tipo_valor', 'formula']; },
               motivos: ['Orden duplicado', 'tipo_valor no válido (usa fijo/formula/ninguno)', 'Nombre repetido en el mismo padre'], sujeto: 'niveles' }
  };
  function cargaTipo() { return UI.getDD('cargaTipo') || 'items'; }
  function renderCarga() {
    var t = PLANTILLAS[cargaTipo()];
    document.getElementById('cargaCols').innerHTML = 'Columnas de la plantilla: ' + t.cols().map(function (c) { return '<code>' + esc(c) + '</code>'; }).join(' · ');
  }
  function vgCard(kind, label, value, icon) {
    return '<div class="vg-card ' + kind + '"><div class="vg-ic">' + icon + '</div><div><div class="vg-l">' + label + '</div><div class="vg-v">' + value + '</div></div></div>';
  }
  function renderCargaResult(det, ok, fail) {
    var t = PLANTILLAS[cargaTipo()];
    var IC_FILE = '<svg viewBox="0 0 24 24"><path d="M14 3v5h5"/><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>';
    var IC_OK = '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>';
    var IC_ERR = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>';
    document.getElementById('cargaResult').innerHTML =
      vgCard('neutral', 'Detectados', det, IC_FILE) + vgCard('ok', 'Procesados', ok, IC_OK) + vgCard('rech', 'Fallidos', fail, IC_ERR);
    var rows = '';
    for (var i = 0; i < fail; i++) rows += '<tr><td data-label="Registro">fila ' + (det - fail + i + 1) + '</td><td data-label="Motivo">' + t.motivos[i % t.motivos.length] + '</td></tr>';
    var w = document.getElementById('cargaErrWrap');
    w.innerHTML = fail ? '<table class="naowee-table"><thead><tr><th>Registro</th><th>Motivo del error</th></tr></thead><tbody>' + rows + '</tbody></table>' : '';
    w.style.display = fail ? '' : 'none';
  }
  function simulateCarga() {
    var t = PLANTILLAS[cargaTipo()];
    var det = cargaTipo() === 'niveles' ? 8 : 20, fail = 2, ok = det - fail;
    document.getElementById('cargaPrev').innerHTML =
      '<div class="naowee-message naowee-message--informative" style="margin:14px 0"><div class="naowee-message__header"><span class="naowee-message__icon"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/></svg></span><div class="naowee-message__body">Vista previa: <b>' + det + ' ' + t.sujeto + '</b> detectados. Archivo válido para la versión <b>' + cat.versionActiva + '</b> de la plantilla. <i>Simulación de demo: no inserta datos.</i></div></div></div>';
    renderCargaResult(det, ok, fail);
    D.logAudit(cat, 'Carga masiva', t.sujeto.charAt(0).toUpperCase() + t.sujeto.slice(1) + ' · ' + ok + ' procesados', 'Jesús Díaz');
    renderAuditoria();
  }
  function initCarga() {
    renderCarga(); renderCargaResult(20, 18, 2);
    var drop = document.getElementById('cargaDrop');
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.xlsx,.csv'; inp.style.display = 'none';
    document.body.appendChild(inp);
    drop.addEventListener('click', function () { inp.click(); });
    drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inp.click(); } });
    inp.addEventListener('change', simulateCarga);
    drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('drag'); });
    drop.addEventListener('dragleave', function () { drop.classList.remove('drag'); });
    drop.addEventListener('drop', function (e) { e.preventDefault(); drop.classList.remove('drag'); simulateCarga(); });
    document.getElementById('cargaTipo').addEventListener('dd:change', function () { renderCarga(); renderCargaResult(cargaTipo() === 'niveles' ? 8 : 20, cargaTipo() === 'niveles' ? 6 : 18, 2); });
    document.getElementById('btnPlantilla').onclick = function () {
      var t = PLANTILLAS[cargaTipo()];
      downloadFile('plantilla-' + cargaTipo() + '-' + slug(cat.nombre) + '-' + cat.versionActiva + '.csv', t.cols().join(',') + '\n');
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
    D.nuevaVersion(cat, motivo, 'Jesús Díaz');
    closeModal('mVersion'); el.value = '';
    renderVersiones(); renderHead(); renderAuditoria(); renderItems();
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
    document.getElementById('nvAddIn').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); addCampo(); } });
    document.getElementById('motivoConfirm').onclick = confirmDesactivar;

    document.getElementById('btnItem').onclick = function () { openItem(null); };
    document.getElementById('itGuardar').onclick = saveItem;
    document.getElementById('itSearch').addEventListener('input', renderItems);
    document.getElementById('itNivel').addEventListener('dd:change', function (e) { renderItemFields(e.detail.value, null); });

    document.getElementById('btnVersion').onclick = function () { clearInvalid('#mVersion'); openModal('mVersion'); };
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
