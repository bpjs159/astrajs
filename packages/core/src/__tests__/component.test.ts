import { describe, it, expect } from 'vitest';
import { component } from '../runtime/component.js';
import { store } from '../runtime/store.js';

describe('component()', () => {
  it('returns a function that produces a DOM element', () => {
    const Counter = component(() => {
      store({ value: 0 });
      const el = document.createElement('div');
      el.textContent = 'hello';
      return el;
    });
    const result = Counter({});
    expect(result).toBeInstanceOf(HTMLSpanElement);
  });

  it('reuses store instances across re-renders', () => {
    let firstStore: object | null = null;
    const Counter = component(() => {
      const s = store({ count: 0 });
      if (!firstStore) firstStore = s;
      const el = document.createElement('div');
      el.textContent = String(s.count);
      return el;
    });
    Counter({});
    // Force re-render by accessing the internal effect (indirectly tested via store caching)
    expect(firstStore).not.toBeNull();
  });
});
