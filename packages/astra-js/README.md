# astrajs.dev

**AstraJS** — Full-Stack TypeScript Framework: Zero-VDOM, AST-compiled, Proxy-reactive, SSR/SSG built-in.

One install, dynamic subpath imports — only the entry you import is loaded:

```bash
npm install astrajs.dev
```

```ts
import { store, jsx } from 'astrajs.dev/core';        // reactive state + JSX runtime
import astra from 'astrajs.dev/compiler';             // Vite plugin (vite.config.ts)
import { server } from 'astrajs.dev/server';          // server$ RPC macro
import { renderToString } from 'astrajs.dev/ssr';     // SSR renderer
import { createI18n } from 'astrajs.dev/i18n';
import { route } from 'astrajs.dev/router';
```

## CLI

```bash
npx astrajs my-app        # scaffold a new project
npx astrajs dev           # dev server
npx astrajs build         # production build (SSR/SSG adapters)
```

## Subpaths

| Import | Module |
| --- | --- |
| `astrajs.dev` / `astrajs.dev/core` | reactivity store + JSX |
| `astrajs.dev/core/validation` | built-in validators |
| `astrajs.dev/core/vite` | vite helpers |
| `astrajs.dev/compiler` | AST compiler (Vite plugin) |
| `astrajs.dev/compiler/css` | css macro runtime |
| `astrajs.dev/server` | server RPC, SWR, cache tags |
| `astrajs.dev/ssr` | SSR renderer, SSG crawler |
| `astrajs.dev/router` | isomorphic routing |
| `astrajs.dev/i18n` | internationalization |
| `astrajs.dev/form` | reactive form metadata |
| `astrajs.dev/schema` | declarative validation |
| `astrajs.dev/validation` | standalone validators |
| `astrajs.dev/ai` / `astrajs.dev/ai/rag` | AI endpoints + RAG |
| `astrajs.dev/adapters` / `astrajs.dev/adapters/edge` | deployment adapters |

Docs: [astrajs.dev](https://astrajs.dev)
