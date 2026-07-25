/**
 * @astrajs/server — Public API Entry Point
 *
 * Server RPC, SWR, cache invalidation, and autoSync primitives.
 * The `server$` macro is processed at compile time by the Vite AST plugin.
 *
 * @example
 * ```ts
 * import { server$, revalidate } from '@astrajs/server';
 *
 * const getProducts = server$(
 *   { type: 'pre-build', tags: ['products'], maxAge: 3600 },
 *   async (category: string) => db.products.findMany({ where: { category } })
 * );
 * ```
 */

// ─── Public Types ────────────────────────────────────────────────────────────

/**
 * Configuration for the `server$()` RPC macro.
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
}

// ─── Runtime Implementations ─────────────────────────────────────────────────

// RPC: Client fetch wrapper, server handler registry, request handling
export {
  createRPCClient,
  registerRPCHandler,
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
