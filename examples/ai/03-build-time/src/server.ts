/**
 * AI 03 — Build-time AI (SSG with AI)
 *
 * `ai({ type: 'pre-build' })` runs the prompt DURING `astra build` and
 * FOLDS the response into the bundle as a JSON constant. The deployed
 * page makes zero model calls — pure static files.
 *
 * The prompt body must be self-contained (it runs in isolation, same
 * contract as server() pre-build). Results are cached by prompt hash in
 * `.astra/ai-cache.json`, so unchanged prompts don't re-spend tokens.
 *
 * If the model answers with pure JSON, the parsed value is folded;
 * otherwise the `{ text }` contract is used.
 */
import { ai } from '@bpjs159/ai';

export const faq = ai(
  { type: 'pre-build', model: 'qwen2.5-coder:7b' },
  async () => {
    return (
      'Generate 3 FAQs about a framework called AstraJS ' +
      '(Zero Virtual DOM, TypeScript compiled to direct DOM mutations, ' +
      'resumability, server() RPC). Respond ONLY as a JSON array of ' +
      '{"q": "...", "a": "..."} objects.'
    );
  }
);
