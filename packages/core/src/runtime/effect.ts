/**
 * astrajs.dev/core — Effect & Memo System
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

import {
  getCurrentTracker,
  setCurrentTracker,
  _beginBatch,
  _endBatch,
  disposeTracker,
  clearTrackerSubscriptions,
} from './store.js';
import { isDev } from './env.js';

// ─── Cleanup Registry ────────────────────────────────────────────────────────

/**
 * Stack of cleanup arrays for the currently executing effect.
 * When `onCleanup(fn)` is called inside an effect, the cleanup is
 * registered against the innermost effect's cleanup list.
 */
const cleanupStack: Array<Array<() => void>> = [];

/**
 * Registers a cleanup function to run when the current lifecycle scope ends.
 *
 * Works synchronously inside:
 * - `mounted()` callbacks — the cleanup runs when the component unmounts.
 * - (internal) `effect()` callbacks — the cleanup runs before each
 *   re-execution and when the effect is disposed.
 *
 * Developers use this inside `mounted()` as an alternative to returning
 * a cleanup function:
 *
 * @param fn — The cleanup function to register.
 *
 * @example
 * ```ts
 * mounted(() => {
 *   const id = setInterval(() => state.count++, 1000);
 *   onCleanup(() => clearInterval(id));
 * });
 * ```
 */
export function onCleanup(fn: () => void): void {
  const current = cleanupStack[cleanupStack.length - 1];
  if (!current) {
    // Called outside an effect/mounted callback — programming error
    if (isDev()) {
      console.warn(
        '[AstraJS] onCleanup() was called outside of a mounted() or effect() ' +
        'callback. It must be called synchronously inside one of them.'
      );
    }
    return;
  }
  current.push(fn);
}

/**
 * Runs `fn` with a fresh cleanup scope on the stack, then returns the
 * cleanups that were registered via `onCleanup()` during execution.
 *
 * @internal Framework use only — `lifecycle.ts` uses this so `onCleanup()`
 * works inside `mounted()` callbacks (not just effects).
 */
export function _collectCleanups<T>(fn: () => T): { result: T; cleanups: Array<() => void> } {
  const scope: Array<() => void> = [];
  cleanupStack.push(scope);
  try {
    const result = fn();
    return { result, cleanups: scope };
  } finally {
    cleanupStack.pop();
  }
}

// ─── Effect ──────────────────────────────────────────────────────────────────

/**
 * A disposable effect handle returned by `effect()`.
 * Call `dispose()` to permanently stop the effect and clean up subscriptions.
 */
export interface DisposableEffect {
  /** Permanently disposes the effect, running all cleanups. */
  dispose(): void;
  /** Whether the effect has been disposed. */
  readonly disposed: boolean;
}

/**
 * Creates a reactive effect that automatically re-runs when any store property
 * accessed during execution is mutated.
 *
 * Returns a `DisposableEffect` handle that can be used to permanently stop
 * the effect and remove all its dependency subscriptions (prevents memory
 * leaks when DOM nodes are removed).
 *
 * @param fn — The side-effect function. May return a cleanup function.
 * @returns A disposable handle for the effect.
 *
 * @example
 * ```ts
 * const state = store({ count: 0 });
 * const fx = effect(() => {
 *   console.log(`Count is ${state.count}`);
 * });
 * state.count = 5; // logs "Count is 5"
 * fx.dispose();    // stops the effect, removes all subscriptions
 * ```
 */
export function effect(fn: () => void | (() => void)): DisposableEffect {
  const entry = {
    fn: () => {},
    cleanup: null as (() => void) | null,
    cleanups: [] as Array<() => void>,
    disposed: false,
  };

  const run = (): void => {
    // Don't run if disposed
    if (entry.disposed) return;

    // Clean up previous run's cleanup (returned function)
    if (entry.cleanup) {
      entry.cleanup();
      entry.cleanup = null;
    }

    // Run all onCleanup-registered cleanups
    for (const cleanup of entry.cleanups) {
      cleanup();
    }
    entry.cleanups.length = 0;

    // Clear old dependency subscriptions before re-tracking
    // This ensures the effect only subscribes to what it accesses NOW
    clearTrackerSubscriptions(run);

    // Set this as the active tracker
    const prevTracker = getCurrentTracker();
    setCurrentTracker(run);

    // Push cleanup array onto the stack for onCleanup()
    cleanupStack.push(entry.cleanups);

    try {
      const cleanup = fn();
      if (typeof cleanup === 'function') {
        entry.cleanup = cleanup;
      }
    } finally {
      cleanupStack.pop();
      setCurrentTracker(prevTracker);
    }
  };

  entry.fn = run;

  // Execute immediately to collect dependencies
  run();

  // Return disposable handle
  return {
    dispose(): void {
      if (entry.disposed) return;
      entry.disposed = true;

      // Run final cleanup
      if (entry.cleanup) {
        entry.cleanup();
        entry.cleanup = null;
      }
      for (const cleanup of entry.cleanups) {
        cleanup();
      }
      entry.cleanups.length = 0;

      // Remove all dependency subscriptions
      disposeTracker(run);
    },
    get disposed() {
      return entry.disposed;
    },
  };
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

    // Clear old subscriptions before re-tracking
    clearTrackerSubscriptions(recompute);

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
