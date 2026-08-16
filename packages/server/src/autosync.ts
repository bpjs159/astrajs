/**
 * @bpjs159/server — AutoSync (ETag Polling + DOM Mutation)
 *
 * AutoSync keeps client-side data in sync with the server without
 * full page reloads. It works by:
 *
 * 1. The server includes an ETag header with each RPC response.
 * 2. The client stores the ETag and polls the endpoint with
 *    `If-None-Match`.
 * 3. If data changed (new ETag), the client fetches the fresh data
 *    and mutates the store — which triggers reactive DOM updates.
 * 4. If data is unchanged (304 Not Modified), no update occurs.
 *
 * Combined with ISR `maxAge`, this enables near-real-time updates
 * with minimal bandwidth.
 */

import { onCacheInvalidate } from './rpc.js';

// ─── AutoSync Client ─────────────────────────────────────────────────────────

interface AutoSyncSubscription {
  /** The endpoint to poll. */
  endpoint: string;
  /** The cached ETag from the last response. */
  etag: string | null;
  /** Called when fresh data arrives. */
  onUpdate: (data: unknown) => void;
  /** Polling interval in ms. */
  interval: number;
  /** Timer handle. */
  timer: ReturnType<typeof setInterval> | null;
  /** Whether the subscription is active. */
  active: boolean;
}

const subscriptions = new Map<string, AutoSyncSubscription>();

/**
 * Subscribes to automatic data synchronization for a given endpoint.
 *
 * When the server data changes (detected via ETag), the `onUpdate`
 * callback is invoked with the fresh data — which should update the
 * corresponding reactive store.
 *
 * @param endpoint — The RPC endpoint to poll.
 * @param onUpdate — Callback receiving fresh data on change.
 * @param options — Polling configuration.
 * @returns An unsubscribe function.
 *
 * @example
 * ```ts
 * import { store } from '@bpjs159/core';
 * import { autoSync } from '@bpjs159/server';
 *
 * const products = store<Product[]>([]);
 *
 * const unsubscribe = autoSync('/api/astra/getProducts', (fresh) => {
 *   Object.assign(products, fresh);
 * }, { interval: 5000 });
 *
 * // Later: unsubscribe();
 * ```
 */
export function autoSync(
  endpoint: string,
  onUpdate: (data: unknown) => void,
  options: {
    /** Polling interval in ms (default: 10000). */
    interval?: number;
    /** Initial ETag (recovered from SSR). */
    initialETag?: string;
  } = {}
): () => void {
  const interval = options.interval ?? 10000;
  const id = endpoint;

  // Clean up existing subscription for this endpoint
  const existing = subscriptions.get(id);
  if (existing && existing.timer !== null) {
    clearInterval(existing.timer);
  }

  const sub: AutoSyncSubscription = {
    endpoint,
    etag: options.initialETag ?? null,
    onUpdate,
    interval,
    timer: null,
    active: true,
  };

  subscriptions.set(id, sub);

  // Initial fetch
  void poll(sub);

  // Periodic polling
  sub.timer = setInterval(() => {
    if (sub.active) {
      void poll(sub);
    }
  }, interval);

  return () => {
    sub.active = false;
    if (sub.timer !== null) {
      clearInterval(sub.timer);
      sub.timer = null;
    }
    subscriptions.delete(id);
  };
}

/**
 * Performs a single poll cycle for an autoSync subscription.
 */
async function poll(sub: AutoSyncSubscription): Promise<void> {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (sub.etag) {
      headers['If-None-Match'] = sub.etag;
    }

    const response = await fetch(sub.endpoint, { headers });

    if (response.status === 304) {
      // Data unchanged — nothing to do
      return;
    }

    if (!response.ok) {
      console.warn(
        `[AstraJS AutoSync] ${sub.endpoint} returned ${response.status}`
      );
      return;
    }

    const newETag = response.headers.get('ETag');
    if (newETag) {
      sub.etag = newETag;
    }

    const data = await response.json();
    sub.onUpdate(data);
  } catch (err) {
    // Network errors are expected during development — don't spam console
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      return;
    }
    console.warn('[AstraJS AutoSync] Poll failed:', err);
  }
}

// ─── Server-Sent Events (Push-Based AutoSync) ────────────────────────────────

/**
 * Starts a push-based autoSync connection using Server-Sent Events.
 *
 * Unlike polling, SSE pushes updates to the client immediately when
 * `revalidate(tag)` is called on the server.
 *
 * @param tags — Cache tags to watch for invalidation.
 * @param onInvalidate — Called when a watched tag is invalidated.
 * @returns An unsubscribe function.
 */
export function watchTags(
  tags: string[],
  onInvalidate: (tag: string) => void
): () => void {
  const unsubscribers: Array<() => void> = [];

  for (const tag of tags) {
    const unsub = onCacheInvalidate((invalidatedTag) => {
      if (invalidatedTag === tag) {
        onInvalidate(tag);
      }
    });
    unsubscribers.push(unsub);
  }

  return () => {
    for (const unsub of unsubscribers) {
      unsub();
    }
  };
}

/**
 * Stops all active autoSync subscriptions.
 */
export function stopAllAutoSync(): void {
  for (const [, sub] of subscriptions) {
    sub.active = false;
    if (sub.timer !== null) {
      clearInterval(sub.timer);
      sub.timer = null;
    }
  }
  subscriptions.clear();
}
