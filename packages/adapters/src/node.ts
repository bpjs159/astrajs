/**
 * @astrajs/adapters — Node adapter (long-running server)
 *
 * One `node:http` server that handles:
 *   - RPC (`/api/astra/:id`) via the platform-neutral core
 *   - static files from the client build (`dist/`)
 *   - optional SSR hook
 *
 * Targets Fly.io, Railway, Render, EC2, bare metal and Docker.
 */
import { createServer as createHttpServer, type Server, type IncomingMessage, type ServerResponse } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';
import { createAstraHandler, type AstraHandlerOptions } from './core.js';
import { toWebRequest, writeError, writeResponse } from './node-bridge.js';

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.map': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
};

/**
 * Configuration for the Node adapter.
 */
export interface NodeAdapterOptions extends AstraHandlerOptions {
  /** Absolute path to the client build directory (served as static files). */
  staticDir?: string;
}

/**
 * Serves a static file if it exists inside `staticDir`.
 * Returns `null` when the path does not resolve to a real file (or escapes the dir).
 */
function serveStatic(staticDir: string, pathname: string): Response | null {
  const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  if (rel.includes('..') || rel.includes('\0')) return null;

  // Normalize both sides — `staticDir` may carry a trailing slash.
  const base = resolve(staticDir);
  const abs = resolve(base, rel);
  if (abs !== base && !abs.startsWith(base + sep)) {
    return null;
  }

  try {
    if (!existsSync(abs) || !statSync(abs).isFile()) return null;
  } catch {
    return null;
  }

  const type = MIME_TYPES[extname(abs).toLowerCase()] ?? 'application/octet-stream';
  const headers: Record<string, string> = { 'Content-Type': type };
  // Long-lived immutable cache for hashed assets, short for HTML.
  headers['Cache-Control'] = rel.startsWith('assets/')
    ? 'public, max-age=31536000, immutable'
    : 'public, max-age=0, must-revalidate';

  return new Response(new Uint8Array(readFileSync(abs)), { status: 200, headers });
}

/**
 * Creates a Node `(req, res)` handler wrapping the platform-neutral core
 * plus static file serving. Suitable for Express/Fastify `app.use()`-style
 * mounting via `http.createServer(handler)`.
 */
export function createNodeHandler(options: NodeAdapterOptions = {}) {
  const staticDir = options.staticDir ? resolve(options.staticDir) : undefined;
  const handle = createAstraHandler({
    apiPrefix: options.apiPrefix,
    render:
      options.render ??
      (staticDir
        ? async (_request: Request, url: URL) => serveStatic(staticDir, url.pathname)
        : undefined),
  });

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

/**
 * Starts the standalone Astra server (RPC + static + optional SSR).
 *
 * Typical generated entry:
 * ```ts
 * import { startAstraServer } from '@astrajs/adapters';
 * startAstraServer({ apiPrefix: '/api/astra', staticDir: '...' });
 * ```
 */
export function startAstraServer(options: NodeAdapterOptions & { port?: number; host?: string }): Server {
  const port = options.port ?? Number(process.env.PORT ?? 3000);
  const host = options.host ?? '0.0.0.0';
  const handler = createNodeHandler(options);

  const server = createHttpServer((req, res) => {
    void handler(req, res);
  });

  server.listen(port, host, () => {
    console.log(`[AstraJS] server listening on http://${host}:${port}`);
    console.log(`[AstraJS] RPC prefix: ${options.apiPrefix ?? '/api/astra'}${options.staticDir ? ` · static: ${resolve(options.staticDir)}` : ''}`);
  });

  return server;
}
