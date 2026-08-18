import { describe, expect, it } from 'vitest';
import { rpcHandler } from 'astrajs.dev/server';
import { createAstraHandler } from '../../dist/core.js';
import { createCloudflareHandler } from '../../dist/cloudflare.js';

const PREFIX = '/api/astra';

describe('createAstraHandler (platform-neutral core)', () => {
  it('dispatches a POST RPC call by handler id', async () => {
    rpcHandler('testAdd', async (a, b) => (a as number) + (b as number));
    const handle = createAstraHandler();

    const res = await handle(
      new Request(`http://localhost${PREFIX}/testAdd`, {
        method: 'POST',
        body: JSON.stringify([2, 3]),
      })
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toBe(5);
  });

  it('returns 404 with the error contract for unknown handlers', async () => {
    const handle = createAstraHandler();
    const res = await handle(new Request(`http://localhost${PREFIX}/nope`, { method: 'POST', body: '[]' }));
    expect(res.status).toBe(404);
    expect(((await res.json()) as { error: string }).error).toContain('nope');
  });

  it('returns 500 with the server error message when the handler throws', async () => {
    rpcHandler('testBoom', async () => {
      throw new Error('DB down');
    });
    const handle = createAstraHandler();
    const res = await handle(new Request(`http://localhost${PREFIX}/testBoom`, { method: 'POST', body: '[]' }));
    expect(res.status).toBe(500);
    expect(((await res.json()) as { error: string }).error).toBe('DB down');
  });

  it('respects a custom apiPrefix', async () => {
    rpcHandler('testCustom', async () => 42);
    const handle = createAstraHandler({ apiPrefix: '/rpc' });
    const res = await handle(new Request('http://localhost/rpc/testCustom', { method: 'POST', body: '[]' }));
    expect(await res.json()).toBe(42);
  });

  it('sets ISR cache headers when the handler declares maxAge/tags', async () => {
    rpcHandler('testCached', async () => ({ ok: true }), { maxAge: 60, tags: ['products'] });
    const handle = createAstraHandler();
    const res = await handle(new Request(`http://localhost${PREFIX}/testCached`, { method: 'POST', body: '[]' }));
    expect(res.headers.get('Cache-Control')).toContain('max-age=60');
    expect(res.headers.get('Cache-Tag')).toBe('products');
  });

  it('sets ETag and answers 304 when autoSync matches', async () => {
    rpcHandler('testSync', async () => ({ v: 1 }), { autoSync: true });
    const handle = createAstraHandler();

    const first = await handle(new Request(`http://localhost${PREFIX}/testSync`, { method: 'POST', body: '[]' }));
    const etag = first.headers.get('ETag');
    expect(etag).toBeTruthy();

    const second = await handle(
      new Request(`http://localhost${PREFIX}/testSync`, {
        method: 'POST',
        body: '[]',
        headers: { 'If-None-Match': etag ?? '' },
      })
    );
    expect(second.status).toBe(304);
  });

  it('falls through to the render hook for non-API paths', async () => {
    const handle = createAstraHandler({
      render: async (_req, url) =>
        url.pathname === '/hello' ? new Response('hi') : null,
    });
    const hit = await handle(new Request('http://localhost/hello'));
    expect(await hit.text()).toBe('hi');

    const miss = await handle(new Request('http://localhost/other'));
    expect(miss.status).toBe(404);
  });
});

describe('createCloudflareHandler (edge)', () => {
  it('returns a fetch() entry compatible with Workers', async () => {
    rpcHandler('testEdge', async () => 'edge-ok');
    const worker = createCloudflareHandler();
    expect(typeof worker.fetch).toBe('function');

    const res = await worker.fetch(new Request(`http://localhost${PREFIX}/testEdge`, { method: 'POST', body: '[]' }));
    expect(await res.json()).toBe('edge-ok');
  });
});
