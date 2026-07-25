/**
 * @astrajs/server — RPC Runtime
 *
 * Client-side fetch wrapper and server-side handler registry for
 * the `server$()` macro. The compiler transforms `server$()` calls
 * into calls to `createRPCClient()`, which returns a type-safe
 * fetch-based function.
 *
 * ## How It Works
 *
 * ### Client Side
 * ```ts
 * // Transformed from: const getData = server$(async (id: string) => db.find(id));
 * import { createRPCClient } from '@astrajs/server';
 * const getData = createRPCClient('/api/astra/getData');
 * // → getData('42') → fetch('/api/astra/getData', { method:'POST', body:'["42"]' })
 * ```
 *
 * ### Server Side
 * ```ts
 * import { registerRPCHandler } from '@astrajs/server';
 * registerRPCHandler('getData', async (args) => {
 *   const [id] = args;
 *   return db.find(id);
 * });
 * ```
 *
 * ### Pre-Build (Constant Folding)
 * Functions with `{ type: 'pre-build' }` are executed at build time.
 * The client receives the inlined result — zero JS shipped.
 */

// ─── Client-Side RPC ─────────────────────────────────────────────────────────

/**
 * Creates a client-side RPC function that calls a server endpoint via fetch.
 *
 * The compiler replaces `server$(fn)` with a call to this function,
 * passing the generated endpoint path.
 *
 * @typeParam Args — Tuple of argument types.
 * @typeParam Return — The expected return type.
 * @param endpoint — The API endpoint path (e.g., `/api/astra/getData`).
 * @param options — Optional fetch configuration overrides.
 * @returns A function with the same signature as the original server function.
 *
 * @example
 * ```ts
 * const getProducts = createRPCClient<string[], Product[]>(
 *   '/api/astra/getProducts'
 * );
 * const hats = await getProducts(['hats']);
 * ```
 */
export function createRPCClient<Args extends unknown[], Return>(
  endpoint: string,
  options?: {
    /** HTTP method (default: POST). */
    method?: 'GET' | 'POST';
    /** Custom headers to include. */
    headers?: Record<string, string>;
    /** AbortSignal for cancellation. */
    signal?: AbortSignal;
  }
): (...args: Args) => Promise<Return> {
  const method = options?.method ?? 'POST';
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Astra-RPC': '1',
    ...options?.headers,
  };

  return async (...args: Args): Promise<Return> => {
    let url = endpoint;
    const fetchOptions: RequestInit = {
      method,
      headers: baseHeaders,
      signal: options?.signal,
    };

    if (method === 'GET') {
      // Encode args as query parameters
      const params = new URLSearchParams();
      args.forEach((arg, i) => {
        params.set(`_${i}`, JSON.stringify(arg));
      });
      url += `?${params.toString()}`;
    } else {
      // POST: send args as JSON body array
      fetchOptions.body = JSON.stringify(args);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(
        `[AstraJS RPC] ${endpoint} returned ${response.status}: ${errorText}`
      );
    }

    return response.json() as Promise<Return>;
  };
}

// ─── Server-Side Handler Registry ────────────────────────────────────────────

/**
 * A registered RPC handler on the server.
 */
interface RegisteredHandler {
  /** The handler function. */
  fn: (...args: unknown[]) => Promise<unknown>;
  /** Cache tags for invalidation. */
  tags: string[];
  /** Auto-sync enabled flag. */
  autoSync: boolean;
  /** Max age in seconds for ISR. */
  maxAge: number;
}

/**
 * Global registry of RPC handlers (populated at build/startup time).
 */
const handlerRegistry = new Map<string, RegisteredHandler>();

/**
 * Registers a server-side handler for a `server$()` function.
 *
 * Called by the generated server endpoint code. The handler function
 * receives the deserialized arguments array and returns the result.
 *
 * @param id — The unique handler identifier (matches the endpoint path).
 * @param fn — The async handler function.
 * @param options — Cache tags, autoSync, and ISR configuration.
 *
 * @example
 * ```ts
 * registerRPCHandler('getProducts', async (args: [string]) => {
 *   const [category] = args;
 *   return db.products.findMany({ where: { category } });
 * }, { tags: ['products'], maxAge: 3600 });
 * ```
 */
export function registerRPCHandler(
  id: string,
  fn: (...args: unknown[]) => Promise<unknown>,
  options: {
    tags?: string[];
    autoSync?: boolean;
    maxAge?: number;
  } = {}
): void {
  handlerRegistry.set(id, {
    fn,
    tags: options.tags ?? [],
    autoSync: options.autoSync ?? false,
    maxAge: options.maxAge ?? 0,
  });
}

