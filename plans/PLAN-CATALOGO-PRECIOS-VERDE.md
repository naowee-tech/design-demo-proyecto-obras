# Plan de trabajo — Catálogo de Precios Fase I · las 21 HU en verde

> **Fecha:** 2026-09-22 · **Base:** `main` @ `220994e` + trabajo sin commitear v0.4.9 (unificación a skin Territorio, borrado de `skin-ds.css`/`skin-gris.css`).
> **Meta:** que cada criterio de aceptación de PPTO-01..21 se pueda **ver funcionando** en la demo, y que el **recorrido guiado** de cada HU narre solo lo que la demo hace.
> **Fuentes de la investigación:** auditoría criterio por criterio (código + tour), diseño del modelo jerárquico y de fórmulas, inventario de componentes DS y documentos de flujo (`docs/FLUJO-PRESUPUESTO-FASE-I.html`, `docs/flujo-fase-i.workflow.json`).

---

## 0. Estado de partida

| | HU |
|---|---|
| ✅ Verde | 03, 09, 15, 16, 17, 19 (con retoques menores) |
| 🟡 Parcial | 01, 04, 06, 07, 08, 10, 12, 14, 18, 20, 21 |
| 🔴 Rojo | 02, 05, 11, 13 |

**Tour roto hoy** (se cae y cierra el modal):
- **PPTO-06** apunta a `#mMotivo` (overlay `position:fixed` → `offsetParent` null) — `shared/tour.js:65`.
- **PPTO-10** apunta a `#itNombre`, que no existe (el campo real es `#itf-nombre` y solo aparece tras elegir nivel) — `shared/tour.js:98`.
- **PPTO-13** apunta a `#cargaPrev`, vacío hasta subir archivo.

**Tour que promete cosas que no existen:** 02 y 05 (resumen de cambios), 04 (nombre repetido), 07 (fecha y filtro), 08 (validación de fórmula), 12 (.xlsx), 13 (validación de versión, vista previa), 14 (descargar reporte), 18 (tipo, filtro por nivel), 20 (responsable, rango, conteo), 21 (Excel/PDF, fecha, visible filtrado).

**Regla de cierre del plan:** una HU es verde cuando (1) cada criterio tiene evidencia en pantalla, (2) su tour corre de punta a punta sin caerse y narra solo lo real, (3) su fila está marcada en la matriz de la sección 9.

---

## 1. Decisiones de producto (a validar con Danna antes de la fase 5)

Defaults recomendados — el plan se construye con ellos; si producto decide otra cosa, cambia la fase indicada.

| # | Pregunta | Default propuesto | Afecta |
|---|---|---|---|
| D1 | ¿Al crear, el catálogo nace Activo o Borrador? | **Activo** (lo pide PPTO-01.4). Borrador queda como opción explícita del selector de estado. | F2 |
| D2 | ¿Qué pasa al editar algo usado en presupuestos activos? | **Avisa y sugiere crear versión**; no bloquea. | F1, F2 |
| D3 | ¿Editar datos generales (nombre, condición, vigencia) cuenta como cambio sin versionar? | **Sí.** | F2 |
| D4 | ¿El esquema de niveles es por proyecto o por catálogo? | **Por catálogo**, copiado de la base al crear y congelado en cada versión. | F5 |
| D5 | ¿"Ítem" es un nivel? | **No.** Es la hoja; "admite ítems" marca qué niveles los tienen. | F5 |
| D6 | ¿Un nivel puede tener hijos e ítems a la vez? ¿Ítems a varias profundidades? | **Sí y sí** (PPTO-09.2). | F5 |
| D7 | Profundidad estricta (padre = profundidad − 1) | **Estricta**, máximo 6. | F5 |
| D8 | Opciones de valor del nivel | **Suma automática (default) · Fórmula · Valor fijo · Sin valor (no suma al padre).** | F4 |
| D9 | Valor fijo en un nivel con ítems | **Reemplaza** la suma y avisa si difiere. | F4 |
| D10 | ¿Fórmulas con referencias entre nodos (AIU)? | **No en v1**; solo `SUMA(items)`, `SUMA(hijos)`, `SUMA(items.campo)` y campos del ítem. | F4 |
| D11 | Redondeo | Ítem al peso; nodos suman exacto; resultado de fórmula de nodo se redondea una vez. | F4 |
| D12 | Desactivar un nodo | **Cascada** a descendientes e ítems, que salen de los totales. Se agrega **Reactivar**. | F2, F5 |
| D13 | Código de nivel/ítem | **Único en todo el catálogo.** | F2 |
| D14 | Responsable en auditoría | **El usuario del rol activo** (`OBRAS_SHELL.roleData.who`), no "Jesús Díaz" fijo. | F1 |

Quedan abiertas del BPMN (no bloquean este plan): quién activa el catálogo y si hay aprobación previa (H-6), "otro administrador de cara al cliente" como cuarto rol, precedencia región vs. "Todos · base nacional".

---

### 1b. Cierre de decisiones — 2026-09-22 (con las fuentes de `PR_03.01.01_FASE_I`)

Fuentes: Recepción de Requerimiento (Gate 0, 2026-09-07), flujo PR-09_FP (2026-08-10), matriz de HU PR-09_VM (2026-08-06) y la **matriz real de precios** (Base Matriz 2026-agosto-26 y Guajira + 15L). Ninguna cierra D4-D7 de forma explícita; se cierran por evidencia.

