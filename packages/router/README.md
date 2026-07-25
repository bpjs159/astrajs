# @astrajs/router

> **Isomorphic router with nested layouts and View Transitions API support.**

## Features

- **Nested Layouts** — Parent components render `<Outlet />` and preserve state across child navigation
- **View Transitions** — Built-in support for the native View Transitions API (`view-transition-name`)
- **Isomorphic** — Same routing logic on client (SPA) and server (SSR)
- **History-based** — Uses `window.history` for pushState/replaceState navigation
- **URL Params** — `:param` and `*` wildcard patterns

## Usage

```tsx
import { createRouter, Outlet, useLocation } from '@astrajs/router';
import { Component } from '@astrajs/core';

// Define routes
const router = createRouter({
  routes: [
    {
      path: '/',
      component: DashboardLayout,
      children: [
        { path: '', component: HomePage, meta: { title: 'Home' } },
        { path: 'products', component: ProductsPage },
        { path: 'products/:id', component: ProductDetail },
      ],
    },
    {
      path: '/login',
      component: LoginPage,
    },
  ],
});

// Layout component with <Outlet />
const DashboardLayout: Component = () => (
  <div class="app-shell">
    <aside class="sidebar">
      <nav>
        <a href="/">Home</a>
        <a href="/products">Products</a>
      </nav>
    </aside>
    <main class="content" style={{ 'view-transition-name': 'main-content' }}>
      <Outlet /> {/* Child route renders here */}
    </main>
  </div>
);

// Navigate programmatically
router.navigate('/products/42');

// With state
router.navigate('/products/42', { state: { from: 'search' } });
```

## View Transitions

When `viewTransitions: true` (default), navigation wraps DOM updates in
`document.startViewTransition()`, enabling smooth animated transitions:

```css
::view-transition-old(main-content) {
  animation: fade-out 0.15s ease;
}
::view-transition-new(main-content) {
  animation: fade-in 0.15s ease;
}
```

## License

MIT
