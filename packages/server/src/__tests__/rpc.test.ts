import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest';
import {
  rpcHandler,
  getRPCHandler,
  revalidate,
  onCacheInvalidate,
  rpcClient,
  handleRPCRequest,
  configureRPC,
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

// ─── SECURITY regressions (2026-08-18 audit) ───────────────────────────────

describe('handleRPCRequest() security', () => {
  beforeAll(() => {
    configureRPC({ auth: undefined, maxBodyBytes: 1024 * 1024, exposeErrors: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    // Restore safe defaults for other tests.
    configureRPC({ auth: undefined, maxBodyBytes: 1024 * 1024, exposeErrors: true });
  });

  it('rejects oversized bodies with 413 before executing the handler', async () => {
    const fn = vi.fn().mockResolvedValue('ran');
    rpcHandler('bigBody', fn);
    configureRPC({ maxBodyBytes: 16 });

    const response = await handleRPCRequest(
      new Request('http://x/api/astra/bigBody', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': '1000' },
        body: '[' + 'x'.repeat(1000) + ']',
      }),
      'bigBody'
    );
    expect(response.status).toBe(413);
    expect(fn).not.toHaveBeenCalled();
  });

  it('enforces the auth hook before running any handler', async () => {
    const fn = vi.fn().mockResolvedValue('ran');
    rpcHandler('protected', fn);
    configureRPC({ auth: () => false });

    const response = await handleRPCRequest(
      new Request('http://x/api/astra/protected', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '[]',
      }),
      'protected'
    );
    expect(response.status).toBe(401);
    expect(fn).not.toHaveBeenCalled();

    configureRPC({ auth: () => true });
    const ok = await handleRPCRequest(
      new Request('http://x/api/astra/protected', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '[]',
      }),
      'protected'
    );
    expect(ok.status).toBe(200);
  });

  it('hides internal error details when exposeErrors is false', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    rpcHandler('failing', async () => {
      throw new Error('secret: db://user:pass@host');
    });
    configureRPC({ exposeErrors: false });

    const response = await handleRPCRequest(
      new Request('http://x/api/astra/failing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '[]',
      }),
      'failing'
    );
    expect(response.status).toBe(500);
    const body = JSON.parse(await response.text()) as { error: string };
    expect(body.error).toBe('Internal RPC error');
    // The real message is still logged server-side.
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });
});
