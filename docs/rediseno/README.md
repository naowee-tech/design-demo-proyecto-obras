# Rediseño de experiencia · Catálogo de Precios

Copia del lienzo **"Catálogo de Precios — Rediseño de experiencia"**
(https://claude.ai/artifact/B21Egihua6VFqRVLe2mrNw), versión 10 (2026-09-22).
Es la fuente de diseño de `plans/PLAN-REDISENO-FLUJO.md`.

- `tableros/`: los 20 tableros (`*.dc.html`) y el índice del lienzo (`canvas.json`). Se ven
  dentro del lienzo: fuera de él les falta el runtime (`support.js`) del editor.
- `generador/`: los scripts Python que generan los tableros (`python3 b4_importar.py`, etc.).
  Escriben en `project/` junto a ellos.

| Fila | Tableros |
|---|---|
| 0 · Qué rediseñamos, por qué y para qué | `Main` |
| 1 · El flujo | `Flujo-actual`, `Flujo-propuesto`, `Donde-vive` |
| 2 · Espacio de trabajo | `V1-antes`, `V1-despues-borrador`, `V1-despues-vigente` |
| 3 · Contenido y alcance | `V2-antes`, `V2-despues`, `V2-despues-drawer`, `V3-despues` |
| 4 · Activar una versión | `V4-antes`, `V4-despues` |
| 5 · Importar la matriz | `V5-antes`, `V5-despues-ajustes`, `-diagnostico`, `-carga`, `-resultado` |
| 6 · Consulta de precios | `V6-antes`, `V6-despues` |

Precios sintéticos, igual que la demo.
