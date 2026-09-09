/* ============================================================================
 * Naowee · Territorio · Habilitaciones — Namespacing por proyecto (?proyecto=)
 * ----------------------------------------------------------------------------
 * Aísla las claves de DATOS `territorio-hab-*` por proyecto, de forma
 * TRANSPARENTE: intercepta localStorage y añade el sufijo `::<proyecto>` a las
 * claves de datos, sin que el resto del código tenga que cambiar.
 *
 * - `territorio-hab-brand` NO se namespacea (es preferencia de UI global).
 * - Las claves que ya traen `::` no se vuelven a sufijar (evita doble-sufijo en
 *   iteraciones del "Reiniciar demo").
 *
 * DEBE cargarse en el <head>, antes de cualquier acceso a datos (sidebar.js y
 * los scripts de página corren en el <body>, así que este shim ya está activo).
 * ========================================================================== */
(function () {
  try {
    var proy = ((new URLSearchParams(location.search).get('proyecto')) || 'default').trim() || 'default';
    var SUFFIX = '::' + proy;
    function nk(k) {
      if (typeof k === 'string' && k.indexOf('obras-ppto-') === 0 && k !== 'obras-ppto-brand' && k.indexOf('::') < 0) {
        return k + SUFFIX;
      }
      return k;
    }
    var P = window.Storage && window.Storage.prototype;
    if (!P) return;
    var _get = P.getItem, _set = P.setItem, _rem = P.removeItem;
    P.getItem = function (k) { return _get.call(this, nk(k)); };
    P.setItem = function (k, v) { return _set.call(this, nk(k), v); };
    P.removeItem = function (k) { return _rem.call(this, nk(k)); };
    window.TERR_PROYECTO = proy;
  } catch (e) { /* si algo falla, el demo sigue con el store global (degradación segura) */ }
})();
