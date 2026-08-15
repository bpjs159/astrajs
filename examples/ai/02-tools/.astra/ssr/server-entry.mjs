import { createServer } from "node:http";
import { existsSync, statSync, readFileSync } from "node:fs";
import { resolve, sep, extname } from "node:path";
import { fileURLToPath } from "node:url";
const handlerRegistry = /* @__PURE__ */ new Map();
function rpcHandler(id, fn, options = {}) {
  handlerRegistry.set(id, {
    fn,
    tags: options.tags ?? [],
    autoSync: options.autoSync ?? false,
    maxAge: options.maxAge ?? 0,
    stream: options.stream ?? false
  });
}
async function handleRPCRequest(request, id) {
  const handler = handlerRegistry.get(id);
  if (!handler) {
    return new Response(
      JSON.stringify({ error: `Unknown RPC handler: ${id}` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }
  try {
    let args;
    if (request.method === "GET") {
      const url = new URL(request.url);
      args = [];
      for (let i = 0; ; i++) {
        const val = url.searchParams.get(`_${i}`);
        if (val === null) break;
        args.push(JSON.parse(val));
      }
    } else {
      const body = await request.text();
      args = JSON.parse(body);
      if (!Array.isArray(args)) {
        args = [args];
      }
    }
    const result = await handler.fn(...args);
    if (handler.stream) {
      const encoder = new TextEncoder();
      const gen = result;
      const body = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of gen) {
              if (typeof chunk === "string" && chunk.length > 0) {
                controller.enqueue(encoder.encode(chunk));
              }
            }
          } catch (err) {
            const message = err instanceof Error ? err.message : "Internal stream error";
            controller.enqueue(encoder.encode(`
[AstraJS stream error] ${message}`));
          } finally {
            controller.close();
          }
        }
      });
      const streamHeaders = {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Astra-Stream": "1"
      };
      if (handler.maxAge > 0) {
        streamHeaders["Cache-Control"] = `public, max-age=${handler.maxAge}, stale-while-revalidate=${handler.maxAge * 2}`;
        streamHeaders["CDN-Cache-Control"] = `max-age=${handler.maxAge}`;
        if (handler.tags.length > 0) {
          streamHeaders["Cache-Tag"] = handler.tags.join(",");
        }
      }
      return new Response(body, { status: 200, headers: streamHeaders });
    }
    const headers = {
      "Content-Type": "application/json"
    };
    if (handler.autoSync) {
      const etag = `"${hashJSON(result)}"`;
      headers["ETag"] = etag;
      headers["Cache-Control"] = "no-cache";
      if (request.headers.get("If-None-Match") === etag) {
        return new Response(null, { status: 304, headers });
      }
    }
    if (handler.maxAge > 0) {
      headers["Cache-Control"] = `public, max-age=${handler.maxAge}, stale-while-revalidate=${handler.maxAge * 2}`;
      headers["CDN-Cache-Control"] = `max-age=${handler.maxAge}`;
      if (handler.tags.length > 0) {
        headers["Cache-Tag"] = handler.tags.join(",");
      }
    }
    return new Response(JSON.stringify(result), {
      status: 200,
      headers
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal RPC error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
function hashJSON(value) {
  const str = JSON.stringify(value);
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
const swrCache = /* @__PURE__ */ new Map();
if (typeof window !== "undefined") {
  window.addEventListener("focus", () => {
    for (const [, entry] of swrCache) {
      if (entry.options.revalidateOnFocus !== false && !entry.isValidating) {
        const swrEntry = entry;
        swrEntry.isValidating = true;
        swrEntry.pendingPromise = swrEntry.fetcher();
        swrEntry.pendingPromise.then((fresh) => {
          swrEntry.data = fresh;
          swrEntry.fetchedAt = Date.now();
        }).catch(() => {
        }).finally(() => {
          swrEntry.isValidating = false;
          swrEntry.pendingPromise = null;
        });
      }
    }
  });
  window.addEventListener("online", () => {
    for (const [, entry] of swrCache) {
      if (!entry.isValidating) {
        const swrEntry = entry;
        swrEntry.isValidating = true;
        swrEntry.pendingPromise = swrEntry.fetcher();
        swrEntry.pendingPromise.then((fresh) => {
          swrEntry.data = fresh;
          swrEntry.fetchedAt = Date.now();
        }).catch(() => {
        }).finally(() => {
          swrEntry.isValidating = false;
          swrEntry.pendingPromise = null;
        });
      }
    }
  });
}
function server(configOrFn, fn) {
  if (typeof configOrFn === "function") {
    return configOrFn;
  }
  throw new Error(
    "[AstraJS] server() macro was not transformed by the compiler. Make sure @astrajs/core/vite is in your vite.config.ts plugins."
  );
}
function createAstraHandler(options = {}) {
  const apiPrefix = options.apiPrefix ?? "/api/astra";
  return async (request) => {
    const url = new URL(request.url);
    if (url.pathname === apiPrefix || url.pathname.startsWith(`${apiPrefix}/`)) {
      const id = url.pathname.slice(apiPrefix.length + 1).replace(/\/+$/, "");
      return handleRPCRequest(request, id);
    }
    if (options.render) {
      const rendered = await options.render(request, url);
      if (rendered)
        return rendered;
    }
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  };
}
async function readRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString();
}
async function toWebRequest(req) {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== void 0)
      headers[key] = String(value);
  }
  const body = await readRequestBody(req);
  return new Request(url.toString(), {
    method: req.method,
    headers,
    body: body || void 0
  });
}
async function writeResponse(res, response) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  if (response.body) {
    const reader = response.body.getReader();
    for (; ; ) {
      const { done, value } = await reader.read();
      if (done)
        break;
      res.write(Buffer.from(value));
    }
  }
  res.end();
}
function writeError(res, err) {
  const message = err instanceof Error ? err.message : "Internal AstraJS server error";
  if (!res.headersSent) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: message }));
  } else {
    res.destroy();
  }
}
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".map": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8"
};
function serveStatic(staticDir, pathname) {
  const rel = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  if (rel.includes("..") || rel.includes("\0"))
    return null;
  const base = resolve(staticDir);
  const abs = resolve(base, rel);
  if (abs !== base && !abs.startsWith(base + sep)) {
    return null;
  }
  try {
    if (!existsSync(abs) || !statSync(abs).isFile())
      return null;
  } catch {
    return null;
  }
  const type = MIME_TYPES[extname(abs).toLowerCase()] ?? "application/octet-stream";
  const headers = { "Content-Type": type };
  headers["Cache-Control"] = rel.startsWith("assets/") ? "public, max-age=31536000, immutable" : "public, max-age=0, must-revalidate";
  return new Response(new Uint8Array(readFileSync(abs)), { status: 200, headers });
}
function createNodeHandler(options = {}) {
  const staticDir = options.staticDir ? resolve(options.staticDir) : void 0;
  const handle = createAstraHandler({
    apiPrefix: options.apiPrefix,
    render: options.render ?? (staticDir ? async (_request, url) => serveStatic(staticDir, url.pathname) : void 0)
  });
  return async (req, res) => {
    try {
      const webRequest = await toWebRequest(req);
      const response = await handle(webRequest);
      await writeResponse(res, response);
    } catch (err) {
      writeError(res, err);
    }
  };
}
function startAstraServer(options) {
  const port = options.port ?? Number(process.env.PORT ?? 3e3);
  const host = options.host ?? "0.0.0.0";
  const handler = createNodeHandler(options);
  const server2 = createServer((req, res) => {
    void handler(req, res);
  });
  server2.listen(port, host, () => {
    console.log(`[AstraJS] server listening on http://${host}:${port}`);
    console.log(`[AstraJS] RPC prefix: ${options.apiPrefix ?? "/api/astra"}${options.staticDir ? ` · static: ${resolve(options.staticDir)}` : ""}`);
  });
  return server2;
}
function getAiRuntime() {
  const provider = process.env.ASTRA_AI_PROVIDER || "ollama";
  const baseURL = process.env.ASTRA_AI_BASE_URL ?? (provider === "ollama" ? "http://127.0.0.1:11434" : provider === "openai" ? "https://api.openai.com/v1" : "mock://");
  const apiKey = process.env.ASTRA_AI_API_KEY ?? (provider === "openai" ? process.env.OPENAI_API_KEY : void 0);
  const model = process.env.ASTRA_AI_MODEL ?? (provider === "ollama" ? "qwen2.5-coder:7b" : provider === "openai" ? "gpt-4o-mini" : "mock");
  const embedModel = process.env.ASTRA_AI_EMBED_MODEL ?? (provider === "ollama" ? "nomic-embed-text" : "text-embedding-3-small");
  return { provider, baseURL, apiKey, model, embedModel };
}
async function* parseSSE(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (; ; ) {
    const { done, value } = await reader.read();
    if (done)
      break;
    buffer += decoder.decode(value, { stream: true });
    let newlineIdx;
    while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newlineIdx).trim();
      buffer = buffer.slice(newlineIdx + 1);
      if (!line.startsWith("data:"))
        continue;
      const payload = line.slice(5).trim();
      if (payload === "[DONE]")
        return;
      if (!payload)
        continue;
      try {
        yield JSON.parse(payload);
      } catch {
      }
    }
  }
  const rest = buffer.trim();
  if (rest.startsWith("data:")) {
    const payload = rest.slice(5).trim();
    if (payload && payload !== "[DONE]") {
      try {
        yield JSON.parse(payload);
      } catch {
      }
    }
  }
}
async function* parseNDJSON(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (; ; ) {
    const { done, value } = await reader.read();
    if (done)
      break;
    buffer += decoder.decode(value, { stream: true });
    let newlineIdx;
    while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newlineIdx).trim();
      buffer = buffer.slice(newlineIdx + 1);
      if (!line)
        continue;
      try {
        yield JSON.parse(line);
      } catch {
      }
    }
  }
  const rest = buffer.trim();
  if (rest) {
    try {
      yield JSON.parse(rest);
    } catch {
    }
  }
}
function toWireMessages$1(messages) {
  return messages.map((m) => {
    const wire = { role: m.role, content: m.content };
    if (m.role === "assistant" && m.tool_calls && m.tool_calls.length > 0) {
      wire.tool_calls = m.tool_calls.map((tc) => ({
        function: { name: tc.name, arguments: tc.arguments }
      }));
    }
    return wire;
  });
}
function toWireTools$1(tools) {
  return tools.map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters
    }
  }));
}
function normalizeMessage$1(message) {
  const rawCalls = message?.tool_calls;
  const toolCalls = (rawCalls ?? []).filter((tc) => typeof tc.function?.name === "string").map((tc, i) => {
    let args = {};
    const raw = tc.function.arguments;
    if (typeof raw === "string" && raw.trim()) {
      try {
        args = JSON.parse(raw);
      } catch {
        args = { _raw: raw };
      }
    } else if (raw && typeof raw === "object") {
      args = raw;
    }
    return { id: String(i), name: tc.function.name, arguments: args };
  });
  return {
    text: typeof message?.content === "string" ? message.content : "",
    toolCalls
  };
}
function createOllamaProvider(baseURL, apiKey) {
  const headers = () => {
    const h = { "Content-Type": "application/json" };
    if (apiKey) {
      if (apiKey.includes(":")) {
        h.Authorization = `Basic ${btoa(apiKey)}`;
      } else {
        h.Authorization = `Bearer ${apiKey}`;
      }
    }
    return h;
  };
  const payload = (model, messages, options, extra) => ({
    model,
    messages: toWireMessages$1(messages),
    stream: false,
    options: {
      ...options?.temperature !== void 0 ? { temperature: options.temperature } : {},
      ...options?.maxTokens !== void 0 ? { num_predict: options.maxTokens } : {}
    },
    ...extra
  });
  return {
    async chat(model, messages, options) {
      const res = await fetch(`${baseURL}/api/chat`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(payload(model, messages, options))
      });
      if (!res.ok) {
        throw new Error(`[AstraJS AI] Ollama ${res.status}: ${await res.text()}`);
      }
      const data = await res.json();
      return normalizeMessage$1(data.message).text;
    },
    async *stream(model, messages, options) {
      const res = await fetch(`${baseURL}/api/chat`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ ...payload(model, messages, options), stream: true })
      });
      if (!res.ok) {
        throw new Error(`[AstraJS AI] Ollama ${res.status}: ${await res.text()}`);
      }
      for await (const line of parseNDJSON(res.body)) {
        const message = line.message;
        const content = message?.content;
        if (typeof content === "string" && content.length > 0)
          yield content;
        if (line.done === true)
          break;
      }
    },
    async chatWithTools(model, messages, tools, options) {
      const res = await fetch(`${baseURL}/api/chat`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(payload(model, messages, options, { tools: toWireTools$1(tools) }))
      });
      if (!res.ok) {
        throw new Error(`[AstraJS AI] Ollama ${res.status}: ${await res.text()}`);
      }
      const data = await res.json();
      return normalizeMessage$1(data.message);
    },
    async embed(model, texts) {
      const res = await fetch(`${baseURL}/api/embed`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ model, input: texts })
      });
      if (!res.ok) {
        throw new Error(`[AstraJS AI] Ollama embed ${res.status}: ${await res.text()}`);
      }
      const data = await res.json();
      return data.embeddings ?? [];
    }
  };
}
function toWireMessages(messages) {
  return messages.map((m) => {
    const wire = { role: m.role, content: m.content };
    if (m.role === "assistant" && m.tool_calls && m.tool_calls.length > 0) {
      wire.tool_calls = m.tool_calls.map((tc) => ({
        id: tc.id ?? `call_${tc.name}`,
        type: "function",
        function: { name: tc.name, arguments: JSON.stringify(tc.arguments) }
      }));
    }
    if (m.role === "tool") {
      wire.tool_call_id = m.tool_call_id ?? "";
    }
    return wire;
  });
}
function toWireTools(tools) {
  return tools.map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters
    }
  }));
}
function normalizeMessage(message) {
  const rawCalls = message?.tool_calls;
  const toolCalls = (rawCalls ?? []).filter((tc) => typeof tc.function?.name === "string").map((tc) => {
    let args = {};
    const raw = tc.function?.arguments;
    if (typeof raw === "string" && raw.trim()) {
      try {
        args = JSON.parse(raw);
      } catch {
        args = { _raw: raw };
      }
    }
    return { id: tc.id, name: tc.function.name, arguments: args };
  });
  return { text: typeof message?.content === "string" ? message.content : "", toolCalls };
}
function createOpenAIProvider(baseURL, apiKey) {
  const headers = () => {
    const h = { "Content-Type": "application/json" };
    if (apiKey)
      h.Authorization = `Bearer ${apiKey}`;
    return h;
  };
  return {
    async chat(model, messages, options) {
      const res = await fetch(`${baseURL}/chat/completions`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          model,
          messages: toWireMessages(messages),
          stream: false,
          ...options?.temperature !== void 0 ? { temperature: options.temperature } : {},
          ...options?.maxTokens !== void 0 ? { max_tokens: options.maxTokens } : {}
        })
      });
      if (!res.ok) {
        throw new Error(`[AstraJS AI] OpenAI ${res.status}: ${await res.text()}`);
      }
      const data = await res.json();
      return normalizeMessage(data.choices?.[0]?.message).text;
    },
    async *stream(model, messages, options) {
      const res = await fetch(`${baseURL}/chat/completions`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          model,
          messages: toWireMessages(messages),
          stream: true,
          ...options?.temperature !== void 0 ? { temperature: options.temperature } : {},
          ...options?.maxTokens !== void 0 ? { max_tokens: options.maxTokens } : {}
        })
      });
      if (!res.ok) {
        throw new Error(`[AstraJS AI] OpenAI ${res.status}: ${await res.text()}`);
      }
      for await (const event of parseSSE(res.body)) {
        const choices = event.choices;
        const content = choices?.[0]?.delta?.content;
        if (typeof content === "string" && content.length > 0)
          yield content;
      }
    },
    async chatWithTools(model, messages, tools, options) {
      const res = await fetch(`${baseURL}/chat/completions`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          model,
          messages: toWireMessages(messages),
          tools: toWireTools(tools),
          stream: false,
          ...options?.temperature !== void 0 ? { temperature: options.temperature } : {}
        })
      });
      if (!res.ok) {
        throw new Error(`[AstraJS AI] OpenAI ${res.status}: ${await res.text()}`);
      }
      const data = await res.json();
      return normalizeMessage(data.choices?.[0]?.message);
    },
    async embed(model, texts) {
      const res = await fetch(`${baseURL}/embeddings`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ model, input: texts })
      });
      if (!res.ok) {
        throw new Error(`[AstraJS AI] OpenAI embed ${res.status}: ${await res.text()}`);
      }
      const data = await res.json();
      return (data.data ?? []).map((d) => d.embedding ?? []).filter((e) => e.length > 0);
    }
  };
}
function lastUser(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user")
      return messages[i].content;
  }
  return "";
}
function createMockProvider() {
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
        const name = toolMatch[1];
        const tool = tools.find((t) => t.name === name) ?? tools[0];
        const calls = [
          {
            id: `mock_${tool.name}`,
            name: tool.name,
            arguments: { query: prompt }
          }
        ];
        return { text: "", toolCalls: calls };
      }
      return { text: `mock[${model}]: ${prompt}`, toolCalls: [] };
    },
    async embed(_model, texts) {
      return texts.map((t) => {
        const vec = new Array(16).fill(0);
        for (const ch of t.toLowerCase()) {
          vec[ch.charCodeAt(0) % 16] = (vec[ch.charCodeAt(0) % 16] ?? 0) + 1;
        }
        const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
        return vec.map((v) => v / norm);
      });
    }
  };
}
const providerCache = /* @__PURE__ */ new Map();
function providerKey(cfg) {
  return `${cfg.provider}::${cfg.baseURL}`;
}
function getProvider() {
  const cfg = getAiRuntime();
  const key = providerKey(cfg);
  const cached = providerCache.get(key);
  if (cached)
    return cached;
  let provider;
  switch (cfg.provider) {
    case "openai":
      provider = createOpenAIProvider(cfg.baseURL, cfg.apiKey);
      break;
    case "mock":
      provider = createMockProvider();
      break;
    case "ollama":
    default:
      provider = createOllamaProvider(cfg.baseURL, cfg.apiKey);
  }
  providerCache.set(key, provider);
  return provider;
}
function aiAgent(toolsOrOptions, maybeOptions) {
  const tools = Array.isArray(toolsOrOptions) ? toolsOrOptions : toolsOrOptions.tools;
  const options = Array.isArray(toolsOrOptions) ? {} : toolsOrOptions;
  const cfg = getAiRuntime();
  const model = options.model ?? cfg.model;
  const maxSteps = options.maxSteps ?? 5;
  const toolMap = new Map(tools.map((t) => [t.schema.name, t]));
  return {
    async run(prompt) {
      const messages = [];
      if (options.system)
        messages.push({ role: "system", content: options.system });
      messages.push({ role: "user", content: prompt });
      const toolSchemas = tools.map((t) => t.schema);
      const provider = getProvider();
      const callOptions = {
        model,
        ...options.temperature !== void 0 ? { temperature: options.temperature } : {}
      };
      for (let step = 0; step < maxSteps; step++) {
        const result = await provider.chatWithTools(model, messages, toolSchemas, callOptions);
        if (result.toolCalls.length === 0)
          return result.text || "";
        messages.push({
          role: "assistant",
          content: result.text,
          tool_calls: result.toolCalls
        });
        for (const call of result.toolCalls) {
          const tool = toolMap.get(call.name);
          let output;
          if (!tool) {
            output = { error: `Unknown tool: ${call.name}` };
          } else {
            try {
              output = await tool.fn(...Object.values(call.arguments));
            } catch (err) {
              output = {
                error: err instanceof Error ? err.message : "Tool execution failed"
              };
            }
          }
          messages.push({
            role: "tool",
            content: typeof output === "string" ? output : JSON.stringify(output),
            tool_call_id: call.id
          });
        }
      }
      return provider.chat(model, messages, callOptions);
    }
  };
}
const PRODUCTS = [
  { id: "p1", name: "Wireless Headphones", price: 299, stock: 45 },
  { id: "p2", name: "Running Shoes", price: 179, stock: 120 },
  { id: "p3", name: "Smart Watch", price: 449, stock: 32 }
];
const getProduct = server(async (id) => {
  return PRODUCTS.find((p) => p.id === id) ?? { error: "Product not found" };
});
const shop = aiAgent(
  {
    system: "You are a shop assistant. Use the getProduct tool to answer about products. Be concise.",
    model: "qwen2.5-coder:7b",
    maxSteps: 3,
    tools: [
      {
        schema: {
          name: "getProduct",
          description: "Get a product by id. Returns { id, name, price, stock }.",
          parameters: {
            type: "object",
            properties: { id: { type: "string" } },
            required: ["id"]
          }
        },
        // On the server, getProduct is the real function (RPC passthrough).
        fn: async (id) => getProduct(String(id))
      }
    ]
  }
);
const askShop = server(async (question) => shop.run(question));
rpcHandler("getProduct", getProduct);
rpcHandler("askShop", askShop);
const distDir = process.env.ASTRA_DIST ?? fileURLToPath(new URL("../", import.meta.url));
startAstraServer({
  apiPrefix: "/api/astra",
  staticDir: distDir,
  port: Number(process.env.PORT ?? 3e3)
});
