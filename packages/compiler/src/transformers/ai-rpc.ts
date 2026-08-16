/**
 * @bpjs159/compiler — AI RPC Transformer
 *
 * Transforms `ai()` and `aiStream()` calls exactly like `server()`:
 *
 * 1. **Client**: a typed fetch wrapper to `/api/astra/:id`. `aiStream`
 *    wrappers read the response body as a token stream and invoke an
 *    optional client-only `onToken` callback per chunk.
 * 2. **SSR graph / production bundle**: the macro stays intact (runtime
 *    passthrough returns the real function) and the compiler appends an
 *    `rpcHandler` registration that wraps the function with `complete()`
 *    (JSON `{ text }`) or `stream()` (text chunks) from `@bpjs159/ai`.
 * 3. **Pre-build** (`{ type: 'pre-build' }`): the prompt is executed at
 *    BUILD time by the plugin (see `executeAiPreBuild`), the result is
 *    folded into the bundle, and the call ships zero runtime data code.
 *
 * ## Output (client — ai)
 * ```ts
 * const summarize = async (text) => {
 *   const _res = await fetch('/api/astra/summarize', { method: 'POST', ... });
 *   return _res.json();
 * };
 * ```
 *
 * ## Output (client — aiStream)
 * ```ts
 * const chat = async (q, onToken) => {
 *   const _res = await fetch('/api/astra/chat', { method: 'POST', ... });
 *   const _reader = _res.body.getReader(); ...
 *   return _full;
 * };
 * ```
 */

import type { AstraViteConfig } from '../index.js';
import type { AiCallConfig } from '@bpjs159/ai';
import { hashContent } from '../utils/ast.js';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  extractArrowFunctionBody,
  findMatchingParen,
  stripCommentsAndStrings,
  stripTypeAnnotation,
} from './server-rpc.js';

// ─── AI Call Parser ──────────────────────────────────────────────────────────

/** Parsed `ai()` / `aiStream()` call. */
export interface AiCallInfo {
  /** Unique handler id (var name or content hash). */
  id: string;
  /** Resolved AI configuration. */
  config: AiCallConfig;
  /** Prompt function body source. */
  functionBody: string;
  /** Prompt function parameter names. */
  paramNames: string[];
  /** Assigned variable name (if `const foo = ai(...)`). */
  varName: string | null;
  /** Start offset of the whole expression (incl. `const foo = `). */
  start: number;
  /** End offset of the whole expression (incl. trailing `;`). */
  end: number;
  /** True for `aiStream(...)` calls. */
  isStream: boolean;
  /** True for `{ type: 'pre-build' }` calls. */
  isPreBuild: boolean;
}

