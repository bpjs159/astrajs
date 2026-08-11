import { route, fallbackRoute } from '@astrajs/router';

export const routes = {
  get dashboard() { return route('/', { exact: true }); },
  get products() { return route('/products'); },
  get orders() { return route('/orders'); },
  get cart() { return route('/cart'); },
  get formDemo() { return route('/form'); },
  get upload() { return route('/upload'); },
  get fallback() { return fallbackRoute(); },
};
