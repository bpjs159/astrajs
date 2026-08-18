/**
 * astrajs.dev/compiler — AutoSync Polling Auto-Wiring Tests
 */
import { describe, it, expect } from 'vitest';
import { autoWireAutoSyncCalls, type AutoSyncCallInfo } from '../transformers/autosync-wire.js';

function callsMap(entries: Record<string, AutoSyncCallInfo>): Map<string, AutoSyncCallInfo> {
  return new Map(Object.entries(entries));
}

describe('autoSync polling auto-wiring', () => {
  it('injects autoSync() + return for a tracked server call inside mounted()', () => {
    const source = `
      mounted(() => {
        getStock().then((data) => { state.level = data.level; });
      });
    `;
    const result = autoWireAutoSyncCalls(
      source,
      callsMap({ getStock: { endpoint: '/api/astra/getStock', interval: 5000 } })
    );
    expect(result.changed).toBe(true);
    expect(result.code).toContain("autoSync('/api/astra/getStock'");
    expect(result.code).toContain('{ interval: 5000 }');
    expect(result.code).toContain('return autoSync(');
    // Reuses the exact same callback used for the initial load.
    expect(result.code).toContain('(data) => { state.level = data.level; }');
  });

  it('does nothing when the map is empty', () => {
    const source = `
      mounted(() => {
        getStock().then((data) => { state.level = data.level; });
      });
    `;
    const result = autoWireAutoSyncCalls(source, callsMap({}));
    expect(result.changed).toBe(false);
    expect(result.code).toBe(source);
  });

  it('ignores calls to functions not in the autoSync map', () => {
    const source = `
      mounted(() => {
        getOrders().then((data) => { state.orders = data; });
      });
    `;
    const result = autoWireAutoSyncCalls(
      source,
      callsMap({ getStock: { endpoint: '/api/astra/getStock', interval: 3000 } })
    );
    expect(result.changed).toBe(false);
  });

  it('does nothing when the block already has a return', () => {
    const source = `
      mounted(() => {
        getStock().then((data) => { state.level = data.level; });
        return () => {};
      });
    `;
    const result = autoWireAutoSyncCalls(
      source,
      callsMap({ getStock: { endpoint: '/api/astra/getStock', interval: 3000 } })
    );
    expect(result.changed).toBe(false);
  });

  it('does nothing when there are two matching calls (ambiguous)', () => {
    const source = `
      mounted(() => {
        getStock().then((data) => { state.a = data; });
        getOrders().then((data) => { state.b = data; });
      });
    `;
    const result = autoWireAutoSyncCalls(
      source,
      callsMap({
        getStock: { endpoint: '/api/astra/getStock', interval: 3000 },
        getOrders: { endpoint: '/api/astra/getOrders', interval: 3000 },
      })
    );
    expect(result.changed).toBe(false);
  });

  it('preserves other statements in the block before the injected return', () => {
    const source = `
      mounted(() => {
        state.lastSync = timestamp();
        getStock().then((data) => { state.level = data.level; });
      });
    `;
    const result = autoWireAutoSyncCalls(
      source,
      callsMap({ getStock: { endpoint: '/api/astra/getStock', interval: 3000 } })
    );
    expect(result.changed).toBe(true);
    expect(result.code).toContain('state.lastSync = timestamp();');
    expect(result.code.indexOf('return autoSync(')).toBeGreaterThan(
      result.code.indexOf('state.lastSync')
    );
  });
});
