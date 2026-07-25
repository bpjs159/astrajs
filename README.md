# AstraJS — Full-Stack TypeScript Framework

> **Zero-VDOM. AST-Compiled. Proxy-Reactive. Resumable.**

AstraJS is a modular full-stack framework for TypeScript that compiles reactive components directly to physical DOM mutations — no Virtual DOM, no hydration, no bloat.

## Packages

| Package | Description |
|---------|-------------|
| `@astrajs/core` | Proxy-based reactivity runtime, JSX types, DOM injector (~3KB) |
| `@astrajs/core/vite` | Vite plugin: AST transformer, CSS extractor, `server$` compiler |
| `@astrajs/router` | Client/isomorphic router with `<Outlet />` and View Transitions |
| `@astrajs/server` | `server$()` RPC macro, SWR, cache tags, autoSync |
| `@astrajs/ssr` | Node.js renderer, SSG crawler, HTML stringifier, ISR |

## Quick Start

```bash
pnpm install
pnpm build
```

## Philosophy

1. **Zero-VDOM** — Components run ONCE, return real DOM elements.
2. **Resumability** — Zero eager hydration. State in `astra-data`, JS loaded JIT via `astra-on:*`.
3. **Transparency** — Write vanilla JS/TS + HTML. The compiler does the heavy lifting.
4. **Extreme Type Inference** — 100% inferred types, from backend to JSX.
