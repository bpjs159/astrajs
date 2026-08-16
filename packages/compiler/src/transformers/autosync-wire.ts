/**
 * @bpjs159/compiler — AutoSync Polling Auto-Wiring Transformer
 *
 * When a `server({ autoSync: true, autoSyncInterval })` function is called
 * inside `mounted(() => { ... })`, this transformer auto-appends a real
 * `autoSync(endpoint, onUpdate, { interval })` call — reusing the exact same
 * `.then()` callback as the update handler — and returns its unsubscribe so
 * `mounted()`'s existing unmount cleanup stops the polling automatically.
 *
 * This means calling the server function once inside `mounted()` is enough:
 * the initial `.then()` resolves the first load, and the auto-wired
 * `autoSync()` keeps it fresh (or reflects changes from another client)
 * for as long as the component stays mounted — no separate `autoSync()`
 * call needed, matching the `autoSync`/`autoSyncInterval` config contract.
 *
 * ## Rules (conservative on purpose)
 *
 * 1. Only applies to `mounted(() => { ... })` — block bodies.
 * 2. Skipped if the block already contains a `return` — the developer is
 *    already managing polling/cleanup manually.
 * 3. Only fires when exactly ONE top-level statement in the block matches
 *    `<serverFn>(...).then(<callback>)` where `serverFn` is a tracked
 *    `autoSync: true` server function — ambiguous cases are left untouched.
 *
 * @example
 * ```ts
 * // Input
 * mounted(() => {
 *   getStock().then((data) => { state.level = data.level; });
 * });
 *
 * // Output
 * mounted(() => {
 *   getStock().then((data) => { state.level = data.level; });
 *   return autoSync('/api/astra/getStock', (data) => { state.level = data.level; }, { interval: 5000 });
 * });
 * ```
 */
import * as ts from 'typescript';

export interface AutoSyncCallInfo {
  /** The generated RPC endpoint, e.g. `/api/astra/getStock`. */
  endpoint: string;
  /** Polling interval in ms. */
  interval: number;
}

/** True if a `return` exists anywhere in `node`, not counting nested function bodies. */
function containsReturn(node: ts.Node): boolean {
  let found = false;
  function walk(n: ts.Node): void {
    if (found) return;
    if (ts.isReturnStatement(n)) {
      found = true;
      return;
    }
    if (ts.isFunctionLike(n)) return;
    ts.forEachChild(n, walk);
  }
  ts.forEachChild(node, walk);
  return found;
}

export function autoWireAutoSyncCalls(
  source: string,
  autoSyncCalls: Map<string, AutoSyncCallInfo>
): { code: string; changed: boolean } {
  if (autoSyncCalls.size === 0) {
    return { code: source, changed: false };
  }

  const sourceFile = ts.createSourceFile(
    '__astra_autosync_wire_temp.tsx',
    source,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TSX
  );

  const inserts: Array<{ at: number; text: string }> = [];

  /** Matches `<serverFn>(...).then(<callback>)` for a tracked server fn. */
  function matchAutoSyncThenCall(
    expr: ts.Expression
  ): { info: AutoSyncCallInfo; callback: ts.Expression } | null {
    if (!ts.isCallExpression(expr)) return null;
    if (!ts.isPropertyAccessExpression(expr.expression)) return null;
    if (expr.expression.name.text !== 'then') return null;
    if (expr.arguments.length !== 1) return null;

    const target = expr.expression.expression;
    if (!ts.isCallExpression(target)) return null;
    if (!ts.isIdentifier(target.expression)) return null;

    const info = autoSyncCalls.get(target.expression.text);
    if (!info) return null;

    return { info, callback: expr.arguments[0]! };
  }

  function visit(node: ts.Node): void {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'mounted' &&
      node.arguments.length === 1
    ) {
      const arg = node.arguments[0]!;
      if ((ts.isArrowFunction(arg) || ts.isFunctionExpression(arg)) && ts.isBlock(arg.body)) {
        const block = arg.body;

        if (!containsReturn(block)) {
          const matches: Array<{ info: AutoSyncCallInfo; callback: ts.Expression }> = [];

          for (const stmt of block.statements) {
            if (ts.isExpressionStatement(stmt)) {
              const match = matchAutoSyncThenCall(stmt.expression);
              if (match) matches.push(match);
            }
          }

          if (matches.length === 1) {
            const { info, callback } = matches[0]!;
            const callbackText = callback.getText(sourceFile);
            const closeBrace = block.getEnd() - 1;
            inserts.push({
              at: closeBrace,
              text: `  return autoSync('${info.endpoint}', ${callbackText}, { interval: ${info.interval} });\n`,
            });
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  if (inserts.length === 0) {
    return { code: source, changed: false };
  }

  let result = source;
  for (const i of inserts.sort((a, b) => b.at - a.at)) {
    result = result.slice(0, i.at) + i.text + result.slice(i.at);
  }

  return { code: result, changed: true };
}
