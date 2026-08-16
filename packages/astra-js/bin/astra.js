#!/usr/bin/env node
/**
 * astrajsx umbrella CLI — delegates to the vendored AstraJS CLI.
 * Exposes both `astra <cmd>` and `create-astrajs <project>`.
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const cliBin = join(dirname(fileURLToPath(import.meta.url)), '..', 'vendor', 'cli', 'bin', 'astra.js');
const r = spawnSync(process.execPath, [cliBin, ...process.argv.slice(2)], {
  stdio: 'inherit',
});
process.exit(r.status ?? 1);
