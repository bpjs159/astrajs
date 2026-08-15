/**
 * AI 01 — Typed AI endpoints (ai + aiStream)
 *
 * Both macros compile like server(): the client gets a typed fetch
 * wrapper, the model runs on the server, and the API key never ships.
 *
 * - `ai(...)`        → one-shot completion, returns { text }
 * - `aiStream(...)`  → token stream; onToken fires per chunk client-side
 */
import { ai, aiStream } from '@astrajs/ai';

/** One-shot endpoint (ISR-cached for 5 minutes). */
export const summarize = ai(
  { model: 'qwen2.5-coder:7b', maxAge: 300, tags: ['summaries'] },
  async (text: string) => `Summarize this in one short sentence: ${text}`
);

/** Streaming endpoint — tokens reach the browser as they are generated. */
export const chat = aiStream(
  { model: 'qwen2.5-coder:7b' },
  async (question: string) =>
    `Answer this question briefly and helpfully:\n${question}`
);
