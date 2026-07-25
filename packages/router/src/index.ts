/**
 * @astrajs/router — Public API Entry Point
 *
 * AstraJS Router provides isomorphic (client + server) routing with:
 * - Nested layouts via `<Outlet />`
 * - View Transitions API integration
 * - window.history-based navigation (no full page reloads)
 * - Preserved parent component state across route changes
 *
 * @example
 * ```ts
 * import { createRouter, Outlet, useLocation } from '@astrajs/router';
 *
 * const router = createRouter({
 *   routes: [
 *     { path: '/', component: Layout, children: [
 *       { path: '', component: HomePage },
 *       { path: 'products/:id', component: ProductPage },
 *     ]},
 *   ],
 * });
 * ```
 */

import type { Component } from '@astrajs/core';

// ─── Public Types ────────────────────────────────────────────────────────────

/**
 * A single route definition.
 *
 * Routes can be nested arbitrarily deep. When a route has children,
 * it must render an `<Outlet />` where child content will appear.
 *
 * @typeParam P — The props type for the route component (default: `{}`).
 */
export interface RouteDefinition<P = Record<string, unknown>> {
  /** URL path pattern. Supports `:param` and `*` wildcards. */
  path: string;
  /** The component to render when this route matches. */
  component?: Component<P>;
  /** Nested child routes. The parent must include `<Outlet />`. */
  children?: RouteDefinition[];
  /** Optional redirect target. */
  redirect?: string;
  /** Optional metadata for breadcrumbs, SEO, etc. */
  meta?: RouteMeta;
}

/**
 * Metadata for a route — useful for breadcrumbs, document title, etc.
 */
export interface RouteMeta {
  title?: string;
  description?: string;
  /** Whether this route requires authentication. */
  auth?: boolean;
  /** Arbitrary data for custom middleware/guards. */
  [key: string]: unknown;
}

/**
 * The result of matching a URL against the route tree.
 */
export interface RouteMatch {
  /** The matched route definition. */
  route: RouteDefinition;
  /** Extracted path parameters (e.g., `{ id: '42' }` from `/users/:id`). */
  params: Record<string, string>;
  /** The matched path segment (useful for breadcrumbs). */
  path: string;
}

/**
 * Configuration for the router instance.
 */
export interface RouterConfig {
  /** The route tree (root-level routes). */
  routes: RouteDefinition[];
  /**
   * Base URL for the app (e.g., `/app` when deployed under a sub-path).
   * @default '/'
   */
  base?: string;
  /**
   * Whether to use the View Transitions API for animated page transitions.
   * @default true
   */
  viewTransitions?: boolean;
}

/**
 * The router instance — returned by `createRouter()`.
 */
export interface Router {
  /** The current matched route stack (root → deepest child). */
  readonly current: RouteMatch[];
  /**
   * Navigate to a new path. Updates `window.history`, re-renders
   * only the affected `<Outlet />` nodes, and triggers View Transitions
   * if enabled.
   */
  navigate: (to: string, options?: NavigateOptions) => Promise<void>;
  /**
   * Replace the current history entry (no new entry in the stack).
   */
  replace: (to: string) => Promise<void>;
  /** Go back in history. */
  back: () => void;
  /** Go forward in history. */
  forward: () => void;
}

/**
 * Options for `router.navigate()`.
 */
export interface NavigateOptions {
  /** Data to pass to the target route (accessible via `useLocation().state`). */
  state?: unknown;
  /** If true, replaces the current history entry instead of pushing. */
  replace?: boolean;
}

// ─── Runtime Implementations ─────────────────────────────────────────────────

export { createRouter } from './router.js';
export { Outlet, resetOutletDepth } from './outlet.js';
export { useLocation, useRouteMeta, useParams } from './hooks.js';
export { matchRoutes, collectLeafRoutes, findRoute } from './matcher.js';
export { startViewTransition, supportsViewTransitions } from './view-transitions.js';