| # | Decisión cerrada | Evidencia |
|---|---|---|
| D4 | **Esquema de niveles por catálogo**, con nombres y cantidad configurables; plantilla por defecto **Capítulo → APU**. | PPTO-04 obs. ("cada proyecto define nombres y cantidad"); el flujo FP crea niveles dentro de cada catálogo; el bloque L15 de Guajira usa otra taxonomía de capítulos que la base → no puede ser global. |
| D5 | **El ítem es la hoja, no un nivel.** En la matriz real el ítem es el **insumo** (código, nombre, tipo, unidad, cantidad, valor unitario, valor total) y el **APU** es el nivel que admite ítems y vale la suma de ellos. | Recepción F-3/F-4 ("niveles que admiten ítems"); PPTO-09 obs.; PPTO-18.2 pide cantidad y valor total en el ítem → encaja con la línea de insumo. Matriz: capítulo → APU → insumo, 3 niveles, APU = SUM(insumos). |
| D6 | **Se permite** que un nivel tenga subniveles e ítems, pero la plantilla por defecto no los mezcla. | PPTO-09.2 (varios niveles admiten ítems); la matriz nunca los mezcla. Permitirlo no cuesta y no contradice nada. |
| D7 | **Profundidad estricta** (el hijo es del tipo siguiente), **máximo 6**. | Silencio en todos los documentos; la matriz tiene 3 y la estructura EnTerritorio que citan las HU tiene 4 eslabones. |
| D8 | Valor del nivel: **suma automática** por defecto (el APU suma sus insumos; el capítulo suma sus APU), fórmula, fijo o sin valor. Ya implementado en F4. | PPTO-08 obs. ("niveles superiores muestran el total sumado"); matriz: APU = SUM(insumos). |
| D10 | Fórmulas: **sumas y porcentajes simples**; sin referencias entre nodos (el AIU es del presupuesto, no del catálogo). Se agrega **una** referencia dentro del mismo nivel filtrada por tipo: `SUMA(tipo.MO)`, para la **herramienta menor = 5 % de la mano de obra del APU**. | Recepción p.3 (fuera de alcance "motor avanzado más allá de sumas y porcentajes"); PPTO-10.2 ("algunos [ítems] pueden tener relación con el nivel"); matriz: herramienta menor = 5 % × MO en 262 de 265 APU; AIU ausente de la matriz (PPTO-28: "el AIU se deduce del total del presupuesto"). |
| D15 | **Tipo de ítem** = lista configurable por nivel; valores por defecto los de la matriz: **Material · MO · Equipo · Transporte**. El filtro de Consulta (PPTO-18) trabaja sobre la lista que tenga el nivel. | Matriz: 4 tipos cerrados (INSUMO, MO, EQUIPO, TRANSPORTE). PPTO-18.3 cita "(producto o servicio)" como ejemplo; PPTO-10.6 "el ítem puede ser cualquier tipo de dato". |
| D1 | **Nace Activo** (ya implementado). Borrador queda como opción explícita, no como paso obligatorio. **Sin paso de aprobación** en Fase I (H-6 queda abierto para producto). | PPTO-01.4 "queda activo"; Recepción p.5 marca "[¿Borrador?]" y H-6 como duda. |
| D16 | **Condición de aplicación = región + otra condición opcional** (texto: "Gestores", "Proyecto Esquemas"…). Se retira la opción inventada "Todos · base nacional" y la pregunta de precedencia. | PPTO-01 obs. ("Base de precios gestores de Guajira", "base de precios general proyecto esquemas"); ninguna fuente menciona un catálogo nacional; en la matriz la base es Bogotá, no "nacional". |
| D2 | Impacto sobre presupuestos (PPTO-02 "se deben definir reglas"): **avisa y sugiere versión; no bloquea**. Cambiar datos generales no exige versión; precios, valores y estructura se acumulan para la próxima. Ya implementado en F1. | PPTO-15.1 (versión "cuando se modifiquen precios, valores, etc."); PPTO-15.4 y F-6 (los presupuestos quedan en su versión). |
| — | **Variación regional por factores** (base Bogotá × factor por tipo; MO siempre 1,0) → **backlog**, no bloquea ninguna HU. Hoy cada región es su propio catálogo, como piden las HU. | Matriz: 33 hojas idénticas con factores por tipo; LINEAMIENTOS: "la calibración territorial nunca modifica la mano de obra". |
| — | **Carga masiva**: se agregan validaciones vistas en los datos reales — alias de unidades (`lm`→`ml`, `libra`→`lb`), tipo con espacios, fila sin padre. | Matriz (unidades sin normalizar, `EQUIPO ` con espacio, 2 insumos huérfanos). |

**Siguen abiertas, sin bloquear la demo:** H-6 aprobación antes de activar · H-8 partición en dos épicas · formato de plantilla "validar con analítica" (PPTO-12) · permisos del "otro administrador de cara al cliente" (PPTO-02) · significado de "L15" en Guajira.

**Impacto en F5:** la semilla pasa a **Capítulo → APU → insumos** (valores sintéticos, mismo orden de magnitud): los 7 capítulos quedan como nivel 1, cada APU actual pasa a nivel 2 con 3-6 insumos (MO, Material, Equipo, Transporte) y una línea de *herramienta menor* con `5% * SUMA(tipo.MO)`. Los totales por APU se conservan aproximadamente.

## 2. Arquitectura de las piezas compartidas

Se construyen una vez y las consumen varias HU.

### P1 · Resumen de cambios (diff) — 02, 05, 11
- `OBRAS.diff(antes, despues, etiquetas)` en `shared/data-catalogo.js` → `[{campo, etiqueta, antes, despues}]`.
- Modal nuevo `#mCambios` en `catalogo-detalle.html` y `catalogos.html` (`.naowee-modal--wide`, `.naowee-table--compact` de 3 columnas: Campo · Antes · Después).
- Slot `#mCambiosImpacto` para P3 (`.naowee-message--caution`).
- Botones: *Volver a editar* (mute) · *Confirmar cambios* (loud).
- Sin cambios → no abre el modal, muestra toast "Sin cambios que guardar" (`.t-toast`).
- Helper `confirmarCambios({titulo, cambios, impacto}) → Promise<boolean>` en `shared/ui.js`.

### P2 · Auditoría con detalle — 02, 05, 06, 11, 13, 14, 19, 21
- `logAudit(cat, accion, elemento, resp, detalle)` — `detalle` opcional: `{cambios:[...]}` o `{motivo}` o `{archivo, ok, fail}`.
- `resp` por defecto = usuario del rol activo (D14).
- Tabla de auditoría: fila con chevron si trae detalle; al expandir, sub-tabla antes/después o motivo.
- Ordenar siempre por fecha+hora descendente al pintar (hoy la semilla va con `push` y lo vivo con `unshift`).
- Semilla de auditoría coherente con `creado` y fechas de versión (hoy Vichada figura creada hace 120 días en versiones y 20 en auditoría).

### P3 · Presupuestos de ejemplo vinculados — 02, 11, 15
- En la semilla: `obras-ppto-presupuestos` con 3 registros ligados a *Vivienda Rural — Bogotá 2026* v1.3 (y 1 a v1.0), cada uno con `itemsUsados` (p. ej. 1.1, 3.4, 4.4).
- API: `presupuestosDe(catId)`, `presupuestosConItem(catId, itemId)`.
- Bloque de aviso reutilizable: "Este cambio afecta **N presupuestos activos**: …. Los presupuestos quedan en su versión; el cambio aplica a la próxima. Te sugerimos crear una nueva versión."
- En Versiones (PPTO-15/16): columna "Presupuestos vinculados" por versión.

