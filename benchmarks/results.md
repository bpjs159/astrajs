# AstraJS Benchmarks — results

> Canonical snapshot — average of **2 production runs** (medians) · node v22.21.1 · Apple M4 Pro
> jsdom (no layout / no paint) — measures framework JS cost
> These numbers are copied into `/docs/comparison#benchmarks`. Re-running the benchmark is optional.

## Table (10,000 rows)

| Benchmark | AstraJS (0.1.0) | React (19.2.8) | Vue (3.5.41) | Solid (1.9.14) | Angular (19.2.25) |
|---|---|---|---|---|---|
| Render 10,000 rows | 247.36 ms | 223.30 ms | 222.58 ms | 322.00 ms | 1602.20 ms |
| Update 1 row (of 10,000) | 0.08 ms | 20.91 ms | 19.08 ms | 1.41 ms | 1.50 ms |
| Update all 10,000 rows | 27.86 ms | 42.07 ms | 102.32 ms | 31.66 ms | 20.51 ms |
| Append 1,000 rows | 31.15 ms | 53.10 ms | 55.54 ms | 32.67 ms | 355.20 ms |
| Remove 1,000 rows | 37.16 ms | 40.88 ms | 45.82 ms | 306.19 ms | 40.23 ms |
| Replace all 10,000 rows | 401.23 ms | 557.89 ms | 447.72 ms | 54.50 ms | 8632.82 ms |

## Startup & scale

| Benchmark | AstraJS | React | Vue | Solid | Angular |
|---|---|---|---|---|---|
| Bootstrap (empty app) | 0.26 ms | 9.29 ms | 8.19 ms | 6.59 ms | 27.17 ms |
| Mount 1,000 components | 24.72 ms | 24.63 ms | 21.01 ms | 20.31 ms | 34.28 ms |
| Unmount 10,000 rows | 149.01 ms | 160.12 ms | 137.03 ms | 148.30 ms | 1462.28 ms |

## Interaction latency

| Benchmark | AstraJS | React | Vue | Solid | Angular |
|---|---|---|---|---|---|
| Click → DOM update (row 5,000) | 2.42 ms | 61.32 ms | 60.58 ms | 43.79 ms | 40.40 ms |
| Keystroke → DOM update | 0.15 ms | 0.59 ms | 0.50 ms | 0.23 ms | 0.34 ms |
| Toggle conditional block (1,000 rows) | 1.44 ms | 1.89 ms | 1.59 ms | 1.68 ms | 1.64 ms |

## Memory (isolated process, --expose-gc)

| Benchmark | AstraJS | React | Vue | Solid | Angular |
|---|---|---|---|---|---|
| Heap delta after render 10,000 rows | 175.76 MB | 173.22 MB | 178.85 MB | 181.17 MB | 162.16 MB |

## Bundle size (same 10,000-row app, min + gzip)

| Framework | min | gzip |
|---|---|---|
| AstraJS | 4.3 kB | 1.9 kB |
| React | 189.1 kB | 59.0 kB |
| Vue | 61.9 kB | 24.6 kB |
| Solid | 11.9 kB | 4.7 kB |

> Angular omitted: production Angular is AOT-compiled by the Angular CLI; its JIT bundle embeds the compiler and is not comparable.
