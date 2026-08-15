# Deploy 02 — Vercel adapter

`server()` handlers as ONE serverless function (`api/astra.mjs`) with
rewrites from `/api/astra/*`. ISR works out of the box: handlers with
`maxAge` set `Cache-Control: s-maxage` (Vercel caches at the edge) and
`Cache-Tag` for later purging.

## Build

```sh
npm install
npm run build        # astra build → dist/ + api/astra.mjs + vercel.json
```

What `astra build` did:

1. `vite build` — client bundle into `dist/`
2. read `dist/astra-server-modules.json`
3. generated `.astra/server-entry.ts` (imports `src/server.ts` + Vercel shell)
4. `vite build --ssr` — single-file ESM bundle
5. emitted `api/astra.mjs` + `vercel.json` (rewrite `/api/astra/(.*)` → `/api/astra`)

## Deploy

```sh
npx vercel                # framework preset: Other
                          # build command: npm run build
                          # output directory: dist
```

Vercel runs `npm run build` on their CI — `api/astra.mjs` and `vercel.json`
are regenerated there, so commit them or add them to `.gitignore`.

## Verify RPC

```sh
curl -X POST https://<your-app>.vercel.app/api/astra/<id> -H 'Content-Type: application/json' -d '[]'
```

(`<id>` is listed in `dist/astra-server-manifest.json`.)
