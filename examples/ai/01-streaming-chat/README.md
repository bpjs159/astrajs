# AI 01 — Streaming Chat

Typed AI endpoints with the same DX as `server()`:

```ts
export const summarize = ai({ model: 'qwen2.5-coder:7b', maxAge: 300 }, async (text) => `...`);
export const chat = aiStream({ model: 'qwen2.5-coder:7b' }, async (q) => `...`);
```

- `ai()` → one-shot completion over RPC (`{ text }`).
- `aiStream()` → token stream piped to the browser; each chunk is a direct
  DOM mutation (the component executed once — Zero-VDOM in action).

## Run

```bash
npm install
ASTRA_AI_PROVIDER=ollama npm run dev   # local Ollama (no API key needed)
# or any OpenAI-compatible endpoint:
# ASTRA_AI_PROVIDER=openai ASTRA_AI_BASE_URL=... ASTRA_AI_API_KEY=sk-...
```

Build + serve with the Node adapter:

```bash
npm run build
PORT=8080 node dist/server/server.mjs
```

## Configuration

| Variable | Default |
| --- | --- |
| `ASTRA_AI_PROVIDER` | `ollama` |
| `ASTRA_AI_BASE_URL` | `http://127.0.0.1:11434` |
| `ASTRA_AI_API_KEY` | — (`user:pass` enables Basic Auth for remote Ollama) |
| `ASTRA_AI_MODEL` | `qwen2.5-coder:7b` |

`ASTRA_AI_PROVIDER=mock` runs offline with deterministic output (tests/CI).
