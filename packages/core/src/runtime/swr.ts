/**
 * @bpjs159/core — SWR (Stale-While-Revalidate)
 *
 * `swr(fetcher)` wraps any async function with automatic caching and
 * reactive state management. One import, zero boilerplate.
 *
 * ## What It Does
 *
 * 1. **Auto cache key** — hashed from the function body (FNV-1a).
 *    No manual key naming needed.
 * 2. **Instant stale data** — if localStorage has cached data, it's
 *    shown immediately while fresh data loads in the background.
 * 3. **Reactive store** — returned object is a Proxy. Mutating `.data`,
 *    `.loading`, `.error`, `.stale` auto-updates bound DOM nodes.
 * 4. **No `mounted()` needed** — works during component body execution.
 *    Returns immediately; async resolution updates the proxy later.
 *
 * ## Usage
 *
 * ```ts
 * import { swr } from '@bpjs159/core';
 *
 * const users = swr(() => fetch('/api/users').then(r => r.json()));
 *
 * <div>
 *   {users.loading && <Spinner />}
 *   {users.error && <Error msg={users.error} />}
 *   {users.data?.map(u => <li>{u.name}</li>)}
 * </div>
 * ```
 */

import { store } from './store.js';

// ─── Simple FNV-1a Hash ─────────────────────────────────────────────────────

function hashString(s: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    hash ^= s.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

// ─── Public Types ────────────────────────────────────────────────────────────

export interface SWRState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | undefined;
  stale: boolean;
  refetch: () => Promise<void>;
}

export interface SWROptions {
  /** Explicit cache key. Auto-generated from fetcher source if omitted. */
  key?: string;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function swr<T>(
  fetcher: () => Promise<T>,
  options?: SWROptions
): SWRState<T> {
  const CACHE_PREFIX = '__astra_swr_';
  const cacheKey = CACHE_PREFIX + (options?.key ?? hashString(fetcher.toString()));

  let running = false;

  function readCache(): T | null {
    try {
      const raw = localStorage.getItem(cacheKey);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function writeCache(data: T): void {
    try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch { /* quota */ }
  }

  const state = store({
    data: undefined as T | undefined,
    loading: true,
    error: undefined as string | undefined,
    stale: false,

    async refetch(this: SWRState<T>) {
      if (running) return;
      running = true;

      const cached = readCache();
      if (cached) {
        this.data = cached;
        this.loading = false;
        this.stale = true;
      } else {
        this.loading = true;
        this.stale = false;
      }

      this.error = undefined;

      try {
        const fresh = await fetcher();
        this.data = fresh;
        this.stale = false;
        writeCache(fresh);
      } catch (e) {
        this.error = (e as Error).message ?? 'Unknown error';
      } finally {
        this.loading = false;
        running = false;
      }
    },
  }) as unknown as SWRState<T>;

  // ── Show cached data IMMEDIATELY (synchronous) ───────────────────────
  const cached = readCache();
  if (cached) {
    state.data = cached;
    state.loading = false;
    state.stale = true;
  }

  // ── Kick off background refresh (deferred so render isn't blocked) ──
  queueMicrotask(() => { state.refetch(); });

  return state;
}
