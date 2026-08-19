#!/usr/bin/env node
/**
 * deploy-build.mjs — builds every deployable AstraJS app + example into a
 * single staging directory ready for rsync to the production server.
 *
 * Staging layout (mirrors /var/www/astrajs on the server):
 *   site/               astra-site static build
 *   blog/               astra-blog static build
 *   showcase/           astra-showcase build (client + dist/server/server.mjs)
 *   examples/<cat>/<name>/   one dir per example (client + server bundle)
 *   examples/index.html      hub page linking every example
 *   runners/                 run-vercel.mjs (Node (req,res) demo of the real
 *                            emitted Vercel handler; cloudflare runs the REAL
 *                            workerd runtime via wrangler dev instead)
 *   config/                  nginx vhosts + pm2 ecosystem + wrangler reference
 *
 * Usage: node tools/deploy-build.mjs [--stage /path]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STAGE = process.env.ASTRA_STAGE_DIR ?? path.join(process.env.TMPDIR ?? '/tmp', 'astrajs-deploy');
const VITE_BIN = path.join(ROOT, 'node_modules', '.bin', 'vite');

// Wipe the stage first: artifacts removed from this script (e.g. old runner
// shims) must not linger and get rsynced to the server.
fs.rmSync(STAGE, { recursive: true, force: true });
fs.mkdirSync(STAGE, { recursive: true });

const failures = [];

function run(cmd, args, cwd, env = {}) {
  const label = `${path.relative(ROOT, cwd)}: ${cmd} ${args.join(' ')}`;
  process.stdout.write(`\n── ${label}\n`);
  try {
    execFileSync(cmd, args, { cwd, stdio: 'inherit', env: { ...process.env, ...env } });
  } catch (e) {
    failures.push(`${label}\n    ${String(e.stderr ?? e).slice(0, 2000)}`);
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

/** Temporarily replace/restore astra.config.json in a root-relative dir. */
function withConfig(relDir, writeConfig, fn) {
  const dir = path.join(ROOT, relDir);
  const file = path.join(dir, 'astra.config.json');
  const hadFile = fs.existsSync(file);
  const original = hadFile ? fs.readFileSync(file, 'utf-8') : null;
  try {
    if (writeConfig !== undefined) {
      fs.writeFileSync(file, JSON.stringify(writeConfig, null, 2) + '\n');
    }
    fn();
  } finally {
    if (hadFile) fs.writeFileSync(file, original);
    else fs.rmSync(file, { force: true });
  }
}

/** Prefixes each example's RPC api under its own deployment path. */
const prefixFor = (exampleRel) => `/examples/${exampleRel}/api/astra`;
const baseFor = (exampleRel) => `/examples/${exampleRel}/`;
const astraBin = (exampleRel) => {
  // Workspaces hoist bins to the ROOT node_modules — fall back there when the
  // project-local .bin/astra does not exist (fresh workspaces).
  const local = path.join(ROOT, exampleRel, 'node_modules', '.bin', 'astra');
  if (fs.existsSync(local)) return local;
  return path.join(ROOT, 'node_modules', '.bin', 'astra');
};

