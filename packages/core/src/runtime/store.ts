/**
 * @astrajs/core — Reactive Store (Proxy-based Fine-Grained Reactivity)
 *
 * ## Architecture
 *
 * Instead of re-rendering entire component trees (VDOM diffing), AstraJS tracks
 * dependencies at the *property* level via ES6 Proxies. Each property access during
 * an `effect()` or `memo()` scope is recorded. When a property is mutated, only the
 * specific DOM bindings or effects that depend on that property are updated — O(1).
 *
 * ## Dependency Graph
 *
 * ```
 * store.count ──→ [effectA, textNodeBinding]
 * store.name  ──→ [effectB]
 * store.user.firstName ──→ [effectC, attrBinding]
 * ```
 *
 * Nested objects are automatically wrapped in proxies (lazy, on access).
 *
 * ## Integration with the Compiler
 *
 * The Vite AST plugin transforms JSX expressions like:
 * ```tsx
 * <span>{counter.count}</span>
 * ```
 * Into:
 * ```ts
 * const el = document.createElement('span');
 * const textNode = document.createTextNode('');
 * el.appendChild(textNode);
 * bindText(textNode, () => String(counter.count));
 * ```
 *
 * The `bindText` call creates an effect that updates the TextNode's `.data`
 * property whenever `counter.count` changes — without touching anything else.
 */

import type { StoreOptions } from '../index.js';

// ─── Global Tracking State ───────────────────────────────────────────────────

/**
 * Stack of currently executing tracking scopes (effects/memos).
 * Stack-based to support nested effects.
 */
let currentTracker: (() => void) | null = null;

/**
 * When a reactive store property is accessed during JSX evaluation,
 * we capture the access path so the JSX runtime can auto-create
 * a reactive binding (bindText/bindAttr) without compiler transforms.
 *
 * This is what makes `{ui.valor}` work transparently in JSX.
 */
let reactiveAccessDetected = false;

/**
 * Set to `true` during a `bindValue` two-way binding update.
 * When the user types in an input backed by `value={store.prop}`,
 * the store change triggers the component effect — but we must
 * skip re-rendering because the input already has the correct value
 * in the DOM. Re-rendering would create a new input and lose focus.
 */
let _isBindingUpdate = false;

/** Returns true if a store mutation originated from a bindValue input event. */
export function isBindingUpdate(): boolean {
  return _isBindingUpdate;
}

/** Marks the start/end of a bindValue two-way binding update. */
export function setBindingUpdate(value: boolean): void {
  _isBindingUpdate = value;
}

/**
 * When true, store mutations are BLOCKED entirely.
 * Used during lifecycle callbacks (mount/unmount) to prevent
 * side effects from corrupting the component's render state.
 * Unlike setBindingUpdate (which allows mutations but suppresses
 * effects), lifecyclePhase blocks the actual data change.
 */
let _lifecyclePhase = false;

export function setLifecyclePhase(value: boolean): void {
  _lifecyclePhase = value;
}

export function isLifecyclePhase(): boolean {
  return _lifecyclePhase;
}

/** Counts store mutations suppressed during setBindingUpdate. */
let _pendingMutations = 0;

export function getAndClearPendingMutations(): number {
  const n = _pendingMutations;
  _pendingMutations = 0;
  return n;
}

/** Symbol to mark store proxies — detectable by JSX runtime */
export const STORE_SYMBOL: unique symbol = Symbol('astra-store');

/**
 * Tracks the last reactive store property access.
 * Used by the JSX runtime to auto-bind `value={store.prop}` on inputs
 * without requiring a manual `onInput` handler.
 *
 * When the user writes:
 * ```tsx
 * <input value={ui.password} />
 * ```
 * The JSX runtime detects that `ui.password` came from a store and
 * automatically sets up two-way binding (store ↔ DOM).
 */
let lastReactiveAccess: { raw: object; proxy: object; prop: string } | null = null;

/** Returns the last captured store property access, or null. */
export function getLastReactiveAccess(): { raw: object; proxy: object; prop: string } | null {
  return lastReactiveAccess;
}

/** Clears the captured store access (called after processing to avoid stale reads). */
export function clearLastReactiveAccess(): void {
  lastReactiveAccess = null;
}

/**
 * Runs a getter and returns whether it accessed any reactive store.
 * If reactive, wraps it in a bindText-compatible getter.
 */