### P4 · Motor de fórmulas — 08, 10, 17
- Archivo nuevo `shared/formula.js` → `window.OBRAS_FX` con `compilar`, `evaluar`, `validar`. Tokenizer + descenso recursivo, **sin `eval`/`Function`**.
- Gramática: números (`,` o `.`), `+ - * / × ÷`, paréntesis, `%` sufijo, campos numéricos del ítem, `SUMA(items)`, `SUMA(hijos)`, `SUMA(items.campo)`. Nombres sin tildes ni mayúsculas.
- Dos contextos: fórmula de **ítem** (solo sus campos) y de **nivel** (solo agregados).
- Mensajes de error en español con posición ("Falta cerrar el paréntesis", "Campo desconocido «x». Disponibles: …", "SUMA(...) solo en fórmulas de nivel").
- `OBRAS.calcular(cat)` → `{item, nodo, errores, total}`: ítems primero, nodos de abajo hacia arriba; inactivos fuera; `valorTotal` queda como caché. `totalCatalogo` delega en `calcular` (memoizado por revisión).
- Error en runtime → valor `null`, badge negativo "Error de fórmula", cuenta 0 hacia arriba, contador en cabecera.
- Carga en `catalogos.html`, `catalogo-detalle.html`, `consulta.html` **antes** de `data-catalogo.js`.
- Prueba aislada: `node` sobre una tabla de casos (válidos, cada error, `%`, coma decimal, división por cero) antes de cablear UI.

### P5 · Jerarquía real (esquema + nodos) — 04, 05, 07, 17
- `cat.esquema[]` = **tipos de nivel** `{id, nombre, profundidad, descripcion, admiteItems, campos, formulaItem, valorTipoDefault, formulaDefault, activo, creado}`.
- `cat.niveles[]` se conserva como **nodos** + `tipoId`, `padreId`, `creado` (así no se rompen snapshots, tour `catMode`, ni KPI).
- Semilla: Categoría → Capítulo. Nodos A "Obra gris" (caps 1-5), B "Acabados e instalaciones" (8, 16), C "Costos indirectos" (valor fijo). Pinturas con fórmula `SUMA(items) * 1.05` y un ítem con `cantidad * valorUnit * (1 + desperdicio)`.
- Reglas: nombre de tipo único en el esquema; nombre de nodo único entre hermanos; padre de profundidad − 1; no mover bajo un descendiente.
- **Migración in-place idempotente** `migrarCatalogo(cat)` dentro de `ensure()` (también sobre cada `snapshot`), marca `schemaV: 2`. Mismo `LS_KEY`; "Reiniciar demo" sigue sirviendo.
- UI: panel "Esquema de niveles" (`.t-esq-panel` + chips) y tabla-árbol (`role="treegrid"`, `.t-tree-cell` con sangría por `--lvl`, chevron). En Consulta, acordeones anidados.

### P6 · Exportación — 14, 21
- `exportar({nombre, columnas, filas, formato})` en `shared/ui.js`:
  - **Excel**: tabla HTML con `application/vnd.ms-excel` y extensión `.xls` (sin librerías; abre en Excel/Sheets).
  - **CSV**: con BOM `﻿` y comillas escapadas.
  - **PDF**: ventana de impresión con encabezado (catálogo, filtros aplicados, fecha de generación, usuario) + `window.print()`.
- Nombre: `<prefijo>-<slug-catalogo>-<AAAA-MM-DD_HHmm>.<ext>`.

### P7 · Lectura real de CSV — 13
- Parser CSV mínimo (comillas, `;` o `,`, BOM) en `shared/ui.js`.
- `.xlsx` real no se lee sin librería: se acepta y se simula con aviso ("en la demo, .xlsx usa datos de ejemplo"); el CSV sí se procesa de verdad.
- Primera fila de la plantilla: metadato `#plantilla=<vT>;catalogo=<id>` para validar versión.

---

## 3. Fases

Cada fase cierra con verificación en navegador, recorrido de los tours tocados, un commit aprobado (ver `ship-gate`/`commit-cadence`) y bump de versión en los 20 sitios (sección 8).

| Fase | Contenido | HU que pasan a verde | Versión | Esfuerzo |
|---|---|---|---|---|
| **F0** ✅ | Bugs base + tours rotos | (desbloquea 06, 10, 13) | v0.5.0 | S |
| **F1** ✅ | P1 + P2 + P3 | 02, 05, 06, 11 (+19 con detalle) | v0.5.1 | M |
| **F2** ✅ | Cierres rápidos | 01, 03, 04, 09, 18, 20, 21 (07 parcial) | v0.5.2 | M |
| **F3** ✅ | Carga masiva (P7) | 12, 13, 14 | v0.5.3 | M |
| **F4** ✅ | Motor de fórmulas (P4) | 08, 10 | v0.5.4 | M |
| **F5** | Jerarquía (P5) — **requiere D4-D7 validadas** | 04, 05, 07 (completa), 17 | v0.6.0 | L |
| **F6** | Barrido final: tours, índice, matriz de cobertura, QA | todas | v0.6.1 | S |

\* PPTO-07 queda verde en F2 salvo "jerarquía visual"; ese criterio cierra en F5.

Estimado total: 5-7 días de trabajo enfocado. Ruta crítica: F5.

---

## 4. F0 — Bugs base y tours rotos

Van primero porque varios contaminan las demás HU.

