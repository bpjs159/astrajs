// Custom ESM resolve hook: force Solid's CLIENT builds under plain Node.
// By default Node's export conditions resolve solid-js/web and solid-js to
// their dist/server.js builds, which throw "Client-only API called on the
// server side" when render()/h() run against jsdom.
import { pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = join(dirname(fileURLToPath(import.meta.url)), 'node_modules', 'solid-js');

const MAP = {
  'solid-js': join(base, 'dist', 'solid.js'),
  'solid-js/web': join(base, 'web', 'dist', 'web.js'),
  'solid-js/h': join(base, 'h', 'dist', 'h.js'),
  'solid-js/html': join(base, 'html', 'dist', 'html.js'),
};

export async function resolve(specifier, context, nextResolve) {
  const target = MAP[specifier];
  if (target) {
    return { url: pathToFileURL(target).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
