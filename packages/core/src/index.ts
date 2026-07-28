/// <reference path="./jsx.d.ts" />

/**
 * @astrajs/core — Public API Entry Point
 *
 * AstraJS Core provides:
 * - `store()` — ES6 Proxy-based fine-grained reactivity (~3KB)
 * - `memo()` / `batch()` / `untrack()` — Derived values and batching
 * - `dynamic()` — Zero-VDOM reactive expression marker
 * - DOM bindings — `bindText`, `bindAttr`, `bindClass`, `bindConditional`, etc.
 * - `component()` — Declarative component wrapper (single execution)
 * - `mounted()` — DOM lifecycle hook
 *
 * `effect()` is an internal primitive — use `dynamic()`, `bindText()`,
 * or `bindList()` for reactivity. Never exposed to application code.
 */

// ─── Re-exports from Runtime ─────────────────────────────────────────────────

export {
  store,
  toRaw,
  toProxy,
  STORE_SYMBOL,
  captureReactiveExpression,
  getLastReactiveAccess,
  clearLastReactiveAccess,
  isBindingUpdate,
  setBindingUpdate,
  setComponentCache,
  clearComponentCache,
} from './runtime/store.js';

export {
  memo,
  batch,
  untrack,
} from './runtime/effect.js';

export {
  bindText,
  bindAttr,
  bindClass,
  bindTextContent,
  bindValue,
  bindList,
  bindConditional,
  bindDynamicList,
  bindDynamicText,
} from './runtime/dom.js';

// Component wrapper
export { component } from './runtime/component.js';

// Zero-VDOM reactive expression
export { dynamic } from './jsx-runtime.js';

// Lifecycle
export { mounted } from './runtime/lifecycle.js';

// ─── Public Types ────────────────────────────────────────────────────────────

/**
 * Configuration options for a reactive store.
 */
export interface StoreOptions {
  /** Unique key for caching and client-side rehydration. */
  key?: string;
  /** Enables Stale-While-Revalidate when the store initializes with a Promise. */
  swr?: boolean;
}

/**
 * Utility type to extract the underlying state type from a store instance.
 *
 * @example
 * ```ts
 * const counter = store({ count: 0 });
 * type CounterState = StoreState<typeof counter>; // { count: number }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StoreState<T> = T extends { [Symbol.iterator]?: any }
  ? never
  : T extends object
    ? T
    : never;

/**
 * Optional type alias to annotate component function signatures.
 *
 * AstraJS components are plain functions that receive props and return
 * real DOM elements (`HTMLElement | DocumentFragment`), not virtual nodes.
 *
 * @typeParam P — The props shape (defaults to empty object).
 *
 * @example
 * ```ts
 * const Greeting: Component<{ name: string }> = (props) => {
 *   return <h1>Hello, {props.name}</h1>;
 * };
 * ```
 */
export type Component<P = {}> = (props: P) => JSX.Element;
