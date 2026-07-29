/**
 * @astrajs/compiler — JSX → Vanilla DOM Transformer
 *
 * ## Transformation Pipeline
 *
 * This transformer converts JSX expressions into native DOM creation calls
 * with fine-grained reactive bindings. Unlike React's `React.createElement`,
 * AstraJS produces imperative DOM construction code that runs ONCE.
 *
 * ## Example Transformation
 *
 * **Input (JSX):**
 * ```tsx
 * const App = () => (
 *   <div class="container">
 *     <h1>{title}</h1>
 *     <button onclick={handleClick}>Click me</button>
 *   </div>
 * );
 * ```
 *
 * **Output (Vanilla JS + Bindings):**
 * ```js
 * import { bindText } from '@astrajs/core';
 *
 * const App = () => {
 *   const _el0 = document.createElement('div');
 *   _el0.className = 'container';
 *
 *   const _el1 = document.createElement('h1');
 *   const _tn0 = document.createTextNode('');
 *   bindText(_tn0, () => String(title));
 *   _el1.appendChild(_tn0);
 *   _el0.appendChild(_el1);
 *
 *   const _el2 = document.createElement('button');
 *   _el2.addEventListener('click', handleClick);
 *   const _tn1 = document.createTextNode('Click me');
 *   _el2.appendChild(_tn1);
 *   _el0.appendChild(_el2);
 *
 *   return _el0;
 * };
 * ```
 *
 * ## Reactive Binding Detection
 *
 * When a JSX expression (`{...}`) contains a reference to a reactive store
 * property, the transformer wraps it in a binding function:
 *
 * - Text expressions → `bindText(textNode, () => String(expr))`
 * - Attribute expressions → `bindAttr(el, attrName, () => String(expr))`
 * - Class toggles → `bindClass(el, className, () => expr)`
 * - Input values → `bindValue(el, () => expr, (v) => { expr = v })`
 *
 * The detection uses simple heuristics:
 * 1. If the expression references a variable initialized with `store()`, it's reactive.
 * 2. If the ancestor scope already has reactive bindings, all expressions are candidates.
 */

import type { AstraViteConfig } from '../index.js';
import { ensureImport } from '../utils/ast.js';
import * as ts from 'typescript';

// ─── Configuration ───────────────────────────────────────────────────────────

interface JSXTransformConfig {
  /** Prefix for generated variable names. */
  varPrefix: string;
  /** Whether to generate source maps. */
  sourceMaps: boolean;
  /** Known reactive store variable names (from `store()` calls). */
  reactiveVars: Set<string>;
}

const DEFAULT_CONFIG: JSXTransformConfig = {
  varPrefix: '_el',
  sourceMaps: false,
  reactiveVars: new Set(),
};

// ─── Counter for unique variable names ───────────────────────────────────────

let elCounter = 0;
let tnCounter = 0;

function resetCounters(): void {
  elCounter = 0;
  tnCounter = 0;
}

function nextEl(): string {
  return `_el${elCounter++}`;
}

function nextTn(): string {
  return `_tn${tnCounter++}`;
}

// ─── JSX Attribute Classification ────────────────────────────────────────────

/**
 * Classifies a JSX attribute into its DOM equivalent.
 */
function classifyAttribute(
  name: string
): { domName: string; isEvent: boolean; isStyle: boolean; isClass: boolean; isRef: boolean; isAstra: boolean } {
  const isEvent = name.startsWith('on');
  const isStyle = name === 'style';
  const isClass = name === 'class' || name === 'className';
  const isRef = name === 'ref';
  const isAstra = name.startsWith('astra-');
  const domName = name === 'className' ? 'class' : name;

  return { domName, isEvent, isStyle, isClass, isRef, isAstra };
}

// ─── Expression Classification ───────────────────────────────────────────────

/**
 * Determines whether a JS expression likely references reactive state.
 * Heuristic: checks if any known reactive variable names appear in the expression.
 */
