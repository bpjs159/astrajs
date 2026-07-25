/**
 * @astrajs/router — Outlet Component
 *
 * `<Outlet />` is the rendering target for nested route content.
 *
 * ## How It Works
 *
 * When a route has children, the parent component renders `<Outlet />`
 * at the position where child content should appear. On navigation,
 * only the content inside affected `<Outlet />` elements is replaced —
 * parent layout components and their state are preserved.
 *
 * Each `<Outlet />` registers itself with the router at a specific
 * depth in the route tree. The router tracks which outlets need
 * updating when the URL changes.
 *
 * ## Example
 *
 * ```tsx
 * const DashboardLayout: Component = () => (
 *   <div class="dashboard">
 *     <Sidebar />
 *     <main>
 *       <Outlet /> {/* Child routes render here * /}
 *     </main>
 *   </div>
 * );
 *
 * // With routes:
 * // { path: '/', component: DashboardLayout, children: [
 * //   { path: 'analytics', component: AnalyticsPage },
 * //   { path: 'settings', component: SettingsPage },
 * // ]}
 * ```
 */

import { registerOutlet, unregisterOutlet, getRouterState } from './router.js';

/**
 * Tracks the current outlet depth for automatic depth assignment.
 * Each time `<Outlet />` is called during a render, it gets the next depth.
 */
let globalDepth = 0;
const outletDepthStack: number[] = [];

/**
 * Resets the depth counter at the start of a new render cycle.
 * Called by the router before rendering.
 */
export function resetOutletDepth(): void {
  globalDepth = 0;
  outletDepthStack.length = 0;
}

/**
 * The `<Outlet />` component.
 *
 * Creates a container element (`<div>`) that serves as the rendering
 * target for matched child route content. The container registers itself
 * with the router at the current nesting depth.
 *
 * On route change, the router clears this container and renders the
 * new matched component — without touching the parent layout.
 *
 * @returns An HTMLElement that acts as the outlet slot.
 */
export function Outlet(): JSX.Element {
  const depth = globalDepth++;

  // Create the outlet container
  const el = document.createElement('div');
  el.setAttribute('data-astra-outlet', String(depth));
  el.style.display = 'contents'; // Transparent container — doesn't affect layout

  // Register with the router
  // Use microtask to ensure the element is in the DOM first
  queueMicrotask(() => {
    registerOutlet(depth, el);
  });

  // Cleanup on removal (handled via MutationObserver in production)
  // For now, we rely on the element being removed from DOM to trigger
  // cleanup in a future enhancement.

  return el;
}
