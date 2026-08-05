/**
 * @astrajs/server — Public API Entry Point
 *
 * Server RPC, SWR, cache invalidation, and autoSync primitives.
 * The `server` macro is processed at compile time by the Vite AST plugin.
 *
 * @example
 * ```ts
 * import { server, revalidate } from '@astrajs/server';
 *
 * const getProducts = server(
 *   { type: 'pre-build', tags: ['products'], maxAge: 3600 },
 *   async (category: string) => db.products.findMany({ where: { category } })
 * );
 * ```
 */

// ─── Public Types ────────────────────────────────────────────────────────────

/**
 * Configuration for the `server()` RPC macro.
 */
export interface ServerConfig {
  /**
   * Resolution strategy:
   * - `'pre-build'`: Executed at build time, result inlined into AST. Zero JS.
   * - `'dynamic'` (default): Called at runtime via fetch.
   */
  type?: 'pre-build' | 'dynamic';
  /** Cache tags for surgical invalidation (SSG/ISR). */
  tags?: string[];
  /** TTL in seconds before background revalidation (ISR). */
  maxAge?: number;
  /** ETag-based automatic DOM mutation when server data changes. */
  autoSync?: boolean;
  /**
   * Polling interval in ms for `autoSync`, applied automatically by the
   * compiler when this function is called inside `mounted()`. Ignored
   * unless `autoSync: true`. @default 3000
   */
  autoSyncInterval?: number;
}

// ─── Runtime Implementations ─────────────────────────────────────────────────

// RPC: Client fetch wrapper, server handler registry, request handling
export {
  rpcClient,
  rpcHandler,
  getRPCHandler,
  getAllHandlerIds,
  getHandlerRegistry,
  handleRPCRequest,
  revalidate,
  onCacheInvalidate,
} from './rpc.js';

// SWR: Stale-While-Revalidate for reactive stores
export { swr, mutate, clearSWRCache } from './swr.js';
export type { SWROptions } from './swr.js';

// AutoSync: ETag polling + push-based sync
export { autoSync, watchTags, stopAllAutoSync } from './autosync.js';

// ─── server() Macro ────────────────────────────────────────────────────────

/**
 * **Compile-time RPC macro.**
 *
 * At build time, the Vite AST plugin transforms `server(fn)` calls into
 * `rpcClient(endpoint)` + server endpoint registration. The function
 * body is extracted, moved to a server handler, and the client receives
 * a type-safe fetch wrapper.
 *
 * **Runtime fallback:** If the compiler hasn't processed the file (e.g.,
 * during tests or SSR), `server` returns a function that calls the
 * provided implementation directly — effectively acting as an inline async
 * function. This allows the same code to work in all environments.
 *
 * @typeParam Args — Tuple of argument types.
 * @typeParam Return — The expected return type from the server function.
 * @param config — Server configuration (cache tags, maxAge, autoSync).
 * @param fn — The server-side implementation function.
 * @returns A function with the same `(args) => Promise<Return>` signature.
 *
 * @example
 * ```ts
 * const getProducts = server(
 *   { tags: ['products'], maxAge: 3600 },
 *   async (category: string) => {
 *     return db.products.findMany({ where: { category } });
 *   }
 * );
 * const hats = await getProducts('hats');
 * ```
 */
export function server<Args extends unknown[], Return>(
  config: ServerConfig,
  fn: (...args: Args) => Promise<Return>
): (...args: Args) => Promise<Return>;

/**
 * Overload: `server` without config (no cache tags, dynamic mode).
 */
export function server<Args extends unknown[], Return>(
  fn: (...args: Args) => Promise<Return>
): (...args: Args) => Promise<Return>;

// Runtime implementation — acts as a passthrough when the compiler
// hasn't transformed the file (tests, SSR, non-Vite environments).
export function server<Args extends unknown[], Return>(
  configOrFn: ServerConfig | ((...args: Args) => Promise<Return>),
  fn?: (...args: Args) => Promise<Return>
): (...args: Args) => Promise<Return> {
  // If called with just a function (no config), use it directly
  if (typeof configOrFn === 'function') {
    return configOrFn;
  }
  // If called with config + function, return the function
  if (fn) {
    return fn;
  }
  throw new Error(
    '[AstraJS] server() macro was not transformed by the compiler. ' +
    'Make sure @astrajs/core/vite is in your vite.config.ts plugins.'
  );
}
