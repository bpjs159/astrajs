/**
 * astrajs.dev/adapters — Node HTTP bridge (internal)
 *
 * Translates between Node's `IncomingMessage`/`ServerResponse` and the
 * Web-standard `Request`/`Response` used by the platform-neutral core.
 * Shared by the Node and Vercel adapters.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';

/** Hard cap for buffered request bodies (RPC payloads are small). */
const MAX_BODY_BYTES = 1024 * 1024;

function httpError(status: number, message: string): Error & { status: number } {
  const err = new Error(message) as Error & { status: number };
  err.status = status;
  return err;
}

/** Reads the full request body (buffered — RPC payloads are small), capped
 * at MAX_BODY_BYTES to prevent memory-exhaustion DoS. */
async function readRequestBody(req: IncomingMessage): Promise<string> {
  const declared = Number(req.headers['content-length'] ?? 0);
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    throw httpError(413, 'Request body too large');
  }

  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const buf = chunk as Buffer;
    total += buf.length;
    if (total > MAX_BODY_BYTES) {
      throw httpError(413, 'Request body too large');
    }
    chunks.push(buf);
  }
  return Buffer.concat(chunks).toString();
}

/** Builds a Web `Request` from a Node incoming message. */
export async function toWebRequest(req: IncomingMessage): Promise<Request> {
  // SECURITY: the Host header is attacker-controlled — only accept a
  // well-formed hostname/IP shape, else fall back to localhost.
  const rawHost = req.headers.host ?? 'localhost';
  const host = /^[A-Za-z0-9.\-:\[\]]+$/.test(rawHost) ? rawHost : 'localhost';
  const url = new URL(req.url ?? '/', `http://${host}`);
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) headers[key] = String(value);
  }
  const body = await readRequestBody(req);
  return new Request(url.toString(), {
    method: req.method,
    headers,
    body: body || undefined,
  });
}

/** Writes a Web `Response` back to a Node server response. */
export async function writeResponse(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value: string, key: string) => {
    res.setHeader(key, value);
  });

  // Pipe the body chunk-by-chunk instead of buffering — streaming AI
  // responses (aiStream) arrive token by token and must reach the client
  // progressively. Buffered JSON bodies pipe identically.
  if (response.body) {
    const reader = response.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value as Uint8Array));
    }
  }
  res.end();
}

/** Writes the standard Astra error contract as a JSON response, honoring
 * an error's explicit HTTP status (e.g. 413 from the body-size cap). */
export function writeError(res: ServerResponse, err: unknown): void {
  const message = err instanceof Error ? err.message : 'Internal AstraJS server error';
  if (!res.headersSent) {
    const status = (err as { status?: number } | null)?.status ?? 500;
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: message }));
  } else {
    res.destroy();
  }
}
