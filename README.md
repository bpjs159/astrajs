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

One install, dynamic subpath imports — only the entry you import is loaded:

```bash
npm install astrajs.dev
```

```ts
import { store } from 'astrajs.dev/core';
import astra from 'astrajs.dev/compiler';
import { server } from 'astrajs.dev/server';
```

| Subpath | Description | Repo dir |
|---------|-------------|----------|
| `astrajs.dev/core` | Proxy-based reactivity runtime, JSX runtime & types, DOM bindings (~3 KB) | [`packages/core`](packages/core) |
| `astrajs.dev/compiler` | Vite plugin: AST transformers, `server()` RPC, CSS macro, auto-memo | [`packages/compiler`](packages/compiler) |
| `astrajs.dev/server` | `server()` RPC macro, SWR, cache tags, autoSync | [`packages/server`](packages/server) |
| `astrajs.dev/ssr` | Server renderer, SSG crawler, HTML stringifier, ISR, resumability | [`packages/ssr`](packages/ssr) |
| `astrajs.dev/router` | Isomorphic router with `<Outlet />` and View Transitions | [`packages/router`](packages/router) |
| `astrajs.dev/adapters` | Deployment adapters: Node, Vercel, Cloudflare, static | [`packages/adapters`](packages/adapters) |
| `astrajs.dev/ai` | Typed AI endpoints, streaming, tool agents, in-memory RAG | [`packages/ai`](packages/ai) |
| `astrajs.dev/form` | Reactive form controller (HTML5 Constraint Validation API) | [`packages/form`](packages/form) |
| `astrajs.dev/schema` | Declarative validation schemas with inferred types | [`packages/schema`](packages/schema) |
| `astrajs.dev/validation` | Standalone validator functions and compositors | [`packages/validation`](packages/validation) |
| `astrajs.dev/i18n` | Built-in i18n: reactive translations, pluralization, Intl formats | [`packages/i18n`](packages/i18n) |
| `astrajs.dev` (bin `astrajs`)  | Scaffold and run AstraJS projects (`astrajs my-app`, `astrajs dev`) | [`packages/astra`](packages/astra) |

## Quick Start

```bash
# Scaffold a new project
npm create astrajs.dev@latest my-app -- --template minimal
# or
npx astrajs.dev@latest my-app

# Develop / build from the repo
pnpm install
pnpm build        # build all packages
pnpm dev          # run the docs site
```

## Examples

- `examples/frontend/` — state, global state, forms, routing, CSS macro,
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
# publishing requires npm >= 11 (npm 10.9.x sends PUTs without auth):
node scripts/publish.mjs --npm11 --tag beta
```

## Docs

The documentation site lives in `astra-site/` (fully translated in 9
locales): `pnpm --filter astra-site dev`.

## License

MIT — all packages. Branding assets (logos, images) are © AstraJS.

## 📋 Changelog

- **0.1.20** (2026-08-19): rename from frontend-only to just frontend


- **0.1.19** (2026-08-19): Fix for ssl on new examples


- **0.1.18** (2026-08-19): New card example added


- **0.1.17** (2026-08-19): Added workspaces names astrajs


- **0.1.16** (2026-08-19): Some astra tasks tweaks


- **0.1.15** (2026-08-19): Astra js task implemented


- **0.1.14** (2026-08-19): Added new store example


- **0.1.13** (2026-08-18): deploy: move prod host/key defaults out of tracked code (keys/deploy-target.json)


- **0.1.12** (2026-08-18): Security patches added


- **0.1.10** (2026-08-18): Full implementations on all examples


- **0.1.9** (2026-08-18): Push version


- **0.1.4** (2026-08-18): Some fixes on astra doc site


- **0.1.3** (2026-08-18): removing vite config on git


- **0.1.2** (2026-08-18): Removed astra files into git compiled


- **0.1.1** (2026-08-18): Added deploy script


- **0.1.2** (2026-08-18): Fix for new package astrajs.dev


- **0.1.1** (2026-08-16): First deployment


- **0.1.0** (2026-08-15): Automatic version bump on commit via Husky (all package.json files)
