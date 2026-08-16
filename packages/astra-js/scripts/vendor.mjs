#!/usr/bin/env node
/**
 * Vendors the built output of every internal @bpjs159/* package into
 * packages/astra-js/vendor so the astrajsx umbrella tarball is fully
 * self-contained (zero external dependencies). Cross-package imports
 * ('@bpjs159/xyz[/sub]') are rewritten to relative paths inside vendor/.
 */
import { cpSync, mkdirSync, rmSync, readdirSync, statSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const umbDir = join(here, '..');
const root = join(umbDir, '..', '..');
const vendorDir = join(umbDir, 'vendor');

const PKGS = ['core', 'compiler', 'server', 'ssr', 'router', 'i18n', 'form', 'schema', 'validation', 'ai', 'adapters'];

rmSync(vendorDir, { recursive: true, force: true });
mkdirSync(vendorDir, { recursive: true });

// 1. Copy each package's dist (skip sourcemaps)
for (const pkg of PKGS) {
  const src = join(root, 'packages', pkg, 'dist');
  if (!existsSync(src)) {
    console.warn(`⚠ missing dist for ${pkg}`);
    continue;
  }
  cpSync(src, join(vendorDir, pkg), {
    recursive: true,
    filter: (s) => !s.endsWith('.map'),
  });
  console.log(`✓ vendored ${pkg}`);
}

// 2. Copy the CLI (bin/lib/templates + its package.json for version lookup)
for (const sub of ['bin', 'lib', 'templates']) {
  const src = join(root, 'packages', 'astra', sub);
  if (existsSync(src)) cpSync(src, join(vendorDir, 'cli', sub), { recursive: true });
}
cpSync(join(root, 'packages', 'astra', 'package.json'), join(vendorDir, 'cli', 'package.json'));
console.log('✓ vendored cli (bin/lib/templates/package.json)');

// 3. Rewrite @bpjs159/* references to relative paths
function walk(dir, fn) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, fn);
    else fn(p);
  }
}
let rewrites = 0;
walk(vendorDir, (file) => {
  if (!/\.(js|mjs|d\.ts)$/.test(file)) return;
  const before = readFileSync(file, 'utf8');
  const after = before.replace(/@bpjs159\/([a-z-]+)(\/[A-Za-z0-9_./-]+)?/g, (m, pkg, sub) => {
    const target = join(vendorDir, pkg, sub ? `${sub}.js` : 'index.js');
    let rel = relative(dirname(file), target).split('\\').join('/');
    if (!rel.startsWith('.')) rel = `./${rel}`;
    return rel;
  });
  if (after !== before) {
    rewrites++;
    writeFileSync(file, after);
  }
});
console.log(`✓ rewrote @bpjs159/* imports in ${rewrites} files`);
