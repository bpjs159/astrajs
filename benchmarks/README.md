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
| `suites/astra.mjs` | AstraJS `@bpjs159/core` | `store()` + `bindList()` (keyed) + `bindText()` por fila |
| `suites/react.mjs` | React | `createRoot` + `flushSync` + lista keyed |
| `suites/vue.mjs` | Vue | `createApp` + array `reactive` + `v-for` keyed (render fn) |
| `suites/solid.mjs` | Solid | `render` + `<Index>` (ver nota) |
| `suites/angular.mjs` | Angular | `NgModule` + `@for track` + `ApplicationRef.tick()` |

## Resultados

> Snapshot canónico — promedio de **2 corridas de producción** (medianas) ·
> Node 22 + jsdom · Apple M4 Pro. Copiados en `/docs/comparison#benchmarks`;
> **no hace falta re-correr el benchmark** para verlos (guarda también en
> `results.json` / `results.md`; bundles en `bundle-results.json`).

### Tabla (10.000 filas)

| Benchmark | AstraJS | React | Vue | Solid | Angular |
|---|---|---|---|---|---|
| Render 10.000 filas | **247.36 ms** | 223.30 ms | 222.58 ms | 322.00 ms | 1602.20 ms |
| Actualizar 1 fila | **0.08 ms** | 20.91 ms | 19.08 ms | 1.41 ms | 1.50 ms |
| Actualizar las 10.000 filas | **27.86 ms** | 42.07 ms | 102.32 ms | 31.66 ms | 20.51 ms |
| Añadir 1.000 filas | **31.15 ms** | 53.10 ms | 55.54 ms | 32.67 ms | 355.20 ms |
| Eliminar 1.000 filas | **37.16 ms** | 40.88 ms | 45.82 ms | 306.19 ms | 40.23 ms |
| Reemplazar todo | 401.23 ms | 557.89 ms | 447.72 ms | **54.50 ms** | 8632.82 ms |

### Arranque y escalado

| Benchmark | AstraJS | React | Vue | Solid | Angular |
|---|---|---|---|---|---|
| Bootstrap (app vacía) | **0.26 ms** | 9.29 ms | 8.19 ms | 6.59 ms | 27.17 ms |
| Montar 1.000 componentes | 24.72 ms | 24.63 ms | **21.01 ms** | 20.31 ms | 34.28 ms |
| Desmontar 10.000 filas | 149.01 ms | 160.12 ms | **137.03 ms** | 148.30 ms | 1462.28 ms |

### Latencia de interacción

| Benchmark | AstraJS | React | Vue | Solid | Angular |
|---|---|---|---|---|---|
| Click → DOM (fila 5.000) | **2.42 ms** | 61.32 ms | 60.58 ms | 43.79 ms | 40.40 ms |
| Tecla → DOM | **0.15 ms** | 0.59 ms | 0.50 ms | 0.23 ms | 0.34 ms |
| Toggle condicional (1.000 filas) | **1.44 ms** | 1.89 ms | 1.59 ms | 1.68 ms | 1.64 ms |

### Memoria (proceso aislado, --expose-gc)

| Benchmark | AstraJS | React | Vue | Solid | Angular |
|---|---|---|---|---|---|
| Delta de heap (render 10.000 filas) | 175.76 MB | 173.22 MB | 178.85 MB | 181.17 MB | **162.16 MB** |

### Bundle (misma app de 10.000 filas, min + gzip)

| Framework | min | gzip |
|---|---|---|
| AstraJS | **4.3 kB** | **1.9 kB** |
| React | 189.1 kB | 59.0 kB |
| Vue | 61.9 kB | 24.6 kB |
| Solid | 11.9 kB | 4.7 kB |

> Angular omitido en bundle: en producción se compila AOT con el Angular CLI
> (su bundle JIT embebe el compilador y no es comparable).

## Notas de equidad

- Todos los frameworks usan su patrón **idiomático** para una lista keyed de
  10k filas y miden "tiempo hasta que el DOM cambia", no trabajo interno.
- React usa `flushSync` para forzar el commit síncrono (sin `useTransition`),
  que es el camino más rápido y determinista para medir.
- Angular usa el bootstrap clásico `NgModule` + plantilla `@for track`. Como las
  operaciones del benchmark corren FUERA de `NgZone`, cada op llama
  `ApplicationRef.tick()` — el mismo ciclo de change detection completo que
  Zone.js programaría tras cada evento asíncrono en una app real. El bootstrap
  se hace por iteración (fuera de la medición) y el host es `<app-root>`.
  **zone.js se importa dinámicamente dentro del factory**: sus parches
  globales (timers/eventos) no contaminan a los demás suites.
- Latencia (`click` / `input` / `toggle`): cada suite dispara el evento DOM
  real (`.click()` o `dispatchEvent('input')`) y se mide hasta que el DOM lo
  refleja (MutationObserver) — incluye handler + scheduler + commit.
- Heap: se mide en un **proceso hijo fresco por framework** (`heap-probe.mjs`)
  — un solo render por proceso, para que la retención de suscripciones de
  iteraciones previas no contamine la línea base.
- Bundle: `bundle.mjs` usa esbuild (minify, `NODE_ENV=production`) sobre la
  misma app de 10.000 filas; reporta min + gzip. Angular se omite (AOT).
- Solid usa `<Index>` (filas referencialmente estables) construidas con
  `document.createElement` + `insert(el, () => expr)` — exactamente lo que
  emite el compilador de plantillas de Solid. Es el patrón que la propia
  documentación de Solid recomienda para "actualizar una fila de una lista
  grande" (bindings O(1) por fila).
- Los datos de cada fila: `{ id, name, email, score }` → 4 `<td>`.