| # | Bug | Dónde | Arreglo |
|---|---|---|---|
| B1 | Tour 06 apunta al overlay | `tour.js:65` | `sel: '#motivoTxt, #mMotivo .naowee-modal'` |
| B2 | Tour 10 apunta a `#itNombre` | `tour.js:98` | Paso nuevo en `#itNivel` (click) + `sel: '#itf-nombre'` |
| B3 | Tour 13 apunta a `#cargaPrev` vacío | `tour.js:116-122` | Se reescribe en F3; en F0, apuntar a `#cargaDrop` |
| B4 | Resultado de carga falso al abrir la página | `detalle.js:470, 480` | Estado vacío hasta la primera carga |
| B5 | "Vigente" fijo en Consulta, aun para Inactivos | `consulta.html:119, 183` | Consulta muestra solo Activos; badge según estado + vigencia vs. hoy |
| B6 | Editar un nivel inactivo lo reactiva | `detalle.js:188, 192` | Conservar `activo` al editar |
| B7 | Código de nivel nuevo choca ('8' vs. cap. 8) e id por `length` | `detalle.js:195-196` | `uid` + código siguiente libre |
| B8 | Ítems de niveles inactivos suman en totales y KPI | `data-catalogo.js` `totalCatalogo`, `detalle.js:257` | Filtrar por nivel activo (queda absorbido por P4) |
| B9 | Cambiar el nivel al editar un ítem borra lo escrito | `detalle.js:601` | Conservar valores de campos con la misma clave |
| B10 | Opciones del filtro de acción de auditoría no se refrescan | `detalle.js:555-560` | Rearmar opciones en cada `renderAuditoria` |
| B11 | Orden de auditoría mezclado | `data-catalogo.js` seed vs. `logAudit` | Ordenar al pintar (P2) |
| B12 | Fechas de semilla incoherentes (creado / v1.0 / auditoría) | `data-catalogo.js` `seedCatalogos`, `seedAuditoria` | Misma fuente de días |
| B13 | Historial Bogotá salta v1.0 → v1.3 | `data-catalogo.js` `mk` | Sembrar v1.0, v1.1, v1.2, v1.3 con motivos y snapshot cada una |
| B14 | Sin guarda de rol: `catalogos.html?role=USUARIO` es editable | `shell.js:38-49` | En páginas ADMIN, USUARIO se redirige a `consulta.html` con toast |
| B15 | Responsable "Jesús Díaz" fijo en ~12 llamadas | varios | D14 (P2) |
| B16 | Campo propio no puede ser obligatorio ni tipo "unidad" | `catalogo-detalle.html:246-250`, `detalle.js:155` | Opción "unidad" + checkbox "Obligatorio" en el alta de campo |

**Verificación F0:** los 21 tours corren de punta a punta sin cerrarse (aunque algunos todavía narren de más).

**Cerrada 2026-09-22.** Los 21 tours recorridos en Chromium headless: ningún paso sin objetivo, sin errores de consola. B1-B16 verificados uno por uno. Además:
- **B17** fechas en UTC: `toISOString()` registraba el día siguiente después de las 7 p. m. (hora Colombia). Ahora `isoLocal` / `OBRAS.hoy()`.
- **Semilla versionada** (`obras-ppto-seedv`): cambiar la semilla resiembra solo; quien tenía datos de la demo en el navegador los pierde una vez (esperado).
- Pendiente para F6: `catMode: 'vacio'` sigue sin resembrar el catálogo en blanco después de recorrer PPTO-04.

---

## 4b. F1 — cerrada 2026-09-22 (v0.5.1)

- **P1** `OBRAS_UI.confirmarCambios` (modal `#mCambios` inyectado; cierra el modal de edición mientras muestra el resumen → nunca dos fondos; "Volver a editar" lo reabre con lo escrito; sin cambios → toast y no abre). `OBRAS.diff(antes, despues, campos)`.
- **P2** `logAudit(..., detalle)` con `{cambios}` / `{motivo, items}` / `{archivo, ok, fail}`; filas de auditoría desplegables (`.t-aud-row` / `.t-aud-det`). Una entrada sembrada con detalle (Editar ítem 3.4) para que PPTO-19 tenga qué mostrar.
- **P3** `obras-ppto-presupuestos` (5 presupuestos: 4 en Bogotá v1.2/v1.3, 1 en Antioquia), `presupuestosDe`, `presupuestosConItem`, `OBRAS_UI.avisoPresupuestos`. Semilla v3.
- Editar catálogo: accesible también desde la cabecera del detalle (`Editar datos generales` → `catalogos.html?edit=<id>`); marca cambio sin versionar (D3). Cabecera con "Creado por … el …".
- Editar nivel: aviso de impacto al cambiar la posición de un nivel con ítems + presupuestos que usan sus ítems. **05 queda verde por criterios** (la posición hoy es el orden); F5 la amplía a padre/tipo.
- Editar ítem: resumen incluye V. total recalculado y total del nivel; ya no resetea `tipo`.
- Tour: nuevo campo `fill` en los pasos (el tour escribe un valor para mostrar un cambio real; una vez por paso). Tours 02, 05, 11 y 19 reescritos y verificados.
- Nota: `smoke-tours.js` marca como "sin objetivo" los pasos finales `center:true`; es esperado.

## 4c. F2 — cerrada 2026-09-22 (v0.5.2)

- **01** nace Activo (D1), vigencia completa y fin ≥ inicio, toast con enlace a "Configurar su estructura" (el enlace del toast sí recibe clics). Aparece en Consulta de inmediato.
- **03** búsqueda sin tildes.
- **04** nombre de nivel único en la estructura (sin tildes ni mayúsculas, incluye inactivos), con mensaje bajo el campo. **Verde por criterios**; F5 agrega padre/tipo.
- **06** menú según estado: un nivel inactivo ofrece *Reactivar* (con auditoría) en lugar de *Desactivar*.
- **07** columna Creado, filtro por estado con conteo, la fila abre el detalle del nivel. **Sigue 🟡**: la jerarquía visual llega en F5.
- **09** aviso al apagar "admite ítems" en un nivel con ítems; campos nuevos: porcentaje, fecha, sí/no, lista de opciones.
- **10** campo core *Tipo* (Producto/Servicio), un control por tipo de campo, código único en el catálogo (D13), porcentaje 0-100, *Guardar y agregar otro*. **Sigue 🟡**: la fórmula del ítem se evalúa en F4.
- **18** ítems Servicio en la semilla (1.7, 8.7, 16.7), columna Tipo, filtro por nivel, conteo, resaltado también del código, panel lateral `.t-fold` con el detalle (Escape / clic fuera cierra). Mismos filtros en la pestaña Ítems del detalle.
- **20** filtro por responsable, rango de fechas (`[data-dp-range]` en `initDP`), conteo "N de M registros".
- **21** menú Excel / PDF / CSV (`OBRAS_UI.exportar`), exporta lo filtrado y declara los filtros en el archivo, nombre con fecha y hora de generación, queda en la auditoría.
- Semilla v4.

## 4d. F3 — cerrada 2026-09-22 (v0.5.3)

