/**
 * @astrajs/core — Effect & Memo System
 *
 * ## How Tracking Works
 *
 * 1. `effect(fn)` sets a global `currentTracker` to `fn`.
 * 2. `fn` executes. Every Proxy `get` trap calls `track()`, which adds `fn`
 *    to the dependency set for that property.
 * 3. When any tracked property is set, `trigger()` calls `fn` again.
 * 4. Before re-running, old dependencies are cleared so the effect
 *    re-subscribes to whatever it accesses during the new run.
 *
 * ## Cleanup
 *
 * If `fn` returns a function, it's treated as a cleanup callback and
 * invoked before each re-run (and on final disposal).
 *
 * ## Memo
 *
 * `memo(fn)` works similarly but returns a getter. The computation is lazy:
 * it only re-evaluates when a dependency changed *and* someone calls the getter.
 */

import { getCurrentTracker, setCurrentTracker, _beginBatch, _endBatch } from './store.js';

// ─── Effect ──────────────────────────────────────────────────────────────────

/**
 * Creates a reactive effect that automatically re-runs when any store property
 * accessed during execution is mutated.
 *
 * @param fn — The side-effect function. May return a cleanup function.
 *
 * @example
 * ```ts
 * const state = store({ count: 0 });
 * effect(() => {
 *   console.log(`Count is ${state.count}`);
 * });
 * state.count = 5; // logs "Count is 5"
 * ```
 */
export function effect(fn: () => void | (() => void)): void {
  const entry = { fn: () => {}, cleanup: null as (() => void) | null };

  const run = (): void => {
    // Clean up previous run's cleanup
    if (entry.cleanup) {
      entry.cleanup();
      entry.cleanup = null;
    }

    // Set this as the active tracker
    const prevTracker = getCurrentTracker();
    setCurrentTracker(run);

    try {
      const cleanup = fn();
      if (typeof cleanup === 'function') {
        entry.cleanup = cleanup;
      }
    } finally {
      setCurrentTracker(prevTracker);
    }
  };

  entry.fn = run;

  // Execute immediately to collect dependencies
  run();
}

// ─── Memo (Derived Signal) ───────────────────────────────────────────────────

/**
 * Creates a lazy, memoized derived value. The computation `fn` is only
 * re-executed when one of its reactive dependencies changes AND the memo
 * is actually read.
 *
 * @typeParam T — The derived value type.
 * @param fn — A pure computation that accesses reactive state.
 * @returns A getter function returning the current memoized value.
 *
 * @example
 * ```ts
 * const state = store({ count: 0 });
 * const double = memo(() => state.count * 2);
 * console.log(double()); // 0
 * state.count = 5;
 * console.log(double()); // 10 (lazy: computed on read)
 * ```
 */
export function memo<T>(fn: () => T): () => T {
  let dirty = true;
  let cached: T | undefined;
  let cleanup: (() => void) | null = null;

  const recompute = (): void => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }

    const prevTracker = getCurrentTracker();
    setCurrentTracker(recompute);

    try {
      cached = fn();
      dirty = false;
    } finally {
      setCurrentTracker(prevTracker);
    }
  };

  const invalidate = (): void => {
    dirty = true;
  };

  // Subscribe `invalidate` as the tracker so it gets called on dep changes
  const prevTracker = getCurrentTracker();
  setCurrentTracker(invalidate);
  // Run once to collect deps
  try {
    cached = fn();
    dirty = false;
  } finally {
    setCurrentTracker(prevTracker);
  }

  return (): T => {
    if (dirty) {
      recompute();
    }
    return cached!;
  };
}

// ─── Batch ───────────────────────────────────────────────────────────────────

/**
 * Batches multiple mutations into a single notification cycle.
 * All `trigger()` calls inside the batch are queued and flushed together
 * when the batch completes.
 *
 * @param fn — The batch of mutations to execute.
 *
 * @example
 * ```ts
 * const state = store({ firstName: 'John', lastName: 'Doe' });
 * effect(() => console.log(`${state.firstName} ${state.lastName}`));
 *
 * batch(() => {
 *   state.firstName = 'Jane';
 *   state.lastName = 'Smith';
 * }); // Only one log: "Jane Smith"
 * ```
 */
export function batch(fn: () => void): void {
  _beginBatch();
  try {
    fn();
  } finally {
    _endBatch();
  }
}

// ─── Untrack ─────────────────────────────────────────────────────────────────

/**
 * Executes `fn` without tracking any reactive dependencies.
 * Useful for reading store values inside an effect without subscribing.
 *
 * @typeParam T — The return type.
 * @param fn — A function whose store accesses should not create dependencies.
 * @returns The return value of `fn`.
 *
 * @example
 * ```ts
 * const state = store({ count: 0, label: 'Counter' });
 * effect(() => {
 *   // This effect only re-runs when `count` changes, not `label`
 *   const label = untrack(() => state.label);
 *   console.log(`${label}: ${state.count}`);
 * });
 * ```
 */
export function untrack<T>(fn: () => T): T {
  const prevTracker = getCurrentTracker();
  setCurrentTracker(null);
  try {
    return fn();
  } finally {
    setCurrentTracker(prevTracker);
  }
}
