/**
 * astrajs.dev/adapters — platform-neutral request handler
 *
 * `createAstraHandler()` produces a `(request: Request) => Promise<Response>`
 * function that:
 *  1. Routes `/api/astra/:id` (configurable prefix) to `handleRPCRequest()`
 *     from `astrajs.dev/server` — the same dispatch the Vite dev middleware uses.
 *  2. Falls back to an optional `render` hook (SSR-on-demand) and finally 404.
 *
 * This module is **edge-safe** (Web APIs only): Node, Vercel and Cloudflare
 * adapters are all thin shells around this core.
 */
import { handleRPCRequest } from 'astrajs.dev/server';

/**
 * Configuration for the platform-neutral Astra handler.
 */
export interface AstraHandlerOptions {
  /**
   * API route prefix for RPC endpoints (must match the compiler's `apiPrefix`).
   * @default '/api/astra'
   */
  apiPrefix?: string;
  /**
   * Optional SSR hook: receives the request and parsed URL for non-API paths.
   * Return a `Response` to serve it, or `null` to fall through to 404.
   * This is the integration point for `renderToString` (on-demand SSR/ISR).
   */
  render?: (request: Request, url: URL) => Promise<Response | null>;
}

/**
 * Creates the platform-neutral Astra request handler (RPC + optional SSR).
 *
 * All adapters (Node, Vercel, Cloudflare) build on this — the platform
 * layer only has to translate between its request/response types and the
 * Web standard `Request`/`Response`.
 */
export function createAstraHandler(
  options: AstraHandlerOptions = {}
): (request: Request) => Promise<Response> {
  const apiPrefix = options.apiPrefix ?? '/api/astra';

  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);

    // ── RPC dispatch ────────────────────────────────────────────────────
    if (url.pathname === apiPrefix || url.pathname.startsWith(`${apiPrefix}/`)) {
      const id = url.pathname
        .slice(apiPrefix.length + 1)
        .replace(/\/+$/, '');
      return handleRPCRequest(request, id);
    }

    // ── SSR hook (on-demand rendering) ──────────────────────────────────
    if (options.render) {
      const rendered = await options.render(request, url);
      if (rendered) return rendered;
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  };
}
