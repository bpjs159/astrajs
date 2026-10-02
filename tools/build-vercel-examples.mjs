#!/usr/bin/env node
/**
 * build-vercel-examples.mjs — builds every example for Vercel into a single
 * project directory (examples-hub/) with ONE central serverless function that
 * routes every example's RPC by prefix (same pattern as the other sites).
 *
 * Output (examples-hub/):
 *   api/astra.mjs                    central router (1 function)
 *   api/_handlers/<cat>/<name>.mjs   each example's self-contained handler
 *   dist/                            hub + static examples (outputDirectory)
 *   vercel.json                      rewrites /examples/.../api/astra → /api/astra
 *
 * Usage: node tools/build-vercel-examples.mjs
 * Then:  vercel build --prod --yes && vercel deploy --prebuilt --prod --yes
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HUB = path.join(ROOT, 'examples-hub');
const VITE_BIN = path.join(ROOT, 'node_modules', '.bin', 'vite');
const ASTRA_BIN = path.join(ROOT, 'node_modules', '.bin', 'astrajs');

fs.rmSync(HUB, { recursive: true, force: true });
fs.mkdirSync(path.join(HUB, 'api', '_handlers'), { recursive: true });
fs.mkdirSync(path.join(HUB, 'dist'), { recursive: true });

const baseFor = (ex) => `/examples/${ex}/`;

function run(cmd, args, cwd, env = {}) {
  process.stdout.write(`\n── ${path.relative(ROOT, cwd)}: ${cmd} ${args.join(' ')}\n`);
  execFileSync(cmd, args, { cwd, stdio: 'inherit', env: { ...process.env, ...env } });
}
function copyDir(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}
function withConfig(relDir, writeConfig, fn) {
  const dir = path.join(ROOT, relDir);
  const file = path.join(dir, 'astra.config.json');
  const hadFile = fs.existsSync(file);
  const original = hadFile ? fs.readFileSync(file, 'utf-8') : null;
  try {
    if (writeConfig !== undefined) fs.writeFileSync(file, JSON.stringify(writeConfig, null, 2) + '\n');
    fn();
  } finally {
    if (hadFile) fs.writeFileSync(file, original);
    else fs.rmSync(file, { force: true });
  }
}

// ── Example lists ───────────────────────────────────────────────────────────
const STATIC_VITE = [
  'frontend/01-simple-state', 'frontend/02-global-state', 'frontend/03-forms',
  'frontend/04-routing', 'frontend/05-css-macro', 'frontend/06-conditional-lists',
  'frontend/07-async-data', 'frontend/08-lifecycle', 'frontend/09-composition',
  'frontend/10-dynamic-attrs', 'fullstack/10-ssg-prebuilt',
];
const STATIC_ASTRA = ['ai/03-build-time', 'deploy/04-static'];
const SERVER_NODE = [
  'fullstack/01-server-dynamic', 'fullstack/02-swr-server', 'fullstack/03-form-server',
  'fullstack/04-router-server-params', 'fullstack/05-schema-validation',
  'fullstack/06-optimistic-mutations', 'fullstack/07-file-upload',
  'fullstack/08-autosync', 'fullstack/09-resumability',
];
const SERVER_AI = ['ai/01-streaming-chat', 'ai/02-tools', 'ai/04-rag'];
const SERVER_DEPLOY = ['deploy/01-node', 'deploy/02-vercel', 'deploy/03-cloudflare'];

// ── 1. Static examples ──────────────────────────────────────────────────────
for (const ex of STATIC_VITE) {
  console.log(`== ${ex} (static vite) ==`);
  run(VITE_BIN, ['build', `--base=${baseFor(ex)}`], path.join(ROOT, 'examples', ex));
  copyDir(path.join(ROOT, 'examples', ex, 'dist'), path.join(HUB, 'dist', 'examples', ex));
}
for (const ex of STATIC_ASTRA) {
  console.log(`== ${ex} (static astra) ==`);
  run(ASTRA_BIN, ['build', `--base=${baseFor(ex)}`], path.join(ROOT, 'examples', ex), {
    ...(ex === 'ai/03-build-time' ? { ASTRA_AI_PROVIDER: 'mock' } : {}),
  });
  copyDir(path.join(ROOT, 'examples', ex, 'dist'), path.join(HUB, 'dist', 'examples', ex));
}

// ── 2. Server-backed examples → handlers + static ───────────────────────────
const SERVER_ALL = [...SERVER_NODE, ...SERVER_AI, ...SERVER_DEPLOY];
const handlerMap = [];
for (const ex of SERVER_ALL) {
  console.log(`== ${ex} (vercel adapter) ==`);
  const apiPrefix = `/api/astra`;
  const baseCfg = ex.includes('09-resumability') ? { resumability: true } : {};
  withConfig(`examples/${ex}`, { ...baseCfg, adapter: 'vercel', apiPrefix }, () => {
    run(ASTRA_BIN, ['build', `--adapter=vercel`, `--base=${baseFor(ex)}`], path.join(ROOT, 'examples', ex), {
      ASTRA_API_PREFIX: apiPrefix,
      ...(ex.startsWith('ai/') ? { ASTRA_AI_PROVIDER: 'mock' } : {}),
    });
  });
  copyDir(path.join(ROOT, 'examples', ex, 'dist'), path.join(HUB, 'dist', 'examples', ex));

  const apiFile = path.join(ROOT, 'examples', ex, 'api', 'astra.mjs');
  if (fs.existsSync(apiFile)) {
    const key = ex.replace(/\//g, '_').replace(/-/g, '_');
    const dest = path.join(HUB, 'api', '_handlers', `${key}.mjs`);
    fs.copyFileSync(apiFile, dest);
    handlerMap.push([key, ex]);
    console.log(`  ✓ handler → _handlers/${key}.mjs`);
  } else {
    console.warn(`  ⚠️  no api/astra.mjs — ${ex} static-only`);
  }
}

// ── 3. Central router ───────────────────────────────────────────────────────
const imports = handlerMap.map(([key]) => `import h_${key} from './_handlers/${key}.mjs';`).join('\n');
const map = handlerMap.map(([key, ex]) => `  '${ex}': h_${key},`).join('\n');

fs.writeFileSync(
  path.join(HUB, 'api', 'astra.mjs'),
  `${imports}

const handlers = {
${map}
};

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  // path: /api/astra?ex=<exampleRel>&handler=<handlerId>
  const ex = url.searchParams.get('ex');
  const handlerId = url.searchParams.get('handler');
  const h = ex ? handlers[ex] : undefined;
  if (!h) { res.statusCode = 404; res.end(JSON.stringify({ error: 'Not found' })); return; }
  url.pathname = \`/examples/\${ex}/api/astra/\${handlerId}\`;
  url.search = '';
  req.url = url.toString();
  return h(req, res);
}
`
);
console.log(`  ✓ central router → api/astra.mjs (${handlerMap.length} handlers)`);

// ── 4. Hub index.html ───────────────────────────────────────────────────────
const GROUPS = [
  ['Frontend', STATIC_VITE.filter((e) => e.startsWith('frontend/'))],
  ['Fullstack', [...SERVER_NODE, 'fullstack/10-ssg-prebuilt']],
  ['AI', ['ai/01-streaming-chat', 'ai/02-tools', 'ai/03-build-time', 'ai/04-rag']],
  ['Deploy targets', ['deploy/01-node', 'deploy/02-vercel', 'deploy/03-cloudflare', 'deploy/04-static']],
];
const humanize = (name) =>
  name.replace(/^\d+-/, '').split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace(/\bSsg\b/g, 'SSG');
const cards = GROUPS.map(
  ([group, items]) => `
    <section class="group">
      <h2>${group}</h2>
      <div class="grid">
        ${items.map((ex) => `
        <a class="card" href="/examples/${ex}/">
          <span class="card-num">${ex.split('/')[1]}</span>
          <span class="card-title">${humanize(ex.split('/')[1])}</span>
        </a>`).join('')}
      </div>
    </section>`
).join('');

fs.writeFileSync(
  path.join(HUB, 'dist', 'examples', 'index.html'),
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>AstraJS Examples — Live demos</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; color: #e2e8f0; line-height: 1.6;
    background: radial-gradient(1200px 600px at 20% -10%, rgba(139,77,255,.12) 0%, rgba(4,6,13,0) 55%), radial-gradient(900px 500px at 90% 110%, rgba(0,223,255,.05) 0%, rgba(4,6,13,0) 60%), #04060d;
    font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; -webkit-font-smoothing: antialiased; }
  header { padding: 56px 24px 8px; max-width: 1060px; margin: 0 auto; }
  h1 { margin: 0; font-size: 34px; letter-spacing: -0.5px;
    background: linear-gradient(135deg,#b84cff 0%,#4d7cff 50%,#00dfff 100%);
    -webkit-background-clip: text; background-clip: text; color: transparent; }
  header p { color: #94a3b8; margin: 10px 0 0; max-width: 640px; line-height: 1.55; }
  main { max-width: 1060px; margin: 28px auto 80px; padding: 0 24px; }
  .group h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 2.5px; color: #64748b; margin: 38px 0 14px; font-weight: 600; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 12px; }
  .card { display: flex; flex-direction: column; gap: 10px; text-decoration: none; padding: 18px; border-radius: 14px; border: 1px solid rgba(255,255,255,.08); background: rgba(255,255,255,.03); transition: transform .15s ease, border-color .15s ease; }
  .card:hover { transform: translateY(-2px); border-color: rgba(139,77,255,.4); }
  .card-num { font-size: 12px; color: #b84cff; font-variant-numeric: tabular-nums; letter-spacing: 1px; }
  .card-title { color: #dde2ff; font-size: 16px; font-weight: 600; }
  .hub-logo { height: 56px; width: auto; display: block; margin-bottom: 14px;
    filter: drop-shadow(0 0 20px rgba(184,76,255,.5)) drop-shadow(0 0 50px rgba(77,124,255,.3)) drop-shadow(0 0 90px rgba(0,223,255,.15)); }
  .docs-float { position: fixed; top: 18px; right: 24px; z-index: 300; text-decoration: none; color: #c4a0ff; font-size: .78rem; font-weight: 700; padding: 8px 14px; border-radius: 999px; background: rgba(139,77,255,.1); border: 1px solid rgba(139,77,255,.35); box-shadow: 0 0 12px rgba(139,77,255,.25); transition: background .15s, border-color .15s; }
  .docs-float:hover { background: rgba(139,77,255,.2); border-color: rgba(139,77,255,.6); }
  footer { color: #64748b; text-align: center; padding: 24px; font-size: 13px; }
</style>
</head>
<body>
<a class="docs-float" href="https://astrajs.dev" target="_blank" rel="noopener">Volver a Docs ↗</a>
<header>
  <img class="hub-logo" src="/examples/images/logo_star.png" alt="AstraJS logo" />
  <h1>AstraJS Examples</h1>  <p>Every example from the repository, built for production and served on
  Vercel. Server-backed demos run real RPC handlers in serverless functions —
  try the forms, uploads, AI streaming chat and the deploy-target adapters.</p>
</header>
<main>${cards}</main>
<footer>examples.astrajs.dev · AstraJS — Zero-VDOM, AST-compiled, Proxy-reactive</footer>
</body>
</html>
`
);
fs.mkdirSync(path.join(HUB, 'dist', 'examples', 'images'), { recursive: true });
fs.copyFileSync(
  path.join(ROOT, 'astra-site', 'public', 'images', 'logo_star.png'),
  path.join(HUB, 'dist', 'examples', 'images', 'logo_star.png')
);

// ── 5. vercel.json ──────────────────────────────────────────────────────────
fs.writeFileSync(
  path.join(HUB, 'vercel.json'),
  JSON.stringify(
    {
      $schema: 'https://openapi.vercel.sh/vercel.json',
      outputDirectory: 'dist',
      rewrites: [
        { source: '/examples/(.*)/api/astra/(.*)', destination: '/api/astra?ex=$1&handler=$2' },
      ],
    },
    null,
    2
  ) + '\n'
);

console.log(`\n✓ examples-hub ready: ${handlerMap.length} handlers, 1 central function`);
console.log(`  deploy: cd examples-hub && vercel build --prod --yes && vercel deploy --prebuilt --prod --yes`);