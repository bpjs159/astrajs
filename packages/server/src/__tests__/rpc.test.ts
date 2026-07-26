import { describe, it, expect, vi } from 'vitest';
import { registerRPCHandler, getRPCHandler, revalidate, onCacheInvalidate } from '../rpc.js';

describe('registerRPCHandler()', () => {
  it('registers and retrieves a handler', () => {
    const fn = vi.fn().mockResolvedValue({ ok: true });
    registerRPCHandler('testHandler', fn, { tags: ['test'] });
    const handler = getRPCHandler('testHandler');
    expect(handler).toBeDefined();
    expect(handler!.tags).toContain('test');
  });

  it('returns undefined for unknown handler', () => {
    expect(getRPCHandler('nonexistent')).toBeUndefined();
  });
});

describe('revalidate()', () => {
  it('calls registered onCacheInvalidate callbacks', () => {
    const fn = vi.fn();
    const unsub = onCacheInvalidate(fn);
    revalidate('products');
    expect(fn).toHaveBeenCalledWith('products');
    unsub();
  });
});
