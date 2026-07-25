# AstraStore — E-commerce Dashboard Showcase

> Built with **AstraJS** — Zero-VDOM, Proxy-Reactive, Resumable SSR/SSG.

## Features Demonstrated

| Feature | Where |
|---------|-------|
| **`store()` reactivity** | `stores/products.ts`, `stores/cart.ts`, `stores/orders.ts` |
| **`Component<P>` typed components** | `components/stat-card.tsx`, `components/product-card.tsx` |
| **`css` macro (zero-runtime CSS)** | `styles/dashboard.css.ts` → extracted at build time |
| **`<Outlet />` layout preservation** | `layouts/dashboard.tsx` — Sidebar persists across navigation |
| **`server$({ type: 'pre-build' })`** | `server/products.server.ts` — Products inlined at SSG time (0 KB JS) |
| **`server$()` dynamic RPC** | `server/orders.server.ts` — Orders fetched at runtime |
| **`revalidate()` cache invalidation** | `server/products.server.ts` — Stock updates purge cache |
| **`useLocation()` / `useParams()`** | `components/sidebar.tsx`, `pages/product-detail.tsx` |
| **View Transitions** | `layouts/dashboard.tsx` — `view-transition-name: main-content` |
| **SSR resumability** | `main.tsx` — `resume()` from `astra-data` attributes |

## Project Structure

```
src/
├── main.tsx                    # Client entry (resume or fresh mount)
├── app.tsx                     # Root component, router, data loading
├── routes.ts                   # Route tree definition
├── layouts/
│   └── dashboard.tsx           # Sidebar + <Outlet /> layout
├── pages/
│   ├── home.tsx                # Dashboard overview with stats
│   ├── products.tsx            # Product catalog with filters
│   ├── product-detail.tsx      # Single product with add-to-cart
│   └── orders.tsx              # Order history with status badges
├── components/
│   ├── sidebar.tsx             # Persistent navigation sidebar
│   ├── product-card.tsx        # Product card (typed props)
│   ├── stat-card.tsx           # Statistics card (typed props)
│   └── cart-badge.tsx          # Reactive cart count badge
├── stores/
│   ├── products.ts             # Products store + computed filters
│   ├── cart.ts                 # Cart store + mutations + computed totals
│   └── orders.ts               # Orders store + stats
├── server/
│   ├── products.server.ts      # server$ queries + mutations
│   └── orders.server.ts        # server$ order management
└── styles/
    └── dashboard.css.ts        # css`...` macro → static CSS at build
```

## Running

```bash
# Development
pnpm dev

# Build (SSG)
pnpm build

# Preview production build
pnpm preview
```

## Key Architecture Insights

### 1. Zero-VDOM Reactivity
```ts
const count = getCartCount();
// In JSX: <span>{count}</span>
// Compiles to: bindText(textNode, () => String(getCartCount()))
// When cartStore.items changes → only this TextNode updates — O(1)
```

### 2. Layout Preservation
```
Navigate: / → /products
  Sidebar stays intact ✓
  Only <Outlet /> content swaps ✓
  View Transition animates the swap ✓
```

### 3. Pre-Build Constant Folding
```ts
// server/products.server.ts
export const getProducts = server$(
  { type: 'pre-build', tags: ['products'], maxAge: 3600 },
  async () => db.products.findMany()
);
// → Executed at SSG time, result inlined in HTML
// → 0 KB JS shipped to client for product data
```

### 4. Resumability
```html
<!-- Server-rendered HTML -->
<div astra-data="{&quot;items&quot;:[{&quot;id&quot;:&quot;prod_001&quot;,...}]}">
  <span astra-on:click="handleAddToCart">Add to Cart</span>
</div>
<!-- Client: resume() deserializes state, attaches delegated events -->
<!-- No component re-execution needed -->
```
