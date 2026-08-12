import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { colors } from './colors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

export const VERSION = pkg.version;

export function printHelp() {
  console.log(`
  ${colors.bold}create-astra ${VERSION}${colors.reset} — Scaffold a new AstraJS project

  ${colors.bold}Usage:${colors.reset}
    pnpm create astra@latest [project-name] [options]
    npx create-astra@latest [project-name] [options]
    npm create astra@latest [project-name] [options]

  ${colors.bold}Options:${colors.reset}
    -t, --template <name>   Template: minimal | frontend | fullstack (default: fullstack)
    -y, --yes               Skip all prompts and use defaults
        --no-install        Skip dependency installation
        --dry-run           Print the file tree without writing anything
    -h, --help              Show this help
    -v, --version           Print the CLI version

  ${colors.bold}Templates:${colors.reset}
    minimal    Just the essentials — @astrajs/core + @astrajs/compiler
    frontend   SPA building blocks — router, form, schema, validation
    fullstack  Everything — server() RPC, SSR/SSG/ISR

  ${colors.bold}Examples:${colors.reset}
    pnpm create astra@latest my-app
    pnpm create astra@latest my-app --template frontend
    pnpm create astra@latest my-app --yes
`);
}

export function printVersion() {
  console.log(VERSION);
}
