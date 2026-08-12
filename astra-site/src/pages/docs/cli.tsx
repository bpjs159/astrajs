import { component, dynamic } from '@astrajs/core';
import { DocSidebar } from '../../components/docs-sidebar.js';

const s = `
  .docs-layout{display:flex;min-height:100vh}
  .docs-main{flex:1;margin-left:260px;padding:48px 56px;max-width:860px}
  @media(max-width:960px){.docs-main{margin-left:0;padding:32px 24px}}
  .docs-content h1{font-size:2rem;font-weight:800;color:#f7f7ff;margin-bottom:12px;letter-spacing:-.02em}
  .docs-content h2{font-size:1.3rem;font-weight:700;color:#f7f7ff;margin:40px 0 14px;padding-top:20px;border-top:1px solid rgba(255,255,255,.06);letter-spacing:-.01em}
  .docs-content h2:first-of-type{border-top:none;margin-top:28px}
  .docs-content h3{font-size:1.05rem;font-weight:700;color:#f7f7ff;margin:28px 0 10px}
  .docs-content p{font-size:.88rem;color:#94a3b8;line-height:1.75;margin-bottom:16px}
  .docs-content strong{color:#e2e8f0}
  .docs-content code{background:rgba(139,77,255,.1);color:#c4a0ff;padding:2px 7px;border-radius:4px;font-size:.8rem;font-weight:500;font-family:'JetBrains Mono',monospace}
  .docs-content pre{background:#060b14;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:0;overflow-x:auto;margin-bottom:24px;position:relative}
  .docs-content pre::before{content:'BASH';position:absolute;top:0;right:16px;font-size:.62rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.08em;padding:8px 0}
  .docs-content pre code{display:block;background:none;color:#cbd5e1;padding:20px 24px;font-size:.76rem;line-height:1.85;border-radius:0;overflow-x:auto;white-space:pre;tab-size:2}
  .docs-content ul,.docs-content ol{padding-left:24px;margin-bottom:16px}
  .docs-content li{font-size:.88rem;color:#94a3b8;line-height:1.75;margin-bottom:6px}
  .docs-content table{width:100%;border-collapse:collapse;margin-bottom:24px;font-size:.82rem}
  .docs-content th{text-align:left;padding:10px 14px;background:rgba(255,255,255,.03);color:#e2e8f0;font-weight:700;border-bottom:2px solid rgba(255,255,255,.06)}
  .docs-content td{padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.04);color:#94a3b8}
  .docs-content .note{padding:14px 18px;background:rgba(139,77,255,.06);border-left:3px solid rgba(139,77,255,.3);border-radius:0 8px 8px 0;margin-bottom:20px;font-size:.84rem;color:#c4a0ff}
`;

