import { describe, it, expect } from 'vitest';
import { store, toRaw, toProxy } from '../runtime/store.js';
import { effect } from '../runtime/effect.js';

describe('store()', () => {
  it('creates a reactive proxy from a plain object', () => {
    const state = store({ count: 0 });
    expect(state.count).toBe(0);
  });

  it('preserves the shape of the original object', () => {
    const state = store({ a: 1, b: 'hello', c: { d: true } });
    expect(state.a).toBe(1);
    expect(state.b).toBe('hello');
    expect(state.c.d).toBe(true);
  });

  it('allows mutations and reflects updated values', () => {
    const state = store({ count: 0 });
    state.count = 5;
    expect(state.count).toBe(5);
  });

  it('supports nested object mutations', () => {
    const state = store({ user: { name: 'Alice', age: 30 } });
    state.user.name = 'Bob';
    state.user.age = 31;
    expect(state.user.name).toBe('Bob');
    expect(state.user.age).toBe(31);
  });

  it('supports array mutations (push)', () => {
    const state = store({ items: [] as string[] });
    state.items.push('a');
    state.items.push('b');
    expect(state.items).toEqual(['a', 'b']);
  });

  it('throws on non-object initial state', () => {
    expect(() => store(null as unknown as object)).toThrow(TypeError);
    expect(() => store(42 as unknown as object)).toThrow(TypeError);
  });

  it('toRaw unwraps a proxy to the plain object', () => {
    const raw = { x: 10 };
    const state = store(raw);
    expect(toRaw(state)).toBe(raw);
  });

  it('toProxy returns the proxy from a raw object', () => {
    const raw = { y: 20 };
    const state = store(raw);
    expect(toProxy(raw)).toBe(state);
  });

  it('returns same proxy for same raw object', () => {
    const raw = { z: 30 };
    const a = store(raw);
    const b = store(raw);
    expect(a).toBe(b);
  });

  // Regression: built-in collections (Set/Map) must NOT be wrapped in a
  // Proxy. Their methods rely on internal slots ([[SetData]]) and throw
  // "Method Set.prototype.has called on incompatible receiver" when called
  // on a Proxy (e.g. the 06-optimistic-mutations example showed a blank
  // screen because of this).
  it('does not wrap Set instances — methods keep working', () => {
    const state = store({ pending: new Set<string>() });
    expect(state.pending).toBeInstanceOf(Set);
    state.pending.add('a');
    expect(state.pending.has('a')).toBe(true);
    expect(state.pending.has('b')).toBe(false);
    state.pending.delete('a');
    expect(state.pending.has('a')).toBe(false);
  });

  it('does not wrap Map instances — methods keep working', () => {
    const state = store({ counts: new Map<string, number>() });
    expect(state.counts).toBeInstanceOf(Map);
    state.counts.set('x', 1);
    expect(state.counts.get('x')).toBe(1);
    expect(state.counts.has('x')).toBe(true);
  });

  it('still proxies plain nested objects and arrays', () => {
    const state = store({ items: [{ likes: 1 }] });
    expect(state.items).not.toBeInstanceOf(Set);
    state.items[0].likes++;
    expect(state.items[0].likes).toBe(2);
  });

  it('reassigning a Set property still triggers subscribers', () => {
    const state = store({ pending: new Set<string>(), hits: 0 });
    let render = 0;
    effect(() => {
      render++;
      state.pending.has('x');
      state.hits;
    });
    render = 0;
    state.pending = new Set(state.pending).add('x');
    state.hits++;
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(render).toBeGreaterThan(0);
        resolve();
      }, 10);
    });
  });
});
