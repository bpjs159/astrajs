import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { colors } from './colors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

export const VERSION = pkg.version;

export function printHelp() {
  console.log(`
  ${colors.bold}astrajs ${VERSION}${colors.reset} — the AstraJS CLI

  ${colors.bold}Project runner${colors.reset} (inside an AstraJS project):
    astrajs dev [args…]        Start the dev server (vite)
    astrajs build [args…]      Production build + deploy adapter output
                             (--adapter static|node|vercel|cloudflare,
                              or "adapter" in astra.config.json)
    astrajs preview [args…]    Preview the production build (vite preview)
    astrajs test [args…]       Run tests (vitest run)

  ${colors.bold}AI helpers${colors.reset}:
    astrajs ai chat <prompt>                One-shot completion
    astrajs ai translate <locale> <file>    Translate a JSON i18n catalog
    astrajs ai --help                       AI usage

  ${colors.bold}Scaffold a new project:${colors.reset}
    astrajs [project-name] [options]
    npx astrajs.dev@latest [project-name] [options]
    pnpm create astrajs [project-name] [options]

  ${colors.bold}Scaffold options:${colors.reset}
    -t, --template <name>   Template: minimal | frontend | fullstack (default: fullstack)
    -y, --yes               Skip all prompts and use defaults
        --no-install        Skip dependency installation
        --dry-run           Print the file tree without writing anything
    -h, --help              Show this help
    -v, --version           Print the CLI version

  ${colors.bold}Templates:${colors.reset}
    minimal    Just the essentials — astrajs.dev/core + astrajs.dev/compiler
    frontend   SPA building blocks — router, form, schema, validation
    fullstack  Everything — server() RPC, SSR/SSG/ISR

  ${colors.bold}Examples:${colors.reset}
    astrajs dev
    astrajs build
    astrajs build --adapter vercel
    astrajs build --adapter cloudflare
    astrajs test --watch
    astrajs ai chat "explain direct DOM mutations"
    astrajs ai translate fr src/i18n-en.json
    astrajs my-app
    astrajs my-app --template frontend
    astrajs my-app --yes
`);
}

export function printVersion() {
  console.log(VERSION);
}
