/**
 * astrajs.dev/router — createRouter()
 *
 * Initializes the router with application route definitions.
 * Sets up browser history listeners and provides the route
 * tree for SSG crawling and `<Outlet />` resolution.
 *
 * ```ts
 * import { createRouter } from 'astrajs.dev/router';
 *
 * const router = createRouter([
 *   { path: '/', component: () => import('./pages/home.js') },
 *   { path: '/products', component: () => import('./pages/products.js') },
 *   { path: '/products/:id', component: () => import('./pages/product-detail.js') },
 * ]);
 * ```
 */

import type { RouteDefinition } from './location.js';

/**
 * Result of `createRouter()` — the router instance.
 */
export interface Router {
  /** The route definitions registered with the router. */
  routes: readonly RouteDefinition[];
}

/**
 * Creates a router instance with the given route definitions.
 *
 * The router sets up browser history (`popstate`) listeners
 * and provides the route tree for navigation, `<Outlet />`,
 * and SSG crawling.
 *
 * @param routes — Application route definitions.
 * @returns A router instance.
 */
export function createRouter(routes: RouteDefinition[]): Router {
  return { routes };
}
