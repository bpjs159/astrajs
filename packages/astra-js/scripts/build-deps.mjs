#!/usr/bin/env node
/**
 * astrajs.dev — build-deps
 *
 * The umbrella vendors the built output of every internal @astrajs/* package
 * (see `vendor.mjs`). That means `vendor.mjs` requires each package's `dist/`
 * to already exist.
 *
 * That is NOT guaranteed when the monorepo is built with
 * `npm run build --workspaces`: npm runs workspaces in a sorted order, and
 * `astra-js` sorts BEFORE `core`, `compiler`, `server`, …. On a FRESH checkout
 * (CI / Vercel) the umbrella therefore ran first, vendored nothing, and failed:
 *
 *     ⚠ missing dist for core
 *     ⚠ missing dist for compiler
 *     …
 *     src/core.ts(1,15): error TS2307: Cannot find module '../vendor/core/index.js'
 *
 * This script makes the umbrella self-sufficient: it builds every package it
 * vendors (invoked from the repo root so `npm -w` resolves) BEFORE vendoring,
 * so the build succeeds regardless of the order the workspace runner picks.
 *
 * Package builds are incremental and idempotent, so the other workspace entries
 * rebuilding the same packages afterwards is harmless.
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
/** packages/astra-js/scripts → repo root */
const root = join(here, '..', '..', '..');

/** Internal packages vendored by the umbrella, in dependency order. */
const PKGS = [
  'validation',
  'ai',
  'core',
  'server',
  'router',
  'i18n',
  'schema',
  'ssr',
  'form',
  'compiler',
  'adapters',
];

function run(cmd, args, label) {
  console.log(`\n── ${label}`);
  const result = spawnSync(cmd, args, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) {
    console.error(`✖ ${label} failed (exit ${result.status})`);
    process.exit(result.status ?? 1);
  }
}

for (const pkg of PKGS) {
  run('npm', ['run', 'build', '-w', `packages/${pkg}`], `build packages/${pkg}`);
}

run('node', [join(here, 'vendor.mjs')], 'vendor internal packages');
