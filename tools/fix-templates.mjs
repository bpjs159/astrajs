#!/usr/bin/env node
/**
 * One-shot repair of packages/astra/templates after the scope rename:
 * rewrites imports to astrajs.dev subpaths, collapses package.json deps,
 * fixes tsconfig jsxImportSource and README prose.
 */
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const templatesDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'packages', 'astra', 'templates');

const files = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    statSync(p).isDirectory() ? walk(p) : files.push(p);
  }
})(templatesDir);

const importRules = [
  [/import astra from 'astrajs.dev';/g, "import astra from 'astrajs.dev/compiler';"],
  [/import \{ route, fallbackRoute \} from 'astrajs.dev';/g, "import { route, fallbackRoute } from 'astrajs.dev/router';"],
  [/import \{ route \} from 'astrajs.dev';/g, "import { route } from 'astrajs.dev/router';"],
  [/import \{ component, store, mounted \} from 'astrajs.dev';/g, "import { component, store, mounted } from 'astrajs.dev/core';"],
  [/import \{ component, store \} from 'astrajs.dev';/g, "import { component, store } from 'astrajs.dev/core';"],
  [/import \{ component \} from 'astrajs.dev';/g, "import { component } from 'astrajs.dev/core';"],
  [/import \{ store \} from 'astrajs.dev';/g, "import { store } from 'astrajs.dev/core';"],
  [/import \{ server \} from 'astrajs.dev';/g, "import { server } from 'astrajs.dev/server';"],
  [/import \{ Link \} from 'astrajs.dev';/g, "import { Link } from 'astrajs.dev/router';"],
  [/from 'astrajs.dev';/g, "from 'astrajs.dev/core';"],
];

const proseRules = [
  [/<strong>astrajs.dev<\/strong> for isomorphic navigation/g, '<strong>astrajs.dev/router</strong> for isomorphic navigation'],
  [/<strong> astrajs.dev<\/strong> for reactive forms/g, '<strong> astrajs.dev/form</strong> for reactive forms'],
  [/<strong> astrajs.dev<\/strong> for declarative validation/g, '<strong> astrajs.dev/schema</strong> for declarative validation'],
];

let changed = 0;
for (const f of files) {
  if (!/\.(ts|tsx|json|md)$/.test(f)) continue;
  const before = readFileSync(f, 'utf8');
  let t = before;

  if (/\.(ts|tsx)$/.test(f)) {
    for (const [re, to] of importRules) t = t.replace(re, to);
    for (const [re, to] of proseRules) t = t.replace(re, to);
  }

  if (f.endsWith('package.json')) {
    try {
      const j = JSON.parse(t);
      j.dependencies = { astrajs.dev: '^0.1.0' };
      if (j.devDependencies) delete j.devDependencies.astrajs.dev;
      t = JSON.stringify(j, null, 2) + '\n';
    } catch {
      console.warn(`⚠ JSON inválido, saltando: ${f}`);
    }
  }

  if (f.endsWith('tsconfig.json')) {
    t = t.replace(/"jsxImportSource": "astrajs.dev"/, '"jsxImportSource": "astrajs.dev/core"');
  }

  if (f.endsWith('.md')) {
    t = t.replace('`astrajs.dev` — isomorphic routing', '`astrajs.dev/router` — isomorphic routing');
    t = t.replace('`jsxImportSource: astrajs.dev`', '`jsxImportSource: astrajs.dev/core`');
    t = t.replace('@astrajs', 'astrajs.dev');
  }

  if (t !== before) {
    changed++;
    writeFileSync(f, t);
  }
}
console.log(`✓ templates reparados: ${changed} archivos`);
