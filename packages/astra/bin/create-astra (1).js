#!/usr/bin/env node
/**
 * create-astra — Scaffold a new AstraJS project.
 *
 * Usage:
 *   pnpm create astra@latest [project-name] [options]
 *   npx create-astra@latest [project-name] [options]
 */
import { colors } from '../lib/colors.js';
import { main } from '../lib/index.js';

main(process.argv.slice(2)).catch((err) => {
  console.error(`\n  ${colors.red}✖ Unexpected error:${colors.reset}`, err?.message ?? err);
  process.exit(1);
});
