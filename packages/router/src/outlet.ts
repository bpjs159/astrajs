/**
 * astrajs.dev/router — <Outlet /> component
 *
 * Renders the matched child route. Works with the declarative
 * `route()` / `fallbackRoute()` system — no wrapper components needed.
 *
 * When placed inside a parent component, `<Outlet />` renders the
 * first matching child route at the current URL depth.
 *
 * ```tsx
 * const Dashboard = component(() => {
 *   return (
 *     <div class="dashboard">
 *       <Sidebar />
 *       <main>
 *         <Outlet />
 *       </main>
 *     </div>
 *   );
 * });
 * ```
 */

import { _resetRoutingDepth, _nextRenderCycle } from './route.js';
import { getCurrentPath } from './navigate.js';

/**
 * Renders the matched child route content.
 *
 * `<Outlet />` is a placeholder that gets replaced with the
 * currently active child route's rendered content at runtime.
 * It works by re-executing the parent component's route matching
 * at a nested depth when navigation occurs.
 *
 * The actual rendering is done by the parent component's `route()`
 * calls — `<Outlet />` just triggers a re-evaluation.
 */
export function Outlet(): HTMLElement {
  const el = document.createElement('span');
  el.style.display = 'contents';
  el.setAttribute('data-astra-outlet', getCurrentPath());
  return el;
}
