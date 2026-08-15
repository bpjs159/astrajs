/**
 * @astrajs/adapters/edge — edge-safe public API (Cloudflare Workers)
 *
 * Importing from this entry guarantees the module graph contains NO
 * Node.js built-ins — safe to bundle for edge runtimes.
 */
export { createAstraHandler } from './core.js';
export type { AstraHandlerOptions } from './core.js';
export { createCloudflareHandler } from './cloudflare.js';
export type { CloudflareAdapterOptions } from './cloudflare.js';
