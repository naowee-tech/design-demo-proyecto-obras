/* ============================================================================
 * Proyecto de Obras — SHELL (sidebar + rolepill + brand-switch)
 * Port adaptado de suite-web-territorio/shared/sidebar.js. Reusa las clases de
 * territorio-shell.css / glass-theme.css / skin-ds.css (no inventa estilos).
 * Default skin: Naowee DS (data-brand="ds").
 * ========================================================================== */
(function () {
  'use strict';
  var VERSION = 'v0.4.7';
  var BRAND_KEY = 'obras-ppto-brand';

  var ROLES = {
    ADMIN:   { who: 'Jesús Díaz', rol: 'Admin Naowee',       av: 'JD', col: 'var(--naowee-color-territorio-700)' },
    USUARIO: { who: 'Marta Ríos', rol: 'Usuario autorizado', av: 'MR', col: '#1f78d1' }
  };
  var ROLE_ORDER = ['ADMIN', 'USUARIO'];

  var IC = {
    home:  '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    book:  '<path d="M4 4h11a2 2 0 0 1 2 2v13H6a2 2 0 0 0-2 2V4z"/><path d="M17 19H6a2 2 0 0 0-2 2"/>',
    eye:   '<circle cx="12" cy="12" r="3"/><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>',
    calc:  '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h2M8 15h2M14 11h2M14 15h2"/>'
  };

  var NAV = [
    { head: 'General', items: [
      { label: 'Inicio', file: '../index.html', roles: 'ADMIN USUARIO', icon: IC.home }
    ]},
    { head: 'Presupuesto', items: [
      { label: 'Catálogo de Precios', file: 'catalogos.html', roles: 'ADMIN', icon: IC.book },
      { label: 'Consulta de catálogo', file: 'consulta.html', roles: 'ADMIN USUARIO', icon: IC.eye }
    ]},
    { head: 'Costos', items: [
      { label: 'Parámetros de Costos', file: '', roles: 'ADMIN', icon: IC.calc, soon: 'Fase 2' }
    ]}
  ];

  function qsGet(k) { return new URLSearchParams(location.search).get(k); }
  var role = (qsGet('role') || 'ADMIN').toUpperCase();
  if (!ROLES[role]) role = 'ADMIN';
  var PAGE = (location.pathname.split('/').pop() || '').toLowerCase() || 'index.html';

  function qs(r) { return '?role=' + (r || role); }
  function qsAll(extra) {
    var p = new URLSearchParams(location.search); p.set('role', role);
    if (extra) Object.keys(extra).forEach(function (k) { p.set(k, extra[k]); });
    return '?' + p.toString();
  }
  window.OBRAS_SHELL = { role: role, roleData: ROLES[role], qs: qs, qsAll: qsAll };
  if (document.body) document.body.dataset.role = role;

  function roleCan(roles) { return roles.split(' ').indexOf(role) !== -1; }
  function isActive(file) {
    if (!file) return false;
    var f = file.split('/').pop();
    if (f === PAGE) return true;
    if (file === 'catalogos.html' && PAGE === 'catalogo-detalle.html') return true;
    return false;
  }

  function navItemHTML(it) {
    var active = isActive(it.file) ? ' active' : '';
    var soon = it.soon ? ' t-nav-locked' : '';
    return '<a class="t-nav-item' + active + soon + '" data-roles="' + it.roles + '" data-go="' + (it.file || '') + '"' + (it.soon ? ' data-soon="1"' : '') + '>' +
      '<svg viewBox="0 0 24 24">' + it.icon + '</svg><span class="t-nav-label">' + it.label + '</span>' +
      (it.soon ? '<span class="t-nav-lock" style="margin-left:auto;font-size:9px;font-weight:800;letter-spacing:.03em;text-transform:uppercase;background:rgba(0,0,0,.06);padding:2px 7px;border-radius:999px">' + it.soon + '</span>' : '') + '</a>';
  }

  function renderSidebar() {
    var side = document.getElementById('tSide') || document.querySelector('.t-side');
    if (!side) return;
    var html = '<div class="t-brand t-brand--logo"><img class="t-brandlogo" src="../shared/logos/enterritorio.png" alt="enterritorio" width="1619" height="496"><span class="t-brandsub">Proyectos de Obra · Presupuesto</span></div><nav class="t-nav">';
    NAV.forEach(function (sec) {
      var vis = sec.items.filter(function (it) { return roleCan(it.roles); });
      if (!vis.length) return;
      if (sec.head) html += '<div class="t-nav-h">' + sec.head + '</div>';
      vis.forEach(function (it) { html += navItemHTML(it); });
    });
    html += '</nav><div class="t-side-foot">' +
      '<a class="t-logout" id="btnReset"><svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>Reiniciar demo</a>' +
      '<div class="t-side-ver"><b>Proyecto de Obras</b><span>' + VERSION + '</span></div></div>';
    side.innerHTML = html;

    side.querySelectorAll('.t-nav a[data-go]').forEach(function (a) {
      var go = a.dataset.go;
      a.setAttribute('tabindex', '0'); a.setAttribute('role', 'link');
      a.onclick = function () {
        if (a.dataset.soon) return;
        if (a.classList.contains('active')) return;
        location.href = go + (go.indexOf('index.html') >= 0 ? '?role=' + role : qs());
      };
      a.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); a.click(); } };
    });
    var rb = document.getElementById('btnReset');
    if (rb) rb.onclick = function () { if (window.OBRAS) window.OBRAS.reset(); location.reload(); };
  }

  // ── Rolepill (switch de perfil, abajo) ──
  function renderChrome() {
    if (document.getElementById('rolePill')) return;
    var btns = ROLE_ORDER.map(function (k) {
      var r = ROLES[k];
      return '<button data-role="' + k + '"' + (k === role ? ' class="sel"' : '') + ' onclick="setRole(this)">' +
        '<span class="ava" style="background:' + r.col + ';color:#fff;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:10px;font-weight:700">' + r.av + '</span>' +
        '<span>' + r.who + '<small>' + r.rol + '</small></span></button>';
    }).join('');
    var panel = document.createElement('div');
    panel.className = 't-rolepanel'; panel.id = 'rolePanel';
    panel.innerHTML = '<div class="ph">Cambiar perfil (demo)</div>' + btns;
    var pill = document.createElement('div');
    pill.className = 't-rolepill'; pill.id = 'rolePill';
    pill.innerHTML = '<span class="demo-tag">DEMO</span><span class="ava" id="pillAva"></span><span class="who" id="pillWho"></span>' +
      '<button class="chg" onclick="togglePanel()">Cambiar perfil <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:-2px"><path d="M6 15l6-6 6 6"/></svg></button>';
    document.body.appendChild(panel); document.body.appendChild(pill);
  }

  function syncIdentity() {
    var r = ROLES[role];
    function setText(id, t) { var el = document.getElementById(id); if (el) el.textContent = t; }
    function setHTML(id, h) { var el = document.getElementById(id); if (el) el.innerHTML = h; }
    var ident = r.who + '<small>' + r.rol + '</small>';
    setText('pillAva', r.av); setHTML('pillWho', ident);
    setText('ucAva', r.av); setHTML('ucWho', ident);
    var pa = document.getElementById('pillAva'); if (pa) pa.style.background = r.col;
    var ua = document.getElementById('ucAva'); if (ua) ua.style.background = r.col;
    document.querySelectorAll('.t-rolepanel button[data-role]').forEach(function (b) { b.classList.toggle('sel', b.dataset.role === role); });
  }

  window.setRole = function (btn) {
    var nr = btn.dataset.role;
    var target = location.pathname.split('/').pop();
    if (nr === 'USUARIO' && (target === 'catalogos.html' || target === 'catalogo-detalle.html')) target = 'consulta.html';
    location.href = target + '?role=' + nr;
  };
  window.togglePanel = function () {
    var p = document.getElementById('rolePanel'), pill = document.getElementById('rolePill');
    if (!p || !pill) return; p.style.width = pill.offsetWidth + 'px'; p.classList.toggle('open');
  };
  document.addEventListener('click', function (e) {
    var p = document.getElementById('rolePanel');
    if (p && p.classList.contains('open') && !p.contains(e.target) && !(e.target.closest && e.target.closest('#rolePill'))) p.classList.remove('open');
  });

  function wireDrawer() {
    var ham = document.getElementById('hamburger'), side = document.querySelector('.t-side'), ov = document.getElementById('sideOverlay');
    if (!ham || !side) return;
    function close() { side.classList.remove('open'); if (ov) ov.classList.remove('open'); document.body.style.overflow = ''; }
    ham.addEventListener('click', function () { if (side.classList.contains('open')) close(); else { side.classList.add('open'); if (ov) ov.classList.add('open'); document.body.style.overflow = 'hidden'; } });
    if (ov) ov.addEventListener('click', close);
  }

  // ── Brand switch: Territorio (cian) · Naowee (naranja) · Naowee DS (plano) ──
  function dsAvailable() { return !!document.querySelector('link[href*="skin-ds"]'); }
  function getBrand() { try { var v = localStorage.getItem(BRAND_KEY); return (v === 'naowee' || v === 'territorio') ? v : 'ds'; } catch (e) { return 'ds'; } }
  function applyBrand(b) { if (b === 'ds' && !dsAvailable()) b = 'territorio'; document.documentElement.setAttribute('data-brand', (b === 'naowee' || b === 'ds') ? b : 'territorio'); }
  function injectSwStyle() {
    if (document.getElementById('obrasSwStyle')) return;
    var st = document.createElement('style'); st.id = 'obrasSwStyle';
    st.textContent =
      '.t-brandsw{position:relative;display:inline-grid;grid-template-columns:repeat(var(--sw-n,3),1fr);align-items:stretch;height:44px;box-sizing:border-box;padding:3px;border-radius:999px;background:rgba(255,255,255,.72);-webkit-backdrop-filter:blur(14px) saturate(160%);backdrop-filter:blur(14px) saturate(160%);border:1px solid rgba(255,255,255,.68);box-shadow:0 4px 18px -6px rgba(16,40,60,.16)}' +
      '.t-brandsw::before{content:"";position:absolute;top:3px;bottom:3px;left:3px;width:calc((100% - 6px)/var(--sw-n,3));border-radius:999px;background:var(--t-board,#fff);box-shadow:0 1px 3px rgba(16,40,60,.14);transition:transform .32s cubic-bezier(.32,.72,0,1);z-index:0}' +
      '.t-brandsw:has(.t-brandsw-opt[data-brand-val="naowee"][aria-pressed="true"])::before{transform:translateX(100%)}' +
      '.t-brandsw:has(.t-brandsw-opt[data-brand-val="ds"][aria-pressed="true"])::before{transform:translateX(200%)}' +
      '.t-brandsw-opt{position:relative;z-index:1;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:0;background:none;cursor:pointer;font-family:inherit;font-size:12.5px;font-weight:600;color:var(--t-text-2,#6b7480);padding:0 14px;border-radius:999px;transition:color .25s ease;line-height:1}' +
      '.t-brandsw-opt[aria-pressed="true"]{color:var(--t-text,#1b2330)}' +
      '.t-brandsw-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;box-shadow:0 0 0 2px rgba(255,255,255,.7)}' +
      '@media(max-width:900px){.t-brandsw-lbl{display:none}.t-brandsw-opt{padding:0 10px}}';
    document.head.appendChild(st);
  }
  function brandPill() {
    var right = document.querySelector('.t-topbar-right');
    if (!right || document.getElementById('brandSw')) return;
    injectSwStyle();
    var cur = getBrand(); if (cur === 'ds' && !dsAvailable()) cur = 'territorio';
    var opts = [{ v: 'territorio', label: 'Territorio', dot: '#0B7E96' }, { v: 'naowee', label: 'Naowee', dot: '#FF7500' }];
    if (dsAvailable()) opts.push({ v: 'ds', label: 'Naowee DS', dot: '#D74009' });
    var sw = document.createElement('div'); sw.className = 't-brandsw'; sw.id = 'brandSw';
    sw.style.setProperty('--sw-n', opts.length); sw.setAttribute('role', 'group'); sw.setAttribute('aria-label', 'Tema de marca');
    sw.innerHTML = opts.map(function (o) {
      return '<button type="button" class="t-brandsw-opt" data-brand-val="' + o.v + '" aria-pressed="' + (o.v === cur ? 'true' : 'false') + '"><span class="t-brandsw-dot" style="background:' + o.dot + '"></span><span class="t-brandsw-lbl">' + o.label + '</span></button>';
    }).join('');
    right.insertBefore(sw, right.firstChild);
    sw.querySelectorAll('.t-brandsw-opt').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-brand-val'); applyBrand(v);
        try { localStorage.setItem(BRAND_KEY, v); } catch (e) {}
        sw.querySelectorAll('.t-brandsw-opt').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      });
    });
  }

  function boot() {
    applyBrand(getBrand());
    renderSidebar(); renderChrome(); syncIdentity(); brandPill(); wireDrawer();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
