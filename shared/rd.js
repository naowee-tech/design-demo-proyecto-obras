/* ============================================================================
 * Proyecto de Obras · v0.7 — Helpers comunes de las pantallas rediseñadas.
 * ========================================================================== */
(function () {
  'use strict';
  var D = window.OBRAS;
  function esc(s) { return (s == null ? '' : String(s)).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var IC = {
    check: '<path d="M20 6L9 17l-5-5"/>',
    warn: '<path d="M12 3l9 17H3z"/><path d="M12 9v4M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    back: '<path d="M15 6l-6 6 6 6"/>',
    next: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
    download: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
    file: '<path d="M14 3v5h5"/><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>',
    map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M22 20a7 7 0 0 0-4.5-6.5"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>',
    off: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
    undo: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    play: '<path d="M7 5v14l11-7z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>'
  };
  function ic(n, sz, extra) { return '<svg viewBox="0 0 24 24" width="' + (sz || 16) + '" height="' + (sz || 16) + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || '') + '>' + (IC[n] || '') + '</svg>'; }
  function chip(txt, tono, icon) { return '<span class="rd-chip rd-chip--' + (tono || 'neutral') + '">' + (icon ? ic(icon, 13) : '') + esc(txt) + '</span>'; }
  function chipEstado(e) { return chip(e, e === 'Activo' ? 'ok' : e === 'Borrador' ? 'warn' : 'neutral'); }
  function chipVersion(v) {
    if (!v) return '';
    if (v.estado === 'vigente') return chip(v.v + ' vigente', 'ok');
    if (v.estado === 'preparacion') return chip(v.v + ' en preparación', 'prep');
    return chip(v.v + ' histórica', 'neutral');
  }
  // Alcance legible: "33 departamentos" o la lista si son pocos.
  function alcanceTxt(cat, corto) {
    var d = cat.alcance.deptos, n = d.length;
    var dep = n === 33 ? 'Los 33 departamentos' : n <= 3 && !corto ? d.join(', ') : n + ' departamento' + (n === 1 ? '' : 's');
    return dep;
  }
  function rolesTxt(cat) { return cat.alcance.roles.length ? cat.alcance.roles.join(' · ') : 'Sin roles'; }
  // Enlace a otra pantalla conservando rol y proyecto.
  function href(page, params) {
    var p = new URLSearchParams(), cur = new URLSearchParams(location.search);
    p.set('role', (window.OBRAS_SHELL && window.OBRAS_SHELL.role) || cur.get('role') || 'ADMIN');
    if (cur.get('proyecto')) p.set('proyecto', cur.get('proyecto'));
    Object.keys(params || {}).forEach(function (k) { if (params[k] != null) p.set(k, params[k]); });
    return page + '?' + p.toString();
  }
  function qs(k) { return new URLSearchParams(location.search).get(k); }
  function toast(h, t, ms) { if (window.OBRAS_UI) window.OBRAS_UI.toast(h, t, ms); }

  // Modal de motivo (retirar, descartar, desactivar): obligatorio.
  function pedirMotivo(opts) {
    return new Promise(function (resolve) {
      var o = document.getElementById('rdMotivo');
      if (!o) {
        o = document.createElement('div'); o.className = 'naowee-modal-overlay'; o.id = 'rdMotivo';
        o.innerHTML = '<div class="naowee-modal naowee-modal--fixed-footer" role="dialog" aria-modal="true" aria-labelledby="rdMotivoT" style="width:540px;max-width:92vw">' +
          '<div class="naowee-modal__header"><div class="naowee-modal__title-group"><h2 class="naowee-modal__title" id="rdMotivoT"></h2><p class="naowee-modal__subtitle" id="rdMotivoS"></p></div>' +
          '<button class="naowee-modal__dismiss" aria-label="Cerrar" data-a="no">' + ic('x', 18) + '</button></div>' +
          '<div class="naowee-modal__body"><div id="rdMotivoExtra"></div><div class="naowee-textfield" style="margin-top:12px"><label class="naowee-textfield__label naowee-textfield__label--required" for="rdMotivoTxt">Motivo</label>' +
          '<div class="naowee-textfield__input-wrap"><input class="naowee-textfield__input" id="rdMotivoTxt" autocomplete="off"></div><div class="rd-err" id="rdMotivoErr" hidden>Escribe el motivo: queda en el historial.</div></div></div>' +
          '<div class="naowee-modal__footer naowee-modal__footer--end"><button class="naowee-btn naowee-btn--mute" style="margin-right:8px" data-a="no">Cancelar</button><button class="naowee-btn naowee-btn--loud" id="rdMotivoOk" data-a="ok"></button></div></div>';
        document.body.appendChild(o);
      }
      document.getElementById('rdMotivoT').textContent = opts.titulo;
      document.getElementById('rdMotivoS').textContent = opts.sub || '';
      document.getElementById('rdMotivoExtra').innerHTML = opts.extra || '';
      document.getElementById('rdMotivoOk').textContent = opts.ok || 'Confirmar';
      var inp = document.getElementById('rdMotivoTxt'); inp.value = opts.valor || '';
      document.getElementById('rdMotivoErr').hidden = true;
      window.openModal('rdMotivo'); setTimeout(function () { inp.focus(); }, 50);
      o.querySelectorAll('[data-a]').forEach(function (b) {
        b.onclick = function () {
          if (b.dataset.a === 'ok' && !inp.value.trim()) { document.getElementById('rdMotivoErr').hidden = false; inp.focus(); return; }
          window.closeModal('rdMotivo'); resolve(b.dataset.a === 'ok' ? inp.value.trim() : null);
        };
      });
    });
  }

  // Aviso de cambio global (capítulos e insumos no tienen versión en el backend).
  function avisoGlobal(uso, que) {
    if (!uso || !uso.length) return '';
    var cats = {}; uso.forEach(function (u) { (cats[u.cat] = cats[u.cat] || []).push(u.v); });
    return '<div class="naowee-message naowee-message--caution"><div class="naowee-message__header"><span class="naowee-message__icon">' + ic('globe', 16, ' stroke="#fff"') + '</span>' +
      '<div class="naowee-message__body"><b>Cambio global.</b> ' + esc(que) + ' no tiene versión: el cambio se verá en ' + uso.length + ' versión' + (uso.length === 1 ? '' : 'es') + ' de ' + Object.keys(cats).length + ' catálogo' + (Object.keys(cats).length === 1 ? '' : 's') +
      ', también en las históricas.<ul style="margin:6px 0 0 18px;padding:0">' + Object.keys(cats).map(function (c) { return '<li>' + esc(c) + ' <span style="opacity:.75">· ' + cats[c].join(', ') + '</span></li>'; }).join('') + '</ul></div></div></div>';
  }

  // Transición tabla ancha ⇄ árbol + detalle (Contenido y Consulta). FLIP: se mide el panel
  // antes de volver a pintar y se anima su ancho del tamaño viejo al nuevo; el detalle entra
  // deslizándose desde la derecha cuando el panel ya se está contrayendo. Así se entiende que
  // es el mismo panel que se hace a un lado, no una pantalla nueva.
  function flip(panelSel, detSel, pintar) {
    var viejo = document.querySelector(panelSel), r0 = viejo && viejo.getBoundingClientRect(), modo0 = viejo && viejo.dataset.modo;
    pintar();
    var nuevo = document.querySelector(panelSel), det = document.querySelector(detSel);
    if (!nuevo || !r0 || !nuevo.animate || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    var ease = 'cubic-bezier(.2,.7,.2,1)';
    if (nuevo.dataset.modo === modo0) {
      if (det && modo0 === 'arbol') det.animate([{ opacity: .35 }, { opacity: 1 }], { duration: 180, easing: 'ease-out' });
      return;
    }
    var r1 = nuevo.getBoundingClientRect();
    if (Math.abs(r1.width - r0.width) < 8) return;
    var ov = nuevo.style.overflow; nuevo.style.overflow = 'hidden';
    var a = nuevo.animate([{ width: r0.width + 'px' }, { width: r1.width + 'px' }], { duration: 420, easing: ease });
    a.onfinish = a.oncancel = function () { nuevo.style.overflow = ov; };
    if (det && nuevo.dataset.modo === 'arbol') det.animate([{ opacity: 0, transform: 'translateX(56px)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: 160, easing: ease, fill: 'backwards' });
  }

  window.RD = { flip: flip, esc: esc, ic: ic, chip: chip, chipEstado: chipEstado, chipVersion: chipVersion, alcanceTxt: alcanceTxt, rolesTxt: rolesTxt, href: href, qs: qs, toast: toast, pedirMotivo: pedirMotivo, avisoGlobal: avisoGlobal };
})();
