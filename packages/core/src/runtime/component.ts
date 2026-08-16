/**
 * @bpjs159/core — Component Wrapper
 *
 * `component(fn)` wraps a function that uses `store()` + JSX so that
 * reactive expressions auto-update the DOM when the store changes.
 *
 * ## Zero-VDOM Architecture
 *
 * 1. `fn(props)` executes **exactly once** to produce the initial DOM.
 * 2. Reactive expressions inside JSX must use `dynamic()` to create
 *    individual micro-effects targeting specific DOM nodes.
 * 3. Each store property change triggers only the effects subscribed
 *    to that property — O(1) surgical DOM updates. No full re-render,
 *    no diffing, no component re-execution.
 * 4. Static DOM nodes (child components, text, attributes) are never
 *    recreated — they stay in the DOM unless explicitly removed.
 *
 * ## Lifecycle
 *
 * `mounted()` callbacks fire when the component's wrapper enters the
 * DOM. The MutationObserver in lifecycle.ts handles cleanup when
 * nodes are removed.
 */

import { setComponentCache, clearComponentCache } from './store.js';
import {
  flushMountCallbacks,
  hasPendingMountCallbacks,
  setCurrentWrapper,
} from './lifecycle.js';

export function component<P>(
  fn: (props: P) => JSX.Element
): (props: P) => JSX.Element {
  return (props: P): JSX.Element => {
    const wrapper = document.createElement('span');
    wrapper.style.display = 'contents';
    const storeCache = new Map<string, object>();
    let storeCounter = 0;

    // ZERO-VDOM: Execute fn ONCE to build the initial DOM.
    // store() calls are cached so the same proxy is reused if
    // the component is re-invoked (e.g., inside a dynamic() block).
    //
    // Set this wrapper as the current lifecycle context so mounted()
    // calls register against it. If the wrapper is never connected,
    // its callbacks are simply never flushed (no cross-contamination).
    setComponentCache(storeCache, () => storeCounter++);
    const prevWrapper = setCurrentWrapper(wrapper);
    const root = fn(props);
    if (prevWrapper !== null) {
      setCurrentWrapper(prevWrapper);
    }
    clearComponentCache();

    if (root) {
      wrapper.appendChild(root as Node);
    }

    // Fire mount callbacks after the wrapper enters the live DOM.
    if (hasPendingMountCallbacks(wrapper)) {
      queueMicrotask(() => {
        if (wrapper.isConnected) {
          flushMountCallbacks(wrapper);
        }
      });
    }

    return wrapper as JSX.Element;
  };
}
