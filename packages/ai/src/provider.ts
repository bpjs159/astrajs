/**
 * astrajs.dev/ai — Provider interface + dispatch
 *
 * A provider is a thin translation layer between normalized messages/tools
 * and a vendor HTTP API. Everything is fetch-based (edge-safe).
 */
import { getAiRuntime } from './config.js';
import type {
  AiMessage,
  AiRuntimeConfig,
  AiToolCall,
  CompleteOptions,
  ToolChatResult,
  ToolSchema,
} from './types.js';
import { createOllamaProvider } from './providers/ollama.js';
import { createOpenAIProvider } from './providers/openai.js';
import { createMockProvider } from './providers/mock.js';

export interface AiProvider {
  /** One-shot chat completion. */
  chat(
    model: string,
    messages: AiMessage[],
    options?: CompleteOptions
  ): Promise<string>;
  /** Token stream (async generator of text chunks). */
  stream(
    model: string,
    messages: AiMessage[],
    options?: CompleteOptions
  ): AsyncGenerator<string>;
  /** Tool-aware completion (Phase 5). */
  chatWithTools(
    model: string,
    messages: AiMessage[],
    tools: ToolSchema[],
    options?: CompleteOptions
  ): Promise<ToolChatResult>;
  /** Embeddings for RAG (Phase 6). */
  embed(model: string, texts: string[]): Promise<number[][]>;
}

/** Cached provider instances keyed by runtime config identity. */
const providerCache = new Map<string, AiProvider>();

function providerKey(cfg: AiRuntimeConfig): string {
  return `${cfg.provider}::${cfg.baseURL}`;
}

/** Returns the provider for the active runtime configuration. */
export function getProvider(): AiProvider {
  const cfg = getAiRuntime();
  const key = providerKey(cfg);
  const cached = providerCache.get(key);
  if (cached) return cached;

  let provider: AiProvider;
  switch (cfg.provider) {
    case 'openai':
      provider = createOpenAIProvider(cfg.baseURL, cfg.apiKey);
      break;
    case 'mock':
      provider = createMockProvider();
      break;
    case 'ollama':
    default:
      provider = createOllamaProvider(cfg.baseURL, cfg.apiKey);
  }
  providerCache.set(key, provider);
  return provider;
}

/** Clears the provider cache (tests / hot reloads). */
export function clearProviderCache(): void {
  providerCache.clear();
}

// Re-exported for consumers that need the normalized types.
export type { AiToolCall, ToolChatResult };
