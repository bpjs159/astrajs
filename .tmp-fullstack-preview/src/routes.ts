import { route, fallbackRoute } from 'astrajs.dev/router';

export const routes = {
  get home() { return route('/', { exact: true }); },
  get posts() { return route('/posts'); },
  get fallback() { return fallbackRoute(); },
};
