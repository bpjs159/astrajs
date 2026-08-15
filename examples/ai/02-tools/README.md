# AI 02 — Tool Calling

The model calls **your** functions. `aiAgent` runs the loop on the server:
model asks for `getProduct` → the tool executes against module-scope data →
the result feeds back → final answer. The tool schema is explicit today;
deriving schemas from TypeScript signatures is on the compiler roadmap.

```bash
npm install
ASTRA_AI_PROVIDER=ollama npm run dev
npm run build && PORT=8080 node dist/server/server.mjs
```

`ASTRA_AI_PROVIDER=mock` runs offline: a prompt containing `tool:getProduct`
makes the mock model call the tool deterministically.
