/* ============================================================================
 * Proyecto de Obras — SHELL (sidebar + rolepill)
 * Port adaptado de suite-web-territorio/shared/sidebar.js. Reusa las clases de
 * territorio-shell.css / glass-theme.css (no inventa estilos).
 * Skin único: Territorio (cian + glass), igual que suite-web-territorio.
 * ========================================================================== */
(function () {
  'use strict';
  var VERSION = 'v0.5.1';

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
  // Guarda de página: el menú ya esconde lo de ADMIN, pero la URL directa
  // (catalogos.html?role=USUARIO) dejaba editar. Se conserva ?proyecto= y ?cat=.
  var SOLO_ADMIN = { 'catalogos.html': 1, 'catalogo-detalle.html': 1 };
  if (SOLO_ADMIN[PAGE] && role !== 'ADMIN') {
    var dest = new URLSearchParams(); dest.set('role', role);
    ['proyecto', 'cat'].forEach(function (k) { var v = qsGet(k); if (v) dest.set(k, v); });
    location.replace('consulta.html?' + dest.toString());
    return;
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

  function boot() {
    renderSidebar(); renderChrome(); syncIdentity(); wireDrawer();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
