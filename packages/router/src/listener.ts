/**
 * @astrajs/router — onRouteChange() global listener
 *
 * Registers callbacks that fire on every navigation.
 * Used at top-level (outside any component) for analytics,
 * auth guards, scroll restoration, etc.
 */

type RouteChangeCallback = (location: { pathname: string }) => void;

const _listeners: RouteChangeCallback[] = [];

/** Registers a global route change listener. Called at module top-level. */
export function onRouteChange(cb: RouteChangeCallback): void {
  _listeners.push(cb);
}

/** Internal: fired by navigate() and popstate. */
export function _onNavigation(pathname: string): void {
  for (const cb of _listeners) {
    try { cb({ pathname }); } catch { /* swallow */ }
  }
}
