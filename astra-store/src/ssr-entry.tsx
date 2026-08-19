/**
 * SSR entry — bundled by scripts/prerender.mjs (vite build --ssr).
 * Provides a simulated browser (jsdom) and a `render(path)` function that
 * serializes the static page to real HTML via renderToString().
 */
import { JSDOM } from 'jsdom';

// NOTE: keep the constructor string argumentless — the SSR JSX transform is
// not string-aware and would rewrite '<html>' inside a string literal.
// The `url` option gives jsdom a non-opaque origin so localStorage works.
const dom = new JSDOM('', { url: 'http://localhost/' });
const g = globalThis as Record<string, unknown>;
g.document = dom.window.document;
g.window = dom.window;
try {
  // Node exposes a read-only `navigator` global — override via defineProperty.
  Object.defineProperty(globalThis, 'navigator', {
    value: dom.window.navigator,
    configurable: true,
  });
} catch {
  /* navigator already set — ignore */
}
g.HTMLElement = dom.window.HTMLElement;
g.Node = dom.window.Node;
g.localStorage = dom.window.localStorage;
g.location = dom.window.location;
// The SSR transform's generated code references these DOM constructors
// directly — mirror the jsdom window onto the global scope.
g.DocumentFragment = dom.window.DocumentFragment;
g.Element = dom.window.Element;
g.Text = dom.window.Text;
g.Comment = dom.window.Comment;
g.Document = dom.window.Document;

/**
 * Renders `path` to an HTML fragment (the contents of #app).
 */
export async function render(path: string): Promise<string> {
  g.__astra_ssr_path = path;
  const [{ renderToString }, { renderStaticPage }] = await Promise.all([
    import('astrajs.dev/ssr'),
    import('./app-ssr.js'),
  ]);
  const html = await renderToString({
    root: () => renderStaticPage(path),
    template: (appHtml) => appHtml,
    minify: false,
  });
  return html;
}
