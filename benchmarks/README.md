# AstraJS Benchmarks — Proof of Concept

Benchmarks de frontend que comparan **AstraJS** contra **React**, **Vue**,
**Solid** y **Angular** sobre una tabla de **10,000 filas**.

> Este PoC alimenta la sección *Benchmarks* de la página de docs
> `/docs/comparison` del sitio de AstraJS. Ejecutarlo regenera `results.json`,
> que es la fuente de datos de esa sección.

## Metodología

- **Entorno**: Node.js + `jsdom` (sin motor de layout ni pintado). Mide el costo
  de JS puro de cada framework (diffing, reconciliación, proxy/scheduler), no la
  pintura del navegador — es exactamente donde vive la diferencia de arquitectura.
- **Medición**:
  - `render` inicial: `performance.now()` alrededor de la operación síncrona.
  - Operaciones de mutación: `MutationObserver` sobre el contenedor — se mide
    desde antes de aplicar el cambio hasta que el DOM refleja la mutación
    (el observador se dispara en microtask, por lo que los schedulers diferidos
    de cada framework quedan incluidos de forma uniforme).
- **Protocolo por iteración**: contenedor limpio → setup (fuera de la medición)
  → aplicar la operación → verificar cantidad de filas → desmontar. Se reporta
  la **mediana** de N iteraciones.
- **Operaciones**:
  1. `render10k` — renderizar 10,000 filas desde cero.
  2. `updateRow` — cambiar el nombre de la fila 5,000 (la actualización quirúrgica).
  3. `append1k` — añadir 1,000 filas.
  4. `remove1k` — eliminar las primeras 1,000 filas.
  5. `replaceAll` — reemplazar las 10,000 filas por datos completamente nuevos.

## Ejecutar

```bash
cd benchmarks
npm install
npm start        # → imprime la tabla, escribe results.latest.json + results.latest.md
```

`npm start` solo re-mide y escribe `results.latest.*` — los resultados que
publican los docs viven en el snapshot canónico `results.json` / `results.md`
y **no hace falta correr el benchmark** para verlos.

Todos los frameworks corren en **build de producción**: `NODE_ENV=production`
(React/Vue leen la variable en runtime) y `enableProdMode()` en Angular.

## Suites

| Archivo | Framework | Patrón usado |
|---|---|---|
| `suites/astra.mjs` | AstraJS `@astrajs/core` | `store()` + `bindList()` (keyed) + `bindText()` por fila |
| `suites/react.mjs` | React | `createRoot` + `flushSync` + lista keyed |
| `suites/vue.mjs` | Vue | `createApp` + array `reactive` + `v-for` keyed (render fn) |
| `suites/solid.mjs` | Solid | `render` + `<Index>` (ver nota) |
| `suites/angular.mjs` | Angular | `NgModule` + `*ngFor` + `ApplicationRef.tick()` |

## Resultados

> Snapshot canónico — promedio de **2 corridas de producción** (medianas) ·
> Node 22 + jsdom · Apple M4 Pro. Copiados en `/docs/comparison#benchmarks`;
> **no hace falta re-correr el benchmark** para verlos (guarda también en
> `results.json` / `results.md`).

| Benchmark | AstraJS | React | Vue | Solid | Angular |
|---|---|---|---|---|---|
| Render 10.000 filas | **325.56 ms** | 555.63 ms | 359.92 ms | 504.96 ms | 2279.30 ms |
| Actualizar 1 fila | **0.09 ms** | 20.94 ms | 24.08 ms | 1.61 ms | 4.77 ms |
| Añadir 1.000 filas | **41.01 ms** | 56.25 ms | 65.96 ms | 43.62 ms | 557.21 ms |
| Eliminar 1.000 filas | **48.64 ms** | 47.88 ms | 65.50 ms | 491.68 ms | 51.15 ms |
| Reemplazar todo | **548.19 ms** | 798.16 ms | 594.73 ms | 71.32 ms | 2842.90 ms |

## Notas de equidad

- Todos los frameworks usan su patrón **idiomático** para una lista keyed de
  10k filas y miden "tiempo hasta que el DOM cambia", no trabajo interno.
- React usa `flushSync` para forzar el commit síncrono (sin `useTransition`),
  que es el camino más rápido y determinista para medir.
- Angular usa el bootstrap clásico `NgModule` + plantilla `*ngFor`. Como las
  operaciones del benchmark corren FUERA de `NgZone`, cada op llama
  `ApplicationRef.tick()` — el mismo ciclo de change detection completo que
  Zone.js programaría tras cada evento asíncrono en una app real. El bootstrap
  se hace por iteración (fuera de la medición) y el host es `<app-root>`.
- Solid usa `<Index>` (filas referencialmente estables) construidas con
  `document.createElement` + `insert(el, () => expr)` — exactamente lo que
  emite el compilador de plantillas de Solid. Es el patrón que la propia
  documentación de Solid recomienda para "actualizar una fila de una lista
  grande" (bindings O(1) por fila).
- Los datos de cada fila: `{ id, name, email, score }` → 4 `<td>`.
