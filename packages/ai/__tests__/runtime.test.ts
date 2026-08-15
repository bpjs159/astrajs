/**
 * @astrajs/ai — runtime tests
 *
 * Imports the BUILT dist (vitest can't remap `.js` → `.ts` inside sibling
 * package sources under native Node). Run `npm run build` first.
 */
import { describe, expect, it } from 'vitest';
import {
  complete,
  configureAi,
  getAiRuntime,
  resetAiRuntime,
  stream,
  aiAgent,
} from '../dist/index.js';
import { createRag, cosine } from '../dist/rag.js';
import { parseSSE, parseNDJSON } from '../dist/sse.js';

describe('configuration', () => {
  it('defaults to local Ollama without any env', () => {
    resetAiRuntime();
    const cfg = getAiRuntime();
    expect(cfg.provider).toBe('ollama');
    expect(cfg.baseURL).toBe('http://127.0.0.1:11434');
    expect(cfg.model).toBe('qwen2.5-coder:7b');
  });

  it('configureAi overrides env defaults', () => {
    resetAiRuntime();
    configureAi({ provider: 'mock', model: 'mock' });
    expect(getAiRuntime().provider).toBe('mock');
    resetAiRuntime();
  });
});

describe('complete / stream (mock provider)', () => {
  it('completes a prompt', async () => {
    configureAi({ provider: 'mock' });
    const text = await complete('hello', { model: 'mock' });
    expect(text).toBe('mock[mock]: hello');
    resetAiRuntime();
  });

  it('streams chunks that concatenate to the full text', async () => {
    configureAi({ provider: 'mock' });
    let acc = '';
    for await (const chunk of stream('hola')) acc += chunk;
    expect(acc).toBe('mock[mock]: hola');
    resetAiRuntime();
  });
});

describe('aiAgent (tool calling)', () => {
  it('answers directly when no tool is requested', async () => {
    configureAi({ provider: 'mock' });
    const calls: string[] = [];
    const agent = aiAgent(
      [
        {
          schema: {
            name: 'getProduct',
            description: 'fetch a product',
            parameters: { type: 'object', properties: { id: { type: 'string' } } },
          },
          fn: async (id: unknown) => {
            calls.push(String(id));
            return { id, price: 10 };
          },
        },
      ],
      { model: 'mock', maxSteps: 3 }
    );
    const answer = await agent.run('hello');
    expect(answer).toBe('mock[mock]: hello');
    expect(calls).toHaveLength(0);
    resetAiRuntime();
  });

  it('invokes the tool when the model requests it', async () => {
    configureAi({ provider: 'mock' });
    let invocations = 0;
    const agent = aiAgent(
      [
        {
          schema: {
            name: 'getProduct',
            description: 'fetch a product',
            parameters: { type: 'object', properties: { id: { type: 'string' } } },
          },
          fn: async () => {
            invocations++;
            return { price: 10 };
          },
        },
      ],
      { model: 'mock', maxSteps: 3 }
    );
    // The mock provider calls a tool whenever the user prompt contains "tool:".
    const answer = await agent.run('tool:getProduct please');
    // After maxSteps rounds the loop forces a final answer via plain chat.
    expect(answer.startsWith('mock[mock]:')).toBe(true);
    expect(invocations).toBeGreaterThan(0);
    resetAiRuntime();
  });
});

describe('RAG (mock embeddings)', () => {
  it('indexes, searches and answers with context', async () => {
    configureAi({ provider: 'mock' });
    const rag = createRag();
    await rag.index('docs', [
      'AstraJS compiles JSX into direct DOM mutations',
      'The sky is blue on sunny days',
      'Vite plugins transform TypeScript at build time',
    ]);
    expect(rag.size()).toBe(3);

    const hits = await rag.search('docs', 'How does the compiler work?', 2);
    expect(hits.length).toBe(2);
    expect(hits[0]!.score).toBeGreaterThanOrEqual(hits[1]!.score);

    const answer = await rag.answer('docs', 'What is AstraJS?');
    expect(answer.startsWith('mock[mock]:')).toBe(true);
    resetAiRuntime();
  });

  it('cosine similarity is 1 for identical vectors', () => {
    expect(cosine([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
  });
});

describe('stream parsers', () => {
  it('parses OpenAI-style SSE events', async () => {
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            ': ping\n\ndata: {"choices":[{"delta":{"content":"A"}}]}\n\ndata: {"choices":[{"delta":{"content":"B"}}]}\n\ndata: [DONE]\n\n'
          )
        );
        controller.close();
      },
    });
    const events = [];
    for await (const e of parseSSE(body)) events.push(e);
    expect(events).toHaveLength(2);
  });

  it('parses Ollama NDJSON stream lines', async () => {
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            '{"message":{"content":"He"}}\n{"message":{"content":"llo"}}\n{"done":true}\n'
          )
        );
        controller.close();
      },
    });
    const events = [];
    for await (const e of parseNDJSON(body)) events.push(e);
    expect(events).toHaveLength(3);
  });
});