export function captureReactiveExpression<T>(fn: () => T): {
  value: T;
  isReactive: boolean;
  getter: (() => string) | null;
} {
  reactiveAccessDetected = false;

  const prevTracker = currentTracker;
  // Set a temporary tracker that captures the access
  const tempTracker = () => {};
  currentTracker = tempTracker;

  let value: T;
  try {
    value = fn();
  } finally {
    currentTracker = prevTracker;
  }

  // If we detected a store access during evaluation,
  // fn itself IS the getter (re-running it would get the latest value)
  return {
    value,
    isReactive: reactiveAccessDetected,
    getter: reactiveAccessDetected ? (() => String(fn())) : null,
  };
}

/**
 * Global dependency map: property path → Set of subscriber callbacks.
 *
 * Key format: We use a WeakMap keyed by the raw target object, then a
 * Map from property name to Set of subscriber functions.
 *
 *   rawDeps: WeakMap<object, Map<string | symbol, Set<() => void>>>
 */
const rawDeps = new WeakMap<object, Map<string | symbol, Set<() => void>>>();

/**
 * Map from raw object to its proxy wrapper (for unwrapping).
 */
const rawToProxy = new WeakMap<object, object>();

/**
 * Map from proxy to its raw object (for internal lookups).
 */
const proxyToRaw = new WeakMap<object, object>();

/**
 * Whether we're currently inside a batch. When batched, notifications are
 * queued rather than executed immediately.
 *
 * With auto-batching (queueMicrotask), batch() is now an internal primitive
 * for framework use. User code gets automatic batching via the microtask queue.
 */
let batchDepth = 0;
const pendingNotifications = new Set<() => void>();
let microtaskScheduled = false;

/**
 * Schedules a microtask to flush pending notifications.
 * Uses a single queued microtask for all mutations in the current synchronous block.
 */
function scheduleMicrotaskFlush(): void {
  if (microtaskScheduled) return;
  microtaskScheduled = true;
  queueMicrotask(() => {
    microtaskScheduled = false;
    flushPending();
  });
}

// ─── Tracker Context ─────────────────────────────────────────────────────────

/**
 * Retrieves the currently active tracking function (effect/memo),
 * if one is executing.
 */
export function getCurrentTracker(): (() => void) | null {
  return currentTracker;
}

/**
 * Sets the current tracker. Used internally by effect() and memo().
 */
export function setCurrentTracker(tracker: (() => void) | null): void {
  currentTracker = tracker;
}

// ─── Dependency Management ───────────────────────────────────────────────────

/**
 * Records that the current tracker depends on `raw[prop]`.
 * Called from the Proxy's `get` trap.
 */
export function track(raw: object, prop: string | symbol): void {
  if (!currentTracker) return;

  let propMap = rawDeps.get(raw);
  if (!propMap) {
    propMap = new Map();
    rawDeps.set(raw, propMap);
  }

  let subscribers = propMap.get(prop);
  if (!subscribers) {
    subscribers = new Set();
    propMap.set(prop, subscribers);
  }

  subscribers.add(currentTracker);
}

/**
 * Notifies all subscribers that depend on `raw[prop]` that the value changed.
 * Called from the Proxy's `set` trap.
 *
 * With auto-batching, notifications are deferred via `queueMicrotask()`.
 * Multiple synchronous mutations (e.g. `ui.x++; ui.y++;`) are automatically
 * grouped into a single notification cycle — no manual `batch()` needed.
 */
export function trigger(raw: object, prop: string | symbol): void {
  const propMap = rawDeps.get(raw);
  if (!propMap) return;

  const subscribers = propMap.get(prop);
  if (!subscribers || subscribers.size === 0) return;

  // During lifecycle callbacks (setBindingUpdate), suppress effect
  // execution but count mutations so component() can do one re-render
  // after all callbacks complete.
  if (_isBindingUpdate) {
    _pendingMutations++;
    return;
  }

  // Queue all subscribers for deferred execution
  for (const sub of subscribers) {
    pendingNotifications.add(sub);
  }

  if (batchDepth > 0) {
    // Inside explicit batch(): defer to batch flush, do NOT schedule microtask
    return;
  }

  // Auto-batching: schedule a single microtask to flush all pending notifications.
  // If multiple mutations happen synchronously, they all share the same microtask.
  scheduleMicrotaskFlush();
}

// ─── Batch Processing ────────────────────────────────────────────────────────

/**
 * Flushes all pending notifications collected during a batch.
 * Also used by tests to synchronously flush auto-batched notifications.
 */
export function flushPending(): void {
  // Take a snapshot: flushing may trigger cascading mutations
  // that add more subscribers to pendingNotifications.
  // We loop until the set is empty to handle cascading effects.
  while (pendingNotifications.size > 0) {
    const snapshot = [...pendingNotifications];
    pendingNotifications.clear();
    for (const sub of snapshot) {
      sub();
    }
  }
}