function isReactiveExpression(expr: string, reactiveVars: Set<string>): boolean {
  for (const varName of reactiveVars) {
    const regex = new RegExp(`\\b${escapeRegex(varName)}\\b`);
    if (regex.test(expr)) return true;
  }
  return false;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── AST-Based Dynamic Expression Wrapping ────────────────────────────────

/**
 * Uses the TypeScript compiler API to traverse the AST and auto-wrap
 * reactive JSX expressions with `dynamic()` for transparent DX.
 *
 * ## Transformation Rules
 *
 * **1. JSX Children `{expr}`:**
 *    - Static literals (string, number, boolean, null, undefined) → untouched
 *    - Reactive expressions (references a store variable) → `dynamic(() => expr)`
 *    - Non-reactive expressions → untouched
 *
 * **2. JSX Attributes `attr={expr}`:**
 *    - Reactive expression → `attr={() => expr}` (lazy getter for bindAttr)
 *    - Otherwise → untouched
 *
 * **3. Optimisation:**
 *    - Expressions already wrapped in `dynamic(...)` are skipped
 *    - `dynamic` is auto-imported from `@astrajs/core` when needed
 *
 * @param source  — The full source code of a .tsx/.jsx file.
 * @param reactiveVars — Set of variable names from `store()` declarations.
 * @returns Transformed source with `dynamic()` wrappers injected.
 */
export function autoWrapDynamic(
  source: string,
  reactiveVars: Set<string>
): { code: string; needsDynamic: boolean } {
  let needsDynamic = false;

  // Parse with TypeScript's JSX-aware parser
  const sourceFile = ts.createSourceFile(
    '__astra_temp.tsx',
    source,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TSX
  );

  // Collect replacements (start, end, newText) — applied in reverse order
  const replacements: Array<{ start: number; end: number; text: string }> = [];

  /** Returns true if the given range falls inside an existing replacement. */
  function isInsideExisting(start: number, end: number): boolean {
    for (const r of replacements) {
      if (start >= r.start && end <= r.end) return true;
    }
    return false;
  }

  /**
   * Checks whether a TypeScript AST node is a static literal that
   * doesn't need reactive wrapping.
   */
  function isStaticLiteral(node: ts.Node): boolean {
    if (ts.isStringLiteral(node)) return true;
    if (ts.isNumericLiteral(node)) return true;
    if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (node.kind === ts.SyntaxKind.FalseKeyword) return true;
    if (node.kind === ts.SyntaxKind.NullKeyword) return true;
    if (node.kind === ts.SyntaxKind.UndefinedKeyword) return true;
    return false;
  }

  /**
   * Checks whether a node is already wrapped in a `dynamic(...)` call.
   */
  function isAlreadyDynamic(node: ts.Node): boolean {
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      if (ts.isIdentifier(callee) && callee.text === 'dynamic') {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns the source text of a node from the original source file.
   */
  function getText(node: ts.Node): string {
    return node.getText(sourceFile);
  }

  /**
   * Checks if the expression references any reactive store variable.
   */
  function referencesReactiveVar(node: ts.Node): boolean {
    // Walk the subtree looking for identifiers that match reactive vars
    let found = false;
    function check(n: ts.Node): void {
      if (found) return;
      if (ts.isIdentifier(n) && reactiveVars.has(n.text)) {
        // Make sure it's a property access (e.g. $.show) not just the var itself
        // Actually, any reference is enough — the heuristic is broad on purpose
        found = true;
        return;
      }
      ts.forEachChild(n, check);
    }
    check(node);
    return found;
  }

  // ── AST Visitor ────────────────────────────────────────────────────────

  function visit(node: ts.Node): void {
    // ── JSX Expression: {expr} ──────────────────────────────────────────
    if (ts.isJsxExpression(node)) {
      const jsxExpr = node as ts.JsxExpression;
      const expr = jsxExpr.expression;

      // Skip empty {} or spread {...props}
      if (!expr || jsxExpr.dotDotDotToken) {
        ts.forEachChild(node, visit);
        return;
      }

      // Skip expressions inside ALL JSX attributes — dynamic() is designed
      // for child expressions (text, conditional, list rendering), not
      // attribute values. Reactive attribute bindings use bindAttr().
      const parent = node.parent;
      if (parent && ts.isJsxAttribute(parent)) {
        ts.forEachChild(node, visit);
        return;
      }

      // Skip static literals
      if (isStaticLiteral(expr)) {
        ts.forEachChild(node, visit);
        return;
      }

      // Skip already wrapped
      if (isAlreadyDynamic(expr)) {
        ts.forEachChild(node, visit);
        return;
      }

      // Check if reactive
      if (referencesReactiveVar(expr)) {
        const exprText = getText(expr);
        const start = expr.getStart(sourceFile);
        const end = expr.getEnd();

        // Skip if this expression is nested inside a larger expression
        // that will already be wrapped (prevents overlapping replacements).
        if (isInsideExisting(start, end)) {
          ts.forEachChild(node, visit);
          return;
        }

        replacements.push({
          start,
          end,
          text: `dynamic(() => (${exprText}))`,
        });
        needsDynamic = true;
      }

      ts.forEachChild(node, visit);
      return;
    }

    // ── JSX Attribute: name={expr} ──────────────────────────────────────
    if (ts.isJsxAttribute(node)) {
      const attr = node as ts.JsxAttribute;
      const initializer = attr.initializer;

      // Only handle {expr} initializers, not string literals ("val")
      if (!initializer || !ts.isJsxExpression(initializer)) {
        ts.forEachChild(node, visit);
        return;
      }

      const jsxExpr = initializer as ts.JsxExpression;
      const expr = jsxExpr.expression;

      if (!expr || jsxExpr.dotDotDotToken) {
        ts.forEachChild(node, visit);
        return;
      }

      // Skip static literals
      if (isStaticLiteral(expr)) {
        ts.forEachChild(node, visit);
        return;
      }

      // Skip event handlers (onClick, etc.) and refs
      const attrName = attr.name.getText(sourceFile);
      if (attrName.startsWith('on') || attrName === 'ref') {
        ts.forEachChild(node, visit);
        return;
      }

      // Skip already wrapped
      if (isAlreadyDynamic(expr)) {
        ts.forEachChild(node, visit);
        return;
      }

      // Check if reactive
      if (referencesReactiveVar(expr)) {
        const exprText = getText(expr);
        const start = expr.getStart(sourceFile);
        const end = expr.getEnd();

        // Skip if nested inside an already-planned replacement
        if (isInsideExisting(start, end)) {
          ts.forEachChild(node, visit);
          return;
        }

        // Wrap as lazy getter for bindAttr
        replacements.push({
          start,
          end,
          text: `() => (${exprText})`,
        });
        // Note: no `dynamic` import needed for attribute getters
      }

      ts.forEachChild(node, visit);
      return;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  // Apply replacements from end to start to preserve offsets
  let result = source;
  for (const r of replacements.sort((a, b) => b.start - a.start)) {
    result = result.slice(0, r.start) + r.text + result.slice(r.end);
  }

  return { code: result, needsDynamic };
}

// ─── Auto-Memoization Transformer ────────────────────────────────────────────

/**
 * Auto-wraps derived arrow functions with `memo()` for automatic
 * lazy evaluation and caching. The developer writes plain arrow functions;
 * the compiler injects `memo()` invisibly.
 *
 * ## Transformation
 *
 * **Input:**
 * ```ts
 * const total = () => ui.x + ui.y;
 * ```
 *
 * **Output (AST-injected):**
 * ```ts
 * import { memo } from '@astrajs/core';
 * const total = memo(() => ui.x + ui.y);
 * ```
 *
 * ## Detection Heuristic
 *
 * A variable declaration is eligible for auto-memoization when:
 * 1. It's initialized with an arrow function (`() => expr`)
 * 2. The arrow body references at least one reactive store variable
 * 3. It's NOT already wrapped in `memo(...)`
 * 4. It's NOT an event handler (name starts with `on` or `handle`)
 * 5. The arrow body is a single expression (not a block with statements)
 *
 * Arrow functions with block bodies (`() => { ... }`) are NOT memoized
 * automatically because they may contain side effects.
 *
 * @param source  — The full source code of a .tsx/.jsx file.
 * @param reactiveVars — Set of variable names from `store()` declarations.
 * @returns Transformed source with `memo()` wrappers injected.
 */
export function autoMemoDerivedFunctions(
  source: string,
  reactiveVars: Set<string>
): { code: string; needsMemo: boolean } {
  let needsMemo = false;

  const sourceFile = ts.createSourceFile(
    '__astra_memo.tsx',
    source,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TSX
  );

  // Collect replacements (start, end, newText) — applied in reverse order
  const replacements: Array<{ start: number; end: number; text: string }> = [];

  /**
   * Returns true if the given range falls inside an existing replacement.
   */
  function isInsideExisting(start: number, end: number): boolean {
    for (const r of replacements) {
      if (start >= r.start && end <= r.end) return true;
    }
    return false;
  }

  /**
   * Checks whether the expression references any reactive store variable.
   * Walks the AST subtree looking for identifiers matching known store vars.
   */
  function referencesReactiveVar(node: ts.Node): boolean {
    let found = false;
    function check(n: ts.Node): void {
      if (found) return;
      if (ts.isIdentifier(n) && reactiveVars.has(n.text)) {
        found = true;
        return;
      }
      ts.forEachChild(n, check);
    }
    check(node);
    return found;
  }

  /**
   * Returns true if the node is a call to `memo(...)`.
   */
  function isAlreadyMemo(node: ts.Node): boolean {
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      if (ts.isIdentifier(callee) && callee.text === 'memo') {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns true if the variable name looks like an event handler.
   * Event handlers should NOT be memoized (they have side effects).
   */
  function isEventHandler(name: string): boolean {
    return /^(on|handle)[A-Z]/.test(name) || name.startsWith('on');
  }

  function visit(node: ts.Node): void {
    // ── Variable declaration: const name = () => expr ──────────────────
    if (ts.isVariableDeclaration(node)) {
      const decl = node as ts.VariableDeclaration;
      const initializer = decl.initializer;
      const name = decl.name;

      // Only process named variables (not destructuring patterns)
      if (!ts.isIdentifier(name)) {
        ts.forEachChild(node, visit);
        return;
      }

      const varName = name.text;

      // Skip event handlers
      if (isEventHandler(varName)) {
        ts.forEachChild(node, visit);
        return;
      }

      // Must have an initializer
      if (!initializer) {
        ts.forEachChild(node, visit);
        return;
      }

      // Must be an arrow function
      if (!ts.isArrowFunction(initializer)) {
        ts.forEachChild(node, visit);
        return;
      }

      // Skip if already wrapped in memo()
      if (isAlreadyMemo(initializer)) {
        ts.forEachChild(node, visit);
        return;
      }

      const arrowFn = initializer as ts.ArrowFunction;

      // Only memoize expression-body arrows with no parameters.
      // Block bodies may have side effects; parameters mean it's called
      // with arguments (e.g. event handlers), so memo is unsafe.
      // isConciseBody is unreliable — use isBlock on the body instead.
      if (ts.isBlock(arrowFn.body) || arrowFn.parameters.length > 0) {
        ts.forEachChild(node, visit);
        return;
      }

      // Check if the body references reactive store variables
      const body = arrowFn.body;
      if (!body) {
        ts.forEachChild(node, visit);
        return;
      }

      if (!referencesReactiveVar(body)) {
        ts.forEachChild(node, visit);
        return;
      }

      // Get the source text of the arrow function
      const start = initializer.getStart(sourceFile);
      const end = initializer.getEnd();

      if (isInsideExisting(start, end)) {
        ts.forEachChild(node, visit);
        return;
      }

      const arrowText = initializer.getText(sourceFile);

      replacements.push({
        start,
        end,
        text: `memo(${arrowText})`,
      });
      needsMemo = true;

      ts.forEachChild(node, visit);
      return;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  // Apply replacements from end to start to preserve offsets
  let result = source;
  for (const r of replacements.sort((a, b) => b.start - a.start)) {
    result = result.slice(0, r.start) + r.text + result.slice(r.end);
  }

  return { code: result, needsMemo };
}

// ─── JSX → DOM Code Generator ────────────────────────────────────────────────

/**
 * Generates vanilla DOM construction code for a JSX element.
 *
 * This is a source-to-source transformer that outputs imperative
 * DOM API calls with optional reactive bindings.
 *
 * @param tag — The HTML tag name or component identifier.
 * @param attrs — Parsed JSX attributes as key-value pairs.
 * @param children — Array of child expressions (source text).
 * @param config — Transform configuration.
 * @returns Generated JavaScript source code.
 */
export function generateDOMCode(
  tag: string,
  attrs: Record<string, { value: string; isExpression: boolean }>,
  children: string[],
  config: JSXTransformConfig = DEFAULT_CONFIG
): { code: string; needsBindText: boolean; needsBindAttr: boolean } {
  const lines: string[] = [];
  let needsBindText = false;
  let needsBindAttr = false;
  const varName = nextEl();

  // Create element
  const isComponent = /^[A-Z]/.test(tag);
  if (isComponent) {
    // Component invocation: just call the function
    const attrObj = Object.entries(attrs)
      .map(([k, v]) => `${k}: ${v.value}`)
      .join(', ');
    lines.push(`const ${varName} = ${tag}({ ${attrObj} });`);
    return { code: lines.join('\n'), needsBindText: false, needsBindAttr: false };
  }

  lines.push(`const ${varName} = document.createElement('${tag}');`);

  // Process attributes
  for (const [attrName, attr] of Object.entries(attrs)) {
    const { domName, isEvent, isStyle, isClass, isRef, isAstra } = classifyAttribute(attrName);

    if (isRef && attr.isExpression) {
      lines.push(`${attr.value}(${varName});`);
      continue;
    }

    if (isEvent && attr.isExpression) {
      const event = attrName.slice(2).toLowerCase();
      lines.push(`${varName}.addEventListener('${event}', ${attr.value});`);
      continue;
    }

    if (isAstra) {
      const value = attr.isExpression ? attr.value : `'${attr.value}'`;
      lines.push(`${varName}.setAttribute('${attrName}', String(${value}));`);
      continue;
    }

    if (isStyle && attr.isExpression) {
      lines.push(`Object.assign(${varName}.style, ${attr.value});`);
      continue;
    }

    if (isClass && attr.isExpression) {
      // Dynamic class — use bindAttr
      needsBindAttr = true;
      lines.push(`bindAttr(${varName}, 'class', () => String(${attr.value}));`);
      continue;
    }

    if (isClass && !attr.isExpression) {
      lines.push(`${varName}.className = '${attr.value}';`);
      continue;
    }

    // Reactive expression attribute
    if (attr.isExpression && isReactiveExpression(attr.value, config.reactiveVars)) {
      needsBindAttr = true;
      lines.push(`bindAttr(${varName}, '${domName}', () => String(${attr.value}));`);
      continue;
    }

    // Static attribute
    if (attr.isExpression) {
      lines.push(`${varName}.setAttribute('${domName}', String(${attr.value}));`);
    } else if (attr.value === 'true') {
      lines.push(`${varName}.setAttribute('${domName}', '');`);
    } else {
      // Escape single quotes in attribute values
      const escaped = attr.value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      lines.push(`${varName}.setAttribute('${domName}', '${escaped}');`);
    }
  }

  // Process children
  for (const child of children) {
    // Check if child is a reactive expression
    if (isReactiveExpression(child, config.reactiveVars)) {
      needsBindText = true;
      const tnVar = nextTn();
      lines.push(`const ${tnVar} = document.createTextNode('');`);
      lines.push(`bindText(${tnVar}, () => String(${child}));`);
      lines.push(`${varName}.appendChild(${tnVar});`);
    } else if (/^["'`]/.test(child) || /^\d/.test(child)) {
      // String or number literal
      lines.push(`${varName}.appendChild(document.createTextNode(${child}));`);
    } else if (child.trim()) {
      // Expression (non-reactive) — might be another element or text
      lines.push(`if (${child} instanceof Node) {`);
      lines.push(`  ${varName}.appendChild(${child});`);
      lines.push(`} else if (${child} != null && ${child} !== false && ${child} !== true) {`);
      lines.push(`  ${varName}.appendChild(document.createTextNode(String(${child})));`);
      lines.push(`}`);
    }
  }

  return { code: lines.join('\n'), needsBindText, needsBindAttr };
}

// ─── Source-Level JSX Transformer ────────────────────────────────────────────

export interface JSXTransformResult {
  code: string;
  needsDynamic: boolean;
  needsBindText: boolean;
  needsBindAttr: boolean;
  needsBindValue: boolean;
  needsBindList: boolean;
}

/**
 * Transforms all JSX expressions in a source file to vanilla DOM code.
 */
export function transformJSX(
  source: string,
  _filename: string,
  _compilerConfig?: AstraViteConfig
): JSXTransformResult {
  resetCounters();

  const config: JSXTransformConfig = {
    ...DEFAULT_CONFIG,
    sourceMaps: _compilerConfig?.sourceMaps ?? false,
  };

  // Detect reactive store variables: const st = store({...})
  const storeRegex = /\b(const|let|var)\s+([\w$]+)(?:\s*:\s*[^=]+)?\s*=\s*(?:store|swr)\s*\(/g;
  let match: RegExpExecArray | null;
  while ((match = storeRegex.exec(source)) !== null) {
    config.reactiveVars.add(match[2]!);
  }

  // Also detect destructured stores: const { x } = store(...)
  // (simplified — full impl would need AST)

  let result = source;
  let needsBindText = false;
  let needsBindAttr = false;
  let needsBindValue = false;
  let needsBindList = false;
  let needsDynamic = false;

  // Find and transform JSX return statements
  // Note: autoWrapDynamic() is NOT called here — the vanilla DOM path
  // handles reactivity via bindText/bindAttr directly. dynamic() wrapping
  // is only used in 'dynamic' mode (see plugin.ts).
  result = _transformJSXBlocks(result, config);

  // Check what bindings are needed from the generated code
  if (result.includes('bindText(')) needsBindText = true;
  if (result.includes('bindAttr(')) needsBindAttr = true;
  if (result.includes('bindValue(')) needsBindValue = true;
  if (result.includes('bindList(')) needsBindList = true;

  // Add needed imports
  const imports: string[] = [];
  if (needsDynamic) imports.push('dynamic');
  if (needsBindText) imports.push('bindText');
  if (needsBindAttr) imports.push('bindAttr');
  if (needsBindValue) imports.push('bindValue');
  if (needsBindList) imports.push('bindList');

  if (imports.length > 0) {
    result = ensureImport(result, '@astrajs/core', imports);
  }

  return { code: result, needsDynamic, needsBindText, needsBindAttr, needsBindValue, needsBindList };
}

/**
 * Finds JSX blocks in source and transforms them to DOM code.
 * Uses manual scanning (not regex) to handle > inside {...} expressions.
 */
function _transformJSXBlocks(
  source: string,
  config: JSXTransformConfig
): string {
  let result = source;
  let changed = true;
  while (changed) {
    changed = false;

    // Find the next <tag that starts a JSX element
    const found = _findNextJSXTag(result);
    if (!found) break;

    const { tag, attrEnd, selfClose, tagStart, tagEnd } = found;

    if (selfClose) {
      const attrsStr = result.slice(tagStart + 1 + tag.length, attrEnd);
      const replacement = _transformElement(tag, attrsStr, [], config);
      result = result.slice(0, tagStart) + replacement + result.slice(tagEnd);
      changed = true;
      continue;
    }

    // Handle Fragment <> ... </>
    if (tag === '') {
      const closeIdx = result.indexOf('</>', tagEnd);
      if (closeIdx === -1) continue;
      const innerContent = result.slice(tagEnd, closeIdx);
      const children = _parseChildren(innerContent, config);
      // Fragment: just concatenate children as a group expression
      const childCodes = children.map(c => {
        if (c.kind === 'element' || c.kind === 'expression') return c.code;
        if (c.kind === 'text') {
          const text = c.value.replace(/\s+/g, ' ').trim();
          return text ? `document.createTextNode('${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}')` : '';
        }
        return '';
      }).filter(Boolean);
      const replacement = childCodes.length === 1 ? childCodes[0]! : `[${childCodes.join(', ')}]`;
      result = result.slice(0, tagStart) + replacement + result.slice(closeIdx + 4);
      changed = true;
      continue;
    }

    // Find matching close tag
    const closeIndex = _findMatchingClose(result, tagStart, tag);
    if (closeIndex === -1) continue;

    const innerContent = result.slice(tagEnd, closeIndex);
    const closeTag = `</${tag}>`;
    const children = _parseChildren(innerContent, config);
    const attrsStr = result.slice(tagStart + 1 + tag.length, attrEnd);

    const replacement = _transformElement(tag, attrsStr, children, config);
    result = result.slice(0, tagStart) + replacement + result.slice(closeIndex + closeTag.length);
    changed = true;
  }

  return result;
}

/**
 * Scans for the next JSX opening tag <TagName ...> or <TagName ... />
 * Properly skips over {...} and "..." blocks when looking for the closing >.
 */
function _findNextJSXTag(
  source: string
): { tag: string; attrEnd: number; selfClose: boolean; tagStart: number; tagEnd: number } | null {
  for (let i = 0; i < source.length - 1; i++) {
    if (source[i] !== '<') continue;
    const next = source[i + 1];
    // Skip </ (close tags) and <! (comments), <? (processing)
    if (next === '!' || next === '?') continue;

    // Fragment: <> ... </>
    if (next === '>' && source[i - 1] !== '/') {
      return { tag: '', attrEnd: i + 1, selfClose: false, tagStart: i, tagEnd: i + 2 };
    }

    // Skip </ (close tags, including </>)
    if (next === '/') continue;

    if (!/[A-Za-z]/.test(next!)) continue;

    // Extract tag name
    const tagMatch = source.slice(i + 1).match(/^([A-Za-z][A-Za-z0-9]*)/);
    if (!tagMatch) continue;
    const tag = tagMatch[1]!;
    const tagStart = i;
    let pos = i + 1 + tag.length;

    // Scan for the closing > of the opening tag, skipping {...} and strings
    let selfClose = false;
    while (pos < source.length) {
      const ch = source[pos];

      if (ch === '/' && source[pos + 1] === '>') {
        // Self-closing />
        selfClose = true;
        const tagEnd = pos + 2;
        return { tag, attrEnd: pos, selfClose, tagStart, tagEnd };
      }

      if (ch === '>') {
        // End of opening tag
        const tagEnd = pos + 1;
        return { tag, attrEnd: pos, selfClose, tagStart, tagEnd };
      }

      if (ch === '{') {
        // Skip JSX expression
        pos = _skipBracedBlock(source, pos);
        continue;
      }

      if (ch === '"') {
        pos = _skipQuotedString(source, pos, '"');
        continue;
      }

      if (ch === "'") {
        pos = _skipQuotedString(source, pos, "'");
        continue;
      }

      pos++;
    }

    // If we got here, the tag never closed
    return null;
  }

  return null;
}

/**
 * Skips a {...} block, handling nested braces.
 */
function _skipBracedBlock(source: string, start: number): number {
  let pos = start + 1; // Skip opening {
  let depth = 1;
  while (pos < source.length && depth > 0) {
    const ch = source[pos];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    else if (ch === '"') { pos = _skipQuotedString(source, pos, '"'); continue; }
    else if (ch === "'") { pos = _skipQuotedString(source, pos, "'"); continue; }
    else if (ch === '`') { pos = _skipTemplateLiteral(source, pos); continue; }
    pos++;
  }
  return pos; // After closing }
}

/**
 * Skips a quoted string.
 */
function _skipQuotedString(source: string, start: number, quote: string): number {
  let pos = start + 1;
  while (pos < source.length) {
    if (source[pos] === '\\') { pos += 2; continue; }
    if (source[pos] === quote) return pos + 1;
    pos++;
  }
  return pos;
}

/**
 * Skips a template literal.
 */
function _skipTemplateLiteral(source: string, start: number): number {
  let pos = start + 1;
  while (pos < source.length) {
    if (source[pos] === '\\') { pos += 2; continue; }
    if (source[pos] === '`') return pos + 1;
    if (source[pos] === '$' && source[pos + 1] === '{') {
      pos += 2;
      pos = _skipBracedBlock(source, pos - 1);
      continue;
    }
    pos++;
  }
  return pos;
}

/**
 * Finds the matching closing tag for a JSX element at the given position.
 */
function _findMatchingClose(source: string, openPos: number, tag: string): number {
  const openTag = `<${tag}`;
  const closeTag = `</${tag}>`;
  let depth = 1;
  let pos = openPos + openTag.length;

  while (pos < source.length && depth > 0) {
    const nextOpen = source.indexOf(`<${tag}`, pos);
    const nextClose = source.indexOf(closeTag, pos);

    if (nextClose === -1) return -1;

    if (nextOpen !== -1 && nextOpen < nextClose) {
      // Check it's actually an opening tag (not a different tag starting with same chars)
      const afterTag = source[nextOpen + tag.length + 1];
      if (afterTag === ' ' || afterTag === '>' || afterTag === '/') {
        depth++;
      }
      pos = nextOpen + tag.length + 1;
    } else {
      depth--;
      if (depth === 0) return nextClose;
      pos = nextClose + closeTag.length;
    }
  }

  return -1;
}

/**
 * Parses children from JSX inner content.
 * Returns typed children: 'text' | 'expression' | 'element'
 */
type ParsedChild =
  | { kind: 'text'; value: string }
  | { kind: 'expression'; code: string }
  | { kind: 'element'; code: string };

function _parseChildren(
  inner: string,
  config: JSXTransformConfig
): ParsedChild[] {
  const children: ParsedChild[] = [];
  let remaining = inner.trim();
  if (!remaining) return children;

  let pos = 0;
  let textBuffer = '';

  while (pos < remaining.length) {
    const ch = remaining[pos];

    if (ch === '{') {
      // Flush text buffer
      if (textBuffer.trim()) {
        children.push({ kind: 'text', value: textBuffer });
        textBuffer = '';
      }
      // Extract expression with balanced braces
      const { expr, endPos } = _extractBracedExpr(remaining, pos);

      // If expression contains JSX, transform it inline
      if (expr.includes('<')) {
        const transformed = _transformExprInline(expr, config);
        children.push({ kind: 'expression', code: transformed });
      } else {
        children.push({ kind: 'expression', code: expr });
      }
      pos = endPos;
      continue;
    }

    if (ch === '<') {
      // This is a child JSX element — transform it inline
      if (textBuffer.trim()) {
        children.push({ kind: 'text', value: textBuffer });
        textBuffer = '';
      }
      // Find the full child JSX subtree
      const subResult = _findNextJSXTag(remaining.slice(pos));
      if (subResult) {
        const childStart = pos + subResult.tagStart;
        if (subResult.selfClose) {
          const childEnd = pos + subResult.tagEnd;
          // Transform this child element
          const transformed = _transformElement(
            subResult.tag,
            remaining.slice(childStart + 1 + subResult.tag.length, pos + subResult.attrEnd),
            [],
            config
          );
          children.push({ kind: 'element', code: transformed });
          pos = childEnd;
          continue;
        }
        // Non-self-closing: find matching close
        const fullRemaining = remaining.slice(pos);
        const closeIdx = _findMatchingClose(fullRemaining, subResult.tagStart, subResult.tag);
        if (closeIdx !== -1) {
          const childEnd = pos + closeIdx + `</${subResult.tag}>`.length;
          const innerContent = remaining.slice(pos + subResult.tagEnd, pos + closeIdx);
          const subChildren = _parseChildren(innerContent, config);
          const attrsStr = remaining.slice(childStart + 1 + subResult.tag.length, pos + subResult.attrEnd);
          const transformed = _transformElement(subResult.tag, attrsStr, subChildren, config);
          children.push({ kind: 'element', code: transformed });
          pos = childEnd;
          continue;
        }
      }
    }

    textBuffer += ch;
    pos++;
  }

  // Flush remaining text
  if (textBuffer.trim()) {
    children.push({ kind: 'text', value: textBuffer });
  }

  return children;
}

/**
 * Transforms JSX elements embedded within an expression (ternaries, and-and, etc).
 * e.g. {'{'}st.show ? LessThanTimer /GreaterThan : LessThanpGreaterThan ...{'}'}
 * becomes: st.show ? Timer({}) : (p-IIFE)()
 */
function _transformExprInline(expr: string, config: JSXTransformConfig): string {
  let result = expr;
  let changed = true;
  let iterations = 0;
  const MAX = 20; // Safety limit

  while (changed && iterations < MAX) {
    changed = false;
    iterations++;

    const found = _findNextJSXTag(result);
    if (!found) break;

    const { tag, attrEnd, selfClose, tagStart, tagEnd } = found;

    if (selfClose) {
      const attrsStr = result.slice(tagStart + 1 + tag.length, attrEnd);
      const replacement = _transformElement(tag, attrsStr, [], config);
      result = result.slice(0, tagStart) + replacement + result.slice(tagEnd);
      changed = true;
      continue;
    }

    // Find matching close tag within the expression
    const closeIndex = _findMatchingClose(result, tagStart, tag);
    if (closeIndex === -1) continue;

    const innerContent = result.slice(tagEnd, closeIndex);
    const closeTag = `</${tag}>`;
    const subChildren = _parseChildren(innerContent, config);
    const attrsStr = result.slice(tagStart + 1 + tag.length, attrEnd);

    const replacement = _transformElement(tag, attrsStr, subChildren, config);
    result = result.slice(0, tagStart) + replacement + result.slice(closeIndex + closeTag.length);
    changed = true;
  }

  return result;
}

/**
 * Extracts a {...} expression handling nested braces.
 */
function _extractBracedExpr(source: string, start: number): { expr: string; endPos: number } {
  let pos = start + 1; // Skip {
  let depth = 1;
  const exprStart = pos;

  while (pos < source.length && depth > 0) {
    const ch = source[pos];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    else if (ch === '"') { pos = _skipQuotedString(source, pos, '"'); continue; }
    else if (ch === "'") { pos = _skipQuotedString(source, pos, "'"); continue; }
    else if (ch === '`') { pos = _skipTemplateLiteral(source, pos); continue; }
    if (depth > 0) pos++;
  }

  return {
    expr: source.slice(exprStart, pos).trim(),
    endPos: pos + 1, // After closing }
  };
}

// TODO: Use this when generating vanilla DOM code strings
// function _escapeForCode(text: string): string {
//   // If it's just text content, quote it
//   const escaped = text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
//   return `'${escaped}'`;
// }

/**
 * Parses JSX attributes from a string like ' class="foo" onClick={handler} disabled'.
 */
function _parseAttrs(attrsStr: string): Record<string, { value: string; isExpression: boolean }> {
  const attrs: Record<string, { value: string; isExpression: boolean }> = {};
  if (!attrsStr.trim()) return attrs;

  let pos = 0;
  const len = attrsStr.length;

  while (pos < len) {
    // Skip whitespace
    while (pos < len && /\s/.test(attrsStr[pos]!)) pos++;
    if (pos >= len) break;

    // Match attribute name
    const nameMatch = attrsStr.slice(pos).match(/^(\w[\w-]*)/);
    if (!nameMatch) break;
    const name = nameMatch[1]!;
    pos += name.length;

    // Skip whitespace before = or next attr
    while (pos < len && /\s/.test(attrsStr[pos]!)) pos++;

    // Check for =
    if (pos < len && attrsStr[pos] === '=') {
      pos++; // Skip =
      while (pos < len && /\s/.test(attrsStr[pos]!)) pos++;

      if (pos >= len) break;

      const ch = attrsStr[pos];
      if (ch === '"') {
        // Quoted string value
        const endQuote = attrsStr.indexOf('"', pos + 1);
        if (endQuote === -1) break;
        attrs[name] = { value: attrsStr.slice(pos + 1, endQuote), isExpression: false };
        pos = endQuote + 1;
      } else if (ch === "'") {
        // Single-quoted string value
        const endQuote = attrsStr.indexOf("'", pos + 1);
        if (endQuote === -1) break;
        attrs[name] = { value: attrsStr.slice(pos + 1, endQuote), isExpression: false };
        pos = endQuote + 1;
      } else if (ch === '{') {
        // Expression value — use balanced brace scanning
        const { expr, endPos } = _extractBracedExpr(attrsStr, pos);
        attrs[name] = { value: expr, isExpression: true };
        pos = endPos;
      } else {
        // Unquoted value (e.g., disabled=true)
        const valMatch = attrsStr.slice(pos).match(/^(\S+)/);
        if (valMatch) {
          attrs[name] = { value: valMatch[1]!, isExpression: false };
          pos += valMatch[1]!.length;
        }
      }
    } else {
      // Boolean attribute (no =)
      attrs[name] = { value: 'true', isExpression: false };
    }
  }

  return attrs;
}

/**
 * Transforms a single JSX element into DOM construction code.
 */
function _transformElement(
  tag: string,
  attrsStr: string,
  children: ParsedChild[],
  config: JSXTransformConfig
): string {
  const attrs = _parseAttrs(attrsStr);

  // Check for bindValue pattern: value={store.prop} with onInput
  const hasValueExpr = attrs['value']?.isExpression && isReactiveExpression(attrs['value'].value, config.reactiveVars);
  const hasOnInput = attrs['onInput'] || attrs['oninput'] || attrs['onChange'] || attrs['onchange'];

  // Check for bindList pattern: .map() in expression children
  const mapChild: { kind: 'expression'; code: string } | undefined = children.find(
    (c): c is { kind: 'expression'; code: string } => c.kind === 'expression' && c.code.includes('.map(')
  );

  if (mapChild) {
    // Transform {items.map(i => <li>...</li>)} into bindList call
    return _generateBindList(tag, attrs, mapChild.code, config);
  }

  if (hasValueExpr && !hasOnInput) {
    // Auto two-way: value={store.prop} → bindValue
    return _generateWithBindValue(tag, attrs, children, config);
  }

  return _generateStandardElement(tag, attrs, children, config);
}

function _generateStandardElement(
  tag: string,
  attrs: Record<string, { value: string; isExpression: boolean }>,
  children: ParsedChild[],
  config: JSXTransformConfig
): string {
  const lines: string[] = [];
  const varName = nextEl();

  const isComponent = /^[A-Z]/.test(tag);
  if (isComponent) {
    // Component call
    const attrParts = Object.entries(attrs)
      .filter(([k]) => k !== 'children')
      .map(([k, v]) => `${k}: ${v.value}`)
      .join(', ');
    return `/* component */ ${tag}({ ${attrParts} })`;
  }

  lines.push(`(/* ${tag} */ () => {`);
  lines.push(`  const ${varName} = document.createElement('${tag}');`);

  for (const [attrName, attr] of Object.entries(attrs)) {
    if (attrName === 'children') continue;
    const { domName, isEvent } = classifyAttribute(attrName);

    if (isEvent && attr.isExpression) {
      const event = attrName.slice(2).toLowerCase();
      lines.push(`  ${varName}.addEventListener('${event}', ${attr.value});`);
    } else if (attr.isExpression && isReactiveExpression(attr.value, config.reactiveVars)) {
      lines.push(`  bindAttr(${varName}, '${domName}', () => String(${attr.value}));`);
    } else if (attr.isExpression) {
      lines.push(`  ${varName}.setAttribute('${domName}', String(${attr.value}));`);
    } else if (attr.value === 'true') {
      lines.push(`  ${varName}.setAttribute('${domName}', '');`);
    } else {
      const escaped = attr.value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      lines.push(`  ${varName}.setAttribute('${domName}', '${escaped}');`);
    }
  }

  for (const child of children) {
    if (child.kind === 'element') {
      // Child is already a transformed DOM IIFE — append it
      lines.push(`  ${varName}.appendChild(${child.code});`);
    } else if (child.kind === 'expression') {
      // If expression already contains transformed JSX (has /* comment marker), cache it
      // component() effect handles conditional re-renders
      if (child.code.includes('/*')) {
        // Cache the expression result to avoid double-evaluation
        const tmpVar = `_tmp${elCounter++}`;
        lines.push(`  const ${tmpVar} = (${child.code});`);
        lines.push(`  ${varName}.appendChild(${tmpVar} instanceof Node ? ${tmpVar} : document.createTextNode(String(${tmpVar} ?? '')));`);
      } else if (isReactiveExpression(child.code, config.reactiveVars)) {
        const tnVar = nextTn();
        lines.push(`  const ${tnVar} = document.createTextNode('');`);
        lines.push(`  bindText(${tnVar}, () => String(${child.code}));`);
        lines.push(`  ${varName}.appendChild(${tnVar});`);
      } else {
        lines.push(`  ${varName}.appendChild(${child.code} instanceof Node ? ${child.code} : document.createTextNode(String(${child.code} ?? '')));`);
      }
    } else if (child.kind === 'text') {
      // Trim and normalize whitespace for text nodes
      const text = child.value.replace(/\s+/g, ' ').trim();
      if (text) {
        const escaped = text.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        lines.push(`  ${varName}.appendChild(document.createTextNode('${escaped}'));`);
      }
    }
  }

  lines.push(`  return ${varName};`);
  lines.push(`})()`);
  return lines.join('\n');
}

function _generateWithBindValue(
  tag: string,
  attrs: Record<string, { value: string; isExpression: boolean }>,
  children: ParsedChild[],
  _config: JSXTransformConfig
): string {
  const lines: string[] = [];
  const varName = nextEl();
  const valueExpr = attrs['value']!.value;

  lines.push(`(/* ${tag}+bindValue */ () => {`);
  lines.push(`  const ${varName} = document.createElement('${tag}');`);

  for (const [attrName, attr] of Object.entries(attrs)) {
    if (attrName === 'children' || attrName === 'value') continue;
    const { domName } = classifyAttribute(attrName);
    if (attr.isExpression) {
      lines.push(`  ${varName}.setAttribute('${domName}', String(${attr.value}));`);
    } else {
      lines.push(`  ${varName}.setAttribute('${domName}', '${attr.value.replace(/'/g, "\\'")}');`);
    }
  }

  // Two-way binding via bindValue
  lines.push(`  bindValue(${varName}, () => String(${valueExpr}), (v) => { ${valueExpr} = v; });`);

  for (const child of children) {
    if (child.kind === 'element') {
      lines.push(`  ${varName}.appendChild(${child.code});`);
    } else if (child.kind === 'text') {
      const text = child.value.replace(/\s+/g, ' ').trim();
      if (text) {
        const escaped = text.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        lines.push(`  ${varName}.appendChild(document.createTextNode('${escaped}'));`);
      }
    }
  }

  lines.push(`  return ${varName};`);
  lines.push(`})()`);
  return lines.join('\n');
}

function _generateBindList(
  tag: string,
  attrs: Record<string, { value: string; isExpression: boolean }>,
  mapExpr: string,
  config: JSXTransformConfig
): string {
  const lines: string[] = [];
  const varName = nextEl();

  // Parse: items.map(item => <li>...</li>)
  const mapMatch = mapExpr.match(/^(\w+(?:\.\w+)*)\.map\(\s*(?:\(?(\w+)\)?\s*=>|(\w+)\s*=>)\s*(.+?)\s*\)\s*$/s);
  if (!mapMatch) return _generateStandardElement(tag, attrs, [], config);

  const arrayExpr = mapMatch[1]!;
  const itemVar = mapMatch[2] || mapMatch[3] || 'item';
  const renderExpr = mapMatch[4]!;

  lines.push(`(/* ${tag}+bindList */ () => {`);
  lines.push(`  const ${varName} = document.createElement('${tag}');`);

  for (const [attrName, attr] of Object.entries(attrs)) {
    if (attrName === 'children') continue;
    const { domName } = classifyAttribute(attrName);
    if (attr.isExpression) {
      lines.push(`  ${varName}.setAttribute('${domName}', String(${attr.value}));`);
    } else {
      lines.push(`  ${varName}.setAttribute('${domName}', '${attr.value.replace(/'/g, "\\'")}');`);
    }
  }

  lines.push(`  bindList(${varName}, () => ${arrayExpr}.map(${itemVar} => (${renderExpr})), (${itemVar}) => (${renderExpr}));`);
  lines.push(`  return ${varName};`);
  lines.push(`})()`);
  return lines.join('\n');
}
