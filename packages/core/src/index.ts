/**
 * @astrajs/core — Public API Entry Point
 *
 * AstraJS Core provides:
 * - `store()` — ES6 Proxy-based fine-grained reactivity (~3KB)
 * - `effect()` / `memo()` — Auto-tracking reactive computations
 * - `batch()` / `untrack()` — Batching and escape hatches
 * - DOM bindings — `bindText`, `bindAttr`, `bindClass`, `bindValue`, `bindList`
 * - `Component<P>` — Optional type alias for component signatures
 *
 * ## Quick Start
 *
 * ```ts
 * import { store, effect, memo, Component } from '@astrajs/core';
 *
 * const counter = store({ count: 0 });
 *
 * effect(() => {
 *   console.log(`Count: ${counter.count}`);
 * });
 *
 * counter.count++; // Only `count` subscribers are notified — O(1)
 * ```
 */

// ─── Re-exports from Runtime ─────────────────────────────────────────────────

export {
  store,
  toRaw,
  toProxy,
} from './runtime/store.js';

export {
  effect,
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
} from './runtime/dom.js';

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
  : T extends ReturnType<typeof import('./runtime/store.js').store<infer U>>
    ? U
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
