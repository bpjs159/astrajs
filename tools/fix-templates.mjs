#!/usr/bin/env node
/**
 * One-shot repair of packages/astra/templates after the scope rename:
 * rewrites imports to astrajsx subpaths, collapses package.json deps,
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
  [/import astra from 'astrajsx';/g, "import astra from 'astrajsx/compiler';"],
  [/import \{ route, fallbackRoute \} from 'astrajsx';/g, "import { route, fallbackRoute } from 'astrajsx/router';"],
  [/import \{ route \} from 'astrajsx';/g, "import { route } from 'astrajsx/router';"],
  [/import \{ component, store, mounted \} from 'astrajsx';/g, "import { component, store, mounted } from 'astrajsx/core';"],
  [/import \{ component, store \} from 'astrajsx';/g, "import { component, store } from 'astrajsx/core';"],
  [/import \{ component \} from 'astrajsx';/g, "import { component } from 'astrajsx/core';"],
  [/import \{ store \} from 'astrajsx';/g, "import { store } from 'astrajsx/core';"],
  [/import \{ server \} from 'astrajsx';/g, "import { server } from 'astrajsx/server';"],
  [/import \{ Link \} from 'astrajsx';/g, "import { Link } from 'astrajsx/router';"],
  [/from 'astrajsx';/g, "from 'astrajsx/core';"],
];

const proseRules = [
  [/<strong>astrajsx<\/strong> for isomorphic navigation/g, '<strong>astrajsx/router</strong> for isomorphic navigation'],
  [/<strong> astrajsx<\/strong> for reactive forms/g, '<strong> astrajsx/form</strong> for reactive forms'],
  [/<strong> astrajsx<\/strong> for declarative validation/g, '<strong> astrajsx/schema</strong> for declarative validation'],
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
      j.dependencies = { astrajsx: '^0.1.0' };
      if (j.devDependencies) delete j.devDependencies.astrajsx;
      t = JSON.stringify(j, null, 2) + '\n';
    } catch {
      console.warn(`⚠ JSON inválido, saltando: ${f}`);
    }
  }

  if (f.endsWith('tsconfig.json')) {
    t = t.replace(/"jsxImportSource": "astrajsx"/, '"jsxImportSource": "astrajsx/core"');
  }

  if (f.endsWith('.md')) {
    t = t.replace('`astrajsx` — isomorphic routing', '`astrajsx/router` — isomorphic routing');
    t = t.replace('`jsxImportSource: astrajsx`', '`jsxImportSource: astrajsx/core`');
    t = t.replace('@astrajs', 'astrajsx');
  }

  if (t !== before) {
    changed++;
    writeFileSync(f, t);
  }
}
console.log(`✓ templates reparados: ${changed} archivos`);
