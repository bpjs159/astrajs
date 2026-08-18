/**
 * astrajs.dev/ai — Runtime primitives + `ai()` / `aiStream()` macros
 *
 * `ai(cfg, fn)` / `aiStream(cfg, fn)` are COMPILE-TIME macros (processed by
 * astrajs.dev/compiler exactly like `server()`):
 *
 *  - Client bundle: replaced by a typed fetch wrapper to `/api/astra/:id`
 *    (the model is called on the server — API keys never reach the browser).
 *  - SSR graph: the macro stays intact and returns the real function; the
 *    compiler appends an `rpcHandler` registration that wraps it with
 *    `complete()` / `stream()`.
 *  - `{ type: 'pre-build' }`: executed at BUILD time and folded into the
 *    bundle as a JSON constant (Phase 3).
 *
 * Runtime fallback (no compiler): returns the function itself, so the code
 * still evaluates in tests and non-Vite environments.
 */
import { getAiRuntime } from './config.js';
import { getProvider } from './provider.js';
import type { AiCallConfig, CompleteOptions } from './types.js';

/**
 * One-shot completion: sends `prompt` to the configured model and returns
 * the full text. Used by the compiler-generated server registrations.
 */
export async function complete(
  prompt: string,
  options: CompleteOptions = {}
): Promise<string> {
  const cfg = getAiRuntime();
  const messages = [];
  if (options.system) messages.push({ role: 'system' as const, content: options.system });
  messages.push({ role: 'user' as const, content: prompt });
  return getProvider().chat(options.model ?? cfg.model, messages, options);
}

/**
 * Token stream: async generator of text chunks. Used by the compiler-generated
 * streaming server registrations.
 */
export async function* stream(
  prompt: string,
  options: CompleteOptions = {}
): AsyncGenerator<string> {
  const cfg = getAiRuntime();
  const messages = [];
  if (options.system) messages.push({ role: 'system' as const, content: options.system });
  messages.push({ role: 'user' as const, content: prompt });
  yield* getProvider().stream(options.model ?? cfg.model, messages, options);
}

/**
 * Build-time execution for `ai({ type: 'pre-build' }, fn)` (Phase 3).
 * Runs the prompt function and completes it via the configured provider.
 */
export async function executePrompt(
  prompt: string,
  options: CompleteOptions = {}
): Promise<string> {
  return complete(prompt, options);
}

// ─── ai() Macro ─────────────────────────────────────────────────────────────

/**
 * **Compile-time AI macro.** See the module docs for the full contract.
 *
 * @example
 * ```ts
 * const summarize = ai(
 *   { model: 'qwen2.5-coder:7b', maxAge: 3600, tags: ['ai'] },
 *   async (text: string) => `Summarize this in one sentence: ${text}`
 * );
 * const result = await summarize(longText); // { text: string }
 * ```
 */
export function ai<Args extends unknown[], Return extends string>(
  config: AiCallConfig,
  fn: (...args: Args) => Promise<Return> | Return
): (...args: Args) => Promise<{ text: string }>;

export function ai<Args extends unknown[], Return extends string>(
  fn: (...args: Args) => Promise<Return> | Return
): (...args: Args) => Promise<{ text: string }>;

export function ai<Args extends unknown[]>(
  configOrFn: AiCallConfig | ((...args: Args) => unknown),
  fn?: (...args: Args) => unknown
): (...args: Args) => Promise<{ text: string }> {
  if (typeof configOrFn === 'function') {
    return configOrFn as (...args: Args) => Promise<{ text: string }>;
  }
  if (fn) {
    return fn as (...args: Args) => Promise<{ text: string }>;
  }
  throw new Error(
    '[AstraJS] ai() macro was not transformed by the compiler. ' +
      'Make sure the astrajs.dev/compiler vite plugin is active.'
  );
}

// ─── aiStream() Macro ───────────────────────────────────────────────────────

/**
 * **Compile-time streaming AI macro.**
 *
 * The generated client wrapper reads the response as a token stream:
 *
 * ```ts
 * const chat = aiStream(
 *   { model: 'qwen2.5-coder:7b' },
 *   async (q: string) => q
 * );
 *
 * // Client — tokens arrive progressively; `onToken` is client-only.
 * const full = await chat('hola', (chunk) => { answer += chunk; });
 * ```
 */
export function aiStream<Args extends unknown[], Return extends string>(
  config: AiCallConfig,
  fn: (...args: Args) => Promise<Return> | Return
): (...args: [...Args, onToken?: (chunk: string) => void]) => Promise<string>;

export function aiStream<Args extends unknown[], Return extends string>(
  fn: (...args: Args) => Promise<Return> | Return
): (...args: [...Args, onToken?: (chunk: string) => void]) => Promise<string>;

export function aiStream<Args extends unknown[]>(
  configOrFn: AiCallConfig | ((...args: Args) => unknown),
  fn?: (...args: Args) => unknown
): (...args: [...Args, onToken?: (chunk: string) => void]) => Promise<string> {
  if (typeof configOrFn === 'function') {
    return configOrFn as unknown as (...args: [...Args, onToken?: (chunk: string) => void]) => Promise<string>;
  }
  if (fn) {
    return fn as unknown as (...args: [...Args, onToken?: (chunk: string) => void]) => Promise<string>;
  }
  throw new Error(
    '[AstraJS] aiStream() macro was not transformed by the compiler. ' +
      'Make sure the astrajs.dev/compiler vite plugin is active.'
  );
}
