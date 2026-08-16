/**
 * @bpjs159/ai — Shared types
 *
 * All runtime types are edge-safe: plain data structures and Web APIs only.
 */

/** Supported provider names. */
export type AiProviderName = 'ollama' | 'openai' | 'mock';

/** A normalized chat message (provider-agnostic). */
export interface AiMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  /** Tool calls requested by the assistant (populated on assistant messages). */
  tool_calls?: AiToolCall[];
  /** Only for `role: 'tool'` — correlates the result to a tool call. */
  tool_call_id?: string;
}

/** A normalized tool call requested by the model. */
export interface AiToolCall {
  /** Provider correlation id (may be absent). */
  id?: string;
  /** Tool/function name to invoke. */
  name: string;
  /** Arguments object (already JSON-parsed). */
  arguments: Record<string, unknown>;
}

/** Options that tune a single completion. */
export interface CompleteOptions {
  /** Model override for this call. Defaults to the runtime model. */
  model?: string;
  /** Sampling temperature (0–2). */
  temperature?: number;
  /** Maximum tokens to generate. */
  maxTokens?: number;
  /** System prompt prepended to the conversation. */
  system?: string;
}

/** Resolved runtime configuration (provider + endpoint + credentials). */
export interface AiRuntimeConfig {
  provider: AiProviderName;
  baseURL: string;
  /** API key / credentials. For Ollama, `user:pass` enables Basic Auth. */
  apiKey?: string;
  model: string;
  /** Embedding model for RAG. */
  embedModel: string;
}

/**
 * JSON Schema declaration for a tool exposed to the model.
 * (Phase 5 — the compiler can later derive these from TypeScript types.)
 */
export interface ToolSchema {
  name: string;
  description: string;
  /** JSON Schema object describing the arguments. */
  parameters: Record<string, unknown>;
}

/** A callable tool: schema for the model + implementation for the server. */
export interface AiTool {
  schema: ToolSchema;
  fn: (...args: unknown[]) => unknown | Promise<unknown>;
}

/** Result of a tool-aware model call. */
export interface ToolChatResult {
  /** Final text when the model answered directly. */
  text: string;
  /** Tool calls the model requested (empty when it answered directly). */
  toolCalls: AiToolCall[];
}

/**
 * Configuration for the `ai()` / `aiStream()` compile-time macros.
 * Mirrors `ServerConfig` so the compiler can share parsing patterns.
 */
export interface AiCallConfig {
  /** `'pre-build'` executes at build time and folds the result into the bundle. */
  type?: 'pre-build' | 'dynamic';
  /** Model for this endpoint (overrides the runtime default). */
  model?: string;
  /** Sampling temperature. */
  temperature?: number;
  /** Maximum tokens per response. */
  maxTokens?: number;
  /** System prompt. */
  system?: string;
  /** Cache tags for ISR invalidation. */
  tags?: string[];
  /** ISR TTL in seconds (reuses the server package's cache headers). */
  maxAge?: number;
}
