/**
 * astrajs.dev/ai — RAG (Phase 6)
 *
 * In-memory vector index with cosine similarity over provider embeddings.
 * Edge-safe: plain arrays + fetch. Designed for server-side use inside
 * `server()`/`ai()` handlers (or at build time for SSG corpora).
 *
 * ```ts
 * import { createRag } from 'astrajs.dev/ai/rag';
 *
 * const rag = createRag();
 * await rag.index('docs', ['AstraJS compiles JSX to DOM mutations', ...]);
 *
 * export const ask = server(async (q: string) => rag.answer('docs', q));
 * ```
 */
import { getAiRuntime } from './config.js';
import { getProvider } from './provider.js';
import { complete } from './runtime.js';
import type { CompleteOptions } from './types.js';

export interface RagSearchResult {
  text: string;
  score: number;
}

interface RagCollection {
  texts: string[];
  vectors: number[][];
}

export class Rag {
  private collections = new Map<string, RagCollection>();
  private readonly options: { model?: string };

  constructor(options: { model?: string } = {}) {
    this.options = options;
  }

  private provider() {
    return getProvider();
  }

  /** Indexes `texts` under a collection name (embeddings are computed now). */
  async index(name: string, texts: string[]): Promise<number> {
    const cfg = getAiRuntime();
    const model = this.options.model ?? cfg.embedModel;
    const vectors = await this.provider().embed(model, texts);
    this.collections.set(name, { texts, vectors });
    return texts.length;
  }

  /** Returns the top-k most similar chunks for `query` (cosine similarity). */
  async search(name: string, query: string, k = 3): Promise<RagSearchResult[]> {
    const collection = this.collections.get(name);
    if (!collection || collection.texts.length === 0) return [];

    const cfg = getAiRuntime();
    const model = this.options.model ?? cfg.embedModel;
    const [queryVec] = await this.provider().embed(model, [query]);
    if (!queryVec) return [];

    const scored = collection.vectors.map((vec, i) => ({
      text: collection.texts[i]!,
      score: cosine(queryVec, vec),
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .filter((r) => r.score > 0);
  }

  /**
   * Answers a question grounded on the indexed collection: retrieves the
   * top chunks, then completes with a context-restricted prompt.
   */
  async answer(
    name: string,
    question: string,
    options: CompleteOptions & { k?: number } = {}
  ): Promise<string> {
    const { k, ...completeOptions } = options;
    const hits = await this.search(name, question, k ?? 3);
    if (hits.length === 0) {
      return complete(question, completeOptions);
    }
    const context = hits.map((h) => `- ${h.text}`).join('\n');
    return complete(
      `Answer the question using ONLY the following context.\n\n` +
        `Context:\n${context}\n\nQuestion: ${question}\n\nAnswer:`,
      completeOptions
    );
  }

  /** Number of indexed chunks across all collections. */
  size(): number {
    let total = 0;
    for (const c of this.collections.values()) total += c.texts.length;
    return total;
  }
}

/** Creates a RAG instance. */
export function createRag(options: { model?: string } = {}): Rag {
  return new Rag(options);
}

/** Cosine similarity between two vectors. */
export function cosine(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  const norm = Math.sqrt(na) * Math.sqrt(nb);
  return norm === 0 ? 0 : dot / norm;
}
