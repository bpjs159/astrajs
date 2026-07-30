/**
 * @astrajs/compiler — server RPC Transformer
 *
 * Transforms `server()` calls into:
 * 1. **Server side**: An API endpoint handler.
 * 2. **Client side**: A type-safe `fetch()` wrapper.
 *
 * ## Constant Folding (`type: 'pre-build'`)
 *
 * When `server()` is called with `{ type: 'pre-build' }`, the function
 * is EXECUTED at build time and its result is INLINED into the AST.
 * This means 0 KB of JS is shipped for that query — it's pure static data.
 *
 * ## Transformation
 *
 * **Input:**
 * ```ts
 * const getProducts = server(
 *   { type: 'dynamic', tags: ['products'], maxAge: 3600 },
 *   async (category: string) => {
 *     return await db.query('SELECT * FROM products WHERE category = ?', [category]);
 *   }
 * );
 * ```
 *
 * **Output (client):**
 * ```ts
 * const getProducts = async (category) => {
 *   const res = await fetch('/api/astra/getProducts', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify([category])
 *   });
 *   if (!res.ok) throw new Error(await res.text());
 *   return res.json();
 * };
 * ```
 *
 * **Output (server — separate endpoint file):**
 * ```ts
 * // /api/astra/getProducts.ts
 * export async function handler(args: [string]) {
 *   const [category] = args;
 *   return await db.query('SELECT * FROM products WHERE category = ?', [category]);
 * }
 * ```
 */

import type { AstraViteConfig } from '../index.js';
import type { ServerConfig } from '@astrajs/server';
import { hashContent } from '../utils/ast.js';

// ─── server Call Parser ─────────────────────────────────────────────────────

/**
 * Represents a parsed `server()` call found in source code.
 */
export interface ServerCallInfo {
  /** A unique identifier for this server function (hash-based). */
  id: string;
  /** The resolved configuration (merged with defaults). */
  config: ServerConfig;
  /** The function body source code. */
  functionBody: string;
  /** The function parameter names. */
  paramNames: string[];
  /** The assigned variable name (if `const foo = server(...)`). */
  varName: string | null;
  /** Start offset of the entire `server(...)` expression in source. */
  start: number;
  /** End offset of the entire expression. */
  end: number;
  /** Whether this is a pre-build (constant folding) call. */
  isPreBuild: boolean;
}

/**
 * Parses server configuration from the first argument if it's an object literal.
 */
function parseServerConfig(configSource: string): ServerConfig {
  const config: ServerConfig = {};

  // Extract type
  const typeMatch = configSource.match(/type\s*:\s*['"]([^'"]+)['"]/);
  if (typeMatch) {
    config.type = typeMatch[1] as 'pre-build' | 'dynamic';
  }

  // Extract tags
  const tagsMatch = configSource.match(/tags\s*:\s*\[([^\]]*)\]/);
  if (tagsMatch) {
    config.tags = tagsMatch[1]!.split(',')
      .map((t) => t.trim().replace(/['"]/g, ''))
      .filter(Boolean);
  }

  // Extract maxAge
  const maxAgeMatch = configSource.match(/maxAge\s*:\s*(\d+)/);
  if (maxAgeMatch) {
    config.maxAge = parseInt(maxAgeMatch[1]!, 10);
  }

  // Extract autoSync
  const autoSyncMatch = configSource.match(/autoSync\s*:\s*(true|false)/);
  if (autoSyncMatch) {
    config.autoSync = autoSyncMatch[1] === 'true';
  }

  return config;
}

/**
 * Finds all `server()` calls in source code and extracts their metadata.
 *
 * @param source — The source code to scan.
 * @returns Array of parsed server call info.
 */
export function findServerCalls(source: string): ServerCallInfo[] {
  const results: ServerCallInfo[] = [];

  // Pattern: const/let/var name = server(...)   OR   server(...)
  // This regex captures the full server() call.
  const serverRegex = /(?:const|let|var)\s+(\w+)\s*=\s*server(\s*\([\s\S]*?\)\s*\))\s*;|server(\s*\([\s\S]*?\)\s*\))/g;
  let match: RegExpExecArray | null;

  while ((match = serverRegex.exec(source)) !== null) {
    const varName = match[1] ?? null;
    const callSource = match[2] ?? match[3]!;
    const fullMatch = match[0];
    const start = match.index;
    const end = start + fullMatch!.length;

    // Determine if this has a config object as first argument
    // Pattern: server({ ... }, async (...) => { ... })
    //        OR server(async (...) => { ... })
    const withConfigMatch = callSource.match(
      /\(\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}\s*,\s*(async\s*)?\(([^)]*)\)\s*=>\s*\{([\s\S]*)\}\s*\)/
    );
    const withoutConfigMatch = callSource.match(
      /\(\s*(async\s*)?\(([^)]*)\)\s*=>\s*\{([\s\S]*)\}\s*\)/
    );

    let config: ServerConfig = {};
    let paramNames: string[] = [];
    let functionBody = '';

    if (withConfigMatch) {
      const configSource = `{${withConfigMatch[1]}}`;
      config = parseServerConfig(configSource);
      paramNames = withConfigMatch[3]!
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      functionBody = withConfigMatch[4]!;
    } else if (withoutConfigMatch) {
      paramNames = withoutConfigMatch[2]!
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      functionBody = withoutConfigMatch[3]!;
    }

    const id = varName ?? hashContent(functionBody.slice(0, 100), 8);

    results.push({
      id,
      config,
      functionBody: functionBody.trim(),
      paramNames,
      varName,
      start,
      end,
      isPreBuild: config.type === 'pre-build',
    });
  }

  return results;
}