- **Plantilla versionada propia** (`OBRAS.plantillaVigente`): P1, P2… según una firma de los niveles activos y sus campos; sube sola al cambiar la estructura. La semilla trae una P1 "anterior" para poder mostrar el rechazo.
- **Plantilla por nivel destino**: columnas = claves de los campos del nivel (`cod,nombre,tipo,uni,cantidad,valorUnit,…`); fila 1 de identificación `#plantilla=P2;catalogo=…;tipo=items;nivel=…`. Nombre `plantilla-items-<catálogo>-<nivel>-P2.csv`. La descarga queda en auditoría.
- **Asistente de 3 pasos** (`.naowee-stepper`): archivo → revisar → resultado.
- **Lectura real del CSV** (`OBRAS_UI.parseCSV`: BOM, comillas, separador `,` o `;` de Excel en español). `.xlsx` se acepta y se procesa el ejemplo vigente con aviso explícito (sin librería).
- **Rechazos antes de procesar**: formato, sin identificación, versión no vigente, otro catálogo, otro tipo, otro nivel, encabezados modificados, archivo vacío.
- **Validación por fila** en la vista previa (obligatorios, números con `$` y puntos de miles, porcentaje, unidad, lista, sí/no, fecha, código repetido en el catálogo o en el archivo, nombre de nivel repetido). Botón "Cargar N válidos · omitir M".
- **Carga real**: ítems al nivel destino (o niveles a la estructura), marca cambio sin versionar, auditoría con archivo y resultado.
- **Resultado**: detectados / procesados / fallidos, lista de fallidos con motivo, reporte descargable (.xls), historial de cargas con reporte por carga.
- Ejemplos descargables (vigente / versión anterior) con códigos libres, y `cargaDemo()` para el tour. Tour: nuevo campo `act` (ejecuta una acción al avanzar).
- Semilla v5.

## 4e. F4 — cerrada 2026-09-22 (v0.5.4)

- **`shared/formula.js`** (`OBRAS_FX`): tokenizer + descenso recursivo, sin `eval`. Números con coma o punto, `+ − * / × ÷`, paréntesis, `%` sufijo, campos del ítem; en niveles `SUMA(items)`, `SUMA(items.campo)`, `SUMA(hijos)` (0 hasta F5, con aviso). Mensajes en español con posición. 24 casos probados en node (válidos, cada error, división por cero). Trampa pagada: el rango `À-ÿ` incluye `×` y `÷`; las letras con tilde van como `À-ÖØ-öø-ÿ`.
- **`OBRAS.calcular(cat)`**: ítems primero (su fórmula o su total guardado), luego niveles según su valor — `auto` (suma), `formula`, `fijo` (reemplaza la suma, D9), `ninguno` (se ve pero no suma al catálogo, D8). Un error vale 0 y queda en `errores`; `totalCatalogo` delega aquí.
- Semilla v6: niveles en `auto`; **Pinturas** con `SUMA(items) * 1,05` y el ítem **16.3** con `cantidad * valorUnit * (1 + desperdicio%)` (campo porcentaje nuevo en el nivel).
- **Modal del nivel**: 4 tipos de valor con explicación de su efecto, validación en vivo con la cifra que daría hoy, chips que insertan términos, no guarda si la fórmula es inválida (incluye división por cero con los datos actuales).
- **Modal del ítem**: fórmula validada en vivo, chips con sus campos numéricos, V. total calculado y de solo lectura cuando hay fórmula; sin fórmula sigue el cálculo en 3 direcciones.
- Cabecera avisa "N fórmulas con error"; tabla de estructura muestra `Σ` / `ƒ fórmula` / `Fijo` / `Sin valor`; Consulta muestra el total calculado por nivel con su etiqueta y marca ítems con error.
- No se puede quitar un campo que usan fórmulas (del nivel o de sus ítems).

## 5. Fichas por HU (qué se hace, cómo fluye, cuándo es verde)

Formato: **Criterios que faltan → Cambios → Flujo (tour) → Verde cuando.**

### PPTO-01 · Crear catálogo — F2
- **Falta:** nace Borrador (01.4); responsable fijo; no navega a la estructura; sin validación fin ≥ inicio.
- **Cambios** (`catalogos.html`):
  - Estado por defecto **Activo** (D1).
  - Validar vigencia fin ≥ inicio con mensaje en `#crearError`.
  - Al guardar: toast "Catálogo creado · v1.0" y botón "Configurar estructura" que lleva a `catalogo-detalle.html?cat=<id>`.
  - Cabecera del detalle: "Creado por <usuario> el <fecha> · v1.0".
- **Flujo:** `#btnCrear` (click) → `#catNombre` → `#catRegion` → `#dpIni` (vigencia) → `#catEstado` ("nace Activo") → `#catModo` (punto de partida) → `#catGuardar` → toast → `#catMeta` en el detalle.
- **Verde cuando:** se crea sin tocar nada extra, aparece Activo en el listado y en Consulta, y la auditoría muestra "Crear catálogo" con el usuario del rol.

### PPTO-02 · Editar catálogo — F1
- **Falta:** resumen de cambios, historial con detalle, aviso de presupuestos, versionamiento, acceso desde el detalle.
- **Cambios:**
  - `save()` en modo edición calcula `OBRAS.diff` → abre `#mCambios` (P1) con impacto de P3 si el catálogo tiene presupuestos.
  - Al confirmar: `logAudit(..., {cambios})` + `D.marcarCambio(cat)` (D3).
  - Botón "Editar datos generales" en la cabecera de `catalogo-detalle.html` que reutiliza el mismo modal (moverlo a un parcial compartido o duplicarlo con el mismo id y lógica en `ui.js`).
- **Flujo:** `.t-kebab` → `#rmEdit` → `#catNombre` (cambiar) → `#catGuardar` → `#mCambios` (tabla antes/después) → `#mCambiosImpacto` ("3 presupuestos activos…") → *Confirmar* → pestaña Auditoría, fila expandida con el detalle → chip "1 sin versionar".
- **Verde cuando:** el resumen muestra exactamente los campos cambiados, la advertencia aparece solo en Bogotá (que tiene presupuestos), y la auditoría guarda antes/después.

### PPTO-03 · Consultar y buscar catálogos — verde (retoque F2)
- Retoque: la búsqueda ignora tildes (usar `norm` como en Consulta).

