/**
 * prerender.mjs — build-time SSR para astra-traffic.
 *
 * 1. Empaqueta src/ssr-entry.tsx con `vite build --ssr` (jsdom externo).
 * 2. Importa el bundle y renderiza cada ruta con renderToString().
 * 3. Escribe dist/<ruta>/index.html usando el <head> del build cliente.
 */
import { build } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(process.cwd());
const ssrOut = path.join(root, 'dist-ssr');

// ── 1. SSR bundle ────────────────────────────────────────────────────────────
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

// ── 2. Rutas ─────────────────────────────────────────────────────────────────
const routes = ['/'];

// ── 3. Shell + escritura ─────────────────────────────────────────────────────
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

for (const route of routes) {
  const html = await render(route);
  const outDir = path.join(root, 'dist', route === '/' ? '' : route);
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, route === '/' ? 'index.html' : 'index.html');
  // Mantener el wrapper <div id="app"> para que main.tsx pueda re-montar.
  fs.writeFileSync(file, head + '<div id="app">' + html + '</div>' + tail);
  console.log(`✓ ${route || '/'} → ${path.relative(root, file)}`);
}
