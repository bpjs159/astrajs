import { route, fallbackRoute } from '@astrajs/router';

export const routes = {
  get home() { return route('/', { exact: true }); },
  get docs() { return route('/docs'); },
  get fallback() { return fallbackRoute(); },
};
