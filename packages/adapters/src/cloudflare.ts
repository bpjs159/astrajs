/**
 * astrajs.dev/adapters — Cloudflare (edge) handler
 *
 * Produces the default export for a Cloudflare Worker / Pages Function:
 *
 *   import { createCloudflareHandler } from 'astrajs.dev/adapters/edge';
 *   export default createCloudflareHandler({ apiPrefix: '/api/astra' });
 *
 * Static assets are served by Cloudflare's own static pipeline (Pages
 * asset manifest / assets binding) — the Worker only handles RPC.
 *
 * Edge-safe: no Node.js imports anywhere in this module graph.
 */
import { createAstraHandler, type AstraHandlerOptions } from './core.js';

/**
 * Configuration for the Cloudflare adapter.
 */
export interface CloudflareAdapterOptions extends AstraHandlerOptions {
  /**
   * Optional hook that receives the Cloudflare environment bindings for
   * SSR/ISR integrations (KV, D1, R2, …). Not required for plain RPC.
   */
  withEnv?: boolean;
}

/**
 * Creates a Cloudflare Worker handler.
 *
 * The returned object is the module's default export:
 * `export default createCloudflareHandler(...)`.
 */
export function createCloudflareHandler(options: CloudflareAdapterOptions = {}): {
  fetch: (
    request: Request,
    env?: Record<string, unknown>,
    ctx?: { waitUntil(promise: Promise<unknown>): void }
  ) => Promise<Response>;
} {
  const handle = createAstraHandler(options);
  return {
    async fetch(request, env) {
      const response = await handle(request);

      // Cloudflare Pages exposes static assets via the `ASSETS` binding.
      // Non-RPC paths that miss the handler fall through to it, so
      // `wrangler pages dev` works exactly like production.
      if (response.status !== 404 || !env) return response;
      const assets = env.ASSETS as
        | { fetch(request: Request): Promise<Response> }
        | undefined;
      return assets ? assets.fetch(request) : response;
    },
  };
}
