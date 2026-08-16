/**
 * @bpjs159/ai — OpenAI-compatible provider
 *
 * Works with OpenAI and any OpenAI-compatible endpoint (together.ai, Groq,
 * vLLM, LM Studio, …). Streaming uses Server-Sent Events.
 */
import { parseSSE } from '../sse.js';
import type {
  AiMessage,
  AiToolCall,
  ToolChatResult,
  ToolSchema,
} from '../types.js';
import type { AiProvider } from '../provider.js';

function toWireMessages(messages: AiMessage[]): Record<string, unknown>[] {
  return messages.map((m) => {
    const wire: Record<string, unknown> = { role: m.role, content: m.content };
    if (m.role === 'assistant' && m.tool_calls && m.tool_calls.length > 0) {
      wire.tool_calls = m.tool_calls.map((tc) => ({
        id: tc.id ?? `call_${tc.name}`,
        type: 'function',
        function: { name: tc.name, arguments: JSON.stringify(tc.arguments) },
      }));
    }
    if (m.role === 'tool') {
      wire.tool_call_id = m.tool_call_id ?? '';
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

function normalizeMessage(message: Record<string, unknown> | undefined): ToolChatResult {
  const rawCalls = message?.tool_calls as
    | { id?: string; function?: { name?: string; arguments?: string } }[]
    | undefined;
  const toolCalls: AiToolCall[] = (rawCalls ?? [])
    .filter((tc) => typeof tc.function?.name === 'string')
    .map((tc) => {
      let args: Record<string, unknown> = {};
      const raw = tc.function?.arguments;
      if (typeof raw === 'string' && raw.trim()) {
        try {
          args = JSON.parse(raw) as Record<string, unknown>;
        } catch {
          args = { _raw: raw };
        }
      }
      return { id: tc.id, name: tc.function!.name!, arguments: args };
    });

  return { text: typeof message?.content === 'string' ? message.content : '', toolCalls };
}

export function createOpenAIProvider(baseURL: string, apiKey?: string): AiProvider {
  const headers = (): Record<string, string> => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) h.Authorization = `Bearer ${apiKey}`;
    return h;
  };

  return {
    async chat(model, messages, options) {
      const res = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          model,
          messages: toWireMessages(messages),
          stream: false,
          ...(options?.temperature !== undefined ? { temperature: options.temperature } : {}),
          ...(options?.maxTokens !== undefined ? { max_tokens: options.maxTokens } : {}),
        }),
      });
      if (!res.ok) {
        throw new Error(`[AstraJS AI] OpenAI ${res.status}: ${await res.text()}`);
      }
      const data = (await res.json()) as { choices?: { message?: Record<string, unknown> }[] };
      return normalizeMessage(data.choices?.[0]?.message).text;
    },

    async *stream(model, messages, options) {
      const res = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          model,
          messages: toWireMessages(messages),
          stream: true,
          ...(options?.temperature !== undefined ? { temperature: options.temperature } : {}),
          ...(options?.maxTokens !== undefined ? { max_tokens: options.maxTokens } : {}),
        }),
      });
      if (!res.ok) {
        throw new Error(`[AstraJS AI] OpenAI ${res.status}: ${await res.text()}`);
      }
      for await (const event of parseSSE(res.body!)) {
        const choices = event.choices as
          | { delta?: { content?: string } }[]
          | undefined;
        const content = choices?.[0]?.delta?.content;
        if (typeof content === 'string' && content.length > 0) yield content;
      }
    },

    async chatWithTools(model, messages, tools, options) {
      const res = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          model,
          messages: toWireMessages(messages),
          tools: toWireTools(tools),
          stream: false,
          ...(options?.temperature !== undefined ? { temperature: options.temperature } : {}),
        }),
      });
      if (!res.ok) {
        throw new Error(`[AstraJS AI] OpenAI ${res.status}: ${await res.text()}`);
      }
      const data = (await res.json()) as { choices?: { message?: Record<string, unknown> }[] };
      return normalizeMessage(data.choices?.[0]?.message);
    },

    async embed(model, texts) {
      const res = await fetch(`${baseURL}/embeddings`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ model, input: texts }),
      });
      if (!res.ok) {
        throw new Error(`[AstraJS AI] OpenAI embed ${res.status}: ${await res.text()}`);
      }
      const data = (await res.json()) as { data?: { embedding?: number[] }[] };
      return (data.data ?? [])
        .map((d) => d.embedding ?? [])
        .filter((e) => e.length > 0);
    },
  };
}
