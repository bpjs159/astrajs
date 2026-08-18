/**
 * astrajs.dev/ssr — Public API Entry Point
 *
 * Server-Side Rendering (SSR) and Static Site Generation (SSG) engine.
 *
 * AstraJS SSR is **resumable**: it serializes reactive state into HTML
 * attributes (`astra-data`) and event handlers into attributes (`astra-on:*`)
 * so the client can pick up exactly where the server left off — without
 * re-running components (no hydration).
 *
 * @example
 * ```ts
 * import { renderToString, generateStaticSite } from 'astrajs.dev/ssr';
 *
 * const html = await renderToString({
 *   root: () => <App />,
 *   template: (appHtml) => `<!DOCTYPE html><html><body>${appHtml}</body></html>`,
 * });
 * ```
 */

// ─── Configuration Types ─────────────────────────────────────────────────────

/**
 * A route definition used by the SSG crawler.
 * Matches the shape expected by `astrajs.dev/router` routes.
 */
export interface RouteDefinition {
  path: string;
  children?: RouteDefinition[];
  redirect?: string;
}

/**
 * Configuration for the SSR renderer.
 */
export interface SSRConfig {
  /** The root component to render (typically the app's entry component). */
  root: () => JSX.Element;
  /** Route definitions for the app (used by `renderRoute` and the SSG crawler). */
  routes?: RouteDefinition[];
  /**
   * HTML template wrapper. Receives the rendered app HTML and returns
   * the full HTML document string.
   */
  template?: (appHtml: string) => string;
  /** Whether to minify the output HTML. @default false */
  minify?: boolean;
}

/**
 * Configuration for Static Site Generation (SSG).
 */
export interface SSGConfig extends SSRConfig {
  /** The output directory for generated static files. @default 'dist/static' */
  outDir?: string;
  /**
   * Additional paths to generate beyond those discoverable from routes.
   * Useful for dynamic routes like `/blog/:slug`.
   */
  extraPaths?: string[];
  /** Whether to generate a sitemap.xml. @default true */
  sitemap?: boolean;
  /** The base URL for the site (used in sitemap generation). */
  siteUrl?: string;
  /** Concurrency limit for page generation. @default 4 */
  concurrency?: number;
}

/**
 * Configuration for Incremental Static Regeneration (ISR).
 */
export interface ISRConfig {
  /** Default TTL in seconds before a cached page is revalidated. @default 3600 */
  defaultMaxAge?: number;
  /** Cache storage backend. @default 'memory' */
  storage?: 'memory' | 'file' | 'redis';
}

// ─── Runtime Implementations ─────────────────────────────────────────────────

// SSR Renderer
export { renderToString, renderRoute, generateStaticSite, nodeToHTML } from './renderer.js';

// State Serialization (Resumability)
export {
  serializeState,
  deserializeState,
  astraDataAttr,
  resume,
  bootstrap,
  registerFormResumeHandler,
} from './serialize.js';

// Constant Folding (Pre-Build)
export {
  executePreBuild,
  generatePreBuildCode,
  invalidatePreBuildCache,
  clearPreBuildCache,
  getPreBuildStats,
} from './prebuild.js';
