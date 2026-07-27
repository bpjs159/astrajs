/**
 * @astrajs/router — lazy()
 *
 * Creates a lazy-loaded component wrapper. The module is only fetched
 * when the component is first rendered. On subsequent renders, the
 * cached component is used.
 *
 * The AST compiler will eventually automate this by transforming
 * static imports inside route() expressions into dynamic imports.
 *
 * ```tsx
 * const Products = lazy(() => import('./pages/Products.js'));
 * {route('/products') && <Products />}
 * ```
 */

import { store } from '@astrajs/core';

type ComponentModule = { [key: string]: (props?: Record<string, unknown>) => JSX.Element };

export function lazy(loader: () => Promise<ComponentModule>, exportName?: string) {
  const state = store<{
    component: ((props?: Record<string, unknown>) => JSX.Element) | null;
    error: Error | null;
  }>({ component: null, error: null });

  // Start loading immediately
  loader()
    .then(mod => {
      state.component = exportName ? mod[exportName] : Object.values(mod)[0];
    })
    .catch(err => {
      state.error = err;
    });

  return (props?: Record<string, unknown>): JSX.Element => {
    if (state.error) throw state.error;
    if (!state.component) {
      // Return a placeholder while loading
      return document.createTextNode('') as unknown as JSX.Element;
    }
    return state.component(props);
  };
}
