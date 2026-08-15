# Deploy 03 — Cloudflare adapter

`server()` handlers inside ONE Worker (`dist/_worker.js`), static assets
served by the Cloudflare Pages pipeline. The handler graph is edge-safe:
`@astrajs/adapters/edge` never pulls in Node built-ins.

## Build

```sh
npm install
npm run build        # astra build → dist/ + dist/_worker.js + wrangler.toml
```

What `astra build` did:

1. `vite build` — client bundle into `dist/`
2. read `dist/astra-server-modules.json`
3. generated `.astra/server-entry.ts` (imports `src/server.ts` + edge shell)
4. `vite build --ssr` — single-file ESM worker bundle
5. emitted `dist/_worker.js`, `wrangler.toml`, `deploy.sh`

## Deploy

```sh
npx wrangler pages deploy dist --project-name astra-app
# or
./deploy.sh
```

Cloudflare Pages serves `dist/` assets and runs `dist/_worker.js` for all
other routes — the Worker dispatches `/api/astra/*` to your handlers.

## Verify RPC

```sh
curl -X POST https://<project>.pages.dev/api/astra/<id> -H 'Content-Type: application/json' -d '[]'
```

(`<id>` is listed in `dist/astra-server-manifest.json`.)
