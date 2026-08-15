# Deploy 01 — Node adapter

`server()` handlers running on a standalone Node server, static files served
from the same process. Targets: Docker, Fly.io, Railway, Render, EC2.

## Build

```sh
npm install
npm run build        # astra build → dist/ + dist/server/server.mjs + Dockerfile
```

What `astra build` did:

1. `vite build` — client bundle into `dist/`
2. read `dist/astra-server-modules.json` (handler id → module)
3. generated `.astra/server-entry.ts` importing `src/server.ts` + the Node shell
4. `vite build --ssr` — single-file server bundle (real closures)
5. emitted `dist/server/server.mjs`, `dist/server/package.json`, `Dockerfile`

## Run

```sh
npm start                 # node dist/server/server.mjs  → http://localhost:3000
```

Or Docker:

```sh
docker build -t astra-node .
docker run -p 3000:3000 astra-node
```

## Verify RPC

```sh
curl -X POST http://localhost:3000/api/astra/<id> -H 'Content-Type: application/json' -d '[]'
```

(`<id>` is listed in `dist/astra-server-manifest.json`.)

Env vars: `PORT` (default 3000), `ASTRA_DIST` (override static dir).