// ─── Code Generators ─────────────────────────────────────────────────────────

/**
 * Generates the client-side fetch wrapper for a server function.
 *
 * @param call — The parsed server call info.
 * @param apiPrefix — The API route prefix (e.g., '/api/astra').
 * @returns The generated client-side source code.
 */
export function generateClientWrapper(
  call: ServerCallInfo,
  apiPrefix: string
): string {
  const { varName, id, paramNames } = call;
  const endpoint = `${apiPrefix}/${id}`;

  const params = paramNames.join(', ');
  const bodySerialize = paramNames.length === 1
    ? `JSON.stringify([${paramNames[0]}])`
    : `JSON.stringify([${params}])`;

  const stub = varName ? `const ${varName} = ` : '';

  return `${stub}async (${params}) => {
  const _res = await fetch('${endpoint}', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: ${bodySerialize}
  });
  if (!_res.ok) {
    const _err = await _res.text();
    throw new Error(\`[AstraJS RPC] \${_res.status}: \${_err}\`);
  }
  return _res.json();
};`;
}

/**
 * Generates the server-side API route handler for a server function.
 *
 * @param call — The parsed server call info.
 * @returns Server-side handler source code.
 */
export function generateServerHandler(call: ServerCallInfo): string {
  const { id, paramNames, functionBody } = call;

  const destructure = paramNames.length === 1
    ? `const [${paramNames[0]}] = args;`
    : `const [${paramNames.join(', ')}] = args;`;

  return `// Auto-generated by AstraJS — do not edit
// Endpoint: ${id}
export async function handler(args: unknown[]) {
  ${destructure}
  ${functionBody}
}`;
}

/**
 * Generates the inlined result for a pre-build server call.
 *
 * In a real implementation, this would execute the function at build time
 * in a sandboxed Node.js environment. Here we generate the structure.
 *
 * @param call — The parsed pre-build server call info.
 * @returns The inlined constant source code.
 */
export function generatePreBuildInline(call: ServerCallInfo): string {
  const { varName } = call;
  const stub = varName ? `const ${varName} = ` : '';

  // In production, the function would be executed here and its result
  // serialized. For now, we emit a placeholder that the SSG crawler
  // will resolve at generation time.
  return `${stub}/* @astrajs pre-build — resolved at SSG time */ undefined;`;
}

// ─── Source-Level Transformer ────────────────────────────────────────────────

export interface ServerTransformResult {
  /** The transformed client-side source. */
  clientCode: string;
  /** The parsed server call metadata (for dev server handler registration). */
  calls: ServerCallInfo[];
  /** Map of endpoint ID → server handler source code. */
  serverEndpoints: Map<string, string>;
  /** IDs of pre-build calls for the SSG phase. */
  preBuildIds: string[];
}

/**
 * Transforms all server() calls in a source file.
 *
 * @param source — Original source code.
 * @param filename — The file being processed.
 * @param config — Compiler configuration.
 * @returns Transformed client code + server endpoints to register.
 */
export function transformServerRPC(
  source: string,
  _filename: string,
  config: AstraViteConfig
): ServerTransformResult {
  const apiPrefix = config.apiPrefix ?? '/api/astra';
  const calls = findServerCalls(source);

  // Apply replacements in reverse order
  let clientCode = source;
  const serverEndpoints = new Map<string, string>();
  const preBuildIds: string[] = [];

  for (let i = calls.length - 1; i >= 0; i--) {
    const call = calls[i]!;

    if (call.isPreBuild) {
      // Constant folding: replace with inlined result (or placeholder)
      const replacement = generatePreBuildInline(call);
      clientCode =
        clientCode.slice(0, call.start) +
        replacement +
        clientCode.slice(call.end);
      preBuildIds.push(call.id);
    } else {
      // Dynamic: generate client fetch wrapper
      const replacement = generateClientWrapper(call, apiPrefix);
      clientCode =
        clientCode.slice(0, call.start) +
        replacement +
        clientCode.slice(call.end);

      // Generate server endpoint
      const handlerCode = generateServerHandler(call);
      serverEndpoints.set(call.id, handlerCode);
    }
  }

  return { clientCode, calls, serverEndpoints, preBuildIds };
}
