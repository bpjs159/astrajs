/**
 * @astrajs/compiler — Vite Plugin
 *
 * ## Architecture
 *
 * The AstraJS Vite plugin runs as a `pre`-enforce transform on all
 * `.tsx`, `.jsx`, `.ts`, and `.js` files. It applies three passes
 * in sequence:
 *
 * ```
 * Source Code
 *   │
 *   ├── Phase 1: CSS Extraction
 *   │   css`...` → static .css files + class-name map replacement
 *   │
 *   ├── Phase 2: server Compilation
 *   │   server() → client fetch wrapper (+ server endpoint)
 *   │   type: 'pre-build' → constant folding placeholder
 *   │
 *   └── Phase 3: JSX → Vanilla DOM
 *       <div class="x">{expr}</div> → document.createElement + bindText
 * ```
 *
 * CSS files are emitted as virtual modules that Vite can process through
 * its CSS pipeline. Server endpoints are collected and registered at build
 * completion.
 */

import type { Plugin, ResolvedConfig } from 'vite';
import type { AstraViteConfig } from './index.js';
import { transformJSX, autoWrapDynamic, autoMemoDerivedFunctions } from './transformers/jsx.js';
import { transformServerRPC } from './transformers/server-rpc.js';
import type { ServerCallInfo } from './transformers/server-rpc.js';
import { ensureImport } from './utils/ast.js';

// ─── Plugin State ────────────────────────────────────────────────────────────

/**
 * Internal plugin state shared across hooks.
 */
interface PluginState {
  /** Collected CSS files to emit (filename → content). */
  cssFiles: Map<string, string>;
  /** Collected server call metadata (for dev server handler registration). */
  serverCalls: ServerCallInfo[];
  /** Pre-build call IDs for the SSG phase. */
  preBuildIds: string[];
  /** Resolved Vite config (available after configResolved). */
  resolvedConfig: ResolvedConfig | null;
}

// ─── File Filter ─────────────────────────────────────────────────────────────

/**
 * File extensions that the plugin processes.
 */
const TRANSFORM_EXTENSIONS = /\.(tsx|jsx|ts|js)$/;

/**
 * Whether a file should be processed by the AstraJS compiler.
 */
function shouldTransform(id: string): boolean {
  // Only process source files, not node_modules
  if (id.includes('node_modules')) return false;
  if (id.includes('/dist/')) return false;
  return TRANSFORM_EXTENSIONS.test(id);
}

// ─── Plugin Factory ──────────────────────────────────────────────────────────

/**
 * Creates the AstraJS Vite plugin.
 *
 * This plugin transforms source files in three phases:
 * 1. **CSS Extraction** — `css` tagged templates → static CSS files
 * 2. **server Compilation** — Server RPC → fetch wrappers + endpoints
 * 3. **JSX Transpilation** — JSX → vanilla DOM construction code
 *
 * @param userConfig — Optional configuration overrides.
 * @returns A Vite plugin instance.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite';
 * import astra from '@astrajs/core/vite';
 *
 * export default defineConfig({
 *   plugins: [astra({ cssPrefix: 'app-', apiPrefix: '/api/rpc' })]
 * });
 * ```
 */
