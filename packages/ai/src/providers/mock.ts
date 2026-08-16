/**
 * @bpjs159/ai — Mock provider (deterministic, offline)
 *
 * Used by tests and `ASTRA_AI_PROVIDER=mock` runs: no network, predictable
 * output. Chat echoes the last user message; streaming yields it in chunks;
 * tool mode calls the `tool:<name>` tool named in the user message.
 */
import type {
  AiMessage,
  AiToolCall,
} from '../types.js';
import type { AiProvider } from '../provider.js';

function lastUser(messages: AiMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]!.role === 'user') return messages[i]!.content;
  }
  return '';
}

export function createMockProvider(): AiProvider {
  return {
    async chat(model, messages) {
      const prompt = lastUser(messages);
      return `mock[${model}]: ${prompt}`;
    },

    async *stream(model, messages) {
      const text = `mock[${model}]: ${lastUser(messages)}`;
      for (let i = 0; i < text.length; i += 5) {
        yield text.slice(i, i + 5);
      }
    },

    async chatWithTools(model, messages, tools) {
      const prompt = lastUser(messages);
      const toolMatch = prompt.match(/tool:(\w+)/);
      if (toolMatch && tools.length > 0) {
        const name = toolMatch[1]!;
        const tool = tools.find((t) => t.name === name) ?? tools[0]!;
        const calls: AiToolCall[] = [
          {
            id: `mock_${tool.name}`,
            name: tool.name,
            arguments: { query: prompt },
          },
        ];
        return { text: '', toolCalls: calls };
      }
      return { text: `mock[${model}]: ${prompt}`, toolCalls: [] };
    },

    async embed(_model, texts) {
      // Deterministic pseudo-embeddings: bag-of-chars into 16 dims.
      return texts.map((t) => {
        const vec = new Array<number>(16).fill(0);
        for (const ch of t.toLowerCase()) {
          vec[ch.charCodeAt(0) % 16] = (vec[ch.charCodeAt(0) % 16] ?? 0) + 1;
        }
        const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
        return vec.map((v) => v / norm);
      });
    },
  };
}
