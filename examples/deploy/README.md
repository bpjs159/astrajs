# Deploy Examples

The same app, deployed to four different targets — only `astra.config.json` changes.

| Example | Adapter | Output | Deploy with |
| --- | --- | --- | --- |
| [01-node](./01-node) | `node` | `dist/server/server.mjs` + Dockerfile | Node, Docker, Fly.io, Railway, EC2 |
| [02-vercel](./02-vercel) | `vercel` | `api/astra.mjs` + `vercel.json` | `vercel --prod` |
| [03-cloudflare](./03-cloudflare) | `cloudflare` | `dist/_worker.js` + `wrangler.toml` | `wrangler pages deploy` |
| [04-static](./04-static) | `static` | `dist/` (pure static files) | GitHub Pages, S3, any CDN |

## Quick start

```bash
cd 01-node        # or 02-vercel, 03-cloudflare, 04-static
npm install       # links the monorepo packages
npm run build     # astra build → adapter output
```

Each app shares the same source layout:

- `src/server.ts` — `server()` endpoints (`getQuote`, cached `getStats`, `addVisit`)
- `src/app.tsx` — the client UI, compiled to direct DOM mutations
- `astra.config.json` — the ONLY difference between the four deployments

The static example ([04-static](./04-static)) swaps the dynamic endpoints
for `server({ type: 'pre-build' })` calls that fold data into the bundle
at build time — its output runs without any server.

## What happens on build

1. **Client build** — Vite compiles JSX to physical DOM mutations; `server()` calls become typed `fetch()` wrappers.
2. **Server manifest** — the compiler emits the list of RPC endpoints (`dist/astra-server-modules.json`).
3. **SSR bundle** — the CLI builds a server entry that imports your real server modules, so handlers keep their module-scope closures.
4. **Adapter emission** — `@bpjs159/adapters` writes the platform files for the configured adapter.

Full docs: `/docs/deployment` on the official site.
