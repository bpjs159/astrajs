import { component } from 'astrajs.dev/core';
import { DocSidebar } from '../../components/docs-sidebar.js';
import { DocRightToc } from '../../components/doc-right-toc.js';
import { i18n } from '../../i18n.js';
import { CodeBlock } from '../../components/code-block.js';

const s = `
  .docs-layout{display:flex;min-height:100vh}
  .docs-main{flex:1;min-width:0;margin-left:260px;padding:48px 56px;max-width:860px}
  @media(max-width:960px){.docs-main{margin-left:0;padding:32px 24px}}
  .docs-content h1{font-size:2rem;font-weight:800;color:#f7f7ff;margin-bottom:12px;letter-spacing:-.02em}
  .docs-content h2{font-size:1.3rem;font-weight:700;color:#f7f7ff;margin:40px 0 14px;padding-top:20px;border-top:1px solid rgba(255,255,255,.06);letter-spacing:-.01em}
  .docs-content h2:first-of-type{border-top:none;margin-top:28px}
  .docs-content h3{font-size:1.05rem;font-weight:700;color:#f7f7ff;margin:28px 0 10px}
  .docs-content p{font-size:.88rem;color:#94a3b8;line-height:1.75;margin-bottom:16px}
  .docs-content strong{color:#e2e8f0}
  .docs-content a{color:#c4a0ff;text-decoration:underline;text-underline-offset:3px}
  .docs-content code{background:rgba(139,77,255,.1);color:#c4a0ff;padding:2px 7px;border-radius:4px;font-size:.8rem;font-weight:500;font-family:'JetBrains Mono',monospace}
  .docs-content pre{background:#060b14;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:0;overflow-x:auto;margin-bottom:24px;position:relative}
  .docs-content pre::before{content:'BASH';position:absolute;top:0;right:16px;font-size:.62rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.08em;padding:8px 0}
  .docs-content pre code{display:block;background:none;color:#cbd5e1;padding:20px 24px;font-size:.76rem;line-height:1.85;border-radius:0;overflow-x:auto;white-space:pre;tab-size:2}
  .docs-content ul,.docs-content ol{padding-left:24px;margin-bottom:16px}
  .docs-content li{font-size:.88rem;color:#94a3b8;line-height:1.75;margin-bottom:6px}
  .docs-content table{width:100%;border-collapse:collapse;margin-bottom:24px;font-size:.82rem}
  @media(max-width:960px){.docs-content table{display:block;overflow-x:auto;max-width:100%}}
  .docs-content th{text-align:left;padding:10px 14px;background:rgba(255,255,255,.03);color:#e2e8f0;font-weight:700;border-bottom:2px solid rgba(255,255,255,.06)}
  .docs-content td{padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.04);color:#94a3b8}
  .docs-content .note{padding:14px 18px;background:rgba(139,77,255,.06);border-left:3px solid rgba(139,77,255,.3);border-radius:0 8px 8px 0;margin-bottom:20px;font-size:.84rem;color:#c4a0ff}
`;