### PPTO-04 · Crear nivel — F2 (validación) + F5 (jerarquía)
- **Falta:** nombre duplicado; posición es solo un número; nivel sin fecha de creación.
- **Cambios F2:** bloquear nombre repetido (sin tildes ni mayúsculas) en la misma estructura con helper negativo; guardar `creado` y `creadoPor`.
- **Cambios F5:** el modal se divide en **tipo de nivel** (`#mTipo`: nombre, profundidad, descripción, admite ítems, campos, fórmula por defecto) y **nodo** (`#mNivel`: tipo, padre, orden, nombre, descripción, valor). La posición jerárquica = tipo + padre.
- **Flujo (catálogo vacío):** pestaña Estructura → `#esqPanel` ("primero defines los tipos de nivel") → `#btnTipo` → `#tpNombre` "Categoría" → guardar → `#btnTipo` "Capítulo" (profundidad 2) → `#btnNivel` → `#nvTipo` / `#nvPadre` → `#nvNombre` → intentar un nombre repetido (helper de error) → guardar → fila en el árbol.
- **Verde cuando:** se arma una estructura de dos niveles desde cero, el nombre repetido se bloquea con mensaje, y la auditoría registra usuario y fecha.

### PPTO-05 · Editar nivel — F1 (diff) + F5 (posición)
- **Falta:** resumen de cambios, historial con detalle, aviso al cambiar posición con ítems.
- **Cambios F1:** `saveNivel` en edición → `diff` → `#mCambios` → auditoría con detalle. Actualizar `codigo` si cambia el orden.
- **Cambios F5:** si cambia padre/tipo/orden y el nodo tiene ítems o descendientes → impacto en `#mCambiosImpacto`: "Mover «Cimentación» a «Acabados» traslada 6 ítems ($3,4 M). El total de «Obra gris» baja de $X a $Y."
- **Flujo:** `#panel-estructura .t-kebab` → `#rmNivelEdit` → `#nvPadre` (cambiar) → `#nvGuardar` → `#mCambios` con impacto → *Confirmar* → árbol reordenado → auditoría expandida.
- **Verde cuando:** mover un capítulo con ítems muestra el impacto con números reales y el historial guarda antes/después.

### PPTO-06 · Desactivar nivel — F0 (tour) + F2
- **Falta:** motivo no llega a la auditoría; los ítems del nivel siguen sumando; no hay reactivar; se ofrece desactivar a un nivel ya inactivo.
- **Cambios:** `logAudit(..., {motivo})`; cascada (D12) y salida de totales (P4); menú muestra *Reactivar* en inactivos (con su auditoría).
- **Flujo:** kebab → `#rmNivelOff` → `#motivoWarn` ("tiene 6 ítems") → `#motivoTxt` (vacío → error) → `#motivoConfirm` → fila Inactiva, total del catálogo baja → auditoría con motivo.
- **Verde cuando:** el motivo es obligatorio, se ve en la auditoría, y el nivel desaparece del selector de ítems y de Consulta.

### PPTO-07 · Consultar niveles — F2 + F5
- **Falta:** fecha de creación, filtro por estado, jerarquía visual, acceso al detalle.
- **Cambios F2:** columna "Creado"; toolbar con `#nvFiltroEstado` (Todos/Activos/Inactivos); clic en la fila abre el nivel en modo lectura con botón Editar.
- **Cambios F5:** tabla-árbol con sangría, chevrons, *Expandir todo / Contraer todo*; al filtrar se mantienen visibles (en gris) los ancestros.
- **Flujo:** pestaña Estructura → `#nivelTree` → `#nvFiltroEstado` (Inactivos) → `#btnExpandAll` → clic en fila.
- **Verde cuando:** los 4 criterios se ven en una sola pantalla.

### PPTO-08 · Configurar valor o fórmula — F4
- **Falta:** validación de fórmula; valor fijo y fórmula no se aplican a los totales.
- **Cambios:** selector con las 4 opciones de D8; input de fórmula con validación en vivo (`OBRAS_FX.validar`) y helper que alterna informativo ("= $1.234.567 con los datos actuales") / negativo (mensaje); chips que insertan `SUMA(items)`, `SUMA(hijos)`, `SUMA(items.cantidad)`; guardar bloqueado con error. Tabla de estructura: `Σ Automático` / `ƒ Fórmula` / `Fijo $X` / badge "Error".
- **Flujo:** kebab → `#rmNivelEdit` → `#nvValorTipo` (Fórmula) → `#nvFormula` escribir `SUMA(items) * (1,05` → `#nvFormulaMsg` "Falta cerrar el paréntesis" → corregir → vista previa del valor → guardar → total del nivel y del catálogo cambian → Consulta refleja el mismo total.
- **Verde cuando:** una fórmula inválida no se guarda, una válida cambia los totales en detalle y Consulta, y el valor fijo reemplaza la suma.

### PPTO-09 · Definir que un nivel admite ítems — verde (retoques F0/F4/F5)
- Retoques: aviso al apagar "admite ítems" en un nivel que ya tiene ítems (F2); campo obligatorio y tipo unidad (B16); fórmula por defecto del ítem en el tipo de nivel (F4); en F5 el configurador pasa a `#mTipo` y el tour se actualiza.

### PPTO-10 · Crear ítem — F0 (tour) + F2 + F4
- **Falta:** fórmula del ítem no se evalúa; tipo Producto/Servicio fijo; tipos de dato limitados; uno a la vez.
- **Cambios F2:** campo core **Tipo** (lista Producto/Servicio, obligatorio); tipos nuevos de campo `fecha`, `booleano`, `lista`, `porcentaje`; botón *Guardar y agregar otro*; código de ítem único (D13).
- **Cambios F4:** fórmula del ítem validada en vivo, chips con los campos numéricos del nivel, vista previa del resultado; con fórmula propia el V. total pasa a solo lectura; sin fórmula se mantiene el cálculo en 3 direcciones.
- **Flujo:** pestaña Ítems → `#btnItem` → `#itNivel` (elegir) → `#itf-nombre` → `#itf-tipo` → `#itf-valorUnit` → `#itFormula` (`cantidad * valorUnit * (1 + desperdicio)`) → `#itFormulaPreview` → guardar vacío (error de obligatorios) → *Guardar y agregar otro*.
- **Verde cuando:** se crean dos ítems seguidos, uno con fórmula que calcula bien, y los obligatorios se bloquean.