/**
 * Looks up a registered handler by ID.
 */
export function getRPCHandler(id: string): RegisteredHandler | undefined {
  return handlerRegistry.get(id);
}

/**
 * Returns all registered handler IDs (for manifest generation).
 */
export function getAllHandlerIds(): string[] {
  return Array.from(handlerRegistry.keys());
}

/**
 * Returns the full handler registry (for serialization).
 */
export function getHandlerRegistry(): ReadonlyMap<string, RegisteredHandler> {
  return handlerRegistry;
}

// ─── Server Request Handler (for Node.js/Edge runtimes) ──────────────────────

/**
 * Handles an incoming RPC request on the server.
 *
 * This is the function that should be wired into your server framework
 * (Express, Fastify, Vite dev server, Cloudflare Workers, etc.).
 *
 * @param request — The incoming HTTP Request.
 * @param id — The handler ID (extracted from the URL path).
 * @returns A Response with the JSON result or an error.
 *
 * @example
 * ```ts
 * // Express
 * app.post('/api/astra/:id', async (req, res) => {
 *   const response = await handleRPCRequest(
 *     new Request(`http://host/api/astra/${req.params.id}`, {
 *       method: 'POST',
 *       body: JSON.stringify(req.body),
 *     }),
 *     req.params.id
 *   );
 *   res.status(response.status).json(await response.json());
 * });
 * ```
 */
export async function handleRPCRequest(
  request: Request,
  id: string
): Promise<Response> {
  const handler = handlerRegistry.get(id);

  if (!handler) {
    return new Response(
      JSON.stringify({ error: `Unknown RPC handler: ${id}` }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    let args: unknown[];

    if (request.method === 'GET') {
      // Parse args from query parameters
      const url = new URL(request.url);
      args = [];
      for (let i = 0; ; i++) {
        const val = url.searchParams.get(`_${i}`);
        if (val === null) break;
        args.push(JSON.parse(val));
      }
    } else {
      // Parse args from JSON body
      const body = await request.text();
      args = JSON.parse(body);
      if (!Array.isArray(args)) {
        args = [args];
      }
    }

    const result = await handler.fn(...args);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // ETag for autoSync
    if (handler.autoSync) {
      const etag = `"${hashJSON(result)}"`;
      headers['ETag'] = etag;
      headers['Cache-Control'] = 'no-cache';

      // Check If-None-Match for 304
      if (request.headers.get('If-None-Match') === etag) {
        return new Response(null, { status: 304, headers });
      }
    }

    // ISR: set Cache-Control based on maxAge
    if (handler.maxAge > 0) {
      headers['Cache-Control'] = `public, max-age=${handler.maxAge}, stale-while-revalidate=${handler.maxAge * 2}`;
      headers['CDN-Cache-Control'] = `max-age=${handler.maxAge}`;
      // Tag for cache invalidation
      if (handler.tags.length > 0) {
        headers['Cache-Tag'] = handler.tags.join(',');
      }
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal RPC error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ─── Cache Invalidation ──────────────────────────────────────────────────────

/**
 * Set of active server-sent event connections (for autoSync push).
 */
const autoSyncClients = new Set<(tag: string) => void>();

/**
 * Registers a callback to be notified when a cache tag is invalidated.
 * Used by the autoSync system to push updates to connected clients.
 */
export function onCacheInvalidate(callback: (tag: string) => void): () => void {
  autoSyncClients.add(callback);
  return () => autoSyncClients.delete(callback);
}

/**
 * Invalidates the static cache for a given tag and notifies all
 * connected autoSync clients to re-fetch affected data.
 *
 * @param tag — The cache tag to invalidate (must match tags used in `server$`).
 *
 * @example
 * ```ts
 * const updateProduct = server$(async (id: string, data: ProductData) => {
 *   await db.products.update({ where: { id }, data });
 *   revalidate('products');
 *   return { success: true };
 * });
 * ```
 */
export function revalidate(tag: string): void {
  // Notify all autoSync clients
  for (const client of autoSyncClients) {
    client(tag);
  }

  // In production, this would also purge CDN cache via API
  // (Cloudflare, Vercel, etc.)
  console.log(`[AstraJS] Cache invalidated: ${tag}`);
}

// ─── Utilities ───────────────────────────────────────────────────────────────

/**
 * Simple hash function for generating ETags from JSON.
 */
function hashJSON(value: unknown): string {
  const str = JSON.stringify(value);
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
