/**
 * @astrajs/core — Runtime Barrel Export
 *
 * Re-exports all public runtime APIs from a single entry point.
 */

// Store & Reactivity
export { store, toRaw, toProxy, flushPending } from './store.js';

// SWR (Stale-While-Revalidate)
export { swr } from './swr.js';
export type { SWRState, SWROptions } from './swr.js';

// Effects & Memo (memo/batch are internal — injected by compiler)
export { effect, memo, batch, untrack } from './effect.js';

// DOM Bindings
export {
  bindText,
  bindAttr,
  bindClass,
  bindTextContent,
  bindValue,
  bindList,
} from './dom.js';
