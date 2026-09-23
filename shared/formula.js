/* ============================================================================
 * Proyecto de Obras · Presupuesto — Motor de fórmulas (PPTO-08, 10)
 * Lenguaje mínimo y seguro (sin eval ni Function): tokenizer + descenso recursivo.
 *
 *   expr    := term   (('+' | '-') term)*
 *   term    := unary  (('*' | '/' | '×' | '÷') unary)*
 *   unary   := ('-' | '+') unary | postfix
 *   postfix := primary ('%')*                 25% → 0.25 · desperdicio% → desperdicio / 100
 *   primary := NÚMERO | CAMPO | SUMA '(' items | items.CAMPO | hijos ')' | '(' expr ')'
 *
 * Dos contextos:
 *  - Fórmula de ÍTEM: usa los campos numéricos del ítem (cantidad, valorUnit, propios).
 *  - Fórmula de NIVEL: usa agregados — SUMA(items), SUMA(items.campo), SUMA(hijos).
 * Los nombres no distinguen mayúsculas ni tildes; los decimales aceptan coma o punto.
 * ========================================================================== */
(function () {
  'use strict';
  function norm(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function err(m) { var e = new Error(m); e.fx = true; return e; }

  function tokenize(s) {
    var t = [], i = 0, m;
    while (i < s.length) {
      var c = s[i], rest = s.slice(i);
      if (/\s/.test(c)) { i++; continue; }
      if ((m = /^\d+(?:[.,]\d+)?/.exec(rest))) { t.push({ k: 'num', v: parseFloat(m[0].replace(',', '.')), p: i }); i += m[0].length; continue; }
      // Letras con tilde (À-Ö, Ø-ö, ø-ÿ): el rango completo À-ÿ incluye × y ÷, que son operadores.
      if ((m = /^[A-Za-zÀ-ÖØ-öø-ÿ_][\wÀ-ÖØ-öø-ÿ]*(?:\.[A-Za-zÀ-ÖØ-öø-ÿ_][\wÀ-ÖØ-öø-ÿ]*)?/.exec(rest))) { t.push({ k: 'id', v: norm(m[0]), raw: m[0], p: i }); i += m[0].length; continue; }
      if ('+-*/()%×÷'.indexOf(c) >= 0) { t.push({ k: 'op', v: c === '×' ? '*' : c === '÷' ? '/' : c, p: i }); i++; continue; }
      throw err('Carácter no permitido «' + c + '» en la posición ' + (i + 1) + '.');
    }
    return t;
  }

  // spec: { nivel: bool, campos: {claveNorm: etiqueta}, itemCampos: {claveNorm: etiqueta}, admiteItems: bool }
  function compilar(src, spec) {
    spec = spec || {};
    if (!src || !String(src).trim()) throw err('La fórmula está vacía.');
    var t = tokenize(String(src)), i = 0, refs = [], avisos = [];
    var campos = spec.campos || {}, itemCampos = spec.itemCampos || {};
    function is(v) { return t[i] && t[i].k === 'op' && t[i].v === v; }
    function expect(v) {
      if (!is(v)) throw err(t[i] ? 'Se esperaba «' + v + '» en la posición ' + (t[i].p + 1) + '.' : 'Falta cerrar el paréntesis «)».');
      i++;
    }
    function expr() { var n = term(); while (is('+') || is('-')) { var o = t[i++].v; n = { op: o, a: n, b: term() }; } return n; }
    function term() { var n = unary(); while (is('*') || is('/')) { var o = t[i++].v; n = { op: o, a: n, b: unary() }; } return n; }
    function unary() { if (is('-')) { i++; return { op: 'neg', a: unary() }; } if (is('+')) { i++; return unary(); } return postfix(); }
    function postfix() { var n = primary(); while (is('%')) { i++; n = { op: '*', a: n, b: { num: 0.01 } }; } return n; }
    function primary() {
      var k = t[i];
      if (!k) throw err('La fórmula está incompleta: falta un valor al final.');
      if (k.k === 'num') { i++; return { num: k.v }; }
      if (is('(')) { i++; var n = expr(); expect(')'); return n; }
      if (k.k !== 'id') throw err('El operador «' + k.v + '» está fuera de lugar (posición ' + (k.p + 1) + ').');
      i++;
      if (k.v === 'suma') {
        if (!spec.nivel) throw err('SUMA(...) solo se puede usar en la fórmula de un nivel, no en la de un ítem.');
        expect('(');
        var a = t[i];
        if (!a || a.k !== 'id') throw err('SUMA necesita un argumento: SUMA(items), SUMA(hijos) o SUMA(items.campo).');
        i++; expect(')');
        var p = a.v.split('.');
        if (p[0] !== 'items' && p[0] !== 'hijos') throw err('SUMA(' + a.raw + ') no es válido. Usa SUMA(items), SUMA(hijos) o SUMA(items.campo).');
        if (p[1] && p[0] !== 'items') throw err('Solo SUMA(items.campo) admite un campo.');
        if (p[1] && !itemCampos[p[1]]) throw err('El campo «' + a.raw.split('.')[1] + '» no existe o no es numérico en los ítems de este nivel. Numéricos: ' + (Object.keys(itemCampos).map(function (x) { return itemCampos[x]; }).join(', ') || 'ninguno') + '.');
        if (p[0] === 'items' && spec.admiteItems === false) avisos.push('Este nivel no admite ítems: SUMA(items) siempre dará 0.');
        if (p[0] === 'hijos' && !spec.tieneHijos) avisos.push('Este nivel no tiene subniveles: SUMA(hijos) dará 0.');
        return { agg: p[0], campo: p[1] || null };
      }
      if (spec.nivel) throw err('«' + k.raw + '» no es válido en la fórmula de un nivel. Usa SUMA(items), SUMA(hijos) o SUMA(items.campo).');
      if (!campos[k.v]) throw err('Campo desconocido «' + k.raw + '». Campos numéricos disponibles: ' + (Object.keys(campos).map(function (x) { return campos[x]; }).join(', ') || 'ninguno') + '.');
      refs.push(k.v); return { ref: k.v };
    }
    var ast = expr();
    if (i < t.length) throw err('Sobra «' + (t[i].raw || t[i].v) + '» en la posición ' + (t[i].p + 1) + '. ¿Falta un operador?');
    return { ast: ast, refs: refs, avisos: avisos };
  }

  // env: { ref(claveNorm) → número, agg(tipo, campo) → número }
  function evaluar(n, env) {
    if ('num' in n) return n.num;
    if (n.ref) { var v = env.ref(n.ref); return v == null || v === '' || isNaN(+v) ? 0 : +v; }
    if (n.agg) return env.agg(n.agg, n.campo);
    if (n.op === 'neg') return -evaluar(n.a, env);
    var a = evaluar(n.a, env), b = evaluar(n.b, env);
    if (n.op === '+') return a + b;
    if (n.op === '-') return a - b;
    if (n.op === '*') return a * b;
    if (b === 0) throw err('División por cero.');
    return a / b;
  }

  window.OBRAS_FX = {
    norm: norm,
    compilar: compilar,
    evaluar: evaluar,
    // No lanza: { ok, error } — lo que usan los formularios para validar en vivo.
    validar: function (src, spec) {
      try { var r = compilar(src, spec); return { ok: true, avisos: r.avisos, refs: r.refs, ast: r.ast }; }
      catch (e) { if (!e.fx) throw e; return { ok: false, error: e.message }; }
    },
    // Compila y evalúa en un paso. Lanza con mensaje en español si algo falla.
    calcular: function (src, spec, env) { return evaluar(compilar(src, spec).ast, env); }
  };
})();
