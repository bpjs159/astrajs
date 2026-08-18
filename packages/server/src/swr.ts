/**
 * astrajs.dev/server — Stale-While-Revalidate (SWR)
 *
 * Enhances reactive stores with SWR semantics. When a store is
 * initialized with a Promise (e.g., from a `server()` call), SWR:
 *
 * 1. Returns stale (cached) data immediately if available.
 * 2. Revalidates in the background.
 * 3. Updates the store when fresh data arrives.
 *
 * This is the client-side counterpart to server-side ISR `maxAge`.
 */

import type { StoreOptions } from 'astrajs.dev/core';

/**
 * Extended store options for SWR.
 */
export interface SWROptions extends StoreOptions {
  /**
   * Whether to revalidate on focus (when the user returns to the tab).
   * @default true
   */
  revalidateOnFocus?: boolean;

  /**
   * Interval in ms for automatic background revalidation.
   * @default 0 (disabled)
   */
  refreshInterval?: number;

  /**
   * Whether to revalidate when the store is first accessed after
   * being stale for longer than `dedupingInterval`.
   * @default true
   */
  revalidateIfStale?: boolean;

  /**
   * Deduping interval in ms — prevents multiple simultaneous
   * revalidations for the same key.
   * @default 2000
   */
  dedupingInterval?: number;
}

// ─── SWR Cache ───────────────────────────────────────────────────────────────

interface SWRCacheEntry<T> {
  /** The last known good data. */
  data: T | undefined;
  /** When the data was last fetched (ms timestamp). */
  fetchedAt: number;
  /** The promise of the in-flight revalidation, if any. */
  pendingPromise: Promise<T> | null;
  /** Whether the data is currently being revalidated. */
  isValidating: boolean;
  /** The fetcher function. */
  fetcher: () => Promise<T>;
  /** SWR options. */
  options: SWROptions;
}

/**
 * Global SWR cache, keyed by `store.key` or auto-generated.
 */
const swrCache = new Map<string, SWRCacheEntry<unknown>>();

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Wraps an async fetcher with SWR semantics.
 *
 * Returns the cached data immediately (if available) and triggers
 * a background revalidation. Subsequent calls within the deduping
 * interval share the same in-flight promise.
 *
 * @typeParam T — The data type.
 * @param key — Unique cache key (should match the store's `key` option).
 * @param fetcher — The async function that fetches fresh data.
 * @param options — SWR configuration.
 * @returns The current data (stale or fresh).
 *
 * @example
 * ```ts
 * import { store } from 'astrajs.dev/core';
 * import { swr } from 'astrajs.dev/server';
 *
 * const products = store(
 *   swr('products:hats', () => getProducts('hats'), {
 *     refreshInterval: 30000,
 *   }),
 *   { key: 'products:hats', swr: true }
 * );
 * ```
 */
export async function swr<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: SWROptions = {}
): Promise<T> {
  const now = Date.now();
  const dedupingInterval = options.dedupingInterval ?? 2000;

  let entry = swrCache.get(key) as SWRCacheEntry<T> | undefined;

  if (!entry) {
    entry = {
      data: undefined,
      fetchedAt: 0,
      pendingPromise: null,
      isValidating: false,
      fetcher,
      options,
    };
    swrCache.set(key, entry as SWRCacheEntry<unknown>);
  }

  // If we have cached data and it's within deduping interval, return it
  if (
    entry.data !== undefined &&
    entry.pendingPromise &&
    now - entry.fetchedAt < dedupingInterval
  ) {
    return entry.data;
  }

  // If no data yet, fetch and return
  if (entry.data === undefined) {
    entry.isValidating = true;
    entry.pendingPromise = fetcher();
    try {
      const fresh = await entry.pendingPromise;
      entry.data = fresh;
      entry.fetchedAt = Date.now();
      return fresh;
    } finally {
      entry.isValidating = false;
      entry.pendingPromise = null;
    }
  }

  // Background revalidation: return stale, fetch fresh
  if (!entry.isValidating && options.revalidateIfStale !== false) {
    entry.isValidating = true;
    entry.pendingPromise = fetcher();
    entry.pendingPromise
      .then((fresh) => {
        entry!.data = fresh;
        entry!.fetchedAt = Date.now();
      })
      .catch((err) => {
        console.warn(`[AstraJS SWR] Revalidation failed for "${key}":`, err);
      })
      .finally(() => {
        entry!.isValidating = false;
        entry!.pendingPromise = null;
      });
  }

  return entry.data!;
}

/**
 * Manually triggers a revalidation for a given cache key.
 *
 * @param key — The cache key to revalidate.
 * @returns A promise that resolves with the fresh data.
 */
export async function mutate<T>(key: string): Promise<T | undefined> {
  const entry = swrCache.get(key) as SWRCacheEntry<T> | undefined;
  if (!entry) return undefined;

  entry.isValidating = true;
  entry.pendingPromise = entry.fetcher();

  try {
    const fresh = await entry.pendingPromise;
    entry.data = fresh;
    entry.fetchedAt = Date.now();
    return fresh;
  } finally {
    entry.isValidating = false;
    entry.pendingPromise = null;
  }
}

/**
 * Clears a specific SWR cache entry.
 */
export function clearSWRCache(key?: string): void {
  if (key) {
    swrCache.delete(key);
  } else {
    swrCache.clear();
  }
}

// ─── Browser Integration ─────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  // Revalidate on focus
  window.addEventListener('focus', () => {
    for (const [, entry] of swrCache) {
      if (entry.options.revalidateOnFocus !== false && !entry.isValidating) {
        const swrEntry = entry as SWRCacheEntry<unknown>;
        swrEntry.isValidating = true;
        swrEntry.pendingPromise = swrEntry.fetcher();
        swrEntry.pendingPromise
          .then((fresh) => {
            swrEntry.data = fresh;
            swrEntry.fetchedAt = Date.now();
          })
          .catch(() => { /* silent */ })
          .finally(() => {
            swrEntry.isValidating = false;
            swrEntry.pendingPromise = null;
          });
      }
    }
  });

  // Revalidate on online (after being offline)
  window.addEventListener('online', () => {
    for (const [, entry] of swrCache) {
      if (!entry.isValidating) {
        const swrEntry = entry as SWRCacheEntry<unknown>;
        swrEntry.isValidating = true;
        swrEntry.pendingPromise = swrEntry.fetcher();
        swrEntry.pendingPromise
          .then((fresh) => {
            swrEntry.data = fresh;
            swrEntry.fetchedAt = Date.now();
          })
          .catch(() => { /* silent */ })
          .finally(() => {
            swrEntry.isValidating = false;
            swrEntry.pendingPromise = null;
          });
      }
    }
  });
}
