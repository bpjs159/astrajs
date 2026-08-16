# @bpjs159/adapters

Deployment adapters for AstraJS — one API, four targets.

| Adapter | Import | Output (written by `astra build`) |
| --- | --- | --- |
| Node | `@bpjs159/adapters` | `dist/server/server.mjs` + `Dockerfile` |
| Vercel | `@bpjs159/adapters` | `api/astra.mjs` + `vercel.json` |
| Cloudflare | `@bpjs159/adapters/edge` | `dist/_worker.js` + `wrangler.toml` |
| Static | — | plain `dist/` (SSG + pre-build only) |

## How it works

1. The compiler emits `astra-server-modules.json` listing every module that
   defines a `server()` handler.
2. `astra build` generates an entry that imports those modules (so the real
   closures — with module scope — register themselves) and a platform shell
   from this package.
3. A second Vite pass (`vite build --ssr`) bundles entry + handlers into a
   single file.
4. The adapter emitter writes the platform files.

## Runtime API

```ts
// platform-neutral core (edge-safe)
import { createAstraHandler } from '@bpjs159/adapters';
const handle = createAstraHandler({ apiPrefix: '/api/astra' });
const response = await handle(new Request('https://app/api/astra/getProducts', { method: 'POST', body: '[]' }));

// Node standalone server (RPC + static + optional SSR)
import { startAstraServer } from '@bpjs159/adapters';
startAstraServer({ apiPrefix: '/api/astra', staticDir: './dist', port: 3000 });

// Vercel serverless function (Node runtime)
import { createVercelHandler } from '@bpjs159/adapters';
export default createVercelHandler({ apiPrefix: '/api/astra' });

// Cloudflare Worker (edge)
import { createCloudflareHandler } from '@bpjs159/adapters/edge';
export default createCloudflareHandler({ apiPrefix: '/api/astra' });
```

## Edge safety

`@bpjs159/adapters/edge` never imports Node built-ins — bundle it for
Cloudflare Workers / Pages with confidence. `@bpjs159/server` is
edge-safe too (Web APIs only).

## Build-time emitters

`emitNodeAdapter`, `emitVercelAdapter`, `emitCloudflareAdapter` write the
platform files given the client build + the bundled SSR entry. They are
called automatically by `astra build` — you rarely call them directly.
