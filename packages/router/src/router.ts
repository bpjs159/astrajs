/**
 * @astrajs/router — Core Router Engine
 *
 * Implements the `createRouter()` factory and the Router instance.
 *
 * ## Architecture
 *
 * ```
 * User clicks <a> or calls router.navigate()
 *   │
 *   ├── 1. Build new URL, normalize path
 *   ├── 2. Match path against route tree → RouteMatch[]
 *   ├── 3. Detect which Outlets need updating (layout preservation)
 *   ├── 4. [Optional] Wrap in startViewTransition()
 *   ├── 5. Update window.history (pushState/replaceState)
 *   └── 6. Render new content into affected <Outlet /> slots
 * ```
 *
 * ## Layout Preservation
 *
 * When navigating from `/products/42` to `/products/99`:
 * - The layout (`/`) stays intact
 * - Only the `<Outlet />` inside the products parent is re-rendered
 * - Reactivity state in the layout is preserved
 */

import type {
  Router,
  RouterConfig,
  RouteMatch,
  NavigateOptions,
  RouteMeta,
} from '../index.js';
import { store, effect, batch } from '@astrajs/core';
import { matchRoutes, collectLeafRoutes } from './matcher.js';
import { startViewTransition } from './view-transitions.js';

// ─── Router State ────────────────────────────────────────────────────────────

/**
 * Global router state — reactive so components can subscribe.
 */
interface RouterState {
  /** The current pathname (e.g., `/products/42`). */
  path: string;
  /** The matched route chain from root to deepest match. */
  matches: RouteMatch[];
  /** Arbitrary state passed via navigate(). */
  navigationState: unknown;
}

/**
 * The singleton router state store.
 * Created lazily by createRouter().
 */
let routerState: RouterState | null = null;

/**
 * Registered `<Outlet />` placeholders, keyed by depth in the route chain.
 * Each outlet is a DOM element where child route content is rendered.
 *
 * When a route changes, only outlets at or below the change depth are
 * re-rendered. Higher outlets (layouts) are left alone.
 */
const outlets = new Map<number, HTMLElement>();

// ─── Router Implementation ───────────────────────────────────────────────────

/**
 * Creates an isomorphic router instance.
 *
 * The router manages browser history (pushState/replaceState), matches
 * URL paths against a route tree, and orchestrates DOM updates through
 * registered `<Outlet />` placeholders.
 *
 * On the client, it:
 * - Listens for `popstate` events (back/forward navigation)
 * - Intercepts `<a>` clicks for SPA-style navigation
 * - Integrates with the View Transitions API
 *
 * On the server (SSR), it matches routes synchronously without
 * browser-specific APIs.
 *
 * @param config — Route tree and configuration.
 * @returns A Router instance.
 */
export function createRouter(config: RouterConfig): Router {
  const { routes, base = '/', viewTransitions = true } = config;

  // Normalize base
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;

  // Initialize state
  const currentPath = typeof window !== 'undefined'
    ? window.location.pathname.replace(normalizedBase, '') || '/'
    : '/';

  const initialMatches = matchRoutes(currentPath, routes);

  const state = store<RouterState>({
    path: currentPath,
    matches: initialMatches,
    navigationState: null,
  });

  routerState = state;

  // ─── Browser Integration (client-only) ────────────────────────────────

  if (typeof window !== 'undefined') {
    // Listen for back/forward navigation
    window.addEventListener('popstate', (event: PopStateEvent) => {
      const newPath = window.location.pathname.replace(normalizedBase, '') || '/';
      const newMatches = matchRoutes(newPath, routes);

      batch(() => {
        state.path = newPath;
        state.matches = newMatches;
        state.navigationState = event.state;
      });

      // Re-render affected outlets
      renderOutlets(newMatches, viewTransitions);
    });

    // Intercept <a> clicks for SPA navigation
    document.addEventListener('click', (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Skip external links, hash links, download links, etc.
      if (
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        target.hasAttribute('download') ||
        target.getAttribute('target') === '_blank' ||
        target.getAttribute('rel')?.includes('external')
      ) {
        return;
      }

      // Skip if modifier keys are pressed (user wants new tab)
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      event.preventDefault();
      void navigate(href, { state: null });
    });
  }

  // ─── Navigate ─────────────────────────────────────────────────────────

  async function navigate(
    to: string,
    options: NavigateOptions = {}
  ): Promise<void> {
    // Resolve relative paths
    const resolved = to.startsWith('/')
      ? to
      : resolveRelative(state.path, to);

    const newMatches = matchRoutes(resolved, routes);

    if (newMatches.length === 0) {
      console.warn(`[AstraJS Router] No route matched for path: ${resolved}`);
      return;
    }

    // Check for redirect
    const deepest = newMatches[newMatches.length - 1]!;
    if (deepest.route.redirect) {
      return navigate(deepest.route.redirect, options);
    }

    // Update history
    const fullPath = normalizedBase + resolved;
    if (options.replace) {
      window.history.replaceState(options.state ?? null, '', fullPath);
    } else {
      window.history.pushState(options.state ?? null, '', fullPath);
    }

    // Update state
    batch(() => {
      state.path = resolved;
      state.matches = newMatches;
      state.navigationState = options.state ?? null;
    });

    // Update document title from route meta
    const meta = deepest.route.meta;
    if (meta?.title) {
      document.title = meta.title;
    }

    // Re-render affected outlets
    await renderOutlets(newMatches, viewTransitions);
  }

  // ─── Replace ──────────────────────────────────────────────────────────

  async function replace(to: string): Promise<void> {
    return navigate(to, { replace: true });
  }

  // ─── Back / Forward ───────────────────────────────────────────────────

  function back(): void {
    window.history.back();
  }

  function forward(): void {
    window.history.forward();
  }

  return {
    get current(): RouteMatch[] {
      return state.matches;
    },
    navigate,
    replace,
    back,
    forward,
  };
}

