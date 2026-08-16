/**
 * @bpjs159/compiler — ai()/aiStream() transform tests
 */
import { describe, it, expect } from 'vitest';
import {
  findAiCalls,
  transformAiRPC,
  generateAiServerRegistration,
  aiPromptKey,
} from '../transformers/ai-rpc.js';

describe('findAiCalls', () => {
  it('parses ai() with config', () => {
    const src = `const summarize = ai({ model: 'qwen2.5-coder:7b', maxAge: 60, tags: ['ai'] }, async (text) => { return 'Resume: ' + text; });`;
    const calls = findAiCalls(src);
    expect(calls).toHaveLength(1);
    expect(calls[0]!.id).toBe('summarize');
    expect(calls[0]!.isStream).toBe(false);
    expect(calls[0]!.isPreBuild).toBe(false);
    expect(calls[0]!.config).toMatchObject({ model: 'qwen2.5-coder:7b', maxAge: 60, tags: ['ai'] });
    expect(calls[0]!.paramNames).toEqual(['text']);
  });

  it('parses aiStream() and distinguishes it from ai()', () => {
    const src = `const chat = aiStream({ model: 'm' }, async (q) => { return q; });`;
    const calls = findAiCalls(src);
    expect(calls).toHaveLength(1);
    expect(calls[0]!.isStream).toBe(true);
  });

  it('detects pre-build ai calls', () => {
    const src = `const faq = ai({ type: 'pre-build', model: 'm' }, async () => { return 'Generate FAQs as JSON.'; });`;
    const calls = findAiCalls(src);
    expect(calls[0]!.isPreBuild).toBe(true);
  });

  it('does not match aiAgent() or other identifiers', () => {
    const src = `const agent = aiAgent([], {}); const detail = paint(x);`;
    expect(findAiCalls(src)).toHaveLength(0);
  });
});

describe('transformAiRPC', () => {
  it('generates a typed fetch wrapper for ai()', () => {
    const src = `const summarize = ai({ model: 'm' }, async (text) => { return 'R: ' + text; });`;
    const { clientCode } = transformAiRPC(src, '/x/app.ts', { apiPrefix: '/api/astra' });
    expect(clientCode).toContain("fetch('/api/astra/summarize'");
    expect(clientCode).toContain('return _res.json();');
    expect(clientCode).not.toContain('ai({');
  });

  it('generates a streaming wrapper with onToken for aiStream()', () => {
    const src = `const chat = aiStream({ model: 'm' }, async (q) => { return q; });`;
    const { clientCode } = transformAiRPC(src, '/x/app.ts', { apiPrefix: '/api/astra' });
    expect(clientCode).toContain("fetch('/api/astra/chat'");
    expect(clientCode).toContain('_reader.read()');
    expect(clientCode).toContain('onToken(_chunk)');
  });

  it('folds pre-build results into JSON constants', () => {
    const src = `const faq = ai({ type: 'pre-build' }, async () => { return 'x'; });`;
    const { clientCode } = transformAiRPC(
      src,
      '/x/app.ts',
      { apiPrefix: '/api/astra' },
      new Map([['faq', '[{"q":"a"}]']])
    );
    expect(clientCode).toContain('const faq = [{"q":"a"}];');
    expect(clientCode).not.toContain('ai(');
  });
});

describe('generateAiServerRegistration', () => {
  it('registers a non-stream handler through complete()', () => {
    const [call] = findAiCalls(
      `const summarize = ai({ model: 'm', maxAge: 60 }, async (text) => { return 'R'; });`
    );
    const reg = generateAiServerRegistration(call!);
    expect(reg).toContain("rpcHandler(\"summarize\"");
    expect(reg).toContain('complete(String(_prompt)');
    expect(reg).toContain('maxAge: 60');
    expect(reg).not.toContain('stream: true');
  });

  it('registers a stream handler as an async generator', () => {
    const [call] = findAiCalls(`const chat = aiStream({ model: 'm' }, async (q) => { return q; });`);
    const reg = generateAiServerRegistration(call!);
    expect(reg).toContain('stream: true');
    expect(reg).toContain('async function*');
    expect(reg).toContain('for await (const _chunk of stream(String(_prompt)');
  });
});

describe('aiPromptKey', () => {
  it('is stable for identical prompt bodies and differs per model', () => {
    const [a] = findAiCalls(`const x = ai({ model: 'm1' }, async () => { return 'p'; });`);
    const [b] = findAiCalls(`const y = ai({ model: 'm1' }, async () => { return 'p'; });`);
    const [c] = findAiCalls(`const z = ai({ model: 'm2' }, async () => { return 'p'; });`);
    expect(aiPromptKey(a!)).toBe(aiPromptKey(b!));
    expect(aiPromptKey(a!)).not.toBe(aiPromptKey(c!));
  });
});
