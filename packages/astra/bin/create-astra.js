#!/usr/bin/env node
/**
 * astra — the AstraJS CLI.
 *
 * Two modes:
 *
 *   1. Project runner (inside an AstraJS project):
 *        astra dev | build | preview | test [extra args…]
 *
 *   2. Project scaffolding:
 *        astra [project-name] [options]
 */
import { colors } from '../lib/colors.js';
import { runAstraCommand } from '../lib/run.js';
import { main } from '../lib/index.js';

const RUN_COMMANDS = new Set(['dev', 'build', 'preview', 'test']);
const [first, ...rest] = process.argv.slice(2);

if (first && RUN_COMMANDS.has(first)) {
  // Project runner mode — never falls through to scaffolding.
  runAstraCommand(first, rest);
} else {
  main(process.argv.slice(2)).catch((err) => {
    console.error(`\n  ${colors.red}✖ Unexpected error:${colors.reset}`, err?.message ?? err);
    process.exit(1);
  });
}
