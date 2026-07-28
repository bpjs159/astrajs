import { describe, it, expect, vi } from 'vitest';
import { store, flushPending } from '../runtime/store.js';
import { effect, memo, batch, untrack } from '../runtime/effect.js';

/**
 * Helper: flushes the microtask queue and any cascading effects.
 * With auto-batching, store mutations defer notifications via
 * `queueMicrotask()`. Call this after mutating state to ensure
 * all effects have been processed before asserting.
 */
async function flush(): Promise<void> {
  // Flush any synchronously queued pending notifications
  flushPending();
  // Let the microtask queue drain (handles cascading effects)
  await Promise.resolve();
  // Flush again in case cascading effects queued more
  flushPending();
}

describe('effect()', () => {
  it('runs immediately and tracks dependencies', () => {
    const state = store({ count: 0 });
    const fn = vi.fn();
    effect(fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('re-runs when a tracked dependency changes (auto-batched)', async () => {
    const state = store({ count: 0 });
    const values: number[] = [];
    effect(() => values.push(state.count));

    // Multiple synchronous mutations → auto-batched into 1 notification
    state.count = 1;
    state.count = 2;

    // Effects haven't run yet (queued in microtask)
    expect(values).toEqual([0]); // Only initial run

    await flush();

    // Now effects have been flushed — but with auto-batching,
    // both mutations share one notification, so the effect runs once
    // with the final value (2)
    expect(values).toEqual([0, 2]);
  });

  it('does NOT re-run when untracked dependency changes', async () => {
    const state = store({ a: 0, b: 0 });
    const values: number[] = [];
    effect(() => {
      values.push(untrack(() => state.b));
      // Only tracking state.a
      void state.a;
    });
    state.b = 99; // Should NOT trigger
    await flush();
    state.a = 1;  // SHOULD trigger
    await flush();
    // Initial run: pushes state.b (0), then on state.a change: pushes state.b (99)
    expect(values).toEqual([0, 99]);
  });

  it('runs cleanup before re-execution', async () => {
    const state = store({ on: true });
    const cleanups: string[] = [];
    effect(() => {
      void state.on; // ← MUST access store to create dependency
      cleanups.push('run');
      return () => cleanups.push('cleanup');
    });
    state.on = false; // trigger re-run
    await flush();
    expect(cleanups).toEqual(['run', 'cleanup', 'run']);
  });
});

describe('memo()', () => {
  it('computes lazily and memoizes', () => {
    const state = store({ x: 2, y: 3 });
    const compute = vi.fn(() => state.x * state.y);
    const product = memo(compute);
    expect(compute).toHaveBeenCalledTimes(1); // Runs once to collect deps
    expect(product()).toBe(6);
    expect(product()).toBe(6); // Cached — no recompute
    expect(compute).toHaveBeenCalledTimes(1);
  });

  it('recomputes when dependency changes and is read', async () => {
    const state = store({ x: 2 });
    const doubled = memo(() => state.x * 2);
    expect(doubled()).toBe(4);
    state.x = 5;
    await flush();
    // Not read yet — still cached
    expect(doubled()).toBe(10); // Now recomputes
  });
});

describe('batch()', () => {
  it('groups multiple mutations into one notification (synchronous flush)', () => {
    const state = store({ a: 0, b: 0 });
    const fn = vi.fn();
    effect(() => { void state.a; void state.b; fn(); });
    fn.mockClear(); // Clear initial run
    batch(() => {
      state.a = 1;
      state.b = 2;
    });
    // batch() flushes synchronously — no await needed
    expect(fn).toHaveBeenCalledTimes(1); // Only one notification
  });
});

describe('untrack()', () => {
  it('prevents dependency tracking inside the callback', async () => {
    const state = store({ tracked: 0, ignored: 0 });
    const fn = vi.fn();
    effect(() => {
      void state.tracked;
      untrack(() => { void state.ignored; });
      fn();
    });
    fn.mockClear();
    state.ignored = 99; // Should NOT trigger
    await flush();
    expect(fn).not.toHaveBeenCalled();
    state.tracked = 1; // SHOULD trigger
    await flush();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
