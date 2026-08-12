import { route, fallbackRoute } from '@astrajs/router';

/**
 * Declarative routing — plain boolean guards.
 * Each getter is reactive: when navigate() or <Link> changes the URL,
 * every guard re-evaluates and the matching page renders. No wrappers.
 */
export const routes = {
  get home() { return route('/', { exact: true }); },
  get about() { return route('/about'); },
  get fallback() { return fallbackRoute(); },
};
