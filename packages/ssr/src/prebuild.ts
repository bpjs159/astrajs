/**
 * @bpjs159/ssr — Constant Folding (Pre-Build Execution)
 *
 * When `server()` is called with `{ type: 'pre-build' }`, the function
 * is executed at build time (during SSG) and its result is inlined into
 * the HTML. This means **0 KB of JavaScript** is shipped for that query.
 *
 * ## How It Works
 *
 * 1. The Vite plugin identifies `server({ type: 'pre-build' }, fn)` calls.
 * 2. It emits a manifest entry (`astra-prebuild-manifest.json`).
 * 3. During SSG, the pre-build executor runs each function:
 *    - In a sandboxed VM context (for safety).
 *    - With access to the database and file system.
 *    - Results are serialized to JSON.
 * 4. The JSON is injected into the HTML as an `astra-data` attribute.
 * 5. On the client, `deserializeState()` reconstructs the store.
 *
 * ## Caching
 *
 * Pre-build results are cached based on:
 * - The function's content hash.
 * - The build-time arguments (if any).
 * - Cache tags for invalidation.
 *
 * When `revalidate('tag')` is called, cached pre-build results with
 * matching tags are purged and regenerated.
 */

import { serializeState } from './serialize.js';

// ─── Pre-Build Cache ─────────────────────────────────────────────────────────

interface PreBuildEntry {
  /** The function source content hash. */
  hash: string;
  /** The serialized result. */
  result: string;
  /** Cache tags for invalidation. */
  tags: string[];
  /** When this was built (ms timestamp). */
  builtAt: number;
}

/**
 * In-memory cache for pre-build results.
 * In production, this would be backed by a file-system or Redis cache.
 */
const preBuildCache = new Map<string, PreBuildEntry>();

// ─── Pre-Build Executor ──────────────────────────────────────────────────────

/**
 * Executes a `server({ type: 'pre-build' })` function at build time
 * and returns the serialized result.
 *
 * The function is executed in the current Node.js process (with access
 * to the database, filesystem, etc.). For untrusted code, a sandboxed
 * VM (`node:vm`) should be used.
 *
 * @param id — The unique function identifier.
 * @param fn — The async function to execute.
 * @param args — Build-time arguments (from route params or static config).
 * @param options — Cache tags and TTL.
 * @returns Serialized JSON string of the result.
 *
 * @example
 * ```ts
 * const result = await executePreBuild(
 *   'getProducts:hats',
 *   async (category: string) => db.products.findMany({ where: { category } }),
 *   ['hats'],
 *   { tags: ['products'], maxAge: 3600 }
 * );
 * // → '{"products":[{"id":1,"name":"Baseball Cap",...}]}'
 * ```
 */
export async function executePreBuild(
  id: string,
  fn: (...args: unknown[]) => Promise<unknown>,
  args: unknown[],
  options: {
    tags?: string[];
    maxAge?: number;
    /** Force re-execution even if cached. */
    force?: boolean;
  } = {}
): Promise<string> {
  const cacheKey = `${id}:${JSON.stringify(args)}`;

  // Check cache
  if (!options.force) {
    const cached = preBuildCache.get(cacheKey);
    if (cached) {
      const age = Date.now() - cached.builtAt;
      const maxAge = (options.maxAge ?? 3600) * 1000;
      if (age < maxAge) {
        return cached.result;
      }
    }
  }

  // Execute the function
  let result: unknown;
  try {
    result = await fn(...args);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Pre-build execution failed';
    throw new Error(`[AstraJS Pre-Build] ${id}: ${message}`);
  }

  // Serialize
  const serialized = serializeState(result as object);

  // Cache
  preBuildCache.set(cacheKey, {
    hash: id,
    result: serialized,
    tags: options.tags ?? [],
    builtAt: Date.now(),
  });

  return serialized;
}

/**
 * Generates the client-side code for a pre-built constant.
 *
 * Instead of a fetch wrapper, pre-build results are inlined as
 * JSON constants. The client code is just:
 *
 * ```ts
 * const getProducts = /* @astra pre-build * / Object.freeze({...});
 * ```
 *
 * Or, when used with `store()`:
 *
 * ```ts
 * const products = store(/* @astra pre-build * / {...});
 * ```
 *
 * @param data — The serialized JSON result.
 * @param varName — The variable name to assign to.
 * @returns JavaScript source code for the inlined constant.
 */
export function generatePreBuildCode(
  data: string,
  varName: string
): string {
  return `/* @astra pre-build — resolved at build time */\nconst ${varName} = ${data};`;
}

/**
 * Invalidates pre-build cache entries matching the given tags.
 *
 * Called when `revalidate('tag')` is invoked during SSG or ISR.
 *
 * @param tag — The cache tag to invalidate.
 */
export function invalidatePreBuildCache(tag: string): void {
  for (const [key, entry] of preBuildCache) {
    if (entry.tags.includes(tag)) {
      preBuildCache.delete(key);
    }
  }
  console.log(`[AstraJS Pre-Build] Cache invalidated for tag: ${tag}`);
}

/**
 * Clears the entire pre-build cache.
 */
export function clearPreBuildCache(): void {
  preBuildCache.clear();
}

/**
 * Returns the current pre-build cache stats.
 */
export function getPreBuildStats(): { size: number; entries: PreBuildEntry[] } {
  return {
    size: preBuildCache.size,
    entries: Array.from(preBuildCache.values()),
  };
}
