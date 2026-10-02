# AstraJS: the TypeScript framework that eliminates the Virtual DOM

> **Zero-VDOM. AST-Compiled. Proxy-Reactive. Resumable. Ships Zero JS by default.**

AstraJS is a modular full-stack framework for TypeScript that compiles reactive components directly into physical DOM mutations. No Virtual DOM, no hydration, no re-renders: components run **once**, the AST compiler wires surgical `store()` → DOM bindings, and SSR/SSG/ISR + typed RPC are built in.

---

## The problem it solves

Modern frameworks (React, Vue) rebuild virtual trees and diff them on every update. That's expensive: updating a single row in a 10,000-row table can take 20ms in React. AstraJS attacks the root of the problem:

- **Components run ONCE** and return real DOM.
- **Updates are physical mutations** of subscribed nodes (O(1)).
- **No reconciliation, no diffing, no re-render.**

```tsx
import { component, store } from 'astrajs.dev/core';

export const Counter = component(() => {
  const counter = store({ value: 0 });

  return (
    <div>
      <span>{counter.value}</span>
      <button onclick={() => counter.value++}>+ 1</button>
    </div>
  );
});
```

The compiler turns `{counter.value}` into an O(1) effect that updates **only that TextNode**. The component never re-runs.

---

## Philosophy

1. **Zero-VDOM** — Components execute once and return real DOM elements. Updates are direct physical mutations of subscribed nodes.
2. **Resumability** — No eager hydration. State ships in `astra-data` attributes and interactive JS loads Just-In-Time via `astra-on:*`.
3. **Transparency** — You write vanilla JS/TS + standard HTML. The Vite compiler plugin does the heavy lifting (AST transforms, RPC, CSS extraction).
4. **Extreme type inference** — 100% inferred types from backend to JSX, `strict: true`, no codegen.

---

## Quick Start

```bash
# Scaffold a new project
npm create astrajs.dev@latest my-app -- --template minimal
# or
npx astrajs.dev@latest my-app

cd my-app
npm run dev    # development
npm run build  # production build
```

Three ready-made templates: **minimal** (counter), **frontend** (router + forms + schema) and **fullstack** (typed RPC + SSR).

---

## Core: Proxy-based reactivity (~3 KB)

The `astrajs.dev/core` runtime is tiny (~3 KB) and built on ES6 Proxies:

- `store()` — fine-grained reactive state.
- `dynamic()` — Zero-VDOM reactive expression marker.
- `component()` — single-execution component wrapper.
- `mounted()` — lifecycle hook.
- DOM bindings: `bindText`, `bindAttr`, `bindClass`, `bindList`, `bindConditional`…

```tsx
import { component, store, dynamic } from 'astrajs.dev/core';

const App = component(() => {
  const ui = store({ show: true, items: ['a', 'b'] });

  return (
    <div>
      {dynamic(() => ui.show ? <p>Visible</p> : null)}
      <ul>{dynamic(() => ui.items.map(i => <li>{i}</li>))}</ul>
    </div>
  );
});
```

Every reactive expression becomes a micro-effect that updates **only** the affected node. No full re-render, no diffing.

---

## The AST compiler

The Vite plugin (`astrajs.dev/compiler`) transforms your code at build time:

- **Auto-wrapping reactive expressions** — `{expr}` → `dynamic(() => expr)`.
- **Auto-memoization** — derived functions that read stores are wrapped in `memo()`.
- **`server()` RPC** — one function split into a client fetch stub + server handler.
- **`ai()` / `aiStream()`** — typed AI endpoints with streaming.
- **CSS extraction** and more.

You write vanilla JS/TS; the compiler does the rest.

---

## Server: typed RPC, ISR and autoSync

`astrajs.dev/server` gives you end-to-end typed RPC with a single function:

```ts
import { server } from 'astrajs.dev/server';

export const getPosts = server(
  { tags: ['posts'], maxAge: 60 },
  async (): Promise<Post[]> => {
    // This code NEVER ships to the browser — it runs on the server only.
    return db.query('SELECT * FROM posts');
  }
);
```

The compiler generates:
- **Client**: `getPosts()` → `fetch('/api/astra/getPosts')` with inferred types.
- **Server**: a handler registered in the Vite middleware (dev) or the serverless function (production).

It includes **cache tags with surgical invalidation** (`revalidate(['posts'])`), **ISR** (maxAge + stale-while-revalidate), **SWR** and **autoSync** for real-time data.

---

## SSR and Resumability: no hydration

AstraJS doesn't hydrate. State is serialized into `astra-data` attributes and events resume via `astra-on:*`:

```html
<button astra-on:click="__h_0" astra-data='{"count":0}'>+ 1</button>
```

On the client, `resume()` deserializes state into reactive Proxies, registers delegated events, and wires up the bindings. **Zero component re-execution, zero hydration.**

