/* ============================================================================
 * Proyecto de Obras — Helpers UI DS (modales + dropdowns canónicos).
 * No inventa componentes: opera .naowee-modal-overlay y .naowee-dropdown del DS.
 * ========================================================================== */
(function () {
  'use strict';

  window.openModal = function (id) {
    var o = document.getElementById(id);
    if (o) { o.classList.add('open'); document.body.style.overflow = 'hidden'; }
  };
  window.closeModal = function (id) {
    var o = document.getElementById(id);
    if (o) { o.classList.remove('open'); if (!document.querySelector('.naowee-modal-overlay.open')) document.body.style.overflow = ''; }
  };

  function norm(s) { return (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

  function closeAllDD(except) {
    document.querySelectorAll('.naowee-dropdown--open').forEach(function (d) { if (d !== except) d.classList.remove('naowee-dropdown--open'); });
  }
  // Dropdowns y datepickers son mutuamente excluyentes: solo un popover abierto a la vez.
  function closeAllDP(except) {
    document.querySelectorAll('[data-dp]').forEach(function (dp) {
      if (dp === except) return;
      var pop = dp.querySelector('[data-dp-pop]');
      if (pop) pop.classList.remove('open');
      dp.classList.remove('naowee-datepicker-field--active');
    });
  }

  // Wire de un .naowee-dropdown. Convención DS: --open en el WRAPPER.
  function wireDropdown(dd) {
    if (dd.__wired) return; dd.__wired = 1;
    var trig = dd.querySelector('.naowee-dropdown__trigger');
    var val = dd.querySelector('.naowee-dropdown__value');
    var menu = dd.querySelector('.naowee-dropdown__menu');
    if (!trig || !menu) return;

    // buscador acento-insensible (data-search); reutiliza el existente al re-cablear
    var searchInput = null;
    if (dd.hasAttribute('data-search')) {
      var wrap = menu.querySelector('.dd-search');
      if (!wrap) {
        wrap = document.createElement('div'); wrap.className = 'dd-search';
        wrap.innerHTML = '<input type="text" placeholder="Buscar…" autocomplete="off">';
        menu.insertBefore(wrap, menu.firstChild);
        searchInput = wrap.querySelector('input');
        searchInput.addEventListener('input', function () {
          var q = norm(searchInput.value);
          menu.querySelectorAll('.naowee-dropdown__option').forEach(function (o) {
            o.style.display = norm(o.textContent).indexOf(q) >= 0 ? '' : 'none';
          });
        });
        searchInput.addEventListener('click', function (e) { e.stopPropagation(); });
      } else { searchInput = wrap.querySelector('input'); }
    }
    dd.__search = searchInput;

    // el listener del trigger se ata UNA sola vez (evita doble-toggle al re-cablear)
    if (!trig.__ddwired) {
      trig.__ddwired = 1;
      trig.addEventListener('click', function (e) {
        e.stopPropagation();
        var willOpen = !dd.classList.contains('naowee-dropdown--open');
        closeAllDD(dd);
        closeAllDP(null);
        dd.classList.toggle('naowee-dropdown--open', willOpen);
        var si = dd.__search;
        if (willOpen && si) { si.value = ''; si.dispatchEvent(new Event('input')); setTimeout(function () { si.focus(); }, 30); }
      });
    }

    menu.querySelectorAll('.naowee-dropdown__option').forEach(function (opt) {
      opt.addEventListener('click', function (e) {
        e.stopPropagation();
        setDD(dd, opt.dataset.value != null ? opt.dataset.value : opt.textContent.trim(), opt.textContent.trim());
        dd.classList.remove('naowee-dropdown--open');
        dd.dispatchEvent(new CustomEvent('dd:change', { bubbles: true, detail: { value: getDD(dd) } }));
      });
    });
  }

  function setDD(dd, value, label) {
    var val = dd.querySelector('.naowee-dropdown__value');
    dd.dataset.value = value;
    if (val) { val.textContent = label != null ? label : value; val.classList.remove('naowee-dropdown__placeholder'); }
    dd.querySelectorAll('.naowee-dropdown__option').forEach(function (o) {
      var on = (o.dataset.value != null ? o.dataset.value : o.textContent.trim()) === value;
      o.classList.toggle('naowee-dropdown__option--selected', on);
      o.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }
  function getDD(dd) { return dd ? (dd.dataset.value || '') : ''; }

  window.OBRAS_UI = {
    initDropdowns: function (root) { (root || document).querySelectorAll('.naowee-dropdown').forEach(wireDropdown); },
    setDD: function (id, v, l) { var dd = document.getElementById(id); if (dd) setDD(dd, v, l); },
    getDD: function (id) { return getDD(document.getElementById(id)); },
    // llena un menú de opciones desde un array [{value,label}] o [string]
    fillDD: function (id, options, placeholder) {
      var dd = document.getElementById(id); if (!dd) return;
      var menu = dd.querySelector('.naowee-dropdown__menu');
      var search = menu.querySelector('.dd-search');
      menu.innerHTML = ''; if (search) menu.appendChild(search);
      options.forEach(function (o) {
        var el = document.createElement('div'); el.className = 'naowee-dropdown__option';
        if (typeof o === 'string') { el.textContent = o; el.dataset.value = o; }
        else { el.textContent = o.label; el.dataset.value = o.value; }
        menu.appendChild(el);
      });
      var val = dd.querySelector('.naowee-dropdown__value');
      if (placeholder && val) { val.textContent = placeholder; val.classList.add('naowee-dropdown__placeholder'); dd.dataset.value = ''; }
      dd.__wired = 0; wireDropdown(dd);
    }
  };

  // ── Datepicker canónico (self-contained, [data-dp]) — portado del espejo ──
  var MES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  var DOW = ['L','M','M','J','V','S','D'];
  function pad(n) { return String(n).padStart(2, '0'); }
  function initDP(dp) {
    if (dp.__dpWired) return; dp.__dpWired = 1;
    var field = dp.querySelector('.naowee-datepicker-field__input');
    var valEl = dp.querySelector('[data-dp-value]');
    var pop = dp.querySelector('[data-dp-pop]');
    if (!field || !valEl || !pop) return;
    var placeholder = valEl.textContent;
    var today = new Date();
    var view = new Date(today.getFullYear(), today.getMonth(), 1), selected = null;
    // [data-dp-range]: el primer clic fija "desde" y el segundo "hasta" (PPTO-20).
    var isRange = dp.hasAttribute('data-dp-range'), desde = null, hasta = null;
    function isoOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
    function lblOf(d) { return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear(); }
    function sameDay(a, b) { return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
    function render() {
      var y = view.getFullYear(), m = view.getMonth();
      var startDow = (new Date(y, m, 1).getDay() + 6) % 7, dim = new Date(y, m + 1, 0).getDate();
      var weeks = '', day = 1;
      for (var r = 0; r < 6 && day <= dim; r++) {
        var row = '<div class="naowee-datepicker__week">';
        for (var c = 0; c < 7; c++) {
          var idx = r * 7 + c;
          if (idx < startDow || day > dim) { row += '<button class="naowee-datepicker__day naowee-datepicker__day--other-month" disabled></button>'; }
          else {
            var cur = new Date(y, m, day);
            var cls = (sameDay(cur, selected) ? ' naowee-datepicker__day--selected' : '') + (sameDay(cur, today) ? ' naowee-datepicker__day--today' : '');
            if (isRange) {
              cls = (sameDay(cur, today) ? ' naowee-datepicker__day--today' : '') +
                (sameDay(cur, desde) ? ' naowee-datepicker__day--range-start naowee-datepicker__day--selected' : '') +
                (sameDay(cur, hasta) ? ' naowee-datepicker__day--range-end naowee-datepicker__day--selected' : '') +
                (desde && hasta && cur > desde && cur < hasta ? ' naowee-datepicker__day--in-range' : '');
            }
            row += '<button class="naowee-datepicker__day' + cls + '" data-day="' + day + '">' + day + '</button>'; day++;
          }
        }
        weeks += row + '</div>';
      }
      var wk = '<div class="naowee-datepicker__week">' + DOW.map(function (d) { return '<div class="naowee-datepicker__weekday">' + d + '</div>'; }).join('') + '</div>';
      pop.innerHTML = '<div class="naowee-datepicker"><div class="naowee-datepicker__calendar"><div class="naowee-datepicker__header"><div class="naowee-datepicker__month-selector"><span class="naowee-datepicker__month">' + MES[m] + ' de ' + y + '</span></div><div class="naowee-datepicker__controls"><button class="naowee-datepicker__nav" data-nav="-1" aria-label="Mes anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg></button><button class="naowee-datepicker__nav" data-nav="1" aria-label="Mes siguiente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg></button></div></div><div class="naowee-datepicker__content">' + wk + weeks + '</div></div></div>';
    }
    function open() { render(); closeAllDD(null); closeAllDP(dp); pop.classList.add('open'); dp.classList.add('naowee-datepicker-field--active'); }
    function close() { pop.classList.remove('open'); dp.classList.remove('naowee-datepicker-field--active'); }
    field.addEventListener('click', function (e) { e.stopPropagation(); pop.classList.contains('open') ? close() : open(); });
    field.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); field.click(); } });
    pop.addEventListener('click', function (e) {
      e.stopPropagation();
      var nav = e.target.closest('[data-nav]');
      if (nav) { view = new Date(view.getFullYear(), view.getMonth() + (+nav.dataset.nav), 1); render(); return; }
      var d = e.target.closest('[data-day]');
      if (d && isRange) {
        var pick = new Date(view.getFullYear(), view.getMonth(), +d.dataset.day);
        if (!desde || hasta) { desde = pick; hasta = null; render(); valEl.textContent = lblOf(desde) + ' → …'; valEl.classList.remove('naowee-dropdown__placeholder'); return; }
        if (pick < desde) { hasta = desde; desde = pick; } else hasta = pick;
        dp.dataset.desde = isoOf(desde); dp.dataset.hasta = isoOf(hasta); dp.dataset.value = dp.dataset.desde + '|' + dp.dataset.hasta;
        valEl.textContent = lblOf(desde) + ' → ' + lblOf(hasta);
        close();
        dp.dispatchEvent(new CustomEvent('dp:change', { bubbles: true, detail: { desde: dp.dataset.desde, hasta: dp.dataset.hasta } }));
        return;
      }
      if (d) {
        selected = new Date(view.getFullYear(), view.getMonth(), +d.dataset.day);
        dp.dataset.value = selected.getFullYear() + '-' + pad(selected.getMonth() + 1) + '-' + pad(selected.getDate());
        valEl.textContent = pad(selected.getDate()) + '/' + pad(selected.getMonth() + 1) + '/' + selected.getFullYear();
        valEl.classList.remove('naowee-dropdown__placeholder');
        close();
        dp.dispatchEvent(new CustomEvent('dp:change', { bubbles: true, detail: { value: dp.dataset.value } }));
      }
    });
    document.addEventListener('click', close);
    dp.__set = function (iso) {
      if (isRange && !iso) { desde = hasta = null; dp.dataset.value = dp.dataset.desde = dp.dataset.hasta = ''; valEl.textContent = placeholder; valEl.classList.add('naowee-dropdown__placeholder'); return; }
      if (!iso) { selected = null; dp.dataset.value = ''; valEl.textContent = placeholder; valEl.classList.add('naowee-dropdown__placeholder'); return; }
      var p = iso.split('-');
      selected = new Date(+p[0], +p[1] - 1, +p[2]); view = new Date(+p[0], +p[1] - 1, 1);
      dp.dataset.value = iso;
      valEl.textContent = p[2] + '/' + p[1] + '/' + p[0];
      valEl.classList.remove('naowee-dropdown__placeholder');
    };
  }
  window.OBRAS_UI.initDatepickers = function (root) { (root || document).querySelectorAll('[data-dp]').forEach(initDP); };
  window.OBRAS_UI.dpSet = function (id, iso) { var dp = document.getElementById(id); if (dp && dp.__set) dp.__set(iso); };
  window.OBRAS_UI.dpRange = function (id) { var dp = document.getElementById(id); return { desde: dp ? (dp.dataset.desde || '') : '', hasta: dp ? (dp.dataset.hasta || '') : '' }; };
  window.OBRAS_UI.dpGet = function (id) { var dp = document.getElementById(id); return dp ? (dp.dataset.value || '') : ''; };

  // ── Toast (.t-toast del shell + .naowee-message) ──
  var IC_MSG = {
    positive: '<path d="M20 6L9 17l-5-5"/>',
    caution: '<path d="M12 3l9 17H3z"/><path d="M12 9v4M12 17h.01"/>',
    negative: '<circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/>',
    informative: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/>'
  };
  function msgIcon(tono) { return '<span class="naowee-message__icon"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2">' + (IC_MSG[tono] || IC_MSG.informative) + '</svg></span>'; }
  var _toastT = null;
  window.OBRAS_UI.toast = function (html, tono, ms) {
    tono = tono || 'positive';
    var t = document.getElementById('tToast');
    if (!t) { t = document.createElement('div'); t.id = 'tToast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.className = 't-toast naowee-message naowee-message--' + tono;
    t.innerHTML = '<div class="naowee-message__header">' + msgIcon(tono) + '<div class="naowee-message__body">' + html + '</div></div>';
    requestAnimationFrame(function () { t.classList.add('show'); });
    clearTimeout(_toastT); _toastT = setTimeout(function () { t.classList.remove('show'); }, ms || 3200);
  };

  // ── Aviso de impacto sobre presupuestos (PPTO-02, 11, 15) ──
  function escH(s) { return (s == null ? '' : String(s)).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  window.OBRAS_UI.avisoPresupuestos = function (lista, sujeto) {
    if (!lista || !lista.length) return '';
    var n = lista.length;
    return '<div class="naowee-message naowee-message--caution" style="margin-top:14px"><div class="naowee-message__header">' + msgIcon('caution') +
      '<div class="naowee-message__body"><b>' + (sujeto || 'Este cambio') + ' afecta ' + n + ' presupuesto' + (n === 1 ? '' : 's') + ' activo' + (n === 1 ? '' : 's') + ':</b>' +
      '<ul style="margin:6px 0 6px 18px;padding:0">' + lista.map(function (p) { return '<li>' + escH(p.nombre) + ' <span style="opacity:.75">· ' + escH(p.version) + ' · ' + escH(p.estado) + '</span></li>'; }).join('') + '</ul>' +
      'Cada presupuesto queda en la versión con la que se creó; el cambio aplica desde la próxima versión. Te sugerimos <b>crear una nueva versión</b> al terminar.</div></div></div>';
  };

  // ── Resumen de cambios antes de confirmar (PPTO-02, 05, 11) ──
  // Cierra el modal de edición mientras muestra el resumen (nunca dos fondos a la vez) y lo
  // reabre si el usuario vuelve a editar. Sin cambios no abre nada: avisa y resuelve false.
  function ensureCambios() {
    var o = document.getElementById('mCambios');
    if (o) return o;
    o = document.createElement('div');
    o.className = 'naowee-modal-overlay'; o.id = 'mCambios';
    o.innerHTML =
      '<div class="naowee-modal naowee-modal--wide naowee-modal--fixed-header naowee-modal--fixed-footer">' +
        '<div class="naowee-modal__header"><div class="naowee-modal__title-group"><h2 class="naowee-modal__title" id="mCambiosTitle">Revisa los cambios</h2><p class="naowee-modal__subtitle" id="mCambiosSub"></p></div>' +
          '<button class="naowee-modal__dismiss" aria-label="Cerrar" data-act="volver"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
        '<div class="naowee-modal__body">' +
          '<div class="naowee-table-wrap"><table class="naowee-table naowee-table--compact" id="mCambiosTable"><thead><tr><th>Campo</th><th>Antes</th><th>Después</th></tr></thead><tbody id="mCambiosBody"></tbody></table></div>' +
          '<div id="mCambiosImpacto"></div>' +
        '</div>' +
        '<div class="naowee-modal__footer naowee-modal__footer--end"><button class="naowee-btn naowee-btn--mute" style="margin-right:8px" data-act="volver">Volver a editar</button><button class="naowee-btn naowee-btn--loud" id="mCambiosOk" data-act="ok">Confirmar cambios</button></div>' +
      '</div>';
    document.body.appendChild(o);
    return o;
  }
  window.OBRAS_UI.confirmarCambios = function (opts) {
    return new Promise(function (resolve) {
      if (!opts.cambios || !opts.cambios.length) { window.OBRAS_UI.toast('Sin cambios que guardar.', 'informative'); resolve(false); return; }
      var o = ensureCambios();
      document.getElementById('mCambiosTitle').textContent = opts.titulo || 'Revisa los cambios';
      document.getElementById('mCambiosSub').textContent = opts.subtitulo || (opts.cambios.length + ' campo' + (opts.cambios.length === 1 ? '' : 's') + ' cambia' + (opts.cambios.length === 1 ? '' : 'n') + '. Confirma para guardar y dejarlo en el historial.');
      document.getElementById('mCambiosBody').innerHTML = opts.cambios.map(function (c) {
        return '<tr><td data-label="Campo"><b>' + escH(c.etiqueta) + '</b></td>' +
          '<td data-label="Antes"><span style="color:var(--t-text-2);text-decoration:line-through">' + escH(c.antes) + '</span></td>' +
          '<td data-label="Después"><b>' + escH(c.despues) + '</b></td></tr>';
      }).join('');
      document.getElementById('mCambiosImpacto').innerHTML = opts.impacto || '';
      if (opts.desde) window.closeModal(opts.desde);
      window.openModal('mCambios');
      o.querySelectorAll('[data-act]').forEach(function (b) {
        b.onclick = function () {
          var ok = b.dataset.act === 'ok';
          window.closeModal('mCambios');
          if (!ok && opts.desde) window.openModal(opts.desde);
          resolve(ok);
        };
      });
    });
  };

  // ── Exportar una tabla a Excel, PDF o CSV (PPTO-14, 21) ──
  // Excel: tabla HTML con tipo de Excel (abre en Excel y Sheets, sin librerías).
  // PDF: vista de impresión con encabezado; el navegador ofrece "Guardar como PDF".
  // opts: { nombre, titulo, meta:[texto], columnas:[titulo], filas:[[valor]], formato }
  function stamp() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + '_' + pad(d.getHours()) + pad(d.getMinutes()); }
  function descargar(nombre, contenido, tipo) {
    try {
      var blob = new Blob([contenido], { type: tipo });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre;
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    } catch (e) {}
  }
  window.OBRAS_UI.descargar = descargar;
  window.OBRAS_UI.stamp = stamp;
  window.OBRAS_UI.exportar = function (o) {
    var base = o.nombre + '-' + stamp();
    var tabla = '<table border="1" cellspacing="0" cellpadding="4"><thead><tr>' + o.columnas.map(function (c) { return '<th>' + escH(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      o.filas.map(function (r) { return '<tr>' + r.map(function (v) { return '<td>' + escH(v) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
    var cab = '<h2 style="font-family:Arial;margin:0 0 4px">' + escH(o.titulo) + '</h2>' + (o.meta || []).map(function (m) { return '<div style="font-family:Arial;font-size:12px;color:#555">' + escH(m) + '</div>'; }).join('');
    if (o.formato === 'csv') {
      var q = function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; };
      descargar(base + '.csv', '\uFEFF' + [o.columnas].concat(o.filas).map(function (r) { return r.map(q).join(','); }).join('\r\n'), 'text/csv;charset=utf-8');
      return base + '.csv';
    }
    if (o.formato === 'pdf') {
      var w = window.open('', '_blank');
      if (!w) { window.OBRAS_UI.toast('El navegador bloqueó la ventana de impresión. Permite ventanas emergentes para exportar a PDF.', 'caution'); return null; }
      w.document.write('<!doctype html><html lang="es"><head><meta charset="utf-8"><title>' + escH(base) + '</title><style>body{font-family:Arial,sans-serif;margin:24px}table{border-collapse:collapse;width:100%;margin-top:14px;font-size:11px}th{background:#eef3f6;text-align:left}th,td{border:1px solid #ccd;padding:5px 7px}</style></head><body>' + cab + tabla + '<script>window.onload=function(){window.print()}<\/script></body></html>');
      w.document.close();
      return base + '.pdf';
    }
    descargar(base + '.xls', '\uFEFF<html><head><meta charset="utf-8"></head><body>' + cab + '<br>' + tabla + '</body></html>', 'application/vnd.ms-excel;charset=utf-8');
    return base + '.xls';
  };

  // ── CSV → filas (PPTO-13): BOM, comillas, separador , o ; (Excel en español usa ;) ──
  window.OBRAS_UI.parseCSV = function (txt) {
    txt = (txt || '').replace(/^\uFEFF/, '');
    // El separador se deduce de los encabezados, no de la fila de identificación (#plantilla=…;…),
    // que puede venir entre comillas porque lleva ';'.
    var primera = txt.split(/\r?\n/).filter(function (l) { return l && !/^"?#/.test(l); })[0] || '';
    var sep = (primera.split(';').length > primera.split(',').length) ? ';' : ',';
    var rows = [], row = [], cell = '', q = false;
    for (var i = 0; i < txt.length; i++) {
      var ch = txt[i];
      if (q) {
        if (ch === '"' && txt[i + 1] === '"') { cell += '"'; i++; }
        else if (ch === '"') q = false;
        else cell += ch;
      } else if (ch === '"') q = true;
      else if (ch === sep) { row.push(cell); cell = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && txt[i + 1] === '\n') i++;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else cell += ch;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (c) { return c.trim() !== ''; }); });
  };

  document.addEventListener('click', function () { closeAllDD(null); });
  document.addEventListener('DOMContentLoaded', function () { window.OBRAS_UI.initDropdowns(); window.OBRAS_UI.initDatepickers(); });
})();
