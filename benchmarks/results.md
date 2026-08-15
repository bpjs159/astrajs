# AstraJS Benchmarks — results

> Canonical snapshot — average of **2 production runs** (medians) · node v22.21.1 · Apple M4 Pro
> jsdom (no layout / no paint) — measures framework JS cost
> These numbers are copied into `/docs/comparison#benchmarks`. Re-running the benchmark is optional.

| Benchmark | AstraJS (0.1.0) | React (19.2.8) | Vue (3.5.41) | Solid (1.9.14) | Angular (19.2.25) |
|---|---|---|---|---|---|
| Render 10,000 rows | 325.56 ms | 555.63 ms | 359.92 ms | 504.96 ms | 2279.30 ms |
| Update 1 row (of 10,000) | 0.09 ms | 20.94 ms | 24.08 ms | 1.61 ms | 4.77 ms |
| Append 1,000 rows | 41.01 ms | 56.25 ms | 65.96 ms | 43.62 ms | 557.21 ms |
| Remove 1,000 rows | 48.64 ms | 47.88 ms | 65.50 ms | 491.68 ms | 51.15 ms |
| Replace all 10,000 rows | 548.19 ms | 798.16 ms | 594.73 ms | 71.32 ms | 2842.90 ms |

