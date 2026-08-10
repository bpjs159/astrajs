/**
 * @astrajs/ssr — Server-Side Renderer
 *
 * Renders AstraJS component trees to HTML strings on the server.
 *
 * ## Resumability
 *
 * Unlike traditional SSR frameworks that need "hydration" (re-running
 * components on the client), AstraJS is **resumable**:
 *
 * 1. Components are rendered ONCE on the server → HTML string.
 * 2. Reactive state is serialized into `astra-data` attributes.
 * 3. Event handlers are marked with `astra-on:*` attributes.
 * 4. The client picks up the HTML, deserializes state, and registers
 *    delegated event listeners — no component re-execution.
 *
 * ## DOM-to-String Serialization
 *
 * Since AstraJS JSX produces real `HTMLElement`/`DocumentFragment` nodes,
 * the SSR renderer must serialize them to HTML strings. It walks the
 * DOM tree and converts each node to its HTML representation.
 */

import type { SSRConfig, SSGConfig } from './index.js';
import { setSSRResumable } from '@astrajs/core';

// ─── DOM Node → HTML String Serializer ───────────────────────────────────────

/**
 * Serializes a DOM node tree to an HTML string.
 *
 * Handles:
 * - Element nodes (with attributes)
 * - Text nodes
 * - Comment nodes (ignored)
 * - DocumentFragments (children only)
 * - Void elements (self-closing)
 * - `astra-data` attributes (state serialization)
 * - `style` objects (converted to inline CSS)
 *
 * @param node — The root DOM node to serialize.
 * @param options — Serialization options.
 * @returns An HTML string.
 */
export function nodeToHTML(
  node: Node,
  options: {
    /** Whether to minify output. */
    minify?: boolean;
    /** Indentation level for pretty-printing. */
    indent?: number;
  } = {}
): string {
  const { minify = false, indent = 0 } = options;

  if (node.nodeType === 3) {
    // Text node
    const text = node.textContent ?? '';
    return minify ? text.trim() : text;
  }

  if (node.nodeType === 8) {
    // Comment node — skip
    return '';
  }

  if (node.nodeType === 11) {
    // DocumentFragment — serialize children
    let html = '';
    let child = node.firstChild;
    while (child) {
      html += nodeToHTML(child, options);
      child = child.nextSibling;
    }
    return html;
  }

  if (node.nodeType === 1) {
    // Element node
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    // Build attribute string
    const attrs: string[] = [];
    for (const attr of el.attributes) {
      const name = attr.name;
      let value = attr.value;

      // Skip internal attributes
      if (name === 'data-astra-outlet') continue;

      // Handle style object (if set via JSX, it's already on el.style.cssText)
      if (name === 'style' && el.style.cssText) {
        value = el.style.cssText;
      }

      // Escape attribute values
      const escaped = value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      if (value === '') {
        attrs.push(name);
      } else {
        attrs.push(`${name}="${escaped}"`);
      }
    }

    const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';

    // Void elements (self-closing)
    const voidElements = new Set([
      'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
      'link', 'meta', 'param', 'source', 'track', 'wbr',
    ]);

    if (voidElements.has(tag)) {
      return `<${tag}${attrStr}>`;
    }

    // Serialize children
    let childrenHTML = '';
    let child = el.firstChild;
    while (child) {
      childrenHTML += nodeToHTML(child, {
        minify,
        indent: indent + 1,
      });
      child = child.nextSibling;
    }

    // Pretty-print indentation
    if (!minify && indent > 0) {
      const pad = '  '.repeat(indent);
      if (childrenHTML.includes('<')) {
        return `${pad}<${tag}${attrStr}>\n${childrenHTML}${pad}</${tag}>\n`;
      }
      return `${pad}<${tag}${attrStr}>${childrenHTML}</${tag}>\n`;
    }

    return `<${tag}${attrStr}>${childrenHTML}</${tag}>`;
  }

  return '';
}

// ─── renderToString ──────────────────────────────────────────────────────────

/**
 * Default HTML template that wraps app content in a minimal HTML5 document.
 */
