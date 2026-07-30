/**
 * @astrajs/compiler — Public API Entry Point
 *
 * The compiler is a Vite plugin that operates in three phases:
 * 1. **JSX → Vanilla DOM** — Transforms JSX expressions into
 *    `document.createElement` + reactive binding calls.
 * 2. **CSS Extraction** — Hoists `css` tagged template literals into
 *    static `.css` files with content-hash class names.
 * 3. **server Compilation** — Creates API endpoints and replaces
 *    client calls with type-safe fetch wrappers.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite';
 * import astra from '@astrajs/core/vite';
 *
 * export default defineConfig({
 *   plugins: [astra({ cssPrefix: 'app-' })]
 * });
 * ```
 */

// ─── Vite Plugin ─────────────────────────────────────────────────────────────

export { astraVitePlugin, astraVitePlugin as default } from './plugin.js';

// ─── Transformers (for advanced usage) ───────────────────────────────────────

export {
  transformJSX,
  transformCSS,
  transformServerRPC,
  findServerCalls,
} from './transformers/index.js';

export type {
  JSXTransformResult,
  CSSTransformResult,
  ServerTransformResult,
  ServerCallInfo,
  ExtractedCSS,
} from './transformers/index.js';

// ─── Configuration Type ──────────────────────────────────────────────────────

/**
 * Configuration for the AstraJS Vite plugin.
 */
export interface AstraViteConfig {
  /**
   * Output directory for extracted CSS files (relative to Vite's outDir).
   * @default 'assets'
   */
  cssOutput?: string;

  /**
   * Hash length for generated CSS class names.
   * @default 6
   */
  cssHashLength?: number;

  /**
   * Prefix for generated CSS class names.
   * @default 'astra-'
   */
  cssPrefix?: string;

  /**
   * API route prefix for server endpoints.
   * @default '/api/astra'
   */
  apiPrefix?: string;

  /**
   * Enable dev-mode source maps for JSX → DOM transformations.
   * @default true in dev, false in build
   */
  sourceMaps?: boolean;

  /**
   * Custom transform plugins to apply before AstraJS processes the AST.
   */
  preTransformPlugins?: readonly unknown[];

  /**
   * JSX transform mode.
   *
   * - `'dynamic'` (default): Only injects `dynamic()` wrappers around
   *   reactive JSX expressions. The standard JSX runtime handles the rest.
   *   This gives transparent DX — you write plain JSX, the compiler
   *   auto-wraps reactive expressions for Zero-VDOM granular updates.
   *
   * - `'vanilla'`: Full JSX → vanilla DOM transformation. Bypasses the
   *   JSX runtime entirely, generating `document.createElement` +
   *   `bindText`/`bindAttr` calls directly. Best for maximum performance.
   *
   * @default 'dynamic'
   */
  transformMode?: 'dynamic' | 'vanilla';
}

// ─── CSS Macro (Compile-Time Only) ───────────────────────────────────────────

/**
 * CSS Zero-Runtime Macro.
 *
 * The `css` tagged template literal is processed at build time by the
 * AST plugin. The CSS rules are extracted to a static `.css` file, and
 * the template call is replaced with a `Record<string, string>` mapping
 * the original class names to their hashed equivalents.
 *
 * **Zero runtime cost:** The `css` function call is completely removed
 * from the production bundle — only the hash map remains.
 *
 * @param strings — The static parts of the CSS template.
 * @param values — Interpolated values (merged at build time).
 * @returns A map from original class names to hashed class names.
 *
 * @example
 * ```ts
 * const styles = css`
 *   .card { padding: 16px; border-radius: 8px; }
 *   .title { font-size: 1.25rem; }
 * `;
 * // In JSX: <div class={styles.card}><h2 class={styles.title}>Hello</h2></div>
 * ```
 */
export declare function css(
  strings: TemplateStringsArray,
  ...values: (string | number)[]
): Record<string, string>;
