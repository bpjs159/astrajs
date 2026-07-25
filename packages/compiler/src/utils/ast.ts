/**
 * @astrajs/compiler — AST Utility Helpers
 *
 * Low-level utilities for walking and manipulating AST nodes during
 * the JSX → DOM, CSS extraction, and server$ compilation passes.
 *
 * Since AstraJS is a build-time compiler, these utilities operate on
 * source code as strings using pattern matching and structured transforms.
 * In a full implementation, these would use TypeScript's compiler API
 * (@typescript/parser) or Babel for full AST fidelity.
 */

// ─── Source Location ─────────────────────────────────────────────────────────

export interface SourceLocation {
  start: number;
  end: number;
  line: number;
  column: number;
}

/**
 * Computes line/column from a character offset in source.
 */
export function offsetToLocation(
  source: string,
  offset: number
): { line: number; column: number } {
  const before = source.slice(0, offset);
  const line = (before.match(/\n/g)?.length ?? 0) + 1;
  const lastNewline = before.lastIndexOf('\n');
  const column = offset - (lastNewline === -1 ? 0 : lastNewline);
  return { line, column };
}

// ─── String Manipulation ─────────────────────────────────────────────────────

/**
 * Inserts a string at a specific position in source code.
 */
export function spliceSource(
  source: string,
  start: number,
  end: number,
  replacement: string
): string {
  return source.slice(0, start) + replacement + source.slice(end);
}

/**
 * Escapes a string for safe embedding in generated JavaScript.
 */
export function escapeJSString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Escapes a string for safe embedding in HTML attribute values.
 */
export function escapeHTMLAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ─── Hash Generation ─────────────────────────────────────────────────────────

/**
 * Generates a short content hash for CSS class names.
 * Uses a simple FNV-1a hash for deterministic output without crypto dependency.
 *
 * @param content — The CSS rule content to hash.
 * @param length — Length of the hex output (default: 6).
 * @returns A hex string of the specified length.
 */
export function hashContent(content: string, length: number = 6): string {
  // FNV-1a 32-bit
  let hash = 0x811c9dc5;
  for (let i = 0; i < content.length; i++) {
    hash ^= content.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // Convert to unsigned 32-bit hex
  const unsigned = hash >>> 0;
  return unsigned.toString(16).padStart(8, '0').slice(0, length);
}

// ─── Template Literal Parser ─────────────────────────────────────────────────

/**
 * Parses a tagged template literal into its static and dynamic parts.
 *
 * Given source like: css`...content...${expr}...more...`
 * Returns the static string parts and the expression offsets.
 */
export interface ParsedTemplate {
  /** The static string parts (quasis). */
  quasis: string[];
  /** The expressions between quasis (as source text). */
  expressions: string[];
  /** Start offset of the entire template literal. */
  start: number;
  /** End offset of the entire template literal. */
  end: number;
}

/**
 * Extracts the raw content of a tagged template literal from source.
 *
 * This is a simplified parser that handles basic template literals.
 * For production, this would use the TypeScript AST.
 *
 * @param source — The full source string.
 * @param tagStart — Offset of the tag identifier (e.g., `css`).
 * @param tagEnd — Offset right after the tag identifier.
 * @returns The parsed template or null if parsing fails.
 */
export function parseTemplateLiteral(
  source: string,
  tagStart: number,
  tagEnd: number
): ParsedTemplate | null {
  // Find the backtick after the tag
  let pos = tagEnd;
  while (pos < source.length && /\s/.test(source[pos]!)) pos++;

  if (source[pos] !== '`') return null;

  const start = pos;
  const quasis: string[] = [];
  const expressions: string[] = [];
  let current = '';
  pos++; // Skip opening backtick

  while (pos < source.length) {
    const ch = source[pos]!;

    if (ch === '\\') {
      // Escape sequence — capture both chars
      current += source[pos]! + source[pos + 1]!;
      pos += 2;
      continue;
    }

    if (ch === '$' && source[pos + 1] === '{') {
      // Expression start
      quasis.push(current);
      current = '';
      pos += 2;

      // Find matching closing brace
      let depth = 1;
      const exprStart = pos;
      while (pos < source.length && depth > 0) {
        if (source[pos] === '{') depth++;
        else if (source[pos] === '}') depth--;
        if (depth > 0) pos++;
      }
      expressions.push(source.slice(exprStart, pos));
      pos++; // Skip closing brace
      continue;
    }

    if (ch === '`') {
      quasis.push(current);
      return { quasis, expressions, start, end: pos + 1 };
    }

    current += ch;
    pos++;
  }

  return null; // Unterminated template literal
}

// ─── JSX Element Parser ──────────────────────────────────────────────────────

/**
 * Represents a JSX element found in source code.
 */
export interface JSXElementInfo {
  /** The tag name (e.g., 'div', 'MyComponent'). */
  tag: string;
  /** Whether this is a component (starts with uppercase) or intrinsic. */
  isComponent: boolean;
  /** The full JSX source text. */
  source: string;
  /** Start offset in the original source. */
  start: number;
  /** End offset in the original source. */
  end: number;
  /** Parsed attributes. */
  attributes: JSXAttribute[];
  /** Child elements (parsed recursively). */
  children: JSXChildInfo[];
  /** Whether this is a self-closing tag. */
  selfClosing: boolean;
}

export interface JSXAttribute {
  name: string;
  value: string | null; // null for boolean attributes like `disabled`
  /** Whether the value is an expression (`{...}`) or string literal. */
  isExpression: boolean;
  /** Start offset in source. */
  start: number;
  /** End offset in source. */
  end: number;
}

export type JSXChildInfo =
  | { type: 'element'; element: JSXElementInfo }
  | { type: 'expression'; source: string; start: number; end: number }
  | { type: 'text'; value: string; start: number; end: number };

// ─── Import/Export Helpers ───────────────────────────────────────────────────

/**
 * Checks if a source file imports a specific symbol from a module.
 */
export function hasImport(
  source: string,
  moduleSpecifier: string,
  symbol?: string
): boolean {
  const importRegex = symbol
    ? new RegExp(
        `import\\s*\\{[^}]*\\b${symbol}\\b[^}]*\\}\\s*from\\s*['"]${moduleSpecifier}['"]`
      )
    : new RegExp(`from\\s*['"]${moduleSpecifier}['"]`);
  return importRegex.test(source);
}

/**
 * Adds an import statement if it doesn't already exist.
 */
export function ensureImport(
  source: string,
  moduleSpecifier: string,
  symbols: string[]
): string {
  if (symbols.length === 0) return source;

  const existing = new Set<string>();
  const importRegex = new RegExp(
    `import\\s*\\{([^}]*)}\\s*from\\s*['"]${moduleSpecifier}['"]`,
    'g'
  );
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(source)) !== null) {
    match[1]!.split(',').forEach((s) => {
      const trimmed = s.trim();
      if (trimmed) existing.add(trimmed);
    });
  }

  const needed = symbols.filter((s) => !existing.has(s));
  if (needed.length === 0) return source;

  const importStmt = `import { ${needed.join(', ')} } from '${moduleSpecifier}';\n`;

  // Insert after the last existing import
  const lastImportMatch = source.match(/^import\s.+$/gm);
  if (lastImportMatch && lastImportMatch.length > 0) {
    const lastImport = lastImportMatch[lastImportMatch.length - 1]!;
    const lastIdx = source.lastIndexOf(lastImport) + lastImport.length;
    return spliceSource(source, lastIdx, lastIdx, '\n' + importStmt);
  }

  // No imports yet — prepend
  return importStmt + source;
}