function checkServerManifest(relDir) {
  const manifestPath = path.join(ROOT, relDir, 'dist', 'astra-server-modules.json');
  if (!fs.existsSync(manifestPath)) {
    console.warn(`⚠️  ${relDir}: no astra-server-modules.json — no dynamic handlers.`);
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  const count = Object.keys(manifest.modules ?? {}).length;
  console.log(`✓ ${relDir}: ${count} server module(s)`);
  if (count === 0) console.warn(`⚠️  ${relDir}: server modules EMPTY — will be static-only.`);
}

// ────────────────────────────────────────────────────────────────────────────
// 1. Top-level apps
// ────────────────────────────────────────────────────────────────────────────
console.log('== astra-site (static) ==');
run(VITE_BIN, ['build'], path.join(ROOT, 'astra-site'));
copyDir(path.join(ROOT, 'astra-site', 'dist'), path.join(STAGE, 'site'));

console.log('== astra-blog (static, pre-built) ==');
run(astraBin('astra-blog'), ['build'], path.join(ROOT, 'astra-blog'));
copyDir(path.join(ROOT, 'astra-blog', 'dist'), path.join(STAGE, 'blog'));

// Showcase ships REAL RPC handlers now: the compiler parses return-type
// annotations on server() arrows, so the node adapter emits a full server
// bundle (dist/server/server.mjs) that runs under pm2 on port 5301.
console.log('== astra-showcase (node adapter) ==');
withConfig('astra-showcase', { adapter: 'node', apiPrefix: '/api/astra' }, () => {
  run(astraBin('astra-showcase'), ['build'], path.join(ROOT, 'astra-showcase'), {
    ASTRA_API_PREFIX: '/api/astra',
  });
});
checkServerManifest('astra-showcase');
copyDir(path.join(ROOT, 'astra-showcase', 'dist'), path.join(STAGE, 'showcase'));

// astra-store — the complete SSR eCommerce example. The node adapter emits the
// RPC server bundle; scripts/prerender.mjs then renders every public route to
// real HTML (SSG-style SSR) into dist/<route>/index.html.
console.log('== astra-store (node adapter + SSR prerender) ==');
withConfig('astra-store', { adapter: 'node', apiPrefix: '/api/astra' }, () => {
  run(astraBin('astra-store'), ['build'], path.join(ROOT, 'astra-store'), {
    ASTRA_API_PREFIX: '/api/astra',
  });
});
run('node', [path.join(ROOT, 'astra-store', 'scripts', 'prerender.mjs')], path.join(ROOT, 'astra-store'));
checkServerManifest('astra-store');
copyDir(path.join(ROOT, 'astra-store', 'dist'), path.join(STAGE, 'store'));

// ────────────────────────────────────────────────────────────────────────────
// 2. Examples — static (plain vite build)
// ────────────────────────────────────────────────────────────────────────────
const STATIC_VITE = [
  'frontend-only/01-simple-state',
  'frontend-only/02-global-state',
  'frontend-only/03-forms',
  'frontend-only/04-routing',
  'frontend-only/05-css-macro',
  'frontend-only/06-conditional-lists',
  'frontend-only/07-async-data',
  'frontend-only/08-lifecycle',
  'frontend-only/09-composition',
  'frontend-only/10-dynamic-attrs',
  'fullstack/10-ssg-prebuilt',
];

for (const ex of STATIC_VITE) {
  console.log(`== ${ex} (static vite) ==`);
  run(VITE_BIN, ['build', `--base=${baseFor(ex)}`], path.join(ROOT, 'examples', ex));
  copyDir(path.join(ROOT, 'examples', ex, 'dist'), path.join(STAGE, 'examples', ex));
}

const STATIC_ASTRA = ['ai/03-build-time', 'deploy/04-static'];
for (const ex of STATIC_ASTRA) {
  console.log(`== ${ex} (static astra) ==`);
  run(astraBin(`examples/${ex}`), ['build', `--base=${baseFor(ex)}`], path.join(ROOT, 'examples', ex), {
    ...(ex === 'ai/03-build-time' ? { ASTRA_AI_PROVIDER: 'mock' } : {}),
  });
  copyDir(path.join(ROOT, 'examples', ex, 'dist'), path.join(STAGE, 'examples', ex));
}

// ────────────────────────────────────────────────────────────────────────────
// 3. Examples — server-backed (unique RPC prefix + adapter)
// ────────────────────────────────────────────────────────────────────────────
const SERVER_NODE = [
  'fullstack/01-server-dynamic',
  'fullstack/02-swr-server',
  'fullstack/03-form-server',
  'fullstack/04-router-server-params',
  'fullstack/05-schema-validation',
  'fullstack/06-optimistic-mutations',
  'fullstack/07-file-upload',
  'fullstack/08-autosync',
  'fullstack/09-resumability',
];

for (const ex of SERVER_NODE) {
  console.log(`== ${ex} (node adapter) ==`);
  const prefix = prefixFor(ex);
  const baseCfg = ex.includes('09-resumability') ? { resumability: true } : {};
  withConfig(`examples/${ex}`, { ...baseCfg, adapter: 'node', apiPrefix: prefix }, () => {
    run(astraBin(`examples/${ex}`), ['build', `--base=${baseFor(ex)}`], path.join(ROOT, 'examples', ex), {
      ASTRA_API_PREFIX: prefix,
    });
  });
  checkServerManifest(`examples/${ex}`);
  copyDir(path.join(ROOT, 'examples', ex, 'dist'), path.join(STAGE, 'examples', ex));
}

for (const ex of ['ai/01-streaming-chat', 'ai/02-tools', 'ai/04-rag']) {
  console.log(`== ${ex} (node adapter + AI) ==`);
  const prefix = prefixFor(ex);
  withConfig(`examples/${ex}`, { adapter: 'node', apiPrefix: prefix }, () => {
    run(astraBin(`examples/${ex}`), ['build', `--base=${baseFor(ex)}`], path.join(ROOT, 'examples', ex), {
      ASTRA_API_PREFIX: prefix,
    });
  });
  checkServerManifest(`examples/${ex}`);
  copyDir(path.join(ROOT, 'examples', ex, 'dist'), path.join(STAGE, 'examples', ex));
}

for (const ex of ['deploy/01-node']) {
  console.log(`== ${ex} (node adapter) ==`);
  const prefix = prefixFor(ex);
  withConfig(`examples/${ex}`, { adapter: 'node', apiPrefix: prefix }, () => {
    run(astraBin(`examples/${ex}`), ['build', `--base=${baseFor(ex)}`], path.join(ROOT, 'examples', ex), {
      ASTRA_API_PREFIX: prefix,
    });
  });
  checkServerManifest(`examples/${ex}`);
  copyDir(path.join(ROOT, 'examples', ex, 'dist'), path.join(STAGE, 'examples', ex));
}

// Vercel + Cloudflare targets: built with their own adapters, then run on the
// box with tiny Node shims (runners/) so the demos actually work behind nginx.
for (const [ex, adapter] of [
  ['deploy/02-vercel', 'vercel'],
  ['deploy/03-cloudflare', 'cloudflare'],
]) {
  console.log(`== ${ex} (${adapter} adapter) ==`);
  const prefix = prefixFor(ex);
  withConfig(`examples/${ex}`, { adapter, apiPrefix: prefix }, () => {
    run(astraBin(`examples/${ex}`), ['build', `--base=${baseFor(ex)}`], path.join(ROOT, 'examples', ex), {
      ASTRA_API_PREFIX: prefix,
    });
  });
  copyDir(path.join(ROOT, 'examples', ex, 'dist'), path.join(STAGE, 'examples', ex));
  if (adapter === 'vercel' && fs.existsSync(path.join(ROOT, 'examples', ex, 'api'))) {
    copyDir(path.join(ROOT, 'examples', ex, 'api'), path.join(STAGE, 'examples', ex, 'api'));
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 4. Runners (vercel Node shim) + wrangler dev config reference
// ────────────────────────────────────────────────────────────────────────────
fs.mkdirSync(path.join(STAGE, 'runners'), { recursive: true });

fs.writeFileSync(
  path.join(STAGE, 'runners', 'run-vercel.mjs'),
  `// Serves a Vercel-emitted api/astra.mjs handler as a plain Node HTTP server.
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';

const handlerPath = process.env.HANDLER;
const port = Number(process.env.PORT ?? 3000);
if (!handlerPath) {
  console.error('HANDLER env is required (path to api/astra.mjs)');
  process.exit(1);
}
const { default: handler } = await import(pathToFileURL(handlerPath).href);
createServer((req, res) => handler(req, res)).listen(port, '127.0.0.1', () => {
  console.log('[vercel-shim] listening on 127.0.0.1:' + port);
});
`
);

// Reference copy of the wrangler dev config used on the server. The LIVE copy
// lives at /home/admin/astrajs-cloudflare/wrangler.toml (outside the webroot).
fs.mkdirSync(path.join(STAGE, 'config'), { recursive: true });
fs.writeFileSync(
  path.join(STAGE, 'config', 'wrangler-cloudflare.toml'),
  `# wrangler dev config for the deployed 03-cloudflare worker (real workerd
# runtime). Live copy: /home/admin/astrajs-cloudflare/wrangler.toml
name = "astra-app"
compatibility_date = "2025-01-01"
main = "/var/www/astrajs/examples/deploy/03-cloudflare/_worker.js"

[assets]
directory = "/var/www/astrajs/examples/deploy/03-cloudflare"
binding = "ASSETS"
not_found_handling = "none"
`
);

// ────────────────────────────────────────────────────────────────────────────
// 5. Examples hub index.html
// ────────────────────────────────────────────────────────────────────────────
const GROUPS = [
  ['Frontend-only', STATIC_VITE.filter((e) => e.startsWith('frontend-only'))],
  ['Fullstack', ['fullstack/01-server-dynamic', 'fullstack/02-swr-server', 'fullstack/03-form-server', 'fullstack/04-router-server-params', 'fullstack/05-schema-validation', 'fullstack/06-optimistic-mutations', 'fullstack/07-file-upload', 'fullstack/08-autosync', 'fullstack/09-resumability', 'fullstack/10-ssg-prebuilt']],
  ['AI', ['ai/01-streaming-chat', 'ai/02-tools', 'ai/03-build-time', 'ai/04-rag']],
  ['Deploy targets', ['deploy/01-node', 'deploy/02-vercel', 'deploy/03-cloudflare', 'deploy/04-static']],
];

const humanize = (name) =>
  name
    .replace(/^\d+-/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/\bSsg\b/g, 'SSG');

const cards = GROUPS.map(
  ([group, items]) => `
    <section class="group">
      <h2>${group}</h2>
      <div class="grid">
        ${items
          .map(
            (ex) => `
        <a class="card" href="/examples/${ex}/">
          <span class="card-num">${ex.split('/')[1]}</span>
          <span class="card-title">${humanize(ex.split('/')[1])}</span>
        </a>`
          )
          .join('')}
      </div>
    </section>`
).join('');

fs.writeFileSync(
  path.join(STAGE, 'examples', 'index.html'),
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>AstraJS Examples — Live demos</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; color: #e2e8f0; line-height: 1.6;
    background: radial-gradient(1200px 600px at 20% -10%, rgba(139,77,255,.12) 0%, rgba(4,6,13,0) 55%), radial-gradient(900px 500px at 90% 110%, rgba(0,223,255,.05) 0%, rgba(4,6,13,0) 60%), #04060d;
    font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  header { padding: 56px 24px 8px; max-width: 1060px; margin: 0 auto; }
  h1 {
    margin: 0; font-size: 34px; letter-spacing: -0.5px;
    background: linear-gradient(135deg,#b84cff 0%,#4d7cff 50%,#00dfff 100%);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  header p { color: #94a3b8; margin: 10px 0 0; max-width: 640px; line-height: 1.55; }
  main { max-width: 1060px; margin: 28px auto 80px; padding: 0 24px; }
  .group h2 {
    font-size: 13px; text-transform: uppercase; letter-spacing: 2.5px;
    color: #64748b; margin: 38px 0 14px; font-weight: 600;
  }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 12px; }
  .card {
    display: flex; flex-direction: column; gap: 10px; text-decoration: none;
    padding: 18px; border-radius: 14px; border: 1px solid rgba(255,255,255,.08);
    background: rgba(255,255,255,.03);
    transition: transform .15s ease, border-color .15s ease;
  }
  .card:hover { transform: translateY(-2px); border-color: rgba(139,77,255,.4); }
  .card-num { font-size: 12px; color: #b84cff; font-variant-numeric: tabular-nums; letter-spacing: 1px; }
  .card-title { color: #dde2ff; font-size: 16px; font-weight: 600; }
  .hub-logo {
    height: 56px; width: auto; display: block; margin-bottom: 14px;
    filter: drop-shadow(0 0 20px rgba(184,76,255,.5)) drop-shadow(0 0 50px rgba(77,124,255,.3)) drop-shadow(0 0 90px rgba(0,223,255,.15));
  }
  .docs-float {
    position: fixed; top: 18px; right: 24px; z-index: 300; text-decoration: none;
    color: #c4a0ff; font-size: .78rem; font-weight: 700; padding: 8px 14px;
    border-radius: 999px; background: rgba(139,77,255,.1); border: 1px solid rgba(139,77,255,.35);
    box-shadow: 0 0 12px rgba(139,77,255,.25); transition: background .15s, border-color .15s;
  }
  .docs-float:hover { background: rgba(139,77,255,.2); border-color: rgba(139,77,255,.6); }
  footer { color: #64748b; text-align: center; padding: 24px; font-size: 13px; }
</style>
</head>
<body>
<a class="docs-float" href="https://astrajs.dev" target="_blank" rel="noopener">Volver a Docs ↗</a>
<header>
  <img class="hub-logo" src="/examples/images/logo_star.png" alt="AstraJS logo" />
  <h1>AstraJS Examples</h1>  <p>Every example from the repository, built for production and served behind
  nginx. Server-backed demos run real RPC handlers in Node — try the forms,
  uploads, AI streaming chat and the deploy-target adapters.</p>
</header>
<main>${cards}</main>
<footer>examples.astrajs.dev · AstraJS — Zero-VDOM, AST-compiled, Proxy-reactive</footer>
</body>
</html>
`
);

// Copy the AstraJS logo (star) for the hub header.
fs.mkdirSync(path.join(STAGE, 'examples', 'images'), { recursive: true });
fs.copyFileSync(
  path.join(ROOT, 'astra-site', 'public', 'images', 'logo_star.png'),
  path.join(STAGE, 'examples', 'images', 'logo_star.png')
);

// ────────────────────────────────────────────────────────────────────────────
// 6. pm2 ecosystem + nginx vhosts
// ────────────────────────────────────────────────────────────────────────────
fs.mkdirSync(path.join(STAGE, 'config'), { recursive: true });

const SERVER_PORT = {
  'fullstack/01-server-dynamic': 5001,
  'fullstack/02-swr-server': 5002,
  'fullstack/03-form-server': 5003,
  'fullstack/04-router-server-params': 5004,
  'fullstack/05-schema-validation': 5005,
  'fullstack/06-optimistic-mutations': 5006,
  'fullstack/07-file-upload': 5007,
  'fullstack/08-autosync': 5008,
  'fullstack/09-resumability': 5009,
  'ai/01-streaming-chat': 5101,
  'ai/02-tools': 5102,
  'ai/04-rag': 5104,
  'deploy/01-node': 5201,
  'deploy/02-vercel': 5202,
  'deploy/03-cloudflare': 5203,
};

const WWW = '/var/www/astrajs';
const apps = [];

// Only register processes for examples whose server bundle was actually
// emitted (examples with unparseable server() calls fall back to
// client-side execution and are deployed as pure static sites).
const hasBundle = (ex) =>
  fs.existsSync(path.join(STAGE, 'examples', ex, 'server', 'server.mjs'));

for (const [ex, port] of Object.entries(SERVER_PORT)) {
  if (ex === 'deploy/02-vercel') {
    if (!fs.existsSync(path.join(STAGE, 'examples', ex, 'api', 'astra.mjs'))) {
      console.warn(`⚠️  ${ex}: no vercel handler emitted — deploying static.`);
      continue;
    }
    apps.push({
      name: 'deploy-02-vercel',
      cwd: `${WWW}/examples/deploy/02-vercel`,
      script: `${WWW}/runners/run-vercel.mjs`,
      env: { PORT: port, HANDLER: `${WWW}/examples/deploy/02-vercel/api/astra.mjs` },
    });
    continue;
  }
  if (ex === 'deploy/03-cloudflare') {
    if (!fs.existsSync(path.join(STAGE, 'examples', ex, '_worker.js'))) {
      console.warn(`⚠️  ${ex}: no worker emitted — deploying static.`);
      continue;
    }
    // REAL Cloudflare runtime: wrangler dev runs the emitted _worker.js inside
    // workerd (not a Node shim). The dev config lives OUTSIDE the webroot at
    // /home/admin/astrajs-cloudflare/wrangler.toml (rsync --delete would wipe
    // anything under /var/www/astrajs). A reference copy ships in
    // config/wrangler-cloudflare.toml.
    apps.push({
      name: 'deploy-03-cloudflare',
      cwd: '/home/admin/astrajs-cloudflare',
      script: '/home/admin/node_modules/.bin/wrangler',
      args: 'dev --port 5203 --ip 127.0.0.1 --log-level warn',
      env: {},
    });
    continue;
  }
  if (!hasBundle(ex)) {
    console.warn(`⚠️  ${ex}: no server bundle emitted — deploying static (client-side fallback).`);
    continue;
  }
  const isAi = ex.startsWith('ai/');
  apps.push({
    name: ex.replace(/[^a-z0-9]+/g, '-').replace(/^0+/, ''),
    cwd: `${WWW}/examples/${ex}`,
    script: 'server/server.mjs',
    env: { PORT: port, ...(isAi ? { ASTRA_AI_PROVIDER: 'mock' } : {}) },
  });
}

// astra-showcase — real RPC backend on its own port (showcase.astrajs.dev)
if (fs.existsSync(path.join(STAGE, 'showcase', 'server', 'server.mjs'))) {
  apps.push({
    name: 'showcase',
    cwd: `${WWW}/showcase`,
    script: 'server/server.mjs',
    env: { PORT: 5301 },
  });
} else {
  console.warn('⚠️  astra-showcase: no server bundle emitted — deploying static (client-side fallback).');
}

// astra-store — SSR eCommerce on its own port (store.astrajs.dev).
// The AI assistant uses the deterministic mock provider in production.
if (fs.existsSync(path.join(STAGE, 'store', 'server', 'server.mjs'))) {
  apps.push({
    name: 'store',
    cwd: `${WWW}/store`,
    script: 'server/server.mjs',
    env: { PORT: 5302, ASTRA_AI_PROVIDER: 'mock' },
  });
} else {
  console.warn('⚠️  astra-store: no server bundle emitted — deploying static only.');
}

fs.writeFileSync(
  path.join(STAGE, 'config', 'ecosystem.config.cjs'),
  `// AUTO-GENERATED by tools/deploy-build.mjs — do not edit.
module.exports = {
  apps: ${JSON.stringify(
    apps.map((a) => ({ ...a, autorestart: true, max_memory_restart: '300M' })),
    null,
    2
  )},
};
`
);

const apiLocations = Object.entries(SERVER_PORT)
  .filter(([ex]) => {
    if (ex === 'deploy/02-vercel') return fs.existsSync(path.join(STAGE, 'examples', ex, 'api', 'astra.mjs'));
    if (ex === 'deploy/03-cloudflare') return fs.existsSync(path.join(STAGE, 'examples', ex, '_worker.js'));
    return hasBundle(ex);
  })
  .map(
    ([ex, port]) => `
    # ${ex}
    location ^~ /examples/${ex}/api/astra/ {
        proxy_pass http://127.0.0.1:${port};
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Connection "";
        proxy_buffering off;
        proxy_read_timeout 300s;
    }`
  )
  .join('\n');

fs.writeFileSync(
  path.join(STAGE, 'config', 'nginx-examples.conf'),
  `# AUTO-GENERATED by tools/deploy-build.mjs — examples.astrajs.dev
server {
    listen 80;
    server_name examples.astrajs.dev;

    root ${WWW};
    index index.html;

    # Hub lives at examples/index.html
    location = / {
        return 301 /examples/;
    }

    # Per-example RPC backends (longest-prefix match wins over static dirs)
${apiLocations}

    # Client-side routed examples need an index.html fallback
    location /examples/frontend-only/04-routing/ {
        try_files $uri $uri/ /examples/frontend-only/04-routing/index.html;
    }
    location /examples/fullstack/04-router-server-params/ {
        try_files $uri $uri/ /examples/fullstack/04-router-server-params/index.html;
    }

    # Hashed build assets — immutable
    location ~* \\.(?:js|mjs|css|png|jpe?g|webp|gif|svg|ico|woff2?|ttf)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
`
);

fs.writeFileSync(
  path.join(STAGE, 'config', 'nginx-astrajs.conf'),
  `# astrajs.dev — main documentation site
server {
    listen 80 default_server;
    server_name astrajs.dev www.astrajs.dev;

    root ${WWW}/site;
    index index.html;

    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
`
);

fs.writeFileSync(
  path.join(STAGE, 'config', 'nginx-blog.conf'),
  `# blog.astrajs.dev
server {
    listen 80;
    server_name blog.astrajs.dev;

    root ${WWW}/blog;
    index index.html;

    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
`
);

fs.writeFileSync(
  path.join(STAGE, 'config', 'nginx-showcase.conf'),
  `# showcase.astrajs.dev — real RPC backend on 127.0.0.1:5301 (pm2 app 'showcase')
server {
    listen 80;
    server_name showcase.astrajs.dev;

    root ${WWW}/showcase;
    index index.html;

    # server() RPC endpoints → node adapter backend
    location ^~ /api/astra/ {
        proxy_pass http://127.0.0.1:5301;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Connection "";
        proxy_buffering off;
        proxy_read_timeout 300s;
    }

    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
`
);

fs.writeFileSync(
  path.join(STAGE, 'config', 'nginx-store.conf'),
  `# store.astrajs.dev — SSR eCommerce (pm2 app 'store' on 127.0.0.1:5302)
server {
    listen 80;
    server_name store.astrajs.dev;

    root ${WWW}/store;
    index index.html;

    # server() RPC endpoints → node adapter backend
    location ^~ /api/astra/ {
        proxy_pass http://127.0.0.1:5302;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Connection "";
        proxy_buffering off;
        proxy_read_timeout 300s;
    }

    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
}
`
);

// ────────────────────────────────────────────────────────────────────────────
// 7. Report
// ────────────────────────────────────────────────────────────────────────────
console.log('\n========================================');
if (failures.length) {
  console.log(`✖ ${failures.length} build(s) FAILED:`);
  for (const f of failures) console.log('\n' + f);
  process.exit(1);
}
console.log(`✓ Staging complete: ${STAGE}`);
console.log('  Next: rsync to server → nginx vhosts → pm2 start');