/** Parses the config object literal of an ai()/aiStream() call. */
function parseAiConfig(configSource: string): AiCallConfig {
  const config: AiCallConfig = {};

  const typeMatch = configSource.match(/type\s*:\s*['"]([^'"]+)['"]/);
  if (typeMatch) config.type = typeMatch[1] as 'pre-build' | 'dynamic';

  const modelMatch = configSource.match(/model\s*:\s*['"]([^'"]+)['"]/);
  if (modelMatch) config.model = modelMatch[1];

  const systemMatch = configSource.match(/system\s*:\s*['"]([^'"]*)['"]/);
  if (systemMatch) config.system = systemMatch[1];

  const temperatureMatch = configSource.match(/temperature\s*:\s*([\d.]+)/);
  if (temperatureMatch) config.temperature = parseFloat(temperatureMatch[1]!);

  const maxTokensMatch = configSource.match(/maxTokens\s*:\s*(\d+)/);
  if (maxTokensMatch) config.maxTokens = parseInt(maxTokensMatch[1]!, 10);

  const tagsMatch = configSource.match(/tags\s*:\s*\[([^\]]*)\]/);
  if (tagsMatch) {
    config.tags = tagsMatch[1]!
      .split(',')
      .map((t) => t.trim().replace(/['"]/g, ''))
      .filter(Boolean);
  }

  const maxAgeMatch = configSource.match(/maxAge\s*:\s*(\d+)/);
  if (maxAgeMatch) config.maxAge = parseInt(maxAgeMatch[1]!, 10);

  return config;
}

/**
 * Finds all `ai(` / `aiStream(` calls in source (same bracket-counting
 * approach as `findServerCalls`; comments/strings are stripped first).
 */
export function findAiCalls(source: string): AiCallInfo[] {
  const results: AiCallInfo[] = [];
  const cleanSource = stripCommentsAndStrings(source);
  const MACROS = ['aiStream', 'ai'];

  for (const macro of MACROS) {
    const needle = `${macro}(`;
    let searchPos = 0;
    while (searchPos < cleanSource.length) {
      const idx = cleanSource.indexOf(needle, searchPos);
      if (idx === -1) break;

      // Word-boundary: not part of another identifier.
      if (idx > 0 && /\w/.test(cleanSource[idx - 1]!)) {
        searchPos = idx + needle.length;
        continue;
      }

      const openParenIdx = idx + macro.length;
      const closeParenIdx = findMatchingParen(cleanSource, openParenIdx);
      if (closeParenIdx === -1) {
        searchPos = idx + needle.length;
        continue;
      }

      let endIdx = closeParenIdx + 1;
      while (endIdx < cleanSource.length && /\s/.test(cleanSource[endIdx]!)) endIdx++;
      if (endIdx < cleanSource.length && cleanSource[endIdx] === ';') endIdx++;

      let varName: string | null = null;
      let startIdx = idx;
      const before = cleanSource.slice(Math.max(0, idx - 50), idx);
      const assignMatch = before.match(/(?:const|let|var)\s+(\w+)\s*=\s*$/);
      if (assignMatch) {
        varName = assignMatch[1]!;
        startIdx = idx - assignMatch[0].length;
      }

      const callText = source.slice(openParenIdx + 1, closeParenIdx);
      const parsed = parseAiCallArgs(callText);
      if (!parsed) {
        searchPos = endIdx;
        continue;
      }

      const { config, paramNames, functionBody } = parsed;
      results.push({
        id: varName ?? hashContent(functionBody.slice(0, 100), 8),
        config,
        functionBody: functionBody.trim(),
        paramNames,
        varName,
        start: startIdx,
        end: endIdx,
        isStream: macro === 'aiStream',
        isPreBuild: config.type === 'pre-build',
      });

      searchPos = endIdx;
    }
  }

  return results;
}

/** Parses `{ config }, async (params) => body` or `async (params) => body`. */
function parseAiCallArgs(callText: string): {
  config: AiCallConfig;
  paramNames: string[];
  functionBody: string;
} | null {
  const withConfigPrefix = callText.match(
    /^\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}\s*,\s*(async\s+)?\(([^)]*)\)\s*=>\s*/
  );
  if (withConfigPrefix) {
    const configSource = `{${withConfigPrefix[1]}}`;
    const config = parseAiConfig(configSource);
    const paramNames = withConfigPrefix[3]!
      .split(',')
      .map((p) => stripTypeAnnotation(p.trim()))
      .filter(Boolean);
    const functionBody = extractArrowFunctionBody(callText.slice(withConfigPrefix[0].length));
    if (functionBody === null) return null;
    return { config, paramNames, functionBody };
  }

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

// ─── Code Generators ─────────────────────────────────────────────────────────

/** Client wrapper for ai() — typed fetch, JSON result. */
export function generateAiClientWrapper(call: AiCallInfo, apiPrefix: string): string {
  const { varName, id, paramNames } = call;
  const endpoint = `${apiPrefix}/${id}`;
  const params = paramNames.join(', ');
  const bodySerialize =
    paramNames.length === 1
      ? `JSON.stringify([${paramNames[0]}])`
      : `JSON.stringify([${params}])`;
  const stub = varName ? `const ${varName} = ` : '';

  if (!call.isStream) {
    return `${stub}async (${params}) => {
  const _res = await fetch('${endpoint}', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: ${bodySerialize}
  });
  if (!_res.ok) {
    const _err = await _res.text();
    let _msg = null;
    try {
      const _body = JSON.parse(_err);
      if (typeof _body?.error === 'string') _msg = _body.error;
    } catch {}
    const _error = new Error(_msg ?? \`[AstraJS AI] \${_res.status}: \${_err}\`);
    _error.status = _res.status;
    throw _error;
  }
  return _res.json();
};`;
  }

  // aiStream: read the response as a token stream; onToken is client-only.
  const onTokenParam = params ? `${params}, onToken` : 'onToken';
  return `${stub}async (${onTokenParam}) => {
  const _res = await fetch('${endpoint}', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: ${bodySerialize}
  });
  if (!_res.ok) {
    const _err = await _res.text();
    let _msg = null;
    try {
      const _body = JSON.parse(_err);
      if (typeof _body?.error === 'string') _msg = _body.error;
    } catch {}
    const _error = new Error(_msg ?? \`[AstraJS AI] \${_res.status}: \${_err}\`);
    _error.status = _res.status;
    throw _error;
  }
  const _reader = _res.body.getReader();
  const _decoder = new TextDecoder();
  let _full = '';
  for (;;) {
    const { done, value } = await _reader.read();
    if (done) break;
    const _chunk = _decoder.decode(value, { stream: true });
    _full += _chunk;
    if (typeof onToken === 'function') onToken(_chunk);
  }
  return _full;
};`;
}

/** Options literal for the generated server registration. */
function registrationOptions(call: AiCallInfo): string {
  const parts: string[] = [];
  if (call.config.model) parts.push(`model: ${JSON.stringify(call.config.model)}`);
  if (call.config.system) parts.push(`system: ${JSON.stringify(call.config.system)}`);
  if (call.config.temperature !== undefined) {
    parts.push(`temperature: ${call.config.temperature}`);
  }
  if (call.config.maxTokens !== undefined) {
    parts.push(`maxTokens: ${call.config.maxTokens}`);
  }
  return `{ ${parts.join(', ')} }`;
}

/**
 * Server-side registration appended to the SSR graph (and production
 * bundle). Wraps the real prompt function with `complete()` / `stream()`
 * from `@bpjs159/ai` and registers it through `rpcHandler`.
 */
export function generateAiServerRegistration(call: AiCallInfo): string {
  const { id, varName, paramNames } = call;
  const params = paramNames.join(', ');
  const promptCall = paramNames.length === 0
    ? `${varName}()`
    : `${varName}(${params})`;
  const aiOptions = registrationOptions(call);
  const cacheOptions = [
    ...(call.config.tags && call.config.tags.length > 0
      ? [`tags: ${JSON.stringify(call.config.tags)}`]
      : []),
    ...(call.config.maxAge ? [`maxAge: ${call.config.maxAge}`] : []),
  ];

  if (call.isStream) {
    return `rpcHandler(${JSON.stringify(id)}, async function* (${params}) {
  const _prompt = await ${promptCall};
  for await (const _chunk of stream(String(_prompt), ${aiOptions})) {
    yield _chunk;
  }
}, { stream: true${cacheOptions.length > 0 ? `, ${cacheOptions.join(', ')}` : ''} });`;
  }

  return `rpcHandler(${JSON.stringify(id)}, async (${params}) => {
  const _prompt = await ${promptCall};
  return { text: await complete(String(_prompt), ${aiOptions}) };
}${cacheOptions.length > 0 ? `, { ${cacheOptions.join(', ')} }` : ''});`;
}

// ─── Source-Level Transformer ────────────────────────────────────────────────

export interface AiTransformResult {
  /** Transformed client source. */
  clientCode: string;
  /** Parsed call metadata. */
  calls: AiCallInfo[];
}

/**
 * Transforms all ai()/aiStream() calls in a source file.
 *
 * `preBuildResults` maps call id → already-computed text so pre-build calls
 * can be folded into constants (execution happens in the plugin, which has
 * access to the project root for the prompt cache).
 */
export function transformAiRPC(
  source: string,
  _filename: string,
  config: AstraViteConfig,
  preBuildResults: Map<string, string> = new Map()
): AiTransformResult {
  const apiPrefix = config.apiPrefix ?? '/api/astra';
  const calls = findAiCalls(source);

  // Apply replacements from the END of the file backwards so earlier
  // offsets stay valid (calls may arrive grouped by macro, not position).
  const ordered = [...calls].sort((a, b) => b.start - a.start);

  let clientCode = source;
  for (const call of ordered) {
    let replacement: string;
    if (call.isPreBuild) {
      const text = preBuildResults.get(call.id);
      if (text === undefined) {
        replacement = `${call.varName ? `const ${call.varName} = ` : ''}/* @astra ai pre-build — execution failed */ undefined;`;
      } else {
        // If the model answered with pure JSON, fold the parsed value;
        // otherwise fold the text contract ({ text }) used by the wrappers.
        let folded: unknown;
        try {
          folded = JSON.parse(text);
        } catch {
          folded = { text };
        }
        replacement = `${call.varName ? `const ${call.varName} = ` : ''}${JSON.stringify(folded)};`;
      }
    } else {
      replacement = generateAiClientWrapper(call, apiPrefix);
    }

    clientCode = clientCode.slice(0, call.start) + replacement + clientCode.slice(call.end);
  }

  return { clientCode, calls };
}

// ─── Build-time execution + prompt cache (Phase 3) ───────────────────────────

/** Stable cache key for a prompt function (model + body). */
export function aiPromptKey(call: AiCallInfo): string {
  return hashContent((call.config.model ?? 'default') + '::' + call.functionBody, 16);
}

function cacheFilePath(root: string): string {
  return join(root, '.astra', 'ai-cache.json');
}

/** Reads the persisted prompt cache (`.astra/ai-cache.json`). */
export function readAiDiskCache(root: string): Record<string, string> {
  try {
    const file = cacheFilePath(root);
    if (!existsSync(file)) return {};
    const parsed = JSON.parse(readFileSync(file, 'utf-8')) as Record<string, string>;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/** Persists a prompt result into the disk cache. */
export function writeAiDiskCache(root: string, key: string, text: string): void {
  try {
    const dir = join(root, '.astra');
    mkdirSync(dir, { recursive: true });
    const file = cacheFilePath(root);
    const current = readAiDiskCache(root);
    current[key] = text;
    writeFileSync(file, JSON.stringify(current, null, 2));
  } catch {
    // Cache is best-effort — never break the build over it.
  }
}

/**
 * Executes a pre-build AI call at build/dev-transform time.
 *
 * The prompt function body runs in isolation (same contract as server()
 * pre-build), then the prompt is completed by the configured provider.
 * Cached by prompt hash (in-memory first, disk second) so repeated
 * transforms and incremental builds don't re-spend tokens.
 */
export async function executeAiPreBuildCall(
  call: AiCallInfo,
  root: string,
  memoryCache: Map<string, string>
): Promise<string | undefined> {
  const key = aiPromptKey(call);

  const fromMemory = memoryCache.get(key);
  if (fromMemory !== undefined) return fromMemory;

  const fromDisk = readAiDiskCache(root)[key];
  if (fromDisk !== undefined) {
    memoryCache.set(key, fromDisk);
    return fromDisk;
  }

  try {
    const { executePrompt } = await import('@bpjs159/ai');
    // Run the prompt body in isolation → the prompt string.
    const promptFn = new Function(
      `return (async function() { ${call.functionBody} })();`
    );
    const prompt = String(await promptFn());
    const text = await executePrompt(prompt, {
      model: call.config.model,
      system: call.config.system,
      temperature: call.config.temperature,
      maxTokens: call.config.maxTokens,
    });
    memoryCache.set(key, text);
    writeAiDiskCache(root, key, text);
    return text;
  } catch (err) {
    console.warn(
      `[AstraJS] AI pre-build execution failed for "${call.id}" ` +
        `(provider unreachable or body depends on module scope):`,
      err instanceof Error ? err.message : err
    );
    return undefined;
  }
}
