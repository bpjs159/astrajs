import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
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
    "[AstraJS] server() macro was not transformed by the compiler. Make sure @bpjs159/core/vite is in your vite.config.ts plugins."
  );
}
const STORE_SYMBOL = Symbol("astra-store");
const rawDeps = /* @__PURE__ */ new WeakMap();
const rawToProxy = /* @__PURE__ */ new WeakMap();
const proxyToRaw = /* @__PURE__ */ new WeakMap();
const pendingNotifications = /* @__PURE__ */ new Set();
let microtaskScheduled = false;
function scheduleMicrotaskFlush() {
  if (microtaskScheduled) return;
  microtaskScheduled = true;
  queueMicrotask(() => {
    microtaskScheduled = false;
    flushPending();
  });
}
function trigger(raw, prop) {
  const propMap = rawDeps.get(raw);
  if (!propMap) return;
  const subscribers = propMap.get(prop);
  if (!subscribers || subscribers.size === 0) return;
  for (const sub of subscribers) {
    pendingNotifications.add(sub);
  }
  scheduleMicrotaskFlush();
}
function flushPending() {
  while (pendingNotifications.size > 0) {
    const snapshot = [...pendingNotifications];
    pendingNotifications.clear();
    for (const sub of snapshot) {
      sub();
    }
  }
}
function isProxyable(value) {
  if (Array.isArray(value)) return true;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
function isArrayIndex(prop) {
  const n = Number(prop);
  return Number.isInteger(n) && n >= 0 && n < 4294967295;
}
function createReactiveProxy(raw) {
  const existing = rawToProxy.get(raw);
  if (existing) return existing;
  const handler = {
    get(target, prop, receiver) {
      if (prop === STORE_SYMBOL) return true;
      const value = Reflect.get(target, prop, receiver);
      if (value !== null && typeof value === "object" && !ArrayBuffer.isView(value) && isProxyable(value)) {
        const existingProxy = rawToProxy.get(value);
        if (existingProxy) return existingProxy;
        return createReactiveProxy(value);
      }
      return value;
    },
    set(target, prop, value, receiver) {
      const oldValue = Reflect.get(target, prop, receiver);
      if (oldValue === value) return true;
      const isArrayIndexWrite = Array.isArray(target) && typeof prop === "string" && isArrayIndex(prop);
      const oldLength = isArrayIndexWrite ? Reflect.get(target, "length", receiver) : 0;
      const result = Reflect.set(target, prop, value, receiver);
      trigger(target, prop);
      if (isArrayIndexWrite && Number(prop) >= oldLength) {
        trigger(target, "length");
      }
      return result;
    },
    deleteProperty(target, prop) {
      const had = Object.prototype.hasOwnProperty.call(target, prop);
      const result = Reflect.deleteProperty(target, prop);
      if (had) {
        trigger(target, prop);
      }
      return result;
    }
    // Support for array methods: ensure array mutations trigger correctly
    // The `ownKeys` and `has` traps don't need explicit track/trigger since
    // they are used by Object.keys/in which don't create reactive deps by default.
  };
  const proxy = new Proxy(raw, handler);
  rawToProxy.set(raw, proxy);
  proxyToRaw.set(proxy, raw);
  return proxy;
}
function store(initialState, _options) {
  if (typeof initialState === "function") {
    const raw = {};
    const proxy = createReactiveProxy(raw);
    const result = initialState(proxy);
    Object.assign(raw, result);
    for (const key of Object.keys(result)) {
      if (typeof result[key] === "function") {
        raw[key] = result[key];
      }
    }
    return proxy;
  }
  if (typeof initialState !== "object" || initialState === null) {
    throw new TypeError(
      `[AstraJS] store() expects a plain object, received ${typeof initialState}`
    );
  }
  return createReactiveProxy(initialState);
}
const activeCleanups = /* @__PURE__ */ new Map();
let observer = null;
function getObserver() {
  if (typeof MutationObserver === "undefined" || typeof document === "undefined") {
    return null;
  }
  if (!observer) {
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.removedNodes) {
          if (typeof HTMLElement !== "undefined" && node instanceof HTMLElement) {
            const cleanup = activeCleanups.get(node);
            if (cleanup) {
              cleanup();
              activeCleanups.delete(node);
            }
            node.querySelectorAll("[data-astra-lifecycle]").forEach((el) => {
              const c = activeCleanups.get(el);
              if (c) {
                c();
                activeCleanups.delete(el);
              }
            });
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  return observer;
}
if (typeof MutationObserver !== "undefined" && typeof document !== "undefined") {
  getObserver();
}
store({
  items: [
    { id: "post-1", title: "Zero-VDOM in practice", likes: 12 },
    { id: "post-2", title: "Resumability without hydration", likes: 7 },
    { id: "post-3", title: "AST-compiled reactivity", likes: 21 }
  ]
});
store({ pending: /* @__PURE__ */ new Set(), lastError: void 0 });
const likePost = server(async (id) => {
  await new Promise((resolve2) => setTimeout(resolve2, 1e3));
  if (Math.random() < 0.3) throw new Error(`Server rejected the like for "${id}"`);
  return { id };
});
rpcHandler("likePost", likePost);
const apiPrefix = "/examples/fullstack/06-optimistic-mutations/api/astra";
const distDir = process.env.ASTRA_DIST ?? fileURLToPath(new URL("../", import.meta.url));
const port = Number(process.env.PORT ?? 3e3);
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
function findStatic(pathname) {
  const rel = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  if (rel.includes("..") || rel.includes("\0")) return null;
  const base = resolve(distDir);
  const abs = resolve(base, rel);
  if (abs !== base && !abs.startsWith(base + sep)) return null;
  try {
    if (!existsSync(abs) || !statSync(abs).isFile()) return null;
  } catch {
    return null;
  }
  return {
    abs,
    type: MIME_TYPES[extname(abs).toLowerCase()] ?? "application/octet-stream"
  };
}
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://127.0.0.1");
    if (url.pathname === apiPrefix || url.pathname.startsWith(apiPrefix + "/")) {
      const handlerId = url.pathname.slice(apiPrefix.length + 1);
      let body;
      if (req.method !== "GET" && req.method !== "HEAD") {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        body = Buffer.concat(chunks).toString();
      }
      const webRequest = new Request(url.toString(), {
        method: req.method,
        headers: Object.entries(req.headers).reduce(
          (acc, [k, v]) => ({
            ...acc,
            [k]: Array.isArray(v) ? v.join(", ") : String(v ?? "")
          }),
          {}
        ),
        body
      });
      const response = await handleRPCRequest(webRequest, handlerId);
      res.statusCode = response.status;
      response.headers.forEach((value, key) => res.setHeader(key, value));
      if (response.headers.get("x-astra-stream") === "1" && response.body) {
        for await (const chunk of response.body) {
          res.write(Buffer.from(chunk));
        }
        res.end();
      } else {
        res.end(Buffer.from(await response.arrayBuffer()));
      }
      return;
    }
    const file = findStatic(url.pathname);
    if (file) {
      res.statusCode = 200;
      res.setHeader("Content-Type", file.type);
      res.setHeader(
        "Cache-Control",
        url.pathname.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "public, max-age=0, must-revalidate"
      );
      res.end(readFileSync(file.abs));
      return;
    }
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Not found" }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) })
    );
  }
}).listen(port, "0.0.0.0", () => {
  console.log("[AstraJS] server listening on http://0.0.0.0:" + port);
  console.log(
    "[AstraJS] RPC prefix: " + apiPrefix + " · static: " + resolve(distDir)
  );
});
