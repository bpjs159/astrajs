# AI 03 — Build-time AI (SSG with AI)

`ai({ type: 'pre-build' }, fn)` executes the prompt during `astra build`
and inlines the response into the bundle — the deployed page performs zero
model calls.

```bash
npm install
ASTRA_AI_PROVIDER=ollama npm run build   # prompt runs here, once
npm run preview                          # dist/ is pure static
```

- Results are cached by prompt hash in `.astra/ai-cache.json`.
- Pure JSON answers are folded as parsed values; otherwise `{ text }`.
- `ASTRA_AI_PROVIDER=mock npm run build` works fully offline.
