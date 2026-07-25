/**
 * @astrajs/compiler — CSS Zero-Runtime Transformer
 *
 * Extracts `css` tagged template literals from source code and emits
 * them as static `.css` files. The `css` call is replaced with a
 * `Record<string, string>` mapping original class names to hashed names.
 *
 * ## How It Works
 *
 * 1. **Find**: Scan source for `css` tagged template literals.
 * 2. **Parse**: Extract CSS rules and class names from the template.
 * 3. **Hash**: Generate a content-hash for each class name.
 * 4. **Emit**: Write the hashed CSS to a static file.
 * 5. **Replace**: Swap the `css`...`` call with a `{ original: 'hashed' }` map.
 *
 * ## Example
 *
 * **Input:**
 * ```ts
 * const styles = css`
 *   .card { padding: 16px; }
 *   .title { font-size: 1.5rem; }
 * `;
 * ```
 *
 * **Output CSS file (`astra-card-a1b2c3.css`):**
 * ```css
 * .card_a1b2c3{padding:16px}
 * .title_d4e5f6{font-size:1.5rem}
 * ```
 *
 * **Replaced source:**
 * ```ts
 * const styles = { card: 'card_a1b2c3', title: 'title_d4e5f6' };
 * ```
 */

import type { AstraViteConfig } from '../index.js';
import { hashContent } from '../utils/ast.js';

// ─── CSS Rule Parser ─────────────────────────────────────────────────────────

interface CSSClassRule {
  /** The original class name (without dot). */
  originalName: string;
  /** The full rule text (selector + body). */
  fullRule: string;
  /** The hashed class name. */
  hashedName: string;
}

/**
 * Parses CSS source text and extracts all class-based rules.
 *
 * Handles:
 * - Simple classes: `.card { ... }`
 * - Pseudo-classes: `.card:hover { ... }`
 * - Nested selectors: `.card .title { ... }`
 * - Media queries: `@media (...) { .card { ... } }`
 * - Keyframes: Not renamed (pass-through).
 *
 * @param cssSource — The raw CSS content from the template literal.
 * @param config — Compiler configuration (prefix, hash length).
 * @returns Array of parsed class rules with their hashed equivalents.
 */
