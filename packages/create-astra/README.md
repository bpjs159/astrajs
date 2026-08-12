# create-astra

CLI to scaffold [AstraJS](https://astrajs.dev) projects — zero config, zero VDOM, full-stack TypeScript.

## Usage

```bash
pnpm create astra@latest my-app
npm create astra@latest my-app
npx create-astra@latest my-app
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

## Development

```bash
node bin/create-astra.js my-app --dry-run
node bin/create-astra.js my-app --yes
```

No dependencies — pure Node.js (≥20), zero install step.
