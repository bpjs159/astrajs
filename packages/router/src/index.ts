/**
 * @astrajs/router — Public API
 *
 * Declarative, fractal, relative-path-aware routing without wrapper components.
 *
 * ## Quick Start
 *
 * ```tsx
 * import { route, fallbackRoute, params, navigate } from '@astrajs/router';
 *
 * export const App = () => (
 *   <main>
 *     {route('/', { exact: true }) && <Home />}
 *     {route('/dashboard/:botId') && <Dashboard />}
 *     {fallbackRoute() && <h1>404</h1>}
 *   </main>
 * );
 * ```
 */

export { route, fallbackRoute, _resetRoutingDepth } from './route.js';
export { params } from './params.js';
export { queryStore } from './query-store.js';
export { navigate } from './navigate.js';
export { onRouteChange } from './listener.js';
export { lazy } from './lazy.js';
export { Link } from './link.js';
export type { LinkProps } from './link.js';
export { Outlet } from './outlet.js';
export { useLocation } from './location.js';
export type { RouteDefinition } from './location.js';
export { createRouter } from './create-router.js';
export type { Router } from './create-router.js';
