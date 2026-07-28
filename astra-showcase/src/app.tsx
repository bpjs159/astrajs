/**
 * AstraStore — App Root Component
 *
 * Initializes the app with the router and renders the root element.
 * This is the entry point that ties together all the pieces:
 * - Creates the router with the route tree
 * - Loads initial data into stores
 * - Renders the matched route via the root <Outlet />
 * - Exposes the router for programmatic navigation
 *
 * Type: Component
 */

import type { Component } from '@astrajs/core';
import { effect } from '@astrajs/core';
import { createRouter, Outlet } from '@astrajs/router';
import { routes } from './routes.js';
import { productStore } from './stores/products.js';
import { orderStore } from './stores/orders.js';
import { getProducts } from './server/products.server.js';
import { getOrders } from './server/orders.server.js';

/**
 * The router instance — created once, shared globally.
 * Components use `useLocation()` and `useParams()` to react
 * to route changes.
 */
export const router = createRouter(routes);

// Expose router globally for components that need programmatic navigation
if (typeof window !== 'undefined') {
  (window as Record<string, unknown>).__astra_router = router;
}

/**
 * App root component. Loads initial data and renders the router outlet.
 *
 * On first render:
 * 1. `getProducts()` returns pre-built data (SSG) or fetches (CSR).
 * 2. `getOrders()` fetches order history.
 * 3. The router matches the current URL and renders the matched route.
 *
 * Data loading is done via `effect()` — only runs once on mount
 * since the dependencies don't change.
 */
export const App: Component = () => {
  // Load initial data (runs once)
  let loaded = false;

  effect(() => {
    if (loaded) return;
    loaded = true;

    // Load products (pre-built in SSG, fetched in CSR)
    getProducts().then((products) => {
      productStore.items = products;
    }).catch((err) => {
      console.error('Failed to load products:', err);
    });

    // Load orders (dynamic)
    getOrders().then((orders) => {
      orderStore.orders = orders;
    }).catch((err) => {
      console.error('Failed to load orders:', err);
    });
  });

  // Render the root outlet — the router fills it with matched content
  return (
    <div id="root">
      <Outlet />
    </div>
  );
};
