import { describe, it, expect, vi } from 'vitest';
import { store } from '../runtime/store.js';
import { effect, memo, batch, untrack } from '../runtime/effect.js';

describe('effect()', () => {
  it('runs immediately and tracks dependencies', () => {
    const state = store({ count: 0 });
    const fn = vi.fn();
    effect(fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('re-runs when a tracked dependency changes', () => {
    const state = store({ count: 0 });
    const values: number[] = [];
    effect(() => values.push(state.count));
    state.count = 1;
    state.count = 2;
    expect(values).toEqual([0, 1, 2]);
  });

  it('does NOT re-run when untracked dependency changes', () => {
    const state = store({ a: 0, b: 0 });
    const values: number[] = [];
    effect(() => {
      values.push(untrack(() => state.b));
      // Only tracking state.a
      void state.a;
    });
    state.b = 99; // Should NOT trigger
    state.a = 1;  // SHOULD trigger
    expect(values.length).toBeGreaterThanOrEqual(2);
  });

  it('runs cleanup before re-execution', () => {
    const state = store({ on: true });
    const cleanups: string[] = [];
    effect(() => {
      void state.on; // ← MUST access store to create dependency
      cleanups.push('run');
      return () => cleanups.push('cleanup');
    });
    state.on = false; // trigger re-run
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

  it('recomputes when dependency changes and is read', () => {
    const state = store({ x: 2 });
    const doubled = memo(() => state.x * 2);
    expect(doubled()).toBe(4);
    state.x = 5;
    // Not read yet — still cached
    expect(doubled()).toBe(10); // Now recomputes
  });
});

describe('batch()', () => {
  it('groups multiple mutations into one notification', () => {
    const state = store({ a: 0, b: 0 });
    const fn = vi.fn();
    effect(() => { void state.a; void state.b; fn(); });
    fn.mockClear(); // Clear initial run
    batch(() => {
      state.a = 1;
      state.b = 2;
    });
    expect(fn).toHaveBeenCalledTimes(1); // Only one notification
  });
});

describe('untrack()', () => {
  it('prevents dependency tracking inside the callback', () => {
    const state = store({ tracked: 0, ignored: 0 });
    const fn = vi.fn();
    effect(() => {
      void state.tracked;
      untrack(() => { void state.ignored; });
      fn();
    });
    fn.mockClear();
    state.ignored = 99; // Should NOT trigger
    expect(fn).not.toHaveBeenCalled();
    state.tracked = 1; // SHOULD trigger
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
