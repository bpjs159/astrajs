/**
 * AI 04 — RAG (Phase 6)
 *
 * A small in-memory vector index (cosine similarity over provider
 * embeddings) that grounds model answers on your own content.
 *
 * The index builds LAZILY inside the handler — it never runs in the
 * client bundle (the client only receives the askDocs fetch wrapper).
 */
import { server } from '@astrajs/server';
import { createRag } from '@astrajs/ai/rag';

// The "knowledge base" — could be docs chunks, product manuals, posts…
const DOCS = [
  'AstraJS is a full-stack TypeScript framework with zero Virtual DOM.',
  'The compiler transforms JSX into direct DOM mutations at build time.',
  'Resumability means zero hydration: state is serialized into HTML attributes and the interactive JS loads just-in-time.',
  'server() turns a server function into a typed RPC endpoint automatically.',
  'AstraJS deploys to Node, Vercel, Cloudflare and static hosting with one command.',
  'Cats purr when they are happy and knead soft blankets.',
];

const rag = createRag();
let indexed = false;

/** Answers grounded on the indexed knowledge base. */
export const askDocs = server(async (question: string) => {
  if (!indexed) {
    await rag.index('docs', DOCS);
    indexed = true;
  }
  return rag.answer('docs', question);
});

/** Returns the top-k most relevant chunks (peek under the hood). */
export const searchDocs = server(async (question: string, k: number) => {
  if (!indexed) {
    await rag.index('docs', DOCS);
    indexed = true;
  }
  return rag.search('docs', question, k ?? 3);
});
