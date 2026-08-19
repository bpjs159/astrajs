#!/usr/bin/env node
/**
 * One-shot: collapse astra package deps in examples/ and astra-blog
 * package.json files into a single "astrajs.dev" dependency (subpaths are not
 * valid as dependency names after the rename pass).
 */
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dirs = [join(root, 'examples'), join(root, 'astra-blog')];

const isAstraKey = (k) => k.startsWith('astrajs.dev') || k.startsWith('@bpjs159');

const files = [];
for (const d of dirs) {
  (function walk(p) {
    for (const e of readdirSync(p)) {
      const f = join(p, e);
      const s = statSync(f);
      if (s.isDirectory()) walk(f);
      else if (e === 'package.json') files.push(f);
    }
  })(d);
}

let n = 0;
for (const f of files) {
  const j = JSON.parse(readFileSync(f, 'utf8'));
  let changed = false;
  if (j.dependencies) {
    const kept = {};
    let hadAstra = false;
    for (const [k, v] of Object.entries(j.dependencies)) {
      if (isAstraKey(k)) hadAstra = true;
      else kept[k] = v;
    }
    if (hadAstra) {
      kept['astrajs.dev'] = '0.1.4';
      j.dependencies = kept;
      changed = true;
    }
  }
  if (j.devDependencies) {
    const kept = {};
    let hadCli = false;
    for (const [k, v] of Object.entries(j.devDependencies)) {
      if (isAstraKey(k)) hadCli = true;
      else kept[k] = v;
    }
    if (hadCli) {
      kept['astrajs.dev'] = '0.1.4';
      j.devDependencies = kept;
      changed = true;
    }
  }
  if (changed) {
    n++;
    writeFileSync(f, JSON.stringify(j, null, 2) + '\n');
  }
}
console.log(`✓ package.json actualizados: ${n}`);
