/**
 * @bpjs159/compiler — mounted() Cleanup Auto-Wiring Transformer
 *
 * `autoSync()` and `watchTags()` are framework-internal APIs (from
 * `@bpjs159/server`) that already return a disposer function. When one is
 * called directly inside `mounted(() => { ... })` without an explicit
 * `return`, this transformer auto-appends the matching `return` so the
 * disposer is wired into `mounted()`'s existing unmount-cleanup mechanism —
 * the developer no longer has to remember `return unsubscribe`.
 *
 * This is safe to special-case (unlike arbitrary user functions) because
 * `autoSync`/`watchTags` are known AstraJS primitives with a documented
 * "returns a disposer" contract.
 *
 * ## Rules (conservative on purpose)
 *
 * 1. Only applies to `mounted(() => { ... })` / `mounted(function () { ... })`
 *    — block bodies, not `mounted(() => expr)`.
 * 2. Skipped entirely if the block already contains a `return` anywhere
 *    (outside nested function bodies) — the developer is already managing
 *    cleanup manually.
 * 3. Only fires when exactly ONE statement in the block calls `autoSync(...)`
 *    or `watchTags(...)` — ambiguous cases (zero or several) are left
 *    untouched rather than guessed at.
 * 4. `const x = autoSync(...)` — `return x;` is appended at the end of the
 *    block (safe regardless of the declaration's position).
 * 5. A bare `autoSync(...);` (result not captured) is only rewritten to
 *    `return autoSync(...);` when it's the LAST statement in the block —
 *    rewriting it in place anywhere else would skip later statements.
 *
 * @example
 * ```ts
 * // Input
 * mounted(() => {
 *   const unsubscribe = autoSync('/api/astra/getStock', onUpdate);
 * });
 *
 * // Output
 * mounted(() => {
 *   const unsubscribe = autoSync('/api/astra/getStock', onUpdate);
 *   return unsubscribe;
 * });
 * ```
 */
import * as ts from 'typescript';

const DISPOSER_FNS = new Set(['autoSync', 'watchTags']);

function isDisposerCall(node: ts.Node): node is ts.CallExpression {
  return (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    DISPOSER_FNS.has(node.expression.text)
  );
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
    if (ts.isFunctionLike(n)) return; // returns inside nested closures aren't ours
    ts.forEachChild(n, walk);
  }
  ts.forEachChild(node, walk);
  return found;
}

export function autoWrapMountedCleanup(source: string): { code: string; changed: boolean } {
  const sourceFile = ts.createSourceFile(
    '__astra_mounted_temp.tsx',
    source,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TSX
  );

  const inserts: Array<{ at: number; text: string }> = [];
  const rewrites: Array<{ start: number; end: number; text: string }> = [];

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
          const candidates: Array<{ start: number; end: number; text: string }> = [];
          const lastStmt = block.statements[block.statements.length - 1];

          for (const stmt of block.statements) {
            if (ts.isExpressionStatement(stmt) && isDisposerCall(stmt.expression)) {
              // Only safe to rewrite in place when it's the final statement —
              // otherwise an early `return` would skip whatever follows.
              if (stmt !== lastStmt) continue;
              candidates.push({
                start: stmt.getStart(sourceFile),
                end: stmt.getEnd(),
                text: `return ${stmt.expression.getText(sourceFile)};`,
              });
            } else if (
              ts.isVariableStatement(stmt) &&
              stmt.declarationList.declarations.length === 1
            ) {
              const decl = stmt.declarationList.declarations[0]!;
              if (decl.initializer && isDisposerCall(decl.initializer) && ts.isIdentifier(decl.name)) {
                const closeBrace = block.getEnd() - 1; // position of the block's `}`
                candidates.push({
                  start: closeBrace,
                  end: closeBrace,
                  text: `  return ${decl.name.text};\n`,
                });
              }
            }
          }

          if (candidates.length === 1) {
            const [only] = candidates;
            if (only!.start === only!.end) {
              inserts.push({ at: only!.start, text: only!.text });
            } else {
              rewrites.push(only!);
            }
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  if (inserts.length === 0 && rewrites.length === 0) {
    return { code: source, changed: false };
  }

  const edits = [
    ...rewrites,
    ...inserts.map((i) => ({ start: i.at, end: i.at, text: i.text })),
  ].sort((a, b) => b.start - a.start);

  let result = source;
  for (const e of edits) {
    result = result.slice(0, e.start) + e.text + result.slice(e.end);
  }

  return { code: result, changed: true };
}