### PPTO-11 · Editar ítem — F1
- **Falta:** resumen de cambios, historial con detalle, aviso de presupuestos.
- **Cambios:** `saveItem` en edición → `diff` (incluye V. total recalculado del ítem **y** de su nivel) → `#mCambios` + impacto P3 si `presupuestosConItem` > 0 → auditoría con detalle. No resetear `tipo`.
- **Flujo:** buscar "3.4" en `#itSearch` → kebab → `#rmItemEdit` → `#itf-valorUnit` (cambiar) → `#itGuardar` → `#mCambios` ("V. unitario $672.480 → $690.000 · Total nivel Cimentación …") → impacto "usado en 2 presupuestos" → *Confirmar* → auditoría.
- **Verde cuando:** un ítem usado en presupuestos muestra el aviso y uno no usado no lo muestra.

### PPTO-12 · Descargar plantilla — F3
- **Falta:** versión propia de plantilla; columnas por nivel destino; etiqueta `codigo` vs. campo `cod`.
- **Cambios:** `cat.plantillaV` que sube sola cuando cambian campos, tipos de nivel o niveles que admiten ítems (hash de estructura); selector de **nivel destino** (o "todos" con columna `codigo_nivel`); columnas con los campos de ese nivel; primera fila de metadato (P7); texto "Plantilla vT · generada el …" junto al botón.
- **Flujo:** pestaña Carga → `#cargaTipo` → `#cargaNivel` → `#cargaCols` (columnas) → `#btnPlantilla` → nombre `plantilla-items-<catalogo>-pT.csv`.
- **Verde cuando:** agregar un campo a un nivel sube la versión de plantilla y cambia sus columnas.

### PPTO-13 · Cargar archivo masivo — F3
- **Falta:** todo el flujo real.
- **Cambios:** asistente de 3 pasos con `.naowee-stepper` dentro de `#panel-carga`:
  1. **Subir** — drop/click, solo `.csv`/`.xlsx` (rechazo de otras extensiones también al arrastrar).
  2. **Revisar** — si la versión del metadato ≠ `plantillaV` → `.naowee-message--negative` "Usa la plantilla vigente (vT)" y no avanza. Si coincide: tabla de vista previa (primeras 50 filas) con filas en error marcadas y motivo por fila (obligatorio vacío, número inválido, unidad no reconocida, código duplicado, nivel inexistente) **antes de procesar**.
  3. **Confirmar** — "Cargar 18 válidos · omitir 2 con error" → inserta en el nivel destino, marca cambios sin versionar, registra auditoría con detalle.
- Botones "Descargar archivo de ejemplo válido" y "Descargar archivo de ejemplo con versión vieja" para que la demo se pueda recorrer sin preparar archivos.
- **Flujo:** `#cargaDrop` (archivo viejo) → rechazo → `#cargaDrop` (archivo bueno) → `#cargaPreview` (filas en rojo) → `#cargaConfirmar` → pestaña Ítems con los nuevos resaltados.
- **Verde cuando:** los 5 criterios se ven con los dos archivos de ejemplo.

### PPTO-14 · Visualizar resultado de la carga — F3
- **Falta:** números reales, descargar reporte, historial de cargas.
- **Cambios:** tarjetas `vg-card` con los números reales del paso 3; tabla de fallidos (fila, código, motivo); botón *Descargar reporte* (P6, CSV/Excel con todas las filas y su estado); sección "Historial de cargas" (`cat.cargas[]`: fecha, usuario, archivo, nivel, detectados, procesados, fallidos) con reporte descargable por fila.
- **Flujo:** tras confirmar → `#cargaResult` → `#cargaErrWrap` → `#btnReporte` → `#cargaHist`.
- **Verde cuando:** el reporte descargado coincide con lo mostrado y la carga queda en el historial y en la auditoría.

### PPTO-15 · Crear nueva versión — verde (retoques F1/F5)
- Retoques: aviso si hay 0 cambios pendientes ("¿Seguro? No hay cambios desde vX"); en el modal, listar los cambios pendientes (tomados de la auditoría desde la última versión); columna "Presupuestos vinculados" (P3); snapshot con `esquema` y `totales` congelados (F5).

### PPTO-16 · Consultar historial de versiones — verde (retoques F0/F5)
- Retoques: historial continuo (B13); todas las versiones históricas con contenido; snapshot en árbol (F5).

### PPTO-17 · Consultar catálogo — verde (retoques F4/F5)
- Retoques: totales del motor (F4) con etiqueta "Fórmula"/"Valor fijo" en el encabezado; acordeones anidados + *Expandir/Contraer todo* (F5); estado vacío si el catálogo no tiene niveles.

### PPTO-18 · Buscar y filtrar ítems — F2
- **Falta:** columna Tipo, filtro por nivel, detalle del ítem, datos de Servicio.
- **Cambios:**
  - Semilla con ítems **Servicio** (p. ej. "Transporte de material", "Interventoría", "Alquiler de formaleta").
  - Columna Tipo en Consulta y en la pestaña Ítems.
  - Filtro `#itemNivel` (en F5 muestra la ruta).
  - Resaltar también el código.
  - Clic en fila → panel lateral `.t-fold` de solo lectura: ruta de niveles, todos los campos, fórmula y cómo se calculó el total.
  - Mismos buscador y filtros en la pestaña Ítems del detalle.
- **Flujo (USUARIO):** `#itemSearch` "caja" → `#itemFiltro` Servicio → `#itemNivel` → clic en fila → `#itemFold`.
- **Verde cuando:** cada filtro produce resultados y el detalle abre desde el resultado.

### PPTO-19 · Consultar historial de cambios — verde (retoques F1)
- Retoques: detalle expandible (P2); nuevas acciones registradas (exportar, descargar plantilla, reactivar, crear tipo de nivel); columna Catálogo en la exportación.

### PPTO-20 · Filtrar historial — F2
- **Falta:** filtro por usuario, rango de fechas, conteo.
- **Cambios:**
  - Dropdown `#audUsuario` (se arma con los responsables presentes).
  - **Rango de fechas**: extender `initDP` en `shared/ui.js` con `data-dp-range` (el CSS ya trae `__day--range-start/--range-end/--in-range`); `dpGet` devuelve `{desde, hasta}`.
  - Contador `#audCount` "N resultados".
  - Semilla con 2-3 usuarios distintos (Jesús Díaz, Carla Méndez, Andrés Pérez) y fechas repartidas en ~60 días.
- **Flujo:** `#audAccion` → `#audElemento` → `#audUsuario` → `#audFecha` (rango) → `#audCount` → `#btnLimpiar`.
- **Verde cuando:** los 4 filtros combinados cambian el conteo al instante.

