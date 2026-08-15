/**
 * @astrajs/adapters — Node HTTP bridge (internal)
 *
 * Translates between Node's `IncomingMessage`/`ServerResponse` and the
 * Web-standard `Request`/`Response` used by the platform-neutral core.
 * Shared by the Node and Vercel adapters.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';

/** Reads the full request body (buffered — RPC payloads are small). */
async function readRequestBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString();
}

/** Builds a Web `Request` from a Node incoming message. */
export async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
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

/** Writes the standard Astra error contract as a 500 JSON response. */
export function writeError(res: ServerResponse, err: unknown): void {
  const message = err instanceof Error ? err.message : 'Internal AstraJS server error';
  if (!res.headersSent) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: message }));
  } else {
    res.destroy();
  }
}