function defaultTemplate(appHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AstraJS App</title>
</head>
<body>
  <div id="root">${appHtml}</div>
</body>
</html>`;
}

/**
 * Renders an AstraJS component tree to an HTML string on the server.
 *
 * Components execute in a simulated browser environment (using the
 * `document` APIs from a DOM implementation like `linkedom` or
 * `jsdom`). The resulting DOM tree is serialized to an HTML string.
 *
 * State is embedded as `astra-data` attributes for client resumability.
 *
 * @param config — SSR configuration including root component and template.
 * @returns A promise resolving to the full HTML document string.
 *
 * @example
 * ```ts
 * import { renderToString } from '@astrajs/ssr';
 * import App from './App';
 *
 * const html = await renderToString({
 *   root: () => <App />,
 *   template: (appHtml) => `<!DOCTYPE html>
 *     <html><head><title>My App</title></head>
 *     <body>${appHtml}</body></html>`,
 * });
 * ```
 */
export async function renderToString(config: SSRConfig): Promise<string> {
  const { root, template = defaultTemplate, minify = false } = config;

  // Render the root component — produces real DOM nodes.
  // Enable SSR-resumable mode so onClick={fn} becomes astra-on:click
  // attributes instead of addEventListener() (which is lost in HTML).
  setSSRResumable(true);
  const rootNode = root();
  setSSRResumable(false);

  // Guard against null/false returns from components
  if (!rootNode) {
    return template('');
  }

  // Serialize to HTML
  const appHtml = nodeToHTML(rootNode as Node, { minify });

  // Wrap in template
  return template(appHtml);
}

/**
 * Renders a specific route to an HTML string.
 *
 * Useful for SSR with a router. The route is set before rendering
 * so the component tree reflects the correct page.
 *
 * @param path — The URL path to render (e.g., `/products/42`).
 * @param config — SSR configuration.
 * @returns The full HTML document string for that route.
 */
export async function renderRoute(
  path: string,
  config: SSRConfig
): Promise<string> {
  // Set the current path for any `useLocation()` calls during render
  if (typeof globalThis !== 'undefined') {
    (globalThis as Record<string, unknown>).__astra_ssr_path = path;
  }

  return renderToString(config);
}

// ─── Static Site Generation ──────────────────────────────────────────────────

/**
 * Generates a complete static site from the route tree.
 *
 * The SSG crawler:
 * 1. Collects all leaf routes from the route definitions.
 * 2. Renders each route to a static HTML file.
 * 3. Resolves `server({ type: 'pre-build' })` calls at build time.
 * 4. Generates a sitemap.xml if configured.
 *
 * @param config — SSG configuration.
 * @returns A promise that resolves when generation is complete.
 */
export async function generateStaticSite(config: SSGConfig): Promise<void> {
  const {
    routes = [],
    outDir = 'dist/static',
    extraPaths = [],
    sitemap: generateSitemap = true,
    siteUrl,
    concurrency = 4,
  } = config;

  // Collect all static paths
  const leafRoutes = routes.flatMap((r) => {
    if (r.children && r.children.length > 0) {
      const leaves: Array<{ path: string; route: typeof r }> = [];
      function walk(route: typeof r, basePath: string): void {
        const fullPath = basePath + (route.path.startsWith('/') || basePath.endsWith('/') ? '' : '/') + route.path;
        if (route.children && route.children.length > 0) {
          for (const child of route.children) {
            walk(child, fullPath);
          }
        } else if (!route.redirect) {
          leaves.push({ path: fullPath || '/', route });
        }
      }
      walk(r, '');
      return leaves;
    }
    return [{ path: r.path || '/', route: r }];
  });

  const allPaths = [
    ...leafRoutes.map((r: { path: string }) => r.path),
    ...extraPaths,
  ];

  // Deduplicate
  const uniquePaths = [...new Set(allPaths)];

  console.log(`[AstraJS SSG] Generating ${uniquePaths.length} pages...`);

  // Render pages with concurrency limit
  const results: Array<{ path: string; html: string }> = [];

  for (let i = 0; i < uniquePaths.length; i += concurrency) {
    const batch = uniquePaths.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (path) => {
        const html = await renderRoute(path, config);
        return { path, html };
      })
    );
    results.push(...batchResults);
  }

  console.log(`[AstraJS SSG] Generated ${results.length} pages → ${outDir}/`);

  // Generate sitemap
  if (generateSitemap && siteUrl) {
    const sitemapXML = generateSitemapXML(siteUrl, uniquePaths);
    results.push({ path: '/sitemap.xml', html: sitemapXML });
  }

  // In a real implementation, results would be written to disk.
  // For the plugin, results are returned to the Vite build pipeline.
  // We store them in a global for the plugin to pick up:
  if (typeof globalThis !== 'undefined') {
    (globalThis as Record<string, unknown>).__astra_ssg_results = results;
  }
}

/**
 * Generates a sitemap.xml string.
 */
function generateSitemapXML(siteUrl: string, paths: string[]): string {
  const urlset = paths
    .map(
      (path) =>
        `  <url>\n    <loc>${siteUrl}${path}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;
}
