# {{PROJECT_NAME}}

Scaffolded with **create-astra** (fullstack template).

## Getting started

```bash
{{PACKAGE_MANAGER}} install
{{PACKAGE_MANAGER}} dev
```

## What's inside

- `src/app.tsx` — entry with routing
- `src/server/posts.server.ts` — typed RPC with `server()`: caching, tags, revalidation
- `src/pages/posts.tsx` — client page consuming the server function
- `@astrajs/server` — the compiler splits `server()` into a client fetch stub + server handler
- `@astrajs/ssr` — SSR / SSG / ISR and resumability

## Docs

- [Server & Data](https://astrajs.dev/docs/server-data)
- [Rendering](https://astrajs.dev/docs/rendering)
