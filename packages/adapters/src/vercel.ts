/**
 * @bpjs159/adapters — Vercel adapter (Node serverless function)
 *
 * One catch-all function (`api/astra.mjs`) handles every RPC endpoint.
 * Static assets are served by Vercel's own static pipeline; the function
 * only receives rewrites from `/api/astra/*`.
 *
 * The build step emits:
 *   - `api/astra.mjs`       → the bundled SSR entry (default export)
 *   - `vercel.json`         → rewrite `/api/astra/(.*)` → `/api/astra`
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createAstraHandler, type AstraHandlerOptions } from './core.js';
import { toWebRequest, writeError, writeResponse } from './node-bridge.js';

/**
 * Configuration for the Vercel adapter.
 */
export interface VercelAdapterOptions extends AstraHandlerOptions {}

/**
 * Creates a Vercel serverless function handler (Node runtime).
 *
 * Generated entry:
 * ```ts
 * import { createVercelHandler } from '@bpjs159/adapters';
 * export default createVercelHandler({ apiPrefix: '/api/astra' });
 * ```
 */
export function createVercelHandler(options: VercelAdapterOptions = {}) {
  const handle = createAstraHandler(options);

  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    try {
      const webRequest = await toWebRequest(req);
      const response = await handle(webRequest);
      await writeResponse(res, response);
    } catch (err) {
      writeError(res, err);
    }
  };
}
