/* ============================================================================
 * Proyecto de Obras · v0.7 — Formulario del catálogo (HU01 nuevo · HU02 datos generales)
 * Un solo modal para los dos momentos, abierto desde la lista o desde el espacio de
 * trabajo: el objeto tiene un contenedor, no uno por pantalla.
 * CAT_FORM.abrir(null | cat, onDone(cat, esNuevo))
 * ========================================================================== */
(function () {
  'use strict';
  var D = window.OBRAS, U = window.OBRAS_UI, R = window.RD, esc = R.esc;
  var editId = null, onDone = null;
  var MARKUP = "<div class=\"naowee-modal-overlay\" id=\"mCat\">\n  <div class=\"naowee-modal naowee-modal--fixed-header naowee-modal--fixed-footer\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"mCatTitle\">\n    <div class=\"naowee-modal__header\">\n      <div class=\"naowee-modal__title-group\"><h2 class=\"naowee-modal__title\" id=\"mCatTitle\">Nuevo catálogo</h2><p class=\"naowee-modal__subtitle\" id=\"mCatSub\">Nace con la v1.0 en preparación: la llenas y después la activas.</p></div>\n      <button class=\"naowee-modal__dismiss\" aria-label=\"Cerrar\" onclick=\"closeModal('mCat')\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M6 6l12 12M18 6L6 18\"/></svg></button>\n    </div>\n    <div class=\"naowee-modal__body\">\n      <div class=\"rd-grid2\">\n        <div class=\"naowee-textfield rd-full\">\n          <label class=\"naowee-textfield__label naowee-textfield__label--required\" for=\"catNombre\">Nombre del catálogo</label>\n          <div class=\"naowee-textfield__input-wrap\"><input class=\"naowee-textfield__input\" id=\"catNombre\" placeholder=\"Ej. Base de precios Orinoquía 2026\" autocomplete=\"off\"></div>\n          <div class=\"rd-err\" id=\"errNombre\" hidden></div>\n        </div>\n        <div>\n          <label class=\"naowee-textfield__label naowee-textfield__label--required\" style=\"display:block\">Vigencia · desde</label>\n          <div class=\"naowee-datepicker-field\" data-dp id=\"dpIni\">\n            <div class=\"naowee-datepicker-field__input\" tabindex=\"0\" role=\"button\" aria-haspopup=\"dialog\">\n              <span class=\"naowee-datepicker-field__icon\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><rect x=\"3\" y=\"4.5\" width=\"18\" height=\"17\" rx=\"2.5\"/><path d=\"M3 9.5h18M8 2.5v4M16 2.5v4\"/></svg></span>\n              <span class=\"naowee-datepicker-field__value naowee-dropdown__placeholder\" data-dp-value>Seleccionar fecha</span>\n              <span class=\"naowee-datepicker-field__controls\"><span class=\"naowee-datepicker-field__chevron\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M6 9l6 6 6-6\"/></svg></span></span>\n            </div>\n            <div class=\"t-dp-pop\" data-dp-pop></div>\n          </div>\n        </div>\n        <div>\n          <label class=\"naowee-textfield__label naowee-textfield__label--required\" style=\"display:block\">Vigencia · hasta</label>\n          <div class=\"naowee-datepicker-field\" data-dp id=\"dpFin\">\n            <div class=\"naowee-datepicker-field__input\" tabindex=\"0\" role=\"button\" aria-haspopup=\"dialog\">\n              <span class=\"naowee-datepicker-field__icon\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><rect x=\"3\" y=\"4.5\" width=\"18\" height=\"17\" rx=\"2.5\"/><path d=\"M3 9.5h18M8 2.5v4M16 2.5v4\"/></svg></span>\n              <span class=\"naowee-datepicker-field__value naowee-dropdown__placeholder\" data-dp-value>Seleccionar fecha</span>\n              <span class=\"naowee-datepicker-field__controls\"><span class=\"naowee-datepicker-field__chevron\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M6 9l6 6 6-6\"/></svg></span></span>\n            </div>\n            <div class=\"t-dp-pop\" data-dp-pop></div>\n          </div>\n          <div class=\"rd-err\" id=\"errFechas\" hidden>La vigencia no puede terminar antes de empezar.</div>\n        </div>\n      </div>\n\n      <fieldset style=\"border:0;margin:0;padding:0\" id=\"fsDeptos\">\n        <div class=\"rd-row\" style=\"margin-bottom:8px\">\n          <legend class=\"naowee-textfield__label naowee-textfield__label--required\" style=\"padding:0\">Departamentos del alcance</legend>\n          <span class=\"t-count\" id=\"deptosCount\"></span>\n          <span class=\"rd-grow\"></span>\n          <button type=\"button\" class=\"naowee-btn naowee-btn--mute naowee-btn--small\" id=\"btnTodos\">Todos</button>\n          <button type=\"button\" class=\"naowee-btn naowee-btn--mute naowee-btn--small\" id=\"btnNinguno\">Ninguno</button>\n        </div>\n        <div class=\"rd-deptos\" id=\"catDeptos\"></div>\n        <div class=\"rd-err\" id=\"errDeptos\" hidden>Elige al menos un departamento.</div>\n        <p class=\"rd-sub\">El departamento es una dimensión del catálogo: cada uno tiene sus propios precios, que llegan con <b>Importar</b>.</p>\n      </fieldset>\n\n      <fieldset style=\"border:0;margin:0;padding:0\">\n        <legend class=\"naowee-textfield__label naowee-textfield__label--required\" style=\"padding:0;margin-bottom:8px\">Roles que lo consultan</legend>\n        <div class=\"rd-row\" id=\"catRoles\"></div>\n        <div class=\"rd-err\" id=\"errRoles\" hidden>Elige al menos un rol.</div>\n      </fieldset>\n\n      <div class=\"naowee-textfield\">\n        <label class=\"naowee-textfield__label\" for=\"catCondicion\">Condición adicional (opcional)</label>\n        <div class=\"naowee-textfield__input-wrap\"><input class=\"naowee-textfield__input\" id=\"catCondicion\" placeholder=\"Ej. Programa de mejoramiento rural\" autocomplete=\"off\"></div>\n      </div>\n      <div id=\"mCatVer\"></div>\n    </div>\n    <div class=\"naowee-modal__footer naowee-modal__footer--end\">\n      <button class=\"naowee-btn naowee-btn--mute\" style=\"margin-right:8px\" onclick=\"closeModal('mCat')\">Cancelar</button>\n      <button class=\"naowee-btn naowee-btn--loud\" id=\"catGuardar\">Crear catálogo</button>\n    </div>\n  </div>\n</div>";
  function montar() {
    if (document.getElementById('mCat')) return;
    var w = document.createElement('div'); w.innerHTML = MARKUP; document.body.appendChild(w.firstElementChild);
    var st = document.createElement('style');
    st.textContent = '#mCat .naowee-modal{ width:760px; max-width:94vw; } #mCat .naowee-modal__body{ display:flex; flex-direction:column; gap:16px; }';
    document.head.appendChild(st);
    U.initDatepickers(document.getElementById('mCat'));
    document.getElementById('btnTodos').onclick = function () { document.querySelectorAll('#catDeptos input').forEach(function (i) { i.checked = true; }); contarDeptos(); };
    document.getElementById('btnNinguno').onclick = function () { document.querySelectorAll('#catDeptos input').forEach(function (i) { i.checked = false; }); contarDeptos(); };
    document.getElementById('catGuardar').onclick = guardar;
  }
  function renderDeptos(sel) {
    document.getElementById('catDeptos').innerHTML = D.DEPARTAMENTOS.map(function (d, i) {
      return '<label class="rd-check-opt"><input type="checkbox" value="' + esc(d) + '"' + (sel.indexOf(d) >= 0 ? ' checked' : '') + ' id="dep' + i + '">' + esc(d) + '</label>';
    }).join('');
    document.querySelectorAll('#catDeptos input').forEach(function (i) { i.onchange = contarDeptos; });
    contarDeptos();
  }
  function contarDeptos() { document.getElementById('deptosCount').textContent = selDeptos().length + ' de 33'; }
  function selDeptos() { return [].map.call(document.querySelectorAll('#catDeptos input:checked'), function (i) { return i.value; }); }
  function renderRoles(sel) {
    document.getElementById('catRoles').innerHTML = D.ROLES_ALCANCE.map(function (r, i) {
      return '<label class="rd-check-opt" style="margin-right:14px"><input type="checkbox" value="' + esc(r) + '"' + (sel.indexOf(r) >= 0 ? ' checked' : '') + ' id="rol' + i + '">' + esc(r) + '</label>';
    }).join('');
  }
  function selRoles() { return [].map.call(document.querySelectorAll('#catRoles input:checked'), function (i) { return i.value; }); }

  function abrirModal(cat, cb) {
    editId = cat ? cat.id : null; onDone = cb || null;
    ['errNombre', 'errFechas', 'errDeptos', 'errRoles'].forEach(function (id) { document.getElementById(id).hidden = true; });
    document.getElementById('mCatTitle').textContent = cat ? 'Datos generales' : 'Nuevo catálogo';
    document.getElementById('mCatSub').textContent = cat ? cat.nombre : 'Nace con la v1.0 en preparación: la llenas y después la activas.';
    document.getElementById('catGuardar').textContent = cat ? 'Revisar cambios' : 'Crear catálogo';
    document.getElementById('catNombre').value = cat ? cat.nombre : '';
    document.getElementById('catCondicion').value = cat ? cat.alcance.condicion : '';
    U.dpSet('dpIni', cat ? cat.vigenciaIni : D.hoy()); U.dpSet('dpFin', cat ? cat.vigenciaFin : D.hoy().slice(0, 4) + '-12-31');
    renderDeptos(cat ? cat.alcance.deptos : []);
    renderRoles(cat ? cat.alcance.roles : ['Gestor de presupuesto']);
    var p = cat && D.preparacion(cat), v = cat && D.vigente(cat);
    document.getElementById('mCatVer').innerHTML = cat ? '<div class="rd-note">' + R.ic('info') + '<span>' + (p ? 'Los cambios de alcance quedan en la <b>' + p.v + ' en preparación</b>; la ' + (v ? v.v + ' vigente' : 'versión vigente') + ' no cambia hasta activarla.' : 'Cambiar el alcance abre la <b>versión en preparación</b> siguiente; la ' + (v ? v.v : 'vigente') + ' no cambia hasta activarla.') + ' Nombre y vigencia son datos del catálogo y quedan en el historial.</span></div>' : '';
    openModal('mCat');
    setTimeout(function () { document.getElementById('catNombre').focus(); }, 60);
  }

  function validar() {
    var nombre = document.getElementById('catNombre').value.trim(), ok = true;
    var en = document.getElementById('errNombre');
    var dup = D.listCatalogos().some(function (c) { return c.id !== editId && U.norm(c.nombre) === U.norm(nombre); });
    en.hidden = !!nombre && !dup; en.textContent = !nombre ? 'El nombre es obligatorio.' : 'Ya existe un catálogo con ese nombre.';
    if (!en.hidden) ok = false;
    var ini = U.dpGet('dpIni'), fin = U.dpGet('dpFin');
    document.getElementById('errFechas').hidden = !(ini && fin && fin < ini); if (ini && fin && fin < ini) ok = false;
    document.getElementById('errDeptos').hidden = selDeptos().length > 0; if (!selDeptos().length) ok = false;
    document.getElementById('errRoles').hidden = selRoles().length > 0; if (!selRoles().length) ok = false;
    return ok;
  }

  function guardar() {
    if (!validar()) return;
    var data = { nombre: document.getElementById('catNombre').value.trim(), vigenciaIni: U.dpGet('dpIni'), vigenciaFin: U.dpGet('dpFin'),
      deptos: selDeptos(), roles: selRoles(), condicion: document.getElementById('catCondicion').value.trim() };
    if (!editId) {
      var cat = D.newCatalogo(data);
      closeModal('mCat');
      if (onDone) onDone(cat, true); else location.href = R.href('catalogo-detalle.html', { cat: cat.id, nuevo: 1 });
      return;
    }
    var c = D.getCatalogo(editId);
    var antes = { nombre: c.nombre, vig: D.fmtFecha(c.vigenciaIni) + ' – ' + D.fmtFecha(c.vigenciaFin), deptos: c.alcance.deptos.length + ' departamentos', roles: c.alcance.roles.join(', '), cond: c.alcance.condicion };
    var desp = { nombre: data.nombre, vig: D.fmtFecha(data.vigenciaIni) + ' – ' + D.fmtFecha(data.vigenciaFin), deptos: data.deptos.length + ' departamentos', roles: data.roles.join(', '), cond: data.condicion };
    var cambios = D.diff(antes, desp, [{ key: 'nombre', label: 'Nombre' }, { key: 'vig', label: 'Vigencia' }, { key: 'deptos', label: 'Departamentos' }, { key: 'roles', label: 'Roles' }, { key: 'cond', label: 'Condición adicional' }]);
    var tocaAlcance = cambios.some(function (x) { return x.campo === 'deptos' || x.campo === 'roles' || x.campo === 'cond'; });
    var p = D.preparacion(c), sig = p ? p.v : 'la versión en preparación siguiente';
    var pp = D.presupuestosDe(c.id);
    var impacto = (tocaAlcance ? '<div class="rd-note" style="margin-top:14px">' + R.ic('layers') + '<span>El alcance cambia en <b>' + sig + '</b>. Consulta sigue mostrando el alcance de la versión vigente hasta que la actives.</span></div>' : '') +
      (pp.length ? '<div class="rd-note" style="margin-top:10px">' + R.ic('info') + '<span><b>' + pp.length + ' presupuestos</b> usan este catálogo y se quedan en la versión con la que se crearon.</span></div>' : '');
    U.confirmarCambios({ titulo: 'Revisa los cambios', cambios: cambios, impacto: impacto, desde: 'mCat' }).then(function (ok) {
      if (!ok) return;
      c = D.getCatalogo(editId);
      var ver = null;
      if (tocaAlcance) { var r = D.abrirPreparacion(c); ver = r.ver.v; c = D.getCatalogo(editId); }
      c.nombre = data.nombre; c.vigenciaIni = data.vigenciaIni; c.vigenciaFin = data.vigenciaFin;
      c.alcance = { deptos: data.deptos, roles: data.roles, condicion: data.condicion };
      D.saveCatalogo(c);
      D.logAudit(c, 'Editar datos generales', 'Catálogo', { version: ver || (D.preparacion(c) || {}).v, detalle: { cambios: cambios } });
      R.toast('Datos generales guardados' + (ver ? ' · el alcance quedó en la <b>' + ver + ' en preparación</b>' : '') + '.');
      if (onDone) onDone(c, false);
    });
  }



  window.CAT_FORM = { abrir: function (cat, cb) { montar(); abrirModal(cat, cb); } };
})();
