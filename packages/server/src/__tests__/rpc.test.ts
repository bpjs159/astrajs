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

describe('handleRPCRequest() — stream handlers', () => {
  it('streams text chunks with the marker header', async () => {
    rpcHandler(
      'streamTest',
      async function* (): AsyncGenerator<string> {
        yield 'He';
        yield 'llo';
      },
      { stream: true, maxAge: 60, tags: ['ai'] }
    );

    const response = await import('../rpc.js').then((m) =>
      m.handleRPCRequest(
        new Request('http://x/api/astra/streamTest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '[]',
        }),
        'streamTest'
      )
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('x-astra-stream')).toBe('1');
    expect(response.headers.get('cache-control')).toContain('max-age=60');
    expect(response.headers.get('cache-tag')).toBe('ai');

    const text = await response.text();
    expect(text).toBe('Hello');
  });

  it('appends a stream error marker when the generator throws', async () => {
    rpcHandler(
      'streamError',
      async function* (): AsyncGenerator<string> {
        yield 'ok';
        throw new Error('model exploded');
      },
      { stream: true }
    );

    const { handleRPCRequest } = await import('../rpc.js');
    const response = await handleRPCRequest(
      new Request('http://x/api/astra/streamError', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '[]',
      }),
      'streamError'
    );
    const text = await response.text();
    expect(text).toContain('ok');
    expect(text).toContain('model exploded');
  });
});
