# @astrajs/ai

Typed AI endpoints, streaming, tool-calling agents and in-memory RAG.
Edge-safe and provider-agnostic (Ollama, OpenAI-compatible, mock).

## Install

```bash
npm install @astrajs/ai
```

## Usage

```ts
import { complete, stream, configureAi } from '@astrajs/ai';

configureAi({ provider: 'ollama', model: 'qwen2.5-coder:7b' });

const answer = await complete('Explain zero-VDOM in one sentence.');

for await (const token of stream('Write a haiku about compilers')) {
  process.stdout.write(token);
}
```

## Features

- `complete()` / `stream()` — typed model calls
- `aiAgent(tools, options)` — tool-calling agent loop
- `createRag()` — in-memory cosine-similarity retrieval (`@astrajs/ai/rag`)
- `configureAi()` / `getAiRuntime()` — provider configuration via
  `ASTRA_AI_PROVIDER`, `ASTRA_AI_BASE_URL`, `ASTRA_AI_API_KEY`, `ASTRA_AI_MODEL`
- Providers: `ollama`, `openai`, `mock` (deterministic, offline)
- `parseSSE` / `parseNDJSON` / `toByteStream` streaming helpers

## License

MIT