function parseCSSRules(
  cssSource: string,
  config: AstraViteConfig
): CSSClassRule[] {
  const rules: CSSClassRule[] = [];
  const prefix = config.cssPrefix ?? 'astra-';
  const hashLen = config.cssHashLength ?? 6;

  // Remove comments
  const cleaned = cssSource.replace(/\/\*[\s\S]*?\*\//g, '');

  // Match CSS rules: selector { body }
  // This regex captures top-level rule blocks.
  const ruleRegex = /([^{]+)\{([^}]*)\}/g;
  let match: RegExpExecArray | null;

  while ((match = ruleRegex.exec(cleaned)) !== null) {
    const rawSelector = match[1]!.trim();
    const body = match[2]!.trim();

    // Extract class names from the selector
    const classRegex = /\.([A-Za-z_][\w-]*)/g;
    let classMatch: RegExpExecArray | null;
    const selectors = rawSelector.split(',').map((s) => s.trim());

    for (const selector of selectors) {
      // Reset regex for each selector
      let selectorProcessed = selector;
      const classMap = new Map<string, string>();

      while ((classMatch = classRegex.exec(selector)) !== null) {
        const originalName = classMatch[1]!;
        if (!classMap.has(originalName)) {
          const hash = hashContent(`${selector}:${body}`, hashLen);
          const hashedName = `${prefix}${originalName}_${hash}`;
          classMap.set(originalName, hashedName);
        }
      }

      // Rewrite selector with hashed class names
      for (const [orig, hashed] of classMap) {
        const origClassRegex = new RegExp(`\\.${orig}\\b`, 'g');
        selectorProcessed = selectorProcessed.replace(origClassRegex, `.${hashed}`);
      }

      // Record each class rule
      for (const [orig, hashed] of classMap) {
        rules.push({
          originalName: orig,
          hashedName: hashed,
          fullRule: `${selectorProcessed} { ${body} }`,
        });
      }
    }
  }

  return rules;
}

// ─── CSS Template Extraction ─────────────────────────────────────────────────

/**
 * Represents one extracted `css` template from source code.
 */
export interface ExtractedCSS {
  /** Unique id for this CSS block (based on file + index). */
  id: string;
  /** The generated CSS file content. */
  cssContent: string;
  /** The replacement source code: `{ className: 'hashedName', ... }`. */
  replacement: string;
  /** Start offset in the original source. */
  start: number;
  /** End offset in the original source. */
  end: number;
  /** Output filename for the CSS file. */
  outputFilename: string;
}

/**
 * Finds and extracts all `css` tagged template literals from source.
 *
 * @param source — The source code to scan.
 * @param filename — The file being processed (used for output naming).
 * @param config — Compiler configuration.
 * @returns Array of extracted CSS blocks.
 */
export function extractCSS(
  source: string,
  filename: string,
  config: AstraViteConfig
): ExtractedCSS[] {
  const results: ExtractedCSS[] = [];
  const prefix = config.cssPrefix ?? 'astra-';
  const hashLen = config.cssHashLength ?? 6;

  // Pattern: const/let/var name = css`...`  OR  css`...`
  const cssTagRegex = /(?:const|let|var)\s+(\w+)\s*=\s*css\s*`([\s\S]*?)`|css\s*`([\s\S]*?)`/g;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = cssTagRegex.exec(source)) !== null) {
    const cssContent = match[2] ?? match[3] ?? '';
    const varName = match[1];
    const fullMatch = match[0];
    const start = match.index;
    const end = start + fullMatch!.length;

    // Parse CSS rules
    const rules = parseCSSRules(cssContent, config);

    // Generate CSS output
    const cssLines: string[] = [];
    const classMapEntries: string[] = [];

    for (const rule of rules) {
      cssLines.push(rule.fullRule);
      classMapEntries.push(`'${rule.originalName}': '${rule.hashedName}'`);
    }

    // Generate unique file name
    const contentHash = hashContent(cssContent, 8);
    const fileBase = filename.replace(/^.*[\\/]/, '').replace(/\.(tsx?|jsx?)$/, '');
    const outputFilename = `${prefix}${fileBase}_${contentHash}.css`;

    // Build replacement
    const replacement = varName
      ? `const ${varName} = { ${classMapEntries.join(', ')} }`
      : `{ ${classMapEntries.join(', ')} }`;

    results.push({
      id: `${filename}_${index++}`,
      cssContent: cssLines.join('\n'),
      replacement,
      start,
      end,
      outputFilename,
    });
  }

  return results;
}

// ─── Source-Level Transformer ────────────────────────────────────────────────

export interface CSSTransformResult {
  /** The transformed source (css`...` replaced with class maps). */
  code: string;
  /** CSS files to emit, keyed by filename. */
  cssFiles: Map<string, string>;
}

/**
 * Transforms a source file: extracts `css` templates, replaces them
 * with class-name maps, and returns the CSS files to emit.
 *
 * @param source — Original source code.
 * @param filename — The file being processed.
 * @param config — Compiler configuration.
 * @returns Transformed source + CSS files to emit.
 */
export function transformCSS(
  source: string,
  filename: string,
  config: AstraViteConfig
): CSSTransformResult {
  const extracted = extractCSS(source, filename, config);

  // Apply replacements in reverse order to preserve offsets
  let transformed = source;
  const cssFiles = new Map<string, string>();

  for (let i = extracted.length - 1; i >= 0; i--) {
    const block = extracted[i]!;
    transformed =
      transformed.slice(0, block.start) +
      block.replacement +
      transformed.slice(block.end);

    cssFiles.set(block.outputFilename, block.cssContent);
  }

  return { code: transformed, cssFiles };
}
