# @bpjs159/server

> **Server RPC, SWR, and cache management for AstraJS.**

## Features

- **`server()`** — Type-safe server RPC with function overloading
- **SWR** — Stale-While-Revalidate for async store initialization
- **Cache Tags** — Surgical cache invalidation with `revalidate()`
- **ISR** — Incremental Static Regeneration via `maxAge`
- **autoSync** — Automatic DOM mutations via ETag polling

## Usage

```ts
import { server, revalidate, ServerConfig } from '@bpjs159/server';

// Pre-built query (SSG — 0 KB JS on client)
const getProducts = server(
  { type: 'pre-build', tags: ['products'], maxAge: 3600 },
  async (category: string) => {
    const products = await db.products.findMany({ where: { category } });
    return products;
  }
);

// Dynamic mutation (CSR/SSR)
const addToCart = server(async (productId: string, qty: number) => {
  await db.cart.create({ data: { productId, qty } });
  revalidate('cart'); // Invalidate cache, notify clients
  return { success: true };
});

// SWR store (show stale data while revalidating)
import { store } from '@bpjs159/core';
const products = store(getProducts('hats'), { swr: true });
```

## How it works

The Vite AST compiler transforms `server()` calls:

1. **Build time:** Creates a server endpoint at `/api/astra/...`
2. **Client:** Replaces the call with a type-safe `fetch()` wrapper
3. **SSG (`type: 'pre-build'`):** Executes at build time and inlines the JSON result

## License

MIT
