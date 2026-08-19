/**
 * SSR entry — empaquetado por scripts/prerender.mjs (vite build --ssr).
 */
import { JSDOM } from 'jsdom';

const dom = new JSDOM('', { url: 'http://localhost/' });
const g = globalThis as Record<string, unknown>;
g.document = dom.window.document;
g.window = dom.window;
try {
  Object.defineProperty(globalThis, 'navigator', {
    value: dom.window.navigator,
    configurable: true,
  });
} catch {
  /* navigator ya definido — ignorar */
}
g.HTMLElement = dom.window.HTMLElement;
g.Node = dom.window.Node;
g.localStorage = dom.window.localStorage;
g.location = dom.window.location;
g.DocumentFragment = dom.window.DocumentFragment;
g.Element = dom.window.Element;
g.Text = dom.window.Text;
g.Comment = dom.window.Comment;
g.Document = dom.window.Document;
// El runtime de formularios dispara `new Event('input')` usando el global:
// en Node ese constructor no es el de jsdom y dispatchEvent lo rechaza.
g.Event = dom.window.Event;
g.CustomEvent = dom.window.CustomEvent;
g.__astra_ssr__ = true;

export async function render(path: string): Promise<string> {
  g.__astra_ssr_path = path;
  const [{ renderToString }, { App }] = await Promise.all([
    import('astrajs.dev/ssr'),
    import('./app.js'),
  ]);
  const html = await renderToString({
    root: () => App(),
    template: (appHtml: string) => appHtml,
    minify: false,
  });
  return html;
}