### PPTO-21 · Exportar historial — F2
- **Falta:** exporta sin filtros, solo CSV, sin fecha en el nombre, no se registra.
- **Cambios:** `#btnExport` abre un menú con **Excel · PDF · CSV** (P6); exporta **lo visible** (filtros aplicados) y lo dice ("Exportar 12 registros filtrados"); nombre con fecha y hora de generación; el PDF lleva encabezado con filtros aplicados; `logAudit('Exportar historial', 'Auditoría', …, {formato, registros})`.
- **Flujo:** aplicar un filtro → `#btnExport` → `#rmExportXls` → archivo → nueva fila "Exportar historial" arriba.
- **Verde cuando:** los tres formatos descargan con el mismo contenido que la tabla filtrada y la exportación aparece en la auditoría.

---

## 6. Recorrido guiado (tour) — reglas para todas las fases

- Cada HU tocada actualiza su entrada en `TOURS` (`shared/tour.js`) **en la misma fase**; nunca queda un paso narrando algo que no existe.
- Selectores: apuntar al **contenido** del modal (`#mX .naowee-modal`, un input), nunca al overlay.
- Modales se abren con un paso `click:true` sobre el botón que los abre.
- Estado que el tour necesita (presupuestos vinculados, archivo de ejemplo, ítems Servicio, catálogo vacío) vive en la **semilla**, no en el tour.
- `catMode: 'vacio'` depende de que exista un catálogo sin niveles: después de recorrer PPTO-04 el catálogo vacío deja de estarlo → agregar `catMode: 'vacio'` que **resiembre** ese catálogo si ya tiene niveles (o semilla de 2 catálogos vacíos).
- Actualizar el texto "21 HU" (`tour.js:262`) y los enlaces por rango de `index.html` si cambian.

---

## 7. Verificación por fase

1. **Motor de fórmulas (F4):** tabla de casos en `node` (sin navegador).
2. **Navegador:** limpiar `localStorage` (o "Reiniciar demo") y recorrer **todos los tours de la fase** en ADMIN y USUARIO.
3. **Regresión:** después de cada fase, recorrer además los tours 01, 10, 15, 17 (flujo principal).
4. **Migración (F5):** abrir la demo con datos v0.5.x guardados en el navegador y confirmar que migra sin perder ediciones ni snapshots.
5. **Móvil:** 390 px en las pantallas tocadas (modales pasan a bottom sheet; árbol y tablas con `data-label`).
6. Actualizar la matriz de la sección 9.

---

## 8. Versionado y commits

- **Sitios a subir en cada bump** (hoy v0.4.9):
  - `shared/shell.js:9` (`VERSION`).
  - `index.html:90, 127, 160`.
  - `?v=` en `presupuesto/catalogos.html`, `catalogo-detalle.html` y `consulta.html` (todos los `<link>`/`<script>` versionados).
  - El nuevo `shared/formula.js`.
- **Antes de F0:** el trabajo sin commitear de v0.4.9 (unificación de skin) es ajeno a este plan. Se commitea aparte o se confirma su dueño antes de empezar, para que el primer commit del plan quede limpio.
- Un commit por fase (o por pieza si la fase es grande: F5 = modelo+migración / UI estructura / Consulta / tour). Estilo del repo: `feat(catalogos): … v0.5.x`, cuerpo con el porqué y las HU que cierra.
- Cada commit se prepara y se aprueba antes de ejecutarlo; nada se sube sin pedirlo (`ship-gate`).

---

## 9. Matriz de cobertura (se actualiza al cerrar cada fase)

| HU | Hoy | Fase | Verde |
|---|---|---|---|
| 01 Crear catálogo | 🟡 | F2 | ✅ v0.5.2 |
| 02 Editar catálogo | 🔴 | F1 | ✅ v0.5.1 |
| 03 Consultar y buscar catálogos | ✅ | F2 (retoque) | ✅ v0.5.2 |
| 04 Crear nivel | 🟡 | F2 (+ F5 padre/tipo) | ✅ v0.5.2 |
| 05 Editar nivel | 🔴 | F1 (+ F5 padre/tipo) | ✅ v0.5.1 |
| 06 Desactivar nivel | 🟡 | F0 + F1 (reactivar en F2) | ✅ v0.5.1 |
| 07 Consultar niveles | 🟡 | F2 + F5 (falta jerarquía visual) | ☐ |
| 08 Valor o fórmula | 🟡 | F4 | ✅ v0.5.4 |
| 09 Admite ítems | ✅ | retoques | ✅ v0.5.2 |
| 10 Crear ítem | 🟡 | F0 + F2 + F4 | ✅ v0.5.4 |
| 11 Editar ítem | 🔴 | F1 | ✅ v0.5.1 |
| 12 Descargar plantilla | 🟡 | F3 | ✅ v0.5.3 |
| 13 Carga masiva | 🔴 | F3 | ✅ v0.5.3 |
| 14 Resultado de carga | 🟡 | F3 | ✅ v0.5.3 |
| 15 Nueva versión | ✅ | retoques | ☐ |
| 16 Historial de versiones | ✅ | F0 (B13) | ☐ |
| 17 Consultar catálogo | ✅ | F4 + F5 | ☐ |
| 18 Buscar ítems | 🟡 | F2 | ✅ v0.5.2 |
| 19 Historial de cambios | ✅ | F1 | ✅ v0.5.1 |
| 20 Filtrar historial | 🟡 | F2 | ✅ v0.5.2 |
| 21 Exportar historial | 🟡 | F2 | ✅ v0.5.2 |

---

## 10. Riesgos

| Riesgo | Mitigación |
|---|---|
| La migración (F5) corre en todas las páginas: un error rompe la demo entera | `migrarCatalogo` idempotente con `try/catch` que cae a resembrar y avisa; probarla con datos viejos antes del commit |
| `totalCatalogo` pasa a usar el motor: cambian números que se ven en listados y KPI | Esperado (valor fijo y fórmulas); revisar que la semilla dé totales razonables |
| Producto decide distinto en D4-D7 | F5 va al final; F0-F4 no dependen de la jerarquía |
| `.xlsx` no se lee sin librería | CSV real + `.xlsx` simulado con aviso; opción futura: SheetJS desde cdnjs |
| El tour depende del estado que deja el usuario | La semilla trae todo lo necesario y `catMode` resiembra |
| El árbol de trabajo tiene cambios v0.4.9 sin commitear de otra sesión | Resolverlos antes de F0 (sección 8) |