---

## The full ecosystem

One package, dynamic subpath imports — only what you import is loaded:

```bash
npm install astrajs.dev
```

| Subpath | Description |
|---------|-------------|
| `astrajs.dev/core` | Proxy reactivity runtime, JSX runtime & types, DOM bindings (~3 KB) |
| `astrajs.dev/compiler` | Vite plugin: AST transformers, `server()` RPC, CSS macro, auto-memo |
| `astrajs.dev/server` | `server()` RPC, SWR, cache tags, autoSync |
| `astrajs.dev/ssr` | Server renderer, SSG, ISR, resumability |
| `astrajs.dev/router` | Isomorphic router with `<Outlet />` and View Transitions |
| `astrajs.dev/adapters` | Deployment adapters: Node, Vercel, Cloudflare, static |
| `astrajs.dev/ai` | Typed AI endpoints, streaming, tool agents, in-memory RAG |
| `astrajs.dev/form` | Reactive form controller (Constraint Validation API) |
| `astrajs.dev/schema` | Declarative validation schemas with inferred types |
| `astrajs.dev/validation` | Standalone validators and compositors |
| `astrajs.dev/i18n` | Built-in i18n: reactive translations, pluralization, Intl |

### Reactive forms + declarative validation

```tsx
import { form } from 'astrajs.dev/form';
import { schema } from 'astrajs.dev/schema';

const ContactSchema = schema.object({
  name: schema.string().required().min(2),
  email: schema.string().required().email(),
});

const formController = form();

// <form controller={formController} onSubmit={handleSubmit}>
//   <input name="name" value={data.name} onBlur={() => validateField('name')} />
//   {formController.touched.name && ui.errors.name && <p class="error">…</p>}
// </form>
```

### Built-in AI

```tsx
import { aiStream } from 'astrajs.dev/ai';

const stream = aiStream('You are a helpful assistant', { model: 'qwen2.5-coder:7b' });
// typed streaming, tool agents, in-memory RAG
```

---

## Deploy: one command, any platform

```bash
astrajs build --adapter node       # Node
astrajs build --adapter vercel     # Vercel
astrajs build --adapter cloudflare # Cloudflare Workers
astrajs build --adapter static     # Static SSG
```

The CLI generates each platform's files (Dockerfile, `api/astra.mjs`, `_worker.js`, etc.) automatically.

---

## Benchmarks: numbers that speak

10,000-row table, production builds, jsdom (measures the framework's JS cost):

| Benchmark | **AstraJS** | React | Vue | Solid | Angular |
|---|---|---|---|---|---|
| Update 1 row | **0.08 ms** | 20.9 ms | 19.1 ms | 1.4 ms | 1.5 ms |
| Click → DOM | **2.4 ms** | 61 ms | 61 ms | 44 ms | 40 ms |
| Bootstrap | **0.26 ms** | 9.3 ms | 8.2 ms | 6.6 ms | 27 ms |
| Keystroke → DOM | **0.15 ms** | 0.59 ms | 0.50 ms | 0.23 ms | 0.34 ms |
| Bundle (gzip) | **1.9 kB** | 59 kB | 24.6 kB | 4.7 kB | — (AOT) |
| **Composite score** | **88%** | 49% | 50% | 58% | 36% |

**260× faster** than React at updating a row. **31× smaller** bundle. And a composite score of 88% vs React's 49%.

---

## Real sites built with AstraJS

- **astrajs.dev** — the documentation site (9 languages, live i18n).
- **astra-store** — full-stack eCommerce: SSR + RPC + ISR + auth + schema + AI/RAG + i18n.
- **astra-dash** — real-time dashboard: autoSync, AI streaming, uploads, resumability.
- **astra-blog** — blog with pre-built SSG.
- **28+ examples** — frontend, fullstack, AI and deploy.

---

## Why it matters

The Virtual DOM was a brilliant solution in 2013. But 12 years later, we're still paying its cost: re-renders, hydration, 60KB+ bundles just for the runtime. AstraJS proves there's a better path:

- **Components that run once** and produce real DOM.
- **O(1) updates** — surgical, not reconciliation.
- **Resumability** — zero hydration, on-demand JS.
- **Full-stack** — typed RPC, ISR, AI and deploy in one framework.
- **Tiny runtime** — 1.9 KB gzip.

---

## Get started today

```bash
npm create astrajs.dev@latest my-app -- --template fullstack
cd my-app
npm run dev
```

MIT License. Documentation in 9 languages. Reproducible benchmarks in the repo.

**AstraJS: Zero-VDOM. AST-Compiled. Proxy-Reactive. Resumable. Ships Zero JS by default.**

---

*Repo: [github.com/bpjs159/astrajs](https://github.com/bpjs159/astrajs) · Docs: [astrajs.dev](https://astrajs.dev)*