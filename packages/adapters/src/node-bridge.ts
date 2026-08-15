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
  const body = new Uint8Array(await response.arrayBuffer());
  res.end(body.length > 0 ? Buffer.from(body) : undefined);
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