// ─── Outlet Rendering ────────────────────────────────────────────────────────

/**
 * Renders route content into each registered `<Outlet />` at its
 * corresponding depth in the match chain.
 *
 * Only outlets whose content has changed are re-rendered — parent
 * layouts (shallower outlets) remain untouched.
 *
 * @param matches — The new matched route chain.
 * @param useVT — Whether to wrap in a View Transition.
 */
async function renderOutlets(
  matches: RouteMatch[],
  useVT: boolean
): Promise<void> {
  const update = (): void => {
    for (const [depth, outletEl] of outlets) {
      // The component for this depth is at `matches[depth]`
      // The content to render inside it is the component at `matches[depth + 1]`
      const parentMatch = matches[depth];
      const childMatch = matches[depth + 1];

      if (!parentMatch) continue;

      // Clear existing content
      while (outletEl.firstChild) {
        outletEl.firstChild.remove();
      }

      if (childMatch && childMatch.route.component) {
        // Render the child route's component
        const childComponent = childMatch.route.component;
        const rendered = childComponent({
          ...childMatch.params,
        } as Record<string, unknown>);
        outletEl.appendChild(rendered);
      } else if (parentMatch.route.component && depth === matches.length - 1) {
        // Leaf route — render the matched component itself
        const component = parentMatch.route.component;
        const rendered = component({
          ...parentMatch.params,
        } as Record<string, unknown>);
        outletEl.appendChild(rendered);
      }
    }
  };

  if (useVT) {
    await startViewTransition(update);
  } else {
    update();
  }
}

// ─── Outlet Registration ─────────────────────────────────────────────────────

/**
 * Registers a DOM element as the `<Outlet />` at a specific depth.
 * Called by the `<Outlet />` component when it mounts.
 *
 * @param depth — The nesting depth of this outlet in the route tree.
 * @param el — The DOM element that serves as the outlet container.
 */
export function registerOutlet(depth: number, el: HTMLElement): void {
  outlets.set(depth, el);

  // If we already have matches, render immediately
  if (routerState && routerState.matches.length > 0) {
    // Clear and render initial content
    while (el.firstChild) {
      el.firstChild.remove();
    }

    const childMatch = routerState.matches[depth + 1];
    if (childMatch && childMatch.route.component) {
      const rendered = childMatch.route.component({
        ...childMatch.params,
      } as Record<string, unknown>);
      el.appendChild(rendered);
    } else if (routerState.matches[depth]?.route.component) {
      const match = routerState.matches[depth]!;
      const rendered = match.route.component({
        ...match.params,
      } as Record<string, unknown>);
      el.appendChild(rendered);
    }
  }
}

/**
 * Unregisters an outlet (called on component teardown).
 */
export function unregisterOutlet(depth: number): void {
  outlets.delete(depth);
}

/**
 * Returns the current router state for hooks.
 */
export function getRouterState(): RouterState | null {
  return routerState;
}

// ─── Relative Path Resolution ────────────────────────────────────────────────

/**
 * Resolves a relative path like `../about` against a base path.
 */
function resolveRelative(base: string, to: string): string {
  if (to.startsWith('/')) return to;

  const baseSegments = base.split('/').filter(Boolean);
  const toSegments = to.split('/');

  for (const seg of toSegments) {
    if (seg === '..') {
      baseSegments.pop();
    } else if (seg !== '.') {
      baseSegments.push(seg);
    }
  }

  return '/' + baseSegments.join('/');
}
