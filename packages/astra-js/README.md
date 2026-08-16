# astrajsx

**AstraJS** — Full-Stack TypeScript Framework: Zero-VDOM, AST-compiled, Proxy-reactive, SSR/SSG built-in.

One install, dynamic subpath imports — only the entry you import is loaded:

```bash
npm install astrajsx
```

```ts
import { store, jsx } from 'astrajsx/core';        // reactive state + JSX runtime
import astra from 'astrajsx/compiler';             // Vite plugin (vite.config.ts)
import { server } from 'astrajsx/server';          // server$ RPC macro
import { renderToString } from 'astrajsx/ssr';     // SSR renderer
import { createI18n } from 'astrajsx/i18n';
import { route } from 'astrajsx/router';
```

## CLI

```bash
npx astra my-app        # scaffold a new project
npx astra dev           # dev server
npx astra build         # production build (SSR/SSG adapters)
```

## Subpaths

| Import | Module |
| --- | --- |
| `astrajsx` / `astrajsx/core` | reactivity store + JSX |
| `astrajsx/core/validation` | built-in validators |
| `astrajsx/core/vite` | vite helpers |
| `astrajsx/compiler` | AST compiler (Vite plugin) |
| `astrajsx/compiler/css` | css macro runtime |
| `astrajsx/server` | server RPC, SWR, cache tags |
| `astrajsx/ssr` | SSR renderer, SSG crawler |
| `astrajsx/router` | isomorphic routing |
| `astrajsx/i18n` | internationalization |
| `astrajsx/form` | reactive form metadata |
| `astrajsx/schema` | declarative validation |
| `astrajsx/validation` | standalone validators |
| `astrajsx/ai` / `astrajsx/ai/rag` | AI endpoints + RAG |
| `astrajsx/adapters` / `astrajsx/adapters/edge` | deployment adapters |

Docs: [astrajs.dev](https://astrajs.dev)
