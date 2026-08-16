# AstraJS — Full-Stack TypeScript Framework

> **Zero-VDOM. AST-Compiled. Proxy-Reactive. Resumable. Ships Zero JS by default.**

AstraJS is a modular full-stack framework for TypeScript that compiles reactive
components directly into physical DOM mutations. No Virtual DOM, no hydration,
no re-renders: components run **once**, the AST compiler wires surgical
`store()` → DOM bindings, and SSR/SSG/ISR + typed RPC are built in.

## Philosophy

1. **Zero-VDOM** — Components execute ONCE and return real DOM elements.
   Updates are direct physical mutations of subscribed nodes (O(1)).
2. **Resumability** — No eager hydration. State ships in `astra-data`
   attributes and interactive JS loads Just-In-Time via `astra-on:*`.
3. **Transparency** — You write vanilla JS/TS + standard HTML. The Vite
   compiler plugin does the heavy lifting (AST transforms, RPC, CSS extraction).
4. **Extreme type inference** — 100% inferred types from backend to JSX,
   `strict: true`, no codegen.

## Packages

| Package | Description |
|---------|-------------|
| [`@astrajs/core`](packages/core) | Proxy-based reactivity runtime, JSX runtime & types, DOM bindings (~3 KB) |
| [`@astrajs/compiler`](packages/compiler) | Vite plugin: AST transformers, `server()` RPC, CSS macro, auto-memo |
| [`@astrajs/server`](packages/server) | `server()` RPC macro, SWR, cache tags, autoSync |
| [`@astrajs/ssr`](packages/ssr) | Server renderer, SSG crawler, HTML stringifier, ISR, resumability |
| [`@astrajs/router`](packages/router) | Isomorphic router with `<Outlet />` and View Transitions |
| [`@astrajs/adapters`](packages/adapters) | Deployment adapters: Node, Vercel, Cloudflare, static |
| [`@astrajs/ai`](packages/ai) | Typed AI endpoints, streaming, tool agents, in-memory RAG |
| [`@astrajs/form`](packages/form) | Reactive form controller (HTML5 Constraint Validation API) |
| [`@astrajs/schema`](packages/schema) | Declarative validation schemas with inferred types |
| [`@astrajs/validation`](packages/validation) | Standalone validator functions and compositors |
| [`@astrajs/i18n`](packages/i18n) | Built-in i18n: reactive translations, pluralization, Intl formats |
| [`@astrajs/cli`](packages/astra) | Scaffold and run AstraJS projects (`astra my-app`, `astra dev`) |

## Quick Start

```bash
# Scaffold a new project
npx @astrajs/cli@latest my-app     # or: pnpm create astrajs my-app

# Develop / build from the repo
pnpm install
pnpm build        # build all packages
pnpm dev          # run the docs site
```

## Examples

- `examples/frontend-only/` — state, global state, forms, routing, CSS macro,
  conditional lists, async data, lifecycle, composition, dynamic attrs
- `examples/fullstack/` — server RPC, SWR, form actions, router params,
  schema validation, optimistic mutations, uploads, autoSync, resumability,
  pre-built SSG
- `examples/ai/` — streaming chat, tool-calling agents, build-time AI, RAG
- `examples/deploy/` — Node, Vercel, Cloudflare, static

## Benchmarks

AstraJS is benchmarked against React, Vue, Solid and Angular — 10,000-row
table, interaction latency, memory, and bundle size (production builds,
jsdom, see `benchmarks/` and `/docs/comparison#benchmarks`).

| | AstraJS | React | Vue | Solid | Angular |
|---|---|---|---|---|---|
| Update 1 row | **0.08 ms** | 20.9 ms | 19.1 ms | 1.4 ms | 1.5 ms |
| Click → DOM | **2.4 ms** | 61 ms | 61 ms | 44 ms | 40 ms |
| Bootstrap | **0.26 ms** | 9.3 ms | 8.2 ms | 6.6 ms | 27 ms |
| Bundle (gzip) | **1.9 kB** | 59 kB | 24.6 kB | 4.7 kB | — (AOT) |
| Composite score | **88%** | 49% | 50% | 58% | 36% |

## Scripts

```bash
pnpm build          # build every package
pnpm test           # run all test suites
pnpm publish:beta   # publish all packages with the `beta` tag
pnpm publish:dry    # dry-run the publish flow
```

## Docs

The documentation site lives in `astra-site/` (fully translated in 9
locales): `pnpm --filter astra-site dev`.

## License

MIT — all packages. Branding assets (logos, images) are © AstraJS.