export const DocsCli = component(() => (
  <div class="docs-layout">
    <style>{s}</style>
    <DocSidebar />
    <main class="docs-main">
      <div class="docs-content">
        <h1>CLI</h1>
        <p><code>create-astra</code> is the official command-line tool for scaffolding AstraJS projects. Zero dependencies, zero configuration, and zero JavaScript shipped to the browser — the CLI follows the same philosophy as the framework.</p>

        <h2>What is the CLI?</h2>
        <p>The CLI generates a complete, working AstraJS project in seconds: Vite configuration, TypeScript configuration, package manifest, and example source files with reactive stores, routing, and typed RPC. You pick a template, it does the rest.</p>
        <p>It is a pure Node.js program (≥20) with <strong>no runtime dependencies</strong> — interactive prompts are built on <code>readline</code>, colors are ANSI codes.</p>

        <h2>Creating a project</h2>
        <p>Three equivalent ways to run it:</p>
        <pre><code>{`pnpm create astra@latest my-app
npm create astra@latest my-app
npx create-astra@latest my-app`}</code></pre>

        <h3>The interactive wizard</h3>
        <p>Run it without arguments and the CLI asks you a few questions:</p>
        <pre><code>{`$ pnpm create astra@latest

◇ Project name: my-app
◇ Select a template:
   1. minimal    — Just the essentials — @astrajs/core + @astrajs/compiler
   2. frontend   — SPA building blocks — router, form, schema, validation
   3. fullstack  — Everything — server() RPC, SSR/SSG/ISR
   Enter a number (1-3): 3
◇ Install dependencies with pnpm? (Y/n): y

✔ Generated 11 files in ./my-app
◇ Next steps:
  cd my-app
  pnpm dev

Happy building! 🚀`}</code></pre>

        <h2>Templates</h2>
        <table>
          <tr><th>Template</th><th>Packages</th><th>Ideal for</th></tr>
          <tr>
            <td><strong>minimal</strong></td>
            <td><code>@astrajs/core</code> + <code>@astrajs/compiler</code></td>
            <td>Hello worlds, demos, benchmarks</td>
          </tr>
          <tr>
            <td><strong>frontend</strong></td>
            <td>+ <code>@astrajs/router</code>, <code>@astrajs/form</code>, <code>@astrajs/schema</code>, <code>@astrajs/validation</code></td>
            <td>Interactive SPAs with routing and forms</td>
          </tr>
          <tr>
            <td><strong>fullstack</strong></td>
            <td>+ <code>@astrajs/server</code>, <code>@astrajs/ssr</code></td>
            <td>Complete apps with typed RPC and SSR/SSG/ISR</td>
          </tr>
        </table>

        <h3>Select a template directly</h3>
        <pre><code>{`pnpm create astra@latest my-app --template fullstack
pnpm create astra@latest my-app -t minimal`}</code></pre>

        <h2>Options</h2>
        <table>
          <tr><th>Option</th><th>Description</th></tr>
          <tr><td><code>-t, --template &lt;name&gt;</code></td><td>Template: <code>minimal</code> | <code>frontend</code> | <code>fullstack</code></td></tr>
          <tr><td><code>-y, --yes</code></td><td>Skip all prompts, use defaults (fullstack + install)</td></tr>
          <tr><td><code>--no-install</code></td><td>Only generate files, skip dependency installation</td></tr>
          <tr><td><code>--dry-run</code></td><td>Print the file tree without writing anything</td></tr>
          <tr><td><code>-h, --help</code></td><td>Show help</td></tr>
          <tr><td><code>-v, --version</code></td><td>Print the CLI version</td></tr>
        </table>

        <pre><code>{`# Skip prompts entirely
pnpm create astra@latest my-app --yes

# Scaffold without installing
pnpm create astra@latest my-app --template frontend --no-install

# Preview the file tree first
pnpm create astra@latest my-app --dry-run`}</code></pre>

        <h2>Project structure</h2>
        <p>This is what <code>--template fullstack</code> generates:</p>
        <pre><code>{`my-app/
├── index.html          → points to /src/app.tsx
├── package.json        → @astrajs/* deps + dev/build scripts
├── tsconfig.json       → jsx: react-jsx, jsxImportSource: @astrajs/core
├── vite.config.ts      → astra({ apiPrefix: '/api/astra' })
├── .gitignore
├── README.md           → getting-started guide for this project
└── src/
    ├── app.tsx         → entry, layout, routing
    ├── routes.ts       → route() + fallbackRoute() guards
    ├── pages/
    │   ├── home.tsx    → landing page
    │   └── posts.tsx   → consumes a server() function
    └── server/
        └── posts.server.ts → typed RPC with cache tags`}</code></pre>

        <h3>Inside a monorepo</h3>
        <p>When you scaffold a project inside the AstraJS repository itself, the CLI detects the <code>packages/</code> directory and injects Vite aliases that point at the local package sources — so the app works before the packages are published. The aliases are marked with a comment and should be removed once <code>@astrajs/*</code> is on npm.</p>

        <h2>The generated code</h2>
        <p>Every template includes a working, documented example. The fullstack template ships a complete <code>server()</code> round-trip:</p>
        <pre><code>{`// src/server/posts.server.ts — ONE function, split by the compiler
import { server } from '@astrajs/server';

export const getPosts = server(
  { tags: ['posts'], maxAge: 60 },
  async () => {
    // This code NEVER ships to the browser.
    return db.post.findMany();
  }
);

// src/pages/posts.tsx — the client sees a typed async function
import { getPosts } from '../server/posts.server.js';

mounted(() => {
  getPosts().then(posts => { state.posts = posts; });
});`}</code></pre>

        <h2>Package manager detection</h2>
        <p>The CLI reads <code>npm_config_user_agent</code> to detect how it was invoked, so <code>pnpm create astra</code> installs with pnpm, <code>npm create astra</code> with npm, and so on. You never need to configure it.</p>

        <div class="note">
          <strong>Legacy note:</strong> the first CLI release named the SPA template <code>basic</code>. The alias is still accepted — <code>--template basic</code> resolves to <code>frontend</code>.
        </div>

        <h2>Next steps</h2>
        <p>After scaffolding, follow the <a href="/docs/introduction">getting-started guide</a> to understand stores, components, and routing, then check <a href="/docs/server-data">Server &amp; Data</a> to master typed RPC.</p>
      </div>
    </main>
  </div>
));
