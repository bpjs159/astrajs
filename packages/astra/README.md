# @astrajs/cli

The [AstraJS](https://astrajs.dev) CLI — scaffold new projects and run them.
Zero config, zero VDOM, zero dependencies, full-stack TypeScript.

Package name: `@astrajs/cli` · binary name: `astra` (also exposed as `create-astrajs`).

## Usage

```bash
# scaffold a new project
astra my-app
npx @astrajs/cli@latest my-app
pnpm create astrajs my-app

# run an existing project
astra dev
astra build
astra test
```

### Options

| Option | Description |
|---|---|
| `-t, --template <name>` | `minimal`, `frontend`, or `fullstack` (default) |
| `-y, --yes` | Skip prompts, use defaults |
| `--no-install` | Skip dependency installation |
| `--dry-run` | Print the file tree without writing anything |
| `-h, --help` | Show help |
| `-v, --version` | Print version |

## Templates

| Template | Packages | For |
|---|---|---|
| `minimal` | core + compiler | Hello worlds, demos |
| `frontend` | + router, form, schema, validation | SPAs |
| `fullstack` | + server, ssr | Complete apps with typed RPC |

## Project runner

Inside an AstraJS project, the same binary drives the toolchain:

```bash
astra dev [args…]        # start the dev server (vite)
astra build [args…]      # production build (vite build)
astra preview [args…]    # preview the build (vite preview)
astra test [args…]       # run tests (vitest run)
```

It resolves the local `vite`/`vitest` binaries from `node_modules/.bin` (walking
up from the current directory), so project scripts stay uniform:

```json
"scripts": {
  "dev": "astra dev",
  "build": "astra build",
  "preview": "astra preview",
  "test": "astra test"
}
```

## Development

```bash
node bin/astra.js my-app --dry-run
node bin/astra.js my-app --yes
```

No dependencies — pure Node.js (≥20), zero install step.
