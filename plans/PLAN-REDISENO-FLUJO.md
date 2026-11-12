# Plan · Rediseño de flujo del Catálogo de Precios, ajustado al backend (v0.7.x)

Rama `product-fixed`. Fuente del diseño: lienzo "Catálogo de Precios — Rediseño de experiencia"
(https://claude.ai/artifact/B21Egihua6VFqRVLe2mrNw), copiado en `docs/rediseno/`.
Contexto del backend: `plans/CONTEXTO-BACKEND-CARGA-APU.md`. Lo que no es de flujo ni de patrón
(accesibilidad fina, formato de datos, deuda de DS) sigue en `plans/BACKLOG-AUDITORIA-UX.md`.

Decisión de Jorge (2026-09-22): **las HU se ajustan al backend** (opción b), no se mantienen
funciones que el backend no soporta.

## 1. El modelo que manda (backend actual)

| Concepto | Cómo es | Consecuencia en la demo |
|---|---|---|
| Catálogo | Una **base de precios** (`price_base`), una por versión | El catálogo es un contenedor de versiones |
| Versión | Todo cambio (editar, reemplazar, importar) genera versión | Se trabaja siempre sobre una **"vN en preparación"**; la vigente no se toca; activar es la decisión |
| Alcance | Departamentos (`m_regions`) + roles + condición adicional | Un catálogo cubre varios departamentos; el departamento es una **dimensión**, no otro catálogo |
| Estructura | 3 niveles fijos: Capítulo › APU › insumo | Sin esquema configurable, sin "admite ítems", sin campos por nivel |
| Capítulos e insumos | Globales (por nombre / por código), sin versión | Renombrarlos es un **cambio global**: se advierte |
| APU y composición | Por departamento y por versión | El precio del APU y sus cantidades cambian por departamento |
| Valor del APU | Viene del Excel (`Valor total`), no se recalcula | Se muestra un **control**: coincide o no con la suma de sus insumos |
| Columnas | Fijas: APU, Código, Nombre, unidad, Cantidad, Valor unitario, Valor total | Plantilla fija, una hoja `APU <Departamento>` por departamento |
| Carga | Upsert, nunca borra; ~1 h por departamento, de a uno | Flujo "Importar" a pantalla completa; la carga se vive dentro del flujo y se retoma |

## 2. Las 21 HU reescritas para el backend

Cada HU tiene su recorrido guiado (`shared/tour.js`) con el rol que le toca. "Verde cuando" es la
prueba que se hace al cerrar su fase.

### Catálogo (F2)
| HU | Antes | Ahora | Verde cuando |
|---|---|---|---|
| 01 Crear catálogo | Nombre + una región + vigencia + estado | Nombre, vigencia y **alcance** (departamentos, roles, condición). Nace con la **v1.0 en preparación** y una lista de "qué falta para activarla" | Se crea, abre su espacio de trabajo con la checklist y queda en el historial |
| 02 Editar catálogo | Formulario con estado | Modal de **datos generales** sobre el espacio de trabajo; cambiar el alcance va a la versión en preparación | El resumen muestra antes/después y el cambio cae en la versión en preparación |
| 03 Consultar y buscar catálogos | Tabla con región | Lista con **alcance**, **vigente vX**, **en preparación vY** y estado; búsqueda y filtros | Buscar por nombre o departamento y filtrar por estado funciona |

### Contenido (F3)
| HU | Antes | Ahora | Verde cuando |
|---|---|---|---|
| 04 Crear nivel | Nivel configurable en un modal | **Crear capítulo o APU** en el árbol (los 3 niveles son fijos) | Crear un APU dentro de un capítulo lo deja en la versión en preparación |
| 05 Editar nivel | Mega-modal | **Drawer "Editar APU"** en contexto; renombrar un capítulo avisa "cambio global" | El árbol queda visible y el resumen muestra el cambio |
| 06 Desactivar nivel | Motivo + inactivo | **Retirar de la versión en preparación** con motivo; la vigente lo conserva; se puede reincorporar | Retirar pide motivo y reincorporar lo devuelve |
| 07 Consultar niveles | Árbol plano con filtros | **Árbol por departamento** (selector) + detalle del APU al lado | Cambiar de departamento cambia precios y cantidades |
| 08 Valor o fórmula | Suma / fórmula / fijo | **Valor del APU por departamento** + **control del valor** (coincide o no con la suma de insumos) y "usar la suma" | Un APU descuadrado se marca y se corrige con un clic |
| 09 Admite ítems | Interruptor por nivel | **Estructura fija, dicha como tal** en *Alcance y estructura*: qué nivel lleva insumos y las columnas | La pestaña muestra los 3 niveles y las 7 columnas fijas |
| 10 Crear ítem | Modal con campos por nivel | **Agregar insumo al APU**: buscar uno existente por código o crear uno nuevo; cantidad y valor por departamento | Agregarlo recalcula el control del APU |
| 11 Editar ítem | Modal + resumen | **Drawer "Editar insumo"**: cantidad y valor son del APU en ese departamento; nombre y unidad son **globales** (se advierte) | El resumen separa lo local de lo global |

### Importar (F4)
| HU | Antes | Ahora | Verde cuando |
|---|---|---|---|
| 12 Descargar plantilla | Plantilla versionada por nivel | **Plantilla fija**: una hoja `APU <Departamento>` por departamento del alcance, encabezados literales | Descarga con las hojas del alcance y queda en el historial |
| 13 Carga masiva | Asistente en pestaña | **Importar a pantalla completa**: Archivo · Ajustes · Diagnóstico · Carga · Resultado. Modo actualizar la vN en preparación o crear versión nueva. Carga de a un departamento, dentro del flujo, detenible y **reanudable** | Con el archivo de ejemplo se recorre todo; cerrar la página a mitad retoma en el departamento pendiente |
| 14 Resultado de la carga | Tarjetas + fallidos + historial | Resultado por departamento (creados, actualizados, avisos, errores), **reporte descargable**, historial de importaciones | El reporte coincide con lo mostrado y la importación queda en historial y auditoría |

### Versiones (F5)
| HU | Antes | Ahora | Verde cuando |
|---|---|---|---|
| 15 Nueva versión | Botón con motivo | **Revisar y activar la vN**: lista de cambios desde la vigente, presupuestos que siguen en la anterior, motivo | Activar deja la anterior histórica con su contenido intacto (arregla el bug del snapshot) |
| 16 Historial de versiones | Lista | Lista con estado (vigente · en preparación · histórica) y **ver contenido** de cualquiera en solo lectura | Una histórica muestra sus precios de entonces |

### Consulta (F6, Usuario autorizado)
| HU | Antes | Ahora | Verde cuando |
|---|---|---|---|
| 17 Consultar catálogo | Acordeones con 46 tablas | Solo la **versión vigente** de los catálogos cuyo alcance incluye **su rol**; selector de departamento; árbol + detalle del APU con **precio por unidad** | El Gestor y el Revisor ven catálogos distintos |
| 18 Buscar ítems | Búsqueda + filtros | Buscar APU o insumo por código o nombre en el departamento elegido | Buscar "concreto" lleva al APU en el árbol |

### Historial (F6)
| HU | Antes | Ahora | Verde cuando |
|---|---|---|---|
| 19 Historial de cambios | Pestaña Auditoría | Pestaña **Historial**: acción, elemento, departamento, versión, responsable, fecha y detalle | Una importación y una activación aparecen con su detalle |
| 20 Filtrar historial | Filtros | Filtros por acción, elemento, **versión**, responsable y fechas | Combinar filtros y ver el conteo |
| 21 Exportar historial | CSV/Excel/PDF | Igual, con los filtros aplicados | El archivo trae lo filtrado y la exportación queda registrada |

## 3. Roles (switch de perfil)

| Perfil | Rol de backend | Ve |
|---|---|---|
| Jesús Díaz · Admin Naowee | Admin (bypass) | Catálogos, espacio de trabajo, Importar, Consulta |
| Marta Ríos · Usuario autorizado | Gestor de presupuesto | Consulta de los catálogos cuyo alcance incluye "Gestor de presupuesto" |
| Andrés Pérez · Usuario autorizado | Revisor técnico | Consulta de los catálogos cuyo alcance incluye "Revisor técnico" |

El recorrido de cada HU cambia solo al perfil que necesita. La píldora de perfil explica qué ve cada uno.

## 4. Fases (un commit por fase, con aprobación)

| Fase | Qué | HU |
|---|---|---|
| F0 | Lienzo copiado a `docs/rediseno/` + este plan + notas de backend y backlog | — |
| F1 | Modelo nuevo (`data-catalogo.js`, SEED_V 8): catálogo con versiones y "en preparación", alcance, departamentos, capítulos e insumos globales. Shell con 3 perfiles | base |
| F2 | Lista de catálogos + Nuevo catálogo + datos generales | 01–03 |
| F3 | Espacio de trabajo: encabezado con versión, *Alcance y estructura*, *Contenido* (árbol por departamento, detalle del APU, drawers) | 04–11 |
| F4 | `importar.html`: flujo de 5 pasos con carga simulada reanudable | 12–14 |
| F5 | Versiones: revisar y activar, historial con contenido | 15–16 |
| F6 | Consulta por rol y departamento; Historial con filtros y exportación | 17–21 |
| F7 | Hub (`index.html`), recorrido completo de las 21 HU, matriz final | todas |

Verificación por fase: carga sin errores de consola, el recorrido de cada HU de la fase llega al
final con todos sus pasos apuntando a algo (smoke de tours con Playwright), y la prueba "verde
cuando" de cada HU.

## 5. Matriz de cobertura

| HU | Fase | Estado |
|---|---|---|
| 01 Crear catálogo | F2 | ✅ v0.7.0 |
| 02 Editar catálogo | F2 | ✅ v0.7.0 |
| 03 Consultar catálogos | F2 | ✅ v0.7.0 |
| 04 Crear capítulo / APU | F3 | ✅ v0.7.0 |
| 05 Editar APU | F3 | ✅ v0.7.0 |
| 06 Retirar de la versión | F3 | ✅ v0.7.0 |
| 07 Árbol por departamento | F3 | ✅ v0.7.0 |
| 08 Valor y control del APU | F3 | ✅ v0.7.0 |
| 09 Estructura fija | F3 | ✅ v0.7.0 |
| 10 Agregar insumo | F3 | ✅ v0.7.0 |
| 11 Editar insumo | F3 | ✅ v0.7.0 |
| 12 Plantilla fija | F4 | ✅ v0.7.0 |
| 13 Importar | F4 | ✅ v0.7.0 |
| 14 Resultado de la importación | F4 | ✅ v0.7.0 |
| 15 Revisar y activar | F5 | ✅ v0.7.0 |
| 16 Historial de versiones | F5 | ✅ v0.7.0 |
| 17 Consulta por rol | F6 | ✅ v0.7.0 |
| 18 Buscar APU o insumo | F6 | ✅ v0.7.0 |
| 19 Historial de cambios | F6 | ✅ v0.7.0 |
| 20 Filtrar historial | F6 | ✅ v0.7.0 |
| 21 Exportar historial | F6 | ✅ v0.7.0 |

### Verificación al cierre (2026-09-22)
- Smoke de los 21 recorridos (Playwright): todos llegan al final, cada paso con objetivo, sin errores de consola.
- Flujo del espacio de trabajo: usar la suma, editar insumo, agregar insumo, crear APU, activar la v1.4; la v1.3 histórica conserva $672.480 en el APU 3.4 (el bug del snapshot ya no existe).
- Importar con el archivo de ejemplo: recargar a mitad → retoma desde el departamento en curso; falla simulada (500) → reintento; resultado 7 de 7.
- Importar con la matriz real de agosto (solo en el navegador local): 33 hojas, 1.980 filas cada una, ≈ 33 h estimadas.
- Consulta: Gestor ve 2 catálogos, Revisor ve 1.
- 390 px: sin scroll horizontal en las 5 pantallas.

## 6. Riesgos
- **localStorage**: 45 APU × ~4 insumos × departamentos × versiones. Se siembran datos en 6
  departamentos (los demás del alcance quedan "sin cargar", que es justo lo que resuelve Importar)
  y las históricas guardan solo lo que cambió respecto de su siguiente.
- **Reescritura grande**: `detalle.js` (1.464 líneas) se reemplaza por módulos por pestaña. La versión v0.6.0
  queda en `main` como referencia.
- **Precios sintéticos** siempre: la matriz real no entra al repo.
