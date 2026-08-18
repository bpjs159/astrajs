/**
 * astrajs.dev/ai — SSE / stream parsing helpers (edge-safe)
 */

/**
 * Parses an OpenAI-style Server-Sent Events stream body.
 * Yields the JSON payload of each `data: ...` event; ignores comments,
 * keep-alives and the terminal `data: [DONE]` sentinel.
 */
export async function* parseSSE(
  body: ReadableStream<Uint8Array>
): AsyncGenerator<Record<string, unknown>> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIdx: number;
    while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, newlineIdx).trim();
      buffer = buffer.slice(newlineIdx + 1);
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (payload === '[DONE]') return;
      if (!payload) continue;
      try {
        yield JSON.parse(payload) as Record<string, unknown>;
      } catch {
        // Non-JSON event — skip.
      }
    }
  }

  const rest = buffer.trim();
  if (rest.startsWith('data:')) {
    const payload = rest.slice(5).trim();
    if (payload && payload !== '[DONE]') {
      try {
        yield JSON.parse(payload) as Record<string, unknown>;
      } catch {
        // ignore
      }
    }
  }
}

/**
 * Parses Ollama's NDJSON streaming response (`{ message: { content } }` per line).
 */
export async function* parseNDJSON(
  body: ReadableStream<Uint8Array>
): AsyncGenerator<Record<string, unknown>> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIdx: number;
    while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, newlineIdx).trim();
      buffer = buffer.slice(newlineIdx + 1);
      if (!line) continue;
      try {
        yield JSON.parse(line) as Record<string, unknown>;
      } catch {
        // ignore malformed lines
      }
    }
  }

  const rest = buffer.trim();
  if (rest) {
    try {
      yield JSON.parse(rest) as Record<string, unknown>;
    } catch {
      // ignore
    }
  }
}

/**
 * Converts an async generator of strings into a Web ReadableStream of bytes.
 */
export function toByteStream(chunks: AsyncGenerator<string>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for await (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}
