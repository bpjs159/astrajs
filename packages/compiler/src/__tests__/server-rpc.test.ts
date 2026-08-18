/**
 * astrajs.dev/compiler — server() call parsing tests
 *
 * Regression coverage for a bug where `findServerCalls` sliced the outer
 * parentheses INTO the text handed to `parseServerCallArgs` (which expects
 * the text strictly BETWEEN the parens), causing every `server(...)` call —
 * block-body or concise-body — to silently fail to match and never be
 * transformed.
 */
import { describe, it, expect } from 'vitest';
import { findServerCalls, transformServerRPC } from '../transformers/server-rpc.js';

describe('findServerCalls', () => {
  it('parses a block-body call with config', () => {
    const src = `const getProducts = server({ tags: ['x'] }, async (category) => { return db.find(category); });`;
    const calls = findServerCalls(src);
    expect(calls).toHaveLength(1);
    expect(calls[0]!.id).toBe('getProducts');
    expect(calls[0]!.config).toEqual({ tags: ['x'] });
    expect(calls[0]!.paramNames).toEqual(['category']);
    expect(calls[0]!.functionBody.trim()).toBe('return db.find(category);');
  });

  it('parses a block-body call without config', () => {
    const src = `const getAll = server(async () => { return db.all(); });`;
    const calls = findServerCalls(src);
    expect(calls).toHaveLength(1);
    expect(calls[0]!.id).toBe('getAll');
    expect(calls[0]!.config).toEqual({});
    expect(calls[0]!.functionBody.trim()).toBe('return db.all();');
  });

  it('parses a concise-body call with config (object literal return)', () => {
    const src = `const getStock = server({ autoSync: true, autoSyncInterval: 5000 }, async () => ({ level: stockLevel }));`;
    const calls = findServerCalls(src);
    expect(calls).toHaveLength(1);
    expect(calls[0]!.id).toBe('getStock');
    expect(calls[0]!.config).toEqual({ autoSync: true, autoSyncInterval: 5000 });
    expect(calls[0]!.functionBody).toBe('return ({ level: stockLevel });');
  });

  it('parses a concise-body call without config', () => {
    const src = `const getLevel = server(() => stockLevel);`;
    const calls = findServerCalls(src);
    expect(calls).toHaveLength(1);
    expect(calls[0]!.functionBody).toBe('return (stockLevel);');
  });

  it('transformServerRPC replaces the call site with a client wrapper', () => {
    const src = `const getProducts = server({ tags: ['x'] }, async (category) => { return db.find(category); });`;
    const result = transformServerRPC(src, 'test.tsx', { apiPrefix: '/api/astra' });
    expect(result.calls).toHaveLength(1);
    expect(result.clientCode).not.toContain('server({');
    expect(result.clientCode).toContain('/api/astra/getProducts');
  });

  it('generated client wrapper parses the { error } JSON body for a clean message', () => {
    const src = `const likePost = server(async (id) => { if (Math.random() < 0.3) throw new Error('rejected'); return { id }; });`;
    const result = transformServerRPC(src, 'test.tsx', { apiPrefix: '/api/astra' });
    expect(result.clientCode).toContain('JSON.parse(_err)');
    expect(result.clientCode).toContain('_body?.error');
    expect(result.clientCode).toContain('_error.status = _res.status');
    // The old raw-HTTP message is now only a fallback, not the default.
    expect(result.clientCode).toContain('[AstraJS RPC]');
  });

  it('parses arrows with return-type annotations (with config)', () => {
    const src = `const getProduct = server({ tags: ['products'] }, async (id: string): Promise<Product | null> => { return db.find(id); });`;
    const calls = findServerCalls(src);
    expect(calls).toHaveLength(1);
    expect(calls[0]!.id).toBe('getProduct');
    expect(calls[0]!.config).toEqual({ tags: ['products'] });
    expect(calls[0]!.paramNames).toEqual(['id']);
    expect(calls[0]!.functionBody.trim()).toBe('return db.find(id);');
  });

  it('parses arrows with return-type annotations (without config)', () => {
    const src = `const getProducts = server(async (): Promise<Product[]> => { return PRODUCTS; });`;
    const calls = findServerCalls(src);
    expect(calls).toHaveLength(1);
    expect(calls[0]!.id).toBe('getProducts');
    expect(calls[0]!.paramNames).toEqual([]);
    expect(calls[0]!.functionBody.trim()).toBe('return PRODUCTS;');
  });

  it('parses concise-body arrows with return-type annotations', () => {
    const src = `const getLevel = server(async (): Promise<number> => stockLevel);`;
    const calls = findServerCalls(src);
    expect(calls).toHaveLength(1);
    expect(calls[0]!.functionBody).toBe('return (stockLevel);');
  });

  it('handles nested arrows inside the return-type annotation', () => {
    const src = `const load = server({ maxAge: 60 }, async (cb: () => void): Promise<{ run: () => Promise<void> }> => { return { run: async () => {} }; });`;
    const calls = findServerCalls(src);
    expect(calls).toHaveLength(1);
    expect(calls[0]!.paramNames).toEqual(['cb']);
    expect(calls[0]!.functionBody.trim()).toBe('return { run: async () => {} };');
  });

  it('transforms annotated-arrow calls into client wrappers', () => {
    const src = `const getProduct = server({ tags: ['products'] }, async (id: string): Promise<Product | null> => { return db.find(id); });`;
    const result = transformServerRPC(src, 'test.tsx', { apiPrefix: '/api/astra' });
    expect(result.calls).toHaveLength(1);
    expect(result.clientCode).not.toContain('server({');
    expect(result.clientCode).toContain('/api/astra/getProduct');
  });
});
