/**
 * @astrajs/core — Component Wrapper
 *
 * `component(fn)` wraps a function that uses `store()` + JSX so that
 * reactive expressions like `{ui.valor}` auto-update the DOM when the
 * store changes — without manual `effect()` calls.
 *
 * ## How It Works
 *
 * 1. Runs `fn(props)` once to produce the initial DOM.
 * 2. During that run, any `store()` property accessed is tracked.
 * 3. An `effect()` is created that re-runs `fn(props)` whenever any
 *    tracked store property changes.
 * 4. The old DOM is replaced with the new DOM via `replaceWith()`.
 *
 * ## With the Compiler (Production)
 *
 * When the Vite compiler plugin processes the component, it transforms
 * `{ui.valor}` into `bindText(textNode, () => String(ui.valor))`.
 * In that case, `component()` is NOT needed — the bindings are direct
 * and O(1) per mutation.
 *
 * `component()` is the dev-mode convenience wrapper.
 */

import { effect } from './effect.js';
import { setComponentCache, clearComponentCache } from './store.js';

/**
 * Wraps a component function so JSX expressions referencing
 * reactive stores auto-update the DOM when the store changes.
 */
export function component<P extends Record<string, unknown>>(
  fn: (props: P) => JSX.Element
): (props: P) => JSX.Element {
  return (props: P): JSX.Element => {
    const wrapper = document.createElement('span');
    wrapper.style.display = 'contents';
    const storeCache = new Map<string, object>();
    let storeCounter = 0;

    effect(() => {
      storeCounter = 0;
      setComponentCache(storeCache, () => storeCounter++);
      const newRoot = fn(props);
      clearComponentCache();
      while (wrapper.firstChild) wrapper.firstChild.remove();
      wrapper.appendChild(newRoot);
    });

    return wrapper as JSX.Element;
  };
}
