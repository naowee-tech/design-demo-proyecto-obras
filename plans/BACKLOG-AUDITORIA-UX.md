# Backlog · hallazgos de la auditoría UX (2026-09-22)

Anotados para después: no son parte del rediseño de flujos y patrones que se está haciendo ahora.
Fuente: 4 auditorías (flujos, componentes, datos, accesibilidad) sobre v0.6.0.

## Bug de modelo (prioridad alta)
- **La versión saliente se congela con cambios posteriores a su publicación.** `nuevaVersion` toma el snapshot del contenido *actual* al crear la siguiente (`data-catalogo.js`, `nuevaVersion`). Reproducido: editar un precio sobre v1.3 y crear v1.4 deja v1.3 con el precio nuevo (3 presupuestos están en v1.3). El rediseño lo resuelve con "borrador de trabajo vs versión publicada"; si no, tomar el snapshot al publicar.
- Mensajes contradictorios: "el cambio aplica desde la próxima versión" (`ui.js`) vs "están activos en el catálogo" (Versiones). Consulta muestra el contenido en vivo con la etiqueta de la versión activa.

## Accesibilidad (WCAG 2.2 AA · 34 hallazgos: 6 bloqueantes, 10 altos, 10 medios, 8 bajos)
Bloqueantes:
1. `.naowee-dropdown` no operable con teclado (Región obligatoria al crear, Nivel al crear ítem, filtros). Patrón combobox/listbox o `<select>` nativo.
2. Menú kebab `#rowMenu` inalcanzable por teclado; editar ítem imposible sin mouse.
3. Modales sin `role=dialog`, sin foco inicial, sin trampa, sin Escape, sin retorno de foco (incluye `confirmarCambios`).
4. Consulta: contenido de acordeones cerrados sigue en el orden de Tab (159 paradas ocultas) → `hidden`/`inert`.
5. Modal "Crear catálogo" no hace scroll a 320 px / 200 % (override `overflow:visible`); el lanzador del tour tapa "Guardar".
6. Switch "admite ítems" sin foco ni teclado.
Altos: foco no visible (botones loud, campos, sidebar); buscador de dropdown cerrado enfocable; labels sin `for` y obligatorios sin `aria-required`; errores sin `aria-invalid`/`aria-describedby`; datepicker sin flechas ni nombres de día; encabezados ordenables sin teclado ni `aria-sort`; panel lateral de Consulta sin `inert` al cerrar; contraste (filas ghost 1.8–2.8:1, chips, conteos, `<code>`, lanzador del tour 2.7:1); carga masiva sin anuncios y foco perdido entre pasos; tour sin semántica de diálogo.
Medios/bajos: tabs sin flechas; treegrid incompleto; `aria-expanded` en `<tr>`; toast con enlace que desaparece a 3,2 s; contadores sin live region; H1→H3; sidebar con `<a>` sin href y sin `aria-current`; radiogroup sin flechas; elementos fijos tapan foco; sin skip link; tablas sin caption/scope.
Detalle completo y evidencias: scratchpad de la sesión `ux-a11y/`.

## Presentación de datos
- "Valor total del catálogo" y total de capítulo suman precios unitarios de unidades distintas (m², m³, kg): reemplazar por conteos o marcarlos como referencia; el APU debe mostrar **precio unitario por unidad** ($672.479 / m³).
- Herramienta menor se lee "1 × $0 = $295": mostrar "5 % × MO" y V. unitario "—".
- Cantidades con punto y sin significado (`0.0319`): formato es-CO y "por m³ del APU".
- Unidad del APU no editable y solo visible en Consulta.
- Regiones sin tilde ("Bogota", "Guania"); la condición adicional no se ve en Detalle ni Consulta.
- "Tipo" usado para dos cosas (nivel del esquema vs tipo de insumo).
- KPI "Ítems" cuenta insumos (159) cuando el gestor piensa en APU (45); "Ítems totales 636" mezcla catálogos no activos.
- Sin marca visual común para "dato calculado"; V. total editable en el formulario (cálculo en 3 direcciones) confunde el origen.
- Plantilla P2 se genera al leer (no por un cambio real) y no queda en auditoría.
- Tabla del snapshot sin recalcular (herramienta menor $0) y sin columna APU; snapshot sin esquema.
- Auditoría: "Ítem · MO-01" sin APU; semilla habla de ítems "1.1"/"3.4" que ahora son niveles.
- Consulta oculta totales al filtrar y los KPI no cambian.
- Colores de estado usados para categorías (MO verde, Equipo ámbar); acciones de auditoría todas `informative`.
- Contradicción en el plan: D3 vs D2 (datos generales y versionamiento).

## Componentes (deuda con el DS)
- 6 componentes propios que ya existen en el DS: `t-empty`→`naowee-empty-state`, `t-drop`→`naowee-file-uploader`, `t-esq-chip`→`naowee-tag`, `t-toast`→`naowee-snackbar`, `t-kebab`→`naowee-btn --icon`, `t-esq-add-*`→textfield/botón DS; 3 stat-cards distintas (`t-kpi`, `t-statchip`, `vg-card`).
- 92 (detalle) y 110 (consulta) `style=` inline; anchos de dropdown distintos en cada filtro.
- Móvil: solo la tabla de la lista pasa a tarjetas; el resto desborda; carga masiva desborda la página; tabs cortadas sin indicio; botón del tour (z-index 8000) tapa el CTA de los modales.
- Sin paginación en Ítems (159 filas).
