/**
 * @astrajs/router — Router Hooks
 *
 * Reactive hooks for accessing the current route state from within
 * components. These hooks leverage the reactivity system to
 * automatically re-render when the route changes.
 */

import type { RouteMeta } from '../index.js';
import { getRouterState } from './router.js';

// ─── useLocation ─────────────────────────────────────────────────────────────

/**
 * Hook to access the current location and navigation state.
 *
 * Returns reactive references to the current path, matched params,
 * and any state passed via `router.navigate('/path', { state: ... })`.
 *
 * In AstraJS, "hooks" don't need magic — they just read from the reactive
 * router state store. Any component that calls `useLocation()` and uses
 * the returned values will automatically update when the route changes.
 *
 * @returns An object with `path`, `params`, and `state`.
 *
 * @example
 * ```tsx
 * const Breadcrumbs: Component = () => {
 *   const { path, params } = useLocation();
 *   return (
 *     <nav>
 *       <span>Current path: {path}</span>
 *       <span>Product ID: {params.id}</span>
 *     </nav>
 *   );
 * };
 * ```
 */
export function useLocation(): {
  path: string;
  params: Record<string, string>;
  state: unknown;
} {
  const routerState = getRouterState();

  if (!routerState) {
    // Router not yet initialized — return defaults
    return { path: '/', params: {}, state: null };
  }

  // Return a computed view that the caller can destructure.
  // Since routerState is a reactive store, accessing `.path` and `.matches`
  // will auto-subscribe the calling component's bindings.
  const deepest = routerState.matches[routerState.matches.length - 1];

  return {
    get path(): string {
      return routerState.path;
    },
    get params(): Record<string, string> {
      return deepest?.params ?? {};
    },
    get state(): unknown {
      return routerState.navigationState;
    },
  };
}

// ─── useRouteMeta ────────────────────────────────────────────────────────────

/**
 * Hook to access the metadata of the current (deepest) matched route.
 *
 * Route metadata is defined in the route configuration and is useful
 * for breadcrumbs, document titles, auth guards, SEO tags, etc.
 *
 * @returns The route metadata, or `undefined` if no route is matched.
 *
 * @example
 * ```tsx
 * const PageTitle: Component = () => {
 *   const meta = useRouteMeta();
 *   return <h1>{meta?.title ?? 'AstraJS App'}</h1>;
 * };
 * ```
 */
export function useRouteMeta(): RouteMeta | undefined {
  const routerState = getRouterState();

  if (!routerState) return undefined;

  const deepest = routerState.matches[routerState.matches.length - 1];
  return deepest?.route.meta;
}

// ─── useParams ───────────────────────────────────────────────────────────────

/**
 * Convenience hook to access just the URL parameters of the current route.
 *
 * @returns An object with the extracted URL parameters.
 *
 * @example
 * ```tsx
 * const ProductPage: Component = () => {
 *   const { id } = useParams();
 *   return <div>Product: {id}</div>;
 * };
 * ```
 */
export function useParams(): Record<string, string> {
  const { params } = useLocation();
  return params;
}
