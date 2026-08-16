# AI 04 — RAG

Retrieval-Augmented Generation with `astrajs.dev/ai/rag`: embed a knowledge
base, retrieve the top-k chunks by cosine similarity, and ground the answer
on them. The index builds lazily inside the server handler — never in the
client bundle.

```bash
npm install
ASTRA_AI_PROVIDER=ollama npm run dev
npm run build && PORT=8080 node dist/server/server.mjs
```

Embeddings model: `ASTRA_AI_EMBED_MODEL` (default `nomic-embed-text`
for Ollama, `text-embedding-3-small` for OpenAI).
