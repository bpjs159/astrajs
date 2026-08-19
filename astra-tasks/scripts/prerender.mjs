/**
 * prerender.mjs — build-time SSR para astra-tasks.
 */
import { build } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(process.cwd());
const ssrOut = path.join(root, 'dist-ssr');

await build({
  root,
  configFile: path.join(root, 'vite.config.ts'),
  logLevel: 'warn',
  build: {
    ssr: 'src/ssr-entry.tsx',
    outDir: 'dist-ssr',
    emptyOutDir: true,
    rollupOptions: {
      external: ['jsdom'],
      output: { entryFileNames: 'entry.mjs', format: 'es' },
    },
  },
});

const entryUrl = pathToFileURL(path.join(ssrOut, 'entry.mjs')).href;
const { render } = await import(entryUrl);

const routes = ['/'];

const shellPath = path.join(root, 'dist', 'index.html');
const marker = '<div id="app"></div>';
const pristineShellPath = path.join(root, '.prerender-shell.html');

let shell = fs.readFileSync(shellPath, 'utf8');
if (shell.includes(marker)) {
  fs.writeFileSync(pristineShellPath, shell);
} else {
  if (!fs.existsSync(pristineShellPath)) {
    console.error('✖ pristine shell missing — run `astra build` first.');
    process.exit(1);
  }
  shell = fs.readFileSync(pristineShellPath, 'utf8');
}

const markerIdx = shell.indexOf(marker);
if (markerIdx === -1) {
  console.error('✖ #app marker not found in the client shell');
  process.exit(1);
}
const head = shell.slice(0, markerIdx);
const tail = shell.slice(markerIdx + marker.length);

let written = 0;
for (const route of routes) {
  const html = await render(route);
  const rel = route === '/' ? 'index.html' : `${route.replace(/^\//, '')}/index.html`;
  const out = path.join(root, 'dist', rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${head}<div id="app">${html}</div>${tail}`);
  written++;
}

console.log(`✓ prerendered ${written} pages → dist/`);
