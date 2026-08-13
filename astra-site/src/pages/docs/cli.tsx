import { component, dynamic } from '@astrajs/core';
import { DocSidebar } from '../../components/docs-sidebar.js';
import { DocRightToc } from '../../components/doc-right-toc.js';
import { i18n } from '../../i18n.js';
import { CodeBlock } from '../../components/code-block.js';

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
        <p><code>astra</code> {i18n.t('cl.hero.a')}<code>astra dev</code>{i18n.t('cl.hero.b')}<code>astra build</code>{i18n.t('cl.hero.c')}<code>astra test</code>{i18n.t('cl.hero.d')}</p>

        <h2 id="que-es">{i18n.t('sb.cliWhat')}</h2>
        <p>{i18n.t('cl.what.p1')}</p>
        <p>{i18n.t('cl.what.p2.a')}<strong>{i18n.t('cl.what.p2.b')}</strong>{i18n.t('cl.what.p2.c')}<code>readline</code>{i18n.t('cl.what.p2.d')}</p>

        <h2 id="crear-proyecto">{i18n.t('sb.cliCreate')}</h2>
        <p>{i18n.t('cl.create.p')}</p>
        <CodeBlock code={`astra my-app
npx @astrajs/cli@latest my-app
pnpm create astrajs my-app`} />

        <h3>{i18n.t('cl.run.title')}</h3>
        <p>{i18n.t('cl.run.p')}</p>
        <CodeBlock code={`astra dev        # vite dev server with HMR
astra build      # production build (pre-built requests run here)
astra preview    # preview the production build
astra test       # vitest run`} />

        <h3>{i18n.t('cl.wizard.title')}</h3>
        <p>{i18n.t('cl.wizard.p')}</p>
        <CodeBlock code={`$ astra

◇ Project name: my-app
◇ Select a template:
   1. minimal    — Just the essentials — @astrajs/core + @astrajs/compiler
   2. frontend   — SPA building blocks — router, form, schema, validation
   3. fullstack  — Everything — server() RPC, SSR/SSG/ISR
   Enter a number (1-3): 3
◇ Install dependencies with pnpm? (Y/n): y

Generated 11 files in ./my-app
◇ Next steps:
  cd my-app
  astra dev

Happy building!`} />

        <h2 id="plantillas">{i18n.t('sb.cliTemplates')}</h2>
        <table>
          <tr><th>Template</th><th>Packages</th><th>{i18n.t('rr.th4')}</th></tr>
          <tr>
            <td><strong>minimal</strong></td>
            <td><code>@astrajs/core</code> + <code>@astrajs/compiler</code></td>
            <td>{i18n.t('cl.cell.minimal')}</td>
          </tr>
          <tr>
            <td><strong>frontend</strong></td>
            <td>+ <code>@astrajs/router</code>, <code>@astrajs/form</code>, <code>@astrajs/schema</code>, <code>@astrajs/validation</code></td>
            <td>{i18n.t('cl.cell.frontend')}</td>
          </tr>
          <tr>
            <td><strong>fullstack</strong></td>
            <td>+ <code>@astrajs/server</code>, <code>@astrajs/ssr</code></td>
            <td>{i18n.t('cl.cell.fullstack')}</td>
          </tr>
        </table>

        <h3>{i18n.t('cl.select.title')}</h3>
        <CodeBlock code={`astra my-app --template fullstack
astra my-app -t minimal`} />

        <h2 id="opciones">{i18n.t('sb.cliOptions')}</h2>
        <table>
          <tr><th>Option</th><th>Description</th></tr>
          <tr><td><code>-t, --template &lt;name&gt;</code></td><td>{i18n.t('cl.op.template')} <code>minimal</code> | <code>frontend</code> | <code>fullstack</code></td></tr>
          <tr><td><code>-y, --yes</code></td><td>{i18n.t('cl.op.yes')}</td></tr>
          <tr><td><code>--no-install</code></td><td>{i18n.t('cl.op.noinstall')}</td></tr>
          <tr><td><code>--dry-run</code></td><td>{i18n.t('cl.op.dry')}</td></tr>
          <tr><td><code>-h, --help</code></td><td>{i18n.t('cl.op.help')}</td></tr>
          <tr><td><code>-v, --version</code></td><td>{i18n.t('cl.op.version')}</td></tr>
        </table>

        <CodeBlock code={`# Skip prompts entirely
astra my-app --yes

# Scaffold without installing
astra my-app --template frontend --no-install

# Preview the file tree first
astra my-app --dry-run`} />

        <h2>{i18n.t('cl.structure.title')}</h2>
        <p>{i18n.t('cl.structure.p.a')}<code>--template fullstack</code>{i18n.t('cl.structure.p.b')}</p>
        <CodeBlock code={`my-app/
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
        └── posts.server.ts → typed RPC with cache tags`} />

        <h3>{i18n.t('cl.mono.title')}</h3>
        <p>{i18n.t('cl.mono.a')}<code>packages/</code>{i18n.t('cl.mono.b')}<code>@astrajs/*</code>{i18n.t('cl.mono.c')}</p>

        <h2>{i18n.t('cl.gen.title')}</h2>
        <p>{i18n.t('cl.gen.a')}<code>server()</code>{i18n.t('cl.gen.b')}</p>
        <CodeBlock code={`// src/server/posts.server.ts — ONE function, split by the compiler
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
});`} />

        <h2>{i18n.t('cl.pm.title')}</h2>
        <p>{i18n.t('cl.pm.a')}<code>npm_config_user_agent</code>{i18n.t('cl.pm.b')}<code>pnpm dlx astra</code>{i18n.t('cl.pm.c')}<code>npx astra</code>{i18n.t('cl.pm.d')}</p>

        <div class="note">
          <strong>{i18n.t('lbl.legacy')}:</strong> {i18n.t('cl.legacy.a')}<code>basic</code>{i18n.t('cl.legacy.b')}<code>--template basic</code>{i18n.t('cl.legacy.c')}<code>frontend</code>{i18n.t('cl.legacy.d')}
        </div>

        <h2>{i18n.t('cl.next.title')}</h2>
        <p>{i18n.t('cl.next.a')}<a href="/docs/introduction">{i18n.t('cl.next.b')}</a>{i18n.t('cl.next.c')}<a href="/docs/server-data">Server &amp; Data</a>{i18n.t('cl.next.d')}</p>
      </div>
    </main>
    <DocRightToc items={[
      { href: '/docs/cli#que-es', k: 'sb.cliWhat' },
      { href: '/docs/cli#crear-proyecto', k: 'sb.cliCreate' },
      { href: '/docs/cli#plantillas', k: 'sb.cliTemplates' },
      { href: '/docs/cli#opciones', k: 'sb.cliOptions' },
    ]} />
  </div>
));
