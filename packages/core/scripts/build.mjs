#!/usr/bin/env node
/**
 * core build — tsc + post-processing.
 *
 * tsc does NOT copy input `.d.ts` files to `dist`, and it strips triple-slash
 * references from emitted `.d.ts` files. But `src/jsx.d.ts` declares the
 * GLOBAL `JSX` namespace that consumer projects need (TypeScript's automatic
 * JSX transform falls back to the global `JSX` namespace when the
 * `jsxImportSource` module doesn't export one).
 *
 * So after compiling we:
 *   1. Copy `src/jsx.d.ts` → `dist/jsx.d.ts` so it ships with the package.
 *   2. Prepend `/// <reference path="./jsx.d.ts" />` to the emitted `.d.ts`
 *      entry points so any consumer that loads them also loads the global
 *      `JSX` namespace (fixes TS7026 "no interface 'JSX.IntrinsicElements'").
 */
import { execSync } from 'node:child_process';
import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// 1. Compile
execSync('tsc', { cwd: root, stdio: 'inherit' });

// 2. Ship the global JSX namespace declaration
cpSync(join(root, 'src', 'jsx.d.ts'), join(root, 'dist', 'jsx.d.ts'));

// 3. Reference it from the emitted .d.ts entry points
const REF = '/// <reference path="./jsx.d.ts" />\n';
for (const f of ['index.d.ts', 'jsx-runtime.d.ts', 'jsx-dev-runtime.d.ts']) {
  const p = join(root, 'dist', f);
  if (!existsSync(p)) continue;
  const content = readFileSync(p, 'utf8');
  if (!content.startsWith(REF)) {
    writeFileSync(p, REF + content);
  }
}
