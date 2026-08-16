import { component, dynamic } from '@bpjs159/core';
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
  .docs-content code{background:rgba(139,77,255,.1);color:#c4a0ff;padding:2px 7px;border-radius:4px;font-size:.8rem;font-weight:500;font-family:'JetBrains Mono',monospace}
  .docs-content pre{background:#060b14;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:0;overflow-x:auto;margin-bottom:24px;position:relative}
  .docs-content pre::before{content:'TS';position:absolute;top:0;right:16px;font-size:.62rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.08em;padding:8px 0}
  .docs-content pre code{display:block;background:none;color:#cbd5e1;padding:20px 24px;font-size:.76rem;line-height:1.85;border-radius:0;overflow-x:auto;white-space:pre;tab-size:2}
  .docs-content ul,.docs-content ol{padding-left:24px;margin-bottom:16px}
  .docs-content li{font-size:.88rem;color:#94a3b8;line-height:1.75;margin-bottom:6px}
  .docs-content table{width:100%;border-collapse:collapse;margin-bottom:24px;font-size:.84rem}
  @media(max-width:960px){.docs-content table{display:block;overflow-x:auto;max-width:100%}}
  .docs-content th{text-align:left;padding:10px 14px;background:rgba(255,255,255,.03);color:#e2e8f0;font-weight:700;border-bottom:2px solid rgba(255,255,255,.06)}
  .docs-content td{padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.04);color:#94a3b8}
`;

export const DocsRendering = component(() => (
  <div class="docs-layout">
    <style>{s}</style>
    <DocSidebar />
    <main class="docs-main">
      <div class="docs-content">
        <h1>{i18n.t('sb.rendering')}</h1>
        <p>{i18n.t('rr.hero')}</p>

        <h2 id="ssr">SSR (Server-Side Rendering)</h2>
        <p>{i18n.t('rr.ssr.p')}</p>

        <h3>{i18n.t('rr.how')}</h3>
        <ol>
          <li>{i18n.t('rr.ol1.a')}<code>/products</code>{i18n.t('rr.ol1.b')}</li>
          <li>{i18n.t('rr.ol2')}</li>
          <li>{i18n.t('rr.ol3.a')}<code>server()</code>{i18n.t('rr.ol3.b')}</li>
          <li>{i18n.t('rr.ol4')}</li>
          <li>{i18n.t('rr.ol5')}</li>
        </ol>

        <CodeBlock code={`// SSR is enabled by default on the server
// No special configuration needed

export default function ProductPage() {
  const product = await getProduct(params.id); // server()
  return (
    <article>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <span>\${product.price}</span>
    </article>
  );
}`} commentsKey="rendering.ssr" />

        <h2 id="ssg">SSG (Static Site Generation)</h2>
        <p>{i18n.t('rr.ssg.a')}<strong>{i18n.t('rr.ssg.b')}</strong>{i18n.t('rr.ssg.c')}<strong>{i18n.t('rr.ssg.d')}</strong>{i18n.t('rr.ssg.e')}</p>

        <CodeBlock code={`// SSG pages use server({ type: 'pre-build' })
// The result is embedded in the HTML during the build

const posts = server(
  { type: 'pre-build', tags: ['blog-posts'] },
  () => db.post.findMany({ where: { published: true } })
);

// At build time: db.post.findMany() runs
// The generated HTML includes the serialized posts
// In production: static HTML is served, no DB queries`} commentsKey="rendering.ssg" />

        <h2 id="isr">ISR (Incremental Static Regeneration)</h2>
        <p>{i18n.t('rr.isr.a')}<strong>{i18n.t('rr.isr.b')}</strong>{i18n.t('rr.isr.c')}</p>

        <CodeBlock code={`// ISR: maxAge controls how often it re-generates
const featuredProducts = server(
  { 
    type: 'pre-build',   // generated at build
    tags: ['featured'],   // invalidatable
    maxAge: 3600,         // re-generate every hour (ISR)
  },
  () => db.product.findMany({ where: { featured: true } })
);

// ISR flow:
// t=0: Build → HTML with embedded data
// t=30min: User visits → gets cached HTML (fast)
// t=61min: Cache expired → stale is served + background re-generation
// t=62min: Next visit → fresh HTML with new data`} commentsKey="rendering.isr" />

        <h2>{i18n.t('rr.comp.title')}</h2>
        <table>
          <tr><th>{i18n.t('rr.th1')}</th><th>{i18n.t('rr.th2')}</th><th>{i18n.t('rr.th3')}</th><th>{i18n.t('rr.th4')}</th><th>{i18n.t('rr.th5')}</th></tr>
          <tr><td><strong>SSR</strong></td><td>{i18n.t('rr.cell.request')}</td><td>{i18n.t('rr.cell.jit')}</td><td>{i18n.t('rr.cell.dash')}</td><td>{i18n.t('rr.cell.realtime')}</td></tr>
          <tr><td><strong>SSG</strong></td><td>{i18n.t('rr.cell.build')}</td><td>{i18n.t('rr.cell.zero')}</td><td>{i18n.t('rr.cell.blogs')}</td><td>{i18n.t('rr.cell.deploy')}</td></tr>
          <tr><td><strong>ISR</strong></td><td>{i18n.t('rr.cell.regen')}</td><td>{i18n.t('rr.cell.stale')}</td><td>{i18n.t('rr.cell.ecom')}</td><td>{i18n.t('rr.cell.ttl')}</td></tr>
          <tr><td><strong>SPA</strong></td><td>{i18n.t('rr.cell.client')}</td><td>{i18n.t('rr.cell.more')}</td><td>{i18n.t('rr.cell.apps')}</td><td>{i18n.t('rr.cell.request')}</td></tr>
        </table>

        <h2 id="resumibilidad">{i18n.t('sb.resumability')}</h2>
        <p>{i18n.t('rr.res.a')}<strong>{i18n.t('rr.res.b')}</strong>{i18n.t('rr.res.c')}</p>

        <h3>{i18n.t('rr.vs.title')}</h3>
        <ul>
          <li><strong>{i18n.t('rr.vs1.name')}:</strong> {i18n.t('rr.vs1')}</li>
          <li><strong>{i18n.t('rr.vs2.name')}:</strong> {i18n.t('rr.vs2')}</li>
        </ul>

        <CodeBlock code={`// The server-generated HTML includes:
//   <div id="app">
//     <span data-astra-store="counter" data-astra-value="42">
//       Counter: 42
//     </span>
//     <button data-astra-handler="increment">
//       +
//     </button>
//   </div>

// When the client "resumes":
//   1. Reads data-astra-store → initializes the store with value 42
//   2. Reads data-astra-handler → knows there is a pending onclick
//   3. Runs no components, does no diffing
//   4. The handler JS loads only when you click "+"`} commentsKey="rendering.resume" />
      </div>
    </main>
    <DocRightToc items={[
      { href: '/docs/rendering#ssr', label: 'SSR' },
      { href: '/docs/rendering#ssg', label: 'SSG' },
      { href: '/docs/rendering#isr', label: 'ISR' },
      { href: '/docs/rendering#resumibilidad', k: 'sb.resumability' },
    ]} />
  </div>
));
