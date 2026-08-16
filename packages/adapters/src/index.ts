/**
 * @bpjs159/adapters — Public API Entry Point
 *
 * Deployment adapters for AstraJS:
 *
 *   - `createAstraHandler`   platform-neutral core (RPC + optional SSR)
 *   - `createNodeHandler`    Node `(req, res)` handler + static files
 *   - `startAstraServer`     standalone `node:http` server (Fly/Railway/Docker)
 *   - `createVercelHandler`  Vercel serverless function (Node runtime)
 *   - `createCloudflareHandler` (via `@bpjs159/adapters/edge`)
 *   - `emit*Adapter`         build-time emitters used by `astra build`
 *
 * Import from `@bpjs159/adapters/edge` when bundling for edge runtimes —
 * that entry never pulls in Node.js built-ins.
 */
export { createAstraHandler } from './core.js';
export type { AstraHandlerOptions } from './core.js';

export { createNodeHandler, startAstraServer } from './node.js';
export type { NodeAdapterOptions } from './node.js';

export { createVercelHandler } from './vercel.js';
export type { VercelAdapterOptions } from './vercel.js';

export {
  emitNodeAdapter,
  emitVercelAdapter,
  emitCloudflareAdapter,
  emitStaticAdapter,
} from './emit.js';
export type { EmitContext } from './emit.js';
