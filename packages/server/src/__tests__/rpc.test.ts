import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  rpcHandler,
  getRPCHandler,
  revalidate,
  onCacheInvalidate,
  rpcClient,
  type RPCError,
} from '../rpc.js';

describe('rpcHandler()', () => {
  it('registers and retrieves a handler', () => {
    const fn = vi.fn().mockResolvedValue({ ok: true });
    rpcHandler('testHandler', fn, { tags: ['test'] });
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

describe('rpcClient() error handling', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('throws the server\'s clean message parsed from the { error } JSON body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: vi.fn().mockResolvedValue(
        JSON.stringify({ error: 'Server rejected the like for "post-1"' })
      ),
    }));

    const likePost = rpcClient<string, { id: string }>('/api/astra/likePost');
    try {
      await likePost('post-1');
      expect.unreachable('should have thrown');
    } catch (e) {
      const err = e as RPCError;
      expect(err.message).toBe('Server rejected the like for "post-1"');
      expect(err.status).toBe(500);
      expect(err.endpoint).toBe('/api/astra/likePost');
      expect(err.body).toContain('Server rejected');
    }
  });

  it('falls back to a descriptive message when the body is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      text: vi.fn().mockResolvedValue('Bad Gateway'),
    }));

    const fn = rpcClient<[], unknown>('/api/astra/x');
    await expect(fn()).rejects.toThrow(
      '[AstraJS RPC] /api/astra/x returned 502: Bad Gateway'
    );
  });
});
