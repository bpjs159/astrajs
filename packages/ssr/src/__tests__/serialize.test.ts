import { describe, it, expect } from 'vitest';
import { store } from 'astrajs.dev/core';
import { serializeState, deserializeState } from '../serialize.js';

describe('serializeState()', () => {
  it('serializes a store to JSON', () => {
    const state = store({ count: 0, name: 'test' });
    const json = serializeState(state);
    const parsed = JSON.parse(json);
    expect(parsed.count).toBe(0);
    expect(parsed.name).toBe('test');
  });

  it('handles nested objects in a store', () => {
    const state = store({ user: { name: 'Alice', age: 30 } });
    const json = serializeState(state);
    const parsed = JSON.parse(json);
    expect(parsed.user.name).toBe('Alice');
    expect(parsed.user.age).toBe(30);
  });
});

describe('deserializeState()', () => {
  it('deserializes JSON back to a reactive proxy', () => {
    const state = deserializeState<{ count: number }>('{"count":42}');
    expect(state.count).toBe(42);
  });

  it('returns an object on invalid JSON', () => {
    const state = deserializeState('not json');
    expect(state).toBeDefined();
    expect(typeof state).toBe('object');
  });
});
