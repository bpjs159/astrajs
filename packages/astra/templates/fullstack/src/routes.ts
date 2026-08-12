import { route, fallbackRoute } from '@astrajs/router';

export const routes = {
  get home() { return route('/', { exact: true }); },
  get posts() { return route('/posts'); },
  get fallback() { return fallbackRoute(); },
};
