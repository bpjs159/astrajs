/**
 * astrajs.dev/ai — Ollama provider
 *
 * Talks to a local or remote Ollama server (`/api/chat`, `/api/embed`).
 * Streaming uses Ollama's NDJSON protocol. When the API key contains `:`
 * it is sent as HTTP Basic Auth (matches `https://llm.astrajs.dev`).
 */
import { parseNDJSON } from '../sse.js';
import type {
  AiMessage,
  AiToolCall,
  CompleteOptions,
  ToolChatResult,
  ToolSchema,
} from '../types.js';
import type { AiProvider } from '../provider.js';

/** Maps normalized messages into Ollama's wire format. */
function toWireMessages(messages: AiMessage[]): Record<string, unknown>[] {
  return messages.map((m) => {
    const wire: Record<string, unknown> = { role: m.role, content: m.content };
    if (m.role === 'assistant' && m.tool_calls && m.tool_calls.length > 0) {
      wire.tool_calls = m.tool_calls.map((tc) => ({
        function: { name: tc.name, arguments: tc.arguments },
      }));
    }
    return wire;
  });
}

function toWireTools(tools: ToolSchema[]): Record<string, unknown>[] {
  return tools.map((t) => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}

/** Normalizes an Ollama message object into text + tool calls. */
function normalizeMessage(
  message: Record<string, unknown> | undefined
): ToolChatResult {
  const rawCalls = message?.tool_calls as
    | { function?: { name?: string; arguments?: unknown } }[]
    | undefined;
  const toolCalls: AiToolCall[] = (rawCalls ?? [])
    .filter((tc) => typeof tc.function?.name === 'string')
    .map((tc, i) => {
      let args: Record<string, unknown> = {};
      const raw = tc.function!.arguments;
      if (typeof raw === 'string' && raw.trim()) {
        try {
          args = JSON.parse(raw) as Record<string, unknown>;
        } catch {
          args = { _raw: raw };
        }
      } else if (raw && typeof raw === 'object') {
        args = raw as Record<string, unknown>;
      }
      return { id: String(i), name: tc.function!.name!, arguments: args };
    });

  return {
    text: typeof message?.content === 'string' ? message.content : '',
    toolCalls,
  };
}

export function createOllamaProvider(baseURL: string, apiKey?: string): AiProvider {
  const headers = (): Record<string, string> => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) {
      if (apiKey.includes(':')) {
        // `user:pass` → Basic Auth (llm.astrajs.dev pattern).
        h.Authorization = `Basic ${btoa(apiKey)}`;
      } else {
        h.Authorization = `Bearer ${apiKey}`;
      }
    }
    return h;
  };

  const payload = (
    model: string,
    messages: AiMessage[],
    options?: CompleteOptions,
    extra?: Record<string, unknown>
  ) => ({
    model,
    messages: toWireMessages(messages),
    stream: false,
    options: {
      ...(options?.temperature !== undefined ? { temperature: options.temperature } : {}),
      ...(options?.maxTokens !== undefined ? { num_predict: options.maxTokens } : {}),
    },
    ...extra,
  });

  return {
    async chat(model, messages, options) {
      const res = await fetch(`${baseURL}/api/chat`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(payload(model, messages, options)),
      });
      if (!res.ok) {
        throw new Error(`[AstraJS AI] Ollama ${res.status}: ${await res.text()}`);
      }
      const data = (await res.json()) as { message?: Record<string, unknown> };
      return normalizeMessage(data.message).text;
    },

    async *stream(model, messages, options) {
      const res = await fetch(`${baseURL}/api/chat`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ ...payload(model, messages, options), stream: true }),
      });
      if (!res.ok) {
        throw new Error(`[AstraJS AI] Ollama ${res.status}: ${await res.text()}`);
      }
      for await (const line of parseNDJSON(res.body!)) {
        const message = line.message as Record<string, unknown> | undefined;
        const content = message?.content;
        if (typeof content === 'string' && content.length > 0) yield content;
        if (line.done === true) break;
      }
    },

    async chatWithTools(model, messages, tools, options) {
      const res = await fetch(`${baseURL}/api/chat`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(payload(model, messages, options, { tools: toWireTools(tools) })),
      });
      if (!res.ok) {
        throw new Error(`[AstraJS AI] Ollama ${res.status}: ${await res.text()}`);
      }
      const data = (await res.json()) as { message?: Record<string, unknown> };
      return normalizeMessage(data.message);
    },

    async embed(model, texts) {
      const res = await fetch(`${baseURL}/api/embed`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ model, input: texts }),
      });
      if (!res.ok) {
        throw new Error(`[AstraJS AI] Ollama embed ${res.status}: ${await res.text()}`);
      }
      const data = (await res.json()) as { embeddings?: number[][] };
      return data.embeddings ?? [];
    },
  };
}
