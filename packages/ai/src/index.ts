/**
 * astrajs.dev/ai — Public API Entry Point
 *
 * Typed AI endpoints, streaming, tool calling and RAG for AstraJS apps.
 * All modules are edge-safe (Web APIs only) and provider-agnostic.
 *
 * ## Quick reference
 *
 * | Feature            | API                                            |
 * | ------------------ | ---------------------------------------------- |
 * | Typed endpoint     | `ai(cfg, async (x) => prompt)`                 |
 * | Streaming          | `aiStream(cfg, async (x) => prompt)`           |
 * | Build-time AI      | `ai({ type: 'pre-build' }, async () => ...)`   |
 * | One-shot completion| `complete(prompt, { model, temperature })`     |
 * | Tools / agents     | `aiAgent(tools, { system })` → `.run(prompt)`  |
 * | RAG                | `createRag()` (see `astrajs.dev/ai/rag`)         |
 * | Configuration      | `configureAi({ provider, baseURL, model })`    |
 */

export {
  ai,
  aiStream,
  complete,
  stream,
  executePrompt,
} from './runtime.js';
export { aiAgent } from './tools.js';
export type { AgentOptions, AgentHandle } from './tools.js';
export { createRag, Rag, cosine } from './rag.js';
export type { RagSearchResult } from './rag.js';
export { configureAi, getAiRuntime, resetAiRuntime } from './config.js';
export { getProvider, clearProviderCache } from './provider.js';
export { parseSSE, parseNDJSON, toByteStream } from './sse.js';
export type {
  AiProviderName,
  AiMessage,
  AiToolCall,
  CompleteOptions,
  AiRuntimeConfig,
  ToolSchema,
  AiTool,
  ToolChatResult,
  AiCallConfig,
} from './types.js';
