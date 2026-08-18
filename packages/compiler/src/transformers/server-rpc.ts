/**
 * astrajs.dev/compiler — server RPC Transformer
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
import type { ServerConfig } from 'astrajs.dev/server';
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

  // Extract autoSyncInterval
  const autoSyncIntervalMatch = configSource.match(/autoSyncInterval\s*:\s*(\d+)/);
  if (autoSyncIntervalMatch) {
    config.autoSyncInterval = parseInt(autoSyncIntervalMatch[1]!, 10);
  }

  return config;
}

/**
 * Strips TypeScript type annotations from a function parameter.
 *
 * Finds the top-level colon (not inside nested {}, [], or <>).
 *
 * @example
 * stripTypeAnnotation('name: string')               // → 'name'
 * stripTypeAnnotation('updates: { price: number }')  // → 'updates'
 * stripTypeAnnotation('{ price }: { price: number }') // → '{ price }'
 */
export function stripTypeAnnotation(param: string): string {
  let depth = 0;
  for (let i = 0; i < param.length; i++) {
    const ch = param[i];
    if (ch === '{' || ch === '[' || ch === '<') depth++;
    else if (ch === '}' || ch === ']' || ch === '>') depth--;
    else if (ch === ':' && depth === 0) {
      return param.slice(0, i);
    }
  }
  return param;
}

/**
 * Strips JavaScript/TypeScript comments and string literals from source,
 * replacing them with spaces of the same length. This preserves character
 * offsets so that regex match positions remain valid in the original source.
 *
 * Handles:
 * - Single-line comments: `// ...`
 * - Multi-line comments: `/* ... *\/`
 * - String literals: `'...'`, `"..."`, `` `...` ``
 *
 * @param source — The original source code.
 * @returns The source with comments and strings blanked out (preserving length).
 */
export function stripCommentsAndStrings(source: string): string {
  const len = source.length;
  const output: string[] = new Array(len);
  let i = 0;

  while (i < len) {
    const ch = source[i]!;

    // Single-line comment: //
    if (ch === '/' && source[i + 1] === '/') {
      while (i < len && source[i] !== '\n') {
        output[i] = ' ';
        i++;
      }
      continue;
    }

    // Multi-line comment: /* ... */
    if (ch === '/' && source[i + 1] === '*') {
      output[i] = ' ';
      output[i + 1] = ' ';
      i += 2;
      while (i < len - 1 && !(source[i] === '*' && source[i + 1] === '/')) {
        output[i] = source[i] === '\n' ? '\n' : ' ';
        i++;
      }
      if (i < len - 1) {
        output[i] = ' ';
        output[i + 1] = ' ';
        i += 2;
      }
      continue;
    }

    // String literals: '...', "...", `...`
    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch;
      output[i] = ' ';
      i++;
      while (i < len) {
        if (source[i] === '\\' && i + 1 < len) {
          // Escape sequence — skip next char too
          output[i] = ' ';
          output[i + 1] = ' ';
          i += 2;
          continue;
        }
        if (source[i] === quote) {
          output[i] = ' ';
          i++;
          break;
        }
        output[i] = source[i] === '\n' ? '\n' : ' ';
        i++;
      }
      continue;
    }

    output[i] = ch;
    i++;
  }

  return output.join('');
}

/**
 * Finds all `server()` calls in source code using bracket counting
 * (instead of regex) to correctly handle nested parentheses and braces.
 *
 * Comments and string literals are stripped before scanning to prevent
 * false positives from JSDoc or documentation strings containing "server(".
 *
 * @param source — The source code to scan.
 * @returns Array of parsed server call info.
 */
export function findServerCalls(source: string): ServerCallInfo[] {
  const results: ServerCallInfo[] = [];

  // Strip comments and strings to avoid false matches in JSDoc/docstrings
  const cleanSource = stripCommentsAndStrings(source);

  // Find all occurrences of "server(" in the clean source
  let searchPos = 0;
  while (searchPos < cleanSource.length) {
    const serverIdx = cleanSource.indexOf('server(', searchPos);
    if (serverIdx === -1) break;

    // Check if this is preceded by word boundary (not part of another identifier)
    if (serverIdx > 0 && /\w/.test(cleanSource[serverIdx - 1]!)) {
      searchPos = serverIdx + 7;
      continue;
    }

    // Find the opening paren position
    const openParenIdx = serverIdx + 6; // position of '(' in 'server('
    if (openParenIdx >= cleanSource.length) break;

    // Use bracket counting to find the matching closing ')'
    const closeParenIdx = findMatchingParen(cleanSource, openParenIdx);
    if (closeParenIdx === -1) {
      searchPos = serverIdx + 7;
      continue;
    }

    // Check for trailing semicolon after the closing paren
    let endIdx = closeParenIdx + 1;
    // Skip whitespace
    while (endIdx < cleanSource.length && /\s/.test(cleanSource[endIdx]!)) {
      endIdx++;
    }
    // Include trailing semicolon if present
    if (endIdx < cleanSource.length && cleanSource[endIdx] === ';') {
      endIdx++;
    }

    // Now check if this is an assignment: const/let/var name = server(...)
    let varName: string | null = null;
    let startIdx = serverIdx;

    // Look backwards from serverIdx for "const/let/var name ="
    const beforeServer = cleanSource.slice(Math.max(0, serverIdx - 50), serverIdx);
    const assignMatch = beforeServer.match(/(?:const|let|var)\s+(\w+)\s*=\s*$/);
    if (assignMatch) {
      varName = assignMatch[1]!;
      // Adjust start to include the full assignment
      const assignStart = serverIdx - assignMatch[0].length;
      startIdx = assignStart;
    }

    // Extract the call source from the ORIGINAL source (positions are preserved).
    // Slice strictly BETWEEN the outer parens (parseServerCallArgs expects the
    // inner argument-list text, not the parens themselves).
    const originalCallText = source.slice(openParenIdx + 1, closeParenIdx);

    // Parse the inner structure: server(config?, async (params) => { body })
    // First, check if there's a config object before the arrow function
    const parseResult = parseServerCallArgs(originalCallText);

    if (!parseResult) {
      searchPos = endIdx;
      continue;
    }

    const {
      config,
      paramNames,
      functionBody,
    } = parseResult;

    const id = varName ?? hashContent(functionBody.slice(0, 100), 8);

    results.push({
      id,
      config,
      functionBody: functionBody.trim(),
      paramNames,
      varName,
      start: startIdx,
      end: endIdx,
      isPreBuild: config.type === 'pre-build',
    });

    searchPos = endIdx;
  }

  return results;
}

