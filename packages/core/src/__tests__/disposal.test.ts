/**
 * Tests for the effect disposal system — prevents memory leaks
 * when DOM nodes are removed.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { store, effect, onCleanup, flushPending } from '../index.js';
import { bindText, bindConditional, bindValue } from '../runtime/dom.js';
import { registerNodeEffect, disposeNodeEffects, hasNodeEffects } from '../runtime/disposal.js';
import type { DisposableEffect } from '../runtime/effect.js';

describe('effect() disposal', () => {
  it('returns a DisposableEffect handle', () => {
    const state = store({ count: 0 });
    const fx = effect(() => { void state.count; });

    expect(fx).toHaveProperty('dispose');
    expect(fx).toHaveProperty('disposed');
    expect(fx.disposed).toBe(false);

    fx.dispose();
    expect(fx.disposed).toBe(true);
  });

  it('stops re-running after dispose()', () => {
    const state = store({ count: 0 });
    const values: number[] = [];

    const fx = effect(() => { values.push(state.count); });
    expect(values).toEqual([0]);

    state.count = 1;
    flushPending();
    expect(values).toEqual([0, 1]);

    fx.dispose();
    state.count = 2;
    flushPending();
    // Should NOT have logged 2 — effect is disposed
    expect(values).toEqual([0, 1]);
  });

  it('runs cleanup on dispose()', () => {
    const state = store({ count: 0 });
    const cleanups: string[] = [];

    const fx = effect(() => {
      void state.count;
      return () => { cleanups.push('cleanup'); };
    });

    fx.dispose();
    expect(cleanups).toEqual(['cleanup']);
  });

  it('runs onCleanup callbacks on dispose()', () => {
    const state = store({ count: 0 });
    const cleanups: string[] = [];

    const fx = effect(() => {
      void state.count;
      onCleanup(() => { cleanups.push('onCleanup'); });
    });

    fx.dispose();
    expect(cleanups).toEqual(['onCleanup']);
  });

  it('double dispose is safe', () => {
    const state = store({ count: 0 });
    const cleanups: string[] = [];

    const fx = effect(() => {
      void state.count;
      return () => { cleanups.push('cleanup'); };
    });

    fx.dispose();
    fx.dispose(); // Should not throw or run cleanup again
    expect(cleanups).toEqual(['cleanup']);
  });
});

describe('onCleanup()', () => {
  it('runs cleanup before each re-execution', () => {
    const state = store({ count: 0 });
    const cleanups: string[] = [];

    effect(() => {
      void state.count;
      onCleanup(() => { cleanups.push(`cleanup-${state.count}`); });
    });

    state.count = 1;
    flushPending();
    // Cleanup from first run should have fired
    expect(cleanups.length).toBe(1);

    state.count = 2;
    flushPending();
    expect(cleanups.length).toBe(2);
  });

  it('warns when called outside an effect or mounted callback', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    onCleanup(() => {});
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('onCleanup() was called outside of a mounted() or effect()')
    );
    warnSpy.mockRestore();
  });
});

describe('bindText() disposal', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('registers effect for disposal', () => {
    const state = store({ text: 'hello' });
    const node = document.createTextNode('');

    bindText(node, () => state.text);
    expect(hasNodeEffects(node)).toBe(true);
  });

  it('stops updating after node disposal', () => {
    const state = store({ text: 'hello' });
    const node = document.createTextNode('');
    document.body.appendChild(node);

    bindText(node, () => state.text);
    expect(node.data).toBe('hello');

    // Simulate removal
    disposeNodeEffects(node);

    state.text = 'world';
    flushPending();
    // Should NOT have updated — effect is disposed
    expect(node.data).toBe('hello');
  });
});

describe('bindConditional() disposal', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('disposes old node effects when conditional swaps', () => {
    const state = store({ show: true, text: 'visible' });
    const parent = document.createElement('div');
    document.body.appendChild(parent);

    const anchor = document.createComment('~');
    parent.appendChild(anchor);

    let innerNode: HTMLElement | null = null;

    bindConditional(parent, anchor, () => {
      if (state.show) {
        innerNode = document.createElement('span');
        const tn = document.createTextNode('');
        bindText(tn, () => state.text);
        innerNode.appendChild(tn);
        return innerNode;
      }
      return null;
    });

    // Initial render
    expect(parent.querySelector('span')).toBeTruthy();
    const firstSpan = parent.querySelector('span')!;
    const firstText = firstSpan.firstChild as Text;
    expect(firstText.data).toBe('visible');

    // Swap to null
    state.show = false;
    flushPending();
    expect(parent.querySelector('span')).toBeNull();

    // Mutating text should not cause errors (old effect disposed)
    state.text = 'changed';
    flushPending();
  });
});

describe('bindValue() disposal', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('removes event listener on disposal', () => {
    const state = store({ value: 'initial' });
    const input = document.createElement('input');
    document.body.appendChild(input);

    bindValue(
      input,
      () => state.value,
      (v) => { state.value = v; }
    );

    expect(hasNodeEffects(input)).toBe(true);

    // Dispose
    disposeNodeEffects(input);
    expect(hasNodeEffects(input)).toBe(false);

    // The input event listener should be removed
    // (we can't directly test this, but we can verify the handler is cleaned up)
    expect((input as any).__astra_value_handler).toBeUndefined();
  });
});

describe('captureReactiveExpression()', () => {
  it('restores reactiveAccessDetected flag on exception', async () => {
    const { captureReactiveExpression } = await import('../runtime/store.js');
    const state = store({ x: 1 });

    // First call that throws
    try {
      captureReactiveExpression(() => {
        void state.x;
        throw new Error('test');
      });
    } catch {
      // Expected
    }

    // Second call should not be affected by the first
    const result = captureReactiveExpression(() => 'no store access');
    expect(result.isReactive).toBe(false);
  });
});

describe('onCleanup() inside mounted()', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('runs onCleanup callbacks when the component unmounts', async () => {
    const { component } = await import('../runtime/component.js');
    const { mounted, triggerUnmount } = await import('../runtime/lifecycle.js');
    const cleanups: string[] = [];

    const C = component(() => {
      mounted(() => {
        const id = 42;
        onCleanup(() => { cleanups.push(`interval-${id}`); });
        onCleanup(() => { cleanups.push('listener'); });
      });
      return document.createElement('div');
    });

    const wrapper = C({}) as HTMLElement;
    document.body.appendChild(wrapper);

    // mounted() callbacks fire via microtask
    await new Promise(r => queueMicrotask(r));
    await new Promise(r => queueMicrotask(r));

    // Unmount — cleanups registered via onCleanup must run
    triggerUnmount(wrapper);
    expect(cleanups).toEqual(['interval-42', 'listener']);
  });

  it('combines onCleanup with a returned cleanup function', async () => {
    const { component } = await import('../runtime/component.js');
    const { mounted, triggerUnmount } = await import('../runtime/lifecycle.js');
    const order: string[] = [];

    const C = component(() => {
      mounted(() => {
        onCleanup(() => { order.push('onCleanup'); });
        return () => { order.push('returned'); };
      });
      return document.createElement('div');
    });

    const wrapper = C({}) as HTMLElement;
    document.body.appendChild(wrapper);
    await new Promise(r => queueMicrotask(r));
    await new Promise(r => queueMicrotask(r));

    triggerUnmount(wrapper);
    expect(order).toContain('onCleanup');
    expect(order).toContain('returned');
  });
});
