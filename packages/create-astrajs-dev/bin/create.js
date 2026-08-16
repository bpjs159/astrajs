#!/usr/bin/env node
/**
 * create-astrajs.dev — thin delegate for `npm create astrajs.dev`.
 * Runs the astrajs.dev scaffold CLI with the user's arguments.
 */
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
try {
  const umbrellaPkg = require.resolve('astrajs.dev/package.json');
  const cliBin = join(dirname(umbrellaPkg), 'bin', 'astra.js');
  const r = spawnSync(process.execPath, [cliBin, ...process.argv.slice(2)], {
    stdio: 'inherit',
  });
  process.exit(r.status ?? 1);
} catch {
  console.error('create-astrajs.dev: astrajs.dev is not installed.');
  process.exit(1);
}
