/// <reference path="./jsx.d.ts" />

/**
 * astrajs.dev/core — Public API Entry Point
 *
 * AstraJS Core provides:
 * - `store()` — ES6 Proxy-based fine-grained reactivity (~3KB)
 * - `dynamic()` — Zero-VDOM reactive expression marker
 * - DOM bindings — `bindText`, `bindAttr`, `bindClass`, `bindConditional`, etc.
 * - `component()` — Declarative component wrapper (single execution)
 * - `mounted()` — DOM lifecycle hook
 *
 * ## Auto-Optimization (Zero-Config)
 *
 * AstraJS automatically optimizes your code at build time:
 * - **Auto-Batching:** Multiple synchronous mutations are grouped via
 *   `queueMicrotask()`. No manual `batch()` needed.
 * - **Auto-Memoization:** Derived arrow functions (`() => expr`) that read
 *   from stores are automatically wrapped in `memo()` by the AST compiler.
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
  /** @internal Auto-batch flush for testing */
  flushPending,
} from './runtime/store.js';

export {
  /**
   * Auto-injected by the AST compiler. Do not use directly.
   * (Typed because the compiler emits `memo` imports into app code.)
   */
  memo,
  onCleanup,
} from './runtime/effect.js';
export type { DisposableEffect } from './runtime/effect.js';

// ─── Internal Framework Primitives ───────────────────────────────────────────
// `effect`, `batch` and `untrack` are CORE machinery — application code must
// NEVER call them (developers use `dynamic()`, `mounted()` and `onCleanup()`).
// They are re-exported here as const bindings (not `export {}` specifiers)
// so that `stripInternal` removes them from the published `.d.ts` while they
// remain available in the JS bundle for the compiler/runtime and for tests
// (which resolve to `src/` via the `development` condition).
import {
  effect as _effectInternal,
  batch as _batchInternal,
  untrack as _untrackInternal,
} from './runtime/effect.js';

/** @internal Framework primitive. Use `mounted()` for side effects. */
export const effect = _effectInternal;
/** @internal Framework primitive. Auto-batching handles this transparently. */
export const batch = _batchInternal;
/** @internal Framework primitive. Used by the JSX runtime internals. */
export const untrack = _untrackInternal;

// Effect disposal registry — for advanced use cases and testing
export {
  registerNodeEffect,
  disposeNodeEffects,
  disposeNodeEffectsShallow,
  hasNodeEffects,
} from './runtime/disposal.js';

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

// Zero-VDOM reactive expression marker (injected by compiler)
export { /**
  * Auto-injected by the AST compiler. Do not use directly.
  * (Typed because the compiler emits `dynamic` imports into app code.)
  */
dynamic } from './jsx-runtime.js';

// SSR Resumability — transparent handler registration & SSR-mode control
export {
  setSSRResumable,
  isSSRResumable,
  registerHandler,
  getHandlerRegistry,
} from './jsx-runtime.js';

// Lifecycle
export { mounted } from './runtime/lifecycle.js';

// CSS class name composer
export { classes } from './runtime/classes.js';
export type { ClassValue } from './runtime/classes.js';

// SWR — Stale-While-Revalidate caching
// One import, zero boilerplate: swr(() => fetch('/api/data').then(r => r.json()))
export { swr } from './runtime/swr.js';
export type { SWRState, SWROptions } from './runtime/swr.js';

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
