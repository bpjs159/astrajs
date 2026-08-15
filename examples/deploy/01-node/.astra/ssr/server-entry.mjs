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
    maxAge: options.maxAge ?? 0
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
  if (fn) {
    return fn;
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
  const body = new Uint8Array(await response.arrayBuffer());
  res.end(body.length > 0 ? Buffer.from(body) : void 0);
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
const QUOTES = [
  { id: 1, text: "Zero Virtual DOM, zero hydration, zero bloat.", author: "AstraJS" },
  { id: 2, text: "Compile TypeScript to direct DOM mutations.", author: "AstraJS" },
  { id: 3, text: "The server function you write is the API.", author: "AstraJS" }
];
const getQuote = server(async () => {
  const idx = Math.floor(Math.random() * QUOTES.length);
  return QUOTES[idx];
});
const getStats = server({ tags: ["stats"], maxAge: 60 }, async () => {
  return {
    quotes: QUOTES.length,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
});
const addVisit = server(async (page) => {
  return { ok: true, page, at: (/* @__PURE__ */ new Date()).toISOString() };
});
rpcHandler("getQuote", getQuote);
rpcHandler("getStats", getStats, { "tags": ["stats"], "maxAge": 60 });
rpcHandler("addVisit", addVisit);
const distDir = process.env.ASTRA_DIST ?? fileURLToPath(new URL("../", import.meta.url));
startAstraServer({
  apiPrefix: "/api/astra",
  staticDir: distDir,
  port: Number(process.env.PORT ?? 3e3)
});