// ─── Proxy Factory ───────────────────────────────────────────────────────────

/**
 * Whether a nested value should be wrapped in a reactive Proxy.
 *
 * Only plain objects and arrays are proxied. Built-in collection and
 * class instances (Set, Map, WeakSet, WeakMap, Date, RegExp, Promise,
 * DOM nodes, …) are returned raw because their methods depend on
 * internal slots that a Proxy cannot forward via get/set traps.
 */
function isProxyable(value: object): boolean {
  if (Array.isArray(value)) return true;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Whether `prop` is a valid array index string ("0", "1", … < 2^32-1).
 */
function isArrayIndex(prop: string): boolean {
  const n = Number(prop);
  return Number.isInteger(n) && n >= 0 && n < 4294967295;
}

/**
 * Wraps a plain object in a reactive Proxy.
 *
 * - `get` trap: records dependency if inside a tracker, and recursively
 *   wraps nested objects/arrays in proxies (lazy).
 * - `set` trap: updates the raw value, notifies subscribers.
 * - `deleteProperty` trap: notifies subscribers and removes the key.
 *
 * @param raw — The plain object to make reactive.
 * @returns A Proxy wrapping `raw` with reactive get/set traps.
 */
function createReactiveProxy<T extends object>(raw: T): T {
  // If already proxied, return existing proxy
  const existing = rawToProxy.get(raw);
  if (existing) return existing as T;

  const handler: ProxyHandler<object> = {
    get(target: object, prop: string | symbol, receiver: object): unknown {
      // Flag that a reactive store was accessed (for JSX auto-binding)
      reactiveAccessDetected = true;

      // Track dependency for the current effect/memo
      track(target, prop);

      // Expose the store marker symbol
      if (prop === STORE_SYMBOL) return true;

      // Record the last store property access for JSX auto-bind
      // (e.g., <input value={ui.password} /> auto-creates two-way binding)
      if (typeof prop === 'string' && prop !== 'constructor') {
        lastReactiveAccess = { raw: target, proxy: receiver as object, prop };
      }

      const value = Reflect.get(target, prop, receiver);

      // Lazy deep proxy: wrap nested plain objects/arrays on access.
      // Built-in collections (Set/Map/WeakSet/WeakMap), Date, RegExp,
      // Promise, DOM nodes, and other class instances are returned RAW:
      // their methods rely on internal slots (e.g. [[SetData]]) that a
      // Proxy cannot intercept, so calling e.g. set.has() on a wrapped
      // value throws "Method Set.prototype.has called on incompatible
      // receiver". Reactivity for those values comes from reassigning the
      // whole property (e.g. `ui.pending = new Set(...)`), which the `set`
      // trap still tracks.
      if (
        value !== null &&
        typeof value === 'object' &&
        !ArrayBuffer.isView(value) &&
        isProxyable(value)
      ) {
        // Check if already proxied
        const existingProxy = rawToProxy.get(value);
        if (existingProxy) return existingProxy;

        // Recursively wrap
        return createReactiveProxy(value as object);
      }

      return value;
    },

    set(target: object, prop: string | symbol, value: unknown, receiver: object): boolean {
      const oldValue = Reflect.get(target, prop, receiver);

      // If the value hasn't changed, skip notification
      if (oldValue === value) return true;

      // During lifecycle callbacks, block store mutations entirely.
      // Lifecycle hooks are for side effects (timers, DOM measurements),
      // not for modifying reactive state that affects rendering.
      if (_lifecyclePhase) return true;

      // Writing an array index beyond the current end extends `length`
      // IMMEDIATELY inside Reflect.set. The explicit `length` write that
      // `push()` performs right after therefore hits the
      // `oldValue === value` early-return above and `length` subscribers
      // would NEVER be notified (e.g. bindList() would not re-render on
      // push). Capture the old length so we can notify them here instead.
      const isArrayIndexWrite =
        Array.isArray(target) && typeof prop === 'string' && isArrayIndex(prop);
      const oldLength = isArrayIndexWrite
        ? (Reflect.get(target, 'length', receiver) as number)
        : 0;

      const result = Reflect.set(target, prop, value, receiver);

      // Notify subscribers
      trigger(target, prop);

      // The array grew: notify `length` subscribers (see note above).
      if (isArrayIndexWrite && Number(prop) >= oldLength) {
        trigger(target, 'length');
      }

      return result;
    },

    deleteProperty(target: object, prop: string | symbol): boolean {
      const had = Object.prototype.hasOwnProperty.call(target, prop);
      const result = Reflect.deleteProperty(target, prop);

      if (had) {
        trigger(target, prop);
      }

      return result;
    },

    // Support for array methods: ensure array mutations trigger correctly
    // The `ownKeys` and `has` traps don't need explicit track/trigger since
    // they are used by Object.keys/in which don't create reactive deps by default.
  };

  const proxy = new Proxy(raw, handler);

  // Register mappings
  rawToProxy.set(raw, proxy);
  proxyToRaw.set(proxy, raw);

  return proxy as T;
}

// ─── Public API: store() ─────────────────────────────────────────────────────

// ─── Batch Management (exported for effect.ts) ──────────────────────────────

/**
 * Begins a batching scope. All subsequent trigger() calls are queued.
 */
export function _beginBatch(): void {
  batchDepth++;
}

/**
 * Ends a batching scope. If the outermost batch ends, flushes all pending
 * notifications synchronously (no microtask needed — batch() provides
 * explicit synchronous control for internal framework use).
 */
export function _endBatch(): void {
  batchDepth--;
  if (batchDepth === 0) {
    // Cancel any pending microtask since we're flushing synchronously
    microtaskScheduled = false;
    flushPending();
  }
}

// ─── Component Store Caching ─────────────────────────────────────────────────

/**
 * When a `component()` wrapper is active, it sets these globals so
 * `store()` calls inside the component reuse the same proxy across
 * re-renders. This keeps event handlers connected to the same instance.
 */
let _componentCache: Map<string, object> | null = null;
let _componentKeyGen: (() => number) | null = null;

export function setComponentCache(
  cache: Map<string, object>,
  keyGen: () => number
): void {
  _componentCache = cache;
  _componentKeyGen = keyGen;
}

export function clearComponentCache(): void {
  _componentCache = null;
  _componentKeyGen = null;
}

// ─── Public API: store() ─────────────────────────────────────────────────────

/**
 * Creates a reactive store.
 *
 * Two forms:
 * - `store({ count: 0 })` — plain initial state
 * - `store((self) => ({ count: 0, inc() { self.count++ } }))` — factory,
 *   receives the proxy as `self` so methods can mutate it reactively
 */
export function store<T extends object>(
  initialState: T | ((self: any) => T),
  _options?: StoreOptions
): T {
  // Factory form: store((self) => ({ ... }))
  if (typeof initialState === 'function') {
    // Reuse cached proxy inside component() to avoid creating
    // a new reactive object on every re-render.
    if (_componentCache && _componentKeyGen) {
      const cacheKey = _options?.key ?? `__astra_auto_${_componentKeyGen()}`;
      const cached = _componentCache.get(cacheKey);
      if (cached) return cached as T;

      const raw: any = {};
      const proxy = createReactiveProxy(raw);
      const result = (initialState as (self: any) => T)(proxy);
      Object.assign(raw, result);
      for (const key of Object.keys(result)) {
        if (typeof (result as any)[key] === 'function') {
          raw[key] = (result as any)[key];
        }
      }
      _componentCache.set(cacheKey, proxy);
      return proxy;
    }

    // No component cache: create fresh every time
    const raw: any = {};
    const proxy = createReactiveProxy(raw);
    const result = (initialState as (self: any) => T)(proxy);
    Object.assign(raw, result);
    for (const key of Object.keys(result)) {
      if (typeof (result as any)[key] === 'function') {
        raw[key] = (result as any)[key];
      }
    }
    return proxy;
  }

  if (typeof initialState !== 'object' || initialState === null) {
    throw new TypeError(
      `[AstraJS] store() expects a plain object, received ${typeof initialState}`
    );
  }

  // If inside a component() wrapper, reuse cached store instance
  if (_componentCache && _componentKeyGen) {
    const cacheKey = _options?.key ?? `__astra_auto_${_componentKeyGen()}`;
    const cached = _componentCache.get(cacheKey);
    if (cached) return cached as T;
    const proxy = createReactiveProxy(initialState);
    _componentCache.set(cacheKey, proxy);
    return proxy;
  }

  return createReactiveProxy(initialState);
}

/**
 * Given a reactive proxy, returns the underlying raw (unwrapped) object.
 * Useful for serialization (SSR, `astra-data`) or comparison.
 */
export function toRaw<T extends object>(proxy: T): T {
  const raw = proxyToRaw.get(proxy);
  return (raw as T) ?? proxy;
}

/**
 * Given a raw object, returns its reactive proxy if one exists.
 * Returns the raw object if it's not proxied.
 */
export function toProxy<T extends object>(raw: T): T {
  const proxy = rawToProxy.get(raw);
  return (proxy as T) ?? raw;
}
