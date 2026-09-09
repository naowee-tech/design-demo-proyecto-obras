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
  window.OBRAS_UI.dpGet = function (id) { var dp = document.getElementById(id); return dp ? (dp.dataset.value || '') : ''; };

  document.addEventListener('click', function () { closeAllDD(null); });
  document.addEventListener('DOMContentLoaded', function () { window.OBRAS_UI.initDropdowns(); window.OBRAS_UI.initDatepickers(); });
})();