export function astraVitePlugin(userConfig: AstraViteConfig = {}): Plugin {
  const config: AstraViteConfig = {
    cssPrefix: 'astra-',
    cssHashLength: 6,
    cssOutput: 'assets',
    apiPrefix: '/api/astra',
    sourceMaps: true,
    transformMode: 'dynamic',
    ...userConfig,
  };

  const state: PluginState = {
    cssFiles: new Map(),
    serverCalls: [],
    preBuildIds: [],
    resolvedConfig: null,
  };

  return {
    name: 'astrajs',
    enforce: 'pre',

    // ─── configResolved ──────────────────────────────────────────────────

    configResolved(resolvedConfig: ResolvedConfig) {
      state.resolvedConfig = resolvedConfig;
      // In dev mode, source maps are more useful
      if (resolvedConfig.command === 'serve') {
        config.sourceMaps = true;
      }
    },

    // ─── configureServer ─────────────────────────────────────────────────

    async configureServer(server) {
      if (state.serverCalls.length === 0) return;

      // Dynamically import server-side primitives
      const serverMod = await server.ssrLoadModule('@astrajs/server');
      const { rpcHandler: registerHandler, handleRPCRequest } = serverMod as {
        rpcHandler: (id: string, fn: (...args: unknown[]) => Promise<unknown>, opts?: { tags?: string[] }) => void;
        handleRPCRequest: (req: Request, id: string) => Promise<Response>;
      };

      // Register each server call as a live handler
      for (const call of state.serverCalls) {
        if (call.isPreBuild) continue; // pre-build calls don't need runtime handlers

        // Dynamically create the handler function from extracted metadata.
        // new Function() creates a function with access to globals (crypto, etc.)
        // but no closure over the original module scope — so server bodies
        // must be self-contained (no references to module-level variables).
        const fnBody = call.functionBody;
        const fnParams = call.paramNames;
        const handlerFn = new Function(
          `return (async (${fnParams.join(', ')}) => { ${fnBody} });`
        )() as (...args: unknown[]) => Promise<unknown>;

        registerHandler(call.id, handlerFn, { tags: call.config.tags });
      }

      // Intercept RPC requests and dispatch to registered handlers
      server.middlewares.use(async (req, res, next) => {
        const apiPrefix = config.apiPrefix ?? '/api/astra';
        if (!req.url?.startsWith(apiPrefix)) return next();

        const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);

        // Collect request body
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const body = Buffer.concat(chunks).toString();

        // Build Web API Request
        const webRequest = new Request(url.toString(), {
          method: req.method,
          headers: Object.entries(req.headers).reduce(
            (acc, [k, v]) => ({ ...acc, [k]: v?.toString() ?? '' }),
            {} as Record<string, string>
          ),
          body: body || undefined,
        });

        // Extract handler ID from path: /api/astra/createUser → createUser
        const handlerId = url.pathname.replace(`${apiPrefix}/`, '');

        const response = await handleRPCRequest(webRequest, handlerId);

        // Write Web Response back to Node response
        res.statusCode = response.status;
        response.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
        res.end(await response.text());
      });
    },

    // ─── transform ───────────────────────────────────────────────────────

    async transform(code: string, id: string) {
      if (!shouldTransform(id)) return null;

      let transformed = code;
      let hasChanges = false;

      // Phase 1: CSS Extraction (TODO: fix comment-breaking bug)
      // const cssResult = transformCSS(transformed, id, config);
      // if (cssResult.cssFiles.size > 0) {
      //   transformed = cssResult.code;
      //   for (const [filename, content] of cssResult.cssFiles) {
      //     state.cssFiles.set(filename, content);
      //   }
      //   hasChanges = true;
      // }

      // Phase 2: server Compilation
      const serverResult = transformServerRPC(transformed, id, config);
      if (serverResult.calls.length > 0) {
        transformed = serverResult.clientCode;
        state.serverCalls.push(...serverResult.calls);
        state.preBuildIds.push(...serverResult.preBuildIds);
        hasChanges = true;
      }

      // Phase 3: JSX transforms (dynamic mode) or Vanilla DOM (vanilla mode)
      if (/\.(tsx|jsx)$/.test(id)) {
        // Detect reactive store variables: const st = store({...})
        const storeRegex = /\b(const|let|var)\s+([\w$]+)(?:\s*:\s*[^=]+)?\s*=\s*(?:store|swr)\s*\(/g;
        const reactiveVars = new Set<string>();
        let match: RegExpExecArray | null;
        while ((match = storeRegex.exec(transformed)) !== null) {
          reactiveVars.add(match[2]!);
        }

        // Phase 3a: Auto-Memoization — wrap derived arrow functions with memo()
        // Runs for BOTH dynamic and vanilla modes. Transparent to developer.
        const memoResult = autoMemoDerivedFunctions(transformed, reactiveVars);
        if (memoResult.needsMemo) {
          transformed = ensureImport(memoResult.code, '@astrajs/core', ['memo']);
          hasChanges = true;
        } else if (memoResult.code !== transformed) {
          transformed = memoResult.code;
          hasChanges = true;
        }

        if (config.transformMode === 'dynamic') {
          // ── Dynamic mode: auto-wrap reactive JSX expressions with dynamic() ──
          const wrapped = autoWrapDynamic(transformed, reactiveVars);
          if (wrapped.needsDynamic) {
            transformed = ensureImport(wrapped.code, '@astrajs/core', ['dynamic']);
            hasChanges = true;
          } else if (wrapped.code !== transformed) {
            transformed = wrapped.code;
            hasChanges = true;
          }
        } else {
          // ── Vanilla mode: full JSX → DOM transformation ──
          const jsxResult = transformJSX(transformed, id, config);
          if (jsxResult.code !== transformed) {
            transformed = jsxResult.code;
            hasChanges = true;
          }
        }
      }

      if (!hasChanges) return null;

      return {
        code: transformed,
        map: config.sourceMaps ? { mappings: '' } : undefined,
      };
    },

    // ─── generateBundle ──────────────────────────────────────────────────

    generateBundle(_options, _bundle) {
      // Emit collected CSS files as assets
      for (const [filename, content] of state.cssFiles) {
        this.emitFile({
          type: 'asset',
          fileName: `${config.cssOutput ?? 'assets'}/${filename}`,
          source: content,
        });
      }

      // Write server endpoint manifest (for production builds)
      if (state.serverCalls.length > 0) {
        const manifest: Record<string, { paramNames: string[]; functionBody: string }> = {};
        for (const call of state.serverCalls) {
          manifest[call.id] = { paramNames: call.paramNames, functionBody: call.functionBody };
        }
        this.emitFile({
          type: 'asset',
          fileName: 'astra-server-manifest.json',
          source: JSON.stringify(manifest, null, 2),
        });
      }

      // Write pre-build manifest for SSG
      if (state.preBuildIds.length > 0) {
        this.emitFile({
          type: 'asset',
          fileName: 'astra-prebuild-manifest.json',
          source: JSON.stringify(state.preBuildIds, null, 2),
        });
      }
    },

    // ─── transformIndexHtml ──────────────────────────────────────────────

    transformIndexHtml: {
      order: 'pre' as const,
      handler(html: string) {
        // Inject CSS file references for extracted styles
        if (state.cssFiles.size > 0) {
          const cssLinks: string[] = [];
          for (const filename of state.cssFiles.keys()) {
            cssLinks.push(
              `<link rel="stylesheet" href="/${config.cssOutput ?? 'assets'}/${filename}">`
            );
          }
          // Insert before closing </head>
          const headCloseIdx = html.lastIndexOf('</head>');
          if (headCloseIdx !== -1) {
            return (
              html.slice(0, headCloseIdx) +
              '\n    ' +
              cssLinks.join('\n    ') +
              '\n  ' +
              html.slice(headCloseIdx)
            );
          }
          // No <head> — prepend
          return cssLinks.join('\n') + '\n' + html;
        }
        return html;
      },
    },
  };
}

/**
 * Default export for `import astra from '@astrajs/core/vite'`.
 */
export default astraVitePlugin;
