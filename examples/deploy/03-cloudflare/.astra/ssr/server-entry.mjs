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
function createCloudflareHandler(options = {}) {
  const handle = createAstraHandler(options);
  return {
    async fetch(request, env) {
      const response = await handle(request);
      if (response.status !== 404 || !env)
        return response;
      const assets = env.ASSETS;
      return assets ? assets.fetch(request) : response;
    }
  };
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
const serverEntry = createCloudflareHandler({ apiPrefix: "/api/astra" });
export {
  serverEntry as default
};