export const DocsDeployment = component(() => (
  <div class="docs-layout">
    <style>{s}</style>
    <DocSidebar />
    <main class="docs-main">
      <div class="docs-content">
        <h1>{i18n.t('sb.deploy')}</h1>
        <p>{i18n.t('dp.hero.a')}<strong>{i18n.t('dp.hero.b')}</strong></p>

        <h2 id="why">{i18n.t('sb.deployWhy')}</h2>
        <p>{i18n.t('dp.why.p')}</p>
        <CodeBlock code={`// astra.config.json
{
  "adapter": "node",   // node | vercel | cloudflare | static
  "apiPrefix": "/api/astra"
}`} commentsKey="deployment.config" />
        <p>{i18n.t('dp.build.p')}</p>

        <h2 id="build">{i18n.t('sb.deployBuild')}</h2>
        <CodeBlock code={`npm run build       # runs: astrajs build

# node       → dist/  + dist/server/server.mjs + Dockerfile
# vercel     → api/astra.mjs + vercel.json
# cloudflare → dist/_worker.js + wrangler.toml + deploy.sh
# static     → dist/ (plain static files, no server)`} />
        <p>{i18n.t('dp.build.steps')}</p>
        <ul>
          <li>{i18n.t('dp.build.b1')}</li>
          <li>{i18n.t('dp.build.b2')}</li>
          <li>{i18n.t('dp.build.b3')}</li>
        </ul>

        <h2 id="adapters">{i18n.t('sb.deployAdapters')}</h2>
        <p>{i18n.t('dp.adapters.p')}</p>
        <table>
          <tr><th>Adapter</th><th>Description</th></tr>
          <tr><td><code>node</code></td><td>{i18n.t('dp.cell.node')}</td></tr>
          <tr><td><code>vercel</code></td><td>{i18n.t('dp.cell.vercel')}</td></tr>
          <tr><td><code>cloudflare</code></td><td>{i18n.t('dp.cell.cloudflare')}</td></tr>
          <tr><td><code>static</code></td><td>{i18n.t('dp.cell.static')}</td></tr>
        </table>

        <h2 id="node">{i18n.t('sb.deployNode')}</h2>
        <p>{i18n.t('dp.node.p1')}</p>
        <p>{i18n.t('dp.node.p2')} <code>PORT</code>.</p>
        <CodeBlock code={`PORT=8080 node dist/server/server.mjs

# Docker
docker build -t my-app .
docker run -p 8080:8080 my-app`} />

        <h2 id="vercel">{i18n.t('sb.deployVercel')}</h2>
        <p>{i18n.t('dp.vercel.p1')}</p>
        <p>{i18n.t('dp.vercel.p2')}</p>
        <CodeBlock code={`npm i -g vercel
vercel            # preview
vercel --prod     # production`} />

        <h2 id="cloudflare">{i18n.t('sb.deployCloudflare')}</h2>
        <p>{i18n.t('dp.cf.p1')}</p>
        <p>{i18n.t('dp.cf.p2')}</p>
        <CodeBlock code={`npx wrangler pages deploy dist --project-name my-app

# or the generated script:
./deploy.sh`} />

        <h2 id="static">{i18n.t('sb.deployStatic')}</h2>
        <p>{i18n.t('dp.static.p')}</p>
        <CodeBlock code={`{
  "adapter": "static"
}

# dist/ is upload-ready: GitHub Pages, S3, nginx, any CDN.`} />

        <h2 id="env">{i18n.t('sb.deployEnv')}</h2>
        <p>{i18n.t('dp.env.p')}</p>
        <table>
          <tr><th>Variable</th><th>Description</th></tr>
          <tr><td><code>PORT</code></td><td>{i18n.t('dp.env.port')}</td></tr>
          <tr><td><code>ASTRA_DIST</code></td><td>{i18n.t('dp.env.dist')}</td></tr>
        </table>

        <div class="note">
          <strong>ISR:</strong> <code>{`server({ maxAge: 60, tags: [...] })`}</code> {i18n.t('dp.note.isr')}
        </div>

        <h2>{i18n.t('sb.examples')}</h2>
        <p>{i18n.t('dp.next.a')}<code>astrajs my-app</code>{i18n.t('dp.next.b')}<a href="/docs/examples#backend">{i18n.t('dp.next.c')}</a>{i18n.t('dp.next.d')}</p>
      </div>
    </main>
    <DocRightToc items={[
      { href: '/docs/deployment#why', k: 'sb.deployWhy' },
      { href: '/docs/deployment#build', k: 'sb.deployBuild' },
      { href: '/docs/deployment#adapters', k: 'sb.deployAdapters' },
      { href: '/docs/deployment#node', k: 'sb.deployNode' },
      { href: '/docs/deployment#vercel', k: 'sb.deployVercel' },
      { href: '/docs/deployment#cloudflare', k: 'sb.deployCloudflare' },
      { href: '/docs/deployment#static', k: 'sb.deployStatic' },
      { href: '/docs/deployment#env', k: 'sb.deployEnv' },
    ]} />
  </div>
));
