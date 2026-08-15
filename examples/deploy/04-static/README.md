# 04 — Static Deploy (SSG)

The same `server()` macro, in **pre-build** mode: the function executes
during `astra build` and its result is **inlined into the client bundle**.
The output is pure static files — no server process at runtime.

```bash
npm install
npm run build     # astra build → dist/
```

`dist/` is upload-ready for GitHub Pages, S3, Netlify, or any CDN.

```bash
# preview locally
npm run preview
```

## How it works

`server({ type: 'pre-build' }, fn)` tells the compiler to:

1. Extract the function body.
2. Execute it in Node at build time.
3. Replace the whole expression with the resulting JSON constant.

Open `dist/assets/*.js` and search for `"Wireless Headphones"` —
the data is there, but there is **no `fetch`, no async, no API call**.

> Dynamic `server()` calls (per-request data) need a runtime adapter:
> `node`, `vercel` or `cloudflare`. See the sibling examples.
