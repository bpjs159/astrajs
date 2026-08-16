# AI Examples

The same `ai()` macros, four ways:

| Example | Shows | Output |
| --- | --- | --- |
| [01-streaming-chat](./01-streaming-chat) | `ai()` + `aiStream()` typed endpoints; token-by-token DOM mutations | Node server |
| [02-tools](./02-tools) | `aiAgent` calling your `server()` functions | Node server |
| [03-build-time](./03-build-time) | `ai({ type: 'pre-build' })` folded into the bundle at build time | Static files |
| [04-rag](./04-rag) | `astrajs.dev/ai/rag` grounded answers | Node server |

## Quick start

```bash
cd 01-streaming-chat
npm install                       # links the monorepo packages
ASTRA_AI_PROVIDER=ollama npm run dev
```

No Ollama? `ASTRA_AI_PROVIDER=mock` runs fully offline with deterministic
output — great for CI and for learning the pipeline.

## Configuration

```bash
ASTRA_AI_PROVIDER=ollama            # ollama | openai | mock
ASTRA_AI_BASE_URL=http://127.0.0.1:11434
ASTRA_AI_API_KEY=                   # OpenAI key, or user:pass for remote Ollama Basic Auth
ASTRA_AI_MODEL=qwen2.5-coder:7b
ASTRA_AI_EMBED_MODEL=nomic-embed-text
```

The same values can live in `astra.config.json`:

```json
{
  "adapter": "node",
  "ai": { "provider": "ollama", "model": "qwen2.5-coder:7b", "apiKeyEnv": "OLLAMA_API_KEY" }
}
```

Full docs: `/docs/ai` on the official site.
