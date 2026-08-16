/**
 * @bpjs159/router — useLocation() hook + RouteDefinition type
 *
 * Reactive path accessor and route configuration types.
 */

import { _pathState } from './path-state.js';

/**
 * Returns the current reactive path. When the path changes via
 * `navigate()`, any component reading `useLocation()` re-renders.
 *
 * ```ts
 * const loc = useLocation();
 * console.log(loc.path); // "/products"
 * ```
 */
export function useLocation(): { readonly path: string } {
  return _pathState;
}

/**
 * Route definition used for route configuration and SSG crawling.
 */
export interface RouteDefinition {
  /** The URL path pattern (e.g., `/products/:id`). */
  path: string;
  /**
   * The component or lazy loader for this route.
   * - Direct component: `() => JSX.Element`
   * - Lazy: `() => Promise<{ default: Component }>` (code-split)
   */
  component?: (props: Record<string, unknown>) => JSX.Element | Promise<{ default: (props: Record<string, unknown>) => JSX.Element }>;
  /** Optional child routes (nested routing). */
  children?: RouteDefinition[];
  /** If set, this route redirects to the given path. */
  redirect?: string;
  /** Optional metadata for the route. */
  meta?: Record<string, unknown>;
}
