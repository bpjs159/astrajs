/**
 * @astrajs/ai — Runtime configuration
 *
 * The provider, endpoint and credentials are resolved ONCE at startup from
 * environment variables — never compiled into client bundles (the `ai()`
 * macro compiles to a fetch wrapper, exactly like `server()`).
 *
 *   ASTRA_AI_PROVIDER  ollama | openai | mock      (default: ollama)
 *   ASTRA_AI_BASE_URL  provider API base URL
 *   ASTRA_AI_API_KEY   API key (OpenAI) or user:pass (Ollama Basic Auth)
 *   ASTRA_AI_MODEL     model name                  (default: qwen2.5-coder:7b)
 *   ASTRA_AI_EMBED_MODEL embedding model for RAG
 *
 * `configureAi()` overrides env resolution — the CLI uses it to inject the
 * `ai` section of `astra.config.json` into generated server entries.
 */
import type { AiProviderName, AiRuntimeConfig } from './types.js';

let overrides: Partial<AiRuntimeConfig> | null = null;

/** Resolves the active runtime configuration (env + explicit overrides). */
export function getAiRuntime(): AiRuntimeConfig {
  const provider: AiProviderName =
    overrides?.provider ??
    ((process.env.ASTRA_AI_PROVIDER as AiProviderName) || 'ollama');

  const baseURL =
    overrides?.baseURL ??
    process.env.ASTRA_AI_BASE_URL ??
    (provider === 'ollama'
      ? 'http://127.0.0.1:11434'
      : provider === 'openai'
        ? 'https://api.openai.com/v1'
        : 'mock://');

  const apiKey =
    overrides?.apiKey ??
    process.env.ASTRA_AI_API_KEY ??
    (provider === 'openai' ? process.env.OPENAI_API_KEY : undefined);

  const model =
    overrides?.model ??
    process.env.ASTRA_AI_MODEL ??
    (provider === 'ollama' ? 'qwen2.5-coder:7b' : provider === 'openai' ? 'gpt-4o-mini' : 'mock');

  const embedModel =
    overrides?.embedModel ??
    process.env.ASTRA_AI_EMBED_MODEL ??
    (provider === 'ollama' ? 'nomic-embed-text' : 'text-embedding-3-small');

  return { provider, baseURL, apiKey, model, embedModel };
}

/**
 * Overrides runtime configuration (partial). Used by generated server entries
 * (`astra build` injects the `ai` section of `astra.config.json`) and tests.
 */
export function configureAi(config: Partial<AiRuntimeConfig>): void {
  overrides = { ...(overrides ?? {}), ...config };
}

/** Clears runtime overrides (tests). */
export function resetAiRuntime(): void {
  overrides = null;
}