/**
 * Finds the matching closing parenthesis using bracket counting.
 * Handles nested (), {}, and [].
 *
 * @param source — The source to scan.
 * @param openIdx — The index of the opening '('.
 * @returns The index of the matching ')', or -1 if not found.
 */
export function findMatchingParen(source: string, openIdx: number): number {
  let depth = 0;
  for (let i = openIdx; i < source.length; i++) {
    const ch = source[i];
    if (ch === '(' || ch === '{' || ch === '[') {
      depth++;
    } else if (ch === ')' || ch === '}' || ch === ']') {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * Parses the argument list of a server() call.
 *
 * Two forms are supported:
 * 1. `server(async (params) => { body })`
 * 2. `server({ config }, async (params) => { body })`
 *
 * @param callText — The text between the outer parentheses of server(...).
 * @returns Parsed config, params, and body, or null if parsing fails.
 */
function parseServerCallArgs(
  callText: string
): {
  config: ServerConfig;
  paramNames: string[];
  functionBody: string;
} | null {
  // Try with-config form first: { config }, async (params) => <body>
  const withConfigPrefix = callText.match(
    /^\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}\s*,\s*(async\s+)?\(([^)]*)\)\s*=>\s*/
  );
  if (withConfigPrefix) {
    const configSource = `{${withConfigPrefix[1]}}`;
    const config = parseServerConfig(configSource);
    const paramNames = withConfigPrefix[3]!
      .split(',')
      .map((p) => stripTypeAnnotation(p.trim()))
      .filter(Boolean);
    const functionBody = extractArrowFunctionBody(callText.slice(withConfigPrefix[0].length));
    if (functionBody === null) return null;
    return { config, paramNames, functionBody };
  }

  // Try without-config form: async (params) => <body>
  const withoutConfigPrefix = callText.match(/^\s*(async\s+)?\(([^)]*)\)\s*=>\s*/);
  if (withoutConfigPrefix) {
    const paramNames = withoutConfigPrefix[2]!
      .split(',')
      .map((p) => stripTypeAnnotation(p.trim()))
      .filter(Boolean);
    const functionBody = extractArrowFunctionBody(callText.slice(withoutConfigPrefix[0].length));
    if (functionBody === null) return null;
    return { config: {}, paramNames, functionBody };
  }

  return null;
}

/**
 * Extracts the executable statements of an arrow function's body given the
 * text immediately following its `=>`. Supports both forms:
 * - Block body: `{ statements }` — returned as-is (statements are used as-is
 *   when generating the server handler).
 * - Concise body: `expr` or `(expr)` — synthesized into `return (expr);` so
 *   it can be interpolated as statements the same way a block body is.
 */
export function extractArrowFunctionBody(rest: string): string | null {
  const trimmed = rest.trim();
  if (trimmed.length === 0) return null;

  if (trimmed.startsWith('{')) {
    // Block body — the rest of callText must be exactly the closing brace
    // (trailing whitespace/semicolon already stripped by the caller's regex
    // via the full-string anchor, so just strip the outer braces here).
    if (!trimmed.endsWith('}')) return null;
    return trimmed.slice(1, -1);
  }

  // Concise body — strip a trailing semicolon, then one layer of wrapping
  // parens if present (required by JS syntax for concise object literals).
  let expr = trimmed.replace(/;\s*$/, '').trim();
  if (expr.startsWith('(') && expr.endsWith(')')) {
    expr = expr.slice(1, -1);
  }
  if (expr.length === 0) return null;
  return `return (${expr});`;
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
    // Surface the server's real message from the standard { error } JSON
    // contract instead of leaking the raw HTTP wrapper (e.g.
    // "[AstraJS RPC] 500: {"error":...}") into error.message, which is what
    // most apps display to the user.
    let _msg = null;
    try {
      const _body = JSON.parse(_err);
      if (typeof _body?.error === 'string') _msg = _body.error;
    } catch {}
    const _error = new Error(_msg ?? \`[AstraJS RPC] \${_res.status}: \${_err}\`);
    _error.status = _res.status;
    _error.body = _err;
    throw _error;
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
  const { varName, functionBody } = call;
  const stub = varName ? `const ${varName} = ` : '';

  try {
    // Execute the function body at build time.
    // The body is wrapped as a synchronous IIFE. For async functions
    // the SSG executor (prebuild.ts) handles them via executePreBuild().
    const fn = new Function(`return (function() { ${functionBody} })();`);
    const result = fn();
    return `${stub}${JSON.stringify(result)};`;
  } catch (e) {
    console.warn(
      `[AstraJS] Pre-build execution failed for "${call.id}" ` +
      `(function may depend on module-scope variables):`,
      e instanceof Error ? e.message : e
    );
    return `${stub}/* @astra pre-build — execution failed */ undefined;`;
  }
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
